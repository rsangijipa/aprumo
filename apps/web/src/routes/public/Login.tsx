/**
 * Entrada do Aprumo. Só dois perfis entram aqui: Profissional e Família.
 * A criança não faz login: o espaço dela é aberto pelo adulto já autenticado,
 * a partir do portal da família (/familia → /espaco/:childId) ou da ficha do caso (profissional).
 */
import { useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button, IconArrowRight, IconHeart, IconInfo, IconLock, IconShield, Logo } from '@aprumo/ui';
import { currentStep, enrollTotp, isSupabaseConfigured, signIn, verifyTotp, type AuthStep } from '../../data/supabase';
import './login.css';

type Role = 'pro' | 'family';
type Step = { kind: 'credentials' } | { kind: 'enroll'; factorId: string; qrSvg: string; secret: string } | { kind: 'verify'; factorId: string };

const ROLES: Array<{ id: Role; label: string; hint: string; icon: ReactNode }> = [
  { id: 'pro', label: 'Profissional', hint: 'Terapeutas, supervisão e equipe', icon: <IconShield /> },
  { id: 'family', label: 'Família', hint: 'Responsáveis convidados pela equipe', icon: <IconHeart /> },
];

const CONFIG: Record<Role, { emailLabel: string; demoLabel: string; demoTo: string; demoNote: string }> = {
  pro: {
    emailLabel: 'E-mail profissional',
    demoLabel: 'Abrir demonstração do painel',
    demoTo: '/app',
    demoNote: 'Painel clínico com casos fictícios.',
  },
  family: {
    emailLabel: 'E-mail',
    demoLabel: 'Abrir demonstração da família',
    demoTo: '/familia',
    demoNote: 'Pelo portal da família você também abre o espaço da criança.',
  },
};

