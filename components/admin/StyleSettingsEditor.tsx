
import React, { useState } from 'react';
import { BrandConfig } from '../../types';
import AIMediaStudio from './AIMediaStudio';
import { compressImage } from '../../utils/mediaUtils';

interface StyleSettingsEditorProps {
  brand: BrandConfig;
  onUpdate: (updates: Partial<BrandConfig>) => void;
  onClose: () => void;
}

const StyleSettingsEditor: React.FC<StyleSettingsEditorProps> = ({
  brand,
  onUpdate,
  onClose,
}) => {
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await compressImage(file);
        onUpdate({ globalSectionBackgroundImage: result });
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
    onUpdate({ globalSectionBackgroundImage: imageBase64 });
    setIsAIStudioOpen(false);
  };

  const ColorControl = ({ label, value, onChange }: { label: string, value?: string, onChange: (color: string | undefined) => void }) => (
    <div>
      <label className="premium-label">{label}</label>
      <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-white/5">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded-full border-none p-0 cursor-pointer bg-transparent" />
        <span className="text-[10px] text-zinc-400 font-mono uppercase">{value || 'PADRÃO'}</span>
        {value && (
          <button onClick={() => onChange(undefined)} className="ml-auto text-zinc-600 hover:text-red-500 text-[8px] uppercase font-black tracking-widest">REDEFINIR</button>
        )}
      </div>
      {!value && <p className="text-[9px] text-zinc-600 mt-1">Usará o padrão do tema (geralmente gradiente dourado).</p>}
    </div>
  );

  return (
    <>
    <AIMediaStudio
        isOpen={isAIStudioOpen}
        onClose={() => setIsAIStudioOpen(false)}
        onSelect={handleAIImageSelected}
        targetLabel="Fundo das Seções"
        aspectRatio="16:9"
        imageType="background"
      />
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">AJUSTES DE ESTILO</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">CORES DO TEMA & ELEMENTOS VISUAIS</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="space-y-8">
          {/* Fundo Global das Seções */}
          <div className="space-y-6">
            <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">FUNDO DAS SEÇÕES:</h3>
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 space-y-4">
              <div>
                <label className="premium-label">COR DE FUNDO GLOBAL:</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                  <input
                    type="color"
                    value={brand.globalSectionBackgroundColor || '#000000'}
                    onChange={e => onUpdate({ globalSectionBackgroundColor: e.target.value })}
                    className="w-8 h-8 rounded-full border-none p-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">{brand.globalSectionBackgroundColor || 'PADRÃO'}</span>
                  {brand.globalSectionBackgroundColor && (
                     <button onClick={() => onUpdate({globalSectionBackgroundColor: undefined})} className="ml-auto text-zinc-600 hover:text-red-500 text-[8px] uppercase font-black tracking-widest">REDEFINIR</button>
                  )}
                </div>
              </div>
              <div>
                <label className="premium-label">IMAGEM DE FUNDO GLOBAL:</label>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-12 bg-zinc-900 rounded border border-white/10 overflow-hidden flex items-center justify-center">
                    {brand.globalSectionBackgroundImage ? (
                      <img src={brand.globalSectionBackgroundImage} className="w-full h-full object-cover opacity-70" />
                    ) : (
                      <span className="text-[8px] text-zinc-600">SEM IMG</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="jewel-button !py-1 !px-2 w-full cursor-pointer text-[9px] text-center">
                      {isUploading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <>
                          UPLOAD
                          <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </>
                      )}
                    </label>
                    <button onClick={() => setIsAIStudioOpen(true)} className="jewel-button active !py-1 !px-2 w-full text-[9px]">
                      <i className="fas fa-wand-magic-sparkles text-xs"></i> GERAR COM IA
                    </button>
                  </div>
                  {brand.globalSectionBackgroundImage && (
                    <button onClick={() => onUpdate({ globalSectionBackgroundImage: '' })} className="text-zinc-600 hover:text-red-500"><i className="fas fa-trash"></i></button>
                  )}
                </div>
              </div>
              {/* NOVO: Controle de Opacidade da Camada de Fundo */}
              <div>
                <label className="premium-label">OPACIDADE DA CAMADA DE FUNDO ({brand.globalSectionOverlayOpacity !== undefined ? brand.globalSectionOverlayOpacity : '0'}):</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05" 
                    value={brand.globalSectionOverlayOpacity !== undefined ? brand.globalSectionOverlayOpacity : 0} 
                    onChange={e => onUpdate({ globalSectionOverlayOpacity: parseFloat(e.target.value) })} 
                    className="w-full mt-3 accent-gold-500" 
                  />
                  {brand.globalSectionOverlayOpacity !== undefined && (
                    <button onClick={() => onUpdate({ globalSectionOverlayOpacity: undefined })} className="text-zinc-600 hover:text-red-500 text-[8px] uppercase font-black tracking-widest">REDEFINIR</button>
                  )}
                </div>
                <p className="text-[9px] text-zinc-600 mt-1">Uma camada escura sutil sobre o fundo para melhorar a legibilidade do texto.</p>
              </div>
            </div>
          </div>

          {/* Seção de Cores de Elementos Específicos */}
          <div className="space-y-6 pt-8 border-t border-white/5">
            <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">CORES DE ELEMENTOS:</h3>
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
              <label className="premium-label mb-2">COR DO BOTÃO PRINCIPAL (CTA):</label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    disabled={brand.homeHero.ctaColor === 'transparent'}
                    value={brand.homeHero.ctaColor === 'transparent' ? '#000000' : (brand.homeHero.ctaColor || '#f59e0b')} 
                    onChange={e => onUpdate({ homeHero: { ...brand.homeHero, ctaColor: e.target.value } })} 
                    className={`w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer ${brand.homeHero.ctaColor === 'transparent' ? 'opacity-20 grayscale' : ''}`} 
                  />
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">
                    {brand.homeHero.ctaColor === 'transparent' ? 'TRANSPARENTE' : (brand.homeHero.ctaColor || '#f59e0b')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onUpdate({ homeHero: { ...brand.homeHero, ctaColor: '#f59e0b' } })} className="flex-1 py-2 text-[9px] bg-zinc-800 text-gold-500 font-black uppercase tracking-widest rounded hover:bg-zinc-700 transition-colors">REDEFINIR</button>
                  <button onClick={() => onUpdate({ homeHero: { ...brand.homeHero, ctaColor: 'transparent' } })} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-colors ${brand.homeHero.ctaColor === 'transparent' ? 'bg-gold-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>TRANSPARENTE</button>
                </div>
              </div>
            </div>
            <ColorControl
              label="COR DO NOME DA MARCA (CABEÇALHO):"
              value={brand.brandNameColor}
              onChange={color => onUpdate({ brandNameColor: color })}
            />
            <ColorControl
              label="COR DO TÍTULO PRINCIPAL (CAPA):"
              value={brand.homeHero.titleColor}
              onChange={color => onUpdate({ homeHero: { ...brand.homeHero, titleColor: color } })}
            />
            <ColorControl
              label="COR DOS ÍCONES:"
              value={brand.featureIconColor}
              onChange={color => onUpdate({ featureIconColor: color })}
            />
          </div>

          {/* Seção de Cores Globais do Tema */}
          <div className="space-y-6 pt-8 border-t border-white/5">
            <h3 className="text-gold-500 text-xs font-black uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">CORES DO TEMA:</h3>
            
            <div className="space-y-4">
              <div>
                <label className="premium-label">COR PRINCIPAL (TEXTOS, BORDAS):</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                   <input type="color" value={brand.primaryColor || '#f59e0b'} onChange={e => onUpdate({ primaryColor: e.target.value })} className="w-8 h-8 rounded-full border-none p-0 cursor-pointer bg-transparent" />
                   <span className="text-[10px] text-zinc-400 font-mono uppercase">{brand.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="premium-label">COR SECUNDÁRIA (TEXTO GERAL):</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                   <input type="color" value={brand.secondaryColor || '#94a3b8'} onChange={e => onUpdate({ secondaryColor: e.target.value })} className="w-8 h-8 rounded-full border-none p-0 cursor-pointer bg-transparent" />
                   <span className="text-[10px] text-zinc-400 font-mono uppercase">{brand.secondaryColor}</span>
                </div>
              </div>
            </div>
            
            <div>
                <label className="premium-label">COR DE FUNDO DO CABEÇALHO:</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                   <input type="color" value={brand.headerBgColor || '#000000'} onChange={e => onUpdate({ headerBgColor: e.target.value })} className="w-8 h-8 rounded-full border-none p-0 cursor-pointer bg-transparent" />
                   <span className="text-[10px] text-zinc-400 font-mono uppercase">{brand.headerBgColor}</span>
                </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-right">
          <button onClick={onClose} className="jewel-button active px-12">
            CONCLUIR
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default StyleSettingsEditor;
