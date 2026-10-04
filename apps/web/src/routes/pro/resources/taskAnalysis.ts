/**
 * Aprumo — Análise de Tarefa & Encadeamento Comportamental (Chaining)
 * Metodologia: ABA & Terapia Ocupacional
 */

export type PromptLevel = 'I' | 'DV' | 'DG' | 'DFP' | 'DFT';

export interface PromptMeta {
  code: PromptLevel;
  label: string;
  description: string;
  color: string;
  isIndependent: boolean;
}

export const PROMPT_HIERARCHY: PromptMeta[] = [
  { code: 'I', label: 'Independente', description: 'Sem qualquer pista ou dica', color: 'var(--ap-success, #2e7d32)', isIndependent: true },
  { code: 'DV', label: 'Dica Verbal', description: 'Instrução falada ou lembrete auditivo', color: '#1976d2', isIndependent: false },
  { code: 'DG', label: 'Dica Gestual', description: 'Apontar, sinalizar ou direcionar com o olhar', color: '#ed6c02', isIndependent: false },
  { code: 'DFP', label: 'Dica Física Parcial', description: 'Toque leve no cotovelo ou antebraço', color: '#9c27b0', isIndependent: false },
  { code: 'DFT', label: 'Dica Física Total', description: 'Mão sobre mão para conduzir o movimento', color: '#d32f2f', isIndependent: false },
];

export type ChainingMode = 'forward' | 'backward' | 'total-task';

export interface TaskStep {
  id: string;
  instruction: string;
  visualHint?: string;
}

export interface TaskPreset {
  id: string;
  title: string;
  category: 'autonomia' | 'higiene' | 'escolar';
  description: string;
  defaultMode: ChainingMode;
  steps: TaskStep[];
}

export const TASK_PRESETS: TaskPreset[] = [
  {
    id: 'lavar-maos',
    title: 'Lavar as Mãos Autonomamente',
    category: 'higiene',
    description: 'Protocolo de higiene das mãos com 7 etapas estruturadas.',
    defaultMode: 'forward',
    steps: [
      { id: 'lm-1', instruction: 'Abrir a torneira', visualHint: '🚰' },
      { id: 'lm-2', instruction: 'Molhar as mãos com água corrente', visualHint: '💧' },
      { id: 'lm-3', instruction: 'Pressionar o dosador de sabão líquido', visualHint: '🧴' },
      { id: 'lm-4', instruction: 'Esfregar palmas, dorso e entre os dedos por 10s', visualHint: '🧼' },
      { id: 'lm-5', instruction: 'Enxaguar as mãos retirando todo o sabão', visualHint: '🌊' },
      { id: 'lm-6', instruction: 'Fechar a torneira com o antebraço ou papel', visualHint: '✋' },
      { id: 'lm-7', instruction: 'Secar bem as mãos com a toalha', visualHint: '🧻' },
    ],
  },
  {
    id: 'escovar-dentes',
    title: 'Escovar os Dentes',
    category: 'higiene',
    description: 'Rotina de higiene bucal com preparação e escovação completa.',
    defaultMode: 'forward',
    steps: [
      { id: 'ed-1', instruction: 'Pegar a escova e abrir o tubo de pasta', visualHint: '🪥' },
      { id: 'ed-2', instruction: 'Colocar uma quantidade pequena de pasta na escova', visualHint: '🧴' },
      { id: 'ed-3', instruction: 'Molhar a escova levemente na água', visualHint: '💧' },
      { id: 'ed-4', instruction: 'Escovar os dentes superiores da frente e laterais', visualHint: '🦷' },
      { id: 'ed-5', instruction: 'Escovar os dentes inferiores e a língua', visualHint: '👅' },
      { id: 'ed-6', instruction: 'Bochechar água para enxaguar a boca', visualHint: '🥛' },
      { id: 'ed-7', instruction: 'Cuspir na pia e lavar a escova', visualHint: '🚰' },
      { id: 'ed-8', instruction: 'Secar a boca na toalha e guardar os itens', visualHint: '🧻' },
    ],
  },
  {
    id: 'calcar-tenis',
    title: 'Calçar o Tênis e Ajustar Fecho',
    category: 'autonomia',
    description: 'Cadeia de vestuário com calçamento e fixação de velcro/cadarço.',
    defaultMode: 'backward',
    steps: [
      { id: 'ct-1', instruction: 'Identificar o pé direito e esquerdo do tênis', visualHint: '👟' },
      { id: 'ct-2', instruction: 'Puxar a língua do tênis para frente', visualHint: '👅' },
      { id: 'ct-3', instruction: 'Encaixar a ponta do pé no calçado', visualHint: '🦶' },
      { id: 'ct-4', instruction: 'Puxar o calcanhar com firmeza até acomodar o pé', visualHint: '📐' },
      { id: 'ct-5', instruction: 'Puxar a tira de velcro ou cruzar os cadarços', visualHint: '🎗️' },
      { id: 'ct-6', instruction: 'Prender firmemente para firmar o tênis no pé', visualHint: '🔒' },
    ],
  },
  {
    id: 'arrumar-mochila',
    title: 'Arrumar a Mochila Escolar',
    category: 'escolar',
    description: 'Organização de material para transição escola/clínica.',
    defaultMode: 'total-task',
    steps: [
      { id: 'am-1', instruction: 'Conferir a agenda e o estojo com lápis', visualHint: '✏️' },
      { id: 'am-2', instruction: 'Guardar os cadernos e a pasta no compartimento principal', visualHint: '📚' },
      { id: 'am-3', instruction: 'Colocar a garrafinha de água no bolso lateral', visualHint: '🍶' },
      { id: 'am-4', instruction: 'Puxar o zíper fechando completamente a mochila', visualHint: '🤐' },
      { id: 'am-5', instruction: 'Colocar a mochila nas costas segurando as duas alças', visualHint: '🎒' },
    ],
  },
];

