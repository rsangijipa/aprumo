# Aprumo — Verificação de implementação e plano detalhado (v2)

**Data:** 04/10/2026
**Base:** commit `277191d` (`master`), comparado com as duas especificações em `docs/`:
- **Doc A:** `PsicoPlay_Especificacao_Plataforma_Clinica_2026.docx`
- **Doc B:** `Especificacao_Plataforma_v1.docx`

Este documento substitui o plano de fases da v1 como guia de execução. O [PLANO_IMPLEMENTACAO_APRUMO.md](../PLANO_IMPLEMENTACAO_APRUMO.md) continua valendo para as decisões de consolidação entre os dois documentos.

## Legenda

| Símbolo | Significado |
|---|---|
| ✅ | Feito: implementado e com teste ou verificação no navegador |
| 🟡 | Parcial: existe, mas falta parte do que a especificação pede |
| ⛔ | Falta: não implementado |
| ⚠️ | Divergência ou risco: implementado de forma diferente da especificação; precisa de decisão ou correção |

---

## Parte 1 — O que foi implementado e o que falta

### 1.1 Visão por módulo (Doc B §6, M1–M14)

| Módulo | Status | O que existe | O que falta |
|---|---|---|---|
| **M1. Identidade, organização e consentimento** | 🟡 | Tabelas e RLS: `organizations`, `organization_memberships`, `case_team_members`, `consents` versionados e revogáveis, `audit_log` imutável (0001–0002, 13 testes). Login com senha + TOTP pronto no código (`data/supabase.ts`). Consentimentos por finalidade no cadastro (`NewCase`). | Auth real testado contra o Supabase; chaves de acesso (passkeys); bloqueio progressivo; modo “aparelho da clínica”; recuperação com encerramento das outras sessões; convite e primeiro acesso da família; tela de consentimentos com revogação; unidades. |
| **M2. Caso e prontuário** | 🟡 | `children`, `cases`, `record_addenda`, `case_timeline_events`, guarda de 20 anos (bloqueio de exclusão). UI: ficha, linha do tempo na visão geral, encerramento de sessão com nota obrigatória. | **Anamnese estruturada (UI)**; adendos (UI); eventos de contexto criados pelo profissional (medicação, férias); encerramento do caso (alta, interrupção, encaminhamento); aba “Linha do tempo” dedicada. |
| **M3. Avaliação** | 🟡 | Pré-requisitos digitais (UI + regra no banco); perfil sensorial (UI → adaptação automática). | Registro de instrumentos licenciados (escores, licença, SATEPSI); sondas de linha de base com a regra “≥ critério ⇒ já presente”; avaliação funcional descritiva (entrevistas, gráfico de dispersão, hipótese com grau de confiança). |
| **M4. Planejamento (PEI)** | 🟡 | Editor ABA (objetivo → programa a partir de modelo → alvo com estímulo); editor Denver (objetivo trimestral + passos); aprovação do plano; modelo único no banco; `change_target_phase` com justificativa. | ⚠️ **Versionamento**: editar um plano aprovado hoje altera a versão vigente (a spec exige nova versão e preserva a interpretação histórica). Editor de alvo em etapas, que impede alvo incompleto (Doc B §10.3); critério por alvo editável e versionado na UI; plano de generalização por alvo; esquema de reforçamento por alvo; mudança de fase manual (hoje só pelo alerta); bibliotecas da organização (hierarquias, critérios, conjuntos de estímulos, definições) com UI; transição de modelo (UI). |
| **M5. Execução de sessão** | 🟡 | ABA: registro em 2 toques, atalhos de teclado, ordem sugerida (R12), ABC, plano de manejo ao registrar, reforçadores, nota obrigatória, outbox cifrada offline. Denver: rotina, fases, quem iniciou, pontuação por passo e intervalo. Atividade no tablet com fichas e agenda. | ⛔ **Latência** na mesa (hoje `latencyMs: null`); ⛔ **desfazer por 5 s**; ⛔ **pausa** na tela ABA; ⛔ blocos tipados (DTT/NET/cadeia/intervalo); ⛔ **NET** (`opportunity_records`) e **encadeamento** (`chain_step_records`) na UI; ⛔ comportamento por **duração**, **latência** e **intervalo**; ⛔ deslizar para trocar alvo; ⛔ **dois aparelhos** pareados por QR com espelho do jogo; ⛔ folha impressa com QR; ⚠️ pontuações Denver não chegam às projeções nem aos gráficos (os gráficos Denver usam dados fictícios). |
| **M6. Reforçadores** | 🟡 | Inventário, MSWO presencial pelo toque, bloqueio do MSWO digital sem pré-requisito, validade de 7 dias, saciação (R10), fichas e tela como reforçador (no ambiente infantil). | MSWO **digital** (figuras/vídeos na tela da criança); avaliação pareada e operante livre; esquemas por alvo (FR/VR/intervalo); atalho do quadro de fichas na tela de aplicação; entregas persistidas no banco via sync (tabela existe, mapeamento parcial). |
| **M7. Biblioteca de recursos** | 🟡 | Catálogo com manifestos clínicos (3 jogos + 2 recursos); página Recursos. | 22 conceitos de jogo restantes; 13 recursos novos (§9.4); materiais imprimíveis (§9.5); acervo de estímulos com fotos (Storage) e licenças (§9.6); histórias sociais; vídeo-modelação; pipeline de publicação em 7 etapas (§9.8). |
| **M8. Comportamento** | 🟡 | Definições com topografia, exemplos e não exemplos, função hipotética, risco; plano de manejo e protocolo de segurança; frequência por sessão. | Medidas de duração, latência e intervalo (parcial, total, momentânea) com cronômetro; registro de incidente de risco com notificação; gráfico de dispersão por horário e atividade; versionamento da definição após uso. |
| **M9. Análise e decisão** | 🟡 | Gráfico de alvo (fases, critério, independente vs. com dica, sondas, contexto, CDC, tabela acessível); R1–R15 no aparelho; painel de alertas com aceitar/dispensar justificado; projeções SQL (`fact_*`) e `decision_alerts` com `decide_alert` no banco. | **Motor de regras no servidor** (Edge Function após o sync); barras empilhadas de distribuição de dicas (§10.6); marcadores por canal (natural, casa); “adiar” alerta; análises cruzadas (§8.6); dados agregados e pesquisa com supressão (n < 5). |
| **M10. Supervisão e fidelidade** | ✅ / 🟡 | Fidelidade com checklist derivado do procedimento; concordância tentativa a tentativa; horas; competências e alerta de competência faltante. | Concordância **por intervalo**; observação por vídeo com upload; trilha de treino BST com registro de competência; agendamento de amostras de concordância (20% dos casos/mês). |
| **M11. Família** | 🟡 | Portal com progresso em linguagem acessível, tarefas com registro, orientações com leitura, documentos finais, validação social. Banco: `family_progress`, `home_tasks` etc. com RLS (10 testes). | Convite, primeiro acesso e consentimentos (§10.10); navegação em 5 abas (Início, Progresso em trilha, Tarefas, Orientações, Mensagens) (§10.1); resumo semanal; vídeos de orientação; diário; fidelidade parental; mensagens com política de resposta. |
| **M12. Documentos** | 🟡 | Rascunho com dados do período, análise do profissional, versão final com registro no conselho e hash, impressão em PDF pelo navegador, compartilhamento com a família. | Modelos da Res. CFP 06/2019 (relatório, laudo, parecer, declaração, atestado); exportação **Word**; PDF gerado no servidor com gráficos; exportação de dados (CSV/JSON + dicionário); gráfico compartilhado com explicação. |
| **M13. Portal infantil e juvenil** | 🟡 ⚠️ | Moldura supervisionada da sessão (agenda, fichas, canto do adulto, limite de bloco); espaço da criança/adolescente (jogos liberados, estrelas de esforço, álbum, prancha, calma, modo teen). | ⚠️ **Segurança da entrada**: a spec diz que a criança não faz login e que só um adulto autenticado abre a sessão (`child_sessions`, token). Hoje basta o código e uma caixa de confirmação. ⚠️ **Navegação livre**: o Doc B veda catálogo navegável. O espaço mostra só itens liberados (decisão do usuário), mas precisa de regra explícita. Faltam: saída por toque longo **+ PIN do adulto**; Timer Visual de Transição; faixa 9–12 (metas da sessão visíveis, autoavaliação); Meu Dia (13+); prancha com Mulberry, OBF e registro de mando. |
| **M14. Administração** | ⛔ | Página Equipe (convites de profissionais, vínculos por caso) e Configurações. | Onboarding da organização (§10.11); unidades; licenças de instrumentos; **auditoria (UI)**; padrões da organização (critérios, hierarquias, limites de tela); navegação de gestão separada da clínica. |

