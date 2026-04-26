
import React, { useState } from 'react';
import { StoreConfig, BrandConfig } from '../../types';
import BookingEditor from './BookingEditor';
import BookingManagement from './BookingManagement';

interface AgendaEditorProps {
  storeConfig: StoreConfig;
  onUpdateBooking: (updates: Partial<BrandConfig['booking']>) => void;
  onClose: () => void;
  activeAdminPin: string | null;
}

const AgendaEditor: React.FC<AgendaEditorProps> = ({
  storeConfig,
  onUpdateBooking,
  onClose,
  activeAdminPin,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'bookings'>('config');

  const { booking } = storeConfig.brand;

  const handleUpdateClosingDays = (daysString: string) => {
    onUpdateBooking({ closingDays: daysString.split(',').map(s => s.trim()).filter(Boolean) });
  };

  const handleUpdateUnavailableHours = (hoursString: string) => {
    onUpdateBooking({ unavailableHours: hoursString.split(',').map(s => s.trim()).filter(Boolean) });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl p-8 md:p-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl text-white font-cinzel font-black uppercase tracking-[0.2em] mb-2">GESTÃO DA AGENDA</h2>
            <div className="flex gap-4">
                <button onClick={() => setActiveTab('config')} className={`text-[10px] font-black uppercase tracking-[0.3em] ${activeTab === 'config' ? 'text-gold-500' : 'text-zinc-500'}`}>Configurações</button>
                <button onClick={() => setActiveTab('bookings')} className={`text-[10px] font-black uppercase tracking-[0.3em] ${activeTab === 'bookings' ? 'text-gold-500' : 'text-zinc-500'}`}>Ver Agendamentos</button>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'config' ? (
            <div className="space-y-8">
              <BookingEditor
                booking={booking}
                onUpdate={onUpdateBooking}
                onClose={() => {}}
                adminPin={activeAdminPin || ''}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-950 rounded-2xl border border-white/5">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Dias de Fechamento (Datas, Ex: 15/05, 07/09)</label>
                    <input 
                      type="text"
                      value={booking.closingDays?.join(', ') || ''}
                      onChange={(e) => handleUpdateClosingDays(e.target.value)}
                      className="premium-input"
                      placeholder="Ex: 15/05, 07/09"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Horários Indisponíveis (Ex: 12:00, 13:00)</label>
                    <input 
                      type="text"
                      value={booking.unavailableHours?.join(', ') || ''}
                      onChange={(e) => handleUpdateUnavailableHours(e.target.value)}
                      className="premium-input"
                      placeholder="Ex: 12:00, 13:00"
                    />
                </div>
              </div>
            </div>
          ) : (
            <BookingManagement pin={activeAdminPin || ''} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaEditor;
