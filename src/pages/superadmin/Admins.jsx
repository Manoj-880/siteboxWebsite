import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { superAdminApi, companiesApi } from '../../api/axiosConfig';

export default function Admins() {
  const { isSuperAdmin, defaultPath } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ username: '', mobile: '', company_id: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    companiesApi.getAll({ limit: 500 })
      .then((res) => setCompanies(res.data?.data?.companies || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, [isSuperAdmin]);

  if (!isSuperAdmin) return <Navigate to={defaultPath} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company_id) {
      setError('Please select a company');
      return;
    }
    setError('');
    setSuccess('');
    setSaving(true);
    superAdminApi.createAdmin({
      username: form.username.trim(),
      mobile: form.mobile.trim(),
      company_id: parseInt(form.company_id, 10),
    })
      .then(() => {
        setSuccess('Admin created. Default password is the mobile number.');
        setForm({ username: '', mobile: '', company_id: form.company_id });
      })
      .catch((err) => setError(err.response?.data?.message || 'Create failed'))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" />
      </div>
    );
  }

  return (
    <>
      <h4 className="mb-3">Create admin</h4>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col xs={12} sm={6} md={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Username *</Form.Label>
                  <Form.Control
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Mobile * (also default password)</Form.Label>
                  <Form.Control
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Company *</Form.Label>
                  <Form.Select
                    name="company_id"
                    value={form.company_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select company</option>
                    {companies.filter((c) => c.is_active !== 0).map((c) => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create admin'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
