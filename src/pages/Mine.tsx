import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToast } from '../lib/toast';

export default function Mine() {
  const { currentUser, logout, appSettings } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [modal, setModal] = useState<null | 'itoken' | 'profit' | 'event'>(null);
  const [subPage, setSubPage] = useState<null | 'sell-history' | 'buy-history' | 'newbie'>(null);

  const wallet = currentUser?.wallet ?? 0;
  const userId = currentUser?.id.slice(-10) ?? '—';
  const rewardPct = appSettings?.rewardPercentage ?? 4;

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
    return <HistoryPage title="Buy History" tabs={['INR', 'INR(Cancel)', 'USDT']} emptyText="Itoken has not been buy in this way" btnText="To buy" onBack={() => setSubPage(null)} onAction={() => { setSubPage(null); navigate('/deposit'); }} />;
  }
  if (subPage === 'newbie') {
    return <NewbiePage onBack={() => setSubPage(null)} />;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-center items-center py-4 bg-white relative text-base font-medium text-gray-700">
        Mine
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-4 bg-white">
        <div className="px-5 py-4 mt-2.5 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden bg-[#f8f9fa]">
              <svg viewBox="0 0 64 64" width="48" height="48">
                <circle cx="32" cy="32" r="32" fill="#f0f4f8" />
                <path d="M18 64c0-12 8-20 14-20h0c6 0 14 8 14 20" fill="#d1d5db" />
                <circle cx="32" cy="24" r="10" fill="#ffcda8" />
                <path d="M22 20c0-6 4-10 10-10s10 4 10 10-2 8-10 8-10-2-10-8z" fill="#2d3748" />
                <path d="M30 44l2 12 2-12z" fill="#60a5fa" />
              </svg>
            </div>
            <span className="text-sm ml-3 text-gray-400">Reward:{rewardPct}%</span>
          </div>
          <div className="text-sm text-gray-400 flex items-center">
            ID:{userId}
            <ChevronRight size={14} className="text-gray-300 ml-1" />
          </div>
        </div>

        <ul className="list-none px-5 mt-2.5">
          <MenuItem
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22">
                <circle cx="12" cy="12" r="11" fill="#fff" stroke="#e0e0e0" />
                <path d="M1 12a11 11 0 0 1 22 0z" fill="#ff9933" />
                <path d="M1 12a11 11 0 0 0 22 0z" fill="#138808" />
                <rect x="0" y="8.5" width="24" height="7" fill="#fff" />
                <circle cx="12" cy="12" r="2.5" stroke="#000080" strokeWidth="0.5" fill="none" />
              </svg>
            }
            label="IToken"
            right={<span className="text-[#eebb4d]">₹{wallet.toFixed(0)}</span>}
            onClick={() => setModal('itoken')}
          />
          <MenuItem
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22">
                <rect x="4" y="10" width="16" height="11" rx="1" fill="#facc15" />
                <rect x="3" y="6" width="18" height="4" rx="1" fill="#facc15" />
                <path d="M12 6v15" stroke="#ef4444" strokeWidth="2" />
                <path d="M12 6 C12 2 6 2 6 6" fill="none" stroke="#ef4444" strokeWidth="2" />
                <path d="M12 6 C12 2 18 2 18 6" fill="none" stroke="#ef4444" strokeWidth="2" />
              </svg>
            }
            label="Today Profit"
            right={<span className="text-[#eebb4d]">0</span>}
            onClick={() => setModal('profit')}
          />
          <MenuItem
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0f2fe">
                <rect x="2" y="6" width="20" height="14" rx="2" stroke="#3b82f6" strokeWidth="1.5" />
                <path d="M6 10h6 M6 14h3 M15 13l3 0 M17 11l2 2-2 2" stroke="#3b82f6" strokeWidth="1.5" />
              </svg>
            }
            label="UPI Sell History"
            onClick={goSellHistory}
          />
          <MenuItem
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#60a5fa" strokeWidth="1.5">
                <rect x="6" y="4" width="12" height="18" rx="2" />
                <path d="M9 2h6v4H9z M9 10h6 M9 14h6 M9 18h4" />
              </svg>
            }
            label="Buy History"
            onClick={goBuyHistory}
          />
          <MenuItem
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#60a5fa" strokeWidth="1.5">
                <rect x="6" y="4" width="12" height="18" rx="2" />
                <path d="M9 2h6v4H9z M9 10h6 M9 14h6 M9 18h4" />
              </svg>
            }
            label="Transfer IToken History"
          />
          <MenuItem
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fbc02d" strokeWidth="1.5">
                <rect x="3" y="6" width="18" height="12" rx="2" />
                <circle cx="3" cy="12" r="2" fill="#fff" stroke="#fbc02d" />
                <circle cx="21" cy="12" r="2" fill="#fff" stroke="#fbc02d" />
                <path d="M9 12h6" strokeDasharray="2 2" />
              </svg>
            }
            label="Event Center"
            onClick={() => setModal('event')}
          />
          <MenuItem
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0f2fe">
                <rect x="2" y="6" width="20" height="14" rx="2" stroke="#60a5fa" strokeWidth="1.5" />
                <path d="M6 10h6 M6 14h3 M15 13l3 0 M17 11l2 2-2 2" stroke="#60a5fa" strokeWidth="1.5" />
              </svg>
            }
            label="Activity Records"
          />
          <MenuItem
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#1e293b">
                <path d="M7 5l12 7-12 7z" />
              </svg>
            }
            label="Tutorial"
          />
          <MenuItem
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6366f1" strokeWidth="1.5">
                <path d="M3 15v-3a9 9 0 0 1 18 0v3m-18 0a2 2 0 0 0 2 2h1v-6H3m18 4a2 2 0 0 1-2 2h-1v-6h3m-9-3v3" />
              </svg>
            }
            label="Official Service"
            onClick={() => navigate('/customer-service')}
          />
          <MenuItem
            icon={
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#60a5fa" strokeWidth="1.5">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            }
            label="Modify Password"
          />
        </ul>

        <div className="px-5 pt-7 pb-2.5">
          <button
            onClick={doLogout}
            className="w-full py-3.5 border border-gray-200 rounded-lg bg-white text-base text-gray-600 text-center cursor-pointer hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
        <div className="text-center px-5 pb-8 text-[11px] text-gray-400 leading-relaxed">
          APP Version : 1.2.0
          <br />
          Haven't downloaded the APK?{' '}
          <a href="#" className="text-[#3b82f6] no-underline" onClick={(e) => e.preventDefault()}>
            Click here and Download now
          </a>
        </div>
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
                className="flex-1 py-4 text-center text-[#3b82f6] text-base bg-transparent border-none cursor-pointer"
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
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <li
      onClick={onClick}
      className={`flex justify-between items-center py-4 border-b border-gray-100 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
    >
      <div className="flex items-center gap-3 text-[15px] text-gray-700">
        <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
        {label}
      </div>
      <div className="flex items-center gap-2 text-gray-300 text-sm">
        {right}
        <ChevronRight size={16} className="text-gray-300" />
      </div>
    </li>
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
              activeTab === i ? 'text-[#3b82f6]' : 'text-gray-400'
            }`}
          >
            {t}
            {activeTab === i && (
              <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#3b82f6]" />
            )}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center pt-16 px-8 text-center">
        <svg viewBox="0 0 100 80" width="120" height="100" fill="none" className="mb-6">
          <rect x="10" y="30" width="80" height="40" fill="#dbeafe" />
          <path d="M10 30l20 10l20-20l20 10l20-20" stroke="#3b82f6" strokeWidth="5" />
          <path d="M10 15l20 10l20-20l20 10l20-20" stroke="#93c5fd" strokeWidth="5" />
          <rect x="10" y="30" width="80" height="40" stroke="#3b82f6" strokeWidth="4" />
        </svg>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">{emptyText}</p>
        <button
          onClick={onAction ?? onBack}
          className="w-full max-w-xs bg-[#1a73e8] text-white py-3 rounded-full border-none text-base font-medium cursor-pointer"
        >
          {btnText}
        </button>
      </div>
    </div>
  );
}

