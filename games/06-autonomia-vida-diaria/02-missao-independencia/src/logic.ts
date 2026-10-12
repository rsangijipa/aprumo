import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig, StimulusRef } from '@aprumo/protocol';

export interface IndependenceStep extends StimulusRef {
  stepNum: number;
  instruction: string;
  sensoryNote: string;
  icon: string;
  soundType: 'zip' | 'cash' | 'chime' | 'card' | 'water' | 'door';
}

export interface IndependenceMission {
  id: string;
  title: string;
  context: 'school' | 'market' | 'transit' | 'morning';
  summary: string;
  icon: string;
  steps: IndependenceStep[];
}

export const INDEPENDENCE_MISSIONS: IndependenceMission[] = [
  {
    id: 'arrumar-mochila',
    title: 'Missão: Mochila da Escola',
    context: 'school',
    summary: 'Organizar itens escolares essenciais na mochila de forma ordenada e fechar o zíper.',
    icon: '🎒',
    steps: [
      {
        stepNum: 1,
        stimulusId: 'estojo',
        label: 'Estojo Escolar',
        art: 'estojo',
        instruction: 'Pegue o estojo com lápis, borracha e canetinhas.',
        sensoryNote: 'Estojo fechado e organizado',
        icon: '✏️',
        soundType: 'zip',
      },
      {
        stepNum: 2,
        stimulusId: 'caderno',
        label: 'Caderno de Aula',
        art: 'caderno',
        instruction: 'Guarde o caderno de atividades na divisória maior.',
        sensoryNote: 'Páginas alinhadas',
        icon: '📓',
        soundType: 'chime',
      },
      {
        stepNum: 3,
        stimulusId: 'garrafa',
        label: 'Garrafinha de Água',
        art: 'garrafa',
        instruction: 'Coloque a garrafinha de água bem tampada no bolso lateral.',
        sensoryNote: 'Água fresca e sem vazamentos',
        icon: '💧',
        soundType: 'water',
      },
      {
        stepNum: 4,
        stimulusId: 'lancheira',
        label: 'Lancheira com Lanche',
        art: 'lancheira',
        instruction: 'Guarde a lancheira com a maçã e o sanduíche.',
        sensoryNote: 'Lanche protegido',
        icon: '🥪',
        soundType: 'chime',
      },
      {
        stepNum: 5,
        stimulusId: 'fechar-mochila',
        label: 'Puxar o Zíper',
        art: 'fechar-mochila',
        instruction: 'Puxe o zíper para fechar a mochila com segurança!',
        sensoryNote: 'Mochila pronta para colocar nas costas',
        icon: '🔒',
        soundType: 'zip',
      },
    ],
  },
  {
    id: 'mercadinho-compras',
    title: 'Missão: Mercadinho do Bairro',
    context: 'market',
    summary: 'Pegar o cesto, selecionar os itens da lista, passar no caixa e conferir o troco.',
    icon: '🛒',
    steps: [
      {
        stepNum: 1,
        stimulusId: 'cesto',
        label: 'Cesto de Compras',
        art: 'cesto',
        instruction: 'Pegue o cesto de compras na entrada do mercadinho.',
        sensoryNote: 'Cesto leve nas mãos',
        icon: '🧺',
        soundType: 'chime',
      },
      {
        stepNum: 2,
        stimulusId: 'maca',
        label: 'Maçãs da Lista',
        art: 'maca',
        instruction: 'Localize e coloque as maçãs frescas no cesto.',
        sensoryNote: 'Item 1 da lista de compras',
        icon: '🍎',
        soundType: 'chime',
      },
      {
        stepNum: 3,
        stimulusId: 'leite',
        label: 'Leite Fresco',
        art: 'leite',
        instruction: 'Pegue a caixinha de leite na prateleira refrigerada.',
        sensoryNote: 'Item 2 da lista de compras',
        icon: '🥛',
        soundType: 'chime',
      },
      {
        stepNum: 4,
        stimulusId: 'caixa-pagar',
        label: 'Caixa e Pagamento',
        art: 'caixa-pagar',
        instruction: 'Coloque as compras na esteira e entregue a cédula para pagar.',
        sensoryNote: 'Valor correto entregue',
        icon: '💳',
        soundType: 'cash',
      },
      {
        stepNum: 5,
        stimulusId: 'conferir-troco',
        label: 'Conferir o Troco',
        art: 'conferir-troco',
        instruction: 'Confira as moedas de troco e guarde na carteira!',
        sensoryNote: 'Troco conferido com precisão',
        icon: '🪙',
        soundType: 'cash',
      },
    ],
  },
  {
    id: 'transporte-itinerario',
    title: 'Missão: Ônibus e Itinerário',
    context: 'transit',
    summary: 'Esperar no ponto correto, validar a linha, aproximar o bilhete e desembarcar com autonomia.',
    icon: '🚌',
    steps: [
      {
        stepNum: 1,
        stimulusId: 'ponto-espera',
        label: 'Ponto de Ônibus',
        art: 'ponto-espera',
        instruction: 'Aguarde com calma e atenção na calçada do ponto.',
        sensoryNote: 'Aguardar em segurança',
        icon: '🚏',
        soundType: 'chime',
      },
      {
        stepNum: 2,
        stimulusId: 'conferir-linha',
        label: 'Letreiro da Linha',
        art: 'conferir-linha',
        instruction: 'Confira o letreiro do ônibus que aproxima: Linha 104 - Escola.',
        sensoryNote: 'Número e destino corretos',
        icon: '🔢',
        soundType: 'chime',
      },
      {
        stepNum: 3,
        stimulusId: 'cartao-transporte',
        label: 'Cartão de Transporte',
        art: 'cartao-transporte',
        instruction: 'Aproxime o cartão de transporte no leitor eletrônico.',
        sensoryNote: 'Bipe de liberação da catraca',
        icon: '🎫',
        soundType: 'card',
      },
      {
        stepNum: 4,
        stimulusId: 'segurar-apoio',
        label: 'Segurar no Apoio',
        art: 'segurar-apoio',
        instruction: 'Segure firme na barra de apoio durante a viagem.',
        sensoryNote: 'Equilíbrio e segurança',
        icon: '🤝',
        soundType: 'chime',
      },
      {
        stepNum: 5,
        stimulusId: 'apertar-campainha',
        label: 'Apertar a Campainha',
        art: 'apertar-campainha',
        instruction: 'Aperte o botão da campainha para descer no ponto da escola!',
        sensoryNote: 'Sinal sonoro de parada',
        icon: '🔔',
        soundType: 'chime',
      },
    ],
  },
  {
    id: 'rotina-matinal',
    title: 'Missão: Começar o Dia',
    context: 'morning',
    summary: 'Despertar, vestir-se, higiene matinal, café da manhã e pegar a chave na saída.',
    icon: '☀️',
    steps: [
      {
        stepNum: 1,
        stimulusId: 'despertar',
        label: 'Abrir a Janela',
        art: 'despertar',
        instruction: 'Levante-se da cama e abra a cortina para ver a luz do sol.',
        sensoryNote: 'Iluminação natural e despertar suave',
        icon: '🪟',
        soundType: 'chime',
      },
      {
        stepNum: 2,
        stimulusId: 'trocar-roupa',
        label: 'Vestir a Roupa',
        art: 'trocar-roupa',
        instruction: 'Tire o pijama e vista a camiseta e a bermuda do dia.',
        sensoryNote: 'Roupa limpa e confortável',
        icon: '👕',
        soundType: 'chime',
      },
      {
        stepNum: 3,
        stimulusId: 'higiene',
        label: 'Lavar Rosto e Dentes',
        art: 'higiene',
        instruction: 'Lave o rosto com água fresca e escove os dentes.',
        sensoryNote: 'Frescor matinal',
        icon: '🪥',
        soundType: 'water',
      },
      {
        stepNum: 4,
        stimulusId: 'cafe',
        label: 'Café da Manhã',
        art: 'cafe',
        instruction: 'Sente-se à mesa e tome seu café da manhã nutritivo.',
        sensoryNote: 'Energia para as atividades',
        icon: '🥞',
        soundType: 'chime',
      },
      {
        stepNum: 5,
        stimulusId: 'chave-saida',
        label: 'Pegar a Chave',
        art: 'chave-saida',
        instruction: 'Pegue a chave de casa no chaveiro antes de abrir a porta!',
        sensoryNote: 'Chave na mão para trancar',
        icon: '🔑',
        soundType: 'door',
      },
    ],
  },
];

