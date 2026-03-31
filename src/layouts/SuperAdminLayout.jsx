import AppLayout from './AppLayout';

export default function SuperAdminLayout() {
  const navLinks = [
    { to: '/super-admin', end: true, label: 'Dashboard' },
    { to: '/super-admin/companies', end: false, label: 'Companies' },
    { to: '/super-admin/units', end: false, label: 'Units' },
    { to: '/super-admin/profile', end: true, label: 'Profile' },
  ];

  return (
    <AppLayout
      navLinks={navLinks}
      basePath="/super-admin"
      roleLabel="Super Admin"
    />
  );
}
