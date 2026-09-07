import { supabase } from './supabase';

export interface Agent {
  id: string;
  agentId: string;
  name: string;
  phone: string;
}

interface AgentRow {
  id: string;
  agent_id: string;
  name: string;
  phone: string;
  total_deposits: number;
}

export const AGENT_SESSION_KEY = 'hkwallet_agent_session_v1';
export const REF_CODE_KEY = 'hkwallet_ref_code';
export const REFERRAL_BASE = 'https://hkwallet.site/?ref=';
export const COMMISSION_TIERS = {
  level1: 5,
  level2: 0.3,
  level3: 0.1,
} as const;

function mapAgent(r: AgentRow): Agent {
  return {
    id: r.id,
    agentId: r.agent_id,
    name: r.name,
    phone: r.phone,
  };
}

export function generateAgentCode(): string {
  return `AGT${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function listAgents(): Promise<Agent[]> {
  const { data } = await supabase
    .from('agents')
    .select('*')
    .order('agent_id', { ascending: false });
  return ((data ?? []) as AgentRow[]).map(mapAgent);
}

export async function createAgent(input: {
  name: string;
  phone: string;
}): Promise<{ ok: boolean; message: string; agent?: Agent }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAgentCode();
    const { data, error } = await supabase
      .from('agents')
      .insert({
        agent_id: code,
        name: input.name,
        phone: input.phone,
      })
      .select('*')
      .single();
    if (!error && data) return { ok: true, message: `Agent created with code ${code}`, agent: mapAgent(data as AgentRow) };
    if (error && !error.message.toLowerCase().includes('duplicate')) {
      return { ok: false, message: error.message };
    }
  }
  return { ok: false, message: 'Could not generate a unique agent code. Try again.' };
}

export async function deleteAgent(id: string): Promise<void> {
  await supabase.from('agents').delete().eq('id', id);
}

export async function agentLogin(agentCode: string, phone: string): Promise<Agent | null> {
  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('agent_id', agentCode.trim().toUpperCase())
    .eq('phone', phone.trim())
    .maybeSingle();
  return data ? mapAgent(data as AgentRow) : null;
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const { data } = await supabase.from('agents').select('*').eq('id', id).maybeSingle();
  return data ? mapAgent(data as AgentRow) : null;
}

export interface AgentStats {
  users: number;
  deposits: number;
  commission: number;
}

/** Aggregate registered users + successful deposit volume for one agent code. */
export async function getAgentStats(agentCode: string): Promise<AgentStats> {
  const { data: profiles } = await supabase.from('profiles').select('id').eq('agent_id', agentCode);
  const ids = ((profiles ?? []) as { id: string }[]).map((p) => p.id);
  if (ids.length === 0) return { users: 0, deposits: 0, commission: 0 };
  const { data: txs } = await supabase
    .from('transaction_records')
    .select('amount,status,user_id')
    .in('user_id', ids)
    .eq('status', 'Success');
  const deposits = ((txs ?? []) as { amount: number }[]).reduce((s, t) => s + Number(t.amount || 0), 0);
  return {
    users: ids.length,
    deposits: +deposits.toFixed(2),
    commission: +((deposits * COMMISSION_TIERS.level1) / 100).toFixed(2),
  };
}

export async function claimPreRegistration(phone: string, refCode: string): Promise<{ ok: boolean; message: string }> {
  const { error } = await supabase
    .from('pre_registrations')
    .upsert({ phone_number: phone, ref_code: refCode }, { onConflict: 'phone_number' });
  if (error) return { ok: false, message: error.message };
  try { localStorage.setItem(REF_CODE_KEY, refCode); } catch { /* ignore */ }
  return { ok: true, message: 'Bonus claimed! Your download is starting.' };
}

/** Referral code for a signup: pre-registration by phone first, then locally stored code. */
export async function lookupRefCode(phone: string): Promise<string | null> {
  if (phone.trim().length >= 10) {
    const { data } = await supabase
      .from('pre_registrations')
      .select('ref_code')
      .eq('phone_number', phone.trim())
      .maybeSingle();
    const code = (data as { ref_code: string } | null)?.ref_code;
    if (code) return code;
  }
  try { return localStorage.getItem(REF_CODE_KEY); } catch { return null; }
}
