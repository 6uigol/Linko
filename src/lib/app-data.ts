import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { db, storage } from './firebase';

export type PlanType = 'free' | 'pro';
export type BlockType = 'link' | 'text' | 'product' | 'content';
export type ProductType = 'simple' | 'digital';
export type PurchaseStatus = 'pending' | 'paid' | 'refused';
export type AppearanceMode = 'system' | 'dark' | 'light';

export interface ThemeConfig {
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export interface PaymentConfig {
  pixOrTransferLabel: string;
  bankName: string;
  institutionCode: string;
  branch: string;
  account: string;
  holder: string;
  message: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  pageName?: string;
  slug?: string;
  bio?: string;
  photoUrl?: string;
  pageId?: string;
  plan: PlanType;
  onboardingCompleted: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  theme: ThemeConfig;
  appearance: AppearanceMode;
  paymentConfig: PaymentConfig;
}

export interface PageRecord {
  id: string;
  userId: string;
  slug: string;
  pageName: string;
  bio?: string;
  photoUrl?: string;
  theme: ThemeConfig;
  plan: PlanType;
  appearance?: AppearanceMode;
  paymentConfig?: PaymentConfig;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface BlockRecord {
  id: string;
  userId: string;
  pageId: string;
  type: BlockType;
  title: string;
  url?: string;
  content?: string;
  productId?: string;
  order: number;
  isActive: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface ProductRecord {
  id: string;
  userId: string;
  type: ProductType;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  fileUrl?: string;
  isActive: boolean;
  stock?: number | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface PurchaseRecord {
  id: string;
  creatorId: string;
  productId: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  status: PurchaseStatus;
  paymentId?: string;
  productDetails?: Partial<ProductRecord>;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface AccessRecord {
  id: string;
  purchaseId: string;
  productId: string;
  creatorId: string;
  buyerUid?: string;
  buyerEmail: string;
  status: 'active' | 'revoked';
}

export const DEFAULT_THEME: ThemeConfig = {
  accent: '#6D5EF7',
  background: '#07111f',
  surface: '#0f1729',
  text: '#f8fafc',
};

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  pixOrTransferLabel: 'Conta principal Nubank',
  bankName: 'Nu Pagamentos S.A. - Instituição de Pagamento',
  institutionCode: '0260',
  branch: '0001',
  account: '40616163-2',
  holder: 'Conta cadastrada',
  message: 'Use esta conta como recebimento manual quando quiser confirmar pagamentos diretamente com o cliente.',
};

function mapDoc<T>(snapshot: QueryDocumentSnapshot<DocumentData>) {
  return { id: snapshot.id, ...snapshot.data() } as T;
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(value?: Timestamp | null) {
  if (!value) return '-';
  return value.toDate().toLocaleDateString('pt-BR');
}

export function getPublicPreview(slug?: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://seusite.com';
  return `${origin}/${slug ?? ''}`;
}

export async function uploadFile(userId: string, folder: string, file: File) {
  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const storageRef = ref(storage, `${folder}/${userId}/${safeName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteStorageFile(downloadUrl?: string) {
  if (!downloadUrl) return;
  try {
    await deleteObject(ref(storage, downloadUrl));
  } catch {
    // ignore missing files
  }
}

export async function createInitialProfile(uid: string, payload: { email: string; name: string }) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    uid,
    email: payload.email,
    name: payload.name,
    pageName: payload.name,
    plan: 'free',
    onboardingCompleted: false,
    theme: DEFAULT_THEME,
    appearance: 'system',
    paymentConfig: DEFAULT_PAYMENT_CONFIG,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function reserveSlugAndCompleteOnboarding(params: {
  uid: string;
  email: string;
  name: string;
  pageName: string;
  slug: string;
  bio?: string;
  photoUrl?: string;
}) {
  const userRef = doc(db, 'users', params.uid);
  const pageRef = doc(db, 'pages', params.slug);

  await runTransaction(db, async (transaction) => {
    const pageSnap = await transaction.get(pageRef);
    if (pageSnap.exists() && pageSnap.data().userId !== params.uid) {
      throw new Error('Este username já está em uso.');
    }

    transaction.set(pageRef, {
      userId: params.uid,
      slug: params.slug,
      pageName: params.pageName,
      bio: params.bio || '',
      photoUrl: params.photoUrl || '',
      theme: DEFAULT_THEME,
      appearance: 'system',
      paymentConfig: DEFAULT_PAYMENT_CONFIG,
      plan: 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    transaction.set(userRef, {
      uid: params.uid,
      email: params.email,
      name: params.name,
      pageName: params.pageName,
      slug: params.slug,
      bio: params.bio || '',
      photoUrl: params.photoUrl || '',
      pageId: params.slug,
      plan: 'free',
      onboardingCompleted: true,
      theme: DEFAULT_THEME,
      appearance: 'system',
      paymentConfig: DEFAULT_PAYMENT_CONFIG,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });
}

export async function isSlugAvailable(slug: string, currentUid?: string) {
  const pageSnap = await getDoc(doc(db, 'pages', slug));
  if (!pageSnap.exists()) return true;
  return pageSnap.data().userId === currentUid;
}

export async function fetchDashboardMetrics(uid: string) {
  const [productsSnap, purchasesSnap, blocksSnap] = await Promise.all([
    getDocs(query(collection(db, 'products'), where('userId', '==', uid))),
    getDocs(query(collection(db, 'purchases'), where('creatorId', '==', uid))),
    getDocs(query(collection(db, 'blocks'), where('userId', '==', uid))),
  ]);

  const purchases = purchasesSnap.docs.map((item) => mapDoc<PurchaseRecord>(item));
  const paidPurchases = purchases.filter((purchase) => purchase.status === 'paid');
  const buyers = new Set(paidPurchases.map((purchase) => purchase.buyerEmail));

  return {
    totalSales: paidPurchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0),
    buyers: buyers.size,
    products: productsSnap.size,
    blocks: blocksSnap.size,
    transactions: purchases.slice().sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)).slice(0, 10),
  };
}

export async function fetchBlocks(uid: string) {
  const snapshot = await getDocs(query(collection(db, 'blocks'), where('userId', '==', uid)));
  return snapshot.docs.map((item) => mapDoc<BlockRecord>(item)).sort((a, b) => a.order - b.order);
}

export async function saveBlock(uid: string, pageId: string, block: Partial<BlockRecord>) {
  if (block.id) {
    await updateDoc(doc(db, 'blocks', block.id), {
      ...block,
      updatedAt: serverTimestamp(),
    });
    return block.id;
  }

  const nextOrder = Number(block.order ?? 0);
  const docRef = await addDoc(collection(db, 'blocks'), {
    userId: uid,
    pageId,
    type: block.type,
    title: block.title,
    url: block.url || '',
    content: block.content || '',
    productId: block.productId || '',
    order: nextOrder,
    isActive: block.isActive ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

export async function reorderBlocks(blocks: BlockRecord[]) {
  await Promise.all(
    blocks.map((block, index) =>
      updateDoc(doc(db, 'blocks', block.id), {
        order: index,
        updatedAt: serverTimestamp(),
      }),
    ),
  );
}

export async function removeBlock(id: string) {
  await deleteDoc(doc(db, 'blocks', id));
}

export async function fetchProducts(uid: string) {
  const snapshot = await getDocs(query(collection(db, 'products'), where('userId', '==', uid)));
  return snapshot.docs.map((item) => mapDoc<ProductRecord>(item)).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
}

export async function saveProduct(uid: string, product: Partial<ProductRecord>) {
  const payload = {
    userId: uid,
    type: product.type,
    name: product.name,
    description: product.description || '',
    price: product.price || 0,
    imageUrl: product.imageUrl || '',
    fileUrl: product.fileUrl || '',
    stock: product.stock ?? null,
    isActive: product.isActive ?? true,
    updatedAt: serverTimestamp(),
  };

  if (product.id) {
    await updateDoc(doc(db, 'products', product.id), payload);
    return product.id;
  }

  const docRef = await addDoc(collection(db, 'products'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

export async function removeProduct(id: string) {
  await deleteDoc(doc(db, 'products', id));
}

export async function fetchPublicPage(slug: string) {
  const pageSnap = await getDoc(doc(db, 'pages', slug));
  if (!pageSnap.exists()) return null;
  const page = { id: pageSnap.id, ...pageSnap.data() } as PageRecord;

  const [blocksSnap, productsSnap] = await Promise.all([
    getDocs(query(collection(db, 'blocks'), where('pageId', '==', page.id))),
    getDocs(query(collection(db, 'products'), where('userId', '==', page.userId))),
  ]);

  return {
    page,
    blocks: blocksSnap.docs.map((item) => mapDoc<BlockRecord>(item)).filter((item) => item.isActive).sort((a, b) => a.order - b.order),
    products: productsSnap.docs.map((item) => mapDoc<ProductRecord>(item)).filter((item) => item.isActive).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)),
  };
}

export async function fetchMyPurchases(email: string) {
  const snapshot = await getDocs(query(collection(db, 'purchases'), where('buyerEmail', '==', email)));
  return snapshot.docs.map((item) => mapDoc<PurchaseRecord>(item)).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
}

export async function fetchAccessByEmail(email: string, creatorId: string) {
  const snapshot = await getDocs(query(collection(db, 'access'), where('buyerEmail', '==', email), limit(100)));
  return snapshot.docs.map((item) => mapDoc<AccessRecord>(item)).filter((item) => item.creatorId == creatorId);
}
