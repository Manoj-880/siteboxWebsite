import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Card, Form, Modal, Spinner, Tab, Tabs } from 'react-bootstrap';
import { designerApi } from '../../api/axiosConfig';

export default function DesignerSiteDetails() {
  const { siteId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTask, setShowTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [showFiles, setShowFiles] = useState(false);
  const [fileDesc, setFileDesc] = useState('');
  const [files, setFiles] = useState([]);

  const load = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    setError('');
    try {
      const res = await designerApi.getSiteDetails(siteId);
      setData(res?.data?.data ?? {});
    } catch (e) {
      setData(null);
      setError(e?.response?.data?.message || 'Failed to load site details');
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => { load(); }, [load]);

  const submitTask = async () => {
    if (!taskTitle.trim()) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await designerApi.createTaskForSupervisor(siteId, {
        task_title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
      });
      setShowTask(false);
      setTaskTitle('');
      setTaskDescription('');
      setSuccess('Task created for supervisor.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create task');
    } finally {
      setBusy(false);
    }
  };

  const submitFiles = async () => {
    if (files.length === 0) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      if (fileDesc.trim()) fd.append('update_description', fileDesc.trim());
      for (const f of files) fd.append('images', f);
      await designerApi.addFilesToSite(siteId, fd);
      setShowFiles(false);
      setFileDesc('');
      setFiles([]);
      setSuccess('Files added successfully.');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to add files');
    } finally {
      setBusy(false);
    }
  };

  const review = async (id, action) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await designerApi.reviewSiteUpdate(id, { action });
      setSuccess(`Update ${action}.`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to review update');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (!data) return <Alert variant="warning">{error || 'Site not found'}</Alert>;

  const site = data.site_detail || {};
  const siteFiles = data.site_files || [];
  const siteUpdates = data.site_updates || [];

  return (
    <div>
      <h4 className="mb-3" style={{ color: 'var(--sitex-text-primary)' }}>{site.site_name || `Site #${siteId}`}</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="fw-semibold">{site.client_name || 'Client'}</div>
          <div className="small text-muted mb-3">{site.address || 'No address available'}</div>
          <div className="d-flex flex-wrap gap-2">
            <Button size="sm" variant="outline-primary" onClick={() => setShowTask(true)}>Add task</Button>
            <Button size="sm" onClick={() => setShowFiles(true)}>Add file</Button>
          </div>
        </Card.Body>
      </Card>

      <Tabs defaultActiveKey="files" className="mb-3">
        <Tab eventKey="files" title={`Files (${siteFiles.length})`}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {siteFiles.length === 0 ? <p className="small text-muted mb-0">No files found.</p> : siteFiles.map((f) => (
                <div key={f.id || f.file_url} className="d-flex justify-content-between align-items-center border-bottom py-2">
                  <div>
                    <div className="fw-semibold small">{f.file_name || 'File'}</div>
                    <div className="small text-muted">{f.created_at ? new Date(f.created_at).toLocaleString() : ''}</div>
                  </div>
                  {f.file_url ? <Button size="sm" variant="outline-secondary" href={f.file_url} target="_blank">Open</Button> : null}
                </div>
              ))}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="updates" title={`Updates (${siteUpdates.length})`}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {siteUpdates.length === 0 ? <p className="small text-muted mb-0">No updates found.</p> : siteUpdates.map((u) => (
                <Card key={u.id} className="mb-2 border">
                  <Card.Body>
                    <div className="fw-semibold">{u.update_description || 'No description'}</div>
                    <div className="small text-muted mb-2">Status: {u.update_status || 'review'}</div>
                    {u.review_remarks ? <div className="small mb-2">Remarks: {u.review_remarks}</div> : null}
                    {String(u.update_status || '').toLowerCase() === 'review' ? (
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-success" disabled={busy} onClick={() => review(u.id, 'approved')}>Approve</Button>
                        <Button size="sm" variant="outline-warning" disabled={busy} onClick={() => review(u.id, 'rejected')}>Reject</Button>
                      </div>
                    ) : null}
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <Modal show={showTask} onHide={() => !busy && setShowTask(false)} centered>
        <Modal.Header closeButton={!busy}><Modal.Title>Add task</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Task title</Form.Label>
            <Form.Control value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={4} value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowTask(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submitTask} disabled={busy || !taskTitle.trim()}>Create task</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showFiles} onHide={() => !busy && setShowFiles(false)} centered>
        <Modal.Header closeButton={!busy}><Modal.Title>Add files</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Description (optional)</Form.Label>
            <Form.Control value={fileDesc} onChange={(e) => setFileDesc(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Files</Form.Label>
            <Form.Control type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowFiles(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submitFiles} disabled={busy || files.length === 0}>Upload</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
