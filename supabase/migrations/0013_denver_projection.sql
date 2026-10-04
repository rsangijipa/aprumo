-- Aprumo · 0013 · Projeção Denver: cálculo real de intervalos por passo e rotina.

create or replace view public.fact_denver_step_session with (security_invoker = true) as
select dss.step_id,
       dss.session_id,
       s.case_id,
       s.started_at as session_at,
       dss.routine_record_id,
       count(*) as total_intervals,
       count(*) filter (where dss.score = 'pass') as pass_intervals,
       count(*) filter (where dss.score = 'partial') as partial_intervals,
       count(*) filter (where dss.score = 'fail') as fail_intervals,
       round(100.0 * count(*) filter (where dss.score = 'pass') / nullif(count(*), 0), 2) as pass_pct,
       round(100.0 * count(*) filter (where dss.score in ('pass', 'partial')) / nullif(count(*), 0), 2) as pass_or_partial_pct
from public.denver_step_scores dss
join public.sessions s on s.id = dss.session_id
group by dss.step_id, dss.session_id, s.case_id, s.started_at, dss.routine_record_id;

grant select on public.fact_denver_step_session to authenticated;
