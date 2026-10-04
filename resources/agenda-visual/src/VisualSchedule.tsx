/**
 * Agenda Visual — sequência ("varal") e primeiro–depois.
 * O cartão atual fica em destaque; os concluídos viram e vão para o envelope "acabou".
 * O aviso de transição (`warning`) antecipa a mudança, reduzindo comportamento-problema em transições.
 */
import { Picto, PICTOS, type PictoKey } from './pictos';
import './schedule.css';

export interface ScheduleItem {
  id: string;
  picto: PictoKey;
  /** Rótulo curto; por padrão, o do pictograma. */
  label?: string;
}

export function VisualSchedule({
  items,
  current,
  mode = 'sequence',
  warning = false,
  motion = 'reduced',
  palette = 'calm',
}: {
  items: ScheduleItem[];
  current: number;
  mode?: 'sequence' | 'first-then';
  warning?: boolean;
  motion?: 'full' | 'reduced' | 'static';
  palette?: 'calm' | 'vivid' | 'high-contrast';
}) {
  if (mode === 'first-then') {
    const first = items[current];
    const then = items[current + 1];
    return (
      <section className="av av--ft" data-motion={motion} data-palette={palette} aria-label="Primeiro, depois">
        {[first, then].map((it, k) =>
          it ? (
            <figure key={it.id} className="av-ft" data-current={k === 0} data-warning={k === 0 && warning}>
              <figcaption>{k === 0 ? 'Primeiro' : 'Depois'}</figcaption>
              <div className="av-ft__card"><Picto k={it.picto} /></div>
              <span className="av-label">{it.label ?? PICTOS[it.picto].label}</span>
            </figure>
          ) : null,
        )}
      </section>
    );
  }

  const done = items.slice(0, current);
  return (
    <section className="av" data-motion={motion} data-palette={palette} aria-label={`Agenda: ${items.map((i) => i.label ?? PICTOS[i.picto].label).join(', ')}`}>
      <ol className="av-line">
        {items.map((it, k) => {
          const state = k < current ? 'done' : k === current ? 'current' : 'next';
          return (
            <li key={it.id} className="av-item" data-state={state} data-warning={state === 'current' && warning} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="av-pin" aria-hidden="true" />
              <div className="av-card">
                {state === 'done' ? (
                  <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="#e6f2ec" /><path d="m33 51 12 12 23-25" fill="none" stroke="#2f7d5a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <Picto k={it.picto} />
                )}
              </div>
              <span className="av-label">{it.label ?? PICTOS[it.picto].label}</span>
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
