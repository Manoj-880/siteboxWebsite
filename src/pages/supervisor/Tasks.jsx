import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { myTasksApi } from '../../api/axiosConfig';

const norm = (s) => String(s || '').trim().toLowerCase();

export default function SupervisorTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completeTask, setCompleteTask] = useState(null);
  const [report, setReport] = useState('');
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await myTasksApi.getMyTasks();
      setTasks(res?.data?.data?.tasks ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { pending, completed } = useMemo(() => {
    const p = [];
    const c = [];
    for (const t of tasks) {
      if (norm(t.task_status) === 'completed') c.push(t);
      else p.push(t);
    }
    return { pending: p, completed: c };
  }, [tasks]);

  const openComplete = (t) => {
    setCompleteTask(t);
    setReport('');
    setFiles([]);
    setSuccess('');
    setError('');
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    if (!completeTask) return;
    const fd = new FormData();
    fd.append('completion_report', report.trim());
    for (const f of files) {
      fd.append('images', f);
    }
    if (!report.trim() && files.length === 0) {
      setError('Write a short report and/or attach at least one image.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await myTasksApi.completeTask(completeTask.id, fd);
      setSuccess('Task marked as completed.');
      setCompleteTask(null);
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Could not complete task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h4 className="mb-3" style={{ color: 'var(--sitex-text-primary)' }}>
        My tasks
      </h4>
      <p className="text-muted small mb-4">
        Pending tasks must be completed with a written report and/or photos. Only <strong>Pending</strong> and{' '}
        <strong>Completed</strong> statuses are used.
      </p>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="g-3">
          <Col md={6} xs={12}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white">
                <strong>Pending</strong>
                <span className="badge bg-warning text-dark ms-2">{pending.length}</span>
              </Card.Header>
              <Card.Body>
                {pending.length === 0 ? (
                  <div className="text-muted small">No pending tasks.</div>
                ) : (
                  pending.map((t) => (
                    <Card key={t.id} className="mb-2 border">
                      <Card.Body className="py-2">
                        <div className="fw-semibold">{t.task_title}</div>
                        <div className="small text-muted">{t.site_name || `Site #${t.site_id}`}</div>
                        {t.description ? <div className="small mt-1">{t.description}</div> : null}
                        <Button size="sm" className="mt-2" variant="primary" onClick={() => openComplete(t)}>
                          Complete task
                        </Button>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} xs={12}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white">
                <strong>Completed</strong>
                <span className="badge bg-success ms-2">{completed.length}</span>
              </Card.Header>
              <Card.Body>
                {completed.length === 0 ? (
                  <div className="text-muted small">No completed tasks yet.</div>
                ) : (
                  completed.map((t) => (
                    <Card key={t.id} className="mb-2 border">
                      <Card.Body className="py-2">
                        <div className="fw-semibold">{t.task_title}</div>
                        <div className="small text-muted">{t.site_name || `Site #${t.site_id}`}</div>
                        {t.completion_report ? (
                          <div className="small mt-2">
                            <strong>Report:</strong> {t.completion_report}
                          </div>
                        ) : null}
                        {(t.completion_image_urls || []).filter(Boolean).length > 0 ? (
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {(t.completion_image_urls || [])
                              .filter(Boolean)
                              .map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noreferrer">
                                  <img
                                    src={url}
                                    alt=""
                                    style={{ maxWidth: 96, maxHeight: 96, objectFit: 'cover', borderRadius: 6 }}
                                  />
                                </a>
                              ))}
                          </div>
                        ) : null}
                      </Card.Body>
                    </Card>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Modal show={!!completeTask} onHide={() => !saving && setCompleteTask(null)} centered>
        <Form onSubmit={submitComplete}>
          <Modal.Header closeButton={!saving}>
            <Modal.Title>Complete task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="small text-muted mb-2">
              Provide a short report and/or attach images (JPEG, PNG, WebP, GIF — up to 10 files, 5MB each).
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Completion report</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder="What was done, issues found, etc."
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Photos (optional if report is filled)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" type="button" onClick={() => setCompleteTask(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Mark completed'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
