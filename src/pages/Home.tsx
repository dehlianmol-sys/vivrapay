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
        <span className="vp-header-title">vivrapay</span>
      </div>

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
        <div className="vp-amount">
          <i className="fa-solid fa-coins" style={{ color: '#333' }} /> {wallet.toFixed(2)}{' '}
          <span>INR</span>
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
            <div className="vp-action-icon">
              <i className="fa-solid fa-money-bill-transfer" />
            </div>
            Buy
          </button>
          <button className="vp-action-btn" onClick={() => navigate('/upi')}>
            <div className="vp-action-icon">
              <i className="fa-solid fa-hand-holding-dollar" />
            </div>
            Sell
          </button>
          <button className="vp-action-btn" onClick={() => navigate('/upi')}>
            <div className="vp-action-icon">
              <i className="fa-regular fa-credit-card" />
            </div>
            +UPI
          </button>
          <button className="vp-action-btn" onClick={() => navigate('/mine')}>
            <div className="vp-action-icon">
              <i className="fa-solid fa-gift" />
            </div>
            Activity
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
        onClick={() => navigate('/mine')}
      >
        <div>
          <h3 style={{ fontSize: 16, marginBottom: 5, fontWeight: 600 }}>Newbie Rewards</h3>
          <span style={{ color: '#f44336', fontSize: 12 }}>Get ₹{newbieReward} — Click for more &gt;</span>
        </div>
        <i className="fa-solid fa-box-open" style={{ fontSize: 40, color: '#b39ddb' }} />
      </div>
    </div>
  );
}
