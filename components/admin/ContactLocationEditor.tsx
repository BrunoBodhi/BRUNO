
import React from 'react';
import { ContactLocationConfig } from '../../types';

interface ContactLocationEditorProps {
  contactLocation: ContactLocationConfig;
  onUpdate: (updates: Partial<ContactLocationConfig>) => void;
  onClose: () => void;
}

const ContactLocationEditor: React.FC<ContactLocationEditorProps> = ({
  contactLocation,
  onUpdate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">CONTATO</h2>
            <div className="flex items-center gap-3">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">LOCALIZAÇÃO & INFORMAÇÕES</p>
              <button 
                onClick={() => onUpdate({ showSection: !contactLocation.showSection })}
                className={`text-[10px] font-black px-2 py-0.5 rounded border transition-all ${contactLocation.showSection ? 'bg-gold-500/20 border-gold-500/50 text-gold-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
              >
                {contactLocation.showSection ? 'VISÍVEL' : 'OCULTO'}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="premium-label">TÍTULO DA SEÇÃO:</label>
                <input 
                  type="text" 
                  value={contactLocation.sectionTitle || ''} 
                  onChange={e => onUpdate({ sectionTitle: e.target.value })} 
                  className="premium-input text-lg font-bold" 
                  placeholder="EX: NOSSA LOCALIZAÇÃO" 
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="premium-label">EXIBIR DADOS:</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdate({ showAddress: !contactLocation.showAddress })}
                    className={`flex-1 text-[10px] font-black py-3 rounded border transition-all ${contactLocation.showAddress !== false ? 'bg-zinc-900 border-gold-500/50 text-gold-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                  >
                    <i className={`fas fa-map-marker-alt mr-2 ${contactLocation.showAddress !== false ? 'text-gold-500' : 'text-zinc-500'}`}></i>
                    ENDEREÇO
                  </button>
                  <button 
                    onClick={() => onUpdate({ showMap: !contactLocation.showMap })}
                    className={`flex-1 text-[10px] font-black py-3 rounded border transition-all ${contactLocation.showMap !== false ? 'bg-zinc-900 border-gold-500/50 text-gold-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                  >
                    <i className={`fas fa-map-marked-alt mr-2 ${contactLocation.showMap !== false ? 'text-gold-500' : 'text-zinc-500'}`}></i>
                    MAPA
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="premium-label">ENDEREÇO:</label>
                    <textarea 
                        value={contactLocation.address || ''} 
                        onChange={e => onUpdate({ address: e.target.value })} 
                        className="premium-input min-h-[100px]" 
                        placeholder="Rua, Número, Bairro&#10;Cidade, Estado - CEP"
                        autoComplete="off"
                    ></textarea>
                </div>
                <div>
                    <label className="premium-label">HORÁRIO DE FUNCIONAMENTO:</label>
                    <textarea 
                        value={contactLocation.hours || ''} 
                        onChange={e => onUpdate({ hours: e.target.value })} 
                        className="premium-input min-h-[100px]" 
                        placeholder="Seg - Sex: 09:00 - 20:00&#10;Sáb: 09:00 - 18:00"
                        autoComplete="off"
                    ></textarea>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="premium-label">TELEFONE PARA CONTATO:</label>
                    <input 
                        type="tel" 
                        value={contactLocation.phone || ''} 
                        onChange={e => onUpdate({ phone: e.target.value })} 
                        className="premium-input" 
                        placeholder="(11) 98765-4321" 
                        autoComplete="off"
                    />
                </div>
                <div>
                    <label className="premium-label">EMAIL PARA CONTATO:</label>
                    <input 
                        type="email" 
                        value={contactLocation.email || ''} 
                        onChange={e => onUpdate({ email: e.target.value })} 
                        className="premium-input" 
                        placeholder="contato@suamarca.com" 
                        autoComplete="off"
                    />
                </div>
            </div>

            <div>
                <label className="premium-label">URL DE INCORPORAÇÃO DO GOOGLE MAPS:</label>
                <textarea 
                    value={contactLocation.mapEmbedUrl || ''} 
                    onChange={e => onUpdate({ mapEmbedUrl: e.target.value })} 
                    className="premium-input min-h-[120px] font-mono text-xs" 
                    placeholder='Cole o código "iframe src" do Google Maps aqui.'
                    autoComplete="off"
                ></textarea>
                <p className="text-[10px] text-zinc-500 mt-2">
                    <i className="fas fa-info-circle mr-1"></i>
                    Para obter, procure seu endereço no Google Maps, clique em "Compartilhar", depois em "Incorporar um mapa" e copie o link que começa com <code className="text-gold-500 bg-black p-1 rounded-sm">https://www.google.com/maps/embed...</code>
                </p>
            </div>
        </div>

        <div className="mt-12 text-right">
          <button onClick={onClose} className="jewel-button active px-12">CONCLUIR</button>
        </div>
      </div>
    </div>
  );
};

export default ContactLocationEditor;
