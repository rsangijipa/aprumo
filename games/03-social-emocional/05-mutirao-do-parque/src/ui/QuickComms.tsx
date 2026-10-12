import React from 'react';
import { useGameStore } from '../store/gameStore';
import { QUICK_COMM_MESSAGES } from '../simulation/CoopSystem';
import { X, Package, HeartHandshake, Sprout, Navigation, Clock, CheckCircle2 } from 'lucide-react';

const iconMap: Record<string, any> = {
  Package,
  HeartHandshake,
  Sprout,
  Navigation,
  Clock,
  CheckCircle2
};

export const QuickComms: React.FC = () => {
  const isOpen = useGameStore(s => s.isQuickCommsOpen);
  const openQuickComms = useGameStore(s => s.openQuickComms);
  const sendComm = useGameStore(s => s.sendComm);

  if (!isOpen) return null;

  const handleSelect = (text: string) => {
    sendComm('p1', text);
    openQuickComms(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
      <div className="relative bg-[#283033] border-2 border-[#4F8198] rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 text-center">
        {/* Close Button */}
        <button
          onClick={() => openQuickComms(false)}
          className="absolute top-4 right-4 p-2 text-[#E8DCC8]/70 hover:text-white bg-white/5 rounded-full"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Comunicação Rápida</h3>
        <p className="text-xs text-[#E8DCC8]/70 mb-5">
          Avise seu parceiro ou bot para combinar as tarefas:
        </p>

        {/* 6 Quick Phrases Grid */}
        <div className="grid grid-cols-2 gap-3">
          {QUICK_COMM_MESSAGES.map(msg => {
            const Icon = iconMap[msg.icon] || HeartHandshake;
            return (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg.text)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-[#5E8C61]/30 border border-white/10 hover:border-[#5E8C61] text-[#E8DCC8] hover:text-white transition-all transform active:scale-95 text-xs font-semibold gap-2 shadow-sm"
              >
                <div className="p-2 rounded-xl bg-[#4F8198]/20 text-[#4F8198]">
                  <Icon size={20} />
                </div>
                <span>{msg.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
