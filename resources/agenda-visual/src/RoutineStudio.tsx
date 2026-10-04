/**
 * Studio de Rotina Visual (Wave 4).
 *  - Modo editor (profissional): monta a rotina, escolhe Primeiro → Depois ou sequência,
 *    horizontal/vertical, e a duração de cada etapa (timer circular).
 *  - Modo criança: uma tarefa por vez, timer circular integrado e botão "Concluí" (≥64px).
 * Emite SCHEDULE_ITEM_STARTED / SCHEDULE_ITEM_COMPLETED (payloads do @aprumo/protocol).
 * Nenhum evento é emitido em efeitos (seguro sob StrictMode): só por toque.
 */
import { useState } from 'react';
import { CircularTimer } from './CircularTimer';
import {
  backStep, completeStep, firstThen, initialRoutine, isFinished, resolveVariant, startStep,
  type Orientation, type RoutineEvent, type RoutineState, type Variant,
} from './logic';
import { Picto, PICTOS, type PictoKey } from './pictos';
import { VisualSchedule, type ScheduleItem } from './VisualSchedule';
import './studio.css';

export type RoutineLayout = 'sequence' | 'first-then';

interface Common {
  scheduleId: string;
  items: ScheduleItem[];
  layout?: RoutineLayout;
  orientation?: Orientation;
  motion?: 'full' | 'reduced' | 'static';
  sensory?: 'minimal' | 'normal' | 'rich';
  palette?: 'calm' | 'vivid' | 'high-contrast';
  ageYears?: number | null;
  variant?: Variant;
}

export interface RoutineStudioProps extends Common {
  mode: 'editor' | 'child';
  /** Editor: alterações na rotina e no layout. */
  onChange?: (next: { items: ScheduleItem[]; layout: RoutineLayout; orientation: Orientation }) => void;
  onEvent?: (e: RoutineEvent) => void;
  /** Após "Concluí", a próxima etapa inicia sozinha (padrão: true). A primeira sempre começa por toque. */
  autoStart?: boolean;
  onFinished?: () => void;
}

export function RoutineStudio(p: RoutineStudioProps) {
  return p.mode === 'editor' ? <RoutineEditor {...p} /> : <RoutineChild {...p} />;
}

const DURATIONS = [0, 60, 120, 300, 600, 900];
const PICTO_KEYS = Object.keys(PICTOS) as PictoKey[];
let seq = 0;
const newId = () => `step-${Date.now().toString(36)}-${(seq++).toString(36)}`;

function RoutineEditor(p: RoutineStudioProps) {
  const layout = p.layout ?? 'sequence';
  const orientation = p.orientation ?? 'horizontal';
  const v = resolveVariant(p);
  const emit = (patch: Partial<{ items: ScheduleItem[]; layout: RoutineLayout; orientation: Orientation }>) =>
    p.onChange?.({ items: p.items, layout, orientation, ...patch });
  const setItem = (k: number, patch: Partial<ScheduleItem>) => emit({ items: p.items.map((it, i) => (i === k ? { ...it, ...patch } : it)) });
  const move = (k: number, d: -1 | 1) => {
    const j = k + d;
    if (j < 0 || j >= p.items.length) return;
    const next = [...p.items];
    [next[k], next[j]] = [next[j]!, next[k]!];
    emit({ items: next });
  };

  return (
    <section className="rs" data-variant={v} data-palette={p.palette ?? 'calm'} data-motion={p.motion ?? 'reduced'} aria-label="Editor de rotina visual">
      <div className="rs-toolbar">
        <fieldset className="rs-seg">
          <legend>Formato</legend>
          {(['first-then', 'sequence'] as const).map((l) => (
            <button key={l} type="button" aria-pressed={layout === l} onClick={() => emit({ layout: l })}>{l === 'first-then' ? 'Primeiro → Depois' : 'Sequência'}</button>
          ))}
        </fieldset>
        <fieldset className="rs-seg" disabled={layout === 'first-then'}>
          <legend>Direção</legend>
          {(['horizontal', 'vertical'] as const).map((o) => (
            <button key={o} type="button" aria-pressed={orientation === o} onClick={() => emit({ orientation: o })}>{o === 'horizontal' ? 'Horizontal' : 'Vertical'}</button>
          ))}
        </fieldset>
      </div>

      <ol className="rs-list">
        {p.items.map((it, k) => (
          <li key={it.id} className="rs-row">
            <span className="rs-row__picto"><Picto k={it.picto} /></span>
            <select aria-label={`Pictograma da etapa ${k + 1}`} value={it.picto} onChange={(e) => setItem(k, { picto: e.target.value as PictoKey, label: undefined })}>
              {PICTO_KEYS.map((key) => <option key={key} value={key}>{PICTOS[key].label}</option>)}
            </select>
            <input aria-label={`Rótulo da etapa ${k + 1}`} value={it.label ?? ''} placeholder={PICTOS[it.picto].label} onChange={(e) => setItem(k, { label: e.target.value || undefined })} />
            <select aria-label={`Tempo da etapa ${k + 1}`} value={it.durationSec ?? 0} onChange={(e) => setItem(k, { durationSec: Number(e.target.value) || undefined })}>
              {DURATIONS.map((d) => <option key={d} value={d}>{d ? `${d / 60} min` : 'Sem timer'}</option>)}
            </select>
            <span className="rs-row__actions">
              <button type="button" aria-label={`Subir etapa ${k + 1}`} onClick={() => move(k, -1)} disabled={k === 0}>↑</button>
              <button type="button" aria-label={`Descer etapa ${k + 1}`} onClick={() => move(k, 1)} disabled={k === p.items.length - 1}>↓</button>
              <button type="button" aria-label={`Remover etapa ${k + 1}`} onClick={() => emit({ items: p.items.filter((_, i) => i !== k) })}>✕</button>
            </span>
          </li>
        ))}
      </ol>
      <button type="button" className="rs-add" onClick={() => emit({ items: [...p.items, { id: newId(), picto: 'brincar' }] })}>+ Adicionar etapa</button>

      <div className="rs-preview" aria-label="Pré-visualização">
        {p.items.length > 0 && (
          <VisualSchedule items={p.items} current={0} mode={layout} orientation={orientation} motion="static" palette={p.palette} variant={v} />
        )}
      </div>
    </section>
  );
}

