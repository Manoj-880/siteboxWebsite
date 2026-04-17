import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { attendanceApi, designerApi } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function DesignerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [taskUpdate, setTaskUpdate] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await designerApi.getDashboard(todayIso());
      setData(res?.data?.data ?? {});
    } catch (e) {
      setData({});
      setError(e?.response?.data?.message || 'Failed to load designer dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const attendanceMarked = useMemo(() => {
    const s = String(data?.attendance_status || '').toLowerCase();
    return s === 'present' || s === 'absent';
  }, [data?.attendance_status]);

  const markAttendance = async () => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await attendanceApi.mark({ attendance_date: todayIso(), attendance_status: 'present' });
      setSuccess('Attendance marked successfully.');
      await loadDashboard();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setBusy(false);
    }
  };

  const reviewUpdate = async (updateId, action, reviewRemarks = '') => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await designerApi.reviewSiteUpdate(updateId, {
        action,
        ...(reviewRemarks.trim() ? { review_remarks: reviewRemarks.trim() } : {}),
      });
      setSuccess(`Update ${action}.`);
      await loadDashboard();
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not submit update review');
    } finally {
      setBusy(false);
    }
  };

  const submitCreateTask = async () => {
    if (!taskUpdate || !taskTitle.trim()) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await designerApi.createTaskForSupervisor(taskUpdate.site_id, {
        task_title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
      });
      setTaskUpdate(null);
      setTaskTitle('');
      setTaskDescription('');
      setSuccess('Task created for supervisor.');
      await loadDashboard();
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not create task');
    } finally {
      setBusy(false);
    }
  };

  const updates = data?.recent_updates || [];

  return (
    <div>
      <h4 className="mb-3" style={{ color: 'var(--sitex-text-primary)' }}>Designer Dashboard</h4>
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="d-flex justify-content-between flex-wrap gap-2 align-items-start">
          <div>
            <p className="mb-1">Welcome, <strong>{user?.username}</strong>.</p>
            <p className="small text-muted mb-0">Review site updates, add files, and create tasks for supervisors.</p>
          </div>
          <Button size="sm" onClick={markAttendance} disabled={attendanceMarked || busy}>
            {attendanceMarked ? 'Attendance marked' : 'Mark attendance'}
          </Button>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <>
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="small text-muted">Sites</div>
                  <div className="h4 mb-2">{data?.sites?.total ?? 0}</div>
                  <Button as={Link} to="/designer/sites" size="sm" variant="outline-primary">View sites</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="small text-muted">Tasks</div>
                  <div className="h4 mb-2">{data?.tasks?.total ?? 0}</div>
                  <Button as={Link} to="/designer/tasks" size="sm" variant="outline-primary">View tasks</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Recent Posted Site Updates</h6>
                <Button as={Link} to="/designer/sites" size="sm" variant="outline-secondary">Open sites</Button>
              </div>
              {updates.length === 0 ? (
                <p className="small text-muted mb-0">No updates pending review.</p>
              ) : updates.map((u) => (
                <Card key={u.id} className="mb-2 border">
                  <Card.Body>
                    <div className="fw-semibold">{u.site_name || `Site #${u.site_id}`}</div>
                    <div className="small text-muted mb-2">By {u.updated_by_name || 'User'}</div>
                    <div className="small mb-3">{u.update_description || 'No description'}</div>
                    <div className="d-flex flex-wrap gap-2">
                      <Button size="sm" variant="outline-success" disabled={busy} onClick={() => reviewUpdate(u.id, 'approved')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline-warning" disabled={busy} onClick={() => { setRejecting(u); setRejectRemarks(''); }}>
                        Reject
                      </Button>
                      <Button size="sm" variant="primary" disabled={busy} onClick={() => { setTaskUpdate(u); setTaskTitle(''); setTaskDescription(''); }}>
                        Create Task
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </>
      )}

      <Modal show={!!rejecting} onHide={() => !busy && setRejecting(null)} centered>
        <Modal.Header closeButton={!busy}><Modal.Title>Reject update</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Enter rejection remarks"
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" disabled={busy} onClick={() => setRejecting(null)}>Cancel</Button>
          <Button
            variant="warning"
            disabled={busy}
            onClick={async () => {
              if (!rejecting) return;
              await reviewUpdate(rejecting.id, 'rejected', rejectRemarks);
              setRejecting(null);
            }}
          >
            Reject update
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!taskUpdate} onHide={() => !busy && setTaskUpdate(null)} centered>
        <Modal.Header closeButton={!busy}><Modal.Title>Create task to supervisor</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Task title</Form.Label>
            <Form.Control value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task title" />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={4} value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Description (optional)" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" disabled={busy} onClick={() => setTaskUpdate(null)}>Cancel</Button>
          <Button disabled={busy || !taskTitle.trim()} onClick={submitCreateTask}>Create task</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
