import {
  Card,
  
  
  
  
  
  
  
  
} from '@aprumo/ui';
import { PublicPageLayout } from '../PublicNav';

export default function CriancasPage() {
  return (
    <PublicPageLayout
      eyebrow="Ambiente Infantil Protegido"
      title={
        <>
          Um espaço lúdico, <em>sensorialmente calmo e seguro</em>
        </>
      }
      lead="Diferente de aplicativos comuns de jogos, o Aprumo é projetado sob diretrizes médicas e comportamentais: sem anúncios, sem compras, sem luzes estroboscópicas e com tempo de tela controlado pela Sociedade Brasileira de Pediatria."
      ctaText="Conhecer jogos para crianças"
      ctaHref="/games"
      secondaryCtaText="Como funciona a acomodação sensorial"
      secondaryCtaHref="/recursos-terapeuticos"
    >
      <section className="lp-section lp-section--sunken">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="ap-eyebrow">Proteção Ética e Pediátrica</span>
            <h2 className="lp-h2 ap-display">Por que o ambiente infantil do Aprumo é diferente</h2>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <Card title="Zero Fricção Predatória">
              <p className="ap-small ap-muted">
                Sem moedas virtuais para comprar itens, sem caixas misteriosas de sorteio (loot boxes), sem notificações para puxar a atenção da criança e sem anúncios comerciais.
              </p>
            </Card>

            <Card title="Acomodação Sensorial Cuidadosa">
              <p className="ap-small ap-muted">
                Zero flashes piscantes (prevenção contra sobrecarga e crises sensoriais), sons em tons calmos sintetizados por triângulos e ondas senoidais e transições suaves.
              </p>
            </Card>

            <Card title="Controle Rígido de Tempo de Tela">
              <p className="ap-small ap-muted">
                Seguindo as diretrizes da Sociedade Brasileira de Pediatria (SBP, 2024), crianças menores de 2 anos não acessam a tela autonomamente e maiores têm limite diário monitorado.
              </p>
            </Card>

            <Card title="Estética Soft Clay e Formas Confortáveis">
              <p className="ap-small ap-muted">
                Ilustrações que remetem a massa de modelar, brinquedos táteis e formas arredondadas que incentivam a exploração curiosa e tranquila.
              </p>
            </Card>

            <Card title="Reforçamento Saudável">
              <p className="ap-small ap-muted">
                A criança ganha estrelinhas de esforço e figurinhas que ela mesma escolhe para colar no seu álbum digital, valorizando a tentativa e o progresso individual.
              </p>
            </Card>

            <Card title="Saída Protegida por Adulto">
              <p className="ap-small ap-muted">
                O modo infantil só é encerrado mediante gesto prolongado de 1.2 segundos acompanhado de confirmação com PIN do adulto, garantindo ambiente estável durante o atendimento.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