function NewbiePage({ onBack }: { onBack: () => void }) {
  const { currentUser, appSettings } = useStore();

  const hasLinkedUpi = (currentUser?.upis ?? []).length > 0;
  const newbieMin = appSettings?.newbieRequiredOrderAmount ?? 300;
  const newbieReward = appSettings?.newbieRewardAmount ?? 60;
  const hasPurchasedRequired = currentUser?.has_deposited_300 ?? false;

  const tasks = [
    { label: 'Subscribe to Official Channel', done: true, icon: 'channel' },
    { label: 'Join VIP Group', done: true, icon: 'channel' },
    { label: 'Watch Beginner Tutorial', done: true, icon: 'video' },
    { label: 'Link Mobikwik', done: hasLinkedUpi, icon: 'mobikwik' },
    { label: `Purchase ${newbieMin} Tokens`, done: hasPurchasedRequired, icon: 'coin' },
  ];

  const rewardUnlocked = hasPurchasedRequired;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-center items-center py-4 bg-white relative text-base font-medium text-gray-700">
        <button onClick={onBack} className="absolute left-4 text-gray-700">
          <ChevronRight size={22} className="rotate-180" />
        </button>
        Newbie Rewards
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="bg-[#2b8bfb] text-white m-4 rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="text-[13px] opacity-90 mb-1.5">Total bonus</p>
            <div className="text-2xl font-semibold flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <circle cx="12" cy="12" r="11" fill="#facc15" />
                <text x="12" y="16" fontSize="12" textAnchor="middle" fill="#fff" fontWeight="bold">₹</text>
              </svg>
              {newbieReward}
            </div>
          </div>
          <button
            className={`border-none px-4 py-2 rounded-md text-[13px] text-white transition-colors ${
              rewardUnlocked ? 'bg-[#4cd964]' : 'bg-gray-600'
            }`}
          >
            {rewardUnlocked ? 'Unlocked' : 'Locked'}
          </button>
        </div>
        <div className="px-4">
          {tasks.map((t) => (
            <div key={t.label} className="flex justify-between items-center py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-6 h-6 flex items-center justify-center">
                  {t.icon === 'channel' && (
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      <circle cx="12" cy="12" r="12" fill="#3b82f6" />
                      <path d="M6 12l4 2 8-7-6 8v3l3-3 4 3 2-11z" fill="#fff" />
                    </svg>
                  )}
                  {t.icon === 'video' && (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#e0f2fe">
                      <rect x="2" y="5" width="20" height="14" rx="4" />
                      <path d="M10 9l5 3-5 3z" fill="#3b82f6" />
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
