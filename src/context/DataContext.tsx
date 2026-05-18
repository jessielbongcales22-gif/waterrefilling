import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  contact: string;
  barangay: string;
  role: "admin" | "staff" | "customer";
  createdAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerId?: string;
  type: "Delivery" | "Walk-in";
  items: { productId: number; name: string; price: number; quantity: number }[];
  total: number;
  payment: "CASH" | "GCASH";
  paymentStatus: "pending" | "paid" | "verifying";
  status:
    | "pending"
    | "verifying"
    | "approved"
    | "out for delivery"
    | "completed"
    | "cancelled"
    | "rejected";
  barangay: string;
  address?: string;
  gcashReference?: string;
  gcashReceipt?: string;
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
  addUser: (user: Omit<User, "id" | "createdAt">) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addOrder: (order: Omit<Order, "id" | "createdAt" | "date">) => Promise<string>;
  addWalkInOrder: (order: {
    customerName: string;
    barangay: string;
    address: string;
    paymentMethod: "CASH" | "GCASH";
    items: { productId: number; quantity: number; price: number }[];
  }) => Promise<string | null>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  approveOrder: (id: string) => Promise<void>;
  rejectOrder: (id: string) => Promise<void>;
  completeOrder: (id: string) => Promise<void>;
  markOutForDelivery: (id: string) => Promise<void>;
  markDelivered: (id: string) => Promise<void>;
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

const apiRequest = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.error || "API request failed");
  return data;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const refreshData = async () => {
    try {
      const [usersData, ordersData, productsData] = await Promise.all([
        apiRequest<User[]>("/api/users"),
        apiRequest<Order[]>("/api/orders"),
        apiRequest<Product[]>("/api/products"),
      ]);
      setUsers(usersData);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to load data from backend:", error);
      setUsers([]);
      setOrders([]);
      setProducts([]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // ====== USER CRUD ======
  const addUser = async (user: Omit<User, "id" | "createdAt">) => {
    await apiRequest("/api/users", { method: "POST", body: JSON.stringify(user) });
    await refreshData();
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    await apiRequest(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(updates) });
    await refreshData();
  };

  const deleteUser = async (id: string) => {
    await apiRequest(`/api/users/${id}`, { method: "DELETE" });
    await refreshData();
  };

  // ====== ORDER CRUD ======
  const addOrder = async (order: Omit<Order, "id" | "createdAt" | "date">) => {
    const result = await apiRequest<{ success: boolean; id: string }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
    await refreshData();
    return result.id;
  };

  // ====== WALK-IN ORDER HELPER ======
  const addWalkInOrder = async (order: {
    customerName: string;
    barangay: string;
    address: string;
    paymentMethod: "CASH" | "GCASH";
    items: { productId: number; quantity: number; price: number }[];
  }) => {
    try {
      const result = await apiRequest<{ success: boolean; id: string }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: order.customerName,
          barangay: order.barangay,
          address: order.address,
          payment: order.paymentMethod,
          type: "Walk-in",
          items: order.items,
        }),
      });
      await refreshData();
      return result.id;
    } catch (err) {
      console.error("Failed to add walk-in order:", err);
      return null;
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    await apiRequest(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify(updates) });
    await refreshData();
  };

  const deleteOrder = async (id: string) => {
    await apiRequest(`/api/orders/${id}`, { method: "DELETE" });
    await refreshData();
  };

  // ====== ACTIONS ======
  const approveOrder = async (id: string) => updateOrder(id, { status: "approved", paymentStatus: "paid" });
  const rejectOrder = async (id: string) => updateOrder(id, { status: "rejected" });
  const completeOrder = async (id: string) => updateOrder(id, { status: "completed", paymentStatus: "paid" });
  const markOutForDelivery = async (id: string) => updateOrder(id, { status: "out for delivery" });
  const markDelivered = async (id: string) => updateOrder(id, { status: "completed", paymentStatus: "paid" });

  // ====== STATS ======
  const getStats = (barangayFilter?: string) => {
    const filtered = !barangayFilter || barangayFilter === "All" ? orders : orders.filter((o) => o.barangay === barangayFilter);
    const completedOrPaid = filtered.filter((o) => o.status === "completed" || o.paymentStatus === "paid");

    const today = new Date();
    const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const todayOrders = completedOrPaid.filter((o) => o.date === todayStr);
    const monthlyOrders = completedOrPaid.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const pendingOrders = filtered.filter((o) => o.status === "pending" || o.status === "verifying").length;
    const walkInOrders = completedOrPaid.filter((o) => o.type === "Walk-in");
    const deliveryOrders = completedOrPaid.filter((o) => o.type === "Delivery");
    const walkInRevenue = walkInOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const deliveryRevenue = deliveryOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const cashRevenue = completedOrPaid.filter((o) => o.payment === "CASH").reduce((sum, o) => sum + Number(o.total), 0);
    const gcashRevenue = completedOrPaid.filter((o) => o.payment === "GCASH").reduce((sum, o) => sum + Number(o.total), 0);

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
      avgOrderValue: completedOrPaid.length ? Math.round(monthlyRevenue / completedOrPaid.length) : 0,
    };
  };

  return (
    <DataContext.Provider
      value={{
        users,
        orders,
        products,
        addUser,
        updateUser,
        deleteUser,
        addOrder,
        addWalkInOrder,
        updateOrder,
        deleteOrder,
        approveOrder,
        rejectOrder,
        completeOrder,
        markOutForDelivery,
        markDelivered,
        getStats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
