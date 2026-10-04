/**
 * Aprumo — Histórias Sociais Interativas (Social Story Studio)
 * Metodologia: Carol Gray (Sentenças Descritivas, Perspectivas, Diretivas e de Controle)
 */

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StorySlide {
  slideNumber: number;
  title: string;
  text: string;
  emoji: string;
  characterMood: 'neutral' | 'calm' | 'waiting' | 'proud' | 'happy' | 'listening';
}

export interface SocialStory {
  id: string;
  title: string;
  topic: 'turnos' | 'flexibilidade' | 'sensorial' | 'comunicacao';
  summary: string;
  slides: StorySlide[];
  comprehension: ComprehensionQuestion;
}

export const SOCIAL_STORIES: SocialStory[] = [
  {
    id: 'esperar-minha-vez',
    title: 'Esperar a Minha Vez',
    topic: 'turnos',
    summary: 'Compreensão de turnos, reciprocidade social e estratégias de autorregulação na espera.',
    slides: [
      {
        slideNumber: 1,
        title: 'Brincando com Amigos e Colegas',
        text: 'Na escola, em casa e na clínica, muitas vezes quero brincar com o mesmo brinquedo que o meu colega está usando.',
        emoji: '🧸',
        characterMood: 'listening',
      },
      {
        slideNumber: 2,
        title: 'Cada um Tem a Sua Vez',
        text: 'Quando meu amigo está com o brinquedo, é a vez dele. Brincar junto significa que todos têm um momento para se divertir.',
        emoji: '⏳',
        characterMood: 'neutral',
      },
      {
        slideNumber: 3,
        title: 'O que Posso Fazer Enquanto Espero',
        text: 'Enquanto espero, eu posso respirar fundo três vezes, olhar o timer visual ou escolher outro brinquedo legal para me entreter.',
        emoji: '🎨',
        characterMood: 'calm',
      },
      {
        slideNumber: 4,
        title: 'A Minha Vez Chegou!',
        text: 'Quando o tempo acaba ou o amigo termina, ele me passa o brinquedo. Esperar a minha vez mostra carinho e respeito por todos!',
        emoji: '⭐',
        characterMood: 'proud',
      },
    ],
    comprehension: {
      question: 'O que o Léo pode fazer enquanto espera a sua vez de brincar?',
      options: [
        'Gritar bem alto e arrancar o brinquedo da mão do amigo',
        'Respirar fundo, olhar o timer ou escolher outro brinquedo divertido',
        'Sair correndo da sala chateado',
      ],
      correctIndex: 1,
      explanation: 'Muito bem! Respirar fundo ou escolher outro brinquedo ajuda nosso corpo a ficar calmo na espera.',
    },
  },
  {
    id: 'quando-planos-mudam',
    title: 'Quando os Planos Mudam',
    topic: 'flexibilidade',
    summary: 'Flexibilidade cognitiva e acomodação de imprevistos na rotina diária.',
    slides: [
      {
        slideNumber: 1,
        title: 'Eu Gosto da Minha Rotina',
        text: 'Eu me sinto seguro quando sei exatamente o que vai acontecer no meu dia e sigo a minha agenda passo a passo.',
        emoji: '📅',
        characterMood: 'calm',
      },
      {
        slideNumber: 2,
        title: 'Às Vezes, Acontece um Imprevisto',
        text: 'Às vezes o tempo muda, pode chover, o trânsito pode atrasar ou um professor pode faltar. Planos podem mudar de repente.',
        emoji: '🌧️',
        characterMood: 'neutral',
      },
      {
        slideNumber: 3,
        title: 'Meu Corpo Continua Seguro',
        text: 'Mudar de atividade pode dar uma sensação esquisita na barriga, mas eu continuo seguro e as pessoas continuam cuidando de mim.',
        emoji: '🧘',
        characterMood: 'waiting',
      },
      {
        slideNumber: 4,
        title: 'Descobrindo o Novo Plano',
        text: 'Eu posso respirar fundo, perguntar ao adulto qual é o novo plano e descobrir uma atividade diferente e divertida para fazer.',
        emoji: '✨',
        characterMood: 'happy',
      },
    ],
    comprehension: {
      question: 'O que o Léo pode fazer quando a rotina precisa mudar inesperadamente?',
      options: [
        'Respirar fundo, lembrar que está seguro e conferir o novo plano com o adulto',
        'Chorar e não falar com ninguém pelo resto do dia',
        'Fingir que a mudança não aconteceu',
      ],
      correctIndex: 0,
      explanation: 'Excelente! Quando os planos mudam, respirar fundo e pedir ajuda nos ajuda a nos adaptarmos com tranquilidade.',
    },
  },
  {
    id: 'barulho-alto-sensibilidade',
    title: 'Barulho Alto e Meus Ouvidos',
    topic: 'sensorial',
    summary: 'Autorregulação e uso de suportes sensoriais (abafadores e cantinho calmo) em ambientes ruidosos.',
    slides: [
      {
        slideNumber: 1,
        title: 'Sons Fortes ao Nosso Redor',
        text: 'No shopping, no recreio ou na rua, às vezes ouvimos sirenes, alarmes, secadores ou muitas pessoas conversando alto.',
        emoji: '📢',
        characterMood: 'listening',
      },
      {
        slideNumber: 2,
        title: 'Meus Ouvidos São Sensíveis',
        text: 'O meu cérebro percebe os sons com muita força. Sons intensos podem me deixar assustado, incomodado ou cansado.',
        emoji: '👂',
        characterMood: 'neutral',
      },
      {
        slideNumber: 3,
        title: 'Meus Recursos de Proteção',
        text: 'Eu posso colocar os meus abafadores de ruído, usar tampões de ouvido ou cobrir minhas orelhas delicadamente com as mãos.',
        emoji: '🎧',
        characterMood: 'calm',
      },
      {
        slideNumber: 4,
        title: 'Pedindo um Cantinho Calmo',
        text: 'Também posso fazer o sinal de pausa ou dizer: "Está muito barulhento, quero um lugar tranquilo". Eu sei como proteger meus ouvidos!',
        emoji: '🌿',
        characterMood: 'proud',
      },
    ],
    comprehension: {
      question: 'O que é uma boa estratégia para o Léo quando o barulho está incomodando?',
      options: [
        'Colocar os abafadores de ruído ou pedir para ir a um cantinho tranquilo',
        'Tapar a boca e não contar para ninguém o que está sentindo',
        'Ficar no meio do som alto até ter uma crise',
      ],
      correctIndex: 0,
      explanation: 'Isso mesmo! Proteger os ouvidos com abafadores ou procurar um cantinho silencioso acalma nosso sistema sensorial.',
    },
  },
  {
    id: 'pedir-ajuda-com-calma',
    title: 'Pedir Ajuda com Calma',
    topic: 'comunicacao',
    summary: 'Comunicação funcional alternativa para substituir comportamentos disruptivos diante da frustração.',
    slides: [
      {
        slideNumber: 1,
        title: 'Quando uma Tarefa é Desafiadora',
        text: 'Às vezes encontro algo difícil de fazer, como amarrar o tênis, abrir um pacote apertado ou resolver um exercício novo.',
        emoji: '🧩',
        characterMood: 'listening',
      },
      {
        slideNumber: 2,
        title: 'Reconhecendo a Frustração',
        text: 'Quando algo não sai como eu queria, sinto meus músculos ficarem tensos e posso sentir vontade de gritar ou empurrar os objetos.',
        emoji: '😤',
        characterMood: 'neutral',
      },
      {
        slideNumber: 3,
        title: 'A Minha Voz é Poderosa',
        text: 'Gritar ou jogar coisas não resolve o problema. A melhor escolha é usar as minhas palavras ou a minha prancha de comunicação.',
        emoji: '🗣️',
        characterMood: 'calm',
      },
      {
        slideNumber: 4,
        title: 'Ajuda, Por Favor!',
        text: 'Eu posso olhar para o adulto e falar: "Ajuda, por favor!". As pessoas ao meu redor ficam felizes em me ensinar e me apoiar.',
        emoji: '🤝',
        characterMood: 'happy',
      },
    ],
    comprehension: {
      question: 'O que o Léo deve fazer quando uma tarefa está muito difícil?',
      options: [
        'Jogar o material no chão com força',
        'Dizer ou sinalizar com calma: "Ajuda, por favor!"',
        'Desistir e ficar zangado o resto do dia',
      ],
      correctIndex: 1,
      explanation: 'Perfeito! Pedir ajuda com calma é uma forma incrível e madura de aprender coisas novas sem se estressar.',
    },
  },
];

export function getStoryById(id: string): SocialStory | undefined {
  return SOCIAL_STORIES.find((s) => s.id === id);
}

export function validateAnswer(storyId: string, answerIndex: number): boolean {
  const story = getStoryById(storyId);
  if (!story) return false;
  return story.comprehension.correctIndex === answerIndex;
}
