import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  LogOut,
  Bell,
  Search,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingBag, label: 'Walk-in Sale', path: '/walk-in' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders', badge: 1 },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: BarChart3, label: 'Reports', path: '/reports', hidden: !isAdmin },
    { icon: Users, label: 'Users', path: '/users', hidden: !isAdmin },
  ].filter(item => !item.hidden);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 sidebar-gradient text-white flex flex-col fixed h-full">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Water Market</h1>
            <p className="text-xs text-white/60">{isAdmin ? 'Admin Portal' : 'Staff Portal'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path 
                  ? "bg-white/10 text-white shadow-lg shadow-black/10" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-3 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-white/10">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">{user?.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
