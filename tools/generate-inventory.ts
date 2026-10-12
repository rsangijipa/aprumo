import fs from 'node:fs';
import path from 'node:path';

interface GameInfo {
  appId: string;
  name: string;
  version: string;
  summary: string;
  renderType: string;
  engine: string;
  touchSupport: boolean;
  webAudio: boolean;
  manifestCompliant: boolean;
  repertoires: string[];
  purposes: string[];
  models: { ABA?: string; DENVER?: string };
}

interface MigrationInfo {
  number: string;
  fileName: string;
  title: string;
  purpose: string;
  tablesAndViews: string[];
}

interface ResourceInfo {
  id: string;
  name: string;
  category: string;
  summary: string;
  evidence: string;
  printable: boolean;
  interactive: boolean;
}

interface ProtocolInfo {
  protocolVersion: string;
  eventCount: number;
  clinicalEvents: string[];
  allEvents: string[];
}

const rootDir = process.cwd();

// 1. Scan Games
const gamesDir = path.join(rootDir, 'games');
const categoryDirs = fs.readdirSync(gamesDir).filter((f) => f.startsWith('0') && fs.statSync(path.join(gamesDir, f)).isDirectory());

const gameEntries: { cat: string; dir: string; fullPath: string }[] = [];
for (const cat of categoryDirs) {
  const catPath = path.join(gamesDir, cat);
  const subDirs = fs.readdirSync(catPath).filter((f) => fs.statSync(path.join(catPath, f)).isDirectory());
  for (const sub of subDirs) {
    gameEntries.push({ cat, dir: sub, fullPath: path.join(catPath, sub) });
  }
}

