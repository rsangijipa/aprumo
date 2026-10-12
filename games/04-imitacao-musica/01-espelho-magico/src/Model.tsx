import {
  BLOCK_TOWER, SHOULDER_L, SHOULDER_R, blockPosition, solveArm,
  type HandShape, type ImitationAction, type Pose, type Pt,
} from './logic';

/** Ponto do "contato" para o anel suave de feedback da batida. */
export function rippleAt(action: ImitationAction, pose: Pose): Pt {
  if (action.prop === 'drum') return { x: 120, y: 206 };
  if (action.prop === 'block') return { x: BLOCK_TOWER.x, y: BLOCK_TOWER.y + 11 };
  if (action.id === 'pular') return { x: 120, y: 252 };
  return { x: (pose.lh.x + pose.rh.x) / 2, y: (pose.lh.y + pose.rh.y) / 2 + pose.lift };
}

function Hand({ elbow, hand, shape, scale }: { elbow: Pt; hand: Pt; shape: HandShape; scale: number }) {
  const r = 10.5 * scale;
  const ang = Math.atan2(hand.y - elbow.y, hand.x - elbow.x);
  const at = (o: number, d: number): Pt => ({ x: hand.x + Math.cos(ang + o) * d, y: hand.y + Math.sin(ang + o) * d });
  if (shape === 'point') {
    const tip = at(0, r + 13 * scale);
    return (
      <g className="em-hand">
        <line x1={hand.x} y1={hand.y} x2={tip.x} y2={tip.y} strokeWidth={6.5 * scale} />
        <circle cx={hand.x} cy={hand.y} r={r * 0.9} />
      </g>
    );
  }
  if (shape === 'fist') {
    const thumb = at(1.25, r * 0.75);
    return (
      <g className="em-hand">
        <circle cx={hand.x} cy={hand.y} r={r * 0.92} />
        <circle cx={thumb.x} cy={thumb.y} r={r * 0.36} />
      </g>
    );
  }
  return (
    <g className="em-hand">
      {[-1, -0.5, 0, 0.5, 1].map((o) => {
        const f = at(o, r * 1.02);
        return <circle key={o} cx={f.x} cy={f.y} r={r * 0.34} />;
      })}
      <circle cx={hand.x} cy={hand.y} r={r} />
    </g>
  );
}

function Arm({ shoulder, target, shape, scale }: { shoulder: Pt; target: Pt; shape: HandShape; scale: number }) {
  const { elbow, hand } = solveArm(shoulder, target);
  return (
    <g>
      <path className="em-arm" d={`M${shoulder.x} ${shoulder.y} L${elbow.x} ${elbow.y} L${hand.x} ${hand.y}`} />
      <Hand elbow={elbow} hand={hand} shape={shape} scale={scale} />
    </g>
  );
}

/** Personagem original "Lume": reflexo arredondado, sem traços de franquia. */
export function Model({ pose, action, happy, ripple, sparkle }: {
  pose: Pose;
  action: ImitationAction | undefined;
  happy: boolean;
  ripple: { key: number; at: Pt } | null;
  sparkle: boolean;
}) {
  const lift = pose.lift;
  const feetY = 250 + Math.min(0, lift);
  const hipY = 196 + lift;
  const scale = action?.handScale ?? 1;
  const blk = action?.prop === 'block' ? blockPosition(pose) : null;
  const shadow = Math.max(0.55, 1 - Math.max(0, -lift) / 60);

  return (
    <svg className="em-model" viewBox="0 0 240 280" role="img" aria-label={action ? `Modelo fazendo: ${action.label}` : 'Modelo no espelho'}>
      <ellipse className="em-shadow" cx={120} cy={254} rx={44 * shadow} ry={7 * shadow} />

      <g className="em-legs">
        <path d={`M107 ${hipY} L106 ${feetY - 6}`} />
        <path d={`M133 ${hipY} L134 ${feetY - 6}`} />
        <ellipse className="em-foot" cx={103} cy={feetY - 2} rx={13} ry={6.5} />
        <ellipse className="em-foot" cx={137} cy={feetY - 2} rx={13} ry={6.5} />
      </g>

      <g transform={`translate(0 ${lift})`}>
        <rect className="em-body" x={90} y={114} width={60} height={88} rx={28} />
        <ellipse className="em-belly" cx={120} cy={164} rx={18} ry={24} />
        <path className="em-tuft" d="M120 42 C 112 30, 116 22, 124 20 C 122 28, 128 33, 120 42 Z" />
        <circle className="em-body" cx={120} cy={78} r={38} />
        <ellipse className="em-gloss" cx={104} cy={60} rx={11} ry={7} transform="rotate(-28 104 60)" />
        {happy ? (
          <g className="em-eyes-happy">
            <path d="M100 77 Q106 70 112 77" />
            <path d="M128 77 Q134 70 140 77" />
          </g>
        ) : (
          <g className="em-eyes">
            <ellipse cx={106} cy={76} rx={4.6} ry={6} />
            <ellipse cx={134} cy={76} rx={4.6} ry={6} />
          </g>
        )}
        <circle className="em-cheek" cx={97} cy={90} r={6} />
        <circle className="em-cheek" cx={143} cy={90} r={6} />
        <path className="em-mouth" d={happy ? 'M107 90 Q120 104 133 90' : 'M111 92 Q120 98 129 92'} />
      </g>

      {action?.prop === 'drum' && (
        <g className="em-drum">
          <rect x={86} y={206} width={68} height={36} rx={10} />
          <path className="em-drum__zig" d="M90 216 L101 232 L112 216 L123 232 L134 216 L145 232 L150 224" />
          <ellipse className="em-drum__head" cx={120} cy={206} rx={34} ry={9} />
        </g>
      )}

      {blk && (
        <g className="em-blocks">
          <rect className="em-table" x={68} y={212} width={124} height={8} rx={4} />
          <rect className="em-block em-block--base" x={109} y={190} width={22} height={22} rx={5} />
          <rect className="em-block em-block--move" x={blk.x - 11} y={blk.y - 11} width={22} height={22} rx={5} />
        </g>
      )}

      {ripple && ripple.key > 0 && (
        <ellipse key={ripple.key} className="em-ripple" cx={ripple.at.x} cy={ripple.at.y} rx={16} ry={10} />
      )}

      <g transform={`translate(0 ${lift})`}>
        <Arm shoulder={SHOULDER_L} target={pose.lh} shape={pose.lShape} scale={scale} />
        <Arm shoulder={SHOULDER_R} target={pose.rh} shape={pose.rShape} scale={scale} />
      </g>

      {sparkle && (
        <g className="em-sparkle" aria-hidden="true">
          {([[44, 60], [196, 52], [208, 150], [34, 160]] as const).map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x} ${y - 8} L${x + 2.5} ${y - 2.5} L${x + 8} ${y} L${x + 2.5} ${y + 2.5} L${x} ${y + 8} L${x - 2.5} ${y + 2.5} L${x - 8} ${y} L${x - 2.5} ${y - 2.5} Z`} />
          ))}
        </g>
      )}
    </svg>
  );
}
