/**
 * Arte autoral em SVG inline (recorte de papel): veículos com rodas separadas, rampa de papelão,
 * estrada de terra vermelha, igarapé com ponte de madeira, túnel, pinos e caixa-alvo.
 * Cores só por tokens --rm-* (definidos em game.css).
 */
import type { ReactNode } from 'react';
import type { VehicleId } from './logic';
import { PIN_H, pointAt, type BuiltTrack, type Lane } from './physics';

const wheel = (cx: number, r: number, spin: number, key: string) => (
  <g key={key} transform={`translate(${cx} ${-r}) rotate(${(spin * 180) / Math.PI})`}>
    <circle r={r} fill="var(--rm-tire)" />
    <circle r={r * 0.45} fill="var(--rm-hub)" />
    <rect x={-r * 0.12} y={-r * 0.85} width={r * 0.24} height={r * 0.5} rx={r * 0.1} fill="var(--rm-hub)" />
  </g>
);

function Face({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="rm-face">
      <circle cx={-5} cy={0} r={2.2} fill="var(--rm-ink)" />
      <circle cx={5} cy={0} r={2.2} fill="var(--rm-ink)" />
      <path d="M-4 5 Q0 8 4 5" fill="none" stroke="var(--rm-ink)" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

/** Veículo com a base em y=0 e centrado em x=0, virado para a direita. */
export function Vehicle({ id, spin = 0, faces = false, tone = 'child' }: { id: VehicleId; spin?: number; faces?: boolean; tone?: 'child' | 'adult' }) {
  const body = tone === 'adult' ? 'var(--rm-adult-body)' : `var(--rm-${id})`;
  const edge = 'var(--rm-edge)';
  switch (id) {
    case 'bolinha':
      return (
        <g className="rm-veh">
          <g transform={`translate(0 -20) rotate(${(spin * 180) / Math.PI})`}>
            <circle r={20} fill={body} stroke={edge} strokeWidth={2.5} />
            <path d="M-20 0 A20 20 0 0 0 20 0 A20 9 0 0 1 -20 0Z" fill="var(--rm-paper-shade)" opacity={0.55} />
            <circle cx={-7} cy={-8} r={4} fill="var(--rm-paper)" opacity={0.7} />
          </g>
          {faces && <Face x={0} y={-22} />}
        </g>
      );
    case 'caminhao':
      return (
        <g className="rm-veh">
          <rect x={-45} y={-46} width={56} height={34} rx={7} fill={body} stroke={edge} strokeWidth={2.5} />
          <path d="M11 -40 h18 q10 0 14 10 l2 18 h-34z" fill={body} stroke={edge} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M16 -35 h11 q6 0 8 6 l1 7 h-20z" fill="var(--rm-glass)" />
          {faces && <Face x={34} y={-20} s={0.8} />}
          {wheel(-28, 10, spin, 'a')}{wheel(-6, 10, spin, 'b')}{wheel(32, 10, spin, 'c')}
        </g>
      );
    case 'onibus':
      return (
        <g className="rm-veh">
          <rect x={-50} y={-50} width={100} height={40} rx={10} fill={body} stroke={edge} strokeWidth={2.5} />
          {[-40, -20, 0, 20].map((x) => <rect key={x} x={x} y={-44} width={14} height={13} rx={3} fill="var(--rm-glass)" />)}
          <rect x={36} y={-44} width={10} height={20} rx={3} fill="var(--rm-glass)" />
          <rect x={-50} y={-24} width={100} height={4} fill="var(--rm-paper)" opacity={0.6} />
          {faces && <Face x={42} y={-18} s={0.7} />}
          {wheel(-30, 10, spin, 'a')}{wheel(30, 10, spin, 'b')}
        </g>
      );
    default:
      return (
        <g className="rm-veh">
          <path d="M-37 -12 v-12 q0 -6 6 -7 l12 -2 l10 -11 q3 -3 8 -3 h18 q5 0 8 4 l9 12 l10 2 q6 1 6 7 v10z" fill={body} stroke={edge} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M-14 -33 l8 -9 h10 v9z M8 -33 v-9 h8 q3 0 5 3 l5 6z" fill="var(--rm-glass)" />
          {faces && <Face x={28} y={-22} s={0.75} />}
          {wheel(-22, 11, spin, 'a')}{wheel(22, 11, spin, 'b')}
        </g>
      );
  }
}

/** Escala para caber num cartão quadrado de escolha/garagem. */
export function VehicleIcon({ id, faces }: { id: VehicleId; faces: boolean }) {
  return (
    <svg viewBox="-60 -62 120 72" className="rm-icon" aria-hidden="true">
      <Vehicle id={id} faces={faces} />
    </svg>
  );
}

/** Pontos do trecho com balanço da ponte (só desenho; a física é plana). */
export function sway(x: number, x0: number, x1: number, amp: number) {
  if (amp === 0 || x <= x0 || x >= x1) return 0;
  return amp * Math.sin((Math.PI * (x - x0)) / (x1 - x0));
}

export function Scenery({ track, span, decor, rich }: { track: BuiltTrack; span: number; decor: boolean; rich: boolean }) {
  const g = track.ground;
  const bridges = track.segs.filter((s) => s.kind === 'bridge');
  const W = span;
  if (!decor) return <rect x={0} y={g} width={W} height={1200 - g} fill="var(--rm-floor-min)" />;
  // Chão de terra vermelha com recortes nos vãos do igarapé.
  const cuts = bridges.map((b) => [b.x0 + 10, b.x1 - 10] as const);
  const groundParts: ReactNode[] = [];
  let x = 0;
  cuts.forEach(([a, b], k) => {
    groundParts.push(<rect key={`g${k}`} x={x} y={g} width={a - x} height={1200 - g} fill="var(--rm-dirt)" />);
    x = b;
  });
  groundParts.push(<rect key="gl" x={x} y={g} width={W - x} height={1200 - g} fill="var(--rm-dirt)" />);
  return (
    <g aria-hidden="true">
      <rect x={0} y={-600} width={W} height={1800} fill="var(--rm-sky)" />
      {/* morros de papel */}
      <path d={`M0 ${g - 70} Q ${W * 0.2} ${g - 170} ${W * 0.42} ${g - 80} T ${W} ${g - 110} V ${g} H0Z`} fill="var(--rm-hill-far)" />
      <path d={`M0 ${g - 30} Q ${W * 0.3} ${g - 110} ${W * 0.6} ${g - 40} T ${W} ${g - 50} V ${g} H0Z`} fill="var(--rm-hill)" />
      {rich && (
        <g className="rm-trees">
          {[0.08, 0.5, 0.78].map((f, k) => (
            <g key={k} transform={`translate(${W * f + 260} ${g - 40})`}>
              <rect x={-4} y={-10} width={8} height={40} rx={3} fill="var(--rm-trunk)" />
              <ellipse cx={0} cy={-22} rx={26} ry={22} fill="var(--rm-leaf)" />
            </g>
          ))}
        </g>
      )}
      {cuts.map(([a, b], k) => (
        <g key={`w${k}`}>
          <rect x={a} y={g + 18} width={b - a} height={1200 - g} fill="var(--rm-water)" />
          <path d={`M${a} ${g + 30} q 20 -6 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} fill="none" stroke="var(--rm-water-line)" strokeWidth={3} className="rm-ripple" />
        </g>
      ))}
      {groundParts}
      <rect x={0} y={g} width={W} height={6} fill="var(--rm-dirt-edge)" />
    </g>
  );
}

/** Rampa de papelão (faixa com espessura) e apoios; ponte de pranchas; túnel desenhado à parte. */
export function TrackShape({ track, swayAmp, lift = 0 }: { track: BuiltTrack; swayAmp: number; lift?: number }) {
  const T = 16;
  return (
    <g transform={`translate(0 ${lift})`}>
      {track.segs.map((s, k) => {
        if (s.kind === 'bridge') {
          const n = Math.max(4, Math.round((s.x1 - s.x0) / 24));
          const w = (s.x1 - s.x0) / n;
          return (
            <g key={k}>
              <path d={`M${s.x0} ${s.y0 - 26} Q ${(s.x0 + s.x1) / 2} ${s.y0 - 6 + swayAmp} ${s.x1} ${s.y1 - 26}`} fill="none" stroke="var(--rm-rope)" strokeWidth={3} />
              {Array.from({ length: n }, (_, i) => {
                const cx = s.x0 + w * (i + 0.5);
                return <rect key={i} x={s.x0 + w * i + 1} y={s.y0 + sway(cx, s.x0, s.x1, swayAmp)} width={w - 2} height={10} rx={2} fill={i % 2 ? 'var(--rm-wood)' : 'var(--rm-wood-2)'} />;
              })}
            </g>
          );
        }
        const nx = Math.sin(s.angle), ny = Math.cos(s.angle);
        const pts = `${s.x0},${s.y0} ${s.x1},${s.y1} ${s.x1},${s.y1 + T} ${s.x0},${s.y0 + T}`;
        return (
          <g key={k}>
            {s.angle > 0 && (
              <>
                <rect x={s.x0 + 14} y={s.y0 + T} width={10} height={track.ground - s.y0 - T} fill="var(--rm-support)" />
                <rect x={(s.x0 + s.x1) / 2} y={(s.y0 + s.y1) / 2 + T} width={10} height={Math.max(0, track.ground - (s.y0 + s.y1) / 2 - T)} fill="var(--rm-support)" />
              </>
            )}
            <polygon points={pts} fill={s.angle > 0 ? 'var(--rm-cardboard)' : 'var(--rm-road)'} />
            <line x1={s.x0} y1={s.y0} x2={s.x1} y2={s.y1} stroke={s.angle > 0 ? 'var(--rm-cardboard-edge)' : 'var(--rm-road-edge)'} strokeWidth={4} strokeLinecap="round" />
            {s.angle > 0 && <line x1={s.x0 + nx * 6} y1={s.y0 + ny * 8} x2={s.x1 + nx * 6} y2={s.y1 + ny * 8} stroke="var(--rm-cardboard-edge)" strokeDasharray="10 12" strokeWidth={2} opacity={0.5} />}
          </g>
        );
      })}
    </g>
  );
}

export function TunnelFront({ track, lift = 0 }: { track: BuiltTrack; lift?: number }) {
  return (
    <g transform={`translate(0 ${lift})`} aria-hidden="true">
      {track.segs.filter((s) => s.kind === 'tunnel').map((s, k) => (
        <g key={k}>
          <path d={`M${s.x0} ${s.y0 + 4} V ${s.y0 - 70} Q ${(s.x0 + s.x1) / 2} ${s.y0 - 130} ${s.x1} ${s.y0 - 70} V ${s.y0 + 4}Z`} fill="var(--rm-tunnel)" stroke="var(--rm-tunnel-edge)" strokeWidth={3} />
          <path d={`M${s.x0 + 18} ${s.y0 - 74} Q ${(s.x0 + s.x1) / 2} ${s.y0 - 116} ${s.x1 - 18} ${s.y0 - 74}`} fill="none" stroke="var(--rm-paper)" strokeWidth={3} opacity={0.5} strokeDasharray="6 10" />
        </g>
      ))}
    </g>
  );
}

/** Trava no topo: portãozinho que abre (gira) quando o adulto libera. */
export function Gate({ track, at, open, waiting, lift = 0 }: { track: BuiltTrack; at: number; open: boolean; waiting: boolean; lift?: number }) {
  const p = pointAt(track, at);
  const x = p.x;
  const y = p.y + lift;
  return (
    <g transform={`translate(${x} ${y})`} className="rm-gate" data-open={open} data-waiting={waiting}>
      <rect x={-6} y={-8} width={12} height={16} rx={3} fill="var(--rm-gate-post)" />
      <g className="rm-gate__bar" style={{ transform: `rotate(${open ? -80 : 0}deg)` }}>
        <rect x={-5} y={-62} width={10} height={58} rx={5} fill="var(--rm-gate)" stroke="var(--rm-edge)" strokeWidth={2} />
      </g>
    </g>
  );
}

export function Target({ track, lane, lift = 0 }: { track: BuiltTrack; lane: Lane; lift?: number }) {
  const g = track.ground + lift;
  const p0 = track.segs[track.segs.length - 1]!;
  const wallX = p0.x1;
  return (
    <g aria-hidden="true">
      <rect x={wallX} y={g - 90} width={14} height={90} rx={4} fill="var(--rm-garage)" />
      {track.bumperS != null && (() => {
        const x = p0.x0 + 60;
        const sq = Math.max(-0.4, Math.min(0.4, lane.squash));
        return (
          <g transform={`translate(${x} ${g}) scale(${1 - sq * 0.5} ${1 + sq * 0.3})`}>
            <rect x={0} y={-60} width={58} height={60} rx={8} fill="var(--rm-box)" stroke="var(--rm-edge)" strokeWidth={2.5} />
            <path d="M8 -30 h42 M29 -52 v44" stroke="var(--rm-box-tape)" strokeWidth={6} strokeLinecap="round" />
          </g>
        );
      })()}
      {lane.pins.map((p, k) => {
        const x = p0.x0 + (p.s - p0.s0);
        return (
          <g key={k} transform={`translate(${x} ${g}) rotate(${(p.phi * 180) / Math.PI})`}>
            <rect x={-6} y={-PIN_H} width={12} height={PIN_H} rx={6} fill={k % 2 ? 'var(--rm-pin)' : 'var(--rm-pin-2)'} stroke="var(--rm-edge)" strokeWidth={2} />
            <rect x={-6} y={-PIN_H + 12} width={12} height={5} fill="var(--rm-pin-band)" />
          </g>
        );
      })}
    </g>
  );
}

export function Garage({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <path d="M-80 0 V-74 L0 -112 L80 -74 V0Z" fill="var(--rm-garage)" stroke="var(--rm-edge)" strokeWidth={3} strokeLinejoin="round" />
      <rect x={-64} y={-70} width={128} height={70} rx={6} fill="var(--rm-garage-in)" />
    </g>
  );
}
