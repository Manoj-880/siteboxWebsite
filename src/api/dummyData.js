/**
 * Dummy data for mock API – no real network calls.
 * Match shape expected by the app (same as real API responses).
 */

export const dummyUser = {
  id: 1,
  username: 'thrinadh',
  first_name: 'Thrinadh',
  last_name: 'K',
  email: 'thrinadh@gmail.com',
  mobile: '7730855454',
  address: '123 Admin Street, Chennai, Tamil Nadu 600001',
  profile_image: null,
  role_name: 'Super Admin',
  user_role_id: 1,
  is_active: 1,
};

export const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC9.dummy.mock';

export const dummyCompanies = [
  {
    id: 1,
    company_name: 'walle',
    created_at: '2026-01-15T10:00:00.000Z',
    logo: null,
    username: 'admin1',
    is_active: 1,
    established_year: 2018,
    description: 'Walle is a leading interior design and construction company.',
    address: '123 Main Street, Chennai, Tamil Nadu 600001',
    company_mail: 'contact@walle.com',
    mobile: '9876543210',
    website_link: 'https://walle.com',
    reg_no: 'REG001',
    admin_email: 'admin1@walle.com',
    admin_mobile: '9876543210',
  },
  {
    id: 2,
    company_name: 'tvs',
    created_at: '2026-01-10T10:00:00.000Z',
    logo: null,
    username: 'admin2',
    is_active: 1,
    established_year: 2015,
    description: 'TVS Interiors specializes in residential and commercial projects.',
    address: '456 Park Avenue, Bangalore, Karnataka 560001',
    company_mail: 'info@tvsinteriors.com',
    mobile: '8765432109',
    website_link: 'https://tvsinteriors.com',
    reg_no: 'REG002',
    admin_email: 'admin2@tvs.com',
    admin_mobile: '8765432109',
  },
  {
    id: 3,
    company_name: 'SM Interiors',
    created_at: '2025-12-20T10:00:00.000Z',
    logo: null,
    username: 'sminteriors_admin',
    is_active: 1,
    established_year: 2020,
    description: 'SM Interiors offers end-to-end interior design and execution.',
    address: '789 Design Hub, Hyderabad, Telangana 500001',
    company_mail: 'hello@sminteriors.com',
    mobile: '7654321098',
    website_link: 'https://sminteriors.com',
    reg_no: 'REG003',
    admin_email: 'admin@sminteriors.com',
    admin_mobile: '7654321098',
  },
];

/** Monthly users count API shape: { year, month, monthly_users, cumulative_users }[] */
export const dummyMonthlyUsersCount = [
  { year: 2024, month: 1, monthly_users: 25, cumulative_users: 25 },
  { year: 2024, month: 2, monthly_users: 30, cumulative_users: 55 },
  { year: 2024, month: 3, monthly_users: 18, cumulative_users: 73 },
  { year: 2024, month: 4, monthly_users: 22, cumulative_users: 95 },
  { year: 2025, month: 11, monthly_users: 0, cumulative_users: 95 },
  { year: 2025, month: 12, monthly_users: 1, cumulative_users: 96 },
  { year: 2026, month: 1, monthly_users: 2, cumulative_users: 98 },
];

export const dummyDashboard = {
  total_users: 2,
  total_companies: 3,
  del_req_count: 0,
  reg_req_count: 0,
  users_by_month: [
    { month: '2025-11', count: 0 },
    { month: '2025-12', count: 1 },
    { month: '2026-01', count: 2 },
  ],
  recent_companies: dummyCompanies.slice(0, 5).map((c) => ({
    id: c.id,
    company_name: c.company_name,
    created_at: c.created_at,
    logo: c.logo,
    username: c.username,
  })),
};

export const dummyUnits = [
  { id: 1, measuring_unit: 'kg', created_at: '2026-01-01T00:00:00.000Z' },
  { id: 2, measuring_unit: 'm', created_at: '2026-01-01T00:00:00.000Z' },
  { id: 3, measuring_unit: 'pcs', created_at: '2026-01-01T00:00:00.000Z' },
];

export const dummyRoles = [
  { id: 1, role_name: 'Super Admin' },
  { id: 2, role_name: 'Admin' },
  { id: 3, role_name: 'Supervisor' },
  { id: 4, role_name: 'Designer' },
  { id: 5, role_name: 'Contractor' },
  { id: 6, role_name: 'Vendor' },
];

export const dummyFaqs = [
  { id: 1, order: 1, question: 'How do I create a new company?', answer: 'Go to Companies from the sidebar and click "Add company". Fill in the details and submit.' },
  { id: 2, order: 2, question: 'How can I add measuring units?', answer: 'In the Units page, enter the unit name (e.g. kg, m, pcs) in the form and click "Add unit".' },
  { id: 3, order: 3, question: 'Who can access the Super Admin dashboard?', answer: 'Only users with Super Admin role can access the dashboard, companies, units, and FAQs management.' },
  { id: 4, order: 4, question: 'Can I reorder FAQs?', answer: 'Yes. Drag an FAQ card by the menu icon to change its order. The new order is saved automatically.' },
  { id: 5, order: 5, question: 'How do I contact support?', answer: 'Use the Feedbacks section to send a message, or contact your system administrator.' },
];

