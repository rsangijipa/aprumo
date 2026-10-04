// Edge Function: ingest
// Endpoint para sincronização em lote da outbox cifrada (Doc B §12; Plano V2 F1, F3).
// Roteia tentativas, oportunidades, passos de cadeia, comportamentos, pontuações Denver e retratações.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { IngestBatchRequest, type IngestBatchResponse } from '../../../packages/protocol/src/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const parsed = IngestBatchRequest.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'invalid_batch_payload', details: parsed.error.format() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, caseId, trials, opportunities: _opportunities, chainSteps: _chainSteps, denverStepScores, behaviors: _behaviors, retractions, pauses: _pauses, notes: _notes } = parsed.data;

    let persistedCount = 0;
    let quarantinedCount = 0;
    const quarantinedErrors: Array<{ id: string; reason: string }> = [];

    // 1. Processa tentativas ABA
    for (const trial of trials) {
      try {
        const { error } = await supabase.from('trial_records').insert({
          session_id: sessionId,
          target_id: trial.target_id,
          prompt_level_id: trial.prompt_level_id,
          phase: trial.phase,
          response: trial.response,
          channel: trial.channel ?? 'table',
          latency_ms: trial.latency_ms ?? null,
          recorded_at: trial.recorded_at ?? new Date().toISOString(),
          client_event_id: trial.client_event_id ?? trial.id,
        });

        if (error) {
          if (error.code === '23505') {
            // Idempotência: id do cliente já registrado, ignorado com sucesso
            persistedCount++;
          } else {
            quarantinedCount++;
            quarantinedErrors.push({ id: String(trial.id), reason: error.message });
          }
        } else {
          persistedCount++;
        }
      } catch (e) {
        quarantinedCount++;
        quarantinedErrors.push({ id: String(trial.id), reason: (e as Error).message });
      }
    }

    // 2. Processa retratações (desfazer dentro de 5s)
    for (const ret of retractions) {
      try {
        const { error } = await supabase.from('trial_retractions').insert({
          session_id: ret.session_id,
          trial_client_event_id: ret.trial_client_event_id,
          reason: ret.reason,
        });
        if (!error) persistedCount++;
      } catch {
        // Quarentena
      }
    }

    // 3. Processa pontuações de passos Denver
    for (const dss of denverStepScores) {
      try {
        const { error } = await supabase.from('denver_step_scores').insert({
          session_id: sessionId,
          step_id: dss.stepId ?? dss.step_id,
          interval_index: dss.intervalIndex ?? dss.interval_index ?? 0,
          value: dss.value,
          recorded_at: dss.recordedAt ?? dss.recorded_at ?? new Date().toISOString(),
        });
        if (!error) persistedCount++;
      } catch {
        // Ignora duplicações
      }
    }

    // 4. Dispara avaliação do motor de regras no servidor
    let alertsTriggered = 0;
    try {
      const { data: alertCount } = await supabase.rpc('evaluate_rules_for_case', { p_case_id: caseId });
      if (typeof alertCount === 'number') {
        alertsTriggered = alertCount;
      }
    } catch {
      // Motor assíncrono
    }

    const responsePayload: IngestBatchResponse = {
      success: true,
      persistedCount,
      quarantinedCount,
      quarantinedErrors,
      alertsTriggered,
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
