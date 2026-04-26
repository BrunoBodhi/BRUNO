
import React, { useState } from 'react';
import { BrandConfig } from '../../types';
import AIMediaStudio from './AIMediaStudio';

interface GlobalSettingsEditorProps {
  brand: BrandConfig;
  onUpdate: (updates: Partial<BrandConfig>) => void;
  onClose: () => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

const GlobalSettingsEditor: React.FC<GlobalSettingsEditorProps> = ({
  brand,
  onUpdate,
  onClose,
  onLogoUpload,
  isUploading,
}) => {
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);

  const normalizeUrl = (url: string) => {
    if (!url) return '';
    let clean = url.trim();
    if (!/^https?:\/\//i.test(clean)) clean = 'https://' + clean;
    return clean;
  };
  
  const handleAILogoSelected = (imageBase64: string) => {
    onUpdate({ logoUrl: imageBase64 });
    setIsAIStudioOpen(false);
  };

  const handleDownloadLogo = () => {
    if (!brand.logoUrl) return;
    const link = document.createElement('a');
    link.href = brand.logoUrl;
    link.download = 'logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <AIMediaStudio
        isOpen={isAIStudioOpen}
        onClose={() => setIsAIStudioOpen(false)}
        onSelect={handleAILogoSelected}
        targetLabel="Logotipo da Marca"
        aspectRatio="1:1"
        imageType="logo"
      />
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
          
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">AJUSTES GLOBAIS</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">IDENTIDADE & ESTILO</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:gap-24">
            
            <div className="space-y-8">
              <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">IDENTIDADE:</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="premium-label">NOME DA MARCA:</label>
                  <input type="text" value={brand.brandName || ''} onChange={e => onUpdate({ brandName: e.target.value })} className="premium-input" placeholder="Ex: NOME DA EMPRESA" autoComplete="off" />
                </div>
                
                <div>
                  <label className="premium-label">TÍTULO DA PÁGINA (SEO):</label>
                  <input type="text" value={brand.pageTitle || ''} onChange={e => onUpdate({ pageTitle: e.target.value })} className="premium-input" placeholder="Ex: Minha Marca | Serviços Premium" autoComplete="off" />
                </div>

                <div>
                  <label className="premium-label">DOMÍNIO (HOSTINGER):</label>
                  <input 
                    type="text" 
                    value={brand.siteUrl || ''} 
                    onChange={e => onUpdate({ siteUrl: e.target.value })} 
                    onBlur={e => onUpdate({ siteUrl: normalizeUrl(e.target.value) })}
                    className="premium-input" 
                    placeholder="meusite.com.br" 
                    autoComplete="off"
                  />
                </div>

                <div className="pt-4 space-y-4">
                   <label className="premium-label">LOGOTIPO DA MARCA:</label>
                   
                   {/* Seletor de Estilo */}
                   <div className="flex p-1 bg-zinc-900 rounded-lg border border-white/10 w-full mb-2">
                       <button 
                         onClick={() => onUpdate({ logoStyle: 'mask' })} 
                         className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${brand.logoStyle === 'mask' ? 'bg-gold-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                       >
                         ADAPTÁVEL (MÁSCARA)
                       </button>
                       <button 
                         onClick={() => onUpdate({ logoStyle: 'original' })} 
                         className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${brand.logoStyle === 'original' ? 'bg-gold-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                       >
                         ORIGINAL (COLORIDO)
                       </button>
                   </div>

                   <div className="flex items-center gap-6">
                      {/* AUMENTADO: w-32 h-32 (era w-24 h-24) */}
                      <div className="w-32 h-32 bg-zinc-900 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                        {brand.logoUrl && brand.logoUrl.trim() !== '' ? (
                           // Mostra preview baseado no estilo selecionado
                           brand.logoStyle === 'mask' ? (
                             <div 
                                className="w-full h-full dynamic-logo-mask"
                                style={{ '--logo-url': `url(${brand.logoUrl})` } as React.CSSProperties}
                             ></div>
                           ) : (
                             <img src={brand.logoUrl} className="w-full h-full object-contain" />
                           )
                        ) : (
                          <i className="fas fa-image text-zinc-800 text-3xl"></i>
                        )}
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none"></div>
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <label className="jewel-button !py-3 !px-4 cursor-pointer text-center w-full">
                          {isUploading ? (
                             <span className="animate-pulse">
                               <i className="fas fa-spinner fa-spin mr-2"></i> PROCESSANDO...
                             </span>
                          ) : (
                            <>
                              ENVIAR ARQUIVO
                              <input type="file" onChange={onLogoUpload} className="hidden" accept="image/*" />
                            </>
                          )}
                        </label>
                        <button onClick={() => setIsAIStudioOpen(true)} className="jewel-button active !py-3 !px-4 w-full">
                          <i className="fas fa-wand-magic-sparkles mr-2"></i> GERAR NOVO LOGO
                        </button>
                        <button 
                          onClick={handleDownloadLogo} 
                          disabled={!brand.logoUrl}
                          className="jewel-button !py-3 !px-4 w-full disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <i className="fas fa-download mr-2"></i> BAIXAR LOGO
                        </button>
                      </div>
                   </div>
                   <p className="text-[9px] text-zinc-500 mt-1 font-mono leading-tight">
                     {brand.logoStyle === 'mask' 
                       ? "MODO MÁSCARA: O logo assume a cor primária do site automaticamente. Ideal para ícones com fundo preto/transparente."
                       : "MODO ORIGINAL: A imagem é exibida exatamente como enviada (colorida/3D). Ideal para mascotes ou logos complexos."}
                   </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-right">
            <button onClick={onClose} className="jewel-button active px-12">
              CONCLUIR
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalSettingsEditor;
