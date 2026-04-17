import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Card, Spinner } from 'react-bootstrap';
import { vendorApi } from '../../api/axiosConfig';

export default function VendorSiteDetails() {
  const { siteId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    setError('');
    try {
      const res = await vendorApi.getSiteDetails(siteId);
      setData(res?.data?.data ?? {});
    } catch (e) {
      setData(null);
      setError(e?.response?.data?.message || 'Failed to load site details');
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => { load(); }, [load]);

  const markDispatched = async (orderId) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await vendorApi.markOrderDispatched(orderId);
      setSuccess('Order marked as dispatched.');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to mark order as dispatched');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (!data) return <Alert variant="warning">{error || 'Site not found'}</Alert>;

  const site = data.site_detail || {};
  const orders = data.orders || [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0" style={{ color: 'var(--sitex-text-primary)' }}>{site.site_name || `Site #${siteId}`}</h4>
        <Button as={Link} to="/vendor/orders" size="sm" variant="outline-secondary">All orders</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="fw-semibold">{site.client_name || 'Client'}</div>
          <div className="small text-muted">Orders: {orders.length}</div>
        </Card.Body>
      </Card>

      {orders.length === 0 ? (
        <p className="small text-muted">No orders found for this site.</p>
      ) : orders.map((o) => (
        <Card key={o.id} className="mb-2 border">
          <Card.Body>
            <div className="fw-semibold">Order #{o.id}</div>
            <div className="small text-muted">Status: {o.order_status || '-'}</div>
            <div className="small text-muted mb-2">Total: Rs {o.amount ?? 0}</div>
            {String(o.order_status || '').toLowerCase() === 'taken' ? (
              <Button size="sm" disabled={busy} onClick={() => markDispatched(o.id)}>Mark dispatched</Button>
            ) : null}
            {String(o.order_status || '').toLowerCase() === 'created' ? (
              <Button as={Link} size="sm" to="/vendor/orders" variant="outline-primary">Open in orders to mark taken</Button>
            ) : null}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
