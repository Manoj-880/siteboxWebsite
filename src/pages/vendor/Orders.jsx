import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { vendorApi } from '../../api/axiosConfig';

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [estimatedDate, setEstimatedDate] = useState('');
  const [prices, setPrices] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await vendorApi.getOrders();
      setOrders(res?.data?.data?.orders ?? []);
    } catch (e) {
      setOrders([]);
      setError(e?.response?.data?.message || 'Failed to load vendor orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openTaken = (order) => {
    setSelected(order);
    setEstimatedDate(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
    const next = {};
    for (const i of (order.items || [])) next[i.id] = i.unit_price ?? '';
    setPrices(next);
  };

  const openDetails = (order) => {
    setDetailsOrder(order);
  };

  const markTaken = async () => {
    if (!selected) return;
    const items = (selected.items || []).map((i) => ({
      id: Number(i.id),
      unit_price: Number(prices[i.id] || 0),
    }));
    if (!estimatedDate || items.some((i) => !i.unit_price || i.unit_price <= 0)) {
      setError('Estimated delivery date and valid unit prices are required.');
      return;
    }
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await vendorApi.markOrderTaken(selected.id, {
        estimated_delivery_date: new Date(`${estimatedDate}T18:00:00`).toISOString(),
        items,
      });
      setSelected(null);
      setDetailsOrder(null);
      setSuccess('Order marked as taken.');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to mark order as taken');
    } finally {
      setBusy(false);
    }
  };

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

  const grouped = useMemo(() => {
    const created = [];
    const taken = [];
    const done = [];
    for (const o of orders) {
      const status = String(o.order_status || '').toLowerCase();
      if (status === 'created') created.push(o);
      else if (status === 'taken') taken.push(o);
      else done.push(o);
    }
    return { created, taken, done };
  }, [orders]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  const renderOrder = (o) => (
    <Card
      key={o.id}
      className="mb-2 border"
      role="button"
      onClick={() => openDetails(o)}
      style={{ cursor: 'pointer' }}
    >
      <Card.Body>
        <div className="fw-semibold">{o.site_name || 'Site'}</div>
        <div className="small text-muted">Order #{o.id} • Status: {o.order_status || '-'}</div>
        <div className="small text-muted mb-2">Total: Rs {o.amount ?? 0}</div>
        {(o.items || []).length > 0 ? (
          <div className="small mb-2">{o.items.length} item(s)</div>
        ) : null}
        <div className="d-flex gap-2">
          {String(o.order_status || '').toLowerCase() === 'created' ? (
            <Button
              size="sm"
              variant="outline-primary"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                openTaken(o);
              }}
            >
              Mark taken
            </Button>
          ) : null}
          {String(o.order_status || '').toLowerCase() === 'taken' ? (
            <Button
              size="sm"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                markDispatched(o.id);
              }}
            >
              Mark dispatched
            </Button>
          ) : null}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div>
      <h4 className="mb-3" style={{ color: 'var(--sitex-text-primary)' }}>Orders</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100"><Card.Body><h6>Created ({grouped.created.length})</h6>{grouped.created.length ? grouped.created.map(renderOrder) : <p className="small text-muted mb-0">No orders.</p>}</Card.Body></Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100"><Card.Body><h6>Taken ({grouped.taken.length})</h6>{grouped.taken.length ? grouped.taken.map(renderOrder) : <p className="small text-muted mb-0">No orders.</p>}</Card.Body></Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100"><Card.Body><h6>Completed ({grouped.done.length})</h6>{grouped.done.length ? grouped.done.map(renderOrder) : <p className="small text-muted mb-0">No orders.</p>}</Card.Body></Card>
        </Col>
      </Row>

      <Modal show={!!selected} onHide={() => !busy && setSelected(null)} centered size="lg">
        <Modal.Header closeButton={!busy}><Modal.Title>Mark Order #{selected?.id} Taken</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Estimated delivery date</Form.Label>
            <Form.Control type="date" value={estimatedDate} onChange={(e) => setEstimatedDate(e.target.value)} />
          </Form.Group>
          {(selected?.items || []).map((item) => (
            <Card key={item.id} className="mb-2 border">
              <Card.Body>
                <div className="fw-semibold">{item.material_name || '-'}</div>
                <div className="small text-muted mb-2">Qty: {item.quantity || 0} {item.measuring_unit || ''}</div>
                <Form.Group>
                  <Form.Label className="small">Unit price (Rs)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={prices[item.id] ?? ''}
                    onChange={(e) => setPrices((p) => ({ ...p, [item.id]: e.target.value }))}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" disabled={busy} onClick={() => setSelected(null)}>Cancel</Button>
          <Button disabled={busy} onClick={markTaken}>Mark taken</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!detailsOrder} onHide={() => setDetailsOrder(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order #{detailsOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="small mb-1"><strong>Site:</strong> {detailsOrder?.site_name || '-'}</div>
          <div className="small mb-1"><strong>Status:</strong> {detailsOrder?.order_status || '-'}</div>
          <div className="small mb-3"><strong>Total:</strong> Rs {detailsOrder?.amount ?? 0}</div>
          <h6 className="mb-2">Items</h6>
          {(detailsOrder?.items || []).length === 0 ? (
            <p className="small text-muted mb-0">No items</p>
          ) : (
            (detailsOrder?.items || []).map((item) => (
              <Card key={item.id} className="mb-2 border">
                <Card.Body className="py-2">
                  <div className="fw-semibold small">{item.material_name || '-'}</div>
                  <div className="small text-muted">
                    {item.brand_name ? `${item.brand_name} • ` : ''}
                    Qty: {item.quantity ?? 0} {item.measuring_unit || ''}
                    {item.unit_price != null ? ` • Rs ${item.unit_price}` : ''}
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          {String(detailsOrder?.order_status || '').toLowerCase() === 'created' ? (
            <Button
              variant="outline-primary"
              disabled={busy}
              onClick={() => {
                openTaken(detailsOrder);
              }}
            >
              Mark taken
            </Button>
          ) : null}
          {String(detailsOrder?.order_status || '').toLowerCase() === 'taken' ? (
            <Button
              disabled={busy}
              onClick={async () => {
                await markDispatched(detailsOrder.id);
                setDetailsOrder(null);
              }}
            >
              Mark dispatched
            </Button>
          ) : null}
          <Button variant="outline-secondary" onClick={() => setDetailsOrder(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