export const INDEPENDENCE_DISTRACTORS: IndependenceStep[] = [
  { stepNum: 99, stimulusId: 'travesseiro', label: 'Voltar a Dormir', art: 'travesseiro', instruction: '', sensoryNote: 'Não faz parte da missão agora', icon: '🛌', soundType: 'chime' },
  { stepNum: 99, stimulusId: 'videogame', label: 'Jogar Videogame', art: 'videogame', instruction: '', sensoryNote: 'Hora de sair, não de jogar', icon: '🎮', soundType: 'chime' },
  { stepNum: 99, stimulusId: 'panela', label: 'Panela Quente', art: 'panela', instruction: '', sensoryNote: 'Item incorreto', icon: '🍳', soundType: 'chime' },
  { stepNum: 99, stimulusId: 'brinquedo', label: 'Espalhar Brinquedos', art: 'brinquedo', instruction: '', sensoryNote: 'Desorganiza a saída', icon: '🧸', soundType: 'chime' },
  { stepNum: 99, stimulusId: 'skate', label: 'Skate no Quarto', art: 'skate', instruction: '', sensoryNote: 'Item inadequado', icon: '🛹', soundType: 'chime' },
  { stepNum: 99, stimulusId: 'chinelo', label: 'Chinelo Molhado', art: 'chinelo', instruction: '', sensoryNote: 'Não é para a escola', icon: '🩴', soundType: 'chime' },
];

