import type { ReactNode } from 'react';

export function CulinaryArt({ id, size = 48 }: { id: string; size?: number }): ReactNode {
  switch (id) {
    case 'banana':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M14 48 C 22 56, 44 54, 52 32 C 54 28, 52 24, 48 24 C 44 24, 40 38, 20 40 Z" fill="#ecc94b" stroke="#d69e2e" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 50 L8 54" stroke="#744210" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 25 L56 22" stroke="#744210" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'maca':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M32 18 C 30 10, 36 8, 38 6" fill="none" stroke="#744210" strokeWidth="3" strokeLinecap="round" />
          <path d="M34 10 Q 42 10 40 16 Z" fill="#38a169" />
          <path d="M32 20 C 20 18, 12 28, 14 42 C 16 54, 28 58, 32 54 C 36 58, 48 54, 50 42 C 52 28, 44 18, 32 20 Z" fill="#e53e3e" stroke="#c53030" strokeWidth="2" />
          <circle cx="24" cy="30" r="3" fill="#fff" opacity="0.4" />
        </svg>
      );
    case 'morango':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M24 16 Q 32 12 40 16" stroke="#2f855a" strokeWidth="4" strokeLinecap="round" />
          <path d="M26 14 L 32 8 L 38 14" fill="#38a169" />
          <path d="M32 54 C 20 48, 14 34, 18 22 C 22 18, 42 18, 46 22 C 50 34, 44 48, 32 54 Z" fill="#e53e3e" stroke="#9b2c2c" strokeWidth="2" />
          {[
            [26, 28], [38, 28], [32, 36], [24, 42], [40, 42], [32, 48]
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="#fefcbf" />
          ))}
        </svg>
      );
    case 'uva':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M32 14 L 32 8" stroke="#744210" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 12 Q 38 8 42 12 Z" fill="#38a169" />
          {[
            [24, 22], [32, 20], [40, 22],
            [20, 30], [28, 28], [36, 28], [44, 30],
            [24, 38], [32, 36], [40, 38],
            [28, 46], [36, 46],
            [32, 54]
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" fill="#805ad5" stroke="#553c9a" strokeWidth="1.5" />
          ))}
        </svg>
      );
    case 'colher':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <ellipse cx="48" cy="18" rx="10" ry="14" transform="rotate(35 48 18)" fill="#d69e2e" stroke="#b7791f" strokeWidth="2" />
          <path d="M42 26 L 16 52" stroke="#b7791f" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case 'pao':
    case 'pao-topo':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M12 30 C 12 18, 52 18, 52 30 L 50 50 C 50 54, 14 54, 14 50 Z" fill="#fbd38d" stroke="#dd6b20" strokeWidth="2.5" />
          <path d="M18 28 C 18 22, 46 22, 46 28" stroke="#dd6b20" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
    case 'queijo':
    case 'queijo-ralado':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <polygon points="12,48 52,48 48,22 16,30" fill="#f6e05e" stroke="#d69e2e" strokeWidth="2" />
          <circle cx="28" cy="40" r="3.5" fill="#d69e2e" opacity="0.6" />
          <circle cx="40" cy="34" r="2.5" fill="#d69e2e" opacity="0.6" />
          <circle cx="22" cy="34" r="2" fill="#d69e2e" opacity="0.6" />
        </svg>
      );
    case 'alface':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M16 46 Q 10 30 24 24 Q 32 14 44 20 Q 56 26 50 42 Q 44 54 28 50 Z" fill="#48bb78" stroke="#276749" strokeWidth="2" />
          <path d="M28 48 Q 32 34 38 24" fill="none" stroke="#9ae6b4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'tomate':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="32" cy="34" r="22" fill="#e53e3e" stroke="#9b2c2c" strokeWidth="2" />
          <circle cx="32" cy="34" r="16" fill="#feb2b2" opacity="0.6" />
          <circle cx="26" cy="30" r="3" fill="#e53e3e" />
          <circle cx="38" cy="30" r="3" fill="#e53e3e" />
          <circle cx="32" cy="40" r="3" fill="#e53e3e" />
        </svg>
      );
    case 'massa':
    case 'massa-pizza':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <ellipse cx="32" cy="34" rx="26" ry="18" fill="#fbd38d" stroke="#dd6b20" strokeWidth="2" />
          <ellipse cx="32" cy="34" rx="22" ry="14" fill="#feebc8" />
        </svg>
      );
    case 'molho':
    case 'molho-tomate':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M24 16 L40 16 L38 48 C 38 52 26 52 26 48 Z" fill="#e53e3e" stroke="#9b2c2c" strokeWidth="2" />
          <rect x="28" y="10" width="8" height="6" fill="#dd6b20" />
          <path d="M42 36 Q 48 42 46 48" stroke="#e53e3e" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'oregano':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="22" cy="24" r="4" fill="#38a169" />
          <circle cx="34" cy="20" r="5" fill="#2f855a" />
          <circle cx="44" cy="26" r="4" fill="#38a169" />
          <circle cx="28" cy="34" r="4.5" fill="#2f855a" />
          <circle cx="40" cy="36" r="4" fill="#38a169" />
          <circle cx="32" cy="46" r="5" fill="#276749" />
        </svg>
      );
    case 'forno':
    case 'forninho':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="12" y="14" width="40" height="38" rx="6" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
          <rect x="18" y="24" width="28" height="20" rx="3" fill="#ed8936" />
          <circle cx="24" cy="18" r="2.5" fill="#cbd5e0" />
          <circle cx="32" cy="18" r="2.5" fill="#cbd5e0" />
          <circle cx="40" cy="18" r="2.5" fill="#cbd5e0" />
        </svg>
      );
    case 'leite':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M22 22 L26 14 L38 14 L42 22 L42 52 L22 52 Z" fill="#edf2f7" stroke="#cbd5e0" strokeWidth="2" />
          <rect x="24" y="30" width="16" height="12" fill="#63b3ed" rx="2" />
          <text x="32" y="39" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#fff">LEITE</text>
        </svg>
      );
    case 'gelo':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <polygon points="32,16 48,26 48,46 32,54 16,46 16,26" fill="#bee3f8" stroke="#63b3ed" strokeWidth="2" />
          <polygon points="32,16 48,26 32,34 16,26" fill="#ebf8ff" />
          <line x1="32" y1="34" x2="32" y2="54" stroke="#63b3ed" strokeWidth="2" />
        </svg>
      );
    case 'liquidificador':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M22 14 L42 14 L38 42 L26 42 Z" fill="#bee3f8" stroke="#4299e1" strokeWidth="2" opacity="0.8" />
          <rect x="20" y="42" width="24" height="14" rx="3" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
          <circle cx="32" cy="49" r="3" fill="#ecc94b" />
          <path d="M42 22 Q 48 28 40 34" fill="none" stroke="#4299e1" strokeWidth="2" />
        </svg>
      );
    case 'sapato':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M12 44 L 14 36 Q 26 36 34 32 L 48 38 L 52 48 L 12 48 Z" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
          <line x1="12" y1="48" x2="52" y2="48" stroke="#e2e8f0" strokeWidth="3" />
        </svg>
      );
    case 'carro':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M12 40 L 16 32 L 44 32 L 52 40 L 52 46 L 12 46 Z" fill="#3182ce" stroke="#2b6cb0" strokeWidth="2" />
          <circle cx="22" cy="46" r="5" fill="#1a202c" />
          <circle cx="42" cy="46" r="5" fill="#1a202c" />
        </svg>
      );
    case 'bola':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="32" cy="34" r="20" fill="#e53e3e" stroke="#c53030" strokeWidth="2" />
          <path d="M16 26 Q 32 34 48 26" fill="none" stroke="#fff" strokeWidth="3" />
          <path d="M16 42 Q 32 34 48 42" fill="none" stroke="#fff" strokeWidth="3" />
        </svg>
      );
    case 'livro':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <rect x="16" y="16" width="32" height="36" rx="3" fill="#319795" stroke="#234e52" strokeWidth="2" />
          <line x1="22" y1="16" x2="22" y2="52" stroke="#fff" strokeWidth="2" />
          <line x1="28" y1="26" x2="42" y2="26" stroke="#fff" strokeWidth="2" />
          <line x1="28" y1="34" x2="38" y2="34" stroke="#fff" strokeWidth="2" />
        </svg>
      );
    case 'chave':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="24" cy="32" r="10" fill="none" stroke="#d69e2e" strokeWidth="3" />
          <line x1="34" y1="32" x2="52" y2="32" stroke="#d69e2e" strokeWidth="4" strokeLinecap="round" />
          <line x1="44" y1="32" x2="44" y2="38" stroke="#d69e2e" strokeWidth="3" />
          <line x1="50" y1="32" x2="50" y2="38" stroke="#d69e2e" strokeWidth="3" />
        </svg>
      );
    case 'meia':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <path d="M22 14 L 34 14 L 34 36 L 46 44 C 46 50 38 52 30 46 L 22 36 Z" fill="#ed64a6" stroke="#b83280" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="32" cy="32" r="22" fill="#edf2f7" stroke="#cbd5e0" strokeWidth="2" />
          <text x="32" y="38" textAnchor="middle" fontSize="16">🍴</text>
        </svg>
      );
  }
}
