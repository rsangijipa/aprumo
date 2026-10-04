import { useState, type FormEvent } from 'react';
import { Button, Field, IconCheck, IconShield, Input, Select } from '@aprumo/ui';
import { INSTITUTION_CONFIG } from '../../../config/institution';
import { PublicPageLayout, Section } from '../PublicNav';

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', perfil: 'clinica', mensagem: '' });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <PublicPageLayout
      eyebrow="Contato"
      title={<>Fale com a equipe <em>ou agende uma demonstração</em></>}
      lead="Atendemos clínicas de psicologia e intervenção comportamental, redes de educação especial, equipes multidisciplinares e pesquisadores."
      ctaText="Explorar demonstração agora"
      secondaryCtaText="Conhecer o produto"
      secondaryCtaHref="/produto"
      closing={false}
    >
      <Section sunken>
        <div className="lp-contact">
          <article className="lp-card">
            <h2 className="lp-card__title-lg">Envie sua mensagem</h2>
            <p>Preencha os campos e nossa coordenação entrará em contato.</p>

            {sent ? (
              <div className="lp-success" role="status">
                <strong><IconCheck /> Mensagem registrada</strong>
                <p>
                  Obrigado pelo contato, {form.nome}. Este é um ambiente de demonstração local: nenhum dado foi enviado
                  para fora do seu navegador.
                </p>
                <Button variant="default" size="sm" onClick={() => setSent(false)}>
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="lp-form">
                <Field label="Nome ou instituição">
                  {({ id }) => (
                    <Input
                      id={id}
                      required
                      autoComplete="name"
                      placeholder="Ex.: Camila Vasconcelos ou Clínica Desenvolver"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    />
                  )}
                </Field>

                <Field label="E-mail profissional">
                  {({ id }) => (
                    <Input
                      id={id}
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="contato@suaclinica.com.br"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  )}
                </Field>

                <Field label="Perfil">
                  {({ id }) => (
                    <Select id={id} value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })}>
                      <option value="clinica">Gestão de clínica (psicologia / ABA)</option>
                      <option value="terapeuta">Terapeuta autônomo ou supervisor clínico</option>
                      <option value="escola">Escola ou equipe de AEE</option>
                      <option value="pesquisa">Pesquisa acadêmica</option>
                      <option value="familia">Familiar ou cuidador</option>
                      <option value="outro">Outro</option>
                    </Select>
                  )}
                </Field>

                <Field label="Como podemos ajudar?">
                  {({ id }) => (
                    <textarea
                      id={id}
                      className="ap-textarea"
                      required
                      rows={5}
                      placeholder="Conte sobre sua equipe, o número de casos ou suas dúvidas sobre a plataforma."
                      value={form.mensagem}
                      onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                    />
                  )}
                </Field>

                <Button type="submit" variant="primary" size="lg">
                  Enviar mensagem
                </Button>
              </form>
            )}
          </article>

          <div className="lp-contact__aside">
            <article className="lp-card">
              <h2 className="lp-card__title-sm">Dados institucionais</h2>
              <dl className="lp-dl">
                <dt>Razão social</dt>
                <dd>{INSTITUTION_CONFIG.companyName}</dd>
                <dt>CNPJ</dt>
                <dd>{INSTITUTION_CONFIG.cnpj}</dd>
                <dt>Responsável técnico</dt>
                <dd>{INSTITUTION_CONFIG.technicalLead} ({INSTITUTION_CONFIG.councilRegistration})</dd>
                <dt>Hospedagem dos dados</dt>
                <dd>{INSTITUTION_CONFIG.dataRegion}</dd>
              </dl>
            </article>

            <article className="lp-card">
              <span className="lp-card__icon" aria-hidden="true"><IconShield /></span>
              <h2 className="lp-card__title-sm">Encarregado de dados (LGPD, art. 41)</h2>
              <p>
                Para exercer seus direitos de titular — acesso, correção, portabilidade, revogação do consentimento ou
                eliminação, nos termos da lei — escreva ao encarregado de proteção de dados:
              </p>
              <a className="lp-text-link" href={`mailto:${INSTITUTION_CONFIG.dpoEmail}`}>
                {INSTITUTION_CONFIG.dpoEmail}
              </a>
            </article>
          </div>
        </div>
      </Section>
    </PublicPageLayout>
  );
}
