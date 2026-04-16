import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';

function prettyDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function formatStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  if (!normalized) return '—';
  return normalized
    .replaceAll('_', ' ')
    .split(' ')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join(' ');
}

function statusVariant(status) {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'delivered') return 'success';
  if (normalized === 'delayed') return 'danger';
  if (normalized === 'dispatched') return 'info';
  if (normalized === 'taken') return 'primary';
  if (normalized === 'created') return 'warning';
  return 'secondary';
}

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi.getMaterialRequestOrders();
        if (!mounted) return;
        setOrders(res?.data?.data?.orders ?? []);
      } catch (err) {
        if (!mounted) return;
        setOrders([]);
        setError(err?.response?.data?.message || err?.message || 'Failed to load order');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const order = useMemo(
    () => orders.find((o) => Number(o.id) === Number(orderId)),
    [orders, orderId]
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: 'var(--sitex-primary-alt)' }} />
      </div>
    );
  }

  return (
    <div className="admin-order-details">
      <div className="admin-page-header mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title mb-1">Order Details</h1>
          <p className="admin-page-subtitle mb-0">Complete information for this order</p>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/admin/orders?tab=orders')}>
          Back
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}

      {!order ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="py-4 text-muted">Order not found.</Card.Body>
        </Card>
      ) : (
        <>
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="fw-semibold">Order #{order.id}</div>
                    <Badge bg={statusVariant(order.order_status || order.raw_order_status)}>
                      {formatStatus(order.order_status || order.raw_order_status)}
                    </Badge>
                  </div>
                  <div className="small text-muted">Request ID: {order.material_request_id || '—'}</div>
                  <div className="small text-muted">Site: {order.site_name || '—'}</div>
                  <div className="small text-muted">Supervisor: {order.supervisor_name || '—'}</div>
                  <div className="small text-muted">Vendor: {order.vendor_name || '—'}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="fw-semibold mb-2">Timeline</div>
                  <div className="small text-muted">Created at: {prettyDateTime(order.created_at)}</div>
                  <div className="small text-muted">ETA: {prettyDateTime(order.estimated_delivery_date)}</div>
                  <div className="small text-muted">Taken at: {prettyDateTime(order.accepted_at)}</div>
                  <div className="small text-muted">Delivered at: {prettyDateTime(order.delivered_at)}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="fw-semibold mb-3">Ordered Materials</div>
              <Table responsive size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Variant</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-muted text-center py-3">
                        No items found.
                      </td>
                    </tr>
                  ) : (
                    order.items.map((item) => {
                      const variant = [item.brand_name, item.thickness_label, item.finishing_name]
                        .filter(Boolean)
                        .join(' / ');
                      return (
                        <tr key={item.id}>
                          <td>{item.material_name || '—'}</td>
                          <td>{variant || 'Default'}</td>
                          <td>{item.quantity}</td>
                          <td>{item.measuring_unit || '—'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
