import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { TaskDef } from '../types';
import tasksData from '../data/tasks.json';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Flag } from 'lucide-react';

export const SharedGoals: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const world = useGameStore(s => s.worldState);

  if (!world) return null;

  // Filter tasks in current map
  const mapTasks = world.mapDef.taskSpots
    .map(spot => {
      const def = (tasksData as TaskDef[]).find(t => t.id === spot.taskId);
      const state = world.activeTasks.get(spot.taskId);
      return { def, state };
    })
    .filter((item): item is { def: TaskDef; state: any } => item.def !== undefined);

  const completedCount = mapTasks.filter(t => t.state?.isCompleted).length;
  const totalCount = mapTasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="absolute top-4 left-4 z-20 max-w-xs md:max-w-sm pointer-events-auto">
      <div className="bg-[#283033]/90 backdrop-blur-md border border-[#4F8198]/40 rounded-2xl shadow-xl overflow-hidden text-[#E8DCC8] transition-all">
        {/* Header Bar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-white/5 transition-colors"
          title="Metas Coletivas do Mutirão"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#5E8C61]/30 border border-[#5E8C61] flex items-center justify-center text-[#5E8C61]">
              <Flag size={18} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-[#D9A441]">
                Metas do Grupo
              </div>
              <div className="text-sm font-extrabold text-white">
                {completedCount} de {totalCount} concluídas ({progressPct}%)
              </div>
            </div>
          </div>
          <div className="text-[#E8DCC8]/70 p-1">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {/* Progress bar */}
        <div className="w-full bg-[#1e2426] h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#D9A441] to-[#5E8C61] h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Task List (Collapsible) */}
        {isExpanded && (
          <div className="p-3 max-h-60 overflow-y-auto space-y-2 border-t border-white/10 text-xs">
            {mapTasks.map(({ def, state }) => {
              const isDone = state?.isCompleted;
              return (
                <div
                  key={def.id}
                  className={`flex items-start gap-2 p-2 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-[#5E8C61]/20 border-[#5E8C61]/50 text-emerald-200'
                      : 'bg-black/20 border-white/5 text-[#E8DCC8]'
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 size={16} className="text-[#5E8C61]" />
                    ) : (
                      <Circle size={16} className="text-[#D9A441]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold ${isDone ? 'line-through opacity-80' : 'text-white'}`}>
                      {def.name}
                    </div>
                    <div className="text-[11px] text-[#E8DCC8]/70 truncate">
                      {def.description}
                    </div>
                    {state && !isDone && state.progress > 0 && (
                      <div className="mt-1 w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#5E8C61] h-full transition-all"
                          style={{ width: `${Math.round(state.progress)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {def.isEssential && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D9A441]/20 text-[#D9A441] border border-[#D9A441]/40 shrink-0">
                      Essencial
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
