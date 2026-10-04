/**
 * Camada de repositório canônica do Aprumo (Fase F1).
 * Fornece interface única e desacoplada entre a UI e as fontes de dados:
 * - DemoRepository: Dados simulados em memória para demonstração / testes clínicos offline.
 * - SupabaseRepository: Dados reais com PostgreSQL, RLS, Edge Functions e autenticação.
 */
import { useQuery } from '@tanstack/react-query';
import {
  type DecisionAlert,
  type TargetSessionSummary,
  summarizeByTargetSession,
} from '@aprumo/clinical-core';
import type { Adaptation } from '@aprumo/protocol';
import {
  actions,
  alertsForCase,
  type CaseAlert,
  db as demoDb,
  getState,
} from './store';
import {
  isSupabaseConfigured,
  supabase,
  openChildSession as rpcOpenChildSession,
  resolveChildSession as rpcResolveChildSession,
  revokeChildSession as rpcRevokeChildSession,
  createPlanRevision as rpcCreatePlanRevision,
  approvePlanRevision as rpcApprovePlanRevision,
} from './supabase';
import type {
  CaseRecord,
  Child,
  Target,
  SessionRecord,
  Fact,
  PromptHierarchy,
  Reinforcer,
  ChildSpace,
} from './types';

export interface AprumoRepository {
  readonly isConfigured: boolean;
  readonly isDemo: boolean;

  // Consultas (Queries)
  getCases(): Promise<CaseRecord[]>;
  getCase(id: string): Promise<CaseRecord | null>;
  getChildren(): Promise<Child[]>;
  getChild(id: string): Promise<Child | null>;
  getTargets(caseId: string): Promise<Target[]>;
  getSessions(caseId: string): Promise<SessionRecord[]>;
  getFacts(sessionId?: string): Promise<Fact[]>;
  getAlerts(caseId?: string): Promise<CaseAlert[] | DecisionAlert[]>;
  getSummaries(caseId: string): Promise<TargetSessionSummary[]>;
  getHierarchies(): Promise<PromptHierarchy[]>;
  getReinforcers(caseId: string): Promise<Reinforcer[]>;
  getChildSpace(childId: string): Promise<ChildSpace | null>;

  // Ações clínicas (Mutations)
  recordTrial(
    trial: Omit<Fact, 'id' | 'sessionAt' | 'implementerId' | 'setting'>,
    clientEventId?: string,
  ): Promise<Fact>;
  retractTrial(sessionId: string, trialId: string, reason?: string): Promise<void>;
  pauseSession(sessionId: string, reason?: string): Promise<void>;
  resumeSession(sessionId: string): Promise<void>;
  completeSession(sessionId: string, note: string): Promise<void>;

  // Sessão infantil segura
  openChildSession(
    sessionId: string,
    adaptation: Adaptation,
    allowedApps: string[],
    minutes?: number,
  ): Promise<string | null>;
  resolveChildSession(token: string): Promise<Record<string, unknown> | null>;
  revokeChildSession(token: string): Promise<boolean>;

  // Versionamento de planos
  revisePlan(caseId: string, planId?: string): Promise<string | null>;
  approvePlan(caseId: string, draftPlanId?: string): Promise<boolean>;
}

/* ================================================================ Demo Repository */

export class DemoRepository implements AprumoRepository {
  readonly isConfigured = false;
  readonly isDemo = true;

  async getCases(): Promise<CaseRecord[]> {
    return getState().cases;
  }

  async getCase(id: string): Promise<CaseRecord | null> {
    return getState().cases.find((c) => c.id === id) ?? null;
  }

  async getChildren(): Promise<Child[]> {
    return getState().children;
  }

  async getChild(id: string): Promise<Child | null> {
    return getState().children.find((ch) => ch.id === id) ?? null;
  }

  async getTargets(caseId: string): Promise<Target[]> {
    return getState().targets.filter((t) => t.caseId === caseId);
  }

  async getSessions(caseId: string): Promise<SessionRecord[]> {
    return getState().sessions.filter((s) => s.caseId === caseId);
  }

  async getFacts(sessionId?: string): Promise<Fact[]> {
    const facts = getState().facts;
    return sessionId ? facts.filter((f) => f.sessionId === sessionId) : facts;
  }

