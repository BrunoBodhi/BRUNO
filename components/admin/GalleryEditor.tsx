
import React, { useState } from 'react';
import { GalleryItem } from '../../types';
import AIMediaStudio from './AIMediaStudio';
import { compressImage } from '../../utils/mediaUtils';

interface GalleryEditorProps {
  gallery: GalleryItem[];
  sectionTitle: string;
  onUpdate: (gallery: GalleryItem[]) => void;
  onUpdateTitle: (title: string) => void;
  onClose: () => void;
}

const GalleryEditor: React.FC<GalleryEditorProps> = ({
  gallery,
  sectionTitle,
  onUpdate,
  onUpdateTitle,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GalleryItem>({
    id: '',
    imageUrl: '',
    category: 'Geral',
    title: '',
    active: true
  });
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sugestões de categorias comuns
  const commonCategories = ['Serviços', 'Ambiente', 'Destaques', 'Resultados', 'Produtos', 'Equipe'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await compressImage(file);
        setFormData({ ...formData, imageUrl: result });
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
    setFormData({ ...formData, imageUrl: imageBase64 });
    setIsAIStudioOpen(false);
  };

  const handleSave = () => {
    if (!formData.imageUrl) return alert('A imagem é obrigatória.');

    if (editingId) {
      onUpdate(gallery.map(item => item.id === editingId ? { ...formData, id: editingId } : item));
    } else {
      onUpdate([...gallery, { ...formData, id: `img_${Date.now()}` }]);
    }
    handleCancel();
  };

  const handleEdit = (item: GalleryItem) => {
    setFormData({ ...item, active: item.active !== false });
    setEditingId(item.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta imagem?')) {
      onUpdate(gallery.filter(item => item.id !== id));
      if (editingId === id) handleCancel();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      id: '',
      imageUrl: '',
      category: 'Geral',
      title: '',
      active: true
    });
  };

  return (
    <>
      <AIMediaStudio
        isOpen={isAIStudioOpen}
        onClose={() => setIsAIStudioOpen(false)}
        onSelect={handleAIImageSelected}
        targetLabel="Imagem para Galeria"
        aspectRatio="1:1" // Quadrado para o grid ficar bonito
        imageType="background"
      />
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">GALERIA VIP</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">PORTFÓLIO & FOTOS</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Lista Lateral */}
            <div className="lg:col-span-5 space-y-6 border-r border-white/5 pr-6">
              <div>
                  <label className="premium-label">TÍTULO DA SEÇÃO:</label>
                  <input type="text" value={sectionTitle} onChange={e => onUpdateTitle(e.target.value)} className="premium-input text-lg font-bold" placeholder="EX: NOSSO TRABALHO" />
              </div>

              <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mt-8 mb-4">IMAGENS ({gallery.length}):</h3>
              <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto no-scrollbar">
                 <button 
                    onClick={handleCancel}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${!editingId ? 'bg-gold-500 text-black border-gold-400' : 'bg-zinc-900/40 border-white/10 text-zinc-500 hover:bg-zinc-800'}`}
                 >
                    <i className="fas fa-plus text-lg"></i>
                    <span className="text-[8px] font-black uppercase">NOVA</span>
                 </button>

                 {gallery.map(item => (
                    <div key={item.id} className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${editingId === item.id ? 'border-gold-500 ring-2 ring-gold-500/20' : 'border-white/10 hover:border-white/30'}`} onClick={() => handleEdit(item)}>
                       <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center"><i className="fas fa-trash text-[10px]"></i></button>
                       </div>
                    </div>
                 ))}
              </div>
            </div>

            {/* Formulário */}
            <div className="lg:col-span-7 space-y-8">
              <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">
                {editingId ? 'EDITAR IMAGEM:' : 'ADICIONAR IMAGEM:'}
              </h3>

              <div className="space-y-6">
                 
                 <div className="flex gap-6 items-start">
                    <div className="w-32 h-32 bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                       {formData.imageUrl ? (
                          <img src={formData.imageUrl} className="w-full h-full object-cover" />
                       ) : (
                          <i className="fas fa-image text-3xl text-zinc-700"></i>
                       )}
                    </div>
                    <div className="flex-1 space-y-3">
                       <label className="jewel-button !py-3 !px-4 w-full cursor-pointer text-center block">
                          <i className="fas fa-upload mr-2"></i> UPLOAD FOTO
                          <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                       </label>
                       <button onClick={() => setIsAIStudioOpen(true)} className="jewel-button active !py-3 !px-4 w-full">
                          <i className="fas fa-wand-magic-sparkles mr-2"></i> GERAR COM IA
                       </button>
                    </div>
                 </div>

                 <div className="w-full">
                    <label className="premium-label">CATEGORIA (FILTRO):</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                       {commonCategories.map(cat => (
                          <button 
                             key={cat} 
                             onClick={() => setFormData({ ...formData, category: cat })}
                             className={`px-3 py-1 rounded text-[9px] uppercase font-bold border transition-all ${formData.category === cat ? 'bg-gold-500 text-black border-gold-500' : 'bg-zinc-900 text-zinc-500 border-zinc-700 hover:text-white'}`}
                          >
                             {cat}
                          </button>
                       ))}
                    </div>
                    <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="premium-input" placeholder="Ou digite uma categoria nova..." />
                 </div>

                 <div className="w-full">
                    <label className="premium-label">TÍTULO / LEGENDA (OPCIONAL):</label>
                    <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="premium-input" placeholder="Ex: Detalhe do Serviço" />
                 </div>

                 <div className="w-full">
                    <label className="premium-label">VISIBILIDADE:</label>
                    <button 
                      onClick={() => setFormData({ ...formData, active: !formData.active })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-black uppercase transition-all ${formData.active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
                    >
                      <i className={`fas ${formData.active ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      {formData.active ? 'VISÍVEL' : 'OCULTO'}
                    </button>
                 </div>

                 <div className="pt-6 border-t border-white/5 flex justify-between gap-4">
                     <button onClick={() => editingId && handleDelete(editingId)} className={`text-xs font-black  uppercase tracking-widest px-4 ${editingId ? 'text-red-500 hover:text-red-400' : 'text-zinc-700 cursor-not-allowed'}`} disabled={!editingId}>EXCLUIR</button>
                     <div className="flex gap-4">
                       <button onClick={handleCancel} className="text-xs font-black text-zinc-500 hover:text-white uppercase tracking-widest px-4">CANCELAR</button>
                       <button onClick={handleSave} className="jewel-button active px-8">SALVAR</button>
                     </div>
                 </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryEditor;