export default function Login() {
  const [params, setParams] = useSearchParams();
  const role: Role = params.get('perfil') === 'familia' ? 'family' : 'pro';
  const setRole = (r: Role) => setParams(r === 'family' ? { perfil: 'familia' } : {}, { replace: true });
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelId = useId();

  // Setas e Home/End movem entre as abas (padrão WAI-ARIA de tablist).
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = ROLES.length - 1;
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i === last ? 0 : i + 1)
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i === 0 ? last : i - 1)
      : e.key === 'Home' ? 0 : e.key === 'End' ? last : null;
    if (next === null) return;
    e.preventDefault();
    setRole(ROLES[next]!.id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="login">
      <header className="login__bar">
        <Logo href="/" />
        <Link to="/" className="login__back">
          <span aria-hidden="true">←</span> Voltar para a página principal
        </Link>
      </header>

      <main className="login__main" id="conteudo">
        <div className="login__card">
          <div className="login__head">
            <h1>Entrar no Aprumo</h1>
            <p className="ap-muted">Escolha como você usa a plataforma.</p>
          </div>

          <div className="login__roles" role="tablist" aria-label="Perfil de acesso">
            {ROLES.map((r, i) => (
              <button
                key={r.id}
                ref={(el) => { tabRefs.current[i] = el; }}
                type="button"
                role="tab"
                id={`${panelId}-tab-${r.id}`}
                aria-selected={role === r.id}
                aria-controls={panelId}
                tabIndex={role === r.id ? 0 : -1}
                className="login__role"
                onClick={() => setRole(r.id)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {r.icon}
                <span className="login__role-text">
                  <strong>{r.label}</strong>
                  <small>{r.hint}</small>
                </span>
              </button>
            ))}
          </div>

          <div role="tabpanel" id={panelId} aria-labelledby={`${panelId}-tab-${role}`}>
            {/* key reinicia o formulário ao trocar de perfil: nenhum dado digitado vaza entre abas. */}
            <CredentialsLogin key={role} role={role} />
          </div>
        </div>
      </main>

      <aside className="login__brand" aria-label="Sobre a segurança do Aprumo">
        <div className="login__quote">
          <p className="ap-display">“Só se chama de domínio o que atende ao critério definido para aquele alvo.”</p>
          <span>Princípio P4 · honestidade do dado</span>
        </div>
        <ul className="login__points">
          <li><IconLock /> Segundo fator obrigatório para quem acessa prontuário</li>
          <li><IconShield /> Cada profissional vê só os casos em que atua</li>
          <li><IconHeart /> A família vê o que a equipe compartilha, nunca o prontuário</li>
        </ul>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- formulário */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mensagens de erro no mesmo formato: o que aconteceu + o que fazer. */
function friendlyError(e: unknown): string {
  const msg = (e as Error)?.message ?? '';
  if (/invalid login|invalid credentials/i.test(msg)) return 'E-mail ou senha incorretos. Confira os dados e tente de novo.';
  if (/invalid totp|invalid code|otp/i.test(msg)) return 'Código inválido ou expirado. Digite o código atual do aplicativo autenticador.';
  if (/network|fetch/i.test(msg)) return 'Sem conexão com o servidor. Verifique a internet e tente de novo.';
  return msg || 'Não foi possível entrar agora. Tente de novo em instantes.';
}

function CredentialsLogin({ role }: { role: Role }) {
  const nav = useNavigate();
  const cfg = CONFIG[role];
  const pro = role === 'pro';
  const [step, setStep] = useState<Step>({ kind: 'credentials' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isClinicalDevice, setIsClinicalDevice] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = !email.trim() ? 'Digite seu e-mail.' : !EMAIL_RE.test(email.trim()) ? 'Confira o e-mail: falta algo como nome@dominio.com.' : null;
  const passwordError = !password ? 'Digite sua senha.' : null;

  const go = async (s: AuthStep) => {
    if (s.kind === 'ready') return nav(cfg.demoTo);
    if (s.kind === 'needs_mfa_verify') return setStep({ kind: 'verify', factorId: s.factorId });
    if (s.kind === 'needs_mfa_enroll') return setStep({ kind: 'enroll', ...(await enrollTotp()) });
    setStep({ kind: 'credentials' });
  };
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try { await fn(); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  };
  const submitCredentials = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (emailError || passwordError) {
      document.getElementById(emailError ? 'email' : 'password')?.focus();
      return;
    }
    if (!isSupabaseConfigured) return setError('O login real ainda não está ativo neste ambiente. Use o acesso de demonstração acima.');
    void run(async () => go(await signIn(email.trim(), password)));
  };
  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    if (step.kind === 'credentials') return;
    void run(async () => { await verifyTotp(step.factorId, code); await go(await currentStep()); });
  };
  const backToCredentials = () => { setStep({ kind: 'credentials' }); setCode(''); setError(null); };

  const showEmailErr = touched.email && emailError;
  const showPwErr = touched.password && passwordError;
  const errorBox = error && <p role="alert" className="login__error">{error}</p>;

  return (
    <div className="login__flow">
      {!isSupabaseConfigured && step.kind === 'credentials' && (
        <div className="login__demo" role="note">
          <div className="login__demo-text">
            <IconInfo aria-hidden="true" />
            <p><strong>Ambiente de demonstração.</strong> Todos os dados são fictícios. {cfg.demoNote}</p>
          </div>
          <Button size="lg" variant="primary" onClick={() => nav(cfg.demoTo)} icon={<IconArrowRight />}>{cfg.demoLabel}</Button>
        </div>
      )}

      {pro && (
        <p className="login__steps" aria-live="polite">
          {step.kind === 'credentials' ? 'Etapa 1 de 2 · E-mail e senha' : 'Etapa 2 de 2 · Código de verificação'}
        </p>
      )}

      {step.kind === 'credentials' && (
        <form className="login__form" onSubmit={submitCredentials} noValidate aria-label={pro ? 'Entrar como profissional' : 'Entrar como família'}>
          <div className="ap-field">
            <label className="ap-label" htmlFor="email">{cfg.emailLabel}</label>
            <input
              id="email" className="ap-input" type="email" inputMode="email" autoComplete="username" enterKeyHint="next"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={!!showEmailErr}
              aria-describedby={showEmailErr ? 'email-err' : undefined}
              required
            />
            {showEmailErr && <p id="email-err" className="login__field-err">{emailError}</p>}
          </div>
          <div className="ap-field">
            <div className="login__pw-head">
              <label className="ap-label" htmlFor="password">Senha</label>
              <button type="button" className="login__toggle" aria-controls="password" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              </button>
            </div>
            <input
              id="password" className="ap-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" enterKeyHint="go"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={!!showPwErr}
              aria-describedby={showPwErr ? 'password-err' : undefined}
              required
            />
            {showPwErr && <p id="password-err" className="login__field-err">{passwordError}</p>}
          </div>
          {pro && (
            <label className="login__check">
              <input type="checkbox" checked={isClinicalDevice} onChange={(e) => setIsClinicalDevice(e.target.checked)} />
              <span>Aparelho da clínica: sessão curta, sem salvar credenciais e bloqueio após 15 min sem uso.</span>
            </label>
          )}
          {errorBox}
          <Button type="submit" variant="primary" size="lg" disabled={busy} aria-busy={busy}>
            {busy ? 'Entrando…' : pro ? 'Continuar' : 'Entrar'}
          </Button>
          <p className="ap-xs ap-muted">
            {pro
              ? 'Depois da senha, pedimos o código do aplicativo autenticador para proteger os prontuários.'
              : 'O acesso da família é criado pelo convite da equipe. Você vê o que a equipe compartilha, nunca o prontuário.'}
          </p>
        </form>
      )}

      {step.kind === 'enroll' && (
        <form className="login__form" onSubmit={submitCode}>
          <p className="ap-small ap-muted">Para proteger os prontuários, o acesso exige um aplicativo autenticador. Escaneie o código e digite os 6 dígitos que aparecerem.</p>
          <img className="login__qr" src={step.qrSvg} alt="QR code para cadastrar o Aprumo no aplicativo autenticador" />
          <details className="ap-small"><summary>Não consigo escanear</summary><p className="ap-tabular" style={{ wordBreak: 'break-all', marginTop: 6 }}>Chave: {step.secret}</p></details>
          <OtpInput value={code} onChange={(v) => { setCode(v); setError(null); }} />
          {errorBox}
          <Button type="submit" variant="primary" size="lg" disabled={busy || code.length !== 6} aria-busy={busy}>{busy ? 'Verificando…' : 'Ativar e entrar'}</Button>
          <button type="button" className="login__toggle login__toggle--center" onClick={backToCredentials}>Usar outra conta</button>
        </form>
      )}

      {step.kind === 'verify' && (
        <form className="login__form" onSubmit={submitCode}>
          <p className="ap-small ap-muted">Abra o aplicativo autenticador e digite o código de 6 dígitos do Aprumo.</p>
          <OtpInput value={code} onChange={(v) => { setCode(v); setError(null); }} />
          {errorBox}
          <Button type="submit" variant="primary" size="lg" disabled={busy || code.length !== 6} aria-busy={busy}>{busy ? 'Verificando…' : 'Verificar e entrar'}</Button>
          <button type="button" className="login__toggle login__toggle--center" onClick={backToCredentials}>Usar outra conta</button>
        </form>
      )}
    </div>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="ap-field">
      <label className="ap-label" htmlFor="otp">Código de verificação</label>
      <input id="otp" className="ap-input login__otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} enterKeyHint="done" autoFocus
        aria-describedby="otp-hint"
        value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} />
      <span id="otp-hint" className="ap-xs ap-muted">6 dígitos, sem espaços.</span>
    </div>
  );
}
