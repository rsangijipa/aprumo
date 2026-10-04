/**
 * Outbox única do aparelho. Todo registro clínico (mesa, jogo, família) passa por aqui
 * e só sai depois que o servidor confirma o seu client_event_id.
 *  - Conteúdo cifrado com AES-GCM; a chave é um CryptoKey NÃO exportável guardado no IndexedDB.
 *  - `wipe()` apaga chave e fila (logout / fim do prazo no aparelho).
 *  - Nada vai para localStorage.
 */
import { openDB, type IDBPDatabase } from 'idb';

export interface OutboxRecord<T = unknown> {
  clientEventId: string;
  /** Agrupa o envio (ex.: session_id). */
  stream: string;
  kind: string;
  createdAt: string;
  payload: T;
}

interface StoredRecord {
  clientEventId: string;
  stream: string;
  kind: string;
  createdAt: string;
  iv: Uint8Array;
  data: ArrayBuffer;
  attempts: number;
}

export type Sender = (stream: string, records: OutboxRecord[]) => Promise<string[]>;

const DB = 'aprumo-outbox';
const enc = new TextEncoder();
const dec = new TextDecoder();

export class Outbox {
  private db: Promise<IDBPDatabase>;
  private key: Promise<CryptoKey> | null = null;
  private listeners = new Set<(n: number) => void>();
  private draining = false;

  constructor(private readonly name = DB) {
    this.db = openDB(this.name, 1, {
      upgrade(db) {
        db.createObjectStore('records', { keyPath: 'clientEventId' }).createIndex('stream', 'stream');
        db.createObjectStore('keys');
      },
    });
  }

  private async getKey(): Promise<CryptoKey> {
    this.key ??= (async () => {
      const db = await this.db;
      const existing = (await db.get('keys', 'k1')) as CryptoKey | undefined;
      if (existing) return existing;
      const k = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      await db.put('keys', k, 'k1');
      return k;
    })();
    return this.key;
  }

  async enqueue<T>(r: OutboxRecord<T>): Promise<void> {
    const key = await this.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(r.payload)));
    const stored: StoredRecord = { clientEventId: r.clientEventId, stream: r.stream, kind: r.kind, createdAt: r.createdAt, iv, data, attempts: 0 };
    const db = await this.db;
    // Idempotente: reenfileirar o mesmo id não duplica.
    if (!(await db.get('records', r.clientEventId))) await db.put('records', stored);
    this.notify();
  }

  async count(): Promise<number> {
    return (await this.db).count('records');
  }

  async list(stream?: string): Promise<OutboxRecord[]> {
    const db = await this.db;
    const rows = (stream ? await db.getAllFromIndex('records', 'stream', stream) : await db.getAll('records')) as StoredRecord[];
    const key = await this.getKey();
    return Promise.all(
      rows
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map(async (s) => ({
          clientEventId: s.clientEventId,
          stream: s.stream,
          kind: s.kind,
          createdAt: s.createdAt,
          payload: JSON.parse(dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: s.iv as BufferSource }, key, s.data))),
        })),
    );
  }

  async ack(ids: string[]): Promise<void> {
    const db = await this.db;
    const tx = db.transaction('records', 'readwrite');
    await Promise.all(ids.map((id) => tx.store.delete(id)));
    await tx.done;
    this.notify();
  }

  /** Envia em lotes de até 200; remove só o que o servidor devolveu como persistido. */
  async drain(send: Sender, batchSize = 200): Promise<{ sent: number; remaining: number }> {
    if (this.draining) return { sent: 0, remaining: await this.count() };
    this.draining = true;
    let sent = 0;
    try {
      const all = await this.list();
      const streams = [...new Set(all.map((r) => r.stream))];
      for (const stream of streams) {
        const records = all.filter((r) => r.stream === stream);
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          const acked = await send(stream, batch);
          await this.ack(acked);
          sent += acked.length;
        }
      }
    } finally {
      this.draining = false;
    }
    return { sent, remaining: await this.count() };
  }

  async wipe(): Promise<void> {
    const db = await this.db;
    await db.clear('records');
    await db.clear('keys');
    this.key = null;
    this.notify();
  }

  subscribe(cb: (pending: number) => void): () => void {
    this.listeners.add(cb);
    void this.count().then(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    void this.count().then((n) => this.listeners.forEach((cb) => cb(n)));
  }
}

/** Repetição exponencial com teto, para o laço de sincronização. */
export function backoff(attempt: number, baseMs = 1000, maxMs = 60_000): number {
  return Math.min(maxMs, baseMs * 2 ** attempt) * (0.75 + Math.random() * 0.5);
}
