# Jogos Físicos ABA & Denver (ESDM) → Recursos Digitais
## Catálogo de Prompts Detalhados para Geração de Jogos Digitais com IA

> **Como usar este catálogo:** cada jogo físico clássico das intervenções ABA (Análise do Comportamento Aplicada) e Denver / ESDM (Early Start Denver Model) foi convertido em um **prompt técnico completo e pronto para copiar**. Cole o **Bloco Global Padrão** (Seção 2) + o prompt do jogo desejado em uma ferramenta de IA geradora de webapps (Kimi, Lovable, v0, Replit Agent, Cursor etc.) para gerar o recurso digital.

---

## 1. Base teórica (resumo para contextualizar os prompts)

**ABA (Applied Behavior Analysis):** intervenção baseada em tentativas discretas (DTT), reforçamento positivo, hierarquia de ajudas (independente → gestual → verbal → física parcial → física total) e **coleta de dados tentativa a tentativa**. Jogos físicos típicos: pareamento, classificação, jogo da memória, quadro de fichas (economia de tokens), PECS, jogos de tabuleiro simples e jogos de turnos.

**Denver / ESDM (Early Start Denver Model):** intervenção naturalístico-desenvolvimental (NDBI) para crianças de 12 a 48 meses, entregue via **Rotinas de Atividade Conjunta (JARs)** no chão, com controle compartilhado adulto-criança, imitação, atenção conjunta e **reforço natural** (a continuação da brincadeira é a recompensa). Jogos físicos típicos: bola vai-e-vem, bolhas de sabão, torre de blocos em dupla, imitação com tambor, rotinas sensório-sociais com músicas.

**Princípio da conversão digital:** manter a **estrutura terapêutica intacta** (regras, hierarquia de ajudas, reforçamento, coleta de dados) e traduzir os elementos físicos (arrastar carta, rolar bola, estourar bolha, empilhar bloco) em interações de toque/mouse com física e animação.

---

## 2. BLOCO GLOBAL PADRÃO (incluir no início de TODOS os prompts)

```text
Crie um webapp completo, responsivo e instalável (PWA) com a seguinte base técnica e pedagógica:

STACK E FRONTEND
- React 18 + TypeScript + Vite + Tailwind CSS. Componentes funcionais com hooks.
- Telas mínimas: (1) Tela inicial com avatar da criança e botão "Começar"; (2) Tela do jogo;
  (3) Tela de recompensa; (4) Painel do Terapeuta (rota /painel, protegida por PIN de 4 dígitos).
- Suporte a toque (mobile-first, tablets em paisagem) e mouse (desktop).
- Tamanho mínimo de alvos de toque: 64x64 px. Sem gestos de pinça ou multi-toque.
- Funcionar 100% offline após o primeiro carregamento (service worker).

DESIGN SISTÊMICO E ACESSIBILIDADE (obrigatório para público TEA)
- Estilo flat/amigável, cantos arredondados (border-radius >= 16px), sombras suaves.
- SEM elementos piscantes, SEM flashes, SEM mudanças bruscas de tela. Respeitar prefers-reduced-motion.
- Contraste mínimo WCAG AA (4.5:1). Nunca usar vermelho/verde como única diferenciação.
- Controle de volume master e botão "silenciar" sempre visíveis. Sons suaves, sem sustos.
- Tipografia: Nunito ou Atkinson Hyperlegible, corpo >= 20px, peso 600+.
- Fundo claro e calmo; no máximo 3 cores vibrantes por tela para não sobrecarregar sensorialmente.
- Todas as instruções com texto + voz sintetizada (Web Speech API, pt-BR) + ícone pictográfico.

SISTEMA DE REFORÇO E AJUDAS (ABA)
- Reforço imediato (< 1s) após resposta correta: animação de celebração + som agradável + fala de elogio.
- Erro: sem punição visual/sonora. Feedback neutro ("Vamos tentar de novo") e nova oportunidade.
- Hierarquia de ajudas configurável no Painel do Terapeuta:
  N0 independente | N1 dica gestual (destaque brilhante) | N2 dica verbal | N3 demonstração animada.
- Esmaecimento (fading) automático: após 3 acertos independentes consecutivos, reduzir o nível de ajuda.

MÉTRICAS E COLETA DE DADOS (padrão ABA)
- Registrar CADA tentativa em objeto JSON: { timestamp, alvo, resposta, acerto:boolean,
  nivelAjuda:N0-N3, latenciaMs, nTentativa, sessaoId }.
- Persistir em localStorage/IndexedDB. Botão "Exportar CSV/JSON" no Painel do Terapeuta.
- Dashboard com: % de acertos por sessão (gráfico de linha), latência média, nível de ajuda
  predominante, tempo de sessão, e tendência de independência (critério de maestria: >= 80% em N0
  por 3 sessões consecutivas). Usar Recharts para os gráficos.

PRIVACIDADE
- Nenhum dado sai do dispositivo. Sem login, sem analytics externo. Nome da criança é opcional
  e armazenado apenas localmente (adequação à LGPD para dados de menores).
```

---

## 3. Índice dos jogos

| # | Jogo digital | Origem física | Abordagem | Habilidade-alvo |
|---|---|---|---|---|
| 1 | Pareamento Idêntico | Cartas/blocos "coloca com o igual" | ABA / DTT | Discriminação visual, cognição |
| 2 | Fábrica de Categorias | Potes de classificação (cor/forma/categoria) | ABA / DTT | Classificação, flexibilidade cognitiva |
| 3 | Quadro de Fichas Mágico | Token board com velcro | ABA | Autorregulação, economia de fichas |
| 4 | Meu Comunicador PECS | Pasta PECS de figuras | ABA | Comunicação funcional |
| 5 | Memória dos Amigos | Jogo da memória 4→24 cartas | ABA | Memória, turnos, atenção |
| 6 | Emoções em Cena | Cartas de expressões faciais | ABA (habilidades sociais) | Reconhecimento de emoções — crianças **e adolescentes** |
| 7 | Torre dos Dois | Torre de blocos em dupla | Denver / ESDM (JAR) | Troca de turnos, atenção conjunta |
| 8 | Bola Vai-e-Vem | Rolar a bola "minha vez/sua vez" | Denver / ESDM (JAR) | Turnos, imitação, engajamento |
| 9 | Bolhas Mágicas | Bolhas de sabão com pausa | Denver / ESDM + NET | Pedido (mand), comunicação |
| 10 | Tambor da Imitação | Protocolo Denver de imitação com objetos | Denver / ESDM | Imitação, tomada de vez |
| 11 | Siga o Mestre | Simon Says | ABA (grupo) | Seguir instruções, controle inibitório |
| 12 | Dança do Congelar | Freeze Dance | ABA (grupo) / ESDM | Escuta, regulação motora |

---

## 4. Jogos ABA (ensino estruturado)

---

### JOGO 1 — Pareamento Idêntico Digital
**Origem física:** o terapeuta coloca uma carta-modelo na mesa (ex.: maçã) e 2–3 cartas à frente da criança; a instrução é "coloca com o igual". Progressão: objeto→objeto, foto→foto, foto→objeto, com campo de estímulos crescente (1→8). É o item "Match/sort identical objects/pictures" do checklist ESDM e um dos primeiros programas de DTT.

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o jogo "PAREAMENTO IDÊNTICO" — versão digital do programa ABA de matching-to-sample.

