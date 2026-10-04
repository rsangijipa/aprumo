import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Button,
  Card,
  Field,
  IconArrowRight,
  IconCheck,
  IconPlus,
  IconPrinter,
  PageHeader,
  Segmented,
} from '@aprumo/ui';
import { db, useStore } from '../../data/store';
import './forms.css';

type PlanType = 'PEI' | 'PIC' | 'ABA' | 'DENVER' | 'AUTONOMIA';

const PLAN_TYPE_LABELS: Record<PlanType, { title: string; subtitle: string }> = {
  PEI: { title: 'PEI — Plano Educacional Individualizado', subtitle: 'Acomodações curriculares, metas pedagógicas e mediação escolar.' },
  PIC: { title: 'PIC — Plano de Intervenção Comportamental', subtitle: 'Comportamentos-alvo, manejo de antecedentes e ensino de respostas substitutivas.' },
  ABA: { title: 'Plano ABA Completo', subtitle: 'Ensino estruturado por repertórios verbais, DTT, NET e critérios de domínio.' },
  DENVER: { title: 'Plano Modelo Denver (ESDM)', subtitle: 'Objetivos trimestrais funcionais, rotinas sociais e comunicação recíproca.' },
  AUTONOMIA: { title: 'Plano de Autonomia & Vida Diária', subtitle: 'Higiene, alimentação, vestuário, rotinas e independência comunitária.' },
};

const STEPS = [
  'Identificação',
  'Caracterização',
  'Potencialidades',
  'Barreiras',
  'Objetivos',
  'Estratégias',
  'Escola',
  'Família',
  'Revisão & Impressão',
] as const;

interface ClinicalGoal {
  id: string;
  area: string;
  repertoire: string;
  context: string;
  behavior: string;
  criterion: string;
  opportunities: string;
  consecutiveSessions: string;
  generalization: string;
}

const TEMPLATES: Array<{ name: string; area: string; repertoire: string; context: string; behavior: string; criterion: string }> = [
  {
    name: 'Mando com figura / prancha',
    area: 'Comunicação',
    repertoire: 'Mando',
    context: 'na presença do item motivador visível mas fora de alcance',
    behavior: 'entregará a figura correspondente ou apontará para o item desejado espontaneamente',
    criterion: 'em pelo menos 80% das oportunidades em 3 dias consecutivos',
  },
  {
    name: 'Discriminação receptiva (ouvinte)',
    area: 'Comunicação',
    repertoire: 'Ouvinte / Seleção',
    context: 'diante de uma mesa com 3 figuras e a instrução verbal "mostre o [alvo]"',
    behavior: 'tocará na figura correta em até 3 segundos sem ajuda física',
    criterion: 'com 90% de respostas independentes em 2 blocos de 10 tentativas',
  },
  {
    name: 'Espera estruturada com timer',
    area: 'Regulação & Autonomia',
    repertoire: 'Tolerância / Espera',
    context: 'quando solicitado a aguardar a transição de atividade com auxílio de timer visual',
    behavior: 'permanecerá calmo e sem comportamentos disruptivos por 2 minutos',
    criterion: 'em 4 de 5 oportunidades registradas na semana',
  },
  {
    name: 'Troca de turnos (brincar social)',
    area: 'Socialização',
    repertoire: 'Brincar Recíproco',
    context: 'durante jogo de tabuleiro ou empilhamento de blocos com um par',
    behavior: 'aguardará a vez do colega e executará a sua jogada sob a deixa verbal "sua vez"',
    criterion: 'por 5 turnos consecutivos sem invasão de material',
  },
];

