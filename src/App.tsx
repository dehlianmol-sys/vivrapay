import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider, useStore } from './lib/store';
import { ToastProvider } from './lib/toast';
import { RedirectIfAuthed, RequireAdmin, RequireSuperAdmin, RequireUser } from './components/Guards';
import UserLayout from './components/UserLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Deposit from './pages/Deposit';
import Payment from './pages/Payment';
import UPI from './pages/UPI';
import Team from './pages/Team';
import Mine from './pages/Mine';
import AgentLogin from './pages/agent/AgentLogin';
import AgentDashboard from './pages/agent/AgentDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UserLedger from './pages/admin/UserLedger';
import DepositLogs from './pages/admin/DepositLogs';
import Gateways from './pages/admin/Gateways';
import Banners from './pages/admin/Banners';
import Settings from './pages/admin/Settings';
import Agents from './pages/admin/Agents';
import CustomerServiceAdmin from './pages/admin/CustomerService';
import CustomerServicePage from './pages/CustomerService';

/** Root entry: public landing page for visitors, home dashboard for signed-in users. */
function RootEntry() {
  const { currentUser, loading } = useStore();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#124ec3] rounded-full animate-spin" />
      </div>
    );
  }
  if (!currentUser) return <Landing />;
  if (currentUser.role !== 'user') return <Navigate to="/admin" replace />;
  return (
    <UserLayout>
      <Home />
    </UserLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootEntry />} />
            <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
            <Route path="/register" element={<RedirectIfAuthed><Register /></RedirectIfAuthed>} />

            <Route path="/agent/login" element={<AgentLogin />} />
            <Route path="/agent/dashboard" element={<AgentDashboard />} />

            <Route element={<RequireUser><UserLayout /></RequireUser>}>
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/upi" element={<UPI />} />
              <Route path="/team" element={<Team />} />
              <Route path="/mine" element={<Mine />} />
              <Route path="/customer-service" element={<CustomerServicePage />} />
            </Route>

            <Route path="/payment" element={<RequireUser><Payment /></RequireUser>} />

            <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<RequireSuperAdmin><UserLedger /></RequireSuperAdmin>} />
              <Route path="deposits" element={<DepositLogs />} />
              <Route path="agents" element={<RequireSuperAdmin><Agents /></RequireSuperAdmin>} />
              <Route
                path="gateways"
                element={<RequireSuperAdmin><Gateways /></RequireSuperAdmin>}
              />
              <Route
                path="banners"
                element={<RequireSuperAdmin><Banners /></RequireSuperAdmin>}
              />
              <Route
                path="settings"
                element={<RequireSuperAdmin><Settings /></RequireSuperAdmin>}
              />
              <Route
                path="customer-service"
                element={<RequireSuperAdmin><CustomerServiceAdmin /></RequireSuperAdmin>}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </ToastProvider>
  );
}
