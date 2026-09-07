import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AGENT_SESSION_KEY, agentLogin } from '../../lib/agents';
import { useToast } from '../../lib/toast';

export default function AgentLogin() {
  const toast = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const agent = await agentLogin(code, phone);
      if (!agent) {
        toast('No agent found with that code and number.', 'error');
        return;
      }
      try { localStorage.setItem(AGENT_SESSION_KEY, agent.id); } catch { /* ignore */ }
      navigate('/agent/dashboard');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#0b1e4f] to-[#124ec3] flex items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-[380px] bg-white rounded-3xl p-7 shadow-2xl">
        <h1 className="text-[22px] font-extrabold text-[#0b3499]">Agent Login</h1>
        <p className="text-[13px] text-slate-500 mt-1 mb-6">Sign in with your agent code and registered phone.</p>

        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Agent ID</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="AGT1001"
          className="w-full rounded-2xl bg-slate-100 px-4 py-3.5 mb-4 outline-none text-base uppercase"
          required
        />

        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Registered phone"
          className="w-full rounded-2xl bg-slate-100 px-4 py-3.5 mb-6 outline-none text-base"
          required
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-gradient-to-r from-[#124ec3] to-[#0b3499] text-white font-bold py-3.5 disabled:opacity-50"
        >
          {busy ? 'Checking...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