### 1.2 Backend, segurança e plataforma

| Item | Status | Observação |
|---|---|---|
| Migrações 0001–0007 com RLS, triggers de modelo único, imutabilidade, idempotência | ✅ | 23 testes em Postgres (PGlite). Falta aplicar num projeto Supabase real. |
| Camada de dados real (ler e escrever no Supabase) | ⛔ | O app usa `data/seed.ts` + store em memória. O envio da outbox existe (`supabaseSender`), mas os formatos dos registros ainda são os da demonstração. |
| Edge Functions (regras, projeções, ingestão genérica, PDF, convites) | ⛔ | Nenhuma escrita. |
| Storage (fotos de estímulos, vídeos, documentos) | ⛔ | Buckets e políticas por caso. |
| Sessão infantil por token (`open_child_session`) | 🟡 | Existe no banco, com limite de idade; não está ligada à UI. |
| Auditoria de leitura | 🟡 | RPC `audit_read` existe; a UI apenas registra no console. |
| Criptografia de colunas sensíveis (notas, anamnese) | ⛔ | Previsto no Doc B §12.5 (chaves fora do banco). |
| PWA: outbox cifrada, service worker de arquivos | ✅ / 🟡 | Falta cache cifrado do caso do dia, aviso de atualização e drenagem antes de nova sessão. |
| CI (lint, typecheck, testes, build, audit) | ✅ | GitHub Actions. |
| Testes E2E (Playwright + axe) | ⛔ | Combinado para o final. |
| Observabilidade sem dado clínico | ⛔ | Logs técnicos, erros e métricas de sync. |
| IA assistiva e FHIR | ⛔ | Fase posterior. |

