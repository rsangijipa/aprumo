-- Aprumo · 0011 · Resolução segura de sessão infantil por token bearer.
-- O aparelho da criança opera sem credenciais de terapeuta, apenas com o token efêmero.

create function public.resolve_child_session(p_token text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_hash bytea;
  v_rec record;
  v_age_months int;
begin
  if p_token is null or length(trim(p_token)) < 8 then
    return jsonb_build_object('valid', false, 'reason', 'invalid_token');
  end if;

  v_hash := extensions.digest(p_token, 'sha256');

  select cs.id, cs.session_id, cs.child_id, cs.adaptation, cs.allowed_apps,
         cs.expires_at, cs.revoked_at,
         ch.preferred_name, ch.birth_date
  into v_rec
  from public.child_sessions cs
  join public.children ch on ch.id = cs.child_id
  where cs.token_hash = v_hash;

  if not found then
    return jsonb_build_object('valid', false, 'reason', 'not_found');
  end if;

  if v_rec.revoked_at is not null then
    return jsonb_build_object('valid', false, 'reason', 'revoked');
  end if;

  if v_rec.expires_at <= now() then
    return jsonb_build_object('valid', false, 'reason', 'expired');
  end if;

  v_age_months := (extract(year from age(current_date, v_rec.birth_date)) * 12 +
                   extract(month from age(current_date, v_rec.birth_date)))::int;

  return jsonb_build_object(
    'valid', true,
    'child_session_id', v_rec.id,
    'session_id', v_rec.session_id,
    'child_id', v_rec.child_id,
    'preferred_name', v_rec.preferred_name,
    'age_months', v_age_months,
    'adaptation', v_rec.adaptation,
    'allowed_apps', to_jsonb(v_rec.allowed_apps),
    'expires_at', v_rec.expires_at
  );
end $$;

create function public.revoke_child_session(p_token text)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_hash bytea;
begin
  if p_token is null then
    return false;
  end if;

  v_hash := extensions.digest(p_token, 'sha256');

  update public.child_sessions
  set revoked_at = now()
  where token_hash = v_hash and revoked_at is null;

  return found;
end $$;

grant execute on function public.resolve_child_session to anon, authenticated;
grant execute on function public.revoke_child_session to anon, authenticated;
