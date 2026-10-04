import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, IconArrowRight, IconHeart, IconInfo, IconLock, IconShield, IconUser, Logo } from '@aprumo/ui';
import { db, findChildByCode } from '../../data/store';
import { currentStep, enrollTotp, isSupabaseConfigured, signIn, verifyTotp, type AuthStep } from '../../data/supabase';
import './login.css';

type Role = 'pro' | 'family' | 'child';
type Step = { kind: 'credentials' } | { kind: 'enroll'; factorId: string; qrSvg: string; secret: string } | { kind: 'verify'; factorId: string };

export default function Login() {
  const [role, setRole] = useState<Role>('pro');

  return (
    <div className="login">
      <aside className="login__brand">
        <Logo />
        <div className="login__quote">
          <p className="ap-display">“Só se chama de domínio o que atende ao critério definido para aquele alvo.”</p>
          <span>Princípio P4 · honestidade do dado</span>
        </div>
        <ul className="login__points">
          <li><IconLock /> Segundo fator obrigatório para acesso a prontuário</li>
          <li><IconShield /> Acesso somente aos casos em que você atua</li>
        </ul>
      </aside>

      <main className="login__main">
        <div className="login__card">
          <Link to="/" className="ap-small ap-muted" style={{ textDecoration: 'none' }}>← Voltar ao site</Link>
          <h1>Entrar no Aprumo</h1>

          <div className="login__roles" role="tablist" aria-label="Quem está entrando">
            <RoleTab id="pro" role={role} setRole={setRole} icon={<IconShield />} label="Profissional" />
            <RoleTab id="family" role={role} setRole={setRole} icon={<IconHeart />} label="Família" />
            <RoleTab id="child" role={role} setRole={setRole} icon={<IconUser />} label="Criança" />
          </div>

          <div role="tabpanel">
            {role === 'pro' && <CredentialsLogin demoLabel="Entrar como profissional" demoTo="/app" emailLabel="E-mail profissional" />}
            {role === 'family' && <CredentialsLogin demoLabel="Ver o portal da família" demoTo="/familia" emailLabel="E-mail" family />}
            {role === 'child' && <ChildLogin />}
          </div>
        </div>
      </main>
    </div>
  );
}

