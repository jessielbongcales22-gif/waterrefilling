import { useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  ArrowUpRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, subvalue, icon: Icon, trend, trendValue, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] card-shadow border border-slate-100 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center space-x-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full text-xs font-bold">
          <ArrowUpRight className="w-3 h-3" />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        {subvalue && <span className="text-xs font-bold text-slate-400 uppercase">{subvalue}</span>}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const { orders, getStats } = useData();
  const isAdmin = user?.role === 'admin';
  const stats = getStats(isAdmin ? undefined : user?.barangay);

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const visibleOrders = useMemo(() => {
    return isAdmin ? orders : orders.filter(o => o.barangay === user?.barangay);
  }, [orders, user, isAdmin]);

  const pendingVerification = visibleOrders.filter(o => o.status === 'verifying');

  // Revenue trend chart - last 7 days
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      const dayRevenue = visibleOrders
        .filter(o => o.date === dateStr && (o.paymentStatus === 'paid' || o.status === 'completed'))
        .reduce((sum, o) => sum + o.total, 0);
      days.push({ name: label, revenue: dayRevenue });
    }
    return days;
  }, [visibleOrders]);

  const paymentData = useMemo(() => {
    const totalRevenue = stats.cashRevenue + stats.gcashRevenue;
    if (totalRevenue === 0) return [{ name: 'No Data', value: 1, color: '#e2e8f0' }];
    return [
      { name: 'Cash', value: Math.round((stats.cashRevenue / totalRevenue) * 100), color: '#10b981' },
      { name: 'GCash', value: Math.round((stats.gcashRevenue / totalRevenue) * 100), color: '#3b82f6' },
    ];
  }, [stats]);

  const totalRevenue = stats.cashRevenue + stats.gcashRevenue;
  const walkInPercent = totalRevenue > 0 ? Math.round((stats.walkInRevenue / totalRevenue) * 100) : 0;
  const deliveryPercent = totalRevenue > 0 ? Math.round((stats.deliveryRevenue / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="blue-gradient p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">{isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}</h2>
          <p className="text-blue-100 font-medium">Welcome back, {user?.name}. Here's your {isAdmin ? 'business' : `Brgy. ${user?.barangay}`} overview.</p>
          <p className="text-blue-200 text-sm mt-4 font-bold uppercase tracking-widest opacity-80">{dateString}</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
      </div>

      {pendingVerification.length > 0 && isAdmin && (
        <Link to="/orders" className="block">
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-3xl flex items-center justify-between hover:bg-orange-100 transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-orange-900">Pending GCash Verifications</p>
                <p className="text-sm text-orange-700 font-bold">{pendingVerification.length} order(s) waiting for your approval</p>
              </div>
            </div>
            <span className="bg-orange-500 text-white px-4 py-2 rounded-xl font-black text-sm">Review Now →</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Today's Revenue" value={`₱${stats.todayRevenue}`} icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="Monthly Revenue" value={`₱${stats.monthlyRevenue}`} icon={TrendingUp} color="bg-blue-600" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} subvalue="needs action" icon={ShoppingCart} color="bg-indigo-500" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-orange-500" />
        <StatCard title="Walk-in Sales" value={stats.walkInSales} subvalue="total" icon={Plus} color="bg-cyan-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[2.5rem] card-shadow border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900">Revenue Source</h3>
              <p className="text-sm text-slate-400 font-medium">Walk-in vs Delivery</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Walk-in</p>
                  <p className="text-xl font-black text-slate-900">₱{stats.walkInRevenue}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{stats.walkInSales} txn</span>
                <span className="text-emerald-600 font-black">{walkInPercent}%</span>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery</p>
                  <p className="text-xl font-black text-slate-900">₱{stats.deliveryRevenue}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{stats.deliveryOrders} txn</span>
                <span className="text-blue-600 font-black">{deliveryPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] card-shadow border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900">Payment Methods</h3>
              <p className="text-sm text-slate-400 font-medium">Revenue distribution</p>
            </div>
            <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold">
              <span>₱{totalRevenue}</span>
            </div>
          </div>
          <div className="flex items-center justify-center h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {paymentData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900">₱{totalRevenue}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {paymentData.filter(p => p.name !== 'No Data').map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900">Revenue Trend</h3>
            <p className="text-sm text-slate-400 font-medium">Last 7 days performance</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => `₱${value}`} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
