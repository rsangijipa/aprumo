// ==========================================================================
// ESCAPE ROOM KIDS — ROOMS & PUZZLES DATA DEFINITIONS
// 3 Full Thematic Rooms, 4+ Interconnected Puzzles Each, Layered Hints
// ==========================================================================

import { RoomDefinition, InventoryItem } from './types';

// Pre-defined items
export const ALL_ITEMS: Record<string, InventoryItem> = {
  // Workshop items
  gear_brass: {
    id: 'gear_brass',
    name: 'Engrenagem de Bronze',
    description: 'Uma engrenagem polida com 8 dentes perfeitos encontrada no baú.',
    icon: 'Cog',
    modelType: 'gear',
    color: '#F59E0B',
    inspectText: 'No verso há uma gravação: "Gira com a força de duas rotações."',
  },
  key_blank: {
    id: 'key_blank',
    name: 'Chave de Latão Incompleta',
    description: 'Uma chave robusta com segredo vazio. Precisa de um mecanismo interno.',
    icon: 'Key',
    modelType: 'key',
    color: '#FBBF24',
    inspectText: 'Possui um compartimento cilíndrico oco para acoplar uma mola.',
    combinableWith: ['spring_clockwork'],
    combinationResult: 'master_key',
    combinationMessage: 'Você combinou a Chave Incompleta com a Mola Relojoeira, criando a Chave Mecânica Mestra!',
  },
  spring_clockwork: {
    id: 'spring_clockwork',
    name: 'Mola Relojoeira',
    description: 'Uma mola de aço flexível liberada pelo prisma de cristal.',
    icon: 'Zap',
    modelType: 'spring',
    color: '#38BDF8',
    inspectText: 'Uma mola espiral resistente perfeita para mecanismos de fechadura.',
    combinableWith: ['key_blank'],
    combinationResult: 'master_key',
    combinationMessage: 'Você combinou a Mola Relojoeira com a Chave de Latão!',
  },
  master_key: {
    id: 'master_key',
    name: 'Chave Mecânica Mestra',
    description: 'Uma chave mágica com dentes automáticos acionados por mola.',
    icon: 'KeyRound',
    modelType: 'key',
    color: '#10B981',
    inspectText: 'Pronta para abrir a porta blindada da Oficina!',
  },

  // Library items
  astrolabe_dial: {
    id: 'astrolabe_dial',
    name: 'Disco de Astrolábio',
    description: 'Um anel de latão gravado com constelações estelares.',
    icon: 'Compass',
    modelType: 'dial',
    color: '#F59E0B',
    inspectText: 'Alinha-se com precisão ao eixo do Globo Celeste.',
  },
  magnifier: {
    id: 'magnifier',
    name: 'Lupa dos Arcanos',
    description: 'Uma lente de cristal que revela tintas invisíveis e detalhes ocultos.',
    icon: 'Search',
    modelType: 'magnifier',
    color: '#818CF8',
    inspectText: 'O aro de prata ressoa com luz mágica.',
    combinableWith: ['scroll_fragment'],
    combinationResult: 'revealed_cipher',
    combinationMessage: 'Ao usar a Lupa sobre o Pergaminho, o código secreto de runas brilhou em dourado!',
  },
  scroll_fragment: {
    id: 'scroll_fragment',
    name: 'Fragmento de Pergaminho',
    description: 'Um pergaminho antigo com símbolos quase apagados pelo tempo.',
    icon: 'Scroll',
    modelType: 'scroll',
    color: '#FEF08A',
    inspectText: 'Parece haver uma mensagem oculta sob a superfície...',
    combinableWith: ['magnifier'],
    combinationResult: 'revealed_cipher',
    combinationMessage: 'A Lupa revelou os símbolos mágicos no pergaminho!',
  },
  revealed_cipher: {
    id: 'revealed_cipher',
    name: 'Segredo Revelado dos Tomos',
    description: 'O pergaminho iluminado mostra a ordem dos botões rúnicos: Sol, Lua, Estrela, Livro!',
    icon: 'FileCheck',
    modelType: 'scroll',
    color: '#F472B6',
    inspectText: 'Código: 1º Sol, 2º Lua, 3º Estrela, 4º Livro Sagrado.',
  },

  // Greenhouse items
  crystal_lens: {
    id: 'crystal_lens',
    name: 'Lente Prismática Solar',
    description: 'Uma lente lapidada que projeta o espectro solar puro.',
    icon: 'Sun',
    modelType: 'prism',
    color: '#38BDF8',
    inspectText: 'Focaliza os raios do teto de vidro diretamente nas flores.',
  },
  sprout_bulb: {
    id: 'sprout_bulb',
    name: 'Bulbo Dourado Sagrado',
    description: 'Um bulbo botânico raro que desabrochou após receber a água fresca.',
    icon: 'Sprout',
    modelType: 'seed',
    color: '#FBBF24',
    inspectText: 'Exala um aroma doce e precisa de pólen lunar para amadurecer.',
    combinableWith: ['lunar_pollen'],
    combinationResult: 'floral_key',
    combinationMessage: 'Você polinizou o Bulbo Dourado com o Pólen Lunar! Ele se transformou na Chave Floral de Âmbar!',
  },
  lunar_pollen: {
    id: 'lunar_pollen',
    name: 'Frasco com Pólen Lunar',
    description: 'Partículas brilhantes colhidas da grande árvore bioluminescente.',
    icon: 'FlaskConical',
    modelType: 'flask',
    color: '#C084FC',
    inspectText: 'Brilha na penumbra com um tom violeta suave.',
    combinableWith: ['sprout_bulb'],
    combinationResult: 'floral_key',
    combinationMessage: 'O pólen ativou a energia do bulbo!',
  },
  floral_key: {
    id: 'floral_key',
    name: 'Chave Floral de Âmbar',
    description: 'Uma chave viva entalhada com raízes douradas e pétalas de esmeralda.',
    icon: 'Flower2',
    modelType: 'flowerKey',
    color: '#34D399',
    inspectText: 'Encaixa-se perfeitamente na grande flor do portão do conservatório!',
  }
};

