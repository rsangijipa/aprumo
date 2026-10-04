/**
 * Arte própria do Olha Comigo (SVG inline, sem IP de franquia): o guia "Nino" — uma gotinha de
 * massinha azul-ardósia — e seis objetos em estilo Soft Clay. Cores vêm dos tokens --oc-*.
 */
import type { CSSProperties, ReactElement } from 'react';
import type { GazePose } from './logic';

export function Guide({ pose, pointing, smiling, side }: { pose: GazePose; pointing: boolean; smiling: boolean; side: 'left' | 'right' | 'center' }) {
  const shift = pose.headTurn * 0.7;
  const px = pose.eyeX * 5.5;
  const py = pose.eyeY * 5.5;
  // Pivô do braço: no ombro do lado do alvo (centro → braço direito).
  const sign = side === 'left' ? -1 : 1;
  const pivotX = 100 + sign * 46;
  const armStyle: CSSProperties = { transformOrigin: `${pivotX}px 140px`, transformBox: 'view-box', transform: `rotate(${pointing ? -pose.armAngle : sign > 0 ? 70 : 110}deg)` };
  return (
    <svg className="oc-guide__svg" viewBox="0 0 200 230" aria-hidden="true">
      <ellipse cx="100" cy="222" rx="70" ry="7" className="oc-shadow" />
      {/* corpo */}
      <path d="M100 52c46 0 70 40 70 92 0 48-28 74-70 74s-70-26-70-74c0-52 24-92 70-92z" className="oc-guide__body" />
      <ellipse cx="100" cy="176" rx="38" ry="30" className="oc-guide__belly" />
      {/* bracinhos em repouso */}
      {!pointing || sign > 0 ? <ellipse cx="38" cy="160" rx="10" ry="16" className="oc-guide__body" transform="rotate(14 38 160)" /> : null}
      {!pointing || sign < 0 ? <ellipse cx="162" cy="160" rx="10" ry="16" className="oc-guide__body" transform="rotate(-14 162 160)" /> : null}
      {/* braço que aponta: gira no ombro */}
      <g className="oc-guide__arm" data-on={pointing} style={armStyle}>
        <rect x={pivotX} y="131" width="62" height="18" rx="9" className="oc-guide__body" />
        <circle cx={pivotX + 64} cy="140" r="11" className="oc-guide__hand" />
        <rect x={pivotX + 66} y="135.5" width="18" height="9" rx="4.5" className="oc-guide__hand" />
      </g>
      {/* rosto: desliza para o lado do olhar (giro de cabeça) */}
      <g className="oc-guide__face" style={{ transform: `translateX(${shift}px)` }}>
        <ellipse cx="62" cy="122" rx="9" ry="6" className="oc-guide__cheek" />
        <ellipse cx="138" cy="122" rx="9" ry="6" className="oc-guide__cheek" />
        <ellipse cx="78" cy="100" rx="14" ry="16" className="oc-guide__eye" />
        <ellipse cx="122" cy="100" rx="14" ry="16" className="oc-guide__eye" />
        <g className="oc-guide__pupils" style={{ transform: `translate(${px}px, ${py}px)` }}>
          <circle cx="78" cy="101" r="7.5" className="oc-guide__pupil" />
          <circle cx="122" cy="101" r="7.5" className="oc-guide__pupil" />
          <circle cx="80.5" cy="98" r="2.4" className="oc-guide__glint" />
          <circle cx="124.5" cy="98" r="2.4" className="oc-guide__glint" />
        </g>
        <path
          d={smiling ? 'M84 128q16 16 32 0' : 'M88 130q12 8 24 0'}
          className="oc-guide__mouth"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
      {/* topete */}
      <path d="M96 54c-2-12 6-20 14-18-6 4-6 10-4 18z" className="oc-guide__tuft" />
    </svg>
  );
}

const OBJ: Record<string, ReactElement> = {
  'oc-bola': (
    <>
      <circle cx="50" cy="52" r="36" fill="var(--oc-obj-coral)" />
      <path d="M16 46q34 14 68 0M18 64q32 12 64 0" fill="none" stroke="var(--oc-obj-cream)" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="38" cy="34" rx="9" ry="5" fill="#fff" opacity=".45" />
    </>
  ),
  'oc-flor': (
    <>
      <rect x="47" y="56" width="6" height="34" rx="3" fill="var(--oc-obj-leaf)" />
      <ellipse cx="62" cy="76" rx="11" ry="6" fill="var(--oc-obj-leaf)" transform="rotate(-25 62 76)" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="50" cy="26" rx="12" ry="16" fill="var(--oc-obj-pink)" transform={`rotate(${a} 50 42)`} />
      ))}
      <circle cx="50" cy="42" r="10" fill="var(--oc-obj-sun)" />
    </>
  ),
  'oc-barco': (
    <>
      <path d="M50 14v50" stroke="var(--oc-obj-ink)" strokeWidth="5" strokeLinecap="round" />
      <path d="M54 18l26 38H54z" fill="var(--oc-obj-cream)" stroke="var(--oc-obj-ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M14 64h72q-6 22-24 22H38Q20 86 14 64z" fill="var(--oc-obj-sky)" />
      <path d="M10 92q10-6 20 0t20 0 20 0 20 0" fill="none" stroke="var(--oc-obj-sky)" strokeWidth="4" strokeLinecap="round" opacity=".6" />
    </>
  ),
  'oc-balao': (
    <>
      <path d="M50 74q-6 10 2 16t-2 10" fill="none" stroke="var(--oc-obj-ink)" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="50" cy="40" rx="28" ry="33" fill="var(--oc-obj-sun)" />
      <path d="M45 72h10l-5 6z" fill="var(--oc-obj-sun)" />
      <ellipse cx="40" cy="26" rx="7" ry="10" fill="#fff" opacity=".45" />
    </>
  ),
  'oc-pato': (
    <>
      <ellipse cx="50" cy="66" rx="34" ry="22" fill="var(--oc-obj-sun)" />
      <circle cx="64" cy="36" r="17" fill="var(--oc-obj-sun)" />
      <path d="M78 36q14 2 14 8-8 4-16 0z" fill="var(--oc-obj-coral)" />
      <circle cx="68" cy="32" r="3.5" fill="var(--oc-obj-ink)" />
      <path d="M32 62q12 12 28 4" fill="none" stroke="var(--oc-obj-cream)" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  'oc-tambor': (
    <>
      <path d="M18 34v36q32 20 64 0V34" fill="var(--oc-obj-coral)" />
      <path d="M18 40l16 30M50 44v34M82 40L66 70" stroke="var(--oc-obj-cream)" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="50" cy="34" rx="32" ry="12" fill="var(--oc-obj-cream)" stroke="var(--oc-obj-ink)" strokeWidth="2.5" />
      <path d="M66 6l-10 26M84 10L62 30" stroke="var(--oc-obj-wood)" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
};

export function SceneObject({ id }: { id: string }) {
  return (
    <svg className="oc-obj__svg" viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="96" rx="30" ry="4" className="oc-shadow" />
      {OBJ[id] ?? <circle cx="50" cy="50" r="34" fill="var(--oc-obj-sky)" />}
    </svg>
  );
}