function RoutineChild(p: RoutineStudioProps) {
  const v = resolveVariant(p);
  const [s, setS] = useState<RoutineState>(initialRoutine);
  const items = p.items;
  const run = (r: { state: RoutineState; events: RoutineEvent[] }) => {
    setS(r.state);
    r.events.forEach((e) => p.onEvent?.(e));
    if (isFinished(r.state, items.length) && !isFinished(s, items.length)) p.onFinished?.();
  };
  const now = () => Date.now();
  const { first: cur, then: next } = firstThen(items, s.current);
  const done = isFinished(s, items.length);
  const label = (it: ScheduleItem) => it.label ?? PICTOS[it.picto].label;
  const motion = p.sensory === 'minimal' ? 'static' : (p.motion ?? 'reduced');

  const card = cur && (
    <div className="rc-card"><Picto k={cur.picto} /></div>
  );

  return (
    <section
      className="rc" data-variant={v} data-palette={p.palette ?? 'calm'} data-motion={motion} data-sensory={p.sensory ?? 'normal'}
      data-layout={p.layout ?? 'sequence'} aria-label="Rotina: uma tarefa por vez"
    >
      {done ? (
        <div className="rc-finish" role="status">
          <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" className="rc-finish__disc" /><path d="m32 51 12 12 24-26" className="rc-finish__check" /></svg>
          <p>Rotina concluída</p>
        </div>
      ) : cur ? (
        <>
          <p className="rc-kicker">{p.layout === 'first-then' ? 'Primeiro' : `Agora · ${s.current + 1} de ${items.length}`}</p>
          <div className="rc-stage">
            {cur.durationSec && s.startedAt !== null ? (
              <CircularTimer durationSec={cur.durationSec} startedAt={s.startedAt} motion={motion}>{card}</CircularTimer>
            ) : (
              card
            )}
          </div>
          <h2 className="rc-label">{label(cur)}</h2>
          {s.startedAt === null ? (
            <button type="button" className="rc-btn" onClick={() => run(startStep(s, items, p.scheduleId, now()))}>Começar</button>
          ) : (
            <button type="button" className="rc-btn" onClick={() => run(completeStep(s, items, p.scheduleId, now(), p.autoStart ?? true))}>Concluí</button>
          )}
          {next && (
            <p className="rc-next">
              <span>Depois:</span>
              <span className="rc-next__picto"><Picto k={next.picto} /></span>
              <strong>{label(next)}</strong>
            </p>
          )}
        </>
      ) : null}
      {s.current > 0 && (
        <button type="button" className="rc-back" onClick={() => setS(backStep(s))} aria-label="Voltar uma etapa (adulto)">Voltar etapa</button>
      )}
    </section>
  );
}
