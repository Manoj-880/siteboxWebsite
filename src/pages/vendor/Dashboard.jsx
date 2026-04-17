import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { attendanceApi, vendorApi } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function VendorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await vendorApi.getDashboard(todayIso());
      setData(res?.data?.data ?? {});
    } catch (e) {
      setData({});
      setError(e?.response?.data?.message || 'Failed to load vendor dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const attendanceMarked = useMemo(() => {
    const s = String(data?.attendance_status || '').toLowerCase();
    return s === 'present' || s === 'absent';
  }, [data?.attendance_status]);

  const markAttendance = async () => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await attendanceApi.mark({ attendance_date: todayIso(), attendance_status: 'present' });
      setSuccess('Attendance marked successfully.');
      await loadDashboard();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setBusy(false);
    }
  };

  const recentOrders = data?.recent_orders || [];

  return (
    <div>
      <h4 className="mb-3" style={{ color: 'var(--sitex-text-primary)' }}>Vendor Dashboard</h4>
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="d-flex justify-content-between flex-wrap gap-2 align-items-start">
          <div>
            <p className="mb-1">Welcome, <strong>{user?.username}</strong>.</p>
            <p className="small text-muted mb-0">Manage orders, track assigned sites, and complete your tasks.</p>
          </div>
          <Button size="sm" onClick={markAttendance} disabled={attendanceMarked || busy}>
            {attendanceMarked ? 'Attendance marked' : 'Mark attendance'}
          </Button>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <>
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Card className="border-0 shadow-sm"><Card.Body><div className="small text-muted">Sites</div><div className="h4 mb-2">{data?.sites?.total ?? 0}</div><Button as={Link} to="/vendor/sites" size="sm" variant="outline-primary">View sites</Button></Card.Body></Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm"><Card.Body><div className="small text-muted">Tasks</div><div className="h4 mb-2">{data?.tasks?.total ?? 0}</div><Button as={Link} to="/vendor/tasks" size="sm" variant="outline-primary">View tasks</Button></Card.Body></Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm"><Card.Body><div className="small text-muted">Orders</div><div className="h4 mb-2">{data?.orders?.total ?? 0}</div><Button as={Link} to="/vendor/orders" size="sm" variant="outline-primary">View orders</Button></Card.Body></Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Recent Orders</h6>
                <Button as={Link} to="/vendor/orders" size="sm" variant="outline-secondary">Open orders</Button>
              </div>
              {recentOrders.length === 0 ? <p className="small text-muted mb-0">No orders available right now.</p> : recentOrders.map((o) => (
                <Card key={o.id} className="mb-2 border">
                  <Card.Body>
                    <div className="fw-semibold">{o.site_name || 'Site'}</div>
                    <div className="small text-muted">Order #{o.id}</div>
                    <div className="small text-muted">Status: {o.order_status || '-'}</div>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
