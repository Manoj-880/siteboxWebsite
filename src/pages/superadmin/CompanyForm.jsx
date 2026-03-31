import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { companiesApi, superAdminApi } from '../../api/axiosConfig';

const companyFields = {
  company_name: '',
  website_link: '',
  company_mail: '',
  mobile: '',
  address: '',
  reg_no: '',
  description: '',
  established_year: '',
  logo: null,
};

const adminFields = {
  admin_username: '',
  admin_mobile: '',
  admin_email: '',
  admin_gender: '',
};

const initial = { ...companyFields, ...adminFields };

export default function CompanyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const isEdit = !!id;
  const isNewCompany = !isEdit;
  if (!isEdit && !isSuperAdmin) return <Navigate to="/super-admin/companies" replace />;

  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    companiesApi.getById(id)
      .then((res) => {
        const c = res.data?.data?.company || {};
        setForm({
          ...initial,
          company_name: c.company_name || '',
          website_link: c.website_link || '',
          company_mail: c.company_mail || '',
          mobile: c.mobile || '',
          address: c.address || '',
          reg_no: c.reg_no || '',
          description: c.description || '',
          established_year: c.established_year ? String(c.established_year) : '',
          logo: null,
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load company'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFile = (e) => {
    setForm((f) => ({ ...f, logo: e.target.files?.[0] || null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNewCompany && step === 1) {
      setStep(2);
      setError('');
      return;
    }
    setError('');
    setSaving(true);
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'logo') {
        if (v) body.append('logo', v);
      } else if (v != null && v !== '') body.append(k, v);
    });

    const req = isEdit ? superAdminApi.updateCompany(id, body) : superAdminApi.createCompany(body);
    req
      .then(() => navigate('/super-admin/companies', { replace: true }))
      .catch((err) => setError(err.response?.data?.message || 'Save failed'))
      .finally(() => setSaving(false));
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" />
      </div>
    );
  }

  const showStep1 = isEdit || step === 1;
  const showStep2 = isNewCompany && step === 2;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h4 className="mb-0">
          {isEdit ? 'Edit company' : 'New company'}
          {isNewCompany && (
            <span className="ms-2 text-muted fw-normal small">Step {step} of 2</span>
          )}
        </h4>
        <Link to="/super-admin/companies" className="btn btn-outline-secondary btn-sm">Back</Link>
      </div>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Step 1: Company details */}
        {showStep1 && (
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom fw-semibold" style={{ color: 'var(--sitex-text-primary)' }}>
              Company details
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Company name *</Form.Label>
                    <Form.Control
                      name="company_name"
                      value={form.company_name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                      name="website_link"
                      type="url"
                      value={form.website_link}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      name="company_mail"
                      type="email"
                      value={form.company_mail}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Mobile</Form.Label>
                    <Form.Control
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-2">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </Form.Group>
              <Row>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Reg. no</Form.Label>
                    <Form.Control name="reg_no" value={form.reg_no} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Established year</Form.Label>
                    <Form.Control
                      name="established_year"
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={form.established_year}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  name="description"
                  as="textarea"
                  rows={2}
                  value={form.description}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Logo</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleFile} />
              </Form.Group>
              {isNewCompany ? (
                <Button type="submit" variant="primary">
                  Next: Admin details
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Update'}
                  </Button>
                  <Link to="/super-admin/companies" className="btn btn-outline-secondary">Cancel</Link>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Step 2: Admin details (new company only) */}
        {showStep2 && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom fw-semibold" style={{ color: 'var(--sitex-text-primary)' }}>
              Admin details
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Admin username *</Form.Label>
                    <Form.Control
                      name="admin_username"
                      value={form.admin_username}
                      onChange={handleChange}
                      required
                      placeholder="e.g. company_admin"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Admin mobile *</Form.Label>
                    <Form.Control
                      name="admin_mobile"
                      value={form.admin_mobile}
                      onChange={handleChange}
                      required
                      placeholder="10–15 digits"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Admin email</Form.Label>
                    <Form.Control
                      name="admin_email"
                      type="email"
                      value={form.admin_email}
                      onChange={handleChange}
                      placeholder="admin@example.com"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      name="admin_gender"
                      value={form.admin_gender}
                      onChange={handleChange}
                    >
                      <option value="">—</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex gap-2 mt-3">
                <Button type="button" variant="outline-secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Creating…' : 'Create company'}
                </Button>
                <Link to="/super-admin/companies" className="btn btn-outline-secondary">Cancel</Link>
              </div>
            </Card.Body>
          </Card>
        )}
      </Form>
    </>
  );
}
