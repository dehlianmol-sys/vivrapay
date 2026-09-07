import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AGENT_SESSION_KEY, COMMISSION_TIERS, REFERRAL_BASE, getAgentById, getAgentStats, type Agent, type AgentStats } from '../../lib/agents';
import { useToast } from '../../lib/toast';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<AgentStats>({ users: 0, deposits: 0, commission: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      let id: string | null = null;
      try { id = localStorage.getItem(AGENT_SESSION_KEY); } catch { id = null; }
      if (!id) { navigate('/agent/login', { replace: true }); return; }
      const a = await getAgentById(id);
      if (!a) { navigate('/agent/login', { replace: true }); return; }
      const s = await getAgentStats(a.agentId);
      if (!active) return;
      setAgent(a);
      setStats(s);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [navigate]);

  if (loading || !agent) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0b1e4f] text-white">Loading…</div>
    );
  }

  const link = `${REFERRAL_BASE}${agent.agentId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast('Link copied!', 'success');
    } catch {
      toast('Could not copy link', 'error');
    }
  };

  const logout = () => {
    try { localStorage.removeItem(AGENT_SESSION_KEY); } catch { /* ignore */ }
    navigate('/agent/login', { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-[#0b1e4f] text-white">
      <div className="max-w-[480px] mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold">Agent Dashboard</h1>
            <p className="text-[13px] text-white/60">{agent.name} · {agent.agentId}</p>
          </div>
          <button onClick={logout} className="text-[13px] text-rose-300 underline">Logout</button>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 mb-5">
          <div className="text-[12px] text-white/60 mb-1">Your referral link</div>
          <div className="text-[13px] break-all mb-3">{link}</div>
          <button onClick={copy} className="rounded-xl bg-gradient-to-r from-[#ff9800] to-[#f57c00] px-4 py-2 text-sm font-bold">
            Copy link
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Users" value={String(stats.users)} />
          <Stat label="Deposits" value={`₹${stats.deposits}`} />
          <Stat label="Commission" value={`₹${stats.commission}`} />
        </div>

        <p className="text-[12px] text-white/50 mt-4">
          Level 1: {COMMISSION_TIERS.level1}% · Level 2: {COMMISSION_TIERS.level2}% · Level 3: {COMMISSION_TIERS.level3}%
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-2xl p-4 text-center">
      <div className="text-lg font-extrabold">{value}</div>
      <div className="text-[11px] text-white/60 mt-1">{label}</div>
    </div>
  );
}
