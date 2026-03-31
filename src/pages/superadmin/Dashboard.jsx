import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardApi } from '../../api/axiosConfig';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Get latest entry by year then month; return { totalUsers, monthlyUsers } from cumulative_users and monthly_users */
function deriveUserCounts(monthlyData) {
  if (!Array.isArray(monthlyData) || monthlyData.length === 0) {
    return { totalUsers: 0, monthlyUsers: 0 };
  }
  const sorted = [...monthlyData].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  const latest = sorted[0];
  return {
    totalUsers: latest.cumulative_users ?? 0,
    monthlyUsers: latest.monthly_users ?? 0,
  };
}

/** Map API data to chart format: [{ month: 'Jan 2024', users }], chronological order */
function mapMonthlyDataToChart(monthlyData) {
  if (!Array.isArray(monthlyData) || monthlyData.length === 0) return [];
  const sorted = [...monthlyData].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
  return sorted.map((r) => ({
    month: `${MONTH_NAMES[(r.month || 1) - 1]} ${r.year}`,
    users: r.monthly_users ?? 0,
  }));
}

const DASHBOARD_PATH = '/super-admin';

export default function Dashboard() {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [monthlyUsersData, setMonthlyUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch from server whenever this dashboard is rendered (mount or navigated to)
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '') || '/';
    if (path !== DASHBOARD_PATH) return;

    setLoading(true);
    setError('');

    dashboardApi
      .get()
      .then((res) => setStats(res.data?.data ?? null))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));

    dashboardApi
      .getMonthlyUsersCount()
      .then((res) => {
        const data = res.data?.data ?? [];
        setMonthlyUsersData(Array.isArray(data) ? data : []);
      })
      .catch(() => setMonthlyUsersData([]));
  }, [location.pathname]);

  const { totalUsers, monthlyUsers } = deriveUserCounts(monthlyUsersData);
  const usersByMonth = mapMonthlyDataToChart(monthlyUsersData);

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

      {/* Stat cards */}
      <Row className="g-2 g-md-3 mb-4">
        <Col xs={6} sm={6} md={3}>
          <Card className="h-100 border-0 stat-card-users">
            <Card.Body className="py-3 text-center">
              <Card.Text as="h4" className="mb-0 fw-bold">{totalUsers}</Card.Text>
              <Card.Title as="h6" className="small mb-0 fw-medium">Total users</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={6} md={3}>
          <Card className="h-100 border-0 stat-card-users">
            <Card.Body className="py-3 text-center">
              <Card.Text as="h4" className="mb-0 fw-bold">{monthlyUsers}</Card.Text>
              <Card.Title as="h6" className="small mb-0 fw-medium">Monthly users (latest)</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={6} md={3}>
          <Card className="h-100 border-0 stat-card-companies">
            <Card.Body className="py-3 text-center">
              <Card.Text as="h4" className="mb-0 fw-bold">{stats?.total_companies ?? 0}</Card.Text>
              <Card.Title as="h6" className="small mb-0 fw-medium">Companies count</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={6} md={3}>
          <Card className="h-100 border-0 stat-card-deletions">
            <Card.Body className="py-3 text-center">
              <Card.Text as="h4" className="mb-0 fw-bold">{stats?.del_req_count ?? 0}</Card.Text>
              <Card.Title as="h6" className="small mb-0 fw-medium">Delete request count</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={6} md={3}>
          <Card className="h-100 border-0 stat-card-recent">
            <Card.Body className="py-3 text-center">
              <Card.Text as="h4" className="mb-0 fw-bold">{stats?.reg_req_count ?? 0}</Card.Text>
              <Card.Title as="h6" className="small mb-0 fw-medium">Registration request count</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Line graph: Users every month */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom">
          <Card.Title as="h6" className="mb-0 fw-bold" style={{ color: 'var(--sitex-text-primary)' }}>
            Users every month
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

      <Row>
        {/* Recent companies joined (5) */}
        <Col xs={12} lg={6} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Card.Title as="h6" className="mb-0 fw-bold" style={{ color: 'var(--sitex-text-primary)' }}>
                Recent companies joined (5)
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
              {stats?.recent_companies?.length ? (
                <ul className="list-group list-group-flush">
                  {(stats.recent_companies.slice(0, 5)).map((c) => (
                    <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{c.company_name}</span>
                      <Link to={`/super-admin/companies/${c.id}/edit`} className="btn btn-sm btn-link">
                        Edit
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted p-3 mb-0">No recent companies.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
