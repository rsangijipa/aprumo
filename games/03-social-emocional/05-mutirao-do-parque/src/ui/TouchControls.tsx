import React from 'react';
import { useGameStore } from '../store/gameStore';
import { MessageSquare, Hand, Wrench } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export const TouchControls: React.FC = () => {
  const world = useGameStore(s => s.worldState);
  const openQuickComms = useGameStore(s => s.openQuickComms);
  const updateWorld = useGameStore(s => s.updateWorldState);

  if (!world) return null;
  const p1 = world.players[0];

  const handleAction = () => {
    // Check nearby ground item
    const groundItem = world.groundItems.find(
      it => Math.hypot(it.x - p1.x, it.y - p1.y) < 48
    );
    if (groundItem) {
      const ok = world.playerPickupItem(p1.id, groundItem.id);
      if (ok) soundEngine.playHammerTap();
      return;
    }

    // Toggle cart
    if (Math.hypot(world.wheelbarrow.x - p1.x, world.wheelbarrow.y - p1.y) < 50) {
      const pushing = world.wheelbarrow.pushingPlayerIds.includes(p1.id);
      if (pushing) {
        world.wheelbarrow.pushingPlayerIds = world.wheelbarrow.pushingPlayerIds.filter(id => id !== p1.id);
      } else {
        world.wheelbarrow.pushingPlayerIds.push(p1.id);
      }
    }
  };

  const setHelping = (helping: boolean) => {
    updateWorld(w => {
      const player = w.players.find(p => p.id === 'p1');
      if (player) {
        player.isHelping = helping;
        if (helping) soundEngine.playCoopSparkle();
      }
    });
  };

  return (
    <>
      {/* Top Comms button */}
      <div className="absolute bottom-24 right-4 z-30 flex flex-col gap-3 pointer-events-auto">
        <button
          onClick={() => openQuickComms(true)}
          className="w-13 h-13 rounded-2xl bg-[#4F8198] text-white flex items-center justify-center shadow-lg border border-white/20 active:scale-90 transition-all cursor-pointer"
          title="Roda de Comunicação (Q)"
        >
          <MessageSquare size={22} />
        </button>
      </div>

      {/* Bottom-right Action & Help buttons */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-3 pointer-events-auto">
        {/* Help button (F) */}
        <button
          onPointerDown={() => setHelping(true)}
          onPointerUp={() => setHelping(false)}
          onPointerLeave={() => setHelping(false)}
          className={`w-15 h-15 rounded-2xl flex flex-col items-center justify-center border transition-all active:scale-95 shadow-xl select-none cursor-pointer ${
            p1.isHelping
              ? 'bg-[#B46D4F] border-white text-white scale-105'
              : 'bg-[#B46D4F]/90 border-white/20 text-[#E8DCC8]'
          }`}
          title="Segurar para Ajudar o Parceiro (F)"
        >
          <Hand size={22} />
          <span className="text-[10px] font-black uppercase mt-0.5">Ajudar</span>
        </button>

        {/* Action / Use button (E) */}
        <button
          onClick={handleAction}
          className="w-16 h-16 rounded-2xl bg-[#5E8C61] hover:bg-[#4d7550] active:scale-95 text-white flex flex-col items-center justify-center shadow-xl border-2 border-white/30 transition-all select-none cursor-pointer"
          title="Usar ou Pegar (E)"
        >
          <Wrench size={24} />
          <span className="text-[10px] font-black uppercase mt-0.5">Ação</span>
        </button>
      </div>

      {/* Movement hint on Desktop / touch */}
      <div className="hidden md:flex absolute bottom-4 left-4 z-20 items-center gap-2 bg-[#283033]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-[#E8DCC8]/70 pointer-events-none">
        <span>Controles:</span>
        <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-white font-mono">WASD</kbd> Mover
        <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-white font-mono">E</kbd> Usar
        <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-white font-mono">F</kbd> Ajudar
        <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-white font-mono">Q</kbd> Falar
        <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-white font-mono">Espaço</kbd> Especial
      </div>
    </>
  );
};
