import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { superAdminApi } from '../../api/axiosConfig';

export default function Units() {
  const { isSuperAdmin, defaultPath } = useAuth();
  const [units, setUnits] = useState([]);
  const [measuring_unit, setMeasuring_unit] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUnits = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return units;
    return units.filter((u) =>
      (u.measuring_unit || '').toLowerCase().includes(q)
    );
  }, [units, searchQuery]);

  const load = () => {
    superAdminApi.getUnits()
      .then((res) => {
        const raw = res.data?.data;
        setUnits(Array.isArray(raw) ? raw : (raw?.units || []));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load units'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = measuring_unit.trim();
    if (!name) return;
    setError('');
    setSaving(true);
    superAdminApi.createUnit({ measuring_unit: name })
      .then(() => {
        setMeasuring_unit('');
        load();
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Create failed'))
      .finally(() => setSaving(false));
  };

  if (!isSuperAdmin) return <Navigate to={defaultPath} replace />;
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: 'var(--sitex-primary-alt)' }} />
      </div>
    );
  }

  return (
    <div className="units-page">
      <div className="units-page-header">
        <h1 className="units-page-title">Units</h1>
        <p className="units-page-subtitle">
          Measuring units (e.g. kg, m, pcs). Add new units below.
        </p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="units-page-alert mb-3">
          {error}
        </Alert>
      )}

      <Card className="units-add-card border-0 shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit} className="units-add-form">
            <div className="units-add-fields">
              <Form.Group className="units-add-input-wrap">
                <Form.Label className="small mb-1">New unit name</Form.Label>
                <Form.Control
                  value={measuring_unit}
                  onChange={(e) => setMeasuring_unit(e.target.value)}
                  placeholder="e.g. kg, m, pcs"
                  required
                  className="units-add-input"
                />
              </Form.Group>
              <div className="units-add-btn-wrap">
                <Button type="submit" variant="primary" disabled={saving} className="units-add-btn">
                  {saving ? 'Adding…' : 'Add unit'}
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <div className="units-toolbar mb-3">
        <InputGroup className="units-search-wrap">
          <InputGroup.Text id="units-search" className="units-search-icon">
            <span className="units-search-icon-svg" aria-hidden>⌕</span>
          </InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Search units..."
            aria-label="Search units"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="units-search-input"
          />
        </InputGroup>
        {filteredUnits.length > 0 && (
          <span className="units-result-count">
            {filteredUnits.length} {filteredUnits.length === 1 ? 'unit' : 'units'}
          </span>
        )}
      </div>

      {units.length === 0 ? (
        <Card className="units-empty-card border-0 shadow-sm">
          <Card.Body className="units-empty-body">
            <div className="units-empty-icon" aria-hidden>📐</div>
            <h3 className="units-empty-title">No units yet</h3>
            <p className="units-empty-text">Add a unit using the form above.</p>
          </Card.Body>
        </Card>
      ) : filteredUnits.length === 0 ? (
        <Card className="units-empty-card border-0 shadow-sm">
          <Card.Body className="units-empty-body">
            <div className="units-empty-icon" aria-hidden>🔍</div>
            <h3 className="units-empty-title">No matches</h3>
            <p className="units-empty-text">Try a different search term.</p>
          </Card.Body>
        </Card>
      ) : (
        <div className="units-list">
          {filteredUnits.map((u) => (
            <div key={u.id} className="unit-card">
              <span className="unit-card-name">{u.measuring_unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
