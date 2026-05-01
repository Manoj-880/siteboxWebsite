import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminApi } from '../../api/axiosConfig';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#1D4ED8', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function monthKeyToLabel(monthKey) {
  if (!monthKey || typeof monthKey !== 'string') return monthKey || '';
  const [y, m] = monthKey.split('-');
  const monthNum = Number(m);
  if (!y || Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12) return monthKey;
  return `${MONTH_NAMES[monthNum - 1]} ${y}`;
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    adminApi
      .getDashboard()
      .then((res) => setData(res.data?.data ?? { stats: {}, recent_sites: [], recent_updates: [] }))
      .catch((err) => {
        setData({ stats: {}, recent_sites: [], recent_updates: [] });
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: 'var(--sitex-primary-alt)' }} />
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const analytics = data?.analytics ?? {};
  const overview = analytics.overview ?? {};
  const recentSites = data?.recent_sites ?? [];
  const recentUpdates = data?.recent_updates ?? [];

  const statCards = [
    { key: 'sites', label: 'Sites', value: overview.total_sites ?? stats.sites ?? 0, class: 'stat-card-sites', path: '/admin/sites' },
    { key: 'material_requests', label: 'Material requests', value: overview.total_material_requests ?? stats.material_requests ?? 0, class: 'stat-card-requests', path: '/admin/orders?tab=requests' },
    { key: 'orders', label: 'Orders', value: overview.total_orders ?? stats.orders ?? 0, class: 'stat-card-orders', path: '/admin/orders?tab=orders' },
    { key: 'staff', label: 'Staff', value: overview.total_users ?? stats.staff ?? 0, class: 'stat-card-staff', path: '/admin/staff' },
  ];

  const usersByMonth = (analytics.users_monthly || []).map((r) => ({
    month: monthKeyToLabel(r.month_key),
    users: toNumber(r.count),
  }));
  const sitesByMonth = (analytics.sites_monthly || []).map((r) => ({
    month: monthKeyToLabel(r.month_key),
    sites: toNumber(r.count),
  }));
  const demandByMonth = (() => {
    const reqMap = new Map((analytics.requests_monthly || []).map((r) => [r.month_key, toNumber(r.count)]));
    const ordMap = new Map((analytics.orders_monthly || []).map((r) => [r.month_key, toNumber(r.count)]));
    const keys = Array.from(new Set([...reqMap.keys(), ...ordMap.keys()])).sort();
    return keys.map((k) => ({
      month: monthKeyToLabel(k),
      requests: reqMap.get(k) || 0,
      orders: ordMap.get(k) || 0,
    }));
  })();
  const usersByRole = (analytics.users_by_role || []).map((r) => ({
    name: r.role_name,
    value: toNumber(r.total),
  }));
  const attendanceByRole = (analytics.attendance_by_role_today || []).map((r) => ({
    role: r.role_name,
    present: toNumber(r.present),
    absent: toNumber(r.absent),
    unmarked: toNumber(r.unmarked),
  }));

  const taskCompletionPct = (() => {
    const total = toNumber(overview.total_tasks);
    const completed = toNumber(overview.completed_tasks);
    if (!total) return 0;
    return Number(((completed / total) * 100).toFixed(1));
  })();

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header mb-4">
        <h1 className="admin-dashboard-title mb-1">Dashboard</h1>
        <p className="admin-dashboard-subtitle mb-0">Overview of sites, updates, and activity</p>
        {error && (
          <div className="alert alert-warning py-2 mt-2 mb-0" role="alert">
            {error}
          </div>
        )}
      </div>

      <Row className="g-3 mb-4">
        {statCards.map((s) => (
          <Col key={s.key} xs={6} md={3}>
            <Link to={s.path} className="text-decoration-none">
              <Card className={`admin-stat-card ${s.class} border-0 shadow-sm h-100`}>
                <Card.Body className="d-flex flex-column justify-content-center">
                  <span className="admin-stat-value">{s.value}</span>
                  <span className="admin-stat-label">{s.label}</span>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mb-4">
        <Col xs={12} xl={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold">Company user growth</Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={usersByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#1D4ED8" strokeWidth={2} dot={{ fill: '#1D4ED8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} xl={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold">Team distribution</Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={usersByRole} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78}>
                      {usersByRole.map((_, i) => (
                        <Cell key={`u-role-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold">Sites growth trend</Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={sitesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="sites" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold">Demand trend (requests vs orders)</Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={demandByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="orders" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xs={12} lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold">Quick attendance visual (today)</Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={attendanceByRole}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" stackId="a" fill="#10B981" />
                    <Bar dataKey="absent" stackId="a" fill="#EF4444" />
                    <Bar dataKey="unmarked" stackId="a" fill="#CBD5E1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold">Company growth quick metrics</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Active users</span>
                <strong>{toNumber(overview.active_users)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Inactive users</span>
                <strong>{toNumber(overview.inactive_users)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Active sites</span>
                <strong>{toNumber(overview.active_sites)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Completed sites</span>
                <strong>{toNumber(overview.completed_sites)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total materials in catalog</span>
                <strong>{toNumber(overview.total_materials)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Task completion ratio</span>
                <strong>{taskCompletionPct}%</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Client payments received</span>
                <strong>₹{toNumber(overview.client_payments_received).toLocaleString()}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold d-flex justify-content-between align-items-center">
              <span>Recently added sites</span>
              <Link to="/admin/sites" className="btn btn-sm btn-link p-0">View all</Link>
            </Card.Header>
            <Card.Body>
              {recentSites.length === 0 ? (
                <p className="text-muted small mb-0">No sites yet.</p>
              ) : (
                <ul className="list-unstyled mb-0 admin-recent-list">
                  {recentSites.slice(0, 5).map((site) => (
                    <li key={site.id} className="admin-recent-item d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                      <span className="fw-medium">{site.name}</span>
                      <span className="badge bg-light text-dark">{site.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold d-flex justify-content-between align-items-center">
              <span>Recent site updates</span>
              <Link to="/admin/updates" className="btn btn-sm btn-link p-0">View all</Link>
            </Card.Header>
            <Card.Body>
              {recentUpdates.length === 0 ? (
                <p className="text-muted small mb-0">No updates yet.</p>
              ) : (
                <ul className="list-unstyled mb-0 admin-recent-list">
                  {recentUpdates.slice(0, 5).map((u) => (
                    <li key={u.id} className="admin-recent-item py-2 border-bottom border-light">
                      <div className="fw-medium">{u.site_name}</div>
                      <div className="small text-muted">{u.supervisor_name}: {u.message ?? '—'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
