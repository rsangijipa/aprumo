import React from 'react';

interface AvatarProps {
  id: string;
  size?: number;
  className?: string;
}

export const CharacterAvatar: React.FC<AvatarProps> = ({ id, size = 48, className = '' }) => {
  switch (id) {
    case 'avatar-player':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#536DFE" />
          <circle cx="50" cy="40" r="20" fill="#F6F6F3" />
          <path d="M22 84c4-18 16-24 28-24s24 6 28 24" fill="#3D5AFE" />
          {/* Fones de ouvido modernos */}
          <path d="M26 38c0-14 10-22 24-22s24 8 24 22" stroke="#20252C" strokeWidth="6" strokeLinecap="round" />
          <rect x="22" y="34" width="8" height="14" rx="4" fill="#E16C68" />
          <rect x="70" y="34" width="8" height="14" rx="4" fill="#E16C68" />
          {/* Olhos e expressão */}
          <circle cx="43" cy="38" r="2.5" fill="#20252C" />
          <circle cx="57" cy="38" r="2.5" fill="#20252C" />
          <path d="M46 47c2 2 6 2 8 0" stroke="#20252C" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'avatar-cris':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#45B5A4" />
          <circle cx="50" cy="42" r="19" fill="#F6F6F3" />
          {/* Cabelo raspado lateral / moderno */}
          <path d="M30 38c0-12 8-22 20-22s22 8 22 20c-8-4-18-2-26 2z" fill="#20252C" />
          <path d="M24 86c5-17 15-22 26-22s21 5 26 22" fill="#359889" />
          <circle cx="44" cy="42" r="2.5" fill="#20252C" />
          <circle cx="56" cy="42" r="2.5" fill="#20252C" />
          <path d="M45 49c3 3 7 3 10 0" stroke="#20252C" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'avatar-rafa':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#E16C68" />
          <circle cx="50" cy="40" r="19" fill="#F6F6F3" />
          {/* Boné virado para trás */}
          <path d="M29 32c0-8 9-16 21-16s21 8 21 16z" fill="#20252C" />
          <path d="M24 33h52v4H24z" fill="#344052" />
          <path d="M24 86c5-18 16-24 26-24s21 6 26 24" fill="#C95753" />
          <circle cx="43" cy="40" r="2.5" fill="#20252C" />
          <circle cx="57" cy="40" r="2.5" fill="#20252C" />
          {/* Sorriso animado */}
          <path d="M44 48c3 4 9 4 12 0" stroke="#20252C" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'avatar-bia':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#8B75D7" />
          <circle cx="50" cy="42" r="18" fill="#F6F6F3" />
          {/* Cabelo cacheado volumoso */}
          <path d="M28 46c-6-16 6-28 22-28s28 12 22 28c-4-4-10-6-16-6s-18 3-28 6z" fill="#344052" />
          <path d="M24 88c4-19 16-25 26-25s22 6 26 25" fill="#765EC4" />
          {/* Óculos delicados */}
          <rect x="36" y="38" width="11" height="9" rx="3" stroke="#20252C" strokeWidth="2" fill="none" />
          <rect x="53" y="38" width="11" height="9" rx="3" stroke="#20252C" strokeWidth="2" fill="none" />
          <path d="M47 42h6" stroke="#20252C" strokeWidth="2" />
          <path d="M46 51c2 1 6 1 8 0" stroke="#20252C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'avatar-leo':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#344052" />
          <circle cx="50" cy="40" r="19" fill="#F6F6F3" />
          <path d="M30 36c2-14 12-20 20-20s18 6 20 20z" fill="#536DFE" />
          <path d="M23 86c5-17 16-23 27-23s22 6 27 23" fill="#20252C" />
          <circle cx="43" cy="40" r="2.5" fill="#20252C" />
          <circle cx="57" cy="40" r="2.5" fill="#20252C" />
          <path d="M45 48h10" stroke="#20252C" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'avatar-sam':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#62C7B8" />
          <circle cx="50" cy="42" r="18" fill="#F6F6F3" />
          {/* Franja estilosa */}
          <path d="M32 30c6-10 18-12 28-8 8 3 12 10 10 20-6-6-16-8-24-4-6 3-10 8-14 12z" fill="#8B75D7" />
          <path d="M25 87c4-18 15-24 25-24s21 6 25 24" fill="#359889" />
          <circle cx="43" cy="42" r="2.5" fill="#20252C" />
          <circle cx="57" cy="42" r="2.5" fill="#20252C" />
          <path d="M46 50c2 2 6 2 8 0" stroke="#20252C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'avatar-maya':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#EB8784" />
          <circle cx="50" cy="41" r="18" fill="#F6F6F3" />
          {/* Cabelo comprido solto */}
          <path d="M28 32c3-12 14-18 22-18s19 6 22 18c2 8 2 24-2 30-4-10-8-14-12-14s-8 4-12 14c-4-6-4-22-18-30z" fill="#20252C" />
          <path d="M24 88c4-19 16-25 26-25s22 6 26 25" fill="#E16C68" />
          <circle cx="43" cy="41" r="2.5" fill="#20252C" />
          <circle cx="57" cy="41" r="2.5" fill="#20252C" />
          <path d="M45 49c3 3 7 3 10 0" stroke="#20252C" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'avatar-roberto':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#3D5AFE" />
          <circle cx="50" cy="40" r="19" fill="#F6F6F3" />
          {/* Cabelo curto e barba estilizada */}
          <path d="M30 30c3-10 12-14 20-14s17 4 20 14z" fill="#20252C" />
          <path d="M40 50c3 4 17 4 20 0-2 6-8 10-10 10s-8-4-10-10z" fill="#344052" />
          <path d="M23 86c5-17 16-23 27-23s22 6 27 23" fill="#20252C" />
          <circle cx="43" cy="38" r="2.5" fill="#20252C" />
          <circle cx="57" cy="38" r="2.5" fill="#20252C" />
        </svg>
      );

    case 'avatar-prof':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#765EC4" />
          <circle cx="50" cy="41" r="18" fill="#F6F6F3" />
          {/* Coque clássico */}
          <circle cx="50" cy="18" r="10" fill="#344052" />
          <path d="M30 32c3-10 12-14 20-14s17 4 20 14z" fill="#344052" />
          <path d="M24 88c4-19 16-25 26-25s22 6 26 25" fill="#4A596F" />
          <rect x="36" y="38" width="11" height="8" rx="2" stroke="#20252C" strokeWidth="2" fill="none" />
          <rect x="53" y="38" width="11" height="8" rx="2" stroke="#20252C" strokeWidth="2" fill="none" />
          <path d="M47 42h6" stroke="#20252C" strokeWidth="2" />
          <path d="M46 51h8" stroke="#20252C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'avatar-stranger1':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#20252C" />
          <circle cx="50" cy="42" r="18" fill="#F6F6F3" />
          {/* Máscara gamer ou capuz neon */}
          <path d="M26 36c4-18 16-24 24-24s20 6 24 24c0 14-8 26-24 26s-24-12-24-26z" fill="#344052" />
          <path d="M36 38h28v12H36z" rx="6" fill="#1B2129" />
          {/* Visor holográfico azul neon */}
          <path d="M38 43h24" stroke="#536DFE" strokeWidth="4" strokeLinecap="round" />
          <path d="M22 86c4-18 16-24 28-24s24 6 28 24" fill="#1B2129" />
        </svg>
      );

    case 'avatar-system':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#1B2129" />
          <rect x="25" y="25" width="50" height="50" rx="14" fill="#344052" stroke="#45B5A4" strokeWidth="3" />
          <path d="M50 34v16M50 58v2" stroke="#45B5A4" strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="28" stroke="#536DFE" strokeWidth="2" strokeDasharray="6 4" />
        </svg>
      );

    case 'avatar-unknown':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
          <circle cx="50" cy="50" r="50" fill="#344052" />
          <circle cx="50" cy="42" r="18" fill="#4A596F" />
          <path d="M26 86c4-18 15-24 24-24s20 6 24 24" fill="#20252C" />
          <text x="50" y="49" fill="#D6DDE7" fontSize="22" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">?</text>
        </svg>
      );
  }
};
