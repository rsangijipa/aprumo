# APRUMO — GAME TELEMETRY & EVENT SPECIFICATION

**Versão:** 2.0.0  
**Data:** Outubro de 2026  
**Status:** Protocolo Padrão da Plataforma (`packages/protocol` & `packages/game-sdk`)

---

## 1. Princípios de Privacidade e Anonimização

1. **Zero Dados Biométricos:** Em hipótese alguma serão capturados parâmetros biométricos, reconhecimento facial, rastreamento ocular (*eye tracking*) por webcam, ou gravações de áudio contínuas sem consentimento e finalidade explícita.
2. **Identificadores Pseudonimizados:** O envelope de jogo nunca recebe `cpf`, `rg`, `full_name` ou prontuário médico. Apenas `childDisplayName` (apelido afetivo), `runId` efêmero, `appId` e `targets`.
3. **Quarentena Imediata:** Eventos com payload inválido ou violação de esquema são desviados para uma fila de quarentena e nunca contaminam os gráficos clínicos nem o banco de dados principal.

---

## 2. Esquema Universal do Envelope de Eventos

Todos os eventos gerados pelos jogos seguem o formato de envelope padronizado em TypeScript / Zod:

```typescript
export interface EventEnvelope<T extends EventType = EventType> {
  eventId: string;           // UUIDv4 único gerado pelo cliente
  sequence: number;          // Contador incremental monotônico (0, 1, 2...)
  runId: string;             // Identificador da sessão ou bloco
  protocolVersion: '2.0.0';  // Versão do protocolo Aprumo
  appId: string;             // ID do jogo (ex: 'match-lab', 'missao-instrucao')
  type: T;                   // Tipo do evento registrado
  occurredAt: string;        // Timestamp ISO-8601 UTC
  payload: EventPayload<T>;  // Dados específicos do evento
}
```

---

## 3. Catálogo de Eventos e Payloads

### 3.1 Ciclo de Vida da Sessão
- `SESSION_STARTED`: `{ configVersion: string }`
- `SESSION_PAUSED`: `{ reason: string | null }`
- `SESSION_RESUMED`: `{}`
- `SESSION_COMPLETED`: `{ trialsCompleted: number }`
- `APP_CLOSED`: `{ reason: 'adult_exit' | 'timeout' | 'completed' }`

### 3.2 Tentativas Clínicas (Trial Loop)
- `TRIAL_STARTED`:
  ```typescript
  {
    targetId: string;        // ID do alvo clínico vigente
    trialIndex: number;      // Número da tentativa (0 a N)
    presented: string[];     // IDs dos estímulos apresentados na tela, por ordem
  }
  ```
- `TRIAL_COMPLETED`:
  ```typescript
  {
    targetId: string;
    stimulusId: string;
    trialIndex: number;
    presented: string[];
    positionOfTarget: number | null; // Índice geométrico onde o alvo estava
    selected: string | null;         // ID do estímulo tocado
    selectedPosition: number | null; // Índice tocado (detecção de viés de posição)
    response: 'correct' | 'incorrect' | 'no_response';
    latencyMs: number | null;        // Tempo em ms do estímulo até a escolha
    promptLevel: string;             // 'IND', 'GES', 'MOD', 'FP', etc.
    promptSource: 'none' | 'therapist' | 'built_in';
    selfCorrected?: boolean;         // Se a criança corrigiu a resposta antes do término
    attempts?: number;               // Tentativas antes da confirmação
    detail?: Record<string, unknown>;
  }
  ```

### 3.3 Dicas & Reforçamento
- `PROMPT_USED`:
  ```typescript
  {
    targetId: string;
    trialIndex: number;
    level: string;
    source: 'therapist' | 'built_in';
    latencyMs: number;
  }
  ```
- `TOKEN_DELIVERED`:
  ```typescript
  {
    boardId: string;
    tokenIndex: number;
    tokensRequired: number;
    contingentOn: string | null;
  }
  ```
- `BOARD_COMPLETED`:
  ```typescript
  {
    boardId: string;
    backupReinforcerId: string; // Reforçador de apoio conquistado
  }
  ```

---

## 4. Algoritmos de Detecção de Padrões na Telemetria

1. **Detecção de Viés de Posição (Regra R8):**
   Se em uma janela de 10 tentativas consecutivas a proporção de escolhas na mesma `selectedPosition` for ≥ 70% com acurácia global baixa, o motor gera o alerta de controle por posição.
2. **Detecção de Dependência de Dica (Regra R3):**
   Se o paciente mantiver acertos consistentes porém 100% sob `promptLevel !== 'IND'` por 3 blocos consecutivos sem redução na intrusividade, o motor sugere esvanecimento ou mudança no plano de dicas.
