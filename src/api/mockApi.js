/**
 * Mock API – returns dummy data only. No real network calls.
 * Same interface as axiosConfig (authApi, dashboardApi, companiesApi, etc.)
 * Responses match axios shape: { data: { ... } }
 */

import {
  dummyUser,
  dummyToken,
  dummyCompanies,
  dummyDashboard,
  dummyMonthlyUsersCount,
  dummyUnits,
  dummyRoles,
  dummyAdminDashboard,
  dummyAdminPayments,
  dummyAdminUpdates,
} from './dummyData';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const authApi = {
  login: (mobile, password) =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Login successful',
        data: {
          user: { ...dummyUser, mobile: mobile || dummyUser.mobile },
          token: dummyToken,
        },
      },
    })),
  profile: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: { user: { ...dummyUser } },
      },
    })),
  updateProfile: (body) =>
    delay().then(() => {
      if (body.first_name != null) dummyUser.first_name = body.first_name;
      if (body.last_name != null) dummyUser.last_name = body.last_name;
      if (body.email != null) dummyUser.email = body.email;
      if (body.mobile != null) dummyUser.mobile = body.mobile;
      if (body.address != null) dummyUser.address = body.address;
      if (body.profile_image != null) dummyUser.profile_image = body.profile_image;
      return {
        data: { success: true, message: 'Profile updated', data: { user: { ...dummyUser } } },
      };
    }),
  changePassword: (body) =>
    delay().then(() => {
      if (!body?.current_password || !body?.new_password) {
        return Promise.reject({ response: { data: { message: 'Current password and new password are required.' } } });
      }
      return {
        data: { success: true, message: 'Password changed successfully.' },
      };
    }),
};

const companiesApi = {
  getAll: () =>
    delay().then(() => ({
      data: { success: true, data: { companies: [...dummyCompanies] } },
    })),
  getById: (id) =>
    delay().then(() => {
      const company = dummyCompanies.find((c) => c.id === Number(id)) || { ...dummyCompanies[0], id: Number(id) };
      return {
        data: { success: true, data: { company: { ...company } } },
      };
    }),
};

const superAdminApi = {
  createCompany: () =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Company created successfully',
        data: { company: { id: 99, company_name: 'New Company', ...dummyCompanies[0] } },
      },
    })),
  updateCompany: () =>
    delay().then(() => ({
      data: { success: true, message: 'Company updated successfully', data: {} },
    })),
  deleteCompany: () =>
    delay().then(() => ({
      data: { success: true, message: 'Company deleted successfully' },
    })),
  createAdmin: () =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Admin created successfully',
        data: { user: { id: 10, username: 'newadmin', company_id: 1 } },
      },
    })),
  getUnits: () =>
    delay().then(() => ({
      data: { success: true, data: { units: [...dummyUnits] } },
    })),
  createUnit: (body) =>
    delay().then(() => {
      const unit = {
        id: dummyUnits.length + 100,
        measuring_unit: body?.measuring_unit || 'unit',
        created_at: new Date().toISOString(),
      };
      dummyUnits.push(unit);
      return {
        data: {
          success: true,
          message: 'Unit created successfully',
          data: { unit },
        },
      };
    }),
};

const dashboardApi = {
  get: () =>
    delay().then(() => ({
      data: { success: true, data: { ...dummyDashboard } },
    })),
  getMonthlyUsersCount: () =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Monthly users count retrieved successfully',
        data: [...dummyMonthlyUsersCount],
      },
    })),
};

const rolesApi = {
  getAll: () =>
    delay().then(() => ({
      data: { success: true, data: { roles: [...dummyRoles] } },
    })),
};

