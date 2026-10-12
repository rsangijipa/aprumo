import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Sparkles, Trash2 } from 'lucide-react';
import { CharacterSystem } from '../simulation/CharacterSystem';

export const Inventory: React.FC = () => {
  const world = useGameStore(s => s.worldState);
  const updateWorld = useGameStore(s => s.updateWorldState);

  if (!world) return null;

  const p1 = world.players[0];
  const p1Inv = world.inventories.get(p1.id) || [];

  const handleDrop = (index: number) => {
    updateWorld(w => {
      w.playerDropItem(p1.id, index, p1.x + 16, p1.y + 16);
    });
  };

  const handleSpecial = () => {
    updateWorld(w => {
      CharacterSystem.activateSpecial(p1, w.players);
    });
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
      {/* Stamina & Special Bar */}
      <div className="flex items-center gap-3 bg-[#283033]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs">
        {/* Stamina */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-[#E8DCC8]/70">Energia</span>
          <div className="w-20 bg-black/40 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#5E8C61] h-full transition-all duration-150"
              style={{ width: `${Math.round(p1.stamina)}%` }}
            />
          </div>
        </div>

        {/* Special Cooldown */}
        <button
          onClick={handleSpecial}
          disabled={p1.specialCooldownRemaining > 0}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all ${
            p1.specialCooldownRemaining <= 0
              ? 'bg-[#D9A441] text-[#283033] hover:scale-105 active:scale-95 shadow-md animate-pulse'
              : 'bg-white/10 text-[#E8DCC8]/40 cursor-not-allowed'
          }`}
          title={p1.characterDef.specialDescription}
        >
          <Sparkles size={12} />
          <span>
            {p1.specialCooldownRemaining <= 0
              ? p1.characterDef.specialActionName
              : `${Math.ceil(p1.specialCooldownRemaining)}s`}
          </span>
        </button>
      </div>

      {/* 3 Inventory Slots */}
      <div className="flex items-center gap-2 bg-[#283033]/90 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-xl">
        {p1Inv.map((slot, index) => {
          const item = slot.item;
          return (
            <div
              key={index}
              className={`relative w-14 h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${
                item
                  ? 'bg-white/10 border-[#4F8198] shadow-inner'
                  : 'bg-black/30 border-white/5 border-dashed'
              }`}
            >
              {item ? (
                <>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[9px] text-[#E8DCC8] font-medium truncate max-w-[50px] mt-0.5">
                    {item.name}
                  </span>

                  {/* Drop button */}
                  <button
                    onClick={() => handleDrop(index)}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-red-600/80 hover:bg-red-500 rounded-full text-white shadow"
                    title="Soltar item no chão"
                  >
                    <Trash2 size={10} />
                  </button>
                </>
              ) : (
                <span className="text-[10px] text-white/30 font-semibold">{index + 1}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
