import AppLayout from './AppLayout';

const SUPERVISOR_NAV = [
  { to: '/supervisor', end: true, label: 'Dashboard' },
  { to: '/supervisor/sites', end: false, label: 'Sites' },
  { to: '/supervisor/tasks', end: true, label: 'My tasks' },
];

export default function SupervisorLayout() {
  return (
    <AppLayout
      navLinks={SUPERVISOR_NAV}
      basePath="/supervisor"
      roleLabel="Supervisor"
    />
  );
}
