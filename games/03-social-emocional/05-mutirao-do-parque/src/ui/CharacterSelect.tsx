import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CharacterDef } from '../types';
import charactersData from '../data/characters.json';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const CharacterSelect: React.FC = () => {
  const selectedChar1 = useGameStore(s => s.selectedChar1);
  const selectedChar2 = useGameStore(s => s.selectedChar2);
  const selectChar1 = useGameStore(s => s.selectChar1);
  const selectChar2 = useGameStore(s => s.selectChar2);
  const gameMode = useGameStore(s => s.gameMode);
  const setScreen = useGameStore(s => s.setScreen);

  const characters = charactersData as CharacterDef[];

  return (
    <div className="fixed inset-0 z-40 bg-[#283033]/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 text-[#E8DCC8] overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#4F8198]/20 text-[#4F8198] border border-[#4F8198]/40">
              Passo 2 de 3
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
              Escolha os Participantes do Mutirão
            </h1>
            <p className="text-xs md:text-sm text-[#E8DCC8]/70">
              {gameMode === 'solo' || gameMode === 'tap_to_move'
                ? 'Escolha seu personagem (Jogador 1) e o colega voluntário que atuará como Companheiro (Bot).'
                : 'Definam os personagens do Jogador 1 e Jogador 2 para o mutirão cooperativo.'}
            </p>
          </div>

          <button
            onClick={() => setScreen('briefing')}
            className="flex items-center gap-1.5 text-xs text-[#E8DCC8]/70 hover:text-white px-3 py-2 rounded-xl bg-white/5 border border-white/10 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>
        </div>

        {/* Selected Pair Preview */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md"
              style={{ backgroundColor: selectedChar1.appearance.color }}
            >
              {selectedChar1.name[0]}
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#D9A441]">
                Jogador 1 (Você)
              </span>
              <div className="text-base font-extrabold text-white">{selectedChar1.name}</div>
              <div className="text-xs text-[#E8DCC8]/70">
                Talento: <strong>{selectedChar1.talentName}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md"
              style={{ backgroundColor: selectedChar2.appearance.color }}
            >
              {selectedChar2.name[0]}
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#4F8198]">
                {gameMode === 'local_2p' ? 'Jogador 2' : 'Companheiro (Bot)'}
              </span>
              <div className="text-base font-extrabold text-white">{selectedChar2.name}</div>
              <div className="text-xs text-[#E8DCC8]/70">
                Talento: <strong>{selectedChar2.talentName}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 8 Character Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {characters.map(char => {
            const isP1 = selectedChar1.id === char.id;
            const isP2 = selectedChar2.id === char.id;

            return (
              <div
                key={char.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isP1
                    ? 'bg-[#D9A441]/20 border-[#D9A441] shadow-lg'
                    : isP2
                    ? 'bg-[#4F8198]/20 border-[#4F8198] shadow-lg'
                    : 'bg-black/20 border-white/5 hover:border-white/15'
                }`}
              >
                <div>
                  {/* Avatar Top Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm"
                      style={{ backgroundColor: char.appearance.color }}
                    >
                      {char.name[0]}
                    </div>
                    {char.appearance.hasWheelchair && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#4F8198]/30 text-cyan-200 border border-[#4F8198]/50">
                        Cadeira Esportiva
                      </span>
                    )}
                  </div>

                  <div className="font-extrabold text-white text-base">{char.name}</div>
                  <div className="text-xs font-bold text-[#D9A441] mt-0.5">
                    {char.talentName}
                  </div>
                  <div className="text-xs text-[#E8DCC8]/70 mt-1.5 leading-relaxed">
                    {char.talentDescription}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px]">
                    <span className="text-white/60">Ação Especial: </span>
                    <strong className="text-emerald-300">{char.specialActionName}</strong>
                  </div>
                </div>

                {/* Assignment Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-white/10">
                  <button
                    onClick={() => selectChar1(char)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                      isP1
                        ? 'bg-[#D9A441] text-[#283033] shadow'
                        : 'bg-white/5 text-[#E8DCC8] hover:bg-white/10'
                    }`}
                  >
                    {isP1 ? '✓ Escolhido P1' : 'P1 (Você)'}
                  </button>

                  <button
                    onClick={() => selectChar2(char)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                      isP2
                        ? 'bg-[#4F8198] text-white shadow'
                        : 'bg-white/5 text-[#E8DCC8] hover:bg-white/10'
                    }`}
                  >
                    {isP2 ? '✓ Escolhido P2' : 'P2 / Bot'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pb-4">
          <button
            onClick={() => setScreen('planning')}
            className="flex items-center gap-2 bg-[#5E8C61] hover:bg-[#4d7550] active:scale-95 text-white font-extrabold px-6 py-3 rounded-2xl shadow-xl transition-all cursor-pointer text-sm"
          >
            <span>Ir para o Planejamento</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
