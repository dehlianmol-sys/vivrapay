import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToast } from '../lib/toast';
import { getPublicUrl } from '../lib/storage';

type ModalKind = 'itoken' | 'profit' | 'event';
type SubPage = 'sell-history' | 'buy-history' | 'newbie';

const AVATARS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `Profilelogo${n}.png`);

/** Stable 4-digit display ID derived from the UUID (the real UUID stays untouched). */
export function shortId(uuid: string): string {
  let h = 0;
  for (let i = 0; i < uuid.length; i += 1) h = (h * 31 + uuid.charCodeAt(i)) >>> 0;
  return String(h % 10000).padStart(4, '0');
}

function pickAvatar(uuid: string): string {
  // Shuffle the list, then take a slot keyed off the user so it stays consistent per session.
  const shuffled = [...AVATARS];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let h = 0;
  for (let i = 0; i < uuid.length; i += 1) h = (h * 17 + uuid.charCodeAt(i)) >>> 0;
  return shuffled[h % shuffled.length];
}

export default function Mine() {
  const { currentUser, logout, appSettings } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state ?? {}) as { modal?: ModalKind; subPage?: SubPage };
  const [modal, setModal] = useState<null | ModalKind>(navState.modal ?? null);
  const [subPage, setSubPage] = useState<null | SubPage>(navState.subPage ?? null);

  const wallet = currentUser?.wallet ?? 0;
  const userId = currentUser ? shortId(currentUser.id) : '—';
  const rewardPct = appSettings?.rewardPercentage ?? 4;
  const avatarFile = useMemo(() => (currentUser ? pickAvatar(currentUser.id) : AVATARS[0]), [currentUser?.id]);
  const [avatarBroken, setAvatarBroken] = useState(false);

  const doLogout = () => {
    logout();
    toast('Logged out', 'info');
    navigate('/login');
  };

  const goSellHistory = () => setSubPage('sell-history');
  const goBuyHistory = () => setSubPage('buy-history');

  if (subPage === 'sell-history') {
    return <HistoryPage title="Sell history" tabs={['Paying', 'Success', 'All']} emptyText="There are no sales orders at the moment. If you have enabled consignment, please check the authorization of the key partner and whether the kyc partner can receive payment normally or contact customer service in time" btnText="Check Sell state" onBack={() => setSubPage(null)} />;
  }
  if (subPage === 'buy-history') {
    return <BuyHistoryPage onBack={() => setSubPage(null)} onBuy={() => { setSubPage(null); navigate('/deposit'); }} onOpenOrder={() => navigate('/payment')} />;
  }
  if (subPage === 'newbie') {
    return <NewbiePage onBack={() => setSubPage(null)} />;
  }

  const copyId = () => {
    navigator.clipboard.writeText(userId).then(() => toast('ID copied!', 'success'));
  };

  return (
    <div>
      <div className="vp-header" style={{ justifyContent: 'center' }}>
        <span className="vp-header-title">Mine</span>
      </div>

      <div className="vp-profile-header">
        <div className="vp-avatar" style={{ background: 'linear-gradient(135deg,#62007a,#b23fd4)' }}>
          {avatarBroken ? (
            <span className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
              {userId.slice(0, 2)}
            </span>
          ) : (
            <img
              src={getPublicUrl(avatarFile)}
              alt="Profile avatar"
              onError={() => setAvatarBroken(true)}
            />
          )}
        </div>
        <div className="vp-profile-id">
          ID: {userId}
          <i className="fa-regular fa-copy" onClick={copyId} role="button" aria-label="Copy ID" />
          <div style={{ fontSize: 12, color: 'var(--vp-muted)', fontWeight: 400, marginTop: 4 }}>
            Reward: {rewardPct}%
          </div>
        </div>
      </div>

      <div className="vp-dark-summary">
        <div className="vp-summary-item">
          <span className="val">₹{wallet.toFixed(2)}</span>
          <span className="label">Total Amount</span>
        </div>
        <div className="vp-summary-item">
          <span className="val">₹0.00</span>
          <span className="label">Today's Earning</span>
        </div>
        <div className="vp-summary-item">
          <span className="val">₹0.00</span>
          <span className="label">Sell Amount</span>
        </div>
      </div>

      <div className="vp-menu-list">
        <MenuItem icon="fa-solid fa-coins" label="IToken" right={`₹${wallet.toFixed(0)}`} onClick={() => setModal('itoken')} />
        <MenuItem icon="fa-solid fa-chart-line" label="Today Profit" right="0" onClick={() => setModal('profit')} />
        <MenuItem icon="fa-solid fa-calendar-check" label="Buy History" onClick={goBuyHistory} />
        <MenuItem icon="fa-solid fa-sack-dollar" label="UPI Sell History" onClick={goSellHistory} />
        <MenuItem icon="fa-solid fa-clipboard-list" label="Transfer IToken History" />
        <MenuItem icon="fa-solid fa-gift" label="Event Center" onClick={() => setModal('event')} />
        <MenuItem icon="fa-solid fa-list-check" label="Activity Records" />
        <MenuItem icon="fa-solid fa-circle-play" label="Tutorial" />
        <MenuItem icon="fa-solid fa-headset" label="Official Service" onClick={() => navigate('/customer-service')} />
        <MenuItem icon="fa-solid fa-lock" label="Modify Password" />
        <MenuItem icon="fa-solid fa-arrow-right-from-bracket" label="Logout" onClick={doLogout} />
        <MenuItem icon="fa-solid fa-v" label="Version" right="1.2.0" />
      </div>

      <div style={{ textAlign: 'center', padding: '0 20px 20px', fontSize: 11, color: '#999' }}>
        Haven't downloaded the APK?{' '}
        <a href="#" style={{ color: '#62007a' }} onClick={(e) => e.preventDefault()}>
          Click here and Download now
        </a>
      </div>

      {modal && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white w-[75%] max-w-xs rounded-lg overflow-hidden flex flex-col relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {modal === 'event' && (
              <button
                onClick={() => setModal(null)}
                className="absolute right-4 top-4 text-gray-400"
              >
                <X size={14} />
              </button>
            )}
            <div className="pt-5 pb-4 text-center text-[17px] text-gray-700">
              {modal === 'itoken' ? 'IToken Detail' : modal === 'profit' ? 'Today Profit Detail' : 'Event List'}
            </div>
            {modal === 'itoken' && (
              <div className="px-5 pb-5 flex flex-col gap-3 items-center">
                <span className="text-[#eebb4d] text-sm">Available: ₹{wallet.toFixed(0)}</span>
                <span className="text-[#eebb4d] text-sm">In Sell: 0.00</span>
              </div>
            )}
            {modal === 'profit' && (
              <div className="px-5 pb-5 flex flex-col gap-3 items-center">
                <span className="text-[#eebb4d] text-sm">Trade Profit (INR): 0.00</span>
                <span className="text-[#eebb4d] text-sm">Team Profit: 0.00</span>
                <span className="text-[#eebb4d] text-sm">Event Reward: 0.00</span>
              </div>
            )}
            {modal === 'event' && (
              <div className="px-5 pb-5 flex flex-col gap-3 w-full">
                <button
                  onClick={() => { setModal(null); setSubPage('newbie'); }}
                  className="w-full py-3 border border-gray-200 rounded-md bg-white text-gray-600 text-sm text-center"
                >
                  Newbie Reward
                </button>
                <button className="w-full py-3 border border-gray-200 rounded-md bg-white text-gray-600 text-sm text-center">
                  Today Lottery Reward
                </button>
                <button className="w-full py-3 border border-gray-200 rounded-md bg-white text-gray-600 text-sm text-center">
                  Buy Inr Times Reward
                </button>
                <button className="w-full py-3 border border-gray-200 rounded-md bg-white text-gray-600 text-sm text-center">
                  Buy Inr Amount Reward
                </button>
              </div>
            )}
            <div className="border-t border-gray-200 flex">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-4 text-center text-[#7b1fa2] text-base bg-transparent border-none cursor-pointer"
              >
                {modal === 'event' ? 'cancel' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  right,
  onClick,
}: {
  icon: string;
  label: string;
  right?: string;
  onClick?: () => void;
}) {
  return (
    <div className="vp-menu-item" onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className="vp-menu-left">
        <i className={icon} /> {label}
      </div>
      <div className="vp-menu-right">
        {right}
        <i className="fa-solid fa-chevron-right" />
      </div>
    </div>
  );
}


function HistoryPage({
  title,
  tabs,
  emptyText,
  btnText,
  onBack,
  onAction,
}: {
  title: string;
  tabs: string[];
  emptyText: string;
  btnText: string;
  onBack: () => void;
  onAction?: () => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-center items-center py-4 bg-white relative text-base font-medium text-gray-700">
        <button onClick={onBack} className="absolute left-4 text-gray-500">
          <ChevronRight size={22} className="rotate-180" />
        </button>
        {title}
      </div>
      <div className="flex justify-around border-b border-gray-200 bg-white">
        {tabs.map((t, i) => (
          <div
            key={t}
            onClick={() => setActiveTab(i)}
            className={`py-4 text-sm cursor-pointer relative flex-1 text-center ${
              activeTab === i ? 'text-[#7b1fa2]' : 'text-gray-400'
            }`}
          >
            {t}
            {activeTab === i && (
              <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#7b1fa2]" />
            )}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center pt-16 px-8 text-center">
        <svg viewBox="0 0 100 80" width="120" height="100" fill="none" className="mb-6">
          <rect x="10" y="30" width="80" height="40" fill="#f3e5f5" />
          <path d="M10 30l20 10l20-20l20 10l20-20" stroke="#7b1fa2" strokeWidth="5" />
          <path d="M10 15l20 10l20-20l20 10l20-20" stroke="#ce93d8" strokeWidth="5" />
          <rect x="10" y="30" width="80" height="40" stroke="#7b1fa2" strokeWidth="4" />
        </svg>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">{emptyText}</p>
        <button
          onClick={onAction ?? onBack}
          className="w-full max-w-xs bg-[#62007a] text-white py-3 rounded-full border-none text-base font-medium cursor-pointer"
        >
          {btnText}
        </button>
      </div>
    </div>
  );
}

function NewbiePage({ onBack }: { onBack: () => void }) {
  const { currentUser, appSettings, deposits } = useStore();

  const hasLinkedUpi = (currentUser?.upis ?? []).length > 0;
  const newbieMin = appSettings?.newbieRequiredOrderAmount ?? 300;
  const newbieReward = appSettings?.newbieRewardAmount ?? 60;

  const bought = deposits
    .filter((d) => d.userId === currentUser?.id && d.status === 'Success')
    .reduce((s, d) => s + Number(d.amount || 0), 0);
  const remaining = Math.max(0, newbieMin - bought);
  const pct = newbieMin > 0 ? Math.min(100, (bought / newbieMin) * 100) : 0;
  const hasPurchasedRequired = remaining === 0 || (currentUser?.has_deposited_300 ?? false);

  const tasks = [
    { label: 'Subscribe to Official Channel', done: true, icon: 'channel' },
    { label: 'Join VIP Group', done: true, icon: 'channel' },
    { label: 'Watch Beginner Tutorial', done: true, icon: 'video' },
    { label: 'Link Mobikwik', done: hasLinkedUpi, icon: 'mobikwik' },
    { label: `Purchase ${newbieMin} Tokens`, done: hasPurchasedRequired, icon: 'coin' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-center items-center py-4 bg-white relative text-base font-medium text-gray-700">
        <button onClick={onBack} className="absolute left-4 text-gray-700">
          <ChevronRight size={22} className="rotate-180" />
        </button>
        Newbie Rewards
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="m-4 rounded-2xl border border-[#ede7f6] bg-white p-5 shadow-[0_6px_24px_rgba(98,0,122,0.08)]">
          <p className="text-[13px] text-gray-500">Total bonus</p>
          <div className="vp-shimmer text-3xl font-extrabold leading-tight">₹{newbieReward}</div>

          <div className="mt-4 vp-progress">
            <span style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px] text-gray-500">
            <span>{pct.toFixed(0)}% completed</span>
            <span>Target ₹{newbieMin}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#faf5fc] px-3 py-2.5">
              <div className="text-[11px] text-gray-500">Amount Bought</div>
              <div className="text-[15px] font-bold text-[#62007a]">₹{bought.toFixed(2)}</div>
            </div>
            <div className="rounded-xl bg-[#faf5fc] px-3 py-2.5">
              <div className="text-[11px] text-gray-500">Amount Remaining</div>
              <div className="text-[15px] font-bold text-[#62007a]">₹{remaining.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="px-4">
          {tasks.map((t) => (
            <div key={t.label} className="flex justify-between items-center py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-6 h-6 flex items-center justify-center">
                  {t.icon === 'channel' && (
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      <circle cx="12" cy="12" r="12" fill="#7b1fa2" />
                      <path d="M6 12l4 2 8-7-6 8v3l3-3 4 3 2-11z" fill="#fff" />
                    </svg>
                  )}
                  {t.icon === 'video' && (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#f3e5f5">
                      <rect x="2" y="5" width="20" height="14" rx="4" />
                      <path d="M10 9l5 3-5 3z" fill="#7b1fa2" />
                    </svg>
                  )}
                  {t.icon === 'mobikwik' && (
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      <polygon points="12,2 22,12 12,22 2,12" fill="#16a34a" />
                      <polygon points="4,12 12,4 12,20" fill="#ea580c" />
                    </svg>
                  )}
                  {t.icon === 'coin' && (
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      <circle cx="12" cy="12" r="11" fill="#facc15" />
                      <text x="12" y="16" fontSize="12" textAnchor="middle" fill="#fff" fontWeight="bold">₹</text>
                    </svg>
                  )}
                </div>
                {t.label}
              </div>
              <button
                className={`text-white border-none px-4 py-1.5 rounded-full text-[13px] transition-colors ${
                  t.done ? 'bg-[#4cd964]' : 'bg-gray-300'
                }`}
              >
                {t.done ? 'Done' : 'Undone'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function useTick(active: boolean) {
  const [, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setN((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
}

function countdown(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return 'Expired';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function BuyHistoryPage({
  onBack,
  onBuy,
  onOpenOrder,
}: {
  onBack: () => void;
  onBuy: () => void;
  onOpenOrder: () => void;
}) {
  const { deposits, currentUser, cancelDeposit } = useStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  const mine = deposits.filter((d) => d.userId === currentUser?.id);
  const pending = mine.filter((d) => d.status === 'Pending');
  useTick(pending.length > 0);

  const tabs = ['INR', 'INR(Cancel)', 'USDT'];
  const rows =
    activeTab === 0
      ? mine.filter((d) => d.status !== 'Rejected')
      : activeTab === 1
        ? mine.filter((d) => d.status === 'Rejected')
        : [];

  const doCancel = async (id: string) => {
    if (busy) return;
    setBusy(id);
    try {
      await cancelDeposit(id);
      toast('Order cancelled', 'info');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-center items-center py-4 bg-white relative text-base font-medium text-gray-700">
        <button onClick={onBack} className="absolute left-4 text-gray-500">
          <ChevronRight size={22} className="rotate-180" />
        </button>
        Buy History
      </div>

      {pending.length > 0 && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border-y border-amber-200 px-4 py-2.5 text-[13px] text-amber-800">
          <span className="min-w-0">Your order is pending.</span>
          <button
            onClick={onOpenOrder}
            className="shrink-0 rounded-full bg-amber-500 px-3 py-1 text-[12px] font-semibold text-white"
          >
            Pay now
          </button>
        </div>
      )}

      <div className="flex justify-around border-b border-gray-200 bg-white">
        {tabs.map((t, i) => (
          <div
            key={t}
            onClick={() => setActiveTab(i)}
            className={`py-4 text-sm cursor-pointer relative flex-1 text-center ${
              activeTab === i ? 'text-[#7b1fa2]' : 'text-gray-400'
            }`}
          >
            {t}
            {activeTab === i && (
              <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#7b1fa2]" />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center pt-16 px-8 text-center">
            <svg viewBox="0 0 100 80" width="120" height="100" fill="none" className="mb-6">
              <rect x="10" y="30" width="80" height="40" fill="#f3e5f5" />
              <path d="M10 30l20 10l20-20l20 10l20-20" stroke="#7b1fa2" strokeWidth="5" />
              <path d="M10 15l20 10l20-20l20 10l20-20" stroke="#ce93d8" strokeWidth="5" />
              <rect x="10" y="30" width="80" height="40" stroke="#7b1fa2" strokeWidth="4" />
            </svg>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              Itoken has not been buy in this way
            </p>
            <button
              onClick={onBuy}
              className="w-full max-w-xs bg-[#62007a] text-white py-3 rounded-full border-none text-base font-medium cursor-pointer"
            >
              To buy
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 flex flex-col gap-3">
            {rows.map((d) => (
              <div key={d.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold text-gray-800">IToken</div>
                    <div className="text-[12px] text-gray-500">Reward: {Number(d.reward || 0).toFixed(2)}</div>
                    <div className="text-[12px] text-gray-500 break-all">OrderNo: {d.id}</div>
                    <div className="text-[12px] text-gray-400">
                      {new Date(d.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[15px] font-bold text-gray-800">₹ {Number(d.amount).toFixed(2)}</div>
                    <div
                      className={`mt-1 inline-flex items-center gap-1.5 text-[12px] ${
                        d.status === 'Success'
                          ? 'text-emerald-600'
                          : d.status === 'Pending'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {d.status}
                    </div>
                  </div>
                </div>

                {d.status === 'Pending' && (
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    <span className="text-[13px] text-gray-600">
                      Time left: <strong className="font-mono">{countdown(d.expiresAt)}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => doCancel(d.id)}
                        disabled={busy === d.id}
                        className="rounded-full border border-gray-200 px-3.5 py-1.5 text-[12px] text-gray-600 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={onOpenOrder}
                        className="rounded-full bg-[#62007a] px-3.5 py-1.5 text-[12px] font-semibold text-white"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
