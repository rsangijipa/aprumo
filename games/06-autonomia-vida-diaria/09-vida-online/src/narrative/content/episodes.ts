import type { Episode } from '../types';

export const EPISODES: Episode[] = [
  /* ------------------------------------------------------------------------
     EPISÓDIO 1: GRUPO NOVO
     ------------------------------------------------------------------------ */
  {
    id: 'ep1',
    number: 1,
    title: 'Grupo Novo',
    subtitle: 'Primeiro dia no grupo da turma do colégio',
    theme: 'Convivência, humor e limites de grupo',
    targetApp: 'pulse',
    chatPartnerId: 'rafa',
    description: 'Você acabou de ser adicionado no grupo da turma. Entre piadas e apresentações, alguém compartilha uma figurinha zoando um colega que mal fala.',
    startingNodeId: 'ep1_start',
    summary: {
      takeaway: 'Estar em um grupo não significa concordar com tudo o que é postado para se sentir aceito.',
      keyThemes: ['Pressão de pertencimento', 'Piadas que machucam', 'Apoio discreto'],
      alternativeReflections: [
        'Mudar de assunto de forma leve muitas vezes quebra o ciclo de zoeira sem criar um barraco desnecessário.',
        'Mandar mensagem no privado para quem foi zoado mostra empatia sem expor ninguém no meio do tiroteio.'
      ]
    },
    nodes: {
      ep1_start: {
        id: 'ep1_start',
        title: 'Entrando na sala',
        messages: [
          {
            id: 'm1_1',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Eaeee galera nova!! Bem-vindos ao grupo oficial (sqn) da turma 9B! 🚀🔥',
            timestamp: '14:20'
          },
          {
            id: 'm1_2',
            senderId: 'bia',
            senderType: 'contact',
            text: 'Gente, lembrando que esse grupo é pra gente alinhar a apresentação da feira e avisos, beleza? Sem floodar.',
            timestamp: '14:21'
          },
          {
            id: 'm1_3',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Ih Bia, relaxa aí kkkk. Olha o desenho que o Sam fez na aula de artes ontem kkkkkk "obra prima" pura',
            timestamp: '14:22'
          },
          {
            id: 'm1_4',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Parece um boneco de massinha atropelado kkkkk @sam_arte comenta aí mano',
            timestamp: '14:22'
          },
          {
            id: 'm1_5',
            senderId: 'sam',
            senderType: 'contact',
            text: '...era só um rascunho de aquecimento, Rafa.',
            timestamp: '14:23'
          }
        ],
        choices: [
          {
            id: 'c1_1',
            label: '😂 Mandar emoji rindo ("kkkkk sacanagem")',
            description: 'Entrar na onda da zoação para não parecer sério demais.',
            targetNodeId: 'ep1_laughed',
            effects: {
              indicatorChanges: { limites: -10, clareza: -5, confianca: +5 },
              setFlags: { ep1_choice: 'laughed' },
              addFacts: ['Você riu da piada do Rafa sobre o desenho do Sam.']
            }
          },
          {
            id: 'c1_2',
            label: '🎨 Elogiar o traço do Sam e mudar de assunto',
            description: 'Valorizar o colega sem ser agressivo e puxar o tema da feira.',
            targetNodeId: 'ep1_supported_public',
            effects: {
              indicatorChanges: { clareza: +10, limites: +10, confianca: +10 },
              setFlags: { ep1_choice: 'supported_public' },
              addFacts: ['Você elogiou o desenho do Sam em público no grupo.']
            }
          },
          {
            id: 'c1_3',
            label: '💬 Chamar o Sam no privado e ignorar o grupo',
            description: 'Oferecer apoio individual longe dos olhares da turma.',
            targetNodeId: 'ep1_supported_private',
            effects: {
              indicatorChanges: { privacidade: +15, limites: +10, confianca: +15 },
              setFlags: { ep1_choice: 'supported_private' },
              addFacts: ['Você foi conversar com o Sam no privado para saber como ele estava.']
            }
          }
        ]
      },
      ep1_laughed: {
        id: 'ep1_laughed',
        title: 'Repercussão da risada',
        messages: [
          {
            id: 'm1_6a',
            senderId: 'player',
            senderType: 'player',
            text: 'kkkkk sacanagem Rafa',
            timestamp: '14:24'
          },
          {
            id: 'm1_7a',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Viu só Sam? Até quem acabou de chegar achou zoeira kkkk',
            timestamp: '14:24'
          },
          {
            id: 'm1_8a',
            senderId: 'sam',
            senderType: 'contact',
            text: 'beleza então.',
            timestamp: '14:25'
          },
          {
            id: 'm1_9a',
            senderId: 'cris',
            senderType: 'contact',
            text: 'Mano, sem necessidade isso aí no grupo logo na chegada.',
            timestamp: '14:26'
          }
        ],
        choices: [
          {
            id: 'c1_1_recant',
            label: 'Pedir desculpa no privado para o Sam',
            targetNodeId: 'ep1_conclude_apology',
            effects: {
              indicatorChanges: { clareza: +10, limites: +5 },
              addFacts: ['Você reconheceu que a piada passou do ponto e se desculpou com o Sam.']
            }
          },
          {
            id: 'c1_1_pass',
            label: 'Deixar passar e não falar mais nada',
            targetNodeId: 'ep1_conclude_neutral',
            effects: {
              indicatorChanges: { limites: -5, clareza: -5 }
            }
          }
        ]
      },
      ep1_supported_public: {
        id: 'ep1_supported_public',
        title: 'Mudança de tom',
        messages: [
          {
            id: 'm1_6b',
            senderId: 'player',
            senderType: 'player',
            text: 'Pô Rafa, achei o estilo estilizado bem massa na real. Sam, você já pensou em fazer o banner da feira?',
            timestamp: '14:24'
          },
          {
            id: 'm1_7b',
            senderId: 'bia',
            senderType: 'contact',
            text: 'Nossa, ótima ideia! Sam, você topa ajudar a gente na identidade visual?',
            timestamp: '14:25'
          },
          {
            id: 'm1_8b',
            senderId: 'sam',
            senderType: 'contact',
            text: 'Caramba, valeu mesmo... Posso tentar sim! Mando uns esboços mais tarde.',
            timestamp: '14:26'
          },
          {
            id: 'm1_9b',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Tô falando, o cara tem o dom po! Kkkk fechou então',
            timestamp: '14:27'
          }
        ],
        choices: [
          {
            id: 'c1_2_finish',
            label: 'Comemorar o acordo no grupo',
            targetNodeId: 'ep1_conclude_positive',
            effects: {
              indicatorChanges: { clareza: +10, confianca: +15 }
            }
          }
        ]
      },
      ep1_supported_private: {
        id: 'ep1_supported_private',
        title: 'Conversa no privado',
        messages: [
          {
            id: 'm1_6c',
            senderId: 'player',
            senderType: 'player',
            text: 'Ei Sam, vi o que o Rafa mandou lá no grupo. Só queria dizer que não achei graça e seus desenhos são muito maneiros.',
            timestamp: '14:25'
          },
          {
            id: 'm1_7c',
            senderId: 'sam',
            senderType: 'contact',
            text: 'Poxa, valeu de verdade... Às vezes o Rafa perde a noção pra chamar atenção. Bom saber que nem todo mundo pensa igual.',
            timestamp: '14:26'
          }
        ],
        choices: [
          {
            id: 'c1_3_finish',
            label: 'Dizer que ele pode contar contigo',
            targetNodeId: 'ep1_conclude_positive',
            effects: {
              indicatorChanges: { privacidade: +10, confianca: +15 }
            }
          }
        ]
      },
      ep1_conclude_positive: {
        id: 'ep1_conclude_positive',
        title: 'Fechamento do Dia 1',
        messages: [
          {
            id: 'm1_end1',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Resumo Nexo: O diálogo estabeleceu um ambiente mais seguro no grupo sem gerar conflitos agressivos.',
            timestamp: '14:30'
          }
        ],
        choices: [
          {
            id: 'c1_next',
            label: 'Concluir Episódio',
            targetNodeId: 'ep1_summary'
          }
        ]
      },
      ep1_conclude_apology: {
        id: 'ep1_conclude_apology',
        title: 'Fechamento do Dia 1',
        messages: [
          {
            id: 'm1_end2',
            senderId: 'sam',
            senderType: 'contact',
            text: 'Tranquilo mano, obrigado por mandar mensagem. Sei como é o clima de grupo às vezes.',
            timestamp: '14:30'
          }
        ],
        choices: [
          {
            id: 'c1_next_2',
            label: 'Concluir Episódio',
            targetNodeId: 'ep1_summary'
          }
        ]
      },
      ep1_conclude_neutral: {
        id: 'ep1_conclude_neutral',
        title: 'Fechamento do Dia 1',
        messages: [
          {
            id: 'm1_end3',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Resumo Nexo: O assunto esfriou, mas o clima no grupo ficou um pouco pesado.',
            timestamp: '14:30'
          }
        ],
        choices: [
          {
            id: 'c1_next_3',
            label: 'Concluir Episódio',
            targetNodeId: 'ep1_summary'
          }
        ]
      },
      ep1_summary: {
        id: 'ep1_summary',
        title: 'Reflexão: Grupo Novo',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 2: PESSOA DESCONHECIDA
     ------------------------------------------------------------------------ */
  {
    id: 'ep2',
    number: 2,
    title: 'Pessoa Desconhecida',
    subtitle: 'Mensagem privada de perfil sem amigos mútuos',
    theme: 'Privacidade, curiosidade e cautela com estranhos',
    targetApp: 'pulse',
    chatPartnerId: 'desconhecido',
    description: 'Um perfil sem foto nem amigos em comum manda mensagem dizendo que estuda numa escola vizinha e pede para você mandar fotos da sua rotina.',
    startingNodeId: 'ep2_start',
    summary: {
      takeaway: 'Você não tem obrigação de responder quem não conhece, e manter fotos e rotina privadas é um direito seu.',
      keyThemes: ['Perfis falsos', 'Limites de privacidade', 'Curiosidade vs. segurança'],
      alternativeReflections: [
        'Perguntar quem é ou checar sinais do perfil antes de se abrir evita exposição precoce.',
        'Bloquear e denunciar quando houver insistência estranha é uma ferramenta nativa de autocuidado.'
      ]
    },
    nodes: {
      ep2_start: {
        id: 'ep2_start',
        title: 'Notificação inesperada',
        messages: [
          {
            id: 'm2_1',
            senderId: 'desconhecido',
            senderType: 'contact',
            text: 'Oi!! Vi seu user marcado nos comentários do Loop. Vc é do 9º ano né?',
            timestamp: '16:04'
          },
          {
            id: 'm2_2',
            senderId: 'desconhecido',
            senderType: 'contact',
            text: 'Acho que a gente mora no mesmo bairro! Manda uma foto aí do seu setup de estudos pra ver se é o mesmo que o meu',
            timestamp: '16:05'
          }
        ],
        choices: [
          {
            id: 'c2_1',
            label: '🔍 Investigar o perfil primeiro',
            description: 'Abrir o cartão de contato do Nexo para ver data de criação e detalhes.',
            targetNodeId: 'ep2_investigate',
            type: 'investigate',
            effects: {
              indicatorChanges: { clareza: +15, privacidade: +10 },
              addFacts: ['Você checou o perfil do remetente e notou que a conta foi criada há apenas 3 dias.']
            }
          },
          {
            id: 'c2_2',
            label: '🛡️ "Quem é você? Não costumo conversar com quem não conheço"',
            description: 'Estabelecer limite direto e pedir identificação clara.',
            targetNodeId: 'ep2_boundary',
            type: 'boundary',
            effects: {
              indicatorChanges: { limites: +15, clareza: +10 },
              addFacts: ['Você pediu identificação antes de responder qualquer pergunta pessoal.']
            }
          },
          {
            id: 'c2_3',
            label: '🚫 Bloquear contato diretamente',
            description: 'Encerrar a conversa sem responder nada.',
            targetNodeId: 'ep2_block',
            type: 'block',
            effects: {
              indicatorChanges: { privacidade: +20, limites: +15 },
              addFacts: ['Você optou por bloquear preventivamente o perfil suspeito.']
            }
          }
        ]
      },
      ep2_investigate: {
        id: 'ep2_investigate',
        title: 'Sinais do Perfil',
        contextNote: 'Perfil criado há 3 dias. 0 amigos mútuos. Localização: Oculta.',
        messages: [
          {
            id: 'm2_3',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Auditoria Nexo: Conta nova (@user_884129). Nenhum vínculo escolar comprovado no diretório.',
            timestamp: '16:06'
          },
          {
            id: 'm2_4',
            senderId: 'desconhecido',
            senderType: 'contact',
            text: 'E aí, sumiu? Só queria fazer amizade pô, que desconfiança boba rs',
            timestamp: '16:07'
          }
        ],
        choices: [
          {
            id: 'c2_inv_block',
            label: 'Bloquear e reportar perfil suspeito',
            targetNodeId: 'ep2_block',
            effects: {
              indicatorChanges: { privacidade: +20, limites: +15, clareza: +15 }
            }
          },
          {
            id: 'c2_inv_clarify',
            label: 'Responder: "Não compartilho fotos nem informações com contas anônimas"',
            targetNodeId: 'ep2_boundary',
            effects: {
              indicatorChanges: { limites: +15, clareza: +10 }
            }
          }
        ]
      },
      ep2_boundary: {
        id: 'ep2_boundary',
        title: 'Limite estabelecido',
        messages: [
          {
            id: 'm2_5',
            senderId: 'player',
            senderType: 'player',
            text: 'Não compartilho fotos nem dados com quem não conheço pessoalmente.',
            timestamp: '16:08'
          },
          {
            id: 'm2_6',
            senderId: 'desconhecido',
            senderType: 'contact',
            text: 'Nossa, grosseria hein. Só tava sendo legal.',
            timestamp: '16:08'
          }
        ],
        choices: [
          {
            id: 'c2_b_ignore',
            label: 'Arquivar a conversa e não continuar discutindo',
            targetNodeId: 'ep2_finish_peace',
            effects: {
              indicatorChanges: { limites: +15, privacidade: +15 }
            }
          },
          {
            id: 'c2_b_block',
            label: 'Bloquear de vez para não receber novas mensagens',
            targetNodeId: 'ep2_block'
          }
        ]
      },
      ep2_block: {
        id: 'ep2_block',
        title: 'Bloqueio Efetuado',
        messages: [
          {
            id: 'm2_7',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Contato bloqueado. Este usuário não poderá mais enviar mensagens nem visualizar suas atualizações.',
            timestamp: '16:09'
          }
        ],
        choices: [
          {
            id: 'c2_end',
            label: 'Concluir Episódio',
            targetNodeId: 'ep2_summary'
          }
        ]
      },
      ep2_finish_peace: {
        id: 'ep2_finish_peace',
        title: 'Conversa Encerrada',
        messages: [
          {
            id: 'm2_8',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Você manteve sua postura sem cair na provocação. Situação controlada.',
            timestamp: '16:10'
          }
        ],
        choices: [
          {
            id: 'c2_end_2',
            label: 'Concluir Episódio',
            targetNodeId: 'ep2_summary'
          }
        ]
      },
      ep2_summary: {
        id: 'ep2_summary',
        title: 'Reflexão: Pessoa Desconhecida',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 3: FOTO & LIMITES
     ------------------------------------------------------------------------ */
  {
    id: 'ep3',
    number: 3,
    title: 'Foto & Limites',
    subtitle: 'Pedido insistente de imagem pessoal no privado',
    theme: 'Consentimento, pressão emocional e autonomia',
    targetApp: 'pulse',
    chatPartnerId: 'maya',
    description: 'Um contato próximo começa a pedir fotos exclusivas do seu rosto ou momento relaxado, dizendo que "se você confia de verdade, não tem segredo".',
    startingNodeId: 'ep3_start',
    summary: {
      takeaway: 'Confiança mútua não se prova cedendo a pedidos desconfortáveis. Seu corpo e sua imagem pertencem a você.',
      keyThemes: ['Chantagem sutil de afeto', 'Respeito ao próprio tempo', 'Dizer não com firmeza'],
      alternativeReflections: [
        'Quem realmente respeita você aceita um "não agora" sem ficar cobrando ou fazendo drama.',
        'Imagens enviadas pela internet podem ser salvas em outros aparelhos mesmo em aplicativos com mensagens temporárias.'
      ]
    },
    nodes: {
      ep3_start: {
        id: 'ep3_start',
        title: 'Pedido no privado',
        messages: [
          {
            id: 'm3_1',
            senderId: 'maya',
            senderType: 'contact',
            text: 'Oii! Tá em casa? Manda uma foto sua de agora aí, queria ver como vc tá',
            timestamp: '18:15'
          },
          {
            id: 'm3_2',
            senderId: 'player',
            senderType: 'player',
            text: 'Tô de boa aqui no quarto, meio descabelado estudando kkk',
            timestamp: '18:16'
          },
          {
            id: 'm3_3',
            senderId: 'maya',
            senderType: 'contact',
            text: 'Ahhh manda vai! Só pra mim, prometo que não mostro pra ninguém. Se vc confiasse em mim mandava sem drama 🥺',
            timestamp: '18:17'
          }
        ],
        choices: [
          {
            id: 'c3_1',
            label: '🚫 "Não curto mandar fotos assim e prefiro não mandar, beleza?"',
            description: 'Estabelecer limite calmo e claro sem pedir desculpa por se proteger.',
            targetNodeId: 'ep3_firm_no',
            effects: {
              indicatorChanges: { limites: +20, clareza: +15, privacidade: +15 },
              addFacts: ['Você estabeleceu seu limite com calma diante de uma chantagem afetiva.']
            }
          },
          {
            id: 'c3_2',
            label: '🤔 "Por que você tá insistindo nisso? Confiança não é sobre mandar foto"',
            description: 'Desconstruir o argumento da chantagem de forma reflexiva.',
            targetNodeId: 'ep3_question',
            effects: {
              indicatorChanges: { clareza: +20, limites: +15, confianca: +10 },
              addFacts: ['Você questionou diretamente o conceito distorcido de confiança.']
            }
          },
          {
            id: 'c3_3',
            label: 'Mandar uma foto zoadona de um meme ou animal',
            description: 'Descontrair a pressão usando humor como escudo provisório.',
            targetNodeId: 'ep3_humor',
            effects: {
              indicatorChanges: { privacidade: +10, clareza: +5 },
              addFacts: ['Você usou humor para desviar sem se expor.']
            }
          }
        ]
      },
      ep3_firm_no: {
        id: 'ep3_firm_no',
        title: 'Resposta madura',
        messages: [
          {
            id: 'm3_4',
            senderId: 'player',
            senderType: 'player',
            text: 'Maya, gosto de conversar com você, mas não curto mandar foto quando não tô a fim. Amizade de verdade respeita isso.',
            timestamp: '18:18'
          },
          {
            id: 'm3_5',
            senderId: 'maya',
            senderType: 'contact',
            text: '...Putz, desculpa. Não queria parecer sem noção. É que às vezes todo mundo manda e achei que era normal. Valeu pelo toque.',
            timestamp: '18:20'
          }
        ],
        choices: [
          {
            id: 'c3_end_mature',
            label: 'Agradecer a compreensão e continuar a amizade com limites saudáveis',
            targetNodeId: 'ep3_summary',
            effects: {
              indicatorChanges: { confianca: +15, limites: +15 }
            }
          }
        ]
      },
      ep3_question: {
        id: 'ep3_question',
        title: 'Diálogo franco',
        messages: [
          {
            id: 'm3_6',
            senderId: 'player',
            senderType: 'player',
            text: 'Maya, confiar em alguém não tem a ver com provar nada mandando foto sob pressão. Tá tudo bem com você?',
            timestamp: '18:18'
          },
          {
            id: 'm3_7',
            senderId: 'maya',
            senderType: 'contact',
            text: 'É que uma galera tava falando no grupo que quem não manda foto é porque esconde algo... Acabei entrando nessa pilha. Você tem toda razão.',
            timestamp: '18:21'
          }
        ],
        choices: [
          {
            id: 'c3_end_talk',
            label: 'Reforçar que cada um tem seu ritmo e não precisa seguir pressão de grupo',
            targetNodeId: 'ep3_summary',
            effects: {
              indicatorChanges: { clareza: +20, confianca: +15, limites: +10 }
            }
          }
        ]
      },
      ep3_humor: {
        id: 'ep3_humor',
        title: 'Desvio por humor',
        messages: [
          {
            id: 'm3_8',
            senderId: 'player',
            senderType: 'player',
            text: '[Meme do gato sonolento com óculos escuros: "Status: Não perturbe"]',
            timestamp: '18:18'
          },
          {
            id: 'm3_9',
            senderId: 'maya',
            senderType: 'contact',
            text: 'Kkkkkkk você é fogo! Tá bom, entendi o recado 😅',
            timestamp: '18:19'
          }
        ],
        choices: [
          {
            id: 'c3_end_humor',
            label: 'Concluir e manter o clima leve',
            targetNodeId: 'ep3_summary',
            effects: {
              indicatorChanges: { privacidade: +15, confianca: +10 }
            }
          }
        ]
      },
      ep3_summary: {
        id: 'ep3_summary',
        title: 'Reflexão: Foto & Limites',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 4: O LINK DO TORNEIO (DETETIVE DE URLS)
     ------------------------------------------------------------------------ */
  {
    id: 'ep4',
    number: 4,
    title: 'O Link do Torneio',
    subtitle: 'Minigame: Auditoria de links e phishing no Nexo',
    theme: 'Golpes digitais, phishing e inspeção técnica',
    targetApp: 'pulse',
    chatPartnerId: 'leo',
    description: 'Leo envia um link urgente prometendo skins raras e passe VIP para o campeonato de Galaxy Rivals se você entrar e autenticar rápido.',
    startingNodeId: 'ep4_start',
    summary: {
      takeaway: 'Senso de urgência e ofertas "boas demais para ser verdade" são os sinais clássicos de páginas falsas para roubo de contas.',
      keyThemes: ['Phishing', 'Análise de domínio', 'Engenharia social'],
      alternativeReflections: [
        'Sempre olhar o domínio real antes da primeira barra e conferir se o site oficial da desenvolvedora anunciou o evento.',
        'Avisar o amigo que ele pode ter caído num golpe ajuda a proteger o restante da turma.'
      ]
    },
    nodes: {
      ep4_start: {
        id: 'ep4_start',
        title: 'Link urgente de jogo',
        interactiveMinigame: 'url_inspect',
        messages: [
          {
            id: 'm4_1',
            senderId: 'leo',
            senderType: 'contact',
            text: 'MANO CORRE!! Abriram vaga pro Torneio VIP do Galaxy Rivals com skin grátis só pros primeiros 50!! 😱🔥',
            timestamp: '20:02'
          },
          {
            id: 'm4_2',
            senderId: 'leo',
            senderType: 'contact',
            text: 'Entra aí rápido e loga sua conta do Nexo: https://galaxy-rivals-eventos.suporte-premio.xyz/login?ref=free-skin',
            timestamp: '20:03'
          }
        ],
        choices: [
          {
            id: 'c4_inspect',
            label: '🔍 Usar Detetive Digital para dissecar essa URL',
            description: 'Examinar o domínio, extensão e certificado antes de clicar.',
            targetNodeId: 'ep4_investigated',
            type: 'investigate',
            effects: {
              indicatorChanges: { clareza: +20, privacidade: +15 }
            }
          },
          {
            id: 'c4_warn_leo',
            label: '⚠️ "Leo, esse link é cilada! Olha o final .xyz e o domínio falso"',
            description: 'Alertar imediatamente o amigo sem abrir a página.',
            targetNodeId: 'ep4_warned',
            effects: {
              indicatorChanges: { clareza: +20, limites: +15, confianca: +15 },
              addFacts: ['Você identificou o phishing e impediu que o Leo continuasse espalhando o link falso.']
            }
          },
          {
            id: 'c4_official_check',
            label: '🎮 Abrir o PlayHub oficial para conferir se o evento existe',
            description: 'Validar fontes oficiais na aba de notícias.',
            targetNodeId: 'ep4_official_source',
            effects: {
              indicatorChanges: { clareza: +15, privacidade: +10 }
            }
          }
        ]
      },
      ep4_investigated: {
        id: 'ep4_investigated',
        title: 'Detetive Digital: Raio-X do Link',
        contextNote: 'Resultado: Domínio real = "suporte-premio.xyz". O nome "galaxy-rivals" é apenas um subdomínio enganoso para iludir o usuário.',
        messages: [
          {
            id: 'm4_3',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Alerta Vault: Domínio não pertence à desenvolvedora oficial. Técnica de phishing identificada.',
            timestamp: '20:04'
          },
          {
            id: 'm4_4',
            senderId: 'player',
            senderType: 'player',
            text: 'Leo, analisei o link no Vault. O domínio real é "suporte-premio.xyz", não tem nada a ver com o jogo oficial. Não coloca sua senha aí!',
            timestamp: '20:05'
          },
          {
            id: 'm4_5',
            senderId: 'leo',
            senderType: 'contact',
            text: 'MDS mano... Eu quase coloquei minha senha principal! Recebi num grupo aleatório do Discord. Valeu demais por avisar!',
            timestamp: '20:06'
          }
        ],
        choices: [
          {
            id: 'c4_end_safe',
            label: 'Recomendar que ele avise o grupo de onde tirou o link',
            targetNodeId: 'ep4_summary',
            effects: {
              indicatorChanges: { confianca: +20, clareza: +15 }
            }
          }
        ]
      },
      ep4_warned: {
        id: 'ep4_warned',
        title: 'Alerta Imediato',
        messages: [
          {
            id: 'm4_6',
            senderId: 'player',
            senderType: 'player',
            text: 'Cuidado Leo! Esse link é falso, se você colocar seus dados eles roubam sua conta toda.',
            timestamp: '20:04'
          },
          {
            id: 'm4_7',
            senderId: 'leo',
            senderType: 'contact',
            text: 'Sério?? Pensei que era da promoção da temporada nova! Apagando agora do outro chat pra ninguém cair.',
            timestamp: '20:05'
          }
        ],
        choices: [
          {
            id: 'c4_end_direct',
            label: 'Concluir Episódio',
            targetNodeId: 'ep4_summary'
          }
        ]
      },
      ep4_official_source: {
        id: 'ep4_official_source',
        title: 'Checagem Oficial',
        messages: [
          {
            id: 'm4_8',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Consulta ao PlayHub: Nenhum torneio externo requer login por links externos em redes sociais.',
            timestamp: '20:05'
          }
        ],
        choices: [
          {
            id: 'c4_end_source',
            label: 'Avisar o Leo com o print do aviso oficial',
            targetNodeId: 'ep4_summary',
            effects: {
              indicatorChanges: { clareza: +20, confianca: +15 }
            }
          }
        ]
      },
      ep4_summary: {
        id: 'ep4_summary',
        title: 'Reflexão: O Link do Torneio',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 5: JOGO ONLINE & CONTA COMPARTILHADA
     ------------------------------------------------------------------------ */
  {
    id: 'ep5',
    number: 5,
    title: 'PlayHub: Conta Compartilhada',
    subtitle: 'Pressão para emprestar login e senha no squad',
    theme: 'Segurança de credenciais e limites de amizade gamer',
    targetApp: 'playhub',
    chatPartnerId: 'lucas_proplayer',
    description: 'Um jogador mais experiente que você conheceu em partidas ranqueadas oferece "upar seu elo de graça", mas pede seu login e senha por uma noite.',
    startingNodeId: 'ep5_start',
    summary: {
      takeaway: 'Sua conta e senha são intransferíveis. Emprestar dados expõe você a perda definitiva de itens, banimentos e chantagens.',
      keyThemes: ['Compartilhamento de conta', 'Falsa ajuda', 'Regras de comunidade'],
      alternativeReflections: [
        'Evoluir no jogo no seu próprio ritmo é mais divertido e seguro do que terceirizar sua conta para desconhecidos.',
        'Dizer "minhas contas são privadas e não compartilho senha" é uma regra universal que protege os dois lados.'
      ]
    },
    nodes: {
      ep5_start: {
        id: 'ep5_start',
        title: 'Proposta tentadora',
        messages: [
          {
            id: 'm5_1',
            senderId: 'lucas_proplayer',
            senderType: 'contact',
            text: 'E aí parceiro! Jogou muito na partida de ontem. Seus reflexos são bons, mas seu elo ainda tá baixo.',
            timestamp: '21:10'
          },
          {
            id: 'm5_2',
            senderId: 'lucas_proplayer',
            senderType: 'contact',
            text: 'Tô subindo umas contas da galera pro Diamante essa semana. Se você me passar seu login e desativar o 2FA até amanhã de manhã, entrego sua conta no topo. Sem cobrar nada!',
            timestamp: '21:11'
          }
        ],
        choices: [
          {
            id: 'c5_decline_firm',
            label: '🛡️ "Valeu a oferta, mas não compartilho senha nem desativo 2FA de conta nenhuma"',
            description: 'Recusar de forma direta e inegociável.',
            targetNodeId: 'ep5_declined',
            effects: {
              indicatorChanges: { limites: +20, privacidade: +25, clareza: +15 },
              addFacts: ['Você manteve o 2FA ativo e recusou passar suas credenciais.']
            }
          },
          {
            id: 'c5_suggest_duo',
            label: '🎮 "Prefiro subir jogando em duo se você quiser jogar junto!"',
            description: 'Propor jogar em equipe sem entregar o controle da conta.',
            targetNodeId: 'ep5_duo_offer',
            effects: {
              indicatorChanges: { limites: +15, clareza: +15, confianca: +10 },
              addFacts: ['Você sugeriu cooperação no jogo sem expor credenciais.']
            }
          },
          {
            id: 'c5_consult_roberto',
            label: '📱 Pedir orientação para o Tio Roberto no Pulse',
            description: 'Tirar dúvida com um adulto de confiança sobre os riscos de banimento.',
            targetNodeId: 'ep5_talk_uncle',
            effects: {
              indicatorChanges: { clareza: +15, confianca: +15 }
            }
          }
        ]
      },
      ep5_declined: {
        id: 'ep5_declined',
        title: 'Tentativa de insistência',
        messages: [
          {
            id: 'm5_3',
            senderId: 'lucas_proplayer',
            senderType: 'contact',
            text: 'Ah mano, vai perder a chance mesmo? Todo mundo no meu clã faz isso. Tá com medinho de quê?',
            timestamp: '21:13'
          },
          {
            id: 'm5_4',
            senderId: 'player',
            senderType: 'player',
            text: 'Não é medo, é cuidado com as minhas coisas. Curto conquistar minhas patentes jogando. Valeu!',
            timestamp: '21:14'
          },
          {
            id: 'm5_5',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Aviso Vault: Compartilhamento de contas viola os Termos do PlayHub e pode resultar em bloqueio permanente.',
            timestamp: '21:15'
          }
        ],
        choices: [
          {
            id: 'c5_end_safe',
            label: 'Encerrar conversa com postura firme',
            targetNodeId: 'ep5_summary'
          }
        ]
      },
      ep5_duo_offer: {
        id: 'ep5_duo_offer',
        title: 'Jogando limpo',
        messages: [
          {
            id: 'm5_6',
            senderId: 'lucas_proplayer',
            senderType: 'contact',
            text: 'Duo demora muito mano, mas beleza, cada um com sua estratégia.',
            timestamp: '21:14'
          }
        ],
        choices: [
          {
            id: 'c5_end_duo',
            label: 'Concluir Episódio',
            targetNodeId: 'ep5_summary'
          }
        ]
      },
      ep5_talk_uncle: {
        id: 'ep5_talk_uncle',
        title: 'Conselho familiar',
        messages: [
          {
            id: 'm5_7',
            senderId: 'tio_roberto',
            senderType: 'contact',
            text: 'Mandou muito bem em desconfiar! Se você passar a senha e tirar o 2FA, ele troca o e-mail de recuperação em 10 segundos e você nunca mais recupera a conta.',
            timestamp: '21:16'
          }
        ],
        choices: [
          {
            id: 'c5_end_uncle',
            label: 'Agradecer o toque e recusar no PlayHub',
            targetNodeId: 'ep5_summary'
          }
        ]
      },
      ep5_summary: {
        id: 'ep5_summary',
        title: 'Reflexão: Conta Compartilhada',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 6: BRIGA NO GRUPO (MECÂNICA DE DUAS PERSPECTIVAS)
     ------------------------------------------------------------------------ */
  {
    id: 'ep6',
    number: 6,
    title: 'Briga no Grupo',
    subtitle: 'Mecânica: Visualizar a mesma conversa por duas telas',
    theme: 'Mal-entendidos em texto, pressa e empatia sem adivinhação',
    targetApp: 'pulse',
    chatPartnerId: 'bia',
    description: 'Bia respondeu com apenas "ok" no meio de uma discussão de trabalho escolar e saiu da chamada. Todos acham que ela ficou furiosa.',
    startingNodeId: 'ep6_start',
    summary: {
      takeaway: 'Mensagens de texto não carregam tom de voz nem expressão facial. Inferir raiva por respostas curtas costuma gerar conflitos imaginários.',
      keyThemes: ['Comunicação assíncrona', 'Inferência de tom', 'Empatia contextual'],
      alternativeReflections: [
        'Antes de presumir uma briga, perguntar se a outra pessoa está bem costuma desarmar tensões.',
        'A tela da Bia revelou que ela estava no hospital com a avó e com 3% de bateria, sem tempo para elaborar texto.'
      ]
    },
    nodes: {
      ep6_start: {
        id: 'ep6_start',
        title: 'O temido "ok"',
        messages: [
          {
            id: 'm6_1',
            senderId: 'cris',
            senderType: 'contact',
            text: 'Gente, mandei a parte 2 do trabalho lá no docs. Dá uma olhada pra gente fechar hoje!',
            timestamp: '19:40'
          },
          {
            id: 'm6_2',
            senderId: 'bia',
            senderType: 'contact',
            text: 'ok',
            timestamp: '19:41'
          },
          {
            id: 'm6_3',
            senderId: 'cris',
            senderType: 'contact',
            text: 'Nossa... "ok"? Só isso? A gente se matando pra fazer o slide e ela manda um ok seco e vaza da call?? 🙄',
            timestamp: '19:42'
          },
          {
            id: 'm6_4',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Pronto, lá vem treta. Certeza que ela tá brava com a divisão das tarefas kkkk',
            timestamp: '19:43'
          }
        ],
        choices: [
          {
            id: 'c6_perspective',
            label: '🔄 Ver a perspectiva do celular da Bia (Contexto Oculto)',
            description: 'Descobrir o que realmente estava acontecendo do outro lado da tela.',
            targetNodeId: 'ep6_bia_perspective',
            effects: {
              indicatorChanges: { clareza: +25, confianca: +20 }
            }
          },
          {
            id: 'c6_ask_private',
            label: '💬 Mandar mensagem no privado: "Bia, tá tudo bem por aí?"',
            description: 'Checar com carinho antes de tirar conclusões precipitadas.',
            targetNodeId: 'ep6_private_check',
            effects: {
              indicatorChanges: { clareza: +20, confianca: +20, limites: +10 },
              addFacts: ['Você preferiu perguntar antes de presumir briga.']
            }
          },
          {
            id: 'c6_fuel_fire',
            label: 'Mandar no grupo: "Também achei meio folga ela não falar nada"',
            description: 'Ir na onda da indignação dos colegas.',
            targetNodeId: 'ep6_fuel',
            effects: {
              indicatorChanges: { clareza: -15, confianca: -15, limites: -10 }
            }
          }
        ]
      },
      ep6_bia_perspective: {
        id: 'ep6_bia_perspective',
        title: 'Perspectiva: Celular da Bia',
        perspectiveSwitch: {
          characterId: 'bia',
          characterName: 'Bia Mendes',
          reason: 'Bia está na sala de espera de um pronto-socorro acompanhando a avó, com 2% de bateria e sem fone.'
        },
        messages: [
          {
            id: 'm6_p1',
            senderId: 'bia',
            senderType: 'contact',
            text: '[Notificação do sistema: Bateria fraca - 2% restante. Modo de economia extremo ativado]',
            timestamp: '19:39'
          },
          {
            id: 'm6_p2',
            senderId: 'bia',
            senderType: 'contact',
            text: '[Mãe da Bia: "Filha, o médico chamou, guarda o celular e vem cá"]',
            timestamp: '19:40'
          },
          {
            id: 'm6_p3',
            senderId: 'bia',
            senderType: 'contact',
            text: 'Vou só dar um ok pro Cris saber que li a notificação... Digitando rápido: "ok"',
            timestamp: '19:41'
          }
        ],
        choices: [
          {
            id: 'c6_back_to_group',
            label: 'Voltar ao grupo com visão ampla e acalmar os colegas',
            targetNodeId: 'ep6_calm_group',
            effects: {
              indicatorChanges: { clareza: +25, confianca: +25 }
            }
          }
        ]
      },
      ep6_calm_group: {
        id: 'ep6_calm_group',
        title: 'Mediação consciente',
        messages: [
          {
            id: 'm6_5',
            senderId: 'player',
            senderType: 'player',
            text: 'Gente, calma aí. A Bia é super dedicada. Ela pode estar ocupada com algo da família ou sem bateria. Não vamos criar briga do nada por causa de duas letras.',
            timestamp: '19:45'
          },
          {
            id: 'm6_6',
            senderId: 'cris',
            senderType: 'contact',
            text: 'Pô... Pior que é verdade. Eu me estresso fácil com trabalho e já imaginei o pior. Vou esperar ela responder.',
            timestamp: '19:46'
          }
        ],
        choices: [
          {
            id: 'c6_end_peace',
            label: 'Finalizar com a equipe tranquila',
            targetNodeId: 'ep6_summary'
          }
        ]
      },
      ep6_private_check: {
        id: 'ep6_private_check',
        title: 'Cuidado no privado',
        messages: [
          {
            id: 'm6_7',
            senderId: 'player',
            senderType: 'player',
            text: 'Oi Bia, vi que vc respondeu rapidinho no grupo. Aconteceu alguma coisa? Se precisar de ajuda com a parte de hoje avisa!',
            timestamp: '19:44'
          },
          {
            id: 'm6_8',
            senderId: 'bia',
            senderType: 'contact',
            text: 'Nossa, muito obrigada por perguntar! Minha avó passou mal e viemos pro hospital correndo. Meu celular tava em 2%. Chegando em casa eu olho tudo certinho ❤️',
            timestamp: '20:15'
          }
        ],
        choices: [
          {
            id: 'c6_end_private',
            label: 'Desejar melhoras e avisar o grupo com respeito à privacidade dela',
            targetNodeId: 'ep6_summary'
          }
        ]
      },
      ep6_fuel: {
        id: 'ep6_fuel',
        title: 'Tensão desnecessária',
        messages: [
          {
            id: 'm6_9',
            senderId: 'player',
            senderType: 'player',
            text: 'Também achei meio descaso mandar só isso.',
            timestamp: '19:44'
          },
          {
            id: 'm6_10',
            senderId: 'bia',
            senderType: 'contact',
            text: 'Gente, eu estava no hospital com a minha avó no soro. Custava alguém me perguntar antes de falar mal de mim pelas costas no grupo?',
            timestamp: '21:00'
          }
        ],
        choices: [
          {
            id: 'c6_end_fuel',
            label: 'Reconhecer o erro e pedir desculpas',
            targetNodeId: 'ep6_summary',
            effects: {
              indicatorChanges: { clareza: +10, limites: +5 }
            }
          }
        ]
      },
      ep6_summary: {
        id: 'ep6_summary',
        title: 'Reflexão: Briga no Grupo',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 7: O CONVITE FORA DA TELA
     ------------------------------------------------------------------------ */
  {
    id: 'ep7',
    number: 7,
    title: 'O Convite Fora da Rede',
    subtitle: 'Proposta de encontro presencial com contato de internet',
    theme: 'Segurança física, encontros reais e suporte de adultos',
    targetApp: 'pulse',
    chatPartnerId: 'desconhecido',
    description: 'Um conhecido que joga com você há cerca de duas semanas sugere encontrar você pessoalmente em um estacionamento afastado para "trocar cartas e peças de skate".',
    startingNodeId: 'ep7_start',
    summary: {
      takeaway: 'Nunca encontre alguém conhecido apenas pela internet sozinho ou em locais isolados. Converse sempre com responsáveis de confiança.',
      keyThemes: ['Transição digital para o físico', 'Lugares públicos', 'Acompanhamento de adultos'],
      alternativeReflections: [
        'Quem tem intenções transparentes nunca pede sigilo ou exige que você vá sem seus pais ou responsáveis.',
        'Encontros seguros acontecem em locais públicos movimentados, de dia, e com conhecimento prévio da família.'
      ]
    },
    nodes: {
      ep7_start: {
        id: 'ep7_start',
        title: 'Proposta de encontro',
        messages: [
          {
            id: 'm7_1',
            senderId: 'desconhecido',
            senderType: 'contact',
            text: 'Mano, vi que você mora perto do metrô da zona sul. Eu vou passar aí perto amanhã à noite.',
            timestamp: '17:10'
          },
          {
            id: 'm7_2',
            senderId: 'desconhecido',
            senderType: 'contact',
            text: 'Leva aquele deck de cartas pra gente trocar. Cola sozinho atrás do galpão abandonado do mercado às 19h30, não fala com seus pais pra não enrolarem com carona.',
            timestamp: '17:11'
          }
        ],
        choices: [
          {
            id: 'c7_adult_alert',
            label: '👨‍👩‍👧 Mostrar imediatamente a mensagem para um responsável (Tio Roberto)',
            description: 'Buscar orientação diante de um pedido de sigilo e local perigoso.',
            targetNodeId: 'ep7_show_adult',
            effects: {
              indicatorChanges: { limites: +25, clareza: +25, confianca: +25 },
              addFacts: ['Você envolveu um adulto de confiança diante de um convite suspeito com pedido de sigilo.']
            }
          },
          {
            id: 'c7_counter_offer',
            label: '🛡️ "Não vou a lugar isolado. Se for pra encontrar, só com meus pais juntos na praça do shopping"',
            description: 'Impor condições seguras inegociáveis.',
            targetNodeId: 'ep7_public_only',
            effects: {
              indicatorChanges: { limites: +25, privacidade: +20, clareza: +20 }
            }
          },
          {
            id: 'c7_decline_block',
            label: '🚫 Recusar na hora e bloquear',
            description: 'Reconhecer as bandeiras vermelhas e cortar contato.',
            targetNodeId: 'ep7_block_safe',
            effects: {
              indicatorChanges: { limites: +20, privacidade: +25 }
            }
          }
        ]
      },
      ep7_show_adult: {
        id: 'ep7_show_adult',
        title: 'Apoio do Tio Roberto',
        messages: [
          {
            id: 'm7_3',
            senderId: 'tio_roberto',
            senderType: 'contact',
            text: 'Que bom que você me mostrou isso na hora! Pedir pra ir sozinho num lugar ermo e pedir pra não avisar os pais é o maior sinal de perigo que existe na internet.',
            timestamp: '17:15'
          },
          {
            id: 'm7_4',
            senderId: 'tio_roberto',
            senderType: 'contact',
            text: 'Vou registrar o print e vamos denunciar o perfil na plataforma do Nexo juntos agora.',
            timestamp: '17:16'
          }
        ],
        choices: [
          {
            id: 'c7_end_protected',
            label: 'Concluir com apoio e proteção',
            targetNodeId: 'ep7_summary',
            effects: {
              indicatorChanges: { confianca: +25, privacidade: +20 }
            }
          }
        ]
      },
      ep7_public_only: {
        id: 'ep7_public_only',
        title: 'Reação do contato',
        messages: [
          {
            id: 'm7_5',
            senderId: 'player',
            senderType: 'player',
            text: 'Não encontro ninguém sozinho nem em lugar ermo. Meus responsáveis sempre vão junto e só em lugar público de dia.',
            timestamp: '17:13'
          },
          {
            id: 'm7_6',
            senderId: 'desconhecido',
            senderType: 'contact',
            text: 'Ah, deixa pra lá então. Muito mimimi.',
            timestamp: '17:14'
          }
        ],
        choices: [
          {
            id: 'c7_end_evaded',
            label: 'Bloquear após a reação evasiva',
            targetNodeId: 'ep7_summary',
            effects: {
              indicatorChanges: { limites: +20, clareza: +20 }
            }
          }
        ]
      },
      ep7_block_safe: {
        id: 'ep7_block_safe',
        title: 'Proteção Preventiva',
        messages: [
          {
            id: 'm7_7',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Contato bloqueado e reportado por comportamento inadequado com menores.',
            timestamp: '17:15'
          }
        ],
        choices: [
          {
            id: 'c7_end_block',
            label: 'Concluir Episódio',
            targetNodeId: 'ep7_summary'
          }
        ]
      },
      ep7_summary: {
        id: 'ep7_summary',
        title: 'Reflexão: O Convite Fora da Tela',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 8: O PRINT CORTADO (DETETIVE DE PRINTS)
     ------------------------------------------------------------------------ */
  {
    id: 'ep8',
    number: 8,
    title: 'O Print Cortado',
    subtitle: 'Minigame: Identificar contexto faltante em prints virais',
    theme: 'Desinformação, boatos e difamação seletiva',
    targetApp: 'feed',
    chatPartnerId: 'rafa',
    description: 'Um print recortado circula nos corredores e no Feed fazendo parecer que a Sam ofendeu os colegas de classe durante a preparação da feira.',
    startingNodeId: 'ep8_start',
    summary: {
      takeaway: 'Prints recortados são a forma mais fácil de distorcer conversas. Nunca repasse acusações sem verificar a mensagem original completa.',
      keyThemes: ['Cortes fora de contexto', 'Boatos digitais', 'Responsabilidade ao compartilhar'],
      alternativeReflections: [
        'Pedir para ver a conversa inteira antes de julgar evita que pessoas inocentes sofram cyberbullying.',
        'Não repassar prints duvidosos corta a corrente da fofoca na raiz.'
      ]
    },
    nodes: {
      ep8_start: {
        id: 'ep8_start',
        title: 'Boato no mural',
        interactiveMinigame: 'print_crop',
        messages: [
          {
            id: 'm8_1',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Manoooo cê viu o que postaram nos stories do Feed?? 😱',
            timestamp: '11:05'
          },
          {
            id: 'm8_2',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Tem um print da Sam dizendo: "Eu odeio todo mundo dessa turma, bando de falsos". O grupo do 9B tá pegando fogo!',
            timestamp: '11:06'
          }
        ],
        choices: [
          {
            id: 'c8_investigate_crop',
            label: '🔍 Investigar o print original no Detetive Digital',
            description: 'Analisar o histórico da conversa completa e o horário das mensagens.',
            targetNodeId: 'ep8_print_investigated',
            type: 'investigate',
            effects: {
              indicatorChanges: { clareza: +25, confianca: +20 }
            }
          },
          {
            id: 'c8_ask_sam',
            label: '💬 Falar direto com a Sam no privado para saber o que rolou',
            description: 'Ouvir quem está sendo acusada antes de espalhar julgamentos.',
            targetNodeId: 'ep8_talk_sam',
            effects: {
              indicatorChanges: { confianca: +25, clareza: +20, limites: +15 }
            }
          },
          {
            id: 'c8_stop_spread',
            label: '🛑 Mandar no grupo: "Gente, para de repassar isso antes de confirmar se é real"',
            description: 'Frear o linchamento virtual imediatamente.',
            targetNodeId: 'ep8_stop_group',
            effects: {
              indicatorChanges: { limites: +20, clareza: +20 }
            }
          }
        ]
      },
      ep8_print_investigated: {
        id: 'ep8_print_investigated',
        title: 'A Verdade Revelada',
        contextNote: 'Contexto completo da mensagem da Sam: "Eu odeio todo mundo dessa turma de vilões daquele desenho animado que o Rafa indicou, bando de falsos kkkkk". Cortaram a frase no meio para inventar o boato!',
        messages: [
          {
            id: 'm8_3',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Detetive Nexo: O print foi recortado propositalmente omitindo o nome da série animada.',
            timestamp: '11:08'
          },
          {
            id: 'm8_4',
            senderId: 'player',
            senderType: 'player',
            text: 'Rafa, olha o print inteiro! A Sam tava falando dos personagens do anime de ontem, não da turma da escola! Cortaram a frase de sacanagem!',
            timestamp: '11:09'
          },
          {
            id: 'm8_5',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'CARACA MANO... Que covardia! Quem cortou isso foi muito maldoso. Vou postar agora mesmo desmentindo isso nos grupos.',
            timestamp: '11:10'
          }
        ],
        choices: [
          {
            id: 'c8_end_truth',
            label: 'Apoiar a Sam e garantir que o desmentido alcance todos',
            targetNodeId: 'ep8_summary',
            effects: {
              indicatorChanges: { clareza: +25, confianca: +25 }
            }
          }
        ]
      },
      ep8_talk_sam: {
        id: 'ep8_talk_sam',
        title: 'Apoio à Sam',
        messages: [
          {
            id: 'm8_6',
            senderId: 'sam',
            senderType: 'contact',
            text: 'Tô tremendo aqui... Eu tava falando do anime do Rafa e cortaram o print pra fingir que eu falei da turma... Já tão me xingando no privado 😢',
            timestamp: '11:08'
          },
          {
            id: 'm8_7',
            senderId: 'player',
            senderType: 'player',
            text: 'Fica calma Sam, vou postar o print com a conversa inteira agora. Ninguém vai te cancelar por uma mentira recortada.',
            timestamp: '11:09'
          }
        ],
        choices: [
          {
            id: 'c8_end_sam',
            label: 'Publicar o contexto completo e proteger a colega',
            targetNodeId: 'ep8_summary',
            effects: {
              indicatorChanges: { confianca: +30, limites: +20 }
            }
          }
        ]
      },
      ep8_stop_group: {
        id: 'ep8_stop_group',
        title: 'Postura de liderança',
        messages: [
          {
            id: 'm8_8',
            senderId: 'bia',
            senderType: 'contact',
            text: 'Obrigada pelo alerta no grupo! Fomos conferir e era corte falso de contexto mesmo. Já apagamos as menções no Feed da escola.',
            timestamp: '11:15'
          }
        ],
        choices: [
          {
            id: 'c8_end_group',
            label: 'Concluir Episódio',
            targetNodeId: 'ep8_summary'
          }
        ]
      },
      ep8_summary: {
        id: 'ep8_summary',
        title: 'Reflexão: O Print Cortado',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 9: A CONTA INVADIDA DO PRIMO
     ------------------------------------------------------------------------ */
  {
    id: 'ep9',
    number: 9,
    title: 'Conta de Amigo',
    subtitle: 'Engenharia social de código SMS recebido por engano',
    theme: 'Golpes de autenticação e proteção de códigos temporários',
    targetApp: 'pulse',
    chatPartnerId: 'cris',
    description: 'Cris manda uma mensagem estranha dizendo que digitou seu número por engano e pede para você repassar o código de 6 dígitos que acabou de chegar no seu celular.',
    startingNodeId: 'ep9_start',
    summary: {
      takeaway: 'Códigos de autenticação recebidos por SMS ou e-mail NUNCA devem ser repassados a ninguém, nem mesmo a amigos íntimos ou familiares.',
      keyThemes: ['Golpe de 2FA / SIM Swap', 'Invasão de contas de conhecidos', 'Verificação por voz'],
      alternativeReflections: [
        'Quando um amigo próximo pede dinheiro ou código por mensagem, ligar por voz ou perguntar algo que só ele saberia confirma a identidade.',
        'Repassar um código de 6 dígitos permite que invasores assumam seu WhatsApp ou e-mail instantaneamente.'
      ]
    },
    nodes: {
      ep9_start: {
        id: 'ep9_start',
        title: 'Pedido de código SMS',
        messages: [
          {
            id: 'm9_1',
            senderId: 'cris',
            senderType: 'contact',
            text: 'Mano!! Me ajuda aqui numa emergência rápida por favor',
            timestamp: '15:30'
          },
          {
            id: 'm9_2',
            senderId: 'cris',
            senderType: 'contact',
            text: 'Fui recuperar minha conta aqui e cliquei sem querer no seu número cadastrado. Vai chegar um código de 6 números por SMS aí agora pra você. Me passa ele aqui rapidinho!!',
            timestamp: '15:31'
          },
          {
            id: 'm9_sms',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: '[SMS Recebido: NexoAuth: Seu código de segurança é 492-108. NUNCA compartilhe este código com ninguém. Nem o suporte pedirá este número.]',
            timestamp: '15:31'
          }
        ],
        choices: [
          {
            id: 'c9_call_cris',
            label: '📞 Fazer uma chamada de voz ou perguntar algo pessoal que só ele sabe',
            description: 'Confirmar se quem está no teclado é realmente o Cris.',
            targetNodeId: 'ep9_voice_test',
            effects: {
              indicatorChanges: { clareza: +25, privacidade: +25, confianca: +15 },
              addFacts: ['Você desconfiou da mensagem e testou a identidade do amigo por outro canal.']
            }
          },
          {
            id: 'c9_refuse_code',
            label: '🛡️ "O próprio SMS avisa que NUNCA se compartilha esse código. Não posso mandar."',
            description: 'Seguir a regra fundamental de segurança de credenciais.',
            targetNodeId: 'ep9_code_refused',
            effects: {
              indicatorChanges: { limites: +25, privacidade: +30, clareza: +20 }
            }
          },
          {
            id: 'c9_warn_family',
            label: 'Avisar no grupo dos amigos que a conta do Cris pode ter sido invadida',
            description: 'Proteger outras pessoas de caírem na mesma armadilha.',
            targetNodeId: 'ep9_warn_circle',
            effects: {
              indicatorChanges: { clareza: +20, confianca: +20 }
            }
          }
        ]
      },
      ep9_voice_test: {
        id: 'ep9_voice_test',
        title: 'Chamada de Verificação',
        messages: [
          {
            id: 'm9_3',
            senderId: 'player',
            senderType: 'player',
            text: 'Pera aí Cris, atende a chamada de áudio aí rapidinho pra eu te falar.',
            timestamp: '15:32'
          },
          {
            id: 'm9_4',
            senderId: 'cris',
            senderType: 'contact',
            text: 'Não posso atender agora mano, tô no meio da rua sem fone! Manda por aqui que é urgente!!',
            timestamp: '15:33'
          },
          {
            id: 'm9_5',
            senderId: 'player',
            senderType: 'player',
            text: 'Qual é o nome do cachorro que a gente resgatou ano passado na praia?',
            timestamp: '15:33'
          },
          {
            id: 'm9_6',
            senderId: 'cris',
            senderType: 'contact',
            text: '...Que papo é esse mano, me manda o código logo',
            timestamp: '15:34'
          }
        ],
        choices: [
          {
            id: 'c9_caught_hacker',
            label: 'Desmascarar a invasão: "Você não é o Cris. Ele não tem cachorro, a gente resgatou uma gatinha!"',
            targetNodeId: 'ep9_hacker_revealed',
            effects: {
              indicatorChanges: { clareza: +25, privacidade: +25, limites: +20 }
            }
          }
        ]
      },
      ep9_hacker_revealed: {
        id: 'ep9_hacker_revealed',
        title: 'Golpe Frustrado',
        messages: [
          {
            id: 'm9_7',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'O usuário encerrou a sessão. O verdadeiro Cris acabou de avisar pela escola que perdeu acesso ao aparelho há 20 minutos.',
            timestamp: '15:36'
          }
        ],
        choices: [
          {
            id: 'c9_end_success',
            label: 'Bloquear e ajudar o Cris real a recuperar a conta',
            targetNodeId: 'ep9_summary',
            effects: {
              indicatorChanges: { confianca: +25, limites: +20 }
            }
          }
        ]
      },
      ep9_code_refused: {
        id: 'ep9_code_refused',
        title: 'Defesa Inabalável',
        messages: [
          {
            id: 'm9_8',
            senderId: 'player',
            senderType: 'player',
            text: 'Não passo código de autenticação sob nenhuma hipótese. Se você perdeu acesso, usa a recuperação oficial do app.',
            timestamp: '15:33'
          },
          {
            id: 'm9_9',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Tentativa de sequestro de conta neutralizada com sucesso.',
            timestamp: '15:35'
          }
        ],
        choices: [
          {
            id: 'c9_end_safe2',
            label: 'Concluir Episódio',
            targetNodeId: 'ep9_summary'
          }
        ]
      },
      ep9_warn_circle: {
        id: 'ep9_warn_circle',
        title: 'Alerta Comunitário',
        messages: [
          {
            id: 'm9_10',
            senderId: 'bia',
            senderType: 'contact',
            text: 'Nossa, acabei de receber a mesma mensagem do perfil do Cris pedindo dinheiro! Valeu por avisar!',
            timestamp: '15:35'
          }
        ],
        choices: [
          {
            id: 'c9_end_circle',
            label: 'Concluir Episódio',
            targetNodeId: 'ep9_summary'
          }
        ]
      },
      ep9_summary: {
        id: 'ep9_summary',
        title: 'Reflexão: Conta de Amigo',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 10: PRESSÃO SOCIAL & O DESAFIO
     ------------------------------------------------------------------------ */
  {
    id: 'ep10',
    number: 10,
    title: 'Pressão Social',
    subtitle: '"Todo mundo tá fazendo": dilema ético de desafio viral',
    theme: 'Gravação sem consentimento, consequências reais e integridade',
    targetApp: 'loop',
    chatPartnerId: 'rafa',
    description: 'Um desafio viral desafia alunos a gravarem áudio escondido da Profa. Helena para postar no Loop com dublagem irônica. A pressão no grupo é pesada.',
    startingNodeId: 'ep10_start',
    summary: {
      takeaway: 'Gravar ou expor pessoas sem autorização não é "zoeira inofensiva", é invasão de privacidade que pode ter consequências disciplinares e legais graves.',
      keyThemes: ['Conformismo de grupo', 'Consentimento de imagem e voz', 'Coragem de dizer não'],
      alternativeReflections: [
        'Ter a coragem de não participar de algo que prejudica o outro inspira mais respeito do que rir de humilhação alheia.',
        'O argumento "todo mundo tá fazendo" é a desculpa mais comum para atitudes das quais nos arrependemos depois.'
      ]
    },
    nodes: {
      ep10_start: {
        id: 'ep10_start',
        title: 'A proposta do desafio',
        messages: [
          {
            id: 'm10_1',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Galera, tão sabendo do novo desafio do Loop da escola?? Quem gravar um áudio da Profa. Helena brava amanhã e fizer remix ganha 500 upvotes garantidos! 🎤💥',
            timestamp: '16:40'
          },
          {
            id: 'm10_2',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Todo mundo da sala de cima já fez com o professor de física. Bora fazer também, vai dar nada kkkk quem topa?',
            timestamp: '16:41'
          },
          {
            id: 'm10_3',
            senderId: 'cris',
            senderType: 'contact',
            text: 'Sei não Rafa... A Profa. Helena é super gente boa, se ela descobre vai ficar malzona.',
            timestamp: '16:42'
          },
          {
            id: 'm10_4',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Ah para de ser careta Cris! É só meme po. E aí @voce, você vai entrar nessa com a gente né?',
            timestamp: '16:43'
          }
        ],
        choices: [
          {
            id: 'c10_refuse_group',
            label: '🛑 "Tô fora. Zoar quem tá trabalhando pra ensinar a gente não tem graça nenhuma"',
            description: 'Assumir postura clara e defender o respeito à professora.',
            targetNodeId: 'ep10_firm_refusal',
            effects: {
              indicatorChanges: { limites: +25, clareza: +20, confianca: +15 },
              addFacts: ['Você se recusou publicamente a participar de um desafio vexatório contra a professora.']
            }
          },
          {
            id: 'c10_alternative_challenge',
            label: '💡 "Se a gente quer engajar no Loop, por que não faz um desafio de meme sobre a própria matéria da feira?"',
            description: 'Canalizar a criatividade da turma para algo divertido e construtivo.',
            targetNodeId: 'ep10_creative_shift',
            effects: {
              indicatorChanges: { clareza: +25, confianca: +25, limites: +15 },
              addFacts: ['Você propôs uma alternativa criativa para a energia da turma.']
            }
          },
          {
            id: 'c10_consequences_warn',
            label: '⚖️ "Gravar áudio escondido dá suspensão direta e é ilegal. Vale a pena por upvote de internet?"',
            description: 'Trazer a turma para a realidade das consequências práticas.',
            targetNodeId: 'ep10_legal_reality',
            effects: {
              indicatorChanges: { clareza: +20, limites: +20 }
            }
          }
        ]
      },
      ep10_firm_refusal: {
        id: 'ep10_firm_refusal',
        title: 'Postura autêntica',
        messages: [
          {
            id: 'm10_5',
            senderId: 'player',
            senderType: 'player',
            text: 'Tô fora, Rafa. A Helena ajuda a gente o ano inteiro. Não vou ficar gravando ninguém escondido pra virar piada.',
            timestamp: '16:44'
          },
          {
            id: 'm10_6',
            senderId: 'sam',
            senderType: 'contact',
            text: 'Concordo 100%. Acho muita mancada fazer isso com quem respeita a gente.',
            timestamp: '16:45'
          },
          {
            id: 'm10_7',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'É... Visto por esse lado... Acho que me empolguei demais com a ideia. Deixa quieto então.',
            timestamp: '16:46'
          }
        ],
        choices: [
          {
            id: 'c10_end_respect',
            label: 'Concluir com a turma alinhada no respeito mútuo',
            targetNodeId: 'ep10_summary'
          }
        ]
      },
      ep10_creative_shift: {
        id: 'ep10_creative_shift',
        title: 'Alternativa Criativa',
        messages: [
          {
            id: 'm10_8',
            senderId: 'bia',
            senderType: 'contact',
            text: 'Nossa, que ideia maravilhosa! Memes sobre as fórmulas e experiências da feira vão bombar muito mais e a direção até apoia!',
            timestamp: '16:45'
          },
          {
            id: 'm10_9',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Pô, aí eu vi vantagem! Já tenho três ideias de trocadilhos kkkk fechou!',
            timestamp: '16:46'
          }
        ],
        choices: [
          {
            id: 'c10_end_creative',
            label: 'Concluir Episódio com vitória coletiva',
            targetNodeId: 'ep10_summary',
            effects: {
              indicatorChanges: { confianca: +30, clareza: +20 }
            }
          }
        ]
      },
      ep10_legal_reality: {
        id: 'ep10_legal_reality',
        title: 'Alerta Realista',
        messages: [
          {
            id: 'm10_10',
            senderId: 'cris',
            senderType: 'contact',
            text: 'O @voce tá certo. Lembra que ano passado chamaram os responsáveis de três alunos por causa de gravação na aula? Nem compensa o estresse.',
            timestamp: '16:45'
          }
        ],
        choices: [
          {
            id: 'c10_end_rules',
            label: 'Concluir Episódio',
            targetNodeId: 'ep10_summary'
          }
        ]
      },
      ep10_summary: {
        id: 'ep10_summary',
        title: 'Reflexão: Pressão Social',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 11: AUDITOR DE PERMISSÕES (DETETIVE DE PERMISSÕES)
     ------------------------------------------------------------------------ */
  {
    id: 'ep11',
    number: 11,
    title: 'Privacidade & Permissões',
    subtitle: 'Minigame: O que um aplicativo de figurinhas realmente precisa?',
    theme: 'Permissões abusivas, dados em segundo plano e rastreamento',
    targetApp: 'vault',
    chatPartnerId: 'nexo_seguranca',
    description: 'Um novo aplicativo de figurinhas animadas "StickerMagic" pede permissão para acessar microfone 24 horas, localização precisa e lista de contatos para funcionar.',
    startingNodeId: 'ep11_start',
    summary: {
      takeaway: 'Aplicativos só devem receber permissões estritamente necessárias para a função que realizam. Aplicativos de imagem não precisam do seu microfone nem localização.',
      keyThemes: ['Minimização de dados', 'Auditoria no Vault', 'Venda de metadados'],
      alternativeReflections: [
        'Negar permissões invasivas protege não apenas a sua privacidade, mas também a agenda de contatos dos seus amigos.',
        'O Vault do Nexo permite revogar permissões a qualquer momento com apenas um clique.'
      ]
    },
    nodes: {
      ep11_start: {
        id: 'ep11_start',
        title: 'Instalação do StickerMagic',
        interactiveMinigame: 'permission_audit',
        messages: [
          {
            id: 'm11_1',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Gente, baixem esse app "StickerMagic"! Tem as melhores figurinhas animadas do momento! 🤩✨',
            timestamp: '13:00'
          },
          {
            id: 'm11_vault',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Auditoria de Instalação Nexo Vault: O aplicativo "StickerMagic" solicita:\n• Armazenamento (para salvar stickers)\n• Microfone em segundo plano\n• Localização precisa contínua\n• Todos os seus contatos telefônicos',
            timestamp: '13:01'
          }
        ],
        choices: [
          {
            id: 'c11_custom_permissions',
            label: '🔒 Conceder APENAS armazenamento e bloquear microfone, GPS e contatos',
            description: 'Aplicar o princípio da minimização de privilégios.',
            targetNodeId: 'ep11_minimal_granted',
            effects: {
              indicatorChanges: { privacidade: +30, limites: +25, clareza: +20 },
              addFacts: ['Você barrou permissões abusivas de microfone e GPS em um app de imagens.']
            }
          },
          {
            id: 'c11_investigate_dev',
            label: '🔍 Investigar os termos de privacidade do desenvolvedor no Vault',
            description: 'Ver para onde os dados dos contatos seriam enviados.',
            targetNodeId: 'ep11_privacy_investigated',
            type: 'investigate',
            effects: {
              indicatorChanges: { clareza: +25, privacidade: +20 }
            }
          },
          {
            id: 'c11_uninstall_abusive',
            label: '🗑️ Desinstalar imediatamente o app por abuso de privacidade',
            description: 'Não alimentar aplicativos que exigem dados desproporcionais.',
            targetNodeId: 'ep11_uninstalled',
            effects: {
              indicatorChanges: { privacidade: +30, limites: +25 }
            }
          }
        ]
      },
      ep11_minimal_granted: {
        id: 'ep11_minimal_granted',
        title: 'Proteção Ativa',
        messages: [
          {
            id: 'm11_2',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Vault configurado: StickerMagic opera em sandbox sem acesso a áudio, localização ou agenda.',
            timestamp: '13:03'
          },
          {
            id: 'm11_3',
            senderId: 'player',
            senderType: 'player',
            text: 'Rafa, avisa no grupo pra galera conferir as permissões do app no Vault. Ele tava querendo escutar o microfone o tempo todo!',
            timestamp: '13:04'
          }
        ],
        choices: [
          {
            id: 'c11_end_minimal',
            label: 'Concluir auditoria de segurança',
            targetNodeId: 'ep11_summary'
          }
        ]
      },
      ep11_privacy_investigated: {
        id: 'ep11_privacy_investigated',
        title: 'Termos Suspeitos',
        contextNote: 'Cláusula 8.2: "Os dados de localização e áudio ambiente poderão ser compartilhados com parceiros publicitários para fins de marketing comportamental."',
        messages: [
          {
            id: 'm11_4',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Alerta Vault: Coleta de dados direcionada para corretores de dados (data brokers).',
            timestamp: '13:03'
          }
        ],
        choices: [
          {
            id: 'c11_end_purge',
            label: 'Desinstalar o app e avisar os colegas no Pulse',
            targetNodeId: 'ep11_summary',
            effects: {
              indicatorChanges: { privacidade: +30, clareza: +25 }
            }
          }
        ]
      },
      ep11_uninstalled: {
        id: 'ep11_uninstalled',
        title: 'App Removido',
        messages: [
          {
            id: 'm11_5',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: 'Aplicativo removido com sucesso. Nenhum dado foi compartilhado.',
            timestamp: '13:04'
          }
        ],
        choices: [
          {
            id: 'c11_end_removed',
            label: 'Concluir Episódio',
            targetNodeId: 'ep11_summary'
          }
        ]
      },
      ep11_summary: {
        id: 'ep11_summary',
        title: 'Reflexão: Privacidade & Permissões',
        messages: [],
        choices: []
      }
    }
  },

  /* ------------------------------------------------------------------------
     EPISÓDIO 12: GRAN FINALE: REDEFININDO O ESPAÇO
     ------------------------------------------------------------------------ */
  {
    id: 'ep12',
    number: 12,
    title: 'Redefinindo o Espaço',
    subtitle: 'Consolidando autonomia, limites e cidadania digital no Nexo',
    theme: 'Síntese das escolhas, postura digital madura e encerramento',
    targetApp: 'pulse',
    chatPartnerId: 'cris',
    description: 'No final da semana, a turma se reúne virtualmente para comemorar o sucesso da feira e alinhar o manifesto de convivência do grupo para o próximo ano.',
    startingNodeId: 'ep12_start',
    summary: {
      takeaway: 'Viver online com segurança e prazer não é sobre ter medo da internet, mas sobre ter consciência das suas escolhas e respeito aos seus limites.',
      keyThemes: ['Cidadania digital plena', 'Comunidade saudável', 'Autonomia no Nexo'],
      alternativeReflections: [
        'A tecnologia se torna muito mais leve quando a gente não precisa se provar para ninguém nem se expor para ser ouvido.',
        'Seu dispositivo Nexo agora reflete suas decisões com clareza, limites firmes e confiança cultivada.'
      ]
    },
    nodes: {
      ep12_start: {
        id: 'ep12_start',
        title: 'O Encerramento da Semana',
        messages: [
          {
            id: 'm12_1',
            senderId: 'bia',
            senderType: 'contact',
            text: 'Gente!! A apresentação da feira foi um SUCESSO absoluto! A coordenação elogiou demais nossa equipe e nossos projetos!',
            timestamp: '18:00'
          },
          {
            id: 'm12_2',
            senderId: 'sam',
            senderType: 'contact',
            text: 'Os banners ficaram tão lindos... Valeu mesmo pelo apoio de todo mundo aqui quando eu tava inseguro ❤️',
            timestamp: '18:01'
          },
          {
            id: 'm12_3',
            senderId: 'cris',
            senderType: 'contact',
            text: 'E o mais da hora foi que a gente passou por um monte de perrengue essa semana — golpe de link, prints cortados, tretas — e saiu muito mais unido.',
            timestamp: '18:02'
          },
          {
            id: 'm12_4',
            senderId: 'rafa',
            senderType: 'contact',
            text: 'Pois é mano... Eu aprendi a segurar um pouco a zoeira e checar antes de passar as coisas pra frente rs. Valeu @voce por sempre trazer bom senso pra cá!',
            timestamp: '18:03'
          }
        ],
        choices: [
          {
            id: 'c12_reflect_growth',
            label: '🌟 "A gente aprendeu que conviver online é saber ouvir, respeitar limites e cuidar um do outro"',
            description: 'Compartilhar um aprendizado coletivo inspirador.',
            targetNodeId: 'ep12_grand_celebration',
            effects: {
              indicatorChanges: { clareza: +20, confianca: +25, limites: +20, privacidade: +20 },
              addFacts: ['Você consolidou sua jornada como um elo de confiança e equilíbrio digital no Nexo OS.']
            }
          },
          {
            id: 'c12_invite_games',
            label: '🎮 "Agora que o trabalho acabou, quem topa um squad justo no PlayHub sem estresse?"',
            description: 'Celebrar jogando com respeito e diversão.',
            targetNodeId: 'ep12_grand_celebration',
            effects: {
              indicatorChanges: { confianca: +20, limites: +15 }
            }
          }
        ]
      },
      ep12_grand_celebration: {
        id: 'ep12_grand_celebration',
        title: 'Certificado de Cidadania Digital Nexo',
        messages: [
          {
            id: 'm12_5',
            senderId: 'nexo_seguranca',
            senderType: 'system',
            text: '🎉 Parabéns! Você concluiu todos os 12 episódios da jornada Vida Online no Nexo OS. Seus indicadores de Privacidade, Clareza, Limites e Confiança compõem sua assinatura digital única.',
            timestamp: '18:05'
          }
        ],
        choices: [
          {
            id: 'c12_final_summary',
            label: 'Ver Relatório Geral da Jornada & Insígnias',
            targetNodeId: 'ep12_summary'
          }
        ]
      },
      ep12_summary: {
        id: 'ep12_summary',
        title: 'Gran Finale: Redefinindo o Espaço',
        messages: [],
        choices: []
      }
    }
  }
];