### 1.3 Página pública e telas de acesso (Doc B §10.9–10.11)

| Item | Status | Falta |
|---|---|---|
| Página principal séria, sem triagem nem ranking | ✅ | Seções “Para o aplicador”, “Para a supervisão” e “Para a família” com **capturas reais**; página dedicada de Fundamentação e de Privacidade; **rodapé com responsável técnico, número no conselho, CNPJ e canal do encarregado de dados**; meta de LCP < 2,5 s medida. |
| Entrar com três portas | 🟡 ⚠️ | A spec pede “Sou profissional”, “Sou responsável por uma criança” e uma terceira, discreta: “Abrir sessão de uma criança neste aparelho”, **com adulto autenticado**. Faltam mostrar/ocultar senha, passkeys, “aparelho da clínica” e erro de senha junto ao campo. |
| Primeira experiência (organização, profissional, primeiro caso, família) | 🟡 | Existe o assistente do primeiro caso. Faltam o onboarding da organização e do profissional (trilha com casos de demonstração) e o tour da família. |

### 1.4 Lacunas críticas (corrigir antes do piloto)

1. **Entrada da criança sem adulto autenticado.** Ligar ao `open_child_session`: token temporário, expiração, revogação e PIN só para o adulto retomar ou sair.
2. **Plano aprovado editável sem nova versão.** Viola “alterar critério hoje não muda a interpretação histórica” (Doc A §41).
3. **Latência não medida na mesa.** Os indicadores de latência e as regras que dependem dela ficam sem dado.
4. **Sem desfazer.** O erro de toque vira registro imutável; a spec prevê desfazer por 5 s e, depois disso, adendo.
5. **Dados Denver fora das projeções.** Os gráficos e as regras R14/R15 usam dados fictícios.
6. **Motor de regras só no aparelho.** Os alertas oficiais devem ser gerados no servidor após a sincronização.
7. **Dados de demonstração misturados ao app.** Separar o “caso de demonstração” marcado (§10.11) dos dados reais quando o Supabase for ligado.

---

## Parte 2 — Plano de implementação

As fases seguem a dependência: dados reais e segurança primeiro, depois completar o núcleo clínico, a aplicação, a análise, as superfícies e o catálogo. Cada fase lista especificação, backend, frontend, UI/UX e layout, critérios de aceite e testes. Tamanho relativo: **P** (até 1 semana), **M** (2–3 semanas), **G** (4+ semanas), para um desenvolvedor sênior com revisão clínica.

### F1 — Dados reais, autenticação e retirada dos dados fictícios (G)

**Especificação:** Doc B §12; Doc A §25–26; acesso §10.10. Dados no Brasil (`sa-east-1`). Nenhuma chave de serviço no navegador.

**Backend**
- Projeto Supabase (dev e prod separados; nenhum dado real em dev). Aplicar 0001–0007 e criar `0008_org_defaults.sql` com padrões por organização: hierarquias, critérios e limites de tela.
- Seed só para **demonstração**: um caso ABA e um Denver na organização “Demonstração”, marcados com `is_demo = true` (`0009_demo_flag.sql`) e excluídos de painéis e relatórios reais.
- Edge Function `ingest`: um único endpoint para os lotes da outbox, roteando por tipo (`trial`, `opportunity`, `chain_step`, `behavior`, `denver_step_score`, `token`, `reinforcer_delivery`, `home_task_record`, `clinical_event`). Validação por esquema (Zod compartilhado de `@aprumo/protocol`), quarentena e resposta com os ids persistidos.
- Sessão infantil: `open_child_session` chamado pela UI; nova `resolve_child_session(token)` (security definer) que devolve só o necessário: apelido, faixa etária, adaptação e recursos liberados. A partir da sessão infantil, revogação no “Sair”.
- `audit_read` chamado de fato ao abrir prontuário, nota e documento.

**Frontend**
- `data/repository.ts`: interface única com duas implementações, `DemoRepository` (atual) e `SupabaseRepository`, escolhida por ambiente. Telas usam hooks de leitura (`useCase`, `useTargets`, `useSummaries`…) com **TanStack Query** (cache, revalidação, estados de carregamento e erro).
- Remover `seed.ts` do caminho de produção; mantê-lo apenas no modo demonstração.
- Login real: senha com mostrar/ocultar, erro junto ao campo, TOTP, **passkeys** (WebAuthn via Supabase quando disponível), opção “aparelho da clínica” (sessão curta, sem lembrar usuário, saída por inatividade em 15 min).
- Guarda de rotas por papel: profissional (AAL2), família (AAL1 + segundo fator recomendado) e espaço infantil (token).