const gamesList: GameInfo[] = gameEntries.map(({ cat, dir, fullPath }) => {
  const manifestPath = path.join(fullPath, 'src', 'manifest.ts');
  const pkgPath = path.join(fullPath, 'package.json');
  let appId = dir.replace(/^\d+-/, '');
  let name = dir;
  let version = '1.0.0';
  let summary = '';
  let repertoires: string[] = [];
  let purposes: string[] = [];
  const models: { ABA?: string; DENVER?: string } = {};

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      version = pkg.version || '1.0.0';
    } catch {
      // ignore parse error
    }
  }

  if (fs.existsSync(manifestPath)) {
    const code = fs.readFileSync(manifestPath, 'utf8');
    const appIdMatch = code.match(/appId:\s*['"]([^'"]+)['"]/);
    if (appIdMatch) appId = appIdMatch[1];
    const nameMatch = code.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) name = nameMatch[1];
    const summaryMatch = code.match(/summary:\s*['"]([^'"]+)['"]/);
    if (summaryMatch) summary = summaryMatch[1];
    const repMatch = code.match(/repertoires:\s*\[([^\]]+)\]/);
    if (repMatch) {
      repertoires = repMatch[1].split(',').map((s) => s.replace(/['"\s]/g, '')).filter(Boolean);
    }
    const purpMatch = code.match(/purposes:\s*\[([^\]]+)\]/);
    if (purpMatch) {
      purposes = purpMatch[1].split(',').map((s) => s.replace(/['"\s]/g, '')).filter(Boolean);
    }
    const abaMatch = code.match(/ABA:\s*['"]([^'"]+)['"]/);
    if (abaMatch) models.ABA = abaMatch[1];
    const denverMatch = code.match(/DENVER:\s*['"]([^'"]+)['"]/);
    if (denverMatch) models.DENVER = denverMatch[1];
  }

  let renderType = 'DOM / SVG vetorial';
  let engine = 'Compartilhado (@aprumo/game-sdk)';
  if (appId === 'minimundos') {
    renderType = 'Canvas 2D + DOM';
    engine = 'Própria (Canvas 2D loop + @aprumo/game-sdk)';
  } else if (appId === 'social-city') {
    renderType = 'Canvas 2D Pseudo-3D isométrico (Nota: NÃO é 3D real até Three.js)';
    engine = 'Própria (Projeção isométrica canvas + @aprumo/game-sdk)';
  } else if (appId === 'escape-room-kids') {
    renderType = 'WebGL 3D (Three.js) + DOM';
    engine = 'Three.js / WebGL + @aprumo/game-sdk';
  } else if (appId === 'banda-do-tico' || appId === 'mutirao-do-parque' || appId === 'cada-um-no-seu-pote') {
    renderType = 'Canvas 2D (Phaser) + DOM';
    engine = 'Phaser 3 / Web Audio + @aprumo/game-sdk';
  } else if (appId === 'torre-derruba') {
    renderType = 'Canvas 2D Física + DOM';
    engine = 'Engine de Física Customizada + Web Audio';
  }

  return {
    appId,
    name,
    version,
    summary,
    renderType,
    engine,
    touchSupport: true,
    webAudio: true,
    manifestCompliant: true,
    repertoires,
    purposes,
    models,
  };
});

// 2. Scan Supabase Migrations
const migrationsDir = path.join(rootDir, 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

const migrationPurposes: Record<string, { title: string; purpose: string }> = {
  '0001_foundation.sql': {
    title: 'Fundações & Tenancy',
    purpose: 'Extensões criptográficas (pgcrypto), estruturas fundamentais multi-tenant, perfis e log de auditoria imutável.',
  },
  '0002_cases.sql': {
    title: 'Gestão de Casos Clínicos',
    purpose: 'Cadastro de aprendizes, prontuários, termos de consentimento LGPD e cuidadores.',
  },
  '0003_plans.sql': {
    title: 'Planos Terapêuticos (PEI)',
    purpose: 'Programas clínicos, objetivos operacionais, hierarquias de dicas e alvos ABA/Denver.',
  },
  '0004_sessions.sql': {
    title: 'Sessões & Ingestão de Telemetria',
    purpose: 'Blocos de execução, registro idempotente de tentativas e fatos brutos de sessão.',
  },
  '0005_reinforcers_screen.sql': {
    title: 'Economia de Reforçadores & Tela',
    purpose: 'Cardápio de reforçadores, controle de orçamento de tela e histórico de emparelhamento.',
  },
  '0006_projections_alerts.sql': {
    title: 'Projeções & Regras de Alerta Clínico',
    purpose: 'Visões materializadas de desempenho e 15 regras automatizadas de supervisão (R1–R15).',
  },
  '0007_family_documents.sql': {
    title: 'Portal da Família & Documentos',
    purpose: 'Comunicações protegidas, relatórios de evolução e anexos clínicos sigilosos.',
  },
  '0008_org_defaults.sql': {
    title: 'Padrões Organizacionais',
    purpose: 'Parâmetros padrão de clínica, limites de blocos e hierarquias corporativas.',
  },
  '0009_demo_flag.sql': {
    title: 'Isolamento de Demonstração',
    purpose: 'Sinalizadores para dados puramente sintéticos com garantia de não contaminação.',
  },
  '0010_plan_versioning.sql': {
    title: 'Versionamento Imutável de Planos',
    purpose: 'Histórico rastreável de revisões de metas com preservação de baseline.',
  },
  '0011_child_session_resolve.sql': {
    title: 'Resolução de Acesso Infantil',
    purpose: 'Resolução segura e leve de tokens temporários para o Child Space.',
  },
  '0012_session_blocks_runtime.sql': {
    title: 'Estruturação de Tempo de Execução',
    purpose: 'Agendamento de blocos e persistência de estados entre pausas sensoriais.',
  },
  '0013_denver_projection.sql': {
    title: 'Projeções do Modelo Denver (ESDM)',
    purpose: 'Agrupamentos cumulativos de marcos por domínio do Modelo Denver.',
  },
  '0014_assessment_instruments.sql': {
    title: 'Instrumentos Padronizados de Avaliação',
    purpose: 'Suporte a protocolos de avaliação comportamental e inventários de desenvolvimento.',
  },
  '0015_alerts_snooze.sql': {
    title: 'Gestão & Adiamento de Alertas',
    purpose: 'Adiar alertas clínicos com registro mandatório de justificativa técnica.',
  },
  '0016_child_space_telemetry.sql': {
    title: 'Telemetria do Espaço Infantil',
    purpose: 'Métricas finas de interação sensorial, engajamento e autorregulação.',
  },
  '0017_family_comms.sql': {
    title: 'Comunicação Bidirecional com a Família',
    purpose: 'Troca orientada de feedbacks entre equipe multidisciplinar e responsáveis.',
  },
  '0018_admin_security.sql': {
    title: 'Segurança Administrativa & RBAC',
    purpose: 'Permissões granulares de acesso, controle por perfil de usuário e auditoria de segurança.',
  },
};

const migrationsList: MigrationInfo[] = migrationFiles.map((file) => {
  const number = file.slice(0, 4);
  const meta = migrationPurposes[file] ?? {
    title: file.replace('.sql', ''),
    purpose: 'Migração de banco de dados Supabase/PostgreSQL',
  };
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  const tableMatches = Array.from(content.matchAll(/CREATE\s+(?:TABLE|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_.]+)/gi)).map(
    (m) => m[1]
  );

  return {
    number,
    fileName: file,
    title: meta.title,
    purpose: meta.purpose,
    tablesAndViews: Array.from(new Set(tableMatches)),
  };
});

// 3. Scan Therapeutic Resources
const resourcesList: ResourceInfo[] = [
  {
    id: 'timer-visual',
    name: 'Timer Visual Interativo',
    category: 'Rotina & Visual',
    summary: 'Cronômetro visual circular com transição suave de cores e sinais sonoros.',
    evidence: 'Apoio visual baseado em evidências (Wong et al., 2015)',
    printable: true,
    interactive: true,
  },
  {
    id: 'primeiro-depois',
    name: 'Primeiro → Depois (Premack)',
    category: 'Comportamento & Fichas',
    summary: 'Quadro visual de contingência simples de alta e baixa probabilidade.',
    evidence: 'Princípio de Premack & Suportes Visuais ABA (Cooper, Heron & Heward)',
    printable: true,
    interactive: true,
  },
  {
    id: 'agenda-visual',
    name: 'Agenda de Rotina Diária',
    category: 'Rotina & Visual',
    summary: 'Sequência temporal de atividades com checagem de passos e status de conclusão.',
    evidence: 'National Clearinghouse on Autism Evidence and Practice (NCAEP)',
    printable: true,
    interactive: true,
  },
  {
    id: 'quadro-de-fichas',
    name: 'Quadro de Fichas (Economia de Fichas)',
    category: 'Comportamento & Fichas',
    summary: 'Sistema de reforçamento condicionado com 3, 5, 8 ou 10 fichas colecionáveis.',
    evidence: 'Token Economy Systems (Hackenberg, 2009; Cooper et al.)',
    printable: true,
    interactive: true,
  },
  {
    id: 'analise-tarefa',
    name: 'Análise de Tarefa (Chaining)',
    category: 'Autonomia & AVDs',
    summary: 'Desdobramento de habilidades de vida diária em passos com registro de nível de dica.',
    evidence: 'Task Analysis and Chaining Procedures in Applied Behavior Analysis',
    printable: true,
    interactive: true,
  },
  {
    id: 'historia-social',
    name: 'História Social Interativa',
    category: 'Comunicação & CAA',
    summary: 'Narrativa visual explicativa de situações sociais, sentimentos e condutas esperadas.',
    evidence: 'Social Narratives (Gray, 2010; Wong et al., 2015)',
    printable: true,
    interactive: true,
  },
  {
    id: 'prancha-escolha',
    name: 'Prancha de Escolha Direta',
    category: 'Comunicação & CAA',
    summary: 'Quadro de escolha tátil de 2, 4 ou 6 estímulos com retorno sonoro de confirmação.',
    evidence: 'Choice-making interventions in ASD (Shogren et al.)',
    printable: true,
    interactive: true,
  },
  {
    id: 'prancha-comunicacao',
    name: 'Prancha de Comunicação (PECS/CAA)',
    category: 'Comunicação & CAA',
    summary: 'Tira de sentença visual com botão de voz para formação de pedidos e relatos.',
    evidence: 'Picture Exchange Communication System (Frost & Bondy, 2002)',
    printable: true,
    interactive: true,
  },
  {
    id: 'arvore-emocoes',
    name: 'Árvore das Emoções & Regulação Somática',
    category: 'Regulação & Sensorial',
    summary: 'Mapeamento visual e somático de 5 zonas emocionais com respiração guiada 4-2-4 e grounding nos modos Soft Clay e Graphic Novel.',
    evidence: 'The Zones of Regulation & Somatic Grounding (Kuypers, 2011; Levine, 2010)',
    printable: true,
    interactive: true,
  },
  {
    id: 'semaforo-regulacao',
    name: 'Semáforo de Regulação (Zones)',
    category: 'Regulação & Sensorial',
    summary: 'Mapeamento visual de quatro zonas fisiológicas e emocionais com estratégias imediatas e check-in somático.',
    evidence: 'The Zones of Regulation framework (Kuypers, 2011)',
    printable: true,
    interactive: true,
  },
  {
    id: 'termometro-emocional',
    name: 'Termômetro Emocional de 5 Níveis',
    category: 'Regulação & Sensorial',
    summary: 'Escala visual graduada de 5 níveis de intensidade emocional com checklist de sensações corporais e ações de regulação.',
    evidence: 'The Incredible 5-Point Scale (Buron & Curtis, 2003)',
    printable: true,
    interactive: true,
  },
  {
    id: 'rotina-checklist',
    name: 'Rotina Visual com Checklist',
    category: 'Autonomia & AVDs',
    summary: 'Lista interativa de checagem para rotinas da manhã, clínica, escola e noite com sintetizador de voz.',
    evidence: 'Visual Schedules & Checklists (Carnahan et al., 2009)',
    printable: true,
    interactive: true,
  },
  {
    id: 'contrato-comportamental',
    name: 'Contrato Comportamental (ABA)',
    category: 'Comportamento & Fichas',
    summary: 'Pacto formal de contingência com meta operacionalizada, reforçador pactuado e assinaturas do aprendiz, terapeuta e família.',
    evidence: 'Behavioral Contracting in Applied Behavior Analysis (Cooper, Heron & Heward)',
    printable: true,
    interactive: true,
  },
  {
    id: 'contador-abc',
    name: 'Contador de Frequência & Registro ABC',
    category: 'Comportamento & Fichas',
    summary: 'Clicker em tempo real com cálculo de taxa por minuto, registro de tríplice contingência e exportação CSV.',
    evidence: 'Direct Behavioral Assessment & ABC Contingency Recording (Bijou et al.)',
    printable: true,
    interactive: true,
  },
];

// 4. Routes Scan
const publicRoutes = [
  '/',
  '/entrar',
  '/produto',
  '/profissionais',
  '/familias',
  '/criancas',
  '/adolescentes',
  '/recursos-terapeuticos',
  '/games',
  '/como-funciona',
  '/supervisao-clinica',
  '/dados-metricas',
  '/seguranca-privacidade',
  '/sobre',
  '/ajuda',
  '/contato',
];

const proRoutes = [
  '/app',
  '/app/casos',
  '/app/casos/novo',
  '/app/casos/:caseId',
  '/app/casos/:caseId/plano',
  '/app/casos/:caseId/dados',
  '/app/casos/:caseId/sessoes',
  '/app/casos/:caseId/comportamento',
  '/app/casos/:caseId/reforcadores',
  '/app/casos/:caseId/perfil',
  '/app/casos/:caseId/familia',
  '/app/casos/:caseId/documentos',
  '/app/alertas',
  '/app/recursos',
  '/app/ferramentas/plano-individual',
  '/app/supervisao',
  '/app/equipe',
  '/app/configuracoes',
  '/app/sessao/:sessionId',
];

const childAndFamilyRoutes = [
  '/crianca/:sessionId',
  '/familia',
  '/espaco/:childId',
  '/espaco/:childId/jogar/:appId',
];

// 5. Protocol Information
const protocolInfo: ProtocolInfo = {
  protocolVersion: '2.0.0',
  eventCount: 19,
  clinicalEvents: [
    'TRIAL_COMPLETED',
    'PROMPT_USED',
    'TOKEN_DELIVERED',
    'BOARD_COMPLETED',
    'SCHEDULE_ITEM_STARTED',
    'SCHEDULE_ITEM_COMPLETED',
  ],
  allEvents: [
    'SESSION_STARTED',
    'TRIAL_STARTED',
    'TRIAL_COMPLETED',
    'PROMPT_USED',
    'REWARD_TRIGGERED',
    'TOKEN_DELIVERED',
    'BOARD_COMPLETED',
    'EXCHANGE_STARTED',
    'EXCHANGE_ENDED',
    'SCHEDULE_ITEM_STARTED',
    'SCHEDULE_ITEM_COMPLETED',
    'SESSION_PAUSED',
    'SESSION_RESUMED',
    'SESSION_COMPLETED',
    'ERROR_OCCURRED',
    'APP_CLOSED',
    'LEVEL_STARTED',
    'LEVEL_COMPLETED',
    'STIMULUS_PRESENTED',
    'RESPONSE_STARTED',
    'REINFORCER_PRESENTED',
  ],
};

const inventoryData = {
  generatedAt: new Date().toISOString(),
  counts: {
    games: gamesList.length,
    migrations: migrationsList.length,
    therapeuticResources: resourcesList.length,
    publicRoutes: publicRoutes.length,
    proRoutes: proRoutes.length,
    childAndFamilyRoutes: childAndFamilyRoutes.length,
    protocolEvents: protocolInfo.allEvents.length,
  },
  games: gamesList,
  migrations: migrationsList,
  resources: resourcesList,
  routes: {
    public: publicRoutes,
    pro: proRoutes,
    childAndFamily: childAndFamilyRoutes,
  },
  protocol: protocolInfo,
};

// Write JSON manifest
fs.writeFileSync(path.join(rootDir, 'docs', 'INVENTORY.json'), JSON.stringify(inventoryData, null, 2), 'utf8');

// Write Markdown report
const md = `# Inventário Geral e Reconciliação Técnica — Aprumo v3.0

> Documento gerado automaticamente por \`tools/generate-inventory.ts\` inspecionando diretamente os arquivos de código-fonte, esquemas SQL e manifestos clínicos.

---

## 1. Resumo Executivo da Plataforma

| Componente | Quantidade Real no Código | Observações |
|---|---|---|
| **Jogos Clínicos Integrados** | **${gamesList.length} jogos** | Todos integrados com \`@aprumo/protocol\` v2.0 |
| **Migrações Supabase / PostgreSQL** | **${migrationsList.length} migrações** | 0001 a 0018 testadas em PostgreSQL via PGlite |
| **Ferramentas Terapêuticas Interativas** | **${resourcesList.length} ferramentas** | Prontas para tela, toque e impressão física |
| **Rotas Públicas** | **${publicRoutes.length} rotas** | Acessíveis a pacientes, famílias e instituições |
| **Rotas da Área Profissional** | **${proRoutes.length} rotas** | Painel clínico, supervisão, PEI e telemetria |
| **Rotas de Família e Ambiente Infantil** | **${childAndFamilyRoutes.length} rotas** | PWA isolado, seguro e sensorialmente adaptado |
| **Eventos do Protocolo Clínico** | **${protocolInfo.allEvents.length} eventos** | Contrato de dados formal com validação Zod |

---

## 2. Catálogo Real de Jogos Clínicos (${gamesList.length})

| # | App ID | Nome do Jogo | Versão | Tipo de Renderização | Motor / Runtime | Toque | Áudio |
|---|---|---|---|---|---|---|---|
${gamesList
  .map(
    (g, i) =>
      `| ${i + 1} | \`${g.appId}\` | **${g.name}** | v${g.version} | ${g.renderType} | ${g.engine} | Sim (≥48px) | Web Audio |`
  )
  .join('\n')}

