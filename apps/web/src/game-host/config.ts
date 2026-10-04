/**
 * Monta a configuração de um jogo para TREINO LIVRE no espaço da criança.
 * Usa os estímulos do plano (o que a criança já conhece), mas os eventos não viram registro clínico:
 * sem sessão aplicada por profissional, é telemetria lúdica (princípio P2).
 */
import { DEFAULT_ADAPTATION, PROTOCOL_VERSION, type SessionConfig, type TargetConfig } from '@aprumo/protocol';
import { STIMULUS_ART, STIMULUS_KEYS } from '@aprumo/stimuli';
import { db, getState } from '../data/store';
import type { CaseRecord } from '../data/types';
import { GAMES } from './registry';

export function buildPracticeConfig(c: CaseRecord, appId: string, trialsPerTarget = 4): SessionConfig {
  const manifest = GAMES[appId]!.manifest;
  const child = db.childOf(c);
  const h = db.hierarchies[0]!;
  const programs = db.programs.filter((p) => p.caseId === c.id && manifest.clinical.repertoires.includes(p.repertoire));
  const known = c.model === 'ABA' ? programs.flatMap((p) => stateTargets(p.id)) : [];
  const caseArts = [...new Set(stateTargets(null, c.id).map((t) => t.art))];
  const stim = (k: string) => ({ stimulusId: `stm-${k}`, label: STIMULUS_ART[k]?.label ?? k, art: k });
  const repertoire = programs[0]?.repertoire ?? manifest.clinical.repertoires[0] ?? 'matching';

  // Alvos do plano compatíveis; sem eles, figuras do acervo para brincar.
  const picks = known.length ? known.slice(0, 3).map((t) => ({ id: `practice:${t.id}`, name: t.name, art: t.art })) : ['bola', 'carro', 'peixe'].map((k) => ({ id: `practice:${k}`, name: STIMULUS_ART[k]!.label, art: k }));
  const pool = [...caseArts, ...STIMULUS_KEYS];
  const targets: TargetConfig[] = picks.map((t) => ({
    targetId: t.id,
    name: t.name,
    phase: 'acquisition',
    repertoire,
    fieldSize: Math.min(3, c.adaptation.maxChoices),
    stimulus: stim(t.art),
    distractors: [...new Set(pool)].filter((k) => k !== t.art).slice(0, 5).map(stim),
    promptHierarchy: h.levels,
    scoring: 'auto',
  }));

  return {
    protocolVersion: PROTOCOL_VERSION,
    runId: `practice-${crypto.randomUUID()}`,
    appId,
    appVersion: manifest.version,
    childDisplayName: child.preferredName,
    clinical: { model: 'ABA', targets: appId === 'minha-vez-sua-vez' ? targets.slice(0, 1) : targets, trialsPerTarget: appId === 'minha-vez-sua-vez' ? 5 : trialsPerTarget, interleave: true, seed: Math.floor(Math.random() * 2 ** 31) },
    adaptation: { ...DEFAULT_ADAPTATION, ...c.adaptation, screenBudgetSec: db.screenPolicy(child.birthDate).maxBlockMinutes * 60 },
    params: { practice: true },
  };
}

function stateTargets(programId: string | null, caseId?: string) {
  return getState().targets.filter((t) => (programId ? t.programId === programId : t.caseId === caseId) && t.phase !== 'suspended');
}
