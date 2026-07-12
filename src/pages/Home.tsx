import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { getPublicUrl } from '../lib/storage';


const PLACEHOLDER_BANNERS = [
  'https://files.catbox.moe/ljdc20.jpg',
  'https://files.catbox.moe/dx2rd9.jpg',
  'https://files.catbox.moe/c985ky.png',
];

export default function Home() {
  const { activeBanners, currentUser, appSettings } = useStore();
  const navigate = useNavigate();
  const rewardPct = appSettings?.rewardPercentage ?? 4;
  const [slide, setSlide] = useState(0);

  const banners =
    activeBanners.length > 0
      ? activeBanners.map((b) => getPublicUrl(b.url))
      : PLACEHOLDER_BANNERS;

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % banners.length), 3000);
    return () => clearInterval(t);
  }, [banners.length]);

  return (
    <div className="hp-app">
      <div className="hp-slider-container">
        <div className="hp-slide hp-fade" key={slide}>
          <img src={banners[slide]} alt={`Banner ${slide + 1}`} />
        </div>
      </div>

      <div className="hp-card">
        <div className="hp-card-header">
          My IToken
          <span className="hp-card-subtitle">1 Rs = 1 IToken, 1 USDT &approx; 105 IToken</span>
        </div>

        <div className="hp-balance-row">
          <div className="hp-balance-amount">
            <span className="flag">🇮🇳</span>
            {(currentUser?.wallet ?? 0).toFixed(2)}
          </div>
          <button className="hp-buy-btn" onClick={() => navigate('/deposit')}>
            <span className="rupee-badge">₹</span> Buy
          </button>
        </div>

        <div className="hp-stats-grid">
          <div className="hp-stat-item">
            <span className="hp-stat-label">Today Profit</span>
            <span className="hp-stat-value">0</span>
          </div>
          <div className="hp-stat-item">
            <span className="hp-stat-label">Reward</span>
            <span className="hp-stat-value">{rewardPct}%</span>
          </div>
          <button className="hp-action-btn" onClick={() => navigate('/deposit')}>
            Buy History
          </button>
        </div>

        <div className="hp-divider" />

        <div className="hp-stats-grid">
          <div className="hp-stat-item">
            <span className="hp-stat-label">Auto Selling</span>
            <span className="hp-stat-value">Sell Set</span>
          </div>
          <div className="hp-stat-item">
            <span className="hp-stat-label">Sell Faster</span>
            <span className="hp-stat-value">Link Upi</span>
          </div>
          <button className="hp-action-btn" onClick={() => navigate('/upi')}>
            Sell History
          </button>
        </div>
      </div>

      <div className="hp-alert-bar">
        <div className="hp-alert-content">
          <i className="fa-solid fa-bullhorn" />
          <span>beware for scammer</span>
        </div>
        <i className="fa-solid fa-circle-info" style={{ color: '#ccc' }} />
      </div>

      <div className="hp-news-section">
        <div className="hp-news-header">
          <h3>News</h3>
          <a href="#" onClick={(e) => e.preventDefault()}>
            More &gt;
          </a>
        </div>

        <div className="hp-news-item">
          <div className="hp-news-title">Problembindupi</div>
          <div className="hp-news-date">2026-01-30 12:35:37</div>
        </div>

        <div className="hp-divider" style={{ margin: '15px 0' }} />

        <div className="hp-news-item">
          <div className="hp-news-title">DO NOT TRUST FOR ANY CALL</div>
          <div className="hp-news-date">2026-03-27 14:30:45</div>
        </div>
      </div>
    </div>
  );
}
