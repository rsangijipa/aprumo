import React from 'react';
import { useGameStore } from '../store/gameStore';
import { AlertCircle, CloudRain, Briefcase, AlertTriangle, Truck, Zap, Users, Heart, Droplets, Gift, Apple } from 'lucide-react';

const eventIcons: Record<string, any> = {
  CloudRain,
  Briefcase,
  AlertTriangle,
  Truck,
  Zap,
  Users,
  Heart,
  Droplets,
  Gift,
  Apple
};

export const EventBanner: React.FC = () => {
  const world = useGameStore(s => s.worldState);
  if (!world || !world.activeEvent) return null;

  const event = world.activeEvent;
  const isWarning = event.phase === 'warning';
  const Icon = eventIcons[event.def.icon] || AlertCircle;

  return (
    <div className="absolute top-4 right-4 z-30 max-w-sm pointer-events-auto transition-all animate-bounce">
      <div
        className={`p-3.5 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-3 text-white ${
          isWarning
            ? 'bg-[#B46D4F]/90 border-[#D9A441]'
            : 'bg-[#4F8198]/90 border-cyan-400'
        }`}
      >
        <div className="p-2 rounded-xl bg-white/20 text-white shrink-0 mt-0.5">
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#E8DCC8]">
              {isWarning ? `Aviso: Em ${Math.ceil(event.warningTimeLeft)}s` : 'Evento em Andamento!'}
            </span>
            <span className="text-xs font-mono font-bold text-white bg-black/30 px-1.5 py-0.5 rounded-md">
              {Math.ceil(isWarning ? event.warningTimeLeft : event.durationTimeLeft)}s
            </span>
          </div>

          <div className="font-extrabold text-sm leading-snug mt-0.5">{event.def.name}</div>
          <div className="text-xs text-[#E8DCC8]/90 mt-1">{event.def.effectDescription}</div>
        </div>
      </div>
    </div>
  );
};
