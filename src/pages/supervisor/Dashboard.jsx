import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from 'react-bootstrap';

export default function SupervisorDashboard() {
  const { user } = useAuth();

  return (
    <>
      <h4 className="mb-3" style={{ color: 'var(--sitex-text-primary)' }}>Supervisor Dashboard</h4>
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <p className="mb-2">Welcome, <strong>{user?.username}</strong>.</p>
          <p className="text-muted small mb-0">
            Supervisor workspace. Manage site tasks, raise material requests, and track site status.
          </p>
        </Card.Body>
      </Card>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h6 className="mb-2">Quick actions</h6>
          <Button as={Link} to="/supervisor/sites" variant="outline-primary" size="sm">
            View my sites
          </Button>
        </Card.Body>
      </Card>
    </>
  );
}