/**
 * Calcula a porcentagem de passos concluídos com independência.
 */
export function calculateIndependencePercentage(
  scores: Record<number, PromptLevel>,
  totalSteps: number,
): number {
  if (totalSteps <= 0) return 0;
  const indepCount = Object.values(scores).filter((v) => v === 'I').length;
  return Math.round((indepCount / totalSteps) * 100);
}

/**
 * Determina qual é o passo-alvo de ensino atual conforme o modo de encadeamento:
 * - Forward (Para frente): O primeiro passo que ainda não atingiu 'I'.
 * - Backward (Para trás): O último passo não dominado, caminhando do fim para o início.
 * - Total Task (Tarefa inteira): Todos os passos são alvos no momento da apresentação.
 */
export function findTargetStepIndex(
  mode: ChainingMode,
  scores: Record<number, PromptLevel>,
  totalSteps: number,
): number {
  if (totalSteps <= 0) return -1;

  if (mode === 'forward') {
    for (let i = 0; i < totalSteps; i++) {
      if (scores[i] !== 'I') return i;
    }
    return totalSteps - 1; // Todos dominados
  }

  if (mode === 'backward') {
    for (let i = totalSteps - 1; i >= 0; i--) {
      if (scores[i] !== 'I') return i;
    }
    return 0; // Todos dominados
  }

  // total-task
  return -1; // Na tarefa inteira, não há um único passo isolado
}

/**
 * Avalia se o critério clínico para progressão de encadeamento foi atingido
 * (Geralmente 100% de independência ou o passo-alvo realizado com I por 3 tentativas consecutivas).
 */
export function isTaskFullyIndependent(
  scores: Record<number, PromptLevel>,
  totalSteps: number,
): boolean {
  if (totalSteps <= 0) return false;
  for (let i = 0; i < totalSteps; i++) {
    if (scores[i] !== 'I') return false;
  }
  return true;
}
