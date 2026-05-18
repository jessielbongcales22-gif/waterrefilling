import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Edit2, 
  Shield, 
  User as UserIcon,
  ShoppingBag,
  Plus,
  Trash2,
  X,
  Mail,
  Phone,
  MapPin,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useData, type User } from '../context/DataContext';

const BARANGAYS = ['All', 'Panalaron', 'Pob. Lungsodaan', 'Maliwanag', 'Caduhaan', 'San Jose', 'Sta. Cruz'];

const UsersPage = () => {
  const { users, orders, addUser, updateUser, deleteUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const customerCount = users.filter(u => u.role === 'customer').length;

  const getUserOrders = (userId: string) => orders.filter(o => o.customerId === userId);
  const getUserTotalSpent = (userId: string) => getUserOrders(userId).filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Users</h2>
          <p className="text-slate-500 font-medium">Manage administrators, staff, and customers</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-slate-100 flex items-center space-x-6">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500"><Shield className="w-8 h-8" /></div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{adminCount}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Admins</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-slate-100 flex items-center space-x-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><UserIcon className="w-8 h-8" /></div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{staffCount}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Staff</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-slate-100 flex items-center space-x-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><ShoppingBag className="w-8 h-8" /></div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{customerCount}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Customers</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 appearance-none focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">User</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Contact</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Barangay</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Role</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">Orders</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">Total Spent</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                        u.role === 'admin' ? 'bg-rose-500' : u.role === 'staff' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] font-bold text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-sm font-medium text-slate-600">{u.contact}</td>
                  <td className="py-5 px-4">
                    <div className="flex items-center space-x-1 text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold">{u.barangay}</span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-rose-50 text-rose-500' : 
                      u.role === 'staff' ? 'bg-blue-50 text-blue-500' : 
                      'bg-emerald-50 text-emerald-500'
                    }`}>{u.role}</span>
                  </td>
                  <td className="py-5 px-4 text-center text-sm font-bold text-slate-700">{getUserOrders(u.id).length}</td>
                  <td className="py-5 px-4 text-center text-sm font-black text-slate-900">₱{getUserTotalSpent(u.id)}</td>
                  <td className="py-5 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => setEditUser(u)}
                        title="Edit User"
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => setDeleteConfirm(u)}
                          title="Delete User"
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editUser) && (
        <UserFormModal 
          user={editUser} 
          onClose={() => { setShowAddModal(false); setEditUser(null); }} 
          onSave={(data) => {
            if (editUser) {
              updateUser(editUser.id, data);
            } else {
              addUser(data);
            }
            setShowAddModal(false);
            setEditUser(null);
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Delete User?</h3>
            <p className="text-slate-500 text-center mb-8">Are you sure you want to delete <span className="font-bold text-slate-900">{deleteConfirm.name}</span>? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={() => { deleteUser(deleteConfirm.id); setDeleteConfirm(null); }} className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserFormModal = ({ user, onClose, onSave }: { user: User | null; onClose: () => void; onSave: (data: any) => void }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(user?.password || '');
  const [contact, setContact] = useState(user?.contact || '');
  const [barangay, setBarangay] = useState(user?.barangay || 'Panalaron');
  const [role, setRole] = useState<'admin' | 'staff' | 'customer'>(user?.role || 'customer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, password, contact, barangay, role });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-md max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-xl font-black text-slate-900">{user ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Contact Number</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="tel" value={contact} onChange={(e) => setContact(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none">
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Barangay</label>
            <select value={barangay} onChange={(e) => setBarangay(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none">
              {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700">{user ? 'Save Changes' : 'Add User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersPage;
