/**
 * API layer: uses MOCK (dummy data) by default – no real network calls.
 * Set VITE_USE_MOCK_API=false in .env to use the real API.
 * Auth (login, profile, change password) always uses the real API.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

// Real API (axios) – used only when VITE_USE_MOCK_API=false
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.1.15:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sitex_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sitex_token');
      localStorage.removeItem('sitex_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Mock API – dummy data, no network
import {
  authApi as mockAuthApi,
  companiesApi as mockCompaniesApi,
  superAdminApi as mockSuperAdminApi,
  dashboardApi as mockDashboardApi,
  rolesApi as mockRolesApi,
  adminApi as mockAdminApi,
  myTasksApi as mockMyTasksApi,
} from './mockApi';

// Real API handlers
const realAuthApi = {
  login: (mobile, password) => api.post('/auth/login', { mobile, password }),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

const realCompaniesApi = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
};

const realSuperAdminApi = {
  createCompany: (formData) =>
    api.post('/companies', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCompany: (id, formData) =>
    api.put(`/companies/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCompany: (id) => api.delete(`/companies/${id}`),
  createAdmin: (data) => api.post('/admin/create', data),
  getUnits: () => api.get('/web/super-admin/get-units'),
  createUnit: (data) => api.post('/web/super-admin/add-units', data),
  uploadCatalogAsset: (formData) =>
    api.post('/web/super-admin/upload-catalog-asset', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMaterialsCatalog: (adminId, params = {}) =>
    api.get('/admin/materials', {
      params: { admin_id: adminId, ...params },
    }),
  createMaterialCatalog: (body) => api.post('/admin/materials', body),
  updateMaterialCatalog: (materialId, body) => api.put(`/admin/materials/${materialId}`, body),
  deleteMaterialCatalog: (materialId, adminId) =>
    api.delete(`/admin/materials/${materialId}`, { params: { admin_id: adminId } }),
  getTemporaryMaterials: (adminId, params = {}) =>
    api.get('/admin/materials/temporary', { params: { admin_id: adminId, ...params } }),
  approveTemporaryMaterial: (submissionId, adminId, body) =>
    api.put(`/admin/materials/temporary/${submissionId}/approve`, { admin_id: adminId, ...body }),
};

const realDashboardApi = {
  get: () => api.get('/dashboard'),
  getMonthlyUsersCount: () => api.get('/web/super-admin/get-monthly-users-count'),
  getDashboardData: () => api.get('/web/super-admin/dashboard-data'),
};

const realRolesApi = {
  getAll: () => api.get('/roles'),
};

const realAdminApi = {
  getDashboard: () => api.get('/admin/dashboard/web'),
  getSites: () => api.get('/admin/sites/web'),
  getSiteDetails: (siteId) => api.get(`/admin/sites/web/${siteId}`),
  getUnits: (adminId) => api.get('/admin/units', { params: { admin_id: adminId } }),
  getMaterials: (adminId, params = {}) =>
    api.get('/admin/materials', { params: { admin_id: adminId, ...params } }),
  getMaterialRequests: () => api.get('/admin/material-requests'),
  getMaterialRequestOrders: () => api.get('/admin/material-request-orders'),
  createMaterialRequestOrder: (requestId, body) => api.post(`/admin/material-requests/${requestId}/orders`, body),
  getTemporaryMaterials: (params = {}) => api.get('/admin/materials/temporary', { params }),
  submitTemporaryMaterial: (body) => api.post('/admin/materials/temporary', body),
  getMaterialSuppliers: (materialId, adminId) =>
    api.get('/admin/materials-suppliers', {
      params: {
        admin_id: adminId,
        ...(materialId != null ? { material_id: materialId } : {}),
      },
    }),
  createMaterialSupplier: (body) => api.post('/admin/materials-suppliers', body),
  deleteMaterialSupplier: (materialSupplierId, adminId) =>
    api.delete(`/admin/materials-suppliers/${materialSupplierId}`, { params: { admin_id: adminId } }),
  getCommunities: (companyId) => api.get('/admin/communities', { params: { company_id: companyId } }),
  getSupervisors: (companyId) => api.get('/admin/supervisors', { params: { company_id: companyId } }),
  getDesigners: (companyId) => api.get('/admin/designers', { params: { company_id: companyId } }),
  getContractors: (companyId) => api.get('/admin/get-user-by-company-id', { params: { company_id: companyId, role_id: 5 } }),
  getSiteContractors: (siteId, adminId) =>
    api.get('/admin/site-contractors', { params: { site_id: siteId, admin_id: adminId } }),
  addSiteContractor: (body, adminId) =>
    api.post('/admin/site-contractors', body, { params: adminId != null ? { admin_id: adminId } : {} }),
  removeSiteContractor: (siteContractorId, adminId) =>
    api.delete(`/admin/site-contractors/${siteContractorId}`, { params: adminId != null ? { admin_id: adminId } : {} }),
  addSiteStatusBySupervisor: (siteId, body) => api.post(`/admin/sites/${siteId}/statuses`, body),
  updateSiteStatusBySupervisor: (statusId, body) => api.put(`/admin/site-statuses/${statusId}/supervisor`, body),
  addSite: (body, adminId) =>
    api.post('/admin/add-site', body, { params: adminId != null ? { admin_id: adminId } : {} }),
  // Payments (web)
  getPaymentsStaff: () => api.get('/admin/payments/staff'),
  markAllStaffPaid: () => api.post('/admin/payments/staff/mark-paid-all'),
  markStaffPaid: (userId) => api.post(`/admin/payments/staff/${userId}/mark-paid`),
  getPaymentsOrders: () => api.get('/admin/payments/orders'),
  markOrderPaid: (orderId) => api.post(`/admin/payments/orders/${orderId}/mark-paid`),
  getPaymentsClients: () => api.get('/admin/payments/clients'),
  addClientTransaction: (siteId, amount) => api.post(`/admin/payments/clients/${siteId}/transactions`, { amount }),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getUpdates: () => api.get('/admin/updates'),
  getTasksWeb: () => api.get('/admin/tasks/web'),
  createTaskWeb: (body) => api.post('/admin/tasks/web', body),
  getVendorOrders: () => api.get('/vendor/orders'),
  acceptVendorOrder: (orderId, body) => api.put(`/vendor/orders/${orderId}/accept`, body),
  markSupervisorOrderDelivered: (orderId) => api.put(`/supervisor/orders/${orderId}/delivered`),
  getEmployeesWeb: (roleId) =>
    api.get('/admin/employees/web', { params: roleId != null ? { role_id: roleId } : {} }),
  addEmployeeWeb: (body) => api.post('/admin/employees/web', body),
  getAttendanceWeb: (params) => api.get('/admin/attendance/web', { params }),
};

/** Supervisor / Designer / Vendor / Factory — assigned tasks & completion (multipart). */
const realMyTasksApi = {
  getMyTasks: (params) => api.get('/my-tasks', { params }),
  completeTask: (taskId, formData) => api.post(`/my-tasks/${taskId}/complete`, formData),
};

// Export mock or real based on env
export default api;

// Auth always uses real API (login, profile, change password)
export const authApi = realAuthApi;
export const companiesApi = USE_MOCK ? mockCompaniesApi : realCompaniesApi;
export const superAdminApi = USE_MOCK ? mockSuperAdminApi : realSuperAdminApi;
export const dashboardApi = USE_MOCK ? mockDashboardApi : realDashboardApi;
export const rolesApi = USE_MOCK ? mockRolesApi : realRolesApi;
export const adminApi = USE_MOCK ? mockAdminApi : realAdminApi;
export const myTasksApi = USE_MOCK ? mockMyTasksApi : realMyTasksApi;
