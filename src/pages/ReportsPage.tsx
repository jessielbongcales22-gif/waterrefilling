import { useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Calendar,
  Download,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const ReportsPage = () => {
  const { user } = useAuth();
  const { orders, getStats } = useData();
  const isAdmin = user?.role === 'admin';
  const stats = getStats(isAdmin ? undefined : user?.barangay);

  const visibleOrders = useMemo(() => 
    isAdmin ? orders : orders.filter(o => o.barangay === user?.barangay),
    [orders, user, isAdmin]
  );

  // Last 30 days trend
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      const dayOrders = visibleOrders.filter(o => o.date === dateStr && (o.paymentStatus === 'paid' || o.status === 'completed'));
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      days.push({ 
        day: `${d.getDate()}`, 
        sales: dayRevenue, 
        count: dayOrders.length 
      });
    }
    return days;
  }, [visibleOrders]);

  const exportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Type', 'Items', 'Total', 'Payment', 'Status', 'Barangay'];
    const rows = visibleOrders.map(o => [
      o.id, o.date, o.customerName, o.type, o.items.length, o.total, o.payment, o.status, o.barangay
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `water_market_report_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Sales Reports</h2>
          <p className="text-slate-500 font-medium">
            {isAdmin ? 'Analyze your business performance' : `Reports for Brgy. ${user?.barangay}`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex">
            <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Week</button>
            <button className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-900 rounded-lg shadow-sm">Month</button>
            <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Year</button>
          </div>
          <button onClick={exportCSV} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6"><DollarSign className="w-6 h-6" /></div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-3xl font-black text-slate-900">₱{stats.monthlyRevenue}</h3>
            <div className="flex items-center space-x-1 text-emerald-500 text-sm font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Live</span>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Revenue (month)</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6"><ShoppingCart className="w-6 h-6" /></div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-3xl font-black text-slate-900">{stats.totalOrders}</h3>
            <div className="flex items-center space-x-1 text-blue-500 text-sm font-bold">
              <ArrowUpRight className="w-4 h-4" />
              <span>orders</span>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Orders (month)</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6"><Calendar className="w-6 h-6" /></div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-3xl font-black text-slate-900">₱{stats.avgOrderValue}</h3>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Avg Order Value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-8">Sales Trend (30 days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => `₱${value}`} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-8">Orders Trend (30 days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
