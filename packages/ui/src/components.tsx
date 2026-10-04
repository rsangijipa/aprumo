import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';

const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');

/* ------------------------------------------------------------ marca */
/** Prumo: fio + peso. A ideia de alinhamento e precisão que dá nome à plataforma. */
export function LogoMark({ title }: { title?: string }) {
  return (
    <svg viewBox="0 0 22 30" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path d="M11 0v9" stroke="var(--ap-sage-700)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="11" cy="10.6" r="1.9" fill="none" stroke="var(--ap-sage-700)" strokeWidth="1.5" />
      <path d="M11 13.2c3.9 3 6.2 6.1 6.2 9.3a6.2 6.2 0 0 1-12.4 0c0-3.2 2.3-6.3 6.2-9.3z" fill="var(--ap-sage-500)" />
      <path d="M11 30v-1.4" stroke="var(--ap-terra-500)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.2 19.5c-.9 1.1-1.4 2.2-1.4 3.3" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ href = '/', compact = false }: { href?: string; compact?: boolean }) {
  return (
    <a className="ap-logo" href={href} aria-label="Aprumo — início">
      <LogoMark />
      {!compact && <span className="ap-logo__word">aprumo</span>}
    </a>
  );
}

/* ------------------------------------------------------------ botão */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger' | 'default';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconOnly?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', size = 'md', icon, iconOnly, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'ap-btn',
        variant !== 'default' && `ap-btn--${variant}`,
        size !== 'md' && `ap-btn--${size}`,
        iconOnly && 'ap-btn--icon',
        className,
      )}
      {...rest}
    >
      {icon}
      {iconOnly ? <span className="ap-visually-hidden">{children}</span> : children}
    </button>
  );
});

/* ------------------------------------------------------------ cartão */
export function Card({
  title,
  actions,
  children,
  className,
  bodyClassName,
  id,
  as: As = 'section',
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
  as?: 'section' | 'article' | 'div';
}) {
  return (
    <As id={id} className={cx('ap-card', className)}>
      {(title || actions) && (
        <header className="ap-card__head">
          {title && <h2 className="ap-card__title">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={cx('ap-card__body', bodyClassName)}>{children}</div>
    </As>
  );
}

/* ------------------------------------------------------------ selos */
export function Badge({ tone, children }: { tone?: 'success' | 'warning' | 'danger' | 'info'; children: ReactNode }) {
  return <span className={cx('ap-badge', tone && `ap-badge--${tone}`)}>{children}</span>;
}

/** Selo do modelo do caso: sempre com rótulo textual, nunca só cor. */
export function ModelBadge({ model }: { model: 'ABA' | 'DENVER' }) {
  return (
    <span className={cx('ap-badge', model === 'ABA' ? 'ap-badge--aba' : 'ap-badge--denver')} title={model === 'ABA' ? 'Caso conduzido em ABA' : 'Caso conduzido no Modelo Denver'}>
      {model === 'ABA' ? 'ABA' : 'Denver'}
    </span>
  );
}

export const PHASE_LABEL: Record<string, string> = {
  baseline: 'Linha de base',
  acquisition: 'Aquisição',
  maintenance: 'Manutenção',
  generalization: 'Generalização',
  mastered: 'Concluído',
  review: 'Em revisão',
  suspended: 'Suspenso',
};

export function PhaseBadge({ phase }: { phase: string }) {
  return <span className={cx('ap-badge ap-phase', `ap-phase--${phase}`)}>{PHASE_LABEL[phase] ?? phase}</span>;
}

/* ------------------------------------------------------------ segmentado */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: ReactNode; title?: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="ap-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} title={o.title} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ diálogo nativo */
/**
 * Usa <dialog> com showModal(): o restante da página fica inerte, sem armadilha de foco manual.
 * Em telas pequenas vira painel inferior (bottom sheet). Sempre tem botão de fechar: no toque não existe Esc.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={cx('ap-dialog', size === 'lg' && 'ap-dialog--lg')}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      <div className="ap-dialog__head">
        <div>
          <h2 id={titleId} className="ap-dialog__title">{title}</h2>
          {description && <p id={descId} className="ap-dialog__desc">{description}</p>}
        </div>
        <button type="button" className="ap-dialog__close" onClick={onClose} aria-label="Fechar">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="ap-dialog__body">{open && children}</div>
      {footer && <div className="ap-dialog__foot">{footer}</div>}
    </dialog>
  );
}

/** Campo com rótulo, dica e erro associados por aria (formulários consistentes). */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}) {
  const id = useId();
  const hintId = useId();
  const errId = useId();
  const describedBy = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="ap-field">
      <label className="ap-label" htmlFor={id}>{label}</label>
      {children({ id, describedBy, invalid: !!error })}
      {hint && <span id={hintId} className="ap-hint">{hint}</span>}
      {error && <span id={errId} className="ap-error" role="alert">{error}</span>}
    </div>
  );
}

