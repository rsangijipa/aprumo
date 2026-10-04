/**
 * Perfil do caso: o perfil sensorial vira a adaptação da sessão infantil (padrão calmo e reduzido:
 * estímulo é acrescentado quando ajuda). Pré-requisitos digitais liberam jogos e o MSWO com figuras.
 */
import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import type { Adaptation } from '@aprumo/protocol';
import { LEGACY_TOKEN_THEMES, TOKEN_THEMES, TokenArt, type TokenTheme } from '@aprumo/resource-quadro-de-fichas';
import { Badge, Button, Card, IconCheck, IconX, Segmented, Stepper, Toast } from '@aprumo/ui';
import { actions, db, formatAge, useStore } from '../../data/store';
import type { CaseRole, PrerequisiteSkill } from '../../data/types';
import './forms.css';

const PREREQS: Array<{ skill: PrerequisiteSkill; label: string; unlocks: string }> = [
  { skill: 'tolera-tablet', label: 'Tolera o tablet por 2 minutos', unlocks: 'ambiente infantil' },
  { skill: 'toca-alvo-intencional', label: 'Toca um alvo intencionalmente', unlocks: 'jogos de seleção' },
  { skill: 'pareia-figura-identica', label: 'Pareia figura idêntica', unlocks: 'MSWO digital (1 de 2)' },
  { skill: 'identifica-figura-nomeada', label: 'Identifica figura nomeada', unlocks: 'MSWO digital (2 de 2)' },
];
const ROLE_LABEL: Record<CaseRole, string> = { responsible: 'Responsável técnico', supervisor: 'Supervisão', implementer: 'Aplicador', observer: 'Observador' };

