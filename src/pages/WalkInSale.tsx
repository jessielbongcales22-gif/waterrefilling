import { useState } from 'react';
import { 
  ShoppingCart, 
  User as UserIcon, 
  Droplets, 
  Trash2, 
  CheckCircle2, 
  Plus,
  Minus,
  Package,
  Banknote,
  Smartphone,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const BARANGAYS = ['Panalaron', 'Pob. Lungsodaan', 'Maliwanag', 'Caduhaan', 'San Jose', 'Sta. Cruz'];

const WalkInSale = () => {
  const { user } = useAuth();
  const { addOrder, products } = useData();
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'GCASH'>('CASH');
  const [gcashReference, setGcashReference] = useState('');
  const [barangay, setBarangay] = useState(user?.barangay && user.barangay !== 'All' ? user.barangay : 'Panalaron');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const product = products[0];

  const addToCart = () => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: number) => setCart(cart.filter(item => item.id !== id));

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      addOrder({
        customerName: customerName || 'Walk-in Customer',
        type: 'Walk-in',
        items: cart.map(item => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity })),
        total,
        payment: paymentMethod,
        paymentStatus: 'paid',
        status: 'completed',
        barangay,
        gcashReference: paymentMethod === 'GCASH' ? gcashReference : undefined,
      });
      setIsProcessing(false);
      setShowSuccess(true);
      setCart([]);
      setCustomerName('Walk-in Customer');
      setGcashReference('');
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-emerald-600/20 flex items-center justify-between">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black">Walk-in Sale</h2>
          </div>
          <p className="text-emerald-100 font-medium">Quick checkout for in-store customers</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-slate-900">Select Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow group hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  <Droplets className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">₱{product.price}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">per container</p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 mb-1">{product.name}</h4>
                <p className="text-sm text-slate-400 font-medium mb-6">{product.stock} available</p>
              </div>
              <button 
                onClick={addToCart}
                className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold flex items-center justify-center space-x-2 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <span>Checkout</span>
          </h3>
          
          <div className="bg-white rounded-[2.5rem] card-shadow border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer Name</label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              {user?.role === 'admin' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Barangay</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select 
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    >
                      {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="min-h-[150px] flex flex-col justify-center">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">No items added yet</p>
                    <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">Click "Add to Cart"</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex-1">
                          <h5 className="text-sm font-bold text-slate-900">{item.name}</h5>
                          <p className="text-xs text-slate-400 font-bold">₱{item.price} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-blue-600"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-blue-600"><Plus className="w-4 h-4" /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="p-2 text-rose-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="pt-6 border-t border-slate-100 space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setPaymentMethod('CASH')}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center space-x-2 ${paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                      >
                        <Banknote className="w-4 h-4" />
                        <span>Cash</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('GCASH')}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center space-x-2 ${paymentMethod === 'GCASH' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>GCash</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'GCASH' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">GCash Reference Number</label>
                      <input 
                        type="text" 
                        value={gcashReference}
                        onChange={(e) => setGcashReference(e.target.value)}
                        placeholder="1234567890"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total</span>
                    <span className="text-2xl font-black text-slate-900">₱{total.toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Complete Sale</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-8 duration-500 z-50">
          <CheckCircle2 className="w-6 h-6" />
          <span className="font-bold tracking-tight">Sale recorded successfully!</span>
        </div>
      )}
    </div>
  );
};

export default WalkInSale;
