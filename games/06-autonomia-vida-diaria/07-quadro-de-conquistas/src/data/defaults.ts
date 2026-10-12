import type { TokenTheme, ReinforcerOption, TeenGoal, PriceMenuItem } from '../types/tokens';

export const TOKEN_THEMES: TokenTheme[] = [
  {
    id: 'buriti-estrela',
    name: 'Estrela de Buriti',
    color: '#F4A261',
    accentColor: '#E76F51',
    description: 'Estrela dourada em estilo recorte de papel com fibra de buriti.',
    svgPath: 'M 50,5 L 63,35 L 95,38 L 70,60 L 78,92 L 50,75 L 22,92 L 30,60 L 5,38 L 37,35 Z',
  },
  {
    id: 'acai-fruto',
    name: 'Fruto do Açaí',
    color: '#581845',
    accentColor: '#900C3F',
    description: 'Fruto roxo arredondado com brilho da floresta.',
    svgPath: 'M 50,15 A 35,35 0 1,0 50,85 A 35,35 0 1,0 50,15 Z',
  },
  {
    id: 'vitoria-regia',
    name: 'Vitória-Régia',
    color: '#2D6A4F',
    accentColor: '#52B788',
    description: 'Folha verde redonda das águas amazônicas.',
    svgPath: 'M 50,12 A 38,38 0 1,1 48,12 L 50,50 Z',
  },
  {
    id: 'boto-rosa',
    name: 'Boto Sorridente',
    color: '#F48FB1',
    accentColor: '#F06292',
    description: 'Boto cor-de-rosa das águas do Rio Negro.',
    svgPath: 'M 20,50 C 35,25 65,20 85,35 C 95,45 90,65 75,70 C 60,75 40,85 28,75 Z',
  },
];

export const DEFAULT_REINFORCERS: ReinforcerOption[] = [
  {
    id: 'reinf-bolhas',
    name: 'Bolhas de Sabão',
    category: 'brinquedo',
    durationSeconds: 120, // 2 min
    iconEmoji: '🫧',
    color: '#0E8388',
    description: '2 minutos assoprando e estourando bolhas no espaço sensorial.',
  },
  {
    id: 'reinf-video',
    name: 'Vídeo Favorito',
    category: 'video',
    durationSeconds: 180, // 3 min
    iconEmoji: '📺',
    color: '#E63946',
    description: '3 minutos assistindo a um clipe ou animação preferida.',
  },
  {
    id: 'reinf-massinha',
    name: 'Massinha de Modelar',
    category: 'brinquedo',
    durationSeconds: 120,
    iconEmoji: '🎨',
    color: '#F4A261',
    description: '2 minutos criando esculturas e formas com massinha colorida.',
  },
  {
    id: 'reinf-pausa',
    name: 'Pausa no Colchão',
    category: 'pausa',
    durationSeconds: 90,
    iconEmoji: '🛋️',
    color: '#2A9D8F',
    description: '1 minuto e meio descansando com almofadas e respiração calma.',
  },
];

export const DEFAULT_TEEN_GOALS: TeenGoal[] = [
  {
    id: 'meta-tarefa',
    title: 'Completar o bloco de atividades de escrita',
    description: 'Realizar os 4 exercícios propostos sem esquiva ou abandono da mesa.',
    points: 10,
    selfReported: false,
    category: 'tarefa',
  },
  {
    id: 'meta-comunicacao',
    title: 'Pedir intervalo usando frase completa',
    description: 'Dizer: "Gostaria de uma pausa de 3 minutos, por favor" antes de ficar sobrecarregado.',
    points: 5,
    selfReported: false,
    category: 'comunicacao',
  },
  {
    id: 'meta-organizacao',
    title: 'Guardar materiais e organizar a mesa',
    description: 'Colocar canetas, folhas e fichas nos seus respectivos estojos ao término.',
    points: 5,
    selfReported: false,
    category: 'autonomia',
  },
  {
    id: 'meta-social',
    title: 'Manter contato visual na conversa inicial',
    description: 'Compartilhar um acontecimento do dia olhando para o interlocutor por ao menos 5 segundos.',
    points: 5,
    selfReported: false,
    category: 'social',
  },
];

export const DEFAULT_PRICE_MENU: PriceMenuItem[] = [
  {
    id: 'preco-musica',
    title: 'Escolher a Playlist da Sessão',
    cost: 15,
    icon: '🎵',
    category: 'privilegio',
    description: 'Definir as 3 músicas que tocarão de fundo durante a atividade.',
  },
  {
    id: 'preco-jogo',
    title: '5 Minutos de Videogame / Celular',
    cost: 25,
    icon: '🎮',
    category: 'atividade',
    description: 'Pausa com acesso livre ao jogo preferido no tablet ou celular.',
  },
  {
    id: 'preco-exercicio',
    title: 'Escolher a Ordem dos Exercícios',
    cost: 10,
    icon: '📋',
    category: 'privilegio',
    description: 'Poder decidir qual matéria ou tarefa será feita primeiro.',
  },
  {
    id: 'preco-lanche',
    title: 'Momento Lanche Especial',
    cost: 30,
    icon: '🧃',
    category: 'item',
    description: 'Pausa para desfrutar do suco ou snack preferido.',
  },
];
