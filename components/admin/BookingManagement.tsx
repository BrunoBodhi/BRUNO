
import React, { useState, useEffect } from 'react';
import { fetchBookings, deleteBooking } from '../../api';
import { motion, AnimatePresence } from 'motion/react';

interface BookingManagementProps {
  pin: string;
}

const BookingManagement: React.FC<BookingManagementProps> = ({ pin }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  useEffect(() => {
    loadBookings();
  }, [pin]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBookings(pin);
      // Ordenar por data de criação descrescente
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este agendamento?')) {
      try {
        await deleteBooking(pin, id);
        setBookings(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        alert('Erro ao excluir.');
      }
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">GESTÃO DE AGENDAMENTOS</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">CONTROLE DE FILA & ATENDIMENTO</p>
        </div>
        
        <div className="flex p-1 bg-zinc-900 rounded-lg border border-white/5">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${filter === 'all' ? 'bg-gold-500 text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            TODOS
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${filter === 'pending' ? 'bg-gold-500 text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            PENDENTES
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Carregando Agenda...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl bg-zinc-900/20">
          <i className="fas fa-calendar-times text-4xl text-zinc-800 mb-4"></i>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Nenhum agendamento encontrado</p>
          <button onClick={loadBookings} className="mt-4 text-gold-500 text-[9px] font-black uppercase tracking-widest hover:underline">Atualizar</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredBookings.map((booking) => (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-gold-500/20 transition-all flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 text-lg">
                      <i className="fas fa-user"></i>
                    </span>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-widest text-sm">{booking.clientName}</h4>
                      <p className="text-zinc-500 text-[10px] font-black tracking-widest">{booking.clientPhone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">SERVIÇO</p>
                      <p className="text-xs text-white font-bold">{booking.service}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">HORÁRIO</p>
                      <p className="text-xs text-gold-500 font-bold">{booking.date} às {booking.time}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0">
                  <a 
                    href={`https://wa.me/${booking.clientPhone ? booking.clientPhone.replace(/\D/g, '') : ''}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <i className="fab fa-whatsapp"></i>
                    <span className="hidden md:inline">CONTATAR</span>
                  </a>
                  <button 
                    onClick={() => handleDelete(booking.id)}
                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-black transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <i className="fas fa-trash-alt"></i>
                    <span className="hidden md:inline">EXCLUIR</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
