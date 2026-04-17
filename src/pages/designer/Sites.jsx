import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { designerApi } from '../../api/axiosConfig';

export default function DesignerSites() {
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    designerApi.getSites()
      .then((res) => setSites(res?.data?.data?.individualSites || []))
      .catch((e) => {
        setSites([]);
        setError(e?.response?.data?.message || 'Failed to load sites');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter((s) =>
      String(s.site_name || '').toLowerCase().includes(q) ||
      String(s.client_name || '').toLowerCase().includes(q)
    );
  }, [search, sites]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0" style={{ color: 'var(--sitex-text-primary)' }}>Sites</h4>
      </div>
      {error && <Alert variant="warning">{error}</Alert>}
      <Form.Control
        className="mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by site or client name"
      />
      {filtered.length === 0 ? (
        <p className="small text-muted">No sites found.</p>
      ) : (
        <Row className="g-3">
          {filtered.map((s) => (
            <Col key={s.id} md={6} lg={4}>
              <Link to={`/designer/sites/${s.id}`} className="text-decoration-none text-dark">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="fw-semibold">{s.site_name || 'Site'}</div>
                    <div className="small text-muted">{s.client_name || 'Client'}</div>
                    {s.address ? <div className="small mt-2">{s.address}</div> : null}
                    <div className="mt-2"><span className="badge bg-light text-dark">{s.status || 'active'}</span></div>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
