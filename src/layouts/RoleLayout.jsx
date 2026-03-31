import AppLayout from './AppLayout';

/**
 * Shared layout for Admin, Supervisor, Designer, Contractor, Vendor.
 * basePath: e.g. '/admin', '/designer'
 * roleLabel: e.g. 'Admin', 'Designer'
 */
export default function RoleLayout({ basePath, roleLabel }) {
  const navLinks = [
    { to: basePath, end: true, label: 'Dashboard' },
  ];

  return (
    <AppLayout
      navLinks={navLinks}
      basePath={basePath}
      roleLabel={roleLabel}
    />
  );
}
