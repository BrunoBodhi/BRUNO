
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
type ImageType = 'logo' | 'background';

interface AIMediaStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageBase64: string) => void;
  targetLabel: string;
  aspectRatio?: AspectRatio;
  imageType?: ImageType;
}

const API_KEY = process.env.API_KEY;

const AIMediaStudio: React.FC<AIMediaStudioProps> = ({
  isOpen,
  onClose,
  onSelect,
  targetLabel,
  aspectRatio = '16:9',
  imageType = 'background',
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleGenerateClick = async () => {
    if (!prompt || !API_KEY) {
      setError('Por favor, descreva a imagem desejada e verifique a configuração da API Key.');
      return;
    }
    setIsLoading(true);
    setError('');
    setGeneratedImages([]);
    setSelectedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      let fullPrompt: string;

      if (imageType === 'logo') {
        fullPrompt = `Atue como o Designer Gráfico mais premiado do mundo, especialista em marcas de ultra-luxo (High-End Luxury).
        Crie um SÍMBOLO/ÍCONE DE LOGOTIPO 3D COM ACABAMENTO METÁLICO (OURO/PLATINA).
        
        ESTÉTICA VISUAL (PREMIUM & PROFUNDIDADE):
        - Estilo: Minimalismo Sofisticado, Efeito 3D Metálico, Geometria Elegante.
        - COR DO DESENHO: OURO PÁLIDO, PLATINA ou BRANCO PEROLADO. (Cores claras funcionam melhor para máscaras).
        - COR DO FUNDO: PRETO ABSOLUTO (#000000). FUNDO ESCURO UNIFORME.
        - ILUMINAÇÃO: Luz de estúdio dramática, reflexos sutis, alto contraste.
        
        REGRAS TÉCNICAS:
        1. FUNDO PRETO: Essencial para que o sistema remova o fundo automaticamente (se usado como máscara).
        2. SEM TEXTO: Apenas o ícone/símbolo. Não escreva nada.
        3. CENTRALIZADO: O ícone deve ocupar o centro com margem de respiro.
        
        Objeto a ser desenhado: "${prompt}".`;
      } else {
        fullPrompt = `Crie uma imagem profissional e de alta qualidade para um site de luxo. A imagem deve ser fotorrealista, elegante e seguir o tema: "${prompt}".`;
      }
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: {
          imageConfig: { aspectRatio } 
        }
      });

      const images: string[] = [];
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            images.push(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      }

      if (images.length > 0) {
        setGeneratedImages(images);
      } else {
        throw new Error('A IA não retornou imagens. Tente um prompt diferente.');
      }
    } catch (e: any) {
      console.error("Erro na API Gemini (Imagem):", e);
      setError(`Ocorreu um erro ao gerar a imagem. Detalhes: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseImage = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPrompt('');
      setGeneratedImages([]);
      setSelectedImage(null);
      setError('');
      setIsLoading(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-zinc-900/80 border border-gold-500/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--gold-500,rgba(245,158,11,0.15)),_transparent_40%)] animate-pulse"></div>
        
        <div className="relative z-10 flex-shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <i className="fas fa-image text-2xl text-gold-500"></i>
              <div>
                <h3 className="text-xl font-cinzel font-black text-white uppercase tracking-widest">Estúdio de Mídia AI</h3>
                <p className="text-xs text-zinc-400">Gerando imagem para: <span className="font-bold text-gold-500">{targetLabel}</span></p>
              </div>
            </div>
            <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>

          <div className="flex gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o ícone moderno (ex: Leão de Ouro 3D, Coroa de Platina, Mascote Pato Luxuoso)..."
              className="premium-input !bg-black/30 p-4 rounded-xl min-h-[70px] flex-grow"
              disabled={isLoading}
            />
            <button onClick={handleGenerateClick} disabled={!prompt || isLoading} className="jewel-button active !px-6 group disabled:opacity-30 disabled:grayscale">
              <span className="flex flex-col items-center justify-center gap-1">
                <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} text-lg`}></i>
                <span className="text-[9px] font-bold tracking-widest">{isLoading ? 'CRIANDO' : 'GERAR'}</span>
              </span>
            </button>
          </div>
          {error && <p className="text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-lg mt-4">{error}</p>}
        </div>

        <div className="relative z-10 flex-grow mt-6 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gold-500 animate-pulse space-y-3">
              <i className="fas fa-circle-notch fa-spin text-4xl"></i>
              <p className="text-sm font-black uppercase tracking-[0.3em]">Materializando Arte Digital...</p>
            </div>
          ) : generatedImages.length > 0 ? (
            <div className={`grid gap-4 ${aspectRatio === '1:1' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
              {generatedImages.map((imgSrc, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgSrc)}
                  className={`relative rounded-xl overflow-hidden bg-black ${aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'} transition-all duration-300 border-4 ${selectedImage === imgSrc ? 'border-gold-500 shadow-2xl scale-105' : 'border-transparent hover:border-gold-500/50'}`}
                >
                  {/* Para preview, mostramos a imagem original (PB) mas com um filtro CSS para simular o resultado final */}
                  <img 
                    src={imgSrc} 
                    alt={`Logo gerado ${index + 1}`} 
                    className="w-full h-full object-contain" 
                    // No preview, usamos mix-blend-screen para mostrar que o preto vai sumir
                    style={{ mixBlendMode: imageType === 'logo' ? 'screen' : 'normal' }} 
                  />
                  {selectedImage === imgSrc && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <i className="fas fa-check-circle text-5xl text-gold-500 opacity-90"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-3 border-2 border-dashed border-zinc-800 rounded-2xl">
               <i className="fas fa-palette text-5xl"></i>
               <p className="text-sm font-black uppercase tracking-widest">Aguardando comando criativo</p>
            </div>
          )}
        </div>
        
        <div className="relative z-10 flex-shrink-0 pt-6 mt-4 border-t border-white/5">
          <button onClick={handleUseImage} disabled={!selectedImage || isLoading} className="w-full jewel-button active !py-5 group disabled:opacity-30 disabled:grayscale">
            <span className="flex items-center justify-center gap-3">
              <i className="fas fa-check text-lg"></i> USAR ARTE SELECIONADA
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIMediaStudio;
