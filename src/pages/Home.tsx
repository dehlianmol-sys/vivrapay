import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { getPublicUrl } from '../lib/storage';

export default function Home() {
  const { activeBanners, currentUser, appSettings, deposits } = useStore();
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  const banners = activeBanners.map((b) => getPublicUrl(b.url));

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  const wallet = currentUser?.wallet ?? 0;
  const sellingCount = (currentUser?.upis ?? []).filter((u) => u.isSelling).length;

  const todayKey = new Date().toDateString();
  const myApprovedToday = deposits.filter(
    (d) =>
      d.userId === currentUser?.id &&
      d.status === 'Success' &&
      new Date(d.createdAt).toDateString() === todayKey,
  );
  const successOrders = myApprovedToday.length;
  const successAmount = myApprovedToday.reduce((s, d) => s + Number(d.amount || 0), 0);
  const newbieReward = appSettings?.newbieRewardAmount ?? 60;

  return (
    <div>
      <div className="vp-header" style={{ justifyContent: 'center' }}>
        <span className="vp-header-title">HK Wallet</span>
      </div>

      {currentUser?.lockedDepositId && (
        <div
          className="flex items-center justify-between gap-3 bg-amber-50 border-y border-amber-200 px-4 py-2.5 text-[13px] text-amber-800"
          role="status"
        >
          <span className="min-w-0 truncate">Your order is pending.</span>
          <button
            onClick={() => navigate('/payment')}
            className="shrink-0 rounded-full bg-amber-500 px-3 py-1 text-[12px] font-semibold text-white"
          >
            View
          </button>
        </div>
      )}

      <div className="vp-banner">
        {banners.length > 0 ? (
          <img key={slide} src={banners[slide]} alt={`Promotion banner ${slide + 1}`} />
        ) : (
          <div className="vp-banner-copy">
            <h2>₹1000</h2>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>EVERY DAY</div>
            <div style={{ fontSize: 10, color: '#ccc', marginTop: 8 }}>SIMPLE • SMART • REAL</div>
          </div>
        )}
      </div>

      <div className="vp-card vp-total-card">
        <div style={{ color: 'var(--vp-muted)', fontSize: 14 }}>Total Amount</div>
        <div className="vp-amount font-bold">
          <i className="fa-solid fa-coins" style={{ color: '#333' }} /> {wallet.toFixed(2)}{' '}
          <span style={{ fontWeight: 700 }}>INR</span>
        </div>
        <div className="vp-sell-count">
          <span>
            In Sell UPI Count: <strong>{sellingCount}</strong>
          </span>
          <span
            style={{ color: '#888', fontSize: 12, cursor: 'pointer' }}
            onClick={() => navigate('/upi')}
          >
            View <i className="fa-solid fa-chevron-right" />
          </span>
        </div>
        <div className="vp-action-grid">
          <button className="vp-action-btn" onClick={() => navigate('/deposit')}>
            <img className="vp-action-img" src={getPublicUrl('Buybotton.png')} alt="Buy" />
            <span className="vp-action-label">Buy</span>
          </button>
          <button
            className="vp-action-btn"
            onClick={() => navigate('/mine', { state: { subPage: 'sell-history' } })}
          >
            <img className="vp-action-img" src={getPublicUrl('Sellbotton.png')} alt="Sell" />
            <span className="vp-action-label">Sell</span>
          </button>
          <button className="vp-action-btn" onClick={() => navigate('/upi')}>
            <img className="vp-action-img" src={getPublicUrl('Upibotton.png')} alt="+UPI" />
            <span className="vp-action-label">+UPI</span>
          </button>
          <button
            className="vp-action-btn"
            onClick={() => navigate('/mine', { state: { modal: 'event' } })}
          >
            <img className="vp-action-img" src={getPublicUrl('Activitybotton.png')} alt="Activity" />
            <span className="vp-action-label">Activity</span>
          </button>
        </div>
      </div>

      <div className="vp-section-title">
        Today's Buy
        <span onClick={() => navigate('/deposit')}>
          View <i className="fa-solid fa-chevron-right" />
        </span>
      </div>
      <div className="vp-stats-grid">
        <div className="vp-stat-card">
          <div className="vp-stat-icon">
            <i className="fa-solid fa-file-invoice" />
          </div>
          <div className="vp-stat-info">
            <div className="v">{successOrders}</div>
            <div className="l">Success Orders</div>
          </div>
        </div>
        <div className="vp-stat-card">
          <div className="vp-stat-icon">
            <i className="fa-solid fa-indian-rupee-sign" />
          </div>
          <div className="vp-stat-info">
            <div className="v">{successAmount.toFixed(0)}</div>
            <div className="l">Success Amount</div>
          </div>
        </div>
      </div>

      <div
        className="vp-card vp-newbie-card"
        style={{ marginTop: 5 }}
        onClick={() => navigate('/mine', { state: { subPage: 'newbie' } })}
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Newbie Rewards</h3>
            <span className="vp-badge-hot">FREE ₹{newbieReward}</span>
          </div>
          <span style={{ color: '#f44336', fontSize: 12 }}>Get ₹{newbieReward} — Click for more &gt;</span>
        </div>
        <i className="fa-solid fa-box-open" style={{ fontSize: 40, color: '#b39ddb' }} />
      </div>
    </div>
  );
}
