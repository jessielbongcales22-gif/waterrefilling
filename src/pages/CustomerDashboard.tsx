import { useState, useMemo } from 'react';
import { 
  Droplets, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  CreditCard,
  Plus,
  Minus,
  LogOut,
  ShoppingBag,
  Upload,
  Smartphone,
  Banknote,
  Receipt,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const { orders, addOrder, users } = useData();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'GCASH'>('CASH');
  const [address, setAddress] = useState('');
  const [gcashReference, setGcashReference] = useState('');
  const [gcashReceipt, setGcashReceipt] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [error, setError] = useState('');

  const currentUser = users.find(u => u.email === user?.email);

  const myOrders = useMemo(() => {
    return orders.filter(o => o.customerId === currentUser?.id || o.customerName === user?.name).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, currentUser, user]);

  const activeOrder = myOrders.find(o => o.status !== 'completed' && o.status !== 'rejected' && o.status !== 'cancelled');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGcashReceipt(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const placeOrder = () => {
    setError('');

    if (!address.trim()) {
      setError('Please enter your delivery address');
      return;
    }

    if (paymentMethod === 'GCASH') {
      if (!gcashReference.trim()) {
        setError('Please enter your GCash reference number');
        return;
      }
      if (!gcashReceipt) {
        setError('Please upload your GCash receipt');
        return;
      }
    }

    setIsOrdering(true);
    setTimeout(() => {
      addOrder({
        customerName: user?.name || 'Customer',
        customerId: currentUser?.id,
        type: 'Delivery',
        items: [{ productId: 1, name: 'Purified Water', price: 30, quantity }],
        total: quantity * 30,
        payment: paymentMethod,
        paymentStatus: paymentMethod === 'GCASH' ? 'verifying' : 'pending',
        status: paymentMethod === 'GCASH' ? 'verifying' : 'pending',
        barangay: currentUser?.barangay || user?.barangay || 'Panalaron',
        address,
        gcashReference: paymentMethod === 'GCASH' ? gcashReference : undefined,
        gcashReceipt: paymentMethod === 'GCASH' ? gcashReceipt || undefined : undefined,
      });
      setIsOrdering(false);
      setOrderComplete(true);
      setQuantity(1);
      setGcashReference('');
      setGcashReceipt(null);
      setAddress('');
      setPaymentMethod('CASH');
      setTimeout(() => setOrderComplete(false), 4000);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-600';
      case 'verifying': return 'bg-orange-100 text-orange-600';
      case 'approved': return 'bg-blue-100 text-blue-600';
      case 'out for delivery': return 'bg-purple-100 text-purple-600';
      case 'completed': return 'bg-emerald-100 text-emerald-600';
      case 'rejected': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="h-20 bg-white border-b border-slate-100 px-6 lg:px-20 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">Water Market</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Welcome, {user?.name}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-slate-400 hover:text-rose-500 font-bold text-sm transition-colors"
        >
          <span>Sign Out</span>
          <LogOut className="w-4 h-4" />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order Section */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-8">Place an Order</h2>
              <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600">
                      <Droplets className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Purified Water Refill</h3>
                      <p className="text-blue-600 font-black text-lg">₱30.00 <span className="text-slate-400 text-sm font-bold uppercase tracking-widest ml-1">per container</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 border border-slate-200">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm transition-all active:scale-95"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-16 text-center font-black text-xl text-slate-900">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm transition-all active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-bold text-slate-600">Delivery Address</span>
                    </div>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={`Purok, Brgy. ${currentUser?.barangay || 'Panalaron'}, Hinunangan, Southern Leyte`}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none h-24"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-bold text-slate-600">Payment Method</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`p-4 rounded-2xl flex flex-col items-center space-y-2 border-2 transition-all ${paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                      >
                        <Banknote className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-wider">Cash on Delivery</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('GCASH')}
                        className={`p-4 rounded-2xl flex flex-col items-center space-y-2 border-2 transition-all ${paymentMethod === 'GCASH' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                      >
                        <Smartphone className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-wider">GCash</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'GCASH' && (
                    <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Pay via GCash</p>
                          <p className="text-xs text-slate-500 font-medium">Send <span className="font-black text-blue-600">₱{(quantity * 30).toFixed(2)}</span> to <span className="font-black">0917 123 4567</span> (Water Market)</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">GCash Reference Number</label>
                        <div className="relative">
                          <Receipt className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            value={gcashReference}
                            onChange={(e) => setGcashReference(e.target.value)}
                            placeholder="e.g., 1234567890123"
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Upload GCash Receipt</label>
                        {gcashReceipt ? (
                          <div className="relative">
                            <img src={gcashReceipt} alt="Receipt" className="w-full rounded-2xl max-h-64 object-contain bg-white border border-slate-200" />
                            <button 
                              type="button"
                              onClick={() => setGcashReceipt(null)}
                              className="absolute top-3 right-3 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-700 shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="block cursor-pointer">
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 bg-white hover:bg-blue-50 transition-colors flex flex-col items-center space-y-2">
                              <Upload className="w-8 h-8 text-blue-400" />
                              <p className="text-sm font-bold text-slate-700">Click to upload receipt</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PNG, JPG (max 5MB)</p>
                            </div>
                          </label>
                        )}
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 font-semibold">Your order will be in "Verifying" status until admin confirms your GCash payment.</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <p className="text-sm text-rose-700 font-bold">{error}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between bg-slate-900 p-8 rounded-3xl text-white overflow-hidden relative">
                  <div className="relative z-10">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Payment</p>
                    <p className="text-4xl font-black">₱{(quantity * 30).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={placeOrder}
                    disabled={isOrdering}
                    className="relative z-10 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/30 active:scale-95 flex items-center space-x-3 disabled:opacity-50"
                  >
                    {isOrdering ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ShoppingBag className="w-6 h-6" />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-8">Order History</h2>
              <div className="bg-white rounded-[2.5rem] card-shadow border border-slate-100 overflow-hidden">
                {myOrders.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold">No orders yet</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {myOrders.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5 font-bold text-slate-900">{item.id}</td>
                          <td className="px-6 py-5 text-sm font-medium text-slate-500">{item.date}</td>
                          <td className="px-6 py-5">
                            <span className={`text-xs font-black uppercase ${item.payment === 'GCASH' ? 'text-blue-500' : 'text-emerald-500'}`}>{item.payment}</span>
                          </td>
                          <td className="px-6 py-5 font-black text-slate-900">₱{item.total.toFixed(2)}</td>
                          <td className="px-6 py-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar / Active Tracking */}
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-8">Active Order</h2>
              {activeOrder ? (
                <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100 text-center">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${
                    activeOrder.status === 'verifying' ? 'bg-orange-50 text-orange-600' :
                    activeOrder.status === 'out for delivery' ? 'bg-purple-50 text-purple-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {activeOrder.status === 'verifying' ? <AlertCircle className="w-10 h-10" /> :
                     activeOrder.status === 'out for delivery' ? <Truck className="w-10 h-10 animate-bounce" /> :
                     <Clock className="w-10 h-10" />}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 capitalize">{activeOrder.status}</h3>
                  <p className="text-slate-400 text-sm font-medium mb-2">Order {activeOrder.id}</p>
                  <p className="text-blue-600 font-black text-lg mb-6">₱{activeOrder.total}</p>

                  {activeOrder.status === 'verifying' && (
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 mb-6">
                      <p className="text-xs text-orange-700 font-bold">Admin is verifying your GCash payment. Please wait.</p>
                    </div>
                  )}
                  
                  <div className="space-y-6 relative text-left">
                    <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-slate-100"></div>
                    
                    <div className="flex items-start space-x-6 relative">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-8 ring-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-bold text-slate-900">Order Placed</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{activeOrder.date}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-6 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ring-8 ring-white ${
                        ['approved', 'out for delivery', 'completed'].includes(activeOrder.status) ? 'bg-emerald-500' : 
                        activeOrder.status === 'verifying' ? 'bg-orange-500' : 'bg-slate-300'
                      }`}>
                        {['approved', 'out for delivery', 'completed'].includes(activeOrder.status) ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-bold text-slate-900">Payment {activeOrder.payment === 'GCASH' ? 'Verification' : 'Processing'}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{activeOrder.paymentStatus}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-6 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ring-8 ring-white ${
                        activeOrder.status === 'out for delivery' ? 'bg-purple-500' :
                        activeOrder.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-bold text-slate-900">Out for Delivery</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{activeOrder.status === 'out for delivery' ? 'On the way' : 'Pending'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] card-shadow border border-slate-100 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplets className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold">No active orders</p>
                  <p className="text-slate-300 text-sm font-medium mt-1">Place an order to track delivery</p>
                </div>
              )}
            </section>

            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white card-shadow relative overflow-hidden">
              <h3 className="text-xl font-black mb-4 relative z-10">Need Help?</h3>
              <p className="text-blue-100 text-sm mb-6 relative z-10 leading-relaxed">
                Contact our support team for any concerns regarding your delivery or water quality.
              </p>
              <button className="bg-white text-blue-600 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all relative z-10">
                Call Station
              </button>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </main>

      {orderComplete && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-8 duration-500 z-50">
          <CheckCircle2 className="w-6 h-6" />
          <div>
            <p className="font-bold tracking-tight">Order placed successfully!</p>
            {paymentMethod === 'GCASH' && <p className="text-xs text-emerald-100">Awaiting admin verification</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
