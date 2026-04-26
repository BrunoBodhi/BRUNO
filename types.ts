
// Estruturas genéricas para conteúdo configurável
export interface GenericFeatureCard {
  id: string;
  active: boolean; // NOVO: Controle de visibilidade
  icon: string;
  title: string;
  description: string;
  link?: string; // Opcional: link para o card de feature
}

export type CtaActionType = 'whatsapp' | 'telegram' | 'scroll_to_top' | 'none' | 'external_link' | 'payment' | 'scroll_to_products' | 'scroll_to_gallery' | 'booking';

// Nova interface para Agendamento
export interface BookingService {
  id: string;
  name: string;
  duration: string; // ex: "30 min"
  price?: string;
}

export interface BookingConfig {
  enabled: boolean;
  sectionTitle: string;
  itemLabel: string; // ex: "Serviço", "Produto", "Janela"
  icon: string; // ex: "fa-calendar-alt"
  services: BookingService[];
  workingHours: string; // Texto descritivo
  availableDays: string[]; // ex: ["Segunda", "Terça"]
  timeSlots: string[]; // ex: ["09:00", "10:00"]
  closingDays: string[]; // NOVO: Datas ou Dias indisponíveis
  unavailableHours: string[]; // NOVO: Horários específicos indisponíveis
  whatsappNotify: boolean; // Se deve enviar para o whatsapp ao agendar
  successActionType: 'whatsapp' | 'telegram' | 'external_link' | 'none';
  successLink?: string;
  telegramUsername?: string;
  whatsappNumber?: string; // NOVO: Adicionado para completar a funcionalidade de WhatsApp
}
export interface PaymentApiEntry {
  id: string;
  name: string; // Nome da API, ex: "Mercado Pago", "Stripe"
  url: string;  // A URL real para o gateway de pagamento
}

// Definição de Produto/Plano/Curso
export interface ProductEntry {
  id:string;
  active: boolean;
  highlight: boolean; // Se é o item em destaque (borda dourada, maior)
  type: 'icon' | 'image'; // Visual: Ícone ou Foto do produto
  icon?: string;
  imageUrl?: string;
  title: string;
  price: string; // Texto livre: "R$ 99,90" ou "Grátis"
  description: string; // Lista de benefícios (quebra de linha)
  buttonText: string;
  buttonStyle?: 'solid' | 'transparent'; // Novo: Estilo do botão
  actionType: 'whatsapp' | 'telegram' | 'external_link' | 'none' | 'booking';
  link?: string; // Link de checkout ou página de vendas
  
  // Customização visual individual do Card
  cardBackgroundColor?: string;
  cardBackgroundImage?: string;
}

// Interface para itens da Galeria
export interface GalleryItem {
  id: string;
  imageUrl: string;
  category: string; // Ex: "Cortes", "Barba", "Espaço"
  title?: string;   // Opcional: Nome do corte ou descrição curta
  active: boolean; // NOVO: Controle de visibilidade
}

// NOVO: Interface para Depoimentos
export interface TestimonialItem {
  id: string;
  imageUrl: string;
  name: string;
  role: string; // Ex: "Cliente VIP", "CEO da Empresa X"
  testimonialText: string;
  rating: number; // 1 a 5
  active: boolean; // NOVO: Controle de visibilidade
}

// NOVO: Interface para Membros da Equipe
export interface TeamMember {
  id: string;
  imageUrl: string;
  name: string;
  role: string; // Ex: "Barbeiro Mestre", "Colorista"
  bio: string;
  active: boolean; // NOVO: Controle de visibilidade
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

// NOVO: Interface para FAQ
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// NOVO: Interface para Contato e Localização
export interface ContactLocationConfig {
  sectionTitle: string;
  address: string;
  phone: string;
  email: string;
  hours: string; // Multiline text for flexibility
  mapEmbedUrl: string;
  showSection: boolean; // NOVO: Controle de visibilidade
  showAddress?: boolean; // NOVO: Controle de visibilidade do endereço
  showMap?: boolean;     // NOVO: Controle de visibilidade do mapa
}


// Nova tipo para preferência de método de pagamento
export type PaymentMethodPreference = 'api_direct' | 'whatsapp_chat';
export type PaymentMessageType = 'instructions' | 'confirmation'; // NOVO

// Configuração da marca e do conteúdo do site
export interface BrandConfig {
  // Global
  logoUrl: string;
  logoStyle?: 'mask' | 'original'; // NOVO: Controle de estilo do logo ('mask' = adapta cor, 'original' = cores reais)
  brandName: string;
  brandNameColor?: string; // NOVO: Cor para o nome da marca no cabeçalho
  footerText: string;
  pageTitle: string;
  siteUrl?: string; // NOVO: URL oficial do site (Domínio na Hostinger)
  /**
   * Número WhatsApp principal para contato (ex: '5511987654321') ou URL completa (ex: 'https://wa.me/5511987654321?text=Ola').
   */
  whatsapp: string; 
  /**
   * Usuário ou link do Telegram (ex: 'meu_usuario' ou 'https://t.me/meu_usuario').
   */
  telegram?: string; 

