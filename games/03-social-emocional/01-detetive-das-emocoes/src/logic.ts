/**
 * Aprumo — Detetive das Emoções.
 * Cognição social em três fases (cada uma é um LEVEL):
 *   1. Rostos      — emoções básicas, a pista do rosto já resolve.
 *   2. Situações   — emoções sociais (ansioso, orgulhoso, frustrado...), precisa juntar rosto + contexto + fala.
 *   3. Pensamentos — teoria da mente: o personagem SABE algo diferente de nós (crença falsa) ou esconde
 *                    o que sente (emoção aparente × real).
 * As alternativas são embaralhadas por semente (sem viés de posição) e limitadas por maxChoices.
 * A tentativa é pontuada na primeira escolha; depois a criança pode tentar de novo (correção).
 */
import { seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig } from '@aprumo/protocol';
import type { EmotionId, Look } from './Art';

export interface EmotionClue {
  type: 'face' | 'context' | 'speech' | 'belief';
  label: string;
  detail: string;
  icon: string;
}

export interface EmotionChoice {
  id: EmotionId;
  label: string;
  emoji: string;
  isCorrect: boolean;
  isPlausible: boolean;
}

export interface DetectiveCase {
  id: string;
  level: number;
  characterName: string;
  look: Look;
  scenarioTitle: string;
  /** Pergunta (na fase 3, sobre o que o personagem sente/pensa — não o que nós sabemos). */
  question: string;
  /** Emoção mostrada no rosto do personagem (na fase 3 pode ser a aparente, não a real). */
  shown: EmotionId;
  answer: EmotionId;
  plausible: EmotionId[];
  others: EmotionId[];
  clues: EmotionClue[];
  choices: EmotionChoice[];
  clinicalDebrief: string;
}

export const EMOTION_LABEL: Record<EmotionId, string> = {
  feliz: 'Feliz',
  triste: 'Triste',
  bravo: 'Bravo',
  medo: 'Com medo',
  surpresa: 'Surpreso',
  ansioso: 'Nervoso',
  orgulhoso: 'Orgulhoso',
  frustrado: 'Frustrado',
  entediado: 'Entediado',
  envergonhado: 'Envergonhado',
  aliviado: 'Aliviado',
  decepcionado: 'Decepcionado',
  animado: 'Animado',
};
const EMOJI: Record<EmotionId, string> = {
  feliz: '😄', triste: '😢', bravo: '😠', medo: '😨', surpresa: '😲', ansioso: '😰', orgulhoso: '😊',
  frustrado: '😤', entediado: '🥱', envergonhado: '😳', aliviado: '😌', decepcionado: '😞', animado: '🤩',
};

export const LEVEL_TITLES = ['Rostos', 'Situações', 'Pensamentos'];

const LOOKS: Look[] = [
  { skin: '#f6d2b0', hair: '#5b3a29', style: 'short' },
  { skin: '#c98b5e', hair: '#1f1a17', style: 'puffs' },
  { skin: '#8d5a3b', hair: '#1f1a17', style: 'curly' },
  { skin: '#f3c9a2', hair: '#c9822b', style: 'long' },
  { skin: '#e0ac7e', hair: '#3b2a20', style: 'short' },
  { skin: '#a8704a', hair: '#2a1d16', style: 'long' },
];

type Raw = Omit<DetectiveCase, 'choices' | 'look'> & { look: number };
const c = (r: Raw): DetectiveCase => ({ ...r, look: LOOKS[r.look]!, choices: [] });
const clue = (type: EmotionClue['type'], detail: string): EmotionClue => ({
  type,
  detail,
  label: type === 'face' ? 'Rosto' : type === 'context' ? 'O que aconteceu' : type === 'speech' ? 'O que disse' : 'O que sabe',
  icon: type === 'face' ? '👀' : type === 'context' ? '🏞️' : type === 'speech' ? '💬' : '💭',
});

