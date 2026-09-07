import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  CreditCard,
  Image,
  LogOut,
  Menu,
  X,
  Settings,
  Headphones,
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../lib/store';
import { getLogoUrl } from '../../lib/storage';
import { useToast } from '../../lib/toast';

const APP_LOGO = getLogoUrl('Vivrapaylogo.png');

export default function AdminLayout() {
  const { currentUser, isSuperAdmin, logout } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/deposits', label: 'Deposit Logs', icon: Receipt },
    ...(isSuperAdmin
      ? [
          { to: '/admin/gateways', label: 'Payment Gateways', icon: CreditCard },
          { to: '/admin/banners', label: 'Banners', icon: Image },
          { to: '/admin/users', label: 'User Ledger', icon: Users },
          { to: '/admin/settings', label: 'Global Settings', icon: Settings },
          { to: '/admin/customer-service', label: 'Customer Service', icon: Headphones },
        ]
      : []),
  ];

  const doLogout = () => {
    logout();
    toast('Logged out', 'info');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt="HK Wallet" className="h-8 w-auto object-contain" />
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 py-4">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white border-l-4 border-blue-500'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {l.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 mb-2">
            {currentUser?.name} · {currentUser?.role}
          </div>
          <button
            onClick={doLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <img src={APP_LOGO} alt="HK Wallet" className="h-6 w-auto object-contain" />
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