OBJETIVO DO JOGO
- Uma carta-modelo aparece no topo da tela (dentro de uma moldura destacada).
- Abaixo, um campo de 2 a 8 cartas. A criança arrasta a carta idêntica até a moldura do modelo.
- Configuração no Painel: modo objeto→objeto, foto→foto ou foto→objeto; tamanho do campo (2/3/4/6/8);
  categorias de estímulos (animais, alimentos, veículos, objetos da casa, formas geométricas).

FRONTEND
- Layout: zona do modelo no terço superior (moldura com cantos tracejados e pulso suave de brilho),
  grade do campo de escolha no restante, em grid responsivo (2 colunas no retrato, 4 na paisagem).
- Arrastar com pointer events; alternativa por toque simples (tocar na carta → ela "voa" até o modelo)
  para crianças sem coordenação de arraste. Opção configurável no Painel.
- Cartas de 96–140px conforme o tamanho do campo.

DESIGN, CORES E TIPOGRAFIA
- Fundo: #F7F4EF (off-white quente). Moldura do modelo: #4A90D9 (azul calmo).
- Cartas: fundo branco #FFFFFF, borda #E3DED6, sombra 0 4px 12px rgba(0,0,0,0.08).
- Reforço: confete em #F4B942 (amarelo), #7BC47F (verde suave) e #4A90D9.
- Tipografia Nunito 700 para rótulos opcionais sob as imagens.

ILUSTRAÇÕES E ASSETS
- Estilo: pictogramas flat de traço grosso e alto contraste (estilo AAC).
- Repositórios: ARASAAC (arasaac.org, pictogramas CC BY-NC-SA 4.0), OpenMoji (openmoji.org, CC BY-SA 4.0),
  ou gerar SVGs próprios no mesmo estilo. Mínimo 10 itens por categoria, 5 categorias.
- Sons: "pop" suave ao tocar, fanfarra curta (<= 1,5s) no acerto — Freesound.org (CC0) ou Web Audio API.

FÍSICA E ANIMAÇÕES
- Framer Motion: carta arrastada com leve rotação (±5°) e escala 1.05; retorno elástico (spring,
  stiffness 300, damping 20) se solta fora do alvo; acerto: snap com squash-and-stretch + confete
  de partículas (canvas-confetti); erro: shake horizontal suave (6px, 300ms) e retorno.

LÓGICA E REGRAS
1. O alvo correto e os distratores são sorteados sem repetição dentro da sessão (10 tentativas/sessão).
2. Posição do alvo randomizada a cada tentativa (evitar aprendizagem posicional — regra clássica de DTT).
3. Acerto → reforço imediato + próxima tentativa após 1,5s. Erro → feedback neutro, ajuda conforme
   hierarquia configurada, e a tentativa é registrada como erro (não re-apresentar o erro como acerto).
4. Ajudas: N1 = borda brilhante no alvo; N2 = fala "olha, igual a este"; N3 = ghost animado mostrando
   o arraste. Fading automático após 3 acertos em N0.
5. Critério de maestria por tamanho de campo: >= 80% de acertos independentes em 3 sessões →
   sugerir ao terapeuta (badge no Painel) aumentar o campo.

MÉTRICAS ESPECÍFICAS (além do padrão global)
- Campo de estímulos usado, modo (objeto/foto), categoria, posição do alvo, distratores apresentados.
- Gráfico adicional: % de acerto por tamanho de campo ao longo das sessões.
```

---

### JOGO 2 — Fábrica de Categorias
**Origem física:** potes ou caixas coloridas na mesa e a criança distribui objetos/figuras por cor, forma ou categoria ("carros aqui, bichos ali"). Trabalha os itens "Match/sort objects by size" e "Sort into categories (cars, horses, balls)" do checklist ESDM.

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o jogo "FÁBRICA DE CATEGORIAS" — versão digital da atividade ABA de classificação/sorting.

OBJETIVO DO JOGO
- Cenário de esteira/mesa com 2 a 4 "caixas de destino" (rotuladas por pictograma + cor).
- Itens aparecem um a um no centro; a criança arrasta cada item para a caixa correta.
- Níveis: L1 classificar por cor | L2 por forma | L3 por categoria (animais/veículos/alimentos/roupas) |
  L4 por categoria com subdivisão (animais da fazenda × animais marinhos) | L5 por tamanho (grande/pequeno).

FRONTEND
- Caixas de destino fixas na base da tela (2–4 colunas), itens nascem no topo central com animação de
  "cair da esteira" (translateY + bounce suave).
- Fila de itens visível à esquerda (miniaturas) para previsibilidade — importante para crianças TEA.
- Contador de itens restantes em formato visual (bolinhas), não numérico, no modo infantil.

DESIGN, CORES E TIPOGRAFIA
- Fundo: #EEF3F8 (azul-nevoa). Caixas: cada categoria com cor própria — #F4B942, #7BC47F, #E8877B,
  #8E7CC3 — sempre acompanhada de pictograma (nunca cor isolada como pista).
- Item ativo com halo #4A90D9. Tipografia Nunito 600+.

ILUSTRAÇÕES E ASSETS
- Pictogramas flat de traço grosso: ARASAAC e OpenMoji. 12 itens por categoria.
- Caixas ilustradas como caixas de papelão simpáticas com a boca/abertura visível (SVG próprio).
- Som de "plim" ao encaixar + fanfarra a cada 5 itens corretos (Freesound.org CC0 ou Web Audio API).

FÍSICA E ANIMAÇÕES
- Framer Motion: item cai com spring (bounce 0.4); arrasto com escala 1.1 e sombra ampliada; acerto:
  item mergulha na caixa (scale down + fade) e a caixa "pula" de alegria (scaleY 0.9→1.1→1);
  erro: item retorna elástico ao centro e a caixa errada balança "não" (rotate ±4°).
- Confete curto ao completar a rodada de 10 itens.

LÓGICA E REGRAS
1. Rodada = 10 itens, distribuição equilibrada entre as categorias ativas (±1).
2. Erro → feedback neutro + ajuda escalonada: N1 a caixa correta pulsa; N2 fala "carros ficam aqui";
   N3 seta animada item→caixa. Fading após 3 acertos independentes.
3. Nível desbloqueia pelo critério de maestria (>= 80% em N0 por 3 sessões) OU por seleção manual
   do terapeuta no Painel.
4. Modo "desafio do turno" (opcional, 2 jogadores no mesmo tablet): alterna a cada item, com
   indicador visual de "sua vez / minha vez" — generalização para troca de turnos.

MÉTRICAS ESPECÍFICAS
- Nível jogado, categorias ativas, matriz de confusão (qual categoria foi confundida com qual),
  itens/minuto, evolução por nível em gráfico de degraus no Painel.
```

---

### JOGO 3 — Quadro de Fichas Mágico (Token Board)
**Origem física:** quadro de velcro com 5 espaços; a cada comportamento-alvo (sentar, completar tarefa, esperar) a criança ganha uma estrela; ao completar 5, troca por um reforçador do "menu de recompensas". É a economia de fichas, técnica central de manejo comportamental em ABA.

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o app "QUADRO DE FICHAS MÁGICO" — token board digital com economia de fichas completa.