export const dummyFeedbacks = [
  { id: 1, user_name: 'admin1', feedback: 'The dashboard is very helpful. Would be great to have export for company list.', remarks: 'Noted for next release' },
  { id: 2, user_name: 'admin2', feedback: 'Units management works well. Please add bulk delete for units.', remarks: 'Under review' },
  { id: 3, user_name: 'sminteriors_admin', feedback: 'Overall experience is good. Need more filters on the companies page.', remarks: 'Planned' },
  { id: 4, user_name: 'thrinadh', feedback: 'FAQs drag-and-drop reorder is smooth. Thanks!', remarks: 'Thank you' },
];

// Admin dashboard (company admin)
export const dummyAdminDashboard = {
  stats: {
    sites: 12,
    material_requests: 8,
    orders: 24,
    staff: 45,
  },
  recent_sites: [
    { id: 1, name: 'Villa Project Alpha', type: 'individual', created_at: '2026-01-28T10:00:00.000Z' },
    { id: 2, name: 'Green Valley Community', type: 'community', created_at: '2026-01-27T14:00:00.000Z' },
    { id: 3, name: 'Apartment Block B', type: 'individual', created_at: '2026-01-26T09:00:00.000Z' },
    { id: 4, name: 'Sunrise Residency', type: 'community', created_at: '2026-01-25T11:00:00.000Z' },
    { id: 5, name: 'Office Interior Phase 1', type: 'individual', created_at: '2026-01-24T16:00:00.000Z' },
  ],
  recent_updates: [
    { id: 1, site_name: 'Villa Project Alpha', supervisor_name: 'Raj Kumar', message: 'Foundation work completed. Moving to framing.', posted_at: '2026-01-29T09:00:00.000Z' },
    { id: 2, site_name: 'Green Valley Community', supervisor_name: 'Priya S', message: 'Electrical rough-in done in Block A.', posted_at: '2026-01-29T08:30:00.000Z' },
    { id: 3, site_name: 'Apartment Block B', supervisor_name: 'Amit Patel', message: 'Material delivery received. Inventory updated.', posted_at: '2026-01-28T17:00:00.000Z' },
    { id: 4, site_name: 'Sunrise Residency', supervisor_name: 'Sneha L', message: 'Painting started in units 101–105.', posted_at: '2026-01-28T14:00:00.000Z' },
  ],
  analytics: {
    overview: {
      total_sites: 12,
      active_sites: 9,
      completed_sites: 3,
      total_users: 45,
      active_users: 39,
      inactive_users: 6,
      total_materials: 240,
      total_material_requests: 86,
      total_orders: 74,
      total_tasks: 210,
      completed_tasks: 128,
      client_payments_received: 1245000,
    },
    users_by_role: [
      { role_name: 'Supervisor', total: 12 },
      { role_name: 'Designer', total: 8 },
      { role_name: 'Contractor', total: 15 },
      { role_name: 'Vendor', total: 10 },
    ],
    users_monthly: [
      { month_key: '2025-09', count: 2 },
      { month_key: '2025-10', count: 4 },
      { month_key: '2025-11', count: 3 },
      { month_key: '2025-12', count: 5 },
      { month_key: '2026-01', count: 6 },
    ],
    sites_monthly: [
      { month_key: '2025-09', count: 1 },
      { month_key: '2025-10', count: 2 },
      { month_key: '2025-11', count: 3 },
      { month_key: '2025-12', count: 2 },
      { month_key: '2026-01', count: 4 },
    ],
    requests_monthly: [
      { month_key: '2025-09', count: 4 },
      { month_key: '2025-10', count: 6 },
      { month_key: '2025-11', count: 8 },
      { month_key: '2025-12', count: 7 },
      { month_key: '2026-01', count: 10 },
    ],
    orders_monthly: [
      { month_key: '2025-09', count: 3 },
      { month_key: '2025-10', count: 5 },
      { month_key: '2025-11', count: 7 },
      { month_key: '2025-12', count: 6 },
      { month_key: '2026-01', count: 9 },
    ],
    attendance_by_role_today: [
      { role_name: 'Supervisor', total: 12, present: 10, absent: 1, unmarked: 1 },
      { role_name: 'Designer', total: 8, present: 6, absent: 1, unmarked: 1 },
      { role_name: 'Contractor', total: 15, present: 11, absent: 2, unmarked: 2 },
      { role_name: 'Vendor', total: 10, present: 8, absent: 1, unmarked: 1 },
    ],
    top_sites_by_tasks: [
      { id: 1, site_name: 'Villa Project Alpha', tasks_count: 36 },
      { id: 2, site_name: 'Green Valley Community', tasks_count: 31 },
      { id: 3, site_name: 'Apartment Block B', tasks_count: 28 },
    ],
  },
};

