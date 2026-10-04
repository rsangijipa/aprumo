/**
 * Equipe da organização. Separação entre gestão e clínica: o cargo administrativo não dá acesso
 * a prontuário; o acesso clínico vem do vínculo com cada caso.
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { Badge, Button, Card, Dialog, Field, IconPlus, Segmented, Toast } from '@aprumo/ui';
import { actions, db, useStore } from '../../data/store';
import type { CaseRole, Invite } from '../../data/types';
import './forms.css';

const ROLE_LABEL: Record<CaseRole, string> = { responsible: 'responsável', supervisor: 'supervisão', implementer: 'aplicação', observer: 'observação' };

export default function Team() {
  const st = useStore((s) => s);
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Equipe</h1>
          <p>Quem trabalha na organização e em quais casos. O acesso a prontuário depende do vínculo com o caso, nunca do cargo.</p>
        </div>
        <Button variant="primary" icon={<IconPlus />} onClick={() => setInviting(true)}>Convidar profissional</Button>
      </div>

      <div className="grid-3">
        {st.professionals.map((p) => {
          const links = st.cases.flatMap((c) => c.team.filter((m) => m.professionalId === p.id).map((m) => ({ c, role: m.role })));
          return (
            <Card key={p.id} as="article">
              <div className="ap-stack" style={{ gap: '0.75rem' }}>
                <div className="ap-row" style={{ gap: '0.75rem', flexWrap: 'nowrap' }}>
                  <span className="pro-user__avatar" aria-hidden="true">{p.shortName[0]}</span>
                  <div style={{ minWidth: 0 }}>
                    <strong>{p.name}</strong>
                    <div className="ap-xs ap-muted">{p.role}{p.council ? ` · ${p.council}` : ''}</div>
                  </div>
                </div>
                <div>
                  <span className="ap-label">Casos</span>
                  {links.length === 0 ? <p className="ap-xs ap-muted">Sem vínculo com casos.</p> : (
                    <ul className="ap-stack" style={{ listStyle: 'none', margin: '0.35rem 0 0', padding: 0, gap: '0.3rem' }}>
                      {links.map(({ c, role }) => (
                        <li key={c.id + role} className="ap-small"><Link to={`/app/casos/${c.id}/perfil`}>{db.childOf(c).preferredName}</Link> <span className="ap-xs ap-muted">· {ROLE_LABEL[role]}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {st.invites.length > 0 && (
        <Card title="Convites enviados">
          <ul className="ap-stack" style={{ listStyle: 'none', margin: 0, padding: 0, gap: '0.5rem' }}>
            {st.invites.map((i) => (
              <li key={i.id} className="ap-row ap-small" style={{ justifyContent: 'space-between' }}>
                <span><strong>{i.name}</strong> · {i.email}</span>
                <Badge>{i.role === 'org_admin' ? 'gestão' : 'profissional'} · aguardando aceite</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {inviting && <InviteDialog onClose={() => setInviting(false)} onDone={() => setToast('Convite registrado. No modo demonstração nenhum e-mail é enviado.')} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}

function InviteDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Invite['role']>('professional');
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog open onClose={onClose} title="Convidar profissional" description="A pessoa cria a própria senha e ativa a verificação em duas etapas no primeiro acesso."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => {
        try { actions.invite(email.trim(), name, role); onClose(); onDone(); } catch (e) { setError((e as Error).message); }
      }}>Enviar convite</Button></>}>
      <Field label="Nome">{(a) => <input id={a.id} className="ap-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />}</Field>
      <Field label="E-mail profissional" error={error}>{(a) => <input id={a.id} aria-invalid={a.invalid} className="ap-input" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />}</Field>
      <div className="ap-field">
        <span className="ap-label">Papel na organização</span>
        <Segmented label="Papel" value={role} onChange={setRole} options={[{ value: 'professional', label: 'Profissional' }, { value: 'org_admin', label: 'Gestão' }]} />
        <span className="ap-hint">{role === 'org_admin' ? 'Gestão administra membros e configurações, sem acesso a conteúdo clínico.' : 'O acesso a cada caso é dado pelo responsável técnico, na aba Perfil do caso.'}</span>
      </div>
    </Dialog>
  );
}