export const ROOMS_DATA: RoomDefinition[] = [
  // ==========================================
  // ROOM 1: OFICINA DO INVENTOR
  // ==========================================
  {
    id: 'workshop',
    name: 'Oficina do Inventor',
    themeName: 'Engrenagens, Cristais e Vapor',
    ambientFreqBase: 110,
    floorColor: '#78350F',
    wallColor: '#1E293B',
    accentColor: '#F59E0B',
    introStory: 'Bem-vindo à Oficina Secreta do Mestre Relojoeiro! Para destrancar o grande cofre da saída, descubra como seus mecanismos interagem: acerte a combinação do baú, acople o trem de engrenagens e alinhe o feixe de luz!',
    solvedStory: 'Incrível! Os pistões vibraram, as engrenagens se moveram em perfeita harmonia e a grande porta da Oficina se abriu para uma nova aventura!',
    hotspots: [
      {
        id: 'ws_chest',
        name: 'Baú de Ferramentas com Cadeado',
        position: [-2.2, 0.4, 1.8],
        cameraFocus: [-2.2, 0.6, 1.8],
        puzzleId: 'ws_symbol_lock',
        hintText: 'Um robusto baú de carvalho com 3 tambores de símbolos rúnicos.',
      },
      {
        id: 'ws_generator',
        name: 'Mural de Engrenagens do Gerador',
        position: [2.3, 1.4, -1.8],
        cameraFocus: [2.3, 1.4, -1.8],
        puzzleId: 'ws_gear_train',
        hintText: 'Três eixos giratórios aguardam as engrenagens no tamanho correto.',
      },
      {
        id: 'ws_prism',
        name: 'Pedestal com Prisma e Espelhos',
        position: [-1.2, 0.9, -1.5],
        cameraFocus: [-1.2, 0.9, -1.5],
        puzzleId: 'ws_light_beam',
        hintText: 'Um feixe luminoso emana do cristal e precisa alcançar o receptor solar da porta.',
      },
      {
        id: 'ws_workbench',
        name: 'Bancada de Desenho do Inventor',
        position: [-2.4, 0.8, -0.2],
        cameraFocus: [-2.4, 0.8, -0.2],
        hintText: 'Páginas de diagramas mostram a sequência das engrenagens e uma Chave Incompleta sobre a mesa.',
      },
      {
        id: 'ws_exit_door',
        name: 'Grande Porta Blindada de Saída',
        position: [0, 1.5, -2.9],
        cameraFocus: [0, 1.5, -2.9],
        requiresItem: 'master_key',
        isExitDoor: true,
        hintText: 'A fechadura principal requer uma Chave Mecânica Mestra completa para girar os trincos.',
      }
    ],
    puzzles: [
      {
        id: 'ws_symbol_lock',
        title: 'Cadeado Rúnico do Baú',
        type: 'symbolLock',
        description: 'Alinhe os 3 cilindros com os símbolos que representam o coração da oficina: Martelo, Engrenagem e Chave Inglesa.',
        rewardItem: ALL_ITEMS.gear_brass,
        hints: {
          ambient: 'Observe os símbolos pintados com tinta de cobre no projeto da bancada.',
          textual: 'A ordem das três ferramentas do inventor: primeiro o Martelo, depois a Engrenagem, e por fim a Chave Inglesa.',
          hotspotId: 'ws_chest',
          directStep: 'No baú à esquerda, selecione os símbolos: 🔨 Martelo, ⚙️ Engrenagem, 🔧 Chave Inglesa.'
        }
      },
      {
        id: 'ws_gear_train',
        title: 'Mecanismo de Engrenagens',
        type: 'gearTrain',
        description: 'Encaixe as engrenagens nos 3 eixos (Pequena, Média e Grande de Bronze) para transmitir a rotação até o dínamo.',
        hints: {
          ambient: 'O motor precisa de uma ponte contínua de dentes para acionar o dínamo.',
          textual: 'A menor engrenagem vai no motor inferior, a média no meio e a grande engrenagem de bronze no topo.',
          hotspotId: 'ws_generator',
          directStep: 'Colete a Engrenagem de Bronze no Baú e insira-a no mecanismo da parede direita.'
        }
      },
      {
        id: 'ws_light_beam',
        title: 'Espelho e Feixe do Cristal',
        type: 'lightBeam',
        description: 'Gire os dois espelhos móveis para desviar o feixe do cristal azul através da lente até a célula solar da porta.',
        rewardItem: ALL_ITEMS.spring_clockwork,
        hints: {
          ambient: 'A luz viaja em linha reta, mas ricocheteia nos espelhos em ângulo reto (90°).',
          textual: 'Gire o espelho 1 para apontar para a direita e o espelho 2 para apontar diretamente para a porta.',
          hotspotId: 'ws_prism',
          directStep: 'Clique no primeiro espelho para virá-lo a 45° e no segundo para mirar no receptor verde da saída.'
        }
      },
      {
        id: 'ws_exit_key',
        title: 'Montagem da Chave Mestra',
        type: 'combinationKey',
        description: 'A Chave de Latão encontrada na bancada precisa de uma Mola Relojoeira para funcionar. Combine-as no Inventário!',
        hints: {
          ambient: 'Abra a inspeção 3D do seu inventário para examinar itens e combiná-los.',
          textual: 'Selecione a Chave de Latão e combine-a com a Mola Relojoeira obtida pelo enigma do feixe de luz.',
          hotspotId: 'ws_exit_door',
          directStep: 'Clique na Chave no inventário, aperte "Combinar" com a Mola e use a Chave Mestra resultante na Porta!'
        }
      }
    ]
  },

  // ==========================================
  // ROOM 2: BIBLIOTECA SECRETA
  // ==========================================
  {
    id: 'library',
    name: 'Biblioteca Secreta',
    themeName: 'Tomos Antigos, Constelações e Sinos',
    ambientFreqBase: 130.81,
    floorColor: '#3B1F11',
    wallColor: '#172554',
    accentColor: '#38BDF8',
    introStory: 'Você adentrou a lendária Biblioteca dos Quatro Sábios. Estantes imponentes guardam séculos de conhecimento. Encontre o tomo que falta, decifre o mapa estelar do globo e toque a harmonia dos sinos para abrir a passagem secreta!',
    solvedStory: 'Os sinos ecoaram uma melodia triunfante! A estante central deslizou suavemente pela trilha secreta de madeira polida, revelando o portal estelar!',
    hotspots: [
      {
        id: 'lib_books',
        name: 'Atril dos Quatro Tomos Encantados',
        position: [-2.1, 0.9, 0.4],
        cameraFocus: [-2.1, 0.9, 0.4],
        puzzleId: 'lib_book_order',
        hintText: 'Quatro volumes encadernados em couro com runas de cores distintas.',
      },
      {
        id: 'lib_globe',
        name: 'Globo Celeste dos Astrolábios',
        position: [2.0, 1.1, 1.4],
        cameraFocus: [2.0, 1.1, 1.4],
        puzzleId: 'lib_constellation',
        hintText: 'Uma esfera de cobre com anéis que giram no céu noturno.',
      },
      {
        id: 'lib_bells',
        name: 'Pedestal com os Quatro Sinos Rúnicos',
        position: [2.2, 1.2, -1.2],
        cameraFocus: [2.2, 1.2, -1.2],
        puzzleId: 'lib_sound_sequence',
        hintText: 'Quatro sinos afinados com tons cristalinos (Dó, Mi, Sol, Lá).',
      },
      {
        id: 'lib_reading_table',
        name: 'Mesa de Leitura com Manuscrito',
        position: [-0.3, 0.7, 0.2],
        cameraFocus: [-0.3, 0.7, 0.2],
        hintText: 'Uma partitura de notas e uma caneta de pena repousam sob a luz da lamparina.',
      },
      {
        id: 'lib_secret_door',
        name: 'Estante Secreta com Fechadura Rúnica',
        position: [0, 1.6, -2.9],
        cameraFocus: [0, 1.6, -2.9],
        requiresItem: 'revealed_cipher',
        isExitDoor: true,
        hintText: 'Quatro botões rúnicos guardam o trilho da estante: Sol, Lua, Estrela e Livro.',
      }
    ],
    puzzles: [
      {
        id: 'lib_book_order',
        title: 'Ordem dos Tomos Mágicos',
        type: 'bookOrder',
        description: 'Organize os quatro livros coloridos de acordo com o poema do marcador: Vermelho (Fogo), Azul (Água), Verde (Terra) e Amarelo (Sol).',
        rewardItem: ALL_ITEMS.astrolabe_dial,
        hints: {
          ambient: 'O verso do marcador na mesa tem as cores dos 4 elementos da natureza.',
          textual: 'A ordem correta é do mais denso ao mais etéreo: Vermelho, Azul, Verde e Dourado.',
          hotspotId: 'lib_books',
          directStep: 'Clique nos livros no atril para reordená-los: Vermelho -> Azul -> Verde -> Amarelo.'
        }
      },
      {
        id: 'lib_constellation',
        title: 'Alinhamento da Constelação',
        type: 'constellation',
        description: 'Encaixe o Disco de Astrolábio no Globo e gire o anel celestial até alinhar as estrelas da Constelação da Fênix.',
        rewardItem: ALL_ITEMS.magnifier,
        hints: {
          ambient: 'O mapa celeste desenhado na parede atrás do globo indica a orientação do polo norte.',
          textual: 'Alinhe a seta dourada do astrolábio com a constelação da Fênix (marcação brilhante).',
          hotspotId: 'lib_globe',
          directStep: 'Colete o Disco de Astrolábio nos livros e gire o anel do globo 2 vezes para a direita.'
        }
      },
      {
        id: 'lib_sound_sequence',
        title: 'Sinfonia dos Quatro Sinos',
        type: 'soundSequence',
        description: 'Toque a sequência correta de 4 sinos indicada na partitura da lamparina: Sino 1 (Dó), Sino 3 (Sol), Sino 2 (Mi), Sino 4 (Lá).',
        rewardItem: ALL_ITEMS.scroll_fragment,
        hints: {
          ambient: 'A partitura na mesa de leitura mostra as notas coloridas correspondentes a cada sino.',
          textual: 'A ordem melódica é: 1 (Azul), 3 (Dourado), 2 (Verde), 4 (Púrpura).',
          hotspotId: 'lib_bells',
          directStep: 'Toque os sinos nesta exata sequência: 1º Sino, 3º Sino, 2º Sino, 4º Sino.'
        }
      },
      {
        id: 'lib_exit_door',
        title: 'Decifrar o Código das Runas',
        type: 'combinationKey',
        description: 'Combine a Lupa dos Arcanos com o Fragmento de Pergaminho no inventário para revelar a senha da estante secreta!',
        hints: {
          ambient: 'A Lupa dos Arcanos é capaz de revelar tintas mágicas invisíveis a olho nu.',
          textual: 'No inventário, inspecione a Lupa e combine-a com o Fragmento de Pergaminho.',
          hotspotId: 'lib_secret_door',
          directStep: 'Depois de combinar a Lupa com o Pergaminho, pressione os 4 símbolos na porta: Sol, Lua, Estrela e Livro.'
        }
      }
    ]
  },

  // ==========================================
  // ROOM 3: LABORATÓRIO BOTÂNICO
  // ==========================================
  {
    id: 'greenhouse',
    name: 'Laboratório Botânico',
    themeName: 'Estufa de Vidro, Plantas e Água',
    ambientFreqBase: 146.83,
    floorColor: '#14532D',
    wallColor: '#064E3B',
    accentColor: '#10B981',
    introStory: 'O antigo Conservatório Real guarda plantas mágicas que só florescem com o equilíbrio perfeito dos elementos! Equilibre as sementes na balança antiga, abra os canais de água pura e misture o espectro solar para abrir os portões do jardim!',
    solvedStory: 'O grande bulbo despertou em pétalas reluzentes! O perfume suave inundou a estufa e os portões de vinha se abriram para o nascer do sol!',
    hotspots: [
      {
        id: 'bot_scale',
        name: 'Balança Antiga de Pesagem de Sementes',
        position: [-2.1, 0.8, -1.1],
        cameraFocus: [-2.1, 0.8, -1.1],
        puzzleId: 'bot_seed_balance',
        hintText: 'Dois pratos de cobre aguardam o peso exato das sementes da floresta.',
      },
      {
        id: 'bot_pipes',
        name: 'Painel de Válvulas Hidropônicas',
        position: [2.1, 1.3, -1.4],
        cameraFocus: [2.1, 1.3, -1.4],
        puzzleId: 'bot_water_circuit',
        hintText: 'Quatro registros de cobre direcionam a água cristalina até o canteiro.',
      },
      {
        id: 'bot_prism_station',
        name: 'Filtro Solar de Vidros Coloridos',
        position: [-1.4, 1.1, 1.6],
        cameraFocus: [-1.4, 1.1, 1.6],
        puzzleId: 'bot_color_mixing',
        hintText: 'A luz solar precisa passar pelos filtros amarelo e azul para atingir a cor verde-esmeralda.',
      },
      {
        id: 'bot_lunar_tree',
        name: 'Grande Árvore Bioluminescente',
        position: [1.8, 1.0, 1.5],
        cameraFocus: [1.8, 1.0, 1.5],
        hintText: 'Nas folhas mais baixas reluz um Frasco com Pólen Lunar pronto para ser colhido.',
      },
      {
        id: 'bot_conservatory_gate',
        name: 'Portão Dourado de Vinhas e Flores',
        position: [0, 1.6, -2.9],
        cameraFocus: [0, 1.6, -2.9],
        requiresItem: 'floral_key',
        isExitDoor: true,
        hintText: 'A fechadura central tem a forma de uma flor aberta, aguardando a Chave Floral de Âmbar.',
      }
    ],
    puzzles: [
      {
        id: 'bot_seed_balance',
        title: 'Balança das Sementes Mágicas',
        type: 'weightBalance',
        description: 'Coloque as sementes nos pratos para igualar os pesos: 1 Bolota Solar (peso 3) = 1 Fruta de Cristal (peso 2) + 1 Semente de Lua (peso 1).',
        rewardItem: ALL_ITEMS.crystal_lens,
        hints: {
          ambient: 'Observe o tamanho e densidade de cada semente gravado no prato da balança.',
          textual: 'No prato esquerdo coloque a Bolota (3). No prato direito coloque a Fruta (2) e a Semente (1).',
          hotspotId: 'bot_scale',
          directStep: 'Arraste a Bolota Solar para o prato esquerdo e a Fruta + Semente para o prato direito.'
        }
      },
      {
        id: 'bot_water_circuit',
        title: 'Circuito de Válvulas de Água',
        type: 'waterCircuit',
        description: 'Gire as 4 válvulas rotativas para criar um caminho sem vazamentos do reservatório até a raiz do bulbo sagrado.',
        rewardItem: ALL_ITEMS.sprout_bulb,
        hints: {
          ambient: 'Siga a marcação azul nos canos de cobre: a água deve fluir sem interrupções.',
          textual: 'As válvulas 1 e 3 devem ficar na horizontal, e as válvulas 2 e 4 na vertical.',
          hotspotId: 'bot_pipes',
          directStep: 'Clique nas válvulas até que todas as 4 conexões fiquem alinhadas com o cano central.'
        }
      },
      {
        id: 'bot_color_mixing',
        title: 'Filtro Solar Cromático',
        type: 'colorMixing',
        description: 'Combine as lentes Amarela e Azul para produzir o feixe Verde-Esmeralda fotossintético que acorda o mecanismo do portão.',
        hints: {
          ambient: 'Cores primárias de luz e pigmento: amarelo com azul gera a vida verde da natureza.',
          textual: 'Ative a lente amarela e a lente azul simultaneamente para obter o raio verde.',
          hotspotId: 'bot_prism_station',
          directStep: 'Selecione o filtro Amarelo e o filtro Azul na estação de prismas.'
        }
      },
      {
        id: 'bot_exit_gate',
        title: 'Chave Floral de Âmbar',
        type: 'combinationKey',
        description: 'Combine o Bulbo Dourado com o Pólen Lunar coletado na árvore para despertar a Chave Floral que abre o grande portão!',
        hints: {
          ambient: 'A árvore luminosa à direita possui o pólen mágico que germina o bulbo instantaneamente.',
          textual: 'Colete o pólen na árvore e combine-o com o bulbo no seu inventário.',
          hotspotId: 'bot_conservatory_gate',
          directStep: 'No inventário, combine o Bulbo com o Pólen Lunar e insira a Chave Floral no portão!'
        }
      }
    ]
  }
];
