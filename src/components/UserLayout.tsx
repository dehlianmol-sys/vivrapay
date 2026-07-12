import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Headset, Home as HomeIcon, Ticket, ShieldCheck, Users, User } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/deposit', label: 'Buy', icon: Ticket },
  { to: '/upi', label: 'UPI', icon: ShieldCheck },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/mine', label: 'Mine', icon: User },
];

export default function UserLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <div className="relative w-full max-w-[480px] mx-auto bg-[#fafbfc] min-h-screen shadow-sm">
      <div className="min-h-screen pb-[140px]">
        <Outlet />
      </div>
      <button
        type="button"
        onClick={() => navigate('/customer-service')}
        className="fixed bottom-[150px] right-4 w-[50px] h-[50px] bg-[#e6eefc] rounded-full flex justify-center items-center shadow-lg z-[100] sm:right-[max(1rem,calc(50%-240px+1rem))]"
        aria-label="Customer Support"
      >
        <Headset size={24} className="text-[#5c4ce4]" />
        <span className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-[#5c4ce4] rounded-full" />
      </button>
      <nav className="fixed bottom-[70px] left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white flex justify-between px-5 py-2.5 border-t border-gray-200 z-[100]">
        {navItems.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 text-[11px] no-underline transition-colors ${
                active ? 'text-[#2b7deb]' : 'text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[70px] bg-[#fafbfc] z-[99]" />
    </div>
  );
}
