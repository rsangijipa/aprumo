/* Arte autoral em SVG inline: personagens de pelúcia em "massa de modelar" e objetos em recorte de papel. */
import type { ReactElement } from 'react';
import type { CharState, CharacterId, ObjectId, PlaceId, ZoneId } from './logic';
import { ZONE_GEOMETRY } from './logic';

/* ------------------------------------------------------------------ objetos (viewBox 64×64) */

const ICONS: Record<ObjectId, ReactElement> = {
  colher: (
    <g transform="rotate(-35 32 32)">
      <ellipse cx="32" cy="17" rx="10" ry="13" className="lu-i-metal" />
      <ellipse cx="30" cy="14" rx="4" ry="6" className="lu-i-gloss" />
      <rect x="29" y="27" width="6" height="31" rx="3" className="lu-i-metal" />
    </g>
  ),
  prato: (
    <g>
      <ellipse cx="32" cy="38" rx="27" ry="15" className="lu-i-plate" />
      <ellipse cx="32" cy="36" rx="17" ry="8" className="lu-i-plate-in" />
    </g>
  ),
  copo: (
    <g>
      <path d="M17 14 h30 l-4 40 a5 5 0 0 1 -5 4 h-12 a5 5 0 0 1 -5 -4 z" className="lu-i-glass" />
      <path d="M20 28 h24 l-2.6 25 a3 3 0 0 1 -3 2.6 h-12.8 a3 3 0 0 1 -3 -2.6 z" className="lu-i-water" />
      <rect x="22" y="17" width="4" height="30" rx="2" className="lu-i-gloss" />
    </g>
  ),
  banana: (
    <g>
      <path d="M12 22 C14 44 34 56 54 46 C56 44 55 41 52 42 C36 46 24 38 20 20 C19 16 12 17 12 22 z" className="lu-i-banana" />
      <path d="M12 21 l-2 -6 4 -1 2 6 z" className="lu-i-stem" />
    </g>
  ),
  pao: (
    <g>
      <ellipse cx="32" cy="36" rx="26" ry="15" className="lu-i-bread" />
      <path d="M20 30 q4 6 8 2 M30 28 q4 6 8 2 M40 30 q3 5 6 2" className="lu-i-score" />
    </g>
  ),
  'arroz-feijao': (
    <g>
      <path d="M8 32 h48 a24 20 0 0 1 -48 0 z" className="lu-i-bowl" />
      <path d="M11 32 a21 9 0 0 1 21 -9 v9 z" className="lu-i-rice" />
      <path d="M32 23 a21 9 0 0 1 21 9 h-21 z" className="lu-i-beans" />
    </g>
  ),
  acai: (
    <g>
      <path d="M8 30 h48 a24 22 0 0 1 -48 0 z" className="lu-i-bowl-dark" />
      <ellipse cx="32" cy="30" rx="24" ry="8" className="lu-i-acai" />
      <circle cx="24" cy="29" r="4" className="lu-i-banana" />
      <circle cx="35" cy="27" r="4" className="lu-i-banana" />
      <circle cx="42" cy="31" r="2" className="lu-i-granola" />
      <circle cx="29" cy="32" r="2" className="lu-i-granola" />
    </g>
  ),
  melancia: (
    <g>
      <path d="M6 24 a26 26 0 0 0 52 0 z" className="lu-i-rind" />
      <path d="M11 24 a21 21 0 0 0 42 0 z" className="lu-i-melon" />
      <ellipse cx="24" cy="32" rx="1.8" ry="3" className="lu-i-seed" />
      <ellipse cx="34" cy="36" rx="1.8" ry="3" className="lu-i-seed" />
      <ellipse cx="42" cy="30" rx="1.8" ry="3" className="lu-i-seed" />
    </g>
  ),
  guardanapo: (
    <g>
      <path d="M10 16 h44 v32 l-12 8 h-32 z" className="lu-i-napkin" />
      <path d="M42 56 v-8 h12" className="lu-i-fold" />
      <path d="M16 24 h32 M16 32 h32 M16 40 h22" className="lu-i-napkin-line" />
    </g>
  ),
  cobertor: (
    <g>
      <rect x="6" y="16" width="52" height="34" rx="9" className="lu-i-blanket" />
      <path d="M6 28 h52 M6 40 h52" className="lu-i-blanket-stripe" />
      <path d="M14 50 v5 M24 50 v5 M34 50 v5 M44 50 v5" className="lu-i-fringe" />
    </g>
  ),
  escova: (
    <g transform="rotate(-30 32 32)">
      <ellipse cx="32" cy="20" rx="13" ry="15" className="lu-i-brush" />
      <path d="M24 14 v12 M28 11 v18 M32 10 v20 M36 11 v18 M40 14 v12" className="lu-i-bristle" />
      <rect x="28.5" y="33" width="7" height="25" rx="3.5" className="lu-i-brush" />
    </g>
  ),
  esponja: (
    <g>
      <rect x="10" y="20" width="44" height="30" rx="10" className="lu-i-sponge" />
      <circle cx="22" cy="31" r="3" className="lu-i-hole" />
      <circle cx="36" cy="38" r="2.5" className="lu-i-hole" />
      <circle cx="44" cy="28" r="2" className="lu-i-hole" />
      <circle cx="50" cy="14" r="5" className="lu-i-bubble" />
      <circle cx="42" cy="9" r="3" className="lu-i-bubble" />
    </g>
  ),
  bloco: (
    <g>
      <path d="M32 10 l20 10 v24 l-20 10 l-20 -10 v-24 z" className="lu-i-block" />
      <path d="M12 20 l20 10 l20 -10 M32 30 v24" className="lu-i-block-edge" />
    </g>
  ),
};

