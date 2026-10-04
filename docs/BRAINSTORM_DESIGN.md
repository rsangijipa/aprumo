# Aprumo — Brainstorm, recursos indispensáveis e direção de design

Complementa o [PLANO_IMPLEMENTACAO_APRUMO.md](../PLANO_IMPLEMENTACAO_APRUMO.md). Pesquisa feita em 04/10/2026.

## 1. O que é indispensável no primeiro momento

Fontes: comparativos de mercado (CentralReach, Motivity, Rethink, Catalyst), plataformas brasileiras (BAVI, TABA, ABA+, ABATech), pesquisa de UX para crianças autistas em tablet e as duas especificações.

| # | Recurso | Por que é indispensável | Onde entra |
|---|---|---|---|
| 1 | Coleta offline em tablet ou celular, com sincronização | Os aplicadores atendem na clínica, em casa e na escola, muitas vezes sem sinal. Todo concorrente sério tem isso. | Outbox cifrada (`packages/offline`) |
| 2 | Registro em até 2 toques: resposta + nível de dica | É o motivo nº 1 de abandono: se registrar for mais lento que o papel, a equipe volta ao papel | Tela de aplicação ABA |
| 3 | Todos os tipos de medida: tentativa, oportunidade (NET), análise de tarefa, frequência, duração, intervalo, ABC | São programas diferentes, não só DTT | Registro de sessão e de comportamento |
| 4 | Gráfico por alvo com linhas de fase, independente vs. com dica | É onde o supervisor decide | Aba "Dados" do caso |
| 5 | Alertas de decisão (domínio atingido, estagnação, dependência de dica) | É o que torna a plataforma "inteligente" sem IA generativa | `clinical-core` (R1–R15) |
| 6 | Plano individual com alvos, fases, hierarquia de dicas e critério | Sem ele, os dados de jogo não têm significado clínico | Aba "Plano" |
| 7 | Prontuário com evolução automática e nota obrigatória | Res. CFP 01/2009 | Encerramento de sessão |
| 8 | Ambiente da criança aberto pelo adulto, sem catálogo livre | Segurança, previsibilidade, ECA Digital | Portal infantil |
| 9 | Agenda visual + quadro de fichas | Prevenção de comportamento-problema; uso em quase toda sessão | Recursos de apoio |
| 10 | Portal da família e documentos | Concorrentes vendem como central; fica para a fase seguinte | S6 |

Itens que o mercado oferece e que ficam **fora agora** (decisão do usuário): agenda de atendimentos, faturamento e convênios. A IA generativa entra depois; as regras clínicas entram agora.

## 2. Princípios de UX

### Página principal
Precisa parecer uma plataforma clínica séria, não um app infantil:
- tipografia editorial nos títulos;
- muito espaço em branco e paleta sálvia contida;
- um gráfico de alvo real como prova visual, em vez de ilustrações de crianças;
- linguagem técnica, mas clara.

Não entra: triagem, depoimentos inventados, números de mercado sem fonte, nem ranking.

### Painel do profissional
- **Um caso por vez.** Ao abrir um caso, o contexto se mantém até a troca de criança.
- **Pergunta respondida na abertura:** "o que precisa de mim hoje?" (alertas, sessões pendentes, planos para revisar).
- **Ações clínicas persistentes:** iniciar sessão, registrar dado.
- **Selo de modelo sempre visível:** ABA ou Denver, com rótulo, nunca só cor.
- **Sem métricas que misturam alvos:** nada de "desempenho geral".

### Ambiente da criança (tablet primeiro)
Fundamentado na pesquisa de UX para crianças autistas:
- alvos de toque a partir de 64 px, com 24 px de espaço entre eles;
- no máximo 3 a 4 opções por tela;
- posição previsível;
- paleta calma por padrão (o estímulo é acrescentado quando ajuda);
- `prefers-reduced-motion` e modo estático;
- nenhum flash;
- feedback de acerto configurável (nenhum, discreto ou festivo);
- sem texto obrigatório;
- orientação paisagem prioritária;
- tela cheia;
- canto protegido com toque longo para os controles do adulto.

## 3. Arquitetura de identidade: plataforma × recurso

- **A plataforma tem um design system** (`packages/ui`) com a paleta sálvia.
- **Cada jogo ou recurso tem seu próprio mundo visual:** paleta, tipografia de destaque, tokens com prefixo próprio, animações, ilustrações e lógica. Ele não herda tokens da plataforma, apenas o perfil sensorial (movimento, som, contraste, máximo de opções).
- **Os estímulos clínicos são compartilhados** (`packages/stimuli`: a "bola" é a mesma figura em qualquer jogo e na mesa). Isso é necessário para comparar o desempenho entre canais (regra R7). O jogo muda a moldura, não o estímulo.
- **O dado é idêntico:** todos emitem o mesmo envelope do protocolo v2 (`TRIAL_COMPLETED` com `targetId`, `response`, `promptLevel`, `latencyMs`…). É a única coisa uniforme.

## 4. Conceito de cada recurso

### Encontre o Igual — pareamento de idênticos
- **Ciência:** o pareamento com o modelo (matching-to-sample) é base de quase todo programa de pré-escola. O controle por posição aparece em 13 de 16 participantes sem procedimentos sem erro. O tamanho do campo começa em 1 e cresce.
- **Mundo visual:** "mesa de feltro". Cartões de papel cartão com sombra suave sobre um feltro verde-musgo. O modelo fica numa bandeja de madeira no alto. Tipografia arredondada para os números.
- **Lógica:**
  - campo de 1 a 4;
  - posição do correto contrabalanceada (nunca a mesma posição mais de 2 vezes seguidas);
  - semente reprodutível;
  - dica embutida opcional após N segundos (o correto "respira");
  - correção de erro: o cartão volta e a tentativa é reapresentada com dica.
