import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NoWebAccess() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'var(--sitex-bg-light)' }}>
      <Card className="border-0 shadow-sm w-100" style={{ maxWidth: 520 }}>
        <Card.Body className="p-4 p-md-5 text-center">
          <div className="mb-3" style={{ fontSize: '2rem' }}>📱</div>
          <h4 className="mb-2">Web access not available</h4>
          <p className="text-muted mb-1">
            Hi {user?.username || 'User'}, your role does not have web portal access.
          </p>
          <p className="text-muted mb-4">
            Please use the SiteBox mobile app to continue your work.
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
            <Button variant="primary" onClick={handleLogout}>
              Back to Login
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
