import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig, StimulusRef } from '@aprumo/protocol';

export interface CulinaryItem extends StimulusRef {
  sensoryNote: string;
  category: 'fruit' | 'bread' | 'dairy' | 'vegetable' | 'seasoning' | 'liquid' | 'utensil' | 'appliance';
}

export interface RecipeStep {
  stepIndex: number;
  item: CulinaryItem;
  instruction: string;
  soundType: 'plop' | 'slice' | 'stir' | 'pour' | 'sizzle' | 'blender';
}

export interface ChefRecipe {
  id: string;
  title: string;
  summary: string;
  vessel: 'bowl' | 'plate' | 'tray' | 'blender';
  icon: string;
  accentColor: string;
  steps: RecipeStep[];
}

export const CHEF_RECIPES: ChefRecipe[] = [
  {
    id: 'salada-frutas',
    title: 'Salada de Frutas Colorida',
    summary: 'Sequência de frutas doces e crocantes para misturar na tigela grande.',
    vessel: 'bowl',
    icon: '🥣',
    accentColor: '#38a169',
    steps: [
      {
        stepIndex: 0,
        item: { stimulusId: 'banana', label: 'Banana Fatiada', art: 'banana', sensoryNote: 'Macio e docinho', category: 'fruit' },
        instruction: 'Coloque a banana fatiada na tigela.',
        soundType: 'plop',
      },
      {
        stepIndex: 1,
        item: { stimulusId: 'maca', label: 'Maçã Picadinha', art: 'maca', sensoryNote: 'Crocante e fresquinho', category: 'fruit' },
        instruction: 'Adicione os pedacinhos crocantes de maçã.',
        soundType: 'slice',
      },
      {
        stepIndex: 2,
        item: { stimulusId: 'morango', label: 'Morangos Vermelhos', art: 'morango', sensoryNote: 'Vermelho e aromático', category: 'fruit' },
        instruction: 'Acrescente os moranguinhos doces.',
        soundType: 'plop',
      },
      {
        stepIndex: 3,
        item: { stimulusId: 'uva', label: 'Uvas Roxas', art: 'uva', sensoryNote: 'Docinha e sem sementes', category: 'fruit' },
        instruction: 'Junte as uvas roxinhas.',
        soundType: 'plop',
      },
      {
        stepIndex: 4,
        item: { stimulusId: 'colher', label: 'Colher de Misturar', art: 'colher', sensoryNote: 'Movimento de rotação', category: 'utensil' },
        instruction: 'Misture todas as frutas com a colher!',
        soundType: 'stir',
      },
    ],
  },
  {
    id: 'sanduiche',
    title: 'Super Sanduíche Saudável',
    summary: 'Construção em camadas táteis de pão, queijo, folha verde e tomate.',
    vessel: 'plate',
    icon: '🥪',
    accentColor: '#dd6b20',
    steps: [
      {
        stepIndex: 0,
        item: { stimulusId: 'pao', label: 'Fatia de Pão', art: 'pao', sensoryNote: 'Base fofinha e macia', category: 'bread' },
        instruction: 'Coloque a primeira fatia de pão no prato.',
        soundType: 'plop',
      },
      {
        stepIndex: 1,
        item: { stimulusId: 'queijo', label: 'Fatia de Queijo', art: 'queijo', sensoryNote: 'Amarelo e macio', category: 'dairy' },
        instruction: 'Coloque a fatia de queijo sobre o pão.',
        soundType: 'plop',
      },
      {
        stepIndex: 2,
        item: { stimulusId: 'alface', label: 'Folha de Alface', art: 'alface', sensoryNote: 'Folha verde e crocante', category: 'vegetable' },
        instruction: 'Adicione a folhinha fresca de alface.',
        soundType: 'slice',
      },
      {
        stepIndex: 3,
        item: { stimulusId: 'tomate', label: 'Rodela de Tomate', art: 'tomate', sensoryNote: 'Rodela suculenta e vermelha', category: 'vegetable' },
        instruction: 'Coloque a rodela suculenta de tomate.',
        soundType: 'plop',
      },
      {
        stepIndex: 4,
        item: { stimulusId: 'pao-topo', label: 'Pão para Fechar', art: 'pao', sensoryNote: 'Cobertura do sanduíche', category: 'bread' },
        instruction: 'Feche o sanduíche com a outra fatia de pão!',
        soundType: 'plop',
      },
    ],
  },
  {
    id: 'mini-pizza',
    title: 'Mini Pizza do Chef',
    summary: 'Montagem de pizza caseira com molho de tomate, queijo e orégano.',
    vessel: 'tray',
    icon: '🍕',
    accentColor: '#e53e3e',
    steps: [
      {
        stepIndex: 0,
        item: { stimulusId: 'massa-pizza', label: 'Massa Redondinha', art: 'massa', sensoryNote: 'Massa lisa e macia', category: 'bread' },
        instruction: 'Coloque a massinha de pizza na assadeira.',
        soundType: 'plop',
      },
      {
        stepIndex: 1,
        item: { stimulusId: 'molho-tomate', label: 'Molho de Tomate', art: 'molho', sensoryNote: 'Espalhar suavemente', category: 'vegetable' },
        instruction: 'Espalhe o molho de tomate vermelho na massa.',
        soundType: 'pour',
      },
      {
        stepIndex: 2,
        item: { stimulusId: 'queijo-ralado', label: 'Queijo Ralado', art: 'queijo', sensoryNote: 'Para derreter quentinho', category: 'dairy' },
        instruction: 'Cubra com bastante queijo ralado.',
        soundType: 'plop',
      },
      {
        stepIndex: 3,
        item: { stimulusId: 'oregano', label: 'Folhinhas de Orégano', art: 'oregano', sensoryNote: 'Tempero muito cheiroso', category: 'seasoning' },
        instruction: 'Salpique folhinhas cheirosas de orégano.',
        soundType: 'slice',
      },
      {
        stepIndex: 4,
        item: { stimulusId: 'forninho', label: 'Assar no Forno', art: 'forno', sensoryNote: 'Calor e aroma delicioso', category: 'appliance' },
        instruction: 'Leve ao forninho para assar a pizza!',
        soundType: 'sizzle',
      },
    ],
  },
  {
    id: 'vitamina-suco',
    title: 'Vitamina Cremosa',
    summary: 'Bebida saudável batida no liquidificador com leite e frutas.',
    vessel: 'blender',
    icon: '🥤',
    accentColor: '#3182ce',
    steps: [
      {
        stepIndex: 0,
        item: { stimulusId: 'leite', label: 'Leite Fresco', art: 'leite', sensoryNote: 'Branquinho e geladinho', category: 'liquid' },
        instruction: 'Despeje o leite na jarra do liquidificador.',
        soundType: 'pour',
      },
      {
        stepIndex: 1,
        item: { stimulusId: 'banana', label: 'Banana Madura', art: 'banana', sensoryNote: 'Doce e cremosa', category: 'fruit' },
        instruction: 'Adicione a banana madura.',
        soundType: 'plop',
      },
      {
        stepIndex: 2,
        item: { stimulusId: 'morango', label: 'Frutas Vermelhas', art: 'morango', sensoryNote: 'Aroma adocicado', category: 'fruit' },
        instruction: 'Coloque os moranguinhos perfumados.',
        soundType: 'plop',
      },
      {
        stepIndex: 3,
        item: { stimulusId: 'gelo', label: 'Cubo de Gelo', art: 'gelo', sensoryNote: 'Cubo translúcido e frio', category: 'liquid' },
        instruction: 'Adicione uma pedrinha de gelo refrescante.',
        soundType: 'plop',
      },
      {
        stepIndex: 4,
        item: { stimulusId: 'liquidificador', label: 'Bater no Liquidificador', art: 'liquidificador', sensoryNote: 'Movimento de turbilhão', category: 'appliance' },
        instruction: 'Ligue o liquidificador para bater a vitamina!',
        soundType: 'blender',
      },
    ],
  },
];

