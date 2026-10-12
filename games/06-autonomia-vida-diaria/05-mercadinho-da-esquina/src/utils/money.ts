import type { CurrencyItem, PaymentStrategy, GroceryProduct } from '../types/money';

export const DENOMINATIONS: CurrencyItem[] = [
  // Moedas (valores em centavos inteiros)
  {
    id: 'moeda-5',
    cents: 5,
    label: '5¢',
    type: 'moeda',
    color: '#D4A373',
    accentColor: '#9C6644',
    width: 44,
    height: 44,
  },
  {
    id: 'moeda-10',
    cents: 10,
    label: '10¢',
    type: 'moeda',
    color: '#E9C46A',
    accentColor: '#D4A373',
    width: 48,
    height: 48,
  },
  {
    id: 'moeda-25',
    cents: 25,
    label: '25¢',
    type: 'moeda',
    color: '#E76F51',
    accentColor: '#B04A30',
    width: 52,
    height: 52,
  },
  {
    id: 'moeda-50',
    cents: 50,
    label: '50¢',
    type: 'moeda',
    color: '#A8DADC',
    accentColor: '#457B9D',
    width: 50,
    height: 50,
  },
  {
    id: 'moeda-100',
    cents: 100,
    label: 'R$ 1',
    type: 'moeda',
    color: '#E9C46A',
    accentColor: '#C4973B',
    width: 56,
    height: 56,
  },

  // Cédulas de Treino (valores em centavos inteiros)
  {
    id: 'cedula-200',
    cents: 200,
    label: 'R$ 2',
    type: 'cedula',
    color: '#4A6B82', // Azul tartaruga
    accentColor: '#2B4353',
    width: 110,
    height: 60,
  },
  {
    id: 'cedula-500',
    cents: 500,
    label: 'R$ 5',
    type: 'cedula',
    color: '#B04A8B', // Roxo garça
    accentColor: '#7A2C5E',
    width: 115,
    height: 62,
  },
  {
    id: 'cedula-1000',
    cents: 1000,
    label: 'R$ 10',
    type: 'cedula',
    color: '#E63946', // Vermelho arara
    accentColor: '#A8202C',
    width: 120,
    height: 64,
  },
  {
    id: 'cedula-2000',
    cents: 2000,
    label: 'R$ 20',
    type: 'cedula',
    color: '#F4A261', // Amarelo mico-leão
    accentColor: '#C86E2D',
    width: 125,
    height: 66,
  },
  {
    id: 'cedula-5000',
    cents: 5000,
    label: 'R$ 50',
    type: 'cedula',
    color: '#D4A373', // Dourado onça-pintada
    accentColor: '#8C5B32',
    width: 130,
    height: 68,
  },
  {
    id: 'cedula-10000',
    cents: 10000,
    label: 'R$ 100',
    type: 'cedula',
    color: '#0E8388', // Azul-esverdeado garoupa
    accentColor: '#095356',
    width: 135,
    height: 70,
  },
];

/**
 * Format integer cents into Brazilian Real currency string.
 * Ex: 350 -> "R$ 3,50"
 */
export function formatBRL(cents: number): string {
  const brlFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return brlFormatter.format(cents / 100);
}

/**
 * Classifies the payment strategy according to clinical ABA rules (Section 4.2).
 */
export function classifyPaymentStrategy(
  priceCents: number,
  paidCents: number,
  singleNoteUsedCents?: number
): PaymentStrategy {
  if (paidCents < priceCents) {
    return 'insuficiente';
  }

  if (paidCents === priceCents) {
    return 'exato';
  }

  const difference = paidCents - priceCents;

  // Next-dollar rule: difference is less than 1 real (100 cents)
  // OR paid with a single note that is the minimal whole note above price (e.g. price 350¢ paid with 500¢ note)
  if (difference < 100) {
    return 'um-real-a-mais';
  }

  if (singleNoteUsedCents && singleNoteUsedCents === paidCents) {
    // Check if there was an intermediate banknote between price and note
    const intermediateNote = [200, 500, 1000, 2000, 5000].find(
      (n) => n >= priceCents && n < singleNoteUsedCents
    );
    if (!intermediateNote) {
      return 'um-real-a-mais';
    }
  }

  return 'excesso';
}

/**
 * Calculates exact change expected in integer cents.
 */
export function calculateChange(priceCents: number, paidCents: number): number {
  return Math.max(0, paidCents - priceCents);
}

export const GROCERY_CATALOG: GroceryProduct[] = [
  { id: 'prod-arroz', name: 'Arroz Branco 1kg', category: 'mercearia', priceCents: 550, iconEmoji: '🍚', unit: 'pct' },
  { id: 'prod-feijao', name: 'Feijão Carioca 1kg', category: 'mercearia', priceCents: 780, iconEmoji: '🫘', unit: 'pct' },
  { id: 'prod-leite', name: 'Leite Integral 1L', category: 'mercearia', priceCents: 420, iconEmoji: '🥛', unit: 'cx' },
  { id: 'prod-pao', name: 'Pão Francês', category: 'padaria', priceCents: 150, iconEmoji: '🥖', unit: 'un' },
  { id: 'prod-manteiga', name: 'Manteiga 200g', category: 'padaria', priceCents: 890, iconEmoji: '🧈', unit: 'pote' },
  { id: 'prod-banana', name: 'Banana Prata', category: 'hortifruti', priceCents: 350, iconEmoji: '🍌', unit: 'palma' },
  { id: 'prod-maca', name: 'Maçã Nacional', category: 'hortifruti', priceCents: 250, iconEmoji: '🍎', unit: 'un' },
  { id: 'prod-sabonete', name: 'Sabonete Suave', category: 'higiene', priceCents: 200, iconEmoji: '🧼', unit: 'un' },
  { id: 'prod-pasta', name: 'Creme Dental', category: 'higiene', priceCents: 450, iconEmoji: '🪥', unit: 'tubo' },
  { id: 'prod-suco', name: 'Suco de Caju 1L', category: 'mercearia', priceCents: 600, iconEmoji: '🧃', unit: 'garrafa' },
];

export interface PaymentProblem {
  priceCents: number;
  product: GroceryProduct;
  wallet: CurrencyItem[];
}

/**
 * Generates a valid payment problem guaranteed to have a solution in the wallet.
 */
export function generatePaymentProblem(level: number): PaymentProblem {
  const product = GROCERY_CATALOG[Math.floor(Math.random() * GROCERY_CATALOG.length)];
  let priceCents = product.priceCents;

  if (level === 3) {
    // Level 3: Integer prices (R$ 2, R$ 5, R$ 10, etc.)
    priceCents = [200, 300, 400, 500, 700, 800, 1000][Math.floor(Math.random() * 7)];
  }

  // Generate wallet ensuring learner can pay by either exact or next-dollar
  const wallet: CurrencyItem[] = [];

  // Add notes and coins
  wallet.push(DENOMINATIONS.find((d) => d.cents === 200)!); // R$ 2
  wallet.push(DENOMINATIONS.find((d) => d.cents === 500)!); // R$ 5
  wallet.push(DENOMINATIONS.find((d) => d.cents === 1000)!); // R$ 10
  wallet.push(DENOMINATIONS.find((d) => d.cents === 100)!); // R$ 1
  wallet.push(DENOMINATIONS.find((d) => d.cents === 50)!); // 50¢
  wallet.push(DENOMINATIONS.find((d) => d.cents === 25)!); // 25¢

  return {
    priceCents,
    product: { ...product, priceCents },
    wallet,
  };
}
