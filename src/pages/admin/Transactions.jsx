import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Form, Spinner, Table } from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';

function TypeBadge({ type }) {
  const normalized = String(type || '');
  const variant = normalized === 'staff' ? 'info' : normalized === 'order' ? 'warning' : 'primary';
  const label = normalized === 'client' ? 'Site' : normalized;
  return <Badge bg={variant} className="text-uppercase">{label}</Badge>;
}

function formatDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function AdminTransactions() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [types, setTypes] = useState({ staff: true, client: true, order: true });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const selectedTypes = useMemo(() => Object.keys(types).filter((k) => types[k]), [types]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError('');
      if (selectedTypes.length === 0) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        const res = await adminApi.getTransactions({
          types: selectedTypes.join(','),
          q: debouncedQ || undefined,
        });
        if (!mounted) return;
        setTransactions(res.data?.data?.transactions || []);
      } catch (err) {
        if (!mounted) return;
        setTransactions([]);
        const msg = err?.response?.data?.message || err?.message || 'Failed to load transactions';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedTypes.join(','), debouncedQ]);

  return (
    <div className="admin-payments">
      <div className="admin-page-header mb-4">
        <h1 className="admin-page-title mb-1">Transactions</h1>
        <p className="admin-page-subtitle mb-0">Search and filter all staff, site, and order payments</p>
      </div>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">
            <div style={{ minWidth: 280 }}>
              <Form.Label className="small text-muted mb-1">Search</Form.Label>
              <Form.Control
                value={q}
                placeholder="Client name, staff name, site name, order id, transaction id..."
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="d-flex flex-wrap gap-3 align-items-center">
              <div>
                <Form.Label className="small text-muted mb-1">Filters</Form.Label>
                <div className="d-flex gap-3 flex-wrap">
                  <Form.Check
                    type="checkbox"
                    id="tx-filter-staff"
                    label="Staff"
                    checked={types.staff}
                    onChange={(e) => setTypes((prev) => ({ ...prev, staff: e.target.checked }))}
                  />
                  <Form.Check
                    type="checkbox"
                    id="tx-filter-sites"
                    label="Sites"
                    checked={types.client}
                    onChange={(e) => setTypes((prev) => ({ ...prev, client: e.target.checked }))}
                  />
                  <Form.Check
                    type="checkbox"
                    id="tx-filter-orders"
                    label="Orders"
                    checked={types.order}
                    onChange={(e) => setTypes((prev) => ({ ...prev, order: e.target.checked }))}
                  />
                </div>
              </div>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setQ('');
                  setTypes({ staff: true, client: true, order: true });
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {error ? <div className="text-danger small mt-3">{error}</div> : null}
        </Card.Body>
      </Card>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" style={{ color: 'var(--sitex-primary-alt)' }} />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-muted text-center py-4">No transactions found.</div>
      ) : (
        <Table responsive className="mb-0">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Type</th>
              <th>Details</th>
              <th>Amount</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const details =
                t.type === 'staff' ? (
                  <span>
                    {t.staff_name || '-'} {t.staff_role ? <span className="text-muted">({t.staff_role})</span> : null}
                  </span>
                ) : t.type === 'client' ? (
                  <span>
                    {t.client_name || '-'} <span className="text-muted">({t.site_name || '-'})</span>
                  </span>
                ) : (
                  <span>
                    #{t.order_id || t.ref_id || '-'}{' '}
                    <span className="text-muted">({t.order_site_name || '-'})</span>
                    {t.order_vendor_name ? <span className="text-muted"> · {t.order_vendor_name}</span> : null}
                  </span>
                );

              return (
                <tr key={t.transaction_id}>
                  <td>{t.transaction_code || `#${t.transaction_id}`}</td>
                  <td><TypeBadge type={t.type} /></td>
                  <td>{details}</td>
                  <td>₹{t.amount ?? 0}</td>
                  <td>{formatDateTime(t.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}

