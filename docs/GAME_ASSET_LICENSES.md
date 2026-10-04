# APRUMO — GAME & PLATFORM ASSET LICENSES

**Versão:** 2.1.0  
**Data:** Outubro de 2026  
**Finalidade:** Inventário Legal, Direitos Autorais e Políticas de Licenciamento de Assets (Áudio, Tipografia e Imagens).

---

## 1. Princípios de Propriedade Intelectual e Licenciamento

1. **Rigor de Licenciamento:** Nenhum asset sem licença expressa, auditável e compatível com distribuição de software clínico é admitido no repositório.
2. **Prioridade para Síntese Procedural (Zero Dependência de Áudio Externo):**
   A arquitetura sonora primária do Aprumo utiliza a **Web Audio API** (`OscillatorNode`, `GainNode`, envoltórias ADSR suaves), gerando acordes e toques senoidais matematicamente no navegador, eliminando arquivos pesados de terceiros e problemas de direitos autorais.
3. **Imutabilidade e Rastreabilidade:** Todos os pacotes de estímulos e fontes mantêm seus arquivos de licença originais em seus diretórios raiz.

---

## 2. Inventário de Fontes Tipográficas

| Família Tipográfica | Licença | Origem / Autoria | Aplicação no Aprumo |
|---|---|---|---|
| **Plus Jakarta Sans** | SIL Open Font License 1.1 | Tokotype (Gumpita Rahayu) | Tipografia principal da interface (UI), formulários e dados tabulares |
| **Fraunces** | SIL Open Font License 1.1 | Phaedra Charles & Flavia Zimbardi | Títulos editoriais, cabeçalhos de acolhimento e identidade visual |
| **Atkinson Hyperlegible**| Braille Institute Open License / OFL | Braille Institute of America & Applied Design Works | Modo de acessibilidade, baixa visão e redução de sobrecarga cognitiva |
| **Fredoka** | SIL Open Font License 1.1 | Milena Brandão | Ambiente infantil, números lúdicos e cartões da criança |

---

## 3. Inventário de Recursos Sonoros e SFX

| Categoria de Áudio | Fonte / Autor | Licença | Finalidade no Ecossistema |
|---|---|---|---|
| **Síntese Procedural Aprumo** | Código nativo Aprumo (`@aprumo/game-sdk/audio.ts`) | MIT / Próprio | Timbres senoidais e triangulares suaves para toque (`tap`), confirmação (`confirm`), conclusão e entrega de ficha |
| **Sons Ambientes (Natureza / Sala)** | Kenney.nl / Sonniss GameAudio | CC0 1.0 Universal (Public Domain) | Sons de fundo opcionais de regulação sensorial (chuva suave, brisa, sala silenciosa) |
| **Alertas Neutros** | Mixkit Free License / CC0 | Isenta de Royalties | Feedback de transição suave sem agressividade sonora |

---

## 4. Estímulos Visuais & Comunicação Alternativa (CAA)

| Conjunto de Estímulos | Licença | Origem | Uso Autorizado |
|---|---|---|---|
| **`@aprumo/stimuli`** | MIT (Aprumo Core) | Ilustrações vetoriais SVG desenhadas internamente | Conjunto canônico de cartões, objetos de teste e pareamento |
| **Soft-Clay 3D Stimuli & Scene Assets** | MIT (Aprumo Core) | Código procedural vetorial SVG nativo (`apps/web/public/assets/` & `@aprumo/stimuli`) | Estímulos táteis (maçã, carrinho), rotinas (escovar dentes, lavar mãos), avatar de imitação, folha de modelo Léo e cenários urbanos |
| **Open Board Format (OBF)** | Creative Commons Attribution 4.0 | Open-AAC Initiative | Formato interoperável de pranchas de comunicação alternativa |
| **Mulberry Symbols** | Creative Commons Attribution-ShareAlike 2.0 UK | Straight-Street | Biblioteca internacional de símbolos para comunicação alternativa e PECS |