export const NON_CULINARY_DISTRACTORS: CulinaryItem[] = [
  { stimulusId: 'sapato', label: 'Sapato', art: 'sapato', sensoryNote: 'Não é de comer', category: 'utensil' },
  { stimulusId: 'carro', label: 'Carro', art: 'carro', sensoryNote: 'Não é de comer', category: 'utensil' },
  { stimulusId: 'bola', label: 'Bola', art: 'bola', sensoryNote: 'Não é de comer', category: 'utensil' },
  { stimulusId: 'livro', label: 'Livro', art: 'livro', sensoryNote: 'Não é de comer', category: 'utensil' },
  { stimulusId: 'chave', label: 'Chave', art: 'chave', sensoryNote: 'Não é de comer', category: 'utensil' },
  { stimulusId: 'meia', label: 'Meia', art: 'meia', sensoryNote: 'Não é de comer', category: 'utensil' },
];

export interface PlannedChefTrial {
  stepIndex: number;
  recipeId: string;
  recipeTitle: string;
  vessel: 'bowl' | 'plate' | 'tray' | 'blender';
  instruction: string;
  targetItem: CulinaryItem;
  soundType: 'plop' | 'slice' | 'stir' | 'pour' | 'sizzle' | 'blender';
  options: CulinaryItem[];
  positionOfTarget: number;
}

export function planChefTrials(config: SessionConfig, recipeIndex = 0): PlannedChefTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  const recipe = CHEF_RECIPES[recipeIndex % CHEF_RECIPES.length]!;
  const numChoices = Math.max(2, Math.min(config.adaptation.maxChoices, 4));
  const positions = counterbalancedPositions(recipe.steps.length, numChoices, rnd);

  // Pool de distratores combina itens não culinários e itens de outras receitas que não sejam o alvo
  const otherRecipeItems = CHEF_RECIPES
    .filter((r) => r.id !== recipe.id)
    .flatMap((r) => r.steps.map((s) => s.item));

  const allDistractors = [...NON_CULINARY_DISTRACTORS, ...otherRecipeItems];

  return recipe.steps.map((step, i) => {
    const pos = positions[i] ?? 0;
    const availableDistractors = allDistractors.filter(
      (d) => d.stimulusId !== step.item.stimulusId,
    );
    const chosenDistractors = shuffle(availableDistractors, rnd).slice(0, numChoices - 1);

    const options = [...chosenDistractors];
    options.splice(pos, 0, step.item);

    return {
      stepIndex: step.stepIndex,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      vessel: recipe.vessel,
      instruction: step.instruction,
      targetItem: step.item,
      soundType: step.soundType,
      options,
      positionOfTarget: pos,
    };
  });
}
