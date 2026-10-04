/**
 * Aprumo — Comunicação Alternativa e Aumentativa (CAA / PECS)
 * Prancha de Escolha Direta e Prancha de Comunicação com Tira de Sentença
 */

export type AACCAT = 'alimentos' | 'brinquedos' | 'acoes' | 'pessoas' | 'sentimentos';

export interface AACItem {
  id: string;
  label: string;
  category: AACCAT;
  emoji: string;
  speechText?: string;
  color?: string;
}

export interface SentenceStarter {
  id: string;
  label: string;
  prefix: string;
  emoji: string;
}

export const SENTENCE_STARTERS: SentenceStarter[] = [
  { id: 'quero', label: 'Eu quero', prefix: 'Eu quero', emoji: '🤲' },
  { id: 'preciso', label: 'Preciso de', prefix: 'Preciso de', emoji: '🆘' },
  { id: 'sinto', label: 'Eu sinto', prefix: 'Eu sinto', emoji: '💖' },
  { id: 'vejo', label: 'Eu vejo', prefix: 'Eu vejo', emoji: '👀' },
  { id: 'vamos', label: 'Vamos', prefix: 'Vamos', emoji: '🚀' },
];

export const AAC_VOCABULARY: AACItem[] = [
  // Alimentos
  { id: 'agua', label: 'Água', category: 'alimentos', emoji: '💧', speechText: 'água' },
  { id: 'suco', label: 'Suco', category: 'alimentos', emoji: '🧃', speechText: 'suco' },
  { id: 'maca', label: 'Maçã', category: 'alimentos', emoji: '🍎', speechText: 'maçã' },
  { id: 'banana', label: 'Banana', category: 'alimentos', emoji: '🍌', speechText: 'banana' },
  { id: 'biscoito', label: 'Biscoito', category: 'alimentos', emoji: '🍪', speechText: 'biscoito' },
  { id: 'almoco', label: 'Comida / Almoço', category: 'alimentos', emoji: '🍽️', speechText: 'comida' },

  // Brinquedos e Atividades Lúdicas
  { id: 'bola', label: 'Bola', category: 'brinquedos', emoji: '⚽', speechText: 'bola' },
  { id: 'carro', label: 'Carrinho', category: 'brinquedos', emoji: '🚗', speechText: 'carrinho' },
  { id: 'blocos', label: 'Blocos de Montar', category: 'brinquedos', emoji: '🧱', speechText: 'blocos de montar' },
  { id: 'massinha', label: 'Massinha', category: 'brinquedos', emoji: '🧁', speechText: 'massinha de modelar' },
  { id: 'bolha', label: 'Bolha de Sabão', category: 'brinquedos', emoji: '🫧', speechText: 'bolha de sabão' },
  { id: 'puzzle', label: 'Quebra-Cabeça', category: 'brinquedos', emoji: '🧩', speechText: 'quebra-cabeça' },
  { id: 'tablet', label: 'Tablet / Jogo', category: 'brinquedos', emoji: '📱', speechText: 'tablet' },
  { id: 'desenhar', label: 'Desenhar / Lápis', category: 'brinquedos', emoji: '🎨', speechText: 'desenhar' },

  // Ações e Rotina
  { id: 'banheiro', label: 'Banheiro', category: 'acoes', emoji: '🚻', speechText: 'ir ao banheiro' },
  { id: 'pausa', label: 'Pausa / Descanso', category: 'acoes', emoji: '✋', speechText: 'fazer uma pausa' },
  { id: 'ajuda', label: 'Ajuda', category: 'acoes', emoji: '🆘', speechText: 'preciso de ajuda' },
  { id: 'guardar', label: 'Guardar', category: 'acoes', emoji: '📦', speechText: 'guardar brinquedos' },
  { id: 'musica', label: 'Música', category: 'acoes', emoji: '🎵', speechText: 'ouvir música' },
  { id: 'passear', label: 'Passear', category: 'acoes', emoji: '🚶', speechText: 'dar um passeio' },

  // Pessoas e Suporte
  { id: 'terapeuta', label: 'Terapeuta', category: 'pessoas', emoji: '👩‍⚕️', speechText: 'terapeuta' },
  { id: 'mamae', label: 'Mamãe', category: 'pessoas', emoji: '👩', speechText: 'mamãe' },
  { id: 'papai', label: 'Papai', category: 'pessoas', emoji: '👨', speechText: 'papai' },
  { id: 'amigo', label: 'Amigo', category: 'pessoas', emoji: '👦', speechText: 'amigo' },
  { id: 'eu', label: 'Eu', category: 'pessoas', emoji: '🙋', speechText: 'eu' },

  // Sentimentos e Sensações
  { id: 'feliz', label: 'Feliz', category: 'sentimentos', emoji: '😊', speechText: 'feliz' },
  { id: 'calmo', label: 'Calmo', category: 'sentimentos', emoji: '😌', speechText: 'calmo e tranquilo' },
  { id: 'cansado', label: 'Cansado', category: 'sentimentos', emoji: '🥱', speechText: 'cansado' },
  { id: 'bravo', label: 'Bravo / Frustrado', category: 'sentimentos', emoji: '😠', speechText: 'bravo' },
  { id: 'triste', label: 'Triste', category: 'sentimentos', emoji: '😢', speechText: 'triste' },
  { id: 'dor', label: 'Dor / Incômodo', category: 'sentimentos', emoji: '🩹', speechText: 'com dor' },
  { id: 'barulho', label: 'Barulho Alto', category: 'sentimentos', emoji: '📢', speechText: 'muito barulho' },
];

/**
 * Constrói a frase falada a partir do iniciador e dos itens adicionados.
 */
export function buildSpokenSentence(starterPrefix: string, items: AACItem[]): string {
  if (items.length === 0) return starterPrefix;
  const labels = items.map((it) => it.speechText || it.label);
  return `${starterPrefix} ${labels.join(', ')}`;
}

/**
 * Filtra o vocabulário por categoria.
 */
export function filterVocabularyByCategory(
  items: AACItem[],
  category: AACCAT | 'todos',
): AACItem[] {
  if (category === 'todos') return items;
  return items.filter((it) => it.category === category);
}

/**
 * Gera conjunto de escolhas rápidas para prancha de escolha direta (2 a 4 escolhas).
 */
export function getDirectChoicePresets(
  type: 'brinquedos' | 'alimentos' | 'pausas',
  count: 2 | 3 | 4,
): AACItem[] {
  let source: AACItem[];
  if (type === 'brinquedos') {
    source = AAC_VOCABULARY.filter((x) => x.category === 'brinquedos');
  } else if (type === 'alimentos') {
    source = AAC_VOCABULARY.filter((x) => x.category === 'alimentos');
  } else {
    source = AAC_VOCABULARY.filter(
      (x) => x.id === 'pausa' || x.id === 'agua' || x.id === 'musica' || x.id === 'banheiro',
    );
  }
  return source.slice(0, count);
}
