
import React, { useState, useEffect } from 'react';
import { BrandConfig, CtaActionType } from '../../types';
import AIContentModal from './AIContentModal';
import AIMediaStudio from './AIMediaStudio';
import IconPicker from '../IconPicker';

interface HeroSectionEditorProps {
  homeHero: BrandConfig['homeHero'];
  onUpdate: (updates: Partial<BrandConfig['homeHero']>) => void;
  onClose: () => void;
  onHomeHeroImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHomeHeroVideoLocalUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHomeHeroVideoPermanentUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localVideoPreviewUrl: string | null;
  onClearLocalVideoPreview: () => void;
  isUploading: boolean;
}

type AITargetField = 'title' | 'subtitle' | 'description';

const HeroSectionEditor: React.FC<HeroSectionEditorProps> = ({
  homeHero,
  onUpdate,
  onClose,
  onHomeHeroImageUpload,
  onHomeHeroVideoLocalUpload,
  onHomeHeroVideoPermanentUpload,
  localVideoPreviewUrl,
  onClearLocalVideoPreview,
  isUploading,
}) => {
  const [externalVideoUrlInput, setExternalVideoUrlInput] = useState(homeHero.heroVideoUrl || '');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [aiTarget, setAITarget] = useState<{ field: AITargetField, label: string } | null>(null);

  useEffect(() => {
    setExternalVideoUrlInput(homeHero.heroVideoUrl || '');
  }, [homeHero.heroVideoUrl]);
  
  const handleOpenAIModal = (field: AITargetField, label: string) => {
    setAITarget({ field, label });
    setIsAIModalOpen(true);
  };

  const handleGeneratedText = (text: string) => {
    if (aiTarget) {
      onUpdate({ [aiTarget.field]: text });
    }
    setIsAIModalOpen(false);
    setAITarget(null);
  };
  
  const handleAIImageSelected = (imageBase64: string) => {
    onUpdate({ image: imageBase64 });
    setIsAIStudioOpen(false);
  };

  const videoPreviewSource = localVideoPreviewUrl || externalVideoUrlInput || '';

  return (
    <>
      {isAIModalOpen && aiTarget && (
          <AIContentModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            onGenerate={handleGeneratedText}
            targetFieldLabel={aiTarget.label}
          />
      )}
      <AIMediaStudio
        isOpen={isAIStudioOpen}
        onClose={() => setIsAIStudioOpen(false)}
        onSelect={handleAIImageSelected}
        targetLabel="Imagem de Fundo da Capa"
        aspectRatio="16:9"
        imageType="background"
      />
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="glass-panel w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">SEÇÃO CAPA</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">CAPA & DESTAQUE</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 space-y-8">
              <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">CONTEÚDO:</h3>
              
              <div className="relative">
                 <label className="premium-label">TÍTULO PRINCIPAL:</label>
                 <textarea 
                    value={homeHero.title || ''} 
                    onChange={e => onUpdate({ title: e.target.value })} 
                    className="premium-input min-h-[100px] text-xl font-cinzel leading-tight pr-10" 
                    placeholder="DIGITE O TÍTULO DE IMPACTO..."
                    autoComplete="off"
                    spellCheck="false"
                 ></textarea>
                 <button onClick={() => handleOpenAIModal('title', 'Título Principal')} className="absolute top-8 right-2 text-zinc-600 hover:text-gold-500 transition-colors" title="Gerar com IA"><i className="fas fa-wand-magic-sparkles"></i></button>
              </div>

              <div className="relative">
                 <label className="premium-label">SUBTÍTULO:</label>
                 <input type="text" value={homeHero.subtitle || ''} onChange={e => onUpdate({ subtitle: e.target.value })} className="premium-input pr-10" placeholder="Ex: Experiência única em cada detalhe:" autoComplete="off" spellCheck="false" />
                 <button onClick={() => handleOpenAIModal('subtitle', 'Subtítulo')} className="absolute top-8 right-2 text-zinc-600 hover:text-gold-500 transition-colors" title="Gerar com IA"><i className="fas fa-wand-magic-sparkles"></i></button>
              </div>

              <div className="relative">
                 <label className="premium-label">DESCRIÇÃO:</label>
                 <textarea value={homeHero.description || ''} onChange={e => onUpdate({ description: e.target.value })} className="premium-input min-h-[80px] pr-10" placeholder="Escreva o texto de apoio aqui..." autoComplete="off" spellCheck="false"></textarea>
                 <button onClick={() => handleOpenAIModal('description', 'Descrição')} className="absolute top-8 right-2 text-zinc-600 hover:text-gold-500 transition-colors" title="Gerar com IA"><i className="fas fa-wand-magic-sparkles"></i></button>
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="premium-label mb-4">BOTÃO DE AÇÃO (CTA):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                      <label className="text-[9px] text-zinc-600 font-bold uppercase block mb-1">TEXTO:</label>
                      <input type="text" value={homeHero.ctaText || ''} onChange={e => onUpdate({ ctaText: e.target.value })} className="premium-input" placeholder="Ex: AGENDAR" />
                   </div>
                   <div>
                      <label className="text-[9px] text-zinc-600 font-bold uppercase block mb-1">AÇÃO:</label>
                      <select value={homeHero.ctaAction} onChange={e => onUpdate({ ctaAction: e.target.value as CtaActionType })} className="premium-input bg-zinc-900">
                          <option value="whatsapp">WhatsApp</option>
                          <option value="telegram">Telegram</option>
                          <option value="booking">Agendamento</option>
                          <option value="payment">Pagamento</option>
                          <option value="external_link">Link Externo</option>
                          <option value="scroll_to_products">Nossos Planos</option>
                          <option value="scroll_to_gallery">Galeria</option>
                          <option value="none">Nenhum</option>
                      </select>
                   </div>
                </div>
                {homeHero.ctaAction === 'external_link' && (
                  <div className="mt-4">
                     <label className="premium-label">URL DO LINK:</label>
                     <input type="url" value={homeHero.ctaLink || ''} onChange={e => onUpdate({ ctaLink: e.target.value })} className="premium-input" placeholder="https://exemplo.com" autoComplete="off" />
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-white/5 space-y-4">
                <label className="premium-label mb-2">ELEMENTOS DA CAPA:</label>
                <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                  <span className="text-xs font-black uppercase text-zinc-400">EXIBIR INDICADOR DE ROLAGEM</span>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={homeHero.showScrollIndicator !== false} 
                        onChange={e => onUpdate({ showScrollIndicator: e.target.checked })} 
                        className="sr-only peer" 
                      />
                      <div className="w-10 h-5 bg-zinc-700 rounded-full peer-checked:bg-gold-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </div>
                  </label>
                </div>
                {homeHero.showScrollIndicator !== false && (
                    <div className="space-y-4 bg-zinc-900/30 p-4 rounded-xl border border-white/5">
                        <div>
                            <label className="premium-label">TEXTO DO INDICADOR:</label>
                            <input
                                type="text"
                                value={homeHero.scrollIndicatorText || ''}
                                onChange={e => onUpdate({ scrollIndicatorText: e.target.value })}
                                className="premium-input"
                                placeholder="DEIXE VAZIO PARA MOSTRAR SÓ O ÍCONE"
                            />
                        </div>
                        <div>
                            <label className="premium-label">ÍCONE DO INDICADOR:</label>
                            <IconPicker 
                                currentIcon={homeHero.scrollIndicatorIcon || 'fas fa-chevron-down'} 
                                onSelect={(icon) => onUpdate({ scrollIndicatorIcon: icon })} 
                            />
                        </div>
                    </div>
                )}
              </div>

            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-6">
                 <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em]">MÍDIA DE FUNDO:</h3>
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" checked={homeHero.heroBackgroundType === 'image'} onChange={() => { onUpdate({ heroBackgroundType: 'image' }); onClearLocalVideoPreview(); }} className="accent-gold-500" />
                       <span className="text-[10px] font-black uppercase text-zinc-400">IMAGEM</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" checked={homeHero.heroBackgroundType === 'video'} onChange={() => onUpdate({ heroBackgroundType: 'video' })} className="accent-gold-500" />
                       <span className="text-[10px] font-black uppercase text-zinc-400">VÍDEO</span>
                    </label>
                 </div>
              </div>

              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
                 {homeHero.heroBackgroundType === 'image' ? (
                    <div className="space-y-4">
                       <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative group">
                          <img src={homeHero.image} className="w-full h-full object-cover opacity-60" style={{objectPosition: homeHero.heroBackgroundPosition}} />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 gap-2">
                             {isUploading ? (
                               <div className="text-gold-500 font-black text-[10px] uppercase animate-pulse">
                                 <i className="fas fa-spinner fa-spin mr-2"></i> PROCESSANDO...
                               </div>
                             ) : (
                               <>
                                 <label className="jewel-button cursor-pointer !py-3 !px-6">
                                    <i className="fas fa-upload mr-2"></i> UPLOAD
                                    <input type="file" onChange={onHomeHeroImageUpload} className="hidden" accept="image/*" />
                                 </label>
                                 <button onClick={() => setIsAIStudioOpen(true)} className="jewel-button active !py-3 !px-6">
                                    <i className="fas fa-wand-magic-sparkles mr-2"></i> CRIAR COM IA
                                 </button>
                               </>
                             )}
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 relative">
                          {videoPreviewSource ? (
                             <video src={videoPreviewSource} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60" style={{objectPosition: homeHero.heroBackgroundPosition}} />
                          ) : (
                             <div className="flex items-center justify-center h-full text-zinc-600 text-xs font-black uppercase">SEM VÍDEO SELECIONADO</div>
                          )}
                          <div className="absolute bottom-4 right-4 flex gap-2">
                             {isUploading ? (
                               <div className="bg-black/80 backdrop-blur px-4 py-2 rounded border border-gold-500/30 text-gold-500 font-black text-[10px] uppercase animate-pulse">
                                 <i className="fas fa-spinner fa-spin mr-2"></i> ENVIANDO...
                               </div>
                             ) : (
                               <>
                                 <label className="jewel-button !py-2 !px-4 cursor-pointer bg-black/80 backdrop-blur">
                                    PRÉVIA LOCAL
                                    <input type="file" onChange={onHomeHeroVideoLocalUpload} className="hidden" accept="video/*" />
                                 </label>
                                 <label className="jewel-button active !py-2 !px-4 cursor-pointer bg-gold-500 text-black">
                                    <i className="fas fa-cloud-upload-alt mr-2"></i> SALVAR VÍDEO
                                    <input type="file" onChange={onHomeHeroVideoPermanentUpload} className="hidden" accept="video/*" />
                                 </label>
                               </>
                             )}
                          </div>
                       </div>

                       <div className="bg-gold-900/10 border border-gold-500/20 p-4 rounded-xl">
                          <p className="text-[9px] text-gold-500 font-black uppercase leading-relaxed">
                            <i className="fas fa-info-circle mr-2"></i> 
                            O banco de dados suporta vídeos de até 1MB. Para vídeos maiores ou em alta resolução, 
                            é obrigatório utilizar um link direto (URL) hospedado em um serviço externo.
                          </p>
                       </div>

                       <div>
                          <label className="premium-label">URL VÍDEO (LINK DIRETO):</label>
                          <input 
                             type="url" 
                             value={externalVideoUrlInput} 
                             onChange={e => setExternalVideoUrlInput(e.target.value)}
                             onBlur={e => onUpdate({ heroVideoUrl: e.target.value })}
                             className="premium-input" 
                             placeholder="https://exemplo.com/video.mp4" 
                          />
                       </div>
                    </div>
                 )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="premium-label">POSIÇÃO DO FUNDO:</label>
                    <select value={homeHero.heroBackgroundPosition} onChange={e => onUpdate({ heroBackgroundPosition: e.target.value as any })} className="premium-input bg-zinc-900">
                       <option value="top">Topo</option>
                       <option value="center">Centro</option>
                       <option value="bottom">Base</option>
                    </select>
                 </div>
                 <div>
                    <label className="premium-label">OPACIDADE DA CAMADA: ({homeHero.overlayOpacity})</label>
                    <input type="range" min="0" max="1" step="0.1" value={homeHero.overlayOpacity} onChange={e => onUpdate({ overlayOpacity: parseFloat(e.target.value) })} className="w-full mt-3 accent-gold-500" />
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-right">
            <button onClick={onClose} className="jewel-button active px-12">CONCLUIR</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSectionEditor;