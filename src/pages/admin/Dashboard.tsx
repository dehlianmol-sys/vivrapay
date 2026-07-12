import { useMemo, useState } from 'react';
import { Users, IndianRupee, TrendingUp, CreditCard, Receipt, Clock, Calendar } from 'lucide-react';
import { useStore } from '../../lib/store';

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Dashboard() {
  const { users, deposits, gateways } = useStore();
  const [selectedDate, setSelectedDate] = useState<string>(ymd(new Date()));

  const stats = useMemo(() => {
    const regularUsers = users.filter((u) => u.role === 'user');
    const successful = deposits.filter((d) => d.status === 'Success');
    const totalDeposits = successful.reduce((s, d) => s + d.amount, 0);

    const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
    const today = startOfDay(new Date());
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const sumRange = (from: Date, to: Date) =>
      successful
        .filter((d) => { const t = new Date(d.createdAt).getTime(); return t >= from.getTime() && t < to.getTime(); })
        .reduce((s, d) => s + d.amount, 0);

    const todayTotal = sumRange(today, tomorrow);
    const yesterdayTotal = sumRange(yesterday, today);

    const selected = new Date(selectedDate + 'T00:00:00');
    const selectedNext = new Date(selected); selectedNext.setDate(selectedNext.getDate() + 1);
    const selectedTotal = sumRange(selected, selectedNext);
    const selectedCount = successful.filter((d) => {
      const t = new Date(d.createdAt).getTime();
      return t >= selected.getTime() && t < selectedNext.getTime();
    }).length;

    const todayCount = deposits.filter((d) => new Date(d.createdAt) >= today).length;
    const pending = deposits.filter((d) => d.status === 'Pending').length;
    return {
      users: regularUsers.length,
      totalDeposits,
      todayCount,
      gateways: gateways.filter((g) => g.active).length,
      pending,
      totalDepositsCount: successful.length,
      todayTotal,
      yesterdayTotal,
      selectedTotal,
      selectedCount,
    };
  }, [users, deposits, gateways, selectedDate]);

  const cards = [
    { label: 'Registered Users', value: stats.users, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Successful Deposits', value: `₹ ${stats.totalDeposits.toLocaleString()}`, icon: IndianRupee, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Today Transactions', value: stats.todayCount, icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
    { label: 'Active Gateways', value: stats.gateways, icon: CreditCard, color: 'from-violet-500 to-purple-600' },
  ];

  const trackingCards = [
    { label: "Today's Deposits", value: `₹ ${stats.todayTotal.toLocaleString()}`, color: 'from-sky-500 to-blue-600' },
    { label: "Yesterday's Deposits", value: `₹ ${stats.yesterdayTotal.toLocaleString()}`, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Total Overall Deposits', value: `₹ ${stats.totalDeposits.toLocaleString()}`, color: 'from-emerald-500 to-teal-600' },
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

      <div className="mt-8 bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-slate-700">Daily Deposit Tracking</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {trackingCards.map((c) => (
            <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-xl p-5 text-white`}>
              <div className="text-sm text-white/80 mb-2">{c.label}</div>
              <div className="text-2xl font-bold">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Calendar size={16} className="text-slate-500" />
            <label className="text-sm font-medium text-slate-700">Select date:</label>
            <input
              type="date"
              value={selectedDate}
              max={ymd(new Date())}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="bg-slate-50 rounded-lg p-4 flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="text-xs text-slate-500">Total on {selectedDate}</div>
              <div className="text-xl font-bold text-emerald-600">₹ {stats.selectedTotal.toLocaleString()}</div>
            </div>
            <div className="text-sm text-slate-600">
              {stats.selectedCount} successful deposit{stats.selectedCount === 1 ? '' : 's'}
            </div>
          </div>
        </div>
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
