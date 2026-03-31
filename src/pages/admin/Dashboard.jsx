import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';

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
  const recentSites = data?.recent_sites ?? [];
  const recentUpdates = data?.recent_updates ?? [];

  const statCards = [
    { key: 'sites', label: 'Sites', value: stats.sites ?? 0, class: 'stat-card-sites', path: '/admin/sites' },
    { key: 'material_requests', label: 'Material requests', value: stats.material_requests ?? 0, class: 'stat-card-requests', path: '/admin/material-requests' },
    { key: 'orders', label: 'Orders', value: stats.orders ?? 0, class: 'stat-card-orders', path: '/admin/orders' },
    { key: 'staff', label: 'Staff', value: stats.staff ?? 0, class: 'stat-card-staff', path: '/admin/staff' },
  ];

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
