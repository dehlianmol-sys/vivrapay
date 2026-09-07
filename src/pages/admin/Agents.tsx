import { useCallback, useEffect, useState } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { COMMISSION_TIERS, REFERRAL_BASE, createAgent, deleteAgent, getAgentStats, listAgents, type Agent, type AgentStats } from '../../lib/agents';
import { useToast } from '../../lib/toast';

export default function Agents() {
  const toast = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Record<string, AgentStats>>({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const list = await listAgents();
    setAgents(list);
    const entries = await Promise.all(
      list.map(async (a) => [a.agentId, await getAgentStats(a.agentId)] as const),
    );
    setStats(Object.fromEntries(entries));
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!name.trim() || phone.trim().length < 10) {
      toast('Enter a valid name and phone number', 'error');
      return;
    }
    setBusy(true);
    try {
      const res = await createAgent({ name: name.trim(), phone: phone.trim() });
      toast(res.message, res.ok ? 'success' : 'error');
      if (res.ok) {
        setName('');
        setPhone('');
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (a: Agent) => {
    await deleteAgent(a.id);
    toast(`Agent ${a.agentId} removed`, 'info');
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Agent Management</h1>

      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Agent name" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="10-digit phone" />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white text-sm font-semibold py-2 disabled:opacity-50">
            <UserPlus size={16} /> {busy ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Agent</th>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Referral link</th>
              <th className="text-right px-4 py-3">Rate</th>
              <th className="text-right px-4 py-3">Users</th>
              <th className="text-right px-4 py-3">Deposits</th>
              <th className="text-right px-4 py-3">Commission</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No agents yet.</td></tr>
            )}
            {agents.map((a) => {
              const s = stats[a.agentId] ?? { users: 0, deposits: 0, commission: 0 };
              return (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{a.name}</div>
                    <div className="text-xs text-slate-400">{a.phone}</div>
                  </td>
                  <td className="px-4 py-3 font-mono">{a.agentId}</td>
                  <td className="px-4 py-3 text-xs text-blue-600 break-all">{REFERRAL_BASE}{a.agentId}</td>
                   <td className="px-4 py-3 text-right">{COMMISSION_TIERS.level1}%</td>
                  <td className="px-4 py-3 text-right">{s.users}</td>
                  <td className="px-4 py-3 text-right">₹{s.deposits}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">₹{s.commission}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(a)} className="text-rose-500 hover:text-rose-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
