
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface AIContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (text: string) => void;
  targetFieldLabel: string;
}

// ATENÇÃO: A Chave de API é gerenciada externamente.
// Assumimos que process.env.API_KEY está disponível no ambiente de execução.
const API_KEY = process.env.API_KEY;

const AIContentModal: React.FC<AIContentModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  targetFieldLabel,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerateClick = async () => {
    if (!prompt || !API_KEY) {
      setError('Por favor, insira uma ideia para o texto e verifique a configuração da API Key.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      // Usando um modelo otimizado para tarefas de texto criativo
      const fullPrompt = `Você é um especialista em marketing e copywriting para marcas de luxo. Crie um texto atraente para o campo "${targetFieldLabel}" de um site. O texto deve ser profissional, conciso e persuasivo. A ideia central é: "${prompt}".`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: fullPrompt
      });
      
      const text = response.text?.replace(/["*]/g, ''); // Limpa aspas e asteriscos
      if (text) {
        setResult(text);
      } else {
        throw new Error('A resposta da IA estava vazia.');
      }
    } catch (e: any) {
      console.error("Erro na API Gemini:", e);
      setError(`Ocorreu um erro ao gerar o conteúdo. Detalhes: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUseText = () => {
    onGenerate(result);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    // Reset state after a short delay to allow for closing animation
    setTimeout(() => {
        setPrompt('');
        setResult('');
        setError('');
        setIsLoading(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-zinc-900/80 border border-gold-500/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--gold-500,rgba(245,158,11,0.15)),_transparent_40%)] animate-pulse"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <i className="fas fa-wand-magic-sparkles text-2xl text-gold-500"></i>
              <div>
                <h3 className="text-xl font-cinzel font-black text-white uppercase tracking-widest">Assistente AI</h3>
                <p className="text-xs text-zinc-400">Gerando para: <span className="font-bold text-gold-500">{targetFieldLabel}</span></p>
              </div>
            </div>
            <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="premium-label">QUAL É A IDEIA CENTRAL?</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Serviço premium focado em experiência personalizada e exclusividade..."
                className="premium-input !bg-black/30 p-4 rounded-xl min-h-[80px]"
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-lg">{error}</p>}

            {isLoading ? (
              <div className="text-center py-10 text-gold-500 animate-pulse space-y-3">
                <i className="fas fa-circle-notch fa-spin text-3xl"></i>
                <p className="text-xs font-black uppercase tracking-[0.3em]">Criando Magia...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <label className="premium-label">SUGESTÃO GERADA:</label>
                <div className="bg-black/40 p-5 rounded-xl border border-white/10 text-zinc-300 text-sm leading-relaxed min-h-[100px]">
                  {result}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={handleGenerateClick} className="jewel-button text-xs">
                        TENTAR NOVAMENTE
                    </button>
                    <button onClick={handleUseText} className="jewel-button active text-xs">
                        <i className="fas fa-check mr-2"></i> USAR ESTE TEXTO
                    </button>
                </div>
              </div>
            ) : (
                <button onClick={handleGenerateClick} disabled={!prompt || isLoading} className="w-full jewel-button active !py-5 group disabled:opacity-30 disabled:grayscale">
                    <span className="flex items-center justify-center gap-3">
                        <i className="fas fa-wand-magic-sparkles text-lg"></i>
                        GERAR TEXTO
                    </span>
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentModal;
