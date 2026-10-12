import type {
  BinDefinition,
  ClassificationRule,
  SortItem
} from '../types';

export const COLOR_PATTERNS = {
  vermelho: { color: '#E63946', pattern: 'liso', label: 'Vermelho' },
  azul: { color: '#1D3557', pattern: 'listrado', label: 'Azul' },
  amarelo: { color: '#FFB703', pattern: 'pontilhado', label: 'Amarelo' },
  verde: { color: '#2D6A4F', pattern: 'xadrez', label: 'Verde' }
};

export const SHAPES = {
  circulo: { label: 'Círculo', color: '#0E8388' },
  quadrado: { label: 'Quadrado', color: '#E76F51' },
  triangulo: { label: 'Triângulo', color: '#F4A261' },
  estrela: { label: 'Estrela', color: '#FFB703' }
};

export const SIZES = {
  grande: { label: 'Grande', scale: 1.3 },
  pequeno: { label: 'Pequeno', scale: 0.75 }
};

export const CATEGORIES = {
  animais: { label: 'Animais', color: '#D4A373' },
  alimentos: { label: 'Comidas', color: '#E63946' },
  roupas: { label: 'Roupas', color: '#0E8388' },
  veiculos: { label: 'Veículos', color: '#457B9D' }
};

const svgData = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

// Generate sample item bank for each rule
export function generateItemsForRule(rule: ClassificationRule, count: number = 10): SortItem[] {
  const items: SortItem[] = [];

  if (rule === 'cor') {
    const colors: Array<keyof typeof COLOR_PATTERNS> = ['vermelho', 'azul', 'amarelo', 'verde'];
    for (let i = 0; i < count; i++) {
      const c = colors[i % colors.length];
      const cfg = COLOR_PATTERNS[c];
      items.push({
        id: `ursinho-${c}-${i}`,
        name: `Ursinho ${cfg.label}`,
        rule: 'cor',
        attributeValue: c,
        color: cfg.color,
        material: 'pelucia',
        svgIcon: svgData(`
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="54" r="24" fill="${cfg.color}"/>
            <circle cx="34" cy="34" r="9" fill="${cfg.color}"/>
            <circle cx="66" cy="34" r="9" fill="${cfg.color}"/>
            <circle cx="43" cy="50" r="3" fill="#1E252B"/>
            <circle cx="57" cy="50" r="3" fill="#1E252B"/>
            <ellipse cx="50" cy="58" rx="6" ry="4" fill="#FFF" opacity="0.8"/>
            <circle cx="50" cy="57" r="2" fill="#1E252B"/>
          </svg>
        `)
      });
    }
  } else if (rule === 'forma') {
    const shapeKeys: Array<keyof typeof SHAPES> = ['circulo', 'quadrado', 'triangulo', 'estrela'];
    for (let i = 0; i < count; i++) {
      const s = shapeKeys[i % shapeKeys.length];
      const cfg = SHAPES[s];
      let shapeSvg = `<circle cx="50" cy="50" r="28" fill="${cfg.color}"/>`;
      if (s === 'quadrado') shapeSvg = `<rect x="24" y="24" width="52" height="52" rx="6" fill="${cfg.color}"/>`;
      if (s === 'triangulo') shapeSvg = `<polygon points="50,20 80,76 20,76" fill="${cfg.color}"/>`;
      if (s === 'estrela') shapeSvg = `<polygon points="50,15 61,38 86,41 67,58 72,83 50,70 28,83 33,58 14,41 39,38" fill="${cfg.color}"/>`;

      items.push({
        id: `bloco-${s}-${i}`,
        name: `Bloco ${cfg.label}`,
        rule: 'forma',
        attributeValue: s,
        color: cfg.color,
        shape: s,
        material: 'madeira',
        svgIcon: svgData(`
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            ${shapeSvg}
          </svg>
        `)
      });
    }
  } else if (rule === 'tamanho') {
    const sizes: Array<keyof typeof SIZES> = ['grande', 'pequeno'];
    for (let i = 0; i < count; i++) {
      const sz = sizes[i % sizes.length];
      const isLarge = sz === 'grande';
      const r = isLarge ? 32 : 18;
      items.push({
        id: `tampa-${sz}-${i}`,
        name: `Tampinha ${isLarge ? 'Grande' : 'Pequena'}`,
        rule: 'tamanho',
        attributeValue: sz,
        color: '#0E8388',
        size: sz,
        material: 'plastico',
        svgIcon: svgData(`
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="${r}" fill="#0E8388"/>
            <circle cx="50" cy="50" r="${r - 6}" fill="none" stroke="#FFF" stroke-width="3" opacity="0.6"/>
          </svg>
        `)
      });
    }
  } else if (rule === 'categoria') {
    const cats: Array<keyof typeof CATEGORIES> = ['animais', 'alimentos', 'roupas', 'veiculos'];
    const names = {
      animais: ['Cachorro', 'Gatinho', 'Passarinho'],
      alimentos: ['Maçã', 'Banana', 'Pãozinho'],
      roupas: ['Chinelo', 'Camiseta', 'Meia'],
      veiculos: ['Carrinho', 'Bicicleta', 'Ônibus']
    };

    for (let i = 0; i < count; i++) {
      const cat = cats[i % cats.length];
      const subname = names[cat][i % names[cat].length];
      items.push({
        id: `item-${cat}-${i}`,
        name: subname,
        rule: 'categoria',
        attributeValue: cat,
        color: CATEGORIES[cat].color,
        category: cat,
        material: 'papel',
        svgIcon: svgData(`
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="18" width="64" height="64" rx="14" fill="${CATEGORIES[cat].color}"/>
            <circle cx="50" cy="50" r="18" fill="#FFF" opacity="0.9"/>
            <text x="50" y="56" font-size="20" text-anchor="middle">🏷️</text>
          </svg>
        `)
      });
    }
  } else {
    // Função
    items.push({
      id: 'item-funcao-comer-1',
      name: 'Colher',
      rule: 'funcao',
      attributeValue: 'comer',
      color: '#ADB5BD',
      material: 'plastico',
      svgIcon: svgData(`
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="36" rx="14" ry="18" fill="#ADB5BD"/>
          <line x1="50" y1="52" x2="50" y2="82" stroke="#6C757D" stroke-width="6"/>
        </svg>
      `)
    });
  }

  // Shuffle items
  return items.sort(() => 0.5 - Math.random());
}

