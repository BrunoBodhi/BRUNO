import React, { useState } from 'react';
import { BrandConfig, ProductEntry } from '../../types';
import IconPicker from '../IconPicker';
import AIMediaStudio from './AIMediaStudio';
import { compressImage } from '../../utils/mediaUtils';

interface ProductsEditorProps {
  products: ProductEntry[];
  sectionTitle: string;
  // FIX: Added props for section background management.
  sectionBackgroundColor?: string;
  sectionBackgroundImage?: string;
  onUpdateProducts: (products: ProductEntry[]) => void;
  // FIX: Updated prop type to handle new background settings.
  onUpdateSectionSettings: (updates: Partial<Pick<BrandConfig, 'productsSectionTitle' | 'productsSectionBackgroundColor' | 'productsSectionBackgroundImage'>>) => void;
  onClose: () => void;
}

type AIImageTargetType = 'productImage' | 'cardBg';
type AIImageTargetState = {
  target: AIImageTargetType;
  aspectRatio: '1:1' | '16:9';
};

const ProductsEditor: React.FC<ProductsEditorProps> = ({
  products,
  sectionTitle,
  // FIX: Destructuring new props.
  sectionBackgroundColor,
  sectionBackgroundImage,
  onUpdateProducts,
  onUpdateSectionSettings,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductEntry>({
    id: '',
    active: true,
    highlight: false,
    type: 'icon',
    icon: 'fa-solid fa-star',
    title: '',
    price: '',
    description: '',
    buttonText: 'COMPRAR',
    buttonStyle: 'solid',
    actionType: 'whatsapp',
    link: '',
    cardBackgroundColor: '#18181b', // Default
    cardBackgroundImage: ''
  });
  const [aiImageTarget, setAIImageTarget] = useState<AIImageTargetState | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'productImage' | 'cardBg' | 'sectionBg') => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await compressImage(file);
        if (target === 'productImage') setFormData({ ...formData, imageUrl: result });
        else if (target === 'cardBg') setFormData({ ...formData, cardBackgroundImage: result });
        else if (target === 'sectionBg') onUpdateSectionSettings({ productsSectionBackgroundImage: result });
      } catch (error) {
        console.error("Erro ao carregar imagem:", error);
        alert('Erro ao processar imagem. Tente outro arquivo.');
      } finally {
        setIsUploading(false);
      }
    }
    e.target.value = '';
  };
  
  const handleAIImageSelected = (imageBase64: string) => {
    if (!aiImageTarget) return;
    const { target } = aiImageTarget;

    if (target === 'productImage') {
      setFormData({ ...formData, imageUrl: imageBase64 });
    } else if (target === 'cardBg') {
      setFormData({ ...formData, cardBackgroundImage: imageBase64 });
    }
    setAIImageTarget(null);
  };

  const getAITargetLabel = (): string => {
    if (!aiImageTarget) return '';
    switch (aiImageTarget.target) {
      case 'productImage': return 'Imagem de Capa do Item';
      case 'cardBg': return 'Fundo do Card';
      default: return '';
    }
  };

  const handleSave = () => {
    if (!formData.title) return alert('O título é obrigatório.');

    if (editingId) {
      onUpdateProducts(products.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
    } else {
      onUpdateProducts([...products, { ...formData, id: `prod_${Date.now()}` }]);
    }
    handleCancel();
  };

  const handleEdit = (product: ProductEntry) => {
    setFormData({ 
      ...product, 
      buttonStyle: product.buttonStyle || 'solid',
      cardBackgroundColor: product.cardBackgroundColor || '#18181b',
      cardBackgroundImage: product.cardBackgroundImage || ''
    });
    setEditingId(product.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este item?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
      if (editingId === id) handleCancel();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      id: '',
      active: true,
      highlight: false,
      type: 'icon',
      icon: 'fa-solid fa-star',
      title: '',
      price: '',
      description: '',
      buttonText: 'COMPRAR',
      buttonStyle: 'solid',
      actionType: 'whatsapp',
      link: '',
      cardBackgroundColor: '#18181b',
      cardBackgroundImage: ''
    });
  };

  return (
    <>
      <AIMediaStudio
        isOpen={!!aiImageTarget}
        onClose={() => setAIImageTarget(null)}
        onSelect={handleAIImageSelected}
        targetLabel={getAITargetLabel()}
        aspectRatio={aiImageTarget?.aspectRatio || '16:9'}
        imageType="background"
      />
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="glass-panel w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">CATÁLOGO</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">PLANOS, PRODUTOS E CURSOS</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-4 space-y-6 border-r border-white/5 pr-6">
              <div>
                  <label className="premium-label">TÍTULO DA SEÇÃO:</label>
                  <input type="text" value={sectionTitle || ''} onChange={e => onUpdateSectionSettings({ productsSectionTitle: e.target.value })} className="premium-input text-lg font-bold" placeholder="EX: NOSSOS PLANOS" autoComplete="off" />
              </div>

              {/* FIX: Added UI controls for section background color and image. */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                  <div>
                    <label className="premium-label">COR DE FUNDO DA SEÇÃO:</label>
                    <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                      <input
                        type="color"
                        value={sectionBackgroundColor || '#000000'}
                        onChange={e => onUpdateSectionSettings({ productsSectionBackgroundColor: e.target.value })}
                        className="w-8 h-8 rounded-full border-none p-0 cursor-pointer bg-transparent"
                      />
                      <span className="text-[10px] text-zinc-400 font-mono uppercase">{sectionBackgroundColor || 'PADRÃO'}</span>
                      {sectionBackgroundColor && (
                         <button onClick={() => onUpdateSectionSettings({productsSectionBackgroundColor: undefined})} className="ml-auto text-zinc-600 hover:text-red-500 text-[8px] uppercase font-black tracking-widest">REDEFINIR</button>
                      )}
                    </div>
                  </div>
                  <div>
                     <label className="premium-label">IMAGEM DE FUNDO DA SEÇÃO:</label>
                     <div className="flex items-center gap-2">
                        <div className="w-16 h-12 bg-zinc-900 rounded border border-white/10 overflow-hidden flex items-center justify-center">
                        {sectionBackgroundImage ? (
                          <img src={sectionBackgroundImage} className="w-full h-full object-cover opacity-70" />
                        ) : (
                          <span className="text-[8px] text-zinc-600">SEM IMG</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                         <label className="jewel-button !py-1 !px-2 w-full cursor-pointer text-[9px] text-center">
                          {isUploading ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <>
                              UPLOAD
                              <input type="file" onChange={(e) => handleImageUpload(e, 'sectionBg')} className="hidden" accept="image/*" />
                            </>
                          )}
                        </label>
                      </div>
                      {sectionBackgroundImage && (
                        <button onClick={() => onUpdateSectionSettings({ productsSectionBackgroundImage: '' })} className="text-zinc-600 hover:text-red-500"><i className="fas fa-trash"></i></button>
                      )}
                    </div>
                  </div>
              </div>


              <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mt-8 mb-4">ITENS CADASTRADOS:</h3>
              <div className="space-y-3 max-h-[55vh] overflow-y-auto no-scrollbar">
                <button 
                  onClick={handleCancel}
                  className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-3 ${!editingId ? 'bg-gold-500 text-black border-gold-400' : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800'}`}
                >
                  <div className="w-8 h-8 rounded bg-black/20 flex items-center justify-center"><i className="fas fa-plus"></i></div>
                  <span className="font-bold text-xs uppercase">ADICIONAR NOVO ITEM</span>
                </button>

                {products.map(p => (
                  <div key={p.id} className={`group relative w-full p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${editingId === p.id ? 'bg-zinc-800 border-gold-500/50' : 'bg-zinc-900/20 border-white/5 hover:border-white/20'}`}>
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => handleEdit(p)}>
                      <div className="w-10 h-10 rounded bg-black/40 flex items-center justify-center overflow-hidden relative">
                         {p.type === 'image' && p.imageUrl ? (
                           <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <i className={`${p.icon} ${p.highlight ? 'text-gold-500' : 'text-zinc-500'}`}></i>
                         )}
                         {p.active === false && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><i className="fas fa-eye-slash text-xs text-white"></i></div>}
                      </div>
                      <div>
                        <p className={`font-bold text-xs uppercase ${p.highlight ? 'text-gold-500' : 'text-zinc-300'} ${p.active === false ? 'opacity-50 line-through' : ''}`}>{p.title}</p>
                        <p className="text-[9px] text-zinc-500">{p.price}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="text-zinc-600 hover:text-red-500 px-2"><i className="fas fa-trash"></i></button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateProducts(products.map(prod => prod.id === p.id ? {...prod, active: !prod.active} : prod));
                      }} 
                      className={`px-2 ${p.active === false ? 'text-gold-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <i className={`fas ${p.active !== false ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">
                {editingId ? 'EDITAR ITEM SELECIONADO:' : 'CRIAR NOVO ITEM:'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-zinc-400">STATUS DO ITEM:</span>
                      <label className="flex items-center gap-3 cursor-pointer">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${formData.active !== false ? 'text-green-500' : 'text-red-500'}`}>
                              {formData.active !== false ? 'VISÍVEL' : 'OCULTO'}
                          </span>
                          <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={formData.active !== false} 
                                onChange={e => setFormData({ ...formData, active: e.target.checked })} 
                                className="sr-only peer" 
                              />
                              <div className="w-10 h-5 bg-zinc-700 rounded-full peer-checked:bg-gold-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                          </div>
                      </label>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/50 p-2 rounded-lg border border-white/5 flex-1 justify-center">
                      <input type="radio" checked={formData.type === 'icon'} onChange={() => setFormData({ ...formData, type: 'icon' })} className="accent-gold-500" />
                      <span className="text-[10px] font-black uppercase text-zinc-400">USAR ÍCONE</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/50 p-2 rounded-lg border border-white/5 flex-1 justify-center">
                      <input type="radio" checked={formData.type === 'image'} onChange={() => setFormData({ ...formData, type: 'image' })} className="accent-gold-500" />
                      <span className="text-[10px] font-black uppercase text-zinc-400">USAR IMAGEM</span>
                    </label>
                  </div>

                  {formData.type === 'icon' ? (
                    <div>
                      <label className="premium-label">ÍCONE DO ITEM:</label>
                      <IconPicker currentIcon={formData.icon || ''} onSelect={icon => setFormData({ ...formData, icon })} />
                    </div>
                  ) : (
                    <div>
                      <label className="premium-label">IMAGEM DE CAPA:</label>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-16 bg-zinc-900 rounded border border-white/10 overflow-hidden">
                          {formData.imageUrl && <img src={formData.imageUrl} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="jewel-button !py-1 !px-2 w-full cursor-pointer text-[9px] text-center">
                             {isUploading ? (
                               <i className="fas fa-spinner fa-spin"></i>
                             ) : (
                               <>
                                 UPLOAD
                                 <input type="file" onChange={e => handleImageUpload(e, 'productImage')} className="hidden" accept="image/*" />
                               </>
                             )}
                          </label>
                          <button onClick={() => setAIImageTarget({ target: 'productImage', aspectRatio: '1:1' })} className="jewel-button active !py-1 !px-2 w-full text-[9px]">
                             <i className="fas fa-wand-magic-sparkles text-xs"></i> GERAR COM IA
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                     <label className="premium-label">NOME DO ITEM:</label>
                     <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="premium-input text-lg" placeholder="Ex: MENSAL VIP" autoComplete="off" />
                  </div>

                  <div>
                     <label className="premium-label">PREÇO OU VALOR:</label>
                     <input type="text" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} className="premium-input font-mono text-gold-500" placeholder="Ex: R$ 89,90" autoComplete="off" />
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-gold-900/10 border border-gold-500/20 rounded-lg">
                     <input type="checkbox" checked={formData.highlight} onChange={e => setFormData({ ...formData, highlight: e.target.checked })} className="accent-gold-500 w-4 h-4" />
                     <div>
                        <span className="text-xs font-black text-gold-500 uppercase block">DESTACAR ITEM NO SITE?</span>
                     </div>
                  </label>
                </div>

                <div className="space-y-6">
                   <div className="bg-zinc-900/20 p-4 rounded-xl border border-white/5 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PERSONALIZAÇÃO VISUAL (CARD):</h4>
                      <div>
                         <label className="premium-label">COR DE FUNDO DO CARD:</label>
                         <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                            <input type="color" value={formData.cardBackgroundColor || '#18181b'} onChange={e => setFormData({ ...formData, cardBackgroundColor: e.target.value })} className="w-8 h-8 rounded-full border-none p-0 cursor-pointer bg-transparent" />
                            <span className="text-[10px] text-zinc-400 font-mono uppercase">{formData.cardBackgroundColor}</span>
                         </div>
                      </div>
                      <div>
                         <label className="premium-label">IMAGEM DE FUNDO DO CARD:</label>
                         <div className="flex items-center gap-2">
                            <div className="w-16 h-12 bg-zinc-900 rounded border border-white/10 overflow-hidden flex items-center justify-center">
                              {formData.cardBackgroundImage ? (<img src={formData.cardBackgroundImage} className="w-full h-full object-cover opacity-70" />) : (<span className="text-[8px] text-zinc-600">SEM IMG</span>)}
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                               <label className="jewel-button !py-1 !px-2 w-full cursor-pointer text-[9px] text-center">
                                 UPLOAD
                                 <input type="file" onChange={e => handleImageUpload(e, 'cardBg')} className="hidden" accept="image/*" />
                               </label>
                               <button onClick={() => setAIImageTarget({ target: 'cardBg', aspectRatio: '16:9' })} className="jewel-button active !py-1 !px-2 w-full text-[9px]">
                                 <i className="fas fa-wand-magic-sparkles text-xs"></i> GERAR COM IA
                               </button>
                            </div>
                            {formData.cardBackgroundImage && (<button onClick={() => setFormData({ ...formData, cardBackgroundImage: '' })} className="text-zinc-600 hover:text-red-500"><i className="fas fa-trash"></i></button>)}
                         </div>
                      </div>
                   </div>
                   <div>
                      <label className="premium-label">DESCRIÇÃO (BENEFÍCIOS):</label>
                      <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="premium-input min-h-[100px] bg-zinc-900/30 p-2 rounded" placeholder="Use • para cada item...&#10;• Benefício 1&#10;• Benefício 2" autoComplete="off"></textarea>
                   </div>
                   <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CONFIGURAÇÃO DO BOTÃO:</h4>
                      <div>
                        <label className="premium-label">TEXTO DO BOTÃO:</label>
                        <input type="text" value={formData.buttonText || ''} onChange={e => setFormData({ ...formData, buttonText: e.target.value })} className="premium-input" placeholder="Ex: ASSINAR AGORA" />
                      </div>
                      <div>
                        <label className="premium-label">ESTILO DO BOTÃO:</label>
                        <div className="flex gap-2">
                          <button onClick={() => setFormData({ ...formData, buttonStyle: 'solid' })} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${formData.buttonStyle !== 'transparent' ? 'bg-gold-500 text-black border-gold-400' : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-white'}`}>SÓLIDO</button>
                          <button onClick={() => setFormData({ ...formData, buttonStyle: 'transparent' })} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.buttonStyle === 'transparent' ? 'bg-transparent text-gold-500 border-gold-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-white'}`}>TRANSPARENTE</button>
                        </div>
                      </div>
                      <div>
                        <label className="premium-label">AÇÃO AO CLICAR:</label>
                        <select value={formData.actionType} onChange={e => setFormData({ ...formData, actionType: e.target.value as any })} className="premium-input bg-zinc-950">
                          <option value="whatsapp">WhatsApp (Conversa)</option>
                          <option value="telegram">Telegram (Conversa)</option>
                          <option value="booking">Agendamento (Sistema)</option>
                          <option value="external_link">Link Externo (Checkout)</option>
                          <option value="none">Nenhuma (Apenas Vitrine)</option>
                        </select>
                      </div>
                      {formData.actionType === 'external_link' && (
                         <div>
                            <label className="premium-label">URL DE DESTINO:</label>
                            <input type="text" value={formData.link || ''} onChange={e => setFormData({ ...formData, link: e.target.value })} className="premium-input" placeholder="https://link-de-pagamento.com" />
                         </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                 <button onClick={handleCancel} className="text-xs font-black text-zinc-500 hover:text-white uppercase tracking-widest px-4">CANCELAR</button>
                 <button onClick={handleSave} className="jewel-button active px-8">SALVAR ALTERAÇÕES</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsEditor;