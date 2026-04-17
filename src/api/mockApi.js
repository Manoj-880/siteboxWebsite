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

function buildMockMaterialsCatalogData() {
  return [
    {
      id: 11,
      unit_id: 1,
      unit: { id: 1, measuring_unit: 'sqft' },
      material_name: 'Plywood',
      image_url: null,
      image_path: null,
      brands: [
        {
          id: 1,
          brand_name: 'Century',
          brand_image_url: null,
          brand_image: null,
          thickness_links: [
            {
              id: 1,
              thickness_code: 'PLY-CEN-18',
              thickness: { id: 1, label: '18mm', value_mm: 18 },
            },
          ],
        },
      ],
    },
  ];
}

function filterMaterialsByQuery(materials, q) {
  const s = String(q || '').trim().toLowerCase();
  if (!s) return materials;
  return materials.filter((m) => {
    if (String(m.material_name || '').toLowerCase().includes(s)) return true;
    return (m.brands || []).some((b) => {
      if (String(b.brand_name || '').toLowerCase().includes(s)) return true;
      return (b.thickness_links || []).some(
        (l) =>
          String(l.thickness_code || '').toLowerCase().includes(s) ||
          String(l.thickness?.label || '').toLowerCase().includes(s)
      );
    });
  });
}

/** Match server: with `q`, hide non-matching brands unless the material name matches `q`. */
function narrowMaterialCatalogForSearchQuery(material, query) {
  const q = String(query ?? '').trim();
  if (!q) return material;
  const ql = q.toLowerCase();
  const matName = String(material.material_name ?? '').toLowerCase();
  if (matName.includes(ql)) return material;

  const brands = (material.brands || [])
    .map((b) => {
      const brandNameHit = String(b.brand_name ?? '').toLowerCase().includes(ql);
      const allLinks = b.thickness_links || [];
      const links = brandNameHit
        ? allLinks
        : allLinks.filter((l) => {
            const code = String(l.thickness_code ?? '').toLowerCase();
            const lab = String(l.thickness?.label ?? '').toLowerCase();
            return code.includes(ql) || lab.includes(ql);
          });
      if (!brandNameHit && links.length === 0) return null;
      return { ...b, thickness_links: links };
    })
    .filter(Boolean);

  return { ...material, brands };
}

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
  getCompanyOnboardingRequests: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          requests: [
            {
              id: 1,
              company_name: 'Aurum Interiors',
              contact_person: 'Neha Rao',
              email: 'neha@auruminteriors.com',
              mobile: '9876543210',
              city: 'Hyderabad',
              address: 'Banjara Hills, Hyderabad',
              employee_count: 24,
              notes: 'Looking for multi-project rollout and vendor tracking.',
              request_status: 'pending',
              created_at: new Date().toISOString(),
            },
          ],
        },
      },
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
  uploadCatalogAsset: () =>
    delay().then(() => ({
      data: { success: true, data: { path: 'catalog/assets/mock.png' } },
    })),
  getMaterialsCatalog: (_adminId, params = {}) =>
    delay().then(() => {
      const q = String(params?.q || '').trim();
      const filtered = filterMaterialsByQuery(buildMockMaterialsCatalogData(), q);
      const materials = q
        ? filtered.map((m) => narrowMaterialCatalogForSearchQuery(m, q))
        : filtered;
      return { data: { success: true, data: { materials } } };
    }),
  createMaterialCatalog: (body) =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Material created successfully',
        data: {
          material: {
            id: Date.now(),
            unit_id: body?.unit_id,
            unit: { id: body?.unit_id, measuring_unit: 'unit' },
            material_name: body?.material_name,
            image_url: null,
            brands: body?.brands || [],
          },
        },
      },
    })),
  updateMaterialCatalog: (id, body) =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Material updated successfully',
        data: { material: { id: Number(id), ...body } },
      },
    })),
  deleteMaterialCatalog: () =>
    delay().then(() => ({
      data: { success: true, message: 'Material deleted successfully' },
    })),
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
            {
              id: 2,
              task_title: 'Paint touch-up',
              description: null,
              task_status: 'completed',
              completion_report: 'Touched up living room corners.',
              completion_image_urls: [],
              assigned_to_user_id: 41,
              assigned_to_name: 'Supervisor One',
              assigned_to_role: 'Supervisor',
              assigned_by_user_id: 2,
              assigned_by_name: 'Admin User',
              site_id: 10,
              site_name: 'Villa Site A',
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
            task_status: 'pending',
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
  getMaterials: (_adminId, params = {}) =>
    delay().then(() => {
      const q = String(params?.q || '').trim();
      const filtered = filterMaterialsByQuery(buildMockMaterialsCatalogData(), q);
      const materials = q
        ? filtered.map((m) => narrowMaterialCatalogForSearchQuery(m, q))
        : filtered;
      return {
        data: {
          success: true,
          data: { materials },
        },
      };
    }),
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
  getAttendanceWeb: (params) =>
    delay().then(() => {
      const date =
        params?.date ||
        new Date().toISOString().slice(0, 10);
      const days = Math.min(30, Math.max(1, Number(params?.days) || 7));
      const trend = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(date);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        trend.push({
          date: ds,
          total: 12,
          present: 8 + (i % 3),
          absent: 1,
          unmarked: 3 - (i % 3),
        });
      }
      return {
        data: {
          success: true,
          data: {
            selected_date: date,
            trend_days: days,
            overall: { total: 12, present: 9, absent: 1, unmarked: 2 },
            by_role: [
              {
                user_role_id: 3,
                role_name: 'Supervisor',
                total: 4,
                present: 3,
                absent: 0,
                unmarked: 1,
              },
              {
                user_role_id: 4,
                role_name: 'Designer',
                total: 3,
                present: 2,
                absent: 1,
                unmarked: 0,
              },
              {
                user_role_id: 6,
                role_name: 'Vendor',
                total: 5,
                present: 4,
                absent: 0,
                unmarked: 1,
              },
            ],
            employees: [
              {
                user_id: 101,
                username: 'Supervisor One',
                email: 's1@example.com',
                mobile: '9000000001',
                user_role_id: 3,
                role_name: 'Supervisor',
                attendance_status: 'present',
              },
              {
                user_id: 102,
                username: 'Designer One',
                email: null,
                mobile: '9000000002',
                user_role_id: 4,
                role_name: 'Designer',
                attendance_status: 'absent',
              },
            ],
            trend,
          },
        },
      };
    }),
  addEmployeeWeb: () =>
    delay().then(() => ({
      data: { success: true, message: 'Employee created', data: { user_id: 1 } },
    })),
};