// Generate Potes / Bins definitions for a given rule
export function generateBinsForRule(rule: ClassificationRule): BinDefinition[] {
  if (rule === 'cor') {
    return [
      { id: 'bin-vermelho', binIndex: 0, label: 'Vermelho', attributeValue: 'vermelho', samplePattern: 'liso', color: '#E63946' },
      { id: 'bin-azul', binIndex: 1, label: 'Azul', attributeValue: 'azul', samplePattern: 'listrado', color: '#1D3557' },
      { id: 'bin-amarelo', binIndex: 2, label: 'Amarelo', attributeValue: 'amarelo', samplePattern: 'pontilhado', color: '#FFB703' }
    ];
  } else if (rule === 'forma') {
    return [
      { id: 'bin-circulo', binIndex: 0, label: 'Círculo', attributeValue: 'circulo', samplePattern: 'circulo', color: '#0E8388' },
      { id: 'bin-quadrado', binIndex: 1, label: 'Quadrado', attributeValue: 'quadrado', samplePattern: 'quadrado', color: '#E76F51' },
      { id: 'bin-triangulo', binIndex: 2, label: 'Triângulo', attributeValue: 'triangulo', samplePattern: 'triangulo', color: '#F4A261' }
    ];
  } else if (rule === 'tamanho') {
    return [
      { id: 'bin-grande', binIndex: 0, label: 'Grande', attributeValue: 'grande', samplePattern: 'grande', color: '#2D6A4F' },
      { id: 'bin-pequeno', binIndex: 1, label: 'Pequeno', attributeValue: 'pequeno', samplePattern: 'pequeno', color: '#52B788' }
    ];
  } else {
    return [
      { id: 'bin-animais', binIndex: 0, label: 'Animais', attributeValue: 'animais', samplePattern: 'animais', color: '#D4A373' },
      { id: 'bin-alimentos', binIndex: 1, label: 'Comidas', attributeValue: 'alimentos', samplePattern: 'alimentos', color: '#E63946' },
      { id: 'bin-veiculos', binIndex: 2, label: 'Veículos', attributeValue: 'veiculos', samplePattern: 'veiculos', color: '#457B9D' }
    ];
  }
}

// Balance bin positions across blocks: never same position in > 2 consecutive blocks
export class BinPositionManager {
  private lastOrder: string = '';
  private secondLastOrder: string = '';

  public shuffleBins(bins: BinDefinition[]): BinDefinition[] {
    if (bins.length <= 1) return bins;

    let candidate = [...bins];
    let attempts = 0;

    while (attempts < 20) {
      attempts++;
      candidate = [...bins].sort(() => 0.5 - Math.random());
      const orderKey = candidate.map(b => b.id).join('-');

      const isConsecutive3 =
        orderKey === this.lastOrder && orderKey === this.secondLastOrder;

      if (!isConsecutive3) {
        this.secondLastOrder = this.lastOrder;
        this.lastOrder = orderKey;
        // Re-assign binIndex based on physical position in row
        return candidate.map((b, idx) => ({ ...b, binIndex: idx }));
      }
    }

    return candidate.map((b, idx) => ({ ...b, binIndex: idx }));
  }
}
