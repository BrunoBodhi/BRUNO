import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchBookings, deleteBooking, updateBooking, saveBooking } from '../../api';
import { StoreConfig, BrandConfig } from '../../types';

interface BookingsManagerDrawerProps {
  pin: string;
  storeConfig: StoreConfig;
  onUpdateBooking: (updates: Partial<BrandConfig['booking']>) => void;
  onClose: () => void;
}

const BookingsManagerDrawer: React.FC<BookingsManagerDrawerProps> = ({ pin, storeConfig, onUpdateBooking, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lista' | 'editar' | 'redir'>('lista');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // For edition/creation
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    date: '',
    time: '',
    service: '',
    notes: ''
  });

  // For redirection
  const bookingConfig = storeConfig.brand.booking || {};
  const [redirData, setRedirData] = useState({
    successActionType: bookingConfig.successActionType || 'none',
    successLink: bookingConfig.successLink || '',
    whatsappNumber: bookingConfig.whatsappNumber || '',
    whatsappNotify: bookingConfig.whatsappNotify || false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [pin]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBookings(pin);
      // sort by date/time
      const sorted = data.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
      });
      setBookings(sorted);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleEdit = (booking: any) => {
    setEditingBooking(booking);
    setFormData({
      clientName: booking.clientName ?? '',
      phone: booking.phone ?? '',
      date: booking.date ?? '',
      time: booking.time ?? '',
      service: booking.service ?? '',
      notes: booking.notes ?? ''
    });
    setActiveTab('editar');
  };

  const handleNew = () => {
    setEditingBooking(null);
    setFormData({
      clientName: '',
      phone: '',
      date: '',
      time: '',
      service: '',
      notes: ''
    });
    setActiveTab('editar');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await deleteBooking(pin, id);
      await loadBookings();
    }
  };

  const cancelEdit = () => {
    setActiveTab('lista');
    setEditingBooking(null);
  };

  const saveEditedBooking = async () => {
    if (!formData.clientName || !formData.date || !formData.time) {
      alert("Nome, data e hora são obrigatórios."); return;
    }
    setIsSaving(true);
    try {
      if (editingBooking && editingBooking.id) {
        await updateBooking(pin, editingBooking.id, formData);
      } else {
        await saveBooking(pin, formData);
      }
      setActiveTab('lista');
      await loadBookings();
    } catch (err) {
      console.error(err);
    }
    setIsSaving(false);
  };


  const saveRedir = async () => {
    setIsSaving(true);
    try {
      onUpdateBooking({
        successActionType: redirData.successActionType as any,
        successLink: redirData.successLink,
        whatsappNumber: redirData.whatsappNumber,
        whatsappNotify: redirData.whatsappNotify
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[999] flex justify-end bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-[400px] bg-zinc-950 border-l border-emerald-500/20 shadow-2xl h-full flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <i className="fas fa-calendar-alt text-emerald-500"></i>
            </div>
            <div>
              <h2 className="text-emerald-500 font-cinzel font-black uppercase tracking-widest text-base leading-tight">AGENDAMENTOS</h2>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Gestão Completa</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 text-zinc-500 transition-colors flex items-center justify-center">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 border-b border-white/5 shrink-0 gap-4">
          <button 
            onClick={() => setActiveTab('lista')} 
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'lista' || activeTab === 'editar' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-white'}`}
          >
            Agenda
          </button>
          <button 
            onClick={() => setActiveTab('redir')} 
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'redir' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-white'}`}
          >
            Redirecionamento
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'lista' && (
              <motion.div key="lista" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                <button onClick={handleNew} className="w-full py-4 rounded-xl border border-dashed border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <i className="fas fa-plus"></i> NOVO AGENDAMENTO
                </button>
                
                {isLoading ? (
                  <div className="text-center py-10 opacity-50"><i className="fas fa-spinner fa-spin text-2xl text-emerald-500 mb-4"></i><p className="text-xs uppercase tracking-widest font-bold">Carregando...</p></div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-10 opacity-50"><i className="fas fa-folder-open text-3xl mb-4 text-emerald-500/50"></i><p className="text-xs uppercase tracking-widest font-bold text-zinc-500">Nenhum agendamento encontrado.</p></div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="p-4 bg-zinc-900 border border-white/5 rounded-xl transition-all hover:border-emerald-500/30">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-sm font-bold text-white mb-1">{booking.clientName || 'Sem nome'}</h4>
                            <p className="text-[11px] text-zinc-400"><i className="fas fa-phone mr-1 opacity-70"></i> {booking.phone || 'N/I'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">{booking.date} às {booking.time}</p>
                          </div>
                        </div>
                        {booking.service && <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mb-2"><i className="fas fa-tag opacity-50 mr-1"></i> {booking.service}</p>}
                        {booking.notes && <p className="text-xs text-zinc-500 italic mb-4 bg-black/20 p-2 rounded">"{booking.notes}"</p>}
                        
                        <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                          <button onClick={() => handleDelete(booking.id)} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest"><i className="fas fa-trash"></i> Excluir</button>
                          <button onClick={() => handleEdit(booking)} className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-widest"><i className="fas fa-edit"></i> Editar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'editar' && (
              <motion.div key="editar" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center">
                    <button onClick={cancelEdit} className="w-6 h-6 rounded-full hover:bg-white/5 flex items-center justify-center mr-2 transition-colors">
                      <i className="fas fa-arrow-left"></i>
                    </button>
                    {editingBooking ? 'Editar Agendamento' : 'Novo Agendamento'}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Nome do Cliente *</label>
                    <input type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full appearance-none rounded-lg border border-emerald-500/20 bg-zinc-900/50 px-4 py-3 text-sm text-white shadow-inner focus:border-emerald-500 outline-none" placeholder="Ex: João da Silva"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Telefone / WhatsApp</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full appearance-none rounded-lg border border-emerald-500/20 bg-zinc-900/50 px-4 py-3 text-sm text-white shadow-inner focus:border-emerald-500 outline-none" placeholder="Ex: (11) 99999-9999"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Data *</label>
                      <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full appearance-none rounded-lg border border-emerald-500/20 bg-zinc-900/50 px-4 py-3 text-sm text-white shadow-inner focus:border-emerald-500 outline-none" style={{ colorScheme: 'dark' }}/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Horário *</label>
                      <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full appearance-none rounded-lg border border-emerald-500/20 bg-zinc-900/50 px-4 py-3 text-sm text-white shadow-inner focus:border-emerald-500 outline-none" style={{ colorScheme: 'dark' }}/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Serviço/Assunto</label>
                    <input type="text" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="w-full appearance-none rounded-lg border border-emerald-500/20 bg-zinc-900/50 px-4 py-3 text-sm text-white shadow-inner focus:border-emerald-500 outline-none" placeholder="Qual serviço?"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Observações</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full appearance-none rounded-lg border border-emerald-500/20 bg-zinc-900/50 px-4 py-3 text-sm text-white shadow-inner focus:border-emerald-500 outline-none min-h-[80px] resize-none" placeholder="Opcional..."></textarea>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-white/5 flex gap-3">
                  <button onClick={cancelEdit} className="flex-1 py-4 rounded-xl border border-zinc-700 text-xs font-black text-zinc-400 uppercase tracking-widest hover:bg-zinc-800 transition">CANCELAR</button>
                  <button onClick={saveEditedBooking} disabled={isSaving} className="flex-[2] py-4 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition flex items-center justify-center gap-2">
                    {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>} 
                    SALVAR
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'redir' && (
              <motion.div key="redir" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Ação Pós-Agendamento</label>
                   <select 
                     value={redirData.successActionType} 
                     onChange={e => setRedirData({...redirData, successActionType: e.target.value as any})}
                     className="w-full appearance-none rounded-lg border border-emerald-500/20 bg-zinc-900/50 px-4 py-3 text-sm text-white shadow-inner focus:border-emerald-500 outline-none"
                   >
                     <option value="none">Apenas exibir tela de Sucesso (Não redirecionar)</option>
                     <option value="whatsapp">Redirecionar para meu WhatsApp</option>
                     <option value="external_link">Redirecionar para URL Externa (Página Customizada)</option>
                     <option value="telegram">Redirecionar para Telegram</option>
                   </select>
                 </div>

                 {redirData.successActionType === 'whatsapp' && (
                   <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="space-y-4">
                     <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Seu Número de WhatsApp</label>
                       <input 
                         type="text" 
                         value={redirData.whatsappNumber} 
                         onChange={e => setRedirData({...redirData, whatsappNumber: e.target.value})} 
                         className="w-full appearance-none rounded-lg border border-emerald-500/20 bg-zinc-900/50 px-4 py-3 text-sm text-white shadow-inner focus:border-emerald-500 outline-none" 
                         placeholder="Ex: 5511999999999"
                       />
                       <p className="text-[9px] text-zinc-600 mt-2 font-bold uppercase">Inclua DDI e DDD, apenas números.</p>
                     </div>
                     <label className="flex items-center gap-3 p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl cursor-pointer hover:border-emerald-500/30 transition">
                       <input 
                         type="checkbox" 
                         checked={redirData.whatsappNotify} 
                         onChange={e => setRedirData({...redirData, whatsappNotify: e.target.checked})} 
                         className="accent-emerald-500 w-4 h-4 cursor-pointer"
                       />
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pré-preencher com os dados do cliente</span>
                     </label>
                   </motion.div>
                 )}

                 {redirData.successActionType === 'external_link' && (
                   <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Link de Redirecionamento</label>
                     <input 
                       type="url" 
                       value={redirData.successLink} 
                       onChange={e => setRedirData({...redirData, successLink: e.target.value})} 
                       className="w-full appearance-none rounded-lg border border-emerald-500/20 bg-zinc-900/50 px-4 py-3 text-sm text-white shadow-inner focus:border-emerald-500 outline-none" 
                       placeholder="https://sua-pagina-de-obrigado.com"
                     />
                   </motion.div>
                 )}

                 <AnimatePresence>
                   {showSuccess && (
                     <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-black uppercase tracking-widest text-center rounded-xl">
                        Configurações salvas com sucesso!
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="pt-4 mt-6 border-t border-white/5">
                   <button onClick={saveRedir} disabled={isSaving} className="w-full py-4 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                     {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} 
                     CONFIRMAR E SALVAR
                   </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingsManagerDrawer;
