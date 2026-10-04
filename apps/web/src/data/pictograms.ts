/**
 * Catálogo dos 22 Pictogramas e Cartões Clínicos Táteis (Seção 46 do Master Vibe Coding Plan).
 * Estilo sticker vetor com tons suaves (paleta Aprumo: sage, cream, terracotta).
 */

export interface PictogramAsset {
  id: string;
  label: string;
  category: 'alimentos' | 'animais' | 'veículos' | 'objetos' | 'natureza' | 'rotina' | 'emocoes';
  artKey?: string;
  imagePath?: string;
  icon: string;
}

export const PICTOGRAM_CATALOG: PictogramAsset[] = [
  { id: 'apple', label: 'Maçã', category: 'alimentos', artKey: 'maca', imagePath: '/pictograms/apple.jpg', icon: '🍎' },
  { id: 'banana', label: 'Banana', category: 'alimentos', artKey: 'banana', imagePath: '/pictograms/banana.jpg', icon: '🍌' },
  { id: 'dog', label: 'Cachorro', category: 'animais', artKey: 'cachorro', imagePath: '/pictograms/dog.jpg', icon: '🐶' },
  { id: 'cat', label: 'Gato', category: 'animais', artKey: 'gato', icon: '🐱' },
  { id: 'car', label: 'Carro', category: 'veículos', artKey: 'carro', icon: '🚗' },
  { id: 'ball', label: 'Bola', category: 'objetos', artKey: 'bola', icon: '⚽' },
  { id: 'spoon', label: 'Colher', category: 'objetos', artKey: 'colher', icon: '🥄' },
  { id: 'cup', label: 'Copo', category: 'objetos', artKey: 'copo', icon: '🥤' },
  { id: 'shoes', label: 'Tênis', category: 'rotina', artKey: 'sapato', icon: '👟' },
  { id: 'shirt', label: 'Camiseta', category: 'rotina', artKey: 'camisa', icon: '👕' },
  { id: 'brush', label: 'Escova', category: 'rotina', artKey: 'escova', icon: '🪥' },
  { id: 'bed', label: 'Cama', category: 'rotina', icon: '🛏️' },
  { id: 'table', label: 'Mesa', category: 'objetos', icon: '🪑' },
  { id: 'chair', label: 'Cadeira', category: 'objetos', icon: '🪑' },
  { id: 'book', label: 'Livro', category: 'objetos', artKey: 'livro', icon: '📖' },
  { id: 'puzzle', label: 'Quebra-cabeça', category: 'objetos', icon: '🧩' },
  { id: 'flower', label: 'Flor', category: 'natureza', artKey: 'flor', icon: '🌸' },
  { id: 'tree', label: 'Árvore', category: 'natureza', icon: '🌳' },
  { id: 'sun', label: 'Sol', category: 'natureza', icon: '☀️' },
  { id: 'star', label: 'Estrela', category: 'natureza', icon: '⭐' },
  { id: 'water', label: 'Água', category: 'rotina', icon: '💧' },
  { id: 'heart', label: 'Coração', category: 'emocoes', icon: '❤️' },
];
