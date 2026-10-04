import { useEffect, useMemo, useRef, useState } from 'react';
import { playTones, speak, useGameClient } from '@aprumo/game-sdk';
import {
  type ExecutiveChallengeType,
  type GoNoGoTrial,
  type RuleShiftTrial,
  type MemorySequenceTrial,
  planExecutiveTrials,
  evaluateGoNoGo,
  evaluateSequence,
} from './logic';
import { manifest } from './manifest';
import './game.css';

const TONES_HIT = [{ freq: 659.25, dur: 0.1, type: 'sine' as const }];
const TONES_NO_GO_STOP = [{ freq: 330, dur: 0.18, type: 'triangle' as const }];
const TONES_RULE_SHIFT = [
  { freq: 440, dur: 0.1, type: 'sine' as const },
  { freq: 880, dur: 0.2, delay: 0.1, type: 'sine' as const },
];
const PAD_FREQS = [523.25, 587.33, 659.25, 783.99];

export default function CircuitoExecutivo() {
  const { client, config } = useGameClient(manifest.appId, manifest.version);
  const [challenge, setChallenge] = useState<ExecutiveChallengeType>('gonogo');
  const [trialIndex, setTrialIndex] = useState(0);

  // Estados de Go / No-Go
  const [goNoGoState, setGoNoGoState] = useState<'idle' | 'showing' | 'result'>('idle');
  const [lastRt, setLastRt] = useState<number | null>(null);
  const [hitCount, setHitCount] = useState(0);

  // Estados de Troca de Regra
  const [ruleScore, setRuleScore] = useState(0);
  const [ruleFeedback, setRuleFeedback] = useState<string | null>(null);

  // Estados de Memória Operacional
  const [activePad, setActivePad] = useState<number | null>(null);
  const [memoryInput, setMemoryInput] = useState<number[]>([]);
  const [isDemoingSequence, setIsDemoingSequence] = useState(false);
  const [memoryScore, setMemoryScore] = useState(0);

  const trialStartRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const trials = useMemo(() => planExecutiveTrials(challenge, config), [challenge, config]);
  const currentTrial = trials[trialIndex];

  // Início de sessão
  useEffect(() => {
    if (config) {
      client.gameStarted(manifest.version);
    }
  }, [config, client]);

  // Limpeza de timers
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Handlers para Go / No-Go
  const startGoNoGoTrial = () => {
    if (!currentTrial || challenge !== 'gonogo') return;
    const gn = currentTrial as GoNoGoTrial;
    setGoNoGoState('showing');
    trialStartRef.current = Date.now();

    client.trialStarted({
      trialIndex,
      targetId: gn.id,
      presented: [gn.type],
    });
    client.stimulusPresented({
      trialIndex,
      targetId: gn.id,
      presented: [gn.type],
      positionOfTarget: 0,
    });

    // Se a criança não tocar até o final do tempo de exposição
    timerRef.current = window.setTimeout(() => {
      handleGoNoGoTap(false);
    }, gn.displayDurationMs);
  };

  const handleGoNoGoTap = (didTap: boolean) => {
    if (goNoGoState !== 'showing') return;
    if (timerRef.current) window.clearTimeout(timerRef.current);

    const gn = currentTrial as GoNoGoTrial;
    const latencyMs = didTap ? Date.now() - trialStartRef.current : gn.displayDurationMs;
    const evalRes = evaluateGoNoGo(gn.type, didTap);

    setLastRt(didTap ? latencyMs : null);
    setGoNoGoState('result');

    if (evalRes.isCorrect) {
      setHitCount((c) => c + 1);
      playTones(TONES_HIT, 'normal');
      client.responseRecorded({
        trialIndex,
        targetId: gn.id,
        stimulusId: gn.type,
        presented: [gn.type],
        positionOfTarget: 0,
        selected: didTap ? 'tap' : 'withhold',
        selectedPosition: 0,
        response: 'correct',
        latencyMs,
        promptLevel: 'independent',
        promptSource: 'none',
        detail: { outcome: evalRes.outcome, type: gn.type },
      });
      client.reinforcerPresented({ kind: 'animation', contingentOn: gn.id, intensity: 'subtle' });
    } else {
      playTones(TONES_NO_GO_STOP, 'normal');
      client.responseRecorded({
        trialIndex,
        targetId: gn.id,
        stimulusId: gn.type,
        presented: [gn.type],
        positionOfTarget: 0,
        selected: didTap ? 'tap' : 'withhold',
        selectedPosition: 0,
        response: 'incorrect',
        latencyMs,
        promptLevel: 'independent',
        promptSource: 'none',
        detail: { outcome: evalRes.outcome, type: gn.type },
      });
    }

    // Avança para o próximo
    timerRef.current = window.setTimeout(() => {
      setGoNoGoState('idle');
      if (trialIndex + 1 < trials.length) {
        setTrialIndex((i) => i + 1);
      } else {
        client.levelCompleted({ levelId: 'circuito-gonogo', levelIndex: 0, trialsCompleted: trials.length, correct: hitCount + 1, outcome: 'completed' });
        client.gameCompleted(trials.length);
      }
    }, 1000);
  };

  // Handlers para Troca de Regra
  const handleSelectRuleOption = (optId: string) => {
    const rs = currentTrial as RuleShiftTrial;
    const isCorrect = optId === rs.correctOptionId;
    const latencyMs = Date.now() - trialStartRef.current;

    if (isCorrect) {
      setRuleScore((s) => s + 1);
      playTones(TONES_HIT, 'normal');
      setRuleFeedback('✓ Correto! Regra aplicada com sucesso.');
      client.responseRecorded({
        trialIndex,
        targetId: rs.id,
        stimulusId: optId,
        presented: rs.options.map((o) => o.id),
        positionOfTarget: rs.options.findIndex((o) => o.id === rs.correctOptionId),
        selected: optId,
        selectedPosition: rs.options.findIndex((o) => o.id === optId),
        response: 'correct',
        latencyMs,
        promptLevel: 'independent',
        promptSource: 'none',
        detail: { rule: rs.activeRule },
      });
      client.reinforcerPresented({ kind: 'animation', contingentOn: rs.id, intensity: 'subtle' });
    } else {
      playTones(TONES_NO_GO_STOP, 'normal');
      setRuleFeedback(`Atenção: a regra ativa agora é ${rs.activeRule.toUpperCase()}!`);
    }

    timerRef.current = window.setTimeout(() => {
      setRuleFeedback(null);
      if (trialIndex + 1 < trials.length) {
        const nextTrial = trials[trialIndex + 1] as RuleShiftTrial;
        if (nextTrial.activeRule !== rs.activeRule) {
          playTones(TONES_RULE_SHIFT, 'normal');
          void speak(`Atenção! A regra mudou! Agora classifique por ${nextTrial.activeRule === 'shape' ? 'FORMA' : 'COR'}!`, 'normal');
        }
        setTrialIndex((i) => i + 1);
      } else {
        client.levelCompleted({ levelId: 'circuito-regras', levelIndex: 1, trialsCompleted: trials.length, correct: ruleScore + 1, outcome: 'completed' });
        client.gameCompleted(trials.length);
      }
    }, 1200);
  };

  // Handlers para Memória Operacional Corsi
  const playMemoryDemo = () => {
    const mem = currentTrial as MemorySequenceTrial;
    setIsDemoingSequence(true);
    setMemoryInput([]);

    mem.sequence.forEach((padIdx, i) => {
      window.setTimeout(() => {
        setActivePad(padIdx);
        playTones([{ freq: PAD_FREQS[padIdx] || 440, dur: 0.15, type: 'sine' }], 'normal');
        window.setTimeout(() => setActivePad(null), 350);
      }, (i + 1) * 600);
    });

    window.setTimeout(() => {
      setIsDemoingSequence(false);
      trialStartRef.current = Date.now();
      void speak('Sua vez! Repita a sequência tocando nos blocos.', 'normal');
    }, (mem.sequence.length + 1) * 600);
  };

  const handlePadTap = (padIdx: number) => {
    if (isDemoingSequence) return;
    const mem = currentTrial as MemorySequenceTrial;
    const nextInput = [...memoryInput, padIdx];
    setMemoryInput(nextInput);

    playTones([{ freq: PAD_FREQS[padIdx] || 440, dur: 0.12, type: 'sine' }], 'normal');
    setActivePad(padIdx);
    window.setTimeout(() => setActivePad(null), 200);

    const evalSeq = evaluateSequence(mem.sequence, nextInput);
    if (!evalSeq.isCorrect) {
      playTones(TONES_NO_GO_STOP, 'normal');
      void speak('Sequência diferente. Vamos tentar a próxima com atenção!', 'normal');
      timerRef.current = window.setTimeout(() => {
        if (trialIndex + 1 < trials.length) setTrialIndex((i) => i + 1);
      }, 1000);
    } else if (evalSeq.isComplete) {
      setMemoryScore((s) => s + 1);
      playTones(TONES_HIT, 'normal');
      void speak('Excelente memória de trabalho!', 'normal');
      client.reinforcerPresented({ kind: 'animation', contingentOn: mem.id, intensity: 'subtle' });
      timerRef.current = window.setTimeout(() => {
        if (trialIndex + 1 < trials.length) setTrialIndex((i) => i + 1);
        else {
          client.levelCompleted({ levelId: 'circuito-memoria', levelIndex: 2, trialsCompleted: trials.length, correct: memoryScore + 1, outcome: 'completed' });
          client.gameCompleted(trials.length);
        }
      }, 1200);
    }
  };

  return (
    <main className="circ-root">
      {/* Header com Seletor do Desafio Neurocognitivo */}
      <header className="circ-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--ap-sage-900)' }}>
            Circuito Executivo
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--ap-text-muted)' }}>
            Treino Neurocognitivo de Funções Executivas
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(
            [
              ['gonogo', '⚡ Go / No-Go'],
              ['ruleshift', '🔄 Troca de Regra'],
              ['workingmemory', '🧠 Memória Corsi'],
            ] as const
          ).map(([chKey, label]) => (
            <button
              key={chKey}
              type="button"
              className="rs-tab-pill"
              aria-pressed={challenge === chKey}
              onClick={() => {
                setChallenge(chKey);
                setTrialIndex(0);
                setGoNoGoState('idle');
                setRuleFeedback(null);
                setMemoryInput([]);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Arena de Desafio */}
      <div className="circ-arena">
        {challenge === 'gonogo' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ap-primary)' }}>
                ⭐ = TOQUE RÁPIDO! &nbsp;|&nbsp; 🛑 = NÃO TOQUE (INIBIÇÃO)!
              </span>
              {lastRt && <span style={{ fontSize: '0.85rem', color: 'var(--ap-text-muted)' }}>Tempo: {lastRt}ms</span>}
            </div>

            {goNoGoState === 'idle' && (
              <button
                type="button"
                className="det-choice-btn"
                onClick={startGoNoGoTrial}
                style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
              >
                ▶️ Iniciar Tentativa #{trialIndex + 1}
              </button>
            )}

            {goNoGoState === 'showing' && (
              <button
                type="button"
                className={`circ-gonogo-target ${(currentTrial as GoNoGoTrial).type}`}
                onClick={() => handleGoNoGoTap(true)}
                aria-label={`Estímulo ${(currentTrial as GoNoGoTrial).type}`}
              >
                {(currentTrial as GoNoGoTrial).targetSymbol}
              </button>
            )}

            {goNoGoState === 'result' && (
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ap-primary)' }}>
                {lastRt ? `✓ Registrado em ${lastRt}ms` : '✓ Inibição correta!'}
              </div>
            )}
          </div>
        )}

        {challenge === 'ruleshift' && currentTrial && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '12px',
                background: 'var(--ap-primary-soft, #f0fdf4)',
                border: '2px solid var(--ap-primary)',
                fontWeight: 800,
                color: 'var(--ap-primary)',
              }}
            >
              REGRA ATIVA: CLASSIFIQUE POR {(currentTrial as RuleShiftTrial).activeRule.toUpperCase()}
            </div>

            {/* Carta em Foco */}
            <div className="circ-rule-card">
              <span style={{ fontSize: '3rem' }}>
                {(currentTrial as RuleShiftTrial).card.shape === 'circle' ? '🔴' : '🟦'}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.5rem' }}>
                {(currentTrial as RuleShiftTrial).card.color === 'blue' ? 'Azul' : 'Laranja'}
              </span>
            </div>

            {/* Opções de Classificação */}
            <div className="circ-rule-options">
              {(currentTrial as RuleShiftTrial).options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="circ-rule-btn"
                  onClick={() => handleSelectRuleOption(opt.id)}
                >
                  <span style={{ fontSize: '2rem' }}>
                    {opt.shape === 'circle' ? '⭕' : '⏹️'}
                  </span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {ruleFeedback && (
              <div style={{ fontWeight: 700, color: 'var(--ap-primary)', marginTop: '0.5rem' }}>
                {ruleFeedback}
              </div>
            )}
          </div>
        )}

        {challenge === 'workingmemory' && currentTrial && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--ap-primary)' }}>
              Sequência de {(currentTrial as MemorySequenceTrial).sequenceLength} Blocos · Observe e Repita
            </div>

            {/* Grade dos 4 Blocos Corsi */}
            <div className="circ-memory-grid">
              {[0, 1, 2, 3].map((padIdx) => (
                <button
                  key={padIdx}
                  type="button"
                  className={`circ-memory-pad ${activePad === padIdx ? 'lit' : ''}`}
                  onClick={() => handlePadTap(padIdx)}
                  disabled={isDemoingSequence}
                  aria-label={`Bloco ${padIdx + 1}`}
                >
                  {padIdx + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="det-choice-btn"
              onClick={playMemoryDemo}
              disabled={isDemoingSequence}
            >
              👁️ Demonstrar Sequência
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export { CircuitoExecutivo as Game };
