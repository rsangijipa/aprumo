export function DetectiveBadge() {
  return (
    <svg viewBox="0 0 100 100" width="48" height="48" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#d68c71" />
      <polygon points="50,16 60,38 84,38 64,52 72,76 50,62 28,76 36,52 16,38 40,38" fill="#faf9f6" />
      <circle cx="50" cy="50" r="16" fill="#3f6b67" />
      <text x="50" y="55" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">🔍</text>
    </svg>
  );
}

export function MagnifyingGlass() {
  return (
    <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
      <circle cx="26" cy="26" r="18" fill="none" stroke="#3f6b67" strokeWidth="6" />
      <line x1="40" y1="40" x2="58" y2="58" stroke="#3f6b67" strokeWidth="7" strokeLinecap="round" />
      <circle cx="22" cy="22" r="5" fill="#faf9f6" opacity="0.6" />
    </svg>
  );
}

export function CaseAvatar({ characterId }: { characterId: string }) {
  if (characterId === 'caso-apresentacao') {
    // Lucas - Ansioso
    return (
      <svg viewBox="0 0 100 100" width="100" height="100" aria-label="Lucas apreensivo">
        <circle cx="50" cy="50" r="40" fill="#fed7aa" />
        <path d="M 20 40 C 20 18, 80 18, 80 40 Z" fill="#1e293b" />
        <path d="M 28 36 Q 38 32 46 38" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 54 38 Q 62 32 72 36" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="36" cy="46" rx="6" ry="7" fill="#fff" stroke="#0f172a" strokeWidth="2" />
        <circle cx="36" cy="46" r="3" fill="#0f172a" />
        <ellipse cx="64" cy="46" rx="6" ry="7" fill="#fff" stroke="#0f172a" strokeWidth="2" />
        <circle cx="64" cy="46" r="3" fill="#0f172a" />
        <path d="M 78 36 C 80 32, 84 36, 82 40 C 80 42, 76 40, 78 36 Z" fill="#38bdf8" />
        <path d="M 38 68 Q 44 65 50 68 Q 56 71 62 68" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (characterId === 'caso-festa-surpresa') {
    // Clara - Surpresa agradável
    return (
      <svg viewBox="0 0 100 100" width="100" height="100" aria-label="Clara surpresa e feliz">
        <circle cx="50" cy="50" r="40" fill="#fed7aa" />
        <circle cx="24" cy="44" r="14" fill="#78350f" />
        <circle cx="76" cy="44" r="14" fill="#78350f" />
        <path d="M 22 40 C 22 14, 78 14, 78 40 Z" fill="#78350f" />
        <path d="M 30 32 Q 38 28 46 33" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 54 33 Q 62 28 70 32" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="38" cy="44" r="6" fill="#1e293b" />
        <circle cx="36" cy="42" r="2" fill="#fff" />
        <circle cx="62" cy="44" r="6" fill="#1e293b" />
        <circle cx="60" cy="42" r="2" fill="#fff" />
        <ellipse cx="50" cy="68" rx="8" ry="10" fill="#be123c" />
        <circle cx="28" cy="56" r="5" fill="#fca5a5" opacity="0.6" />
        <circle cx="72" cy="56" r="5" fill="#fca5a5" opacity="0.6" />
      </svg>
    );
  }

  if (characterId === 'caso-brinquedo-quebrado') {
    // Miguel - Triste / Frustrado
    return (
      <svg viewBox="0 0 100 100" width="100" height="100" aria-label="Miguel chateado">
        <circle cx="50" cy="50" r="40" fill="#fed7aa" />
        <path d="M 22 42 C 22 20, 78 20, 78 42 Z" fill="#b45309" />
        <path d="M 30 36 Q 38 40 46 36" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 54 36 Q 62 40 70 36" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="38" cy="48" rx="5" ry="3" fill="#1e293b" />
        <ellipse cx="62" cy="48" rx="5" ry="3" fill="#1e293b" />
        <path d="M 38 72 Q 50 64 62 72" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  // Bianca - Orgulhosa
  return (
    <svg viewBox="0 0 100 100" width="100" height="100" aria-label="Bianca orgulhosa">
      <circle cx="50" cy="50" r="40" fill="#fed7aa" />
      <path d="M 20 40 C 20 16, 80 16, 80 40 Z" fill="#0284c7" />
      <path d="M 32 35 Q 40 32 46 35" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 54 35 Q 60 32 68 35" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 32 46 Q 38 42 44 46" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 56 46 Q 62 42 68 46" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 36 64 Q 50 78 64 64" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="28" cy="54" r="5" fill="#fca5a5" opacity="0.6" />
      <circle cx="72" cy="54" r="5" fill="#fca5a5" opacity="0.6" />
    </svg>
  );
}
