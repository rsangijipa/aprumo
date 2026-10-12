const fs = require('fs');
const path = require('path');

const newGames = [
  {
    dir: 'games/01-comunicacao-linguagem/04-leitura-de-cena',
    pkgName: '@aprumo/game-leitura-de-cena',
    appId: 'leitura-de-cena',
    name: 'Leitura de Cena',
    summary: 'Interpretação de situações sociais e leitura de contexto: identificação de emoções em personagens, pistas no ambiente e escolha de respostas adaptativas.',
    repertoires: ['social', 'listener', 'tact'],
    models: { ABA: 'trial-based', DENVER: 'joint-routine' },
    ageRange: [48, 144],
    requiresAdult: false,
    playLevel: 'symbolic',
    appExport: 'App'
  },
  {
    dir: 'games/02-cognicao-pareamento/05-par-perfeito',
    pkgName: '@aprumo/game-par-perfeito',
    appId: 'par-perfeito',
    name: 'Par Perfeito',
    summary: 'Programa estruturado de pareamento idêntico ABA com máquina de estados finitos (XState), suporte a ponte física-digital e esvanecimento gradual de ajuda.',
    repertoires: ['matching'],
    models: { ABA: 'trial-based', DENVER: 'support' },
    ageRange: [24, 96],
    requiresAdult: false,
    playLevel: 'constructive',
    appExport: 'App'
  },
  {
    dir: 'games/02-cognicao-pareamento/06-cada-um-no-seu-pote',
    pkgName: '@aprumo/game-cada-um-no-seu-pote',
    appId: 'cada-um-no-seu-pote',
    name: 'Cada Um no Seu Pote',
    summary: 'Classificação tátil e conceitual de objetos em potes temáticos por cor, forma e categoria com física interativa e reforçamento imediato.',
    repertoires: ['matching', 'play'],
    models: { ABA: 'trial-based', DENVER: 'support' },
    ageRange: [24, 108],
    requiresAdult: false,
    playLevel: 'functional',
    appExport: 'App'
  },
  {
    dir: 'games/03-social-emocional/05-mutirao-do-parque',
    pkgName: '@aprumo/game-mutirao-do-parque',
    appId: 'mutirao-do-parque',
    name: 'Mutirão do Parque',
    summary: 'Experiência cooperativa de convivência comunitária, divisão de papéis e trabalho em equipe no cuidado e limpeza de um parque público.',
    repertoires: ['social', 'play'],
    models: { ABA: 'support', DENVER: 'joint-routine' },
    ageRange: [60, 156],
    requiresAdult: false,
    playLevel: 'cooperative',
    appExport: 'App'
  },
  {
    dir: 'games/04-imitacao-musica/05-banda-do-tico',
    pkgName: '@aprumo/game-banda-do-tico',
    appId: 'banda-do-tico',
    name: 'Banda do Tico',
    summary: 'Jogo musical de ritmo, imitação sonora e resposta imediata com instrumentos e personagens originais, estimulando antecipação e sincronização.',
    repertoires: ['imitation', 'social', 'play'],
    models: { ABA: 'support', DENVER: 'joint-routine' },
    ageRange: [48, 156],
    requiresAdult: false,
    playLevel: 'functional',
    appExport: null // custom Game wrapper
  },
  {
    dir: 'games/05-rotinas-brincar/04-torre-derruba',
    pkgName: '@aprumo/game-torre-derruba',
    appId: 'torre-derruba',
    name: 'Torre Derruba',
    summary: 'Rotina de atividade conjunta Denver (JAR) de empilhamento e derrubada de blocos de madeira com física realista, troca de turnos e contagem regressiva.',
    repertoires: ['play', 'imitation', 'social'],
    models: { ABA: 'support', DENVER: 'joint-routine' },
    ageRange: [12, 60],
    requiresAdult: true,
    playLevel: 'functional',
    appExport: 'App'
  },
  {
    dir: 'games/06-autonomia-vida-diaria/05-mercadinho-da-esquina',
    pkgName: '@aprumo/game-mercadinho-da-esquina',
    appId: 'mercadinho-da-esquina',
    name: 'Mercadinho da Esquina',
    summary: 'Simulação realista de compras cotidianas, pagamento com dinheiro em reais, cálculo de troco, lista de compras e script social de caixa.',
    repertoires: ['adl', 'academic', 'social'],
    models: { ABA: 'trial-based', DENVER: 'support' },
    ageRange: [72, 192],
    requiresAdult: false,
    playLevel: 'constructive',
    appExport: 'App'
  },
  {
    dir: 'games/06-autonomia-vida-diaria/06-passo-a-passo',
    pkgName: '@aprumo/game-passo-a-passo',
    appId: 'passo-a-passo',
    name: 'Passo a Passo (Análise de Tarefas)',
    summary: 'Encadeamento de atividades de vida diária (AVDs) através de análise de tarefas passo a passo, suporte visual de prancha e registro de independência.',
    repertoires: ['adl', 'listener'],
    models: { ABA: 'trial-based', DENVER: 'support' },
    ageRange: [36, 192],
    requiresAdult: false,
    playLevel: 'constructive',
    appExport: 'App'
  },
  {
    dir: 'games/06-autonomia-vida-diaria/07-quadro-de-conquistas',
    pkgName: '@aprumo/game-quadro-de-conquistas',
    appId: 'quadro-de-conquistas',
    name: 'Quadro de Conquistas',
    summary: 'Sistema dinâmico de economia de fichas (token economy) com cardápio de reforçadores, metas visuais e temporizador comemorativo.',
    repertoires: ['adl', 'social'],
    models: { ABA: 'trial-based', DENVER: 'support' },
    ageRange: [36, 192],
    requiresAdult: false,
    playLevel: 'constructive',
    appExport: 'App'
  },
  {
    dir: 'games/06-autonomia-vida-diaria/08-escape-room-kids',
    pkgName: '@aprumo/game-escape-room-kids',
    appId: 'escape-room-kids',
    name: 'Escape Room Kids',
    summary: 'Desafios de raciocínio lógico e pistas em diorama 3D interativo, promovendo cooperação, dedução e persistência cognitiva.',
    repertoires: ['academic', 'social'],
    models: { ABA: 'support', DENVER: 'joint-routine' },
    ageRange: [84, 192],
    requiresAdult: false,
    playLevel: 'constructive',
    appExport: 'App'
  },
  {
    dir: 'games/06-autonomia-vida-diaria/09-vida-online',
    pkgName: '@aprumo/game-vida-online',
    appId: 'vida-online',
    name: 'Vida Online',
    summary: 'Simulação interativa de smartphone para jovens autistas: segurança digital, privacidade, navegação consciente e reflexão Pensar Antes.',
    repertoires: ['adl', 'social'],
    models: { ABA: 'support', DENVER: 'support' },
    ageRange: [120, 216],
    requiresAdult: false,
    playLevel: 'symbolic',
    appExport: 'App'
  }
];

