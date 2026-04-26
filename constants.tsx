
import { StoreConfig, BrandConfig } from './types'; 

export const MASTER_PIN_VALUE = '1010';

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  // Global
  logoUrl: '', 
  logoStyle: 'mask', // Padrão: Adaptável à cor do tema
  brandName: 'PLATAFORMA DIGITAL', 
  brandNameColor: null, // Default to use gold-text-gradient
  footerText: 'Plataforma Digital © 2026. Todos os direitos reservados.',
  pageTitle: 'Plataforma Digital | Gestão Premium para seu Negócio',
  siteUrl: '', 
  whatsapp: '5511999999999', 
  telegram: '',
  
  // Cores & Fontes
  primaryColor: '#f59e0b',
  secondaryColor: '#a87932',
  headerBgColor: '#0a0a0a',
  fontFamily: 'sans',
  titleFont: 'cinzel', 
  subtitleFont: 'sans',
  descFont: 'sans',
  featureIconColor: null, // Default to use gold-text-gradient

  // Estilo Global de Seções
  globalSectionBackgroundColor: null,
  globalSectionBackgroundImage: null,
  globalSectionOverlayOpacity: null, // NOVO: Opacidade da camada escura sobre o fundo

  // Home Page - Tema genérico focado em vender a PLATAFORMA DIGITAL
  homeHero: { 
    title: 'SISTEMA PREMIUM\nPARA O SEU NEGÓCIO', // Removido o ponto final
    subtitle: 'Digitalize Gerencie e Venda Mais', // Removida a vírgula
    description: 'Eleve a gestão do seu negócio a um novo patamar com a Plataforma Digital. Controle agendamentos, pagamentos, conteúdo e muito mais, com um painel administrativo intuitivo e poderoso.', // Mantido o ponto final na descrição principal para clareza. Se o usuário quiser remover "Digital." da descrição anterior, essa é a descrição atual e não possui essa frase.
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI yeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZjIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJwYXR0ZXJuMSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjgiIGhlaWdodD0iOCI+CiAgPGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMxYjFhMTkiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwYTBhMGEiLz4KPHJlYWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybjEpIi8+CjxpbmUgeDE9IjAiIHkxPSIwIiB4Mj0iMTAwJSI yeTI9IjEwMCUiIHN0cm9rZT0iIzMyMjkyNCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPGxpbmUgeDE9IjEwMCUiIHkxPSIwIiB4Mj0iMCIgeTI9IjEwMCUiIHN0cm9rZT0iIzMyMjkyNCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMxYjFhMTkiLz4KPC9zdmc+',
    heroBackgroundType: 'video', 
    heroVideoUrl: 'https://videos.pexels.com/video-files/3844053/3844053-sd_640_360_30fps.mp4', // Vídeo genérico de negócio/tecnologia
    heroBackgroundPosition: 'center', 
    overlayOpacity: 0.6,
    ctaText: 'COMECE AGORA', 
    ctaAction: 'whatsapp',
    ctaColor: '#f59e0b',
    showScrollIndicator: true,
    scrollIndicatorIcon: 'fas fa-chevron-down',
    scrollIndicatorText: 'SAIBA MAIS',
  },
  homeFeatureCards: [
    { id: 'hf1', icon: 'fa-solid fa-crown', title: 'ATENDIMENTO VIP', description: 'Experimente um serviço exclusivo e personalizado, onde cada detalhe é pensado para sua satisfação total.' },
    { id: 'hf2', icon: 'fa-solid fa-spray-can-sparkles', title: 'PRODUTOS PREMIUM', description: 'Utilizamos apenas produtos de alta performance e marcas renomadas para garantir o melhor resultado.' },
    { id: 'hf3', icon: 'fa-solid fa-gem', title: 'AMBIENTE EXCLUSIVO', description: 'Desfrute de um espaço sofisticado e confortável, projetado para oferecer uma experiência única e relaxante.' }
  ],

  // Galeria
  gallerySectionTitle: 'PORTFÓLIO DE EXCELÊNCIA',
  gallery: [],

  // Produtos e Planos - Vendendo os planos da PLATAFORMA DIGITAL
  productsSectionTitle: 'ESCOLHA SEU PLANO',
  products: [
    { 
      id: 'p1', 
      active: true, 
      highlight: false, 
      type: 'icon', 
      icon: 'fa-regular fa-lightbulb', 
      title: 'PLANO ESSENCIAL', 
      price: 'R$ 97,90/mês', 
      description: '• Gestão de Conteúdo e Serviços\n• Agendamentos Básicos\n• Suporte Padrão\n• 1 Usuário Administrador', 
      buttonText: 'COMEÇAR BÁSICO', 
      actionType: 'whatsapp' 
    },
    { 
      id: 'p2', 
      active: true, 
      highlight: true, // Destaque para o plano intermediário
      type: 'icon', 
      icon: 'fa-solid fa-crown', 
      title: 'PLANO BUSINESS PRO', 
      price: 'R$ 197,90/mês', 
      description: '• Todos os recursos do Essencial\n• Agendamentos Avançados\n• Integração de Pagamentos\n• Relatórios de Vendas\n• 3 Usuários Administradores', 
      buttonText: 'MELHORAR MEU NEGÓCIO', 
      actionType: 'whatsapp' 
    },
    { 
      id: 'p3', 
      active: true, 
      highlight: false, 
      type: 'icon', 
      icon: 'fa-solid fa-gem', 
      title: 'PLANO EMPRESARIAL VIP', 
      price: 'R$ 497,90/mês', 
      description: '• Todos os recursos do Business Pro\n• Multi-filiais (em breve)\n• Suporte 24/7 e Consultoria\n• Recursos Customizáveis\n• Usuários ilimitados', 
      buttonText: 'REVOLUCIONAR', 
      actionType: 'whatsapp',
      link: '#' 
    }
  ],
  // FIX: Added default undefined values for products section background.
  productsSectionBackgroundColor: null,
  productsSectionBackgroundImage: null,
  
  // Depoimentos
  testimonialsSectionTitle: 'O QUE NOSSOS CLIENTES DIZEM',
  testimonials: [],

  // Equipe
  teamSectionTitle: 'NOSSA EQUIPE DE ESPECIALISTAS',
  team: [],

  // FAQ
  faqSectionTitle: 'PERGUNTAS FREQUENTES',
  faq: [],

  // Agendamento
  booking: {
    enabled: true,
    sectionTitle: 'AGENDAMENTO ONLINE',
    itemLabel: 'Serviço',
    icon: 'fa-calendar-alt',
    services: [
      { id: 's1', name: 'Serviço Premium', duration: '60 min', price: 'R$ 150,00' },
      { id: 's2', name: 'Consultoria Especializada', duration: '45 min', price: 'R$ 200,00' }
    ],
    workingHours: 'Segunda a Sexta: 09h às 18h\nSábado: 09h às 13h',
    availableDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    timeSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    closingDays: [],
    unavailableHours: [],
    whatsappNotify: true,
    successActionType: 'whatsapp',
    successLink: '',
    telegramUsername: '',
    whatsappNumber: ''
  },

  // Contato e Localização
  contactLocation: {
    sectionTitle: 'CONTATO & LOCALIZAÇÃO',
    address: 'Rua das Palmeiras, 123, Sala 10\nCidade Alta, SP - 12345-678',
    phone: '(11) 98765-4321',
    email: 'contato@suamarca.com',
    hours: 'Seg - Sex: 09:00 - 20:00\nSáb: 09:00 - 18:00',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.197025866103!2d-46.658819085025!3d-23.56133098468276!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0x206c45b7f7a1f2a6!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1678886569663!5m2!1spt-BR!2sbr',
    showSection: true,
    showAddress: true,
    showMap: true,
  },

  // Mensagens de contato
  contactMessages: [
    { id: 'msg1', name: 'Contato Geral', template: `*Olá! Tenho interesse na Plataforma Digital:*\n\nGostaria de saber mais detalhes sobre os planos e funcionalidades. Por favor, entre em contato.\nMeu nome é: {cliente}` }
  ],
  // Campos de pagamento
  pixKey: '',
  bankName: '',
  bankAccount: '',
  bankAgency: '',
  paymentApis: [], 
  paymentMethodPreference: 'api_direct', 
  paymentMessageType: 'instructions', // NOVO
  paymentConfirmationMessageTemplate: 'Olá! Confirmo meu pagamento de {valor} para o item {item_comprado}. Meu nome é {cliente}. Obrigado!',
  manualPaymentInstructions: 'Por favor, siga as instruções abaixo para realizar seu pagamento. Após o pagamento, envie o comprovante para o nosso WhatsApp para confirmação e liberação do serviço.',
};

export const DEFAULT_CONFIG: StoreConfig = {
  adminPin: MASTER_PIN_VALUE,
  brand: DEFAULT_BRAND_CONFIG,
};