**UI/UX e layout:** estados de carregamento com esqueleto (sem spinner de tela inteira após o primeiro carregamento); erro de rede com “tentar de novo”; marca d'água “Demonstração” no caso de demonstração.

**Aceite**
- Profissional da organização A não lê nem enumera a B (já testado no banco; repetir no E2E).
- Retry da mesma tentativa não duplica, contra o Supabase real.
- Espaço infantil não abre sem adulto autenticado.

**Testes:** contrato da Edge Function de ingestão; testes de integração contra o Supabase local do CI (`supabase start` no runner do GitHub, onde há Docker).

### F2 — Núcleo clínico completo (G)

**Especificação:** Doc B M2–M4, §7.3–7.4; Doc A §4 e §29.

**Backend**
- **Versionamento do plano:** editar um plano `active` cria `intervention_plans` v+1 em rascunho (cópia de objetivos, programas e alvos com `source_id`); a aprovação encerra a versão anterior. Critério de domínio já é imutável (nova linha por alteração).
- `anamnesis` (já existe): esquema JSON versionado de seções; colunas sensíveis cifradas (pgsodium ou chave externa via Edge Function).
- `case_timeline_events.kind = 'context'` criado pelo profissional; RPC `add_context_event`.
- `close_case(case, reason, summary)`: alta, interrupção ou encaminhamento, com documento final e início da guarda.
- `instruments` e `instrument_scores` (licença, população, SATEPSI, uso permitido, versão da função de escore) e bloqueio de aplicação fora das condições (Doc A §29.1).
- Regra de linha de base: após 3 sondas, se o desempenho ≥ critério, o alvo é marcado como “já presente” (sugestão ao supervisor, nunca automática).

**Frontend**
- **Editor de alvo em etapas** (sheet de 6 passos): definição → estímulos → procedimento e dicas → correção de erro → critério → generalização e jogos compatíveis. O botão “Salvar” só fica ativo com tudo completo.
- **Mudança de fase manual** no Plano (menu do alvo) com justificativa.
- Abas novas do caso: **Anamnese** (seções sanfonadas, salvamento por seção) e **Linha do tempo** (filtros por tipo, criar evento de contexto, adendos visíveis junto ao original).
- **Bibliotecas** (`/app/bibliotecas`): programas-modelo, hierarquias de dicas, critérios, conjuntos de estímulos, definições de comportamento.
- **Transição de modelo** (só para o responsável técnico): diálogo com justificativa e explicação das consequências.
- **Avaliação** (`/app/casos/:id/avaliacao`): instrumentos licenciados (só estrutura e escores), sondas de linha de base e avaliação funcional descritiva.

**UI/UX e layout:** a árvore do plano em desktop com coluna de detalhe à direita (master-detail); no celular, lista que abre o detalhe em tela cheia.

