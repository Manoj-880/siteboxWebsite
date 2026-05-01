import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultPath } from '../constants/roles';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';

const PLATFORM_FEATURES = [
  { label: 'Manage multiple interior project sites from one dashboard', icon: '📍' },
  { label: 'Track project budgets, spend, and client payments', icon: '📋' },
  { label: 'Monitor attendance, payroll actions, and team productivity', icon: '✓' },
  { label: 'Control material requests, orders, and delivery flow', icon: '📊' },
];

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, defaultPath } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to={defaultPath} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(mobile, password);
      const path = getDefaultPath(res?.data?.user);
      navigate(path || defaultPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen min-vh-100 d-flex">
      {/* Left panel - platform promotion (visible on tablet+) */}
      <div className="login-brand d-none d-md-flex align-items-center justify-content-center p-4 p-lg-5">
        <div className="login-brand-inner text-white text-start" style={{ maxWidth: '400px' }}>
          <p className="login-brand-badge mb-3 text-uppercase fw-semibold opacity-90" style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            Construction & interior project management
          </p>
          <h1 className="login-brand-title mb-3 fw-bold" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', lineHeight: 1.2 }}>
            Project management software for interior design companies
          </h1>
          <p className="login-brand-tagline mb-4 opacity-90" style={{ fontSize: '1.05rem', lineHeight: 1.5 }}>
            SiteBox helps construction and interior teams manage sites, staff, budgets, payments, material orders, and daily updates from one platform.
          </p>
          <ul className="login-feature-list list-unstyled mb-0">
            {PLATFORM_FEATURES.map((item, i) => (
              <li key={i} className="d-flex align-items-center mb-3">
                <span className="login-feature-icon me-3 rounded-2 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>
                  {item.icon}
                </span>
                <span className="opacity-95" style={{ fontSize: '0.95rem' }}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel - admin login form */}
      <div className="login-form-panel d-flex align-items-center justify-content-center p-4 p-sm-5 flex-grow-1">
        <div className="login-form-wrapper w-100" style={{ maxWidth: '420px' }}>
          {/* Mobile: short platform pitch */}
          <div className="d-md-none mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--sitex-border-gray)' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, var(--sitex-primary-alt) 0%, var(--sitex-primary-light) 100%)',
                }}
              >
                <span className="fs-4 text-white fw-bold">S</span>
              </div>
              <div>
                <h2 className="fw-bold mb-0" style={{ color: 'var(--sitex-text-primary)', fontSize: '1.35rem' }}>SiteBox</h2>
                <p className="small mb-0" style={{ color: 'var(--sitex-text-muted)' }}>Construction project management software</p>
              </div>
            </div>
            <p className="small mb-0" style={{ color: 'var(--sitex-text-muted)', lineHeight: 1.4 }}>
              Built for interior design and fit-out teams to manage projects, workforce attendance, budgets, payments, tasks, and materials.
            </p>
          </div>

          {/* Admin sign-in block */}
          <div className="login-admin-block mb-4">
            <span className="login-admin-badge d-inline-block px-2 py-1 rounded mb-2" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--sitex-primary-alt)', backgroundColor: 'var(--sitex-stat-users-bg)' }}>
              Admin portal
            </span>
            <h1 className="login-title mb-1" style={{ color: 'var(--sitex-text-primary)', fontSize: '1.65rem' }}>
              Sign in
            </h1>
            <p className="login-subtitle mb-0" style={{ color: 'var(--sitex-text-muted)', fontSize: '0.9rem' }}>
              Use your registered mobile and password to access the dashboard.
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="d-flex align-items-center py-2 mb-3" style={{ borderRadius: '10px' }}>
              <span className="small">{error}</span>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: 'var(--sitex-text-primary)', fontSize: '0.9rem' }}>
                Mobile number
              </Form.Label>
              <Form.Control
                type="text"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                autoComplete="tel"
                className="login-input"
                style={{
                  borderRadius: '10px',
                  border: '1px solid var(--sitex-border-light)',
                  padding: '0.75rem 1rem',
                }}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium" style={{ color: 'var(--sitex-text-primary)', fontSize: '0.9rem' }}>
                Password
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="login-input"
                  style={{
                    borderRadius: '10px 0 0 10px',
                    border: '1px solid var(--sitex-border-light)',
                    borderRight: 'none',
                    padding: '0.75rem 1rem',
                  }}
                />
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="d-flex align-items-center justify-content-center px-3"
                  style={{
                    borderRadius: '0 10px 10px 0',
                    border: '1px solid var(--sitex-border-light)',
                    borderLeft: 'none',
                    backgroundColor: 'var(--sitex-bg-white)',
                    color: 'var(--sitex-text-muted)',
                  }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </Button>
              </InputGroup>
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100 login-btn fw-semibold py-2"
              disabled={loading}
              style={{ borderRadius: '10px', fontSize: '1rem' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign in to dashboard'
              )}
            </Button>
          </Form>

          <p className="text-center small mt-4 mb-0" style={{ color: 'var(--sitex-text-placeholder)' }}>
            Contact your administrator if you don’t have access.
          </p>
        </div>
      </div>
    </div>
  );
}
