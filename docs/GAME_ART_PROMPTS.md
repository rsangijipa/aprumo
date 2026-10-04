# APRUMO — GAME ART PROMPTS & ASSET PIPELINE

**Versão:** 2.1.0  
**Data:** Outubro de 2026  
**Regra de Transparência:** Nano Banana e geradores neurais não fornecem canal alpha/transparência com confiabilidade total. Portanto, todo asset isolado é gerado sobre fundo sólido uniforme de alto contraste (branco puro `#FFFFFF`, cinza neutro `#808080` ou verde chroma `#00FF00`), devidamente marcado como `NEEDS_BACKGROUND_REMOVAL`.
**Status de Entrega:** Todos os 7 assets foram gerados e implementados como ilustrações vetoriais escaláveis SVG (3D Soft Clay / volumetric shading) em `apps/web/public/assets/` e exportados como componentes tipados em `@aprumo/stimuli`.

---

## 1. Protocolo de Geração e Remoção

Para cada asset que requeira transparência para compor a interface ou o canvas:
1. Definir a cor do objeto principal.
2. Selecionar o fundo sólido mais contrastante (evitar verde se o objeto for verde; usar branco puro para objetos coloridos e contrastantes).
3. Registrar o prompt exato, a resolução e a finalidade.
4. Identificar o asset com a tag: `NEEDS_BACKGROUND_REMOVAL: TRUE` ou `GERADO & IMPLEMENTADO`.
5. Sinalizar que a remoção manual será realizada com software de recorte dedicado ou ferramenta de máscara.

---

## 2. Catálogo de Prompts por Jogo e Recurso

