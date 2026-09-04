import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div>
      <div className="vp-header">
        <span style={{ width: 20 }} />
        <span className="vp-header-title">Deposit</span>
        <i className="fa-solid fa-clock-rotate-left" onClick={() => navigate('/mine')} />
      </div>

      <div className="vp-filter-tabs">
        <div className="vp-filter-pill">
          <div className="active">INR</div>
          <div>USDT</div>
        </div>
      </div>

      <div className="vp-dep-controls">
        <i className="fa-solid fa-filter" />
        <input
          type="text"
          inputMode="numeric"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search packages"
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 14,
            textAlign: 'center',
            color: '#555',
          }}
        />
        <i className="fa-solid fa-sort" />
      </div>

      <div className="vp-dep-list">
        {filtered.length === 0 && (
          <div className="vp-empty">
            <i className="fa-solid fa-box-open" />
            <p>No packages match your search.</p>
          </div>
        )}
        {filtered.map((amount) => {
          const reward = +((amount * rewardPct) / 100).toFixed(2);
          const income = +(amount + reward).toFixed(2);
          return (
            <div key={amount} className="vp-dep-item">
              <div className="vp-dep-icon">
                <i className="fa-solid fa-indian-rupee-sign" />
              </div>
              <div className="vp-dep-details">
                <div className="vp-dep-title">
                  {amount} INR <span className="vp-bank-tag">• UPI</span>
                </div>
                <div className="vp-dep-income">
                  ₹{reward.toFixed(2)} <span>({rewardPct}% + {income.toFixed(2)} Itoken)</span>
                </div>
                <div className="vp-dep-sub">Income</div>
              </div>
              <button
                className="vp-btn-buy"
                onClick={() => buy(amount)}
                disabled={buyingAmount !== null}
              >
                {buyingAmount === amount ? '...' : 'Buy'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
