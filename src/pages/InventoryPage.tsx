import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Droplets,
  TrendingUp
} from 'lucide-react';

const InventoryPage = () => {
  const products = [
    { 
      id: 1, 
      name: 'Purified Water', 
      category: 'Water', 
      description: 'Refill of purified water', 
      price: 30, 
      stock: 500, 
      unit: 'containers',
      status: 'In Stock'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Inventory</h2>
          <p className="text-slate-500 font-medium">Manage your products and stock levels</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-slate-100 flex items-center space-x-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{products.length}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Products</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-slate-100 flex items-center space-x-6">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">0</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Low Stock Items</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-slate-100 flex items-center space-x-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">₱15,000</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-[2rem] card-shadow border border-slate-100">
        <div className="relative max-w-md mb-8">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item) => (
            <div key={item.id} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                    <Droplets className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{item.name}</h4>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{item.category}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">{item.description}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-900">₱{item.price}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-bold text-slate-600">{item.stock} {item.unit}</span>
                  </div>
                </div>
                
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: '80%' }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
