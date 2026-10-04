/**
 * Banco de teste: Postgres real (PGlite/WASM) com o mesmo contrato de autenticação do Supabase
 * (auth.uid() lê request.jwt.claim.sub; papéis anon/authenticated). Sem Docker.
 */
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS = join(import.meta.dirname, '..', 'migrations');

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;
  grant usage on schema public to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`;

export async function createDb() {
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(SUPABASE_STUB);
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) {
    try {
      await db.exec(readFileSync(join(MIGRATIONS, file), 'utf8'));
    } catch (e) {
      throw new Error(`migration ${file} failed: ${(e as Error).message}`);
    }
  }
  await db.exec('grant usage on schema extensions to authenticated;');
  return db;
}

export type Db = Awaited<ReturnType<typeof createDb>>;

/** Executa como superusuário (equivalente ao service role, só em testes e seeds). */
export async function asAdmin<T>(db: Db, sql: string, params: unknown[] = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
  return (await db.query<T>(sql, params)).rows;
}

/** Executa como usuário autenticado: RLS aplicada. */
export async function asUser<T>(db: Db, userId: string, sql: string, params: unknown[] = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${userId}', false); set role authenticated;`);
  try {
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec('reset role;');
  }
}

export const U = {
  anaSupervisor: '00000000-0000-4000-8000-00000000000a',
  beto: '00000000-0000-4000-8000-00000000000b',
  carlaOtherOrg: '00000000-0000-4000-8000-00000000000c',
  diegoAdmin: '00000000-0000-4000-8000-00000000000d',
} as const;
