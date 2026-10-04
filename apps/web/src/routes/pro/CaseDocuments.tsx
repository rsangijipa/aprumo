/**
 * Documentos (Res. CFP 06/2019): o sistema preenche os dados objetivos do período; o profissional
 * redige a análise. A versão final recebe registro no conselho, hash e não muda mais; reedição = nova versão.
 */
import { useState } from 'react';
import { useParams } from 'react-router';
import { Badge, Button, Card, Dialog, IconFile, IconLock, IconPlus, Segmented } from '@aprumo/ui';
import { actions, db, formatAge, useStore } from '../../data/store';
import type { ClinicalDocument, DocumentKind } from '../../data/types';
import './documents.css';

const KIND: Record<DocumentKind, string> = {
  progress_report: 'Relatório de evolução',
  family_summary: 'Resumo para a família',
  school_report: 'Orientação para a escola',
  declaration: 'Declaração de atendimento',
};

export default function CaseDocuments() {
  const { caseId = '' } = useParams();
  const docs = useStore((s) => s.documents.filter((d) => d.caseId === caseId));
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const open = docs.find((d) => d.id === openId);

  if (open) return <DocumentEditor doc={open} onBack={() => setOpenId(null)} />;

  return (
    <Card title="Documentos" actions={<Button size="sm" icon={<IconPlus />} onClick={() => setCreating(true)}>Novo documento</Button>}>
      {docs.length === 0 && <p className="ap-muted ap-small">Nenhum documento.</p>}
      <div className="ap-stack" style={{ gap: 0, margin: '-0.5rem 0' }}>
        {docs.map((d) => {
          const last = d.versions.at(-1)!;
          return (
            <button key={d.id} className="target-pick" style={{ gridTemplateColumns: '28px 1fr auto' }} onClick={() => setOpenId(d.id)}>
              <IconFile style={{ width: 22, color: 'var(--ap-sage-600)' }} />
              <span>
                <span className="ap-small" style={{ fontWeight: 700, display: 'block' }}>{d.title}</span>
                <span className="ap-xs ap-muted">{KIND[d.kind]} · versão {last.version} · {new Date(last.createdAt).toLocaleDateString('pt-BR')}{d.sharedWithFamily ? ' · compartilhado com a família' : ''}</span>
              </span>
              {last.status === 'final' ? <Badge tone="success"><IconLock /> final</Badge> : <Badge tone="warning">rascunho</Badge>}
            </button>
          );
        })}
      </div>
      <NewDocumentDialog open={creating} caseId={caseId} onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setOpenId(id); }} />
    </Card>
  );
}

function NewDocumentDialog({ open, caseId, onClose, onCreated }: { open: boolean; caseId: string; onClose: () => void; onCreated: (id: string) => void }) {
  const [kind, setKind] = useState<DocumentKind>('progress_report');
  const [days, setDays] = useState(30);
  const child = db.childOf(db.caseById(caseId)!);
  return (
    <Dialog open={open} onClose={onClose} title="Novo documento"
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => onCreated(actions.createDocument(caseId, kind, `${KIND[kind]} — ${child.preferredName}`, days))}>Criar rascunho</Button></>}>
      <div className="ap-field"><span className="ap-label">Tipo</span>
        <Segmented label="Tipo de documento" value={kind} onChange={setKind} options={(['progress_report', 'family_summary', 'school_report'] as const).map((k) => ({ value: k, label: KIND[k] }))} />
      </div>
      <label className="ap-field"><span className="ap-label">Período (dias)</span><input className="ap-input" type="number" min={7} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} /></label>
      <p className="ap-xs ap-muted">Os dados objetivos (sessões, alvos, resultados) são preenchidos a partir dos registros do período. A análise é sua.</p>
    </Dialog>
  );
}

