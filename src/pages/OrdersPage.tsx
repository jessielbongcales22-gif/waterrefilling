import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Truck,
  ShoppingBag,
  MapPin,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  Receipt,
  CreditCard,
  Package,
  User as UserIcon,
  PackageCheck,
  ThumbsUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData, type Order } from '../context/DataContext';

const OrdersPage = () => {
  const { user } = useAuth();
  const { orders, updateOrder, deleteOrder, approveOrder, rejectOrder, markOutForDelivery, markDelivered } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const isVisibleByRole = user?.role === 'admin' || order.barangay === user?.barangay;
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesType = typeFilter === 'all' || order.type === typeFilter;
      return isVisibleByRole && matchesSearch && matchesStatus && matchesType;
    });
  }, [orders, user, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-600';
      case 'verifying': return 'bg-orange-100 text-orange-600';
      case 'approved': return 'bg-blue-100 text-blue-600';
      case 'out for delivery': return 'bg-purple-100 text-purple-600';
      case 'completed': return 'bg-emerald-100 text-emerald-600';
      case 'cancelled': return 'bg-rose-100 text-rose-600';
      case 'rejected': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteOrder(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleSaveEdit = (updates: Partial<Order>) => {
    if (editOrder) {
      updateOrder(editOrder.id, updates);
      setEditOrder(null);
    }
  };

  const verifyingCount = orders.filter(o => o.status === 'verifying' && (user?.role === 'admin' || o.barangay === user?.barangay)).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Order Management</h2>
          <p className="text-slate-500 font-medium">
            {user?.role === 'admin' ? `${filteredOrders.length} orders found` : `Showing records for Barangay ${user?.barangay}`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {verifyingCount > 0 && (
            <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl flex items-center space-x-2 border border-orange-100">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-bold">{verifyingCount} pending verification</span>
            </div>
          )}
          {user?.barangay && user.role !== 'admin' && (
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl flex items-center space-x-2 border border-blue-100">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-bold">{user.barangay} Branch</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by ID or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 appearance-none focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verifying">Verifying</option>
                <option value="approved">Approved</option>
                <option value="out for delivery">Out for Delivery</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-6 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 appearance-none focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="Delivery">Delivery</option>
                <option value="Walk-in">Walk-in</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Order</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Customer</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Location</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Total</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Payment</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">Status</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="font-bold text-slate-900">{order.id}</div>
                    <div className="text-[10px] font-bold text-slate-400">{order.date}</div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{order.customerName}</span>
                      <div className="flex items-center space-x-1 mt-1">
                        {order.type === 'Delivery' ? (
                          <span className="bg-blue-50 text-blue-500 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center space-x-1 uppercase">
                            <Truck className="w-3 h-3" />
                            <span>Delivery</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-500 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center space-x-1 uppercase">
                            <ShoppingBag className="w-3 h-3" />
                            <span>Walk-in</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold">{order.barangay}</span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="font-black text-slate-900">₱{order.total}</span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${order.payment === 'GCASH' ? 'text-blue-500' : 'text-emerald-500'}`}>{order.payment}</span>
                      <span className="text-[10px] font-bold text-slate-400 lowercase">{order.paymentStatus}</span>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button 
                        onClick={() => setViewOrder(order)}
                        title="View Details"
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditOrder(order)}
                        title="Edit Order"
                        className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all active:scale-95"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Smart workflow button - changes based on status */}
                      {order.status === 'verifying' && (
                        <button 
                          onClick={() => approveOrder(order.id)}
                          title="Approve GCash Payment"
                          className="px-3 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all active:scale-95 flex items-center space-x-1 text-xs font-bold"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'approved') && order.type === 'Delivery' && (
                        <button 
                          onClick={() => markOutForDelivery(order.id)}
                          title="Mark as Out for Delivery"
                          className="px-3 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all active:scale-95 flex items-center space-x-1 text-xs font-bold"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Deliver</span>
                        </button>
                      )}
                      {order.status === 'out for delivery' && (
                        <button 
                          onClick={() => markDelivered(order.id)}
                          title="Mark as Delivered"
                          className="px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center space-x-1 text-xs font-bold"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Delivered</span>
                        </button>
                      )}
                      {order.status === 'pending' && order.type === 'Walk-in' && (
                        <button 
                          onClick={() => markDelivered(order.id)}
                          title="Mark Completed"
                          className="px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center space-x-1 text-xs font-bold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'verifying' || order.status === 'approved') && (
                        <button 
                          onClick={() => rejectOrder(order.id)}
                          title="Reject Order"
                          className="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all active:scale-95"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => setDeleteConfirm(order)}
                        title="Delete Order"
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewOrder(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900">Order Details</h3>
                <p className="text-slate-400 text-sm font-medium">{viewOrder.id} • {viewOrder.date}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(viewOrder.status)}`}>
                  {viewOrder.status}
                </span>
                <span className="text-3xl font-black text-slate-900">₱{viewOrder.total}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</span>
                  </div>
                  <p className="font-bold text-slate-900">{viewOrder.customerName}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Barangay</span>
                  </div>
                  <p className="font-bold text-slate-900">{viewOrder.barangay}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</span>
                  </div>
                  <p className="font-bold text-slate-900">{viewOrder.payment}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                  </div>
                  <p className="font-bold text-slate-900">{viewOrder.type}</p>
                </div>
              </div>

              {viewOrder.address && (
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</span>
                  </div>
                  <p className="font-medium text-slate-700">{viewOrder.address}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-black text-slate-700 mb-3 flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Order Items</span>
                </h4>
                <div className="space-y-2">
                  {viewOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-400 font-bold">₱{item.price} × {item.quantity}</p>
                      </div>
                      <span className="font-black text-slate-900">₱{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {viewOrder.payment === 'GCASH' && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <h4 className="text-sm font-black text-blue-700 mb-3 flex items-center space-x-2">
                    <Receipt className="w-4 h-4" />
                    <span>GCash Payment Details</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Reference Number:</span>
                      <span className="font-black text-slate-900">{viewOrder.gcashReference || 'N/A'}</span>
                    </div>
                    {viewOrder.gcashReceipt && (
                      <div className="mt-3">
                        <p className="text-slate-500 font-bold mb-2">Receipt:</p>
                        <img src={viewOrder.gcashReceipt} alt="Receipt" className="rounded-xl max-h-64 mx-auto border border-blue-200" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Workflow action buttons in view modal */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Actions</p>
                
                {viewOrder.status === 'verifying' && (
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => { approveOrder(viewOrder.id); setViewOrder(null); }}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span>Approve GCash Payment</span>
                    </button>
                    <button 
                      onClick={() => { rejectOrder(viewOrder.id); setViewOrder(null); }}
                      className="flex-1 bg-rose-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-rose-700 transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {(viewOrder.status === 'approved' || viewOrder.status === 'pending') && viewOrder.type === 'Delivery' && (
                  <button 
                    onClick={() => { markOutForDelivery(viewOrder.id); setViewOrder(null); }}
                    className="w-full bg-purple-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-purple-700 transition-all"
                  >
                    <Truck className="w-5 h-5" />
                    <span>Mark as Out for Delivery</span>
                  </button>
                )}

                {viewOrder.status === 'out for delivery' && (
                  <button 
                    onClick={() => { markDelivered(viewOrder.id); setViewOrder(null); }}
                    className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all"
                  >
                    <PackageCheck className="w-5 h-5" />
                    <span>Mark as Delivered</span>
                  </button>
                )}

                {viewOrder.status === 'pending' && viewOrder.type === 'Walk-in' && (
                  <button 
                    onClick={() => { markDelivered(viewOrder.id); setViewOrder(null); }}
                    className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Complete Order</span>
                  </button>
                )}

                {viewOrder.status === 'completed' && (
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-center font-bold flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Order Completed</span>
                  </div>
                )}

                {viewOrder.status === 'rejected' && (
                  <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl text-center font-bold flex items-center justify-center space-x-2">
                    <XCircle className="w-5 h-5" />
                    <span>Order Rejected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOrder && (
        <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)} onSave={handleSaveEdit} />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Delete Order?</h3>
            <p className="text-slate-500 text-center mb-8">Are you sure you want to delete order <span className="font-bold text-slate-900">{deleteConfirm.id}</span>? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditOrderModal = ({ order, onClose, onSave }: { order: Order; onClose: () => void; onSave: (updates: Partial<Order>) => void }) => {
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [address, setAddress] = useState(order.address || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">Edit Order</h3>
            <p className="text-slate-400 text-sm font-medium">{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Order Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Order['status'])} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none">
              <option value="pending">Pending</option>
              <option value="verifying">Verifying</option>
              <option value="approved">Approved</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Payment Status</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as Order['paymentStatus'])} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none">
              <option value="pending">Pending</option>
              <option value="verifying">Verifying</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          {order.type === 'Delivery' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Delivery Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none" />
            </div>
          )}
          <div className="flex space-x-3 pt-4">
            <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200">Cancel</button>
            <button onClick={() => onSave({ status, paymentStatus, address })} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