const adminApi = {
  getDashboard: () =>
    delay().then(() => ({
      data: { success: true, data: { ...dummyAdminDashboard } },
    })),
  getSites: () =>
    delay().then(() => ({
      data: { success: true, data: { sites: [] } },
    })),
  getSiteDetails: (siteId) =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          id: Number(siteId),
          site_name: 'Sample Site',
          client_name: 'Sample Client',
          client_phone: '9876543210',
          address: '123 Main St',
          coordinates: 'https://maps.google.com/?q=12.34,56.78',
          type: 'individual',
          supervisor_name: 'Supervisor One',
          designer_name: 'Designer One',
          community_name: null,
          contractor_count: 2,
        },
      },
    })),
  getCommunities: () =>
    delay().then(() => ({
      data: { success: true, data: { communities: [] } },
    })),
  getSupervisors: () =>
    delay().then(() => ({ data: { success: true, data: [] } })),
  getDesigners: () =>
    delay().then(() => ({ data: { success: true, data: [] } })),
  addSite: () =>
    delay().then(() => ({
      data: { success: true, message: 'Site created', data: { site_detail: {} } },
    })),
  // Payments (web)
  getPaymentsStaff: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          cycles: {
            per_day: { id: 1, interval: 'per_day', start_date: new Date().toISOString().slice(0, 10), end_date: new Date().toISOString().slice(0, 10), status: 'open' },
            per_week: { id: 2, interval: 'per_week', start_date: new Date().toISOString().slice(0, 10), end_date: new Date().toISOString().slice(0, 10), status: 'open' },
            per_month: { id: 3, interval: 'per_month', start_date: new Date().toISOString().slice(0, 10), end_date: new Date().toISOString().slice(0, 10), status: 'open' },
          },
          staff: [
            { user_id: 10, name: 'Supervisor One', mobile: '9000000002', role: 'Supervisor', salary: 1500, payment_cycle: 'per_day', status: 'pending' },
            { user_id: 11, name: 'Designer One', mobile: '9000000003', role: 'Designer', salary: 30000, payment_cycle: 'per_month', status: 'paid', paid_at: new Date().toISOString() },
          ],
        },
      },
    })),
  markAllStaffPaid: () =>
    delay().then(() => ({
      data: { success: true, message: 'Marked all as paid', data: { staff_count: 2, marked_count: 2 } },
    })),
  markStaffPaid: () =>
    delay().then(() => ({
      data: { success: true, message: 'Marked as paid', data: { affected: 1 } },
    })),
  getPaymentsOrders: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          orders: [
            { order_id: 501, site_id: 10, site_name: 'Villa Site A', vendor_name: 'Vendor One', delivered_at: new Date().toISOString(), amount: 12000, status: 'pending' },
            { order_id: 502, site_id: 11, site_name: 'House 12', vendor_name: 'Vendor Two', delivered_at: new Date().toISOString(), amount: 8000, status: 'paid', paid_at: new Date().toISOString() },
          ],
        },
      },
    })),
  markOrderPaid: () =>
    delay().then(() => ({
      data: { success: true, message: 'Order marked as paid', data: { order_id: 501 } },
    })),
  getPaymentsClients: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          clients: [
            { site_id: 10, site_name: 'Villa Site A', client_name: 'Client A', client_phone: '9000000010', budget: 100000, paid: 25000, remaining: 75000 },
          ],
        },
      },
    })),
  addClientTransaction: () =>
    delay().then(() => ({
      data: { success: true, message: 'Transaction added', data: { transaction_id: 1 } },
    })),
  getTransactions: (params) =>
    delay().then(() => {
      const now = new Date().toISOString();
      const all = [
        {
          transaction_id: 3,
          type: 'order',
          ref_id: 501,
          amount: 12000,
          created_at: now,
          order_id: 501,
          order_site_name: 'Villa Site A',
          order_vendor_name: 'Vendor One',
          staff_name: null,
          client_name: null,
          site_name: null,
          staff_role: null,
          staff_mobile: null,
          client_phone: null,
        },
        {
          transaction_id: 2,
          type: 'staff',
          ref_id: 3,
          amount: 1500,
          created_at: now,
          order_id: null,
          order_site_name: null,
          order_vendor_name: null,
          staff_name: 'employee1',
          staff_role: 'Supervisor',
          staff_mobile: '9703522437',
          client_name: null,
          client_phone: null,
          site_name: null,
        },
        {
          transaction_id: 1,
          type: 'client',
          ref_id: 1,
          amount: 1000,
          created_at: now,
          order_id: null,
          order_site_name: null,
          order_vendor_name: null,
          staff_name: null,
          staff_role: null,
          staff_mobile: null,
          client_name: 'John Doe',
          client_phone: '9876543210',
          site_name: 'Plot 1',
        },
      ];

      const typesParam = params?.types ? String(params.types) : '';
      const selectedTypes = typesParam ? typesParam.split(',').map((t) => t.trim()).filter(Boolean) : ['staff', 'client', 'order'];
      const q = params?.q ? String(params.q).toLowerCase() : '';

      const filtered = all.filter((t) => selectedTypes.includes(t.type)).filter((t) => {
        if (!q) return true;
        const haystack = [
          t.staff_name,
          t.staff_role,
          t.client_name,
          t.site_name,
          t.order_id != null ? String(t.order_id) : '',
          t.order_site_name,
          t.order_vendor_name,
          String(t.transaction_id),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });

      return { data: { success: true, data: { transactions: filtered } } };
    }),
  getUpdates: () =>
    delay().then(() => ({
      data: { success: true, data: { updates: [...dummyAdminUpdates] } },
    })),
  getMaterialRequests: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          material_requests: [
            {
              id: 1,
              site_id: 10,
              site_name: 'Villa Site A',
              community_id: null,
              community_name: null,
              requested_by_user_id: 30,
              requested_by_name: 'Supervisor One',
              supervisor: {
                id: 30,
                name: 'Supervisor One',
                mobile: '9000000002',
                email: 'supervisor1@example.com',
              },
              site: {
                id: 10,
                site_name: 'Villa Site A',
                client_name: 'Client A',
                client_phone: '9000000010',
                address: 'Main road',
                coordinates: null,
                budget: '100000',
                status: 'active',
                supervisor_id: 30,
                designer_id: null,
                community_id: null,
                community_name: null,
              },
              status: 'pending',
              created_at: new Date().toISOString(),
              materials_count: 1,
              items: [
                {
                  material_id: 11,
                  material_name: 'Plywood',
                  brand_name: 'Century',
                  thickness_label: '18mm',
                  finishing_name: 'Matte',
                  measuring_unit: 'sqft',
                  quantity_requested: 100,
                  quantity_ordered: 20,
                  quantity_remaining: 80,
                },
              ],
            },
          ],
        },
      },
    })),
  createMaterialRequestOrder: () =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Order created successfully',
        data: { material_request_approved: false },
      },
    })),
  getMaterialRequestOrders: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          orders: [
            {
              id: 501,
              material_request_id: 1,
              site_name: 'Villa Site A',
              vendor_name: 'Vendor One',
              order_status: 'active',
              created_at: new Date().toISOString(),
              items: [
                {
                  id: 1,
                  material_name: 'Plywood',
                  brand_name: 'Century',
                  thickness_label: '18mm',
                  finishing_name: 'Matte',
                  measuring_unit: 'sqft',
                  quantity: 20,
                },
              ],
            },
          ],
        },
      },
    })),
  getTasksWeb: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          tasks: [
            {
              id: 1,
              task_title: 'Electrical check',
              description: 'Verify wiring in living room',
              task_status: 'pending',
              assigned_to_user_id: 41,
              assigned_to_name: 'Supervisor One',
              assigned_to_role: 'Supervisor',
              assigned_by_user_id: 2,
              assigned_by_name: 'Admin User',
              site_id: 10,
              site_name: 'Villa Site A',
              estimated_to_complete: new Date(Date.now() + 86400000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        },
      },
    })),
  createTaskWeb: (body) =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Task created successfully',
        data: {
          task: {
            id: Date.now(),
            task_title: body?.task_title ?? 'Task',
            description: body?.description ?? null,
            task_status: body?.task_status ?? 'pending',
            assigned_to_user_id: Number(body?.assigned_to_user_id ?? 41),
            assigned_to_name: 'Supervisor One',
            assigned_to_role: 'Supervisor',
            assigned_by_user_id: 2,
            assigned_by_name: 'Admin User',
            site_id: Number(body?.site_id ?? 10),
            site_name: 'Villa Site A',
            estimated_to_complete: body?.estimated_to_complete || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      },
    })),
  getUnits: () =>
    delay().then(() => ({
      data: { success: true, data: { units: [...dummyUnits] } },
    })),
  getCategories: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          categories: [
            { id: 1, name: 'Wood' },
            { id: 2, name: 'Cement' },
          ],
        },
      },
    })),
  createCategory: (body) =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Category created successfully',
        data: { category: { id: Date.now(), name: body?.name || 'Category' } },
      },
    })),
  updateCategory: (id, body) =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Category updated successfully',
        data: { category: { id: Number(id), name: body?.name || 'Category' } },
      },
    })),
  getMaterialsByCategory: (categoryId) =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          category: { id: Number(categoryId), name: Number(categoryId) === 1 ? 'Wood' : 'Cement' },
          materials: [
            {
              id: 11,
              category_id: Number(categoryId),
              unit_id: 1,
              material_name: 'Plywood',
              material_description: 'BWR grade',
              record_status: 'active',
              category: { id: Number(categoryId), name: Number(categoryId) === 1 ? 'Wood' : 'Cement' },
              unit: { id: 1, measuring_unit: 'sqft' },
              brands: [{ id: 1, brand: { name: 'Century' } }],
              finishings: [{ id: 1, finishing: { name: 'Matte' } }],
              thicknesses: [{ id: 1, thickness: { label: '18mm', value_mm: 18 } }],
            },
          ],
        },
      },
    })),
  createMaterial: (body) =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Material created successfully',
        data: { material: { id: Date.now(), ...body } },
      },
    })),
  updateMaterial: (id, body) =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Material updated successfully',
        data: { material: { id: Number(id), ...body } },
      },
    })),
  getMaterialSuppliers: (materialId) =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          suppliers: materialId
            ? [{ id: 101, material_id: Number(materialId), supplier_user_id: 41, record_status: 'active' }]
            : [],
        },
      },
    })),
  createMaterialSupplier: (body) =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Materials supplier created successfully',
        data: { supplier: { id: Date.now(), ...body } },
      },
    })),
  deleteMaterialSupplier: () =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Materials supplier deleted successfully',
      },
    })),
  getEmployeesWeb: () =>
    delay().then(() => ({ data: { success: true, data: [{ adminId: 41, username: 'Vendor One', mobile: '9000000001' }] } })),
  addEmployeeWeb: () =>
    delay().then(() => ({
      data: { success: true, message: 'Employee created', data: { user_id: 1 } },
    })),
};

export default { authApi, companiesApi, superAdminApi, dashboardApi, rolesApi, adminApi };
export { authApi, companiesApi, superAdminApi, dashboardApi, rolesApi, adminApi };