function DocumentEditor({ doc, onBack }: { doc: ClinicalDocument; onBack: () => void }) {
  const last = doc.versions.at(-1)!;
  const c = db.caseById(doc.caseId)!;
  const child = db.childOf(c);
  const author = db.professional(last.authorId);
  const [analysis, setAnalysis] = useState(last.analysis);
  const [council, setCouncil] = useState(author?.council ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const isFinal = last.status === 'final';
  const snap = last.snapshot;
  const forFamily = doc.kind === 'family_summary';

  const save = async (final: boolean) => {
    setError(null);
    try {
      await actions.saveDocumentVersion(doc.id, analysis, final, final ? council : null);
      setSaved(final ? 'Documento finalizado. Esta versão não pode mais ser alterada.' : 'Rascunho salvo como nova versão.');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="ap-stack" style={{ gap: '1rem' }}>
      <div className="ap-row doc-toolbar" style={{ justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={onBack}>← Documentos</Button>
        <div className="ap-row">
          <label className="ap-row ap-small" style={{ gap: '0.4rem' }}>
            <input type="checkbox" checked={doc.sharedWithFamily} onChange={(e) => actions.setDocumentShared(doc.id, e.target.checked)} /> Compartilhar com a família (só versões finais)
          </label>
          <Button onClick={() => window.print()} icon={<IconFile />}>Imprimir / PDF</Button>
        </div>
      </div>

      <article className="doc-paper" aria-label={doc.title}>
        <header className="doc-head">
          <div>
            <span className="ap-eyebrow">{KIND[doc.kind]}</span>
            <h1 className="ap-display">{doc.title}</h1>
          </div>
          <div className="doc-meta">
            {isFinal ? <Badge tone="success"><IconLock /> versão {last.version} · final</Badge> : <Badge tone="warning">rascunho · versão {last.version}</Badge>}
          </div>
        </header>

        <section>
          <h2>Identificação</h2>
          <p>{forFamily ? child.preferredName : child.fullName} · {formatAge(child.birthDate)} · atendimento em {c.model === 'ABA' ? 'Análise do Comportamento Aplicada (ABA)' : 'Modelo Denver de Intervenção Precoce'}.</p>
          <p>Período: {new Date(snap.periodFrom).toLocaleDateString('pt-BR')} a {new Date(snap.periodTo).toLocaleDateString('pt-BR')} · {snap.sessions} sessões realizadas.</p>
        </section>

        {snap.targets.length > 0 && (
          <section>
            <h2>{forFamily ? 'O que está sendo trabalhado' : 'Resultados por alvo'}</h2>
            <div className="doc-table-wrap">
            <table className="ap-table ap-tabular">
              <thead><tr><th>Alvo</th><th>Programa</th><th>Fase atual</th>{!forFamily && <><th>Início do período</th><th>Fim do período</th><th>Oportunidades</th></>}</tr></thead>
              <tbody>
                {snap.targets.map((t) => (
                  <tr key={t.name + t.program}>
                    <td>{t.name}</td><td>{t.program}</td><td>{t.phase}</td>
                    {!forFamily && <><td>{t.firstPct != null ? `${Math.round(t.firstPct)}%` : '—'}</td><td>{t.lastPct != null ? `${Math.round(t.lastPct)}%` : '—'}</td><td>{t.n}</td></>}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {!forFamily && <p className="doc-note">Percentuais de respostas corretas independentes por alvo; acertos com dica não são somados. Não há índice geral entre alvos.</p>}
          </section>
        )}

        <section>
          <h2>{forFamily ? 'Mensagem da equipe' : 'Análise do profissional'}</h2>
          {isFinal ? (
            <p style={{ whiteSpace: 'pre-wrap' }}>{last.analysis}</p>
          ) : (
            <textarea className="ap-textarea doc-analysis" value={analysis} onChange={(e) => setAnalysis(e.target.value)} aria-label="Análise do profissional"
              placeholder={forFamily ? 'Linguagem simples, sem termos técnicos: o que a criança conquistou e como a família pode ajudar.' : 'Interpretação dos dados, decisões tomadas no período e próximos passos.'} />
          )}
        </section>

        <footer className="doc-sign">
          <p>{author?.name} · {author?.role}</p>
          <p>{isFinal ? `Registro: ${last.council} · ${new Date(last.createdAt).toLocaleString('pt-BR')}` : 'Assinatura na finalização'}</p>
          {isFinal && <p className="doc-hash">Integridade (SHA-256): {last.hash}</p>}
        </footer>
      </article>

      {!isFinal ? (
        <Card title="Finalizar">
          <div className="ap-row" style={{ alignItems: 'flex-end', gap: '1rem' }}>
            <label className="ap-field" style={{ flex: 1, minWidth: 220 }}>
              <span className="ap-label">Registro no conselho</span>
              <input className="ap-input" value={council} onChange={(e) => setCouncil(e.target.value)} placeholder="CRP 00/00000" />
            </label>
            <Button onClick={() => void save(false)}>Salvar rascunho</Button>
            <Button variant="primary" icon={<IconLock />} onClick={() => void save(true)}>Finalizar e assinar</Button>
          </div>
          {error && <p role="alert" className="ap-small" style={{ color: 'var(--ap-danger)', marginTop: '0.6rem' }}>{error}</p>}
          {saved && <p role="status" className="ap-small" style={{ color: 'var(--ap-success)', marginTop: '0.6rem' }}>{saved}</p>}
        </Card>
      ) : (
        <p className="ap-small ap-muted">Para corrigir, crie um novo documento ou uma nova versão: a versão final permanece no prontuário como foi assinada.</p>
      )}

      <Card title="Histórico de versões">
        <ol className="ap-stack" style={{ margin: 0, paddingLeft: '1.2rem', gap: '0.3rem' }}>
          {doc.versions.map((v) => (
            <li key={v.version} className="ap-small">Versão {v.version} · {v.status === 'final' ? 'final' : 'rascunho'} · {new Date(v.createdAt).toLocaleString('pt-BR')}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