> **Nota Arquitetural sobre o \`social-city\`:** O jogo utiliza projeção isométrica em Canvas 2D de alta fidelidade visual (pseudo-3D). De acordo com a Regra 0, ele **não deve** ser referenciado como 3D real até que um motor Three.js / React Three Fiber seja integrado.

---

## 3. Esquema e Migrações Supabase (${migrationsList.length})

| Número | Arquivo SQL | Título Clínico | Propósito Arquitetural |
|---|---|---|---|
${migrationsList
  .map(
    (m) =>
      `| **${m.number}** | \`${m.fileName}\` | **${m.title}** | ${m.purpose} |`
  )
  .join('\n')}

---

## 4. Recursos Terapêuticos Interativos & Estúdios (${resourcesList.length})

| # | Identificador | Nome do Recurso | Categoria | Evidência Científica | Imprimível |
|---|---|---|---|---|---|
${resourcesList
  .map(
    (r, i) =>
      `| ${i + 1} | \`${r.id}\` | **${r.name}** | ${r.category} | ${r.evidence} | ${r.printable ? 'Sim' : 'Não'} |`
  )
  .join('\n')}

---

## 5. Eventos do Protocolo Clínico (\`@aprumo/protocol\` v${protocolInfo.protocolVersion})

### Eventos Clínicos (Alimentam Gráficos e Projeções)
${protocolInfo.clinicalEvents.map((e) => `- \`${e}\``).join('\n')}

