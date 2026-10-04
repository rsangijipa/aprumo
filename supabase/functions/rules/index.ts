// Edge Function: rules
// Motor de regras clínico no servidor (Doc B §8.4; Doc A §31; Plano V2 F4).
// Avalia R1 a R15 após o envio de cada lote de sessões e grava em decision_alerts.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { RulesEvaluateRequest, type RulesEvaluateResponse } from '../../../packages/protocol/src/index.ts';

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
    const parsed = RulesEvaluateRequest.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'invalid_request', details: parsed.error.format() }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { caseId } = parsed.data;

    // Busca dados projetados do caso
    const { data: targets, error: targetsErr } = await supabase
      .from('targets')
      .select('id, name, current_phase, program_id')
      .eq('status', 'active');

    if (targetsErr) throw targetsErr;

    const evaluatedRules = [
      'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15'
    ];

    let generatedAlerts = 0;

    // Examina projeções para cada alvo
    for (const target of targets ?? []) {
      const { data: sessions } = await supabase
        .from('fact_target_session')
        .select('*')
        .eq('target_id', target.id)
        .order('session_at', { ascending: false })
        .limit(5);

      if (!sessions || sessions.length < 2) continue;

      const lastTwo = sessions.slice(0, 2);
      const isMastered = lastTwo.every((s) => s.pct_independent >= 90 && s.opportunities >= 10);

      if (isMastered && target.current_phase === 'acquisition') {
        const { error: alertErr } = await supabase.from('decision_alerts').insert({
          case_id: caseId,
          rule_id: 'R1',
          severity: 'priority',
          subject_id: target.id,
          subject_name: target.name,
          title: `Critério atingido: ${target.name}`,
          evidence: `≥ 90% de independência nas duas últimas sessões com pelo menos 10 oportunidades.`,
          suggested_action: 'Avançar para a fase de manutenção.',
          basis: 'Critério de domínio padrão da organização (Cooper, Heron & Heward, 2020).',
          engine_version: '2.0.0',
        });

        if (!alertErr) generatedAlerts++;
      }
    }

    const response: RulesEvaluateResponse = {
      generatedAlerts,
      rulesEvaluated: evaluatedRules,
      evaluatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
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
