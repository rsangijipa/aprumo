const fs = require('fs');
const path = require('path');

const destDir = path.resolve(__dirname, '../apps/web/public/assets/games');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const svgs = {
  'escolha-pela-instrucao': {
    bg1: '#2563eb', bg2: '#1d4ed8', accent: '#fbbf24',
    title: 'Missão Instrução', subtitle: 'Compreensão Auditiva',
    icon: '<circle cx="320" cy="150" r="65" fill="#60a5fa" filter="url(#shadow)"/><path d="M290 150 A30 30 0 0 1 350 150 A30 30 0 0 1 290 150" fill="#ffffff" opacity="0.9"/><path d="M310 120 L310 180 L335 165 L350 180 L350 120 Z" fill="#f59e0b"/><circle cx="380" cy="120" r="16" fill="#fef08a"/><circle cx="410" cy="105" r="10" fill="#fef08a"/><circle cx="260" cy="120" r="16" fill="#93c5fd"/>'
  },
  'organize-categoria': {
    bg1: '#10b981', bg2: '#047857', accent: '#f59e0b',
    title: 'Organize as Coisas', subtitle: 'Categorias & Pareamento',
    icon: '<rect x="240" y="110" width="75" height="80" rx="14" fill="#34d399" filter="url(#shadow)"/><rect x="330" y="110" width="75" height="80" rx="14" fill="#fbbf24" filter="url(#shadow)"/><circle cx="277" cy="150" r="20" fill="#ffffff"/><polygon points="367,130 385,165 350,165" fill="#ffffff"/>'
  },
  'memoria-bichos': {
    bg1: '#8b5cf6', bg2: '#6d28d9', accent: '#ec4899',
    title: 'Memória dos Bichos', subtitle: 'Memória de Trabalho',
    icon: '<rect x="250" y="105" width="65" height="90" rx="12" fill="#a78bfa" filter="url(#shadow)"/><rect x="330" y="105" width="65" height="90" rx="12" fill="#f472b6" filter="url(#shadow)"/><circle cx="282" cy="145" r="18" fill="#ffffff"/><circle cx="362" cy="145" r="18" fill="#ffffff"/><circle cx="278" cy="142" r="4" fill="#4c1d95"/><circle cx="287" cy="142" r="4" fill="#4c1d95"/><circle cx="358" cy="142" r="4" fill="#831843"/><circle cx="367" cy="142" r="4" fill="#831843"/>'
  },
  'par-perfeito': {
    bg1: '#f59e0b', bg2: '#d97706', accent: '#3b82f6',
    title: 'Par Perfeito', subtitle: 'Associação Conceitual',
    icon: '<circle cx="280" cy="150" r="45" fill="#fcd34d" filter="url(#shadow)"/><circle cx="360" cy="150" r="45" fill="#60a5fa" filter="url(#shadow)"/><path d="M260 145 Q280 165 300 145" stroke="#78350f" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M340 145 Q360 165 380 145" stroke="#1e3a8a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M310 135 L330 135" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>'
  },
  'cada-um-no-seu-pote': {
    bg1: '#06b6d4', bg2: '#0e7490', accent: '#f97316',
    title: 'Cada Um no Seu Pote', subtitle: 'Classificação Multicritério',
    icon: '<rect x="230" y="130" width="55" height="65" rx="10" fill="#22d3ee"/><rect x="295" y="120" width="55" height="75" rx="10" fill="#fb923c"/><rect x="360" y="130" width="55" height="65" rx="10" fill="#4ade80"/><circle cx="257" cy="105" r="14" fill="#cffafe"/><circle cx="322" cy="95" r="14" fill="#ffedd5"/><circle cx="387" cy="105" r="14" fill="#dcfce7"/>'
  },
  'olha-comigo': {
    bg1: '#ec4899', bg2: '#be185d', accent: '#38bdf8',
    title: 'Olha Comigo', subtitle: 'Atenção Compartilhada',
    icon: '<ellipse cx="280" cy="150" rx="35" ry="22" fill="#ffffff" filter="url(#shadow)"/><circle cx="288" cy="150" r="14" fill="#38bdf8"/><circle cx="291" cy="147" r="5" fill="#ffffff"/><ellipse cx="360" cy="150" rx="35" ry="22" fill="#ffffff" filter="url(#shadow)"/><circle cx="368" cy="150" r="14" fill="#38bdf8"/><circle cx="371" cy="147" r="5" fill="#ffffff"/><polygon points="410,135 440,150 410,165" fill="#fef08a"/>'
  },
  'minha-vez-sua-vez': {
    bg1: '#6366f1', bg2: '#4338ca', accent: '#22c55e',
    title: 'Minha Vez, Sua Vez', subtitle: 'Turnos & Cooperação',
    icon: '<circle cx="270" cy="150" r="42" fill="#818cf8"/><circle cx="370" cy="150" r="42" fill="#4ade80"/><path d="M290 120 C320 100 350 120 350 120" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/><polygon points="355,120 345,112 345,128" fill="#ffffff"/><path d="M350 180 C320 200 290 180 290 180" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/><polygon points="285,180 295,172 295,188" fill="#ffffff"/>'
  },
  'social-city': {
    bg1: '#0284c7', bg2: '#0369a1', accent: '#eab308',
    title: 'Social City 3D', subtitle: 'Cenários Urbanos & Interação',
    icon: '<rect x="250" y="120" width="40" height="80" rx="4" fill="#38bdf8"/><rect x="300" y="95" width="48" height="105" rx="4" fill="#fde047"/><rect x="358" y="130" width="38" height="70" rx="4" fill="#a7f3d0"/><rect x="260" y="135" width="8" height="10" fill="#ffffff"/><rect x="275" y="135" width="8" height="10" fill="#ffffff"/><rect x="312" y="110" width="10" height="12" fill="#0284c7"/><rect x="328" y="110" width="10" height="12" fill="#0284c7"/>'
  },
  'espelho-magico': {
    bg1: '#14b8a6', bg2: '#0f766e', accent: '#f43f5e',
    title: 'Espelho Mágico', subtitle: 'Imitação de Gestos',
    icon: '<ellipse cx="320" cy="145" rx="60" ry="70" fill="#5eead4" stroke="#ffffff" stroke-width="6" filter="url(#shadow)"/><circle cx="320" cy="135" r="26" fill="#ffe4e6"/><ellipse cx="320" cy="175" rx="35" ry="22" fill="#fda4af"/><circle cx="312" cy="132" r="3" fill="#be123c"/><circle cx="328" cy="132" r="3" fill="#be123c"/><path d="M315 142 Q320 148 325 142" stroke="#be123c" stroke-width="2" fill="none"/>'
  },
  'tambor-da-imitacao': {
    bg1: '#e11d48', bg2: '#9f1239', accent: '#facc15',
    title: 'Tambor da Imitação', subtitle: 'Ritmo & Resposta Sonora',
    icon: '<ellipse cx="320" cy="130" rx="65" ry="25" fill="#fef08a" stroke="#ffffff" stroke-width="4"/><path d="M255 130 L255 180 Q320 220 385 180 L385 130 Z" fill="#fb7185"/><ellipse cx="320" cy="180" rx="65" ry="22" fill="#f43f5e"/><line x1="280" y1="85" x2="305" y2="120" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><circle cx="280" cy="85" r="8" fill="#facc15"/><line x1="360" y1="85" x2="335" y2="120" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><circle cx="360" cy="85" r="8" fill="#facc15"/>'
  },
  'siga-o-mestre': {
    bg1: '#84cc16', bg2: '#4d7c0f', accent: '#38bdf8',
    title: 'Siga o Mestre', subtitle: 'Imitação Motora Fina & Ampla',
    icon: '<circle cx="285" cy="140" r="32" fill="#a3e635" filter="url(#shadow)"/><circle cx="360" cy="150" r="26" fill="#bef264" filter="url(#shadow)"/><path d="M285 172 L285 205" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><path d="M360 176 L360 205" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><path d="M260 150 L310 135" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><path d="M340 160 L380 148" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>'
  },
  'danca-do-congelar': {
    bg1: '#0ea5e9', bg2: '#0369a1', accent: '#a855f7',
    title: 'Dança do Congelar', subtitle: 'Controle Inibitório Musical',
    icon: '<circle cx="320" cy="145" r="55" fill="#bae6fd" filter="url(#shadow)"/><polygon points="320,105 332,135 365,135 338,153 348,185 320,165 292,185 302,153 275,135 308,135" fill="#ffffff"/><circle cx="320" cy="145" r="12" fill="#38bdf8"/>'
  },
  'minimundos': {
    bg1: '#10b981', bg2: '#047857', accent: '#f59e0b',
    title: 'MiniMundos', subtitle: 'Brincar Simbólico & Cenários',
    icon: '<ellipse cx="320" cy="180" rx="110" ry="35" fill="#34d399" filter="url(#shadow)"/><rect x="270" y="125" width="45" height="45" rx="6" fill="#fbbf24"/><polygon points="265,125 292,95 320,125" fill="#f87171"/><rect x="335" y="110" width="35" height="60" rx="6" fill="#60a5fa"/><polygon points="330,110 352,85 375,110" fill="#a78bfa"/><circle cx="250" cy="145" r="14" fill="#22c55e"/><rect x="247" y="155" width="6" height="20" fill="#92400e"/>'
  },
  'causa-efeito': {
    bg1: '#f97316', bg2: '#c2410c', accent: '#fbbf24',
    title: 'Botão Mágico', subtitle: 'Causa e Efeito Sensorial',
    icon: '<circle cx="320" cy="150" r="65" fill="#fed7aa" filter="url(#shadow)"/><circle cx="320" cy="150" r="45" fill="#ea580c"/><polygon points="310,130 340,150 310,170" fill="#ffffff"/><circle cx="245" cy="105" r="12" fill="#fde047"/><circle cx="395" cy="110" r="15" fill="#38bdf8"/><circle cx="385" cy="190" r="10" fill="#4ade80"/><circle cx="250" cy="185" r="14" fill="#c084fc"/>'
  },
  'circuito-executivo': {
    bg1: '#6366f1', bg2: '#4338ca', accent: '#ec4899',
    title: 'Circuito Divertido', subtitle: 'Funções Executivas & Foco',
    icon: '<rect x="240" y="105" width="160" height="90" rx="18" fill="#4f46e5" filter="url(#shadow)"/><circle cx="285" cy="150" r="24" fill="#22c55e"/><polygon points="350,135 375,150 350,165" fill="#f43f5e"/><path d="M255 180 L385 180" stroke="#a5b4fc" stroke-width="4" stroke-dasharray="6 6"/>'
  },
  'missao-independencia': {
    bg1: '#059669', bg2: '#047857', accent: '#fbbf24',
    title: 'Missão Independência', subtitle: 'Autonomia & Vida Real',
    icon: '<rect x="260" y="105" width="120" height="90" rx="14" fill="#34d399" filter="url(#shadow)"/><rect x="295" y="88" width="50" height="20" rx="6" fill="#f59e0b"/><line x1="260" y1="145" x2="380" y2="145" stroke="#065f46" stroke-width="4"/><circle cx="320" cy="145" r="12" fill="#fbbf24"/>'
  },
  'pequeno-chef': {
    bg1: '#e11d48', bg2: '#be123c', accent: '#fbbf24',
    title: 'Pequeno Chef', subtitle: 'Sequência & Rotinas Culinárias',
    icon: '<ellipse cx="320" cy="170" rx="70" ry="30" fill="#fecdd3" filter="url(#shadow)"/><ellipse cx="320" cy="160" rx="50" ry="16" fill="#fb7185"/><path d="M295 125 C295 95 345 95 345 125" fill="#ffffff"/><rect x="290" y="120" width="60" height="14" rx="4" fill="#ffffff"/><line x1="260" y1="120" x2="285" y2="150" stroke="#fbbf24" stroke-width="5" stroke-linecap="round"/>'
  },
  'historia-ordem': {
    bg1: '#8b5cf6', bg2: '#6d28d9', accent: '#f59e0b',
    title: 'História em Ordem', subtitle: 'Sequência Temporal & Enredo',
    icon: '<rect x="240" y="110" width="45" height="65" rx="8" fill="#c4b5fd" filter="url(#shadow)"/><text x="262" y="148" text-anchor="middle" font-size="20" font-weight="bold" fill="#4c1d95">1</text><rect x="298" y="110" width="45" height="65" rx="8" fill="#c4b5fd" filter="url(#shadow)"/><text x="320" y="148" text-anchor="middle" font-size="20" font-weight="bold" fill="#4c1d95">2</text><rect x="355" y="110" width="45" height="65" rx="8" fill="#c4b5fd" filter="url(#shadow)"/><text x="377" y="148" text-anchor="middle" font-size="20" font-weight="bold" fill="#4c1d95">3</text>'
  },
  'passo-a-passo': {
    bg1: '#2563eb', bg2: '#1d4ed8', accent: '#10b981',
    title: 'Passo a Passo', subtitle: 'Encadeamento de Tarefas',
    icon: '<rect x="250" y="105" width="140" height="95" rx="14" fill="#60a5fa" filter="url(#shadow)"/><circle cx="280" cy="130" r="12" fill="#22c55e"/><path d="M275 130 L279 134 L286 126" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="302" y="126" width="70" height="8" rx="4" fill="#ffffff"/><circle cx="280" cy="160" r="12" fill="#22c55e"/><path d="M275 160 L279 164 L286 156" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="302" y="156" width="55" height="8" rx="4" fill="#ffffff"/>'
  },
  'quadro-de-conquistas': {
    bg1: '#d97706', bg2: '#b45309', accent: '#fef08a',
    title: 'Quadro de Conquistas', subtitle: 'Reforçamento Positivo & Metas',
    icon: '<polygon points="320,95 336,138 382,141 346,170 357,215 320,190 283,215 294,170 258,141 304,138" fill="#fbbf24" filter="url(#shadow)"/><polygon points="320,108 332,142 368,145 340,168 348,202 320,183 292,202 300,168 272,145 308,142" fill="#fef08a"/>'
  }
};

for (const [appId, data] of Object.entries(svgs)) {
  const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${data.bg1}"/>
      <stop offset="100%" stop-color="${data.bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.15"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="640" height="360" rx="24" fill="url(#grad)"/>
  <rect width="640" height="360" rx="24" fill="url(#glow)"/>
  <circle cx="80" cy="70" r="45" fill="#ffffff" opacity="0.1"/>
  <circle cx="570" cy="280" r="70" fill="#ffffff" opacity="0.08"/>
  <circle cx="540" cy="80" r="35" fill="#ffffff" opacity="0.12"/>
  <g id="hero-art">
    ${data.icon}
  </g>
  <rect x="60" y="260" width="520" height="68" rx="16" fill="#000000" fill-opacity="0.25" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5"/>
  <text x="320" y="292" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700">${data.title}</text>
  <text x="320" y="313" text-anchor="middle" fill="#fef08a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" letter-spacing="0.05em">${data.subtitle.toUpperCase()}</text>
</svg>`;

  const destPath = path.join(destDir, appId + '.svg');
  fs.writeFileSync(destPath, content, 'utf8');
  console.log('Created SVG for ' + appId);
}
console.log('Finished creating all 20 game SVGs!');
