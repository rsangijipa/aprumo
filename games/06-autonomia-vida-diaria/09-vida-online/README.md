# Vida Online — Nexo OS

> Uma narrativa interativa contemporânea sobre convivência, privacidade e dilemas digitais para a faixa de 12 a 17 anos.

---

## 📱 Visão Geral do Jogo

**Vida Online** coloca o jogador no controle de um dispositivo móvel fictício chamado **Nexo**, equipado com seu próprio sistema operacional autoral (**Nexo OS**). Em vez de cartilhas moralistas ou aulas expositivas, o jogo adota o modelo de simulação realista de situações cotidianas:

- Mensagens diretas e grupos escolares (App **Pulse**)
- Comunidade e fórum de discussões (App **Loop**)
- Jogos online em equipe e squads (App **PlayHub**)
- Auditoria de segurança, credenciais e permissões (App **Vault**)
- Notificações escolares e avisos de phishing (App **Mailbox**)
- Linha do tempo visual de fotos e murais (App **Feed**)
- Laboratório de investigação e minigames (Módulo **Detetive Digital**)

---

## 🎯 Princípios de Design e Ética

1. **Sem Julgamento Moral:** Nenhum placar rotula o jogador como "certo" ou "errado". Quatro **indicadores neutros** refletem o estilo de presença digital:
   - **Privacidade:** Proteção de dados, fotos e rotinas pessoais.
   - **Clareza:** Expressão de sentimentos, checagem de fatos e escuta ativa.
   - **Limites:** Capacidade de dizer não a abusos e respeitar o tempo dos outros.
   - **Confiança:** Vínculos transparentes e cultivo de apoio mútuo.
2. **Sem Victim Blaming:** Vítimas de golpes, vazamentos ou brincadeiras de mau gosto nunca são culpabilizadas.
3. **Perspectiva Dupla:** Capítulos com revelação de contexto mostram a tela de outros interlocutores (como no Capítulo 6), ensinando empatia assíncrona.
4. **Privacidade Absoluta:** O jogo não coleta dados reais, não possui rastreadores externos e armazena o progresso 100% no navegador (LocalStorage).

---

## 📖 Roteiro dos 12 Episódios

| # | Título | App | Tema Principal |
|---|---|---|---|
| **1** | **Grupo Novo** | Pulse | Apresentação na turma, zoeira com colega tímido e limites de grupo. |
| **2** | **Pessoa Desconhecida** | Pulse | Abordagem privada de perfil sem amigos mútuos e pedidos de fotos da rotina. |
| **3** | **Foto & Limites** | Pulse | Pressão afetiva por fotos íntimas, autonomia e consentimento digital. |
| **4** | **O Link do Torneio** | Pulse / Detetive | Minigame de URL: engenharia social e páginas falsas de skins no PlayHub. |
| **5** | **Conta Compartilhada** | PlayHub | Proposta de "upar elo" de graça mediante entrega de senha e remoção de 2FA. |
| **6** | **Briga no Grupo** | Pulse (Perspectiva) | Mal-entendido de texto com resposta "ok"; visão da tela da amiga no hospital. |
| **7** | **O Convite Fora da Rede** | Pulse | Jogador de internet marcando encontro físico secreto sem responsáveis. |
| **8** | **O Print Cortado** | Feed / Detetive | Minigame de Prints: identificando contexto omitido em prints virais. |
| **9** | **Conta de Amigo** | Pulse | Sequestro de conta de amigo pedindo código SMS de 6 dígitos recebido por engano. |
| **10** | **Pressão Social** | Loop | Desafio viral no fórum para gravar áudio escondido da professora em aula. |
| **11** | **Privacidade & Permissões** | Vault / Detetive | Minigame de Permissões: barrando microfone 24h e GPS em app de stickers. |
| **12** | **Redefinindo o Espaço** | Pulse / Nexo | Gran Finale: síntese das decisões, mural da feira e conquista da Cidadania Digital. |

---

## 🎨 Sistema de Design & Identidade Visual

Implementado com arquitetura de 3 camadas de tokens CSS (`src/tokens/design-tokens.css`):

- **Primitivos:** Paleta contemporânea autoral (#20252C grafite, #344052 slate, #536DFE azul nexo, #45B5A4 turquesa, #8B75D7 lilás, #E16C68 coral, #F6F6F3 off-white).
- **Semânticos:** Mapeamentos para modo claro/escuro, alto contraste e estados de componentes.
- **Componentes:** Balões de conversa, gavetas de contexto, badges de ilha dinâmica e moldura do Nexo.
- **Vetor Autoral:** Avatares em estilo Graphic Novel e ícones de aplicativos construídos em SVG nativo.

---

## ♿ Recursos de Acessibilidade

- **Ajuste de Tipografia:** Modos de tamanho de texto (Padrão, Grande, Muito Grande).
- **Modo Dislexia:** Tipografia adaptada com espaçamento reforçado.
- **Alto Contraste:** Paleta com bordas nítidas para baixa visão.
- **Leitura em Voz Alta (TTS):** Integração com Web Speech API em Português do Brasil para narração de mensagens e escolhas.
- **Animações Reduzidas:** Respeito à preferência do sistema e controle manual no app Ajustes.
- **Navegação por Teclado:** Controle de foco com suporte a `Tab`, `Enter`, `Espaço` e tecla `Escape` para fechar gavetas e retornar ao menu.

---

## 🔊 Áudio Procedural

O motor de som (`src/audio/audioEngine.ts`) utiliza **Web Audio API** sintetizada em tempo real:
- Sons táteis de envio e recebimento de mensagens.
- Notificações de alerta discretas.
- Chime reflexivo para conclusão de capítulos.
- Zero arquivos de áudio externos que possam quebrar ou gerar latência.

---

## 🚀 Como Executar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Rodar a suíte de testes (253 validações de branching e conteúdo)
npm test

# 4. Gerar build de produção otimizado
npm run build
```

---

## 🛡️ Licença

Projeto educacional e narrativo desenvolvido de forma independente.