export function ItemIcon({ id }: { id: ObjectId }) {
  return (
    <svg viewBox="0 0 64 64" className="lu-icon" aria-hidden="true" focusable="false">
      <ellipse cx="32" cy="58" rx="20" ry="3.5" className="lu-i-shadow" />
      {ICONS[id]}
    </svg>
  );
}

/* ------------------------------------------------------------------ personagem (cena 400×400) */

function Eyes({ state }: { state: CharState }) {
  const closed = state === 'dormindo';
  const happy = state === 'comendo' || state === 'satisfeito' || state === 'limpando';
  const sleepy = state === 'sono';
  const wide = state === 'surpresa';
  return (
    <g className="lu-eyes">
      {[170, 230].map((x) =>
        closed ? (
          <path key={x} d={`M${x - 11} 124 q11 8 22 0`} className="lu-line" />
        ) : happy ? (
          <path key={x} d={`M${x - 10} 126 q10 -12 20 0`} className="lu-line" />
        ) : sleepy ? (
          <g key={x}>
            <circle cx={x} cy="125" r="7" className="lu-eye" />
            <path d={`M${x - 11} 120 h22`} className="lu-lid" />
          </g>
        ) : (
          <g key={x} className="lu-eye-open">
            <circle cx={x} cy="122" r={wide ? 10 : 7.5} className="lu-eye" />
            <circle cx={x + 2.5} cy="119" r="2.4" className="lu-glint" />
          </g>
        ),
      )}
      {(state === 'surpresa' || state === 'ue') && (
        <g className="lu-brows">
          <path d={state === 'ue' ? 'M158 100 q12 -6 22 0' : 'M158 102 q12 -8 22 0'} className="lu-line" />
          <path d={state === 'ue' ? 'M220 106 q12 2 22 0' : 'M220 102 q12 -8 22 0'} className="lu-line" />
        </g>
      )}
    </g>
  );
}

function Mouth({ state }: { state: CharState }) {
  switch (state) {
    case 'esperando':
      return <ellipse cx="200" cy="170" rx="15" ry="13" className="lu-mouth-open" />;
    case 'fome':
    case 'sede':
      return <ellipse cx="200" cy="170" rx="8" ry="7" className="lu-mouth-open" />;
    case 'sono':
      return <ellipse cx="200" cy="172" rx="11" ry="15" className="lu-mouth-open lu-yawn" />;
    case 'surpresa':
      return <ellipse cx="200" cy="172" rx="9" ry="11" className="lu-mouth-open" />;
    case 'comendo':
      return <ellipse cx="200" cy="170" rx="13" ry="9" className="lu-mouth-open lu-chomp" />;
    case 'bebendo':
      return <circle cx="200" cy="170" r="6" className="lu-mouth-open" />;
    case 'ue':
      return <path d="M186 172 q7 -6 14 0 q7 6 14 0" className="lu-line" />;
    case 'dormindo':
      return <path d="M192 170 q8 5 16 0" className="lu-line" />;
    case 'satisfeito':
    case 'limpando':
      return <path d="M182 164 q18 20 36 0 z" className="lu-mouth-open" />;
    default:
      return <path d="M186 166 q14 12 28 0" className="lu-line" />;
  }
}

