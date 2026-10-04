/**
 * Portal da família. Mostra só o que é compartilhado: progresso em linguagem acessível,
 * tarefas de casa, orientações e documentos finalizados. Nunca notas internas, comportamento
 * ou dados de outras crianças. O que a família registra é identificado como "relato do responsável".
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { StimulusArt } from '@aprumo/stimuli';
import { Button, IconCheck, IconFile, IconHeart, IconLogout, Logo, IconSmile } from '@aprumo/ui';
import { actions, db, formatAge, summariesFor, useStore } from '../../data/store';
import type { Guidance, HomeTask } from '../../data/types';
import './family.css';

const GUARDIAN_ID = 'gd-teo-mae';

const PLAIN_PHASE: Record<string, { label: string; tone: string; desc: string }> = {
  baseline: { label: 'Começando a observar', tone: 'neutral', desc: 'Verificando o que já sabe antes de iniciar' },
  acquisition: { label: 'Aprendendo', tone: 'learning', desc: 'Praticando novas habilidades com apoio da equipe' },
  maintenance: { label: 'Praticando para fixar', tone: 'done', desc: 'Habilidade aprendida, mantendo ativa e firme' },
  generalization: { label: 'Usando em outros lugares', tone: 'done', desc: 'Usando em casa, na escola e com outros' },
  mastered: { label: 'Conquistado com autonomia', tone: 'done', desc: 'Faz sozinho em qualquer momento do dia a dia' },
  review: { label: 'Equipe ajustando estratégias', tone: 'neutral', desc: 'Revisando a forma de ensinar para facilitar' },
  suspended: { label: 'Pausa temporária', tone: 'neutral', desc: 'Objetivo temporariamente em pausa pela equipe' },
};

export default function FamilyPortal() {
  const guardian = db.guardians.find((g) => g.id === GUARDIAN_ID)!;
  const child = db.children.find((c) => c.id === guardian.childId)!;
  const c = db.cases.find((x) => x.childId === child.id)!;
  const st = useStore((s) => s);
  const targets = st.targets.filter((t) => t.caseId === c.id && t.phase !== 'suspended');
  const tasks = st.homeTasks.filter((t) => t.caseId === c.id && t.active);
  const guidance = st.guidance.filter((g) => g.caseId === c.id).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const docs = st.documents.filter((d) => d.caseId === c.id && d.sharedWithFamily && d.versions.some((v) => v.status === 'final'));
  const answered = st.socialValidity.some((v) => v.caseId === c.id && v.guardianId === guardian.id);
  const nextSessions = st.sessions.filter((s) => s.caseId === c.id).length;

  const [activeTab, setActiveTab] = useState<'inicio' | 'aprendendo' | 'casa' | 'orient' | 'docs'>('inicio');

  const scrollTo = (id: string, tab: 'inicio' | 'aprendendo' | 'casa' | 'orient' | 'docs') => {
    setActiveTab(tab);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fam">
      <header className="fam-top">
        <Logo href="/familia" />
        <span className="fam-demo">Demonstração · dados fictícios</span>
        <Link className="ap-btn ap-btn--ghost" to="/"><IconLogout /> Sair</Link>
      </header>

      <main className="fam-main" id="conteudo">
        <section className="fam-hello">
          <span className="fam-avatar" style={{ background: `hsl(${child.hue} 34% 44%)` }} aria-hidden="true">{child.preferredName[0]}</span>
          <div>
            <h1 className="ap-display">Olá, {guardian.name.split(' ')[0]}</h1>
            <p>Acompanhe o que {child.preferredName} ({formatAge(child.birthDate)}) está aprendendo e como ajudar em casa.</p>
          </div>
        </section>

        <section className="fam-section" id="aprendendo" aria-labelledby="aprendendo-title">
          <h2 id="aprendendo-title">O que {child.preferredName} está aprendendo ({targets.length})</h2>
          <div className="fam-grid">
            {targets.map((t) => {
              const p = db.programOf(t);
              const last = summariesFor(st.facts, t.id).at(-1);
              const phase = PLAIN_PHASE[t.phase] ?? { label: t.phase, tone: 'neutral', desc: '' };
              return (
                <article key={t.id} className="fam-card">
                  <div className="fam-card__art"><StimulusArt art={t.art} label={t.name} /></div>
                  <div className="fam-card__body">
                    <span className={`fam-chip fam-chip--${phase.tone}`}>{phase.label}</span>
                    <strong>{plainProgram(p.repertoire, t.name)}</strong>
                    <p className="fam-hint">{phase.desc}</p>
                    {last && last.opportunities > 0 && (
                      <p>{last.probe ? 'Na última verificação' : 'Na última sessão'}, fez <b>sozinho {last.correctIndependent} de {last.opportunities}</b> vezes.</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <p className="fam-hint">“Sozinho” quer dizer sem nenhuma ajuda. Quando há ajuda, a equipe registra separado: é assim que sabemos o que já foi aprendido.</p>
        </section>

        <section className="fam-section" id="casa" aria-labelledby="casa-title">
          <h2 id="casa-title">Para fazer em casa</h2>
          <div className="ap-stack" style={{ gap: '1rem' }}>
            {tasks.length === 0 ? (
              <p className="fam-hint">Nenhuma tarefa ativa no momento.</p>
            ) : (
              tasks.map((t) => <HomeTaskCard key={t.id} task={t} guardianId={guardian.id} />)
            )}
          </div>
        </section>

        <div className="fam-two">
          <section className="fam-section" id="orient" aria-labelledby="orient-title">
            <h2 id="orient-title">Orientações da equipe ({guidance.length})</h2>
            <div className="ap-stack" style={{ gap: '1rem' }}>
              {guidance.map((g) => (
                <GuidanceCard key={g.id} g={g} guardianId={guardian.id} />
              ))}
            </div>
          </section>

          <section className="fam-section" id="docs" aria-labelledby="docs-title">
            <h2 id="docs-title">Documentos Compartilhados</h2>
            {docs.length === 0 && <p className="fam-hint">Nenhum documento compartilhado ainda.</p>}
            {docs.map((d) => {
              const v = [...d.versions].reverse().find((x) => x.status === 'final')!;
              return (
                <details key={d.id} className="fam-guidance">
                  <summary>
                    <span><IconFile style={{ width: 18, verticalAlign: '-3px' }} /> {d.title}</span>
                    <span className="fam-hint">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</span>
                  </summary>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{v.analysis}</p>
                  <p className="fam-hint">Assinado por {db.professional(v.authorId)?.name} · {v.council}</p>
                </details>
              );
            })}
          </section>
        </div>

        <section className="fam-section" aria-labelledby="opiniao">
          <h2 id="opiniao">Sua opinião</h2>
          {answered ? (
            <p className="fam-thanks"><IconHeart /> Obrigado! Sua resposta ajuda a equipe a ajustar o plano.</p>
          ) : (
            <SocialValidityForm caseId={c.id} guardianId={guardian.id} />
          )}
        </section>

        <footer className="fam-foot">
          <p>{nextSessions} sessões registradas neste plano. Mensagens pelo portal não são lidas em tempo real: em caso de urgência, ligue para a clínica.</p>
        </footer>
      </main>

      {/* Navegação Inferior Móvel (Thumb Ergonomics) */}
      <nav className="fam-tabbar" aria-label="Navegação móvel da família">
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'inicio' ? 'page' : undefined}
          onClick={() => scrollTo('conteudo', 'inicio')}
        >
          <IconSmile />
          <span>Início</span>
        </button>
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'aprendendo' ? 'page' : undefined}
          onClick={() => scrollTo('aprendendo', 'aprendendo')}
        >
          <IconCheck />
          <span>Progresso</span>
        </button>
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'casa' ? 'page' : undefined}
          onClick={() => scrollTo('casa', 'casa')}
        >
          <IconHeart />
          <span>Em Casa</span>
        </button>
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'orient' ? 'page' : undefined}
          onClick={() => scrollTo('orient', 'orient')}
        >
          <IconFile />
          <span>Orientações</span>
        </button>
        <button
          type="button"
          className="fam-tabbar-item"
          aria-current={activeTab === 'docs' ? 'page' : undefined}
          onClick={() => scrollTo('docs', 'docs')}
        >
          <IconFile />
          <span>Documentos</span>
        </button>
      </nav>
    </div>
  );
}

