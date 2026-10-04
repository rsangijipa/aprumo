import type { ReactNode } from 'react';

export function IndependenceArt({ id, size = 48 }: { id: string; size?: number }): ReactNode {
  switch (id) {
    case 'estojo':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="12" y="24" width="40" height="20" rx="8" fill="#3182ce" stroke="#2b6cb0" strokeWidth="2" />
          <line x1="16" y1="34" x2="48" y2="34" stroke="#63b3ed" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="20" cy="34" r="3" fill="#ecc94b" />
          <path d="M22 20 L28 24 L20 24 Z" fill="#e53e3e" />
          <rect x="23" y="16" width="3" height="5" fill="#f6ad55" />
        </svg>
      );
    case 'caderno':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="16" y="14" width="34" height="40" rx="3" fill="#dd6b20" stroke="#c05621" strokeWidth="2" />
          <rect x="16" y="14" width="8" height="40" rx="2" fill="#7b341e" />
          <circle cx="20" cy="22" r="2" fill="#fff" />
          <circle cx="20" cy="34" r="2" fill="#fff" />
          <circle cx="20" cy="46" r="2" fill="#fff" />
          <line x1="28" y1="24" x2="44" y2="24" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="32" x2="44" y2="32" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="40" x2="38" y2="40" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'garrafa':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="22" y="22" width="20" height="32" rx="6" fill="#4fd1c5" stroke="#319795" strokeWidth="2" />
          <rect x="26" y="14" width="12" height="8" rx="2" fill="#285e61" />
          <circle cx="32" cy="12" r="3" fill="#81e6d9" />
          <path d="M25 34 Q 32 38 39 34" fill="none" stroke="#e6fffa" strokeWidth="2" />
        </svg>
      );
    case 'lancheira':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="14" y="24" width="36" height="26" rx="6" fill="#e53e3e" stroke="#c53030" strokeWidth="2" />
          <path d="M24 24 L24 16 Q32 12 40 16 L40 24" fill="none" stroke="#9b2c2c" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="37" r="4" fill="#feebc8" stroke="#dd6b20" strokeWidth="1.5" />
        </svg>
      );
    case 'fechar-mochila':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M16 22 C 16 14, 48 14, 48 22 L 48 52 C 48 54, 16 54, 16 52 Z" fill="#319795" stroke="#234e52" strokeWidth="2.5" />
          <line x1="32" y1="18" x2="32" y2="46" stroke="#ecc94b" strokeWidth="3" strokeDasharray="2 2" />
          <rect x="28" y="32" width="8" height="10" rx="2" fill="#d69e2e" />
          <circle cx="32" cy="40" r="2" fill="#744210" />
        </svg>
      );
    case 'cesto':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <polygon points="12,28 52,28 44,52 20,52" fill="#ed8936" stroke="#c05621" strokeWidth="2" />
          <line x1="16" y1="36" x2="48" y2="36" stroke="#dd6b20" strokeWidth="1.5" />
          <line x1="20" y1="44" x2="44" y2="44" stroke="#dd6b20" strokeWidth="1.5" />
          <path d="M22 28 C 22 14, 42 14, 42 28" fill="none" stroke="#7b341e" strokeWidth="3" />
        </svg>
      );
    case 'maca':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="28" cy="36" r="14" fill="#e53e3e" />
          <circle cx="36" cy="36" r="14" fill="#e53e3e" />
          <path d="M32 24 L34 16" stroke="#744210" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M34 18 Q 40 16 38 22 Z" fill="#38a169" />
        </svg>
      );
    case 'leite':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M22 24 L26 16 L38 16 L42 24 L42 50 L22 50 Z" fill="#edf2f7" stroke="#cbd5e0" strokeWidth="2" />
          <rect x="24" y="30" width="16" height="12" fill="#3182ce" rx="2" />
          <text x="32" y="39" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#fff">LEITE</text>
        </svg>
      );
    case 'caixa-pagar':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="14" y="24" width="36" height="24" rx="4" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
          <rect x="22" y="16" width="20" height="10" rx="2" fill="#718096" />
          <rect x="26" y="19" width="12" height="4" fill="#48bb78" />
          <line x1="20" y1="36" x2="44" y2="36" stroke="#ecc94b" strokeWidth="2" />
          <circle cx="32" cy="42" r="2.5" fill="#e2e8f0" />
        </svg>
      );
    case 'conferir-troco':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="26" cy="32" r="12" fill="#ecc94b" stroke="#d69e2e" strokeWidth="2" />
          <circle cx="38" cy="36" r="10" fill="#cbd5e0" stroke="#a0aec0" strokeWidth="2" />
          <text x="26" y="36" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#744210">R$</text>
          <text x="38" y="40" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4a5568">50</text>
        </svg>
      );
    case 'ponto-espera':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <line x1="22" y1="12" x2="22" y2="54" stroke="#4a5568" strokeWidth="4" strokeLinecap="round" />
          <circle cx="22" cy="18" r="12" fill="#3182ce" stroke="#2b6cb0" strokeWidth="2" />
          <text x="22" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">BUS</text>
          <line x1="12" y1="54" x2="52" y2="54" stroke="#a0aec0" strokeWidth="3" />
        </svg>
      );
    case 'conferir-linha':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="12" y="20" width="40" height="24" rx="4" fill="#1a202c" stroke="#2d3748" strokeWidth="2" />
          <text x="32" y="32" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f6e05e">104</text>
          <text x="32" y="40" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#68d391">ESCOLA</text>
        </svg>
      );
    case 'cartao-transporte':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="14" y="20" width="36" height="24" rx="4" fill="#319795" stroke="#234e52" strokeWidth="2" />
          <rect x="18" y="24" width="8" height="6" rx="1" fill="#ecc94b" />
          <path d="M34 26 Q 44 32 34 38" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'segurar-apoio':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <line x1="16" y1="18" x2="48" y2="18" stroke="#cbd5e0" strokeWidth="6" strokeLinecap="round" />
          <line x1="32" y1="18" x2="32" y2="52" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          <rect x="26" y="28" width="12" height="16" rx="4" fill="#ed8936" />
        </svg>
      );
    case 'apertar-campainha':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="22" y="16" width="20" height="32" rx="6" fill="#e53e3e" stroke="#9b2c2c" strokeWidth="2" />
          <circle cx="32" cy="32" r="6" fill="#fff" />
          <circle cx="32" cy="32" r="3" fill="#e53e3e" />
          <path d="M14 26 Q 10 32 14 38" fill="none" stroke="#ecc94b" strokeWidth="2" strokeLinecap="round" />
          <path d="M50 26 Q 54 32 50 38" fill="none" stroke="#ecc94b" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'despertar':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="16" y="14" width="32" height="36" rx="2" fill="#edf2f7" stroke="#cbd5e0" strokeWidth="2" />
          <line x1="32" y1="14" x2="32" y2="50" stroke="#cbd5e0" strokeWidth="2" />
          <line x1="16" y1="32" x2="48" y2="32" stroke="#cbd5e0" strokeWidth="2" />
          <circle cx="24" cy="24" r="5" fill="#f6e05e" />
          <path d="M14 16 L22 48" stroke="#319795" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 16 L42 48" stroke="#319795" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'trocar-roupa':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M22 18 L26 14 L38 14 L42 18 L48 24 L42 30 L40 26 L40 48 L24 48 L24 26 L22 30 L16 24 Z" fill="#4299e1" stroke="#2b6cb0" strokeWidth="2" />
          <circle cx="32" cy="24" r="1.5" fill="#fff" />
          <circle cx="32" cy="32" r="1.5" fill="#fff" />
        </svg>
      );
    case 'higiene':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="18" y="32" width="28" height="6" rx="2" fill="#38a169" />
          <rect x="18" y="26" width="10" height="6" fill="#e2e8f0" rx="1" />
          <path d="M38 18 Q 44 26 38 30" fill="#63b3ed" />
        </svg>
      );
    case 'cafe':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <ellipse cx="32" cy="40" rx="18" ry="10" fill="#fbd38d" stroke="#dd6b20" strokeWidth="2" />
          <ellipse cx="32" cy="36" rx="14" ry="8" fill="#feebc8" />
          <circle cx="32" cy="35" r="4" fill="#ecc94b" />
          <path d="M28 24 Q 30 18 28 14" fill="none" stroke="#a0aec0" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M34 24 Q 36 18 34 14" fill="none" stroke="#a0aec0" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'chave-saida':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="24" cy="32" r="10" fill="none" stroke="#d69e2e" strokeWidth="3" />
          <line x1="34" y1="32" x2="52" y2="32" stroke="#d69e2e" strokeWidth="4" strokeLinecap="round" />
          <line x1="44" y1="32" x2="44" y2="38" stroke="#d69e2e" strokeWidth="3" />
          <line x1="50" y1="32" x2="50" y2="38" stroke="#d69e2e" strokeWidth="3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="32" cy="32" r="22" fill="#edf2f7" stroke="#cbd5e0" strokeWidth="2" />
          <text x="32" y="38" textAnchor="middle" fontSize="16">✨</text>
        </svg>
      );
  }
}
