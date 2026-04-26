import React, { useState } from 'react';
import { BookingConfig, BookingService } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import BookingManagement from './BookingManagement';

interface BookingEditorProps {
  booking: BookingConfig;
  onUpdate: (updates: Partial<BookingConfig>) => void;
  onClose: () => void;
  adminPin: string;
}

const BookingEditor: React.FC<BookingEditorProps> = ({ booking, onUpdate, onClose, adminPin }) => {
  const [services, setServices] = useState<BookingService[]>(booking.services || []);
  const [activeTab, setActiveTab] = useState<'config' | 'data'>('config');

  const handleAddService = () => {
    const newService: BookingService = {
      id: Date.now().toString(),
      name: 'Novo Serviço',
      duration: '30 min',
      price: 'R$ 0,00'
    };
    const updated = [...services, newService];
    setServices(updated);
    onUpdate({ services: updated });
  };

  const handleUpdateService = (id: string, updates: Partial<BookingService>) => {
    const updated = services.map(s => s.id === id ? { ...s, ...updates } : s);
    setServices(updated);
    onUpdate({ services: updated });
  };

  const handleRemoveService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    onUpdate({ services: updated });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border border-white/10"
      >
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/50">
          <div>
            <h2 className="font-cinzel text-xl text-white font-bold tracking-widest uppercase">{booking.sectionTitle || 'CENTRAL DA AGENDA'}</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">CONTROLE TOTAL DE SERVIÇOS E DADOS</p>
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/5 self-start md:self-center">
            <button 
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <i className="fas fa-cog mr-2"></i>
              CONFIGURAR
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'data' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <i className="fas fa-database mr-2"></i>
              VER AGENDAS
            </button>
            <button onClick={onClose} className="ml-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-zinc-500 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'config' ? (
              <motion.div 
                key="config"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Status e Título */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-zinc-950 rounded-xl border border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={booking.enabled}
                          onChange={(e) => onUpdate({ enabled: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`w-14 h-7 rounded-full transition-colors duration-300 ${booking.enabled ? 'bg-gold-500' : 'bg-zinc-800'}`}></div>
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${booking.enabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-gold-500 transition-colors">Módulo Ativo</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 space-y-4">
                   <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">O que acontece após o agendamento?</label>
                   <select 
                     value={booking.successActionType}
                     onChange={(e) => onUpdate({ successActionType: e.target.value as any })}
                     className="premium-input bg-zinc-900 border border-white/10"
                   >
                     <option value="whatsapp">Enviar Resumo p/ WhatsApp</option>
                     <option value="telegram">Redirecionar para Telegram</option>
                     <option value="external_link">Redirecionar para um Link</option>
                     <option value="none">Apenas Mostrar Sucesso</option>
                   </select>

                   {booking.successActionType === 'whatsapp' && (
                     <div className="pt-2 animate-fadeIn">
                       <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Número de WhatsApp (Ex: 5511999999999)</label>
                       <input 
                         type="text"
                         value={booking.whatsappNumber || ''}
                         onChange={(e) => onUpdate({ whatsappNumber: e.target.value })}
                         className="premium-input"
                         placeholder="5511999999999"
                       />
                     </div>
                   )}

                   {booking.successActionType === 'telegram' && (
                     <div className="pt-2 animate-fadeIn">
                       <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Usuário do Telegram (sem @)</label>
                       <input 
                         type="text"
                         value={booking.telegramUsername || ''}
                         onChange={(e) => onUpdate({ telegramUsername: e.target.value })}
                         className="premium-input"
                         placeholder="Ex: joaosilva"
                       />
                     </div>
                   )}

                   {booking.successActionType === 'external_link' && (
                     <div className="pt-2 animate-fadeIn">
                       <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">URL do Link (ex: https://dominio.com/obrigado)</label>
                       <input 
                         type="text"
                         value={booking.successLink || ''}
                         onChange={(e) => onUpdate({ successLink: e.target.value })}
                         className="premium-input"
                         placeholder="https://..."
                       />
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Título da Seção</label>
                    <input 
                      type="text"
                      value={booking.sectionTitle || ''}
                      onChange={(e) => onUpdate({ sectionTitle: e.target.value })}
                      className="premium-input"
                      placeholder="Ex: RESERVE SEU HORÁRIO"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Nome do Item (Ex: Serviço, Janela)</label>
                    <input 
                      type="text"
                      value={booking.itemLabel || 'Serviço'}
                      onChange={(e) => onUpdate({ itemLabel: e.target.value })}
                      className="premium-input"
                      placeholder="Ex: Serviço"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Ícone da Agenda (FontAwesome)</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={booking.icon || 'fa-calendar-alt'}
                        onChange={(e) => onUpdate({ icon: e.target.value })}
                        className="premium-input pl-10"
                        placeholder="Ex: fa-calendar-star"
                      />
                      <i className={`fas ${booking.icon || 'fa-calendar-alt'} absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500`}></i>
                    </div>
                  </div>
                   <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Dias Disponíveis (Separados por vírgula)</label>
                    <input 
                      type="text"
                      value={booking.availableDays?.join(', ') || ''}
                      onChange={(e) => onUpdate({ availableDays: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="premium-input"
                      placeholder="Ex: Segunda, Terça, Quarta"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Horários Disponíveis (Separados por vírgula)</label>
                  <textarea 
                    value={booking.timeSlots?.join(', ') || ''}
                    onChange={(e) => onUpdate({ timeSlots: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="premium-input h-20 resize-none"
                    placeholder="Ex: 09:00, 10:30, 14:00"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Texto de Horário (Informativo)</label>
                  <textarea 
                    value={booking.workingHours || ''}
                    onChange={(e) => onUpdate({ workingHours: e.target.value })}
                    className="premium-input h-24 resize-none"
                    placeholder="Ex: Segunda à Sexta: 09:00 - 18:00"
                  />
                </div>

                {/* Serviços */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Lista de {booking.itemLabel || 'Serviços'}</label>
                    <button 
                      onClick={handleAddService}
                      className="flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 hover:text-black transition-all"
                    >
                      <i className="fas fa-plus"></i>
                      Adicionar Item
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="p-5 bg-zinc-950 border border-white/5 rounded-xl space-y-4 group">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <input 
                              type="text"
                              value={service.name || ''}
                              onChange={(e) => handleUpdateService(service.id, { name: e.target.value })}
                              className="bg-transparent border-none p-0 text-zinc-200 font-bold tracking-wide focus:ring-0 w-full"
                              placeholder="Nome do Serviço"
                            />
                          </div>
                          <button 
                            onClick={() => handleRemoveService(service.id)}
                            className="text-zinc-700 hover:text-red-500 transition-colors"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Duração</label>
                            <input 
                              type="text"
                              value={service.duration || ''}
                              onChange={(e) => handleUpdateService(service.id, { duration: e.target.value })}
                              className="premium-input !py-2 text-xs"
                              placeholder="Ex: 60 min"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Valor/Preço</label>
                            <input 
                              type="text"
                              value={service.price || ''}
                              onChange={(e) => handleUpdateService(service.id, { price: e.target.value })}
                              className="premium-input !py-2 text-xs"
                              placeholder="Ex: R$ 150,00"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {services.length === 0 && (
                      <div className="py-12 text-center bg-zinc-950/50 rounded-xl border border-dashed border-white/5">
                         <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold">Nenhum serviço cadastrado.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BookingManagement pin={adminPin} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-zinc-900/50 border-t border-white/5 text-right">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gold-500 text-black font-black text-xs uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all"
          >
            Fechar Painel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingEditor;
