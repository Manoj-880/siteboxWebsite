import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';

const emptyForm = {
  task_title: '',
  description: '',
  assigned_to_user_id: '',
  site_id: '',
  estimated_to_complete: '',
};

const STATUS_COLUMNS = [
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

const normalizeStatus = (status) => {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'in progress' || s === 'in_progress') return 'in_progress';
  return 'pending';
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const employeeOptions = useMemo(
    () => (employees || []).filter((e) => e?.adminId || e?.id),
    [employees]
  );

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, sitesRes, employeesRes] = await Promise.all([
        adminApi.getTasksWeb(),
        adminApi.getSites(),
        adminApi.getEmployeesWeb(),
      ]);
      setTasks(tasksRes?.data?.data?.tasks ?? []);
      setSites(sitesRes?.data?.data?.sites ?? []);
      setEmployees(employeesRes?.data?.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setForm(emptyForm);
  };

  const closeTaskDetails = () => setSelectedTask(null);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.task_title.trim() || !form.assigned_to_user_id || !form.site_id) {
      setError('Task title, assignee, and site are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        task_title: form.task_title.trim(),
        description: form.description?.trim() || null,
        task_status: 'pending',
        assigned_to_user_id: Number(form.assigned_to_user_id),
        site_id: Number(form.site_id),
        estimated_to_complete: form.estimated_to_complete || null,
      };
      await adminApi.createTaskWeb(payload);
      setSuccess('Task created successfully');
      closeModal();
      await fetchData();
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const grouped = useMemo(() => {
    const map = { pending: [], in_progress: [], completed: [] };
    for (const task of tasks) {
      map[normalizeStatus(task.task_status)].push(task);
    }
    return map;
  }, [tasks]);

  return (
    <div className="admin-tasks">
      <div className="admin-page-header mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title mb-1">Tasks</h1>
          <p className="admin-page-subtitle mb-0">Create and manage employee tasks</p>
        </div>
        <Button onClick={openCreate}>Create Task</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="g-3">
          {STATUS_COLUMNS.map((col) => (
            <Col key={col.key} lg={4} md={6} xs={12}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <strong>{col.label}</strong>
                  <span className="badge bg-light text-dark">{grouped[col.key].length}</span>
                </Card.Header>
                <Card.Body className="d-flex flex-column gap-2">
                  {grouped[col.key].length === 0 ? (
                    <div className="text-muted small">No tasks</div>
                  ) : (
                    grouped[col.key].map((task) => (
                      <Card
                        key={task.id}
                        className="border"
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedTask(task)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedTask(task);
                          }
                        }}
                      >
                        <Card.Body className="py-2">
                          <div className="fw-semibold">{task.task_title || '-'}</div>
                          <div className="small">
                            <div>
                              <strong>Assignee:</strong> {task.assigned_to_name || `#${task.assigned_to_user_id}`}
                            </div>
                            <div><strong>Created:</strong> {task.created_at ? new Date(task.created_at).toLocaleString() : '-'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={closeModal} centered>
        <Form onSubmit={onSubmit}>
          <Modal.Header closeButton={!saving}>
            <Modal.Title>Create Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Label>Task Title</Form.Label>
                <Form.Control
                  value={form.task_title}
                  onChange={(e) => onChange('task_title', e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </Col>
              <Col xs={12}>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => onChange('description', e.target.value)}
                  placeholder="Optional description"
                />
              </Col>
              <Col md={6} xs={12}>
                <Form.Label>Estimated To Complete</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={form.estimated_to_complete}
                  onChange={(e) => onChange('estimated_to_complete', e.target.value)}
                />
              </Col>
              <Col md={6} xs={12}>
                <Form.Label>Assignee</Form.Label>
                <Form.Select
                  value={form.assigned_to_user_id}
                  onChange={(e) => onChange('assigned_to_user_id', e.target.value)}
                  required
                >
                  <option value="">Select employee</option>
                  {employeeOptions.map((u) => (
                    <option key={u.adminId ?? u.id} value={u.adminId ?? u.id}>
                      {u.username ?? u.email ?? `User #${u.adminId ?? u.id}`}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6} xs={12}>
                <Form.Label>Site</Form.Label>
                <Form.Select
                  value={form.site_id}
                  onChange={(e) => onChange('site_id', e.target.value)}
                  required
                >
                  <option value="">Select site</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.site_name ?? `Site #${s.id}`}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create Task'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={!!selectedTask} onHide={closeTaskDetails} centered>
        <Modal.Header closeButton>
          <Modal.Title>Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask ? (
            <div className="small d-flex flex-column gap-2">
              <div><strong>Title:</strong> {selectedTask.task_title || '-'}</div>
              <div><strong>Description:</strong> {selectedTask.description || '-'}</div>
              <div><strong>Status:</strong> {String(selectedTask.task_status || '-').replace(/_/g, ' ')}</div>
              <div><strong>Assignee:</strong> {selectedTask.assigned_to_name || `#${selectedTask.assigned_to_user_id}`}</div>
              <div><strong>Assignee Role:</strong> {selectedTask.assigned_to_role || '-'}</div>
              <div><strong>Assigned By:</strong> {selectedTask.assigned_by_name || `#${selectedTask.assigned_by_user_id}`}</div>
              <div><strong>Site:</strong> {selectedTask.site_name || `#${selectedTask.site_id}`}</div>
              <div>
                <strong>Estimated To Complete:</strong>{' '}
                {selectedTask.estimated_to_complete
                  ? new Date(selectedTask.estimated_to_complete).toLocaleString()
                  : '-'}
              </div>
              <div>
                <strong>Created At:</strong>{' '}
                {selectedTask.created_at ? new Date(selectedTask.created_at).toLocaleString() : '-'}
              </div>
              <div>
                <strong>Updated At:</strong>{' '}
                {selectedTask.updated_at ? new Date(selectedTask.updated_at).toLocaleString() : '-'}
              </div>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeTaskDetails}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