OBJETIVO
- Ferramenta usada PELO ADULTO junto à criança (não é jogo solo): o adulto toca em "ganhar ficha"
  quando o comportamento-alvo ocorre; a ficha voa até o quadro; ao completar o quadro, a criança
  escolhe a recompensa no menu e recebe uma celebração.
- Configurações no Painel: comportamentos-alvo (texto + pictograma), número de fichas (3/5/10),
  tema das fichas (estrelas, dinossauros, corações, foguetes), menu de recompensas personalizável
  (foto do reforçador real da criança via upload + nome, ex.: "5 min de tablet", "abalroamento").

FRONTEND
- Tela principal: quadro com espaços vazios no centro (silhueta tracejada de cada ficha), botão grande
  "GANHAR FICHA" (#7BC47F) para o adulto, botão discreto "remover ficha" (para uso clínico, com
  confirmação), e ícone do menu de recompensas.
- Mini-cena de fundo temática que se "revela" a cada ficha (ex.: foguete montando peça a peça).
- Modo "primeiro/depois" integrado: cartão superior mostra PRIMEIRO [tarefa] → DEPOIS [recompensa],
  replicando o first-then board físico.

DESIGN, CORES E TIPOGRAFIA
- Fundo: #F7F4EF. Quadro: moldura de madeira clara (#D9C7A7) simulando o quadro físico de velcro.
- Fichas com brilho metálico suave; reforço final em cascata de #F4B942, #E8877B, #4A90D9.
- Tipografia Nunito 700, rótulos curtos (máx. 3 palavras por cartão).

ILUSTRAÇÕES E ASSETS
- 4 temas de fichas em SVG próprio (estrela, dino, coração, foguete), estilo flat arredondado.
- Pictogramas dos comportamentos e recompensas: ARASAAC; upload de foto real (FileReader API,
  armazenada em IndexedDB, nunca enviada a servidor).
- Sons: "clique" metálico da ficha, celebração final com arpejo ascendente (Web Audio API, sem
  dependência de arquivo).

FÍSICA E ANIMAÇÕES
- Framer Motion: ficha nasce do botão e percorre trajetória em arco (path animation) até o espaço
  vazio, com rotação de 360° e snap magnético; espaço restante "respira" (scale 1→1.03) como dica.
- Quadro completo: todas as fichas saltam em sequência (stagger 80ms), fogos de partículas discretos
  e abertura automática do menu de recompensas.

LÓGICA E REGRAS
1. Uma ficha por toque, com cooldown de 1s (evitar toques acidentais duplos).
2. Recompensa escolhida → tela de celebração + timer opcional do reforçador (ex.: cronômetro visual
   de 5 min, estilo Time Timer com disco vermelho decrescente — cópia digital do timer físico).
3. Botão "nova rodada" reseta o quadro mantendo o histórico.
4. Sem punição: remover ficha é função clínica silenciosa, sem animação negativa.

MÉTRICAS ESPECÍFICAS
- Timestamp de cada ficha ganha (latência entre comportamento e ficha), comportamento-alvo ativo,
  recompensas escolhidas (ranking de reforçadores preferidos — dado clínico valioso), duração total
  da rodada, nº de rodadas por dia. Gráfico: fichas/dia e ranking de recompensas no Painel.
```

---

### JOGO 4 — Meu Comunicador PECS
**Origem física:** a pasta PECS (Picture Exchange Communication System): a criança destacá a figura de velcro, caminha até o comunicador parceiro e entrega a figura em sua mão para pedir. Fases do protocolo: I (troca física), II (distância/persistência), III (discriminação entre figuras), IV (frase "eu quero ___" na tira de sentença), V (responder "o que você quer?"), VI (comentar "eu vejo ___").

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o app "MEU COMUNICADOR" — comunicador digital por troca de figuras baseado nas 6 fases do PECS.

OBJETIVO
- Ferramenta de comunicação aumentativa/alternativa (CAA) que reproduz digitalmente o ritual PECS:
  a criança arrasta o pictograma até a "mão" do parceiro animado na tela; o app fala a mensagem em voz
  alta (Web Speech API, pt-BR) e o parceiro responde com animação de entrega do item.
- As 6 fases são implementadas como MODOS progressivos, selecionados pelo terapeuta no Painel:
  Fase I: 1 figura na tela → arrastar até a mão.
  Fase II: a mão/parceiro aparece mais longe (canto oposto) e "espera" — exige persistência.
  Fase III: 2+ figuras, uma delas é item não preferido → discriminação (só o pedido correto é atendido).
  Fase IV: tira de sentença no topo: arrastar "EU QUERO" + [item] em sequência na tira.
  Fase V: o parceiro pergunta "O que você quer?" (voz + balão) antes de a tira abrir.
  Fase VI: modo comentário "EU VEJO ___" com cenas ilustradas (arrastar o que aparece na cena).

FRONTEND
- Biblioteca de figuras organizada por categorias em abas laterais (comida, brinquedos, ações, lugares,
  pessoas, sentimentos), com busca por texto e pasta "favoritos".
- Tira de sentença fixa no topo, com slots numerados e destaque no slot ativo.
- Parceiro animado: personagem 2D simples (menino/menina/adulto, 3 tons de pele) com mão estendida,
  expressão de espera (piscar lento) e de alegria ao receber.
- Grade de figuras: 2/4/6/8 por tela (configurável conforme o repertório da criança).

DESIGN, CORES E TIPOGRAFIA
- Fundo #FDFBF7; tira de sentença branca com borda #4A90D9; figuras com fundo branco e borda #E3DED6.
- Codificação de cores por categoria gramatical (padrão CAA): verbos #F2A0C4 (rosa), substantivos
  #F4B942 (amarelo), adjetivos #8E7CC3 (roxo), pessoas #7BC47F (verde) — sempre com borda E cor.
- Tipografia Nunito 700; rótulo sob cada figura em caixa alta.

ILUSTRAÇÕES E ASSETS
- Pictogramas ARASAAC (banco aberto com milhares de símbolos AAC em pt-BR) — prioridade máxima;
  fallback OpenMoji. Upload de fotos reais dos itens preferidos da criança (IndexedDB).
- Personagem parceiro em SVG próprio com 3 estados (neutro/espera/feliz).
- Voz: Web Speech API pt-BR; volume e velocidade configuráveis (0,75× / 1×).

FÍSICA E ANIMAÇÕES
- Arrasto com Framer Motion (escala 1.08, sombra amplia); figura "entregue" encolhe até a mão com
  ease-out; mão fecha-se suavemente; item pedido surge em bubble pop acima do parceiro.
- Erro na Fase III (figura não correspondente): o parceiro balança a cabeça "não" (rotate ±5°) com
  feedback neutro falado "Hmm, essa não"; nenhum som negativo.

LÓGICA E REGRAS
1. Cada troca bem-sucedida = 1 comunicação registrada; o app SEMPRE vocaliza a frase completa.
2. Fase III+: o item pedido deve constar na lista de "preferidos atuais" configurada pelo terapeuta;
   o item distrativo muda a cada tentativa.
3. Na Fase IV+, a tira só "envia" quando a sequência está completa e na ordem correta; slots errados
   retornam a figura com spring.
4. Ajudas: N1 slot ativo pulsa; N2 fala "arrasta EU QUERO"; N3 ghost demonstra. Fading automático.
5. Botão do terapeuta "bloquear acesso" (o parceiro cruza os braços por 5s) para treinar o olhar/
   insistência — reproduz digitalmente a técnica de "withhold" do protocolo, com limite de 2 usos
   por sessão para não frustrar.

MÉTRICAS ESPECÍFICAS
- Fase ativa, figuras usadas (frequência por categoria), frases construídas, trocas independentes ×
  com ajuda, latência entre apresentação e início do arrasto, tentativas de discriminação (acerto/erro
  na Fase III). Gráfico: comunicações independentes por sessão — o indicador central do PECS.
```

