/**
 * Aprumo — MiniMundos (Brincar Simbólico Funcional)
 * Lógica clínica para exploração lúdica e missões representativas
 */

import type { SessionConfig } from '@aprumo/protocol';

export type WorldTheme = 'casa' | 'mercado' | 'consultorio' | 'escola';

export interface WorldObject {
  id: string;
  name: string;
  icon: string;
  actionText: string;
  soundType: 'click' | 'bell' | 'chime' | 'chew' | 'heartbeat';
}

export interface WorldMission {
  id: string;
  title: string;
  instruction: string;
  targetObjectIds: string[]; // Ordem esperada ou itens necessários
  successMessage: string;
}

export interface WorldEnvironment {
  id: WorldTheme;
  name: string;
  icon: string;
  description: string;
  objects: WorldObject[];
  mission: WorldMission;
}

export const WORLD_ENVIRONMENTS: Record<WorldTheme, WorldEnvironment> = {
  casa: {
    id: 'casa',
    name: 'Quarto & Casa',
    icon: '🏠',
    description: 'Ambiente doméstico de descanso, rotina e cuidados com o quarto.',
    objects: [
      { id: 'cama', name: 'Caminha Fofa', icon: '🛏️', actionText: 'Colocou o ursinho na cama para descansar', soundType: 'chime' },
      { id: 'lampada', name: 'Abajur', icon: '💡', actionText: 'Ligou e apagou a luz suave do quarto', soundType: 'click' },
      { id: 'fruta', name: 'Maçã Suculenta', icon: '🍎', actionText: 'Ofereceu uma maçã saudável para o lanche', soundType: 'chew' },
      { id: 'janela', name: 'Janela Aberta', icon: '🪟', actionText: 'Abriu a janela para ver a manhã ensolarada', soundType: 'click' },
      { id: 'livro', name: 'Livro de Histórias', icon: '📖', actionText: 'Abriu uma página de conto de fadas', soundType: 'chime' },
    ],
    mission: {
      id: 'missao-dormir',
      title: 'Hora de Dormir',
      instruction: 'O ursinho está com sono! Coloque o ursinho na cama e apague a luz do abajur.',
      targetObjectIds: ['cama', 'lampada'],
      successMessage: 'Boa noite, ursinho! Você completou a rotina de dormir com muito carinho.',
    },
  },
  mercado: {
    id: 'mercado',
    name: 'Mercadinho da Esquina',
    icon: '🛒',
    description: 'Atividade de compras, escolha de alimentos e troca simbólica no caixa.',
    objects: [
      { id: 'carrinho', name: 'Carrinho de Compras', icon: '🛒', actionText: 'Puxou o carrinho para o corredor', soundType: 'click' },
      { id: 'banana', name: 'Cacho de Bananas', icon: '🍌', actionText: 'Colocou bananas amarelinhas na cesta', soundType: 'click' },
      { id: 'pao', name: 'Pão Quentinho', icon: '🥖', actionText: 'Escolheu um pão crocante da padaria', soundType: 'click' },
      { id: 'caixa', name: 'Caixa Registradora', icon: '💳', actionText: 'Passou a compra no caixa com bip sonoro', soundType: 'bell' },
      { id: 'sacola', name: 'Sacola Ecológica', icon: '🛍️', actionText: 'Guardou as compras com cuidado na sacola', soundType: 'click' },
    ],
    mission: {
      id: 'missao-compras',
      title: 'Comprar um Alimento',
      instruction: 'Vamos comprar um alimento delicioso e passar no caixa para pagar!',
      targetObjectIds: ['banana', 'caixa'],
      successMessage: 'Compra finalizada com sucesso! Você é um excelente comprador.',
    },
  },
  consultorio: {
    id: 'consultorio',
    name: 'Consultório de Saúde',
    icon: '🩺',
    description: 'Cuidado em saúde, dessensibilização médica e acolhimento corporal.',
    objects: [
      { id: 'cadeira', name: 'Cadeira Reclinável', icon: '💺', actionText: 'Acomodou-se confortavelmente na poltrona', soundType: 'click' },
      { id: 'estetoscopio', name: 'Estetoscópio', icon: '🩺', actionText: 'Auscultou o coraçãozinho batendo calmo', soundType: 'heartbeat' },
      { id: 'curativo', name: 'Curativo Colorido', icon: '🩹', actionText: 'Colocou um band-aid divertido no machucado', soundType: 'chime' },
      { id: 'agua', name: 'Copinho d’Água', icon: '🥛', actionText: 'Ofereceu água fresca para hidratar', soundType: 'chew' },
      { id: 'termometro', name: 'Termômetro Digital', icon: '🌡️', actionText: 'Checou a temperatura com tranquilidade', soundType: 'bell' },
    ],
    mission: {
      id: 'missao-cuidado',
      title: 'Cuidar do Amiguinho',
      instruction: 'O amigo fez um dodói! Vamos colocar o curativo e ouvir o coração com o estetoscópio.',
      targetObjectIds: ['curativo', 'estetoscopio'],
      successMessage: 'Tudo cuidado e protegido! Você é um cuidador maravilhoso.',
    },
  },
  escola: {
    id: 'escola',
    name: 'Sala de Aula & Recreio',
    icon: '🏫',
    description: 'Ambiente escolar de desenho, materiais e convivência divertida.',
    objects: [
      { id: 'quadro', name: 'Quadro-Negro', icon: '🖍️', actionText: 'Desenhou uma linda estrela brilhante no quadro', soundType: 'chime' },
      { id: 'estojo', name: 'Estojo de Lápis', icon: '✏️', actionText: 'Organizou todos os lápis coloridos no estojo', soundType: 'click' },
      { id: 'livro_escolar', name: 'Caderno de Desenho', icon: '📚', actionText: 'Folheou as páginas cheias de ilustrações', soundType: 'click' },
      { id: 'mochila', name: 'Mochila Escolar', icon: '🎒', actionText: 'Guardou o estojo e fechou o zíper', soundType: 'click' },
      { id: 'sino', name: 'Sino do Recreio', icon: '🔔', actionText: 'Tocou o sino alegre do recreio!', soundType: 'bell' },
    ],
    mission: {
      id: 'missao-recreio',
      title: 'Desenho e Recreio',
      instruction: 'Desenhe no quadro e depois toque o sino anunciando a hora do recreio!',
      targetObjectIds: ['quadro', 'sino'],
      successMessage: 'Recreio liberado! Todos vão brincar juntos no pátio.',
    },
  },
};

export function checkMissionProgress(
  mission: WorldMission,
  history: string[],
): { isCompleted: boolean; completedSteps: number; totalSteps: number } {
  let completedSteps = 0;
  for (const targetId of mission.targetObjectIds) {
    if (history.includes(targetId)) {
      completedSteps++;
    }
  }
  const isCompleted = completedSteps >= mission.targetObjectIds.length;
  return { isCompleted, completedSteps, totalSteps: mission.targetObjectIds.length };
}

export function getWorld(theme: WorldTheme): WorldEnvironment {
  return WORLD_ENVIRONMENTS[theme];
}

export function planWorldTrials(_config?: SessionConfig | null): WorldEnvironment[] {
  return Object.values(WORLD_ENVIRONMENTS);
}
