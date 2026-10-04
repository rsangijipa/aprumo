/**
 * Agenda Visual — sequência ("varal") e primeiro–depois.
 * O cartão atual fica em destaque; os concluídos viram e vão para o envelope "acabou".
 * O aviso de transição (`warning`) antecipa a mudança, reduzindo comportamento-problema em transições.
 */
import type { ReactNode } from 'react';
import { Picto, PICTOS, type PictoKey } from './pictos';
import { CircularTimer } from './CircularTimer';
import { firstThen, resolveVariant, stepStatus, type Orientation, type Variant } from './logic';
import './schedule.css';

export interface ScheduleItem {
  id: string;
  picto: PictoKey;
  /** Rótulo curto; por padrão, o do pictograma. */
  label?: string;
  /** Duração planejada (s) — alimenta o timer circular da etapa atual. */
  durationSec?: number;
}

const labelOf = (it: ScheduleItem) => it.label ?? PICTOS[it.picto].label;

export function VisualSchedule({
  items,
  current,
  mode = 'sequence',
  warning = false,
  motion = 'reduced',
  palette = 'calm',
  orientation = 'horizontal',
  timerStartedAt,
  ageYears,
  variant,
}: {
  items: ScheduleItem[];
  current: number;
  mode?: 'sequence' | 'first-then';
  warning?: boolean;
  motion?: 'full' | 'reduced' | 'static';
  palette?: 'calm' | 'vivid' | 'high-contrast';
  orientation?: Orientation;
  /** Início (ms) da etapa atual; com `durationSec` no item, mostra o timer circular integrado. */
  timerStartedAt?: number | null;
  ageYears?: number | null;
  variant?: Variant;
}) {
  const v = resolveVariant({ variant, ageYears });
  const cur = items[current];
  const timed = cur?.durationSec && timerStartedAt !== undefined ? cur.durationSec : 0;
  const withTimer = (node: ReactNode) =>
    timed ? <CircularTimer durationSec={timed} startedAt={timerStartedAt ?? null} motion={motion} showClock={false}>{node}</CircularTimer> : node;

  if (mode === 'first-then') {
    const { first, then } = firstThen(items, current);
    return (
      <section className="av av--ft" data-motion={motion} data-palette={palette} data-variant={v} data-orientation={orientation} aria-label="Primeiro, depois">
        {[first, then].map((it, k) =>
          it ? (
            <figure key={it.id} className="av-ft" data-current={k === 0} data-warning={k === 0 && warning}>
              <figcaption>{k === 0 ? 'Primeiro' : 'Depois'}</figcaption>
              <div className="av-ft__card">{k === 0 ? withTimer(<Picto k={it.picto} />) : <Picto k={it.picto} />}</div>
              <span className="av-label">{labelOf(it)}</span>
            </figure>
          ) : null,
        )}
      </section>
    );
  }

  const done = items.slice(0, current);
  return (
    <section className="av" data-motion={motion} data-palette={palette} data-variant={v} data-orientation={orientation} aria-label={`Agenda: ${items.map(labelOf).join(', ')}`}>
      <ol className="av-line">
        {items.map((it, k) => {
          const state = stepStatus(k, current);
          return (
            <li key={it.id} className="av-item" data-state={state} data-warning={state === 'current' && warning} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="av-pin" aria-hidden="true" />
              <div className="av-card">
                {state === 'done' ? (
                  <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="#e6f2ec" /><path d="m33 51 12 12 23-25" fill="none" stroke="#2f7d5a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : state === 'current' ? (
                  withTimer(<Picto k={it.picto} />)
                ) : (
                  <Picto k={it.picto} />
                )}
              </div>
              <span className="av-label">{labelOf(it)}</span>
            </li>
          );
        })}
      </ol>
      <div className="av-envelope" aria-label={`${done.length} concluídas`}>
        <svg viewBox="0 0 64 48" aria-hidden="true"><rect x="2" y="8" width="60" height="38" rx="5" fill="#f4ead6" stroke="#9c8c6a" strokeWidth="2.5" /><path d="M2 12 32 30 62 12" fill="none" stroke="#9c8c6a" strokeWidth="2.5" /></svg>
        <span>{done.length}</span>
      </div>
    </section>
  );
}
