import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SettingsModal } from './SettingsModal';
import { Play, Settings, HeartHandshake, Sparkles, Users, Award, ShieldCheck } from 'lucide-react';

export const MainMenu: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const setScreen = useGameStore(s => s.setScreen);

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-between p-6 md:p-10 bg-gradient-to-b from-[#283033] via-[#1f2628] to-[#181d1f] text-[#E8DCC8] select-none overflow-y-auto">
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#5E8C61]">
          <span className="w-2 h-2 rounded-full bg-[#5E8C61] animate-ping" />
          <span>Jogo Cooperativo Comunitário</span>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#E8DCC8] hover:text-white transition-all cursor-pointer"
          title="Configurações"
        >
          <Settings size={18} />
          <span className="text-xs font-bold hidden sm:inline">Configurações</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center max-w-2xl my-auto py-8">
        <div className="w-20 h-20 rounded-3xl bg-[#5E8C61]/20 border-2 border-[#5E8C61] flex items-center justify-center text-[#5E8C61] mb-5 shadow-2xl shadow-[#5E8C61]/30">
          <HeartHandshake size={44} />
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Mutirão do Parque
        </h1>

        <p className="text-base sm:text-lg text-[#E8DCC8]/80 mt-3 max-w-lg leading-relaxed">
          Reúna a turma para revitalizar o parque comunitário antes do grande festival! Plantem árvores, pintem murais, consertem pontes e instalem luminárias juntos.
        </p>

        {/* Core Pillars */}
        <div className="grid grid-cols-3 gap-3 my-8 w-full max-w-lg">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
            <Users size={20} className="text-[#4F8198] mb-1" />
            <span className="text-xs font-extrabold text-white">Objetivo Compartilhado</span>
            <span className="text-[10px] text-[#E8DCC8]/60 mt-0.5">Sem ranking individual</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
            <HeartHandshake size={20} className="text-[#5E8C61] mb-1" />
            <span className="text-xs font-extrabold text-white">Ajuda Mútua</span>
            <span className="text-[10px] text-[#E8DCC8]/60 mt-0.5">Juntos fazemos mais rápido</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
            <Sparkles size={20} className="text-[#D9A441] mb-1" />
            <span className="text-xs font-extrabold text-white">Acessibilidade Total</span>
            <span className="text-[10px] text-[#E8DCC8]/60 mt-0.5">Rampas e tap-to-move</span>
          </div>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
          <button
            onClick={() => setScreen('briefing')}
            className="w-full flex items-center justify-center gap-3 bg-[#5E8C61] hover:bg-[#4d7550] active:scale-95 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-[#5E8C61]/30 transition-all text-base cursor-pointer"
          >
            <Play size={20} fill="currentColor" />
            <span>Começar Mutirão</span>
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between text-xs text-[#E8DCC8]/60 pt-4 border-t border-white/10 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Para 8 a 13 anos — Brincar associativo, cooperativo e inclusivo.</span>
        </div>
        <span>5 Parques • 8 Personagens • 20 Tarefas • 15 Eventos</span>
      </div>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};
