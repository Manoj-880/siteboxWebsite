import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getDefaultPath, ROLE_IDS } from './constants/roles';
import Login from './pages/Login';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import RoleLayout from './layouts/RoleLayout';
import AdminLayout from './layouts/AdminLayout';
import SupervisorLayout from './layouts/SupervisorLayout';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import Companies from './pages/superadmin/Companies';
import CompanyDetails from './pages/superadmin/CompanyDetails';
import CompanyForm from './pages/superadmin/CompanyForm';
import Admins from './pages/superadmin/Admins';
import Units from './pages/superadmin/Units';
import Profile from './pages/superadmin/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUpdates from './pages/admin/Updates';
import AdminSites from './pages/admin/Sites';
import AdminSiteDetails from './pages/admin/SiteDetails';
import AdminPayments from './pages/admin/Payments';
import AdminStaff from './pages/admin/Staff';
import AdminOrders from './pages/admin/Orders';
import AdminTasks from './pages/admin/Tasks';
import AdminOrderDetails from './pages/admin/OrderDetails';
import AdminMaterials from './pages/admin/Materials';
import SuperAdminMaterials from './pages/superadmin/Materials';
import AdminTransactions from './pages/admin/Transactions';
import AdminAttendance from './pages/admin/Attendance';
import SupervisorDashboard from './pages/supervisor/Dashboard';
import SupervisorTasks from './pages/supervisor/Tasks';
import DesignerDashboard from './pages/designer/Dashboard';
import ContractorDashboard from './pages/contractor/Dashboard';
import VendorDashboard from './pages/vendor/Dashboard';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Redirect "/" to role-specific default path */
function HomeRedirect() {
  const { defaultPath } = useAuth();
  return <Navigate to={defaultPath} replace />;
}

/** Allow only a specific role (by user_role_id); otherwise redirect to default path */
function RoleRoute({ roleId, children }) {
  const { user, defaultPath } = useAuth();
  if (user?.user_role_id !== roleId) return <Navigate to={defaultPath} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<PrivateRoute><HomeRedirect /></PrivateRoute>} />

      {/* Super Admin: user_role_id = 1 */}
      <Route
        path="/super-admin"
        element={
          <PrivateRoute>
            <RoleRoute roleId={ROLE_IDS.SUPER_ADMIN}>
              <SuperAdminLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/new" element={<CompanyForm />} />
        <Route path="companies/:id/edit" element={<CompanyForm />} />
        <Route path="companies/:id" element={<CompanyDetails />} />
        <Route path="admins" element={<Admins />} />
        <Route path="units" element={<Units />} />
        <Route path="materials" element={<SuperAdminMaterials />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin: user_role_id = 2 */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <RoleRoute roleId={ROLE_IDS.ADMIN}>
              <AdminLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="updates" element={<AdminUpdates />} />
        <Route path="sites" element={<AdminSites />} />
        <Route path="sites/:siteId" element={<AdminSiteDetails />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="material-requests" element={<AdminOrders />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="orders/:orderId" element={<AdminOrderDetails />} />
        <Route path="materials" element={<AdminMaterials />} />
      </Route>

      {/* Supervisor: user_role_id = 3 */}
      <Route
        path="/supervisor"
        element={
          <PrivateRoute>
            <RoleRoute roleId={ROLE_IDS.SUPERVISOR}>
              <SupervisorLayout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<SupervisorDashboard />} />
        <Route path="sites" element={<AdminSites />} />
        <Route path="sites/:siteId" element={<AdminSiteDetails />} />
        <Route path="tasks" element={<SupervisorTasks />} />
      </Route>

      {/* Designer: user_role_id = 4 */}
      <Route
        path="/designer"
        element={
          <PrivateRoute>
            <RoleRoute roleId={ROLE_IDS.DESIGNER}>
              <RoleLayout
                basePath="/designer"
                roleLabel="Designer"
                extraNavLinks={[{ to: '/designer/tasks', end: true, label: 'My tasks' }]}
              />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<DesignerDashboard />} />
        <Route path="tasks" element={<SupervisorTasks />} />
      </Route>

      {/* Contractor: user_role_id = 5 */}
      <Route
        path="/contractor"
        element={
          <PrivateRoute>
            <RoleRoute roleId={ROLE_IDS.CONTRACTOR}>
              <RoleLayout basePath="/contractor" roleLabel="Contractor" />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<ContractorDashboard />} />
      </Route>

      {/* Vendor: user_role_id = 6 */}
      <Route
        path="/vendor"
        element={
          <PrivateRoute>
            <RoleRoute roleId={ROLE_IDS.VENDOR}>
              <RoleLayout
                basePath="/vendor"
                roleLabel="Vendor"
                extraNavLinks={[{ to: '/vendor/tasks', end: true, label: 'My tasks' }]}
              />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<VendorDashboard />} />
        <Route path="tasks" element={<SupervisorTasks />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
