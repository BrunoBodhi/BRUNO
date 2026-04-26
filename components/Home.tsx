
import React from 'react';
import { useState, useRef, MouseEvent, useEffect } from 'react';
import { BrandConfig, CtaActionType, ProductEntry, GalleryItem, TestimonialItem, TeamMember, FaqItem, BookingConfig } from '../types';
import { getMetallicGradient, getDefaultSolidButtonStyle, getTransparentButtonStyle } from '../utils/styleUtils';
import Booking from './Booking';

interface HomeProps {
  onCtaClick: (action: CtaActionType, link?: string) => void;
  config: BrandConfig;
  getWhatsappLink: (whatsappConfig: string | undefined | null, message?: string) => string; 
  getTelegramLink: (telegramConfig: string | undefined | null) => string; 
  pin: string;
}

// Divisor de Seção "Assinatura de Ouro" - VERSÃO COMPACTA
const VipDivider: React.FC = () => (
  <div className="py-8 reveal-on-scroll">
    <div className="vip-divider">
      <i className="fas fa-gem text-xs"></i>
    </div>
  </div>
);

const Home: React.FC<HomeProps> = ({ onCtaClick, config, getWhatsappLink, getTelegramLink, pin }) => {
  // FIX: Destructured products section background properties to allow for per-section styling.
  const { homeHero, homeFeatureCards, products, productsSectionTitle, productsSectionBackgroundColor, productsSectionBackgroundImage, gallery, gallerySectionTitle, testimonials, testimonialsSectionTitle, team, teamSectionTitle, faq, faqSectionTitle, contactLocation, featureIconColor, globalSectionBackgroundColor, globalSectionBackgroundImage, globalSectionOverlayOpacity } = config;
  const [heroMediaLoaded, setHeroMediaLoaded] = useState(false);
  const productsSectionRef = useRef<HTMLElement>(null);
  const gallerySectionRef = useRef<HTMLElement>(null);
  const featuresSectionRef = useRef<HTMLElement>(null);
  const productsTitleRef = useRef<HTMLHeadingElement>(null); // Ref para o título da seção de produtos
  
  // States
  const [activeCategory, setActiveCategory] = useState<string>('TODOS');
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const activeFeatures = homeFeatureCards ? homeFeatureCards.filter(f => f.active !== false) : [];
  const activeProducts = products ? products.filter(p => p.active !== false) : [];
  const activeTestimonials = testimonials ? testimonials.filter(t => t.active !== false) : [];
  const activeTeamMembers = team ? team.filter(m => m.active !== false) : [];
  const activeFaqItems = faq ? faq : [];


  // Lógica da Galeria
  const galleryCategories = gallery && gallery.length > 0 
    ? ['TODOS', ...Array.from(new Set(gallery.map(item => item.category.toUpperCase().trim())))] 
    : [];

  const filteredGallery = activeCategory === 'TODOS' 
    ? gallery.filter(item => item.active !== false)
    : gallery.filter(item => item.active !== false && item.category.toUpperCase().trim() === activeCategory);

  // Efeito de Scroll Reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    // Observador específico para o título da seção de produtos
    if (productsTitleRef.current) {
      observer.observe(productsTitleRef.current);
    }

    return () => observer.disconnect();
  }, [homeHero, homeFeatureCards, activeProducts, gallery, activeTestimonials, activeTeamMembers, activeFaqItems, contactLocation]);

  const handleCtaAction = () => {
    if (homeHero.ctaAction === 'payment') {
      const paymentMethod = config.paymentMethodPreference || 'api_direct';
      if (paymentMethod === 'whatsapp_chat') {
        
        let whatsappMessage = '';
        const messageType = config.paymentMessageType || 'instructions';

        if (messageType === 'instructions') {
          whatsappMessage = `*Informações para Pagamento - ${config.brandName}*\n\n`;
          if (config.manualPaymentInstructions) {
            whatsappMessage += `${config.manualPaymentInstructions}\n\n`;
          }
          if (config.pixKey) whatsappMessage += `💳 *PIX:*\n\`${config.pixKey}\` (Chave Copiável)\n`;
          if (config.bankName || config.bankAccount || config.bankAgency) {
            whatsappMessage += `\n🏦 *Dados Bancários:*\n`;
            if (config.bankName) whatsappMessage += `   *Banco:* ${config.bankName}\n`;
            if (config.bankAccount) whatsappMessage += `   *Conta:* ${config.bankAccount}\n`;
            if (config.bankAgency) whatsappMessage += `   *Agência:* ${config.bankAgency}\n`;
          }
           if (config.paymentApis && config.paymentApis.length > 0) {
            whatsappMessage += `\n🔗 *Opções de Pagamento Online:*\n`;
            config.paymentApis.forEach(api => whatsappMessage += `   - ${api.name}\n`);
            whatsappMessage += `_Entre em contato conosco para o link direto de pagamento online._\n`;
          }
          whatsappMessage += `\nEstamos à disposição no WhatsApp para ajudar com seu pagamento!`;
        } else { // 'confirmation'
          whatsappMessage = config.paymentConfirmationMessageTemplate || '';
          // Substitui variáveis com placeholders, pois é um botão genérico
          whatsappMessage = whatsappMessage
            .replace(/{valor}/g, '[VALOR]')
            .replace(/{item_comprado}/g, '[NOME DO ITEM]')
            .replace(/{cliente}/g, ''); // Deixa em branco para o cliente preencher
        }

        const whatsappLink = getWhatsappLink(config.whatsapp, whatsappMessage);
        if (whatsappLink) window.open(whatsappLink, '_blank');
        else alert('Configuração de WhatsApp inválida.');

      } else { // 'api_direct'
        if (config.paymentApis && config.paymentApis.length > 0) {
          window.open(config.paymentApis[0].url, '_blank');
        } else if (config.pixKey) {
          navigator.clipboard.writeText(config.pixKey);
          alert('Chave Pix copiada com sucesso!');
        } else {
          alert('Nenhum método de pagamento direto configurado.');
        }
      }
    } else if (homeHero.ctaAction === 'scroll_to_products') {
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (homeHero.ctaAction === 'scroll_to_gallery') {
      gallerySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (homeHero.ctaAction === 'booking') {
      setIsBookingOpen(true);
    } else {
      onCtaClick(homeHero.ctaAction, homeHero.ctaLink);
    }
  };

  const handleProductClick = (product: ProductEntry) => {
    if (product.actionType === 'external_link' && product.link) {
      window.open(product.link, '_blank');
    } else if (product.actionType === 'whatsapp') {
      const msg = `Olá, tenho interesse em: *${product.title}* (${product.price})`;
      const link = getWhatsappLink(config.whatsapp, msg);
      if (link) window.open(link, '_blank'); else alert('WhatsApp não configurado.');
    } else if (product.actionType === 'telegram') {
      const link = getTelegramLink(config.telegram);
      if (link) window.open(link, '_blank'); else alert('Telegram não configurado.');
    } else if (product.actionType === 'booking') {
      setIsBookingOpen(true);
    }
  };
  
  // Determina o estilo do botão CTA principal
  const getCtaButtonStyle = (): React.CSSProperties => {
    const ctaColor = homeHero.ctaColor; // Cor específica do CTA
    const themeColor = config.primaryColor; // Cor primária do tema
    
    if (ctaColor === 'transparent') {
      // Botão transparente usa a cor do tema para borda e texto.
      return getTransparentButtonStyle(themeColor);
    }
    // Botão sólido usa a cor específica do CTA se houver, senão a cor do tema.
    return getDefaultSolidButtonStyle(ctaColor || themeColor);
  };
  
  // Determina o estilo dos botões do catálogo, espelhando o principal
  const getProductButtonStyle = (productStyle?: 'solid' | 'transparent'): React.CSSProperties => {
    const ctaColor = homeHero.ctaColor; // Cor específica do CTA
    const themeColor = config.primaryColor; // Cor primária do tema

    // Se o estilo específico do produto é transparente, usa a cor do tema.
    if (productStyle === 'transparent') {
      return getTransparentButtonStyle(themeColor);
    }
    
    // Se o CTA principal é transparente, os botões do produto (que não especificaram) também serão transparentes.
    if (ctaColor === 'transparent') {
        return getTransparentButtonStyle(themeColor);
    }

    // Por padrão, o botão é sólido, usando a cor do CTA se houver, senão a do tema.
    return getDefaultSolidButtonStyle(ctaColor || themeColor);
  };

  // Gera estilo de gradiente metálico para ícones
  const getIconStyle = (color?: string): React.CSSProperties => {
    if (color) {
      return {
        background: getMetallicGradient(color),
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundSize: '200% auto',
        animation: 'shine 5s linear infinite',
      };
    }
    // Se não houver cor, a classe 'gold-text-gradient' global será usada
    return {};
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width, height } = rect;

    // Efeito Spotlight
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    // Efeito de Inclinação 3D
    const rotateX = (y / height - 0.5) * -8; // Reduzido para ser mais sutil
    const rotateY = (x / width - 0.5) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      const card = e.currentTarget;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  const handleScrollDown = () => {
    // Tenta rolar para a seção de features se existir, senão rola 70% da altura
    if (featuresSectionRef.current) {
      featuresSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' });
    }
  };
  
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex text-gold-500">
      {[...Array(5)].map((_, i) => (
        <i key={i} className={`fas fa-star ${i < rating ? 'text-gold-500' : 'text-zinc-700'}`}></i>
      ))}
    </div>
  );

  const toggleFaq = (id: string) => {
    setOpenFaqId(prevId => (prevId === id ? null : id));
  };
  
  // Estilo base para todas as seções, usando o fundo global
  const globalSectionBaseStyle: React.CSSProperties = {
    backgroundColor: globalSectionBackgroundColor || 'transparent',
    backgroundImage: globalSectionBackgroundImage ? `url(${globalSectionBackgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  // Estilo específico para a seção de produtos (se tiver um fundo próprio)
  const productsSectionSpecificStyle: React.CSSProperties = {
    backgroundColor: productsSectionBackgroundColor || globalSectionBackgroundColor || 'transparent',
    backgroundImage: (productsSectionBackgroundImage || globalSectionBackgroundImage) ? `url(${productsSectionBackgroundImage || globalSectionBackgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  // NOVO: Renderiza a camada de overlay escura para seções
  const renderSectionOverlay = (opacity: number | undefined) => {
    if (opacity !== undefined && opacity > 0) {
      return (
        <div 
          className="absolute inset-0 bg-black pointer-events-none" 
          style={{ opacity: opacity }}
        ></div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col">
      {/* Sistema de Agendamento */}
      {isBookingOpen && config.booking && (
        <Booking 
          config={config.booking} 
          onClose={() => setIsBookingOpen(false)} 
          whatsappNumber={config.whatsapp}
          pin={pin}
        />
      )}

      {/* Lightbox para Galeria */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors" onClick={() => setLightboxImage(null)}>
            <i className="fas fa-times text-3xl"></i>
          </button>
          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={lightboxImage.imageUrl} alt={lightboxImage.title || lightboxImage.category} className="max-w-full max-h-[80vh] object-contain rounded-lg border border-gold-500/20 shadow-[0_0_50px_rgba(245,158,11,0.2)]" />
            <div className="mt-4 text-center">
              <span className="text-gold-500 text-xs font-black uppercase tracking-[0.3em] block mb-1">{lightboxImage.category}</span>
              {lightboxImage.title && <h3 className="text-white font-cinzel text-xl uppercase tracking-widest">{lightboxImage.title}</h3>}
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section 
        className="relative min-h-[80vh] flex flex-col items-center justify-start md:justify-end overflow-hidden pb-20 md:pb-32"
        aria-labelledby="hero-title"
      >
        <div className="absolute inset-0 z-20" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,${homeHero.overlayOpacity}), rgba(0,0,0,0.2), rgba(0,0,0,1))` }}></div>
        
        {/* Container do Background */}
        <div className="absolute inset-0 z-10 overflow-hidden">
          {homeHero.heroBackgroundType === 'video' && homeHero.heroVideoUrl ? (
            <video src={homeHero.heroVideoUrl} autoPlay loop muted playsInline className={`w-full h-full object-cover transition-opacity duration-1000 ${heroMediaLoaded ? 'opacity-100' : 'opacity-0'} animate-hero-zoom`} aria-label="Fundo de vídeo dinâmico" onLoadedData={() => setHeroMediaLoaded(true)} style={{ objectPosition: homeHero.heroBackgroundPosition }} />
          ) : (
            <img src={homeHero.image} alt="Cenário Premium" className={`w-full h-full object-cover transition-opacity duration-1000 ${heroMediaLoaded ? 'opacity-100' : 'opacity-0'} animate-hero-zoom`} onLoad={() => setHeroMediaLoaded(true)} style={{ objectPosition: homeHero.heroBackgroundPosition }} />
          )}
        </div>

        {/* Conteúdo Hero */}
        <div className="relative z-30 text-center px-6 max-w-5xl py-12 reveal-on-scroll is-visible">
          {homeHero.subtitle && (
            <div className="mb-4 flex items-center justify-center gap-4 opacity-0 animate-[fadeIn_1s_0.5s_forwards]">
               <div className="h-[1px] w-8 bg-gold-500/50"></div>
               <p className={`text-xs md:text-sm text-gold-500 font-bold tracking-[0.4em] uppercase font-subtitle`}>{homeHero.subtitle}</p>
               <div className="h-[1px] w-8 bg-gold-500/50"></div>
            </div>
          )}
          
          <h1 
            id="hero-title" 
            className={`text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tighter font-title hero-title-shadow opacity-0 animate-[fadeIn_1s_0.8s_forwards] ${config.homeHero.titleColor ? '' : 'gold-text-gradient'}`}
            style={config.homeHero.titleColor ? { color: config.homeHero.titleColor, background: 'none', WebkitBackgroundClip: 'unset', WebkitTextFillColor: 'unset' } : {}}
          >
            {homeHero.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
          </h1>
          
          <p className={`max-w-2xl mx-auto text-xs md:text-sm font-normal text-white mb-8 leading-relaxed tracking-[0.2em] uppercase font-desc opacity-0 animate-[fadeIn_1s_1.2s_forwards] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}>
            {homeHero.description}
          </p>
          
          <div className="flex justify-center items-center opacity-0 animate-[fadeIn_1s_1.5s_forwards]">
            <button onClick={handleCtaAction} className="group relative overflow-hidden min-w-[260px] px-8 py-5 rounded-full active:scale-[0.98] transition-transform duration-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]" aria-label={homeHero.ctaText} style={getCtaButtonStyle()}>
              <div className="absolute inset-0 translate-x-[-150%] animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 skew-x-[-25deg]"></div>
              <div className={`relative z-30 flex items-center justify-center gap-3 font-cinzel font-black text-sm tracking-[0.25em] uppercase ${homeHero.ctaColor === 'transparent' ? 'text-gold-500' : 'text-black drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]'}`}>
                <span>{homeHero.ctaText}</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* INDICADOR DE SCROLL "SAIBA MAIS" */}
        {homeHero.showScrollIndicator !== false && homeFeatureCards.length > 0 && (
          <div className="absolute z-30 bottom-8 left-1/2 -translate-x-1/2">
              <button 
                  onClick={handleScrollDown} 
                  className="group flex flex-col items-center text-center text-gold-500/60 hover:text-gold-400 transition-colors duration-500 animate-subtle-bounce"
                  aria-label="Rolar para saber mais"
              >
                  {homeHero.scrollIndicatorText && (
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 transition-transform duration-300 group-hover:-translate-y-1">
                      {homeHero.scrollIndicatorText}
                    </span>
                  )}
                  <i className={`${homeHero.scrollIndicatorIcon || 'fas fa-chevron-down'} text-xl`}></i>
              </button>
          </div>
        )}
      </section>

      {/* FEATURE CARDS */}
      {activeFeatures.length > 0 && (
        <section ref={featuresSectionRef} className="py-12 px-4 sm:px-6 relative overflow-hidden [perspective:1000px]" aria-labelledby="features-title" style={globalSectionBaseStyle}>
          {renderSectionOverlay(globalSectionOverlayOpacity)}
          <div className="relative z-10">
            <h2 id="features-title" className="sr-only">Nossas Características Premium</h2>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeFeatures.map((card, idx) => (
                <a 
                  key={card.id} 
                  href={card.link || '#'} 
                  target={card.link ? '_blank' : '_self'} 
                  rel={card.link ? 'noopener noreferrer' : ''}
                  className="p-6 spotlight-card rounded-[1.5rem] text-center group transition-all duration-700 [transform-style:preserve-3d] hover:shadow-[0_25px_50px_-12px_rgba(245,158,11,0.15),0_0_0_1px_rgba(255,255,255,0.1)] reveal-on-scroll"
                  style={{ transitionDelay: `${idx * 150}ms` }}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  aria-label={`Saiba mais sobre ${card.title}`}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-opacity [transform:translateZ(40px)]"><i className={`${card.icon} text-4xl text-white`}></i></div>
                  <div className="mb-6 relative inline-block">
                    <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <i 
                      className={`${card.icon} text-4xl ${!featureIconColor ? 'gold-text-gradient' : ''} opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 relative z-10 [transform:translateZ(50px)]`}
                      style={getIconStyle(featureIconColor)}
                    ></i>
                  </div>
                  <h3 className={`text-lg text-white mb-4 tracking-[0.2em] font-black uppercase font-cinzel leading-tight [transform:translateZ(30px)]`}>{card.title}</h3>
                  <div className="relative w-12 h-[2px] mx-auto bg-zinc-800 mb-4 overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-gold-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-bold uppercase tracking-widest [transform:translateZ(20px)]">{card.description}</p>
                </a>
              ))}
            </div>
            <VipDivider />
          </div>
        </section>
      )}

      {/* GALERIA DE EXCELÊNCIA */}
      {gallery && gallery.length > 0 && (
        <section id="gallery" ref={gallerySectionRef} className="py-12 px-4 sm:px-6 relative" style={globalSectionBaseStyle}>
           {renderSectionOverlay(globalSectionOverlayOpacity)}
           <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-10 reveal-on-scroll">
                 <h2 className="text-3xl md:text-5xl font-black font-cinzel text-white uppercase tracking-[0.1em] mb-6">{gallerySectionTitle || 'PORTFÓLIO'}</h2>
                 
                 {galleryCategories.length > 1 && (
                   <div className="flex flex-wrap justify-center gap-3">
                      {galleryCategories.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => setActiveCategory(cat)}
                          className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${activeCategory === cat ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-gold-500/50 hover:text-white'}`}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                 {filteredGallery.map((item, idx) => (
                   <div 
                     key={item.id} 
                     className="group relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer reveal-on-scroll"
                     style={{ transitionDelay: `${(idx % 4) * 100}ms` }}
                     onClick={() => setLightboxImage(item)}
                   >
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex flex-col items-center justify-end p-4 transition-opacity duration-500">
                         {item.title && <p className="text-white font-cinzel text-sm uppercase tracking-widest text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">{item.title}</p>}
                         <span className="text-[8px] text-gold-500 font-black uppercase tracking-[0.3em] mt-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-200">{item.category}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <VipDivider />
        </section>
      )}

      {/* PLANOS/PRODUTOS */}
      {activeProducts.length > 0 && (
        <section id="products-section" ref={productsSectionRef} className="py-16 px-4 sm:px-6 relative" style={productsSectionSpecificStyle}>
          {renderSectionOverlay(globalSectionOverlayOpacity)}
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12 relative reveal-on-scroll">
               {(() => {
                  const titleString = productsSectionTitle || 'NOSSOS PLANOS';
                  const titleWords = titleString.split(' ').filter(w => w.trim() !== '');
                  if (titleWords.length > 1) {
                      const lastWord = titleWords.pop();
                      const firstPart = titleWords.join(' ');
                      return (
                          <h2 ref={productsTitleRef} className="products-section-title-premium text-3xl md:text-5xl font-black font-cinzel text-white uppercase tracking-[0.1em] relative z-10">
                              {firstPart}{' '}
                              <span className="underline-target-mobile">{lastWord}</span>
                          </h2>
                      );
                  }
                  return (
                      <h2 ref={productsTitleRef} className="products-section-title-premium text-3xl md:text-5xl font-black font-cinzel text-white uppercase tracking-[0.1em] relative z-10">
                          {titleString}
                      </h2>
                  );
              })()}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {activeProducts.map((product, idx) => {
                const vipButtonStyle = getProductButtonStyle(product.buttonStyle);
                const cardStyle: React.CSSProperties = { backgroundColor: product.cardBackgroundColor || '#18181b', backgroundImage: product.cardBackgroundImage ? `url(${product.cardBackgroundImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' };

                const commonCardProps = {
                  className: `inner-content spotlight-card flex-1 flex flex-col transition-all duration-500 rounded-2xl overflow-hidden backdrop-blur-sm`,
                  style: { 
                    ...cardStyle,
                    transitionDelay: `${idx * 150}ms`,
                    transformStyle: 'preserve-3d',
                    willChange: 'transform, box-shadow'
                  } as React.CSSProperties,
                  onMouseMove: handleCardMouseMove,
                  onMouseLeave: handleCardMouseLeave
                };

                const cardContent = (
                  <div {...commonCardProps}>
                    {product.cardBackgroundImage && <div className="absolute inset-0 bg-black/70 z-0"></div>}
                    <div className="p-6 flex-1 flex flex-col relative z-10">
                      <div className="mb-6 flex justify-between items-start">
                        {product.type === 'image' && product.imageUrl ? (
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-xl bg-zinc-900/50 flex items-center justify-center">
                              <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl border border-white/10 shadow-xl bg-zinc-900/50">
                              <i
                                className={`${product.icon || 'fas fa-box'} ${!featureIconColor ? 'gold-text-gradient' : ''}`}
                                style={getIconStyle(featureIconColor)}
                              ></i>
                            </div>
                          )}
                        {product.highlight && <div className="px-3 py-1 bg-gold-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-gold-500/30">Destaque</div>}
                      </div>
                      
                      <h3 className="text-lg font-black text-white uppercase tracking-widest mb-1 shadow-black drop-shadow-md font-cinzel">{product.title}</h3>
                      <div className="text-2xl font-light text-zinc-300 mb-6 font-sans shadow-black drop-shadow-md tracking-tighter">{product.price}</div>
                      
                      <div className="flex-1 border-t border-dashed border-white/10 pt-6 mb-8">
                        <ul className="space-y-2">
                          {product.description.split('\n').map((line, i) => (line.trim() && (<li key={i} className="flex items-start gap-3 text-xs font-medium shadow-black drop-shadow-sm"><i className="fas fa-check text-gold-500 mt-0.5 text-[9px]"></i><span>{line}</span></li>)))}
                        </ul>
                      </div>
                      
                      {product.actionType !== 'none' && (
                        <button 
                          onClick={() => handleProductClick(product)} 
                          className="group/btn relative w-full py-4 rounded-lg overflow-hidden transition-all duration-300 active:scale-[0.98] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
                          style={vipButtonStyle}
                        >
                          <div className="absolute inset-0 translate-x-[-150%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10 skew-x-[-25deg]"></div>
                          <div className={`relative z-20 flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-[9px] drop-shadow-sm ${homeHero.ctaColor === 'transparent' || product.buttonStyle === 'transparent' ? 'text-gold-400' : 'text-black'}`}>
                            <span>{product.buttonText || 'SAIBA MAIS'}</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                );

                return product.highlight ? (
                  <div key={product.id} className="animated-border-box rounded-[20px] scale-[1.02] z-10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] flex flex-col reveal-on-scroll" style={{ transitionDelay: `${idx * 150}ms` }}>
                    {cardContent}
                  </div>
                ) : (
                  <div key={product.id} className={`group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-500 border border-white/5 hover:border-white/10 reveal-on-scroll`} style={{ transitionDelay: `${idx * 150}ms` }}>
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SEÇÃO DE DEPOIMENTOS */}
      {activeTestimonials.length > 0 && (
        <section id="testimonials" className="py-16 px-4 sm:px-6 relative overflow-hidden" style={globalSectionBaseStyle}>
           {renderSectionOverlay(globalSectionOverlayOpacity)}
           <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-12 relative reveal-on-scroll">
                 <h2 className="text-3xl md:text-5xl font-black font-cinzel text-white uppercase tracking-[0.1em]">{testimonialsSectionTitle}</h2>
              </div>
              
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-8 no-scrollbar">
                {activeTestimonials.map((item, idx) => (
                  <div 
                    key={item.id}
                    className="flex-shrink-0 snap-center w-[90%] md:w-[45%] lg:w-[30%] bg-zinc-900/50 border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center reveal-on-scroll"
                    style={{ transitionDelay: `${idx * 150}ms` }}
                  >
                    <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-zinc-800 shadow-lg"/>
                    <StarRating rating={item.rating} />
                    <p className="text-zinc-300 italic my-4 text-sm leading-relaxed">&ldquo;{item.testimonialText}&rdquo;</p>
                    <div className="mt-auto pt-4 border-t border-white/10 w-full">
                       <h4 className="text-base font-bold text-white uppercase tracking-widest font-cinzel">{item.name}</h4>
                       <p className="text-xs text-gold-500 font-bold uppercase tracking-widest">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
           <VipDivider />
        </section>
      )}
      
      {/* SEÇÃO DE EQUIPE */}
      {activeTeamMembers.length > 0 && (
        <section id="team" className="py-16 px-4 sm:px-6 relative overflow-hidden [perspective:1000px]" style={globalSectionBaseStyle}>
          {renderSectionOverlay(globalSectionOverlayOpacity)}
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12 relative reveal-on-scroll">
              <h2 className="text-3xl md:text-5xl font-black font-cinzel text-white uppercase tracking-[0.1em]">{teamSectionTitle}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeTeamMembers.map((member, idx) => (
                <div
                  key={member.id}
                  className="spotlight-card rounded-[1.5rem] text-center group transition-all duration-700 [transform-style:preserve-3d] hover:shadow-[0_25px_50px_-12px_rgba(245,158,11,0.15),0_0_0_1px_rgba(255,255,255,0.1)] reveal-on-scroll"
                  style={{ transitionDelay: `${idx * 150}ms` }}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                >
                  <div className="p-8 [transform:translateZ(20px)]">
                    <div className="relative inline-block mb-4">
                      <img src={member.imageUrl} alt={member.name} className="w-32 h-32 rounded-full object-cover border-4 border-zinc-800 shadow-lg"/>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-black text-lg shadow-md">
                        <i className="fas fa-star"></i>
                      </div>
                    </div>
                    <h3 className="text-xl text-white font-cinzel font-bold uppercase tracking-widest">{member.name}</h3>
                    <p className="text-xs text-gold-500 font-black uppercase tracking-[0.3em] mb-4">{member.role}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">{member.bio}</p>
                    {member.socialLinks && (
                       <div className="mt-6 pt-6 border-t border-white/10 flex justify-center gap-4">
                          {member.socialLinks.instagram && <a href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white"><i className="fab fa-instagram text-xl"></i></a>}
                          {member.socialLinks.facebook && <a href={member.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white"><i className="fab fa-facebook text-xl"></i></a>}
                          {member.socialLinks.twitter && <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white"><i className="fab fa-twitter text-xl"></i></a>}
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SEÇÃO FAQ */}
      {activeFaqItems.length > 0 && (
        <section id="faq" className="py-16 px-4 sm:px-6 relative" style={globalSectionBaseStyle}>
          {renderSectionOverlay(globalSectionOverlayOpacity)}
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-12 relative reveal-on-scroll">
              <h2 className="text-3xl md:text-5xl font-black font-cinzel text-white uppercase tracking-[0.1em]">{faqSectionTitle}</h2>
            </div>
            <div className="space-y-4">
              {activeFaqItems.map((item, idx) => (
                <div key={item.id} className="reveal-on-scroll" style={{ transitionDelay: `${idx * 100}ms` }}>
                  <button
                    onClick={() => toggleFaq(item.id)}
                    className="w-full text-left p-6 bg-zinc-900/50 border border-white/5 rounded-xl flex justify-between items-center group transition-all duration-300 hover:border-gold-500/30"
                  >
                    <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-widest group-hover:text-gold-500 transition-colors">{item.question}</h3>
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gold-500">
                      <i className={`fas fa-plus transition-transform duration-500 ${openFaqId === item.id ? 'rotate-45' : 'rotate-0'}`}></i>
                    </div>
                  </button>
                  <div
                    className="overflow-hidden transition-[max-height] duration-700 ease-in-out"
                    style={{ maxHeight: openFaqId === item.id ? '500px' : '0' }}
                  >
                    <p className="p-6 pt-4 text-zinc-400 text-sm leading-relaxed border-t border-dashed border-white/10 mt-2 bg-black/20 rounded-b-xl">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SEÇÃO CONTATO & LOCALIZAÇÃO */}
      {contactLocation && contactLocation.showSection !== false && (
        <section id="contact" className="py-24" style={globalSectionBaseStyle}>
          {renderSectionOverlay(globalSectionOverlayOpacity)}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="reveal-on-scroll">
              <h2 className="text-3xl md:text-5xl font-black font-cinzel text-white uppercase tracking-[0.1em] mb-8">{contactLocation.sectionTitle}</h2>
              <div className="space-y-6">
                {contactLocation.showAddress !== false && (
                  <div className="flex items-start gap-4">
                    <i className="fas fa-map-marker-alt text-gold-500 mt-1"></i>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Endereço</h4>
                      <p className="text-white whitespace-pre-line">{contactLocation.address}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <i className="fas fa-phone-alt text-gold-500 mt-1"></i>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Telefone</h4>
                    <a href={`tel:${contactLocation.phone}`} className="text-white hover:text-gold-400 transition-colors">{contactLocation.phone}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <i className="fas fa-envelope text-gold-500 mt-1"></i>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Email</h4>
                    <a href={`mailto:${contactLocation.email}`} className="text-white hover:text-gold-400 transition-colors">{contactLocation.email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <i className="fas fa-clock text-gold-500 mt-1"></i>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Horários</h4>
                    <p className="text-white whitespace-pre-line">{contactLocation.hours}</p>
                  </div>
                </div>
              </div>
            </div>
            {contactLocation.showMap !== false && (
              <div className="reveal-on-scroll w-full aspect-square lg:aspect-auto lg:h-full min-h-[400px]">
                <iframe
                  src={contactLocation.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  className="map-iframe border-0"
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização no Google Maps"
                ></iframe>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