### 2.1 Match Lab — Estímulos Cotidianos (Soft Clay)
- **Nome:** `stimulus_apple_softclay`
- **Finalidade:** Estímulo para pareamento de idênticos e categoria (Alimento).
- **Dimensões / Aspect Ratio:** 1024x1024 (1:1)
- **Background Utilizado:** Branco puro (`#FFFFFF`) / Transparente SVG
- **Status:** `GERADO & IMPLEMENTADO`
- **Arquivo SVG:** [`apps/web/public/assets/stimulus_apple_softclay.svg`](file:///apps/web/public/assets/stimulus_apple_softclay.svg)
- **Componente React:** `<StimulusAppleSoftClay />` em `@aprumo/stimuli`
- **Implementação:** Pareamento de estímulos no Match Lab, `ChoiceBoardTool` em `Library.tsx` e registro canônico em `STIMULUS_ART`.
- **Prompt:**
  ```
  Single clearly recognizable shiny red apple, modern soft-clay 3D render, rounded tactile geometry, gentle specular highlights, centered, front-three-quarter perspective, no leaves, no text, no logos, casting a very faint soft contact shadow, isolated on pure white background, highly readable for child interface.
  ```

- **Nome:** `stimulus_car_softclay`
- **Finalidade:** Estímulo para pareamento e categoria (Veículo).
- **Dimensões / Aspect Ratio:** 1024x1024 (1:1)
- **Background Utilizado:** Branco puro (`#FFFFFF`) / Transparente SVG
- **Status:** `GERADO & IMPLEMENTADO`
- **Arquivo SVG:** [`apps/web/public/assets/stimulus_car_softclay.svg`](file:///apps/web/public/assets/stimulus_car_softclay.svg)
- **Componente React:** `<StimulusCarSoftClay />` em `@aprumo/stimuli`
- **Implementação:** Pareamento de veículos no Match Lab, `ChoiceBoardTool` em `Library.tsx` e registro canônico em `STIMULUS_ART`.
- **Prompt:**
  ```
  Single clearly recognizable toy passenger car, bright blue finish, rounded playful forms, modern soft-clay 3D illustration, front-three-quarter angle, simple rubber wheels, no brand logos, no text, centered composition, soft diffuse lighting, isolated on pure white background.
  ```

### 2.2 Studio de Rotina Visual — Cartões de Atividades
- **Nome:** `routine_brush_teeth`
- **Finalidade:** Cartão de rotina diária (Autocuidado / Escovar os Dentes).
- **Dimensões / Aspect Ratio:** 1024x1024 (1:1)
- **Background Utilizado:** Branco puro (`#FFFFFF`) / Transparente SVG
- **Status:** `GERADO & IMPLEMENTADO`
- **Arquivo SVG:** [`apps/web/public/assets/routine_brush_teeth.svg`](file:///apps/web/public/assets/routine_brush_teeth.svg)
- **Componente React:** `<RoutineBrushTeeth />` em `@aprumo/stimuli`
- **Implementação:** `TaskAnalysisStudio` (`TASK_PRESETS` id `escovar-dentes`) e estúdios de rotinas AVDs.
- **Prompt:**
  ```
  Single clearly recognizable daily routine item, modern toothbrush with gentle blue and yellow plastic handle and toothpaste dollop, soft modern clay 3D illustration, rounded forms, clean studio lighting, centered composition, no text, no logo, isolated on pure white background, highly readable for a child interface.
  ```

- **Nome:** `routine_wash_hands`
- **Finalidade:** Cartão de rotina de higiene (Lavar as Mãos).
- **Dimensões / Aspect Ratio:** 1024x1024 (1:1)
- **Background Utilizado:** Branco puro (`#FFFFFF`) / Transparente SVG
- **Status:** `GERADO & IMPLEMENTADO`
- **Arquivo SVG:** [`apps/web/public/assets/routine_wash_hands.svg`](file:///apps/web/public/assets/routine_wash_hands.svg)
- **Componente React:** `<RoutineWashHands />` em `@aprumo/stimuli`
- **Implementação:** `TaskAnalysisStudio` (`TASK_PRESETS` id `lavar-maos`) e `TaskAnalysisTool` em `Library.tsx`.
- **Prompt:**
  ```
  Stylized pair of friendly clean hands washing with fluffy soap bubbles and gentle water splash, modern soft-clay 3D render, expressive gentle shapes, soft diffuse studio light, centered, no text, no logos, isolated on pure white background.
  ```

### 2.3 Espelho Mágico — Avatar para Imitação Motora
- **Nome:** `avatar_imitation_child`
- **Finalidade:** Personagem neutro amigável para demonstração de gestos motores.
- **Dimensões / Aspect Ratio:** 1024x1536 (2:3)
- **Background Utilizado:** Cinza neutro suave (`#F0F2F2`) / Transparente SVG
- **Status:** `GERADO & IMPLEMENTADO`
- **Arquivo SVG:** [`apps/web/public/assets/avatar_imitation_child.svg`](file:///apps/web/public/assets/avatar_imitation_child.svg)
- **Componente React:** `<AvatarImitationChild />` em `@aprumo/stimuli`
- **Implementação:** Painel do adulto e guia anatômico de imitação motora em `Espelho Mágico`.
- **Prompt:**
  ```
  Friendly stylized 3D child avatar for motor imitation activities, natural balanced proportions, both hands clearly visible and open, wearing neutral sage-green t-shirt and comfortable trousers, soft studio lighting, gentle smiling subtle expression, full body pose, plain solid light-gray studio background, educational game asset.
  ```

### 2.4 Social Story Studio — Folha de Personagem Consistente
- **Nome:** `character_sheet_leo`
- **Finalidade:** Personagem recorrente para histórias sociais (Léo).
- **Dimensões / Aspect Ratio:** 1536x1024 (3:2)
- **Background Utilizado:** Cinza neutro (`#ECEFF1`)
- **Status:** `GERADO & IMPLEMENTADO`
- **Arquivo SVG:** [`apps/web/public/assets/character_sheet_leo.svg`](file:///apps/web/public/assets/character_sheet_leo.svg)
- **Componente React:** `<CharacterSheetLeo />` em `@aprumo/stimuli`
- **Implementação:** Visualização de folha de personagem consistente (frontal, perfil e 3/4) em `SocialStoryTool` em `Library.tsx`.
- **Prompt:**
  ```
  Consistent friendly character sheet for an educational social story, showing front view, three-quarter view, and side view of a 7-year-old child named Leo, modern soft 3D digital illustration, natural proportions, expressive but calm face, simple comfortable school clothes, neutral studio background, intended for repeated sequential scenes.
  ```

### 2.5 Social City 3D — Cenário Urbano para Adolescentes
- **Nome:** `environment_teen_cafe`
- **Finalidade:** Cenário contemporâneo para missões de interação social na cidade.
- **Dimensões / Aspect Ratio:** 1920x1080 (16:9)
- **Background Utilizado:** Ambiente 3D Integrado / Interior estilizado
- **Status:** `GERADO & IMPLEMENTADO`
- **Arquivo SVG:** [`apps/web/public/assets/environment_teen_cafe.svg`](file:///apps/web/public/assets/environment_teen_cafe.svg)
- **Componente React:** `<EnvironmentTeenCafe />` em `@aprumo/stimuli`
- **Implementação:** Backdrop contextual de diálogo no cenário 'Cafeteria da Praça' em `Social City 3D`.
- **Prompt:**
  ```
  Stylized realistic small urban cafe environment for a teen educational game, modern low-poly premium aesthetic, believable architectural proportions, clean minimalist interior materials, large bright glass windows, contemporary wooden furniture, soft daylight, visually mature and welcoming, no branding, no text, game level design concept.
  ```

