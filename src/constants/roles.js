/**
 * Role IDs from API (user_role_id)
 * 1: Super Admin, 2: Admin, 3: Supervisor, 4: Designer, 5: Contractor, 6: Vendor
 * 7: Factory, 8: Project Manager, 9: Purchase Team, 10: Accountant, 11: Sales, 12: Office Staff
 */
export const ROLE_IDS = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  SUPERVISOR: 3,
  DESIGNER: 4,
  CONTRACTOR: 5,
  VENDOR: 6,
  FACTORY: 7,
  PROJECT_MANAGER: 8,
  PURCHASE_TEAM: 9,
  ACCOUNTANT: 10,
  SALES: 11,
  OFFICE_STAFF: 12,
};

export const ROLE_PATHS = {
  [ROLE_IDS.SUPER_ADMIN]: '/super-admin',
  [ROLE_IDS.ADMIN]: '/admin',
  [ROLE_IDS.SUPERVISOR]: '/supervisor',
  [ROLE_IDS.DESIGNER]: '/designer',
  [ROLE_IDS.CONTRACTOR]: '/contractor',
  [ROLE_IDS.VENDOR]: '/vendor',
};

export const WEB_BLOCKED_ROLE_IDS = [ROLE_IDS.SUPERVISOR, ROLE_IDS.CONTRACTOR];

export const ROLE_NAMES = {
  [ROLE_IDS.SUPER_ADMIN]: 'Super Admin',
  [ROLE_IDS.ADMIN]: 'Admin',
  [ROLE_IDS.SUPERVISOR]: 'Supervisor',
  [ROLE_IDS.DESIGNER]: 'Designer',
  [ROLE_IDS.CONTRACTOR]: 'Contractor',
  [ROLE_IDS.VENDOR]: 'Vendor',
  [ROLE_IDS.FACTORY]: 'Factory',
  [ROLE_IDS.PROJECT_MANAGER]: 'Project Manager',
  [ROLE_IDS.PURCHASE_TEAM]: 'Purchase Team',
  [ROLE_IDS.ACCOUNTANT]: 'Accountant',
  [ROLE_IDS.SALES]: 'Sales',
  [ROLE_IDS.OFFICE_STAFF]: 'Office Staff',
};

/** Short description of what each role can do (for profile / UX) */
export const ROLE_ACCESS = {
  [ROLE_IDS.SUPER_ADMIN]: [
    'Full system access',
    'Manage all companies and company admins',
    'Manage global materials catalog (shared by all companies)',
    'Manage units (measuring units)',
    'View dashboard and all statistics',
    'Manage your own profile and password',
  ],
  [ROLE_IDS.ADMIN]: [
    'Manage your company',
    'Manage employees, sites, and tasks',
    'View company dashboard and reports',
    'Browse the global materials catalog',
    'Manage your own profile and password',
  ],
  [ROLE_IDS.SUPERVISOR]: [
    'View assigned sites and tasks',
    'Update site status and progress',
    'Manage your own profile and password',
  ],
  [ROLE_IDS.DESIGNER]: [
    'View assigned sites and design tasks',
    'Update design-related site updates',
    'Manage your own profile and password',
  ],
  [ROLE_IDS.CONTRACTOR]: [
    'View assigned sites and contractor tasks',
    'Manage your own profile and password',
  ],
  [ROLE_IDS.VENDOR]: [
    'View assigned site information where applicable',
    'Manage your own profile and password',
  ],
};

export function getRoleAccess(roleId) {
  return ROLE_ACCESS[roleId] ?? ['Manage your own profile and password.'];
}

/**
 * Default path for a role (first screen after login)
 */
export function getDefaultPath(user) {
  const roleId = user?.user_role_id;
  if (roleId == null) return '/login';
  if (WEB_BLOCKED_ROLE_IDS.includes(roleId)) return '/no-web-access';
  return ROLE_PATHS[roleId] ?? '/login';
}

export function isWebAccessBlockedRole(roleId) {
  return WEB_BLOCKED_ROLE_IDS.includes(roleId);
}

/**
 * Check if user has this role (by id or name)
 */
export function hasRole(user, roleIdOrName) {
  if (!user) return false;
  if (typeof roleIdOrName === 'number') return user.user_role_id === roleIdOrName;
  const name = (user.role_name || '').toLowerCase();
  const check = String(roleIdOrName).toLowerCase();
  return name === check || name.replace(/\s/g, '_') === check;
}