function RoleTab({ id, role, setRole, icon, label }: { id: Role; role: Role; setRole: (r: Role) => void; icon: ReactNode; label: string }) {
  return (
    <button type="button" role="tab" aria-selected={role === id} className="login__role" data-role={id} onClick={() => setRole(id)}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ---------------------------------------------------------------- profissional e família */
function CredentialsLogin({ demoLabel, demoTo, emailLabel, family }: { demoLabel: string; demoTo: string; emailLabel: string; family?: boolean }) {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>({ kind: 'credentials' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async (s: AuthStep) => {
    if (s.kind === 'ready') return nav(demoTo);
    if (s.kind === 'needs_mfa_verify') return setStep({ kind: 'verify', factorId: s.factorId });
    if (s.kind === 'needs_mfa_enroll') return setStep({ kind: 'enroll', ...(await enrollTotp()) });
    setStep({ kind: 'credentials' });
  };
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try { await fn(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const submitCredentials = (e: FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return setError('A autenticação real ainda não está configurada neste ambiente. Use a demonstração abaixo.');
    void run(async () => go(await signIn(email, password)));
  };
  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    if (step.kind === 'credentials') return;
    void run(async () => { await verifyTotp(step.factorId, code); await go(await currentStep()); });
  };

  return (
    <div className="ap-stack" style={{ gap: '1.1rem' }}>
      {step.kind === 'credentials' && (
        <form className="ap-stack" onSubmit={submitCredentials} noValidate>
          <div className="ap-field">
            <label className="ap-label" htmlFor="email">{emailLabel}</label>
            <input id="email" className="ap-input" type="email" inputMode="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="ap-field">
            <label className="ap-label" htmlFor="password">Senha</label>
            <input id="password" className="ap-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p role="alert" className="login__error">{error}</p>}
          <Button type="submit" variant="primary" size="lg" disabled={busy}>{busy ? 'Entrando…' : 'Continuar'}</Button>
          {family && <p className="ap-xs ap-muted">O acesso da família é criado pelo convite da equipe. Você vê o que a equipe compartilha, nunca o prontuário.</p>}
        </form>
      )}
      {step.kind === 'enroll' && (
        <form className="ap-stack" onSubmit={submitCode}>
          <p className="ap-small ap-muted">Para proteger os prontuários, o acesso exige um aplicativo autenticador. Escaneie o código e digite os 6 dígitos.</p>
          <img className="login__qr" src={step.qrSvg} alt="QR code para cadastrar o Aprumo no aplicativo autenticador" />
          <details className="ap-small"><summary>Não consigo escanear</summary><p className="ap-tabular" style={{ wordBreak: 'break-all', marginTop: 6 }}>Chave: {step.secret}</p></details>
          <OtpInput value={code} onChange={setCode} />
          {error && <p role="alert" className="login__error">{error}</p>}
          <Button type="submit" variant="primary" size="lg" disabled={busy || code.length !== 6}>Ativar e entrar</Button>
        </form>
      )}
      {step.kind === 'verify' && (
        <form className="ap-stack" onSubmit={submitCode}>
          <p className="ap-muted ap-small">Digite o código de 6 dígitos do seu aplicativo autenticador.</p>
          <OtpInput value={code} onChange={setCode} />
          {error && <p role="alert" className="login__error">{error}</p>}
          <Button type="submit" variant="primary" size="lg" disabled={busy || code.length !== 6}>Verificar</Button>
        </form>
      )}
      {!isSupabaseConfigured && (
        <div className="login__demo">
          <div className="ap-row" style={{ gap: '0.5rem', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
            <IconInfo style={{ width: 20, flex: 'none', color: 'var(--ap-info)' }} />
            <p className="ap-small"><strong>Ambiente de demonstração.</strong> Todos os casos e dados são fictícios.</p>
          </div>
          <Button size="lg" onClick={() => nav(demoTo)} icon={<IconArrowRight />}>{demoLabel}</Button>
        </div>
      )}
    </div>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input className="ap-input login__otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-label="Código de verificação de 6 dígitos"
      value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} />
  );
}

/* ---------------------------------------------------------------- criança */
/**
 * O código identifica a criança; não é senha. Em produção, só abre num aparelho com profissional ou
 * responsável autenticado, que gera uma sessão infantil temporária (child_sessions, token com hash).
 */
function ChildLogin() {
  const nav = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [adult, setAdult] = useState(false);

  const enter = (e?: FormEvent) => {
    e?.preventDefault();
    const hit = findChildByCode(code);
    if (!hit) return setError('Código não encontrado. Confira com a equipe: ele está na ficha da criança.');
    if (!db.screenPolicy(hit.child.birthDate).childPortalAllowed) return setError('Abaixo de 2 anos não há espaço da criança. A plataforma é usada pelo adulto (SBP, 2024).');
    if (!adult) return setError('Confirme que um adulto está junto.');
    nav(`/espaco/${hit.child.id}`);
  };

  return (
    <form className="ap-stack login__child" onSubmit={enter} noValidate>
      <p className="ap-small ap-muted">O adulto digita o código de identificação do cadastro da criança. Ele está na aba Perfil do caso.</p>
      <label className="ap-label" htmlFor="child-code">Código da criança</label>
      <input
        id="child-code"
        className="ap-input login__code"
        value={code}
        onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12)); setError(null); }}
        placeholder="NOME-0000"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        inputMode="text"
      />
      <label className="login__adult">
        <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
        <span>Sou o adulto responsável e vou acompanhar a criança.</span>
      </label>
      {error && <p role="alert" className="login__error">{error}</p>}
      <Button type="submit" variant="primary" size="lg" disabled={code.length < 4} icon={<IconArrowRight />}>Abrir o espaço da criança</Button>
      {!isSupabaseConfigured && (
        <div className="login__demo">
          <p className="ap-small"><strong>Códigos de demonstração</strong> (toque para preencher):</p>
          <div className="login__codes">
            {[['TEO-4821', 'Teo, 4 anos'], ['DAVI-7094', 'Davi, 7 anos'], ['BENTO-5530', 'Bento, 13 anos · modo adolescente'], ['NINA-2260', 'Nina, 1 ano · sem espaço infantil']].map(([c, label]) => (
              <button key={c} type="button" onClick={() => { setCode(c!); setError(null); }}><strong>{c}</strong><span>{label}</span></button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
