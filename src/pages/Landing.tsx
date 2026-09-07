import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { claimPreRegistration } from '../lib/agents';
import { useToast } from '../lib/toast';

const APK_URL = 'https://gofile.io/d/FlX3pVC7';
const LOGO = 'https://files.catbox.moe/hiw10d.png';

const CSS = `
.lp { width:100%; max-width:450px; margin:0 auto; background:linear-gradient(180deg,#124ec3 0%,#0b3499 100%); min-height:100dvh; display:flex; flex-direction:column; padding-bottom:40px; position:relative; color:#fff; box-shadow:0 0 20px rgba(0,0,0,.3); }
.lp * { box-sizing:border-box; }
.lp .header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(11,52,153,.4); border-bottom:1px solid rgba(255,255,255,.1); backdrop-filter:blur(10px); position:sticky; top:0; z-index:100; }
.lp .logo-section { display:flex; align-items:center; gap:10px; }
.lp .logo-img { width:42px; height:42px; border-radius:8px; object-fit:cover; box-shadow:0 2px 6px rgba(0,0,0,.15); }
.lp .logo-text { display:flex; flex-direction:column; }
.lp .logo-title { font-size:16px; font-weight:700; line-height:1.2; }
.lp .logo-subtitle { font-size:11px; color:rgba(255,255,255,.75); }
.lp .btn-download { background:linear-gradient(135deg,#ff9800 0%,#f57c00 100%); color:#fff; text-decoration:none; font-weight:700; border:none; cursor:pointer; border-radius:25px; text-align:center; box-shadow:0 4px 12px rgba(245,124,0,.4); transition:transform .2s; }
.lp .btn-download:active { transform:scale(.96); }
.lp .header .btn-download { padding:8px 20px; font-size:13px; border-radius:8px; }
.lp .content { padding:20px; display:flex; flex-direction:column; align-items:center; }
.lp .main-heading { font-size:32px; font-weight:900; text-align:center; line-height:1.2; letter-spacing:.5px; margin:15px 0 25px; text-shadow:0 2px 4px rgba(0,0,0,.2); }
.lp .hero-illustration { width:100%; height:240px; display:flex; justify-content:center; align-items:center; margin-bottom:25px; }
.lp .main-action-btn { width:100%; padding:14px; font-size:18px; border-radius:12px; margin-bottom:16px; }
.lp .earn-money-label { width:100%; background:#0d3da9; text-align:center; padding:12px; border-radius:12px; font-weight:600; font-size:15px; margin-bottom:16px; box-shadow:inset 0 1px 3px rgba(0,0,0,.2); }
.lp .features-container { width:100%; background:#eef3ff; border-radius:18px; padding:18px 12px; display:flex; justify-content:space-between; margin-bottom:25px; box-shadow:0 4px 15px rgba(0,0,0,.1); }
.lp .feature-item { flex:1; display:flex; flex-direction:column; align-items:center; text-align:center; }
.lp .feature-icon-box { width:52px; height:52px; background:#fff; border-radius:14px; display:flex; justify-content:center; align-items:center; margin-bottom:10px; font-size:22px; box-shadow:0 3px 8px rgba(18,78,195,.1); }
.lp .feature-title { font-size:13px; font-weight:700; color:#0b3499; margin-bottom:2px; }
.lp .feature-sub { font-size:11px; color:#6584c7; }
.lp .info-block-header { width:100%; background:#fff; color:#0b3499; text-align:center; padding:12px; border-radius:10px; font-weight:700; font-size:15px; margin-bottom:18px; box-shadow:0 2px 6px rgba(0,0,0,.1); }
.lp .why-choose-content { width:100%; padding:0 4px; margin-bottom:25px; }
.lp .info-paragraph { margin-bottom:16px; font-size:13.5px; line-height:1.5; color:rgba(255,255,255,.9); }
.lp .info-paragraph strong { font-size:14.5px; color:#fff; display:block; margin-bottom:2px; }
.lp .join-us-banner { width:100%; background:#fff; color:#0b3499; text-align:center; padding:14px 16px; border-radius:10px; font-weight:700; font-size:14px; line-height:1.4; margin-bottom:25px; box-shadow:0 2px 6px rgba(0,0,0,.1); }
.lp .recharge-section { width:100%; display:flex; flex-direction:column; align-items:center; }
.lp .levels-grid { width:100%; display:flex; justify-content:space-between; gap:10px; margin-top:5px; }
.lp .level-card { flex:1; border-radius:14px; padding:14px 8px; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,.15); }
.lp .level-card.level-a { background:#3b71ca; }
.lp .level-card.level-b { background:#ff4d4d; }
.lp .level-card.level-c { background:#2bcd70; }
.lp .level-name { font-size:13px; font-weight:600; margin-bottom:10px; }
.lp .level-badge { background:#fff; color:#333; font-size:14px; font-weight:700; padding:4px 0; width:80%; border-radius:15px; margin-bottom:10px; }
.lp .level-card.level-a .level-badge { color:#3b71ca; }
.lp .level-card.level-b .level-badge { color:#ff4d4d; }
.lp .level-card.level-c .level-badge { color:#2bcd70; }
.lp .level-footer { font-size:11px; color:rgba(255,255,255,.85); }
.lp .lp-links { width:100%; display:flex; justify-content:center; gap:16px; margin-top:22px; font-size:13px; }
.lp .lp-links a { color:#cfe0ff; text-decoration:underline; }
.lp-modal-back { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; padding:20px; z-index:200; }
.lp-modal { width:100%; max-width:360px; background:#fff; color:#0b3499; border-radius:18px; padding:22px; box-shadow:0 12px 40px rgba(0,0,0,.35); }
.lp-modal h3 { font-size:18px; font-weight:800; margin-bottom:6px; }
.lp-modal p { font-size:13px; color:#4b5f8f; margin-bottom:16px; }
.lp-modal input { width:100%; border:1px solid #d6e0f5; background:#f5f8ff; border-radius:12px; padding:13px 14px; font-size:15px; color:#0b1e4f; outline:none; margin-bottom:14px; }
.lp-modal .ref-chip { display:inline-block; background:#eef3ff; color:#124ec3; font-weight:700; font-size:12px; padding:5px 10px; border-radius:999px; margin-bottom:12px; }
.lp-modal button.primary { width:100%; padding:13px; border:none; border-radius:12px; background:linear-gradient(135deg,#ff9800,#f57c00); color:#fff; font-weight:700; font-size:15px; cursor:pointer; }
.lp-modal button.ghost { width:100%; padding:10px; border:none; background:none; color:#7286b0; font-size:13px; margin-top:8px; cursor:pointer; }
`;

