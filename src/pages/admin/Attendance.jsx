import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Row, Col, Spinner, Form, Table, Badge } from 'react-bootstrap';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { adminApi } from '../../api/axiosConfig';
import { ROLE_NAMES } from '../../constants/roles';
import './Attendance.css';

const COLORS = {
  present: '#16a34a',
  absent: '#dc2626',
  unmarked: '#94a3b8',
};

function buildPieData(overall) {
  const slices = [];
  if (overall.present > 0) slices.push({ name: 'Present', value: overall.present, key: 'present' });
  if (overall.absent > 0) slices.push({ name: 'Absent', value: overall.absent, key: 'absent' });
  if (overall.unmarked > 0) slices.push({ name: 'Unmarked', value: overall.unmarked, key: 'unmarked' });
  if (slices.length === 0 && overall.total === 0) {
    slices.push({ name: 'No employees', value: 1, key: 'unmarked' });
  }
  return slices;
}

function AttendancePie({ title, overall, height = 220 }) {
  const slices = buildPieData(overall);
  return (
    <div className="attendance-pie-wrap">
      {title && <div className="attendance-pie-title text-center small text-muted mb-1">{title}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={height > 200 ? 52 : 36}
            outerRadius={height > 200 ? 80 : 56}
            paddingAngle={2}
          >
            {slices.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key] || COLORS.unmarked} stroke="none" />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [v, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      {overall.total > 0 && (
        <div className="text-center small text-muted">
          {overall.present} present · {overall.absent} absent · {overall.unmarked} unmarked
        </div>
      )}
    </div>
  );
}

function statusBadge(status) {
  if (!status) return <Badge bg="secondary">Unmarked</Badge>;
  const s = String(status).toLowerCase();
  if (s === 'present') return <Badge bg="success">Present</Badge>;
  if (s === 'absent') return <Badge bg="danger">Absent</Badge>;
  return <Badge bg="secondary">{status}</Badge>;
}

export default function AdminAttendance() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getAttendanceWeb({ date, days })
      .then((res) => setData(res.data?.data ?? null))
      .catch((err) => {
        setData(null);
        setError(err.response?.data?.message || err.message || 'Failed to load attendance');
      })
      .finally(() => setLoading(false));
  }, [date, days]);

  useEffect(() => {
    load();
  }, [load]);

  const trendChartData = useMemo(() => {
    const t = data?.trend ?? [];
    return t.map((row) => ({
      ...row,
      label: row.date?.slice(5) ?? row.date,
      present_pct: row.total > 0 ? Math.round((100 * row.present) / row.total) : 0,
    }));
  }, [data]);

  const employeesByRole = useMemo(() => {
    const list = data?.employees ?? [];
    const map = new Map();
    for (const e of list) {
      const id = e.user_role_id;
      if (!map.has(id)) map.set(id, { roleId: id, roleName: e.role_name, rows: [] });
      map.get(id).rows.push(e);
    }
    return [...map.values()].sort((a, b) =>
      String(a.roleName || '').localeCompare(String(b.roleName || ''))
    );
  }, [data]);

  if (loading && !data) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: 'var(--sitex-primary-alt)' }} />
      </div>
    );
  }

  const overall = data?.overall ?? { total: 0, present: 0, absent: 0, unmarked: 0 };
  const byRole = data?.by_role ?? [];

  return (
    <div className="admin-attendance">
      <div className="admin-page-header mb-4">
        <h1 className="admin-page-title mb-1">Attendance</h1>
        <p className="admin-page-subtitle mb-0">
          Employee attendance for your company — trends and breakdown by role
        </p>
        {error && (
          <div className="alert alert-warning py-2 mt-2 mb-0" role="alert">
            {error}
          </div>
        )}
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="d-flex flex-wrap align-items-end gap-3">
          <Form.Group className="mb-0">
            <Form.Label className="small text-muted mb-1">Date</Form.Label>
            <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label className="small text-muted mb-1">Trend length</Form.Label>
            <Form.Select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ minWidth: 140 }}>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </Form.Select>
          </Form.Group>
          {loading && (
            <Spinner animation="border" size="sm" className="ms-2 mb-1" style={{ color: 'var(--sitex-primary-alt)' }} />
          )}
        </Card.Body>
      </Card>

      <Row className="g-3 mb-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold">
              Selected day — {data?.selected_date ?? date}
            </Card.Header>
            <Card.Body>
              {overall.total === 0 ? (
                <p className="text-muted small mb-0">No employees in staff roles yet. Add staff to track attendance.</p>
              ) : (
                <AttendancePie overall={overall} height={260} />
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom fw-semibold">Attendance rate trend</Card.Header>
            <Card.Body>
              <p className="small text-muted mb-2">
                Share of staff marked present (ends on selected date; current roster size used for unmarked).
              </p>
              <div className="attendance-trend-chart">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trendChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                    <Tooltip
                      formatter={(v) => [`${v}%`, 'Present']}
                      labelFormatter={(_, payload) => (payload?.[0]?.payload?.date ? `Date: ${payload[0].payload.date}` : '')}
                    />
                    <Line
                      type="monotone"
                      dataKey="present_pct"
                      stroke={COLORS.present}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Present %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2 className="h5 fw-semibold mb-3">By role</h2>
      {byRole.length === 0 ? (
        <p className="text-muted small">No role groups.</p>
      ) : (
        <Row className="g-3 mb-4">
          {byRole.map((r) => (
            <Col key={r.user_role_id} xs={12} sm={6} md={4} lg={3}>
              <Card className="border-0 shadow-sm attendance-role-card h-100">
                <Card.Body className="pb-2">
                  <div className="fw-semibold text-center mb-1">
                    {ROLE_NAMES[r.user_role_id] || r.role_name}
                  </div>
                  <div className="text-center small text-muted mb-2">
                    {r.total} staff · {r.present} in
                  </div>
                  <AttendancePie
                    overall={{
                      total: r.total,
                      present: r.present,
                      absent: r.absent,
                      unmarked: r.unmarked,
                    }}
                    height={180}
                  />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <h2 className="h5 fw-semibold mb-3">Employee details</h2>
      {employeesByRole.length === 0 ? (
        <p className="text-muted small mb-0">No rows for this date.</p>
      ) : (
        employeesByRole.map((group) => (
          <Card key={group.roleId} className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-white border-bottom fw-semibold py-2">
              {ROLE_NAMES[group.roleId] || group.roleName}
              <span className="text-muted fw-normal ms-2 small">({group.rows.length})</span>
            </Card.Header>
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.user_id}>
                    <td className="fw-medium">{row.username}</td>
                    <td className="text-muted small">{row.mobile ?? '—'}</td>
                    <td>{statusBadge(row.attendance_status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        ))
      )}
    </div>
  );
}
