import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { ToastProvider } from './lib/toast';
import { RedirectIfAuthed, RequireAdmin, RequireSuperAdmin, RequireUser } from './components/Guards';
import UserLayout from './components/UserLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Deposit from './pages/Deposit';
import Payment from './pages/Payment';
import UPI from './pages/UPI';
import Team from './pages/Team';
import Mine from './pages/Mine';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UserLedger from './pages/admin/UserLedger';
import DepositLogs from './pages/admin/DepositLogs';
import Gateways from './pages/admin/Gateways';
import Banners from './pages/admin/Banners';
import Settings from './pages/admin/Settings';
import CustomerServiceAdmin from './pages/admin/CustomerService';
import CustomerServicePage from './pages/CustomerService';

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
            <Route path="/register" element={<RedirectIfAuthed><Register /></RedirectIfAuthed>} />

            <Route element={<RequireUser><UserLayout /></RequireUser>}>
              <Route path="/" element={<Home />} />
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
