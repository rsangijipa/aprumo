PROMPT PARA O ANTIGRAVITY — INCORPORAR 4 NOVOS JOGOS AO CATÁLOGO DO APRUMO

Contexto
Foram criados 4 jogos novos, cada um em sua própria pasta dentro de games/. Eles vieram da pasta "games2" (fichas ABA-03, DEN-03, DEN-04 e DEN-05) e foram escolhidos porque não se parecem com os jogos que já existem nem com os 12 jogos do catálogo "Jogos Físicos ABA & Denver → Recursos Digitais". Os jogos já estão prontos, com testes passando e typecheck limpo. Sua tarefa é só integrá-los ao restante da aplicação. Não reescreva a lógica, a arte nem o CSS interno dos jogos.

IMPORTANTE: essas pastas ainda não estão commitadas. Não rode git clean, git stash -u, git checkout . nem nada que apague arquivos não rastreados. Durante a criação, essas pastas foram apagadas uma vez por engano.

Os 4 jogos
1. Encaixa Aí
   pasta: games/encaixa-ai | pacote: @aprumo/game-encaixa-ai | appId: encaixa-ai
   modelo: ABA (análise de tarefa com encadeamento reverso, direto ou tarefa total) | idade: 2 a 8 anos
   repertório: matching, play | pontuação: automática (matching) | requer adulto: sim
   resumo: quebra-cabeça de encaixe com pino, em 6 níveis, com rotação de peça a partir do nível 4. Funciona por arrastar, por toque na peça e depois no buraco, ou pelo teclado.

2. Rampa Maluca
   pasta: games/rampa-maluca | pacote: @aprumo/game-rampa-maluca | appId: rampa-maluca
   modelo: Denver / ESDM (rotina de atividade conjunta) | idade: 18 a 60 meses
   repertório: mand, echoic, social, play | pontuação: pelo terapeuta | requer adulto: sim
   resumo: carrinhos e bolinhas na rampa com "Preparar… apontar… já!". Há uma pausa que espera a criança se comunicar, e o carrinho só desce quando o adulto registra a comunicação.

3. Hora do Lanche do Urso
   pasta: games/lanche-do-urso | pacote: @aprumo/game-lanche-do-urso | appId: lanche-do-urso
   modelo: Denver / ESDM (brincar de faz de conta) | idade: 18 a 60 meses
   repertório: play, imitation, listener, social | pontuação: modo livre sem pontuação; modo missão automático ou pelo terapeuta | requer adulto: sim
   resumo: dar comida, água, banho e pôr o urso (ou outro personagem) para dormir, chegando até a substituição simbólica (o bloco vira pão).

4. Fazendinha Sonora
   pasta: games/fazendinha-sonora | pacote: @aprumo/game-fazendinha-sonora | appId: fazendinha-sonora
   modelo: Denver / ESDM (leitura compartilhada; ABA marcado como não indicado) | idade: 12 a 48 meses
   repertório: social, echoic, imitation, mand, tact, listener | pontuação: pelo terapeuta | requer adulto: sim
   resumo: livro de abas "Cadê a vaca?" com sons de animais gerados no navegador e controles do adulto (revelar devagar, apontar, pausa de espera).

O que fazer
1. Dependências: em apps/web/package.json, adicione as 4 dependências como "workspace:*", em ordem alfabética junto às outras @aprumo/game-*. Depois rode pnpm install.
2. Registro: em apps/web/src/game-host/registry.ts, importe o manifest de cada jogo de "@aprumo/game-<nome>/manifest" e adicione cada entrada em GAMES, no mesmo formato das outras:
   'encaixa-ai': { manifest: encaixaAi, load: () => import('@aprumo/game-encaixa-ai').then((m) => m.Game) },
   Faça o mesmo para rampa-maluca, lanche-do-urso e fazendinha-sonora.
3. Teste do registro: atualize apps/web/src/game-host/registry.test.ts (contagem ou lista de jogos) para incluir os 4. O teste já valida o manifest de cada jogo como release gate.
4. Catálogo público: inclua os 4 na página /games (apps/web/src/routes/public/pages/GamesPage.tsx), com nome, faixa etária, modelo (ABA ou Denver) e o resumo acima. Use o mesmo padrão de cartão das outras entradas.
5. Resource Studio / biblioteca profissional (apps/web/src/routes/pro/Library.tsx): inclua os 4 na lista de jogos, com filtro por modelo (ABA ou Denver) e idade.
6. Perfil do caso (CaseProfile, "o que aparece no espaço da criança"): os 4 têm requiresAdult = true. Não ofereça nenhum deles para prática livre no espaço da criança. Eles devem aparecer só para uso em sessão com o profissional (SessionRunner / ChildShell).
7. Planos e templates: se houver templates de programa (apps/web/src/data/templates.ts), ofereça os 4 como recurso digital sugerido nos programas correspondentes: encaixe/encadeamento, pedido/mand em rotina, brincar simbólico e atenção conjunta com livro.
8. Inventário e documentação: rode tools/generate-inventory.ts para atualizar docs/INVENTORY.json e docs/INVENTORY.md. Adicione as 4 linhas em docs/GAME_CLINICAL_MATRIX.md e cite os jogos no README, se ele tiver uma lista de jogos.
9. Telemetria: os 4 jogos emitem os eventos padrão do protocolo (@aprumo/protocol). Os dados específicos de cada jogo vão em TRIAL_COMPLETED.detail.gameSpecific. Garanta que o host e os gráficos aceitem esse campo sem quebrar (é opcional e livre).
10. Arte: cada jogo tem arte SVG própria e tokens de CSS próprios (--ea-, --rm-, --lu-, --fs-). Não troque por assets compartilhados. Se quiser imagens de capa para os cartões do catálogo, crie-as separadamente, sem alterar o jogo.

Verificação final
- pnpm typecheck, pnpm test, pnpm lint (0 erros) e pnpm build devem passar.
- Abra cada jogo no app, numa sessão de demonstração com uma criança da faixa etária certa, e confira se o jogo ocupa o iframe inteiro, se responde ao toque e ao teclado e se respeita o modo de movimento reduzido.
- Faça commit em master e push.
