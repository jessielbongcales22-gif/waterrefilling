import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, ChevronRight, Info, Droplets, User as UserIcon, MapPin, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const BARANGAYS = ['Panalaron', 'Pob. Lungsodaan', 'Maliwanag', 'Caduhaan', 'San Jose', 'Sta. Cruz'];

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [barangaySelect, setBarangaySelect] = useState('Panalaron');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { users, addUser } = useData();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setContact(''); setError('');
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const matchedUser = users.find(u => u.email === email && u.password === password);
      if (!matchedUser) {
        setError('Invalid email or password');
        return;
      }
      login(matchedUser.email, matchedUser.role, matchedUser.barangay);
      onClose();
      resetForm();
      if (matchedUser.role === 'customer') {
        navigate('/customer-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Register
      if (users.find(u => u.email === email)) {
        setError('Email already exists');
        return;
      }
      addUser({
        name: name || email.split('@')[0],
        email,
        password,
        contact,
        barangay: barangaySelect,
        role: 'customer',
      });
      login(email, 'customer', barangaySelect);
      onClose();
      resetForm();
      navigate('/customer-dashboard');
    }
  };

  const autoFill = (type: 'admin' | 'staff') => {
    if (type === 'admin') {
      setEmail('admin@watermarket.com');
      setPassword('admin123');
    } else {
      setEmail('staff1@watermarket.com');
      setPassword('staff123');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">Water Market Station</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">HINUNANGAN, SOUTHERN LEYTE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-slate-100 p-1 rounded-2xl flex mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contact Number</label>
                  <div className="relative group">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="tel" 
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="0917 123 4567"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Barangay</label>
                  <div className="relative group">
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors z-10" />
                    <select 
                      value={barangaySelect}
                      onChange={(e) => setBarangaySelect(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold">{error}</span>
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>

          {isLogin && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center space-x-2 mb-4 text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold">Demo Credentials — click to auto-fill</span>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => autoFill('admin')}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-200 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Admin</span>
                    <span className="text-sm font-medium text-slate-600">admin@watermarket.com</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>
                <button 
                  onClick={() => autoFill('staff')}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-200 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Staff</span>
                    <span className="text-sm font-medium text-slate-600">staff1@watermarket.com</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