  async getAlerts(caseId?: string): Promise<CaseAlert[]> {
    const st = getState();
    if (caseId) return alertsForCase(st, caseId);
    return st.cases.flatMap((c) => alertsForCase(st, c.id));
  }

  async getSummaries(caseId: string): Promise<TargetSessionSummary[]> {
    const targets = getState().targets.filter((t) => t.caseId === caseId);
    const facts = getState().facts.filter((f) => targets.some((t) => t.id === f.targetId));
    return summarizeByTargetSession(facts);
  }

  async getHierarchies(): Promise<PromptHierarchy[]> {
    return demoDb.hierarchies;
  }

  async getReinforcers(caseId: string): Promise<Reinforcer[]> {
    return demoDb.reinforcers.filter((r) => r.caseId === caseId);
  }

  async getChildSpace(childId: string): Promise<ChildSpace | null> {
    return getState().childSpaces.find((cs) => cs.childId === childId) ?? null;
  }

  async recordTrial(
    trial: Omit<Fact, 'id' | 'sessionAt' | 'implementerId' | 'setting'>,
    clientEventId?: string,
  ): Promise<Fact> {
    return actions.recordTrial(trial, clientEventId);
  }

  async retractTrial(sessionId: string, trialId: string, reason?: string): Promise<void> {
    return actions.retractTrial(sessionId, trialId, reason);
  }

  async pauseSession(sessionId: string, reason?: string): Promise<void> {
    actions.pauseSession(sessionId, reason);
  }

  async resumeSession(sessionId: string): Promise<void> {
    actions.resumeSession(sessionId);
  }

  async completeSession(sessionId: string, note: string): Promise<void> {
    actions.completeSession(sessionId, note);
  }

  async openChildSession(
    sessionId: string,
    adaptation: Adaptation,
    allowedApps: string[],
    _minutes = 45,
  ): Promise<string | null> {
    return `demo-token-${Date.now()}`;
  }

  async resolveChildSession(_token: string): Promise<Record<string, unknown> | null> {
    const ch = getState().children[0];
    if (!ch) return null;
    return {
      valid: true,
      preferred_name: ch.preferredName,
      age_months: 48,
      allowed_apps: ['encontre-o-igual', 'escolha-pela-instrucao', 'minha-vez-sua-vez'],
      expires_at: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    };
  }

  async revokeChildSession(_token: string): Promise<boolean> {
    return true;
  }

  async revisePlan(caseId: string): Promise<string | null> {
    return actions.revisePlan(caseId);
  }

  async approvePlan(caseId: string): Promise<boolean> {
    actions.approvePlanRevision(caseId);
    return true;
  }
}

/* ================================================================ Supabase Repository */

export class SupabaseRepository implements AprumoRepository {
  readonly isConfigured = true;
  readonly isDemo = false;

  async getCases(): Promise<CaseRecord[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('cases').select('*').order('opened_at', { ascending: false });
    return (data ?? []).map((row) => ({
      id: row.id,
      childId: row.child_id,
      model: row.model ?? 'ABA',
      status: row.status,
      openedAt: row.opened_at,
      planVersion: row.plan_version ?? 1,
      planStatus: row.plan_status ?? 'active',
      planApprovedAt: row.plan_approved_at ?? row.opened_at,
      planReviewOn: row.plan_review_on ?? '',
      team: [],
      adaptation: row.adaptation ?? {},
      interests: [],
      restrictions: [],
      tokenTheme: 'estrela',
      releasedApps: ['encontre-o-igual', 'escolha-pela-instrucao', 'minha-vez-sua-vez'],
      isDemo: row.is_demo ?? false,
    }));
  }

