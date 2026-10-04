# APRUMO — GLOBAL RESPONSIVE AUDIT & VIEWPORT MATRIX

**Versão:** 2.0.0  
**Data:** Outubro de 2026  
**Resoluções Auditadas:** Mobile (320px, 375px, 390px, 430px), Tablet (768px, 834px, 1024px), Desktop (1280px, 1440px, 1920px).

---

## 1. Diretrizes por Categoria de Dispositivo

### 1.1 Mobile (Smartphones: 320px a 430px)
- **Safe Area Insets:** Respeitar integralmente `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)` em barras de navegação fixas e painéis inferiores.
- **Empilhamento de Grids:** Grids com 2 a 4 colunas no desktop transformam-se estritamente em coluna única (`grid-template-columns: 1fr`).
- **Eliminação de Scroll Horizontal:** Tabelas clínicas extensas convertem-se em cartões verticais expansíveis (`AccordionCard`).
- **Modais para Bottom Sheets:** Janelas modais que ocupam mais de 70% da tela transformam-se em painéis inferiores deslizantes com alça de arraste visual (`.ap-sheet`).
- **Barra de Navegação Inferior (Thumb Zone):** As principais ações do aplicador e supervisor ficam concentradas no terço inferior da tela, acessíveis confortavelmente com o polegar.

### 1.2 Tablet (768px a 1024px — Prioridade Primária do Aprumo)
- **Não Tratar Tablet como Desktop Reduzido:** O tablet é o instrumento de trabalho ativo em consultório, escola e domicílio.
- **Áreas de Toque Expandidas:** Todos os botões de resposta e dicas têm no mínimo 48px de altura e espaçamento mínimo de 8px entre alvos vizinhos para prevenir toques involuntários.
- **Alternativas a Arrastar (Drag-and-Drop):** Todo componente de arrastar (como pareamento ou ordenação de rotina) oferece a alternativa equivalente via toque único sequencial ("Toque no item → Toque no destino").
- **Orientação Mista (Retrato e Paisagem):** Em orientação retrato (vertical), ferramentas laterais como o Quadro de Fichas ou a lista de alvos passam para a base da atividade, mantendo o estímulo visual no centro sem distorção.

### 1.3 Desktop & Monitores Grandes (1280px a 1920px)
- **Largura Máxima Confortável (`--ap-content-max: 1360px`):** Evitar dispersão de texto e cartões em telas ultra-largas.
- **Comprimento de Linha de Leitura:** Formulários e notas de prontuário mantêm largura máxima entre 650px e 800px para garantir leitura ágil e ergonômica.
- **Suporte Híbrido:** Garantir suporte concomitante a atalhos de teclado (Ex.: Teclas 1, 2, 3 no SessionRunner, Ctrl+K no Command Palette) e clique do mouse com estados hover estáveis (sem layout shifts).

---

## 2. Matriz de Auditoria por Superfície

| Superfície | Mobile (390px) | Tablet (768px/834px) | Desktop (1440px) | Adaptações Implementadas / Necessárias |
|---|---|---|---|---|
| **Landing Page** | Menu móvel drawer, CTA fixo no rodapé | Grid equilibrado de 2 colunas | Hero visual interativa, menu superior aberto | Desdobramento das seções em páginas dedicadas para navegação limpa. |
| **Dashboard Pro (`/app`)** | Métricas em 2 colunas, atalhos horizontais | Grid de 3 colunas | Visão completa com timeline e revisões | Cartões de estatística compactos com números tabulares. |
| **Lista de Casos (`/app/casos`)** | Cartões empilhados com status | Grade responsiva de 2 colunas | Grade de 3 colunas ou tabela densa | Filtros rápidos por modelo ABA/Denver acessíveis por toque. |
| **Plano Individual (`/plano`)** | Accordion por objetivo | Árvore hierárquica navegável | Painel duplo: metas e detalhes | Botão de aprovação de versão visível e protegido contra cliques acidentais. |
| **SessionRunner (`/sessao/:id`)** | Seletor de alvos superior, botões de resposta gigantes | Coluna de alvos retrátil, centro focado | Alvos à esquerda, tentativa no centro, reforçadores à direita | Undo de 5s sempre ancorado na base da tela sem cobrir botões. |
| **ChildShell (`/crianca/:id`)** | Modo tela cheia, fichas na base | Fichas laterais ou inferiores adaptáveis | Moldura centralizada com proporção 4:3 ou 16:9 | Saída protegida por gesto prolongado (Hold de 1.2s) para evitar saídas acidentais. |
| **Portal da Família (`/familia`)** | Navegação por abas na base, cartões simples | Grid de 2 colunas com cards acolhedores | Layout acolhedor com histórico e orientações | Linguagem acessível, botões de registro de tarefas domésticas de toque fácil. |
| **Resource Studio (`/recursos`)** | Lista vertical de ferramentas, filtros deslizantes | Grid de ferramentas interativas | Catálogo completo com preview e filtros laterais | Modal de teste em tela cheia com botão de fechar proeminente. |
