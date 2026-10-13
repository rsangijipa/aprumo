import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import { Sparkles, HeartHandshake, CheckCircle2, RotateCcw, Play } from 'lucide-react';

export const Results: React.FC = () => {
  const lastResults = useGameStore(s => s.lastResults);
  const continuePlayingWithoutTime = useGameStore(s => s.continuePlayingWithoutTime);
  const resetToMenu = useGameStore(s => s.resetToMenu);

  useEffect(() => {
    if (lastResults?.isCompleteVictory) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [lastResults]);

  if (!lastResults) return null;

  const {
    parkName,
    tasksCompleted,
    essentialTasksCompleted,
    totalEssentialTasks,
    helpsGiven,
    eventsHandled,
    isCompleteVictory
  } = lastResults;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#283033]/90 backdrop-blur-md p-4 text-[#E8DCC8]">
      <div className="bg-[#283033] border-2 border-[#5E8C61] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl text-center flex flex-col items-center">
        {/* Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#5E8C61]/20 border border-[#5E8C61] flex items-center justify-center text-[#5E8C61] mb-4 shadow-inner">
          {isCompleteVictory ? <Sparkles size={36} /> : <HeartHandshake size={36} />}
        </div>

        <span className="text-xs uppercase font-extrabold tracking-widest text-[#D9A441] mb-1">
          {isCompleteVictory ? 'Objetivos Alcançados com Sucesso!' : 'Encerramento do Turno'}
        </span>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
          {isCompleteVictory
            ? `${parkName} está pronto para o Festival!`
            : 'Foi isso que o grupo conseguiu hoje.'}
        </h2>

        <p className="text-xs md:text-sm text-[#E8DCC8]/80 mb-6 max-w-md">
          {isCompleteVictory
            ? 'A comunidade inteira vai celebrar neste espaço lindo, limpo e acolhedor graças ao esforço conjunto!'
            : 'Cada muda plantada, banco pintado e rampa desimpedida já fez uma enorme diferença para o parque comunitário.'}
        </p>

        {/* Collective Stats (NO individual ranking) */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-2xl font-black text-white">{tasksCompleted}</span>
            <span className="text-[11px] text-[#E8DCC8]/70 mt-0.5">Tarefas Feitas</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-2xl font-black text-[#5E8C61]">{helpsGiven}</span>
            <span className="text-[11px] text-[#E8DCC8]/70 mt-0.5">Ações Solidárias</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-2xl font-black text-[#D9A441]">{eventsHandled}</span>
            <span className="text-[11px] text-[#E8DCC8]/70 mt-0.5">Eventos Superados</span>
          </div>
        </div>

        {/* Progress summary pill */}
        <div className="w-full bg-black/30 border border-white/10 rounded-2xl p-3 mb-6 flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-2 text-white">
            <CheckCircle2 size={16} className="text-[#5E8C61]" />
            Metas Essenciais Concluídas:
          </span>
          <span className="text-[#D9A441] font-bold text-sm">
            {essentialTasksCompleted} de {totalEssentialTasks}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {!isCompleteVictory && (
            <button
              onClick={continuePlayingWithoutTime}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[#5E8C61] hover:bg-[#4d7550] active:scale-95 text-white font-bold py-3 px-4 rounded-2xl shadow-lg transition-all cursor-pointer text-sm"
            >
              <Play size={16} fill="currentColor" />
              <span>Continuar Sem Tempo</span>
            </button>
          )}

          <button
            onClick={resetToMenu}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold py-3 px-4 rounded-2xl transition-all cursor-pointer text-sm"
          >
            <RotateCcw size={16} />
            <span>Voltar ao Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