  async getCase(id: string): Promise<CaseRecord | null> {
    if (!supabase) return null;
    const { data } = await supabase.from('cases').select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      childId: data.child_id,
      model: data.model ?? 'ABA',
      status: data.status,
      openedAt: data.opened_at,
      planVersion: data.plan_version ?? 1,
      planStatus: data.plan_status ?? 'active',
      planApprovedAt: data.plan_approved_at ?? data.opened_at,
      planReviewOn: data.plan_review_on ?? '',
      team: [],
      adaptation: data.adaptation ?? {},
      interests: [],
      restrictions: [],
      tokenTheme: 'estrela',
      releasedApps: ['encontre-o-igual', 'escolha-pela-instrucao', 'minha-vez-sua-vez'],
      isDemo: data.is_demo ?? false,
    };
  }

  async getChildren(): Promise<Child[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('children').select('*');
    return (data ?? []).map((row) => ({
      id: row.id,
      preferredName: row.preferred_name,
      fullName: row.full_name,
      birthDate: row.birth_date,
      hue: 150,
      accessCode: row.id.slice(0, 6).toUpperCase(),
    }));
  }

  async getChild(id: string): Promise<Child | null> {
    if (!supabase) return null;
    const { data } = await supabase.from('children').select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      preferredName: data.preferred_name,
      fullName: data.full_name,
      birthDate: data.birth_date,
      hue: 150,
      accessCode: data.id.slice(0, 6).toUpperCase(),
    };
  }

  async getTargets(caseId: string): Promise<Target[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('targets').select('*, programs!inner(plan_id, intervention_plans!inner(case_id))').eq('programs.intervention_plans.case_id', caseId);
    return (data ?? []).map((row) => ({
      id: row.id,
      caseId,
      programId: row.program_id,
      name: row.name,
      phase: row.current_phase,
      phaseChangedAt: row.phase_changed_at,
      defaultPrompt: 'IND',
      art: row.art_key ?? 'bola',
      teachingChannel: row.teaching_channel ?? 'table',
    }));
  }

  async getSessions(caseId: string): Promise<SessionRecord[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('sessions').select('*').eq('case_id', caseId).order('started_at', { ascending: false });
    return (data ?? []).map((row) => ({
      id: row.id,
      caseId: row.case_id,
      model: row.model,
      setting: row.setting,
      implementerId: row.implementer_id,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      status: row.status,
      clinicalNote: row.clinical_note,
      screenSeconds: row.screen_seconds ?? 0,
    }));
  }

  async getFacts(sessionId?: string): Promise<Fact[]> {
    if (!supabase) return [];
    let q = supabase.from('fact_trials').select('*');
    if (sessionId) q = q.eq('session_id', sessionId);
    const { data } = await q;
    return (data ?? []).map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      targetId: row.target_id,
      sessionAt: row.session_at,
      phase: row.phase,
      response: row.response,
      promptCode: row.prompt_code,
      promptIntrusiveness: Number(row.prompt_intrusiveness ?? 0),
      latencyMs: row.latency_ms,
      channel: row.channel,
      probe: row.probe ?? false,
      implementerId: row.implementer_id,
      setting: row.setting,
    }));
  }

  async getAlerts(caseId?: string): Promise<DecisionAlert[]> {
    if (!supabase) return [];
    let q = supabase.from('decision_alerts').select('*').eq('status', 'open');
    if (caseId) q = q.eq('case_id', caseId);
    const { data } = await q;
    return (data ?? []).map((row) => ({
      id: row.id,
      caseId: row.case_id,
      ruleId: row.rule_id,
      severity: row.severity,
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      title: row.title,
      evidence: row.evidence,
      suggestedAction: row.suggested_action,
      basis: row.basis,
    }));
  }

  async getSummaries(caseId: string): Promise<TargetSessionSummary[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('fact_target_session').select('*').eq('case_id', caseId);
    return (data ?? []).map((row) => ({
      targetId: row.target_id,
      sessionId: row.session_id,
      sessionAt: row.session_at,
      phase: row.phase,
      probe: row.probe,
      opportunities: row.opportunities,
      correctIndependent: row.correct_independent,
      correctPrompted: row.correct_prompted,
      incorrect: row.incorrect,
      noResponse: row.no_response,
      pctIndependent: row.pct_independent,
      pctPrompted: row.pct_prompted,
      meanPromptLevel: row.mean_prompt_level,
      medianLatencyMs: row.median_latency_ms,
      channel: row.channel,
      setting: row.setting ?? 'clinic',
      implementerId: row.implementer_id ?? '',
    }));
  }

  async getHierarchies(): Promise<PromptHierarchy[]> {
    return demoDb.hierarchies;
  }

  async getReinforcers(caseId: string): Promise<Reinforcer[]> {
    return demoDb.reinforcers.filter((r) => r.caseId === caseId);
  }

  async getChildSpace(childId: string): Promise<ChildSpace | null> {
    return getState().childSpaces.find((cs) => cs.childId === childId) ?? null;
  }

  async recordTrial(
    trial: Omit<Fact, 'id' | 'sessionAt' | 'implementerId' | 'setting'>,
    clientEventId?: string,
  ): Promise<Fact> {
    return actions.recordTrial(trial, clientEventId);
  }

  async retractTrial(sessionId: string, trialId: string, reason?: string): Promise<void> {
    return actions.retractTrial(sessionId, trialId, reason);
  }

  async pauseSession(sessionId: string, reason?: string): Promise<void> {
    actions.pauseSession(sessionId, reason);
    if (supabase) {
      await supabase.from('session_pauses').insert({ session_id: sessionId, reason });
      await supabase.from('sessions').update({ status: 'paused' }).eq('id', sessionId);
    }
  }

  async resumeSession(sessionId: string): Promise<void> {
    actions.resumeSession(sessionId);
    if (supabase) {
      await supabase.from('sessions').update({ status: 'active' }).eq('id', sessionId);
    }
  }

  async completeSession(sessionId: string, note: string): Promise<void> {
    actions.completeSession(sessionId, note);
  }

  async openChildSession(
    sessionId: string,
    adaptation: Adaptation,
    allowedApps: string[],
    minutes = 45,
  ): Promise<string | null> {
    return rpcOpenChildSession(sessionId, adaptation as unknown as Record<string, unknown>, allowedApps, minutes);
  }

  async resolveChildSession(token: string): Promise<Record<string, unknown> | null> {
    return rpcResolveChildSession(token);
  }

  async revokeChildSession(token: string): Promise<boolean> {
    return rpcRevokeChildSession(token);
  }

  async revisePlan(caseId: string, planId?: string): Promise<string | null> {
    if (planId) return rpcCreatePlanRevision(planId);
    return actions.revisePlan(caseId);
  }

  async approvePlan(caseId: string, draftPlanId?: string): Promise<boolean> {
    if (draftPlanId) return rpcApprovePlanRevision(draftPlanId);
    actions.approvePlanRevision(caseId);
    return true;
  }
}

