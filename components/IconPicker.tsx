
import React, { useState, useRef, useEffect } from 'react';

interface IconPickerProps {
  currentIcon: string;
  onSelect: (iconClass: string) => void;
}

// Lista expandida de ícones FontAwesome populares para diversos nichos e serviços.
export const COMMON_ICONS = [
  // Ícones Gerais e de Ação
  'fa-solid fa-star', 'fa-solid fa-user', 'fa-solid fa-calendar', 'fa-solid fa-check-circle', 
  'fa-solid fa-times-circle', 'fa-solid fa-info-circle', 'fa-solid fa-question-circle', 
  'fa-solid fa-arrow-up', 'fa-solid fa-arrow-down', 'fa-solid fa-plus', 'fa-solid fa-minus',
  'fa-solid fa-trash', 'fa-solid fa-edit', 'fa-solid fa-sign-out-alt', 'fa-solid fa-lock',
  'fa-solid fa-chart-line', 'fa-solid fa-calendar-check', 'fa-solid fa-palette', 'fa-solid fa-users',
  'fa-solid fa-comments', 'fa-solid fa-fingerprint', 'fab fa-whatsapp', 'fa-solid fa-magic',
  'fa-solid fa-tag', 'fa-solid fa-bars', 'fa-solid fa-lightbulb', 'fa-solid fa-gem',
  'fa-solid fa-shield-halved', 'fa-solid fa-clock-rotate-left', 'fa-solid fa-search',
  'fa-solid fa-cog', 'fa-solid fa-download', 'fa-solid fa-upload', 'fa-solid fa-share-alt',
  'fa-solid fa-print', 'fa-solid fa-undo', 'fa-solid fa-redo', 'fa-solid fa-sync-alt',
  'fa-solid fa-exclamation-triangle', 'fa-solid fa-bell', 'fa-solid fa-globe',

  // Barbearia e Beleza (Expandido)
  'fa-solid fa-cut', 'fa-solid fa-scissors', 'fa-solid fa-beard', 'fa-solid fa-spray-can-sparkles',
  'fa-solid fa-tooth', 'fa-solid fa-hair-alt', 'fa-solid fa-brush', 'fa-solid fa-spa',
  'fa-solid fa-hand-sparkles', 'fa-solid fa-tint', 'fa-solid fa-mask', 'fa-solid fa-paint-roller',
  'fa-solid fa-eye-dropper', 'fa-solid fa-pump-soap', 'fa-solid fa-hot-tub', 'fa-solid fa-bath',
  'fa-solid fa-mirror', 'fa-solid fa-hand-scissors', 'fa-solid fa-head-side-mask',
  'fa-solid fa-face-flushed', 'fa-solid fa-hand-holding-heart', 'fa-solid fa-face-grin-stars',

  // Saúde e Bem-estar
  'fa-solid fa-heartbeat', 'fa-solid fa-medkit', 'fa-solid fa-stethoscope', 'fa-solid fa-brain',
  'fa-solid fa-wheelchair', 'fa-solid fa-hospital', 'fa-solid fa-pills', 'fa-solid fa-syringe',
  'fa-solid fa-notes-medical', 'fa-solid fa-running', 'fa-solid fa-dumbbell', 'fa-solid fa-apple-alt',
  'fa-solid fa-seedling', 'fa-solid fa-leaf', 'fa-solid fa-hand-holding-medical',

  // Educação e Conhecimento
  'fa-solid fa-book', 'fa-solid fa-graduation-cap', 'fa-solid fa-pencil-alt', 'fa-solid fa-school',
  'fa-solid fa-chalkboard-teacher', 'fa-solid fa-flask', 'fa-solid fa-microscope', 'fa-solid fa-laptop-code',
  'fa-solid fa-language', 'fa-solid fa-atom', 'fa-solid fa-calculator', 'fa-solid fa-feather',

  // Alimentação e Bebidas
  'fa-solid fa-coffee', 'fa-solid fa-mug-hot', 'fa-solid fa-utensils', 'fa-solid fa-pizza-slice',
  'fa-solid fa-hamburger', 'fa-solid fa-cocktail', 'fa-solid fa-wine-glass-alt', 'fa-solid fa-ice-cream',
  'fa-solid fa-bread-slice', 'fa-solid fa-carrot', 'fa-solid fa-cheese', 'fa-solid fa-egg',

  // Tecnologia e Escritório
  'fa-solid fa-laptop', 'fa-solid fa-code', 'fa-solid fa-desktop', 'fa-solid fa-wifi',
  'fa-solid fa-print', 'fa-solid fa-hdd', 'fa-solid fa-server', 'fa-solid fa-keyboard',
  'fa-solid fa-mouse', 'fa-solid fa-headset', 'fa-solid fa-fax', 'fa-solid fa-file-alt',
  'fa-solid fa-folder', 'fa-solid fa-paperclip', 'fa-solid fa-chart-bar', 'fa-solid fa-qrcode',

  // Viagens e Transporte
  'fa-solid fa-plane', 'fa-solid fa-car', 'fa-solid fa-bus', 'fa-solid fa-train',
  'fa-solid fa-ship', 'fa-solid fa-bicycle', 'fa-solid fa-motorcycle', 'fa-solid fa-road',
  'fa-solid fa-map', 'fa-solid fa-globe-americas', 'fa-solid fa-suitcase-rolling', 'fa-solid fa-hotel',

  // Casa e Serviços Domésticos
  'fa-solid fa-home', 'fa-solid fa-broom', 'fa-solid fa-wrench', 'fa-solid fa-plug',
  'fa-solid fa-faucet', 'fa-solid fa-couch', 'fa-solid fa-bed', 'fa-solid fa-toilet',
  'fa-solid fa-shower', 'fa-solid fa-dishwasher', 'fa-solid fa-washer', 'fa-solid fa-dryer',
  'fa-solid fa-blender', 'fa-solid fa-toolbox', 'fa-solid fa-recycle', 'fa-solid fa-solar-panel',

  // Finanças e Comércio
  'fa-solid fa-money-bill-wave', 'fa-solid fa-wallet', 'fa-solid fa-cash-register', 'fa-solid fa-credit-card',
  'fa-solid fa-piggy-bank', 'fa-solid fa-hand-holding-usd', 'fa-solid fa-store', 'fa-solid fa-shopping-cart',
  'fa-solid fa-receipt', 'fa-solid fa-dollar-sign', 'fa-solid fa-euro-sign', 'fa-solid fa-yen-sign',

  // Natureza e Meio Ambiente
  'fa-solid fa-tree', 'fa-solid fa-water', 'fa-solid fa-cloud', 'fa-solid fa-sun',
  'fa-solid fa-moon', 'fa-solid fa-snowflake', 'fa-solid fa-fire', 'fa-solid fa-smog',
  'fa-solid fa-mountain', 'fa-solid fa-flower', 'fa-solid fa-globe-europe',

  // Esportes e Lazer
  'fa-solid fa-futbol', 'fa-solid fa-basketball-ball', 'fa-solid fa-volleyball-ball', 'fa-solid fa-baseball-ball',
  'fa-solid fa-swimmer', 'fa-solid fa-biking', 'fa-solid fa-hiking', 'fa-solid fa-medal',
  'fa-solid fa-trophy', 'fa-solid fa-gamepad', 'fa-solid fa-chess-knight', 'fa-solid fa-music',
  'fa-solid fa-microphone-alt', 'fa-solid fa-film', 'fa-solid fa-theater-masks', 'fa-solid fa-heart',

  // Comunicação e Mídia
  'fa-solid fa-mobile-alt', 'fa-solid fa-envelope', 'fa-solid fa-phone', 'fa-solid fa-video',
  'fa-solid fa-camera', 'fa-solid fa-podcast', 'fa-solid fa-rss', 'fa-solid fa-bullhorn',
  'fa-solid fa-comment-alt', 'fa-solid fa-sms', 'fa-solid fa-at', 'fa-solid fa-hashtag',

  // Outros nichos
  'fa-solid fa-gavel', 'fa-solid fa-balance-scale', 'fa-solid fa-fist-raised', 'fa-solid fa-hard-hat',
  'fa-solid fa-industry', 'fa-solid fa-truck', 'fa-solid fa-warehouse', 'fa-solid fa-robot',
  'fa-solid fa-rocket', 'fa-solid fa-flask', 'fa-solid fa-compass', 'fa-solid fa-anchor',
  'fa-solid fa-fish', 'fa-solid fa-bone', 'fa-solid fa-paw', 'fa-solid fa-tractor',
  'fa-solid fa-building', 'fa-solid fa-city', 'fa-solid fa-monument', 'fa-solid fa-landmark',
];


