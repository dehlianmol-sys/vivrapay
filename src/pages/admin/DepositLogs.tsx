import { useState } from 'react';
import { Check, X, Eye, Clock } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../../lib/toast';
import type { Deposit } from '../../lib/types';
import SmartImage from '../../components/SmartImage';

type Tab = 'Pending' | 'Success' | 'Rejected';

export default function DepositLogs() {
  const { deposits, approveDeposit, rejectDeposit } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('Pending');
  const [viewing, setViewing] = useState<Deposit | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const list = deposits.filter((d) => d.status === tab);

  const approve = async (d: Deposit) => {
    if (actioningId) return;
    setActioningId(d.id);
    try {
      await approveDeposit(d.id);
      toast(`Approved ₹${d.amount} for ${d.userName}`, 'success');
    } finally {
      setActioningId(null);
    }
  };
  const reject = async (d: Deposit) => {
    if (actioningId) return;
    setActioningId(d.id);
    try {
      await rejectDeposit(d.id);
      toast(`Rejected deposit ${d.id.slice(-6)}`, 'info');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">Deposit Logs Pipeline</h1>

      <div className="flex gap-2 mb-4">
        {(['Pending', 'Success', 'Rejected'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t} ({deposits.filter((d) => d.status === t).length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-slate-400 shadow-sm">
          No {tab.toLowerCase()} deposits.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.map((d) => (
            <div key={d.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>No: {d.id.slice(-10)}</span>
                <span>{new Date(d.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-sm text-slate-700 mb-1">
                <span className="font-medium">{d.userName}</span> · {d.userPhone}
              </div>
              <div className="text-lg font-semibold text-rose-600 mb-1">₹ {d.amount}</div>
              <div className="text-xs text-slate-500 mb-2">
                Reward ₹{d.reward} · IToken {d.itoken}
              </div>
              <div className="text-xs text-slate-600 mb-1">
                UTR: <span className="font-mono">{d.utr || '—'}</span>
              </div>
              <div className="text-xs text-slate-600 mb-3">
                Method: {d.paymentMethod?.name ?? '—'} ({d.paymentMethod?.upiId ?? '—'})
              </div>
              <div className="flex gap-2">
                {d.receiptBase64 && (
                  <button
                    onClick={() => setViewing(d)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    <Eye size={12} /> View Receipt
                  </button>
                )}
                {tab === 'Pending' && (
                  <>
                    <button
                      onClick={() => approve(d)}
                      disabled={actioningId === d.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {actioningId === d.id
                        ? <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        : <Check size={12} />}
                      Approve
                    </button>
                    <button
                      onClick={() => reject(d)}
                      disabled={actioningId === d.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50"
                    >
                      {actioningId === d.id
                        ? <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        : <X size={12} />}
                      Reject
                    </button>
                  </>
                )}
                {tab === 'Pending' && new Date(d.expiresAt).getTime() > Date.now() && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 ml-auto">
                    <Clock size={12} /> {Math.ceil((new Date(d.expiresAt).getTime() - Date.now()) / 60000)}m
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="font-semibold text-slate-800">Payment Receipt</h3>
              <button onClick={() => setViewing(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-4">
              <div className="text-sm text-slate-600 mb-3">
                <div><span className="font-medium">User:</span> {viewing.userName} ({viewing.userPhone})</div>
                <div><span className="font-medium">Amount:</span> ₹ {viewing.amount}</div>
                <div><span className="font-medium">UTR:</span> <span className="font-mono">{viewing.utr}</span></div>
                <div><span className="font-medium">Method:</span> {viewing.paymentMethod?.name}</div>
              </div>
              {viewing.receiptBase64 ? (
                <SmartImage
                  path={viewing.receiptBase64}
                  alt="Receipt"
                  className="w-full rounded-lg overflow-hidden"
                  imgClassName="w-full object-contain"
                />
              ) : (
                <p className="text-slate-400 text-center py-8">No receipt uploaded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