export default function Landing() {
  const toast = useToast();
  const { search } = useLocation();
  const refCode = new URLSearchParams(search).get('ref');
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (refCode) setOpen(true);
  }, [refCode]);

  const startDownload = () => {
    window.location.href = APK_URL;
  };

  const claim = async () => {
    if (saving) return;
    if (phone.trim().length < 10) {
      toast('Enter a valid mobile number', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await claimPreRegistration(phone.trim(), refCode ?? '');
      toast(res.message, res.ok ? 'success' : 'error');
      if (res.ok) {
        setOpen(false);
        startDownload();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#0b1e4f', minHeight: '100dvh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lp">
        <div className="header">
          <div className="logo-section">
            <img src={LOGO} alt="HK Wallet Logo" className="logo-img" />
            <div className="logo-text">
              <span className="logo-title">HK Wallet</span>
              <span className="logo-subtitle">Earn Money Online</span>
            </div>
          </div>
          <button className="btn-download" onClick={() => (refCode ? setOpen(true) : startDownload())}>
            Download
          </button>
        </div>

        <div className="content">
          <h1 className="main-heading">
            TO GET RUPEE
            <br />
            BY EASY TASK
          </h1>

          <div className="hero-illustration">
            <svg width="220" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="70" fill="#4fa5ff" opacity="0.3" />
              <path
                d="M150 120 C165 120, 175 110, 175 95 C175 82, 163 72, 150 75 C145 55, 120 45, 100 55 C90 45, 70 50, 65 65 C50 65, 40 75, 40 90 C40 105, 52 115, 68 115 Z"
                fill="#76b3ff"
                opacity="0.4"
              />
              <circle cx="95" cy="65" r="22" stroke="#2575fc" strokeWidth="7" fill="none" opacity="0.7" />
              <path
                d="M45 95 C45 88, 50 83, 57 83 L85 83 L98 94 L155 94 C162 94, 167 99, 167 106 L167 150 C167 157, 162 162, 155 162 L45 162 Z"
                fill="url(#folderGrad)"
              />
              <rect x="65" y="62" width="76" height="75" rx="5" fill="#ffffff" transform="rotate(5 103 99)" />
              <rect x="75" y="75" width="45" height="6" rx="2" fill="#ffe066" transform="rotate(5 103 99)" />
              <rect x="77" y="87" width="52" height="5" rx="2" fill="#e2e8f0" transform="rotate(5 103 99)" />
              <rect x="79" y="97" width="35" height="5" rx="2" fill="#e2e8f0" transform="rotate(5 103 99)" />
              <path
                d="M50 105 C50 100, 54 96, 59 96 L151 96 C156 96, 160 100, 160 105 L160 155 C160 160, 156 164, 151 164 L50 164 Z"
                fill="rgba(255,255,255,0.25)"
              />
              <path
                d="M130 140 C140 140, 148 133, 148 124 C148 116, 140 110, 131 111 C128 100, 112 96, 102 102 C97 97, 86 99, 84 107 C76 107, 70 113, 70 121 C70 129, 77 135, 86 135 Z"
                fill="#bce0ff"
                opacity="0.85"
              />
              <g transform="translate(45, 125) rotate(-25)">
                <circle cx="20" cy="20" r="16" stroke="#fff176" strokeWidth="5" fill="rgba(255,255,255,0.1)" />
                <rect x="17" y="34" width="6" height="18" rx="3" fill="#ffe082" />
              </g>
              <defs>
                <linearGradient id="folderGrad" x1="45" y1="83" x2="167" y2="162" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#64b5f6" />
                  <stop offset="100%" stopColor="#1565c0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <button className="btn-download main-action-btn" onClick={() => (refCode ? setOpen(true) : startDownload())}>
            Download App
          </button>
          <div className="earn-money-label">Earn money by completing simple daily tasks</div>

          <div className="features-container">
            <div className="feature-item">
              <div className="feature-icon-box">⚡</div>
              <div className="feature-title">Fast Payout</div>
              <div className="feature-sub">Within minutes</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-box">🔒</div>
              <div className="feature-title">100% Safe</div>
              <div className="feature-sub">Secure UPI</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-box">🎁</div>
              <div className="feature-title">Daily Bonus</div>
              <div className="feature-sub">Every order</div>
            </div>
          </div>

          <div className="info-block-header">Why choose HK Wallet?</div>
          <div className="why-choose-content">
            <p className="info-paragraph">
              <strong>Simple tasks, real income</strong>
              Complete easy UPI tasks each day and receive your earnings straight into your wallet.
            </p>
            <p className="info-paragraph">
              <strong>Instant withdrawals</strong>
              Withdraw to any UPI app any time — no waiting periods, no hidden charges.
            </p>
            <p className="info-paragraph">
              <strong>Trusted by thousands</strong>
              A growing community of members earning every single day with HK Wallet.
            </p>
          </div>

          <div className="join-us-banner">Join HK Wallet today and start earning from your very first task</div>

          <div className="recharge-section">
            <div className="info-block-header">Recharge Rebate Levels</div>
            <div className="levels-grid">
              <div className="level-card level-a">
                <div className="level-name">Level A</div>
                <div className="level-badge">4%</div>
                <div className="level-footer">On every order</div>
              </div>
              <div className="level-card level-b">
                <div className="level-name">Level B</div>
                <div className="level-badge">6%</div>
                <div className="level-footer">On every order</div>
              </div>
              <div className="level-card level-c">
                <div className="level-name">Level C</div>
                <div className="level-badge">8%</div>
                <div className="level-footer">On every order</div>
              </div>
            </div>
          </div>

          <div className="lp-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/agent/login">Agent Login</Link>
          </div>
        </div>
      </div>

      {open && (
        <div className="lp-modal-back" onClick={() => setOpen(false)}>
          <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Enter Mobile Number to Claim ₹50 Bonus &amp; Download App</h3>
            <p>Your bonus is added automatically when you register with this number.</p>
            {refCode && <span className="ref-chip">Invite code: {refCode}</span>}
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile number"
            />
            <button className="primary" onClick={claim} disabled={saving}>
              {saving ? 'Please wait...' : 'Claim ₹50 & Download'}
            </button>
            <button className="ghost" onClick={() => setOpen(false)}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
