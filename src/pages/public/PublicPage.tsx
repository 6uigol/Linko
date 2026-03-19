import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Package, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Block {
  id: string;
  type: 'link' | 'text';
  title: string;
  url?: string;
  content?: string;
  isActive: boolean;
  order: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  type: 'simple' | 'digital';
}

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!slug) return;
      
      try {
        const q = query(collection(db, 'users'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Página não encontrada.');
        } else {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setProfile(userData);
          setUserId(userDoc.id);
        }
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar a página.');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!userId) return;

      try {
        // Fetch blocks
        const blocksQuery = query(
          collection(db, 'blocks'),
          where('userId', '==', userId),
          where('isActive', '==', true),
          orderBy('order', 'asc')
        );
        const blocksSnapshot = await getDocs(blocksQuery);
        const blocksData = blocksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Block));
        setBlocks(blocksData);

        // Fetch products
        const productsQuery = query(
          collection(db, 'products'),
          where('userId', '==', userId),
          where('isActive', '==', true)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching content:", err);
      }
    };

    fetchContent();
  }, [userId]);

  const handleCheckout = async (productId: string) => {
    setCheckoutError('');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId, // The seller's ID
          buyerName: currentUser?.displayName || '',
          buyerEmail: currentUser?.email || '',
        }),
      });
      
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setCheckoutError('Erro ao iniciar checkout. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setCheckoutError('Erro ao iniciar checkout. Verifique sua conexão.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-text-primary mb-4">404</h1>
        <p className="text-lg text-text-secondary">{error || 'Página não encontrada'}</p>
        <a href="/" className="mt-8 text-primary hover:text-primary-hover transition-colors">
          Voltar para a página inicial
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="mx-auto h-24 w-24 rounded-full border-4 border-surface shadow-lg object-cover"
            />
          ) : (
            <div className="mx-auto h-24 w-24 rounded-full bg-surface flex items-center justify-center border-4 border-bg-dark shadow-lg">
              <span className="text-3xl font-bold text-primary">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="mt-4 text-2xl font-bold text-text-primary">{profile.pageName || profile.name}</h1>
          {profile.bio && (
            <p className="mt-2 text-sm text-text-secondary">{profile.bio}</p>
          )}
        </div>

        <div className="space-y-4">
          {checkoutError && (
            <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl text-sm text-center">
              {checkoutError}
            </div>
          )}
          {blocks.length === 0 && products.length === 0 ? (
            <div className="bg-surface p-4 rounded-2xl shadow-sm text-center text-text-muted border border-border-dark">
              Nenhum link ou produto adicionado ainda.
            </div>
          ) : (
            <>
              {blocks.map((block) => (
                <div key={block.id}>
                  {block.type === 'link' ? (
                    <a
                      href={block.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full p-4 bg-surface hover:bg-bg-dark border border-border-dark rounded-2xl shadow-sm transition-all hover:border-primary/50 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary group-hover:text-primary transition-colors">{block.title}</span>
                        <ExternalLink className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors" />
                      </div>
                    </a>
                  ) : (
                    <div className="w-full p-4 bg-surface border border-border-dark rounded-2xl shadow-sm">
                      {block.title && <h3 className="font-medium text-text-primary mb-2">{block.title}</h3>}
                      <p className="text-text-secondary whitespace-pre-wrap">{block.content}</p>
                    </div>
                  )}
                </div>
              ))}

              {products.length > 0 && (
                <div className="pt-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4 text-center">Produtos</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="bg-surface border border-border-dark rounded-2xl overflow-hidden shadow-sm flex flex-col">
                        {product.imageUrl ? (
                          <div className="h-48 bg-bg-dark">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-32 bg-bg-dark flex items-center justify-center text-text-muted">
                            <Package className="h-10 w-10" />
                          </div>
                        )}
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-lg font-medium text-text-primary">{product.name}</h3>
                          <p className="text-sm text-text-secondary mt-1 line-clamp-2">{product.description}</p>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-xl font-bold text-primary">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                            <button
                              onClick={() => handleCheckout(product.id)}
                              className="px-4 py-2 bg-gradient-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                            >
                              Comprar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <a href="/" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
            Criado com <span className="font-semibold text-primary">Linko</span>
          </a>
        </div>
      </div>
    </div>
  );
}