newGames.forEach((g) => {
  const fullDir = path.join(process.cwd(), g.dir);
  if (!fs.existsSync(fullDir)) {
    console.error('Directory not found:', fullDir);
    return;
  }

  // 1. package.json update
  const pkgPath = path.join(fullDir, 'package.json');
  let pkg = {};
  if (fs.existsSync(pkgPath)) {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  }
  pkg.name = g.pkgName;
  pkg.version = '1.0.0';
  pkg.exports = {
    '.': './src/index.ts',
    './manifest': './src/manifest.ts',
  };
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // 2. manifest.ts
  const manifestContent = `import type { GameManifest } from '@aprumo/protocol';

export const manifest: GameManifest = {
  appId: '${g.appId}',
  version: '1.0.0',
  name: '${g.name}',
  kind: 'game',
  summary: '${g.summary}',
  clinical: {
    purposes: ['teaching', 'reinforcer', 'regulation'],
    models: ${JSON.stringify(g.models)},
    repertoires: ${JSON.stringify(g.repertoires)},
    autoScoring: ${JSON.stringify(g.repertoires)},
    therapistScoring: [],
    playLevel: '${g.playLevel}',
    trialUnit: 'Ciclo interativo estruturado com feedback comportamental e telemetria.',
    correctResponse: 'Resposta adaptativa ou comunicação intencional correspondente ao objetivo do ensaio.',
    minFieldSize: 1,
    maxFieldSize: 4,
    latencyMaxMs: 15000,
    builtInPrompts: [
      { code: 'HINT_HIGHLIGHT', afterMs: 5000, intrusiveness: 0.3 },
      { code: 'AUDIO_PROMPT', afterMs: 10000, intrusiveness: 0.6 }
    ],
    prerequisites: [],
    ageRangeMonths: ${JSON.stringify(g.ageRange)},
    requiresAdult: ${g.requiresAdult},
    sensory: { flashes: false, motionReducible: true, sound: 'adjustable' },
    emits: ['SESSION_STARTED', 'LEVEL_STARTED', 'TRIAL_STARTED', 'STIMULUS_PRESENTED', 'RESPONSE_STARTED', 'TRIAL_COMPLETED', 'PROMPT_USED', 'REWARD_TRIGGERED', 'REINFORCER_PRESENTED', 'LEVEL_COMPLETED', 'SESSION_PAUSED', 'SESSION_RESUMED', 'SESSION_COMPLETED']
  }
};
`;
  fs.writeFileSync(path.join(fullDir, 'src', 'manifest.ts'), manifestContent);

  // 3. index.ts
  if (g.appExport) {
    const indexContent = `export { ${g.appExport} as Game } from './App';\nexport { manifest } from './manifest';\n`;
    fs.writeFileSync(path.join(fullDir, 'src', 'index.ts'), indexContent);
  }

  console.log('Processed:', g.appId);
});

// Custom Game.tsx for banda-do-tico
const ticoDir = path.join(process.cwd(), 'games/04-imitacao-musica/05-banda-do-tico/src');
const ticoGameContent = `import { useEffect, useRef } from 'react';
import './style.css';
import { createBandGame } from './game/BandGame';
import { audioMixer } from './audio/mixer';

export function Game() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const unlock = () => {
      audioMixer.init();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    const game = createBandGame(containerRef.current);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      game.destroy(true);
    };
  }, []);

  return (
    <div
      id="game-canvas-container"
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    />
  );
}
export { manifest } from './manifest';
`;
fs.writeFileSync(path.join(ticoDir, 'index.ts'), ticoGameContent);
console.log('Banda do tico index.ts created!');
