import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { adminApi } from '../../api/axiosConfig';
import { ROLE_IDS } from '../../constants/roles';

const TABS = {
  requests: 'requests',
  orders: 'orders',
};

function formatDate(value, withTime = false) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return withTime ? d.toLocaleString() : d.toLocaleDateString();
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
  if (normalized === 'created' || normalized === 'pending') return 'warning';
  if (normalized === 'approved') return 'success';
  return 'secondary';
}

function variantLabel(item) {
  const parts = [item.brand_name, item.thickness_label, item.finishing_name].filter(Boolean);
  return parts.length ? parts.join(' / ') : 'Default';
}

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') === TABS.requests ? TABS.requests : TABS.orders;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [vendorId, setVendorId] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [requestsRes, ordersRes, vendorsRes] = await Promise.all([
        adminApi.getMaterialRequests(),
        adminApi.getMaterialRequestOrders(),
        adminApi.getEmployeesWeb(ROLE_IDS.VENDOR),
      ]);
      setRequests(requestsRes?.data?.data?.material_requests ?? []);
      setOrders(ordersRes?.data?.data?.orders ?? []);
      setVendors(vendorsRes?.data?.data ?? []);
    } catch (err) {
      setRequests([]);
      setOrders([]);
      setVendors([]);
      setError(err?.response?.data?.message || err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab) => {
    const nextTab = tab || TABS.orders;
    setActiveTab(nextTab);
    setSearchParams(nextTab === TABS.orders ? { tab: TABS.orders } : { tab: TABS.requests });
  };

  const openRequestModal = (request) => {
    setSelectedRequest(request);
    setVendorId('');
    setSelectedItems({});
    setQuantities({});
    setSuccess('');
  };

  const closeRequestModal = () => {
    if (submitting) return;
    setSelectedRequest(null);
    setVendorId('');
    setSelectedItems({});
    setQuantities({});
  };

  const orderableItems = useMemo(
    () =>
      (selectedRequest?.items || []).filter(
        (item) => Number(item.quantity_remaining ?? 0) > 0
      ),
    [selectedRequest]
  );

  const submitOrder = async () => {
    if (!selectedRequest?.id) return;
    setError('');
    setSuccess('');
    if (!vendorId) {
      setError('Select a vendor before creating an order.');
      return;
    }

    const items = [];
    for (const item of orderableItems) {
      const key = `${item.material_id}:${item.brand_id ?? 0}:${item.thickness_id ?? 0}:${item.finishing_id ?? 0}`;
      if (!selectedItems[key]) continue;
      const qty = Number(quantities[key]);
      const remaining = Number(item.quantity_remaining ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) {
        setError(`Enter a valid quantity for ${item.material_name}.`);
        return;
      }
      if (qty > remaining) {
        setError(`Quantity for ${item.material_name} cannot exceed remaining ${remaining}.`);
        return;
      }
      items.push({
        material_id: item.material_id,
        brand_id: item.brand_id,
        thickness_id: item.thickness_id,
        finishing_id: item.finishing_id,
        quantity: qty,
      });
    }

    if (items.length === 0) {
      setError('Select at least one material to create an order.');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.createMaterialRequestOrder(selectedRequest.id, {
        vendor_id: Number(vendorId),
        items,
      });
      setSuccess('Order created successfully.');
      await loadData();
      const refreshedRequest = (await adminApi.getMaterialRequests())?.data?.data?.material_requests?.find(
        (request) => Number(request.id) === Number(selectedRequest.id)
      );
      if (refreshedRequest) {
        openRequestModal(refreshedRequest);
      } else {
        closeRequestModal();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const requestsSummary = useMemo(
    () =>
      requests.map((request) => {
        const items = request.items || [];
        const remaining = items.reduce(
          (sum, item) => sum + Number(item.quantity_remaining ?? 0),
          0
        );
        return { ...request, itemCount: items.length, remaining };
      }),
    [requests]
  );

  return (
    <div className="admin-orders">
      <div className="admin-page-header mb-4">
        <h1 className="admin-page-title mb-1">Orders</h1>
        <p className="admin-page-subtitle mb-0">
          Review material requests, create vendor orders, and track live order status.
        </p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-3">
          {success}
        </Alert>
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" style={{ color: 'var(--sitex-primary-alt)' }} />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value={TABS.requests}>
              Material Requests ({requests.length})
            </TabsTrigger>
            <TabsTrigger value={TABS.orders}>Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={TABS.requests}>
            {requestsSummary.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <Card.Body className="py-5 text-center text-muted">
                  No material requests available.
                </Card.Body>
              </Card>
            ) : (
              <Row className="g-3">
                {requestsSummary.map((request) => (
                  <Col xs={12} md={6} xl={4} key={request.id}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="fw-semibold">Request #{request.id}</div>
                          <Badge bg={statusVariant(request.status)}>
                            {formatStatus(request.status)}
                          </Badge>
                        </div>
                        <div className="small text-muted mb-1">Site: {request.site_name || '—'}</div>
                        <div className="small text-muted mb-1">
                          Requested by: {request.requested_by_name || '—'}
                        </div>
                        <div className="small text-muted mb-1">
                          {request.itemCount} item(s) • Remaining qty {request.remaining}
                        </div>
                        <div className="small text-muted mb-3">
                          Created: {formatDate(request.created_at, true)}
                        </div>
                        <Button
                          variant="outline-primary"
                          className="mt-auto"
                          onClick={() => openRequestModal(request)}
                        >
                          View Request
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </TabsContent>

          <TabsContent value={TABS.orders}>
            {orders.length === 0 ? (
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
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="fw-semibold">Order #{order.id}</div>
                          <Badge bg={statusVariant(order.order_status)}>
                            {formatStatus(order.order_status || order.raw_order_status)}
                          </Badge>
                        </div>
                        <div className="small text-muted mb-1">Site: {order.site_name || '—'}</div>
                        <div className="small text-muted mb-1">Vendor: {order.vendor_name || '—'}</div>
                        <div className="small text-muted mb-1">
                          Supervisor: {order.supervisor_name || '—'}
                        </div>
                        <div className="small text-muted mb-1">
                          Ordered: {formatDate(order.created_at)}
                        </div>
                        <div className="small text-muted">
                          ETA: {formatDate(order.estimated_delivery_date, true)}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Modal show={!!selectedRequest} onHide={closeRequestModal} size="lg" centered>
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>
            {selectedRequest ? `Material Request #${selectedRequest.id}` : 'Material Request'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="mb-3">
                <div className="small text-muted">Site: {selectedRequest.site_name || '—'}</div>
                <div className="small text-muted">
                  Requested by: {selectedRequest.requested_by_name || '—'}
                </div>
                <div className="small text-muted">
                  Status: {formatStatus(selectedRequest.status)}
                </div>
              </div>

              <div className="border rounded-3 p-3 mb-3">
                <Form.Group className="mb-3">
                  <Form.Label>Select vendor</Form.Label>
                  <Form.Select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Choose vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.adminId || vendor.id} value={vendor.adminId || vendor.id}>
                        {vendor.username || vendor.name || `Vendor ${vendor.adminId || vendor.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <div className="fw-semibold mb-2">Select materials for this order</div>
                {orderableItems.length === 0 ? (
                  <div className="text-muted small">
                    All requested materials are already fully ordered.
                  </div>
                ) : (
                  orderableItems.map((item) => {
                    const key = `${item.material_id}:${item.brand_id ?? 0}:${item.thickness_id ?? 0}:${item.finishing_id ?? 0}`;
                    const checked = !!selectedItems[key];
                    return (
                      <div key={key} className="border rounded-3 p-3 mb-2">
                        <Form.Check
                          type="checkbox"
                          id={`item-${key}`}
                          label={
                            <span>
                              <span className="fw-medium">{item.material_name}</span>
                              <span className="text-muted small d-block">
                                {variantLabel(item)}
                              </span>
                              <span className="text-muted small d-block">
                                Requested: {item.quantity_requested} {item.measuring_unit || ''}
                                {' • '}
                                Ordered: {item.quantity_ordered} {item.measuring_unit || ''}
                                {' • '}
                                Remaining: {item.quantity_remaining} {item.measuring_unit || ''}
                              </span>
                            </span>
                          }
                          checked={checked}
                          onChange={(e) =>
                            setSelectedItems((prev) => ({ ...prev, [key]: e.target.checked }))
                          }
                          disabled={submitting}
                        />
                        {checked && (
                          <Form.Group className="mt-3">
                            <Form.Label className="small">Quantity</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              step="any"
                              value={quantities[key] ?? ''}
                              onChange={(e) =>
                                setQuantities((prev) => ({ ...prev, [key]: e.target.value }))
                              }
                              disabled={submitting}
                            />
                          </Form.Group>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeRequestModal} disabled={submitting}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={submitOrder}
            disabled={submitting || orderableItems.length === 0}
          >
            {submitting ? 'Creating...' : 'Create Order'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
