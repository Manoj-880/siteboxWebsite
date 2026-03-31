import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { companiesApi } from '../../api/axiosConfig';

export default function CompanyDetails() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    companiesApi
      .getById(id)
      .then((res) => setCompany(res.data?.data?.company || null))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load company'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!company) return <Alert variant="warning">Company not found.</Alert>;

  const c = company;

  return (
    <>
      <div className="mb-3">
        <Link to="/super-admin/companies" className="company-details-back-link">
          Back to companies
        </Link>
      </div>

      <Card className="border-0 shadow-sm mb-3 company-details-card">
        <Card.Body className="company-details-card-body">
          <div className="company-details-card-inner">
            <Row className="align-items-start">
              <Col xs="auto" className="mb-3 mb-md-0">
                <div className="rounded-3 bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ width: 80, height: 80 }}>
                  {c.logo || c.logo_url ? (
                    <img src={c.logo_url || c.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="text-muted fw-bold" style={{ fontSize: '2rem' }}>{c.company_name?.charAt(0)?.toUpperCase() || '?'}</span>
                  )}
                </div>
              </Col>
              <Col>
                <h5 className="mb-1">{c.company_name}</h5>
                {c.established_year && <p className="small text-muted mb-1">Founded {c.established_year}</p>}
                {c.username && <p className="small mb-0"><strong>Admin:</strong> {c.username}</p>}
                {c.description && <p className="mt-2 mb-0 small">{c.description}</p>}
              </Col>
            </Row>
            <div className="company-details-edit-wrap">
              <Link to={`/super-admin/companies/${id}/edit`} className="btn btn-primary btn-sm">
                Edit
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row>
        <Col xs={12} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold" style={{ color: 'var(--sitex-text-primary)' }}>Company</Card.Header>
            <Card.Body className="small">
              {c.address && <p className="mb-2"><strong>Address:</strong><br />{c.address}</p>}
              {c.company_mail && <p className="mb-2"><strong>Email:</strong> {c.company_mail}</p>}
              {c.mobile && <p className="mb-2"><strong>Phone:</strong> {c.mobile}</p>}
              {c.website_link && <p className="mb-0"><strong>Website:</strong> <a href={c.website_link} target="_blank" rel="noopener noreferrer">{c.website_link}</a></p>}
              {!c.address && !c.company_mail && !c.mobile && !c.website_link && <p className="text-muted mb-0">—</p>}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold" style={{ color: 'var(--sitex-text-primary)' }}>Admin contact</Card.Header>
            <Card.Body className="small">
              {(c.admin_email || c.useremail) && <p className="mb-2"><strong>Email:</strong> {c.admin_email || c.useremail}</p>}
              {(c.admin_mobile || c.usermobile) && <p className={c.admin_email || c.useremail ? 'mb-2' : 'mb-0'}><strong>Phone:</strong> {c.admin_mobile || c.usermobile}</p>}
              {!(c.admin_email || c.useremail) && !(c.admin_mobile || c.usermobile) && (c.username ? <p className="text-muted mb-0">Admin: {c.username}</p> : <p className="text-muted mb-0">—</p>)}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
