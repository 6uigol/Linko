import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import admin from 'firebase-admin';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import path from 'path';
import { createServer as createViteServer } from 'vite';

dotenv.config();

function getFirebaseAdminApp() {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountRaw) {
    const parsed = JSON.parse(serviceAccountRaw);
    return admin.initializeApp({
      credential: admin.credential.cert(parsed),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const firebaseAdmin = getFirebaseAdminApp();
const firestore = admin.firestore(firebaseAdmin);
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
const appUrl = process.env.APP_URL || 'http://localhost:3000';

function mapPaymentStatus(status?: string) {
  if (status === 'approved') return 'paid';
  if (status === 'rejected' || status === 'cancelled') return 'refused';
  return 'pending';
}

function verifyMercadoPagoSignature(options: {
  rawBody: string;
  signature?: string;
  requestId?: string;
  dataId?: string;
  webhookSecret?: string;
}) {
  const { signature, requestId, dataId, webhookSecret } = options;
  if (!webhookSecret) return true;
  if (!signature || !requestId || !dataId) return false;

  const parts = Object.fromEntries(
    signature.split(',').map((chunk) => {
      const [key, value] = chunk.split('=');
      return [key?.trim(), value?.trim()];
    }),
  );

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const generated = crypto.createHmac('sha256', webhookSecret).update(manifest).digest('hex');
  return generated === v1;
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);

  app.use(cors());
  app.use(
    express.json({
      verify: (req, _res, buffer) => {
        (req as express.Request & { rawBody?: string }).rawBody = buffer.toString();
      },
    }),
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, now: new Date().toISOString() });
  });

  app.post('/api/checkout', async (req, res) => {
    try {
      const { productId, buyerName, buyerEmail } = req.body as {
        productId?: string;
        buyerName?: string;
        buyerEmail?: string;
      };

      if (!productId) {
        res.status(400).json({ error: 'productId é obrigatório.' });
        return;
      }

      if (!process.env.MP_ACCESS_TOKEN) {
        res.status(500).json({ error: 'Mercado Pago não configurado.' });
        return;
      }

      const productRef = firestore.collection('products').doc(productId);
      const productSnap = await productRef.get();

      if (!productSnap.exists) {
        res.status(404).json({ error: 'Produto não encontrado.' });
        return;
      }

      const product = productSnap.data() as Record<string, any>;

      if (!product.isActive) {
        res.status(400).json({ error: 'Produto inativo.' });
        return;
      }

      const purchaseRef = firestore.collection('purchases').doc();
      const purchasePayload = {
        id: purchaseRef.id,
        creatorId: product.userId,
        productId,
        buyerName: buyerName || 'Cliente Linko',
        buyerEmail: buyerEmail || '',
        amount: Number(product.price || 0),
        status: 'pending',
        productDetails: {
          name: product.name,
          description: product.description || '',
          imageUrl: product.imageUrl || '',
          fileUrl: product.fileUrl || '',
          type: product.type || 'simple',
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await purchaseRef.set(purchasePayload);

      await firestore.collection('transactions').doc(purchaseRef.id).set({
        id: purchaseRef.id,
        purchaseId: purchaseRef.id,
        creatorId: product.userId,
        productId,
        gateway: 'mercadopago',
        status: 'pending',
        amount: Number(product.price || 0),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const preference = new Preference(mpClient);
      const result = await preference.create({
        body: {
          external_reference: purchaseRef.id,
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
          back_urls: {
            success: `${appUrl}/dashboard/purchases/success`,
            pending: `${appUrl}/dashboard/purchases/pending`,
            failure: `${appUrl}/dashboard/purchases/failure`,
          },
          auto_return: 'approved',
          payer: {
            name: buyerName || 'Cliente Linko',
            email: buyerEmail || undefined,
          },
          items: [
            {
              id: productId,
              title: product.name,
              quantity: 1,
              currency_id: 'BRL',
              unit_price: Number(product.price || 0),
              description: product.description || 'Produto Linko',
            },
          ],
          metadata: {
            purchaseId: purchaseRef.id,
            creatorId: product.userId,
            productId,
          },
        },
      });

      res.json({ initPoint: result.init_point, preferenceId: result.id, purchaseId: purchaseRef.id });
    } catch (error) {
      console.error('checkout_error', error);
      res.status(500).json({ error: 'Erro interno ao criar checkout.' });
    }
  });

  app.post('/api/webhooks/mercadopago', async (req, res) => {
    try {
      const signature = req.header('x-signature') || undefined;
      const requestId = req.header('x-request-id') || undefined;
      const dataId = String(req.body?.data?.id || req.query['data.id'] || '');
      const isValid = verifyMercadoPagoSignature({
        rawBody: (req as express.Request & { rawBody?: string }).rawBody || '',
        signature,
        requestId,
        dataId,
        webhookSecret: process.env.MP_WEBHOOK_SECRET,
      });

      if (!isValid) {
        res.status(401).send('invalid webhook signature');
        return;
      }

      if (req.body?.type !== 'payment' || !dataId) {
        res.status(200).send('ignored');
        return;
      }

      const paymentClient = new Payment(mpClient);
      const payment = await paymentClient.get({ id: dataId });
      const purchaseId = payment.external_reference;

      if (!purchaseId) {
        res.status(200).send('missing reference');
        return;
      }

      const purchaseRef = firestore.collection('purchases').doc(purchaseId);
      const purchaseSnap = await purchaseRef.get();
      if (!purchaseSnap.exists) {
        res.status(404).send('purchase not found');
        return;
      }

      const purchase = purchaseSnap.data() as Record<string, any>;
      const normalizedStatus = mapPaymentStatus(payment.status);
      const buyerEmail = payment.payer?.email || purchase.buyerEmail || '';
      const productId = purchase.productId;

      await purchaseRef.set(
        {
          status: normalizedStatus,
          paymentId: String(payment.id || dataId),
          buyerEmail,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      await firestore.collection('transactions').doc(purchaseId).set(
        {
          id: purchaseId,
          purchaseId,
          creatorId: purchase.creatorId,
          productId,
          gateway: 'mercadopago',
          gatewayPaymentId: String(payment.id || dataId),
          status: normalizedStatus,
          amount: Number(payment.transaction_amount || purchase.amount || 0),
          rawStatus: payment.status,
          payerEmail: buyerEmail,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      if (normalizedStatus === 'paid') {
        const accessRef = firestore.collection('access').doc(`${purchaseId}_${productId}`);
        await accessRef.set(
          {
            id: `${purchaseId}_${productId}`,
            purchaseId,
            productId,
            creatorId: purchase.creatorId,
            buyerEmail,
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }

      res.status(200).send('ok');
    } catch (error) {
      console.error('mercadopago_webhook_error', error);
      res.status(500).send('error');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`server ready on ${appUrl}`);
  });
}

void startServer();
