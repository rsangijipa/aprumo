// src/data/stages.ts
// The 7 magical paper-cut concert stages for Banda do Tico.

export interface StageDef {
  id: string;
  name: string;
  subtitle: string;
  themeColor: string;
  accentColor: string;
  skyColorTop: string;
  skyColorBottom: string;
  floorColor: string;
  elements: string[]; // Decorative props (paper-cut style)
  defaultBpm: number;
}

export const STAGES: StageDef[] = [
  {
    id: 'quintal',
    name: 'O Quintal',
    subtitle: 'Palco de madeira entre girassóis e passarinhos',
    themeColor: '#63A675',
    accentColor: '#F3C24F',
    skyColorTop: '#89C2D9',
    skyColorBottom: '#E0FAFF',
    floorColor: '#4F772D',
    elements: ['sunflower', 'fence', 'tree', 'birds', 'clouds'],
    defaultBpm: 100,
  },
  {
    id: 'praca',
    name: 'A Praça',
    subtitle: 'Coreto de ferro, postes antigos e piso de pedras',
    themeColor: '#E96A5F',
    accentColor: '#F3C24F',
    skyColorTop: '#4A6984',
    skyColorBottom: '#D8E2DC',
    floorColor: '#6C757D',
    elements: ['gazebo', 'lamp_post', 'stone_wall', 'bunting', 'fountain'],
    defaultBpm: 105,
  },
  {
    id: 'garagem',
    name: 'A Garagem',
    subtitle: 'Lâmpadas suspensas, pôsteres e caixas de som',
    themeColor: '#F4A261',
    accentColor: '#E76F51',
    skyColorTop: '#264653',
    skyColorBottom: '#2A9D8F',
    floorColor: '#343A40',
    elements: ['light_bulb', 'amp_stack', 'poster', 'brick_wall', 'cables'],
    defaultBpm: 115,
  },
  {
    id: 'escola',
    name: 'A Escola',
    subtitle: 'Lousa cheia de partituras e cortinas coloridas',
    themeColor: '#8A79C7',
    accentColor: '#F3C24F',
    skyColorTop: '#5C4D7D',
    skyColorBottom: '#CAB8DE',
    floorColor: '#C49968',
    elements: ['chalkboard', 'music_notes', 'colorful_curtain', 'clock', 'pencils'],
    defaultBpm: 95,
  },
  {
    id: 'floresta',
    name: 'A Floresta',
    subtitle: 'Cogumelos gigantes, vagalumes e copas brilhantes',
    themeColor: '#2D6A4F',
    accentColor: '#95D5B2',
    skyColorTop: '#1B4332',
    skyColorBottom: '#40916C',
    floorColor: '#081C15',
    elements: ['giant_mushroom', 'fireflies', 'canopy_leaves', 'vines', 'hollow_log'],
    defaultBpm: 90,
  },
  {
    id: 'barco',
    name: 'O Barco',
    subtitle: 'Embalado por ondas calmas sob um céu estrelado',
    themeColor: '#283B5B',
    accentColor: '#48CAE4',
    skyColorTop: '#0D1B2A',
    skyColorBottom: '#1B263B',
    floorColor: '#415A77',
    elements: ['boat_deck', 'sails', 'gentle_waves', 'crescent_moon', 'stars'],
    defaultBpm: 85,
  },
  {
    id: 'festival',
    name: 'O Festival',
    subtitle: 'Canhões de luz, confete dourado e grande público!',
    themeColor: '#E63946',
    accentColor: '#FFB703',
    skyColorTop: '#1D1E2C',
    skyColorBottom: '#541388',
    floorColor: '#2B2D42',
    elements: ['spotlights', 'confetti_cannon', 'banner', 'crowd_silhouettes', 'pyro_sparkles'],
    defaultBpm: 120,
  },
];