const myTasksApi = {
  getMyTasks: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          tasks: [
            {
              id: 1,
              task_title: 'Site inspection',
              description: 'Check safety signage',
              task_status: 'pending',
              site_id: 10,
              site_name: 'Villa Site A',
              community_name: 'Green Meadows',
              assigned_to_user_id: 41,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 2,
              task_title: 'Material verification',
              task_status: 'completed',
              completion_report: 'Verified stock against PO.',
              completion_image_urls: [],
              site_id: 10,
              site_name: 'Villa Site A',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        },
      },
    })),
  completeTask: (taskId) =>
    delay().then(() => ({
      data: {
        success: true,
        message: 'Task marked as completed',
        data: {
          task: {
            id: Number(taskId),
            task_status: 'completed',
            completion_report: 'Done (mock).',
            completion_image_urls: [],
          },
        },
      },
    })),
};

const designerApi = {
  getDashboard: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          attendance_status: null,
          sites: { total: 2 },
          tasks: { total: 2 },
          recent_updates: [
            {
              id: 2001,
              site_id: 10,
              site_name: 'Villa Site A',
              update_description: 'Need revised false-ceiling alignment in living room.',
              updated_by_name: 'Supervisor One',
              update_status: 'review',
            },
          ],
        },
      },
    })),
  getSites: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          individualSites: [
            { id: 10, site_name: 'Villa Site A', client_name: 'Client A', address: 'Road 1, City', status: 'active' },
            { id: 11, site_name: 'House 12', client_name: 'Client B', address: 'Road 2, City', status: 'active' },
          ],
        },
      },
    })),
  getSiteDetails: (siteId) =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          site_detail: {
            id: Number(siteId),
            site_name: Number(siteId) === 11 ? 'House 12' : 'Villa Site A',
            client_name: Number(siteId) === 11 ? 'Client B' : 'Client A',
            address: 'Sample address',
            status: 'active',
          },
          site_files: [
            {
              id: 1,
              file_name: 'design-v1.pdf',
              file_url: 'https://example.com/design-v1.pdf',
              created_at: new Date().toISOString(),
            },
          ],
          site_updates: [
            {
              id: 2001,
              update_description: 'Need revised false-ceiling alignment in living room.',
              update_status: 'review',
              updated_by_name: 'Supervisor One',
              review_remarks: null,
              files: [],
            },
          ],
        },
      },
    })),
  reviewSiteUpdate: () =>
    delay().then(() => ({
      data: { success: true, message: 'Update reviewed successfully' },
    })),
  createTaskForSupervisor: () =>
    delay().then(() => ({
      data: { success: true, message: 'Task created successfully' },
    })),
  addFilesToSite: () =>
    delay().then(() => ({
      data: { success: true, message: 'Files uploaded successfully' },
    })),
};