function Head({ character }: { character: CharacterId }) {
  const muzzle = character === 'urso' || character === 'cachorro';
  return (
    <g className="lu-head">
      {character === 'urso' && (
        <g>
          <circle cx="138" cy="62" r="27" className="lu-fur" />
          <circle cx="262" cy="62" r="27" className="lu-fur" />
          <circle cx="138" cy="62" r="13" className="lu-inner" />
          <circle cx="262" cy="62" r="13" className="lu-inner" />
        </g>
      )}
      {character === 'boneca' && (
        <g>
          <circle cx="122" cy="92" r="30" className="lu-hair" />
          <circle cx="278" cy="92" r="30" className="lu-hair" />
        </g>
      )}
      {character === 'avo' && <circle cx="200" cy="44" r="26" className="lu-hair" />}
      <circle cx="200" cy="125" r="80" className="lu-fur" />
      <ellipse cx="176" cy="84" rx="26" ry="14" className="lu-gloss" transform="rotate(-20 176 84)" />
      {(character === 'boneca' || character === 'avo') && (
        <path d="M122 118 C126 60 274 60 278 118 C262 92 236 84 200 86 C164 84 138 92 122 118 z" className="lu-hair" />
      )}
      {character === 'cachorro' && (
        <g>
          <ellipse cx="124" cy="122" rx="22" ry="48" className="lu-inner" transform="rotate(16 124 122)" />
          <ellipse cx="276" cy="122" rx="22" ry="48" className="lu-inner" transform="rotate(-16 276 122)" />
        </g>
      )}
      {muzzle && <ellipse cx="200" cy="160" rx="40" ry="30" className="lu-muzzle" />}
      {muzzle && <ellipse cx="200" cy="146" rx="12" ry="8" className="lu-nose" />}
      <circle cx="148" cy="152" r="12" className="lu-cheek" />
      <circle cx="252" cy="152" r="12" className="lu-cheek" />
    </g>
  );
}

export interface CharacterProps {
  character: CharacterId;
  state: CharState;
  covered: boolean;
  dirty: boolean;
  holding: { id: ObjectId; zone: ZoneId } | null;
}

