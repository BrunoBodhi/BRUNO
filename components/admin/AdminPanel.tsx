import React, { useState, useRef, useEffect } from 'react';
import { StoreConfig, BrandConfig } from '../../types'; 
import { DEFAULT_BRAND_CONFIG, DEFAULT_CONFIG, MASTER_PIN_VALUE } from '../../constants';
import * as api from '../../api'; 

import GlobalSettingsEditor from './GlobalSettingsEditor';
import HeroSectionEditor from './HeroSectionEditor';
import HomeFeaturesEditor from './HomeFeaturesEditor';
import ContactMessagesEditor from './ContactMessagesEditor';
import PaymentConfigEditor from './PaymentConfigEditor';
import PinManagementEditor from './PinManagementEditor';
import ProductsEditor from './ProductsEditor';
import GalleryEditor from './GalleryEditor';
import StyleSettingsEditor from './StyleSettingsEditor';
import TestimonialsEditor from './TestimonialsEditor';
import TeamEditor from './TeamEditor';
import FaqEditor from './FaqEditor';
import ContactLocationEditor from './ContactLocationEditor'; // NOVO: Importando editor de Contato
import AgendaEditor from './AgendaEditor'; // NOVO: Importando editor de Agenda
import BookingsManagerDrawer from './BookingsManagerDrawer';
import { compressImage, isFileSizeOk } from '../../utils/mediaUtils';


interface AdminPanelProps {
  storeConfig: StoreConfig;
  setStoreConfig: React.Dispatch<React.SetStateAction<StoreConfig>>;
  onLogout: () => void;
  onNewPinCreated: (oldPin: string, newPin: string) => void;
  onResetCurrentPinData: () => void; 
  activeAdminPin: string | null;
  onPublish: () => void; 
}

type AdminSection = 'global' | 'hero' | 'features' | 'products' | 'gallery' | 'msgs' | 'pay' | 'access' | 'style' | 'testimonials' | 'team' | 'faq' | 'contact' | 'agenda' | 'bookings_mgmt';

