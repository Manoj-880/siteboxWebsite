import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { companiesApi } from '../../api/axiosConfig';

/** Derive city from full address (e.g. "123 Main St, Chennai, Tamil Nadu" → "Chennai") */
function getCityFromAddress(address) {
  if (!address || typeof address !== 'string') return null;
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[1] : parts[0] || null;
}

export default function Companies() {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        (c.company_name || '').toLowerCase().includes(q) ||
        (c.username || '').toLowerCase().includes(q) ||
        (c.company_mail || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  const load = () => {
    setLoading(true);
    companiesApi
      .getAll({ limit: 500 })
      .then((res) => {
        const raw = res.data?.data;
        setCompanies(raw?.companies ?? (Array.isArray(raw) ? raw : []));
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load companies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: 'var(--sitex-primary-alt)' }} />
      </div>
    );
  }

  return (
    <div className="companies-page companies-page-redesign">
      <div className="companies-page-header">
        <div className="companies-page-title-row">
          <h1 className="companies-page-title">Companies</h1>
          {isSuperAdmin && (
            <Link
              to="/super-admin/companies/new"
              className="btn btn-primary companies-page-add-btn"
            >
              Add company
            </Link>
          )}
        </div>
        <p className="companies-page-subtitle">
          View and manage registered companies. Click a card to see full details.
        </p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="companies-page-alert">
          {error}
        </Alert>
      )}

      <div className="companies-page-toolbar">
        <InputGroup className="companies-search-wrap companies-search-redesign">
          <InputGroup.Text id="companies-search" className="companies-search-icon">
            <span className="companies-search-icon-svg" aria-hidden>⌕</span>
          </InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Search by company name, admin, email or address..."
            aria-label="Search companies"
            aria-describedby="companies-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="companies-search-input"
          />
        </InputGroup>
        {filteredCompanies.length > 0 && (
          <span className="companies-page-result-count">
            {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
          </span>
        )}
      </div>

      {companies.length === 0 ? (
        <Card className="companies-empty-card">
          <Card.Body className="companies-empty-body">
            <div className="companies-empty-icon" aria-hidden>🏢</div>
            <h3 className="companies-empty-title">No companies yet</h3>
            <p className="companies-empty-text">Companies will appear here once they register.</p>
          </Card.Body>
        </Card>
      ) : filteredCompanies.length === 0 ? (
        <Card className="companies-empty-card">
          <Card.Body className="companies-empty-body">
            <div className="companies-empty-icon" aria-hidden>🔍</div>
            <h3 className="companies-empty-title">No matches</h3>
            <p className="companies-empty-text">Try a different search term.</p>
          </Card.Body>
        </Card>
      ) : (
        <div className="companies-list">
          {filteredCompanies.map((c) => {
            const city = c.city ?? getCityFromAddress(c.address);
            const isActive = c.is_active !== 0;
            return (
              <Card
                key={c.id}
                className="company-card-redesign"
                onClick={() => navigate(`/super-admin/companies/${c.id}`)}
              >
                <Card.Body className="company-card-body">
                  <div className="company-card-logo-wrap">
                    <div className="company-card-logo">
                      {c.logo || c.logo_url ? (
                        <img
                          src={c.logo_url || c.logo}
                          alt=""
                          className="company-card-logo-img"
                        />
                      ) : (
                        <span className="company-card-logo-initial">
                          {c.company_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="company-card-content">
                    <div className="company-card-primary">
                      <h3 className="company-card-name">{c.company_name}</h3>
                      <p className="company-card-admin">
                        <span className="company-card-admin-label">Admin</span>
                        <span className="company-card-admin-value">{c.username || '—'}</span>
                      </p>
                    </div>
                    <div className="company-card-meta">
                      {isActive ? (
                        <span className="company-card-badge company-card-badge-active">Active</span>
                      ) : (
                        <span className="company-card-badge company-card-badge-inactive">Inactive</span>
                      )}
                      {c.established_year && (
                        <span className="company-card-meta-item">Founded {c.established_year}</span>
                      )}
                      {city && (
                        <span className="company-card-meta-item company-card-meta-location">{city}</span>
                      )}
                      {(c.company_mail || c.mobile) && (
                        <span className="company-card-meta-item company-card-meta-contact">
                          {c.company_mail || c.mobile}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="company-card-arrow" aria-hidden>
                    →
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
