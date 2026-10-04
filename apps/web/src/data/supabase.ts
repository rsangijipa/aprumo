/**
 * Integração Supabase (ativa somente com VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY).
 * - Só a chave pública (anon) vai ao navegador; RLS é a fronteira. Nada de service role aqui.
 * - Sessão de autenticação em sessionStorage: em tablet compartilhado, fechar a aba encerra o acesso.
 * - Prontuário exige segundo fator (AAL2) — ver requireAal2.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { OutboxRecord } from '@aprumo/offline';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, storage: typeof window !== 'undefined' ? window.sessionStorage : undefined, autoRefreshToken: true },
      })
    : null;

export const isSupabaseConfigured = supabase != null;

/* ------------------------------------------------------------ autenticação */
export type AuthStep =
  | { kind: 'signed_out' }
  | { kind: 'needs_mfa_enroll' }
  | { kind: 'needs_mfa_verify'; factorId: string }
  | { kind: 'ready' };

export async function signIn(email: string, password: string): Promise<AuthStep> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Mensagem genérica: não revela se o e-mail existe.
  if (error) throw new Error('E-mail ou senha inválidos.');
  return currentStep();
}

/** Em que ponto da autenticação a pessoa está (AAL1 → precisa do segundo fator). */
export async function currentStep(): Promise<AuthStep> {
  if (!supabase) return { kind: 'ready' };
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return { kind: 'signed_out' };
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === 'aal2') return { kind: 'ready' };
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totp = factors?.totp.find((f) => f.status === 'verified');
  return totp ? { kind: 'needs_mfa_verify', factorId: totp.id } : { kind: 'needs_mfa_enroll' };
}

export async function enrollTotp(): Promise<{ factorId: string; qrSvg: string; secret: string }> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Aprumo' });
  if (error || !data) throw new Error('Não foi possível iniciar o cadastro do autenticador.');
  return { factorId: data.id, qrSvg: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyTotp(factorId: string, code: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  if (!/^\d{6}$/.test(code)) throw new Error('O código tem 6 dígitos.');
  const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({ factorId });
  if (e1 || !ch) throw new Error('Não foi possível validar agora. Tente de novo.');
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
  if (error) throw new Error('Código incorreto ou expirado.');
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

/* ------------------------------------------------------------ sincronização */
/**
 * Envia um lote da outbox. Cada tipo vai para a sua RPC/tabela; só os ids confirmados pelo
 * servidor saem do aparelho. Registros já existentes contam como confirmados (idempotência).
 */
export async function supabaseSender(stream: string, records: OutboxRecord[]): Promise<string[]> {
  if (!supabase) return [];
  const acked: string[] = [];
  const byKind = new Map<string, OutboxRecord[]>();
  for (const r of records) byKind.set(r.kind, [...(byKind.get(r.kind) ?? []), r]);

  for (const [kind, batch] of byKind) {
    if (kind === 'trial') {
      const rows = batch.map((r) => ({ ...(r.payload as Record<string, unknown>), client_event_id: r.clientEventId }));
      const { data, error } = await supabase.rpc('ingest_trial_records', { p_session: stream, p_records: rows });
      if (error) {
        // Erro permanente (dado inválido, restrição, regra do banco): quarentena e sai da fila.
        // Falha de rede ou sessão expirada: fica na fila para nova tentativa.
        if (isPermanent(error.code)) {
          await quarantine(batch, error.message);
          acked.push(...batch.map((r) => r.clientEventId));
        }
        continue;
      }
      acked.push(...((data as string[] | null) ?? []));
      continue;
    }
    const table = TABLE_BY_KIND[kind];
    if (!table) {
      await quarantine(batch, `tipo de registro desconhecido: ${kind}`);
      acked.push(...batch.map((r) => r.clientEventId));
      continue;
    }
    const rows = batch.map((r) => ({ ...(r.payload as Record<string, unknown>), client_event_id: r.clientEventId }));
    const { error } = await supabase.from(table).upsert(rows, { onConflict: table === 'home_task_records' ? 'client_event_id' : 'session_id,client_event_id', ignoreDuplicates: true });
    if (!error) acked.push(...batch.map((r) => r.clientEventId));
    else if (isPermanent(error.code)) {
      await quarantine(batch, error.message);
      acked.push(...batch.map((r) => r.clientEventId));
    }
  }
  return acked;
}

/** Classes SQLSTATE 22 (dado), 23 (integridade) e P0 (exceção do banco) não se resolvem reenviando. */
export function isPermanent(code: string | undefined): boolean {
  return !!code && /^(22|23|P0)/.test(code);
}

const TABLE_BY_KIND: Record<string, string> = {
  behavior: 'behavior_events',
  token: 'token_deliveries',
  reinforcer_delivery: 'reinforcer_deliveries',
  denver_step_score: 'denver_step_scores',
  home_task_record: 'home_task_records',
};

async function quarantine(batch: OutboxRecord[], reason: string) {
  await supabase?.from('event_quarantine').insert(batch.map((r) => ({ raw: r.payload as object, reason })));
}