/* ================================================================ Instância única */

let currentRepo: AprumoRepository | null = null;

export function getRepository(): AprumoRepository {
  if (!currentRepo) {
    currentRepo = isSupabaseConfigured ? new SupabaseRepository() : new DemoRepository();
  }
  return currentRepo;
}

/* ================================================================ Hooks TanStack Query */

export function useCasesQuery() {
  const repo = getRepository();
  return useQuery({
    queryKey: ['cases'],
    queryFn: () => repo.getCases(),
  });
}

export function useCaseQuery(id: string) {
  const repo = getRepository();
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => repo.getCase(id),
    enabled: !!id,
  });
}

export function useChildQuery(id: string) {
  const repo = getRepository();
  return useQuery({
    queryKey: ['children', id],
    queryFn: () => repo.getChild(id),
    enabled: !!id,
  });
}

export function useTargetsQuery(caseId: string) {
  const repo = getRepository();
  return useQuery({
    queryKey: ['targets', caseId],
    queryFn: () => repo.getTargets(caseId),
    enabled: !!caseId,
  });
}

export function useSessionsQuery(caseId: string) {
  const repo = getRepository();
  return useQuery({
    queryKey: ['sessions', caseId],
    queryFn: () => repo.getSessions(caseId),
    enabled: !!caseId,
  });
}

export function useAlertsQuery(caseId?: string) {
  const repo = getRepository();
  return useQuery({
    queryKey: ['alerts', caseId ?? 'all'],
    queryFn: () => repo.getAlerts(caseId),
  });
}

export function useSummariesQuery(caseId: string) {
  const repo = getRepository();
  return useQuery({
    queryKey: ['summaries', caseId],
    queryFn: () => repo.getSummaries(caseId),
    enabled: !!caseId,
  });
}
