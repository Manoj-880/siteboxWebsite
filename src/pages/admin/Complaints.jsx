import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';

const statusVariant = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'inactive') return 'success';
  if (normalized === 'deleted') return 'secondary';
  return 'warning';
};

export default function AdminComplaints() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [query, setQuery] = useState('');
  const [siteId, setSiteId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getSiteComplaints();
      setRows(res?.data?.data?.complaints || []);
    } catch (e) {
      setRows([]);
      setError(e?.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [row.site_name, row.subject, row.message_body, row.sent_by_name, row.record_status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [rows, query]);

  const createComplaint = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const normalizedSiteId = Number(siteId);
    if (!Number.isInteger(normalizedSiteId) || normalizedSiteId <= 0) {
      setError('Please enter a valid site ID.');
      return;
    }
    if (!subject.trim() && !message.trim()) {
      setError('Please add subject or message for the complaint.');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('site_id', String(normalizedSiteId));
      if (subject.trim()) fd.append('subject', subject.trim());
      if (message.trim()) fd.append('message_body', message.trim());
      await adminApi.createSiteComplaint(fd);
      setSuccess('Complaint created successfully.');
      setSiteId('');
      setSubject('');
      setMessage('');
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to create complaint');
    }
  };

  const markResolved = async (id) => {
    setBusyId(id);
    setError('');
    setSuccess('');
    try {
      await adminApi.updateSiteComplaint(id, { record_status: 'inactive' });
      setSuccess('Complaint marked as resolved.');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update complaint status');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div>
          <h4 className="mb-1">Complaints</h4>
          <p className="text-muted mb-0">Track and resolve site-level complaints raised by admin and supervisor.</p>
        </div>
        <Form.Control
          type="search"
          placeholder="Search complaints..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <Form onSubmit={createComplaint}>
            <Row className="g-2">
              <Col xs={12} md={2}>
                <Form.Control
                  placeholder="Site ID"
                  type="number"
                  min="1"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <Form.Control
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Col>
              <Col xs={12} md={4}>
                <Form.Control
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Col>
              <Col xs={12} md={2} className="d-grid">
                <Button type="submit">Add Complaint</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-muted">No complaints found.</Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {filtered.map((row) => (
            <Col xs={12} md={6} xl={4} key={row.id}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-semibold">{row.subject || 'Complaint'}</div>
                      <div className="small text-muted">{row.site_name || `Site #${row.site_id || '-'}`}</div>
                    </div>
                    <Badge bg={statusVariant(row.record_status)} className="text-uppercase">
                      {row.record_status || 'active'}
                    </Badge>
                  </div>
                  <div className="small">{row.message_body || 'No additional message.'}</div>
                  <div className="small text-muted mt-auto">
                    Raised by {row.sent_by_name || 'User'} {row.created_at ? `• ${new Date(row.created_at).toLocaleString()}` : ''}
                  </div>
                  {String(row.record_status || '').toLowerCase() === 'active' && (
                    <div className="d-grid mt-1">
                      <Button
                        size="sm"
                        variant="outline-success"
                        disabled={busyId === row.id}
                        onClick={() => markResolved(row.id)}
                      >
                        {busyId === row.id ? 'Updating...' : 'Mark Resolved'}
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
