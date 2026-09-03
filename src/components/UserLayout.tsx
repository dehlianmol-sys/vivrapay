import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: 'fa-solid fa-house' },
  { to: '/deposit', label: 'Deposit', icon: 'fa-solid fa-cart-shopping' },
  { to: '/upi', label: 'Tool', icon: 'fa-regular fa-compass' },
  { to: '/team', label: 'Teams', icon: 'fa-regular fa-handshake' },
  { to: '/customer-service', label: 'Support', icon: 'fa-solid fa-headset' },
  { to: '/mine', label: 'Mine', icon: 'fa-regular fa-user' },
];

export default function UserLayout() {
  const { pathname } = useLocation();
  return (
    <div className="vp vp-shell">
      <div className="vp-scroll">
        <Outlet />
      </div>
      <nav className="vp-nav">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`vp-nav-item${active ? ' active' : ''}`}
            >
              <i className={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
