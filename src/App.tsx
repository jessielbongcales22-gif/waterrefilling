import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SidebarLayout from './layouts/SidebarLayout';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import WalkInSale from './pages/WalkInSale';
import OrdersPage from './pages/OrdersPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AuthModal from './components/AuthModal';
import { useState } from 'react';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role || '')) {
    return <Navigate to={user.role === 'customer' ? '/customer-dashboard' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        
        {/* Customer Route */}
        <Route 
          path="/customer-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin/Staff Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <SidebarLayout><AdminDashboard /></SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/walk-in" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <SidebarLayout><WalkInSale /></SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <SidebarLayout><OrdersPage /></SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <SidebarLayout><InventoryPage /></SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SidebarLayout><ReportsPage /></SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SidebarLayout><UsersPage /></SidebarLayout>
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

import { DataProvider } from './context/DataContext';

function App() {
  return (
    <Router>
      <DataProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </DataProvider>
    </Router>
  );
}

export default App;
