import AppLayout from './AppLayout';

/**
 * Shared layout for Admin, Supervisor, Designer, Contractor, Vendor.
 * basePath: e.g. '/admin', '/designer'
 * roleLabel: e.g. 'Admin', 'Designer'
 * extraNavLinks: optional items after Dashboard (e.g. My tasks for Designer/Vendor)
 */
export default function RoleLayout({ basePath, roleLabel, extraNavLinks = [] }) {
  const navLinks = [
    { to: basePath, end: true, label: 'Dashboard' },
    ...extraNavLinks,
  ];

  return (
    <AppLayout
      navLinks={navLinks}
      basePath={basePath}
      roleLabel={roleLabel}
    />
  );
}
