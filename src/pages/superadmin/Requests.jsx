import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, Spinner, Table } from 'react-bootstrap';
import { superAdminApi } from '../../api/axiosConfig';

function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function Requests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setLoading(true);
    superAdminApi
      .getCompanyOnboardingRequests()
      .then((res) => {
        const list = res.data?.data?.requests;
        setRows(Array.isArray(list) ? list : []);
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.company_name, r.contact_person, r.email, r.mobile, r.city, r.request_status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(s)
    );
  }, [rows, q]);

  const statusVariant = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'approved') return 'success';
    if (normalized === 'rejected') return 'danger';
    if (normalized === 'reviewed') return 'info';
    return 'warning';
  };

  const updateStatus = async (id, nextStatus) => {
    setBusyId(id);
    setError('');
    try {
      await superAdminApi.updateCompanyOnboardingRequestStatus(id, nextStatus);
      setRows((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(id) ? { ...item, request_status: nextStatus } : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update request status');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div>
          <h4 className="mb-1">Company Requests</h4>
          <p className="text-muted mb-0">Incoming registration requests from the landing website.</p>
        </div>
        <Form.Control
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search requests..."
          style={{ maxWidth: 320 }}
        />
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm d-none d-md-block">
        <Card.Body className="p-0">
          {filtered.length === 0 ? (
            <div className="p-4 text-muted">No requests found.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Mobile</th>
                    <th>City</th>
                    <th>Team size</th>
                    <th>Status</th>
                    <th>Requested at</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="fw-semibold">{r.company_name || '—'}</div>
                        <div className="small text-muted">{r.email || '—'}</div>
                      </td>
                      <td>{r.contact_person || '—'}</td>
                      <td>{r.mobile || '—'}</td>
                      <td>{r.city || '—'}</td>
                      <td>{r.employee_count || '—'}</td>
                      <td>
                        <Badge bg={statusVariant(r.request_status)} className="text-uppercase">
                          {r.request_status || 'pending'}
                        </Badge>
                      </td>
                      <td>{fmtDate(r.created_at)}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            size="sm"
                            variant="outline-success"
                            disabled={busyId === r.id}
                            onClick={() => updateStatus(r.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            disabled={busyId === r.id}
                            onClick={() => updateStatus(r.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="d-md-none mt-3">
        {filtered.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-muted">No requests found.</Card.Body>
          </Card>
        ) : (
          filtered.map((r) => (
            <Card key={r.id} className="border-0 shadow-sm mb-2">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div className="fw-semibold">{r.company_name || '—'}</div>
                    <div className="small text-muted">{r.contact_person || '—'}</div>
                  </div>
                  <Badge bg={statusVariant(r.request_status)} className="text-uppercase">
                    {r.request_status || 'pending'}
                  </Badge>
                </div>
                <div className="small text-muted mt-2">{r.email || '—'} • {r.mobile || '—'}</div>
                <div className="small text-muted">{r.city || '—'} • team {r.employee_count || '—'}</div>
                <div className="small text-muted mb-2">Requested {fmtDate(r.created_at)}</div>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-success"
                    disabled={busyId === r.id}
                    onClick={() => updateStatus(r.id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    disabled={busyId === r.id}
                    onClick={() => updateStatus(r.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

