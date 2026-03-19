import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';
import { Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';

interface Block {
  id: string;
  userId: string;
  type: 'link' | 'text';
  title: string;
  url?: string;
  content?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function Links() {
  const { user, profile } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBlockType, setNewBlockType] = useState<'link' | 'text'>('link');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newContent, setNewContent] = useState('');
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);

  const isFreePlan = profile?.plan === 'free';
  const blockLimit = 5;
  const hasReachedLimit = isFreePlan && blocks.length >= blockLimit;

  useEffect(() => {
    fetchBlocks();
  }, [user]);

  const fetchBlocks = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'blocks'),
        where('userId', '==', user.uid),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedBlocks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Block[];
      setBlocks(fetchedBlocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const newOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.order)) + 1 : 0;
      
      const blockData: any = {
        userId: user.uid,
        type: newBlockType,
        title: newTitle,
        order: newOrder,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      if (newBlockType === 'link') {
        blockData.url = newUrl;
      } else {
        blockData.content = newContent;
      }

      const docRef = await addDoc(collection(db, 'blocks'), blockData);
      
      // Update local state
      setBlocks([...blocks, { id: docRef.id, ...blockData }]);
      
      // Reset form
      setIsAdding(false);
      setNewTitle('');
      setNewUrl('');
      setNewContent('');
    } catch (error) {
      console.error('Error adding block:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blocks', id));
      setBlocks(blocks.filter(b => b.id !== id));
      setBlockToDelete(null);
    } catch (error) {
      console.error('Error deleting block:', error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'blocks', id), { isActive: !currentStatus });
      setBlocks(blocks.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b));
    } catch (error) {
      console.error('Error toggling block status:', error);
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
        <h1 className="text-3xl font-bold text-text-primary">Links & Blocos</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          disabled={hasReachedLimit}
          className={`inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white shadow-md transition-all ${
            hasReachedLimit 
              ? 'bg-surface border border-border-dark text-text-muted cursor-not-allowed' 
              : 'bg-gradient-primary hover:opacity-90'
          }`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Bloco
        </button>
      </div>

      {hasReachedLimit && (
        <div className="mb-8 p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-warning">Limite do Plano Free Atingido</h3>
            <p className="mt-1 text-sm text-warning/80">
              Você atingiu o limite de {blockLimit} blocos do plano gratuito. Faça upgrade para adicionar mais blocos.
            </p>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-surface shadow-lg rounded-2xl p-6 mb-8 border border-border-dark">
          <h2 className="text-lg font-medium text-text-primary mb-4">Novo Bloco</h2>
          <form onSubmit={handleAddBlock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Tipo de Bloco</label>
              <select
                value={newBlockType}
                onChange={(e) => setNewBlockType(e.target.value as 'link' | 'text')}
                className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
              >
                <option value="link">Link Externo</option>
                <option value="text">Texto Livre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">Título</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                placeholder={newBlockType === 'link' ? "Ex: Meu Instagram" : "Ex: Sobre mim"}
              />
            </div>

            {newBlockType === 'link' ? (
              <div>
                <label className="block text-sm font-medium text-text-secondary">URL</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                  placeholder="https://..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-text-secondary">Conteúdo</label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 bg-bg-dark text-text-primary shadow-sm ring-1 ring-inset ring-border-dark placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                  placeholder="Escreva seu texto aqui..."
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
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
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {blocks.length === 0 && !isAdding ? (
          <div className="text-center py-12 bg-surface rounded-2xl shadow-sm border border-dashed border-border-dark">
            <p className="text-sm text-text-muted">Nenhum bloco adicionado ainda.</p>
          </div>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="bg-surface shadow-sm rounded-2xl p-4 flex items-center justify-between border border-border-dark hover:border-primary/50 transition-colors">
              <div className="flex items-center flex-1">
                <GripVertical className="h-5 w-5 text-text-muted cursor-grab mr-3 hover:text-text-secondary transition-colors" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-text-primary flex items-center">
                    {block.title}
                    <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-bg-dark text-text-secondary border border-border-dark">
                      {block.type === 'link' ? 'Link' : 'Texto'}
                    </span>
                  </h3>
                  {block.type === 'link' && (
                    <a href={block.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary-hover flex items-center mt-1 transition-colors">
                      {block.url}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                  {block.type === 'text' && (
                    <p className="text-xs text-text-muted mt-1 truncate max-w-md">{block.content}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={block.isActive}
                      onChange={() => handleToggleActive(block.id, block.isActive)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${block.isActive ? 'bg-primary' : 'bg-bg-dark border border-border-dark'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${block.isActive ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
                
                <button
                  onClick={() => setBlockToDelete(block.id)}
                  className="text-error/70 hover:text-error p-2 transition-colors rounded-lg hover:bg-error/10"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {blockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border-dark rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-text-primary mb-2">Excluir Bloco</h3>
            <p className="text-text-secondary mb-6">Tem certeza que deseja excluir este bloco? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setBlockToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-dark transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(blockToDelete)}
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
