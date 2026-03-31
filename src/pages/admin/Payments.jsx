import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Spinner, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';
import { ROLE_IDS, ROLE_NAMES } from '../../constants/roles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';

function FinancialCard({ toPay, toReceive }) {
  return (
    <Card className="admin-payments-financial border-0 shadow-sm mb-4 overflow-hidden">
      <Card.Body className="admin-payments-financial-body">
        <Row className="align-items-center g-0">
          <Col xs={5} className="text-white pe-3">
            <div className="admin-payments-amount">{toPay ?? '0'}</div>
            <div className="admin-payments-label">To Pay</div>
          </Col>
          <Col xs={2} className="text-center">
            <div className="admin-payments-divider" />
          </Col>
          <Col xs={5} className="text-white ps-3">
            <div className="admin-payments-amount">{toReceive ?? '0'}</div>
            <div className="admin-payments-label">To Receive</div>
          </Col>
        </Row>
        <div className="admin-payments-wallet-icon" aria-hidden>💰</div>
      </Card.Body>
    </Card>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || 'pending').trim().toLowerCase();
  const variant = normalized === 'paid' ? 'success' : 'warning';
  return <Badge bg={variant}>{normalized}</Badge>;
}

function isPaidStatus(status) {
  return String(status || 'pending').trim().toLowerCase() === 'paid';
}

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState('staff');
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);
  const [clientsData, setClientsData] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const [selectedStaffRole, setSelectedStaffRole] = useState(null);

  const [txModal, setTxModal] = useState({ open: false, site: null });
  const [txAmount, setTxAmount] = useState('');
  const [txError, setTxError] = useState('');

  const loadStaff = async () => {
    const res = await adminApi.getPaymentsStaff();
    setStaffData(res.data?.data || null);
  };
  const loadOrders = async () => {
    const res = await adminApi.getPaymentsOrders();
    setOrdersData(res.data?.data || null);
  };
  const loadClients = async () => {
    const res = await adminApi.getPaymentsClients();
    setClientsData(res.data?.data || null);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Promise.all([loadStaff(), loadOrders(), loadClients()]);
      } catch (_) {
        if (mounted) {
          setStaffData(null);
          setOrdersData(null);
          setClientsData(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const staff = staffData?.staff || [];
  const orders = ordersData?.orders || [];
  const clients = clientsData?.clients || [];

  const staffPendingCount = staff.filter((s) => !isPaidStatus(s.status)).length;
  const ordersPendingCount = orders.filter((o) => !isPaidStatus(o.status)).length;

  const formatINR = (value) => {
    const num = value == null ? NaN : Number(value);
    if (!Number.isFinite(num)) return '—';
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatDateOnly = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString();
  };

  const paymentRoles = useMemo(() => {
    // Salary-based roles only. Vendor/Factory are task-based (no salary record).
    return [
      ROLE_NAMES[ROLE_IDS.SUPERVISOR],
      ROLE_NAMES[ROLE_IDS.DESIGNER],
      ROLE_NAMES[ROLE_IDS.CONTRACTOR],
      ROLE_NAMES[ROLE_IDS.PROJECT_MANAGER],
      ROLE_NAMES[ROLE_IDS.PURCHASE_TEAM],
      ROLE_NAMES[ROLE_IDS.ACCOUNTANT],
      ROLE_NAMES[ROLE_IDS.SALES],
      ROLE_NAMES[ROLE_IDS.OFFICE_STAFF],
    ].filter(Boolean);
  }, []);

  const staffRoleSummaries = useMemo(() => {
    const map = new Map(paymentRoles.map((r) => [r, { role: r, pendingAmount: 0, pendingCount: 0 }]));
    for (const s of staff) {
      const role = s.role || 'Unknown';
      if (!map.has(role)) map.set(role, { role, pendingAmount: 0, pendingCount: 0 });
      const summary = map.get(role);
      const pending = !isPaidStatus(s.status);
      if (pending) {
        const amt = s.salary == null ? 0 : Number(s.salary);
        summary.pendingAmount += Number.isFinite(amt) ? amt : 0;
        summary.pendingCount += 1;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.pendingAmount - a.pendingAmount || a.role.localeCompare(b.role));
  }, [paymentRoles, staff]);

  const selectedRolePending = selectedStaffRole
    ? staffRoleSummaries.find((r) => r.role === selectedStaffRole)?.pendingAmount ?? 0
    : 0;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: 'var(--sitex-primary-alt)' }} />
      </div>
    );
  }

  const onMarkAllStaffPaid = async () => {
    try {
      setBusyKey('staff:all');
      await adminApi.markAllStaffPaid();
      await loadStaff();
    } finally {
      setBusyKey(null);
    }
  };

  const onMarkStaffPaid = async (userId) => {
    try {
      setBusyKey(`staff:${userId}`);
      await adminApi.markStaffPaid(userId);
      // Optimistic UI update for instant feedback.
      setStaffData((prev) => {
        if (!prev?.staff) return prev;
        return {
          ...prev,
          staff: prev.staff.map((s) =>
            s.user_id === userId
              ? { ...s, status: 'paid', paid_at: new Date().toISOString() }
              : s
          ),
        };
      });
      await loadStaff();
    } finally {
      setBusyKey(null);
    }
  };

  const onMarkOrderPaid = async (orderId) => {
    try {
      setBusyKey(`order:${orderId}`);
      await adminApi.markOrderPaid(orderId);
      await loadOrders();
    } finally {
      setBusyKey(null);
    }
  };

  const openTxModal = (site) => {
    setTxAmount('');
    setTxError('');
    setTxModal({ open: true, site });
  };

  const closeTxModal = () => {
    setTxModal({ open: false, site: null });
    setTxAmount('');
    setTxError('');
  };

  const submitTx = async () => {
    const site = txModal.site;
    if (!site) return;
    const amount = Number(txAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const remaining = Number(site.remaining ?? 0);
    if (Number.isFinite(remaining) && amount > remaining) {
      setTxError('Amount cannot be greater than remaining amount.');
      return;
    }
    try {
      setBusyKey(`tx:${site.site_id}`);
      await adminApi.addClientTransaction(site.site_id, amount);
      await loadClients();
      closeTxModal();
      setTxError('');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save transaction';
      setTxError(msg);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="admin-payments">
      <div className="admin-page-header mb-4">
        <h1 className="admin-page-title mb-1">Payments</h1>
        <p className="admin-page-subtitle mb-0">Staff, orders, and client payments</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-3">
        <TabsList>
          <TabsTrigger value="staff">
            Staff{staffPendingCount ? ` (${staffPendingCount} pending)` : ''}
          </TabsTrigger>
          <TabsTrigger value="orders">
            Orders{ordersPendingCount ? ` (${ordersPendingCount} pending)` : ''}
          </TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body>
              <Row className="g-3">
                <Col md={4} lg={3} className="bg-body-tertiary rounded-3 p-3">
                  <div className="fw-semibold mb-2">Roles</div>
                  <Tabs value={selectedStaffRole ?? ''} onValueChange={setSelectedStaffRole}>
                    <TabsList className="d-flex flex-column gap-2 bg-transparent p-0">
                      {staffRoleSummaries.map((r) => (
                        <TabsTrigger
                          key={r.role}
                          value={r.role}
                          className="admin-payments-category-card text-start w-100 d-flex flex-column align-items-start"
                        >
                          <div className="fw-bold fs-6">{r.role}</div>
                          <div className="small text-muted">
                            Pending: {formatINR(r.pendingAmount)}
                            {r.pendingCount ? ` (${r.pendingCount})` : ''}
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </Col>

                <Col>
                  {!selectedStaffRole ? (
                    <div className="h-100 d-flex align-items-center justify-content-center text-center rounded-3 border bg-white py-5 px-3">
                      <div style={{ maxWidth: 520 }}>
                        <div className="fw-semibold mb-1">Select a role to view staff</div>
                        <div className="text-muted small">
                          Choose a role from the left to see employees, their cycle details, and pay status.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                        <div>
                          <div className="fw-semibold">{selectedStaffRole}</div>
                          <div className="small text-muted">Pending amount: {formatINR(selectedRolePending)}</div>
                        </div>
                        <Button variant="link" className="p-0 text-decoration-none" onClick={() => setSelectedStaffRole(null)}>
                          Clear selection
                        </Button>
                      </div>

                      <Table responsive className="mb-0 table-hover align-middle">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Amount / Cycle</th>
                            <th>Status</th>
                            <th className="text-end">Pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {staff.filter((s) => s.role === selectedStaffRole).length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-muted text-center py-4">
                                No staff added for this role yet.
                              </td>
                            </tr>
                          ) : (
                            staff
                              .filter((s) => s.role === selectedStaffRole)
                              .sort((a, b) => {
                                const ap = !isPaidStatus(a.status) ? 0 : 1;
                                const bp = !isPaidStatus(b.status) ? 0 : 1;
                                return ap - bp || a.name.localeCompare(b.name);
                              })
                              .map((s) => {
                                const pending = !isPaidStatus(s.status);
                                const range =
                                  s.cycle_start_date || s.cycle_end_date
                                    ? `${formatDateOnly(s.cycle_start_date)} - ${formatDateOnly(s.cycle_end_date)}`
                                    : '';
                                return (
                                  <tr key={s.user_id}>
                                    <td>
                                      <div className="fw-semibold">{s.name}</div>
                                      <div className="small text-muted">{s.mobile}</div>
                                    </td>
                                    <td>
                                      <div className="fw-semibold">{formatINR(s.salary)}</div>
                                      <div className="small text-muted">
                                        {s.payment_cycle}
                                        {range ? ` · ${range}` : ''}
                                      </div>
                                    </td>
                                    <td>
                                      <StatusBadge status={s.status} />
                                    </td>
                                    <td className="text-end">
                                      {pending ? (
                                        <Button
                                          size="sm"
                                          variant="outline-success"
                                          disabled={busyKey === `staff:${s.user_id}`}
                                          onClick={() => onMarkStaffPaid(s.user_id)}
                                        >
                                          {busyKey === `staff:${s.user_id}` ? 'Paying…' : 'Pay'}
                                        </Button>
                                      ) : (
                                        <span className="text-muted small">paid</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </Table>
                    </>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body>
              <div className="fw-semibold mb-3">Delivered orders (pending first)</div>

              {orders.length === 0 ? (
                <div className="text-muted text-center py-4">No delivered orders found.</div>
              ) : (
                <Table responsive className="mb-0 table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Site</th>
                      <th>Vendor</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const pending = !isPaidStatus(o.status);
                      return (
                        <tr key={o.order_id}>
                          <td>#{o.order_id}</td>
                          <td>{o.site_name}</td>
                          <td>{o.vendor_name || '-'}</td>
                          <td>₹{o.amount ?? 0}</td>
                          <td>
                            <StatusBadge status={o.status} />
                          </td>
                          <td className="text-end">
                            {pending ? (
                              <Button
                                size="sm"
                                variant="outline-success"
                                disabled={busyKey === `order:${o.order_id}`}
                                onClick={() => onMarkOrderPaid(o.order_id)}
                              >
                                {busyKey === `order:${o.order_id}` ? 'Marking…' : 'Mark as paid'}
                              </Button>
                            ) : (
                              <span className="text-muted small">Paid</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body>
              <div className="fw-semibold mb-3">Client payments (budget vs transactions)</div>

              {clients.length === 0 ? (
                <div className="text-muted text-center py-4">No clients found.</div>
              ) : (
                <Table responsive className="mb-0 table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Mobile</th>
                      <th>Site</th>
                      <th>Budget</th>
                      <th>Paid</th>
                      <th>Remaining</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => (
                      <tr key={c.site_id}>
                        <td className="fw-semibold">{c.client_name}</td>
                        <td>{c.client_phone || '-'}</td>
                        <td>{c.site_name}</td>
                        <td>₹{c.budget ?? 0}</td>
                        <td>₹{c.paid ?? 0}</td>
                        <td>₹{c.remaining ?? 0}</td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            disabled={busyKey === `tx:${c.site_id}`}
                            onClick={() => openTxModal(c)}
                          >
                            Add transaction
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          <Modal show={txModal.open} onHide={closeTxModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Add transaction</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="small text-muted mb-2">
                {txModal.site ? `${txModal.site.client_name} · ${txModal.site.site_name}` : ''}
              </div>
              {txModal.site ? (
                <div className="small text-muted mb-3">Remaining: ₹{txModal.site.remaining ?? 0}</div>
              ) : null}
              <Form.Group>
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  min="0"
                  max={txModal.site ? txModal.site.remaining ?? undefined : undefined}
                />
              </Form.Group>
              {txError ? <div className="text-danger small mt-2">{txError}</div> : null}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeTxModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={submitTx}
                disabled={
                  !Number.isFinite(Number(txAmount)) ||
                  Number(txAmount) <= 0 ||
                  (!!busyKey) ||
                  (txModal.site && Number.isFinite(Number(txModal.site.remaining ?? 0)) && Number(txAmount) > Number(txModal.site.remaining ?? 0))
                }
              >
                {busyKey && txModal.site ? 'Saving…' : 'Save'}
              </Button>
            </Modal.Footer>
          </Modal>
        </TabsContent>
      </Tabs>
    </div>
  );
}