export default function PlanBuilder() {
  const st = useStore((s) => s);
  const [planType, setPlanType] = useState<PlanType>('PEI');
  const [step, setStep] = useState(0);

  // Estado do plano
  const [selectedCaseId, setSelectedCaseId] = useState<string>(st.cases[0]?.id ?? '');
  const selectedCase = st.cases.find((c) => c.id === selectedCaseId);
  const child = selectedCase ? db.childOf(selectedCase) : null;

  const [formData, setFormData] = useState({
    professionalName: 'Dra. Carolina Mendonça (CRP 06/123456)',
    validityMonths: '6',
    diagnosisContext: 'Transtorno do Espectro Autista (F84.0). Acompanhamento multiprofissional.',
    strengths: 'Excelente memória visual, forte interesse por estímulos musicais e animais, compreensão rápida de suportes pictográficos.',
    barriers: 'Dificuldade de transição entre tarefas de alta preferência, fuga de demandas verbais complexas, sensibilidade auditiva a ruídos súbitos.',
    strategies: 'Uso de agenda visual em primeiro/depois, reforçamento diferencial de comportamento alternativo (DRA), pausas sensoriais a cada 20 minutos.',
    schoolGuidance: 'Permitir uso de fones abafadores em ambientes barulhentos; fragmentar tarefas escolares em etapas de até 10 minutos com intervalo previsível.',
    familyGuidance: 'Praticar o mando de itens de café da manhã em casa; evitar antecipar as necessidades da criança quando houver motivação para comunicação.',
  });

  const [goals, setGoals] = useState<ClinicalGoal[]>([
    {
      id: 'g1',
      area: 'Comunicação',
      repertoire: 'Mando',
      context: 'na presença de itens de interesse fora do alcance imediato',
      behavior: 'utilizará comunicação intencional (apontar ou prancha de escolha)',
      criterion: 'em pelo menos 80% das oportunidades',
      opportunities: '10 tentativas diárias',
      consecutiveSessions: '3 sessões consecutivas',
      generalization: 'em ambiente clínico e domiciliar',
    },
  ]);

  // Novo objetivo em edição
  const [newGoal, setNewGoal] = useState<ClinicalGoal>({
    id: '',
    area: 'Comunicação',
    repertoire: 'Mando',
    context: 'quando apresentado a um item motivador',
    behavior: 'emitirá a resposta alvo de forma independente',
    criterion: 'com pelo menos 80% de precisão',
    opportunities: '10 tentativas',
    consecutiveSessions: '3 sessões',
    generalization: 'com dois aplicadores diferentes',
  });

  const up = (k: string, v: string) => setFormData((d) => ({ ...d, [k]: v }));

  const computedGoalSentence = useMemo(() => {
    const childName = child?.preferredName || 'A criança';
    return `Quando apresentada a [${newGoal.context}], ${childName} irá [${newGoal.behavior}] com critério de [${newGoal.criterion}], em blocos de [${newGoal.opportunities}], mantido por [${newGoal.consecutiveSessions}] e generalizado [${newGoal.generalization}].`;
  }, [child, newGoal]);

  const addGoal = () => {
    setGoals((prev) => [...prev, { ...newGoal, id: `goal-${Date.now()}` }]);
  };

  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setNewGoal((g) => ({
      ...g,
      area: t.area,
      repertoire: t.repertoire,
      context: t.context,
      behavior: t.behavior,
      criterion: t.criterion,
    }));
  };

  return (
    <div className="ap-stack" style={{ gap: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
      <PageHeader
        backHref="/app"
        backLabel="Início"
        title="Construtor de Plano Individualizado"
        description="Instrumento técnico para elaboração de PEI, PIC, Planos ABA, Denver e Autonomia funcional."
        actions={
          <Button variant="default" icon={<IconPrinter />} onClick={() => window.print()}>
            Imprimir / Salvar PDF
          </Button>
        }
      />

      {/* Tipo do Plano */}
      <div className="ap-card" style={{ padding: '1rem 1.25rem' }}>
        <span className="ap-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Tipo de Plano Clínico / Educacional:</span>
        <Segmented<PlanType>
          label="Tipo de Plano"
          value={planType}
          onChange={setPlanType}
          options={[
            { value: 'PEI', label: 'PEI (Escolar)' },
            { value: 'ABA', label: 'Plano ABA' },
            { value: 'DENVER', label: 'Modelo Denver' },
            { value: 'PIC', label: 'PIC (Comportamento)' },
            { value: 'AUTONOMIA', label: 'Autonomia / AVD' },
          ]}
        />
        <p className="ap-small ap-muted" style={{ margin: '0.5rem 0 0 0' }}>
          <strong>{PLAN_TYPE_LABELS[planType].title}</strong> — {PLAN_TYPE_LABELS[planType].subtitle}
        </p>
      </div>

      {/* Stepper das etapas */}
      <ol className="wizard-steps" aria-label="Etapas do plano" style={{ overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {STEPS.map((label, i) => (
          <li
            key={label}
            data-state={i < step ? 'done' : i === step ? 'current' : 'next'}
            aria-current={i === step ? 'step' : undefined}
          >
            <button
              type="button"
              onClick={() => setStep(i)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
            >
              <span>{i < step ? <IconCheck /> : i + 1}</span>
              <em>{label}</em>
            </button>
          </li>
        ))}
      </ol>

      {/* Conteúdo da Etapa Atual */}
      <Card>
        <div className="ap-stack" style={{ gap: '1.2rem' }}>
          {/* 1. Identificação */}
          {step === 0 && (
            <>
              <h2 className="form-title">1. Identificação do Caso</h2>
              <div className="ap-field">
                <label className="ap-label" htmlFor="case-select">Vincular a Caso Existente</label>
                <select
                  id="case-select"
                  className="ap-select"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                >
                  {st.cases.map((c) => {
                    const ch = db.childOf(c);
                    return (
                      <option key={c.id} value={c.id}>
                        {ch.preferredName} ({ch.fullName}) — Modelo {c.model}
                      </option>
                    );
                  })}
                </select>
              </div>

              <Field label="Responsável Técnico pelo Plano">
                {(a) => <input id={a.id} className="ap-input" value={formData.professionalName} onChange={(e) => up('professionalName', e.target.value)} />}
              </Field>

              <Field label="Validade / Vigência do Plano (em meses)" hint="Geralmente 3 meses para ciclos Denver e 6 meses para PEI/ABA.">
                {(a) => <input id={a.id} className="ap-input" type="number" min="1" max="12" value={formData.validityMonths} onChange={(e) => up('validityMonths', e.target.value)} />}
              </Field>
            </>
          )}

          {/* 2. Caracterização */}
          {step === 1 && (
            <>
              <h2 className="form-title">2. Caracterização & Contexto Clínico</h2>
              <Field label="Diagnóstico, hipóteses e contexto de desenvolvimento" hint="Descreva dados clínicos relevantes e histórico de intervenções.">
                {(a) => <textarea id={a.id} className="ap-textarea" rows={4} value={formData.diagnosisContext} onChange={(e) => up('diagnosisContext', e.target.value)} />}
              </Field>
            </>
          )}

          {/* 3. Potencialidades */}
          {step === 2 && (
            <>
              <h2 className="form-title">3. Potencialidades & Pontos Fortes</h2>
              <Field label="Habilidades consolidadas e interesses motivacionais" hint="Toda intervenção eficaz começa ancorada no que a criança já domina e no que a motiva.">
                {(a) => <textarea id={a.id} className="ap-textarea" rows={4} value={formData.strengths} onChange={(e) => up('strengths', e.target.value)} />}
              </Field>
            </>
          )}

          {/* 4. Barreiras */}
          {step === 3 && (
            <>
              <h2 className="form-title">4. Barreiras & Dificuldades Prioritárias</h2>
              <Field label="Barreiras de aprendizagem e comportamentos interferentes" hint="Identifique fatores que impedem o acesso a novos ambientes ou aquisição de habilidades.">
                {(a) => <textarea id={a.id} className="ap-textarea" rows={4} value={formData.barriers} onChange={(e) => up('barriers', e.target.value)} />}
              </Field>
            </>
          )}

          {/* 5. Construtor de Objetivos */}
          {step === 4 && (
            <>
              <h2 className="form-title">5. Construtor de Objetivos Operacionalizados</h2>
              <p className="ap-small ap-muted">
                Um bom objetivo clínico deve ser observável, mensurável e com critérios de domínio explícitos.
              </p>

              {/* Templates Prontos */}
              <div>
                <span className="ap-label" style={{ fontSize: 'var(--ap-text-xs)' }}>Carregar modelo de objetivo rápido:</span>
                <div className="ap-row" style={{ gap: '0.4rem', marginTop: '0.35rem' }}>
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      className="ap-btn ap-btn--sm"
                      style={{ background: 'var(--ap-surface-sunken)', border: '1px solid var(--ap-border)' }}
                      onClick={() => applyTemplate(t)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulário do Objetivo */}
              <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                <Field label="Área de Desenvolvimento">
                  {(a) => (
                    <input
                      id={a.id}
                      className="ap-input"
                      value={newGoal.area}
                      onChange={(e) => setNewGoal({ ...newGoal, area: e.target.value })}
                      placeholder="Ex: Comunicação, Social, Motor"
                    />
                  )}
                </Field>
                <Field label="Repertório">
                  {(a) => (
                    <input
                      id={a.id}
                      className="ap-input"
                      value={newGoal.repertoire}
                      onChange={(e) => setNewGoal({ ...newGoal, repertoire: e.target.value })}
                      placeholder="Ex: Mando, Tato, Imitação, AVD"
                    />
                  )}
                </Field>
              </div>

              <Field label="Contexto / Antecedente" hint="Em qual situação a resposta deve ocorrer?">
                {(a) => (
                  <input
                    id={a.id}
                    className="ap-input"
                    value={newGoal.context}
                    onChange={(e) => setNewGoal({ ...newGoal, context: e.target.value })}
                    placeholder="Ex: diante da instrução verbal e de 3 estímulos visuais..."
                  />
                )}
              </Field>

              <Field label="Comportamento Esperado (Verbo de Ação Observável)">
                {(a) => (
                  <input
                    id={a.id}
                    className="ap-input"
                    value={newGoal.behavior}
                    onChange={(e) => setNewGoal({ ...newGoal, behavior: e.target.value })}
                    placeholder="Ex: tocará na figura solicitada em até 3 segundos..."
                  />
                )}
              </Field>

              <div className="grid-2">
                <Field label="Critério de Domínio">
                  {(a) => (
                    <input
                      id={a.id}
                      className="ap-input"
                      value={newGoal.criterion}
                      onChange={(e) => setNewGoal({ ...newGoal, criterion: e.target.value })}
                      placeholder="Ex: pelo menos 80% independente"
                    />
                  )}
                </Field>
                <Field label="Manutenção & Sessões">
                  {(a) => (
                    <input
                      id={a.id}
                      className="ap-input"
                      value={newGoal.consecutiveSessions}
                      onChange={(e) => setNewGoal({ ...newGoal, consecutiveSessions: e.target.value })}
                      placeholder="Ex: em 3 sessões consecutivas"
                    />
                  )}
                </Field>
              </div>

              {/* Prévia Operacionalizada */}
              <div
                style={{
                  padding: '1rem',
                  background: 'var(--ap-sage-50)',
                  border: '1px solid var(--ap-sage-200)',
                  borderRadius: 'var(--ap-radius-md)',
                }}
              >
                <span className="ap-eyebrow" style={{ color: 'var(--ap-sage-800)' }}>Redação Técnica do Objetivo:</span>
                <p className="ap-small" style={{ margin: '0.4rem 0 0 0', fontWeight: 600, color: 'var(--ap-sage-900)' }}>
                  "{computedGoalSentence}"
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <Button variant="primary" size="sm" icon={<IconPlus />} onClick={addGoal}>
                    Adicionar este objetivo ao plano
                  </Button>
                </div>
              </div>

              {/* Lista de Objetivos Adicionados */}
              <div>
                <span className="ap-label">Objetivos incluídos no plano ({goals.length}):</span>
                <ul className="ap-stack" style={{ listStyle: 'none', margin: '0.5rem 0 0 0', padding: 0, gap: '0.6rem' }}>
                  {goals.map((g, idx) => (
                    <li
                      key={g.id}
                      className="ap-card ap-row"
                      style={{ padding: '0.75rem 1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}
                    >
                      <div>
                        <div className="ap-row" style={{ gap: '0.4rem', marginBottom: '0.2rem' }}>
                          <span className="ap-badge">{g.area}</span>
                          <span className="ap-badge ap-badge--info">{g.repertoire}</span>
                          <strong>Meta {idx + 1}</strong>
                        </div>
                        <p className="ap-small ap-muted" style={{ margin: 0 }}>
                          Quando [{g.context}], {child?.preferredName || 'a criança'} irá [{g.behavior}] com [{g.criterion}] ({g.consecutiveSessions}).
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeGoal(g.id)}>
                        Remover
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* 6. Estratégias */}
          {step === 5 && (
            <>
              <h2 className="form-title">6. Estratégias & Adaptações Clínicas</h2>
              <Field label="Procedimentos de ensino e acomodações ambientais" hint="Hierarquia de dicas, esquema de reforço e adaptações físicas/sensoriais.">
                {(a) => <textarea id={a.id} className="ap-textarea" rows={4} value={formData.strategies} onChange={(e) => up('strategies', e.target.value)} />}
              </Field>
            </>
          )}

          {/* 7. Escola */}
          {step === 6 && (
            <>
              <h2 className="form-title">7. Articulação com a Escola</h2>
              <Field label="Orientações e adaptações curriculares para mediador escolar" hint="Apoios visuais recomendados, estratégias de mediação social e pausas programadas.">
                {(a) => <textarea id={a.id} className="ap-textarea" rows={4} value={formData.schoolGuidance} onChange={(e) => up('schoolGuidance', e.target.value)} />}
              </Field>
            </>
          )}

          {/* 8. Família */}
          {step === 7 && (
            <>
              <h2 className="form-title">8. Generalização & Orientações Familiares</h2>
              <Field label="Metas e rotinas para generalização em casa" hint="Oportunidades de prática diária e condutas recomendadas aos responsáveis.">
                {(a) => <textarea id={a.id} className="ap-textarea" rows={4} value={formData.familyGuidance} onChange={(e) => up('familyGuidance', e.target.value)} />}
              </Field>
            </>
          )}

          {/* 9. Revisão & Impressão */}
          {step === 8 && (
            <>
              <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                <h2 className="form-title" style={{ margin: 0 }}>9. Prévia do Documento Oficial</h2>
                <Button variant="primary" icon={<IconPrinter />} onClick={() => window.print()}>
                  Imprimir Documento
                </Button>
              </div>

              {/* Documento Estilizado para Impressão */}
              <div
                className="plan-document-print"
                style={{
                  background: '#fff',
                  border: '1px solid var(--ap-border)',
                  borderRadius: 'var(--ap-radius-md)',
                  padding: '2rem',
                  color: '#2b2b2b',
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '2px solid var(--ap-sage-700)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <h1 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--ap-sage-900)' }}>{PLAN_TYPE_LABELS[planType].title}</h1>
                  <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>Plataforma Aprumo · Prontuário Clínico & Educacional</p>
                </div>

                <div className="review" style={{ marginBottom: '1.5rem' }}>
                  <dt>Paciente</dt>
                  <dd><strong>{child?.fullName}</strong> ({child?.preferredName})</dd>
                  <dt>Modelo</dt>
                  <dd>{selectedCase?.model === 'ABA' ? 'Análise do Comportamento Aplicada' : 'Modelo Denver'}</dd>
                  <dt>Vigência</dt>
                  <dd>{formData.validityMonths} meses</dd>
                  <dt>Profissional</dt>
                  <dd>{formData.professionalName}</dd>
                </div>

                <h3 style={{ fontSize: '1.1rem', color: 'var(--ap-sage-800)', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.3rem' }}>1. Diagnóstico e Contexto</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{formData.diagnosisContext}</p>

                <h3 style={{ fontSize: '1.1rem', color: 'var(--ap-sage-800)', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.3rem' }}>2. Potencialidades</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{formData.strengths}</p>

                <h3 style={{ fontSize: '1.1rem', color: 'var(--ap-sage-800)', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.3rem' }}>3. Barreiras de Aprendizagem</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{formData.barriers}</p>

                <h3 style={{ fontSize: '1.1rem', color: 'var(--ap-sage-800)', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.3rem' }}>4. Objetivos Individualizados</h3>
                <ol style={{ paddingLeft: '1.2rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {goals.map((g) => (
                    <li key={g.id} style={{ marginBottom: '0.5rem' }}>
                      <strong>[{g.area} / {g.repertoire}]:</strong> Quando {g.context}, {child?.preferredName} irá {g.behavior} ({g.criterion}, {g.consecutiveSessions}).
                    </li>
                  ))}
                </ol>

                <h3 style={{ fontSize: '1.1rem', color: 'var(--ap-sage-800)', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.3rem' }}>5. Estratégias & Acomodações</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{formData.strategies}</p>

                <h3 style={{ fontSize: '1.1rem', color: 'var(--ap-sage-800)', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.3rem' }}>6. Diretrizes para a Escola</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{formData.schoolGuidance}</p>

                <h3 style={{ fontSize: '1.1rem', color: 'var(--ap-sage-800)', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.3rem' }}>7. Orientações para a Família</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{formData.familyGuidance}</p>
              </div>
            </>
          )}

          {/* Navegação entre etapas */}
          <div className="form-actions ap-row" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
            {step > 0 ? (
              <Button onClick={() => setStep((s) => s - 1)}>Etapa Anterior</Button>
            ) : (
              <Link to="/app" className="ap-btn">Voltar ao Painel</Link>
            )}

            {step < STEPS.length - 1 ? (
              <Button variant="primary" icon={<IconArrowRight />} onClick={() => setStep((s) => s + 1)}>
                Próxima Etapa
              </Button>
            ) : (
              <Button variant="primary" icon={<IconPrinter />} onClick={() => window.print()}>
                Concluir & Imprimir
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
