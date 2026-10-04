import { useState } from 'react';
import {
  Button,
  
  Field,
  
  IconCheck,
  
  IconShield,
  Input,
  Select,
} from '@aprumo/ui';
import { INSTITUTION_CONFIG } from '../../../config/institution';
import { PublicPageLayout } from '../PublicNav';

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    perfil: 'clinica',
    mensagem: '',
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <PublicPageLayout
      eyebrow="Canais de Contato Institucional"
      title={
        <>
          Fale com nossa equipe técnica <em>ou agende uma demonstração</em>
        </>
      }
      lead="Atendemos clínicas de psicologia e intervenção comportamental, redes escolares de educação especial, equipes multidisciplinares e pesquisadores acadêmicos."
      ctaText="Acessar demonstração online agora"
      ctaHref="/entrar"
      secondaryCtaText="Conhecer o produto"
      secondaryCtaHref="/produto"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
            {/* Formulário de Contato */}
            <div className="ap-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: 'var(--ap-text-2xl)', margin: '0 0 0.5rem' }}>Envie sua mensagem</h2>
              <p className="ap-small ap-muted" style={{ marginBottom: '1.5rem' }}>
                Preencha os campos abaixo para que nossa coordenação entre em contato.
              </p>

              {sent ? (
                <div className="ap-stack" style={{ gap: '1rem', padding: '1.5rem', background: 'var(--ap-success-soft)', borderRadius: 'var(--ap-radius-md)', color: 'var(--ap-success)' }}>
                  <div className="ap-row" style={{ gap: '0.5rem' }}>
                    <IconCheck style={{ width: 22, height: 22 }} />
                    <strong style={{ fontSize: 'var(--ap-text-md)' }}>Mensagem enviada com sucesso!</strong>
                  </div>
                  <p className="ap-small" style={{ margin: 0, color: 'var(--ap-text)' }}>
                    Agradecemos o contato, {form.nome}. Em ambiente de demonstração local, os dados não foram enviados externamente.
                  </p>
                  <Button variant="default" size="sm" onClick={() => setSent(false)}>
                    Enviar outra mensagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="ap-stack" style={{ gap: '1.25rem' }}>
                  <Field label="Nome completo ou da instituição">
                    {({ id }) => (
                      <Input
                        id={id}
                        required
                        placeholder="Ex.: Dra. Camila Vasconcelos ou Clínica Desenvolver"
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      />
                    )}
                  </Field>

                  <Field label="E-mail profissional para resposta">
                    {({ id }) => (
                      <Input
                        id={id}
                        type="email"
                        required
                        placeholder="contato@suaclinica.com.br"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    )}
                  </Field>

                  <Field label="Seu perfil principal">
                    {({ id }) => (
                      <Select
                        id={id}
                        value={form.perfil}
                        onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                      >
                        <option value="clinica">Gestor de Clínica de Psicologia / ABA</option>
                        <option value="terapeuta">Terapeuta Autônomo / Supervisor Clínico</option>
                        <option value="escola">Instituição Escolar / Equipe de AEE</option>
                        <option value="pesquisa">Pesquisador Universitário / Acadêmico</option>
                        <option value="familia">Familiar ou Cuidador</option>
                        <option value="outro">Outro perfil profissional</option>
                      </Select>
                    )}
                  </Field>

                  <Field label="Como podemos ajudar?">
                    {({ id }) => (
                      <textarea
                        id={id}
                        className="ap-textarea"
                        required
                        rows={4}
                        placeholder="Conte um pouco sobre sua equipe, número de casos atendidos ou dúvidas específicas sobre a plataforma…"
                        value={form.mensagem}
                        onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                      />
                    )}
                  </Field>

                  <Button type="submit" variant="primary" size="lg" style={{ marginTop: '0.5rem' }}>
                    Enviar Mensagem Institucional
                  </Button>
                </form>
              )}
            </div>

            {/* Informações Oficiais e DPO */}
            <div className="ap-stack" style={{ gap: '1.5rem' }}>
              <div className="ap-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: 'var(--ap-text-lg)', margin: '0 0 1rem' }}>Dados Institucionais Oficiais</h3>
                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.6rem 1rem', fontSize: 'var(--ap-text-sm)', margin: 0 }}>
                  <dt style={{ fontWeight: 700, color: 'var(--ap-text-muted)' }}>Razão Social:</dt>
                  <dd style={{ margin: 0 }}>{INSTITUTION_CONFIG.companyName}</dd>

                  <dt style={{ fontWeight: 700, color: 'var(--ap-text-muted)' }}>CNPJ:</dt>
                  <dd style={{ margin: 0 }}>{INSTITUTION_CONFIG.cnpj}</dd>

                  <dt style={{ fontWeight: 700, color: 'var(--ap-text-muted)' }}>Responsável Técnica:</dt>
                  <dd style={{ margin: 0 }}>{INSTITUTION_CONFIG.technicalLead} ({INSTITUTION_CONFIG.councilRegistration})</dd>

                  <dt style={{ fontWeight: 700, color: 'var(--ap-text-muted)' }}>Hospedagem Sanitária:</dt>
                  <dd style={{ margin: 0 }}>{INSTITUTION_CONFIG.dataRegion}</dd>
                </dl>
              </div>

              <div className="ap-card" style={{ padding: '1.75rem' }}>
                <div className="ap-row" style={{ gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <IconShield style={{ width: 22, height: 22, color: 'var(--ap-sage-700)' }} />
                  <h3 style={{ fontSize: 'var(--ap-text-lg)', margin: 0 }}>Canal do DPO (LGPD art. 41)</h3>
                </div>
                <p className="ap-small ap-muted" style={{ lineHeight: 1.6, margin: 0 }}>
                  Para exercer seus direitos de titular de dados pessoais (acesso, correção, portabilidade, revogação de consentimento ou eliminação nos termos da lei), envie e-mail diretamente ao Encarregado de Proteção de Dados:
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <a href={`mailto:${INSTITUTION_CONFIG.dpoEmail}`} style={{ fontWeight: 700, color: 'var(--ap-primary)', textDecoration: 'underline' }}>
                    {INSTITUTION_CONFIG.dpoEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
