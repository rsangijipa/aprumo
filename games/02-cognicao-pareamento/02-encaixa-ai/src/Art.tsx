/**
 * Arte autoral em SVG inline (tabuleiro de madeira clara em recorte de papel, peças com pino,
 * cena da fazenda para o recorte). Cores só por tokens `--ea-*` (ver game.css).
 */
import type { CSSProperties } from 'react';
import type { PieceDef, Rect, Sensory, Theme } from './logic';
import { SCENE } from './logic';

const PIECE_TOKENS = new Set(['sol', 'ceu', 'folha', 'mostarda', 'coral', 'lilas', 'terracota', 'petroleo']);
export const pieceFill = (color: string) => (PIECE_TOKENS.has(color) ? `var(--ea-p-${color})` : color);

/** Filtros e símbolos compartilhados. `uid` evita colisão de ids. */
export function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      {/* Sombra interna de ~4 px: sugere profundidade da cavidade. */}
      <filter id={`${uid}-inset`} x="-20%" y="-20%" width="140%" height="140%">
        <feFlood floodColor="#4a3423" floodOpacity="0.45" result="c" />
        <feComposite in="c" in2="SourceAlpha" operator="out" result="outside" />
        <feOffset dx="0" dy="4" />
        <feGaussianBlur stdDeviation="3" result="s" />
        <feComposite in="s" in2="SourceAlpha" operator="in" result="inner" />
        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="inner" /></feMerge>
      </filter>
      <symbol id={`${uid}-scene`} viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} width={SCENE.w} height={SCENE.h}>
        <FarmScene />
      </symbol>
    </defs>
  );
}

/** Cena da fazenda (600×450) usada no quebra-cabeça de recorte. */
export function FarmScene() {
  return (
    <g>
      <rect className="ea-s-sky" width="600" height="450" />
      <circle className="ea-s-sun" cx="500" cy="78" r="40" />
      <path className="ea-s-cloud" d="M70,90a26,26 0 0 1 48,-14a20,20 0 0 1 34,12a16,16 0 0 1 -4,32h-72a18,18 0 0 1 -6,-30z" />
      <path className="ea-s-cloud" d="M300,60a20,20 0 0 1 38,-10a16,16 0 0 1 26,10a12,12 0 0 1 -2,24h-56a14,14 0 0 1 -6,-24z" />
      <path className="ea-s-hill2" d="M0,250Q140,170 300,230T600,210V450H0z" />
      <path className="ea-s-hill" d="M0,290Q170,230 330,280T600,270V450H0z" />
      {/* celeiro */}
      <path className="ea-s-barn" d="M70,330V250L130,205L190,250V330z" />
      <path className="ea-s-roof" d="M60,254L130,198L200,254L192,262L130,214L68,262z" />
      <rect className="ea-s-door" x="112" y="282" width="36" height="48" rx="4" />
      {/* árvore */}
      <rect className="ea-s-trunk" x="408" y="250" width="18" height="70" rx="6" />
      <circle className="ea-s-leaf" cx="417" cy="230" r="44" />
      <circle className="ea-s-leaf2" cx="390" cy="252" r="26" />
      <circle className="ea-s-leaf2" cx="446" cy="250" r="28" />
      {/* lago com pato */}
      <ellipse className="ea-s-pond" cx="300" cy="392" rx="120" ry="36" />
      <path className="ea-s-duck" d="M282,386a20,13 0 1 1 40,0a20,13 0 1 1 -40,0zM270,372a10,10 0 1 1 20,0a10,10 0 1 1 -20,0z" />
      <path className="ea-s-beak" d="M268,371l-12,4l12,4z" />
      {/* cerca */}
      <path className="ea-s-fence" d="M470,350h120M470,370h120M480,338v46M510,338v46M540,338v46M570,338v46" />
    </g>
  );
}

