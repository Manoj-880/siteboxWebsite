import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Spinner,
  Button,
  Card,
  Row,
  Col,
  Badge,
  Modal,
  Form,
  Table,
  ProgressBar,
  Alert,
} from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { ROLE_IDS } from '../../constants/roles';
import './SiteDetails.css';

function mapUrlFromCoordinates(coordinates) {
  if (!coordinates || !String(coordinates).trim()) return null;
  const s = String(coordinates).trim();
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  return `https://www.google.com/maps?q=${encodeURIComponent(s)}`;
}

function formatAttendance(status) {
  if (!status) return { label: '—', variant: 'secondary' };
  const s = String(status).toLowerCase();
  if (s === 'present') return { label: 'Present', variant: 'success' };
  if (s === 'absent') return { label: 'Absent', variant: 'danger' };
  return { label: status, variant: 'secondary' };
}

function toNumber(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(val) {
  return toNumber(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const iconStyle = { width: 18, height: 18, flexShrink: 0 };
const IconPerson = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle} aria-hidden>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle} aria-hidden>
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);
const IconLocation = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle} aria-hidden>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);
const IconNavigate = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle} aria-hidden>
    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
  </svg>
);
const IconSupervisor = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle} aria-hidden>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
const IconDesigner = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle} aria-hidden>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);
const IconContractors = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle} aria-hidden>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);
const IconTasks = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }} aria-hidden>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);
const IconPresent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }} aria-hidden>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);
const IconAbsent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }} aria-hidden>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

