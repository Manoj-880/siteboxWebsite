import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Col, Row, Spinner } from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    adminApi
      .getMaterialRequestOrders()
      .then((res) => setOrders(res.data?.data?.orders || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const prettyDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  return (
    <div className="admin-orders">
      <div className="admin-page-header mb-4">
        <h1 className="admin-page-title mb-1">Orders</h1>
        <p className="admin-page-subtitle mb-0">Material request orders assigned to vendors</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="py-5 text-center text-muted">
            No orders available yet.
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {orders.map((order) => (
            <Col xs={12} md={6} xl={4} key={order.id}>
              <Card
                className="border-0 shadow-sm h-100"
                role="button"
                onClick={() => navigate(`/admin/orders/${order.id}`)}
              >
                <Card.Body>
                  <div className="fw-semibold mb-2">Order #{order.id}</div>
                  <div className="small text-muted mb-1">Site: {order.site_name || '—'}</div>
                  <div className="small text-muted mb-1">Vendor: {order.vendor_name || '—'}</div>
                  <div className="small text-muted mb-1">Supervisor: {order.supervisor_name || '—'}</div>
                  <div className="small text-muted mb-1">Status: {order.order_status || 'ordered'}</div>
                  <div className="small text-muted mb-1">Ordered: {prettyDate(order.created_at)}</div>
                  <div className="small text-muted">ETA: {prettyDate(order.estimated_delivery_date)}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
