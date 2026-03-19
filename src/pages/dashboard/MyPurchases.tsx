import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';
import { Package, Download, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Purchase {
  id: string;
  productId: string;
  creatorId: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: any;
  productDetails?: any;
}

export default function MyPurchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user?.email) return;

      try {
        // Fetch purchases where buyerEmail matches the current user's email
        const q = query(
          collection(db, 'purchases'),
          where('buyerEmail', '==', user.email)
        );
        const querySnapshot = await getDocs(q);
        
        const purchasesData: Purchase[] = [];
        
        for (const docSnapshot of querySnapshot.docs) {
          const purchase = { id: docSnapshot.id, ...docSnapshot.data() } as Purchase;
          
          // If productDetails is not in the purchase document, fetch it (for backward compatibility)
          if (!purchase.productDetails) {
            try {
              const productRef = doc(db, 'products', purchase.productId);
              const productSnap = await getDoc(productRef);
              if (productSnap.exists()) {
                purchase.productDetails = productSnap.data();
              }
            } catch (err) {
              console.error("Error fetching product details:", err);
            }
          }
          
          purchasesData.push(purchase);
        }
        
        // Sort by date descending (client-side since we didn't index buyerEmail + createdAt)
        purchasesData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setPurchases(purchasesData);
      } catch (err) {
        console.error("Error fetching purchases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'rejected':
      case 'cancelled': return <XCircle className="h-5 w-5 text-error" />;
      default: return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Recusado';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 text-text-secondary">Carregando...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Minhas Compras</h1>
        <p className="mt-2 text-text-secondary">Acesse os produtos que você comprou.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {purchases.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-2xl shadow-sm border border-dashed border-border-dark">
            <Package className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <p className="text-text-secondary">Você ainda não fez nenhuma compra.</p>
          </div>
        ) : (
          purchases.map((purchase) => (
            <div key={purchase.id} className="bg-surface shadow-sm rounded-2xl overflow-hidden border border-border-dark flex flex-col sm:flex-row">
              <div className="sm:w-48 h-48 bg-bg-dark relative flex-shrink-0">
                {purchase.productDetails?.imageUrl ? (
                  <img src={purchase.productDetails.imageUrl} alt={purchase.productDetails.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <Package className="h-12 w-12" />
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-text-primary">
                      {purchase.productDetails?.name || 'Produto Indisponível'}
                    </h3>
                    <div className="flex items-center space-x-2 bg-bg-dark px-3 py-1 rounded-full border border-border-dark">
                      {getStatusIcon(purchase.status)}
                      <span className="text-sm font-medium text-text-primary">{getStatusText(purchase.status)}</span>
                    </div>
                  </div>
                  <p className="text-text-secondary line-clamp-2 mb-4">
                    {purchase.productDetails?.description || 'Sem descrição'}
                  </p>
                  <p className="text-sm text-text-muted">
                    Comprado em: {purchase.createdAt?.toDate?.().toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">
                    Valor: R$ {purchase.amount.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border-dark flex justify-end">
                  {purchase.status === 'approved' ? (
                    purchase.productDetails?.type === 'digital' && purchase.productDetails?.fileUrl ? (
                      <a
                        href={purchase.productDetails.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-primary shadow-md hover:opacity-90 transition-all"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Acessar Conteúdo
                      </a>
                    ) : (
                      <button className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl text-text-primary bg-bg-dark border border-border-dark shadow-sm hover:bg-surface transition-all">
                        <CheckCircle className="mr-2 h-4 w-4 text-success" />
                        Compra Confirmada
                      </button>
                    )
                  ) : (
                    <button disabled className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl text-text-muted bg-bg-dark border border-border-dark cursor-not-allowed">
                      Aguardando Pagamento
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
