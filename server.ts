import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import fs from 'fs';

dotenv.config();

// Initialize Firebase client SDK in Node.js
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Initialize Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-1234567890-123456-1234567890abcdef1234567890abcdef-123456789' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Create Checkout Preference
  app.post("/api/checkout", async (req, res) => {
    try {
      const { productId, userId, buyerName, buyerEmail } = req.body;

      if (!productId || !userId) {
        return res.status(400).json({ error: "Missing productId or userId" });
      }

      // Fetch product from Firestore
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        return res.status(404).json({ error: "Product not found" });
      }

      const product = productSnap.data();

      if (!product.isActive) {
        return res.status(400).json({ error: "Product is not active" });
      }

      // Create a purchase record in pending state
      const purchasesRef = collection(db, 'purchases');
      const purchaseDoc = await addDoc(purchasesRef, {
        id: '', // Will update with doc.id
        creatorId: product.userId,
        productId: productId,
        buyerName: buyerName || 'Anônimo',
        buyerEmail: buyerEmail || 'anonimo@email.com',
        amount: product.price,
        status: 'pending',
        productDetails: {
          name: product.name,
          description: product.description || '',
          imageUrl: product.imageUrl || '',
          fileUrl: product.fileUrl || '',
          type: product.type || 'simple'
        },
        createdAt: new Date()
      });

      await updateDoc(purchaseDoc, { id: purchaseDoc.id });

      // Create Mercado Pago Preference
      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: [
            {
              id: productId,
              title: product.name,
              quantity: 1,
              unit_price: product.price,
              currency_id: 'BRL',
              description: product.description || 'Produto Linko'
            }
          ],
          external_reference: purchaseDoc.id,
          back_urls: {
            success: `${process.env.APP_URL || `http://localhost:${PORT}`}/dashboard/purchases/success`,
            failure: `${process.env.APP_URL || `http://localhost:${PORT}`}/dashboard/purchases/failure`,
            pending: `${process.env.APP_URL || `http://localhost:${PORT}`}/dashboard/purchases/pending`
          },
          auto_return: 'approved',
          notification_url: `${process.env.APP_URL || `https://your-app.com`}/api/webhooks/mercadopago`
        }
      });

      res.json({ init_point: result.init_point, id: result.id });
    } catch (error) {
      console.error("Error creating checkout:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Webhook for Mercado Pago
  app.post("/api/webhooks/mercadopago", async (req, res) => {
    console.log("Webhook received:", req.body);
    
    try {
      const { type, data } = req.body;
      
      if (type === 'payment' && data && data.id) {
        // Verify the payment with MP API
        const paymentClient = new Payment(client);
        const payment = await paymentClient.get({ id: data.id });
        
        if (payment.external_reference) {
          const purchaseRef = doc(db, 'purchases', payment.external_reference);
          
          const updateData: any = { 
            status: payment.status,
            paymentId: payment.id?.toString(),
            updatedAt: new Date()
          };
          
          if (payment.payer?.email) {
            updateData.buyerEmail = payment.payer.email;
          }
          
          await updateDoc(purchaseRef, updateData);
          console.log(`Purchase ${payment.external_reference} updated to ${payment.status}`);
        }
      }
      
      res.status(200).send("OK");
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).send("Error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