function GuidanceCard({ g, guardianId }: { g: Guidance; guardianId: string }) {
  const read = g.readBy.includes(guardianId);
  const author = db.professional(g.authorId)?.name ?? 'Equipe Aprumo';

  return (
    <article className={`fam-guidance-card ${!read ? 'unread' : ''}`}>
      <div className="fam-guidance-card__head">
        <div>
          <h3>{g.title}</h3>
          <span className="fam-hint">Por {author} · {new Date(g.publishedAt).toLocaleDateString('pt-BR')}</span>
        </div>
        {read ? (
          <span className="fam-chip fam-chip--done"><IconCheck /> Lida por você</span>
        ) : (
          <span className="fam-chip fam-chip--new">Nova orientação</span>
        )}
      </div>

      <p style={{ margin: 0, color: 'var(--ap-text)' }}>{g.body}</p>

      {(g.objective || g.strategy || g.avoid || g.practiceTip || g.frequency) && (
        <div className="fam-guidance-grid">
          {g.objective && (
            <div className="fam-guidance-item">
              <strong>Objetivo:</strong>
              <span>{g.objective}</span>
            </div>
          )}
          {g.strategy && (
            <div className="fam-guidance-item">
              <strong>Estratégia Recomendada:</strong>
              <span>{g.strategy}</span>
            </div>
          )}
          {g.avoid && (
            <div className="fam-guidance-item">
              <strong>O que evitar:</strong>
              <span>{g.avoid}</span>
            </div>
          )}
          {g.practiceTip && (
            <div className="fam-guidance-item">
              <strong>Como praticar no dia a dia:</strong>
              <span>{g.practiceTip}</span>
            </div>
          )}
          {g.frequency && (
            <div className="fam-guidance-item">
              <strong>Frequência sugerida:</strong>
              <span>{g.frequency}</span>
            </div>
          )}
        </div>
      )}

      <div className="fam-guidance-foot">
        {!read ? (
          <Button variant="primary" size="sm" onClick={() => actions.markGuidanceRead(g.id, guardianId)}>
            <IconCheck /> Confirmar que li e compreendi
          </Button>
        ) : (
          <span className="fam-hint">Confirmação registrada no prontuário da clínica.</span>
        )}
      </div>
    </article>
  );
}

