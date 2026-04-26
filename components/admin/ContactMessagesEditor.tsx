
import React, { useState } from 'react';
import { BrandConfig } from '../../types'; // Importa BrandConfig

interface ContactMessage {
  id: string;
  name: string;
  template: string;
}

interface ContactMessagesEditorProps {
  contactMessages: ContactMessage[];
  brand: BrandConfig; // Adiciona prop brand
  onUpdate: (updates: Partial<BrandConfig>) => void; // Altera o tipo de onUpdate
  onClose: () => void;
}

const ContactMessagesEditor: React.FC<ContactMessagesEditorProps> = ({
  contactMessages,
  brand, // Recebe a prop brand
  onUpdate,
  onClose,
}) => {
  const [newMsg, setNewMsg] = useState({ name: '', template: '' });

  const handleAdd = () => {
    if (newMsg.name && newMsg.template) {
      onUpdate({ contactMessages: [...(contactMessages || []), { id: `msg${Date.now()}`, ...newMsg }] });
      setNewMsg({ name: '', template: '' });
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<{ name: string; template: string }>) => {
    onUpdate({ contactMessages: contactMessages.map(msg => (msg.id === id ? { ...msg, ...updates } : msg)) });
  };

  const handleDelete = (id: string) => {
    onUpdate({ contactMessages: contactMessages.filter(msg => msg.id !== id) });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">MENSAGENS</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">MODELOS WHATSAPP</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all"><i className="fas fa-times"></i></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           
           <div className="space-y-6">
              {/* NOVA SEÇÃO: DETALHES DE CONTATO GLOBAIS */}
              <div className="bg-zinc-900/30 p-6 rounded-2xl border border-gold-500/10 mb-8 space-y-4">
                  <h3 className="text-gold-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">DETALHES DE CONTATO GLOBAIS</h3>
                  <div>
                    <label className="premium-label">WHATSAPP OFICIAL:</label>
                    <input type="text" value={brand.whatsapp || ''} onChange={e => onUpdate({ whatsapp: e.target.value })} className="premium-input" placeholder="5511999999999" />
                  </div>
                  <div>
                    <label className="premium-label">TELEGRAM OFICIAL:</label>
                    <input type="text" value={brand.telegram || ''} onChange={e => onUpdate({ telegram: e.target.value })} className="premium-input" placeholder="@usuario ou link" />
                  </div>
                  <div>
                    <label className="premium-label">RODAPÉ (COPYRIGHT):</label>
                    <input type="text" value={brand.footerText || ''} onChange={e => onUpdate({ footerText: e.target.value })} className="premium-input" placeholder="© 2024 Todos os direitos reservados." />
                  </div>
              </div>

              {/* MODELOS DE MENSAGEM EXISTENTES */}
              <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">MODELOS DE MENSAGEM:</h3>
              {contactMessages.map(message => (
                <div key={message.id} className="bg-zinc-900/30 p-6 rounded-xl border border-white/5 hover:border-gold-500/20 transition-all">
                  <div className="flex justify-between mb-4">
                     <input type="text" value={message.name || ''} onChange={e => handleUpdateItem(message.id, { name: e.target.value })} className="bg-transparent text-gold-500 font-black uppercase text-xs outline-none w-full" placeholder="NOME DO MODELO" />
                     <button onClick={() => handleDelete(message.id)} className="text-zinc-600 hover:text-red-500"><i className="fas fa-times"></i></button>
                  </div>
                  <textarea value={message.template || ''} onChange={e => handleUpdateItem(message.id, { template: e.target.value })} className="bg-zinc-950/50 w-full p-3 rounded-lg text-zinc-400 text-xs font-mono h-24 outline-none border border-white/5 focus:border-gold-500/30" placeholder="Mensagem..."></textarea>
                  <p className="text-[9px] text-zinc-600 mt-2 font-black uppercase tracking-widest">VARIÁVEIS: {'{empresa}'}, {'{cliente}'}</p>
                </div>
              ))}
           </div>

           <div className="bg-zinc-900/20 p-8 rounded-2xl border border-white/5 h-fit">
              <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-6">NOVO MODELO</h3>
              <div className="space-y-6">
                 <div>
                    <label className="premium-label">IDENTIFICADOR</label>
                    <input type="text" value={newMsg.name} onChange={e => setNewMsg({ ...newMsg, name: e.target.value })} className="premium-input" placeholder="EX: CONTATO INICIAL" />
                 </div>
                 <div>
                    <label className="premium-label">MENSAGEM PADRÃO</label>
                    <textarea value={newMsg.template} onChange={e => setNewMsg({ ...newMsg, template: e.target.value })} className="premium-input min-h-[100px]" placeholder="Olá, gostaria de saber sobre..."></textarea>
                 </div>
                 <button onClick={handleAdd} className="w-full jewel-button active mt-2">CRIAR MODELO</button>
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

export default ContactMessagesEditor;