export const DETECTIVE_CASES: DetectiveCase[] = [
  /* ---- Fase 1: rostos ---- */
  c({ id: 'caso-sorvete', level: 0, characterName: 'Pedro', look: 0, scenarioTitle: 'O sorvete caiu', question: 'Como o Pedro está se sentindo?', shown: 'triste', answer: 'triste', plausible: ['decepcionado'], others: ['feliz', 'surpresa', 'bravo'],
    clues: [clue('face', 'Sobrancelhas para cima, olhos baixos, boca para baixo e uma lágrima.'), clue('context', 'O sorvete de chocolate caiu no chão logo na primeira lambida.'), clue('speech', '"Era o meu sabor favorito..."')],
    clinicalDebrief: 'Perder algo de que gostamos deixa a gente triste. A lágrima e a boca para baixo são pistas fortes.' }),
  c({ id: 'caso-presente', level: 0, characterName: 'Ana', look: 1, scenarioTitle: 'O presente', question: 'Como a Ana está se sentindo?', shown: 'feliz', answer: 'feliz', plausible: ['animado'], others: ['triste', 'medo', 'bravo'],
    clues: [clue('face', 'Olhos fechadinhos de alegria e um sorrisão.'), clue('context', 'Ela ganhou o cachorrinho de pelúcia que tanto queria.'), clue('speech', '"Eu amei! Obrigada!"')],
    clinicalDebrief: 'Ganhar algo desejado traz alegria: olhos em meia-lua e sorriso aberto.' }),
  c({ id: 'caso-trovao', level: 0, characterName: 'Davi', look: 2, scenarioTitle: 'O trovão', question: 'Como o Davi está se sentindo?', shown: 'medo', answer: 'medo', plausible: ['surpresa'], others: ['feliz', 'entediado', 'orgulhoso'],
    clues: [clue('face', 'Olhos bem arregalados, sobrancelhas para cima e suor na testa.'), clue('context', 'A luz acabou e um trovão bem alto estourou lá fora.'), clue('speech', '"Mãe! Você está aí?"')],
    clinicalDebrief: 'Barulho forte no escuro dá medo. Olhos arregalados + chamar alguém por perto = pedir segurança.' }),
  c({ id: 'caso-torre', level: 0, characterName: 'Lia', look: 3, scenarioTitle: 'A torre derrubada', question: 'Como a Lia está se sentindo?', shown: 'bravo', answer: 'bravo', plausible: ['frustrado'], others: ['feliz', 'medo', 'aliviado'],
    clues: [clue('face', 'Sobrancelhas apertadas para baixo e boca tensa.'), clue('context', 'Um colega derrubou a torre dela de propósito e riu.'), clue('speech', '"Não foi legal! Eu estava montando!"')],
    clinicalDebrief: 'Quando alguém estraga algo de propósito, sentimos raiva. Falar o que incomodou é uma boa saída.' }),
  c({ id: 'caso-magico', level: 0, characterName: 'Teo', look: 4, scenarioTitle: 'O mágico', question: 'Como o Teo está se sentindo?', shown: 'surpresa', answer: 'surpresa', plausible: ['animado'], others: ['triste', 'bravo', 'entediado'],
    clues: [clue('face', 'Sobrancelhas lá no alto, olhos arregalados e boca em "O".'), clue('context', 'Um coelho saiu de dentro da cartola vazia do mágico.'), clue('speech', '"Uau! Como ele fez isso?"')],
    clinicalDebrief: 'Algo inesperado causa surpresa: sobrancelhas altas e boca em "O".' }),
  /* ---- Fase 2: situações ---- */
  c({ id: 'caso-apresentacao', level: 1, characterName: 'Lucas', look: 0, scenarioTitle: 'A apresentação', question: 'Como o Lucas está se sentindo?', shown: 'ansioso', answer: 'ansioso', plausible: ['medo'], others: ['entediado', 'bravo', 'orgulhoso'],
    clues: [clue('face', 'Sobrancelhas preocupadas, boca tremida e uma gota de suor.'), clue('context', 'Ele vai apresentar o trabalho na frente da turma inteira.'), clue('speech', '"Minha garganta secou... todo mundo está olhando."')],
    clinicalDebrief: 'Ser o centro das atenções pode deixar a gente nervoso. Respirar fundo ajuda.' }),
  c({ id: 'caso-mural', level: 1, characterName: 'Bianca', look: 5, scenarioTitle: 'O desenho no mural', question: 'Como a Bianca está se sentindo?', shown: 'orgulhoso', answer: 'orgulhoso', plausible: ['envergonhado', 'feliz'], others: ['bravo', 'medo'],
    clues: [clue('face', 'Queixo levantado, olhos sorridentes, um sorriso calmo.'), clue('context', 'A professora pendurou o desenho dela no mural como exemplo.'), clue('speech', '"Eu treinei muito a sombra antes de pintar!"')],
    clinicalDebrief: 'Orgulho é a alegria por algo que NÓS conseguimos com esforço.' }),
  c({ id: 'caso-quebra-cabeca', level: 1, characterName: 'Miguel', look: 2, scenarioTitle: 'A peça que não encaixa', question: 'Como o Miguel está se sentindo?', shown: 'frustrado', answer: 'frustrado', plausible: ['bravo', 'triste'], others: ['animado', 'aliviado'],
    clues: [clue('face', 'Testa franzida, olhos para baixo, boca reta.'), clue('context', 'Faz 20 minutos que ele tenta e a última peça não entra.'), clue('speech', '"Aff! Eu já tentei de todo jeito!"')],
    clinicalDebrief: 'Frustração aparece quando nos esforçamos e não dá certo. Pausar e pedir ajuda vale.' }),
  c({ id: 'caso-fila', level: 1, characterName: 'Nina', look: 3, scenarioTitle: 'A fila sem fim', question: 'Como a Nina está se sentindo?', shown: 'entediado', answer: 'entediado', plausible: ['frustrado'], others: ['medo', 'surpresa', 'orgulhoso'],
    clues: [clue('face', 'Olhos meio fechados, cabeça caída, boca reta.'), clue('context', 'Ela está esperando na fila do médico há muito tempo, sem nada para fazer.'), clue('speech', '"Ainda falta muito?"')],
    clinicalDebrief: 'Tédio é quando nada interessante acontece. Ter um plano para esperar ajuda.' }),
  c({ id: 'caso-tropeco', level: 1, characterName: 'Rafa', look: 4, scenarioTitle: 'O tropeço', question: 'Como o Rafa está se sentindo?', shown: 'envergonhado', answer: 'envergonhado', plausible: ['triste'], others: ['feliz', 'bravo', 'entediado'],
    clues: [clue('face', 'Bochechas vermelhas, olhar para o lado, sorriso sem graça.'), clue('context', 'Ele tropeçou no recreio e alguns colegas olharam.'), clue('speech', '"Ops... ninguém viu, né?"')],
    clinicalDebrief: 'Vergonha aparece quando achamos que os outros nos julgam. Todo mundo tropeça às vezes.' }),
  c({ id: 'caso-cachorro', level: 1, characterName: 'Clara', look: 1, scenarioTitle: 'O cachorro voltou', question: 'Como a Clara está se sentindo?', shown: 'aliviado', answer: 'aliviado', plausible: ['feliz'], others: ['bravo', 'medo', 'entediado'],
    clues: [clue('face', 'Olhos fechados, ombros relaxados e um sorriso calmo.'), clue('context', 'O cachorro dela tinha fugido e acabou de voltar para casa.'), clue('speech', '"Ufa! Que bom que você está bem!"')],
    clinicalDebrief: 'Alívio é quando uma preocupação grande acaba bem: o corpo relaxa.' }),
  /* ---- Fase 3: pensamentos (teoria da mente) ---- */
  c({ id: 'caso-festa-surpresa', level: 2, characterName: 'Theo', look: 0, scenarioTitle: 'Ele não sabe da festa', question: 'Como o Theo se sente ANTES de abrir a porta?', shown: 'triste', answer: 'triste', plausible: ['decepcionado'], others: ['feliz', 'animado', 'bravo'],
    clues: [clue('context', 'Os amigos prepararam uma festa surpresa para o Theo na sala.'), clue('belief', 'O Theo NÃO sabe da festa. Ele acha que todos esqueceram o aniversário dele.'), clue('speech', '"Ninguém lembrou de mim hoje..."')],
    clinicalDebrief: 'NÓS sabemos da festa, mas o Theo não. Ele sente a partir do que ELE pensa: que foi esquecido.' }),
  c({ id: 'caso-chocolate', level: 2, characterName: 'Bia', look: 5, scenarioTitle: 'O chocolate da gaveta', question: 'Como a Bia se sente indo até a gaveta?', shown: 'animado', answer: 'animado', plausible: ['feliz'], others: ['triste', 'bravo', 'medo'],
    clues: [clue('context', 'A Bia guardou um chocolate na gaveta e foi brincar. O irmão comeu o chocolate enquanto ela estava fora.'), clue('belief', 'A Bia não viu o irmão comer. Ela acha que o chocolate ainda está lá.'), clue('speech', '"Agora vou comer meu chocolate!"')],
    clinicalDebrief: 'A Bia ainda não sabe que o chocolate sumiu, então está animada. A tristeza só viria ao abrir a gaveta.' }),
  c({ id: 'caso-presente-vovo', level: 2, characterName: 'Nina', look: 3, scenarioTitle: 'O presente da vovó', question: 'Como a Nina se sente POR DENTRO?', shown: 'feliz', answer: 'decepcionado', plausible: ['triste'], others: ['bravo', 'medo', 'orgulhoso'],
    clues: [clue('face', 'Ela está sorrindo para a vovó.'), clue('context', 'A Nina queria um jogo, mas ganhou um suéter que pinica.'), clue('belief', 'Ela sorriu e agradeceu para não magoar a vovó.')],
    clinicalDebrief: 'Às vezes mostramos uma emoção por fora e sentimos outra por dentro, por gentileza.' }),
  c({ id: 'caso-lapis', level: 2, characterName: 'Davi', look: 2, scenarioTitle: 'A caixa de lápis', question: 'Como o Davi se sente quando abre a caixa?', shown: 'surpresa', answer: 'surpresa', plausible: ['animado'], others: ['entediado', 'triste', 'bravo'],
    clues: [clue('context', 'O Davi pegou a caixa de lápis de cor para desenhar.'), clue('belief', 'Ele espera encontrar lápis. Mas dentro tem velinhas de aniversário!'), clue('face', 'Sobrancelhas no alto e boca em "O".')],
    clinicalDebrief: 'Surpresa é quando o que encontramos é diferente do que ESPERÁVAMOS.' }),
];