function plainProgram(repertoire: string, target: string): string {
  switch (repertoire) {
    case 'listener': return `Entender e pegar “${target}” quando pedimos`;
    case 'matching': return `Encontrar o igual: ${target}`;
    case 'social': return 'Esperar a vez e brincar junto';
    case 'mand': return `Pedir o que quer: ${target}`;
    default: return target;
  }
}

function HomeTaskCard({ task, guardianId }: { task: HomeTask; guardianId: string }) {
  const records = useStore((s) => s.homeRecords.filter((r) => r.taskId === task.id));
  const today = new Date().toISOString().slice(0, 10);
  const doneToday = records.find((r) => r.occurredOn === today);
  const [opp, setOpp] = useState(3);
  const [ok, setOk] = useState(0);
  const [note, setNote] = useState('');

  return (
    <article className="fam-task">
      <div className="fam-task__text">
        <span className="fam-hint">{task.frequency}</span>
        <h3>{task.title}</h3>
        <p>{task.instructions}</p>
      </div>
      <div className="fam-task__log">
        {doneToday ? (
          <p className="fam-thanks"><IconCheck /> Registrado hoje: {doneToday.successes} de {doneToday.opportunities}.</p>
        ) : (
          <>
            <h4>Como foi hoje?</h4>
            <Stepper label="Quantas vezes vocês tentaram?" value={opp} min={0} max={20} onChange={(v) => { setOpp(v); setOk((o) => Math.min(o, v)); }} />
            <Stepper label="Quantas vezes deu certo?" value={ok} min={0} max={opp} onChange={setOk} />
            <label className="ap-field"><span className="fam-hint">Quer contar algo? (opcional)</span>
              <input className="ap-input" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <Button variant="primary" size="lg" onClick={() => void actions.recordHome({ taskId: task.id, occurredOn: today, opportunities: opp, successes: ok, note: note || undefined, guardianId })}>
              Salvar
            </Button>
          </>
        )}
        <p className="fam-hint">Últimos dias: {records.slice(-5).map((r) => `${r.successes}/${r.opportunities}`).join(' · ') || '—'}</p>
      </div>
    </article>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="fam-stepper" role="group" aria-label={label}>
      <span>{label}</span>
      <div>
        <button type="button" aria-label="Menos" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label="Mais" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    </div>
  );
}

function SocialValidityForm({ caseId, guardianId }: { caseId: string; guardianId: string }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [comment, setComment] = useState('');
  return (
    <div className="ap-stack" style={{ gap: '1rem' }}>
      <Likert label="Os objetivos escolhidos são importantes para a sua família?" value={a} set={setA} />
      <Likert label="Você se sente bem com a forma como a equipe trabalha?" value={b} set={setB} />
      <Likert label="Você está satisfeito(a) com o atendimento?" value={c} set={setC} />
      <label className="ap-field"><span className="fam-hint">Comentário (opcional)</span><textarea className="ap-textarea" value={comment} onChange={(e) => setComment(e.target.value)} /></label>
      <Button variant="primary" size="lg" disabled={!a || !b || !c}
        onClick={() => actions.answerSocialValidity({ caseId, guardianId, goalsImportance: a, proceduresAcceptability: b, satisfaction: c, comment: comment || undefined })}>
        Enviar resposta
      </Button>
    </div>
  );
}

function Likert({ label, value, set }: { label: string; value: number; set: (n: number) => void }) {
  return (
    <fieldset className="fam-likert">
      <legend>{label}</legend>
      <div>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-pressed={value === n} onClick={() => set(n)}>{n}</button>
        ))}
      </div>
      <span className="fam-hint">1 = nada · 5 = muito</span>
    </fieldset>
  );
}
