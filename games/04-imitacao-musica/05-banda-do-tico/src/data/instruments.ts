// src/data/instruments.ts
// Complete definitions for the 12 original instruments in Banda do Tico.

import { InstrumentId } from '../audio/synth';

export interface InstrumentDef {
  id: InstrumentId;
  name: string;
  category: 'percussion' | 'melodic' | 'fx';
  color: string;
  darkColor: string;
  icon: string;
  keyboardKey: string;
  duetP1Key?: string;
  duetP2Key?: string;
  characterName: string;
  description: string;
  hasPitchVariation?: boolean;
}

export const INSTRUMENTS: InstrumentDef[] = [
  {
    id: 'tambor',
    name: 'Tambor',
    category: 'percussion',
    color: '#E96A5F', // Coral
    darkColor: '#C44B41',
    icon: '🥁',
    keyboardKey: '1',
    duetP1Key: 'A',
    characterName: 'Pipoca',
    description: 'Som forte e caloroso para guiar o ritmo.',
  },
  {
    id: 'pandeiro',
    name: 'Pandeiro',
    category: 'percussion',
    color: '#F3C24F', // Amarelo
    darkColor: '#CFA02E',
    icon: '🪘',
    keyboardKey: '2',
    duetP1Key: 'S',
    characterName: 'Bento',
    description: 'Batida gostosa e platinelas brilhantes.',
  },
  {
    id: 'chocalho',
    name: 'Chocalho',
    category: 'percussion',
    color: '#63A675', // Verde
    darkColor: '#478357',
    icon: '🪇',
    keyboardKey: '3',
    duetP1Key: 'D',
    characterName: 'Lilo',
    description: 'Balança no compasso sem parar.',
  },
  {
    id: 'palmas',
    name: 'Palmas',
    category: 'percussion',
    color: '#8A79C7', // Lilás
    darkColor: '#6B5AAB',
    icon: '👏',
    keyboardKey: '4',
    duetP1Key: 'F',
    characterName: 'Tico',
    description: 'Bata palmas junto com a plateia!',
  },
  {
    id: 'triangulo',
    name: 'Triângulo',
    category: 'percussion',
    color: '#FFD166', // Ouro claro
    darkColor: '#DBA834',
    icon: '📐',
    keyboardKey: '5',
    duetP2Key: 'H',
    characterName: 'Mel',
    description: 'Tlim-tlim agudo e cristalino.',
  },
  {
    id: 'agogo',
    name: 'Agogô',
    category: 'percussion',
    color: '#F78C6B', // Laranja suave
    darkColor: '#D16848',
    icon: '🔔',
    keyboardKey: '6',
    duetP2Key: 'J',
    characterName: 'Bento',
    description: 'Dois sinos: som agudo e som grave.',
    hasPitchVariation: true,
  },
  {
    id: 'xilofone',
    name: 'Xilofone',
    category: 'melodic',
    color: '#48CAE4', // Ciano
    darkColor: '#259EBA',
    icon: '🎶',
    keyboardKey: '7',
    duetP2Key: 'K',
    characterName: 'Maya',
    description: 'Teclas de madeira com notas afinadas.',
    hasPitchVariation: true,
  },
  {
    id: 'bloco',
    name: 'Bloco Sonoro',
    category: 'percussion',
    color: '#DDA15E', // Madeira
    darkColor: '#B57C3C',
    icon: '🪵',
    keyboardKey: '8',
    duetP2Key: 'L',
    characterName: 'Nino',
    description: 'Estalo de madeira bem nítido.',
  },
  {
    id: 'bumbo',
    name: 'Bumbo',
    category: 'percussion',
    color: '#283B5B', // Azul Noite
    darkColor: '#172338',
    icon: '🥁',
    keyboardKey: '9',
    characterName: 'Nino',
    description: 'O coração grave da batucada.',
  },
  {
    id: 'caixa',
    name: 'Caixa',
    category: 'percussion',
    color: '#06D6A0', // Menta vibrante
    darkColor: '#049E76',
    icon: '🪘',
    keyboardKey: '0',
    characterName: 'Pipoca',
    description: 'Redobre e estalo com esteira.',
  },
  {
    id: 'prato',
    name: 'Prato',
    category: 'percussion',
    color: '#F4A261', // Cobre / Ouro
    darkColor: '#C77636',
    icon: '🟡',
    keyboardKey: '-',
    characterName: 'Tico',
    description: 'Brilho dourado e explosão festiva!',
  },
  {
    id: 'teclado',
    name: 'Teclado',
    category: 'melodic',
    color: '#B5838D', // Rosa antigo
    darkColor: '#8E5A64',
    icon: '🎹',
    keyboardKey: '=',
    characterName: 'Maya',
    description: 'Acordes harmoniosos e mágicos.',
    hasPitchVariation: true,
  },
];

export const INSTRUMENT_MAP = new Map<InstrumentId, InstrumentDef>(
  INSTRUMENTS.map((inst) => [inst.id, inst])
);