export default function CaseProfile() {
  const { caseId = '' } = useParams();
  const st = useStore((s) => s);
  const c = st.cases.find((x) => x.id === caseId)!;
  const child = db.childOf(c);
  const policy = db.screenPolicy(child.birthDate);
  const [a, setA] = useState<Adaptation>(c.adaptation);
  const [interest, setInterest] = useState('');
  const [restriction, setRestriction] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const dirty = JSON.stringify(a) !== JSON.stringify(c.adaptation);
  const probes = st.prerequisiteProbes.filter((p) => p.caseId === caseId);

  const saveProfile = () => {
    actions.updateCaseProfile(caseId, { adaptation: a });
    setToast('Perfil sensorial salvo. Vale a partir da próxima atividade no tablet.');
  };

  return (
    <div className="grid-main">
      <div className="ap-stack" style={{ gap: '1.25rem', alignContent: 'start' }}>
        <Card title="Perfil sensorial e de acesso" actions={dirty ? <Button size="sm" variant="primary" onClick={saveProfile}>Salvar</Button> : <Badge tone="success"><IconCheck /> salvo</Badge>}>
          <div className="profile-grid">
            <ProfileRow label="Movimento" hint="Animações dos jogos e da moldura infantil.">
              <Segmented label="Movimento" value={a.motion} onChange={(v) => setA({ ...a, motion: v })} options={[{ value: 'static', label: 'Estático' }, { value: 'reduced', label: 'Reduzido' }, { value: 'full', label: 'Completo' }]} />
            </ProfileRow>
            <ProfileRow label="Som">
              <Segmented label="Som" value={a.sound} onChange={(v) => setA({ ...a, sound: v })} options={[{ value: 'off', label: 'Desligado' }, { value: 'low', label: 'Baixo' }, { value: 'normal', label: 'Normal' }]} />
            </ProfileRow>
            <ProfileRow label="Retorno de acerto">
              <Segmented label="Retorno de acerto" value={a.feedback} onChange={(v) => setA({ ...a, feedback: v })} options={[{ value: 'none', label: 'Nenhum' }, { value: 'subtle', label: 'Discreto' }, { value: 'festive', label: 'Festivo' }]} />
            </ProfileRow>
            <ProfileRow label="Paleta">
              <Segmented label="Paleta" value={a.palette} onChange={(v) => setA({ ...a, palette: v })} options={[{ value: 'calm', label: 'Calma' }, { value: 'vivid', label: 'Vívida' }, { value: 'high-contrast', label: 'Alto contraste' }]} />
            </ProfileRow>
            <ProfileRow label="Opções por tela" hint="Máximo de figuras ao mesmo tempo.">
              <Stepper label="opções por tela" value={a.maxChoices} min={1} max={6} onChange={(v) => setA({ ...a, maxChoices: v })} />
            </ProfileRow>
            <ProfileRow label="Tamanho dos alvos de toque" hint="Para dificuldades motoras.">
              <Segmented label="Tamanho dos alvos" value={String(a.touchScale)} onChange={(v) => setA({ ...a, touchScale: Number(v) })} options={[{ value: '1', label: 'Padrão' }, { value: '1.25', label: 'Maior' }, { value: '1.5', label: 'Muito maior' }]} />
            </ProfileRow>
            <ProfileRow label="Dica embutida no jogo" hint="O item correto é destacado após alguns segundos sem resposta. Conta como dica, nunca como independente.">
              <Segmented label="Dica embutida" value={String(a.builtInPromptAfterMs ?? 'off')} onChange={(v) => setA({ ...a, builtInPromptAfterMs: v === 'off' ? null : Number(v) })}
                options={[{ value: 'off', label: 'Desligada' }, { value: '4000', label: '4 s' }, { value: '6000', label: '6 s' }]} />
            </ProfileRow>
          </div>
        </Card>

        <Card title="Pré-requisitos digitais">
          <p className="ap-small ap-muted" style={{ marginBottom: '0.75rem' }}>Sondas breves que indicam quais jogos e formatos de avaliação podem ser usados.</p>
          <ul className="prereq-list">
            {PREREQS.map((p) => {
              const last = probes.filter((x) => x.skill === p.skill).at(-1);
              return (
                <li key={p.skill}>
                  <span>
                    <strong>{p.label}</strong>
                    <small>Libera: {p.unlocks}{last ? ` · última sonda ${new Date(last.at).toLocaleDateString('pt-BR')}` : ''}</small>
                  </span>
                  <span className="prereq-state">{last ? (last.passed ? <Badge tone="success">presente</Badge> : <Badge tone="warning">ausente</Badge>) : <Badge>sem sonda</Badge>}</span>
                  <span className="ap-row" style={{ gap: '0.35rem' }}>
                    <Button size="sm" icon={<IconCheck />} onClick={() => { actions.recordPrerequisite(caseId, p.skill, true); setToast('Sonda registrada: presente.'); }}>Presente</Button>
                    <Button size="sm" icon={<IconX />} onClick={() => { actions.recordPrerequisite(caseId, p.skill, false); setToast('Sonda registrada: ausente.'); }}>Ausente</Button>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="ap-stack" style={{ gap: '1.25rem', alignContent: 'start' }}>
        <Card title="Tela e idade">
          <p className="ap-small">{child.preferredName} · {formatAge(child.birthDate)}</p>
          {policy.childPortalAllowed ? (
            <p className="ap-small ap-muted" style={{ marginTop: '0.4rem' }}>Até {policy.dailyLimitMinutes} min de tela por dia, em blocos de até {policy.maxBlockMinutes} min, sempre com um adulto (SBP, 2024).</p>
          ) : (
            <p className="ap-small ap-muted" style={{ marginTop: '0.4rem' }}>Abaixo de 24 meses não há ambiente infantil. A plataforma é usada pelo adulto para planejar, registrar e orientar a família.</p>
          )}
        </Card>

        {policy.childPortalAllowed && <ChildSpaceCard caseId={caseId} onDone={setToast} />}

        <Card title="Interesses e restrições">
          <div className="ap-stack" style={{ gap: '0.9rem' }}>
            <ChipEditor label="Interesses" items={c.interests} value={interest} setValue={setInterest}
              onAdd={(v) => actions.updateCaseProfile(caseId, { interests: [...c.interests, v] })}
              onRemove={(v) => actions.updateCaseProfile(caseId, { interests: c.interests.filter((x) => x !== v) })} />
            <ChipEditor label="Restrições e cuidados" items={c.restrictions} value={restriction} setValue={setRestriction}
              onAdd={(v) => actions.updateCaseProfile(caseId, { restrictions: [...c.restrictions, v] })}
              onRemove={(v) => actions.updateCaseProfile(caseId, { restrictions: c.restrictions.filter((x) => x !== v) })} />
          </div>
        </Card>

        <Card title="Tema das fichas">
          <p className="ap-xs ap-muted" style={{ marginBottom: '0.6rem' }}>Fichas ligadas ao interesse da criança costumam funcionar melhor que fichas genéricas.</p>
          <div className="theme-grid" role="radiogroup" aria-label="Tema das fichas">
            {/* Casos antigos com tema legado continuam vendo a escolha atual marcada. */}
            {[...LEGACY_TOKEN_THEMES.filter((t) => t.id === c.tokenTheme), ...TOKEN_THEMES].map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={c.tokenTheme === t.id} onClick={() => actions.updateCaseProfile(caseId, { tokenTheme: t.id as TokenTheme })}>
                <TokenArt theme={t.id} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Equipe do caso">
          <ul className="ap-stack" style={{ listStyle: 'none', margin: 0, padding: 0, gap: '0.5rem' }}>
            {c.team.map((m) => (
              <li key={m.professionalId} className="ap-row" style={{ justifyContent: 'space-between' }}>
                <span className="ap-small"><strong>{db.professional(m.professionalId)?.name}</strong><br /><span className="ap-xs ap-muted">{ROLE_LABEL[m.role]}</span></span>
                {m.role !== 'responsible' && <Button size="sm" variant="ghost" onClick={() => { actions.setCaseMember(caseId, m.professionalId, null); setToast('Vínculo removido. O acesso ao caso foi encerrado.'); }}>Remover</Button>}
              </li>
            ))}
          </ul>
          <AddMember caseId={caseId} onDone={setToast} />
        </Card>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function ProfileRow({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="profile-row">
      <div><strong className="ap-small">{label}</strong>{hint && <small>{hint}</small>}</div>
      <div>{children}</div>
    </div>
  );
}

function ChipEditor({ label, items, value, setValue, onAdd, onRemove }: { label: string; items: string[]; value: string; setValue: (v: string) => void; onAdd: (v: string) => void; onRemove: (v: string) => void }) {
  return (
    <div className="ap-field">
      <span className="ap-label">{label}</span>
      <div className="chip-input">
        {items.map((i) => <span key={i} className="chip">{i}<button type="button" aria-label={`Remover ${i}`} onClick={() => onRemove(i)}>×</button></span>)}
        {items.length === 0 && <span className="ap-xs ap-muted">Nenhum.</span>}
      </div>
      <form className="ap-row" style={{ gap: '0.4rem', flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); if (value.trim()) { onAdd(value.trim()); setValue(''); } }}>
        <input className="ap-input" value={value} onChange={(e) => setValue(e.target.value)} aria-label={`Incluir em ${label}`} placeholder="Incluir…" />
        <Button type="submit">Incluir</Button>
      </form>
    </div>
  );
}

function AddMember({ caseId, onDone }: { caseId: string; onDone: (m: string) => void }) {
  const st = useStore((s) => s);
  const c = st.cases.find((x) => x.id === caseId)!;
  const available = st.professionals.filter((p) => !c.team.some((m) => m.professionalId === p.id));
  const [pid, setPid] = useState('');
  const [role, setRole] = useState<CaseRole>('implementer');
  if (!available.length) return null;
  return (
    <form className="add-member" onSubmit={(e) => { e.preventDefault(); if (!pid) return; actions.setCaseMember(caseId, pid, role); setPid(''); onDone('Profissional vinculado ao caso.'); }}>
      <select className="ap-select" value={pid} onChange={(e) => setPid(e.target.value)} aria-label="Profissional">
        <option value="">Vincular profissional…</option>
        {available.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <select className="ap-select" value={role} onChange={(e) => setRole(e.target.value as CaseRole)} aria-label="Papel no caso">
        {(['supervisor', 'implementer', 'observer'] as const).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
      </select>
      <Button type="submit" disabled={!pid}>Vincular</Button>
    </form>
  );
}

const SPACE_ITEMS: Array<{ id: string; label: string; hint: string }> = [
  { id: 'encontre-o-igual', label: 'Encontre o Igual', hint: 'jogo de pareamento' },
  { id: 'escolha-pela-instrucao', label: 'Escolha pela Instrução', hint: 'jogo de ouvinte' },
  { id: 'minha-vez-sua-vez', label: 'Minha Vez, Sua Vez', hint: 'jogo de turnos' },
  { id: 'prancha', label: 'Prancha de comunicação', hint: 'sempre disponível, mesmo sem tempo de tela' },
  { id: 'calma', label: 'Cantinho da calma', hint: 'respiração e estratégias de regulação' },
];

/** O que aparece no espaço da criança é decisão da equipe; o resto não existe para ela. */
function ChildSpaceCard({ caseId, onDone }: { caseId: string; onDone: (m: string) => void }) {
  const st = useStore((s) => s);
  const c = st.cases.find((x) => x.id === caseId)!;
  const child = db.childOf(c);
  const toggle = (id: string, on: boolean) => actions.setReleasedApps(caseId, on ? [...c.releasedApps, id] : c.releasedApps.filter((x) => x !== id));
  return (
    <Card title="Espaço da criança" actions={<Link className="ap-btn ap-btn--sm" to={`/espaco/${child.id}`}>Abrir</Link>}>
      <div className="ap-stack" style={{ gap: '0.8rem' }}>
        <div className="space-code">
          <span className="ap-xs ap-muted">Código de identificação</span>
          <strong>{child.accessCode}</strong>
          <Button size="sm" onClick={() => { void navigator.clipboard?.writeText(child.accessCode); onDone('Código copiado.'); }}>Copiar</Button>
        </div>
        <p className="ap-xs ap-muted">Um adulto digita este código em “Entrar › Criança”. O código identifica, não é senha.</p>
        <ul className="space-release">
          {SPACE_ITEMS.map((i) => (
            <li key={i.id}>
              <label className="consent">
                <input type="checkbox" checked={c.releasedApps.includes(i.id)} onChange={(e) => toggle(i.id, e.target.checked)} />
                <span><strong>{i.label}</strong><small>{i.hint}</small></span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
