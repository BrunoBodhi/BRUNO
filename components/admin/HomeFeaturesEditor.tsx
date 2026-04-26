
import React, { useState } from 'react';
import { GenericFeatureCard } from '../../types';
import IconPicker from '../IconPicker';

interface HomeFeaturesEditorProps {
  homeFeatureCards: GenericFeatureCard[];
  onUpdate: (cards: GenericFeatureCard[]) => void;
  onClose: () => void;
}

const HomeFeaturesEditor: React.FC<HomeFeaturesEditorProps> = ({
  homeFeatureCards,
  onUpdate,
  onClose,
}) => {
  const [newHomeFeature, setNewHomeFeature] = useState<GenericFeatureCard>({ id: '', active: true, icon: 'fa-solid fa-star', title: '', description: '', link: '' });

  const handleAdd = () => {
    if (newHomeFeature.title) {
      onUpdate([...(homeFeatureCards || []), { id: `hf${Date.now()}`, ...newHomeFeature, active: true }]);
      setNewHomeFeature({ id: '', active: true, icon: 'fa-solid fa-star', title: '', description: '', link: '' });
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<GenericFeatureCard>) => {
    onUpdate(homeFeatureCards.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleDelete = (id: string) => {
    onUpdate(homeFeatureCards.filter(f => f.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">DESTAQUES</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">CARACTERÍSTICAS DA HOME</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all"><i className="fas fa-times"></i></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Lista Existente */}
          <div className="space-y-4">
             {homeFeatureCards.map(feature => (
               <div key={feature.id} className="group bg-zinc-900/30 hover:bg-zinc-900/60 p-5 rounded-xl border border-white/5 hover:border-gold-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">
                        <i className={feature.icon}></i>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateItem(feature.id, { active: !feature.active });
                          }} 
                          className={`px-2 ${feature.active === false ? 'text-gold-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          <i className={`fas ${feature.active !== false ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                        </button>
                        <button onClick={() => handleDelete(feature.id)} className="text-zinc-700 hover:text-red-500 transition-colors"><i className="fas fa-trash"></i></button>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <input type="text" value={feature.title} onChange={e => handleUpdateItem(feature.id, { title: e.target.value })} className="bg-transparent w-full text-white font-black uppercase text-sm outline-none border-b border-transparent focus:border-white/10 pb-1" placeholder="TÍTULO" />
                     <textarea value={feature.description} onChange={e => handleUpdateItem(feature.id, { description: e.target.value })} className="bg-transparent w-full text-zinc-400 text-xs outline-none resize-none h-16 border-b border-transparent focus:border-white/10" placeholder="Descrição..."></textarea>
                     
                     <div className="pt-2 border-t border-white/5 flex gap-2">
                        <div className="flex-1"><IconPicker currentIcon={feature.icon} onSelect={icon => handleUpdateItem(feature.id, { icon })} /></div>
                     </div>
                  </div>
               </div>
             ))}
             {homeFeatureCards.length === 0 && <p className="text-zinc-600 text-xs font-black uppercase text-center py-10">NENHUM DESTAQUE.</p>}
          </div>

          {/* Adicionar Novo */}
          <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-2xl border border-gold-500/10 h-fit sticky top-0">
             <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6">NOVO DESTAQUE</h3>
             <div className="space-y-6">
                <div>
                   <label className="premium-label">TÍTULO</label>
                   <input type="text" value={newHomeFeature.title} onChange={e => setNewHomeFeature({ ...newHomeFeature, title: e.target.value })} className="premium-input" placeholder="EX: QUALIDADE" />
                </div>
                <div>
                   <label className="premium-label">DESCRIÇÃO</label>
                   <textarea value={newHomeFeature.description} onChange={e => setNewHomeFeature({ ...newHomeFeature, description: e.target.value })} className="premium-input min-h-[80px]" placeholder="Texto curto..."></textarea>
                </div>
                <div>
                   <label className="premium-label">ÍCONE</label>
                   <IconPicker currentIcon={newHomeFeature.icon} onSelect={icon => setNewHomeFeature({ ...newHomeFeature, icon })} />
                </div>
                <button onClick={handleAdd} className="w-full jewel-button active mt-4">ADICIONAR</button>
             </div>
          </div>

        </div>

        <div className="mt-12 text-right">
          <button onClick={onClose} className="jewel-button px-12">CONCLUIR</button>
        </div>
      </div>
    </div>
  );
};

export default HomeFeaturesEditor;
