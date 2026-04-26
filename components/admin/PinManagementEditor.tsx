
import React, { useState, useEffect } from 'react';
import { MASTER_PIN_VALUE, DEFAULT_CONFIG } from '../../constants';
import * as api from '../../api';

interface PinManagementEditorProps {
  activeAdminPin: string | null;
  onNewPinCreated: (oldPin: string, newPin: string) => void;
  onResetCurrentPinData: () => void; 
  onClose: () => void;
  siteUrl?: string; 
}

const PinManagementEditor: React.FC<PinManagementEditorProps> = ({
  activeAdminPin,
  onNewPinCreated,
  onResetCurrentPinData, 
  onClose,
  siteUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('manage');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientSlug, setClientSlug] = useState('');
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain');
  const [customDomain, setCustomDomain] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [licenses, setLicenses] = useState<{pin: string, brandName: string, siteUrl: string}[]>([]);
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(false);

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    setIsLoadingLicenses(true);
    const data = await api.listAllConfigs();
    setLicenses(data);
    setIsLoadingLicenses(false);
  };

  useEffect(() => {
    if (!clientSlug || clientSlug === '') {
        const slug = clientName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        setClientSlug(slug);
    }
  }, [clientName]);

  const getBaseDomain = () => {
    const host = window.location.host;
    if (host.includes('localhost') || host.includes('127.0.0.1')) return 'plataformadigital.com';
    return host;
  };

  const domainPreview = domainType === 'subdomain' 
    ? (clientSlug ? `${clientSlug}.${getBaseDomain()}` : `projeto.${getBaseDomain()}`)
    : (customDomain || 'www.seudominio.com.br');

  const handleCreate = async () => {
    if (newPinInput.length !== 4) return alert('O PIN DEVE TER EXATAMENTE 4 DÍGITOS.');
    if (newPinInput === MASTER_PIN_VALUE) return alert('ESTE PIN JÁ É UTILIZADO PELO SISTEMA.');
    if (newPinInput !== confirmNewPinInput) return alert('OS PINS DIGITADOS NÃO CONFEREM.');
    if (!clientName) return alert('POR FAVOR, INSIRA O NOME DO PROJETO.');
    
    setIsGenerating(true);
    try {
      const finalUrl = domainType === 'subdomain' ? domainPreview : customDomain;
      const customConfig = {
        ...DEFAULT_CONFIG,
        adminPin: newPinInput, // CRÍTICO: Define o PIN do cliente na config
        brand: {
          ...DEFAULT_CONFIG.brand,
          brandName: clientName.toUpperCase(),
          siteUrl: finalUrl,
          pageTitle: `${clientName.toUpperCase()} | Site Oficial`
        }
      };

      await api.saveConfig(newPinInput, customConfig);
      
      const currentOrigin = window.location.origin + window.location.pathname;
      const base = currentOrigin.endsWith('/') ? currentOrigin.slice(0, -1) : currentOrigin;
      const accessUrl = `${base}?pin=${newPinInput}`;
      
      setGeneratedLink(accessUrl);
      loadLicenses();
    } catch (err) {
      alert('ERRO AO CRIAR INSTÂNCIA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteLicense = async (pin: string) => {
    if (confirm(`DESEJA REALMENTE REVOGAR A LICENÇA PIN ${pin}? TODOS OS DADOS SERÃO APAGADOS.`)) {
       try {
         await api.resetConfig(pin);
         alert('LICENÇA REVOGADA COM SUCESSO.');
         loadLicenses();
       } catch (err) {
         alert('ERRO AO REVOGAR.');
       }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('COPIADO!');
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedLink)}&color=f59e0b&bgcolor=000000`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 shadow-[0_0_100px_rgba(245,158,11,0.15)] relative border-gold-500/30 my-auto">
        
        {/* Cabeçalho Fixo com Fundo Sólido para evitar overlap visual na rolagem */}
        <div className="flex justify-between items-center p-8 md:p-10 sticky top-0 z-50 bg-[#0a0a0a] border-b border-gold-500/10 rounded-t-[2.5rem]">
          <div>
            <h2 className="text-3xl text-white font-cinzel font-black uppercase tracking-[0.15em] leading-none">LICENCIAMENTO:</h2>
            <span className="text-[10px] text-gold-500 font-black uppercase tracking-[0.4em] mt-2 block">GESTÃO DE ACESSOS PLATINUM</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-all border border-white/10">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8 md:p-10 pt-4">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
             <button 
               onClick={() => setActiveTab('manage')} 
               className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${activeTab === 'manage' ? 'bg-gold-500 text-black border-gold-400' : 'bg-zinc-900/50 text-zinc-500 border-white/5 hover:border-white/20'}`}
             >
               LICENÇAS ATIVAS
             </button>
             <button 
               onClick={() => setActiveTab('create')} 
               className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${activeTab === 'create' ? 'bg-gold-500 text-black border-gold-400' : 'bg-zinc-900/50 text-zinc-500 border-white/5 hover:border-white/20'}`}
             >
               GERAR NOVA LICENÇA
             </button>
          </div>

          {activeTab === 'manage' ? (
            <div className="space-y-4 animate-fadeIn">
               {isLoadingLicenses ? (
                 <div className="py-20 text-center text-gold-500 animate-pulse font-black text-xs uppercase">CARREGANDO BANCO DE DADOS...</div>
               ) : licenses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {licenses.map(lic => (
                       <div key={lic.pin} className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5 flex flex-col gap-4 group hover:border-gold-500/30 transition-all">
                          <div className="flex justify-between items-start">
                             <div>
                                <p className="text-white font-black text-xs uppercase tracking-widest mb-1">{lic.brandName || 'SEM NOME'}</p>
                                <div className="flex items-center gap-2 text-gold-500 font-mono text-[10px] uppercase">
                                   <i className="fas fa-key text-[8px]"></i> PIN: {lic.pin}
                                </div>
                             </div>
                             <button onClick={() => handleDeleteLicense(lic.pin)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                                <i className="fas fa-trash-alt text-xs"></i>
                             </button>
                          </div>
                          <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                             <div className="flex items-center justify-between">
                                <span className="text-[9px] text-zinc-600 font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">{lic.siteUrl || 'SEM DOMÍNIO'}</span>
                                <button onClick={() => {
                                  const base = window.location.origin + window.location.pathname;
                                  copyToClipboard(`${base}?pin=${lic.pin}`);
                                }} className="text-[8px] font-black text-zinc-500 hover:text-gold-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded transition-all">LINK DE ACESSO</button>
                             </div>
                             {lic.siteUrl && (
                               <div className="text-[8px] text-gold-500/50 font-mono flex items-center gap-1">
                                 <i className="fas fa-link text-[7px]"></i> {lic.siteUrl}
                               </div>
                             )}
                          </div>
                       </div>
                     ))}
                  </div>
               ) : (
                 <div className="py-20 text-center text-zinc-600 font-black text-xs uppercase tracking-widest italic">NENHUMA LICENÇA ATIVA ENCONTRADA.</div>
               )}
            </div>
          ) : generatedLink ? (
            <div className="space-y-8 animate-fadeIn relative z-10">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gold-500/20 blur-2xl transition-all rounded-full"></div>
                  <div className="relative bg-black p-4 rounded-3xl border border-gold-500/50 shadow-2xl">
                     <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 md:w-40 md:h-40 object-contain" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-[0.2em]">SISTEMA ATIVADO PARA: {clientName}</p>
                  <p className="text-gold-500 text-[10px] font-mono uppercase tracking-widest mt-1 flex items-center justify-center gap-2">
                     <i className="fas fa-globe"></i> {domainPreview}
                  </p>
                </div>
              </div>

              <div className="bg-black/60 p-5 rounded-2xl border border-white/5 relative group">
                <label className="text-[9px] text-zinc-600 font-black uppercase tracking-widest block mb-2">LINK DE GESTÃO DO CLIENTE:</label>
                <code className="text-gold-500 text-[11px] font-mono break-all block pr-10">{generatedLink}</code>
                <button onClick={() => copyToClipboard(generatedLink)} className="absolute right-4 bottom-5 text-zinc-600 hover:text-gold-500 transition-colors" title="Copiar Link">
                  <i className="fas fa-copy text-lg"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                <button onClick={() => {
                  const msg = `🌟 *SISTEMA PLATINUM ATIVADO*\n\nOlá *${clientName}*,\n\nSeu site oficial já está pronto!\n\n🌍 *Domínio:* ${domainPreview}\n🔑 *Painel de Gestão:* ${generatedLink}\n\n*Atenção:* Use seu PIN de 4 dígitos para logar.`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }} className="flex items-center justify-center gap-3 py-4 bg-green-600/10 border border-green-500/30 text-green-500 rounded-2xl font-black text-[10px] uppercase hover:bg-green-600 hover:text-white transition-all">
                  <i className="fab fa-whatsapp text-lg"></i> ENVIAR ACESSO
                </button>
                
                <button onClick={() => { setGeneratedLink(''); setNewPinInput(''); setConfirmNewPinInput(''); setClientName(''); setClientSlug(''); }} className="flex items-center justify-center gap-3 py-4 bg-zinc-800 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-zinc-700 transition-all">
                  <i className="fas fa-plus"></i> NOVA LICENÇA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 relative z-10 animate-fadeIn">
              <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl space-y-6">
                  <div>
                     <label className="premium-label">NOME DA EMPRESA OU PROJETO:</label>
                     <input 
                        type="text" 
                        value={clientName} 
                        onChange={e => setClientName(e.target.value)}
                        className="premium-input !text-xl font-cinzel text-white" 
                        placeholder="EX: NOME DO SEU NEGÓCIO" 
                        autoComplete="off"
                     />
                  </div>

                  <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                     <button onClick={() => setDomainType('subdomain')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${domainType === 'subdomain' ? 'bg-gold-500 text-black shadow-lg' : 'text-zinc-600'}`}>SUBDOMÍNIO</button>
                     <button onClick={() => setDomainType('custom')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${domainType === 'custom' ? 'bg-gold-500 text-black shadow-lg' : 'text-zinc-600'}`}>DOMÍNIO REAL</button>
                  </div>

                  {domainType === 'subdomain' ? (
                     <div>
                        <label className="premium-label">IDENTIFICADOR DA URL (SLUG):</label>
                        <div className="flex items-center bg-black/40 rounded-xl border border-white/10 px-4 py-3">
                           <input 
                              type="text" 
                              value={clientSlug} 
                              onChange={e => setClientSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                              className="bg-transparent flex-1 text-gold-500 font-mono text-sm outline-none" 
                              placeholder="meu-negocio" 
                              autoComplete="off"
                           />
                           <span className="text-zinc-600 text-[10px] font-bold">.{getBaseDomain()}</span>
                        </div>
                     </div>
                  ) : (
                     <div>
                        <label className="premium-label">ENDEREÇO DO DOMÍNIO REAL:</label>
                        <div className="flex items-center bg-black/40 rounded-xl border border-gold-500/30 px-4 py-3">
                           <input 
                              type="text" 
                              value={customDomain} 
                              onChange={e => setCustomDomain(e.target.value.toLowerCase().trim())}
                              className="bg-transparent flex-1 text-gold-500 font-mono text-sm outline-none" 
                              placeholder="www.meudominio.com.br" 
                              autoComplete="off"
                           />
                           <i className="fas fa-globe text-gold-500/50"></i>
                        </div>
                     </div>
                  )}

                  <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="premium-label">DEFINIR PIN DE ACESSO:</label>
                      <input 
                        type="password" maxLength={4} 
                        value={newPinInput} onChange={e => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-black/40 border-b-2 border-white/10 focus:border-gold-500 text-center text-2xl py-3 font-cinzel text-gold-500 outline-none transition-all rounded-t-xl" 
                        placeholder="0000" 
                      />
                    </div>
                    <div>
                      <label className="premium-label">CONFIRMAR PIN:</label>
                      <input 
                        type="password" maxLength={4} 
                        value={confirmNewPinInput} onChange={e => setConfirmNewPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-black/40 border-b-2 border-white/10 focus:border-gold-500 text-center text-2xl py-3 font-cinzel text-gold-500 outline-none transition-all rounded-t-xl" 
                        placeholder="0000" 
                      />
                    </div>
                  </div>
              </div>

              <button 
                onClick={handleCreate} 
                disabled={isGenerating || newPinInput.length !== 4 || !clientName}
                className="w-full jewel-button active !rounded-2xl !py-6 group disabled:opacity-30 disabled:grayscale mb-4"
              >
                 <span className="flex items-center justify-center gap-3">
                   <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} text-xl`}></i>
                   {isGenerating ? 'PROCESSANDO...' : 'ATIVAR NOVA LICENÇA'}
                 </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinManagementEditor;
