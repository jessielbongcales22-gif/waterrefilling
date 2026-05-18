import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  contact: string;
  barangay: string;
  role: 'admin' | 'staff' | 'customer';
  createdAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerId?: string;
  type: 'Delivery' | 'Walk-in';
  items: { productId: number; name: string; price: number; quantity: number }[];
  total: number;
  payment: 'CASH' | 'GCASH';
  paymentStatus: 'pending' | 'paid' | 'verifying';
  status: 'pending' | 'verifying' | 'approved' | 'out for delivery' | 'completed' | 'cancelled' | 'rejected';
  barangay: string;
  address?: string;
  gcashReference?: string;
  gcashReceipt?: string; // base64 string
  createdAt: string;
  date: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
}

interface DataContextType {
  users: User[];
  orders: Order[];
  products: Product[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'date'>) => string;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  approveOrder: (id: string) => void;
  rejectOrder: (id: string) => void;
  completeOrder: (id: string) => void;
  markOutForDelivery: (id: string) => void;
  markDelivered: (id: string) => void;
  getStats: (barangayFilter?: string) => {
    todayRevenue: number;
    monthlyRevenue: number;
    pendingOrders: number;
    totalUsers: number;
    walkInSales: number;
    deliveryOrders: number;
    walkInRevenue: number;
    deliveryRevenue: number;
    cashRevenue: number;
    gcashRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'water_market_data_v2';

const initialUsers: User[] = [
  { id: 'u1', name: 'admin', email: 'admin@watermarket.com', password: 'admin123', contact: '09171234567', barangay: 'All', role: 'admin', createdAt: '2025-01-01' },
  { id: 'u2', name: 'staff1', email: 'staff1@watermarket.com', password: 'staff123', contact: '09181234567', barangay: 'Panalaron', role: 'staff', createdAt: '2025-01-01' },
  { id: 'u3', name: 'juan_delacruz', email: 'juan@email.com', password: 'juan123', contact: '09191234567', barangay: 'Maliwanag', role: 'customer', createdAt: '2025-01-01' },
  { id: 'u4', name: 'maria_santos', email: 'maria@email.com', password: 'maria123', contact: '09201234567', barangay: 'Panalaron', role: 'customer', createdAt: '2025-01-01' },
  { id: 'u5', name: 'pedro_reyes', email: 'pedro@email.com', password: 'pedro123', contact: '09211234567', barangay: 'Pob. Lungsodaan', role: 'customer', createdAt: '2025-01-01' },
];

const initialOrders: Order[] = [
  { id: '#o1', customerName: 'juan_delacruz', customerId: 'u3', type: 'Delivery', items: [{ productId: 1, name: 'Purified Water', price: 30, quantity: 3 }], total: 90, payment: 'CASH', paymentStatus: 'paid', status: 'completed', barangay: 'Maliwanag', createdAt: '2026-05-13', date: '5/13/2026' },
  { id: '#o2', customerName: 'maria_santos', customerId: 'u4', type: 'Delivery', items: [{ productId: 1, name: 'Purified Water', price: 30, quantity: 5 }], total: 150, payment: 'GCASH', paymentStatus: 'paid', status: 'completed', barangay: 'Panalaron', gcashReference: '1234567890', createdAt: '2026-05-13', date: '5/13/2026' },
  { id: '#o3', customerName: 'Walk-in Customer', type: 'Walk-in', items: [{ productId: 1, name: 'Purified Water', price: 30, quantity: 4 }], total: 120, payment: 'CASH', paymentStatus: 'paid', status: 'completed', barangay: 'Pob. Lungsodaan', createdAt: '2026-05-14', date: '5/14/2026' },
  { id: '#o4', customerName: 'pedro_reyes', customerId: 'u5', type: 'Delivery', items: [{ productId: 1, name: 'Purified Water', price: 30, quantity: 2 }], total: 60, payment: 'CASH', paymentStatus: 'pending', status: 'out for delivery', barangay: 'Pob. Lungsodaan', createdAt: '2026-05-17', date: '5/17/2026' },
  { id: '#o5', customerName: 'Walk-in Customer', type: 'Walk-in', items: [{ productId: 1, name: 'Purified Water', price: 30, quantity: 6 }], total: 180, payment: 'CASH', paymentStatus: 'paid', status: 'completed', barangay: 'Panalaron', createdAt: '2026-05-18', date: '5/18/2026' },
  { id: '#o6', customerName: 'pedro_reyes', customerId: 'u5', type: 'Delivery', items: [{ productId: 1, name: 'Purified Water', price: 30, quantity: 10 }], total: 300, payment: 'GCASH', paymentStatus: 'verifying', status: 'verifying', barangay: 'Pob. Lungsodaan', gcashReference: '9876543210', createdAt: '2026-05-18', date: '5/18/2026' },
];

const initialProducts: Product[] = [
  { id: 1, name: 'Purified Water', price: 30, stock: 500, category: 'Water', description: 'Refill of purified water' },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.users) setUsers(data.users);
        if (data.orders) setOrders(data.orders);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, orders }));
  }, [users, orders]);

  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: 'u' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'date'>) => {
    const now = new Date();
    const id = '#o' + (orders.length + 1);
    const newOrder: Order = {
      ...order,
      id,
      createdAt: now.toISOString(),
      date: `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`,
    };
    setOrders([newOrder, ...orders]);
    return id;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(orders.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const approveOrder = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'approved', paymentStatus: 'paid' } : o));
  };

  const rejectOrder = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'rejected' } : o));
  };

  const completeOrder = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'completed', paymentStatus: 'paid' } : o));
  };

  const markOutForDelivery = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'out for delivery' } : o));
  };

  const markDelivered = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'completed', paymentStatus: 'paid' } : o));
  };

  const getStats = (barangayFilter?: string) => {
    const filtered = !barangayFilter || barangayFilter === 'All' 
      ? orders 
      : orders.filter(o => o.barangay === barangayFilter);

    const completedOrPaid = filtered.filter(o => o.status === 'completed' || o.paymentStatus === 'paid');
    
    const today = new Date();
    const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const todayOrders = completedOrPaid.filter(o => o.date === todayStr);
    const monthlyOrders = completedOrPaid.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = filtered.filter(o => o.status === 'pending' || o.status === 'verifying').length;
    const walkInOrders = completedOrPaid.filter(o => o.type === 'Walk-in');
    const deliveryOrders = completedOrPaid.filter(o => o.type === 'Delivery');
    const walkInRevenue = walkInOrders.reduce((sum, o) => sum + o.total, 0);
    const deliveryRevenue = deliveryOrders.reduce((sum, o) => sum + o.total, 0);
    const cashRevenue = completedOrPaid.filter(o => o.payment === 'CASH').reduce((sum, o) => sum + o.total, 0);
    const gcashRevenue = completedOrPaid.filter(o => o.payment === 'GCASH').reduce((sum, o) => sum + o.total, 0);

    return {
      todayRevenue,
      monthlyRevenue,
      pendingOrders,
      totalUsers: users.length,
      walkInSales: walkInOrders.length,
      deliveryOrders: deliveryOrders.length,
      walkInRevenue,
      deliveryRevenue,
      cashRevenue,
      gcashRevenue,
      totalOrders: completedOrPaid.length,
      avgOrderValue: completedOrPaid.length > 0 ? Math.round(monthlyRevenue / completedOrPaid.length) : 0,
    };
  };

  return (
    <DataContext.Provider value={{
      users, orders, products,
      addUser, updateUser, deleteUser,
      addOrder, updateOrder, deleteOrder,
      approveOrder, rejectOrder, completeOrder,
      markOutForDelivery, markDelivered,
      getStats,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
