import { IconHeart, IconLock, IconShield } from '@aprumo/ui';
import { INSTITUTION_CONFIG } from '../../../config/institution';
import { FeatureCard, PublicPageLayout, Section } from '../PublicNav';

const dpoHref = `mailto:${INSTITUTION_CONFIG.dpoEmail}`;

export default function SegurancaPage() {
  return (
    <PublicPageLayout
      eyebrow="Segurança e privacidade"
      title={<>Dados de saúde de crianças pedem <em>cuidado redobrado</em></>}
      lead="Projetado desde o início para a LGPD (arts. 11 e 14), o ECA Digital e as normas dos conselhos profissionais de Psicologia (CFP) e Medicina (CFM)."
      ctaText="Acessar a demonstração"
      secondaryCtaText="Falar com o encarregado (DPO)"
      secondaryCtaHref={dpoHref}
      closing={{
        title: 'Dúvidas sobre dados e privacidade?',
        text: 'O encarregado de proteção de dados responde a solicitações de titulares e de instituições parceiras.',
        primary: { label: 'Escrever ao DPO', href: dpoHref },
        secondary: { label: 'Outros contatos', href: '/contato' },
      }}
    >
      <Section sunken id="seguranca" eyebrow="Pilares de proteção" title="Como os registros dos pacientes são protegidos">
        <div className="lp-grid">
          <FeatureCard title="Prontuário imutável">
            Conforme as Resoluções CFP 01/2009 e CFM 1.821/2007, nenhum registro clínico é apagado ou alterado em
            silêncio. Retificações geram adendos com data, hora, autor e motivo.
          </FeatureCard>
          <FeatureCard title="Guarda por 20 anos">
            Bloqueios no próprio banco de dados (triggers e RLS) impedem a exclusão acidental de prontuários de
            menores, garantindo o prazo legal de guarda.
          </FeatureCard>
          <FeatureCard title="Acesso por vínculo com o caso">
            Cada profissional vê apenas os pacientes aos quais foi designado. Por padrão, administradores da clínica
            não acessam notas clínicas sensíveis.
          </FeatureCard>
          <FeatureCard title="Auditoria de leitura e escrita">
            Saber quem consultou um prontuário importa tanto quanto saber quem escreveu nele. Cada abertura de caso
            gera um evento de auditoria imutável.
          </FeatureCard>
          <FeatureCard title="Hospedagem no Brasil">
            Dados de saúde e prontuários ficam em data centers no Brasil ({INSTITUTION_CONFIG.dataRegion}), conforme a
            legislação sanitária e a LGPD.
          </FeatureCard>
          <FeatureCard title="Pseudonimização nos jogos">
            Jogos e ferramentas infantis nunca recebem nome completo, CPF ou diagnóstico. Trafegam apenas o apelido e
            um identificador opaco temporário.
          </FeatureCard>
        </div>
      </Section>

      <Section id="eca" eyebrow="ECA Digital e ética na infância" title="Compromissos de design com a infância">
        <div className="lp-grid">
          <FeatureCard icon={<IconShield />} title="Sem mecânicas predatórias">
            Sem rankings entre crianças, sem caixas de sorteio (loot boxes), sem notificações para a criança e sem
            compras no aplicativo.
          </FeatureCard>
          <FeatureCard icon={<IconHeart />} title="Sem triagem pública">
            O Aprumo não oferece testes abertos na internet que gerem escores sobre crianças fora de um vínculo
            profissional formal e consentido.
          </FeatureCard>
          <FeatureCard icon={<IconLock />} title="Encarregado identificado">
            O encarregado de proteção de dados atende solicitações de titulares pelo e-mail{' '}
            <a className="lp-text-link" href={dpoHref}>{INSTITUTION_CONFIG.dpoEmail}</a> (LGPD, art. 41).
          </FeatureCard>
        </div>
      </Section>

      <Section sunken id="termos" eyebrow="Termos de uso e privacidade" title="Regras claras, em linguagem simples">
        <ul className="lp-list">
          <li>Os dados clínicos pertencem ao paciente e ao responsável técnico; o Aprumo atua como operador (LGPD, art. 5º, VII).</li>
          <li>Dados de crianças só são tratados com consentimento específico e destacado de ao menos um responsável legal (LGPD, art. 14).</li>
          <li>Registros de prontuário são imutáveis: correções geram adendos datados e nunca apagam o original (Res. CFP 06/2019).</li>
          <li>Nenhum jogo recebe nome completo, documentos, câmera, microfone ou diagnóstico — apenas apelido e parâmetros de adaptação.</li>
          <li>Você pode solicitar acesso, correção, portabilidade ou eliminação dos dados pelo canal do encarregado.</li>
        </ul>
      </Section>
    </PublicPageLayout>
  );
}
