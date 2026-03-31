import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';
import { decodeMaterialRequestId } from '../../utils/materialRequestHash';

export default function AdminMaterialRequestDetails() {
  const { hashedId } = useParams();
  const navigate = useNavigate();
  const requestId = useMemo(() => decodeMaterialRequestId(hashedId || ''), [hashedId]);

  const [request, setRequest] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [modalVendorId, setModalVendorId] = useState('');
  const [modalQtyByKey, setModalQtyByKey] = useState({});

  const getItemKey = (item) =>
    `${item.material_id}:${item.brand_id ?? 0}:${item.thickness_id ?? 0}:${item.finishing_id ?? 0}`;

  const formatDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  };

  const vendorOptions = useMemo(
    () =>
      vendors.map((v) => ({
        id: Number(v.adminId ?? v.id),
        label: `${v.username}${v.mobile ? ` (${v.mobile})` : ''}`,
      })),
    [vendors]
  );

  const loadData = async () => {
    if (!requestId) {
      setError('Invalid material request link.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [requestsRes, vendorsRes] = await Promise.all([
        adminApi.getMaterialRequests(),
        adminApi.getEmployeesWeb(6),
      ]);
      const requests = requestsRes.data?.data?.material_requests || [];
      const found = requests.find((r) => Number(r.id) === Number(requestId));
      if (!found) {
        setError('Material request not found or no longer pending.');
        setRequest(null);
      } else {
        setRequest(found);
      }
      setVendors(vendorsRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load material request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  const handleItemCheck = (key, checked) => {
    setSelectedItems((prev) => ({ ...prev, [key]: checked }));
  };

  const openOrderModal = () => {
    if (!request) return;
    const selected = (request.items || []).filter((item) => selectedItems[getItemKey(item)]);
    if (selected.length === 0) {
      setError('Select at least one material before creating order.');
      return;
    }
    const qtyByKey = {};
    selected.forEach((item) => {
      qtyByKey[getItemKey(item)] = item.quantity_remaining;
    });
    setModalQtyByKey(qtyByKey);
    setModalVendorId('');
    setShowOrderModal(true);
  };

  const handleCreateOrder = async () => {
    if (!request) return;
    const vendorId = Number(modalVendorId);
    if (!vendorId) {
      setError('Please select a vendor.');
      return;
    }

    const items = (request.items || [])
      .filter((item) => selectedItems[getItemKey(item)])
      .map((item) => {
        const key = getItemKey(item);
        const qty = Number(modalQtyByKey[key]);
        return {
          material_id: item.material_id,
          brand_id: item.brand_id ?? null,
          thickness_id: item.thickness_id ?? null,
          finishing_id: item.finishing_id ?? null,
          quantity: qty,
          quantity_remaining: item.quantity_remaining,
        };
      })
      .filter((item) => Number.isFinite(item.quantity) && item.quantity > 0);

    const invalid = items.find((item) => item.quantity > item.quantity_remaining);
    if (invalid) {
      setError('Quantity cannot exceed requested remaining quantity.');
      return;
    }
    if (items.length === 0) {
      setError('Enter at least one valid quantity.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await adminApi.createMaterialRequestOrder(request.id, {
        vendor_id: vendorId,
        items: items.map(({ quantity_remaining, ...rest }) => rest),
      });
      const approved = res.data?.data?.material_request_approved;
      setMessage(approved ? 'Order created and request approved.' : 'Order created successfully.');
      setShowOrderModal(false);
      await loadData();
      setSelectedItems({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="admin-material-request-details">
      <div className="admin-page-header mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title mb-1">Material Request</h1>
          <p className="admin-page-subtitle mb-0">Review request details and create vendor order</p>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/admin/material-requests')}>
          Back
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')} className="mb-3">
          {message}
        </Alert>
      )}

      {!request ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="py-4 text-muted">No material request data available.</Card.Body>
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body>
              <div className="fw-semibold mb-2">Request #{request.id}</div>
              <div className="small text-muted">Created: {formatDateTime(request.created_at)}</div>
              <div className="small text-muted">Materials: {request.materials_count ?? (request.items || []).length}</div>
              <div className="small text-muted">Community: {request.community_name || 'Individual Site'}</div>
            </Card.Body>
          </Card>

          <Row className="g-3 mb-3">
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="small fw-semibold mb-2">Site Details</div>
                  <div className="small text-muted">Name: {request.site?.site_name || request.site_name || '—'}</div>
                  <div className="small text-muted">Client: {request.site?.client_name || '—'}</div>
                  <div className="small text-muted">Phone: {request.site?.client_phone || '—'}</div>
                  <div className="small text-muted">Address: {request.site?.address || '—'}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="small fw-semibold mb-2">Supervisor Details</div>
                  <div className="small text-muted">Name: {request.supervisor?.name || request.requested_by_name || '—'}</div>
                  <div className="small text-muted">Mobile: {request.supervisor?.mobile || '—'}</div>
                  <div className="small text-muted">Email: {request.supervisor?.email || '—'}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-semibold">Requested Materials</div>
                {selectedCount > 0 && (
                  <Button size="sm" onClick={openOrderModal}>Create Order</Button>
                )}
              </div>

              <Table size="sm" responsive className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Select</th>
                    <th>Material</th>
                    <th>Variant</th>
                    <th>Requested</th>
                    <th>Ordered</th>
                    <th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {(request.items || []).map((item) => {
                    const key = getItemKey(item);
                    const variant = [item.brand_name, item.thickness_label, item.finishing_name]
                      .filter(Boolean)
                      .join(' / ');
                    return (
                      <tr key={key}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={Boolean(selectedItems[key])}
                            onChange={(e) => handleItemCheck(key, e.target.checked)}
                            disabled={item.quantity_remaining <= 0}
                          />
                        </td>
                        <td>{item.material_name} {item.measuring_unit ? `(${item.measuring_unit})` : ''}</td>
                        <td>{variant || 'Default'}</td>
                        <td>{item.quantity_requested}</td>
                        <td>{item.quantity_ordered}</td>
                        <td>{item.quantity_remaining}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}

      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!request ? null : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Select Vendor</Form.Label>
                <Form.Select value={modalVendorId} onChange={(e) => setModalVendorId(e.target.value)}>
                  <option value="">Select vendor</option>
                  {vendorOptions.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Table size="sm" responsive>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Variant</th>
                    <th>Max Qty</th>
                    <th style={{ width: 160 }}>Order Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {(request.items || [])
                    .filter((item) => selectedItems[getItemKey(item)])
                    .map((item) => {
                      const key = getItemKey(item);
                      const variant = [item.brand_name, item.thickness_label, item.finishing_name]
                        .filter(Boolean)
                        .join(' / ');
                      return (
                        <tr key={key}>
                          <td>{item.material_name}</td>
                          <td>{variant || 'Default'}</td>
                          <td>{item.quantity_remaining}</td>
                          <td>
                            <Form.Control
                              type="number"
                              min="0"
                              max={item.quantity_remaining}
                              step="0.0001"
                              value={modalQtyByKey[key] ?? ''}
                              onChange={(e) =>
                                setModalQtyByKey((prev) => ({ ...prev, [key]: e.target.value }))
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreateOrder} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Order'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