// Admin payments (members flow like mobile)
export const dummyAdminPayments = {
  financial: { to_pay: '20400.00', to_receive: '40000.00' },
  categories: [
    { id: 'staff', title: 'Staff', icon: 'person', categories: 8, total: 45, amount: '1,40,000', status: 'To Pay' },
    { id: 'contractors', title: 'Contractors', icon: 'construction', categories: 6, total: 28, amount: '2,20,000', status: 'To Pay' },
    { id: 'vendors', title: 'Vendors', icon: 'build', categories: 10, total: 32, amount: '1,85,000', status: 'To Pay' },
    { id: 'clients', title: 'Clients', icon: 'people', categories: 5, total: 128, amount: '20,000', status: 'To Receive' },
  ],
  staff_categories: [
    { id: 1, title: 'Supervisors', members: 12, pendingPayment: '1,40,000' },
    { id: 2, title: 'Designers', members: 8, pendingPayment: '95,000' },
    { id: 3, title: 'Project Managers', members: 5, pendingPayment: '75,000' },
  ],
  contractors_categories: [
    { id: 1, title: 'Carpenters', members: 10, pendingPayment: '1,20,000' },
    { id: 2, title: 'Electricians', members: 8, pendingPayment: '98,000' },
  ],
  vendors_categories: [
    { id: 1, title: 'Plywood', members: 5, pendingPayment: '45,000' },
    { id: 2, title: 'Hardware', members: 7, pendingPayment: '62,000' },
  ],
  members_list: {
    staff: [
      { id: 1, name: 'Raj Kumar', phone: '9876543210', payment: '15,000' },
      { id: 2, name: 'Priya S', phone: '9876543211', payment: '12,500' },
      { id: 3, name: 'Amit Patel', phone: '9876543212', payment: '18,000' },
    ],
    contractors: [
      { id: 1, name: 'Carpenter Co', phone: '9876500001', payment: '45,000' },
      { id: 2, name: 'Spark Electric', phone: '9876500002', payment: '38,000' },
    ],
    vendors: [
      { id: 1, name: 'Plywood World', phone: '9876510001', payment: '22,000' },
      { id: 2, name: 'Hardware Plus', phone: '9876510002', payment: '28,000' },
    ],
  },
};

// Admin supervisor updates (social-style posts: title, description, images, date)
export const dummyAdminUpdates = [
  {
    id: 1,
    title: 'Villa Project Alpha',
    site_name: 'Villa Project Alpha',
    supervisor_name: 'Raj Kumar',
    description: 'Foundation work completed. Moving to framing. All inspections passed.',
    message: 'Foundation work completed. Moving to framing.',
    posted_at: '2026-01-29T09:00:00.000Z',
    images: [
      'https://picsum.photos/seed/site1a/800/500',
      'https://picsum.photos/seed/site1b/800/500',
      'https://picsum.photos/seed/site1c/800/500',
    ],
  },
  {
    id: 2,
    title: 'Green Valley Community',
    site_name: 'Green Valley Community',
    supervisor_name: 'Priya S',
    description: 'Electrical rough-in done in Block A. Conduits and boxes installed.',
    message: 'Electrical rough-in done in Block A.',
    posted_at: '2026-01-29T08:30:00.000Z',
    images: [
      'https://picsum.photos/seed/site2a/800/500',
      'https://picsum.photos/seed/site2b/800/500',
    ],
  },
  {
    id: 3,
    title: 'Apartment Block B',
    site_name: 'Apartment Block B',
    supervisor_name: 'Amit Patel',
    description: 'Material delivery received. Inventory updated. Cement and steel stocked.',
    message: 'Material delivery received. Inventory updated.',
    posted_at: '2026-01-28T17:00:00.000Z',
    images: [
      'https://picsum.photos/seed/site3a/800/500',
    ],
  },
  {
    id: 4,
    title: 'Sunrise Residency',
    site_name: 'Sunrise Residency',
    supervisor_name: 'Sneha L',
    description: 'Painting started in units 101–105. First coat completed.',
    message: 'Painting started in units 101–105.',
    posted_at: '2026-01-28T14:00:00.000Z',
    images: [
      'https://picsum.photos/seed/site4a/800/500',
      'https://picsum.photos/seed/site4b/800/500',
      'https://picsum.photos/seed/site4c/800/500',
      'https://picsum.photos/seed/site4d/800/500',
    ],
  },
  {
    id: 5,
    title: 'Office Interior Phase 1',
    site_name: 'Office Interior Phase 1',
    supervisor_name: 'Vikram M',
    description: 'Site cleared for ceiling work. False ceiling layout marked.',
    message: 'Site cleared for ceiling work.',
    posted_at: '2026-01-28T11:00:00.000Z',
    images: [],
  },
];