/** Contador com botões grandes: alternativa de toque ao input numérico. */
export function Stepper({ label, value, min = 0, max = 999, step = 1, onChange }: { label: string; value: number; min?: number; max?: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div className="ap-stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`Diminuir ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}>−</button>
      <output aria-live="polite" className="ap-tabular">{value}</output>
      <button type="button" aria-label={`Aumentar ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}>+</button>
    </div>
  );
}

/** Aviso transitório (toast) para confirmar ações: região polite, some sozinho. */
export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDone, 3200);
    return () => window.clearTimeout(t);
  }, [message, onDone]);
  return (
    <div className="ap-toast-region" aria-live="polite" role="status">
      {message && <div className="ap-toast">{message}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="ap-empty">
      {icon}
      <strong style={{ color: 'var(--ap-text)' }}>{title}</strong>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------ botão com ícone */
export const IconButton = forwardRef<HTMLButtonElement, ButtonProps & { label: string }>(function IconButton(
  { label, icon, className, ...rest },
  ref,
) {
  return (
    <Button ref={ref} iconOnly icon={icon} className={cx('ap-btn--icon', className)} title={label} aria-label={label} {...rest}>
      {label}
    </Button>
  );
});

/* ------------------------------------------------------------ cartão de estatística */
export function StatCard({
  value,
  label,
  trend,
  tone,
  helper,
  icon,
}: {
  value: ReactNode;
  label: ReactNode;
  trend?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  helper?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="ap-stat-card">
      <div className="ap-stat-card__inner">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="stat__value ap-tabular">{value}</div>
          <div className="stat__label">{label}</div>
          {(trend || helper) && (
            <div className="ap-stat-card__helper">
              {trend && <span className={cx('ap-trend', tone && `ap-trend--${tone}`)}>{trend}</span>}
              {helper && <span>{helper}</span>}
            </div>
          )}
        </div>
        {icon && <div className="ap-stat-card__icon" aria-hidden="true">{icon}</div>}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------ cabeçalhos */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  backHref,
  backLabel = 'Voltar',
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="page-head ap-page-header">
      <div>
        {backHref && (
          <a href={backHref} className="ap-back-link">
            ← {backLabel}
          </a>
        )}
        {eyebrow && <span className="ap-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="ap-page-header__actions ap-row">{actions}</div>}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="ap-section-header ap-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h2 style={{ fontSize: 'var(--ap-text-xl)', margin: 0 }}>{title}</h2>
        {description && <p className="ap-small ap-muted" style={{ margin: '0.2rem 0 0 0' }}>{description}</p>}
      </div>
      {actions && <div className="ap-row" style={{ gap: '0.5rem' }}>{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------ abas */
export function Tabs<T extends string>({
  active,
  onChange,
  items,
  label,
}: {
  active: T;
  onChange: (id: T) => void;
  items: Array<{ id: T; label: ReactNode; count?: number; icon?: ReactNode }>;
  label?: string;
}) {
  return (
    <div className="ap-tabs" role="tablist" aria-label={label ?? 'Abas'}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={active === it.id}
          className={cx('ap-tab', active === it.id && 'ap-tab--active')}
          onClick={() => onChange(it.id)}
        >
          {it.icon}
          <span>{it.label}</span>
          {typeof it.count === 'number' && it.count > 0 && (
            <span className="ap-tab__count">{it.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ gaveta (drawer) */
export function Drawer({
  open,
  onClose,
  title,
  children,
  position = 'right',
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  position?: 'right' | 'left';
  actions?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ap-drawer-root" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
      <div className="ap-drawer-scrim" onClick={onClose} aria-hidden="true" />
      <aside className={cx('ap-drawer', `ap-drawer--${position}`)}>
        <header className="ap-drawer__head">
          <h2 className="ap-drawer__title">{title}</h2>
          <div className="ap-row" style={{ gap: '0.4rem' }}>
            {actions}
            <button type="button" className="ap-dialog__close" onClick={onClose} aria-label="Fechar gaveta">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </header>
        <div className="ap-drawer__body">{children}</div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------ painel inferior (bottom sheet) */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="ap-sheet-root" role="dialog" aria-modal="true">
      <div className="ap-sheet-scrim" onClick={onClose} aria-hidden="true" />
      <div className="ap-sheet">
        <div className="ap-sheet__grab" aria-hidden="true" />
        <header className="ap-sheet__head">
          <h3 className="ap-sheet__title">{title}</h3>
          <div className="ap-row" style={{ gap: '0.4rem' }}>
            {actions}
            <button type="button" className="ap-dialog__close" onClick={onClose} aria-label="Fechar painel">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </header>
        <div className="ap-sheet__body">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ banner */
export function Banner({
  tone = 'info',
  icon,
  children,
  action,
}: {
  tone?: 'info' | 'warning' | 'danger' | 'success';
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={cx('ap-banner', `ap-banner--${tone}`)} role="status">
      {icon && <span className="ap-banner__icon">{icon}</span>}
      <div className="ap-banner__content">{children}</div>
      {action && <div className="ap-banner__action">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------ skeleton */
export function Skeleton({
  width,
  height,
  circle = false,
  className,
}: {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx('ap-skeleton', circle && 'ap-skeleton--circle', className)}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
        borderRadius: circle ? '50%' : undefined,
      }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------ progresso acessível */
export function Progress({
  value,
  max = 100,
  label,
  tone = 'default',
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <div className={cx('ap-progress', `ap-progress--${tone}`)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------ timeline */
export function Timeline({
  items,
}: {
  items: Array<{
    id: string;
    title: ReactNode;
    subtitle?: ReactNode;
    time?: ReactNode;
    icon?: ReactNode;
    tone?: 'default' | 'success' | 'warning' | 'danger';
  }>;
}) {
  return (
    <ol className="ap-timeline">
      {items.map((it) => (
        <li key={it.id} className={cx('ap-timeline__item', it.tone && `ap-timeline__item--${it.tone}`)}>
          <span className="ap-timeline__marker" aria-hidden="true">{it.icon}</span>
          <div className="ap-timeline__content">
            <div className="ap-timeline__header">
              <strong className="ap-timeline__title">{it.title}</strong>
              {it.time && <span className="ap-timeline__time ap-xs ap-muted">{it.time}</span>}
            </div>
            {it.subtitle && <div className="ap-timeline__subtitle ap-small ap-muted">{it.subtitle}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------ status badge */
export function StatusBadge({ status }: { status: 'active' | 'paused' | 'completed' | 'draft' | 'archived' | string }) {
  const map: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | undefined }> = {
    active: { label: 'Ativo', tone: 'success' },
    paused: { label: 'Pausado', tone: 'warning' },
    completed: { label: 'Concluído', tone: 'info' },
    draft: { label: 'Rascunho', tone: 'warning' },
    archived: { label: 'Arquivado', tone: undefined },
  };
  const s = map[status] ?? { label: status, tone: undefined };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/* ------------------------------------------------------------ mini gráfico / sparkline */
export function MiniChart({
  values,
  max,
  tone = 'sage',
  label,
}: {
  values: number[];
  max?: number;
  tone?: 'sage' | 'terra' | 'denver';
  label?: string;
}) {
  const m = max ?? Math.max(1, ...values);
  return (
    <div className={cx('ap-mini-chart', `ap-mini-chart--${tone}`)} role="img" aria-label={label ?? `Série histórica: ${values.join(', ')}`}>
      {values.map((v, i) => (
        <span key={i} style={{ height: `${Math.max(4, (v / m) * 100)}%` }} title={`${v}`} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ timer visual clínico */
export function VisualTimer({
  seconds,
  total,
  running,
  onToggle,
}: {
  seconds: number;
  total: number;
  running?: boolean;
  onToggle?: () => void;
}) {
  const pct = total > 0 ? Math.min(100, Math.round(((total - seconds) / total) * 100)) : 0;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <div
      className="ap-visual-timer"
      onClick={onToggle}
      onKeyDown={onToggle ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } } : undefined}
      tabIndex={onToggle ? 0 : undefined}
      role={onToggle ? 'button' : undefined}
      aria-label={`Timer: ${timeStr} restantes`}
    >
      <div className="ap-visual-timer__ring">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx="50" cy="50" r="44" className="ap-visual-timer__track" />
          <circle
            cx="50"
            cy="50"
            r="44"
            className="ap-visual-timer__progress"
            strokeDasharray={276.46}
            strokeDashoffset={276.46 * (1 - pct / 100)}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span className="ap-visual-timer__time ap-tabular">{timeStr}</span>
      </div>
      {running != null && (
        <span className={cx('ap-badge', running ? 'ap-badge--success' : 'ap-badge--warning')} style={{ marginTop: '0.4rem' }}>
          {running ? 'Em andamento' : 'Pausado'}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ command palette */
export function CommandPalette({
  open,
  onClose,
  items,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  items: Array<{ id: string; title: string; category?: string; icon?: ReactNode }>;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) onClose();
      }
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = items.filter((it) => it.title.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="ap-cmd-root" role="dialog" aria-modal="true" aria-label="Busca rápida">
      <div className="ap-cmd-scrim" onClick={onClose} aria-hidden="true" />
      <div className="ap-cmd-box">
        <div className="ap-cmd-input-wrap">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.4-4.4" /></svg>
          <input
            ref={inputRef}
            className="ap-cmd-input"
            type="search"
            placeholder="Digite para buscar casos, páginas ou ferramentas…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <kbd className="ap-kbd">Esc</kbd>
        </div>
        <div className="ap-cmd-list">
          {filtered.length === 0 ? (
            <p className="ap-cmd-empty ap-muted ap-small">Nenhum resultado encontrado.</p>
          ) : (
            filtered.map((it) => (
              <button
                key={it.id}
                type="button"
                className="ap-cmd-item"
                onClick={() => {
                  onSelect(it.id);
                  onClose();
                }}
              >
                {it.icon && <span className="ap-cmd-item__icon">{it.icon}</span>}
                <span className="ap-cmd-item__title">{it.title}</span>
                {it.category && <span className="ap-cmd-item__category ap-xs ap-muted">{it.category}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ navegação e botões universais */
export function BackButton({
  href,
  onClick,
  label = 'Voltar',
  className,
}: {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
}) {
  const content = (
    <>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={cx('ap-btn ap-btn--ghost ap-back-btn', className)} aria-label={label}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={cx('ap-btn ap-btn--ghost ap-back-btn', className)}
      onClick={onClick || (() => window.history.back())}
      aria-label={label}
    >
      {content}
    </button>
  );
}

export function CloseButton({
  onClick,
  label = 'Fechar',
  className,
}: {
  onClick?: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cx('ap-close-btn', className)}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

export function NextButton({
  onClick,
  label = 'Próximo',
  disabled,
  className,
}: {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      disabled={disabled}
      className={cx('ap-btn--next', className)}
    >
      <span>{label}</span>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Button>
  );
}

export function PreviousButton({
  onClick,
  label = 'Anterior',
  disabled,
  className,
}: {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      variant="default"
      onClick={onClick}
      disabled={disabled}
      className={cx('ap-btn--prev', className)}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </Button>
  );
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: Array<{ label: ReactNode; href?: string; active?: boolean }>;
  className?: string;
}) {
  return (
    <nav className={cx('ap-breadcrumbs-wrap', className)} aria-label="Navegação estrutural">
      <ol className="ap-breadcrumbs">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1 || it.active;
          return (
            <li key={idx} className="ap-breadcrumbs__item">
              {it.href && !isLast ? (
                <a href={it.href} className="ap-breadcrumbs__link">
                  {it.label}
                </a>
              ) : (
                <span className="ap-breadcrumbs__current" aria-current={isLast ? 'page' : undefined}>
                  {it.label}
                </span>
              )}
              {!isLast && <span className="ap-breadcrumbs__sep" aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Tooltip({
  text,
  children,
  position = 'top',
}: {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const id = useId();
  return (
    <span className={`ap-tooltip-root ap-tooltip--${position}`} aria-describedby={id}>
      {children}
      <span className="ap-tooltip-bubble" role="tooltip" id={id}>{text}</span>
    </span>
  );
}

/* ------------------------------------------------------------ controles de formulário padrão */
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cx('ap-input', className)} {...props} />;
  }
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return <select ref={ref} className={cx('ap-select', className)} {...props}>{children}</select>;
  }
);

export function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  id,
  className,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label htmlFor={inputId} className={cx('ap-choice-label', disabled && 'ap-choice-label--disabled', className)}>
      <input
        type="checkbox"
        id={inputId}
        className="ap-checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

export function Radio<T extends string>({
  name,
  value,
  selectedValue,
  onChange,
  label,
  disabled,
  id,
  className,
}: {
  name: string;
  value: T;
  selectedValue: T;
  onChange: (val: T) => void;
  label: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label htmlFor={inputId} className={cx('ap-choice-label', disabled && 'ap-choice-label--disabled', className)}>
      <input
        type="radio"
        name={name}
        id={inputId}
        value={value}
        className="ap-radio"
        checked={value === selectedValue}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span>{label}</span>
    </label>
  );
}

/* ------------------------------------------------------------ cards unificados */
export function GameCard({
  name,
  tag,
  summary,
  ageRange,
  art,
  actions,
  onClick,
  badgeTone,
  className,
}: {
  name: string;
  tag?: string;
  summary: string;
  ageRange?: string;
  art?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  badgeTone?: 'aba' | 'denver' | 'success' | 'warning' | 'info';
  className?: string;
}) {
  return (
    <article className={cx('ap-game-card', onClick && 'ap-game-card--clickable', className)}>
      {art && <div className="ap-game-card__art" aria-hidden="true">{art}</div>}
      <div className="ap-game-card__body">
        <div className="ap-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          {tag && <span className={cx('ap-badge', badgeTone && `ap-badge--${badgeTone}`)}>{tag}</span>}
          {ageRange && <span className="ap-xs ap-muted">{ageRange}</span>}
        </div>
        <strong className="ap-game-card__title">
          {onClick ? (
            // Botão "esticado" cobre o cartão inteiro: clique em qualquer ponto, mas com semântica e teclado nativos.
            <button type="button" className="ap-card-hit" onClick={onClick}>{name}</button>
          ) : name}
        </strong>
        <p className="ap-game-card__summary">{summary}</p>
        {actions && <div className="ap-game-card__actions">{actions}</div>}
      </div>
    </article>
  );
}

export function ResourceCard({
  name,
  category,
  summary,
  evidence,
  art,
  onClick,
  actions,
  className,
}: {
  name: string;
  category?: string;
  summary: string;
  evidence?: string;
  art?: ReactNode;
  onClick?: () => void;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <article className={cx('ap-resource-card', onClick && 'ap-resource-card--clickable', className)}>
      {art && <div className="ap-resource-card__art" aria-hidden="true">{art}</div>}
      <div className="ap-resource-card__body">
        {category && <span className="ap-badge">{category}</span>}
        <strong className="ap-resource-card__title">
          {onClick ? (
            // Botão "esticado" cobre o cartão inteiro: clique em qualquer ponto, mas com semântica e teclado nativos.
            <button type="button" className="ap-card-hit" onClick={onClick}>{name}</button>
          ) : name}
        </strong>
        <p className="ap-resource-card__summary">{summary}</p>
        {evidence && <span className="ap-xs ap-muted ap-resource-card__evidence">{evidence}</span>}
        {actions && <div className="ap-resource-card__actions">{actions}</div>}
      </div>
    </article>
  );
}