export default function AdminSiteDetails() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, hasRole } = useAuth();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contractorsList, setContractorsList] = useState([]);
  const [showAddContractor, setShowAddContractor] = useState(false);
  const [addContractorId, setAddContractorId] = useState('');
  const [adding, setAdding] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [statusForm, setStatusForm] = useState({ status_name: '', start_date: '', estimated_completion_date: '' });
  const [savingStatus, setSavingStatus] = useState(false);

  const isSupervisorOfSite = site && user && site.supervisor_id === user.id;
  const canEditSiteStatus = hasRole(ROLE_IDS.SUPERVISOR) && isSupervisorOfSite;

  const fetchSite = useCallback(() => {
    if (!siteId) return;
    setError(null);
    adminApi
      .getSiteDetails(siteId)
      .then((res) => setSite(res.data?.data ?? null))
      .catch((err) => {
        setSite(null);
        setError(err.response?.data?.message || err.message || 'Failed to load site details');
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  useEffect(() => {
    if (!siteId) {
      setLoading(false);
      setError('Invalid site');
      return;
    }
    fetchSite();
  }, [siteId, fetchSite]);

  useEffect(() => {
    if (!site || !isAdmin || !user?.company_id) return;
    adminApi
      .getContractors(user.company_id)
      .then((res) => setContractorsList(res.data?.data ?? []))
      .catch(() => setContractorsList([]));
  }, [site, isAdmin, user?.company_id]);

  const handleAddContractor = () => {
    if (!addContractorId || !siteId || !user?.id) return;
    setAdding(true);
    const adminId = isAdmin ? user.id : undefined;
    adminApi
      .addSiteContractor({ site_id: parseInt(siteId, 10), contractor_id: parseInt(addContractorId, 10) }, adminId)
      .then(() => {
        setShowAddContractor(false);
        setAddContractorId('');
        fetchSite();
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to add contractor');
      })
      .finally(() => setAdding(false));
  };

  const handleRemoveContractor = (siteContractorId) => {
    if (!siteContractorId || !window.confirm('Remove this contractor from the site?')) return;
    const adminId = isAdmin ? user.id : undefined;
    adminApi
      .removeSiteContractor(siteContractorId, adminId)
      .then(() => fetchSite())
      .catch((err) => alert(err.response?.data?.message || 'Failed to remove contractor'));
  };

  const openAddStatus = () => {
    setEditingStatus(null);
    setStatusForm({ status_name: '', start_date: '', estimated_completion_date: '' });
    setShowStatusModal(true);
  };

  const openEditStatus = (st) => {
    setEditingStatus(st);
    setStatusForm({
      status_name: st.status_name || '',
      start_date: st.start_date || '',
      estimated_completion_date: st.estimated_completion_date || '',
    });
    setShowStatusModal(true);
  };

  const handleSaveStatus = () => {
    if (!statusForm.status_name?.trim()) {
      alert('Status name is required');
      return;
    }
    setSavingStatus(true);
    const body = {
      status_name: statusForm.status_name.trim(),
      start_date: statusForm.start_date || null,
      estimated_completion_date: statusForm.estimated_completion_date || null,
    };
    const promise = editingStatus
      ? adminApi.updateSiteStatusBySupervisor(editingStatus.id, body)
      : adminApi.addSiteStatusBySupervisor(siteId, body);
    promise
      .then(() => {
        setShowStatusModal(false);
        fetchSite();
      })
      .catch((err) => alert(err.response?.data?.message || 'Failed to save status'))
      .finally(() => setSavingStatus(false));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: 'var(--sitex-primary-alt)' }} />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="admin-site-details">
        <div className="mb-3">
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
        <Alert variant="warning">{error || 'Site not found.'}</Alert>
      </div>
    );
  }

  const mapUrl = mapUrlFromCoordinates(site.coordinates);
  const addressDisplay = site.address || '—';
  const siteStatuses = site.site_statuses || [];
  const contractors = site.contractors || [];
  const progressPercent = siteStatuses.length > 0 ? Math.min(100, (siteStatuses.filter((s) => s.record_status === 'active').length / Math.max(siteStatuses.length, 1)) * 100) : 0;
  const budgetNum = parseFloat(String(site.budget || '0').replace(/,/g, '')) || 0;
  const budgetInfo = site.budgetinfo || site.budgetinfor || {};
  const materialsSpent = toNumber(budgetInfo.materials);
  const contractorSpent = toNumber(budgetInfo.contractors);
  const miscSpent = toNumber(budgetInfo.miscellaneous);
  const totalSpendings = toNumber(budgetInfo.total_spendings);
  const receivedPayment = toNumber(site?.stats?.transactions?.recieved);
  const usedNum = totalSpendings;

  const budgetParts = [
    { key: 'materials', label: 'Materials', value: materialsSpent, color: '#5ca9e6' },
    { key: 'contractors', label: 'Contractor', value: contractorSpent, color: '#d39b67' },
    { key: 'misc', label: 'Miscellaneous expenses', value: miscSpent, color: '#8f88c9' },
    { key: 'total', label: 'Total Spendings', value: totalSpendings, color: '#1f66c9' },
    { key: 'received', label: 'Received payment', value: receivedPayment, color: '#58c3b6' },
  ];
  const budgetPartsTotal = budgetParts.reduce((sum, p) => sum + toNumber(p.value), 0);

  const backPath = isAdmin ? '/admin/sites' : '/supervisor/sites';
  const assignedContractorIds = contractors.map((c) => c.contractor_id);
  const contractorUserId = (u) => u.adminId ?? u.id;
  const availableContractors = contractorsList.filter((u) => !assignedContractorIds.includes(contractorUserId(u)));

  const siteDisplayName = site.type === 'community' && site.community_name
    ? `${site.community_name} - ${site.site_name}`
    : site.site_name;

  return (
    <div className="admin-site-details">
      <div className="admin-site-details__back">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(backPath)}>
          ← Back
        </Button>
      </div>

      <h1 className="admin-page-title">{siteDisplayName}</h1>

      {/* Row 1: Client details | Supervisor & Designer */}
      <Row className="row-cards g-4">
        <Col lg={6} className="col-card">
          <Card className="site-detail-card h-100">
            <Card.Header>
              <Card.Title className="mb-0">Client details</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="client-row">
                <div className="client-field">
                  <span className="icon-muted"><IconPerson /></span>
                  <span className="fw-medium">{site.client_name ?? '—'}</span>
                </div>
                <div className="client-field">
                  <span className="icon-muted"><IconPhone /></span>
                  <span>{site.client_phone ?? '—'}</span>
                </div>
              </div>
              <div className="client-address-row">
                <span className="icon-muted mt-1"><IconLocation /></span>
                <div className="flex-grow-1">
                  <div className="address-label">Address</div>
                  <div className="address-text">{addressDisplay}</div>
                </div>
                {mapUrl && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="btn-navigate d-flex align-items-center justify-content-center"
                    onClick={() => window.open(mapUrl, '_blank', 'noopener,noreferrer')}
                    title="Open location in map"
                    aria-label="Open location in map"
                  >
                    <IconNavigate />
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="col-card">
          <Card className="site-detail-card h-100">
            <Card.Header>
              <Card.Title className="mb-0">Supervisor & Designer</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                <Col xs={12} md={6}>
                  <div className="role-block d-flex align-items-start gap-2">
                    <span className="icon-muted mt-1"><IconSupervisor /></span>
                    <div className="flex-grow-1">
                      <div className="role-label">Supervisor</div>
                      <div className="role-name">{site.supervisor_name ?? '—'}</div>
                      <span className="tasks-badge">
                        <IconTasks /> {site.supervisor_task_count ?? 0} Tasks
                      </span>
                      <div className={`attendance-line ${formatAttendance(site.supervisor_attendance_status).label === 'Present' ? 'present' : formatAttendance(site.supervisor_attendance_status).label === 'Absent' ? 'absent' : ''}`}>
                        {formatAttendance(site.supervisor_attendance_status).label === 'Present' ? (
                          <><IconPresent /><span>Present</span></>
                        ) : formatAttendance(site.supervisor_attendance_status).label === 'Absent' ? (
                          <><IconAbsent /><span>Absent</span></>
                        ) : (
                          <><IconAbsent /><span>{formatAttendance(site.supervisor_attendance_status).label}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="role-block d-flex align-items-start gap-2">
                    <span className="icon-muted mt-1"><IconDesigner /></span>
                    <div className="flex-grow-1">
                      <div className="role-label">Designer</div>
                      <div className="role-name">{site.designer_name ?? '—'}</div>
                      <span className="tasks-badge">
                        <IconTasks /> {site.designer_task_count ?? 0} Tasks
                      </span>
                      <div className={`attendance-line ${formatAttendance(site.designer_attendance_status).label === 'Present' ? 'present' : formatAttendance(site.designer_attendance_status).label === 'Absent' ? 'absent' : ''}`}>
                        {formatAttendance(site.designer_attendance_status).label === 'Present' ? (
                          <><IconPresent /><span>Present</span></>
                        ) : formatAttendance(site.designer_attendance_status).label === 'Absent' ? (
                          <><IconAbsent /><span>Absent</span></>
                        ) : (
                          <><IconAbsent /><span>{formatAttendance(site.designer_attendance_status).label}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Budget info with progress bar */}
      <div className="row-cards">
        <Card className="site-detail-card">
          <Card.Header>
            <Card.Title className="mb-0">Budget info</Card.Title>
          </Card.Header>
          <Card.Body className="budget-info-body">
            <div className="budget-topline">
              <div className="budget-topline-item">USED: {formatAmount(usedNum)}</div>
              <div className="budget-topline-item">BUDGET: {formatAmount(budgetNum)}</div>
            </div>

            <div className="budget-segments">
              {budgetParts.map((part) => {
                const width = budgetPartsTotal > 0 ? (toNumber(part.value) / budgetPartsTotal) * 100 : 0;
                return (
                  <div
                    key={part.key}
                    className="budget-segment"
                    style={{
                      backgroundColor: part.color,
                      width: `${width}%`,
                    }}
                    title={`${part.label}: ${formatAmount(part.value)}`}
                  />
                );
              })}
            </div>

            <div className="budget-legend">
              {budgetParts.map((part) => (
                <div className="budget-legend-item" key={part.key}>
                  <span className="budget-legend-dot" style={{ backgroundColor: part.color }} />
                  <span>{part.label} {Math.round(toNumber(part.value) / 1000)}k</span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Row 3: Contractors | Site status (side by side) */}
      <Row className="row-cards g-4">
        <Col lg={6} className="col-card">
          <Card className="site-detail-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Card.Title className="mb-0 d-flex align-items-center gap-2">
                <IconContractors /> Contractors
              </Card.Title>
              {isAdmin && (
                <Button variant="outline-primary" size="sm" className="btn-add" onClick={() => setShowAddContractor(true)}>
                  + Add
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {contractors.length === 0 ? (
                <p className="empty-state mb-0">No contractors assigned.</p>
              ) : (
                <>
                  <p className="contractors-count">{contractors.length} member{contractors.length !== 1 ? 's' : ''}</p>
                  <Table size="sm" responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Attendance</th>
                        {isAdmin && <th className="text-end">Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {contractors.map((c) => (
                        <tr key={c.id}>
                          <td><span className="fw-medium">{c.username ?? '—'}</span>{c.mobile && <span className="text-muted small d-block">{c.mobile}</span>}</td>
                          <td>
                            <Badge bg={formatAttendance(c.attendance_status).variant}>{formatAttendance(c.attendance_status).label}</Badge>
                          </td>
                          {isAdmin && (
                            <td className="text-end">
                              <Button variant="outline-danger" size="sm" onClick={() => handleRemoveContractor(c.id)}>Remove</Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="col-card">
          <Card className="site-detail-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Card.Title className="mb-0">Site status</Card.Title>
              {canEditSiteStatus && (
                <Button variant="outline-primary" size="sm" className="btn-add" onClick={openAddStatus}>
                  + Add status
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {siteStatuses.length > 0 && (
                <div className="status-progress-wrap">
                  <div className="small text-muted mb-1">Progress</div>
                  <ProgressBar now={progressPercent} label={`${Math.round(progressPercent)}%`} variant="primary" className="progress" style={{ height: 8 }} />
                </div>
              )}
              {siteStatuses.length === 0 ? (
                <p className="empty-state mb-0">No statuses recorded.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {siteStatuses.map((st) => (
                    <li key={st.id} className="list-group-item d-flex justify-content-between align-items-center px-0 border-0 border-bottom">
                      <div>
                        <strong>{st.status_name}</strong>
                        {(st.start_date || st.estimated_completion_date) && (
                          <span className="text-muted small ms-2">
                            {st.start_date && `${st.start_date}`}
                            {st.estimated_completion_date && ` → ${st.estimated_completion_date}`}
                          </span>
                        )}
                      </div>
                      {canEditSiteStatus && (
                        <Button variant="outline-secondary" size="sm" className="btn-edit" onClick={() => openEditStatus(st)}>Edit</Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add contractor modal (admin only) */}
      <Modal show={showAddContractor} onHide={() => setShowAddContractor(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add contractor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Contractor</Form.Label>
            <Form.Select value={addContractorId} onChange={(e) => setAddContractorId(e.target.value)}>
              <option value="">Select...</option>
              {availableContractors.map((u) => (
                <option key={contractorUserId(u)} value={contractorUserId(u)}>{u.username} {u.mobile ? `(${u.mobile})` : ''}</option>
              ))}
            </Form.Select>
          </Form.Group>
          {availableContractors.length === 0 && <p className="small text-muted">No more contractors available to add.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddContractor(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddContractor} disabled={!addContractorId || adding}>
            {adding ? 'Adding…' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit site status modal (supervisor only) */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingStatus ? 'Edit site status' : 'Add site status'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Status name</Form.Label>
            <Form.Control
              value={statusForm.status_name}
              onChange={(e) => setStatusForm((f) => ({ ...f, status_name: e.target.value }))}
              placeholder="e.g. Foundation"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Start date</Form.Label>
            <Form.Control
              type="date"
              value={statusForm.start_date}
              onChange={(e) => setStatusForm((f) => ({ ...f, start_date: e.target.value }))}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Estimated completion date</Form.Label>
            <Form.Control
              type="date"
              value={statusForm.estimated_completion_date}
              onChange={(e) => setStatusForm((f) => ({ ...f, estimated_completion_date: e.target.value }))}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveStatus} disabled={!statusForm.status_name?.trim() || savingStatus}>
            {savingStatus ? 'Saving…' : editingStatus ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
