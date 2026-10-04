/**
 * Aprumo — Árvore das Emoções & Regulação Somática
 * Modos: Soft Clay (Infantil) & Graphic Novel (Juvenil / Adolescente)
 */

export type EmotionZoneKey = 'green' | 'yellow' | 'red' | 'blue' | 'purple';
export type PresentationMode = 'softclay' | 'graphic-novel';

export interface SomaticStrategy {
  id: string;
  title: string;
  instruction: string;
  icon: string;
}

export interface EmotionZoneData {
  key: EmotionZoneKey;
  labelChild: string;
  labelTeen: string;
  somaticStateChild: string;
  somaticStateTeen: string;
  color: string;
  textColor: string;
  bgSoft: string;
  voicePhraseChild: string;
  voicePhraseTeen: string;
  strategies: SomaticStrategy[];
}

export const EMOTION_ZONES: Record<EmotionZoneKey, EmotionZoneData> = {
  green: {
    key: 'green',
    labelChild: 'Verde · Calmo & Focado',
    labelTeen: 'Zona Verde · Equilíbrio e Foco',
    somaticStateChild: 'Corpo relaxado, mente aberta e pronto para brincar e aprender.',
    somaticStateTeen: 'Sistema nervoso em homeostase. Atenção sustentada e boa regulação autonômica.',
    color: '#2e7d32',
    textColor: '#1b5e20',
    bgSoft: '#e8f5e9',
    voicePhraseChild: 'Você está na Zona Verde! Corpo calmo e pronto.',
    voicePhraseTeen: 'Zona Verde selecionada. Estado ótimo de prontidão e foco executivo.',
    strategies: [
      { id: 'g1', title: 'Manter o Ritmo', instruction: 'Continuar a atividade com atenção sustentada.', icon: '🎯' },
      { id: 'g2', title: 'Celebrar o Esforço', instruction: 'Reconhecer seu progresso e celebrar cada conquista.', icon: '🌟' },
      { id: 'g3', title: 'Apoiar um Colega', instruction: 'Compartilhar materiais ou ajudar um amigo.', icon: '🤝' },
    ],
  },
  yellow: {
    key: 'yellow',
    labelChild: 'Amarelo · Agitado & Inquieto',
    labelTeen: 'Zona Amarela · Hiperativação / Ansiedade',
    somaticStateChild: 'Coração acelerado, energia sobrando, dificuldade de ficar sentado.',
    somaticStateTeen: 'Ativação simpática moderada. Inquietação motora, distratibilidade e aceleração cognitiva.',
    color: '#f57f17',
    textColor: '#e65100',
    bgSoft: '#fffde7',
    voicePhraseChild: 'Zona Amarela. Vamos fazer uma pausa para desacelerar o corpo.',
    voicePhraseTeen: 'Hiperativação detectada. Momento de aplicar técnica somática de desaceleração.',
    strategies: [
      { id: 'y1', title: 'Respiração 4-2-4', instruction: '3 ciclos de respiração lenta para desacelerar o coração.', icon: '🌬️' },
      { id: 'y2', title: 'Pausa da Água Fresca', instruction: 'Beber um copo de água gelada devagar.', icon: '💧' },
      { id: 'y3', title: 'Alongamento Suave', instruction: 'Alongar os braços para cima por 10 segundos.', icon: '🧘' },
    ],
  },
  red: {
    key: 'red',
    labelChild: 'Vermelho · Bravo & Frustrado',
    labelTeen: 'Zona Vermelha · Sobrecarga Emocional / Frustração',
    somaticStateChild: 'Músculos tensos, vontade de gritar ou empurrar. Preciso de segurança.',
    somaticStateTeen: 'Intensa desregulação límbica. Alta reatividade, urgência de afastamento do gatilho.',
    color: '#c62828',
    textColor: '#b71c1c',
    bgSoft: '#ffebee',
    voicePhraseChild: 'Zona Vermelha. Espaço seguro e respiração. Eu estou com você.',
    voicePhraseTeen: 'Zona Vermelha. Reduzir demandas externas e restabelecer segurança somática.',
    strategies: [
      { id: 'r1', title: 'Espaço de Segurança', instruction: 'Afastar-se de estímulos intensos e sentar em local acolhedor.', icon: '🛋️' },
      { id: 'r2', title: 'Abraço da Borboleta', instruction: 'Cruzar os braços sobre o peito e alternar toques suaves nos ombros.', icon: '🦋' },
      { id: 'r3', title: 'Retirar Demandas', instruction: 'Pausar a tarefa imediatamente sem julgamentos até acalmar.', icon: '🛑' },
    ],
  },
  blue: {
    key: 'blue',
    labelChild: 'Azul · Cansado & Triste',
    labelTeen: 'Zona Azul · Hipoativação / Cansaço',
    somaticStateChild: 'Corpo pesado, pouca energia, desânimo ou tristeza.',
    somaticStateTeen: 'Ativação parassimpática excessiva. Letargia, lentidão psicomotora ou humor deprimido.',
    color: '#0277bd',
    textColor: '#01579b',
    bgSoft: '#e1f5fe',
    voicePhraseChild: 'Zona Azul. Tudo bem descansar e recarregar as energias.',
    voicePhraseTeen: 'Hipoativação identificada. Estimulação suave e acolhimento corporal.',
    strategies: [
      { id: 'b1', title: 'Lavar o Rosto', instruction: 'Água fresca nas mãos e no rosto para despertar suavemente.', icon: '💦' },
      { id: 'b2', title: 'Caminhada Breve', instruction: 'Dar uma volta curta pelo ambiente para reativar a circulação.', icon: '🚶' },
      { id: 'b3', title: 'Música Acolhedora', instruction: 'Ouvir uma melodia agradável que traga conforto.', icon: '🎶' },
    ],
  },
  purple: {
    key: 'purple',
    labelChild: 'Roxo · Sensível & Sobrecarga',
    labelTeen: 'Zona Púrpura · Sobrecarga Sensorial / Estresse',
    somaticStateChild: 'Muitos barulhos e luzes. Meus sentidos precisam de proteção e silêncio.',
    somaticStateTeen: 'Saturação de processamento sensorial. Hipersensibilidade acústica, visual ou tátil.',
    color: '#6a1b9a',
    textColor: '#4a148c',
    bgSoft: '#f3e5f5',
    voicePhraseChild: 'Zona Roxa. Vamos proteger os seus sentidos com abafadores e silêncio.',
    voicePhraseTeen: 'Sobrecarga sensorial. Uso imediato de acomodação acústica e penumbra.',
    strategies: [
      { id: 'p1', title: 'Abafadores de Ruído', instruction: 'Colocar os abafadores para silenciar o ambiente.', icon: '🎧' },
      { id: 'p2', title: 'Luz Baixa', instruction: 'Reduzir a iluminação ou fechar os olhos por 2 minutos.', icon: '🕶️' },
      { id: 'p3', title: 'Aterramento 3-2-1', instruction: 'Notar 3 coisas visíveis, 2 texturas táteis e 1 som suave.', icon: '🌿' },
    ],
  },
};

export interface BreathingPhase {
  name: 'Inspire' | 'Segure' | 'Expire';
  seconds: number;
  instruction: string;
}

export const BREATHING_CYCLE: BreathingPhase[] = [
  { name: 'Inspire', seconds: 4, instruction: 'Inspire devagar pelo nariz enchendo o abdômen...' },
  { name: 'Segure', seconds: 2, instruction: 'Segure o ar com suavidade...' },
  { name: 'Expire', seconds: 4, instruction: 'Solte o ar lentamente pela boca...' },
];

export function getZoneData(key: EmotionZoneKey): EmotionZoneData {
  return EMOTION_ZONES[key];
}
