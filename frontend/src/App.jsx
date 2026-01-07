import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import POS from './pages/POS';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import WarehouseManagement from './pages/WarehouseManagement';
import PurchaseManagement from './pages/PurchaseManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import QuotationManagement from './pages/QuotationManagement';
import SettingsManagement from './pages/SettingsManagement';
import PersonnelManagement from './pages/PersonnelManagement';
import RoleManagement from './pages/RoleManagement';
import SpecialOfferManagement from './pages/SpecialOfferManagement';
import ReportManagement from './pages/ReportManagement';
import AdjustmentManagement from './pages/AdjustmentManagement';
import ZBillManagement from './pages/ZBillManagement';
import MainLayout from './layouts/MainLayout';
import PagePlaceholder from './components/PagePlaceholder';
import {
  Warehouse,
  Truck,
  FileText,
  Coins,
  Undo2,
  ShieldCheck,
  Gift,
  BarChart3,
  Sliders,
  Receipt
} from 'lucide-react';

const queryClient = new QueryClient();

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" />;

  return children;
};

// Quick Page wrappers
const CurrencyPage = () => <PagePlaceholder title="Currencies" icon={Coins} />;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      }} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<PrivateRoute><POS /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute roles={['Admin', 'Manager']}><Dashboard /></PrivateRoute>} />
            <Route path="/inventory" element={<PrivateRoute roles={['Admin', 'Manager']}><ProductManagement /></PrivateRoute>} />
            <Route path="/warehouse" element={<PrivateRoute roles={['Admin']}><WarehouseManagement /></PrivateRoute>} />
            <Route path="/purchases" element={<PrivateRoute roles={['Admin', 'Manager']}><PurchaseManagement /></PrivateRoute>} />
            <Route path="/quotations" element={<PrivateRoute><QuotationManagement /></PrivateRoute>} />
            <Route path="/currencies" element={<PrivateRoute roles={['Admin']}><CurrencyPage /></PrivateRoute>} />
            <Route path="/expenses" element={<PrivateRoute roles={['Admin', 'Manager']}><ExpenseManagement /></PrivateRoute>} />
            <Route path="/roles" element={<PrivateRoute roles={['Admin']}><RoleManagement /></PrivateRoute>} />
            <Route path="/offers" element={<PrivateRoute><SpecialOfferManagement /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><ReportManagement /></PrivateRoute>} />
            <Route path="/adjustments" element={<PrivateRoute><AdjustmentManagement /></PrivateRoute>} />
            <Route path="/z-bill" element={<PrivateRoute><ZBillManagement /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsManagement /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute roles={['Admin']}><PersonnelManagement /></PrivateRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