/** Tabuleiro e bandeja (madeira clara, papel recortado, sombra deslocada). */
export function Board({ board, tray, theme, sensory, frame, uid }: { board: Rect; tray: Rect; theme: Theme; sensory: Sensory; frame: Rect | null; uid: string }) {
  const deco = sensory !== 'minimal';
  return (
    <g aria-hidden="true">
      <rect className="ea-tray-shadow" x={tray.x + 5} y={tray.y + 7} width={tray.w} height={tray.h} rx="34" />
      <rect className="ea-tray" x={tray.x} y={tray.y} width={tray.w} height={tray.h} rx="34" />
      <rect className="ea-board-shadow" x={board.x + 6} y={board.y + 8} width={board.w} height={board.h} rx="40" />
      <rect className="ea-board" x={board.x} y={board.y} width={board.w} height={board.h} rx="40" />
      {deco && (
        <g className="ea-grain">
          {[0.22, 0.46, 0.71].map((t) => (
            <path key={t} d={`M${board.x + 40},${board.y + board.h * t}q${board.w / 4},-14 ${board.w / 2},0t${board.w / 2 - 80},0`} />
          ))}
        </g>
      )}
      {deco && theme === 'fazenda' && (
        <g>
          <clipPath id={`${uid}-boardclip`}><rect x={board.x} y={board.y} width={board.w} height={board.h} rx="40" /></clipPath>
          <g clipPath={`url(#${uid}-boardclip)`}>
            <path className="ea-farm-grass" d={`M${board.x},${board.y + board.h * 0.55}q${board.w / 3},-50 ${board.w / 2},-10t${board.w / 2},-20V${board.y + board.h}H${board.x}z`} />
            {sensory === 'rich' && <circle className="ea-farm-sun" cx={board.x + board.w - 70} cy={board.y + 70} r="34" />}
          </g>
        </g>
      )}
      {frame && <rect className="ea-frame" x={frame.x - 6} y={frame.y - 6} width={frame.w + 12} height={frame.h + 12} rx="14" />}
      {frame && theme === 'recorte' && (
        <use className="ea-ghost-scene" href={`#${uid}-scene`} x={frame.x} y={frame.y} width={frame.w} height={frame.h} />
      )}
    </g>
  );
}

/** Corpo da peça (sem pino): forma colorida com sombra de papel, ou pedaço da cena. */
export function PieceBody({ piece, scale, uid }: { piece: PieceDef; scale: number; uid: string }) {
  const t = `scale(${scale}) translate(${-piece.cx} ${-piece.cy})`;
  if (piece.tile) {
    const { x, y, w, h } = piece.tile;
    return (
      <g transform={t}>
        <rect className="ea-piece__shadow" x={x + 2} y={y + 4} width={w} height={h} rx="6" />
        <svg x={x} y={y} width={w} height={h} viewBox={`${x} ${y} ${w} ${h}`} overflow="hidden">
          <use href={`#${uid}-scene`} x="0" y="0" width={SCENE.w} height={SCENE.h} />
        </svg>
        <rect className="ea-piece__edge" x={x} y={y} width={w} height={h} rx="6" />
      </g>
    );
  }
  return (
    <g transform={t}>
      <path className="ea-piece__shadow" d={piece.d} transform="translate(2 5)" />
      <path className="ea-piece__body" d={piece.d} style={{ fill: pieceFill(piece.color) } as CSSProperties} />
      <path className="ea-piece__shine" d={piece.d} />
    </g>
  );
}

/** Pino de madeira (indica onde pegar). */
export function Pin({ r = 11 }: { r?: number }) {
  return (
    <g className="ea-pin" aria-hidden="true">
      <circle r={r + 2} className="ea-pin__base" cy="2" />
      <circle r={r} className="ea-pin__top" />
      <circle r={r * 0.35} cx={-r * 0.3} cy={-r * 0.35} className="ea-pin__hi" />
    </g>
  );
}

/** Seta curva de rotação (dica de girar). */
export function RotateHint({ r }: { r: number }) {
  const a0 = (-150 * Math.PI) / 180, a1 = (-30 * Math.PI) / 180;
  const p0 = { x: r * Math.cos(a0), y: r * Math.sin(a0) }, p1 = { x: r * Math.cos(a1), y: r * Math.sin(a1) };
  return (
    <g className="ea-rot-hint" aria-hidden="true">
      <path d={`M${p0.x},${p0.y}A${r},${r} 0 0 1 ${p1.x},${p1.y}`} />
      <path className="ea-rot-hint__head" d={`M${p1.x - 4},${p1.y - 14}L${p1.x + 10},${p1.y + 2}L${p1.x - 10},${p1.y + 8}Z`} />
    </g>
  );
}

/** Mão que conduz a peça fantasma (dica gestual). */
export function Hand() {
  return (
    <g className="ea-hand" aria-hidden="true" transform="translate(6 10)">
      <path d="M0,0c0,-8 10,-8 10,0v18c2,-4 10,-3 10,2c2,-3 9,-2 9,3c2,-2 8,-1 8,4v14c0,12 -8,20 -20,20h-4c-8,0 -12,-4 -16,-10l-10,-16c-3,-5 3,-10 8,-6l5,6z" />
    </g>
  );
}

export function Sparkles({ board }: { board: Rect }) {
  return (
    <g className="ea-sparkles" aria-hidden="true">
      {Array.from({ length: 12 }, (_, k) => (
        <circle key={k} r={5 + (k % 3) * 2} cx={board.x + ((k * 73) % board.w)} cy={board.y + board.h - 30 - ((k * 41) % 120)} style={{ '--k': k } as CSSProperties} />
      ))}
    </g>
  );
}
