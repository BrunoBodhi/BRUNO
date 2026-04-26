
import React, { useState } from 'react';
import { BrandConfig, PaymentApiEntry, PaymentMethodPreference } from '../../types';

interface PaymentConfigEditorProps {
  brand: BrandConfig;
  onUpdate: (updates: Partial<BrandConfig>) => void;
  onClose: () => void;
}

const PaymentConfigEditor: React.FC<PaymentConfigEditorProps> = ({
  brand,
  onUpdate,
  onClose,
}) => {
  const [newApi, setNewApi] = useState<Omit<PaymentApiEntry, 'id'>>({ name: '', url: '' });

  const handleAddApi = () => {
    if (newApi.name && newApi.url) {
      onUpdate({ paymentApis: [...(brand.paymentApis || []), { id: `api${Date.now()}`, ...newApi }] });
      setNewApi({ name: '', url: '' });
    }
  };

  const handleUpdateApi = (id: string, updates: Partial<PaymentApiEntry>) => {
    onUpdate({ paymentApis: brand.paymentApis.map(api => (api.id === id ? { ...api, ...updates } : api)) });
  };

  const handleDeleteApi = (id: string) => {
    onUpdate({ paymentApis: brand.paymentApis.filter(api => api.id !== id) });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">FINANCEIRO</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">MÉTODOS & GATEWAYS</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all"><i className="fas fa-times"></i></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Coluna 1: Dados Bancários e Preferências */}
          <div className="space-y-10">
             
             {/* Preferência */}
             <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
                <h3 className="text-gold-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">FLUXO PRINCIPAL</h3>
                <label className="premium-label mb-2">AÇÃO BOTÃO PAGAR</label>
                <select 
                  value={brand.paymentMethodPreference || 'api_direct'} 
                  onChange={e => onUpdate({ paymentMethodPreference: e.target.value as PaymentMethodPreference })} 
                  className="premium-input bg-zinc-950 text-white cursor-pointer"
                >
                  <option value="api_direct">LINK DIRETO / API (AUTOMÁTICO)</option>
                  <option value="whatsapp_chat">VIA WHATSAPP (MANUAL)</option>
                </select>
             </div>

             {/* Dados Pix/Banco */}
             <div className="space-y-6">
                <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] border-b border-white/5 pb-2">DADOS BANCÁRIOS</h3>
                <div className="space-y-4 bg-zinc-900/30 p-6 rounded-2xl border border-gold-500/10"> {/* Adicionado um painel visual para destaque */}
                   <h4 className="text-gold-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4">PAGAMENTO DIRETO (PIX & TED/DOC)</h4> {/* Novo título */}
                   <div>
                      <label className="premium-label">CHAVE PIX</label>
                      <input type="text" value={brand.pixKey || ''} onChange={e => onUpdate({ pixKey: e.target.value })} className="premium-input" placeholder="CPF / CNPJ / EMAIL" />
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                         <label className="premium-label">BANCO</label>
                         <input type="text" value={brand.bankName || ''} onChange={e => onUpdate({ bankName: e.target.value })} className="premium-input" placeholder="Ex: Nubank" />
                      </div>
                      <div className="col-span-1">
                         <label className="premium-label">AGÊNCIA</label>
                         <input type="text" value={brand.bankAgency || ''} onChange={e => onUpdate({ bankAgency: e.target.value })} className="premium-input" placeholder="0001" />
                      </div>
                      <div className="col-span-1">
                         <label className="premium-label">CONTA</label>
                         <input type="text" value={brand.bankAccount || ''} onChange={e => onUpdate({ bankAccount: e.target.value })} className="premium-input" placeholder="12345-6" />
                      </div>
                   </div>
                </div>
             </div>

            {/* SEÇÃO UNIFICADA DE MENSAGENS */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] border-b border-white/5 pb-2">MENSAGEM DE PAGAMENTO (WHATSAPP)</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Selecione o tipo de mensagem a ser enviada quando o cliente iniciar um pagamento manual.</p>
              <div className="flex p-1 bg-zinc-950 rounded-lg border border-white/10 w-full">
                  <button 
                    onClick={() => onUpdate({ paymentMessageType: 'instructions' })}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${brand.paymentMessageType !== 'confirmation' ? 'bg-gold-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                  >
                    ENVIAR INSTRUÇÕES
                  </button>
                  <button 
                    onClick={() => onUpdate({ paymentMessageType: 'confirmation' })}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${brand.paymentMessageType === 'confirmation' ? 'bg-gold-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                  >
                    PEDIR CONFIRMAÇÃO
                  </button>
              </div>

              {/* Instruções de Pagamento Manual */}
              <div className={`space-y-2 transition-opacity duration-500 ${brand.paymentMessageType !== 'confirmation' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                 <label className="premium-label">TEXTO COM INSTRUÇÕES:</label>
                 <textarea 
                    value={brand.manualPaymentInstructions || ''} 
                    onChange={e => onUpdate({ manualPaymentInstructions: e.target.value })} 
                    className="premium-input min-h-[100px] bg-zinc-950/50 p-3 rounded-lg text-zinc-400 text-xs font-mono outline-none border border-white/5 focus:border-gold-500/30" 
                    placeholder="Ex: Para pagamentos via PIX ou TED, siga os dados acima e envie o comprovante para nosso WhatsApp para liberação imediata."
                 />
                 <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Este texto é enviado ao cliente junto com os dados de PIX/Banco.</p>
              </div>

              {/* Mensagem de Confirmação de Pagamento */}
              <div className={`space-y-2 transition-opacity duration-500 ${brand.paymentMessageType === 'confirmation' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                 <label className="premium-label">MODELO PARA O CLIENTE CONFIRMAR:</label>
                 <textarea 
                    value={brand.paymentConfirmationMessageTemplate || ''} 
                    onChange={e => onUpdate({ paymentConfirmationMessageTemplate: e.target.value })} 
                    className="premium-input min-h-[100px] bg-zinc-950/50 p-3 rounded-lg text-zinc-400 text-xs font-mono outline-none border border-white/5 focus:border-gold-500/30" 
                    placeholder="Olá! Confirmo meu pagamento de {valor} para o item {item_comprado}. Meu nome é {cliente}."
                 />
                 <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">VARIÁVEIS: {'{cliente}'}, {'{valor}'}, {'{item_comprado}'}</p>
              </div>
            </div>

          </div>

          {/* Coluna 2: APIs */}
          <div className="space-y-8">
             <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-gold-500 text-[10px] font-black uppercase tracking-[0.3em]">GATEWAYS ATIVOS</h3>
                <span className="text-[9px] text-zinc-600 font-black">{brand.paymentApis.length} ATIVOS</span>
             </div>

             <div className="space-y-4">
                {brand.paymentApis.map(api => (
                   <div key={api.id} className="bg-zinc-900/30 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                         <input type="text" value={api.name} onChange={e => handleUpdateApi(api.id, { name: e.target.value })} className="bg-transparent text-white font-bold text-xs uppercase outline-none" placeholder="NOME API" />
                         <button onClick={() => handleDeleteApi(api.id)} className="text-zinc-600 hover:text-red-500"><i className="fas fa-trash"></i></button>
                      </div>
                      <input type="text" value={api.url} onChange={e => handleUpdateApi(api.id, { url: e.target.value })} className="bg-black/30 w-full p-2 rounded text-[10px] text-zinc-400 font-mono outline-none" placeholder="https://..." />
                   </div>
                ))}
             </div>

             <div className="bg-zinc-900/50 p-6 rounded-xl border border-dashed border-white/10">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-4">ADICIONAR GATEWAY</p>
                <div className="space-y-4">
                   <input type="text" value={newApi.name} onChange={e => setNewApi({ ...newApi, name: e.target.value })} className="premium-input" placeholder="NOME (Ex: Stripe)" />
                   <input type="url" value={newApi.url} onChange={e => setNewApi({ ...newApi, url: e.target.value })} className="premium-input" placeholder="URL CHECKOUT" />
                   <button onClick={handleAddApi} className="w-full jewel-button active mt-2">CONECTAR API</button>
                </div>
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

export default PaymentConfigEditor;
