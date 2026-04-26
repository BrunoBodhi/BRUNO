import React, { useState } from 'react';
import { BookingConfig, BookingService } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { saveBooking } from '../api';

interface BookingProps {
  config: BookingConfig;
  onClose: () => void;
  whatsappNumber: string;
  pin: string;
}

const Booking: React.FC<BookingProps> = ({ config, onClose, whatsappNumber, pin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const services = config.services || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim() || !phone.trim() || !selectedServiceId || !date || !time) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    const selectedService = services.find(s => s.id === selectedServiceId);

    try {
      // 1. Salva no Firestore
      await saveBooking(pin, {
        service: selectedService?.name || '',
        date,
        time,
        clientName: name,
        clientPhone: phone,
        notes: notes // Note: add notes to your firestore or ignore if not supported by schema, but better text included in message
      });

      // 2. Envia para WhatsApp/Telegram/Link
      const message = `*SOLICITAÇÃO DE AGENDAMENTO*\n\n` +
                      `*${config.itemLabel || 'Serviço'}:* ${selectedService?.name}\n` +
                      `*Data:* ${date}\n` +
                      `*Horário:* ${time}\n\n` +
                      `*Cliente:* ${name}\n` +
                      `*Telefone:* ${phone}\n` +
                      (notes ? `*Observações:* ${notes}\n\n` : '\n') +
                      `_Enviado via Plataforma Digital_`;

      if (config.successActionType === 'whatsapp') {
        const whatsappNumberClean = whatsappNumber.replace(/\D/g, '');
        const whatsappLink = `https://wa.me/${whatsappNumberClean}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, '_blank');
      } else if (config.successActionType === 'telegram' && config.telegramUsername) {
        const telegramLink = `https://t.me/${config.telegramUsername.replace('@', '')}?text=${encodeURIComponent(message)}`;
        window.open(telegramLink, '_blank');
      } else if (config.successActionType === 'external_link' && config.successLink) {
        window.open(config.successLink, '_blank');
      }
      
      setIsSuccess(true);
    } catch (error) {
       setErrorMsg('Erro ao processar agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-zinc-950 rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col max-h-[90vh]"
      >
        {/* Header Fixo */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/80 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <i className={`fas ${config.icon || 'fa-calendar-check'} text-lg`}></i>
            </div>
            <div>
              <h3 className="font-cinzel text-lg text-emerald-400 font-bold tracking-wider">{config.sectionTitle || 'Agendamento'}</h3>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Preencha seus dados</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Conteúdo Rolável */}
        <div className="overflow-y-auto custom-scrollbar flex-grow">
          <form id="booking-form" onSubmit={handleSubmit} className="p-6">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <i className="fas fa-check text-4xl text-emerald-400"></i>
                  </div>
                  <h3 className="font-cinzel text-2xl text-white font-black uppercase tracking-widest mb-4">AGENDADO COM SUCESSO!</h3>
                  <p className="text-zinc-400 text-sm mb-10 px-4 leading-relaxed tracking-wide">
                    Recebemos sua solicitação. Entraremos em contato em breve para confirmar tudo com você.
                  </p>
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="w-full py-4 rounded-xl bg-emerald-500 text-black font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    FECHAR JANELA
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {errorMsg && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold text-center">
                      {errorMsg}
                    </div>
                  )}

                  {/* Nome */}
                  <div className="w-full">
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Seu Nome Completo *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: João Silva"
                      value={name}
                      onChange={(e) => { setErrorMsg(''); setName(e.target.value); }}
                      className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3.5 text-sm text-white shadow-inner focus:border-emerald-500 focus:bg-zinc-900 outline-none transition-all duration-300"
                    />
                  </div>

                  {/* Telefone */}
                  <div className="w-full">
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Telefone / WhatsApp *</label>
                    <input 
                      type="tel" 
                      placeholder="Ex: (11) 99999-9999"
                      value={phone}
                      onChange={(e) => { setErrorMsg(''); setPhone(e.target.value); }}
                      className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3.5 text-sm text-white shadow-inner focus:border-emerald-500 focus:bg-zinc-900 outline-none transition-all duration-300"
                    />
                  </div>

                  {/* Serviço */}
                  <div className="w-full">
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Tipo de Serviço *</label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => { setErrorMsg(''); setSelectedServiceId(e.target.value); }}
                      className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3.5 text-sm text-white shadow-inner focus:border-emerald-500 focus:bg-zinc-900 outline-none transition-all duration-300 cursor-pointer"
                    >
                      <option value="" disabled>Selecione uma opção...</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} {s.price ? `- ${s.price}` : ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* Data e Hora na mesma grade se possível, mas pediu 100% largura cada. Vamos seguir 100% largura */}
                  <div className="w-full">
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Data *</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => { setErrorMsg(''); setDate(e.target.value); }}
                      className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3.5 text-sm text-white shadow-inner focus:border-emerald-500 focus:bg-zinc-900 outline-none transition-all duration-300 min-h-[48px]"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Horários */}
                  <div className="w-full">
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Horário Disponível *</label>
                    {config.timeSlots && config.timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {config.timeSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => { setErrorMsg(''); setTime(slot); }}
                            className={`py-3 px-1 rounded-xl border text-xs font-black transition-all ${
                              time === slot 
                              ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                              : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:border-emerald-500/50 hover:bg-zinc-900'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input 
                        type="time"
                        value={time}
                        onChange={(e) => { setErrorMsg(''); setTime(e.target.value); }}
                        className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3.5 text-sm text-white shadow-inner focus:border-emerald-500 focus:bg-zinc-900 outline-none transition-all duration-300 min-h-[48px]"
                        style={{ colorScheme: 'dark' }}
                      />
                    )}
                  </div>

                  {/* Observações */}
                  <div className="w-full">
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Observações (Opcional)</label>
                    <textarea 
                      placeholder="Alguma informação importante?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3.5 text-sm text-white shadow-inner focus:border-emerald-500 focus:bg-zinc-900 outline-none transition-all duration-300 min-h-[100px] resize-none"
                    ></textarea>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Footer (Botão confirmar fixo embaixo se não estiver na tela de sucesso) */}
        {!isSuccess && (
          <div className="p-6 bg-zinc-900/80 border-t border-white/5 shrink-0">
             <button 
                type="submit" 
                form="booking-form"
                disabled={isSubmitting} 
                className="w-full py-4 rounded-xl bg-emerald-500 text-black font-black text-sm uppercase tracking-widest hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> PROCESSANDO
                  </>
                ) : (
                  <>
                    CONFIRMAR AGENDAMENTO <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>
              
              {config.workingHours && (
                <div className="mt-4 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                    {config.workingHours.replace(/\n/g, ' • ')}
                  </p>
                </div>
              )}
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default Booking;