/** Monta as alternativas: certa + plausíveis + outras, cortadas em `n` e embaralhadas. */
export function buildChoices(cs: DetectiveCase, n: number, rnd: () => number): EmotionChoice[] {
  const k = Math.max(2, Math.min(4, n));
  const pool: EmotionId[] = [cs.answer, ...cs.plausible.slice(0, k >= 4 ? 1 : 0), ...cs.others];
  const ids = [...new Set(pool)].slice(0, k);
  return shuffle(ids, rnd).map((id) => ({ id, label: EMOTION_LABEL[id], emoji: EMOJI[id], isCorrect: id === cs.answer, isPlausible: id === cs.answer || cs.plausible.includes(id) }));
}

/**
 * Plano: casos por fase = clamp(trialsPerTarget/1.5, 2, 5), fases de `params.startLevel` em diante.
 * Ordem dos casos e das alternativas por semente.
 */
export function planDetectiveTrials(config?: Pick<SessionConfig, 'clinical' | 'adaptation' | 'params'> | null): DetectiveCase[] {
  const seed = config?.clinical.seed ?? 1;
  const rnd = seededRandom(seed);
  const per = Math.max(2, Math.min(5, Math.round((config?.clinical.trialsPerTarget ?? 4) / 1.5)));
  const startRaw = config?.params?.startLevel;
  const start = typeof startRaw === 'number' ? Math.max(0, Math.min(2, Math.floor(startRaw))) : 0;
  const n = config?.adaptation.maxChoices ?? 4;
  const out: DetectiveCase[] = [];
  for (let lv = start; lv < 3; lv++) {
    const cases = shuffle(DETECTIVE_CASES.filter((x) => x.level === lv), rnd).slice(0, per);
    for (const cs of cases) out.push({ ...cs, choices: buildChoices(cs, n, rnd) });
  }
  return out;
}

export function evaluateChoice(caseId: string, choiceId: string): { isCorrect: boolean; isPlausible: boolean; explanation: string } {
  const cs = DETECTIVE_CASES.find((x) => x.id === caseId);
  if (!cs) return { isCorrect: false, isPlausible: false, explanation: 'Caso não localizado.' };
  if (choiceId === cs.answer) return { isCorrect: true, isPlausible: true, explanation: `Muito bem, detetive! ${cs.clinicalDebrief}` };
  if (cs.plausible.includes(choiceId as EmotionId)) {
    return { isCorrect: false, isPlausible: true, explanation: 'Faz sentido pensar assim! Mas olhe as pistas de novo: tem uma emoção que combina ainda mais.' };
  }
  return { isCorrect: false, isPlausible: false, explanation: 'Hmm, as pistas apontam para outro sentimento. Que tal ver mais uma pista?' };
}
