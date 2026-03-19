import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';
import { Plus, Trash2, Edit2, Package, FileText } from 'lucide-react';

interface Product {
  id: string;
  userId: string;
  type: 'simple' | 'digital';
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  fileUrl?: string;
  isActive: boolean;
  stock?: number;
  createdAt: string;
}

export default function Products() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Form state
  const [newType, setNewType] = useState<'simple' | 'digital'>('simple');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newStock, setNewStock] = useState('');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const isFreePlan = profile?.plan === 'free';
  const productLimit = 3;
  const hasReachedLimit = isFreePlan && products.length >= productLimit && !editingProductId;

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'products'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProductId(product.id);
      setNewType(product.type);
      setNewName(product.name);
      setNewDescription(product.description || '');
      setNewPrice(product.price.toString());
      setNewImageUrl(product.imageUrl || '');
      setNewFileUrl(product.fileUrl || '');
      setNewStock(product.stock ? product.stock.toString() : '');
    } else {
      setEditingProductId(null);
      setNewType('simple');
      setNewName('');
      setNewDescription('');
      setNewPrice('');
      setNewImageUrl('');
      setNewFileUrl('');
      setNewStock('');
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProductId(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const productData: any = {
        userId: user.uid,
        type: newType,
        name: newName,
        description: newDescription,
        price: parseFloat(newPrice),
        isActive: true,
      };

      if (newImageUrl) productData.imageUrl = newImageUrl;
      
      if (newType === 'simple' && newStock) {
        productData.stock = parseInt(newStock, 10);
      } else if (newType === 'digital' && newFileUrl) {
        productData.fileUrl = newFileUrl;
      }

      if (editingProductId) {
        // Update existing product
        await updateDoc(doc(db, 'products', editingProductId), productData);
        setProducts(products.map(p => p.id === editingProductId ? { ...p, ...productData } : p));
      } else {
        // Add new product
        productData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'products'), productData);
        setProducts([{ id: docRef.id, ...productData }, ...products]);
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'products', id), { isActive: !currentStatus });
      setProducts(products.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 text-text-secondary">Carregando...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Meus Produtos</h1>
        <button
          onClick={() => handleOpenForm()}
          disabled={hasReachedLimit}
          className={`inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white shadow-md transition-all ${
            hasReachedLimit 
              ? 'bg-surface border border-border-dark text-text-muted cursor-not-allowed' 
              : 'bg-gradient-primary hover:opacity-90'
          }`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </button>
      </div>

      {hasReachedLimit && (
        <div className="mb-8 p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-warning">Faça upgrade para adicionar mais de {productLimit} produtos</h3>
            <p className="mt-1 text-sm text-warning/80">
              Você atingiu o limite de {productLimit} produtos do plano gratuito. Faça upgrade para o plano Pro para adicionar produtos ilimitados.
            </p>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="bg-surface shadow-lg rounded-2xl p-6 mb-8 border border-border-dark">
          <h2 className="text-lg font-medium text-text-primary mb-4">
            {editingProductId ? 'Editar Produto' : 'Adicionar Produto'}
          </h2>
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-text-secondary">Tipo de Produto</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'simple' | 'digital')}
                  className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                >
                  <option value="simple">Produto Físico / Simples</option>
                  <option value="digital">Produto Digital (Download/Acesso)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-text-secondary">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-text-secondary">Descrição</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-text-secondary">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-text-secondary">URL da Imagem (Opcional)</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                  placeholder="https://..."
                />
              </div>

              {newType === 'simple' ? (
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-text-secondary">Estoque (Opcional)</label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                  />
                </div>
              ) : (
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-text-secondary">URL do Arquivo Digital</label>
                  <input
                    type="url"
                    required
                    value={newFileUrl}
                    onChange={(e) => setNewFileUrl(e.target.value)}
                    className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                    placeholder="https://..."
                  />
                  <p className="mt-1 text-xs text-text-muted">Link seguro para o arquivo que o cliente receberá após a compra.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-dark transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-md hover:opacity-90 transition-all"
              >
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 && !isAdding ? (
          <div className="col-span-full text-center py-12 bg-surface rounded-2xl shadow-sm border border-dashed border-border-dark">
            <p className="text-sm text-text-muted">Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-surface shadow-sm rounded-2xl overflow-hidden flex flex-col border border-border-dark hover:border-primary/50 transition-colors">
              <div className="h-48 bg-bg-dark relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <Package className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                    product.type === 'digital' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-info/10 text-info border-info/20'
                  }`}>
                    {product.type === 'digital' ? 'Digital' : 'Físico'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-medium text-text-primary truncate">{product.name}</h3>
                <p className="mt-1 text-xl font-bold text-primary">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
                <p className="mt-2 text-sm text-text-secondary line-clamp-2 flex-1">
                  {product.description || 'Sem descrição'}
                </p>
                
                <div className="mt-4 pt-4 border-t border-border-dark flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={product.isActive}
                        onChange={() => handleToggleActive(product.id, product.isActive)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${product.isActive ? 'bg-primary' : 'bg-bg-dark border border-border-dark'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${product.isActive ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-2 text-sm text-text-secondary">{product.isActive ? 'Ativo' : 'Inativo'}</span>
                  </label>
                  
                  <div className="flex space-x-2">
                    <button className="text-text-muted hover:text-primary p-1 transition-colors rounded-lg hover:bg-primary/10">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => setProductToDelete(product.id)}
                      className="text-error/70 hover:text-error p-1 transition-colors rounded-lg hover:bg-error/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border-dark rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-text-primary mb-2">Excluir Produto</h3>
            <p className="text-text-secondary mb-6">Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-dark transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(productToDelete)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-error hover:bg-error/90 transition-colors shadow-md"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
