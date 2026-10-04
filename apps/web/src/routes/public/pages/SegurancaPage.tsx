import {
  Card,
  
  
  
  IconHeart,
  IconLock,
  IconShield,
  
} from '@aprumo/ui';
import { INSTITUTION_CONFIG } from '../../../config/institution';
import { PublicPageLayout } from '../PublicNav';

export default function SegurancaPage() {
  return (
    <PublicPageLayout
      eyebrow="Segurança, Ética & Privacidade"
      title={
        <>
          Dados de saúde de crianças exigem o <em>máximo cuidado e respeito à lei</em>
        </>
      }
      lead="Construído desde o primeiro dia para conformidade integral com a LGPD (arts. 11 e 14), o ECA Digital e as normas dos conselhos profissionais de Psicologia (CFP) e Medicina (CFM)."
      ctaText="Acessar ambiente seguro"
      ctaHref="/entrar"
      secondaryCtaText="Falar com o DPO"
      secondaryCtaHref={`mailto:${INSTITUTION_CONFIG.dpoEmail}`}
    >
      <section className="lp-section lp-section--sunken" id="seguranca">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Pilares de Proteção</span>
            <h2 className="lp-h2 ap-display">Como protegemos os registros dos seus pacientes</h2>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <Card title="Prontuário Eletrônico Imutável">
              <p className="ap-small ap-muted">
                Em conformidade com a Resolução CFP 01/2009 e CFM 1.821/2007, nenhum registro clínico pode ser deletado ou alterado silenciosamente. Retificações geram adendos formais assinados com data, hora, autor e motivo da retificação.
              </p>
            </Card>

            <Card title="Guarda Obrigatória de 20 Anos">
              <p className="ap-small ap-muted">
                O banco de dados possui bloqueio automático no nível de banco de dados (triggers e RLS) que impede a exclusão acidental de prontuários de menores de idade, assegurando o cumprimento do prazo legal de guarda de 20 anos.
              </p>
            </Card>

            <Card title="Acesso Estrito por Vínculo com o Caso">
              <p className="ap-small ap-muted">
                Profissionais de uma clínica só conseguem visualizar os pacientes para os quais foram explicitamente designados. Administradores gerais da clínica não têm acesso a notas clínicas e conteúdos sensíveis de psicoterapia por padrão.
              </p>
            </Card>

            <Card title="Auditoria Completa de Leitura e Escrita">
              <p className="ap-small ap-muted">
                Saber quem consultou um prontuário é tão importante quanto saber quem fez anotações. Cada abertura de caso gera um evento auditável imutável (`audit_read`), prevenindo acessos indevidos por curiosidade.
              </p>
            </Card>

            <Card title="Hospedagem em Território Nacional">
              <p className="ap-small ap-muted">
                Os dados de saúde e prontuários são hospedados exclusivamente em data centers localizados no Brasil ({INSTITUTION_CONFIG.dataRegion}), garantindo conformidade com a soberania de dados prevista na legislação sanitária e na LGPD.
              </p>
            </Card>

            <Card title="Pseudonimização no Ambiente de Jogos">
              <p className="ap-small ap-muted">
                Jogos e ferramentas interativas infantis nunca recebem o nome completo, CPF ou diagnóstico da criança. Apenas o apelido de preferência e um identificador opaco temporário são trafegados no runtime.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="lp-section" id="eca">
        <div className="lp-wrap">
          <div className="lp-head lp-head--center">
            <span className="ap-eyebrow">ECA Digital & Ética na Infância</span>
            <h2 className="lp-h2 ap-display">Compromissos inegociáveis de design com a infância</h2>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <div className="ap-stack" style={{ gap: '0.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ap-sage-50)', color: 'var(--ap-sage-700)', display: 'grid', placeItems: 'center' }}>
                <IconShield />
              </div>
              <strong style={{ fontSize: 'var(--ap-text-lg)' }}>Zero Mecânicas Predatórias</strong>
              <p className="ap-small ap-muted">Sem rankings entre crianças, sem caixas misteriosas de sorteio (loot boxes), sem notificações para a criança e sem compras no aplicativo.</p>
            </div>

            <div className="ap-stack" style={{ gap: '0.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ap-sage-50)', color: 'var(--ap-sage-700)', display: 'grid', placeItems: 'center' }}>
                <IconHeart />
              </div>
              <strong style={{ fontSize: 'var(--ap-text-lg)' }}>Zero Triagem Pública Aberta</strong>
              <p className="ap-small ap-muted">O Aprumo não fornece testes abertos na internet que gerem escores diagnósticos sobre crianças fora de um vínculo ético profissional formal e consentido.</p>
            </div>

            <div className="ap-stack" style={{ gap: '0.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ap-sage-50)', color: 'var(--ap-sage-700)', display: 'grid', placeItems: 'center' }}>
                <IconLock />
              </div>
              <strong style={{ fontSize: 'var(--ap-text-lg)' }}>Canal do DPO Aberto</strong>
              <p className="ap-small ap-muted">
                Encarregado de Proteção de Dados (DPO) identificado com e-mail direto (<a href={`mailto:${INSTITUTION_CONFIG.dpoEmail}`}>{INSTITUTION_CONFIG.dpoEmail}</a>) para solicitações de titulares conforme art. 41 da LGPD.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="lp-section lp-section--sunken" id="termos">
        <div className="lp-wrap" style={{ maxWidth: 760 }}>
          <div className="lp-head">
            <span className="ap-eyebrow">Termos de uso & privacidade</span>
            <h2 className="lp-h2 ap-display">Regras claras, em linguagem simples</h2>
          </div>
          <ul className="ap-stack" style={{ gap: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>Os dados clínicos pertencem ao paciente e ao responsável técnico; o Aprumo atua como operador (art. 5º, VII da LGPD).</li>
            <li>Dados de crianças só são tratados com consentimento específico e destacado de ao menos um responsável legal (art. 14 da LGPD).</li>
            <li>Registros de prontuário são imutáveis: correções geram adendos datados, nunca apagam o original (Res. CFP 06/2019).</li>
            <li>Nenhum jogo recebe nome completo, documentos, câmera, microfone ou diagnóstico — apenas apelido e parâmetros de adaptação.</li>
            <li>Você pode solicitar acesso, correção, portabilidade ou eliminação dos dados pelo canal do DPO acima.</li>
          </ul>
        </div>
      </section>
    </PublicPageLayout>
  );
}
