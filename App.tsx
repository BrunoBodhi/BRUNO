
import React, { useState, useEffect } from 'react';
import { View, StoreConfig, BrandConfig, GenericFeatureCard, CtaActionType } from './types'; 
import Home from './components/Home';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import * as api from './api'; 
import { MASTER_PIN_VALUE, DEFAULT_BRAND_CONFIG, DEFAULT_CONFIG } from './constants';
import { adjustHexColor, hexToRgb } from './utils/styleUtils'; // Importa do novo utilitário

const getWhatsappLink = (whatsappConfig: string | undefined | null, message?: string) => {
  let finalLink = whatsappConfig ? String(whatsappConfig).trim() : '';
  if (!finalLink) return '';
  if (!finalLink.startsWith('http://') && !finalLink.startsWith('https://')) finalLink = `https://wa.me/${finalLink}`;
  if (message) finalLink += finalLink.includes('?') ? `&text=${encodeURIComponent(message)}` : `?text=${encodeURIComponent(message)}`;
  return finalLink;
};

const getTelegramLink = (telegramConfig: string | undefined | null) => {
  let finalLink = telegramConfig ? String(telegramConfig).trim() : '';
  if (!finalLink) return '';
  if (!finalLink.startsWith('http://') && !finalLink.startsWith('https://')) {
    const username = finalLink.startsWith('@') ? finalLink.substring(1) : finalLink;
    finalLink = `https://t.me/${username}`;
  }
  return finalLink;
};

