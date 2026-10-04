# UI/UX Pro Max — Design System & Interaction Rules

Este repositório adota as diretrizes do **UI/UX Pro Max** para toda a experiência de usuário, componentes e páginas do Aprumo.

---

## 1. Princípios Fundamentais

1. **Acessibilidade Crítica (WCAG 2.1 AA/AAA)**:
   - Contraste de cor mínimo de 4.5:1 para texto normal e 3:1 para texto grande e componentes interativos.
   - Foco visual nítido (`ring-2 ring-primary ring-offset-2`) em todos os elementos navegáveis por teclado. Nunca desabilite `outline` sem substituto visível.
   - Alvos de toque com tamanho mínimo de `44x44px` e espaçamento mínimo de `8px`.
   - Suporte nativo a leitores de tela (`aria-label`, `aria-expanded`, `aria-describedby`, `role`).
   - Respeito irrestrito a `prefers-reduced-motion: reduce`.

2. **Harmonia Visual & Design Clínico-Pediátrico**:
   - Paleta equilibrada com foco em bem-estar e clareza clínica: ciano/teal calmante (`#0891B2`), esmeralda para sucesso/saúde (`#059669`), fundos suaves (`#F8FAFC` / `#ECFEFF`) e superfícies nítidas com sombras suaves (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05)`).
   - Sem gradientes neon saturados ou elementos visuais estridentes que causem sobrecarga cognitiva em crianças com TEA/TDAH ou terapeutas em sessões longas.
   - Ícones SVG semânticos (Lucide Icons) com rótulos descritivos; nunca use emojis soltos como botões ou indicadores de status.

3. **Tipografia e Hierarquia**:
   - Escala tipográfica fluida e acessível: corpo base `16px`, entrelinha `1.5`, peso equilibrado.
   - Hierarquia clara com um único `<h1>` por página, subtítulos ordenados semanticamente (`<h2>`, `<h3>`).
   - Rótulos visíveis acima dos campos de formulário; nunca use `placeholder` como substituto de `label`.

4. **Micro-interações e Estados**:
   - Feedbacks visuais e de toque com transições suaves (`150ms` a `250ms`, `cubic-bezier(0.4, 0, 0.2, 1)`).
   - Estados bem definidos: default, hover, focus-visible, active, disabled e loading com skeletons ou spinners acessíveis.
   - Indicação visual imediata em qualquer ação assíncrona (salvamento de avaliação, cálculo de escore, transição de tela).

5. **Responsividade Multi-Dispositivo**:
   - Layout fluido e resiliente testado em breakpoints padrão: Mobile (`375px`), Tablet (`768px`), Desktop (`1024px`), Widescreen (`1440px`).
   - Sem rolagem horizontal indesejada; contêineres flexíveis com `min-w-0` e quebra de palavras segura.
