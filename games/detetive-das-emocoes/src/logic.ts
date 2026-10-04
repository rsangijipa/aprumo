/**
 * Aprumo — Detetive das Emoções
 * Lógica clínica de cognição social, teoria da mente e pistas progressivas
 */

import type { SessionConfig } from '@aprumo/protocol';

export interface EmotionClue {
  type: 'face' | 'context' | 'speech';
  label: string;
  detail: string;
  icon: string;
}

export interface EmotionChoice {
  id: string;
  label: string;
  emoji: string;
  isCorrect: boolean;
  isPlausible: boolean;
}

export interface DetectiveCase {
  id: string;
  characterName: string;
  scenarioTitle: string;
  clues: EmotionClue[];
  choices: EmotionChoice[];
  clinicalDebrief: string;
}

export const DETECTIVE_CASES: DetectiveCase[] = [
  {
    id: 'caso-apresentacao',
    characterName: 'Lucas',
    scenarioTitle: 'A Apresentação na Frente da Turma',
    clues: [
      { type: 'face', label: 'Expressão Facial', detail: 'Olhos arregalados, testa franzida e mãos segurando firme o cartaz.', icon: '👀' },
      { type: 'context', label: 'Cenário & Situação', detail: 'Lucas foi chamado para apresentar o trabalho na frente de toda a classe.', icon: '🏫' },
      { type: 'speech', label: 'Tom de Voz & Fala', detail: '"Minha garganta secou... todo mundo está olhando para mim."', icon: '🎙️' },
    ],
    choices: [
      { id: 'ansioso', label: 'Ansioso / Nervoso', emoji: '😰', isCorrect: true, isPlausible: true },
      { id: 'entediado', label: 'Entediado', emoji: '🥱', isCorrect: false, isPlausible: false },
      { id: 'raiva', label: 'Com Raiva', emoji: '😡', isCorrect: false, isPlausible: false },
      { id: 'alegre', label: 'Muito Confortável', emoji: '😄', isCorrect: false, isPlausible: false },
    ],
    clinicalDebrief: 'Lucas sente ansiedade situacional diante da atenção social do grupo. Normalizar o nervosismo é uma excelente estratégia.',
  },
  {
    id: 'caso-festa-surpresa',
    characterName: 'Clara',
    scenarioTitle: 'A Porta se Abre',
    clues: [
      { type: 'face', label: 'Expressão Facial', detail: 'Sobrancelhas bem altas, boca formando um "O" e um sorriso nascendo.', icon: '👀' },
      { type: 'context', label: 'Cenário & Situação', detail: 'Ao entrar na sala escura, as luzes acenderam e amigos gritaram "Parabéns!".', icon: '🎉' },
      { type: 'speech', label: 'Tom de Voz & Fala', detail: '"Nossa! Eu achei que todo mundo tinha esquecido meu aniversário!"', icon: '🎙️' },
    ],
    choices: [
      { id: 'surpresa-positiva', label: 'Surpresa Agradável', emoji: '😲', isCorrect: true, isPlausible: true },
      { id: 'triste', label: 'Tristeza', emoji: '😢', isCorrect: false, isPlausible: false },
      { id: 'brava', label: 'Indignação', emoji: '😠', isCorrect: false, isPlausible: false },
      { id: 'sonolenta', label: 'Sonolência', emoji: '😴', isCorrect: false, isPlausible: false },
    ],
    clinicalDebrief: 'A surpresa positiva combina espanto momentâneo seguido de alívio e alegria pelo reconhecimento do grupo.',
  },
  {
    id: 'caso-brinquedo-quebrado',
    characterName: 'Miguel',
    scenarioTitle: 'A Peça que Caiu',
    clues: [
      { type: 'face', label: 'Expressão Facial', detail: 'Olhar voltado para baixo, cantos da boca caídos e ombros descaídos.', icon: '👀' },
      { type: 'context', label: 'Cenário & Situação', detail: 'A torre de blocos complexa que Miguel passou 40 minutos montando desmoronou.', icon: '🧱' },
      { type: 'speech', label: 'Tom de Voz & Fala', detail: '"Ah não... deu tanto trabalho para equilibrar tudo..."', icon: '🎙️' },
    ],
    choices: [
      { id: 'frustrado-triste', label: 'Frustrado / Desanimado', emoji: '😔', isCorrect: true, isPlausible: true },
      { id: 'aliviado', label: 'Aliviado', emoji: '😌', isCorrect: false, isPlausible: false },
      { id: 'empolgado', label: 'Empolgado', emoji: '🤩', isCorrect: false, isPlausible: false },
      { id: 'curioso', label: 'Curioso', emoji: '🧐', isCorrect: false, isPlausible: true },
    ],
    clinicalDebrief: 'Frustração por perda de esforço investido. Reconhecer a decepção antecede o plano de reconstrução.',
  },
  {
    id: 'caso-quadro-elogio',
    characterName: 'Bianca',
    scenarioTitle: 'O Trabalho no Mural',
    clues: [
      { type: 'face', label: 'Expressão Facial', detail: 'Postura ereta, queixo levantado, sorriso caloroso e olhos focados no mural.', icon: '👀' },
      { type: 'context', label: 'Cenário & Situação', detail: 'O professor escolheu o desenho de Bianca como modelo e elogiou na frente de todos.', icon: '🖼️' },
      { type: 'speech', label: 'Tom de Voz & Fala', detail: '"Eu pratiquei várias vezes a sombra com o lápis antes de pintar!"', icon: '🎙️' },
    ],
    choices: [
      { id: 'orgulho', label: 'Orgulho / Satisfação', emoji: '😊', isCorrect: true, isPlausible: true },
      { id: 'vergonha', label: 'Envergonhada', emoji: '😳', isCorrect: false, isPlausible: true },
      { id: 'raiva', label: 'Irritada', emoji: '😤', isCorrect: false, isPlausible: false },
      { id: 'medo', label: 'Amedrontada', emoji: '😨', isCorrect: false, isPlausible: false },
    ],
    clinicalDebrief: 'Orgulho legítimo pelo resultado do trabalho. A vergonha moderada é uma nuance plausível em crianças tímidas.',
  },
];

export function evaluateChoice(
  caseId: string,
  choiceId: string,
): { isCorrect: boolean; isPlausible: boolean; explanation: string } {
  const c = DETECTIVE_CASES.find((x) => x.id === caseId);
  if (!c) {
    return { isCorrect: false, isPlausible: false, explanation: 'Caso não localizado.' };
  }

  const choice = c.choices.find((ch) => ch.id === choiceId);
  if (!choice) {
    return { isCorrect: false, isPlausible: false, explanation: 'Alternativa não encontrada.' };
  }

  if (choice.isCorrect) {
    return {
      isCorrect: true,
      isPlausible: true,
      explanation: `Excelente dedução, detetive! ${c.clinicalDebrief}`,
    };
  }

  if (choice.isPlausible) {
    return {
      isCorrect: false,
      isPlausible: true,
      explanation: `Essa é uma interpretação interessante e compreensível, mas veja as pistas com calma: ${c.clinicalDebrief}`,
    };
  }

  return {
    isCorrect: false,
    isPlausible: false,
    explanation: 'As pistas faciais e contextuais apontam para outro sentimento. Observe novamente os detalhes.',
  };
}

export function planDetectiveTrials(config?: SessionConfig | null): DetectiveCase[] {
  const count = config?.clinical?.trialsPerTarget ?? 4;
  return DETECTIVE_CASES.slice(0, Math.min(count, DETECTIVE_CASES.length));
}