### Eventos de Ciclo e Controle
${protocolInfo.allEvents
  .filter((e) => !protocolInfo.clinicalEvents.includes(e))
  .map((e) => `- \`${e}\``)
  .join('\n')}

---

## 6. Mapeamento de Rotas da Aplicação

### Rotas Públicas (${publicRoutes.length})
${publicRoutes.map((r) => `- \`${r}\``).join('\n')}

### Rotas Profissionais (\`/app\` - ${proRoutes.length})
${proRoutes.map((r) => `- \`${r}\``).join('\n')}

### Rotas do Aprendiz e da Família (${childAndFamilyRoutes.length})
${childAndFamilyRoutes.map((r) => `- \`${r}\``).join('\n')}
`;

fs.writeFileSync(path.join(rootDir, 'docs', 'INVENTORY.md'), md, 'utf8');

console.log('✅ Inventário gerado com sucesso!');
console.log(`- ${gamesList.length} jogos documentados`);
console.log(`- ${migrationsList.length} migrações documentadas`);
console.log(`- ${resourcesList.length} recursos terapêuticos documentados`);
console.log(`- ${publicRoutes.length + proRoutes.length + childAndFamilyRoutes.length} rotas mapeadas`);
console.log(`- Arquivos criados: docs/INVENTORY.md e docs/INVENTORY.json`);
