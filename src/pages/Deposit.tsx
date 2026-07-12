import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToast } from '../lib/toast';

const PACKAGES = [
  300, 500, 1000, 2000, 3000, 5000, 7500, 10000, 100, 200, 750, 1500, 2500, 4000, 6000, 8000,
];

export default function Deposit() {
  const { createDepositIntent, currentUser, appSettings } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [buyingAmount, setBuyingAmount] = useState<number | null>(null);

  const minOrder = appSettings?.minOrderSize ?? 300;
  const maxOrder = appSettings?.maxOrderSize ?? 50000;
  const rewardPct = appSettings?.rewardPercentage ?? 4;

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return PACKAGES.filter((p) => p >= minOrder && p <= maxOrder);
    const n = Number(q);
    if (!isNaN(n)) return PACKAGES.filter((p) => p >= n - 50 && p <= n + 50 && p >= minOrder && p <= maxOrder);
    return PACKAGES.filter((p) => String(p).includes(q) && p >= minOrder && p <= maxOrder);
  }, [query, minOrder, maxOrder]);

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      toast('Use a package Buy button to start an order', 'info');
    }
  };

  const buy = async (amount: number) => {
    if (buyingAmount !== null) return;
    setBuyingAmount(amount);
    try {
      if (amount < minOrder) {
        toast(`Minimum order size is ₹${minOrder}`, 'error');
        return;
      }
      if (amount > maxOrder) {
        toast(`Maximum order size is ₹${maxOrder}`, 'error');
        return;
      }
      if (currentUser?.lockedDepositId) {
        toast('You have an active order. Complete or cancel it first.', 'error');
        navigate('/payment');
        return;
      }
      const res = await createDepositIntent(amount);
      if (!res.ok) {
        toast(res.message, 'error');
        return;
      }
      toast('Order created — pay within 30 minutes', 'success');
      navigate('/payment');
    } finally {
      setBuyingAmount(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="text-center py-4 text-lg font-medium text-gray-700 border-b border-gray-200 bg-white">
        Buy
      </header>

      <div className="flex justify-around py-2.5 border-b border-gray-200 bg-white">
        <span className="text-[15px] text-gray-400 pb-2 relative cursor-default">Bank/-Comingsoon</span>
        <span className="text-[15px] text-[#4a8df4] font-medium pb-2 relative cursor-default">
          UPI
          <span className="absolute bottom-0 left-[20%] w-[60%] h-0.5 bg-[#4a8df4]" />
        </span>
        <span className="text-[15px] text-gray-400 pb-2 relative cursor-default">USDT/-comingsoon</span>
      </div>

      <div className="flex gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex-1 flex items-center bg-[#f8fbff] rounded-full px-4 py-2.5">
          <Search size={18} className="text-[#4da0ff] mr-2.5 shrink-0" />
          <input
            type="text"
            inputMode="numeric"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search packages (₹100 - ₹10,000)"
            className="border-none bg-transparent outline-none w-full text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
        <p className="text-xs text-gray-400 px-4 py-3">
          Showing {filtered.length} packages. Tap Buy to start checkout.
        </p>
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-10">
            No packages match your search.
          </div>
        )}
        <div className="flex flex-col">
          {filtered.map((amount) => {
            const reward = +(amount * rewardPct / 100).toFixed(1);
            const itoken = +(amount + reward).toFixed(2);
            const orderId = '5471' + String(amount).padStart(8, '0');
            return (
              <div
                key={amount}
                className="px-5 py-4 border-b border-gray-200 bg-white"
              >
                <div className="flex justify-between text-[13px] text-gray-400 mb-3">
                  <span>No:{orderId}</span>
                  <span>Reward {rewardPct}%</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-sm text-gray-700 mb-1">Price</span>
                      <span className="text-[15px] font-semibold text-rose-600">₹ {amount}</span>
                    </div>
                    <span className="text-sm text-gray-400 mt-4">+</span>
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-sm text-gray-700 mb-1">Reward</span>
                      <span className="text-[15px] font-semibold text-gray-700">{reward}</span>
                    </div>
                    <span className="text-sm text-gray-400 mt-4">=</span>
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-sm text-gray-700 mb-1">Itoken</span>
                      <span className="text-[15px] font-semibold text-[#4a8df4]">{itoken}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => buy(amount)}
                    disabled={buyingAmount !== null}
                    className="bg-[#4a8df4] text-white border-none px-5 py-2 rounded-md text-sm font-medium cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {buyingAmount === amount && <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                    {buyingAmount === amount ? '...' : 'Buy'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
