import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { TaskDef } from '../types';
import tasksData from '../data/tasks.json';
import { Check, Clock, Play, MapPin, Sparkles } from 'lucide-react';

export const PlanningOverlay: React.FC = () => {
  const [countdown, setCountdown] = useState(45);
  const selectedMap = useGameStore(s => s.selectedMap);
  const selectedChar1 = useGameStore(s => s.selectedChar1);
  const selectedChar2 = useGameStore(s => s.selectedChar2);
  const plannedTaskIds = useGameStore(s => s.plannedTaskIds);
  const togglePlannedTask = useGameStore(s => s.togglePlannedTask);
  const initWorld = useGameStore(s => s.initWorld);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      initWorld();
      return;
    }
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, initWorld]);

  // Tasks in this map
  const mapTasks = selectedMap.taskSpots
    .map(spot => (tasksData as TaskDef[]).find(t => t.id === spot.taskId))
    .filter((t): t is TaskDef => t !== undefined);

  return (
    <div className="fixed inset-0 z-40 bg-[#283033]/95 flex flex-col justify-between p-4 md:p-8 text-[#E8DCC8] backdrop-blur-md overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5E8C61]/20 text-[#5E8C61] border border-[#5E8C61]/40">
            Fase de Planejamento Coletivo
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {selectedMap.name} — Como vamos nos organizar?
          </h2>
          <p className="text-xs md:text-sm text-[#E8DCC8]/70">
            Marquem as tarefas para alinhar intenções. Qualquer personagem pode realizar qualquer tarefa!
          </p>
        </div>

        {/* Timer & Start Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-2xl">
            <Clock size={18} className="text-[#D9A441]" />
            <span className="text-lg font-bold font-mono text-white">{countdown}s</span>
          </div>
          <button
            onClick={initWorld}
            className="flex items-center gap-2 bg-[#5E8C61] hover:bg-[#4d7550] active:scale-95 text-white font-extrabold px-5 py-2.5 rounded-2xl shadow-lg shadow-[#5E8C61]/30 transition-all cursor-pointer"
          >
            <Play size={18} fill="currentColor" />
            <span>Começar Mutirão!</span>
          </button>
        </div>
      </div>

      {/* Team Bar */}
      <div className="flex items-center gap-4 my-4 p-3 bg-white/5 rounded-2xl border border-white/10">
        <span className="text-xs font-bold uppercase text-[#D9A441]">Equipe:</span>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedChar1.appearance.color }} />
          <strong className="text-white">{selectedChar1.name}</strong> ({selectedChar1.talentName})
        </div>
        <span className="text-white/30">+</span>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedChar2.appearance.color }} />
          <strong className="text-white">{selectedChar2.name}</strong> ({selectedChar2.talentName})
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-2 flex-1">
        {mapTasks.map(task => {
          const isPlanned = plannedTaskIds.includes(task.id);
          return (
            <button
              key={task.id}
              onClick={() => togglePlannedTask(task.id)}
              className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isPlanned
                  ? 'bg-[#5E8C61]/25 border-[#5E8C61] shadow-md shadow-[#5E8C61]/20'
                  : 'bg-black/20 border-white/5 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F8198]">
                    Zona: {task.zone}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      isPlanned
                        ? 'bg-[#5E8C61] border-[#5E8C61] text-white'
                        : 'border-white/20 text-transparent'
                    }`}
                  >
                    <Check size={14} />
                  </div>
                </div>

                <div className="font-bold text-white text-sm leading-tight">{task.name}</div>
                <div className="text-xs text-[#E8DCC8]/70 mt-1 line-clamp-2">{task.description}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#E8DCC8]/60">
                <span>{task.isEssential ? '⭐ Essencial' : 'Opcional'}</span>
                {isPlanned && (
                  <span className="flex items-center gap-1 text-[#D9A441] font-semibold">
                    <Sparkles size={12} /> Marcada para início
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="text-center text-xs text-[#E8DCC8]/50 pt-2 border-t border-white/10">
        Dica: Marcar tarefas ajuda a coordenar quem pega primeiro o carrinho ou as pás na oficina!
      </div>
    </div>
  );
};
