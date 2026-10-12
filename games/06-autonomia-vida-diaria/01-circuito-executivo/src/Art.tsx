/** Circuito Executivo — arte própria: robô Bip, bateria, gota, cartas do DCCS. */

export type BipMood = 'idle' | 'happy' | 'think' | 'oops';

export function Bip({ mood = 'idle' }: { mood?: BipMood }) {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <path d="M60 8v14" stroke="var(--circ-ink)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="8" r="6" fill={mood === 'oops' ? '#ff8a65' : 'var(--circ-led)'} stroke="var(--circ-ink)" strokeWidth="3" />
      <rect x="20" y="22" width="80" height="62" rx="18" fill="var(--circ-bot)" stroke="var(--circ-ink)" strokeWidth="4" />
      <rect x="30" y="34" width="60" height="34" rx="12" fill="var(--circ-screen)" stroke="var(--circ-ink)" strokeWidth="3" />
      {mood === 'happy' ? (
        <g stroke="var(--circ-led)" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M40 52q6-8 12 0M68 52q6-8 12 0" />
          <path d="M50 60q10 6 20 0" />
        </g>
      ) : mood === 'think' ? (
        <g fill="var(--circ-led)">
          <rect x="40" y="46" width="12" height="6" rx="3" />
          <rect x="68" y="46" width="12" height="6" rx="3" />
          <path d="M52 60h16" stroke="var(--circ-led)" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : mood === 'oops' ? (
        <g stroke="#ff8a65" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M40 46l10 8M50 46l-10 8M70 46l10 8M80 46l-10 8" />
          <path d="M52 62q8-4 16 0" />
        </g>
      ) : (
        <g fill="var(--circ-led)">
          <circle cx="46" cy="50" r="5" />
          <circle cx="74" cy="50" r="5" />
          <path d="M52 60q8 4 16 0" stroke="var(--circ-led)" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      )}
      <rect x="40" y="84" width="40" height="18" rx="6" fill="var(--circ-bot)" stroke="var(--circ-ink)" strokeWidth="4" />
      <path d="M20 54h-10M100 54h10" stroke="var(--circ-ink)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="44" cy="110" r="7" fill="var(--circ-ink)" />
      <circle cx="76" cy="110" r="7" fill="var(--circ-ink)" />
    </svg>
  );
}

export function Battery() {
  return (
    <svg viewBox="0 0 60 80" width="100%" height="100%" aria-hidden="true">
      <rect x="22" y="4" width="16" height="8" rx="2" fill="#4a4a4a" />
      <rect x="10" y="10" width="40" height="64" rx="8" fill="#ffd54a" stroke="#3a3020" strokeWidth="4" />
      <path d="M34 20 20 44h12l-6 20 16-28H30z" fill="#fff" stroke="#3a3020" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function Drop() {
  return (
    <svg viewBox="0 0 60 80" width="100%" height="100%" aria-hidden="true">
      <path d="M30 6C18 26 10 38 10 52a20 20 0 0 0 40 0c0-14-8-26-20-46z" fill="#5ab4f0" stroke="#1f4c7a" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="22" cy="50" rx="5" ry="9" fill="#fff" opacity=".6" />
    </svg>
  );
}

const COLOR_HEX = { laranja: '#f28c28', azul: '#2f6fb0' } as const;

export function ShapeCard({ color, shape, border = false }: { color: 'laranja' | 'azul'; shape: 'engrenagem' | 'raio'; border?: boolean }) {
  const c = COLOR_HEX[color];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" aria-hidden="true">
      <rect x="4" y="4" width="92" height="112" rx="14" fill="#fff" stroke={border ? '#1b1b1b' : '#c9d3db'} strokeWidth={border ? 10 : 3} strokeDasharray={border ? '0' : '0'} />
      {shape === 'engrenagem' ? (
        <g transform="translate(50 60)">
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x="-7" y="-36" width="14" height="14" rx="3" fill={c} transform={`rotate(${i * 45})`} />
          ))}
          <circle r="26" fill={c} />
          <circle r="10" fill="#fff" />
        </g>
      ) : (
        <path d="M58 18 30 66h18l-8 36 32-52H52z" fill={c} stroke="#1b1b1b" strokeWidth="2" strokeLinejoin="round" />
      )}
    </svg>
  );
}