const AdminPanel: React.FC<AdminPanelProps> = ({
  storeConfig,
  setStoreConfig,
  onLogout,
  onNewPinCreated,
  onResetCurrentPinData, 
  activeAdminPin,
  onPublish, 
}) => {
  const [activeEditor, setActiveEditor] = useState<AdminSection | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localVideoPreviewUrl, setLocalVideoPreviewUrl] = useState<string | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    setFirebaseConnected(api.isFirebaseInitialized());
  }, []);

  useEffect(() => {
    return () => {
      if (localVideoPreviewUrl) URL.revokeObjectURL(localVideoPreviewUrl);
    };
  }, [localVideoPreviewUrl]);
  
  // Limpa preview se mudar tipo de fundo
  useEffect(() => {
    if (storeConfig.brand.homeHero.heroBackgroundType === 'image' && localVideoPreviewUrl) {
      handleClearLocalVideoPreview();
    }
  }, [storeConfig.brand.homeHero.heroBackgroundType]);


  const handleSave = async () => {
    setIsSaving(true);
    if (activeAdminPin) {
      try {
        await api.saveConfig(activeAdminPin, storeConfig);
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (err) {
        console.error(err);
        alert('ERRO AO SALVAR.');
      }
    }
    setIsSaving(false);
  };

  const handleResetToDefaults = () => {
    if (confirm('ATENÇÃO: Deseja restaurar todas as configurações visuais para o padrão de fábrica? Esta ação não pode ser desfeita. Isso NÃO afeta os dados de acesso/licenças.')) {
      setStoreConfig(prev => ({
        ...prev,
        brand: { ...DEFAULT_BRAND_CONFIG }
      }));
      alert('Configurações restauradas! Não esqueça de clicar em SALVAR para confirmar no banco de dados.');
    }
  };

  const handleUpdateBrandConfig = (updates: Partial<BrandConfig>) => {
    setStoreConfig(prev => ({
      ...prev,
      brand: { ...prev.brand, ...updates }
    }));
  };

  const handleUpdateHomeHeroConfig = (updates: Partial<BrandConfig['homeHero']>) => {
    setStoreConfig(prev => ({
      ...prev,
      brand: { ...prev.brand, homeHero: { ...prev.brand.homeHero, ...updates } }
    }));
  };

  const [isMediaUploading, setIsMediaUploading] = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'logoUrl' | 'homeHeroImage' | 'homeHeroVideoLocalPreview' | 'homeHeroVideoPermanent') => { 
    const file = e.target.files?.[0];
    if (file) {
      setIsMediaUploading(true);
      if (targetField === 'homeHeroVideoLocalPreview') {
        if (localVideoPreviewUrl) URL.revokeObjectURL(localVideoPreviewUrl);
        setLocalVideoPreviewUrl(URL.createObjectURL(file));
        setIsMediaUploading(false);
      } else if (targetField === 'homeHeroVideoPermanent') {
        // Tenta salvar o vídeo permanentemente se for pequeno o suficiente (< 700KB para Firestore/Base64)
        if (isFileSizeOk(file, 0.7)) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            handleUpdateHomeHeroConfig({ heroVideoUrl: base64 });
            alert('VÍDEO CARREGADO COM SUCESSO!');
            setIsMediaUploading(false);
          };
          reader.readAsDataURL(file);
        } else {
          alert('VÍDEO MUITO GRANDE. Para manter a performance e compatibilidade, o limite para salvar no banco é de 700KB. Para vídeos maiores, utilize um link direto (MP4) de um servidor externo.');
          setIsMediaUploading(false);
        }
      } else {
        try {
          const compressedBase64 = await compressImage(file);
          if (targetField === 'logoUrl') handleUpdateBrandConfig({ logoUrl: compressedBase64 });
          else if (targetField === 'homeHeroImage') handleUpdateHomeHeroConfig({ image: compressedBase64 });
        } catch (error) {
          console.error("Erro ao processar imagem:", error);
          alert('Erro ao processar imagem. Tente outro arquivo.');
        } finally {
          setIsMediaUploading(false);
        }
      }
    }
    e.target.value = '';
  };

  const handleClearLocalVideoPreview = () => {
    if (localVideoPreviewUrl) URL.revokeObjectURL(localVideoPreviewUrl);
    setLocalVideoPreviewUrl(null);
  };

  // Menu de navegação dinâmico baseado no PIN
  const menuItems = [
    { id: 'global', label: 'CONFIG. GERAL', icon: 'fa-cog' },
  ];

  // Adiciona o item de ACESSO apenas se for o PIN MASTER
  if (activeAdminPin === MASTER_PIN_VALUE) {
    menuItems.push({ id: 'access', label: 'LICENÇAS', icon: 'fa-key' });
  }

  // Agrega Agenda e Gestão
  menuItems.push(
    { id: 'bookings_mgmt', label: 'AGENDAMENTOS', icon: 'fa-calendar-alt' },
    { id: 'agenda', label: 'AGENDA', icon: storeConfig.brand.booking.icon || 'fa-calendar-check' },
    { id: 'style', label: 'ESTILO/CORES', icon: 'fa-brush' },
    { id: 'hero', label: 'CAPA/VIDEO', icon: 'fa-star' },
    { id: 'features', label: 'DESTAQUES', icon: 'fa-layer-group' },
    { id: 'products', label: 'CATÁLOGO', icon: 'fa-box-open' }, 
    { id: 'gallery', label: 'GALERIA', icon: 'fa-camera' }, 
    { id: 'team', label: 'EQUIPE', icon: 'fa-users' },
    { id: 'testimonials', label: 'DEPOIMENTOS', icon: 'fa-comment-dots' },
    { id: 'faq', label: 'FAQ', icon: 'fa-question-circle' },
    { id: 'contact', label: 'CONTATO', icon: 'fa-map-marker-alt' },
    { id: 'msgs', label: 'MENSAGENS', icon: 'fa-comment-alt' },
    { id: 'pay', label: 'FINANCEIRO', icon: 'fa-credit-card' },
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-400 font-sans pb-20 overflow-x-hidden selection:bg-gold-500/30 selection:text-gold-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        
        {/* Top Bar Minimalista */}
        <header className="flex flex-wrap items-center justify-between gap-6 mb-16 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
             {/* LOGO NO ADMIN (Com lógica de máscara) */}
             {storeConfig.brand.logoUrl && (
                storeConfig.brand.logoStyle === 'mask' ? (
                  // AUMENTADO: h-16 md:h-20 (era h-12)
                  <div className="relative h-16 md:h-20 w-auto">
                     <img src={storeConfig.brand.logoUrl} className="h-full w-auto opacity-0" alt="" />
                     <div className="absolute inset-0 dynamic-logo-mask" style={{ '--logo-url': `url(${storeConfig.brand.logoUrl})` } as React.CSSProperties}></div>
                  </div>
                ) : (
                  // AUMENTADO: h-16 md:h-20 (era h-12)
                  <img src={storeConfig.brand.logoUrl} alt="Logo" className="h-16 md:h-20 w-auto object-contain" />
                )
             )}
             
             <div>
                <h1 className="font-cinzel text-3xl text-white font-black tracking-[0.2em] mb-1">
                  PAINEL <span className="text-gold-500">ADMIN</span>
                </h1>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  <span className="flex items-center gap-1">
                    PIN: <span className="text-zinc-300">{activeAdminPin}</span>
                  </span>
                  <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                  <span className={`flex items-center gap-1 ${firebaseConnected ? 'text-green-500/80' : 'text-red-500'}`}>
                    BANCO: {firebaseConnected ? 'ON' : 'OFF'}
                  </span>
                </div>
             </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Botão RESETAR */}
            <button 
              onClick={handleResetToDefaults}
              className="relative group overflow-hidden px-4 py-3 bg-zinc-950 border border-white/5 text-zinc-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 hover:border-red-500/30 hover:text-red-400 rounded-lg"
              title="Restaurar para o padrão de fábrica"
            >
              <div className="relative z-10 flex items-center gap-2">
                <i className="fas fa-undo-alt text-base"></i>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[7px] opacity-50">SISTEMA</span>
                  <span>REDEFINIR</span>
                </div>
              </div>
            </button>

             {/* Botão SALVAR */}
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="relative group overflow-hidden px-6 py-3 bg-zinc-900 border border-gold-500/30 text-gold-500 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 hover:bg-gold-500 hover:text-black hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              <div className="relative z-10 flex items-center gap-3">
                <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'} text-lg`}></i>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] opacity-70">CONFIRMAR</span>
                  <span>{isSaving ? 'SALVANDO...' : 'SALVAR'}</span>
                </div>
              </div>
            </button>

            {/* Botão PUBLICAR */}
            <button 
              onClick={onPublish} 
              className="relative group overflow-hidden px-6 py-3 bg-zinc-950 border border-white/10 text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-900/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] rounded-lg"
            >
              <div className="relative z-10 flex items-center gap-3">
                 <i className="fas fa-globe text-lg"></i>
                 <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] opacity-50">ONLINE</span>
                  <span>PUBLICAR</span>
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Menu Grid Navegação */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveEditor(item.id as AdminSection)}
              className={`group relative h-32 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden
                ${activeEditor === item.id 
                  ? 'bg-gold-500 text-black border-gold-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]' 
                  : (item.id === 'booking' || item.id === 'bookings_mgmt' || item.id === 'access') 
                    ? 'bg-zinc-900 border-gold-500/20 text-zinc-300 hover:bg-zinc-800 hover:border-gold-500/40'
                    : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 hover:border-white/10'
                }`}
            >
              {(item.id === 'booking' || item.id === 'access') && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-gold-500 text-[6.5px] font-black text-black rounded uppercase tracking-tighter">PRINCIPAL</div>
              )}
              <i className={`fas ${item.icon} text-2xl transition-transform duration-300 group-hover:scale-110 ${activeEditor === item.id ? 'text-black' : 'text-zinc-600 group-hover:text-gold-500'}`}></i>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-center px-2">{item.label}</span>
            </button>
          ))}
        </div>

        {!activeEditor && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <i className="fas fa-cube text-6xl text-zinc-700 mb-6"></i>
            <p className="font-cinzel text-sm uppercase tracking-[0.4em] text-zinc-500">SELECIONE UM MÓDULO</p>
          </div>
        )}
      </div>

      {/* MODAIS DE EDIÇÃO */}
      
      {activeEditor === 'global' && (
        <GlobalSettingsEditor
          brand={storeConfig.brand}
          onUpdate={handleUpdateBrandConfig}
          onClose={() => setActiveEditor(null)}
          onLogoUpload={(e) => handleMediaUpload(e, 'logoUrl')}
          isUploading={isMediaUploading}
        />
      )}

      {activeEditor === 'style' && (
        <StyleSettingsEditor
          brand={storeConfig.brand}
          onUpdate={handleUpdateBrandConfig}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'hero' && (
        <HeroSectionEditor
          homeHero={storeConfig.brand.homeHero}
          onUpdate={handleUpdateHomeHeroConfig}
          onClose={() => setActiveEditor(null)}
          onHomeHeroImageUpload={(e) => handleMediaUpload(e, 'homeHeroImage')}
          onHomeHeroVideoLocalUpload={(e) => handleMediaUpload(e, 'homeHeroVideoLocalPreview')}
          onHomeHeroVideoPermanentUpload={(e) => handleMediaUpload(e, 'homeHeroVideoPermanent')}
          localVideoPreviewUrl={localVideoPreviewUrl}
          onClearLocalVideoPreview={handleClearLocalVideoPreview}
          isUploading={isMediaUploading}
        />
      )}

      {activeEditor === 'features' && (
        <HomeFeaturesEditor
          homeFeatureCards={storeConfig.brand.homeFeatureCards}
          onUpdate={(cards) => handleUpdateBrandConfig({ homeFeatureCards: cards })}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'gallery' && (
        <GalleryEditor
          gallery={storeConfig.brand.gallery || []}
          sectionTitle={storeConfig.brand.gallerySectionTitle}
          onUpdate={(gallery) => handleUpdateBrandConfig({ gallery })}
          onUpdateTitle={(title) => handleUpdateBrandConfig({ gallerySectionTitle: title })}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'products' && (
        <ProductsEditor
          products={storeConfig.brand.products || []}
          sectionTitle={storeConfig.brand.productsSectionTitle || 'NOSSOS PLANOS'}
          sectionBackgroundColor={storeConfig.brand.productsSectionBackgroundColor}
          sectionBackgroundImage={storeConfig.brand.productsSectionBackgroundImage}
          onUpdateProducts={(products) => handleUpdateBrandConfig({ products })}
          onUpdateSectionSettings={(updates) => handleUpdateBrandConfig(updates)}
          onClose={() => setActiveEditor(null)}
        />
      )}
      
      {activeEditor === 'team' && (
        <TeamEditor
          team={storeConfig.brand.team || []}
          sectionTitle={storeConfig.brand.teamSectionTitle}
          onUpdate={(team) => handleUpdateBrandConfig({ team })}
          onUpdateTitle={(title) => handleUpdateBrandConfig({ teamSectionTitle: title })}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'testimonials' && (
        <TestimonialsEditor
          testimonials={storeConfig.brand.testimonials || []}
          sectionTitle={storeConfig.brand.testimonialsSectionTitle}
          onUpdate={(testimonials) => handleUpdateBrandConfig({ testimonials })}
          onUpdateTitle={(title) => handleUpdateBrandConfig({ testimonialsSectionTitle: title })}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'faq' && (
        <FaqEditor
          faq={storeConfig.brand.faq || []}
          sectionTitle={storeConfig.brand.faqSectionTitle}
          onUpdate={(faq) => handleUpdateBrandConfig({ faq })}
          onUpdateTitle={(title) => handleUpdateBrandConfig({ faqSectionTitle: title })}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'contact' && (
        <ContactLocationEditor
          contactLocation={storeConfig.brand.contactLocation}
          onUpdate={(updates) => handleUpdateBrandConfig({ contactLocation: { ...storeConfig.brand.contactLocation, ...updates } })}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'agenda' && (
        <AgendaEditor
          storeConfig={storeConfig}
          onUpdateBooking={(updates) => handleUpdateBrandConfig({ booking: { ...storeConfig.brand.booking, ...updates } })}
          onClose={() => setActiveEditor(null)}
          activeAdminPin={activeAdminPin}
        />
      )}

      {activeEditor === 'bookings_mgmt' && activeAdminPin && (
        <BookingsManagerDrawer
          pin={activeAdminPin}
          storeConfig={storeConfig}
          onUpdateBooking={(updates) => handleUpdateBrandConfig({ booking: { ...storeConfig.brand.booking, ...updates } })}
          onClose={() => setActiveEditor(null)}
        />
      )}



      {activeEditor === 'msgs' && (
        <ContactMessagesEditor
          contactMessages={storeConfig.brand.contactMessages}
          brand={storeConfig.brand} // Passa a prop brand
          onUpdate={handleUpdateBrandConfig} // Passa a função onUpdate que aceita Partial<BrandConfig>
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'pay' && ( // Este é o editor do Módulo Financeiro
        <PaymentConfigEditor
          brand={storeConfig.brand}
          onUpdate={handleUpdateBrandConfig}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {/* SEGURANÇA: Só renderiza o editor de acesso se for o Master PIN */}
      {activeEditor === 'access' && activeAdminPin === MASTER_PIN_VALUE && (
        <PinManagementEditor
          activeAdminPin={activeAdminPin}
          onNewPinCreated={(oldPin, newPin) => {
            onNewPinCreated(oldPin, newPin);
            setActiveEditor(null);
          }}
          onResetCurrentPinData={onResetCurrentPinData}
          onClose={() => setActiveEditor(null)}
          siteUrl={storeConfig.brand.siteUrl}
        />
      )}
    </div>
  );
};

export default AdminPanel;