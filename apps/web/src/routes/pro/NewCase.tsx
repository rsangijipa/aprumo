/**
 * Novo caso em 4 passos. Regras: consentimento de prontuário é obrigatório; os demais são
 * separados por finalidade; o modelo (ABA ou Denver) é escolhido aqui e fica fixo enquanto o plano vigorar.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ageInMonths } from '@aprumo/clinical-core';
import { Badge, Button, Card, Field, IconArrowRight, IconCheck, IconChevronLeft, IconInfo, ModelBadge } from '@aprumo/ui';
import { CURRENT_USER_ID } from '../../data/seed';
import { actions, db, useStore } from '../../data/store';
import './forms.css';

const STEPS = ['Criança', 'Responsável e consentimentos', 'Modelo e equipe', 'Revisão'] as const;

export default function NewCase() {
  const nav = useNavigate();
  const professionals = useStore((s) => s.professionals);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    fullName: '', preferredName: '', birthDate: '', interests: '', restrictions: '',
    guardianName: '', guardianRelationship: 'mãe',
    consents: { service: false, childPortal: false, media: false, school: false, research: false },
    model: '' as '' | 'ABA' | 'DENVER',
    implementerIds: [] as string[],
  });
  const up = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const months = f.birthDate ? ageInMonths(new Date(f.birthDate)) : null;

  const validate = (i: number): string | null => {
    if (i === 0) {
      if (f.fullName.trim().length < 3) return 'Informe o nome completo da criança.';
      if (!f.preferredName.trim()) return 'Informe como a criança gosta de ser chamada.';
      if (!f.birthDate || months == null || months < 0 || months > 216) return 'Informe uma data de nascimento válida (até 18 anos).';
    }
    if (i === 1) {
      if (f.guardianName.trim().length < 3) return 'Informe o responsável legal.';
      if (!f.consents.service) return 'Sem o consentimento de prontuário não é possível abrir o caso.';
    }
    if (i === 2 && !f.model) return 'Escolha o modelo de intervenção do caso.';
    return null;
  };

  const next = () => {
    const e = validate(step);
    setError(e);
    if (!e) setStep((s) => s + 1);
  };

  const create = () => {
    try {
      const id = actions.createCase({
        fullName: f.fullName, preferredName: f.preferredName, birthDate: f.birthDate, model: f.model as 'ABA' | 'DENVER',
        guardianName: f.guardianName, guardianRelationship: f.guardianRelationship,
        consents: { childPortal: f.consents.childPortal, media: f.consents.media, school: f.consents.school, research: f.consents.research },
        implementerIds: f.implementerIds,
        interests: f.interests.split(',').map((x) => x.trim()).filter(Boolean),
        restrictions: f.restrictions.split(',').map((x) => x.trim()).filter(Boolean),
      });
      nav(`/app/casos/${id}/plano`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="ap-stack" style={{ gap: '1.25rem', maxWidth: 760, width: '100%', margin: '0 auto' }}>
      <div>
        <Link to="/app/casos" className="ap-small" style={{ textDecoration: 'none' }}><IconChevronLeft style={{ width: 16, verticalAlign: '-3px' }} /> Casos</Link>
        <h1 style={{ fontSize: 'var(--ap-text-2xl)', marginTop: '0.4rem' }}>Novo caso</h1>
      </div>

      <ol className="wizard-steps" aria-label="Etapas">
        {STEPS.map((label, i) => (
          <li key={label} data-state={i < step ? 'done' : i === step ? 'current' : 'next'} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step ? <IconCheck /> : i + 1}</span>
            <em>{label}</em>
          </li>
        ))}
      </ol>

      <Card>
        <div className="ap-stack" style={{ gap: '1.1rem' }}>
          {step === 0 && (
            <>
              <h2 className="form-title">Quem é a criança</h2>
              <Field label="Nome completo" hint="Usado só no prontuário e em documentos formais.">
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={f.fullName} onChange={(e) => up('fullName', e.target.value)} autoComplete="off" />}
              </Field>
              <Field label="Como gosta de ser chamada" hint="É o nome que aparece nas telas e no ambiente infantil.">
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={f.preferredName} onChange={(e) => up('preferredName', e.target.value)} maxLength={40} autoComplete="off" />}
              </Field>
              <Field label="Data de nascimento" hint={months != null && months >= 0 ? `${months < 24 ? `${months} meses: sem ambiente infantil (SBP)` : `${Math.floor(months / 12)} anos e ${months % 12} meses`}` : undefined}>
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" type="date" value={f.birthDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => up('birthDate', e.target.value)} />}
              </Field>
              <Field label="Interesses" hint="Separados por vírgula. Viram reforçadores e temas de fichas.">
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={f.interests} onChange={(e) => up('interests', e.target.value)} placeholder="ex.: trens, música, bolhas" />}
              </Field>
              <Field label="Restrições e cuidados" hint="Alergias, restrições alimentares, sensibilidades. Separados por vírgula.">
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={f.restrictions} onChange={(e) => up('restrictions', e.target.value)} />}
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="form-title">Responsável legal e consentimentos</h2>
              <div className="form-row">
                <Field label="Nome do responsável">
                  {(a) => <input id={a.id} className="ap-input" value={f.guardianName} onChange={(e) => up('guardianName', e.target.value)} autoComplete="off" />}
                </Field>
                <Field label="Relação">
                  {(a) => (
                    <select id={a.id} className="ap-select" value={f.guardianRelationship} onChange={(e) => up('guardianRelationship', e.target.value)}>
                      {['mãe', 'pai', 'avó', 'avô', 'tutor(a) legal', 'outro'].map((r) => <option key={r}>{r}</option>)}
                    </select>
                  )}
                </Field>
              </div>
              <fieldset className="consents">
                <legend>Termos separados por finalidade (LGPD art. 14)</legend>
                {([
                  ['service', 'Prestação do serviço e prontuário', 'Obrigatório. Base legal: tutela da saúde e guarda do registro (mínimo de 20 anos).', true],
                  ['childPortal', 'Uso do ambiente infantil no tablet', 'Atividades sempre abertas e acompanhadas por um adulto.', false],
                  ['media', 'Fotos e vídeos para estímulos personalizados', 'Ex.: foto do copo de casa. Pode ser revogado a qualquer momento.', false],
                  ['school', 'Compartilhamento de orientações com a escola', 'Somente orientações combinadas, nunca o prontuário.', false],
                  ['research', 'Uso de dados desidentificados em pesquisa', 'Exige também aprovação do responsável técnico.', false],
                ] as const).map(([key, label, hint, required]) => (
                  <label key={key} className="consent">
                    <input type="checkbox" checked={f.consents[key]} onChange={(e) => up('consents', { ...f.consents, [key]: e.target.checked })} />
                    <span>
                      <strong>{label}{required && <Badge tone="info">obrigatório</Badge>}</strong>
                      <small>{hint}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
              <p className="ap-xs ap-muted">Cada termo é versionado, com data e responsável. A revogação não apaga registros cuja guarda é exigida por lei.</p>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="form-title">Modelo de intervenção</h2>
              <div className="model-pick" role="radiogroup" aria-label="Modelo de intervenção">
                {(['ABA', 'DENVER'] as const).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={f.model === m} className="model-option" data-model={m} onClick={() => up('model', m)}>
                    <ModelBadge model={m} />
                    <strong>{m === 'ABA' ? 'Análise do Comportamento Aplicada' : 'Modelo Denver de Intervenção Precoce'}</strong>
                    <small>{m === 'ABA' ? 'Programas com alvos, tentativas, oportunidades e cadeias. Critério de domínio por alvo.' : 'Objetivos trimestrais com passos, trabalhados em rotinas de atividade conjunta. Indicado de 12 a 60 meses.'}</small>
                  </button>
                ))}
              </div>
              {f.model === 'DENVER' && months != null && months > 60 && (
                <p className="ap-callout"><IconInfo /> O Modelo Denver foi desenhado para crianças de 12 a 60 meses. Confirme a indicação clínica.</p>
              )}
              <p className="ap-xs ap-muted">O modelo fica fixo enquanto o plano vigorar. Mudar exige encerrar o plano, com justificativa, e abrir outro com nova linha de base.</p>

              <h2 className="form-title" style={{ marginTop: '0.5rem' }}>Equipe do caso</h2>
              <p className="ap-small ap-muted">Você entra como responsável técnica. Escolha quem aplica as sessões.</p>
              <div className="ap-stack" style={{ gap: '0.4rem' }}>
                {professionals.filter((p) => p.id !== CURRENT_USER_ID).map((p) => (
                  <label key={p.id} className="consent">
                    <input type="checkbox" checked={f.implementerIds.includes(p.id)} onChange={(e) => up('implementerIds', e.target.checked ? [...f.implementerIds, p.id] : f.implementerIds.filter((x) => x !== p.id))} />
                    <span><strong>{p.name}</strong><small>{p.role}</small></span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="form-title">Revise antes de abrir o caso</h2>
              <dl className="review">
                <dt>Criança</dt><dd>{f.preferredName} ({f.fullName}) · nascida em {new Date(f.birthDate).toLocaleDateString('pt-BR')}</dd>
                <dt>Responsável</dt><dd>{f.guardianName} · {f.guardianRelationship}</dd>
                <dt>Consentimentos</dt><dd>{Object.entries(f.consents).filter(([, v]) => v).length} de 5 termos</dd>
                <dt>Modelo</dt><dd>{f.model && <ModelBadge model={f.model} />}</dd>
                <dt>Equipe</dt><dd>{[db.professional(CURRENT_USER_ID)!.name + ' (responsável)', ...f.implementerIds.map((id) => db.professional(id)!.name)].join(', ')}</dd>
              </dl>
              <p className="ap-small ap-muted">O caso abre com o plano em rascunho. Inclua objetivos e alvos e aprove o plano para começar as sessões.</p>
            </>
          )}

          {error && <p role="alert" className="form-error">{error}</p>}

          <div className="form-actions">
            {step > 0 && <Button onClick={() => { setError(null); setStep((s) => s - 1); }}>Voltar</Button>}
            {step < 3 ? (
              <Button variant="primary" icon={<IconArrowRight />} onClick={next}>Continuar</Button>
            ) : (
              <Button variant="primary" icon={<IconCheck />} onClick={create}>Abrir caso e montar o plano</Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
