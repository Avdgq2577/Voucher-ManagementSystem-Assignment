import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { DirectorDashboard } from './pages/DirectorDashboard';
import { AccountsDashboard } from './pages/AccountsDashboard';
import { CreateVoucher } from './pages/CreateVoucher';
import { EditVoucher } from './pages/EditVoucher';
import { VoucherList } from './pages/VoucherList';
import { VoucherDetails } from './pages/VoucherDetails';
import { VoucherPrint } from './pages/VoucherPrint';
import './App.css';

const AppLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role === 'Employee') return <Navigate to="/employee/dashboard" replace />;
  if (user.role === 'Director') return <Navigate to="/director/dashboard" replace />;
  if (user.role === 'Accounts') return <Navigate to="/accounts/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <AppLayout>
              <EmployeeDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/create"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <AppLayout>
              <CreateVoucher />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/vouchers"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <AppLayout>
              <VoucherList
                pageTitle="My Expense Vouchers"
                pageSubtitle="View and track status of all vouchers submitted by you."
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vouchers/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <AppLayout>
              <EditVoucher />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/director/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Director']}>
            <AppLayout>
              <DirectorDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/director/pending"
        element={
          <ProtectedRoute allowedRoles={['Director']}>
            <AppLayout>
              <VoucherList
                initialStatus="Submitted"
                pageTitle="Pending Approval Requests"
                pageSubtitle="Review expense vouchers requiring Director signature authorization."
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/director/vouchers"
        element={
          <ProtectedRoute allowedRoles={['Director']}>
            <AppLayout>
              <VoucherList
                pageTitle="Organization Expense Vouchers"
                pageSubtitle="Audit and monitor all submitted vouchers across departments."
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/accounts/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Accounts']}>
            <AppLayout>
              <AccountsDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts/vouchers"
        element={
          <ProtectedRoute allowedRoles={['Accounts']}>
            <AppLayout>
              <VoucherList
                pageTitle="Accounts Voucher Monitoring"
                pageSubtitle="View all organization expense vouchers for reimbursement processing."
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vouchers/:id"
        element={
          <ProtectedRoute allowedRoles={['Employee', 'Director', 'Accounts']}>
            <AppLayout>
              <VoucherDetails />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vouchers/:id/print"
        element={
          <ProtectedRoute allowedRoles={['Accounts', 'Director', 'Employee']}>
            <VoucherPrint />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
