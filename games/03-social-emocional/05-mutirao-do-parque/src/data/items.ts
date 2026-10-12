import { ItemDef } from '../types';

export const ALL_ITEMS: Record<string, ItemDef> = {
  item_pa: {
    id: 'item_pa',
    name: 'Pá de Jardim',
    category: 'ferramenta',
    icon: 'Spade',
    color: '#B46D4F'
  },
  item_regador: {
    id: 'item_regador',
    name: 'Regador Cheio',
    category: 'ferramenta',
    icon: 'Droplet',
    color: '#4F8198'
  },
  item_pincel: {
    id: 'item_pincel',
    name: 'Pincel de Cerdas',
    category: 'ferramenta',
    icon: 'Paintbrush',
    color: '#D9A441'
  },
  item_rolo_pintura: {
    id: 'item_rolo_pintura',
    name: 'Rolo de Pintura',
    category: 'ferramenta',
    icon: 'Paintbrush',
    color: '#4F8198'
  },
  item_martelo: {
    id: 'item_martelo',
    name: 'Martelo Firme',
    category: 'ferramenta',
    icon: 'Hammer',
    color: '#283033'
  },
  item_chave_inglesa: {
    id: 'item_chave_inglesa',
    name: 'Chave Inglesa',
    category: 'ferramenta',
    icon: 'Wrench',
    color: '#4F8198'
  },
  item_alicate: {
    id: 'item_alicate',
    name: 'Alicate Universal',
    category: 'ferramenta',
    icon: 'Scissors',
    color: '#283033'
  },
  item_vassoura: {
    id: 'item_vassoura',
    name: 'Vassoura de Alambrada',
    category: 'ferramenta',
    icon: 'Brush',
    color: '#B46D4F'
  },
  item_rede_lago: {
    id: 'item_rede_lago',
    name: 'Rede Limpadora',
    category: 'ferramenta',
    icon: 'Waves',
    color: '#5E8C61'
  },

  // Mudas
  item_muda_ipe: {
    id: 'item_muda_ipe',
    name: 'Muda de Ipê-Amarelo',
    category: 'muda',
    icon: 'Sprout',
    color: '#D9A441',
    consumable: true
  },
  item_muda_girassol: {
    id: 'item_muda_girassol',
    name: 'Sementes de Girassol',
    category: 'muda',
    icon: 'Sun',
    color: '#D9A441',
    consumable: true
  },
  item_muda_ervas: {
    id: 'item_muda_ervas',
    name: 'Mudas de Ervas Medicinais',
    category: 'muda',
    icon: 'Leaf',
    color: '#5E8C61',
    consumable: true
  },
  item_muda_arbusto: {
    id: 'item_muda_arbusto',
    name: 'Arbusto Nativo',
    category: 'muda',
    icon: 'Flower2',
    color: '#5E8C61',
    consumable: true
  },

  // Tintas
  item_tinta_terracota: {
    id: 'item_tinta_terracota',
    name: 'Lata de Tinta Terracota',
    category: 'tinta',
    icon: 'PaintBucket',
    color: '#B46D4F',
    consumable: true
  },
  item_tinta_azul: {
    id: 'item_tinta_azul',
    name: 'Lata de Tinta Azul Céu',
    category: 'tinta',
    icon: 'PaintBucket',
    color: '#4F8198',
    consumable: true
  },
  item_tinta_amarela: {
    id: 'item_tinta_amarela',
    name: 'Lata de Tinta Amarela',
    category: 'tinta',
    icon: 'PaintBucket',
    color: '#D9A441',
    consumable: true
  },
  item_tinta_branca: {
    id: 'item_tinta_branca',
    name: 'Tinta Branca Antiderrapante',
    category: 'tinta',
    icon: 'PaintBucket',
    color: '#E8DCC8',
    consumable: true
  },

  // Materiais
  item_parafusos: {
    id: 'item_parafusos',
    name: 'Caixa de Parafusos Inox',
    category: 'material',
    icon: 'Disc',
    color: '#283033',
    consumable: true
  },
  item_tabua_madeira: {
    id: 'item_tabua_madeira',
    name: 'Tábua de Madeira Nobre',
    category: 'material',
    icon: 'Box',
    color: '#B46D4F',
    consumable: true
  },
  item_veda_rosca: {
    id: 'item_veda_rosca',
    name: 'Fita Veda-Rosca',
    category: 'material',
    icon: 'Layers',
    color: '#E8DCC8',
    consumable: true
  },
  item_abracadeiras: {
    id: 'item_abracadeiras',
    name: 'Abraçadeiras de Aço',
    category: 'material',
    icon: 'Shield',
    color: '#4F8198',
    consumable: true
  },
  item_poste_solar: {
    id: 'item_poste_solar',
    name: 'Luminária Fotovoltaica',
    category: 'material',
    icon: 'Lamp',
    color: '#D9A441',
    consumable: true
  },
  item_cordao_led: {
    id: 'item_cordao_led',
    name: 'Cordão de Micro LED',
    category: 'material',
    icon: 'Sparkles',
    color: '#D9A441',
    consumable: true
  },
  item_boia_solar: {
    id: 'item_boia_solar',
    name: 'Boia Luminosa Solar',
    category: 'material',
    icon: 'SunMedium',
    color: '#4F8198',
    consumable: true
  },
  item_tampo_mesa: {
    id: 'item_tampo_mesa',
    name: 'Tampo de Piquenique',
    category: 'material',
    icon: 'Square',
    color: '#B46D4F',
    consumable: true
  },
  item_cavalete: {
    id: 'item_cavalete',
    name: 'Cavalete Estrutural',
    category: 'material',
    icon: 'Triangle',
    color: '#B46D4F',
    consumable: true
  },
  item_placa_tatel: {
    id: 'item_placa_tatel',
    name: 'Placa Braille Acessível',
    category: 'material',
    icon: 'Compass',
    color: '#4F8198',
    consumable: true
  },
  item_balde_compostagem: {
    id: 'item_balde_compostagem',
    name: 'Balde de Folhas Orgânicas',
    category: 'material',
    icon: 'Trash2',
    color: '#5E8C61',
    consumable: true
  },
  item_estrado_madeira: {
    id: 'item_estrado_madeira',
    name: 'Estrado Modular de Palco',
    category: 'material',
    icon: 'Columns',
    color: '#B46D4F',
    consumable: true
  },
  item_cabo_som: {
    id: 'item_cabo_som',
    name: 'Cabo Acústico Blindado',
    category: 'material',
    icon: 'Volume2',
    color: '#283033',
    consumable: true
  },
  item_modulo_lixeira: {
    id: 'item_modulo_lixeira',
    name: 'Módulo Quádruplo Seletivo',
    category: 'material',
    icon: 'Recycle',
    color: '#5E8C61',
    consumable: true
  },
  item_adesivos_reciclagem: {
    id: 'item_adesivos_reciclagem',
    name: 'Cartela de Adesivos Seletivos',
    category: 'material',
    icon: 'Bookmark',
    color: '#D9A441',
    consumable: true
  },
  item_carrinho: {
    id: 'item_carrinho',
    name: 'Carrinho de Mão',
    category: 'especial',
    icon: 'ShoppingCart',
    color: '#B46D4F'
  }
};
