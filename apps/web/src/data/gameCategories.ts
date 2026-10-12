export type GameCategoryId =
  | 'todos'
  | 'comunicacao-linguagem'
  | 'cognicao-pareamento'
  | 'social-emocional'
  | 'imitacao-musica'
  | 'rotinas-brincar'
  | 'autonomia-vida-diaria';

export interface GameCategoryMeta {
  id: GameCategoryId;
  label: string;
  folder: string;
  icon: string;
  color: string;
  description: string;
}

export const GAME_CATEGORIES: Record<Exclude<GameCategoryId, 'todos'>, GameCategoryMeta> = {
  'comunicacao-linguagem': {
    id: 'comunicacao-linguagem',
    label: 'Comunicação & Linguagem',
    folder: '01-comunicacao-linguagem',
    icon: '💬',
    color: '#2563eb',
    description: 'Compreensão auditiva, resposta a instrução falada e leitura compartilhada.',
  },
  'cognicao-pareamento': {
    id: 'cognicao-pareamento',
    label: 'Cognição & Pareamento',
    folder: '02-cognicao-pareamento',
    icon: '🧩',
    color: '#059669',
    description: 'Pareamento idêntico e não-idêntico, memória de trabalho e classificação.',
  },
  'social-emocional': {
    id: 'social-emocional',
    label: 'Social & Emocional',
    folder: '03-social-emocional',
    icon: '🤝',
    color: '#db2777',
    description: 'Atenção compartilhada, reciprocidade de turnos e identificação de emoções.',
  },
  'imitacao-musica': {
    id: 'imitacao-musica',
    label: 'Imitação & Música',
    folder: '04-imitacao-musica',
    icon: '🎵',
    color: '#7c3aed',
    description: 'Imitação motora ampla e fina, ritmo, controle inibitório e resposta vocal.',
  },
  'rotinas-brincar': {
    id: 'rotinas-brincar',
    label: 'Rotinas & Brincar',
    folder: '05-rotinas-brincar',
    icon: '🧸',
    color: '#ea580c',
    description: 'Causa e efeito, brincar funcional e simbólico, e rotinas lúdicas compartilhadas.',
  },
  'autonomia-vida-diaria': {
    id: 'autonomia-vida-diaria',
    label: 'Autonomia & Vida Diária',
    folder: '06-autonomia-vida-diaria',
    icon: '⭐',
    color: '#0284c7',
    description: 'Funções executivas, AVDs, sequência temporal e independência no cotidiano.',
  },
};

export const GAME_TO_CATEGORY: Record<string, Exclude<GameCategoryId, 'todos'>> = {
  // 01-comunicacao-linguagem
  'bolhas-magicas': 'comunicacao-linguagem',
  'escolha-pela-instrucao': 'comunicacao-linguagem',
  'fazendinha-sonora': 'comunicacao-linguagem',
  'leitura-de-cena': 'comunicacao-linguagem',

  // 02-cognicao-pareamento
  'encontre-o-igual': 'cognicao-pareamento',
  'encaixa-ai': 'cognicao-pareamento',
  'organize-categoria': 'cognicao-pareamento',
  'memoria-bichos': 'cognicao-pareamento',
  'par-perfeito': 'cognicao-pareamento',
  'cada-um-no-seu-pote': 'cognicao-pareamento',

  // 03-social-emocional
  'detetive-das-emocoes': 'social-emocional',
  'olha-comigo': 'social-emocional',
  'minha-vez-sua-vez': 'social-emocional',
  'social-city': 'social-emocional',
  'mutirao-do-parque': 'social-emocional',

  // 04-imitacao-musica
  'espelho-magico': 'imitacao-musica',
  'tambor-da-imitacao': 'imitacao-musica',
  'siga-o-mestre': 'imitacao-musica',
  'danca-do-congelar': 'imitacao-musica',
  'banda-do-tico': 'imitacao-musica',

  // 05-rotinas-brincar
  'rampa-maluca': 'rotinas-brincar',
  'lanche-do-urso': 'rotinas-brincar',
  'minimundos': 'rotinas-brincar',
  'torre-derruba': 'rotinas-brincar',
  'causa-efeito': 'rotinas-brincar',

  // 06-autonomia-vida-diaria
  'circuito-executivo': 'autonomia-vida-diaria',
  'missao-independencia': 'autonomia-vida-diaria',
  'pequeno-chef': 'autonomia-vida-diaria',
  'historia-ordem': 'autonomia-vida-diaria',
  'mercadinho-da-esquina': 'autonomia-vida-diaria',
  'passo-a-passo': 'autonomia-vida-diaria',
  'quadro-de-conquistas': 'autonomia-vida-diaria',
  'escape-room-kids': 'autonomia-vida-diaria',
  'vida-online': 'autonomia-vida-diaria',
};

export function getCategoryOfGame(appId: string): GameCategoryMeta {
  const catId = GAME_TO_CATEGORY[appId] ?? 'cognicao-pareamento';
  return GAME_CATEGORIES[catId];
}

export function formatAgeRange(months: [number, number]): string {
  const [min, max] = months;
  const formatVal = (m: number) => {
    if (m < 24) return `${m} meses`;
    return `${Math.floor(m / 12)} anos`;
  };
  return `${formatVal(min)} a ${formatVal(max)}`;
}
