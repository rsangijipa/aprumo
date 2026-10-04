# APRUMO — WCAG 2.2 AA ACCESSIBILITY AUDIT & PROTOCOL

**Versão:** 2.0.0  
**Data:** Outubro de 2026  
**Padrão Almejado:** WCAG 2.2 Nível AA  
**Acessibilidade Sensorial:** Neurodiversidade, baixa visão, dislexia e acomodação motora fina.

---

## 1. Princípios de Acessibilidade Aprumo

1. **Nunca Depender Apenas de Cor (Critério 1.4.1):**
   Toda informação diagnóstica, fase de plano ou estado de alerta é acompanhada de texto explícito e ícone diferenciado:
   - *Modelo ABA:* Verde Sálvia + Selo textual "ABA".
   - *Modelo Denver:* Lilás Suave + Selo textual "Denver".
   - *Fases:* Linha de Base, Aquisição, Manutenção, Generalização, Concluído sempre escritos por extenso.
   - *Alertas:* Severidade alta acompanhada de ícone de exclamação e badge de texto "Prioritário".

2. **Razão de Contraste Mínimo (Critério 1.4.3 & 1.4.11):**
   - Texto normal contra fundo: ≥ 4.5:1.
   - Texto em destaque e títulos grandes: ≥ 3.0:1.
   - Componentes visuais e bordas de campos de formulário: ≥ 3.0:1 contra a superfície.
   - *Nota de Engenharia:* O neumorfismo original foi descartado na paleta padrão exatamente para cumprir esta exigência, adotando bordas nítidas de alto contraste (`--ap-border-strong: #cfc9bc`).

3. **Área Mínima de Toque (Target Size — Critério 2.5.8 do WCAG 2.2):**
   - Todos os alvos de interação e botões possuem área clicável mínima de 44x44px (ou 48x48px nos fluxos clínicos e infantis), mesmo quando o glifo do ícone visual possuir 16px ou 20px.
   - Espaçamento de pelo menos 8px entre controles vizinhos para evitar ativações falsas.

4. **Navegação por Teclado e Foco Visível (Critérios 2.1.1, 2.4.7 & 2.4.13):**
   - Anel de foco explícito (`--ap-focus: #2f6fb0`) de 3px com contraste evidente.
   - Atalhos de teclado claros (`1`, `2`, `3` para respostas; `Ctrl+K` para busca rápida; `Esc` para fechar modais/drawers).
   - Armadilhas de foco (*focus traps*) implementadas nativamente com `<dialog>` e `showModal()`.

5. **Acomodação a Movimento Reduzido (Critério 2.3.3):**
   - Suporte nativo à consulta CSS `@media (prefers-reduced-motion: reduce)`:
     ```css
     @media (prefers-reduced-motion: reduce) {
       :root {
         --ap-dur-1: 0ms;
         --ap-dur-2: 0ms;
       }
     }
     ```
   - No runtime de jogos, o modo `motion: static` suprime todas as interpolações e transições de tela, apresentando mudanças imediatas de estado para evitar náusea ou desregulação vestibular.

---

## 2. Matriz de Componentes e Validação A11y

| Componente | Papel Semântico (ARIA) | Comportamento de Teclado | Área de Toque | Suporte a Leitor de Tela |
|---|---|---|---|---|
| **Button / IconButton** | `<button type="button">` | `Enter` / `Space` | ≥ 44x44px | `aria-label` obrigatório em `IconButton` |
| **BackButton** | `<button>` ou `<a>` | `Enter` | ≥ 44x48px | Anúncio de "Voltar para [Página Anterior]" |
| **Dialog / Modal** | `<dialog aria-labelledby>` | `Esc` fecha modal | Botão de fechar 44x44px | Foco transferido para o primeiro controle; inerte no background |
| **Drawer** | `<aside role="dialog" aria-modal="true">` | `Esc` fecha drawer | Botão fechar 44x44px | Leitor anuncia título ao abrir |
| **Tabs** | `<div role="tablist">` | `ArrowLeft` / `ArrowRight` | ≥ 44px altura | `role="tab" aria-selected="true/false"` |
| **Segmented** | `<div role="group">` | `Tab` + `Space/Enter` | ≥ 44px altura | `aria-pressed="true/false"` |
| **Stepper (+ / -)** | `<div role="group">` | `Enter` / `Space` | Botões ≥ 44x44px | `<output aria-live="polite">` anuncia valor alterado |
| **Toast** | `<div role="status" aria-live="polite">` | N/A (transitório) | Não requer clique | Anúncio suave sem interrupção de foco |
| **Trial Response** | `<button class="response-btn">` | Teclas `1`, `2`, `3` | ≥ 64px altura | Anúncio de resultado e nível de dica |