- **Dados:** `presented`, `positionOfTarget`, `selected`, `latencyMs`, `promptLevel`, `promptSource`.

### Escolha pela Instrução — resposta de ouvinte
- **Ciência:** identificação receptiva em campo de 3, com dicas posicionais ou de figura antecedente. O esvanecimento transfere o controle para a instrução falada. O jogo pontua "ouvinte" sozinho; tato e mando ficam com o profissional.
- **Mundo visual:** "palco/estante". Os itens ficam em nichos de uma estante de madeira clara, com um alto-falante animado. A instrução é falada ("Toque na bola") e pode ser repetida tocando no alto-falante. A luz de palco é a dica posicional, que se esvanece.
- **Lógica:** campo de 2 a 4, instrução por voz (Web Speech pt-BR, com áudio gravado no futuro), repetição permitida e registrada, dica antecedente opcional (o item correto aproximado ou destacado), contrabalanceamento de posição.

### Minha Vez / Sua Vez — troca de turnos e espera
- **Ciência:** troca de turnos é base da reciprocidade (ESDM: abertura, tema, variação, fechamento). A pista visual é um cartão ou bastão que passa de uma pessoa para a outra.
- **Mundo visual:** "torre de blocos" num tapete. O tablet fica na mesa entre a criança e o adulto. Um "bastão de vez" desliza para o lado de quem joga. Cada pessoa coloca um bloco, e a torre cresce até o fechamento.
- **Lógica:**
  - turno da criança: toque válido coloca o bloco; mede-se a latência;
  - turno do parceiro: toques da criança contam como "interrupção" (dado), não como erro punitivo;
  - variação de tema configurável (blocos, peixes no aquário, carros no trem).
- **Dados:** cada turno da criança é uma tentativa: correta se esperou e jogou na vez dela.

### Quadro de fichas — economia de fichas
- **Ciência:**
  - o reforçador de troca é escolhido antes de começar e fica visível;
  - fichas temáticas ligadas ao interesse da criança superam fichas genéricas;
  - nunca se retiram fichas por comportamento.
- **Mundo visual:** "cofrinho de conquistas". Encaixes recortados num painel de madeira. A ficha "cai" no encaixe com som curto. Temas de ficha: estrela, dinossauro, trem, coração, folha, bola.
- **Lógica:**
  - 3 a 10 fichas;
  - o adulto entrega a ficha (ou ela é entregue pela contingência do jogo);
  - não existe botão para remover ficha (o adulto só pode corrigir um registro);
  - quadro cheio leva à troca, com cronômetro visual de acesso.
- **Dados:** `TOKEN_DELIVERED`, `BOARD_COMPLETED`, `EXCHANGE_STARTED`/`ENDED`.

### Agenda visual — sequência e primeiro–depois
- **Ciência:** apoios visuais e quadro de rotina previnem comportamento-problema nas transições. O aviso de término antecipa a mudança.
- **Mundo visual:** "varal de cartões". Cartões presos por pregadores num varal. O cartão atual fica em destaque; os concluídos viram e vão para o envelope "acabou". Há o modo primeiro–depois (2 cartões grandes).
- **Dados:** início e fim de cada item e latência de transição (do aviso até o início da atividade seguinte).

## 5. Inteligência (agora, sem IA generativa)

- **Motor de regras R1–R15** (`clinical-core`), rodando no aparelho para retorno imediato e no servidor para os alertas oficiais.
- **Sugestão de distribuição de alvos na montagem da sessão:** prioriza os alvos com menos oportunidades na semana (regra R12).
- **Análise visual assistida (CDC)** no gráfico de alvo.
- **Saciação de reforçador (R10) e viés de posição (R8)** detectados a partir dos dados dos próprios jogos.
- **Adaptação automática da sessão infantil** a partir do perfil sensorial e da faixa etária.

## Fontes
- [Comparativo Rethink, CentralReach, Motivity e Theralytics](https://www.rethinkbehavioralhealth.com/?p=29369)
- [6 Best ABA Data Collection Software 2026 (Tadabase)](https://tadabase.io/blog/best-aba-data-collection-software)
- [BAVI](https://www.b2bstack.com.br/product/bavi)
- [TABA, plataforma ABA brasileira](https://www.maisgoias.com.br/cidades/ferramenta-criada-em-goias-possibilita-tratamento-multidisciplinar-a-pacientes-autistas/)
- [Revisão sobre usabilidade de apps para crianças com autismo](https://khub.utp.edu.my/scholars/9935/)
- [Tamanho de alvo e distância de arrasto em usuários com TEA](https://ipn.elsevierpure.com/es/publications/relations-between-touch-target-size-and-drag-distance-in-mobile-a)
- [Gaming Platforms for People with ASD (PMC11728089)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11728089/)
- [Serious Game Design Principles for Children with Autism](https://thesai.org/Downloads/Volume14No5/Paper_100-Serious_Game_Design_Principles_for_Children_with_Autism.pdf)
- [Controle por posição em MTS (PMC4892948)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4892948)
- [Identificação receptiva — procedimentos de dica (PMC5118260)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5118260)
- [StarRescue — troca de turnos em tablet](https://scholars.cityu.edu.hk/en/publications/starrescue-transforming-a-pong-game-to-visually-convey-the-concep/)
- [Cartão de turno (Texas TEA)](https://spedsupport.tea.texas.gov/resource-library/autism-toolkit/turn-taking-card)
- [Economia de fichas — revisão (PMC10700257)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10700257/)
- [Token System Overview (VKC)](https://vkc.vumc.org/assets/files/tipsheets/Token_System_Overview_aug22.pdf)