---

### JOGO 5 — Memória dos Amigos
**Origem física:** o clássico jogo da memória usado em ABA com adaptação: começa com 4–6 cartas (2–3 pares), aumenta progressivamente; jogado em turnos com o terapeuta, treinando espera, memória de trabalho e comentário social ("achei o par do gato!").

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o jogo "MEMÓRIA DOS AMIGOS" — jogo da memória adaptado para intervenção ABA.

OBJETIVO
- Grade de cartas viradas; a criança vira 2 por vez procurando pares idênticos.
- Modos: SOLO (contra si mesmo) e TURNOS (criança × parceiro virtual ou 2º jogador humano no
  mesmo tablet), com indicador de "sua vez" — treinando espera e troca de turnos.
- Configurações no Painel: nº de pares (2/3/4/6/8/12), tema (animais, alimentos, veículos, emoções,
  personagens), tempo de exposição das cartas erradas (0,5s / 1s / 2s), com/sem rótulo falado ao virar.

FRONTEND
- Grade centralizada com espaçamento generoso (16px+); cartas grandes (mín. 96px).
- Placar de turnos no topo com avatar e nome de cada jogador; seta animada indica o jogador da vez.
- Ao virar carta, o app fala o nome do item (suporte à linguagem receptiva) — configurável.

DESIGN, CORES E TIPOGRAFIA
- Fundo #EEF3F8; verso das cartas com padrão suave (bolinhas #4A90D9 sobre branco, sem texturas
  ruidosas); frente branca com pictograma central.
- Par encontrado: moldura #7BC47F + leve brilho. Jogador da vez: avatar com anel pulsante #F4B942.

ILUSTRAÇÕES E ASSETS
- Pictogramas ARASAAC/OpenMoji, 24 itens por tema. Versos das cartas em SVG próprio.
- Sons: flip de carta suave, "tcharam" curto no par, aplausos discretos ao fim (Web Audio/Freesound CC0).

FÍSICA E ANIMAÇÕES
- Flip 3D realista (CSS transform rotateY 180°, 400ms, ease-in-out); par correto: cartas saltam
  (translateY -12px) e ganham moldura; par errado: aguardam o tempo configurado e viram de volta
  simultaneamente. Vitória: cascata de cartas + confete.

LÓGICA E REGRAS
1. No modo TURNOS: quem acha par joga de novo (regra clássica) OU alterna sempre (modo simplificado —
   configurável; o simplificado é o recomendado para os primeiros contatos com turnos).
2. Ajudas: N1 após 2 erros seguidos, as cartas do par mais "visto" piscam suavemente; N2 fala
   "o gato estava aqui"; N3 prévia rápida de todas as cartas (1,5s) no início da rodada.
3. Fim de jogo: tela de resultado com foco no esforço ("Vocês encontraram 6 pares!"), não no
   vencedor; no modo TURNOS, celebração conjunta ("time que achou todos os pares").
4. Progressão automática sugerida: 3 sessões com >= 80% de pares achados sem ajuda → Painel sugere
   aumentar o nº de pares.

MÉTRICAS ESPECÍFICAS
- Nº de pares, jogadas totais, pares por jogador, taxa de acerto após 1ª visualização (indicador de
  memória de trabalho), latência entre viradas, nº de vezes que o jogador jogou fora de turno
  (indicador de controle inibitório/espera — dado ABA relevante). Gráfico: acerto × nº de pares.
```

---

### JOGO 6 — Emoções em Cena
**Origem física:** cartas de expressões faciais e espelho usados em ABA para ensinar reconhecimento e nomeação de emoções ("quem está feliz?", "mostre surpreso"); com adolescentes, evolui para fotos de contextos sociais e "como essa pessoa se sente?".

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o jogo "EMOÇÕES EM CENA" — reconhecimento e nomeação de emoções para crianças E adolescentes.

OBJETIVO
- 4 atividades progressivas, com duas trilhas visuais: trilha INFANTIL (personagens cartunescos) e
  trilha TEEN (fotos/ilustrações realistas e situações sociais do cotidiano adolescente: escola,
  grupos de amigos, redes sociais, esportes):
  A1 Reconhecer: "toque em quem está FELIZ" — campo de 2–4 rostos.
  A2 Nomear: um rosto/cena em destaque — "como essa pessoa está se sentindo?" — campo de 3 emoções.
  A3 Contextualizar: cena social (ex.: "perdeu o jogo", "ganhou presente", "ninguém chamou para o
     grupo") — "como VOCÊ se sentiria?" — sem resposta certa: o app valida e nomeia a emoção escolhida
     ("Você se sentiria triste. Triste é quando...").
  A4 Imitar (opcional, com selfie da câmera lado a lado, processamento 100% local): "faça a cara de
     SURPRESO" — a criança/adolescente compara sua expressão com o modelo. Sem detecção automática:
     confirmação pelo adulto (sim/não) para manter validação humana e privacidade.

FRONTEND
- Cartões de emoção grandes com rosto central; trilha TEEN usa cards de cena (16:9) com personagens
  adolescentes diversos.
- Seletor de trilha (Infantil/Teen) e de conjunto de emoções no Painel: básicas (alegre, triste,
  com raiva, com medo, surpreso, nojo) e complexas (frustrado, ansioso, orgulhoso, envergonhado,
  entediado, ciúme) — estas últimas voltadas a adolescentes.

DESIGN, CORES E TIPOGRAFIA
- Trilha infantil: fundo #F7F4EF, acentos vibrantes suaves. Trilha TEEN: visual "app maduro"
  (fundo #FFFFFF, tipografia Inter, cards com borda fina #E5E5E5, acentos #4A90D9 e #F4B942) —
  evitar estética "de bebê", fator crítico de adesão em adolescentes.
- Cada emoção com cor-âncora consistente em todo o app (feliz #F4B942, triste #4A90D9, raiva #E8877B,
  medo #8E7CC3, surpresa #7BC47F).

ILUSTRAÇÕES E ASSETS
- Rostos: OpenMoji (set de expressões) + série própria de 6 personagens consistentes (diversidade de
  tom de pele, cabelo, uso de óculos/aparelho auditivo/cadeira de rodas) em SVG, estilo flat.
- Cenas TEEN: ilustrações flat de situações sociais (estilo unDraw/humaaans, ambos open source)
  com personagens adolescentes.
- Sons discretos; trilha TEEN com feedback ainda mais sóbrio (sem fanfarras — só confirmação sutil).

FÍSICA E ANIMAÇÕES
- Seleção com micro-interação (scale 0.96→1, sombra), transição de cena com fade+slide (300ms);
  sem física pesada — foco na leitura social. A3: ao escolher, o cenário "reage" (o personagem da
  cena passa a expressar a emoção escolhida, com cross-fade entre SVGs).

LÓGICA E REGRAS
1. A1/A2 com tentativas registradas e ajudas escalonadas (N1 contorno no alvo, N2 fala a dica
   "olha as sobrancelhas e a boca", N3 destaca as features faciais com círculos animados).
2. A3 não registra acerto/erro — registra a emoção escolhida e a concordância do adulto (painel
   do terapeuta pode anotar a justificativa da criança/adolescente em campo livre).
3. A4: confirmação do adulto (botões "conseguiu" / "vamos praticar") registra a tentativa.
4. Sessão padrão: 12 cartas misturando as atividades ativas; generalização com personagens e cenas
   nunca repetidos na mesma sessão.

MÉTRICAS ESPECÍFICAS
- Acerto por emoção (matriz de confusão: quais emoções são confundidas entre si — dado clínico-chave),
  trilha e conjunto de emoções usados, latência de resposta, evolução em emoções básicas × complexas.
  Gráfico: radar de acerto por emoção no Painel.
```

