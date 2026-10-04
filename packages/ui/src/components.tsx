import {
  forwardRef,
  useEffect,
  useId,
  useRef,
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
  as: As = 'section',
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  as?: 'section' | 'article' | 'div';
}) {
  return (
    <As className={cx('ap-card', className)}>
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
