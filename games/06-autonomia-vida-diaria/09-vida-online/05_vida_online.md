# PROMPT MESTRE — VIDA ONLINE

## PAPEL
Atue como uma equipe sênior de game design narrativo, UX adolescente, engenharia React/TypeScript, arquitetura de state machines, segurança digital, acessibilidade, narrativa interativa, design de interface e QA.

Crie um jogo web independente chamado **Vida Online**.

Faixa: **12 a 17 anos**.

O jogo simula situações digitais cotidianas em um ambiente fictício:
- mensagens;
- grupos;
- perfis;
- jogos online;
- convites;
- pressão social;
- golpes;
- privacidade;
- exposição de imagem;
- conflitos;
- limites;
- cyberbullying;
- comunicação.

Não usar redes sociais reais.
Não copiar WhatsApp, Instagram, TikTok, Discord ou qualquer interface protegida.

Criar um sistema visual autoral.

---

## OBJETIVO DE DESIGN
O jogo precisa parecer uma narrativa interativa contemporânea, não uma cartilha.

O jogador deve sentir:
- curiosidade;
- consequência;
- tensão leve;
- escolha;
- agência;
- descoberta;
- progressão.

Evitar moralismo.

Múltiplas respostas podem ser aceitáveis.

---

## STACK
- React;
- TypeScript;
- Vite;
- XState;
- Zustand;
- Zod;
- Motion;
- Dexie/IndexedDB;
- Howler/Web Audio;
- React Router opcional.

Não usar Phaser porque o núcleo é interface narrativa.

---

## “FÍSICA” DE INTERAÇÃO
Não usar rigid-body physics.

Criar física de interface:
- spring;
- inertia;
- swipe;
- drag;
- card stack;
- notification bounce;
- typing pulse;
- vibration/haptic opcional.

Motion:
- stiffness 260;
- damping 28;
- movimentos curtos.

Respeitar reduced motion.

---

## FANTASIA
O jogador possui um dispositivo fictício chamado **Nexo**.

Apps fictícios:
- Pulse: mensagens;
- Loop: comunidade;
- PlayHub: jogos;
- Vault: privacidade;
- Mailbox: e-mail;
- Feed: mural.

O jogador acompanha uma semana fictícia.

---

## CORE LOOP
**RECEBER SITUAÇÃO → LER CONTEXTO → INVESTIGAR → ESCOLHER → OBSERVAR CONSEQUÊNCIA → REFLETIR/REVER**

Nem toda escolha tem uma resposta “certa”.

---

## CAMPANHAS

### 1. Grupo Novo
Entrar num grupo.

Temas:
- apresentação;
- piada;
- exclusão;
- spam;
- limites.

### 2. Pessoa Desconhecida
Mensagem de perfil desconhecido.

### 3. Foto
Pedido de imagem.

### 4. Link
Link suspeito.

### 5. Jogo Online
Pressão para compartilhar conta.

### 6. Briga no Grupo
Mal-entendido.

### 7. Convite
Evento fora da internet.

### 8. Boato
Mensagem não verificada.

### 9. Conta de Amigo
Possível invasão.

### 10. Pressão Social
“Todo mundo está fazendo.”

---

## SISTEMA DE ESCOLHA
Cada cena pode oferecer:
- 2–5 respostas;
- resposta livre opcional;
- investigar;
- pedir contexto;
- não responder;
- bloquear;
- denunciar;
- falar com adulto de confiança;
- sair do grupo;
- negociar limite.

Nunca fazer a opção “segura” sempre parecer óbvia.

---

## CONSEQUÊNCIAS
Consequências devem ser plausíveis e graduadas.

Não usar punição dramática automática.

Exemplo:
Responder mensagem vaga pode levar a:
- esclarecimento;
- confusão;
- insistência;
- encerramento.

---

## INDICADORES
Não usar score moral “bom/mau”.

Usar quatro indicadores neutros:

- privacidade;
- clareza;
- limites;
- confiança.

Eles não precisam estar sempre visíveis.

Podem aparecer no resumo.

---

## PERSPECTIVA
Alguns capítulos devem permitir ver a mesma conversa por duas pessoas.

Exemplo:
Jogador vê:
“ok”

Depois descobre contexto da outra pessoa:
- estava ocupada;
- não estava brava.

Isso trabalha inferência sem afirmar leitura mental.

---

## DETETIVE DIGITAL
Minijogos:

### Link
Examinar URL fictícia.

### Perfil
Comparar sinais.

### Print
Observar edição/contexto faltante.

### Senha
Montar senha forte fictícia.

### Permissões
Escolher quais permissões um app precisa.

### Privacidade
Configurar perfil.

---

## SIMULAÇÃO DE CHAT

Layout autoral:

```text
┌─────────────────────────────────────────┐
│ NEXO             Grupo: Trabalho       │
│                                         │
│        mensagens                        │
│                                         │
│                                         │
│ [ opções rápidas ]                      │
│ [ campo de resposta ]              ➤    │
└─────────────────────────────────────────┘
```

Usar:
- balões arredondados;
- cores próprias;
- ícones autorais.

---

## DIGITAÇÃO
Simular typing indicator.

Tempo:
- 0.8–2.5 s;
- nunca excessivo.

Permitir acelerar.

---

## MODAIS

### Perfil
- apelido;
- avatar;
- privacidade.

### Contexto
Mostra informações já conhecidas.