const vendorApi = {
  getDashboard: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          attendance_status: null,
          sites: { total: 2 },
          tasks: { total: 2 },
          orders: { total: 2 },
          recent_orders: [
            { id: 501, site_name: 'Villa Site A', order_status: 'created', amount: 12000 },
            { id: 502, site_name: 'House 12', order_status: 'taken', amount: 8000 },
          ],
        },
      },
    })),
  getSites: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          individualSites: [
            { id: 10, site_name: 'Villa Site A', client_name: 'Client A', address: 'Road 1, City', status: 'active' },
            { id: 11, site_name: 'House 12', client_name: 'Client B', address: 'Road 2, City', status: 'active' },
          ],
        },
      },
    })),
  getSiteDetails: (siteId) =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          site_detail: { id: Number(siteId), site_name: 'Villa Site A', client_name: 'Client A' },
          orders: [
            {
              id: 501,
              site_name: 'Villa Site A',
              order_status: 'created',
              amount: 12000,
              items: [{ id: 1, material_name: 'Plywood', quantity: 10, measuring_unit: 'sqft' }],
            },
          ],
        },
      },
    })),
  getOrders: () =>
    delay().then(() => ({
      data: {
        success: true,
        data: {
          orders: [
            {
              id: 501,
              site_name: 'Villa Site A',
              order_status: 'created',
              amount: 12000,
              items: [{ id: 1, material_name: 'Plywood', quantity: 10, measuring_unit: 'sqft' }],
            },
            {
              id: 502,
              site_name: 'House 12',
              order_status: 'taken',
              amount: 8000,
              items: [{ id: 2, material_name: 'Laminate', quantity: 25, measuring_unit: 'sqft', unit_price: 120 }],
            },
          ],
        },
      },
    })),
  markOrderTaken: () =>
    delay().then(() => ({
      data: { success: true, message: 'Order marked taken' },
    })),
  markOrderDispatched: () =>
    delay().then(() => ({
      data: { success: true, message: 'Order marked dispatched' },
    })),
};

const attendanceApi = {
  mark: () =>
    delay().then(() => ({
      data: { success: true, message: 'Attendance marked successfully' },
    })),
};

export default {
  authApi,
  companiesApi,
  superAdminApi,
  dashboardApi,
  rolesApi,
  adminApi,
  myTasksApi,
  designerApi,
  vendorApi,
  attendanceApi,
};
export {
  authApi,
  companiesApi,
  superAdminApi,
  dashboardApi,
  rolesApi,
  adminApi,
  myTasksApi,
  designerApi,
  vendorApi,
  attendanceApi,
};
