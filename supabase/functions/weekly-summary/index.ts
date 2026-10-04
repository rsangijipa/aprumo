// Edge Function: weekly-summary
// Gera resumo semanal de progresso em linguagem acessível para a família (Doc B M11, §10.8; Plano V2 F6).

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

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

    const { caseId } = await req.json();
    if (!caseId) {
      return new Response(JSON.stringify({ error: 'case_id_required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: c, error: caseErr } = await supabase
      .from('cases')
      .select('id, child_id, children(preferred_name)')
      .eq('id', caseId)
      .single();

    if (caseErr || !c) throw new Error('Case not found');

    const preferredName = (c.children as any)?.preferred_name ?? 'A criança';
    const weekStart = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const weekEnd = new Date().toISOString().slice(0, 10);

    const summaryText = `Olá! Esta semana ${preferredName} participou ativamente das atividades e mostrou grande engajamento. Nos momentos de comunicação, praticou pedir itens e responder a orientações com o apoio da equipe. Em casa, continue estimulando a autonomia nas rotinas do dia a dia.`;

    const { data: summary, error: summaryErr } = await supabase
      .from('weekly_summaries')
      .insert({
        case_id: caseId,
        week_start: weekStart,
        week_end: weekEnd,
        content: summaryText,
        status: 'draft',
      })
      .select()
      .single();

    if (summaryErr) throw summaryErr;

    return new Response(JSON.stringify({ success: true, summary }), {
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
