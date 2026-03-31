import { Card } from 'react-bootstrap';
import { Badge } from 'react-bootstrap';

function formatSalary(salary, interval) {
  if (salary == null) return '—';
  const i = interval ? String(interval).replace('per_', '/') : '';
  return `${Number(salary)} ${i}`;
}

function attendanceLabel(status) {
  if (!status) return { text: '—', variant: 'secondary' };
  const s = String(status).toLowerCase();
  if (s === 'present') return { text: 'Present', variant: 'success' };
  if (s === 'absent') return { text: 'Absent', variant: 'danger' };
  return { text: status, variant: 'secondary' };
}

export default function StaffCard({ employee }) {
  const id = employee.adminId ?? employee.id;
  const att = attendanceLabel(employee.attendance_status);
  const sitesAssigned = employee.sites_assigned ?? 0;

  return (
    <Card className="staff-card border-0 shadow-sm h-100">
      <Card.Body className="p-3">
        <div className="staff-card__name mb-2">{employee.username ?? '—'}</div>
        <ul className="staff-card__list list-unstyled small mb-0">
          <li className="d-flex align-items-center gap-2 mb-1">
            <span className="text-muted">Mobile</span>
            <span>{employee.mobile ?? '—'}</span>
          </li>
          <li className="d-flex align-items-center gap-2 mb-1">
            <span className="text-muted">Email</span>
            <span className="text-break">{employee.email ?? '—'}</span>
          </li>
          <li className="d-flex align-items-center gap-2 mb-1">
            <span className="text-muted">Salary</span>
            <span>{formatSalary(employee.salary, employee.salary_interval)}</span>
          </li>
          <li className="d-flex align-items-center gap-2 mb-1">
            <span className="text-muted">Today</span>
            <Badge bg={att.variant}>{att.text}</Badge>
          </li>
          <li className="d-flex align-items-center gap-2">
            <span className="text-muted">Sites</span>
            <span>{sitesAssigned} assigned</span>
          </li>
        </ul>
      </Card.Body>
    </Card>
  );
}