const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  const filteredIcons = COMMON_ICONS.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIconClick = (iconClass: string) => {
    onSelect(iconClass);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="admin-icon-input group flex justify-between items-center pr-3"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Selecionar ícone"
      >
        <span className="flex items-center gap-3">
          {currentIcon ? (
            <i className={`${currentIcon} text-gold-500 text-lg`}></i>
          ) : (
            <span className="text-gray-500 text-sm">Nenhum ícone selecionado</span>
          )}
          <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">
            {currentIcon ? currentIcon.replace(/fa-solid |fa-brands /, '') : 'SELECIONE O ÍCONE'}
          </span>
        </span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-500 text-sm group-hover:text-gold-300 transition-transform`}></i>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-h-96 bg-zinc-900 border border-gold-500/30 rounded-xl shadow-lg animate-fadeIn overflow-hidden">
          <div className="p-3 border-b border-gold-500/10">
            <input
              type="text"
              placeholder="Buscar ícones..."
              className="admin-input !p-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Campo de busca de ícones"
            />
          </div>
          <div className="grid grid-cols-5 md:grid-cols-6 gap-2 p-3 overflow-y-auto max-h-72 no-scrollbar">
            {filteredIcons.length > 0 ? (
              filteredIcons.map(iconClass => (
                <button
                  key={iconClass}
                  type="button"
                  onClick={() => handleIconClick(iconClass)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gold-900/40 hover:text-gold-300 transition-colors duration-200 
                    ${currentIcon === iconClass ? 'bg-gold-900/50 text-gold-200 border border-gold-500/50' : ''}`}
                  title={iconClass.replace(/fa-solid |fa-brands /, '')}
                  aria-label={`Selecionar ícone ${iconClass.replace(/fa-solid |fa-brands /, '')}`}
                >
                  <i className={`${iconClass} text-xl mb-1`}></i>
                  <span className="text-[7px] uppercase leading-none text-center opacity-70">
                    {iconClass.replace(/fa-solid |fa-brands /, '').substring(0, 8)}
                  </span>
                </button>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 text-xs py-4">Nenhum ícone encontrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;
