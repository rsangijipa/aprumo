import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig } from '@aprumo/protocol';

export type CommunicationStyle = 'assertive' | 'passive' | 'aggressive' | 'inappropriate';

export interface SocialChoice {
  stimulusId: string;
  label: string;
  text: string;
  style: CommunicationStyle;
  isOptimal: boolean;
  score: number;
  clinicalFeedback: string;
}

export interface SocialScenario {
  id: string;
  locationId: 'cafeteria' | 'transporte' | 'parque' | 'biblioteca';
  locationName: string;
  position3D: [number, number, number];
  npc: {
    name: string;
    role: string;
    avatarId: string;
    emotion: 'friendly' | 'busy' | 'curious' | 'calm';
  };
  contextSummary: string;
  npcDialogue: string;
  choices: SocialChoice[];
}

export const SOCIAL_SCENARIOS: SocialScenario[] = [
  {
    id: 'cafe-pedido',
    locationId: 'cafeteria',
    locationName: 'Cafeteria da Praça',
    position3D: [-6, 0, -4],
    npc: {
      name: 'Sofia',
      role: 'Atendente da Cafeteria',
      avatarId: 'sofia',
      emotion: 'friendly',
    },
    contextSummary: 'Você chegou à cafeteria e foi atendido no balcão. Quer pedir um suco de laranja natural.',
    npcDialogue: 'Olá! Seja bem-vindo(a) à nossa cafeteria! O que você gostaria de pedir hoje?',
    choices: [
      {
        stimulusId: 'opt-cafe-assertive',
        label: 'Pedido Claro e Gentil',
        text: 'Olá, boa tarde! Eu gostaria de um suco de laranja natural, por favor.',
        style: 'assertive',
        isOptimal: true,
        score: 100,
        clinicalFeedback: 'Excelente! Você iniciou com cumprimento cordial, fez o pedido com clareza e usou "por favor".',
      },
      {
        stimulusId: 'opt-cafe-passive',
        label: 'Pedido Hesitante',
        text: 'Ah... sei lá... qualquer coisa que não demore muito...',
        style: 'passive',
        isOptimal: false,
        score: 40,
        clinicalFeedback: 'Comunicação muito vaga. Dizer o que você realmente quer ajuda o atendente a te servir melhor.',
      },
      {
        stimulusId: 'opt-cafe-aggressive',
        label: 'Pedido Ríspido',
        text: 'Me dá um suco logo que eu não tenho o dia todo.',
        style: 'aggressive',
        isOptimal: false,
        score: 20,
        clinicalFeedback: 'O tom foi rude e agressivo. Cumprimentar e pedir com educação cria um clima agradável para ambos.',
      },
      {
        stimulusId: 'opt-cafe-inappropriate',
        label: 'Pergunta Invasiva',
        text: 'Quanto você ganha por mês trabalhando nesse balcão?',
        style: 'inappropriate',
        isOptimal: false,
        score: 0,
        clinicalFeedback: 'Essa pergunta ultrapassa os limites pessoais e não tem relação com o pedido na cafeteria.',
      },
    ],
  },
  {
    id: 'cafe-engano',
    locationId: 'cafeteria',
    locationName: 'Cafeteria da Praça',
    position3D: [-4, 0, -6],
    npc: {
      name: 'Sofia',
      role: 'Atendente da Cafeteria',
      avatarId: 'sofia',
      emotion: 'busy',
    },
    contextSummary: 'O seu suco veio com pedras de gelo, mas você havia pedido explicitamente sem gelo porque sua garganta está sensível.',
    npcDialogue: 'Aqui está o seu suco bem geladinho!',
    choices: [
      {
        stimulusId: 'opt-engano-assertive',
        label: 'Correção Assertiva',
        text: 'Com licença, acho que houve um engano. Eu havia pedido sem gelo. Poderia trocar para mim, por favor?',
        style: 'assertive',
        isOptimal: true,
        score: 100,
        clinicalFeedback: 'Perfeito! Você defendeu sua necessidade com firmeza, clareza e cortesia, sem culpar ninguém de forma agressiva.',
      },
      {
        stimulusId: 'opt-engano-passive',
        label: 'Conformismo Silencioso',
        text: '(Ficar em silêncio, não falar nada e tomar com gelo mesmo sentindo dor de garganta)',
        style: 'passive',
        isOptimal: false,
        score: 30,
        clinicalFeedback: 'Você tem todo o direito de pedir a correção de um engano de forma educada para não se prejudicar.',
      },
      {
        stimulusId: 'opt-engano-aggressive',
        label: 'Reclamação Exaltada',
        text: 'Vocês não prestam atenção em nada aqui! Eu falei sem gelo, são surdos?',
        style: 'aggressive',
        isOptimal: false,
        score: 15,
        clinicalFeedback: 'Erros acontecem. Exaltar-se fecha portas e gera hostilidade desnecessária.',
      },
      {
        stimulusId: 'opt-engano-inappropriate',
        label: 'Reação Desproporcional',
        text: '(Empurrar o copo de propósito para derramar na mesa e sair correndo)',
        style: 'inappropriate',
        isOptimal: false,
        score: 0,
        clinicalFeedback: 'Derrubar o líquido causa prejuízo e não resolve a situação. Expressar-se em palavras é o caminho maduro.',
      },
    ],
  },
  {
    id: 'transporte-desembarque',
    locationId: 'transporte',
    locationName: 'Estação de Ônibus',
    position3D: [5, 0, -5],
    npc: {
      name: 'Marcos',
      role: 'Passageiro no Corredor',
      avatarId: 'marcos',
      emotion: 'curious',
    },
    contextSummary: 'O ônibus está cheio e você precisa passar para descer no próximo ponto da escola.',
    npcDialogue: '(Marcos está em pé segurando o apoio bem na frente da porta de saída)',
    choices: [
      {
        stimulusId: 'opt-bus-assertive',
        label: 'Pedido de Passagem Cortês',
        text: 'Com licença, por favor. Você vai descer no próximo ponto ou posso passar?',
        style: 'assertive',
        isOptimal: true,
        score: 100,
        clinicalFeedback: 'Excepcional! Essa pergunta informa sua intenção com respeito e dá espaço para o outro se organizar.',
      },
      {
        stimulusId: 'opt-bus-passive',
        label: 'Espera Silenciosa',
        text: '(Ficar quieto esperando que a pessoa adivinhe e acabar perdendo o ponto de descida)',
        style: 'passive',
        isOptimal: false,
        score: 35,
        clinicalFeedback: 'As pessoas em locais públicos nem sempre percebem nossa intenção. Falar em voz clara evita que você se atrase.',
      },
      {
        stimulusId: 'opt-bus-aggressive',
        label: 'Empurrão Brusco',
        text: '(Passar esbarrando forte com o ombro sem pedir licença)',
        style: 'aggressive',
        isOptimal: false,
        score: 20,
        clinicalFeedback: 'Invadir o espaço físico de outra pessoa pode assustar ou causar discussões. Peça licença sempre.',
      },
      {
        stimulusId: 'opt-bus-inappropriate',
        label: 'Grito Desesperado',
        text: 'MOTORISTA! ME TIRA DAQUI AGORA, TEM GENTE NA MINHA FRENTE!',
        style: 'inappropriate',
        isOptimal: false,
        score: 0,
        clinicalFeedback: 'Gritar no transporte assusta os passageiros. Uma simples frase em tom normal resolve com eficiência.',
      },
    ],
  },
  {
    id: 'parque-recusa',
    locationId: 'parque',
    locationName: 'Praça Central',
    position3D: [0, 0, 4],
    npc: {
      name: 'Clara',
      role: 'Colega de Escola',
      avatarId: 'clara',
      emotion: 'friendly',
    },
    contextSummary: 'Sua colega convidou você para ir a uma festa com som muito alto e luzes piscantes que te causariam sobrecarga sensorial.',
    npcDialogue: 'E aí! Vai ter aquela balada no galpão com DJ hoje à noite! Você vem com a gente, né?',
    choices: [
      {
        stimulusId: 'opt-recusa-assertive',
        label: 'Recusa Assertiva com Proposta',
        text: 'Obrigado pelo convite, Clara! Esse tipo de festa com muito barulho não me faz bem, então vou passar hoje. Que tal a gente tomar um sorvete no sábado?',
        style: 'assertive',
        isOptimal: true,
        score: 100,
        clinicalFeedback: 'Sensacional! Dizer "não" para respeitar seu bem-estar é um ato de maturidade, e propor outra atividade fortalece a amizade.',
      },
      {
        stimulusId: 'opt-recusa-passive',
        label: 'Aceitar Contra a Vontade',
        text: 'Ah... tá bom... eu vou sim... (mesmo sabendo que vai passar mal com o som alto)',
        style: 'passive',
        isOptimal: false,
        score: 40,
        clinicalFeedback: 'Aceitar convites que violam seus limites sensoriais gera sofrimento. Seus amigos verdadeiros vão entender.',
      },
      {
        stimulusId: 'opt-recusa-aggressive',
        label: 'Julgamento Ofensivo',
        text: 'Que ideia idiota, só gente sem noção vai para um lugar barulhento desses!',
        style: 'aggressive',
        isOptimal: false,
        score: 15,
        clinicalFeedback: 'Criticar o gosto da outra pessoa machuca a relação. Você pode recusar sem ofender o interesse dela.',
      },
      {
        stimulusId: 'opt-recusa-inappropriate',
        label: 'Sumiço e Fuga',
        text: '(Dar as costas no meio da conversa sem responder nada e bloquear ela no celular)',
        style: 'inappropriate',
        isOptimal: false,
        score: 0,
        clinicalFeedback: 'Ignorar uma pessoa que foi gentil em te convidar deixa a relação confusa. Responder com clareza é respeitoso.',
      },
    ],
  },
  {
    id: 'biblioteca-apoio',
    locationId: 'biblioteca',
    locationName: 'Biblioteca Municipal',
    position3D: [6, 0, 3],
    npc: {
      name: 'Dona Lúcia',
      role: 'Bibliotecária',
      avatarId: 'lucia',
      emotion: 'calm',
    },
    contextSummary: 'Você precisa encontrar um livro sobre Biologia marinha para um trabalho escolar, mas não conhece a organização das estantes.',
    npcDialogue: 'Boa tarde, posso ajudar você a encontrar algum material?',
    choices: [
      {
        stimulusId: 'opt-biblio-assertive',
        label: 'Solicitação em Tom Adequado',
        text: 'Boa tarde! Estou procurando um livro sobre Biologia marinha para a escola. Você poderia me indicar onde fica essa seção?',
        style: 'assertive',
        isOptimal: true,
        score: 100,
        clinicalFeedback: 'Excelente! Tom de voz regulado para o ambiente de estudo, pedido objetivo e respeitoso.',
      },
      {
        stimulusId: 'opt-biblio-passive',
        label: 'Desistir sem Tentar',
        text: 'Não... nada não... (ficar andando perdido pelas estantes sem pedir ajuda)',
        style: 'passive',
        isOptimal: false,
        score: 35,
        clinicalFeedback: 'A equipe da biblioteca está lá exatamente para ajudar. Pedir orientação poupa seu tempo e energia.',
      },
      {
        stimulusId: 'opt-biblio-aggressive',
        label: 'Tom Alto e Exigente',
        text: 'Acha o livro de Biologia pra mim agora!',
        style: 'aggressive',
        isOptimal: false,
        score: 20,
        clinicalFeedback: 'Em bibliotecas a regra social é o tom de voz suave e o respeito com quem está nos auxiliando.',
      },
      {
        stimulusId: 'opt-biblio-inappropriate',
        label: 'Comportamento Fora de Norma',
        text: '(Começar a comer salgadinho com as mãos sujas em cima dos livros expostos)',
        style: 'inappropriate',
        isOptimal: false,
        score: 0,
        clinicalFeedback: 'Alimentos e bebidas podem danificar os livros e quebram a norma de conservação do espaço compartilhado.',
      },
    ],
  },
];

export interface PlannedSocialCityTrial {
  trialIndex: number;
  scenarioId: string;
  scenario: SocialScenario;
  targetChoice: SocialChoice;
  options: SocialChoice[];
  positionOfTarget: number;
}

export function planSocialCityTrials(config: SessionConfig): PlannedSocialCityTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  const numChoices = Math.max(2, Math.min(config.adaptation.maxChoices, 4));
  const positions = counterbalancedPositions(SOCIAL_SCENARIOS.length, numChoices, rnd);

  return SOCIAL_SCENARIOS.map((scenario, i) => {
    const pos = positions[i] ?? 0;
    const optimal = scenario.choices.find((c) => c.isOptimal)!;
    const others = scenario.choices.filter((c) => !c.isOptimal);
    const chosenOthers = shuffle(others, rnd).slice(0, numChoices - 1);

    const options = [...chosenOthers];
    options.splice(pos, 0, optimal);

    return {
      trialIndex: i,
      scenarioId: scenario.id,
      scenario,
      targetChoice: optimal,
      options,
      positionOfTarget: pos,
    };
  });
}
