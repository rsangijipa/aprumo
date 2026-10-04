/**
 * Novo caso em 7 etapas progressivas (Stepper ergonômico).
 * 1. Identificação | 2. Responsáveis | 3. Modelo | 4. Perfil | 5. Sensorial | 6. Consentimentos | 7. Revisão
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ageInMonths } from '@aprumo/clinical-core';
import {
  Button,
  Card,
  Field,
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  ModelBadge,
  Segmented,
} from '@aprumo/ui';
import { CURRENT_USER_ID } from '../../data/seed';
import { actions, useStore } from '../../data/store';
import './forms.css';

const STEPS = [
  'Identificação',
  'Responsáveis',
  'Modelo',
  'Perfil',
  'Sensorial',
  'Consentimentos',
  'Revisão',
] as const;

export default function NewCase() {
  const nav = useNavigate();
  const professionals = useStore((s) => s.professionals);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [f, setF] = useState({
    fullName: '',
    preferredName: '',
    birthDate: '',
    interests: '',
    restrictions: '',
    strengths: '',
    guardianName: '',
    guardianRelationship: 'mãe',
    guardianContact: '',
    consents: { service: false, childPortal: false, media: false, school: false, research: false },
    model: '' as '' | 'ABA' | 'DENVER',
    implementerIds: [] as string[],
    sensorySound: 'normal' as 'off' | 'low' | 'normal',
    sensoryMotion: 'reduced' as 'static' | 'reduced' | 'full',
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
      if (f.guardianName.trim().length < 3) return 'Informe o nome do responsável legal.';
    }
    if (i === 2) {
      if (!f.model) return 'Escolha o modelo de intervenção do caso (ABA ou Denver).';
    }
    if (i === 5) {
      if (!f.consents.service) return 'O consentimento de prontuário e atendimento clínico é obrigatório para abertura do caso.';
    }
    return null;
  };

  const next = () => {
    const e = validate(step);
    setError(e);
    if (!e) setStep((s) => s + 1);
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const create = () => {
    try {
      const id = actions.createCase({
        fullName: f.fullName,
        preferredName: f.preferredName,
        birthDate: f.birthDate,
        model: f.model as 'ABA' | 'DENVER',
        guardianName: f.guardianName,
        guardianRelationship: f.guardianRelationship,
        consents: {
          childPortal: f.consents.childPortal,
          media: f.consents.media,
          school: f.consents.school,
          research: f.consents.research,
        },
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
    <div className="pro-page pro-page--narrow">
      <header className="page-head">
        <div>
          <Link to="/app/casos" className="pro-back-link">
            <IconChevronLeft aria-hidden="true" /> Voltar para Casos
          </Link>
          <h1>Novo caso clínico</h1>
          <p>Cadastro de prontuário individualizado com fluxo guiado de 7 etapas.</p>
        </div>
      </header>

      {/* Stepper em 7 etapas */}
      <ol className="wizard-steps wizard-steps--fluid" aria-label="Etapas de abertura de caso">
        {STEPS.map((label, i) => (
          <li
            key={label}
            data-state={i < step ? 'done' : i === step ? 'current' : 'next'}
            aria-current={i === step ? 'step' : undefined}
          >
            <span>{i < step ? <IconCheck /> : i + 1}</span>
            <em>{label}</em>
          </li>
        ))}
      </ol>

      <Card>
        <div className="ap-stack" style={{ gap: '1.2rem' }}>
          {/* Etapa 1: Identificação */}
          {step === 0 && (
            <>
              <h2 className="form-title">1. Identificação da Criança</h2>
              <Field label="Nome completo" hint="Usado estritamente no prontuário e relatórios oficiais (Res. CFP 06/2019).">
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={f.fullName} onChange={(e) => up('fullName', e.target.value)} autoComplete="off" placeholder="Ex: Lucas Gabriel da Silva" />}
              </Field>
              <Field label="Como gosta de ser chamada (Nome de Preferência)" hint="Nome exibido nas telas de aplicação e no ambiente infantil.">
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={f.preferredName} onChange={(e) => up('preferredName', e.target.value)} maxLength={40} autoComplete="off" placeholder="Ex: Luquinhas" />}
              </Field>
              <Field label="Data de nascimento" hint={months != null && months >= 0 ? `${months < 24 ? `${months} meses: sem ambiente infantil de tela (diretriz SBP)` : `${Math.floor(months / 12)} anos e ${months % 12} meses`}` : undefined}>
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" type="date" value={f.birthDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => up('birthDate', e.target.value)} />}
              </Field>
            </>
          )}

          {/* Etapa 2: Responsáveis */}
          {step === 1 && (
            <>
              <h2 className="form-title">2. Responsável Legal</h2>
              <Field label="Nome do responsável principal" hint="Pessoa que assina os termos e recebe os resumos periódicos.">
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={f.guardianName} onChange={(e) => up('guardianName', e.target.value)} autoComplete="off" placeholder="Ex: Mariana da Silva" />}
              </Field>
              <Field label="Grau de parentesco">
                {(a) => (
                  <select id={a.id} className="ap-select" value={f.guardianRelationship} onChange={(e) => up('guardianRelationship', e.target.value)}>
                    <option value="mãe">Mãe</option>
                    <option value="pai">Pai</option>
                    <option value="avó/avô">Avó / Avô</option>
                    <option value="tutor">Tutor(a) legal</option>
                    <option value="outro">Outro familiar</option>
                  </select>
                )}
              </Field>
              <Field label="Telefone / Contato" hint="Para envio de notificações e acesso ao portal familiar.">
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" type="tel" value={f.guardianContact} onChange={(e) => up('guardianContact', e.target.value)} placeholder="(11) 99999-0000" />}
              </Field>
            </>
          )}

          {/* Etapa 3: Modelo de Intervenção */}
          {step === 2 && (
            <>
              <h2 className="form-title">3. Modelo de Intervenção</h2>
              <p className="ap-small ap-muted">
                O modelo organiza toda a estrutura de objetivos e sessões. Cada caso segue estritamente um modelo por plano vigente.
              </p>
              <div className="grid-2">
                <button
                  type="button"
                  className="model-pick"
                  data-selected={f.model === 'ABA'}
                  onClick={() => up('model', 'ABA')}
                >
                  <ModelBadge model="ABA" />
                  <strong>Análise do Comportamento Aplicada (ABA)</strong>
                  <p className="ap-small ap-muted">
                    Objetivos organizados por repertórios comportamentais (mando, tato, ouvinte, ecoico), programas estruturados (DTT, NET, encadeamento) e alvos com análise de tentativas e critérios de domínio quantificados.
                  </p>
                </button>
                <button
                  type="button"
                  className="model-pick"
                  data-selected={f.model === 'DENVER'}
                  onClick={() => up('model', 'DENVER')}
                >
                  <ModelBadge model="DENVER" />
                  <strong>Modelo Denver de Intervenção Precoce (ESDM)</strong>
                  <p className="ap-small ap-muted">
                    Ciclos trimestrais por níveis de desenvolvimento (1 a 4), domínios funcionais interligados, rotinas de atividade conjunta em jogo social e passos de aprendizagem avaliados pelo sistema P/A/N.
                  </p>
                </button>
              </div>

              <div className="ap-field" style={{ marginTop: '0.75rem' }}>
                <span className="ap-label">Aplicadores com acesso ao caso</span>
                <span className="ap-hint">Você é a responsável técnica. Selecione os aplicadores vinculados:</span>
                <div className="checkbox-list">
                  {professionals.filter((p) => p.id !== CURRENT_USER_ID).map((p) => (
                    <label key={p.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={f.implementerIds.includes(p.id)}
                        onChange={(e) => {
                          const ids = e.target.checked
                            ? [...f.implementerIds, p.id]
                            : f.implementerIds.filter((x) => x !== p.id);
                          up('implementerIds', ids);
                        }}
                      />
                      <span><strong>{p.name}</strong> <small className="ap-muted">({p.role})</small></span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Etapa 4: Perfil & Potencialidades */}
          {step === 3 && (
            <>
              <h2 className="form-title">4. Perfil & Potencialidades</h2>
              <Field label="Interesses e motivações" hint="Itens, temas e brincadeiras que funcionam como reforçadores naturais (separados por vírgula).">
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={f.interests} onChange={(e) => up('interests', e.target.value)} placeholder="Ex: dinossauros, bolhas de sabão, músicas do Bita, carros" />}
              </Field>
              <Field label="Pontos fortes e potencialidades" hint="Habilidades já estabelecidas para alavancar novas aprendizagens.">
                {(a) => <textarea id={a.id} aria-describedby={a.describedBy} className="ap-textarea" value={f.strengths} onChange={(e) => up('strengths', e.target.value)} placeholder="Ex: excelente memória visual, interesse espontâneo por livros ilustrados..." />}
              </Field>
            </>
          )}

          {/* Etapa 5: Perfil Sensorial */}
          {step === 4 && (
            <>
              <h2 className="form-title">5. Perfil Sensorial e Acomodações</h2>
              <p className="ap-small ap-muted">Configurações para garantir um ambiente sensorialmente seguro nas atividades digitais.</p>
              
              <div className="ap-field">
                <span className="ap-label">Estímulo Sonoro Padrão</span>
                <Segmented
                  label="Som"
                  value={f.sensorySound}
                  onChange={(v) => up('sensorySound', v)}
                  options={[
                    { value: 'off', label: 'Silencioso' },
                    { value: 'low', label: 'Baixo' },
                    { value: 'normal', label: 'Normal' },
                  ]}
                />
              </div>

              <div className="ap-field">
                <span className="ap-label">Movimento e Animações</span>
                <Segmented
                  label="Movimento"
                  value={f.sensoryMotion}
                  onChange={(v) => up('sensoryMotion', v)}
                  options={[
                    { value: 'static', label: 'Estático' },
                    { value: 'reduced', label: 'Reduzido (calmo)' },
                    { value: 'full', label: 'Completo' },
                  ]}
                />
              </div>

              <Field label="Restrições alimentares ou aversões sensoriais" hint="Alergias, aversões a texturas ou sons específicos.">
                {(a) => <input id={a.id} aria-describedby={a.describedBy} className="ap-input" value={f.restrictions} onChange={(e) => up('restrictions', e.target.value)} placeholder="Ex: intolerância a lactose; aversão a bexigas e sons agudos" />}
              </Field>
            </>
          )}

          {/* Etapa 6: Consentimentos */}
          {step === 5 && (
            <>
              <h2 className="form-title">6. Termos e Consentimentos</h2>
              <p className="ap-small ap-muted">
                Conforme a LGPD (Lei 13.709/2018) e o ECA Digital, cada finalidade requer consentimento específico e transparente.
              </p>
              
              <div className="ap-stack" style={{ gap: '0.85rem' }}>
                <label className="checkbox-item" style={{ border: '2px solid var(--ap-primary)', padding: '0.85rem', borderRadius: 'var(--ap-radius-md)' }}>
                  <input
                    type="checkbox"
                    checked={f.consents.service}
                    onChange={(e) => up('consents', { ...f.consents, service: e.target.checked })}
                  />
                  <span>
                    <strong>Consentimento para Registro em Prontuário Clínico (Obrigatório)</strong>
                    <small className="ap-muted" style={{ display: 'block' }}>
                      Autorizo o armazenamento criptografado dos dados de atendimento e evolução clínica.
                    </small>
                  </span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={f.consents.childPortal}
                    onChange={(e) => up('consents', { ...f.consents, childPortal: e.target.checked })}
                  />
                  <span>
                    <strong>Acesso ao Ambiente da Criança no Tablet</strong>
                    <small className="ap-muted" style={{ display: 'block' }}>Uso de jogos terapêuticos e fichas durante as sessões supervisionadas.</small>
                  </span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={f.consents.school}
                    onChange={(e) => up('consents', { ...f.consents, school: e.target.checked })}
                  />
                  <span>
                    <strong>Compartilhamento com Equipe Escolar</strong>
                    <small className="ap-muted" style={{ display: 'block' }}>Envio de relatórios de mediação e estratégias de apoio para a escola.</small>
                  </span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={f.consents.media}
                    onChange={(e) => up('consents', { ...f.consents, media: e.target.checked })}
                  />
                  <span>
                    <strong>Registros em Áudio/Vídeo para Supervisão</strong>
                    <small className="ap-muted" style={{ display: 'block' }}>Uso exclusivo interno para análise de fidelidade procedural da equipe.</small>
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Etapa 7: Revisão */}
          {step === 6 && (
            <>
              <h2 className="form-title">7. Revisão dos Dados</h2>
              <dl className="review">
                <dt>Criança</dt>
                <dd><strong>{f.preferredName}</strong> ({f.fullName})</dd>
                
                <dt>Idade</dt>
                <dd>{months != null ? `${Math.floor(months / 12)} anos e ${months % 12} meses` : '—'}</dd>
                
                <dt>Responsável</dt>
                <dd>{f.guardianName} ({f.guardianRelationship}) {f.guardianContact && `· ${f.guardianContact}`}</dd>
                
                <dt>Modelo de Intervenção</dt>
                <dd><ModelBadge model={f.model as 'ABA' | 'DENVER'} /></dd>
                
                <dt>Interesses</dt>
                <dd>{f.interests || 'Nenhum informado'}</dd>
                
                <dt>Restrições / Cuidados</dt>
                <dd>{f.restrictions || 'Nenhuma restrição registrada'}</dd>
                
                <dt>Acomodação Sensorial</dt>
                <dd>Som: {f.sensorySound} · Movimento: {f.sensoryMotion}</dd>
                
                <dt>Responsável Técnica</dt>
                <dd>Dra. Carolina Mendonça (CRP 06/123456)</dd>
              </dl>
            </>
          )}

          {error && <p role="alert" className="form-error">{error}</p>}

          <div className="form-actions form-actions--split form-actions--sticky">
            {step > 0 ? (
              <Button onClick={back}>Voltar</Button>
            ) : (
              <Link to="/app/casos" className="ap-btn">Cancelar</Link>
            )}

            {step < STEPS.length - 1 ? (
              <Button variant="primary" icon={<IconArrowRight />} onClick={next}>
                Próximo passo
              </Button>
            ) : (
              <Button variant="primary" icon={<IconCheck />} onClick={create}>
                Confirmar e abrir caso
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
