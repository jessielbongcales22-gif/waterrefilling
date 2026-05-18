import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

import SidebarLayout from "./layouts/SidebarLayout";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import WalkInSale from "./pages/WalkInSale";
import OrdersPage from "./pages/OrdersPage";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import AuthModal from "./components/AuthModal";
import LoginPage from "./pages/LoginPage";

// Protected Route
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role || "")) {
    return <Navigate to={user.role === "customer" ? "/customer-dashboard" : "/dashboard"} replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/customer-dashboard" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin","staff"]}><SidebarLayout><AdminDashboard /></SidebarLayout></ProtectedRoute>} />
        <Route path="/walk-in" element={<ProtectedRoute allowedRoles={["admin","staff"]}><SidebarLayout><WalkInSale /></SidebarLayout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRoles={["admin","staff"]}><SidebarLayout><OrdersPage /></SidebarLayout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute allowedRoles={["admin","staff"]}><SidebarLayout><InventoryPage /></SidebarLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={["admin"]}><SidebarLayout><ReportsPage /></SidebarLayout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={["admin"]}><SidebarLayout><UsersPage /></SidebarLayout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <DataProvider>
      <Router>
        <AppRoutes />
      </Router>
    </DataProvider>
  </AuthProvider>
);

export default App;
