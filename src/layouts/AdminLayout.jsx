import AppLayout from './AppLayout';

const ADMIN_NAV = [
  { to: '/admin', end: true, label: 'Dashboard' },
  { to: '/admin/sites', end: true, label: 'Sites' },
  { to: '/admin/staff', end: true, label: 'Staff' },
  { to: '/admin/materials', end: true, label: 'Materials' },
  { to: '/admin/material-requests', end: true, label: 'Material Requests' },
  { to: '/admin/orders', end: true, label: 'Orders' },
  { to: '/admin/tasks', end: true, label: 'Tasks' },
  { to: '/admin/payments', end: true, label: 'Payments' },
  { to: '/admin/transactions', end: true, label: 'Transactions' },
  { to: '/admin/updates', end: true, label: 'Updates' },
];

export default function AdminLayout() {
  return (
    <AppLayout
      navLinks={ADMIN_NAV}
      basePath="/admin"
      roleLabel="Admin"
    />
  );
}