```
┌ Plano v3 (rascunho de alteração) ───────────── [Descartar] [Enviar para aprovação] ┐
│ ▸ Comunicação funcional                    │ Alvo: “bola” · Linha de base        │
│   ▸ Ouvinte — objetos comuns   DTT · 90%   │ ① Definição  ② Estímulos  ③ Dicas   │
│     ● bola        Aquisição  ▓▓▓░ 2/2      │ ④ Correção   ⑤ Critério   ⑥ Gener.  │
│     ● copo        Aquisição  ▓░░░ 0/2      │ ─────────────────────────────────── │
│   + Programa                               │ [campos da etapa atual]             │
│ + Objetivo                                 │                  [Voltar] [Próximo] │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Aceite**
- Alterar o critério cria nova versão, e as sessões antigas mostram a regra da época no gráfico.
- Alvo incompleto não é salvo.
- Instrumento sem licença válida não pode ser aplicado.

### F3 — Aplicação de sessão completa (G)

**Especificação:** Doc B §10.4–10.5, M5, M8; Doc A §5 e §16.

**Backend**
- `session_blocks` passa a ser usado (DTT, NET, cadeia, digital, rotina Denver, intervalo, comportamento).
- Ingestão de `opportunity_records`, `chain_step_records`, `behavior_events` (início/fim/intervalo) e `denver_step_scores` pela Edge Function `ingest`.
- Projeção `fact_denver_step_session` (view) e uso em R14.
- Pareamento de dois aparelhos: canal Supabase Realtime por `child_session` (o tablet publica eventos do jogo; o celular do profissional publica `SET_PROMPT`, `PAUSE` e `SCORE_TRIAL`). Código curto e QR exibidos no tablet.

**Frontend (aplicação ABA)**
- **Latência:** cronômetro inicia ao tocar “Apresentei” (ou automaticamente após registrar a tentativa anterior) e é gravado com a resposta.
- **Desfazer por 5 s:** barra temporária após cada registro; desfazer remove da outbox se ainda não foi enviado, ou grava `trial_retraction` (adendo) se já foi.
- **Pausa** com motivo opcional; durante a pausa, só notas e observação.
- **Modos por bloco:**
  - **DTT:** a tela atual.
  - **NET:** botão “oportunidade” com iniciativa (criança/adulto), resposta e dica.
  - **Cadeia:** checklist de passos com nível de ajuda por passo.
  - **Comportamento:** toque registra ocorrência; toque longo inicia e encerra duração; modo intervalo com marcação a cada janela.
- Deslizar para trocar de alvo; atalho do quadro de fichas e reforçadores na faixa inferior.
- **Folha impressa com QR:** gera PDF por sessão (alvos, estímulos, colunas de tentativa) e tela de transcrição que lê o QR.
- **Espelho do jogo:** quando o bloco é digital e há dois aparelhos, o cartão do alvo mostra os estímulos apresentados e a escolha da criança em tempo real.

**Frontend (aplicação Denver)**
- Passos associados a rotinas; aviso de intervalo por **vibração** (`navigator.vibrate`), sem som.
- Registro alimenta os gráficos por passo (proporção de intervalos).

**UI/UX e layout (celular, uso com uma mão)**

```
┌ Teo · ABA · 12:04 · ⟳2 · [❚❚] ───────────┐
│ ‹ bola  ·  copo  ·  sapato ›   (deslizar)  │
│ ┌────────────────────────────────────────┐ │
│ │ [img] “Toque na bola”   Aquisição 4/10 │ │
│ │ ⏱ 2,1 s desde a apresentação           │ │
│ └────────────────────────────────────────┘ │
│ IND  GES  MOD  FP  FT     (pré-selecionado) │
│ ┌──────────┐┌──────────┐┌──────────┐       │
│ │ ✓ Correta││ ✕ Incorr.││ – Sem r. │ fixo  │
│ └──────────┘└──────────┘└──────────┘       │
│ ↶ Desfazer (5 s)                            │
│ Comportamento: [Chão 2] [Morder 0 ⚠]       │
│ Reforço: [Bolhas] [Trem] [Fichas 3/5]       │
└─────────────────────────────────────────────┘
```

**Aceite**
- Sessão completa em modo avião, sincronizada sem perda.
- Uma tentativa em até 2 toques, com latência registrada.
- Desfazer funciona por 5 s; depois disso, a correção só é possível por adendo.
- Os gráficos Denver usam os registros reais.

### F4 — Análise e decisão no servidor (M)

**Especificação:** Doc B §8.4–8.8; Doc A §21 e §31.

**Backend**
- Edge Function `rules` disparada ao fim de cada lote sincronizado: roda `@aprumo/clinical-core` no servidor e grava em `decision_alerts` (um aberto por regra e sujeito; parâmetros e versão do motor gravados).
- Projeções materializadas com atualização incremental para volume (`fact_target_session`, `target_status`).
- “Adiar” alerta (`status = 'snoozed'`, com data de retorno).
- Análises cruzadas como views com supressão de células menores que 5 nas agregações da organização.

**Frontend**
- Gráfico de alvo:
  - barras empilhadas de distribuição de dicas abaixo do eixo;
  - marcadores por canal (mesa ●, jogo ○, natural ▲, casa ■);
  - filtro de canal e de ambiente;
  - tooltip de toque com o número de oportunidades.
- **Painel do supervisor em 3 faixas** (Doc B §10.2): fila de decisões com mini-gráfico → carteira de casos (fidelidade recente, pendências) → equipe (horas, competências, concordância).
- Tela **Análises** do caso: os cruzamentos do §8.6, cada um com tamanho de amostra e sem linguagem causal.

**Layout do painel (desktop)**

```
┌ Fila de decisões ─────────────────────────────────────────────┐
│ R1 Teo · bola   [mini ▁▃▆█]  Critério atingido   [Aceitar][Adiar][Descartar] │
│ R5 Teo · carro  [mini █▆▃▁]  Queda em manutenção  …                          │
├ Carteira de casos ────────────────────────────────────────────┤
│ [Teo ABA ▓▓░ 3 alertas · fidelidade 88%] [Lia Denver · ciclo em 8d] …       │
├ Equipe ───────────────────────────────────────────────────────┤
│ Rafael · 45 min supervisão · DTT ✓ · IOA 90%   Júlia · …                     │
└───────────────────────────────────────────────────────────────┘
```

**Aceite**
- Os alertas chegam ao painel após a sincronização, gerados no servidor.
- Os resultados batem com os conjuntos de referência do `clinical-core`.

### F5 — Superfícies da criança alinhadas à especificação (M)

**Especificação:** Doc B §10.7, M13, §9.7; Doc A §12; ECA Digital.

**Decisão a registrar:** o espaço da criança (navegação entre itens liberados) convive com a **sessão supervisionada linear**. O espaço só abre com adulto autenticado e só mostra o que a equipe liberou. Fica documentado como extensão aprovada pelo usuário, mantendo a vedação a catálogo aberto.

**Backend**
- `child_space_state` (preferências e estrelas) por criança, com RLS via token.
- `practice_runs` só como telemetria lúdica (sem `target_id` clínico).
- Registro de mando pela prancha: toque em item de prancha com alvo de mando ativo gera `opportunity_record` quando há sessão aberta.

**Frontend**
- Terceira porta: “**Abrir sessão de uma criança neste aparelho**”. O adulto autenticado escolhe a criança e, se houver, a sessão do dia; o aparelho entra no modo supervisionado. O código do cadastro continua como atalho de busca, nunca como credencial.
- Saída por toque longo **+ PIN do adulto**.
- **Timer Visual de Transição** (recurso próprio, com disco que diminui e aviso antes do fim).
- **Faixas etárias:**
  - 2–4 anos: uma atividade por vez, 2–3 escolhas.
  - 5–8 anos: agenda e fichas.
  - 9–12 anos: metas da sessão visíveis e autoavaliação simples.
  - 13–18 anos: “Meu Dia”.
- **Prancha:** símbolos Mulberry (CC BY-SA, com atribuição), núcleo de vocabulário, categorias, fotos próprias com consentimento, importação e exportação OBF/OBZ, voz natural, versão impressa para menores de 2 anos. Não conta como tempo de tela recreativo.
- **Modo guiado do aparelho:** instruções para Acesso Guiado (iOS) e Fixação de tela (Android) na tela de preparação.

**Layout da sessão supervisionada (tablet deitado)**

```
┌ [agenda: ① Jogo ② Bolhas ③ Mesa]                          ┌ Fichas ┐
│                                                             │ ● ● ○  │
│                  [ atividade em tela cheia ]                │ ○ ○    │
│                                                             │  ↓     │
│ ◤ canto do adulto (toque longo + PIN)                       │ Bolhas │
└─────────────────────────────────────────────────────────────┴────────┘
```

**Aceite**
- Sem adulto autenticado não há espaço.
- O limite diário bloqueia jogos, mas não a prancha.
- Nenhuma mecânica de sorteio, sequência de dias ou comparação.

### F6 — Família e documentos (M)

**Especificação:** Doc B M11, M12, §10.8, §10.10; Doc A §32 e §35.

**Backend**
- `family_invites` (link de uso único, expiração e confirmação de identidade).
- `messages` (escopo clínico ou administrativo, política de resposta).
- `family_videos` (Storage, por modelo do caso).
- `weekly_summary` (Edge Function semanal que gera o texto a partir das projeções, revisável antes do envio).
- **Documentos:** geração de PDF no servidor (com gráficos) e de **DOCX**; modelos da Res. CFP 06/2019; exportação de dados CSV/JSON com dicionário.

**Frontend (família)**
- Primeiro acesso: criar senha → confirmar identidade → consentimentos um por um (resumo e texto integral) → tour de 3 telas.
- Barra inferior com 5 abas: **Início** (resumo da semana, próximas sessões, tarefas), **Progresso** (trilha: começando, aprendendo, aprendeu, praticando, usando em outros lugares), **Tarefas**, **Orientações** (vídeos e textos), **Mensagens**.

**Frontend (documentos)**
- Escolha do modelo, editor com seções obrigatórias e gráficos selecionáveis, prévia, finalização, exportação em PDF ou Word e compartilhamento com a família ou a escola.

**Layout (família, celular)**

```
┌ Olá, Marina ──────────────────────┐
│ Esta semana o Teo praticou pedir  │
│ ajuda em 4 situações…             │
│ ┌ Tarefa de hoje ──────────────┐  │
│ │ Pegar a bola quando pedirem  │  │
│ │ Tentativas [−] 3 [+]  Deu certo [−] 2 [+] │
│ └──────────────────────────────┘  │
├ Início · Progresso · Tarefas · Orientações · Mensagens ┤
```

**Aceite**
- A família entra só por convite.
- Revogar o consentimento corta o acesso (já testado no banco).
- O PDF bate com as projeções, com período, fonte e versão.

### F7 — Catálogo de jogos, recursos e materiais (G, contínuo)

**Especificação:** Doc B §9.1–9.8; Doc A §8–11.

**Ordem sugerida**, por cobertura de repertório e reaproveitamento do motor:
1. **Recursos do terapeuta e de apoio:** Timer Visual (F5), Contador Rápido de Comportamento (F3), Folha Denver Digital (feita), **Me Mostra** (ouvinte com fotos da casa), **O Que É?** (tato, com pontuação pelo profissional), **Organize por Categoria**, **Memória dos Bichos**.
2. **Rotina conjunta e pares:** Causa e Efeito Compartilhado (2–3 anos, blocos de 3 min), Brincar Juntos, Construtor de Formas (modo Criar), Imitação em Vídeo.
3. **Verbal e social:** Completa a Frase (intraverbal), Reconhecendo Emoções, Quem Está Sentindo?, Conversa em Turnos (esvanecimento de roteiro), Construtor de Histórias Sociais.
4. **Funcional e adolescentes:** Pequeno Chef (cadeia), Mercadinho → Dinheiro e Troco, Missão Independência, Meu Dia, Separa e Guarda.
5. **Visuomotores e de atenção** (sempre como “desempenho na tarefa”, nunca como teste): Caça ao Alvo, Caminho do Dedo, Encaixa!, Torre Espelho, História em Ordem, Jardim das Causas, Mochila Mental, Farol do Foco, Semáforo, Troca-Troca, Regula, Siga o Olhar, Massinha Viva.

**Regras para cada jogo novo**
- Pacote próprio em `games/<id>`: tokens com prefixo próprio, arte, animação e lógica.
- Manifesto clínico v2 com esquema de eventos validado no CI.
- Pontuação pelo profissional quando o repertório exige; adaptação sensorial aplicada.
- Teste de lógica, teste de contrato de eventos e verificação de toque em 375×812 e em tablet.

**Pipeline de publicação (§9.8):** `app_registry.status` (review → published → blocked); quarentena acima de 1% bloqueia a versão; as sessões ficam ligadas à versão.

**Acervo e materiais**
- Bucket `stimuli` com fotos próprias e fotos da casa da criança (consentimento de imagem).
- Gerador de PDF de cartões, pranchas de baixa tecnologia, agendas, quadros de fichas e folhas de registro com QR.

### F8 — Administração, segurança e conformidade (M)

**Especificação:** Doc B M14, §12.5; Doc A §24–30; Doc B §10.11.

**Backend**
- Onboarding da organização (dados, responsável técnico, aceite de contrato e DPA, padrões).
- `units`.
- Licenças de instrumentos por organização.
- Bloqueio progressivo de login.
- `security_incidents` e `data_subject_requests` (prazos da ANPD).
- Criptografia de colunas.
- Backup com PITR e teste de restauração trimestral.

**Frontend**
- Área **Administração** (navegação lateral própria: Equipe, Unidades, Licenças, Auditoria, Configurações da organização), sem conteúdo clínico.
- **Auditoria:** quem leu ou alterou o quê, com filtros e exportação.
- **Navegação por papel:** a barra inferior do aplicador mostra Hoje, Casos, Registrar e Pendências; a da supervisão, Painel, Casos, Bibliotecas, Supervisão, Documentos e Configurações (Doc B §10.1).

**Aceite**
- O gestor sem vínculo não vê prontuário (já testado no banco; repetir no E2E).
- Toda leitura de prontuário aparece na auditoria.

### F9 — IA assistiva e interoperabilidade (M, após o núcleo estável)

**Especificação:** Doc B §8.9; Doc A §33 e §36.
- **AI Gateway** (Edge Function) com Claude no servidor. Somente três usos:
  - rascunho de relatório a partir de dados desidentificados;
  - resumo de notas para o supervisor;
  - tradução de orientações para a família.
- Sempre rascunho; aplicação ao registro só com confirmação humana; registro de modelo, versão, prompt e usuário.
- Vetados: diagnóstico, função automática do comportamento, mudança de fase, análise de emoção e conversa direta com a criança.
- Exportação **FHIR** (Patient, CarePlan, Goal, Observation, DocumentReference) e estudo de elegibilidade para a RNDS.

### F10 — Qualidade, desempenho e piloto (M, transversal ao final)

- **Playwright + axe** nas jornadas críticas:
  - criar caso → plano → sessão offline → sync → gráfico → alerta → decisão;
  - família;
  - abertura do espaço infantil por adulto;
  - jogo com tentativas.
- Em celular (375×812), tablet (1024×768, nos dois sentidos) e desktop.
- **Desempenho:** LCP < 2,5 s na página pública; INP < 200 ms na tela de aplicação; orçamento de bundle por jogo.
- **PWA:** cache cifrado do caso do dia, aviso de nova versão, drenagem da outbox antes de nova sessão.
- **Observabilidade:** erros e métricas de sync sem payload clínico.
- Teste de intrusão independente, revisão de RLS e grants, e RIPD revisado.
- **Piloto** com supervisão próxima. Indicadores do Doc B §15: adoção > 90%, tentativa em até 2 s, alertas analisados em até 7 dias.

---

## Parte 3 — UI/UX e layouts por superfície

### 3.1 Princípios mantidos

- **Profissional:** sóbrio (sálvia), denso e legível. **Família:** acolhedora e simples. **Criança:** colorida mas calma, sem flashes, baixo estímulo por padrão.
- Cor nunca é o único código: rótulo, forma ou ícone sempre acompanham.
- **Toque:** alvos ≥ 48 px no profissional e ≥ 64 px na criança; ações principais ao alcance do polegar; janelas como painel inferior no celular.
- Cada jogo com mundo visual próprio; só o dado é comum.

### 3.2 Grade e pontos de quebra

| Largura | Profissional | Família | Criança |
|---|---|---|---|
| < 640 px (celular) | Barra inferior de 5 itens; conteúdo em coluna única; janelas como painel inferior; sessão com respostas fixas | Barra inferior de 5 abas | Navegação inferior; jogos em cartões deslizáveis |
| 640–960 px (tablet em pé) | Menu lateral recolhível; 1–2 colunas | 1–2 colunas | Fichas embaixo da atividade |
| ≥ 960 px (tablet deitado / desktop) | Menu lateral fixo de 248 px; master-detail; até 1360 px de conteúdo | Até 1040 px | Trilho lateral de navegação; fichas na lateral |

### 3.3 Componentes a acrescentar no design system

| Componente | Uso |
|---|---|
| `Sheet` (tela cheia no celular) | Editor de alvo em etapas, detalhe do alvo |
| `UndoBar` | Desfazer por 5 s na sessão |
| `Stopwatch` / `IntervalTimer` | Latência, duração, intervalo de comportamento e Denver |
| `SwipeTabs` | Troca de alvo na sessão |
| `MiniChart` | Alertas e carteira de casos |
| `Skeleton` | Carregamento com dados reais |
| `QrScanner` / `QrCode` | Pareamento e folha impressa |
| `PinPad` | Saída protegida do modo infantil |
| `StackedBars` | Distribuição de dicas no gráfico de alvo |

### 3.4 Textos

Os textos de interface já seguem estas regras; elas valem para as novas telas:
- Frases curtas, sem jargão para a família, com termo técnico e explicação para o profissional.
- Toda decisão clínica mostra o motivo e o fundamento.
- Mensagens de erro dizem como resolver.
- Nunca falar em “acurácia geral”, “QI”, “teste” ou “desempenho da criança” sem o alvo.

---

## Parte 4 — Backend: acréscimos ao modelo de dados

| Migração | Conteúdo |
|---|---|
| `0008_org_defaults` | Padrões por organização: hierarquias, critérios, limites de tela, escala Denver |
| `0009_demo_flag` | `is_demo` em organizações e casos; exclusão de painéis reais |
| `0010_plan_versioning` | Cópia de versão do plano, `source_id`, `submit_plan_for_approval`, `approve_plan` |
| `0011_assessment` | `instruments`, `instrument_scores`, `baseline_probes`, `functional_assessments` |
| `0012_session_blocks_runtime` | Retratação de tentativa (desfazer após o envio), pausa, latência obrigatória quando aplicável |
| `0013_denver_projection` | `fact_denver_step_session`, ligação passo ↔ rotina |
| `0014_alerts_snooze` | Adiar alertas; versão do motor |
| `0015_child_space` | `child_space_state`, `practice_runs`, `resolve_child_session` |
| `0016_family_comms` | `family_invites`, `messages`, `family_videos`, `weekly_summaries` |
| `0017_documents_templates` | Modelos CFP, `exports` |
| `0018_admin_security` | `units`, `instrument_licenses`, `security_incidents`, `data_subject_requests`, bloqueio de login |

**Edge Functions:** `ingest`, `rules`, `weekly-summary`, `document-render` (PDF/DOCX), `family-invite`, `ai-gateway` (F9), `fhir-export` (F9).

**Storage:** `stimuli/` (por organização e caso), `media-consented/` (fotos e vídeos com `consent_id`), `documents/` (versões finais com hash) e `family-videos/`.

**Testes de banco:** cada migração nova com testes de RLS e de acesso cruzado no mesmo harness PGlite. As que dependem de Edge Function rodam no Supabase local do CI.

---

## Parte 5 — Ordem, dependências e decisões pendentes

```
F1 Dados reais ──► F2 Núcleo ──► F3 Sessão ──► F4 Análise ──► [Piloto clínico]
        │                                   │
        └──► F5 Criança (segurança da entrada já em F1)
                       F6 Família/documentos ◄── F4
                       F7 Catálogo (contínuo, após F3)
                       F8 Administração (paralelo a F4–F6)
                       F9 IA/FHIR (após piloto)   F10 Qualidade (contínuo; E2E no final)
```

**Prioridade imediata**
1. Projeto Supabase e F1.
2. As 7 lacunas críticas da §1.4.
3. F2 e F3.

**Decisões que dependem de você ou da coordenação clínica**
1. Modelo de negócio. Define Mulberry (padrão) ou ARASAAC na prancha.
2. Licença da Lista de Verificação do ESDM e de outros currículos.
3. Validação dos padrões clínicos: critério 90%/2 sessões/10 oportunidades, parâmetros de R1–R15 e intervalo Denver de 15 min.
4. Política de fotos e vídeos de crianças para estímulos e vídeo-modelação.
5. Se a família pode registrar no mesmo formato da equipe (coterapia) ou só como “relato do responsável”.
6. Confirmar a convivência do espaço da criança (navegação entre itens liberados) com a regra de “sem catálogo navegável” do Doc B.
7. Responsável técnico e dados institucionais para o rodapé da página pública (nome, conselho, CNPJ, encarregado de dados).
