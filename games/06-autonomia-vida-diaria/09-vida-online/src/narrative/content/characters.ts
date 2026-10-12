import type { Character } from '../types';

export const CHARACTERS: Record<string, Character> = {
  player: {
    id: 'player',
    name: 'Você',
    handle: '@voce',
    role: 'player',
    avatarId: 'avatar-player',
    status: 'Online no Nexo',
    bio: 'Estudante, 15 anos. Explorando o Nexo OS.',
    styleDescription: 'Suas próprias escolhas e tom de conversa.'
  },
  cris: {
    id: 'cris',
    name: 'Cris Oliveira',
    handle: '@cris_oli',
    role: 'friend',
    avatarId: 'avatar-cris',
    status: 'Ouvindo música 🎧',
    bio: 'Amigo de infância. Gosta de jogos de estratégia e falar na lata, mas respeita quando o outro precisa de espaço.',
    verified: false,
    typingDelayMs: 1200,
    styleDescription: 'Digita rápido, usa pouca pontuação, sincero e leal.'
  },
  rafa: {
    id: 'rafa',
    name: 'Rafa Soares',
    handle: '@rafa_s',
    role: 'classmate',
    avatarId: 'avatar-rafa',
    status: 'Online agora',
    bio: 'Colega de turma. Adora stickers, zoeira e compartilhar novidades antes de todo mundo.',
    verified: false,
    typingDelayMs: 1000,
    styleDescription: 'Usa gírias, emojis, CAPS e mensagens picadas em várias linhas.'
  },
  bia: {
    id: 'bia',
    name: 'Bia Mendes',
    handle: '@bia_mendes',
    role: 'classmate',
    avatarId: 'avatar-bia',
    status: 'Estudando 📚',
    bio: 'Representante de projetos da turma. Valoriza organização e clareza nos grupos escolares.',
    verified: false,
    typingDelayMs: 1400,
    styleDescription: 'Pontual, educada, escreve frases completas e claras.'
  },
  leo: {
    id: 'leo',
    name: 'Leo Santos',
    handle: '@leo_gamer99',
    role: 'friend',
    avatarId: 'avatar-leo',
    status: 'Jogando Galaxy Rivals',
    bio: 'Focado em subir de ranque no PlayHub. Às vezes insiste um pouco demais quando quer jogar em squad.',
    verified: false,
    typingDelayMs: 1100,
    styleDescription: 'Focado em mecânica de jogo, abreviações de games (gg, dropa, call, duo).'
  },
  sam: {
    id: 'sam',
    name: 'Sam Costa',
    handle: '@sam_arte',
    role: 'friend',
    avatarId: 'avatar-sam',
    status: 'Desenhando...',
    bio: 'Artista digital. Cria stickers para o Pulse. Introvertido(a), prefere conversas diretas a grupos cheios.',
    verified: false,
    typingDelayMs: 1600,
    styleDescription: 'Atencioso(a), calmo(a), usa reticências e se preocupa com o clima.'
  },
  maya: {
    id: 'maya',
    name: 'Maya Rocha',
    handle: '@maya_vibe',
    role: 'classmate',
    avatarId: 'avatar-maya',
    status: 'No Feed 📸',
    bio: 'Sempre por dentro dos trends do colégio. Curte interações no Loop e fotos no mural.',
    verified: false,
    typingDelayMs: 1300,
    styleDescription: 'Expressiva, preocupada com o que pensam, usa abreviações jovens.'
  },
  tio_roberto: {
    id: 'tio_roberto',
    name: 'Tio Roberto',
    handle: '@roberto_familia',
    role: 'family',
    avatarId: 'avatar-roberto',
    status: 'Disponível',
    bio: 'Tio parceiro. Trabalha com tecnologia, sempre aberto para tirar dúvidas sem dar bronca.',
    verified: true,
    typingDelayMs: 1800,
    styleDescription: 'Acolhedor, maduro, frases carinhosas e orientações práticas.'
  },
  prof_helena: {
    id: 'prof_helena',
    name: 'Profa. Helena',
    handle: '@prof_helena_ciencias',
    role: 'teacher',
    avatarId: 'avatar-prof',
    status: 'Horário de atendimento 08h-17h',
    bio: 'Professora orientadora da feira de ciências. Aberta a mediar dúvidas dos alunos.',
    verified: true,
    typingDelayMs: 1500,
    styleDescription: 'Formal, incentivadora e atenta ao bem-estar dos alunos.'
  },
  lucas_proplayer: {
    id: 'lucas_proplayer',
    name: 'Lucas_ProPlayer_BR',
    handle: '@lucas_rank1',
    role: 'stranger',
    avatarId: 'avatar-stranger1',
    status: 'Online no PlayHub',
    bio: 'Top 50 Regional no Galaxy Rivals. Recrutando novatos com potencial para clã vip.',
    verified: false,
    typingDelayMs: 1200,
    styleDescription: 'Elogioso demais, cria senso de urgência e exclusividade.'
  },
  desconhecido: {
    id: 'desconhecido',
    name: 'Perfil Privado (ID 8841)',
    handle: '@user_884129',
    role: 'stranger',
    avatarId: 'avatar-unknown',
    status: 'Última vez há pouco',
    bio: 'Sem informações públicas. Conta criada há 3 dias.',
    verified: false,
    typingDelayMs: 1000,
    styleDescription: 'Direto, vago, insiste em receber respostas imediatas.'
  },
  nexo_seguranca: {
    id: 'nexo_seguranca',
    name: 'Nexo Segurança & Vault',
    handle: '@nexo_vault_security',
    role: 'moderator',
    avatarId: 'avatar-system',
    status: 'Serviço do Sistema',
    bio: 'Módulo de proteção de credenciais, permissões e integridade do seu Nexo OS.',
    verified: true,
    typingDelayMs: 400,
    styleDescription: 'Notificações de sistema e auditorias de segurança.'
  }
};