---

## 5. Jogos Denver / ESDM (rotinas de atividade conjunta)

> Nos jogos ESDM, o "reforço" não é um prêmio externo: é a **continuação da brincadeira** (reforço natural). Os prompts abaixo instruem a IA a implementar esse princípio, além do controle compartilhado (a criança escolhe, o adulto/parceiro virtual dá o modelo) e da narração em voz alta no ritmo da ação ("bate, bate, bate").

---

### JOGO 7 — Torre dos Dois
**Origem física:** adulto e criança sentados no chão alternam blocos numa torre compartilhada — "um bloco para você, um para mim" — até derrubá-la com risadas (a derrubada é o reforço natural). Trabalha troca de turnos, atenção conjunta e meta compartilhada (JAR clássica do ESDM).

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o jogo "TORRE DOS DOIS" — versão digital da rotina conjunta ESDM de construir uma torre em dupla.

OBJETIVO
- Criança e parceiro virtual ("Tico", um robô amigável) alternam turnos empilhando blocos numa torre
  física (física real de empilhamento). Quando a torre cai — naturalmente ou pelo botão "DERRUBAR!" —
  há celebração conjunta e uma nova torre começa. A derrubada é o momento mais divertido do jogo
  (reforço natural, como na rotina física).
- Indicador de turno sempre visível: "SUA VEZ" (anel ao redor do avatar da criança) × "VEZ DO TICO".
  O Tico "espera" olhando para a criança quando é a vez dela — modelando a espera.

FRONTEND
- Cena única: mesa no terço inferior, blocos disponíveis numa bandeja lateral (3 por turno, cores
  sortidas), torre ao centro.
- A criança arrasta o bloco para a posição desejada na torre; o Tico joga com animação de braço.
- Botão "DERRUBAR!" grande e colorido sempre disponível (a criança controla o clímax — controle
  compartilhado do ESDM). Modo 2 jogadores humanos no mesmo tablet: alternância automática de turno.

