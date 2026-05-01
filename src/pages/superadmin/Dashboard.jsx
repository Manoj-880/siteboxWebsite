import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
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
import { dashboardApi } from '../../api/axiosConfig';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

const DASHBOARD_PATH = '/super-admin';

export default function Dashboard() {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch from server whenever this dashboard is rendered (mount or navigated to)
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '') || '/';
    if (path !== DASHBOARD_PATH) return;

    setLoading(true);
    setError('');

    dashboardApi
      .getAnalyticsData()
      .then((res) => setStats(res.data?.data ?? null))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load dashboard analytics'))
      .finally(() => setLoading(false));
  }, [location.pathname]);

  const overview = stats?.overview || {};
  const companyStatus = stats?.company_status_breakdown || {};

  const usersByMonth = useMemo(
    () =>
      (stats?.users_monthly || []).map((r) => ({
        month: monthKeyToLabel(r.month_key),
        users: toNumber(r.count),
      })),
    [stats]
  );

  const companyApplicationsByMonth = useMemo(
    () =>
      (stats?.companies_monthly || []).map((r) => ({
        month: monthKeyToLabel(r.month_key),
        applications: toNumber(r.count),
      })),
    [stats]
  );

  const materialsByMonth = useMemo(() => {
    const published = new Map(
      (stats?.materials_monthly || []).map((r) => [r.month_key, toNumber(r.count)])
    );
    const submissions = new Map(
      (stats?.material_submissions_monthly || []).map((r) => [r.month_key, toNumber(r.count)])
    );
    const keys = Array.from(new Set([...published.keys(), ...submissions.keys()])).sort();
    return keys.map((k) => ({
      month: monthKeyToLabel(k),
      published: published.get(k) || 0,
      submissions: submissions.get(k) || 0,
    }));
  }, [stats]);

  const usersByRole = useMemo(
    () =>
      (stats?.users_by_role || []).map((r) => ({
        name: r.role_name,
        value: toNumber(r.total),
      })),
    [stats]
  );

  const submissionStatus = useMemo(
    () =>
      (stats?.material_submission_status || []).map((r) => ({
        name: (r.status || 'unknown').toString().toUpperCase(),
        value: toNumber(r.count),
      })),
    [stats]
  );

  const pendingSharePct = useMemo(() => {
    const pending = toNumber(overview.pending_material_submissions);
    const totalMaterials = toNumber(overview.total_materials);
    if (!totalMaterials) return 0;
    return Number(((pending / totalMaterials) * 100).toFixed(1));
  }, [overview]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <h4 className="mb-3" style={{ color: 'var(--sitex-text-primary)' }}>Dashboard</h4>

      <Row className="g-2 g-md-3 mb-4">
        <Col xs={6} sm={6} md={3}>
          <Card className="h-100 border-0 stat-card-users">
            <Card.Body className="py-3 text-center">
              <Card.Text as="h4" className="mb-0 fw-bold">{toNumber(overview.total_users)}</Card.Text>
              <Card.Title as="h6" className="small mb-0 fw-medium">Total users</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={6} md={3}>
          <Card className="h-100 border-0 stat-card-users">
            <Card.Body className="py-3 text-center">
              <Card.Text as="h4" className="mb-0 fw-bold">{toNumber(overview.active_users)}</Card.Text>
              <Card.Title as="h6" className="small mb-0 fw-medium">Active users</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={6} md={3}>
          <Card className="h-100 border-0 stat-card-companies">
            <Card.Body className="py-3 text-center">
              <Card.Text as="h4" className="mb-0 fw-bold">{toNumber(overview.active_companies)}</Card.Text>
              <Card.Title as="h6" className="small mb-0 fw-medium">Active companies</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={6} md={3}>
          <Card className="h-100 border-0 stat-card-deletions">
            <Card.Body className="py-3 text-center">
              <Card.Text as="h4" className="mb-0 fw-bold">{toNumber(overview.onboarding_companies)}</Card.Text>
              <Card.Title as="h6" className="small mb-0 fw-medium">Onboarding applications</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={6} md={3}>
          <Card className="h-100 border-0 stat-card-recent">
            <Card.Body className="py-3 text-center">
              <Card.Text as="h4" className="mb-0 fw-bold">{toNumber(overview.delete_requested_companies)}</Card.Text>
              <Card.Title as="h6" className="small mb-0 fw-medium">Delete requests</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col xs={12} xl={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
              <Card.Title as="h6" className="mb-0 fw-bold" style={{ color: 'var(--sitex-text-primary)' }}>
                User growth (last 12 months)
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={usersByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="var(--sitex-primary-alt)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--sitex-primary-alt)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} xl={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
              <Card.Title as="h6" className="mb-0 fw-bold" style={{ color: 'var(--sitex-text-primary)' }}>
                User role distribution
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={usersByRole} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {usersByRole.map((_, idx) => (
                        <Cell key={`role-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
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
            <Card.Header className="bg-white border-bottom">
              <Card.Title as="h6" className="mb-0 fw-bold" style={{ color: 'var(--sitex-text-primary)' }}>
                Company applications trend
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={companyApplicationsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
              <Card.Title as="h6" className="mb-0 fw-bold" style={{ color: 'var(--sitex-text-primary)' }}>
                Company status breakdown
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="small text-muted mb-2">Where applications currently stand.</div>
              <div className="d-flex justify-content-between mb-2">
                <span>Active</span>
                <strong>{toNumber(companyStatus.active)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Onboarding pending</span>
                <strong>{toNumber(companyStatus.onboarding)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Delete requested</span>
                <strong>{toNumber(companyStatus.delete_requested)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col xs={12} xl={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
              <Card.Title as="h6" className="mb-0 fw-bold" style={{ color: 'var(--sitex-text-primary)' }}>
                Materials growth: catalog vs submissions
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={materialsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="published" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="submissions" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} xl={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
              <Card.Title as="h6" className="mb-0 fw-bold" style={{ color: 'var(--sitex-text-primary)' }}>
                Material submission status
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={submissionStatus} dataKey="value" nameKey="name" outerRadius={80}>
                      {submissionStatus.map((_, idx) => (
                        <Cell key={`sub-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="small text-muted mt-2">
                Pending material share: <strong>{pendingSharePct}%</strong> of catalog size
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
              <Card.Title as="h6" className="mb-0 fw-bold" style={{ color: 'var(--sitex-text-primary)' }}>
                Product workload signals
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Total sites</span>
                <strong>{toNumber(overview.total_sites)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Material requests</span>
                <strong>{toNumber(overview.total_material_requests)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Orders</span>
                <strong>{toNumber(overview.total_orders)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Tasks</span>
                <strong>{toNumber(overview.total_tasks)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Card.Title as="h6" className="mb-0 fw-bold" style={{ color: 'var(--sitex-text-primary)' }}>
                Top companies by user base
              </Card.Title>
              <Link
                to="/super-admin/companies"
                className="btn btn-link btn-sm p-0 text-decoration-underline"
                style={{ color: 'var(--sitex-primary-alt)' }}
              >
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {stats?.top_companies_by_users?.length ? (
                <ul className="list-group list-group-flush">
                  {stats.top_companies_by_users.map((c) => (
                    <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{c.company_name}</span>
                      <span className="fw-semibold">{toNumber(c.users_count)} users</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted p-3 mb-0">No companies found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