const getMergedBrandConfig = (loadedBrand?: Partial<BrandConfig>): BrandConfig => {
  const brandToMerge = loadedBrand || {}; 
  return {
    ...DEFAULT_BRAND_CONFIG, 
    ...brandToMerge,
    logoStyle: brandToMerge.logoStyle || DEFAULT_BRAND_CONFIG.logoStyle,
    homeHero: {
      ...DEFAULT_BRAND_CONFIG.homeHero,
      ...(brandToMerge.homeHero || {}), 
    },
    homeFeatureCards: brandToMerge.homeFeatureCards || DEFAULT_BRAND_CONFIG.homeFeatureCards, 
    contactMessages: brandToMerge.contactMessages || DEFAULT_BRAND_CONFIG.contactMessages, 
    paymentApis: brandToMerge.paymentApis || DEFAULT_BRAND_CONFIG.paymentApis,
    products: brandToMerge.products || DEFAULT_BRAND_CONFIG.products,
    productsSectionTitle: brandToMerge.productsSectionTitle || DEFAULT_BRAND_CONFIG.productsSectionTitle,
    // FIX: Added merging for products section custom background properties.
    productsSectionBackgroundColor: brandToMerge.productsSectionBackgroundColor || DEFAULT_BRAND_CONFIG.productsSectionBackgroundColor,
    productsSectionBackgroundImage: brandToMerge.productsSectionBackgroundImage || DEFAULT_BRAND_CONFIG.productsSectionBackgroundImage,
    globalSectionBackgroundColor: brandToMerge.globalSectionBackgroundColor || DEFAULT_BRAND_CONFIG.globalSectionBackgroundColor,
    globalSectionBackgroundImage: brandToMerge.globalSectionBackgroundImage || DEFAULT_BRAND_CONFIG.globalSectionBackgroundImage,
    globalSectionOverlayOpacity: brandToMerge.globalSectionOverlayOpacity || DEFAULT_BRAND_CONFIG.globalSectionOverlayOpacity, // NOVO: Merging overlay opacity
    testimonials: brandToMerge.testimonials || DEFAULT_BRAND_CONFIG.testimonials,
    testimonialsSectionTitle: brandToMerge.testimonialsSectionTitle || DEFAULT_BRAND_CONFIG.testimonialsSectionTitle,
    team: brandToMerge.team || DEFAULT_BRAND_CONFIG.team,
    teamSectionTitle: brandToMerge.teamSectionTitle || DEFAULT_BRAND_CONFIG.teamSectionTitle,
    faq: brandToMerge.faq || DEFAULT_BRAND_CONFIG.faq,
    faqSectionTitle: brandToMerge.faqSectionTitle || DEFAULT_BRAND_CONFIG.faqSectionTitle,
    contactLocation: {
      ...DEFAULT_BRAND_CONFIG.contactLocation,
      ...(brandToMerge.contactLocation || {}),
    },
  };
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeAdminPin, setActiveAdminPin] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  // Inicializamos com um objeto vazio ou mínimo para evitar renderizar lixo visual antes do load
  const [currentDisplayConfig, setCurrentDisplayConfig] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [showScroll, setShowScroll] = useState(false);

  // Efeito para o botão Scroll-to-Top
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 300) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 300) {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const loadConfig = async () => {
      const startTime = Date.now();
      console.log("[System] Iniciando carregamento de configuração...");
      setIsLoading(true);
      
      try {
        if (activeAdminPin) {
          console.log(`[System] Buscando config para PIN ativo: ${activeAdminPin}`);
          const savedConfig = await api.fetchConfig(activeAdminPin);
          
          if (savedConfig) {
            setCurrentDisplayConfig({
              ...DEFAULT_CONFIG,
              brand: getMergedBrandConfig(savedConfig.brand),
            });
            setIsAdminLoggedIn(true);
            setView('admin_panel');
          } else {
            setActiveAdminPin(null);
            setIsAdminLoggedIn(false);
            setView('admin_login');
          }
        } else {
          // Lógica para visitante (Home Page)
          const urlParams = new URLSearchParams(window.location.search);
          const pinFromUrl = urlParams.get('pin');
          const pinToFetch = (pinFromUrl && /^\d{4}$/.test(pinFromUrl)) ? pinFromUrl : null;
          
          if (pinToFetch) {
            console.log(`[System] PIN detectado na URL: ${pinToFetch}. Buscando...`);
            const savedPinConfig = await api.fetchConfig(pinToFetch);
            if (savedPinConfig) {
              console.log("[System] Configuração do PIN encontrada.");
              setCurrentDisplayConfig({
                ...DEFAULT_CONFIG,
                adminPin: pinToFetch,
                brand: getMergedBrandConfig(savedPinConfig.brand),
              });
            } else {
              console.warn("[System] PIN da URL não encontrado. Usando config pública.");
              const publishedBrand = await api.fetchPublishedConfig();
              setCurrentDisplayConfig({ ...DEFAULT_CONFIG, brand: getMergedBrandConfig(publishedBrand) });
            }
          } else {
            console.log("[System] Nenhum PIN na URL. Carregando Landing Page Principal...");
            const publishedBrand = await api.fetchPublishedConfig();
            setCurrentDisplayConfig({ ...DEFAULT_CONFIG, brand: getMergedBrandConfig(publishedBrand) });
          }
          setIsAdminLoggedIn(false);
          setView('home');
        }
      } catch (err) {
        console.error("[System] Erro Crítico no Load:", err);
      } finally {
        const endTime = Date.now();
        console.log(`[System] Carregamento concluído em ${endTime - startTime}ms`);
        // Pequeno delay para garantir que o React processou o state do currentDisplayConfig
        setTimeout(() => setIsLoading(false), 50);
      }
    };
    loadConfig();
  }, [activeAdminPin]);

  useEffect(() => {
    const saveAdminConfig = async () => {
      // Só salva automaticamente se estiver realmente logado e com PIN válido
      if (activeAdminPin && isAdminLoggedIn) {
        try {
          // Garante que o PIN atual está dentro do objeto de configuração para passar nas regras do Firestore
          const configToSave = {
            ...currentDisplayConfig,
            adminPin: activeAdminPin
          };
          await api.saveConfig(activeAdminPin, configToSave);
        } catch (err) {}
      }
    };
    const handler = setTimeout(saveAdminConfig, 1000);
    return () => clearTimeout(handler);
  }, [currentDisplayConfig, activeAdminPin, isAdminLoggedIn]);

  useEffect(() => {
    const brand = currentDisplayConfig.brand;
    const primary = brand.primaryColor;

    // Gera uma paleta de cores completa e dinâmica a partir da cor primária
    const palette = {
      '50': adjustHexColor(primary, 55),
      '100': adjustHexColor(primary, 45),
      '200': adjustHexColor(primary, 35),
      '300': adjustHexColor(primary, 25),
      '400': adjustHexColor(primary, 15),
      '500': primary,
      '600': adjustHexColor(primary, -15),
      '700': adjustHexColor(primary, -30),
      '800': adjustHexColor(primary, -40),
      '900': adjustHexColor(primary, -50),
    };

    // Atualiza as variáveis CSS para toda a paleta
    Object.entries(palette).forEach(([shade, color]) => {
      document.documentElement.style.setProperty(`--gold-${shade}`, color);
    });
    
    // Calcula um gradiente metálico baseado na cor primária para substituir o dourado fixo
    // Estrutura: Escuro -> Claro -> Escuro -> Claro -> Escuro (Simula brilho de metal)
    const gradient = `linear-gradient(to right, ${palette['600']}, ${palette['100']}, ${palette['700']}, ${palette['200']}, ${palette['600']})`;
    document.documentElement.style.setProperty('--brand-gradient', gradient);

    // Mantém variáveis antigas para compatibilidade com estilos inline e CSS
    document.documentElement.style.setProperty('--gold-primary', palette['500']);
    document.documentElement.style.setProperty('--gold-primary-rgb', hexToRgb(palette['500'])); // NOVO: Cor primária em RGB
    document.documentElement.style.setProperty('--gold-light', palette['300']);
    document.documentElement.style.setProperty('--gold-secondary', brand.secondaryColor);
    document.documentElement.style.setProperty('--gold-dark', palette['800']);

    document.documentElement.style.setProperty('--header-bg-color', brand.headerBgColor);
    document.documentElement.style.setProperty('--font-title', brand.titleFont === 'cinzel' ? "'Cinzel', serif" : "'Inter', sans-serif");
    document.documentElement.style.setProperty('--font-subtitle', brand.subtitleFont === 'cinzel' ? "'Cinzel', serif" : "'Inter', sans-serif");
    document.documentElement.style.setProperty('--font-desc', brand.descFont === 'cinzel' ? "'Cinzel', serif" : "'Inter', sans-serif");
    document.title = brand.pageTitle;
  }, [currentDisplayConfig]);

  // SEGURANÇA: Validação Assíncrona do Login
  const handleAdminLogin = async (pin: string) => {
    // 1. Verifica se é o Master
    if (pin === MASTER_PIN_VALUE) {
      setActiveAdminPin(pin);
      return true;
    }
    
    // 2. Verifica se o PIN existe no banco de dados
    const exists = await api.fetchConfig(pin);
    if (exists) {
      setActiveAdminPin(pin);
      return true;
    }
    
    // 3. Se não existe, nega o acesso
    return false;
  };

  const handleCtaAction = (action: CtaActionType, link?: string) => {
    if (action === 'whatsapp') {
      const defaultMessageTemplate = currentDisplayConfig.brand.contactMessages.find(msg => msg.name === 'Contato Geral')?.template || 'Olá, gostaria de mais informações sobre a Plataforma Digital.';
      // Substitui {empresa} pelo nome da plataforma, já que agora estamos vendendo a plataforma
      const msg = defaultMessageTemplate
        .replace('{empresa}', 'Plataforma Digital')
        .replace('{cliente}', ' ') // Mantém em branco para preenchimento do cliente
        .replace('{contato}', ' ') // Mantém em branco
        .replace('{whatsapp_global}', currentDisplayConfig.brand.whatsapp || ''); // Caso haja uma variável para o próprio número
      
      const whatsappLink = getWhatsappLink(currentDisplayConfig.brand.whatsapp, msg);
      if (whatsappLink) {
        window.open(whatsappLink, '_blank');
      } else {
        alert('Configuração de WhatsApp inválida.');
      }

    } else if (action === 'telegram') {
      const telegramLink = getTelegramLink(currentDisplayConfig.brand.telegram);
      if (telegramLink) {
        window.open(telegramLink, '_blank');
      } else {
        alert('Configuração de Telegram inválida.');
      }
    } else if (action === 'external_link' && link) {
      window.open(link, '_blank');
    }
  };

  const handlePublishConfig = async () => {
    try {
      await api.publishConfig(getMergedBrandConfig(currentDisplayConfig.brand));
      alert('Configurações publicadas!');
    } catch (err) {
      alert('Erro ao publicar.');
    }
  };

  const handleResetCurrentPinData = async () => {
    if (!activeAdminPin) return;
    if (confirm('Deseja redefinir os dados deste PIN?')) {
      try {
        await api.resetConfig(activeAdminPin);
        setActiveAdminPin(null);
      } catch (err) {
        alert('Erro ao redefinir.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#000000]">
        <div className="relative z-10 flex flex-col items-center">
           <div className="w-16 h-16 border-4 border-white/5 border-t-white/40 rounded-full animate-spin mb-6"></div>
           <div className="font-cinzel text-xl font-black text-white/40 tracking-[0.3em] uppercase animate-pulse">CARREGANDO</div>
           <div className="mt-4 text-[9px] text-zinc-600 tracking-widest uppercase font-mono">EXPERIÊNCIA PREMIUM...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#000000] font-sans`}>
      <nav className="sticky top-0 z-50 px-4 md:px-8 py-3 bg-[var(--header-bg-color)] border-b border-white/5 backdrop-blur-md">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center cursor-pointer bg-transparent" onClick={() => setActiveAdminPin(null)}>
            {/* RENDERIZAÇÃO CONDICIONAL DO LOGO */}
            {currentDisplayConfig.brand.logoUrl && (
              currentDisplayConfig.brand.logoStyle === 'mask' ? (
                // MODO MÁSCARA (COR DO TEMA)
                <div className="relative h-20 md:h-24 mr-4">
                   <img 
                      src={currentDisplayConfig.brand.logoUrl} 
                      className="h-full w-auto opacity-0 pointer-events-none" 
                      alt="Spacer"
                   />
                   <div 
                      className="absolute inset-0 dynamic-logo-mask"
                      style={{ '--logo-url': `url(${currentDisplayConfig.brand.logoUrl})` } as React.CSSProperties}
                   ></div>
                </div>
              ) : (
                // MODO ORIGINAL (IMAGEM COLORIDA/3D)
                <img 
                  src={currentDisplayConfig.brand.logoUrl} 
                  alt="Logo" 
                  className="h-20 md:h-24 w-auto mr-4 object-contain"
                />
              )
            )}
            <span 
              className={`font-cinzel font-black text-lg uppercase tracking-widest brand-name-shadow ${currentDisplayConfig.brand.brandNameColor ? '' : 'gold-text-gradient'}`}
              style={currentDisplayConfig.brand.brandNameColor ? { color: currentDisplayConfig.brand.brandNameColor, background: 'none', WebkitBackgroundClip: 'unset', WebkitTextFillColor: 'unset' } : {}}
            >
              {currentDisplayConfig.brand.brandName}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-gold-500/50 uppercase tracking-widest">SESSÃO: {activeAdminPin}</span>
                <button onClick={() => setView('admin_panel')} className="px-5 py-2.5 bg-gold-500 text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-gold-400 transition-colors">PAINEL</button>
                <button onClick={() => setActiveAdminPin(null)} className="text-gray-500 hover:text-white"><i className="fas fa-sign-out-alt"></i></button>
              </div>
            ) : (
              <button onClick={() => setView('admin_login')} className="header-login-button">
                <i className="fas fa-lock"></i>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {view === 'home' && (
          <Home 
            config={currentDisplayConfig.brand} 
            onCtaClick={handleCtaAction} 
            getWhatsappLink={getWhatsappLink} 
            getTelegramLink={getTelegramLink} 
            pin={currentDisplayConfig.adminPin}
          />
        )}
        {view === 'admin_login' && <AdminLogin onLogin={handleAdminLogin} onCancel={() => setView('home')} />}
        {view === 'admin_panel' && isAdminLoggedIn && (
          <AdminPanel 
            storeConfig={currentDisplayConfig} 
            setStoreConfig={setCurrentDisplayConfig} 
            onLogout={() => setActiveAdminPin(null)}
            onNewPinCreated={(old, n) => setActiveAdminPin(n)}
            onResetCurrentPinData={handleResetCurrentPinData}
            activeAdminPin={activeAdminPin}
            onPublish={handlePublishConfig} 
          />
        )}
      </main>

      <footer className="bg-[#000000] border-t border-white/5 py-12 text-center relative z-10">
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] mb-2">{currentDisplayConfig.brand.brandName}</p>
        <p className="text-zinc-700 text-[8px] uppercase tracking-widest">{currentDisplayConfig.brand.footerText}</p>
      </footer>

      {/* Botão Flutuante Elevador VIP */}
      <button 
        onClick={scrollTop} 
        className={`scroll-to-top ${showScroll ? 'visible' : ''}`}
        aria-label="Voltar ao topo"
      >
        <i className="fas fa-arrow-up"></i>
      </button>
    </div>
  );
};

export default App;
