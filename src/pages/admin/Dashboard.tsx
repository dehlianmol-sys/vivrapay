import { useMemo } from 'react';
import { Users, IndianRupee, TrendingUp, CreditCard, Receipt, Clock } from 'lucide-react';
import { useStore } from '../../lib/store';

export default function Dashboard() {
  const { users, deposits, gateways } = useStore();

  const stats = useMemo(() => {
    const regularUsers = users.filter((u) => u.role === 'user');
    const successful = deposits.filter((d) => d.status === 'Success');
    const totalDeposits = successful.reduce((s, d) => s + d.amount, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayCount = deposits.filter((d) => new Date(d.createdAt) >= today).length;
    const pending = deposits.filter((d) => d.status === 'Pending').length;
    return {
      users: regularUsers.length,
      totalDeposits,
      todayCount,
      gateways: gateways.filter((g) => g.active).length,
      pending,
      totalDepositsCount: successful.length,
    };
  }, [users, deposits, gateways]);

  const cards = [
    { label: 'Registered Users', value: stats.users, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Successful Deposits', value: `₹ ${stats.totalDeposits.toLocaleString()}`, icon: IndianRupee, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Today Transactions', value: stats.todayCount, icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
    { label: 'Active Gateways', value: stats.gateways, icon: CreditCard, color: 'from-violet-500 to-purple-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className={`bg-gradient-to-br ${c.color} rounded-xl p-5 text-white shadow-sm`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm text-white/80">{c.label}</span>
                <Icon size={22} className="text-white/80" />
              </div>
              <div className="text-2xl font-bold">{c.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-amber-500" />
            <h3 className="font-medium text-slate-700">Pending Approvals</h3>
          </div>
          {stats.pending === 0 ? (
            <p className="text-sm text-slate-400">No pending deposits.</p>
          ) : (
            <p className="text-sm text-slate-600">
              <span className="text-2xl font-bold text-amber-600">{stats.pending}</span> deposit
              request(s) awaiting review.
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Receipt size={18} className="text-emerald-500" />
            <h3 className="font-medium text-slate-700">Deposit Summary</h3>
          </div>
          <p className="text-sm text-slate-600">
            <span className="text-2xl font-bold text-emerald-600">{stats.totalDepositsCount}</span>{' '}
            successful deposit(s) processed.
          </p>
        </div>
      </div>
    </div>
  );
}