DESIGN, CORES E TIPOGRAFIA
- Fundo: gradiente suave #EEF3F8 → #FDFBF7 (céu de papel). Mesa #D9C7A7.
- Blocos em cores primárias suavizadas (#E8877B, #F4B942, #7BC47F, #4A90D9, #8E7CC3) com faces
  levemente irregulares (charme artesanal, estilo bloco de madeira).
- Tico: robô cinza-claro com rosto de tela (olhos grandes, sorriso simples), 3 estados: jogando,
  esperando (olhando a criança, piscando), comemorando.

ILUSTRAÇÕES E ASSETS
- Blocos e cenário em SVG próprio, estilo flat com textura de madeira sutil.
- Efeitos sonoros de madeira batendo (Freesound.org CC0) e risada/genteirinha do Tico (síntese
  Web Audio — "sons engraçados" como na narração ESDM: "póim!", "tum!").
- Narração em voz alta no ritmo das ações: "sobe, sobe, sobe... CAIU!" — replicando a técnica
  ESDM de narrar a rotina.

FÍSICA E ANIMAÇÕES
- Matter.js (motor 2D): gravidade real, blocos com atrito e leve elasticidade; torre tomba de
  verdade quando instável — a imprevisibilidade física é parte da graça e ensina causa-efeito.
- Arrasto: bloco segue o dedo; ao soltar, cai com física real. Tremor sutil da torre alta
  (micro-rotações) aumenta a antecipação — "está quase caindo!".
- Derrubada: slow-motion de 600ms + câmera shake leve + confete de blocos.

LÓGICA E REGRAS
1. Turnos rígidos de 1 bloco por vez; se a criança tocar fora de turno, o bloco "não sai da bandeja"
   e a voz diz gentilmente "espera... vez do Tico" — treino de espera sem frustração (o turno dela
   chega em <= 5s, como recomendado para primeiros treinos de espera).
2. Ajudas: N1 a posição ideal do bloco aparece em silhueta; N2 voz "põe em cima"; N3 ghost demonstra.
3. Reforço natural: derrubar libera animação máxima + escolha da criança ("outra torre?" com 2
   pictogramas: SIM / TROCAR DE JOGO) — a continuação da brincadeira é a recompensa.
4. Variações de rotina (ESDM pede variação após o padrão consolidado): blocos de tamanhos diferentes,
   torre com base móvel, "torre arco-íris" (ordem de cores a seguir em dupla).

MÉTRICAS ESPECÍFICAS
- Turnos completados por sessão, nº de toques fora de turno (espera), nº de blocos antes da queda,
  quem derrubou (criança/Tico/física), nível de engajamento (tempo ativo na rotina sem sair da tela),
  uso das variações. Gráfico: toques fora de turno por sessão — queda esperada com o progresso.
```

---

### JOGO 8 — Bola Vai-e-Vem
**Origem física:** adulto e criança sentados frente a frente com as pernas em "V", rolando a bola um para o outro — "minha vez!", "sua vez!". Rotina fundamental de turnos recíprocos e atenção conjunta no ESDM; varia-se velocidade, tamanho da bola e efeitos sonoros.

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o jogo "BOLA VAI-E-VEM" — versão digital da rotina ESDM de rolar a bola em dupla.

OBJETIVO
- Perspectiva em primeira pessoa: a criança vê a bola chegar rolando até ela (parte inferior da tela)
  e deve rolar de volta com um gesto de deslize (swipe) para o parceiro (Tico, o robô, ou animal
  escolhido pela criança) que está do outro lado de um "tapete" ilustrado.
- Ciclo de turnos contínuo: Tico rola → criança devolve → Tico rola... A cada 4–6 trocas, o jogo
  propõe uma VARIAÇÃO (bola rápida, bola lenta gigante, bola que faz som engraçado, bola-surpresa
  com brilho) — replicando as variações que mantêm o engajamento na rotina física.

FRONTEND
- Cena única sem menus intermediários: tapete central em perspectiva, parceiro no topo, bola na base.
- Gesto: deslize para cima na bola = rolar de volta. Alternativa acessível: tocar na bola.
- Controle compartilhado: a criança escolhe a bola da vez na "caixa de bolas" (3 opções visuais)
  antes de cada rodada — escolha da criança = motivação (princípio ESDM).

DESIGN, CORES E TIPOGRAFIA
- Tapete #7BC47F com faixas claras (referência ao tapete de atividades físico); fundo #FDFBF7.
- Bolas: listradas (#E8877B/branco), bolinhas (#4A90D9/branco), estrelada (#F4B942), arco-íris.
- Texto mínimo; instruções faladas + pictograma de "sua vez" (seta apontando para a criança).

ILUSTRAÇÕES E ASSETS
- Bolas e tapete em SVG próprio (flat, contorno grosso); parceiro com animação de "preparar-rolar-
  receber-comemorar".
- Sons: rolagem (loop curto com pitch variando pela velocidade), "uí!" do parceiro, fanfarra curta
  nas trocas longas (Freesound CC0 + Web Audio).

FÍSICA E ANIMAÇÕES
- Física 2D customizada (ou Matter.js): a bola chega com easing desacelerado e quica suavemente ao
  "chegar" na criança; o deslize devolve com velocidade proporcional à força do gesto (mapeia
  coordenação motora); bola rápida deixa rastro de motion-blur leve (respeitando reduced-motion).
- Antecipação: o parceiro "mira" (inclina o corpo) 800ms antes de rolar — treina atenção antecipatória.

LÓGICA E REGRAS
1. A bola "espera" pela criança: se ela não devolver em 5s, o parceiro chama com voz e gesto
   ("sua vez!") — pausa comportamental (pause) clássica do ESDM para evocar iniciativa.
2. Devolução conta como resposta; trocas consecutivas sem pausa externa = "cadeia de turnos"
   (métrica central). Meta de sessão configurável: 5/10/15 trocas.
3. Ajudas: N1 seta animada mostra o gesto; N2 voz "empurra a bola"; N3 bola devolve com qualquer
   toque em qualquer lugar da tela.
4. Reforço natural: a cada 4 trocas completas, "turno especial" — a bola vira confete ao chegar,
   ou o parceiro faz cambalhota; a brincadeira continua IMEDIATAMENTE (sem telas de pausa).
5. Sessão encerra com escolha da criança: "mais" ou "tchau, bola" (fechamento previsível da rotina).

MÉTRICAS ESPECÍFICAS
- Nº de trocas por sessão, cadeia máxima de turnos, latência de resposta da criança (tempo até
  devolver), nº de chamadas de "sua vez" necessárias (iniciativa × responsividade), força média do
  gesto, bolas preferidas (ranking de escolha). Gráfico: latência de resposta ao longo das sessões.
```

---

### JOGO 9 — Bolhas Mágicas
**Origem física:** o terapeuta sopra bolhas, a criança estoura; então o adulto **pausa** e espera — a criança precisa comunicar (fala, gesto, figura ou olhar) que quer "mais". Atividade-motriz de pedido (mand) em NET/ESDM, porque bolhas são altamente motivadoras.

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o jogo "BOLHAS MÁGICAS" — versão digital da atividade de bolhas de sabão para treino de pedido.

OBJETIVO
- O personagem (varinha mágica ou o Tico) sopra um leque de bolhas que flutuam pela tela; a criança
  estoura com o toque (som de "pop!" + micro-partículas). Após 2–3 leques, o personagem PARA e
  "olha esperando" (pausa comportamental): para ganhar mais bolhas, a criança comunica — tocar no
  pictograma "MAIS", dizer "mais" (confirmação do adulto), ou arrastar a figura "eu quero bolhas"
  (integração com o modo PECS do Jogo 4, se instalado).
- Níveis de comunicação configuráveis (espelhando a progressão real): L1 apontar/tocar "MAIS" |
  L2 arrastar figura para a tira | L3 frase "EU QUERO" + "BOLHAS" | L4 responder "O que você quer?"

FRONTEND
- Cena única: céu de fundo, varinha no canto, área de flutuação livre das bolhas ocupando 80% da tela.
- Botão "MAIS" grande (#F4B942, com pictograma) surge durante a pausa, pulsando suavemente.
- Contador visual de "leques ganhos" (bolinhas de sabão numeradas) para previsibilidade do fim.

DESIGN, CORES E TIPOGRAFIA
- Céu gradiente #DCEEF7 → #FDFBF7; nuvens flat ocasionais; bolhas translúcidas com reflexo iridescente
  sutil (#B8E0F5/#F4B942/#F2A0C4 em baixa opacidade) — bonitas mas sem brilho estroboscópico.
- Tipografia Nunito 700 apenas nos pictogramas de pedido.

ILUSTRAÇÕES E ASSETS
- Bolhas em canvas/SVG com gradiente radial; varinha e personagem em SVG próprio.
- Som de "pop" orgânico (Freesound CC0, 2–3 variações para não cansar), brilho de sopro (arpejo
  suave), trilha ambiente opcional e desligável.

FÍSICA E ANIMAÇÕES
- Física customizada: bolhas sobem com velocidade variável, deriva senoidal lateral (flutuação
  realista), oscilação de escala (±3%), quica suave nas bordas; estouro com anel expansivo +
  6 micro-gotas radiais (particle burst curto, <= 400ms).
- Densidade de bolhas configurável (6–20 por leque) para ajuste sensorial.

LÓGICA E REGRAS
1. Ciclo: [sopro → estouro livre (20–30s) → PAUSA com espera]. A pausa só termina com a comunicação
   no nível configurado — esse É o ensino (controle do reforçador pelo comunicador).
2. Tempo máximo de pausa: 10s; depois disso, ajuda escalonada (N1 botão pulsa mais forte, N2 voz
   "pede mais", N3 ghost demonstra). Registrar se a comunicação foi espontânea ou com ajuda — dado
   central do treino de mand.
3. Reforço natural: o pedido gera IMEDIATAMENTE o leque de bolhas (a recompensa é a própria
   brincadeira, sem telas intermediárias).
4. Encerramento previsível: após o último leque, pictograma "ACABOU" + rotina de fechamento
   (personagem acena "tchau") — transição estruturada como na sessão física.

MÉTRICAS ESPECÍFICAS
- Pedidos espontâneos × com ajuda por sessão (indicador nº 1), latência do pedido na pausa, nível
  comunicativo usado, nº de bolhas estouradas, tempo de engajamento ativo, densidade preferida.
  Gráfico: % de pedidos espontâneos por sessão — o gráfico que o terapeuta quer ver subindo.
```

---

### JOGO 10 — Tambor da Imitação
**Origem física:** o protocolo de imitação com objetos do Modelo Denver: a criança toca o tambor → o adulto pega e imita narrando ("bate, bate, bate", "pow, pow, pow") → devolve dizendo "faz igual / sua vez" → ajuda física se necessário → reforça deixando a criança tocar livremente. Meta: 8–10 ações imitadas de forma independente em ≥ 80% das oportunidades.

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o jogo "TAMBOR DA IMITAÇÃO" — protocolo Denver de imitação com objetos em formato digital.

OBJETIVO
- Um tambor (e depois outros instrumentos/objetos: chocalho, pandeiro, xilofone, brinquedo de
  apertar) no centro da tela. O parceiro virtual Tico EXECUTA uma ação-alvo (ex.: bater rápido
  3×, bater lento 2×, bater nas bordas, sacudir) narrando em voz alta no ritmo ("bate, bate, bate!"
  / "pow, pow, pow!") e diz "SUA VEZ — FAZ IGUAL!".
- A criança reproduz o padrão tocando no tambor da tela (detecção de ritmo, velocidade e zona do
  toque). Acerto → Tico comemora e IMITA A CRIANÇA de volta (ela toca livre, ele copia — turno de
  "a criança modela", fase inicial do protocolo Denver, que valida a liderança dela).

FRONTEND
- Cena única com o objeto central grande (>= 40% da tela) e Tico ao lado com sua própria versão
  miniatura do objeto.
- Indicador de turno: "VEZ DO TICO" / "SUA VEZ" com troca de cor do anel da cena (sem texto obrigatório).
- Biblioteca de ações configurável no Painel (bater rápido/lento, bater N vezes, bater centro/borda,
  sacudir, rolar, apertar), começando sempre pelas ações já no repertório da criança (configurável).

DESIGN, CORES E TIPOGRAFIA
- Fundo #F7F4EF (chão de atividade); tambor vermelho-tijolo #E8877B com pele clara #FDFBF7 e
  brilho de impacto radial a cada toque.
- Turno do Tico: anel #8E7CC3; turno da criança: anel #F4B942. Sem outros elementos na tela —
  foco total no objeto (reduz distratores, princípio do arranjo de ambiente ESDM).

ILUSTRAÇÕES E ASSETS
- Instrumentos em SVG flat com 2–3 estados (repouso, vibração de impacto).
- Áudio REAL de percussão (Freesound CC0: tambor, chocalho, pandeiro, xilofone) + vocalizações
  narradas ("tum-tum-tum!", "chá-chá-chá!") — a narração rítmica é núcleo do protocolo.
- Zonas de toque invisíveis: centro e borda do tambor com timbres diferentes (como o instrumento real).

FÍSICA E ANIMAÇÕES
- Impacto com squash-and-stretch (scaleY 0.92→1.05→1, 200ms) + ondulação radial na pele do tambor +
  partículas de "som" (ondas concêntricas discretas). Vibração proporcional à força do toque.
- Tico executa ações com animação de braço sincronizada ao som (precisão < 50ms — usar Web Audio
  clock, não setTimeout, para o ritmo ser musicalmente estável).

LÓGICA E REGRAS (espelhando o protocolo Denver)
1. FASE 1 — A criança modela: em "turno livre", tudo que ela fizer o Tico imita + narra. Sem erro
   possível. Serve para engajar e captar ações do repertório.
2. FASE 2 — O adulto modela: Tico executa ação familiar → "faz igual" → detecção por tolerância
   (ritmo ±30%, contagem exata de toques, zona correta) → acerto: narração + celebração + volta ao
   turno livre (o reforço natural É voltar a brincar livremente, como manda o protocolo).
3. Sem imitação em 5s → ajuda imediata: N1 repete o modelo; N2 narra mais devagar com destaque
   visual (a zona-alvo pulsa no ritmo); N3 modo "sombra" (o padrão aparece como fantasmas que a
   criança "cobre" com os toques — equivalente digital da ajuda física guiada).
4. Critério de progresso do próprio protocolo: 8–10 ações independentes com >= 80% de acerto →
   Painel sugere introduzir ações novas (fase de "ação nova modelada pelo adulto").
5. Turnos curtos (modelo → imitação → livre) em ciclos de 60–90s; sessão de 8 ciclos.

MÉTRICAS ESPECÍFICAS
- Ações imitadas independentes (contagem direta — a meta do protocolo), % de imitação correta por
  ação e por sessão, latência até iniciar a imitação, nº de modelos repetidos necessários, tempo em
  turno livre (engajamento), precisão rítmica média. Gráfico: ações independentes acumuladas rumo
  à meta 8–10, e % de imitação correta por sessão.
```

---

## 6. Jogos de grupo e complementares

---

### JOGO 11 — Siga o Mestre (Simon Says digital)
**Origem física:** o clássico "Siga o Mestre / Simon Diz" usado em ABA para seguir instruções, imitação motora grossa e controle inibitório — a criança só executa a ação se o comando começar com "o mestre mandou". Funciona muito bem com adolescentes em grupo.

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o jogo "SIGA O MESTRE" — versão digital do Simon Says para treino de instruções e inibição.

OBJETIVO
- Um personagem-mestre (animado) executa e/ou verbaliza comandos: "O MESTRE MANDOU tocar a cabeça!"
  → a criança executa tocando no pictograma correspondente na tela (ou imita fisicamente, com
  confirmação do adulto). Se o comando NÃO começar com "o mestre mandou", a criança deve FICAR PARADA
  (não tocar em nada) — esse é o treino de controle inibitório.
- Fases: F1 só comandos "mandou" (instruções simples de 1 passo) → F2 mistura com pegadinhas →
  F3 instruções de 2 passos ("toque a cabeça E bata palmas") → F4 modo veloz (adolescentes, com
  tempo decrescente para responder).

FRONTEND
- Mestre no topo, grade de 4–8 pictogramas de ações (tocar cabeça, bater palmas, pular, girar,
  cruzar os braços, sentar, levantar a mão, fazer careta) na base.
- Placar de sequência (quantos comandos certos seguidos) e "modo grupo" (até 4 jogadores locais,
  cada um com uma cor/zona de resposta no tablet).

DESIGN, CORES E TIPOGRAFIA
- Fundo #EEF3F8; mestre em destaque central; pictogramas com fundo branco e borda grossa.
- Pegadinha NÃO muda de cor (seria pista visual indevida) — a discriminação deve ser auditiva/verbal,
  como no jogo real. Feedback de acerto #7BC47F; erro de inibição: feedback neutro ("Ops! O mestre
  não mandou!") sem tom punitivo.
- Versão TEEN: mestre "streamer/apresentador" com visual mais maduro, comandos com vocabulário
  adolescente e leaderboard de sequência.

ILUSTRAÇÕES E ASSETS
- Mestre em SVG com 8 poses de ação (cruzamento com os pictogramas de resposta).
- Pictogramas de ações: ARASAAC. Sons: sino de comando, "uh-oh" cômico nas pegadinhas.

FÍSICA E ANIMAÇÕES
- Mestre anima a ação em loop curto (2 repetições); pictograma tocado com squash; rodada de
  pegadinha: os pictogramas "fogem" levemente do dedo (translate 8px) — reforçando o "não toque!".
- Modo veloz: barra de tempo decrescente animada.

LÓGICA E REGRAS
1. Comando válido → tocar o pictograma correto dentro do tempo (configurável 3–10s).
2. Pegadinha → NÃO tocar em nada por 3s = acerto de inibição (registrado separadamente: "resposta
   inibida correta" — métrica de controle inibitório).
3. Ajudas: N1 pictograma-alvo pulsa; N2 mestre repete mais devagar; N3 seta para o pictograma.
4. Sequência de 10 acertos → celebração e subida de fase sugerida.

MÉTRICAS ESPECÍFICAS
- Acertos de execução × acertos de inibição (separados!), latência, fase alcançada, sequência máxima,
  tipos de comando com mais erro (1 passo × 2 passos). Gráfico: inibição correta % por sessão.
```

---

### JOGO 12 — Dança do Congelar (Freeze Dance)
**Origem física:** música toca, todos dançam; música para, todos congelam como estátuas. Usado em ABA para escuta, regulação motora e transição entre movimento e quietude — e em ESDM como rotina sensório-social com música.

```text
[COLAR O BLOCO GLOBAL PADRÃO AQUI]

Crie o jogo "DANÇA DO CONGELAR" — Freeze Dance digital para escuta e regulação motora.

OBJETIVO
- Música animada toca e personagens dançam na tela; a criança toca/arrasta na tela "fazendo o
  personagem dançar" (ou dança fisicamente junto — modo livre). Em momentos imprevisíveis a música
  PARA e aparece o sinal de "ESTÁTUA" (pictograma + sinal sonoro suave): a criança deve parar de
  tocar na tela (ou congelar o corpo) até a música voltar.
- Se a criança tocar durante o congelamento, o personagem desmonta em risada ("ops, mexeu!") e a
  música volta rapidinho — sem punição, só feedback natural engraçado.

FRONTEND
- Cena única: palco com 1–3 personagens dançarinos; interação por toque em qualquer lugar (cada
  toque = movimento de dança diferente do personagem).
- Sinal de congelamento: pictograma de estátua central + moldura congelada (cristal de gelo nas
  bordas) — sinal visual redundante ao sonoro (dupla codificação, essencial para TEA).
- Duração do congelamento progressiva (3s → 8s) e intervalos aleatórios (15–40s) — imprevisibilidade
  é o coração do jogo físico.

DESIGN, CORES E TIPOGRAFIA
- Palco com holofotes suaves (#F4B942/#F2A0C4/#4A90D9 em opacidade baixa, SEM estrobo); fundo
  #2E3A4E (modo "festa" escuro calmo) com personagens em cores claras e vibrantes.
- Congelamento: paleta esfria para tons de #B8E0F5 (gelo) — mudança gradual de 400ms, nunca abrupta.

ILUSTRAÇÕES E ASSETS
- Personagens em SVG com 6 poses de dança + pose de estátua; transição entre poses por cross-fade.
- Música: 3 faixas curtas livres de direitos (Free Music Archive / Incompetech, licença CC-BY) ou
  loops gerados por Web Audio (batida de percussão alegre). Sinal de "freeze": chime suave.

FÍSICA E ANIMAÇÕES
- Personagens dançam com física de boneco de pano simplificada (rotação de articulações por senoides
  defasadas) reagindo aos toques (impulso na direção do toque); congelamento: todas as animações
  pausam instantaneamente (timeScale 0) — efeito visual de "estátua".
- Confete de notas musicais a cada congelamento bem-sucedido.

LÓGICA E REGRAS
1. Congelamento correto = zero toques durante o sinal (ou, no modo físico, confirmação do adulto).
2. Ajudas: N1 contagem regressiva visual do congelamento; N2 voz "congelou... espera..."; N3 o
   tablet bloqueia toques durante o sinal (modo apoio total, com fading).
3. Progressão automática de dificuldade: congelamentos mais longos e frequentes conforme o sucesso.
4. Sessão: 3 faixas de ~60–90s; encerramento com "última dança" anunciada (previsibilidade de fim).

MÉTRICAS ESPECÍFICAS
- Congelamentos corretos × tentados (% de regulação), toques durante o sinal (impulsividade motora),
  duração máxima de congelamento alcançada, tempo de retomada após a música voltar. Gráfico:
  % de congelamento correto por sessão.
```

---

## 7. Adaptações para adolescentes (aplicável a todos os jogos)

| Dimensão | Crianças | Adolescentes |
|---|---|---|
| Estética | Personagens fofos, cores primárias, fanfarras | Visual "app de verdade" (flat sóbrio, dark mode), feedback discreto, sem estética infantil |
| Conteúdo | Animais, alimentos, brinquedos | Situações sociais reais: escola, amizades, grupos, trabalho, transporte, dinheiro, redes sociais |
| Reforço | Celebração animada + personagem | Pontos, sequências (streaks), desbloqueio de níveis, ranking próprio (nunca comparativo entre alunos sem consentimento) |
| Linguagem | Frases de 1–3 palavras | Instruções completas, humor leve, vocabulário jovem |
| Autonomia | Adulto configura tudo | Adolescente escolhe avatar, tema e metas junto ao terapeuta (autodeterminação) |
| Métricas | Coletadas pelo terapeuta | Painel compartilhado: o adolescente vê o próprio progresso (autogerenciamento) |

---

## 8. Repositórios e recursos de assets (referência rápida)

| Recurso | O que oferece | Licença | Uso nos jogos |
|---|---|---|---|
| **ARASAAC** (arasaac.org) | Milhares de pictogramas AAC em pt-BR | CC BY-NC-SA 4.0 | Jogos 1, 2, 3, 4, 6, 11 |
| **OpenMoji** (openmoji.org) | Emojis/símbolos open source consistentes | CC BY-SA 4.0 | Todos |
| **Kenney.nl** | Game assets 2D (UI, botões, cenários) | CC0 | Cenários e UI |
| **OpenGameArt.org** | Arte e sons variados | CC0/CC-BY | Extras |
| **unDraw / Humaaans** | Ilustrações flat de pessoas e cenas | Uso livre | Trilha TEEN do Jogo 6 |
| **Freesound.org** | Efeitos sonoros | CC0/CC-BY | Todos |
| **Free Music Archive / Incompetech** | Músicas | CC-BY | Jogo 12 |
| **Google Fonts** | Nunito, Atkinson Hyperlegible, Inter | OFL | Tipografia |

**Bibliotecas de física/animação:** Framer Motion (arraste, springs, gestos), Matter.js (física 2D real — Jogos 7 e 8), canvas-confetti (reforço), Web Audio API (sons precisos — Jogo 10), Recharts (gráficos do Painel do Terapeuta).

---

## 9. Checklist de validação terapêutica (após gerar cada jogo)

1. A regra terapêutica central do jogo físico está preservada? (ex.: a pausa de espera nas Bolhas; o turno de 1 bloco na Torre; a entrega na "mão" no PECS)
2. O reforço é imediato (< 1s) e o erro é neutro (sem punição)?
3. A hierarquia de ajudas N0–N3 e o fading automático funcionam?
4. Toda tentativa é registrada com nível de ajuda e latência? O CSV exporta corretamente?
5. Sem flashes, sem sons assustadores, alvos de toque ≥ 64px, funciona offline?
6. O Painel do Terapeuta mostra % de acerto, independência e tendência por sessão?
7. Um BCBA/terapeuta ESDM revisou a fidelidade do protocolo antes do uso clínico?

> **Aviso importante:** estes recursos digitais são ferramentas de apoio à intervenção conduzida por profissionais (BCBA, terapeutas ESDM certificados, fonoaudiólogos, psicopedagogos) e famílias orientadas. Não substituem avaliação, planejamento individualizado nem supervisão clínica.
