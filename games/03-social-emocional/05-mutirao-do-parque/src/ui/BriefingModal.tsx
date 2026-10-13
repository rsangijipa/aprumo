import React from 'react';
import { useGameStore } from '../store/gameStore';
import { MapDef } from '../types';
import mapsData from '../data/maps.json';
import { Users, Clock, Compass, ArrowRight, HeartHandshake } from 'lucide-react';

export const BriefingModal: React.FC = () => {
  const selectedMap = useGameStore(s => s.selectedMap);
  const selectMap = useGameStore(s => s.selectMap);
  const gameMode = useGameStore(s => s.gameMode);
  const setGameMode = useGameStore(s => s.setGameMode);
  const matchDuration = useGameStore(s => s.matchDuration);
  const setMatchDuration = useGameStore(s => s.setMatchDuration);
  const setScreen = useGameStore(s => s.setScreen);

  return (
    <div className="fixed inset-0 z-40 bg-[#283033]/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 text-[#E8DCC8] overflow-y-auto">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-6">
          <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#5E8C61]/20 text-[#5E8C61] border border-[#5E8C61]/40">
            Briefing da Comunidade
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2">
            Mutirão do Parque: Preparação Coletiva
          </h1>
          <p className="text-sm md:text-base text-[#E8DCC8]/80 mt-1 max-w-xl mx-auto">
            O grande evento do bairro se aproxima! Nosso objetivo compartilhado é revitalizar o parque juntos. Sem competição individual: vencemos quando o espaço floresce!
          </p>
        </div>

        {/* 1. Escolha de Parque (5 Mapas) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Compass size={18} className="text-[#D9A441]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              1. Selecione o Parque Comunitário:
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(mapsData as MapDef[]).map(map => {
              const isSelected = selectedMap.id === map.id;
              return (
                <button
                  key={map.id}
                  onClick={() => selectMap(map)}
                  className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#5E8C61]/30 border-[#5E8C61] shadow-lg shadow-[#5E8C61]/20 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-white text-sm">{map.name}</div>
                    <div className="text-[11px] text-[#D9A441] font-semibold mt-0.5">
                      {map.subtitle}
                    </div>
                    <div className="text-xs text-[#E8DCC8]/70 mt-2 line-clamp-3">
                      {map.description}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] uppercase font-bold text-[#E8DCC8]/60">
                    <span>{map.zones.length} Zonas</span>
                    <span className="capitalize">{map.difficulty}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Modo de Jogo & Duração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Game Mode */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-white font-bold text-sm">
              <Users size={16} className="text-[#4F8198]" />
              <span>Modo de Jogo:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setGameMode('solo')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  gameMode === 'solo'
                    ? 'bg-[#4F8198] text-white border-[#4F8198] shadow-md'
                    : 'bg-black/20 text-[#E8DCC8] border-white/10 hover:bg-white/5'
                }`}
              >
                Solo (com Bot)
              </button>
              <button
                onClick={() => setGameMode('local_2p')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  gameMode === 'local_2p'
                    ? 'bg-[#4F8198] text-white border-[#4F8198] shadow-md'
                    : 'bg-black/20 text-[#E8DCC8] border-white/10 hover:bg-white/5'
                }`}
              >
                2 Jogadores Local
              </button>
              <button
                onClick={() => setGameMode('tap_to_move')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  gameMode === 'tap_to_move'
                    ? 'bg-[#4F8198] text-white border-[#4F8198] shadow-md'
                    : 'bg-black/20 text-[#E8DCC8] border-white/10 hover:bg-white/5'
                }`}
              >
                Tap-to-Move
              </button>
            </div>
          </div>

          {/* Match Duration */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-white font-bold text-sm">
              <Clock size={16} className="text-[#D9A441]" />
              <span>Duração do Mutirão:</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setMatchDuration('curta')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  matchDuration === 'curta'
                    ? 'bg-[#D9A441] text-[#283033] border-[#D9A441] shadow-md'
                    : 'bg-black/20 text-[#E8DCC8] border-white/10 hover:bg-white/5'
                }`}
              >
                Curta (8m)
              </button>
              <button
                onClick={() => setMatchDuration('padrao')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  matchDuration === 'padrao'
                    ? 'bg-[#D9A441] text-[#283033] border-[#D9A441] shadow-md'
                    : 'bg-black/20 text-[#E8DCC8] border-white/10 hover:bg-white/5'
                }`}
              >
                Padrão (15m)
              </button>
              <button
                onClick={() => setMatchDuration('longa')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  matchDuration === 'longa'
                    ? 'bg-[#D9A441] text-[#283033] border-[#D9A441] shadow-md'
                    : 'bg-black/20 text-[#E8DCC8] border-white/10 hover:bg-white/5'
                }`}
              >
                Longa (25m)
              </button>
              <button
                onClick={() => setMatchDuration('livre')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  matchDuration === 'livre'
                    ? 'bg-[#D9A441] text-[#283033] border-[#D9A441] shadow-md'
                    : 'bg-black/20 text-[#E8DCC8] border-white/10 hover:bg-white/5'
                }`}
              >
                Sem Tempo
              </button>
            </div>
          </div>
        </div>

        {/* Cooperative Principles Reminder */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#5E8C61]/15 border border-[#5E8C61]/30 text-xs text-[#E8DCC8] mb-6">
          <HeartHandshake size={20} className="text-[#5E8C61] shrink-0" />
          <span>
            <strong>Princípio Cooperativo:</strong> Todas as tarefas podem ser feitas por qualquer personagem. Quando duas pessoas trabalham juntas na mesma tarefa, o progresso acelera muito mais rápido!
          </span>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pb-4">
          <button
            onClick={() => setScreen('character_select')}
            className="flex items-center gap-2 bg-[#5E8C61] hover:bg-[#4d7550] active:scale-95 text-white font-extrabold px-6 py-3 rounded-2xl shadow-xl transition-all cursor-pointer text-sm"
          >
            <span>Escolher Personagens</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
