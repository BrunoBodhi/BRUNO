
import React, { useState } from 'react';
import { FaqItem } from '../../types';

interface FaqEditorProps {
  faq: FaqItem[];
  sectionTitle: string;
  onUpdate: (faq: FaqItem[]) => void;
  onUpdateTitle: (title: string) => void;
  onClose: () => void;
}

const FaqEditor: React.FC<FaqEditorProps> = ({
  faq,
  sectionTitle,
  onUpdate,
  onUpdateTitle,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FaqItem>({
    id: '',
    question: '',
    answer: ''
  });

  const handleSave = () => {
    if (!formData.question || !formData.answer) {
      return alert('Pergunta e resposta são obrigatórias.');
    }

    if (editingId) {
      onUpdate(faq.map(item => item.id === editingId ? { ...formData, id: editingId } : item));
    } else {
      onUpdate([...faq, { ...formData, id: `faq_${Date.now()}` }]);
    }
    handleCancel();
  };

  const handleEdit = (item: FaqItem) => {
    setFormData({ ...item });
    setEditingId(item.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta pergunta?')) {
      onUpdate(faq.filter(item => item.id !== id));
      if (editingId === id) handleCancel();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ id: '', question: '', answer: '' });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">FAQ</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">PERGUNTAS FREQUENTES</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-5 space-y-6 border-r border-white/5 pr-6">
            <div>
              <label className="premium-label">TÍTULO DA SEÇÃO:</label>
              <input type="text" value={sectionTitle} onChange={e => onUpdateTitle(e.target.value)} className="premium-input text-lg font-bold" placeholder="EX: PERGUNTAS FREQUENTES" />
            </div>
            <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mt-8 mb-4">ITENS ({faq.length}):</h3>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
              <button 
                onClick={handleCancel}
                className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-3 ${!editingId ? 'bg-gold-500 text-black border-gold-400' : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800'}`}
              >
                <div className="w-8 h-8 rounded bg-black/20 flex items-center justify-center"><i className="fas fa-plus"></i></div>
                <span className="font-bold text-xs uppercase">NOVA PERGUNTA</span>
              </button>
              {faq.map(item => (
                <div key={item.id} className={`group relative w-full p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${editingId === item.id ? 'bg-zinc-800 border-gold-500/50' : 'bg-zinc-900/20 border-white/5 hover:border-white/20'}`}>
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => handleEdit(item)}>
                     <div className="w-8 h-8 rounded bg-black/40 flex-shrink-0 flex items-center justify-center text-zinc-500"><i className="fas fa-question"></i></div>
                     <p className="font-bold text-xs uppercase text-zinc-300 truncate">{item.question}</p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="text-zinc-600 hover:text-red-500 px-2"><i className="fas fa-trash"></i></button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">
              {editingId ? 'EDITAR ITEM:' : 'ADICIONAR ITEM:'}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="premium-label">PERGUNTA:</label>
                <input type="text" value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} className="premium-input" placeholder="Qual o horário de funcionamento?" autoComplete="off" />
              </div>
              <div>
                <label className="premium-label">RESPOSTA:</label>
                <textarea
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  className="premium-input min-h-[150px]"
                  placeholder="Nosso atendimento funciona de..."
                  autoComplete="off"
                ></textarea>
              </div>
              <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                <button onClick={handleCancel} className="text-xs font-black text-zinc-500 hover:text-white uppercase tracking-widest px-4">CANCELAR</button>
                <button onClick={handleSave} className="jewel-button active px-8">SALVAR</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqEditor;