  // Cores & Fontes
  primaryColor: string;
  secondaryColor: string;
  headerBgColor: string;
  fontFamily: 'cinzel' | 'sans';
  titleFont: 'cinzel' | 'sans';
  subtitleFont: 'cinzel' | 'sans';
  descFont: 'cinzel' | 'sans';
  featureIconColor?: string; // NOVO: Cor para os ícones dos cards de recurso

  // Estilo Global de Seções
  globalSectionBackgroundColor?: string;
  globalSectionBackgroundImage?: string;
  globalSectionOverlayOpacity?: number; // NOVO: Opacidade da camada escura sobre o fundo

  // Home Page
  homeHero: {
    title: string;
    titleColor?: string; // NOVO: Cor para o título principal da capa
    subtitle: string;
    description: string;
    image: string;
    heroBackgroundType: 'image' | 'video'; // Novo: Tipo de fundo do Hero (imagem ou vídeo)
    heroVideoUrl?: string; // Novo: URL do vídeo de fundo (opcional)
    heroBackgroundPosition: 'top' | 'center' | 'bottom'; // Novo: Posição vertical do fundo (image/video)
    overlayOpacity: number;
    ctaText: string; // CTA principal do hero
    ctaAction: CtaActionType; // Ação do CTA principal
    ctaLink?: string; // Link externo se ctaAction for 'external_link'
    ctaColor?: string; // NOVO: Cor personalizada do botão Hero
    showScrollIndicator?: boolean; // NOVO: Controla a visibilidade do indicador de scroll
    scrollIndicatorIcon?: string; // NOVO: Controla o ícone do indicador de scroll
    scrollIndicatorText?: string; // NOVO: Controla o texto do indicador de scroll
  };
  homeFeatureCards: GenericFeatureCard[]; // Os 3 cards de feature na Home

  // NOVA SEÇÃO: Galeria / Portfólio
  gallerySectionTitle: string;
  gallery: GalleryItem[];

  // NOVA SEÇÃO: Produtos e Planos
  productsSectionTitle: string; // Título da seção (ex: "NOSSOS PLANOS", "CURSOS")
  products: ProductEntry[];
  // FIX: Added specific background properties for the products section.
  productsSectionBackgroundColor?: string;
  productsSectionBackgroundImage?: string;

  // NOVA SEÇÃO: Depoimentos
  testimonialsSectionTitle: string;
  testimonials: TestimonialItem[];
  
  // NOVA SEÇÃO: Equipe
  teamSectionTitle: string;
  team: TeamMember[];

  // NOVA SEÇÃO: FAQ
  faqSectionTitle: string;
  faq: FaqItem[];

  // NOVA SEÇÃO: Agendamento
  booking: BookingConfig;

  // NOVA SEÇÃO: Contato e Localização
  contactLocation: ContactLocationConfig;

  // Mensagens de contato (existente)
  contactMessages: { id: string; name: string; template: string; }[];

  // Campos para detalhes de pagamento
  pixKey?: string;
  bankName?: string;
  bankAccount?: string;
  bankAgency?: string;
  paymentApis: PaymentApiEntry[]; // Array para múltiplas APIs de pagamento
  paymentMethodPreference?: PaymentMethodPreference; // Preferência de método de pagamento quando CTA é 'payment'
  paymentMessageType?: PaymentMessageType; // NOVO: Tipo de mensagem para pagamento manual
  paymentConfirmationMessageTemplate?: string; // NOVO: Template para mensagem de confirmação de pagamento
  manualPaymentInstructions?: string; // NOVO: Instruções detalhadas para pagamentos manuais
}

// Configuração geral da loja (simplificada, sem agendamento)
export interface StoreConfig {
  adminPin: string;
  brand: BrandConfig;
}

// Tipos de visualização da página
export type View = 'home' | 'admin_login' | 'admin_panel';