export function Character({ character, state, covered, dirty, holding }: CharacterProps) {
  const glasses = character === 'avo';
  return (
    <g className="lu-char" data-char={character} data-state={state}>
      <ellipse cx="200" cy="384" rx="110" ry="12" className="lu-shadow" />
      <g className="lu-breathe">
        <ellipse cx="150" cy="366" rx="32" ry="20" className="lu-fur" />
        <ellipse cx="250" cy="366" rx="32" ry="20" className="lu-fur" />
        <ellipse cx="200" cy="286" rx="88" ry="86" className="lu-cloth" />
        <ellipse cx="200" cy="298" rx="54" ry="50" className="lu-belly" />
        <ellipse cx="116" cy="268" rx="24" ry="44" className="lu-fur" transform="rotate(24 116 268)" />
        <ellipse cx="284" cy="268" rx="24" ry="44" className="lu-fur" transform="rotate(-24 284 268)" />
        {state === 'fome' && (
          <g className="lu-rumble">
            <path d="M166 300 q6 -6 12 0 q6 6 12 0" className="lu-mark" />
            <path d="M210 300 q6 -6 12 0 q6 6 12 0" className="lu-mark" />
          </g>
        )}
        {covered && (
          <path d="M98 240 C140 222 260 222 302 240 L312 352 C260 372 140 372 88 352 z" className="lu-blanket" />
        )}
        <g className="lu-headbob">
          <Head character={character} />
          <Eyes state={state} />
          {glasses && (
            <g className="lu-glasses">
              <circle cx="170" cy="122" r="17" />
              <circle cx="230" cy="122" r="17" />
              <path d="M187 120 q13 -6 26 0" />
            </g>
          )}
          <Mouth state={state} />
          {dirty && (
            <g className="lu-dirt">
              <circle cx="226" cy="172" r="7" />
              <circle cx="236" cy="164" r="4" />
              <circle cx="166" cy="168" r="5" />
            </g>
          )}
        </g>
      </g>
      {state === 'dormindo' && (
        <g className="lu-zzz" aria-hidden="true">
          <text x="270" y="78">z</text>
          <text x="292" y="54" className="lu-zzz-2">z</text>
        </g>
      )}
      {state === 'sede' && <path d="M300 92 q12 18 0 26 q-12 -8 0 -26 z" className="lu-drop" />}
      {(state === 'ue' || state === 'surpresa') && (
        <g className="lu-bubble">
          <rect x="276" y="34" width={state === 'ue' ? 56 : 84} height="46" rx="20" />
          <text x={state === 'ue' ? 304 : 318} y="66">{state === 'ue' ? '?' : 'Ops!'}</text>
        </g>
      )}
      {state === 'limpando' && (
        <g className="lu-suds">
          <circle cx="150" cy="190" r="9" />
          <circle cx="256" cy="196" r="7" />
          <circle cx="240" cy="96" r="6" />
        </g>
      )}
      {holding && (
        <svg
          x={ZONE_GEOMETRY[holding.zone].x - 36}
          y={ZONE_GEOMETRY[holding.zone].y - (holding.zone === 'boca' ? 20 : 36)}
          width="72"
          height="72"
          viewBox="0 0 64 64"
          className="lu-held"
        >
          {ICONS[holding.id]}
        </svg>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ cenários */

export function Backdrop({ place }: { place: PlaceId }) {
  return (
    <g className="lu-backdrop" data-place={place}>
      <rect width="400" height="400" className="lu-wall" />
      {place === 'mesa' && (
        <g className="lu-blur">
          {/* filtro de barro ao fundo, desfocado */}
          <ellipse cx="342" cy="150" rx="34" ry="40" className="lu-clay" />
          <ellipse cx="342" cy="102" rx="26" ry="16" className="lu-clay" />
          <rect x="332" y="186" width="20" height="40" rx="6" className="lu-clay-dark" />
          <rect x="30" y="60" width="70" height="56" rx="10" className="lu-window" />
        </g>
      )}
      {place === 'cama' && (
        <g className="lu-blur">
          <rect x="70" y="40" width="260" height="140" rx="60" className="lu-headboard" />
          <circle cx="54" cy="70" r="20" className="lu-moon" />
        </g>
      )}
      {place === 'banheira' && (
        <g className="lu-blur">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={i * 84 - 6} y="40" width="76" height="76" rx="12" className="lu-tile" />
          ))}
        </g>
      )}
    </g>
  );
}

export function Foreground({ place, cup }: { place: PlaceId; cup: { tipped: boolean; dropY: number | null } }) {
  if (place === 'mesa') {
    return (
      <g className="lu-fore">
        <rect x="0" y="336" width="400" height="64" className="lu-cloth-table" />
        <rect x="0" y="336" width="400" height="64" fill="url(#lu-xadrez)" />
        <rect x="0" y="332" width="400" height="8" rx="4" className="lu-table-edge" />
        <ellipse cx="96" cy="346" rx="40" ry="11" className="lu-i-plate" />
        <ellipse cx="96" cy="344" rx="25" ry="6" className="lu-i-plate-in" />
        <g className="lu-cup" data-tipped={cup.tipped} transform={cup.tipped ? 'rotate(80 318 346)' : undefined}>
          <path d="M304 304 h28 l-3 38 a4 4 0 0 1 -4 4 h-14 a4 4 0 0 1 -4 -4 z" className="lu-i-glass" />
          <path d="M307 318 h22 l-2 22 h-18 z" className="lu-i-water" />
        </g>
        {cup.tipped && <ellipse cx="350" cy="350" rx={30} ry="6" className="lu-puddle" />}
        {cup.dropY != null && <circle cx="356" cy={cup.dropY} r="6" className="lu-i-water" />}
      </g>
    );
  }
  if (place === 'cama') {
    return (
      <g className="lu-fore">
        <rect x="20" y="346" width="360" height="54" rx="22" className="lu-bed" />
        <path d="M20 360 h360" className="lu-bed-line" />
      </g>
    );
  }
  return (
    <g className="lu-fore">
      <rect x="30" y="318" width="340" height="82" rx="38" className="lu-tub" />
      <circle cx="90" cy="318" r="18" className="lu-foam" />
      <circle cx="122" cy="310" r="14" className="lu-foam" />
      <circle cx="286" cy="314" r="16" className="lu-foam" />
      <circle cx="316" cy="320" r="12" className="lu-foam" />
    </g>
  );
}

export function Patterns() {
  return (
    <defs>
      <pattern id="lu-xadrez" width="32" height="32" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" className="lu-check" />
        <rect x="16" y="16" width="16" height="16" className="lu-check" />
      </pattern>
    </defs>
  );
}

/** Miniatura do personagem para a escolha de abertura. */
export function CharacterThumb({ character }: { character: CharacterId }) {
  return (
    <svg viewBox="40 20 320 380" className="lu-thumb" aria-hidden="true" focusable="false">
      <Character character={character} state="satisfeito" covered={false} dirty={false} holding={null} />
    </svg>
  );
}

export function PlaceThumb({ place }: { place: PlaceId }) {
  return (
    <svg viewBox="0 0 400 400" className="lu-thumb" aria-hidden="true" focusable="false">
      <Patterns />
      <Backdrop place={place} />
      <Foreground place={place} cup={{ tipped: false, dropY: null }} />
    </svg>
  );
}
