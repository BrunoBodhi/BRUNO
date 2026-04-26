
import React, { useState } from 'react';
import { TestimonialItem } from '../../types';
import { compressImage } from '../../utils/mediaUtils';

interface TestimonialsEditorProps {
  testimonials: TestimonialItem[];
  sectionTitle: string;
  onUpdate: (testimonials: TestimonialItem[]) => void;
  onUpdateTitle: (title: string) => void;
  onClose: () => void;
}

const StarRatingInput = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => {
  return (
    <div className="flex items-center gap-2">
      {[...Array(5)].map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setRating(i + 1)}
          className={`text-2xl transition-all duration-200 ${i < rating ? 'text-gold-500 scale-110' : 'text-zinc-600 hover:text-gold-500/50'}`}
        >
          <i className="fas fa-star"></i>
        </button>
      ))}
    </div>
  );
};

const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({
  testimonials,
  sectionTitle,
  onUpdate,
  onUpdateTitle,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialItem>({
    id: '',
    imageUrl: '',
    name: '',
    role: '',
    testimonialText: '',
    rating: 5,
    active: true
  });
  const [isUploading, setIsUploading] = useState(false);

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

  const handleSave = () => {
    if (!formData.imageUrl || !formData.name || !formData.testimonialText) {
      return alert('Foto, nome e texto do depoimento são obrigatórios.');
    }

    if (editingId) {
      onUpdate(testimonials.map(item => item.id === editingId ? { ...formData, id: editingId } : item));
    } else {
      onUpdate([...testimonials, { ...formData, id: `tst_${Date.now()}` }]);
    }
    handleCancel();
  };

  const handleEdit = (item: TestimonialItem) => {
    setFormData({ ...item, active: item.active !== false });
    setEditingId(item.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este depoimento?')) {
      onUpdate(testimonials.filter(item => item.id !== id));
      if (editingId === id) handleCancel();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      id: '',
      imageUrl: '',
      name: '',
      role: '',
      testimonialText: '',
      rating: 5,
      active: true
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">DEPOIMENTOS</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">PROVA SOCIAL & CLIENTES</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-5 space-y-6 border-r border-white/5 pr-6">
            <div>
              <label className="premium-label">TÍTULO DA SEÇÃO:</label>
              <input type="text" value={sectionTitle || ''} onChange={e => onUpdateTitle(e.target.value)} className="premium-input text-lg font-bold" placeholder="EX: O QUE DIZEM NOSSOS CLIENTES" />
            </div>
            <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mt-8 mb-4">DEPOIMENTOS ({testimonials.length}):</h3>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
              <button 
                onClick={handleCancel}
                className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-3 ${!editingId ? 'bg-gold-500 text-black border-gold-400' : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800'}`}
              >
                <div className="w-8 h-8 rounded bg-black/20 flex items-center justify-center"><i className="fas fa-plus"></i></div>
                <span className="font-bold text-xs uppercase">NOVO DEPOIMENTO</span>
              </button>
              {testimonials.map(item => (
                <div key={item.id} className={`group relative w-full p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${editingId === item.id ? 'bg-zinc-800 border-gold-500/50' : 'bg-zinc-900/20 border-white/5 hover:border-white/20'}`}>
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => handleEdit(item)}>
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    <div>
                      <p className="font-bold text-xs uppercase text-zinc-300">{item.name}</p>
                      <p className="text-[9px] text-zinc-500">{item.role}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="text-zinc-600 hover:text-red-500 px-2"><i className="fas fa-trash"></i></button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">
              {editingId ? 'EDITAR DEPOIMENTO:' : 'ADICIONAR DEPOIMENTO:'}
            </h3>
            <div className="space-y-6">
              <div className="flex gap-6 items-center">
                <div className="w-24 h-24 bg-zinc-900 rounded-full border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <i className="fas fa-user text-3xl text-zinc-700"></i>}
                </div>
                <div className="flex-1">
                  <label className="jewel-button !py-3 !px-4 w-full cursor-pointer text-center block">
                    {isUploading ? (
                       <span className="animate-pulse">
                          <i className="fas fa-spinner fa-spin mr-2"></i> PROCESSANDO...
                       </span>
                    ) : (
                       <>
                          <i className="fas fa-upload mr-2"></i> UPLOAD FOTO
                          <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                       </>
                    )}
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="premium-label">NOME DO CLIENTE:</label>
                  <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="premium-input" placeholder="Ex: João Silva" />
                </div>
                <div className="w-full">
                  <label className="premium-label">CARGO / TÍTULO:</label>
                  <input type="text" value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} className="premium-input" placeholder="Ex: Cliente VIP" />
                </div>
              </div>
              <div className="w-full">
                <label className="premium-label">AVALIAÇÃO:</label>
                <StarRatingInput rating={formData.rating} setRating={r => setFormData({ ...formData, rating: r })} />
              </div>
              <div className="w-full">
                <label className="premium-label">TEXTO DO DEPOIMENTO:</label>
                <textarea
                  value={formData.testimonialText || ''}
                  onChange={e => setFormData({ ...formData, testimonialText: e.target.value })}
                  className="premium-input min-h-[120px]"
                  placeholder="Escreva aqui a avaliação do cliente..."
                ></textarea>
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
  );
};

export default TestimonialsEditor;
