import { useState, useEffect } from 'react';
import { Card, Button, Form, Modal, Row, Col, Alert, Spinner, ListGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/axiosConfig';
import { ROLE_NAMES, getRoleAccess } from '../../constants/roles';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    email: '',
    mobile: '',
    gender: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username ?? '',
        email: user.email ?? '',
        mobile: user.mobile ?? '',
        gender: user.gender ?? '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      username: form.username?.trim() || null,
      email: form.email?.trim() || null,
      mobile: form.mobile?.trim() || null,
      gender: form.gender?.trim() || null,
    };
    authApi
      .updateProfile(payload)
      .then((res) => {
        const updated = res.data?.data?.user;
        if (updated) updateUser(updated);
        setShowEdit(false);
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to update profile'))
      .finally(() => setSaving(false));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    const { current_password, new_password, confirm_password } = passwordForm;
    if (!current_password?.trim()) {
      setPasswordError('Enter your current password.');
      return;
    }
    if (!new_password?.trim()) {
      setPasswordError('Enter a new password.');
      return;
    }
    if (new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (new_password !== confirm_password) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    setChangingPassword(true);
    authApi
      .changePassword({ current_password: current_password.trim(), new_password: new_password.trim() })
      .then(() => {
        setPasswordSuccess(true);
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        setTimeout(() => {
          setShowPassword(false);
          setPasswordSuccess(false);
        }, 1500);
      })
      .catch((err) => setPasswordError(err.response?.data?.message || 'Failed to change password.'))
      .finally(() => setChangingPassword(false));
  };

  const openPasswordModal = () => {
    setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    setPasswordError('');
    setPasswordSuccess(false);
    setShowPassword(true);
  };

  if (!user) return null;

  const profileImage = user.profile_image || user.profile_image_url;
  const roleId = user.user_role_id;
  const roleLabel = user.role_name || ROLE_NAMES[roleId] || 'User';
  const accessItems = getRoleAccess(roleId);

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1 className="profile-page-title mb-1">Profile</h1>
        <p className="profile-page-subtitle mb-0">Your account details and access</p>
      </div>

      <Row className="g-4">
        <Col xs={12}>
          <Card className="profile-card border-0 shadow-sm w-100">
            <Card.Body className="profile-card-body">
              <div className="profile-card-inner">
                <div className="profile-card-top">
                  <div className="profile-image-wrap">
                    <div className="profile-image">
                      {profileImage ? (
                        <img src={profileImage} alt="" className="profile-image-img" />
                      ) : (
                        <span className="profile-image-initial">
                          {(user.first_name?.charAt(0) || user.username?.charAt(0) || '?').toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="profile-details">
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">User name</span>
                      <span className="profile-detail-value">{user.username ?? '—'}</span>
                    </div>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Role</span>
                      <span className="profile-detail-value">
                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            backgroundColor: 'var(--sitex-primary-alt, #0d6efd)',
                            color: '#fff',
                            fontWeight: 600,
                          }}
                        >
                          {roleLabel}
                        </span>
                      </span>
                    </div>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Email</span>
                      <span className="profile-detail-value">{user.email ?? '—'}</span>
                    </div>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Mobile number</span>
                      <span className="profile-detail-value">{user.mobile ?? '—'}</span>
                    </div>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Gender</span>
                      <span className="profile-detail-value">{user.gender ?? '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="profile-actions">
                  <Button variant="primary" className="profile-edit-btn" onClick={() => setShowEdit(true)}>
                    Edit
                  </Button>
                  <Button variant="outline-primary" className="profile-password-btn" onClick={openPasswordModal}>
                    Change password
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12}>
          <Card className="border-0 shadow-sm w-100">
            <Card.Header className="bg-white border-bottom fw-semibold d-flex align-items-center" style={{ color: 'var(--sitex-text-primary)' }}>
              <span className="me-2" aria-hidden>🔐</span>
              Your access
            </Card.Header>
            <Card.Body className="pt-3">
              <p className="text-muted small mb-3">
                As <strong>{roleLabel}</strong>, you can:
              </p>
              <ListGroup variant="flush" className="profile-access-list">
                {accessItems.map((item, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex align-items-start border-0 px-0 py-2 small"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <span className="text-success me-2 mt-1" style={{ fontSize: '0.5rem' }}>●</span>
                    <span>{item}</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showPassword} onHide={() => setShowPassword(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleChangePassword}>
          <Modal.Body>
            {passwordError && (
              <Alert variant="danger" dismissible onClose={() => setPasswordError('')} className="mb-3">
                {passwordError}
              </Alert>
            )}
            {passwordSuccess && (
              <Alert variant="success" className="mb-3">
                Password changed successfully.
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Current password</Form.Label>
              <Form.Control
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New password</Form.Label>
              <Form.Control
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 6 characters)"
                autoComplete="new-password"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm new password</Form.Label>
              <Form.Control
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPassword(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={changingPassword}>
              {changingPassword ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Changing…
                </>
              ) : (
                'Change password'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
                {error}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>User name</Form.Label>
              <Form.Control
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="User name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mobile number</Form.Label>
              <Form.Control
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Mobile number"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">—</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
