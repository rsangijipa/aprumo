# Agent Engineering & Quality Standards

Regras de engenharia baseadas nos padrões de excelência de desenvolvimento ágil e confiabilidade:

---

## 1. Test-Driven Development (TDD) & Verificação Contínua
- Todo novo fluxo de negócio, cálculo de escore psicométrico ou mutação de dados deve ser validado por testes unitários e de integração antes de ser considerado pronto.
- A suite de testes (`npm run test:run`) e o build da aplicação (`npm run build`) devem permanecer 100% verdes após qualquer modificação.
- Nunca silencie erros de tipagem (`@ts-ignore`) ou ignore testes que falharam.

## 2. Robustez de APIs e Contratos de Dados
- Toda interface com o banco de dados (Supabase / PostgreSQL) deve possuir tipagem estrita com Zod ou TypeScript interfaces derivadas.
- Tratamento explícito de erros: retorne mensagens de erro legíveis e estruturadas em formulários e mutações, em vez de erros genéricos ou `console.error` não tratado.

## 3. Segurança & Isolamento Multilocatário (Tenancy)
- Toda consulta e mutação em tabelas protegidas deve respeitar o `clinic_id` ou o contexto da clínica atual.
- Assegure validação de entrada de dados contra injeções e ataques XSS.
- Rotas e componentes restritos (como configurações clínicas e reavaliações) devem ser protegidos com checagem de papel (Admin/Psicólogo/Terapeuta) e PIN de adulto onde especificado.

## 4. Performance e Otimização Web
- Evite carregamento desnecessário de bibliotecas pesadas de terceiros; utilize code-splitting e lazy loading para componentes pesados de gráficos e formulários longos.
- Gerenciamento de cache eficiente através de TanStack Query com invalidação precisa de chaves (`queryClient.invalidateQueries`).
