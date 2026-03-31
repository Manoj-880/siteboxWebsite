import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Col, Row, Spinner } from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';
import { encodeMaterialRequestId } from '../../utils/materialRequestHash';

export default function AdminMaterialRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const requestsRes = await adminApi.getMaterialRequests();
      const nextRequests = requestsRes.data?.data?.material_requests || [];
      setRequests(nextRequests);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load material requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  };

  return (
    <div className="admin-material-requests">
      <div className="admin-page-header mb-4">
        <h1 className="admin-page-title mb-1">Material Requests</h1>
        <p className="admin-page-subtitle mb-0">Approve supervisor requests by assigning vendors</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="py-5 text-center text-muted">
            No pending material requests.
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {requests.map((req) => (
            <Col xs={12} md={6} xl={4} key={req.id}>
              <Card
                className="border-0 shadow-sm h-100"
                role="button"
                onClick={() => navigate(`/admin/material-request/${encodeMaterialRequestId(req.id)}`)}
              >
                <Card.Body>
                  <div className="fw-semibold mb-2">Request #{req.id}</div>
                  <div className="small text-muted mb-1">Site: {req.site_name || '—'}</div>
                  <div className="small text-muted mb-1">
                    Supervisor: {req.supervisor?.name || req.requested_by_name || '—'}
                  </div>
                  <div className="small text-muted mb-1">Created: {formatDateTime(req.created_at)}</div>
                  <div className="small text-muted mb-1">
                    Community: {req.community_name || 'Individual Site'}
                  </div>
                  <div className="small text-muted">
                    Materials: {req.materials_count ?? (req.items || []).length}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