export interface PlannedMissionTrial {
  stepNum: number;
  missionId: string;
  missionTitle: string;
  context: 'school' | 'market' | 'transit' | 'morning';
  instruction: string;
  targetStep: IndependenceStep;
  soundType: 'zip' | 'cash' | 'chime' | 'card' | 'water' | 'door';
  options: IndependenceStep[];
  positionOfTarget: number;
}

export function planMissionTrials(config: SessionConfig, missionIndex = 0): PlannedMissionTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  const mission = INDEPENDENCE_MISSIONS[missionIndex % INDEPENDENCE_MISSIONS.length]!;
  const numChoices = Math.max(2, Math.min(config.adaptation.maxChoices, 4));
  const positions = counterbalancedPositions(mission.steps.length, numChoices, rnd);

  const otherSteps = INDEPENDENCE_MISSIONS
    .filter((m) => m.id !== mission.id)
    .flatMap((m) => m.steps);

  const pool = [...INDEPENDENCE_DISTRACTORS, ...otherSteps];

  return mission.steps.map((step, idx) => {
    const pos = positions[idx] ?? 0;
    const available = pool.filter((d) => d.stimulusId !== step.stimulusId);
    const chosenDistractors = shuffle(available, rnd).slice(0, numChoices - 1);

    const options = [...chosenDistractors];
    options.splice(pos, 0, step);

    return {
      stepNum: step.stepNum,
      missionId: mission.id,
      missionTitle: mission.title,
      context: mission.context,
      instruction: step.instruction,
      targetStep: step,
      soundType: step.soundType,
      options,
      positionOfTarget: pos,
    };
  });
}
