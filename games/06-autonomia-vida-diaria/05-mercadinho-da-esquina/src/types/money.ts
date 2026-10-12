export type DenominationType = 'moeda' | 'cedula';

export interface CurrencyItem {
  id: string;
  cents: number; // Stored in integer cents! Never floating point.
  label: string;
  type: DenominationType;
  color: string;
  accentColor: string;
  width: number;
  height: number;
}

export type PaymentStrategy = 'exato' | 'um-real-a-mais' | 'excesso' | 'insuficiente';

export type GameModule = 'M1' | 'M2' | 'M3' | 'M4' | 'M5';

export interface GroceryProduct {
  id: string;
  name: string;
  category: 'padaria' | 'hortifruti' | 'mercearia' | 'higiene';
  priceCents: number;
  iconEmoji: string;
  unit: string;
}

export interface ShoppingListItem {
  productId: string;
  quantity: number;
  isCollected: boolean;
}

export interface SocialScriptRecord {
  greetedCashier: boolean; // "Bom dia / Boa tarde"
  answeredBagQuestion: boolean; // "Vai querer sacola?"
  thankedCashier: boolean; // "Obrigado, até logo"
}

export interface AbaMoneyTrial {
  trialId: string;
  timestamp: number;
  module: GameModule;
  level: number;
  priceCents: number;
  paidCents: number;
  strategy: PaymentStrategy;
  changeExpectedCents: number;
  changeCheckedCents?: number;
  socialScript?: SocialScriptRecord;
  isSuccess: boolean;
}
