
import React, { useState, useEffect } from 'react';

interface AdminLoginProps {
  onLogin: (pin: string) => Promise<boolean> | boolean;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleNumberClick = async (num: string) => {
    if (pin.length < 4 && !isValidating) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        setIsValidating(true);
        try {
          const success = await onLogin(newPin);
          if (!success) {
            triggerError();
          }
        } catch (e) {
          triggerError();
        } finally {
          setIsValidating(false);
        }
      }
    }
  };

  const handleDelete = () => {
    if (!isValidating) {
      setPin(prev => prev.slice(0, -1));
      setError(false);
    }
  };

  const triggerError = () => {
    setError(true);
    setIsShaking(true);
    setPin('');
    setTimeout(() => setIsShaking(false), 500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isValidating) return;
      if (e.key >= '0' && e.key <= '9') handleNumberClick(e.key);
      if (e.key === 'Backspace') handleDelete();
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isValidating]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center p-4 overflow-hidden touch-none h-[100dvh]">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[20%] opacity-20 blur-[80px] transition-colors duration-700 ${error ? 'bg-red-600' : 'bg-gold-600'}`}></div>
      </div>

      <div className={`relative z-10 w-full max-w-[280px] flex flex-col items-center ${isShaking ? 'animate-shake' : ''}`}>
        <div className="text-center mb-6" role="status">
          <div className="flex gap-4 justify-center">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                  pin.length > i 
                    ? 'bg-gold-500 border-white shadow-[0_0_10px_rgba(245,158,11,0.6)]' 
                    : 'bg-zinc-900 border-white/10'
                } ${error ? 'border-red-500 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="h-6 mb-2 flex items-center justify-center" role="alert">
          {error && (
            <div className="flex items-center gap-2 text-red-500 animate-pulse">
               <i className="fas fa-lock"></i>
               <p className="text-xs font-black uppercase tracking-widest">ACESSO NEGADO</p>
            </div>
          )}
          {isValidating && (
             <div className="flex items-center gap-2 text-gold-500 animate-pulse">
               <i className="fas fa-circle-notch fa-spin"></i>
               <p className="text-xs font-black uppercase tracking-widest">VERIFICANDO PIN...</p>
             </div>
          )}
          {!error && !isValidating && (
             <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">DIGITE SEU PIN DE ACESSO</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full mt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={isValidating}
              className="aspect-[16/9] rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-center text-xl font-cinzel text-gray-400 active:bg-gold-500 active:text-black transition-all shadow-lg hover:border-gold-500/20 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              {num}
            </button>
          ))}
          <button onClick={onCancel} className="aspect-[16/9] flex items-center justify-center text-zinc-600 active:text-white hover:bg-white/5 rounded-xl transition-all"><i className="fas fa-times text-lg"></i></button>
          <button onClick={() => handleNumberClick('0')} disabled={isValidating} className="aspect-[16/9] rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-center text-xl font-cinzel text-gray-400 active:bg-gold-500 active:text-black transition-all shadow-lg hover:border-gold-500/20 disabled:opacity-20 disabled:cursor-not-allowed">0</button>
          <button onClick={handleDelete} className="aspect-[16/9] flex items-center justify-center text-zinc-600 active:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><i className="fas fa-backspace text-lg"></i></button>
        </div>

        <button onClick={onCancel} className="mt-8 text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] transition-colors">VOLTAR AO SITE</button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        button { touch-action: manipulation; -webkit-tap-highlight-color: transparent; outline: none; }
      `}</style>
    </div>
  );
};

export default AdminLogin;
