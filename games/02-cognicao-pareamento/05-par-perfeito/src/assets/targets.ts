import type { TargetItem } from '../types';

// Helper to encode SVG into safe data URI or SVG string
const svgData = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

// Generator helpers for realistic 'foto', paper-cut 'ilustracao', and 6px stroke 'picto'
interface ItemDef {
  id: string;
  name: string;
  category: TargetItem['category'];
  color: string;
  desc: string;
  renderFoto: (c: string) => string;
  renderIlustracao: (c: string) => string;
  renderPicto: () => string;
}

const itemDefs: ItemDef[] = [
  // --- ALIMENTOS (10) ---
  {
    id: 'pao-frances',
    name: 'Pão Francês',
    category: 'alimentos',
    color: '#D4A373',
    desc: 'Pão francês brasileiro de casca crocante',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pf-g" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFE8D6"/>
            <stop offset="60%" stop-color="#D4A373"/>
            <stop offset="100%" stop-color="#A9714B"/>
          </radialGradient>
          <filter id="pf-s"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.25"/></filter>
        </defs>
        <ellipse cx="50" cy="50" rx="42" ry="24" fill="url(#pf-g)" filter="url(#pf-s)"/>
        <path d="M 22 47 Q 50 36 78 47 Q 50 42 22 47" fill="#8B4513" opacity="0.85"/>
        <path d="M 28 44 Q 50 38 72 44" stroke="#FFF" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="50" rx="40" ry="22" fill="#E6BE8A"/>
        <path d="M 12 50 Q 50 68 88 50 Q 50 56 12 50" fill="#C68B59"/>
        <path d="M 24 45 Q 50 38 76 45" stroke="#7F4F24" stroke-width="3" stroke-linecap="round"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="50" cy="50" rx="38" ry="22"/>
        <path d="M 24 48 Q 50 40 76 48"/>
      </svg>`
  },
  {
    id: 'banana',
    name: 'Banana',
    category: 'alimentos',
    color: '#FFD166',
    desc: 'Banana madura amarela',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bn-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E9D8A6"/>
            <stop offset="40%" stop-color="#FFD166"/>
            <stop offset="90%" stop-color="#E76F51"/>
          </linearGradient>
        </defs>
        <path d="M 20 70 Q 30 25 78 26 Q 72 32 70 36 Q 38 34 26 72 Z" fill="url(#bn-g)"/>
        <path d="M 78 26 L 84 22 L 82 28 Z" fill="#6B705C"/>
        <path d="M 20 70 L 16 75 L 23 74 Z" fill="#6B705C"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 22 68 Q 32 26 78 26 Q 70 38 66 42 Q 38 40 28 72 Z" fill="#FFCA3A"/>
        <path d="M 28 72 Q 38 40 66 42 Q 40 50 28 72 Z" fill="#F4A261"/>
        <rect x="76" y="22" width="6" height="5" rx="2" fill="#588157"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 20 70 Q 30 25 80 26 Q 60 45 20 70 Z"/>
        <line x1="80" y1="26" x2="86" y2="20"/>
      </svg>`
  },
  {
    id: 'maca',
    name: 'Maçã',
    category: 'alimentos',
    color: '#E63946',
    desc: 'Maçã vermelha fresca com folha verde',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mc-g" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FF758F"/>
            <stop offset="60%" stop-color="#E63946"/>
            <stop offset="100%" stop-color="#9B2226"/>
          </radialGradient>
        </defs>
        <path d="M 50 32 C 38 20 18 28 18 52 C 18 78 40 85 50 82 C 60 85 82 78 82 52 C 82 28 62 20 50 32 Z" fill="url(#mc-g)"/>
        <path d="M 50 32 Q 53 18 58 14" stroke="#6F4E37" stroke-width="4" stroke-linecap="round" fill="none"/>
        <ellipse cx="62" cy="22" rx="7" ry="4" transform="rotate(-25 62 22)" fill="#52B788"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 50 32 C 38 22 20 28 20 52 C 20 78 42 84 50 82 C 58 84 80 78 80 52 C 80 28 62 22 50 32 Z" fill="#E63946"/>
        <path d="M 50 82 C 58 84 80 78 80 52 C 80 40 74 34 66 32 C 54 50 48 70 50 82 Z" fill="#BA181B"/>
        <path d="M 50 32 L 54 18" stroke="#4A3525" stroke-width="4" stroke-linecap="round"/>
        <circle cx="62" cy="24" r="6" fill="#2D6A4F"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 50 32 C 38 20 18 28 18 52 C 18 78 40 84 50 82 C 60 84 82 78 82 52 C 82 28 62 20 50 32 Z"/>
        <path d="M 50 32 Q 54 20 58 16"/>
        <path d="M 54 24 Q 68 20 66 28 Q 58 30 54 24 Z"/>
      </svg>`
  },
  {
    id: 'melancia',
    name: 'Melancia',
    category: 'alimentos',
    color: '#E63946',
    desc: 'Fatia triangular de melancia',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 18 78 Q 50 92 82 78 L 50 20 Z" fill="#E63946"/>
        <path d="M 16 80 Q 50 96 84 80" stroke="#2D6A4F" stroke-width="6" fill="none"/>
        <circle cx="44" cy="52" r="2.5" fill="#1E252B"/>
        <circle cx="56" cy="54" r="2.5" fill="#1E252B"/>
        <circle cx="50" cy="68" r="2.5" fill="#1E252B"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 76 Q 50 90 80 76 L 50 24 Z" fill="#FF4D6D"/>
        <path d="M 18 78 Q 50 94 82 78" stroke="#40916C" stroke-width="7" fill="none"/>
        <circle cx="45" cy="55" r="2" fill="#1E252B"/>
        <circle cx="55" cy="55" r="2" fill="#1E252B"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 20 76 Q 50 92 80 76 L 50 22 Z"/>
        <path d="M 20 76 Q 50 92 80 76"/>
        <circle cx="50" cy="58" r="1" fill="#1E252B"/>
      </svg>`
  },
  {
    id: 'queijo',
    name: 'Queijo',
    category: 'alimentos',
    color: '#FFB703',
    desc: 'Pedaço triangular de queijo com furinhos',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 70 L 78 70 L 64 36 L 20 52 Z" fill="#FFB703"/>
        <polygon points="20,52 64,36 82,44 38,60" fill="#FFD166"/>
        <polygon points="82,44 78,70 64,36" fill="#FB8500"/>
        <circle cx="38" cy="62" r="4" fill="#FB8500" opacity="0.6"/>
        <circle cx="55" cy="58" r="6" fill="#FB8500" opacity="0.6"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 70 L 78 70 L 64 36 L 20 52 Z" fill="#FFB703"/>
        <circle cx="42" cy="62" r="5" fill="#E08B00"/>
        <circle cx="58" cy="56" r="4" fill="#E08B00"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 20 70 L 80 70 L 64 36 L 20 52 Z"/>
        <circle cx="40" cy="62" r="3" fill="#1E252B"/>
        <circle cx="60" cy="56" r="4" fill="#1E252B"/>
      </svg>`
  },
  {
    id: 'biscoito',
    name: 'Biscoito',
    category: 'alimentos',
    color: '#DDA15E',
    desc: 'Biscoito redondinho crocante',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="34" fill="#DDA15E"/>
        <circle cx="40" cy="40" r="3" fill="#7F4F24"/>
        <circle cx="60" cy="42" r="3.5" fill="#7F4F24"/>
        <circle cx="46" cy="56" r="3" fill="#7F4F24"/>
        <circle cx="62" cy="62" r="3" fill="#7F4F24"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="32" fill="#BC6C25"/>
        <circle cx="48" cy="48" r="28" fill="#DDA15E"/>
        <circle cx="42" cy="42" r="3" fill="#603813"/>
        <circle cx="58" cy="50" r="3" fill="#603813"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <circle cx="50" cy="50" r="32"/>
        <circle cx="42" cy="42" r="2" fill="#1E252B"/>
        <circle cx="58" cy="44" r="2" fill="#1E252B"/>
        <circle cx="48" cy="58" r="2" fill="#1E252B"/>
      </svg>`
  },
  {
    id: 'cenoura',
    name: 'Cenoura',
    category: 'alimentos',
    color: '#F77F00',
    desc: 'Cenoura laranja fresca com rama verde',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 68 28 L 26 84 Q 22 86 24 82 L 48 24 Q 58 20 68 28 Z" fill="#F77F00"/>
        <path d="M 65 24 L 78 12 M 62 20 L 72 8 M 58 24 L 62 10" stroke="#2D6A4F" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="68,26 24,84 48,22" fill="#F77F00"/>
        <polygon points="68,26 46,55 48,22" fill="#D62828"/>
        <path d="M 62 20 L 74 12 M 56 22 L 64 8" stroke="#52B788" stroke-width="5" stroke-linecap="round"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 68 28 L 24 84 L 48 24 Z"/>
        <path d="M 60 22 L 72 12"/>
      </svg>`
  },
  {
    id: 'tomate',
    name: 'Tomate',
    category: 'alimentos',
    color: '#D62828',
    desc: 'Tomate vermelho redondo maduro',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="54" r="32" fill="#D62828"/>
        <path d="M 50 24 L 50 18 M 50 24 L 42 20 M 50 24 L 58 20 M 50 24 L 44 28 M 50 24 L 56 28" stroke="#2D6A4F" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="54" r="30" fill="#E63946"/>
        <circle cx="58" cy="58" r="22" fill="#9B2226"/>
        <polygon points="50,22 44,26 50,16 56,26" fill="#40916C"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="54" r="30"/>
        <path d="M 50 24 L 50 16 M 44 22 L 56 26"/>
      </svg>`
  },
  {
    id: 'morango',
    name: 'Morango',
    category: 'alimentos',
    color: '#E63946',
    desc: 'Morango vermelho com sementinhas',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 28 34 C 20 54 36 78 50 86 C 64 78 80 54 72 34 C 64 26 36 26 28 34 Z" fill="#E63946"/>
        <circle cx="40" cy="46" r="1.5" fill="#FFF"/>
        <circle cx="60" cy="46" r="1.5" fill="#FFF"/>
        <circle cx="50" cy="62" r="1.5" fill="#FFF"/>
        <path d="M 50 26 L 40 20 M 50 26 L 60 20 M 50 26 L 50 16" stroke="#2D6A4F" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 30 36 C 22 54 38 78 50 84 C 62 78 78 54 70 36 Z" fill="#D62828"/>
        <polygon points="50,22 42,28 50,32 58,28" fill="#52B788"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 30 36 C 22 54 38 78 50 84 C 62 78 78 54 70 36 Z"/>
        <path d="M 44 26 L 56 26"/>
      </svg>`
  },
  {
    id: 'ovo',
    name: 'Ovo Cozido',
    category: 'alimentos',
    color: '#F4A261',
    desc: 'Metade de ovo cozido mostrando gema amarela',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="52" rx="36" ry="26" fill="#F8F9FA" stroke="#E9ECEF" stroke-width="2"/>
        <circle cx="50" cy="52" r="15" fill="#FFB703"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="52" rx="34" ry="25" fill="#EDEDE9"/>
        <circle cx="50" cy="52" r="14" fill="#FB8500"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <ellipse cx="50" cy="52" rx="34" ry="25"/>
        <circle cx="50" cy="52" r="13"/>
      </svg>`
  },

  // --- ANIMAIS (10) ---
  {
    id: 'cachorro',
    name: 'Cachorro Vira-lata',
    category: 'animais',
    color: '#D4A373',
    desc: 'Cachorrinho caramelo dócil',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="28" fill="#D4A373"/>
        <ellipse cx="26" cy="46" rx="8" ry="16" fill="#A9714B"/>
        <ellipse cx="74" cy="46" rx="8" ry="16" fill="#A9714B"/>
        <circle cx="40" cy="46" r="3.5" fill="#1E252B"/>
        <circle cx="60" cy="46" r="3.5" fill="#1E252B"/>
        <ellipse cx="50" cy="58" rx="6" ry="4" fill="#1E252B"/>
        <path d="M 50 62 L 50 68 M 46 66 Q 50 70 54 66" stroke="#1E252B" stroke-width="2" fill="none"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="52" r="26" fill="#E09F3E"/>
        <polygon points="24,36 18,60 30,52" fill="#9E2A2B"/>
        <polygon points="76,36 82,60 70,52" fill="#9E2A2B"/>
        <circle cx="42" cy="48" r="3" fill="#1E252B"/>
        <circle cx="58" cy="48" r="3" fill="#1E252B"/>
        <polygon points="46,56 54,56 50,62" fill="#1E252B"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="52" r="26"/>
        <path d="M 28 40 L 20 60 L 30 52"/>
        <path d="M 72 40 L 80 60 L 70 52"/>
        <circle cx="42" cy="48" r="2" fill="#1E252B"/>
        <circle cx="58" cy="48" r="2" fill="#1E252B"/>
        <circle cx="50" cy="58" r="3" fill="#1E252B"/>
      </svg>`
  },
  {
    id: 'gato',
    name: 'Gato',
    category: 'animais',
    color: '#6C757D',
    desc: 'Gatinho com orelhas pontudas e bigodes',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="54" r="26" fill="#ADB5BD"/>
        <polygon points="28,40 32,18 46,34" fill="#6C757D"/>
        <polygon points="72,40 68,18 54,34" fill="#6C757D"/>
        <circle cx="41" cy="50" r="3.5" fill="#2D6A4F"/>
        <circle cx="59" cy="50" r="3.5" fill="#2D6A4F"/>
        <polygon points="47,58 53,58 50,62" fill="#F4A261"/>
        <line x1="22" y1="58" x2="36" y2="58" stroke="#1E252B" stroke-width="2"/>
        <line x1="64" y1="58" x2="78" y2="58" stroke="#1E252B" stroke-width="2"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="54" r="25" fill="#495057"/>
        <polygon points="28,40 32,20 46,34" fill="#343A40"/>
        <polygon points="72,40 68,20 54,34" fill="#343A40"/>
        <circle cx="42" cy="52" r="3" fill="#FFB703"/>
        <circle cx="58" cy="52" r="3" fill="#FFB703"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="54" r="25"/>
        <path d="M 30 38 L 32 20 L 46 34"/>
        <path d="M 70 38 L 68 20 L 54 34"/>
        <circle cx="42" cy="52" r="2" fill="#1E252B"/>
        <circle cx="58" cy="52" r="2" fill="#1E252B"/>
      </svg>`
  },
  {
    id: 'passaro',
    name: 'Pássaro',
    category: 'animais',
    color: '#0E8388',
    desc: 'Pássaro azul-petróleo cantando',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="46" cy="52" rx="24" ry="18" fill="#0E8388"/>
        <circle cx="62" cy="42" r="14" fill="#2E8B57"/>
        <polygon points="74,42 88,44 74,48" fill="#F4A261"/>
        <circle cx="66" cy="38" r="2.5" fill="#1E252B"/>
        <path d="M 22 56 L 10 50 L 16 64 Z" fill="#0E8388"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="48" cy="52" rx="22" ry="16" fill="#2A9D8F"/>
        <circle cx="64" cy="42" r="12" fill="#264653"/>
        <polygon points="76,42 86,44 76,48" fill="#E76F51"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="48" cy="52" rx="22" ry="16"/>
        <path d="M 68 44 L 84 44"/>
        <circle cx="62" cy="42" r="2" fill="#1E252B"/>
      </svg>`
  },
  {
    id: 'peixe',
    name: 'Peixe',
    category: 'animais',
    color: '#2A9D8F',
    desc: 'Peixe nadando na água',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="52" cy="50" rx="28" ry="18" fill="#2A9D8F"/>
        <polygon points="24,50 12,34 12,66" fill="#E76F51"/>
        <circle cx="66" cy="46" r="3" fill="#1E252B"/>
        <path d="M 44 42 Q 52 50 44 58" stroke="#FFF" stroke-width="2" fill="none"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="54" cy="50" rx="26" ry="16" fill="#0E8388"/>
        <polygon points="28,50 14,36 14,64" fill="#F4A261"/>
        <circle cx="68" cy="46" r="3" fill="#FFF"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="54" cy="50" rx="26" ry="16"/>
        <polygon points="28,50 14,36 14,64"/>
        <circle cx="68" cy="46" r="2" fill="#1E252B"/>
      </svg>`
  },
  {
    id: 'borboleta',
    name: 'Borboleta',
    category: 'animais',
    color: '#9B5DE5',
    desc: 'Borboleta de asas roxas',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="40" rx="16" ry="14" fill="#9B5DE5"/>
        <ellipse cx="68" cy="40" rx="16" ry="14" fill="#9B5DE5"/>
        <ellipse cx="36" cy="62" rx="12" ry="12" fill="#F15BB5"/>
        <ellipse cx="64" cy="62" rx="12" ry="12" fill="#F15BB5"/>
        <line x1="50" y1="26" x2="50" y2="74" stroke="#1E252B" stroke-width="5" stroke-linecap="round"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,46 22,26 26,62" fill="#7209B7"/>
        <polygon points="50,46 78,26 74,62" fill="#7209B7"/>
        <line x1="50" y1="30" x2="50" y2="70" stroke="#1E252B" stroke-width="4"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 50 48 Q 20 20 24 54 Q 30 70 50 56"/>
        <path d="M 50 48 Q 80 20 76 54 Q 70 70 50 56"/>
        <line x1="50" y1="28" x2="50" y2="72"/>
      </svg>`
  },
  {
    id: 'tartaruga',
    name: 'Tartaruga',
    category: 'animais',
    color: '#2D6A4F',
    desc: 'Tartaruguinha com casco verde',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="52" rx="24" ry="18" fill="#2D6A4F"/>
        <circle cx="76" cy="52" r="8" fill="#52B788"/>
        <circle cx="78" cy="50" r="1.5" fill="#1E252B"/>
        <ellipse cx="38" cy="34" rx="6" ry="4" fill="#52B788"/>
        <ellipse cx="62" cy="34" rx="6" ry="4" fill="#52B788"/>
        <ellipse cx="38" cy="70" rx="6" ry="4" fill="#52B788"/>
        <ellipse cx="62" cy="70" rx="6" ry="4" fill="#52B788"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="52" rx="22" ry="16" fill="#1B4332"/>
        <circle cx="74" cy="52" r="7" fill="#40916C"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <ellipse cx="50" cy="52" rx="22" ry="16"/>
        <circle cx="74" cy="52" r="6"/>
      </svg>`
  },
  {
    id: 'cavalo',
    name: 'Cavalo',
    category: 'animais',
    color: '#8D5B4C',
    desc: 'Cavalo marrom com crina',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 28 76 L 36 44 L 62 40 L 74 60 L 66 66 L 52 54 L 46 76 Z" fill="#8D5B4C"/>
        <polygon points="36,44 42,28 48,42" fill="#5E3023"/>
        <circle cx="64" cy="48" r="2.5" fill="#1E252B"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="28,76 38,40 64,38 72,58 64,64 48,76" fill="#7F4F24"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 30 76 L 40 40 L 64 38 L 72 58 L 64 64 L 48 76 Z"/>
      </svg>`
  },
  {
    id: 'sapo',
    name: 'Sapo',
    category: 'animais',
    color: '#52B788',
    desc: 'Sapo verde de olhos grandes',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="58" rx="26" ry="18" fill="#52B788"/>
        <circle cx="36" cy="40" r="10" fill="#52B788"/>
        <circle cx="64" cy="40" r="10" fill="#52B788"/>
        <circle cx="36" cy="40" r="4" fill="#1E252B"/>
        <circle cx="64" cy="40" r="4" fill="#1E252B"/>
        <path d="M 36 62 Q 50 72 64 62" stroke="#1E252B" stroke-width="3" fill="none"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="58" rx="24" ry="16" fill="#2D6A4F"/>
        <circle cx="38" cy="42" r="8" fill="#40916C"/>
        <circle cx="62" cy="42" r="8" fill="#40916C"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <ellipse cx="50" cy="58" rx="24" ry="16"/>
        <circle cx="38" cy="42" r="7"/>
        <circle cx="62" cy="42" r="7"/>
      </svg>`
  },
  {
    id: 'coelho',
    name: 'Coelho',
    category: 'animais',
    color: '#E9ECEF',
    desc: 'Coelho branquinho de orelhas compridas',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="62" r="22" fill="#E9ECEF"/>
        <ellipse cx="40" cy="30" rx="6" ry="18" fill="#E9ECEF"/>
        <ellipse cx="40" cy="30" rx="3" ry="12" fill="#FFB4A2"/>
        <ellipse cx="60" cy="30" rx="6" ry="18" fill="#E9ECEF"/>
        <ellipse cx="60" cy="30" rx="3" ry="12" fill="#FFB4A2"/>
        <circle cx="43" cy="58" r="3" fill="#1E252B"/>
        <circle cx="57" cy="58" r="3" fill="#1E252B"/>
        <polygon points="48,64 52,64 50,67" fill="#E56B6F"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="62" r="20" fill="#CED4DA"/>
        <ellipse cx="42" cy="32" rx="5" ry="16" fill="#CED4DA"/>
        <ellipse cx="58" cy="32" rx="5" ry="16" fill="#CED4DA"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <circle cx="50" cy="62" r="20"/>
        <ellipse cx="42" cy="32" rx="5" ry="16"/>
        <ellipse cx="58" cy="32" rx="5" ry="16"/>
      </svg>`
  },
  {
    id: 'elefante',
    name: 'Elefante',
    category: 'animais',
    color: '#6C757D',
    desc: 'Elefante simpático com tromba curvada',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="50" r="24" fill="#6C757D"/>
        <circle cx="28" cy="46" r="14" fill="#495057"/>
        <path d="M 64 52 Q 78 52 74 68 Q 72 74 68 70" stroke="#6C757D" stroke-width="7" stroke-linecap="round" fill="none"/>
        <circle cx="58" cy="44" r="3" fill="#1E252B"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="50" r="22" fill="#495057"/>
        <path d="M 62 52 Q 76 52 72 68" stroke="#495057" stroke-width="6" stroke-linecap="round" fill="none"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <circle cx="48" cy="50" r="22"/>
        <path d="M 62 52 Q 76 52 72 68"/>
      </svg>`
  },

  // --- BRINQUEDOS (10) ---
  {
    id: 'bola',
    name: 'Bola de Futebol',
    category: 'brinquedos',
    color: '#F8F9FA',
    desc: 'Bola de futebol com gomos',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="32" fill="#F8F9FA" stroke="#DEE2E6" stroke-width="2"/>
        <polygon points="50,42 58,48 55,58 45,58 42,48" fill="#1E252B"/>
        <line x1="50" y1="42" x2="50" y2="28" stroke="#1E252B" stroke-width="3"/>
        <line x1="58" y1="48" x2="72" y2="44" stroke="#1E252B" stroke-width="3"/>
        <line x1="55" y1="58" x2="68" y2="68" stroke="#1E252B" stroke-width="3"/>
        <line x1="45" y1="58" x2="32" y2="68" stroke="#1E252B" stroke-width="3"/>
        <line x1="42" y1="48" x2="28" y2="44" stroke="#1E252B" stroke-width="3"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="30" fill="#E9ECEF"/>
        <polygon points="50,42 58,48 55,58 45,58 42,48" fill="#212529"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="50" r="30"/>
        <polygon points="50,42 58,48 55,58 45,58 42,48"/>
      </svg>`
  },
  {
    id: 'carrinho',
    name: 'Carrinho',
    category: 'brinquedos',
    color: '#E63946',
    desc: 'Carrinho de brinquedo vermelho',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 62 L 20 54 Q 22 48 30 48 L 40 48 L 48 34 L 72 34 L 78 48 L 84 50 Q 88 52 88 58 L 88 62 Z" fill="#E63946"/>
        <circle cx="34" cy="64" r="8" fill="#1E252B"/>
        <circle cx="34" cy="64" r="3" fill="#FFF"/>
        <circle cx="74" cy="64" r="8" fill="#1E252B"/>
        <circle cx="74" cy="64" r="3" fill="#FFF"/>
        <rect x="52" y="38" width="16" height="8" rx="2" fill="#A8DADC"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="20,62 30,46 75,46 86,62" fill="#D62828"/>
        <circle cx="34" cy="64" r="7" fill="#2B2D42"/>
        <circle cx="72" cy="64" r="7" fill="#2B2D42"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 20 62 L 30 46 L 75 46 L 86 62 Z"/>
        <circle cx="34" cy="64" r="6"/>
        <circle cx="72" cy="64" r="6"/>
      </svg>`
  },
  {
    id: 'urso',
    name: 'Urso de Pelúcia',
    category: 'brinquedos',
    color: '#936639',
    desc: 'Ursinho fofo de pelúcia',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="54" r="22" fill="#A68A64"/>
        <circle cx="34" cy="36" r="8" fill="#7F4F24"/>
        <circle cx="66" cy="36" r="8" fill="#7F4F24"/>
        <circle cx="43" cy="50" r="2.5" fill="#1E252B"/>
        <circle cx="57" cy="50" r="2.5" fill="#1E252B"/>
        <ellipse cx="50" cy="58" rx="6" ry="4" fill="#E6CCB2"/>
        <circle cx="50" cy="57" r="2" fill="#1E252B"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="54" r="20" fill="#7F4F24"/>
        <circle cx="34" cy="38" r="6" fill="#582F0E"/>
        <circle cx="66" cy="38" r="6" fill="#582F0E"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <circle cx="50" cy="54" r="20"/>
        <circle cx="34" cy="38" r="6"/>
        <circle cx="66" cy="38" r="6"/>
      </svg>`
  },
  {
    id: 'pipa',
    name: 'Pipa',
    category: 'brinquedos',
    color: '#FFB703',
    desc: 'Pipa de papel colorida no céu com rabiola',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,16 76,46 50,76 24,46" fill="#FFB703"/>
        <polygon points="50,16 76,46 50,46" fill="#FB8500"/>
        <polygon points="50,46 50,76 24,46" fill="#2A9D8F"/>
        <line x1="50" y1="16" x2="50" y2="76" stroke="#1E252B" stroke-width="2"/>
        <line x1="24" y1="46" x2="76" y2="46" stroke="#1E252B" stroke-width="2"/>
        <path d="M 50 76 Q 44 86 52 92" stroke="#1E252B" stroke-width="2" fill="none"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,16 76,46 50,76 24,46" fill="#E76F51"/>
        <polygon points="50,16 50,76 24,46" fill="#F4A261"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="50,16 76,46 50,76 24,46"/>
        <line x1="50" y1="16" x2="50" y2="76"/>
      </svg>`
  },
  {
    id: 'piao',
    name: 'Pião',
    category: 'brinquedos',
    color: '#457B9D',
    desc: 'Pião de madeira com ponta de metal',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 28 36 Q 50 30 72 36 L 50 82 Z" fill="#457B9D"/>
        <rect x="47" y="20" width="6" height="12" rx="2" fill="#E76F51"/>
        <line x1="50" y1="82" x2="50" y2="88" stroke="#1E252B" stroke-width="3"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="28,36 72,36 50,82" fill="#1D3557"/>
        <rect x="47" y="22" width="6" height="14" fill="#E63946"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="28,36 72,36 50,82"/>
        <line x1="50" y1="24" x2="50" y2="36"/>
      </svg>`
  },
  {
    id: 'blocos',
    name: 'Bloco de Montar',
    category: 'brinquedos',
    color: '#0E8388',
    desc: 'Bloco de plástico de encaixe tipo lego',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="42" width="50" height="32" rx="4" fill="#0E8388"/>
        <rect x="33" y="34" width="12" height="8" rx="2" fill="#2E8B57"/>
        <rect x="55" y="34" width="12" height="8" rx="2" fill="#2E8B57"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="26" y="44" width="48" height="30" fill="#2A9D8F"/>
        <rect x="34" y="36" width="10" height="8" fill="#264653"/>
        <rect x="56" y="36" width="10" height="8" fill="#264653"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="26" y="44" width="48" height="30" rx="3"/>
        <path d="M 34 44 L 34 36 L 44 36 L 44 44"/>
        <path d="M 56 44 L 56 36 L 66 36 L 66 44"/>
      </svg>`
  },
  {
    id: 'boneca',
    name: 'Boneca',
    category: 'brinquedos',
    color: '#F4A261',
    desc: 'Bonequinha de pano alegre',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="38" r="14" fill="#F4A261"/>
        <polygon points="50,52 30,82 70,82" fill="#E76F51"/>
        <circle cx="46" cy="36" r="2" fill="#1E252B"/>
        <circle cx="54" cy="36" r="2" fill="#1E252B"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="38" r="13" fill="#E76F51"/>
        <polygon points="50,51 32,82 68,82" fill="#2A9D8F"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="50" cy="38" r="13"/>
        <polygon points="50,51 32,82 68,82"/>
      </svg>`
  },
  {
    id: 'balao',
    name: 'Balão',
    category: 'brinquedos',
    color: '#E63946',
    desc: 'Balão de festa com cordinha',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="44" rx="24" ry="28" fill="#E63946"/>
        <polygon points="46,72 54,72 50,76" fill="#E63946"/>
        <path d="M 50 76 Q 44 84 52 92" stroke="#1E252B" stroke-width="2" fill="none"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="44" rx="22" ry="26" fill="#D62828"/>
        <polygon points="46,70 54,70 50,74" fill="#9B2226"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <ellipse cx="50" cy="44" rx="22" ry="26"/>
        <path d="M 50 70 L 50 86"/>
      </svg>`
  },
  {
    id: 'tambor',
    name: 'Tambor',
    category: 'brinquedos',
    color: '#FFB703',
    desc: 'Tamborzinho infantil com baquetas',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="44" width="50" height="30" fill="#FFB703"/>
        <ellipse cx="50" cy="44" rx="25" ry="8" fill="#FFF"/>
        <ellipse cx="50" cy="74" rx="25" ry="8" fill="#FB8500"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="26" y="46" width="48" height="28" fill="#FB8500"/>
        <ellipse cx="50" cy="46" rx="24" ry="7" fill="#FFF"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <rect x="26" y="46" width="48" height="28"/>
        <ellipse cx="50" cy="46" rx="24" ry="7"/>
      </svg>`
  },
  {
    id: 'ioio',
    name: 'Ioiô',
    category: 'brinquedos',
    color: '#2A9D8F',
    desc: 'Ioiô circular com cordinha',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="56" r="26" fill="#2A9D8F"/>
        <circle cx="50" cy="56" r="16" fill="#E76F51"/>
        <path d="M 50 30 L 50 16" stroke="#1E252B" stroke-width="3"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="56" r="24" fill="#264653"/>
        <circle cx="50" cy="56" r="14" fill="#F4A261"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <circle cx="50" cy="56" r="24"/>
        <line x1="50" y1="32" x2="50" y2="16"/>
      </svg>`
  },

  // --- ROUPAS (10) ---
  {
    id: 'chinelo',
    name: 'Chinelo',
    category: 'roupas',
    color: '#0E8388',
    desc: 'Chinelo de dedo tradicional brasileiro',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 40 20 C 56 20 62 34 60 50 C 58 70 56 82 46 82 C 36 82 32 70 34 50 C 36 34 32 20 40 20 Z" fill="#0E8388"/>
        <path d="M 44 38 L 36 50 M 44 38 L 56 50" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>
        <circle cx="44" cy="38" r="3" fill="#1E252B"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="48" cy="52" rx="16" ry="30" fill="#2A9D8F"/>
        <path d="M 48 40 L 40 52 M 48 40 L 58 52" stroke="#E9C46A" stroke-width="5" stroke-linecap="round"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="48" cy="52" rx="16" ry="30"/>
        <path d="M 48 40 L 40 52 M 48 40 L 58 52"/>
      </svg>`
  },
  {
    id: 'meia',
    name: 'Meia',
    category: 'roupas',
    color: '#457B9D',
    desc: 'Meia macia listrada',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 36 20 L 56 20 L 56 54 L 72 64 Q 78 74 68 80 L 46 80 Q 36 78 36 66 Z" fill="#457B9D"/>
        <line x1="36" y1="28" x2="56" y2="28" stroke="#FFF" stroke-width="3"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 38 22 L 56 22 L 56 52 L 72 62 L 66 78 L 46 78 L 38 64 Z" fill="#1D3557"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 38 22 L 56 22 L 56 52 L 72 62 L 66 78 L 46 78 L 38 64 Z"/>
      </svg>`
  },
  {
    id: 'camiseta',
    name: 'Camiseta',
    category: 'roupas',
    color: '#E76F51',
    desc: 'Camiseta de manga curta',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 32 26 L 42 32 Q 50 34 58 32 L 68 26 L 82 40 L 72 48 L 68 44 L 68 78 L 32 78 L 32 44 L 28 48 L 18 40 Z" fill="#E76F51"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="32,28 68,28 82,42 70,50 68,78 32,78 30,50 18,42" fill="#F4A261"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 34 28 L 66 28 L 82 42 L 70 50 L 68 78 L 32 78 L 30 50 L 18 42 Z"/>
      </svg>`
  },
  {
    id: 'tenis',
    name: 'Tênis',
    category: 'roupas',
    color: '#264653',
    desc: 'Tênis esportivo confortável',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 22 66 L 22 50 Q 32 42 50 48 L 66 54 L 82 66 Z" fill="#264653"/>
        <rect x="20" y="66" width="64" height="10" rx="3" fill="#FFF" stroke="#E9ECEF" stroke-width="2"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="22,66 22,50 48,46 80,66" fill="#2A9D8F"/>
        <rect x="20" y="66" width="62" height="8" fill="#FFF"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 22 66 L 22 50 L 48 46 L 80 66 Z"/>
        <line x1="20" y1="74" x2="82" y2="74"/>
      </svg>`
  },
  {
    id: 'bone',
    name: 'Boné',
    category: 'roupas',
    color: '#0E8388',
    desc: 'Boné com aba frontal',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 28 62 C 28 40 68 40 68 62 Z" fill="#0E8388"/>
        <path d="M 52 62 Q 78 62 86 68 Q 68 70 52 66 Z" fill="#2E8B57"/>
        <circle cx="48" cy="40" r="3" fill="#FFB703"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 30 62 C 30 42 66 42 66 62 Z" fill="#2A9D8F"/>
        <polygon points="56,62 84,68 64,68" fill="#E76F51"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 30 62 C 30 42 66 42 66 62 Z"/>
        <path d="M 54 62 L 84 66"/>
      </svg>`
  },
  {
    id: 'calca',
    name: 'Calça',
    category: 'roupas',
    color: '#1D3557',
    desc: 'Calça jeans azul',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="32,24 68,24 64,80 52,80 50,44 48,80 36,80" fill="#1D3557"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="34,26 66,26 62,80 52,80 50,46 48,80 38,80" fill="#457B9D"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="34,26 66,26 62,80 52,80 50,46 48,80 38,80"/>
      </svg>`
  },
  {
    id: 'vestido',
    name: 'Vestido',
    category: 'roupas',
    color: '#FF758F',
    desc: 'Vestidinho rodado florido',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="40,24 60,24 64,46 78,80 22,80 36,46" fill="#FF758F"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="42,26 58,26 62,48 76,80 24,80 38,48" fill="#E63946"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="42,26 58,26 62,48 76,80 24,80 38,48"/>
      </svg>`
  },
  {
    id: 'casaco',
    name: 'Casaco',
    category: 'roupas',
    color: '#581845',
    desc: 'Casaco quente com botões',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="36,24 64,24 82,46 72,56 64,48 64,82 36,82 36,48 28,56 18,46" fill="#581845"/>
        <line x1="50" y1="24" x2="50" y2="82" stroke="#FFF" stroke-width="2"/>
        <circle cx="53" cy="40" r="2" fill="#FFB703"/>
        <circle cx="53" cy="54" r="2" fill="#FFB703"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="36,26 64,26 80,48 70,56 64,50 64,82 36,82 36,50 30,56 20,48" fill="#900C3F"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="36,26 64,26 80,48 70,56 64,50 64,82 36,82 36,50 30,56 20,48"/>
      </svg>`
  },
  {
    id: 'luva',
    name: 'Luva',
    category: 'roupas',
    color: '#0E8388',
    desc: 'Luva quentinha de lã',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 38 78 L 38 48 Q 38 38 46 38 Q 54 38 54 48 L 54 52 Q 62 50 64 56 Q 66 62 58 66 L 58 78 Z" fill="#0E8388"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 38 78 L 38 48 Q 38 38 46 38 Q 54 38 54 48 L 54 52 Q 62 50 64 56 L 58 78 Z" fill="#2A9D8F"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 38 78 L 38 48 Q 38 38 46 38 Q 54 38 54 48 L 54 52 Q 62 50 64 56 L 58 78 Z"/>
      </svg>`
  },
  {
    id: 'relogio',
    name: 'Relógio de Pulso',
    category: 'roupas',
    color: '#343A40',
    desc: 'Relógio com pulseira e ponteiros',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="42" y="16" width="16" height="68" rx="4" fill="#343A40"/>
        <circle cx="50" cy="50" r="20" fill="#FFF" stroke="#495057" stroke-width="4"/>
        <line x1="50" y1="50" x2="50" y2="38" stroke="#1E252B" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="50" x2="58" y2="50" stroke="#E63946" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="44" y="18" width="12" height="64" fill="#212529"/>
        <circle cx="50" cy="50" r="18" fill="#E9ECEF"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <rect x="44" y="18" width="12" height="64"/>
        <circle cx="50" cy="50" r="18"/>
      </svg>`
  },

  // --- UTENSÍLIOS / CASA (10) ---
  {
    id: 'copo-americano',
    name: 'Copo Americano',
    category: 'utensilios',
    color: '#A8DADC',
    desc: 'Clássico copo americano de vidro canelado',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,24 70,24 64,80 36,80" fill="#E2EAFC" stroke="#A8DADC" stroke-width="3"/>
        <line x1="42" y1="36" x2="40" y2="72" stroke="#B9D5FD" stroke-width="3"/>
        <line x1="50" y1="36" x2="50" y2="72" stroke="#B9D5FD" stroke-width="3"/>
        <line x1="58" y1="36" x2="60" y2="72" stroke="#B9D5FD" stroke-width="3"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="32,24 68,24 62,80 38,80" fill="#A8DADC"/>
        <polygon points="38,80 62,80 60,60 40,60" fill="#457B9D"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="32,24 68,24 62,80 38,80"/>
        <ellipse cx="50" cy="24" rx="18" ry="4"/>
      </svg>`
  },
  {
    id: 'colher',
    name: 'Colher',
    category: 'utensilios',
    color: '#ADB5BD',
    desc: 'Colher de mesa prateada',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="34" rx="14" ry="18" fill="#CED4DA"/>
        <rect x="47" y="50" width="6" height="34" rx="3" fill="#6C757D"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="34" rx="13" ry="16" fill="#ADB5BD"/>
        <rect x="48" y="48" width="4" height="36" fill="#495057"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <ellipse cx="50" cy="34" rx="13" ry="16"/>
        <line x1="50" y1="50" x2="50" y2="84"/>
      </svg>`
  },
  {
    id: 'prato',
    name: 'Prato',
    category: 'utensilios',
    color: '#F8F9FA',
    desc: 'Prato redondo de cerâmica',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="34" fill="#F8F9FA" stroke="#DEE2E6" stroke-width="3"/>
        <circle cx="50" cy="50" r="22" fill="#EDF2F4"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="32" fill="#E9ECEF"/>
        <circle cx="50" cy="50" r="20" fill="#CED4DA"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none">
        <circle cx="50" cy="50" r="32"/>
        <circle cx="50" cy="50" r="20"/>
      </svg>`
  },
  {
    id: 'garfo',
    name: 'Garfo',
    category: 'utensilios',
    color: '#6C757D',
    desc: 'Garfo com dentes de metal',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 40 20 L 40 40 Q 40 48 50 48 Q 60 48 60 40 L 60 20 M 46 20 L 46 40 M 54 20 L 54 40" stroke="#6C757D" stroke-width="3" fill="none"/>
        <rect x="47" y="48" width="6" height="36" rx="3" fill="#6C757D"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="42" y="22" width="16" height="24" fill="#495057"/>
        <rect x="48" y="46" width="4" height="38" fill="#495057"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 40 22 L 40 42 Q 50 46 60 42 L 60 22"/>
        <line x1="50" y1="44" x2="50" y2="84"/>
      </svg>`
  },
  {
    id: 'escova-dente',
    name: 'Escova de Dentes',
    category: 'utensilios',
    color: '#0E8388',
    desc: 'Escova com cerdas brancas macias',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 72 26 L 36 78 Q 32 82 28 80 L 24 76 Q 22 72 26 68 L 62 16 Q 66 12 70 14 Z" fill="#0E8388"/>
        <rect x="62" y="16" width="16" height="8" rx="2" fill="#FFF"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <line x1="28" y1="76" x2="68" y2="24" stroke="#2A9D8F" stroke-width="8" stroke-linecap="round"/>
        <rect x="62" y="16" width="14" height="8" fill="#FFF"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <line x1="28" y1="76" x2="68" y2="24"/>
        <rect x="62" y="16" width="12" height="6"/>
      </svg>`
  },
  {
    id: 'toalha',
    name: 'Toalha',
    category: 'utensilios',
    color: '#457B9D',
    desc: 'Toalha de banho dobrada',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="24" y="36" width="52" height="34" rx="4" fill="#457B9D"/>
        <line x1="24" y1="62" x2="76" y2="62" stroke="#FFF" stroke-width="3"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="38" width="50" height="32" fill="#1D3557"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <rect x="25" y="38" width="50" height="32" rx="3"/>
      </svg>`
  },
  {
    id: 'panela',
    name: 'Panela',
    category: 'utensilios',
    color: '#D62828',
    desc: 'Panela de cozinha com tampa e alças',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="44" width="40" height="30" rx="3" fill="#D62828"/>
        <ellipse cx="50" cy="44" rx="20" ry="6" fill="#A8DADC"/>
        <circle cx="50" cy="38" r="3" fill="#1E252B"/>
        <line x1="22" y1="52" x2="30" y2="52" stroke="#1E252B" stroke-width="4" stroke-linecap="round"/>
        <line x1="70" y1="52" x2="78" y2="52" stroke="#1E252B" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="44" width="40" height="28" fill="#9B2226"/>
        <rect x="34" y="38" width="32" height="6" fill="#CED4DA"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <rect x="30" y="44" width="40" height="28"/>
        <line x1="22" y1="52" x2="30" y2="52"/>
        <line x1="70" y1="52" x2="78" y2="52"/>
      </svg>`
  },
  {
    id: 'cadeira',
    name: 'Cadeira',
    category: 'utensilios',
    color: '#8D5B4C',
    desc: 'Cadeira de madeira confortável',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="32" y="24" width="6" height="34" fill="#8D5B4C"/>
        <rect x="32" y="54" width="36" height="6" rx="2" fill="#BC6C25"/>
        <rect x="34" y="60" width="5" height="24" fill="#8D5B4C"/>
        <rect x="62" y="60" width="5" height="24" fill="#8D5B4C"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="34,24 40,24 40,54 66,54 66,60 40,60 40,84 34,84" fill="#7F4F24"/>
        <rect x="60" y="60" width="6" height="24" fill="#7F4F24"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 36 24 L 36 84 M 36 56 L 64 56 L 64 84"/>
      </svg>`
  },
  {
    id: 'xicara',
    name: 'Xícara',
    category: 'utensilios',
    color: '#F4A261',
    desc: 'Xícara de café quentinho',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="42" width="34" height="26" rx="6" fill="#F4A261"/>
        <path d="M 64 48 Q 76 54 64 62" stroke="#F4A261" stroke-width="5" fill="none"/>
        <line x1="24" y1="72" x2="70" y2="72" stroke="#1E252B" stroke-width="3" stroke-linecap="round"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="42" width="32" height="24" fill="#E76F51"/>
        <path d="M 62 46 Q 74 52 62 60" stroke="#E76F51" stroke-width="4" fill="none"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="30" y="42" width="32" height="24" rx="4"/>
        <path d="M 62 46 Q 74 52 62 60"/>
      </svg>`
  },
  {
    id: 'pente',
    name: 'Pente',
    category: 'utensilios',
    color: '#0E8388',
    desc: 'Pente de cabelo com dentes finos',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="42" width="60" height="8" rx="2" fill="#0E8388"/>
        <line x1="24" y1="50" x2="24" y2="64" stroke="#0E8388" stroke-width="3"/>
        <line x1="32" y1="50" x2="32" y2="64" stroke="#0E8388" stroke-width="3"/>
        <line x1="40" y1="50" x2="40" y2="64" stroke="#0E8388" stroke-width="3"/>
        <line x1="48" y1="50" x2="48" y2="64" stroke="#0E8388" stroke-width="3"/>
        <line x1="56" y1="50" x2="56" y2="64" stroke="#0E8388" stroke-width="3"/>
        <line x1="64" y1="50" x2="64" y2="64" stroke="#0E8388" stroke-width="3"/>
        <line x1="72" y1="50" x2="72" y2="64" stroke="#0E8388" stroke-width="3"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="44" width="56" height="8" fill="#2A9D8F"/>
        <rect x="22" y="52" width="56" height="12" fill="#264653"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <rect x="22" y="44" width="56" height="8"/>
        <line x1="28" y1="52" x2="28" y2="64"/>
        <line x1="42" y1="52" x2="42" y2="64"/>
        <line x1="56" y1="52" x2="56" y2="64"/>
        <line x1="70" y1="52" x2="70" y2="64"/>
      </svg>`
  },

  // --- VEÍCULOS (10) ---
  {
    id: 'bicicleta',
    name: 'Bicicleta',
    category: 'veiculos',
    color: '#0E8388',
    desc: 'Bicicleta de duas rodas e guidão',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="64" r="14" stroke="#1E252B" stroke-width="4" fill="none"/>
        <circle cx="72" cy="64" r="14" stroke="#1E252B" stroke-width="4" fill="none"/>
        <polygon points="28,64 50,64 64,44 42,44" stroke="#0E8388" stroke-width="4" fill="none"/>
        <line x1="50" y1="64" x2="42" y2="38" stroke="#0E8388" stroke-width="4"/>
        <line x1="64" y1="44" x2="72" y2="64" stroke="#0E8388" stroke-width="4"/>
        <line x1="62" y1="38" x2="68" y2="38" stroke="#1E252B" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="64" r="12" fill="#264653"/>
        <circle cx="70" cy="64" r="12" fill="#264653"/>
        <polygon points="30,64 50,64 64,44 44,44" stroke="#E76F51" stroke-width="4" fill="none"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="30" cy="64" r="12"/>
        <circle cx="70" cy="64" r="12"/>
        <path d="M 30 64 L 50 64 L 64 44 L 70 64"/>
      </svg>`
  },
  {
    id: 'carro',
    name: 'Carro',
    category: 'veiculos',
    color: '#0E8388',
    desc: 'Carro de passeio moderno',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 18 60 L 22 50 Q 28 48 38 48 L 48 34 L 72 34 L 78 48 L 86 52 Q 88 56 86 60 Z" fill="#0E8388"/>
        <circle cx="34" cy="62" r="7" fill="#1E252B"/>
        <circle cx="72" cy="62" r="7" fill="#1E252B"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="18,60 32,46 72,46 86,60" fill="#2A9D8F"/>
        <circle cx="34" cy="62" r="6" fill="#1E252B"/>
        <circle cx="70" cy="62" r="6" fill="#1E252B"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 18 60 L 32 46 L 72 46 L 86 60 Z"/>
        <circle cx="34" cy="62" r="5"/>
        <circle cx="70" cy="62" r="5"/>
      </svg>`
  },
  {
    id: 'onibus',
    name: 'Ônibus',
    category: 'veiculos',
    color: '#FFB703',
    desc: 'Ônibus urbano com janelas',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="32" width="66" height="34" rx="6" fill="#FFB703"/>
        <rect x="24" y="38" width="12" height="12" rx="2" fill="#E2EAFC"/>
        <rect x="42" y="38" width="12" height="12" rx="2" fill="#E2EAFC"/>
        <rect x="60" y="38" width="12" height="12" rx="2" fill="#E2EAFC"/>
        <circle cx="32" cy="68" r="6" fill="#1E252B"/>
        <circle cx="70" cy="68" r="6" fill="#1E252B"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="32" width="66" height="34" fill="#FB8500"/>
        <circle cx="32" cy="68" r="6" fill="#212529"/>
        <circle cx="70" cy="68" r="6" fill="#212529"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <rect x="18" y="32" width="66" height="34" rx="4"/>
        <circle cx="32" cy="68" r="5"/>
        <circle cx="70" cy="68" r="5"/>
      </svg>`
  },
  {
    id: 'caminhao',
    name: 'Caminhão',
    category: 'veiculos',
    color: '#E63946',
    desc: 'Caminhão de carga pesado',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="34" width="42" height="32" rx="2" fill="#457B9D"/>
        <path d="M 58 44 L 74 44 L 84 54 L 84 66 L 58 66 Z" fill="#E63946"/>
        <circle cx="30" cy="68" r="6" fill="#1E252B"/>
        <circle cx="48" cy="68" r="6" fill="#1E252B"/>
        <circle cx="74" cy="68" r="6" fill="#1E252B"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="36" width="40" height="30" fill="#1D3557"/>
        <polygon points="58,46 74,46 82,56 82,66 58,66" fill="#E63946"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <rect x="18" y="36" width="40" height="30"/>
        <path d="M 58 46 L 74 46 L 82 56 L 82 66 L 58 66 Z"/>
      </svg>`
  },
  {
    id: 'moto',
    name: 'Moto',
    category: 'veiculos',
    color: '#E63946',
    desc: 'Motocicleta rápida de duas rodas',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="64" r="12" fill="#1E252B"/>
        <circle cx="74" cy="64" r="12" fill="#1E252B"/>
        <polygon points="34,60 52,48 70,52 64,64 42,64" fill="#E63946"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="64" r="10" fill="#2B2D42"/>
        <circle cx="74" cy="64" r="10" fill="#2B2D42"/>
        <polygon points="36,58 52,46 68,54 44,62" fill="#D90429"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <circle cx="28" cy="64" r="10"/>
        <circle cx="74" cy="64" r="10"/>
        <path d="M 36 58 L 52 46 L 68 54"/>
      </svg>`
  },
  {
    id: 'barco',
    name: 'Barco',
    category: 'veiculos',
    color: '#E76F51',
    desc: 'Barco a vela navegando no rio',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="20,68 80,68 70,82 30,82" fill="#E76F51"/>
        <line x1="50" y1="20" x2="50" y2="68" stroke="#1E252B" stroke-width="4"/>
        <polygon points="50,24 74,48 50,56" fill="#FFF"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="20,68 80,68 70,80 30,80" fill="#F4A261"/>
        <polygon points="50,22 72,50 50,56" fill="#2A9D8F"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="20,68 80,68 70,80 30,80"/>
        <polygon points="50,22 72,50 50,56"/>
      </svg>`
  },
  {
    id: 'aviao',
    name: 'Avião',
    category: 'veiculos',
    color: '#F8F9FA',
    desc: 'Avião de passageiros com asas abertas',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 48 18 Q 50 14 52 18 L 54 48 L 84 60 L 84 66 L 54 58 L 54 76 L 64 82 L 64 86 L 50 84 L 36 86 L 36 82 L 46 76 L 46 58 L 16 66 L 16 60 L 46 48 Z" fill="#F8F9FA" stroke="#DEE2E6" stroke-width="2"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,16 54,48 84,62 54,58 54,78 64,84 36,84 46,78 46,58 16,62 46,48" fill="#457B9D"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="50,16 54,48 84,62 54,58 54,78 64,84 36,84 46,78 46,58 16,62 46,48"/>
      </svg>`
  },
  {
    id: 'trem',
    name: 'Trem',
    category: 'veiculos',
    color: '#264653',
    desc: 'Locomotiva de trem nos trilhos',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="38" width="56" height="30" rx="3" fill="#264653"/>
        <rect x="62" y="24" width="16" height="24" fill="#E76F51"/>
        <circle cx="34" cy="70" r="6" fill="#1E252B"/>
        <circle cx="50" cy="70" r="6" fill="#1E252B"/>
        <circle cx="66" cy="70" r="6" fill="#1E252B"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="22,40 60,40 60,26 78,26 78,70 22,70" fill="#2A9D8F"/>
        <circle cx="34" cy="70" r="6" fill="#E76F51"/>
        <circle cx="66" cy="70" r="6" fill="#E76F51"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 22 40 L 60 40 L 60 26 L 78 26 L 78 70 L 22 70 Z"/>
        <circle cx="34" cy="70" r="5"/>
        <circle cx="66" cy="70" r="5"/>
      </svg>`
  },
  {
    id: 'trator',
    name: 'Trator',
    category: 'veiculos',
    color: '#2D6A4F',
    desc: 'Trator do campo com rodas grandes',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="62" r="14" fill="#1E252B"/>
        <circle cx="74" cy="66" r="8" fill="#1E252B"/>
        <rect x="44" y="44" width="34" height="20" fill="#2D6A4F"/>
        <rect x="36" y="32" width="16" height="24" fill="#52B788"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="62" r="12" fill="#1B4332"/>
        <circle cx="74" cy="66" r="7" fill="#1B4332"/>
        <polygon points="34,36 50,36 50,46 76,46 76,64 34,64" fill="#40916C"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <circle cx="36" cy="62" r="12"/>
        <circle cx="74" cy="66" r="7"/>
        <path d="M 34 36 L 50 36 L 50 46 L 76 46 L 76 64 L 34 64 Z"/>
      </svg>`
  },
  {
    id: 'helicoptero',
    name: 'Helicóptero',
    category: 'veiculos',
    color: '#0E8388',
    desc: 'Helicóptero voando com hélices',
    renderFoto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="46" cy="52" rx="22" ry="16" fill="#0E8388"/>
        <rect x="14" y="48" width="18" height="6" fill="#0E8388"/>
        <line x1="20" y1="26" x2="72" y2="26" stroke="#1E252B" stroke-width="4" stroke-linecap="round"/>
        <line x1="46" y1="26" x2="46" y2="36" stroke="#1E252B" stroke-width="4"/>
        <line x1="30" y1="74" x2="62" y2="74" stroke="#1E252B" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    renderIlustracao: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="46" cy="52" rx="20" ry="14" fill="#2A9D8F"/>
        <line x1="22" y1="26" x2="70" y2="26" stroke="#264653" stroke-width="4"/>
      </svg>`,
    renderPicto: () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="#1E252B" stroke-width="6" fill="none" stroke-linecap="round">
        <ellipse cx="46" cy="52" rx="20" ry="14"/>
        <line x1="22" y1="26" x2="70" y2="26"/>
        <line x1="46" y1="26" x2="46" y2="38"/>
      </svg>`
  }
];

export const TARGET_ITEMS: TargetItem[] = itemDefs.map(def => ({
  id: def.id,
  name: def.name,
  category: def.category,
  dominantColor: def.color,
  description: def.desc,
  layers: {
    foto: svgData(def.renderFoto(def.color)),
    ilustracao: svgData(def.renderIlustracao(def.color)),
    picto: svgData(def.renderPicto())
  }
}));

export const TARGETS_BY_ID = new Map<string, TargetItem>(
  TARGET_ITEMS.map(t => [t.id, t])
);

export const TARGETS_BY_CATEGORY = TARGET_ITEMS.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item);
  return acc;
}, {} as Record<TargetItem['category'], TargetItem[]>);
