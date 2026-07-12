import { useEffect, useMemo, useState } from 'react';
import { Search, X, ShieldCheck, Wallet, Phone, Plus, Minus } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import type { User } from '../../lib/types';

export default function UserLedger() {
  const { users: allUsers, adjustUserBalance } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjusting, setAdjusting] = useState<null | 'inc' | 'dec'>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(t);
  }, [query]);

  const users = useMemo(() => {
    const list = allUsers.filter((u) => u.role === 'user');
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        u.phone.includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.upis.some((x) => x.upiId.toLowerCase().includes(q)),
    );
  }, [allUsers, debouncedQuery]);

  const doAdjust = async (delta: number) => {
    if (adjusting) return;
    if (!selected) return;
    const amt = Number(adjustAmount);
    if (!amt || amt <= 0) {
      toast('Enter a valid amount', 'error');
      return;
    }
    setAdjusting(delta > 0 ? 'inc' : 'dec');
    try {
      await adjustUserBalance(selected.id, delta * amt);
      toast(`${delta > 0 ? 'Increased' : 'Decreased'} balance by ₹${amt}`, 'success');
      setAdjustAmount('');
      setSelected(null);
    } finally {
      setAdjusting(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">User Accounts Ledger</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2">
          <Search size={18} className="text-slate-400 mr-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by phone number, name, or UPI ID"
            className="bg-transparent outline-none w-full text-sm text-slate-700"
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Wallet</th>
              <th className="px-4 py-3 font-medium">Deposited ₹300</th>
              <th className="px-4 py-3 font-medium">UPIs</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.phone}</td>
                  <td className="px-4 py-3 text-slate-700">₹ {u.wallet.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {u.has_deposited_300 ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <ShieldCheck size={14} /> Yes
                      </span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.upis.length}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelected(u);
                        setAdjustAmount('');
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-slate-800">User Details</h3>
              <button onClick={() => setSelected(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Phone size={14} className="text-slate-400" /> {selected.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Wallet size={14} className="text-slate-400" /> ₹ {selected.wallet.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck size={14} className="text-slate-400" />
                Deposit ₹300 flag: {selected.has_deposited_300 ? 'Verified' : 'Pending'}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <h4 className="font-medium text-slate-700 mb-2">Adjust Balance</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => doAdjust(1)}
                  disabled={adjusting !== null}
                  className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {adjusting === 'inc' && <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                  <Plus size={16} /> Increase
                </button>
                <button
                  onClick={() => doAdjust(-1)}
                  disabled={adjusting !== null}
                  className="flex items-center gap-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 disabled:opacity-50"
                >
                  {adjusting === 'dec' && <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                  <Minus size={16} /> Decrease
                </button>
              </div>
            </div>

            <h4 className="font-medium text-slate-700 mt-5 mb-2">Linked UPIs ({selected.upis.length})</h4>
            {selected.upis.length === 0 ? (
              <p className="text-sm text-slate-400">No UPI accounts linked.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selected.upis.map((u) => (
                  <div key={u.id} className="border border-slate-200 rounded-lg p-3 text-sm">
                    <div className="font-medium text-slate-700">{u.partnerName}</div>
                    <div className="text-slate-500">{u.upiId}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {u.tabType} tab · {u.isSelling ? 'Selling' : 'Stopped'} · {u.maskedPhone}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
