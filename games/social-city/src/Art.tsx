import type { ReactNode } from 'react';

export function CharacterPortrait({ id, size = 64 }: { id: string; size?: number }): ReactNode {
  switch (id) {
    case 'sofia':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="32" cy="32" r="30" fill="#feebc8" stroke="#dd6b20" strokeWidth="2.5" />
          {/* Cabelo castanho preso */}
          <circle cx="32" cy="28" r="16" fill="#744210" />
          <circle cx="32" cy="14" r="6" fill="#744210" />
          {/* Rosto */}
          <circle cx="32" cy="30" r="12" fill="#fed7aa" />
          <circle cx="28" cy="29" r="1.8" fill="#1a202c" />
          <circle cx="36" cy="29" r="1.8" fill="#1a202c" />
          <path d="M 28 34 Q 32 38 36 34" fill="none" stroke="#c05621" strokeWidth="2" strokeLinecap="round" />
          {/* Avental de barista */}
          <path d="M 20 48 L 44 48 L 42 62 L 22 62 Z" fill="#319795" />
          <text x="32" y="58" textAnchor="middle" fontSize="8">☕</text>
        </svg>
      );
    case 'marcos':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="32" cy="32" r="30" fill="#bee3f8" stroke="#3182ce" strokeWidth="2.5" />
          {/* Cabelo curto escuro */}
          <circle cx="32" cy="28" r="16" fill="#2d3748" />
          {/* Rosto */}
          <circle cx="32" cy="30" r="12" fill="#fed7aa" />
          <circle cx="27" cy="28" r="1.8" fill="#1a202c" />
          <circle cx="37" cy="28" r="1.8" fill="#1a202c" />
          <line x1="28" y1="35" x2="36" y2="35" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" />
          {/* Fones de ouvido no pescoço */}
          <path d="M 22 42 Q 32 46 42 42" fill="none" stroke="#e53e3e" strokeWidth="3" />
          <circle cx="22" cy="42" r="3" fill="#e53e3e" />
          <circle cx="42" cy="42" r="3" fill="#e53e3e" />
          {/* Camiseta azul */}
          <path d="M 18 52 L 46 52 L 44 62 L 20 62 Z" fill="#2b6cb0" />
        </svg>
      );
    case 'clara':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="32" cy="32" r="30" fill="#fefcbf" stroke="#d69e2e" strokeWidth="2.5" />
          {/* Cabelo cacheado loiro/castanho claro */}
          <circle cx="22" cy="24" r="8" fill="#d69e2e" />
          <circle cx="42" cy="24" r="8" fill="#d69e2e" />
          <circle cx="32" cy="22" r="12" fill="#d69e2e" />
          {/* Rosto */}
          <circle cx="32" cy="30" r="12" fill="#fed7aa" />
          <circle cx="28" cy="29" r="1.8" fill="#1a202c" />
          <circle cx="36" cy="29" r="1.8" fill="#1a202c" />
          <path d="M 28 34 Q 32 39 36 34" fill="none" stroke="#c05621" strokeWidth="2" strokeLinecap="round" />
          {/* Camiseta roxa */}
          <path d="M 18 50 L 46 50 L 44 62 L 20 62 Z" fill="#805ad5" />
        </svg>
      );
    case 'lucia':
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="32" cy="32" r="30" fill="#c6f6d5" stroke="#38a169" strokeWidth="2.5" />
          {/* Cabelo grisalho elegante */}
          <circle cx="32" cy="26" r="15" fill="#a0aec0" />
          {/* Rosto */}
          <circle cx="32" cy="30" r="12" fill="#fed7aa" />
          {/* Óculos redondos de leitura */}
          <circle cx="27" cy="28" r="4" fill="none" stroke="#744210" strokeWidth="1.5" />
          <circle cx="37" cy="28" r="4" fill="none" stroke="#744210" strokeWidth="1.5" />
          <line x1="31" y1="28" x2="33" y2="28" stroke="#744210" strokeWidth="1.5" />
          <circle cx="27" cy="28" r="1.5" fill="#1a202c" />
          <circle cx="37" cy="28" r="1.5" fill="#1a202c" />
          <path d="M 29 35 Q 32 38 35 35" fill="none" stroke="#744210" strokeWidth="1.8" strokeLinecap="round" />
          {/* Cardigan verde escuro */}
          <path d="M 18 50 L 46 50 L 44 62 L 20 62 Z" fill="#276749" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" width={size} height={size}>
          <circle cx="32" cy="32" r="30" fill="#edf2f7" stroke="#cbd5e0" strokeWidth="2" />
          <circle cx="32" cy="28" r="12" fill="#a0aec0" />
          <path d="M 20 52 L 44 52 L 40 62 L 24 62 Z" fill="#718096" />
        </svg>
      );
  }
}

export function SocialCityArt() {
  return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="120" fill="#1a202c" />
      {/* Céu noturno com skyline 3D */}
      <polygon points="20,80 50,45 80,80" fill="#2d3748" />
      <rect x="25" y="45" width="28" height="55" rx="3" fill="#2b6cb0" />
      <rect x="65" y="30" width="35" height="70" rx="3" fill="#319795" />
      <rect x="110" y="50" width="30" height="50" rx="3" fill="#dd6b20" />
      {/* Janelas iluminadas */}
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <circle cx="34" cy={55 + row * 10} r="2" fill="#fefcbf" />
          <circle cx="44" cy={55 + row * 10} r="2" fill="#fefcbf" />
          <circle cx="75" cy={40 + row * 12} r="2.5" fill="#fefcbf" />
          <circle cx="88" cy={40 + row * 12} r="2.5" fill="#fefcbf" />
        </g>
      ))}
      {/* Faixa de pedestres e asfalto */}
      <rect x="0" y="95" width="160" height="25" fill="#4a5568" />
      <line x1="0" y1="95" x2="160" y2="95" stroke="#e2e8f0" strokeWidth="2" />
      <line x1="60" y1="108" x2="100" y2="108" stroke="#ffffff" strokeWidth="4" strokeDasharray="6 6" />
      {/* Balão de diálogo 3D social */}
      <path d="M 65 15 L 115 15 C 120 15, 120 28, 115 28 L 85 28 L 78 35 L 80 28 L 65 28 C 60 28, 60 15, 65 15 Z" fill="#ecc94b" />
      <text x="90" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#744210">💬 Olá!</text>
    </svg>
  );
}
