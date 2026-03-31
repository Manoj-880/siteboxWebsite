import { useAuth } from '../../context/AuthContext';
import { Card } from 'react-bootstrap';

export default function ContractorDashboard() {
  const { user } = useAuth();

  return (
    <>
      <h4 className="mb-3" style={{ color: 'var(--sitex-text-primary)' }}>Contractor Dashboard</h4>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p className="mb-2">Welcome, <strong>{user?.username}</strong>.</p>
          <p className="text-muted small mb-0">
            Contractor portal. View assigned sites and tasks. More features coming soon.
          </p>
        </Card.Body>
      </Card>
    </>
  );
}