### “Pensar Antes”
Opcional:
- quem está pedindo?
- o que está sendo pedido?
- preciso responder agora?
- existe risco?

### Configuração
- som;
- texto;
- animação;
- contraste;
- velocidade.

### Resumo de Episódio
Mostrar:
- o que aconteceu;
- alternativas possíveis;
- estratégias usadas;
- opção de refazer.

Nunca: “Você errou”.

---

## PROGRESSÃO

### Fase 1
Mensagens diretas simples.

### Fase 2
Grupo.

### Fase 3
Ambiguidade.

### Fase 4
Privacidade.

### Fase 5
Pressão.

### Fase 6
Golpe.

### Fase 7
Conflito.

### Fase 8
Múltiplas conversas.

### Fase 9
Dilema.

---

## MECÂNICA DE TEMPO
Algumas mensagens chegam “depois”, dentro da sessão.

Não usar notificações reais fora do jogo por padrão.

O relógio é ficcional.

Não criar obrigação diária.

---

## ENGAGEMENT
Usar:
- capítulos;
- contatos;
- avatar;
- temas;
- stickers fictícios;
- desbloqueio de wallpapers;
- escolha de layout;
- mistérios curtos;
- plot twists leves;
- mensagens inesperadas;
- consequências persistentes.

Sem monetização.

---

## DIREÇÃO DE ARTE
Estilo:
**Contemporary Youth UI + Graphic Novel Accents**.

Nada infantilizado.

Paleta:
- grafite #20252C
- slate #344052
- azul #536DFE
- turquesa #45B5A4
- lilás #8B75D7
- coral #E16C68
- off-white #F6F6F3

Modo claro e escuro.

---

## PERSONAGENS
Criar elenco:
- colegas;
- amigos;
- familiar;
- professor;
- moderador fictício;
- desconhecido.

Cada personagem:
- estilo de escrita;
- tempo de resposta;
- vocabulário;
- contexto;
- limites.

Não associar comportamento negativo a grupo social específico.

---

## NARRATIVE ENGINE

```ts
type StoryNode = {
  id: string
  messages: Message[]
  choices: Choice[]
  conditions?: Condition[]
  effects?: Effect[]
}
```

State:
- relationships;
- knownFacts;
- boundaries;
- privacySettings;
- chapterFlags.

---

## XSTATE
Estados:

```text
BOOT
→ HOME
→ EPISODE
→ RECEIVE
→ READ
→ CHOOSE
→ CONSEQUENCE
→ REFLECT
→ NEXT
→ SUMMARY
```

Subestados:
- investigate;
- profile;
- report;
- block;
- context.

---

## CONTEÚDO
Criar pelo menos:
- 12 episódios;
- 60 cenas;
- 150 mensagens;
- 80 escolhas;
- 20 situações ambíguas;
- 10 golpes fictícios;
- 10 conflitos sociais.

---

## SEGURANÇA
O jogo deve ensinar:
- nunca expor dados reais;
- não compartilhar senha;
- cuidado com imagens íntimas;
- pedir ajuda em situações de risco;
- bloquear/denunciar;
- verificar informação;
- reconhecer coerção.

Não solicitar dados pessoais reais do jogador.

---

## PRIVACIDADE
Nenhuma conversa real.
Nenhum contato real.
Nenhum upload obrigatório.
Nenhuma integração com redes.

Dados locais.

---

## FRONTEND

```text
src/
  app/
  phone/
    apps/
      pulse/
      loop/
      vault/
      playhub/
  narrative/
    engine/
    chapters/
    conditions/
  state/
  ui/
    modals/
    settings/
  audio/
  save/
  tests/
```

---

## COMPONENTES
- DeviceShell;
- ChatThread;
- MessageBubble;
- TypingIndicator;
- ChoiceTray;
- ContextDrawer;
- ProfileCard;
- PrivacySettings;
- EpisodeSummary;
- NotificationCenter;
- FakeBrowser;
- ReportFlow.

---

## ACESSIBILIDADE
- fonte ajustável;
- dyslexia-friendly option;
- alto contraste;
- modo escuro;
- reduced motion;
- leitura em voz alta;
- velocidade de mensagens;
- pausar typing;
- não usar somente cor;
- keyboard navigation;
- screen reader friendly.

---

## ÁUDIO
Muito discreto.

- mensagem;
- envio;
- notificação;
- capítulo;
- tensão leve.

Sem sons viciantes repetidos.

---

## SAVE
Salvar:
- capítulo;
- escolhas;
- fatos;
- contatos;
- temas;
- configurações.

Permitir resetar história.

---

## TESTES
Unit:
- branching;
- condition;
- effects;
- save;
- restore.

Playwright:
- episódio completo;
- bloquear;
- denunciar;
- voltar;
- teclado;
- mobile;
- dark mode.

Content QA:
- nenhuma escolha única “moral” em dilemas;
- cenários sem victim blaming;
- linguagem adolescente natural;
- nenhum dado real solicitado.

---

## CRITÉRIOS DE ACEITE
1. Não se parece com aula.
2. 12 episódios.
3. Branching real.
4. Consequências persistentes.
5. Múltiplas respostas plausíveis.
6. Não copia rede real.
7. Dark/light.
8. Mobile/desktop.
9. Keyboard accessible.
10. Dados locais.
11. Sem notificações reais obrigatórias.
12. Sem dark patterns.

Entregue código, conteúdo JSON, testes, design tokens, assets autorais, README e build.
