import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Spinner, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { adminApi } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const iconSize = 16;
const iconClass = 'admin-site-card-icon';

const SiteCardIcons = {
  person: (
    <svg className={iconClass} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
  ),
  cash: (
    <svg className={iconClass} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path d="M16 8h.01M8 8h.01M16 16h.01M8 16h.01"/></svg>
  ),
  location: (
    <svg className={iconClass} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  supervisor: (
    <svg className={iconClass} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  calendar: (
    <svg className={iconClass} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  community: (
    <svg className={iconClass} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  paid: (
    <svg className={iconClass} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/></svg>
  ),
  spent: (
    <svg className={iconClass} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  ),
};

const INITIAL_FORM = {
  type: 'individual',
  communityOption: '', // '' | communityId | 'other'
  site_name: '',
  client_name: '',
  client_phone: '',
  supervisor_id: '',
  designer_id: '',
  address: '',
  coordinates: '',
  budget: '',
  status: 'active',
  // For "Other" community
  community_name: '',
  community_address: '',
  community_coordinates: '',
};

export default function AdminSites() {
  const { user } = useAuth();
  const [value, setValue] = useState('individual');
  const [searchQuery, setSearchQuery] = useState('');
  const [sites, setSites] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadSites = () => {
    adminApi
      .getSites()
      .then((res) => setSites(res.data?.data?.sites ?? []))
      .catch(() => setSites([]));
  };

  useEffect(() => {
    setError(null);
    adminApi
      .getSites()
      .then((res) => setSites(res.data?.data?.sites ?? []))
      .catch((err) => {
        setSites([]);
        setError(err.response?.data?.message || err.message || 'Failed to load sites');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showAddModal && user?.company_id) {
      const cid = user.company_id;
      adminApi.getCommunities(cid).then((res) => setCommunities(res.data?.data?.communities ?? [])).catch(() => setCommunities([]));
      adminApi.getSupervisors(cid).then((res) => setSupervisors(res.data?.data ?? [])).catch(() => setSupervisors([]));
      adminApi.getDesigners(cid).then((res) => setDesigners(res.data?.data ?? [])).catch(() => setDesigners([]));
    }
  }, [showAddModal, user?.company_id]);

  const searchLower = searchQuery.trim().toLowerCase();
  const matchesSearch = (site) => {
    if (!searchLower) return true;
    const name = (site.site_name ?? '').toLowerCase();
    const client = (site.client_name ?? '').toLowerCase();
    const mobile = String(site.client_phone ?? '').toLowerCase();
    const community = (site.community_name ?? '').toLowerCase();
    return (
      name.includes(searchLower) ||
      client.includes(searchLower) ||
      mobile.includes(searchLower) ||
      community.includes(searchLower)
    );
  };

  const individualSites = sites
    .filter((s) => s.type === 'individual')
    .filter(matchesSearch);
  const communitySites = sites
    .filter((s) => s.type === 'community')
    .filter(matchesSearch);

  // Group community sites by community (name + address) for Communities tab
  const communityGroups = communitySites.reduce((acc, site) => {
    const key = `${site.community_id ?? 0}|${site.community_name ?? ''}|${site.community_address ?? ''}`;
    if (!acc[key]) acc[key] = { community_name: site.community_name ?? 'Unknown', community_address: site.community_address ?? '', sites: [] };
    acc[key].sites.push(site);
    return acc;
  }, {});
  const communityGroupList = Object.values(communityGroups);

  const isSearching = searchQuery.trim().length > 0;
  const searchResults = isSearching ? [...individualSites, ...communitySites] : [];

  const renderSiteCard = (site, showTypeBadge = false, showCommunityName = false) => (
    <Link to={`/admin/sites/${site.id}`} className="text-decoration-none text-dark d-block h-100">
    <Card className="admin-site-card border-0 shadow-sm h-100">
      <Card.Body>
        <div className="admin-site-card-header">
          <h3 className="admin-site-card-title">{site.site_name}</h3>
          <div className="d-flex align-items-center gap-1 flex-wrap justify-content-end">
            {showTypeBadge && (
              <span className={`badge text-nowrap ${site.type === 'community' ? 'bg-primary' : 'bg-secondary'}`}>
                {site.type === 'community' ? 'Community' : 'Individual'}
              </span>
            )}
            <span className="badge bg-light text-dark text-nowrap">{site.status ?? '—'}</span>
          </div>
        </div>
        <div className="admin-site-card-meta">
          {showCommunityName && site.type === 'community' && site.community_name && (
            <div className="admin-site-card-meta-row" title="Community">
              <span className="admin-site-card-meta-icon">{SiteCardIcons.community}</span>
              <span>{site.community_name}</span>
            </div>
          )}
          <div className="admin-site-card-meta-twocol">
            <div className="admin-site-card-meta-row" title="Client">
              <span className="admin-site-card-meta-icon">{SiteCardIcons.person}</span>
              <span>{site.client_name ?? '—'}</span>
            </div>
            <div className="admin-site-card-meta-row" title="Budget">
              <span className="admin-site-card-meta-icon">{SiteCardIcons.cash}</span>
              <span>{(site.budget != null && site.budget !== '') ? site.budget : '—'}</span>
            </div>
          </div>
          <div className="admin-site-card-meta-twocol">
            <div className="admin-site-card-meta-row" title="Supervisor">
              <span className="admin-site-card-meta-icon">{SiteCardIcons.supervisor}</span>
              <span>{site.supervisor_name ?? '—'}</span>
            </div>
            <div className="admin-site-card-meta-row" title="Created">
              <span className="admin-site-card-meta-icon">{SiteCardIcons.calendar}</span>
              <span>{site.created_at ? new Date(site.created_at).toLocaleDateString() : '—'}</span>
            </div>
          </div>
          {site.address && (
            <div className="admin-site-card-meta-row" title="Address">
              <span className="admin-site-card-meta-icon">{SiteCardIcons.location}</span>
              <span>{site.address}</span>
            </div>
          )}
        </div>
        <div className="admin-site-card-stats">
          <div className="admin-site-card-stat" title="Budget">
            <div className="admin-site-card-stat-icon">{SiteCardIcons.cash}</div>
            <div className="admin-site-card-stat-value">{site.budget ?? '—'}</div>
          </div>
          <div className="admin-site-card-stat" title="Total paid">
            <div className="admin-site-card-stat-icon">{SiteCardIcons.paid}</div>
            <div className="admin-site-card-stat-value">—</div>
          </div>
          <div className="admin-site-card-stat" title="Total spent">
            <div className="admin-site-card-stat-icon">{SiteCardIcons.spent}</div>
            <div className="admin-site-card-stat-value">—</div>
          </div>
        </div>
      </Card.Body>
    </Card>
    </Link>
  );

  const openAddModal = () => {
    setForm(INITIAL_FORM);
    setSubmitError(null);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setSubmitError(null);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'type') setForm((prev) => ({ ...prev, communityOption: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.site_name?.trim() || !form.client_name?.trim()) {
      setSubmitError('Site name and client name are required.');
      return;
    }

    if (form.type === 'individual') {
      const supervisorOk = !!String(form.supervisor_id ?? '').trim();
      const designerOk = !!String(form.designer_id ?? '').trim();
      if (!supervisorOk && !designerOk) {
        setSubmitError('For individual sites, select Supervisor or Designer.');
        return;
      }
    }

    if (form.type === 'community') {
      if (!form.communityOption) {
        setSubmitError('Please select a community or "Other (new community)".');
        return;
      }
      if (form.communityOption === 'other' && !form.community_name?.trim()) {
        setSubmitError('Community name is required when adding a new community.');
        return;
      }
    }

    setSubmitting(true);
    const payload = {
      type: form.type,
      site_name: form.site_name.trim(),
      client_name: form.client_name.trim(),
      client_phone: form.client_phone?.trim() || undefined,
      supervisor_id: form.supervisor_id ? parseInt(form.supervisor_id, 10) : undefined,
      designer_id: form.designer_id ? parseInt(form.designer_id, 10) : undefined,
      address: form.address?.trim() || undefined,
      coordinates: form.coordinates?.trim() || undefined,
      budget: form.budget?.trim() || undefined,
      status: form.status || 'active',
    };

    if (form.type === 'community') {
      if (form.communityOption === 'other') {
        payload.community_name = form.community_name.trim();
        payload.company_id = user?.company_id;
        payload.address = form.community_address?.trim() || undefined;
        payload.coordinates = form.community_coordinates?.trim() || undefined;
      } else {
        payload.community_id = parseInt(form.communityOption, 10);
      }
    }

    adminApi
      .addSite(payload, user?.id)
      .then(() => {
        closeAddModal();
        loadSites();
      })
      .catch((err) => {
        setSubmitError(err.response?.data?.message || err.message || 'Failed to add site');
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: 'var(--sitex-primary-alt)' }} />
      </div>
    );
  }

  return (
    <div className="admin-sites">
      <div className="admin-page-header mb-4 d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div>
          <h1 className="admin-page-title mb-1">Sites</h1>
          <p className="admin-page-subtitle mb-0">Manage individual and community sites</p>
          {error && (
            <div className="alert alert-warning py-2 mt-2 mb-0" role="alert">
              {error}
            </div>
          )}
        </div>
        <Button variant="primary" onClick={openAddModal} className="align-self-center">
          Add site
        </Button>
      </div>

      <Form.Group className="mb-3">
        <Form.Control
          type="search"
          placeholder="Search by site name, community name, client name, or client mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
          aria-label="Search sites"
        />
      </Form.Group>

      {isSearching ? (
        <>
          {searchResults.length === 0 ? (
            <p className="py-5 text-center text-muted mb-0">No sites match your search.</p>
          ) : (
            <Row className="g-3">
              {searchResults.map((site) => (
                <Col key={site.id} xs={12} md={6} lg={4}>
                  {renderSiteCard(site, true, true)}
                </Col>
              ))}
            </Row>
          )}
        </>
      ) : (
        <Tabs value={value} onValueChange={(v) => setValue(v || 'individual')} className="mb-3">
          <TabsList>
            <TabsTrigger value="individual">Individual ({individualSites.length})</TabsTrigger>
            <TabsTrigger value="communities">Communities ({communitySites.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="individual">
            {individualSites.length === 0 ? (
              <p className="py-5 text-center text-muted mb-0">No individual sites yet.</p>
            ) : (
              <Row className="g-3">
                {individualSites.map((site) => (
                  <Col key={site.id} xs={12} md={6} lg={4}>
                    {renderSiteCard(site)}
                  </Col>
                ))}
              </Row>
            )}
          </TabsContent>
          <TabsContent value="communities">
            {communitySites.length === 0 ? (
              <p className="py-5 text-center text-muted mb-0">No community sites yet.</p>
            ) : (
              <div className="community-groups">
                {communityGroupList.map((group, idx) => (
                  <div key={idx} className="mb-4">
                    <h5 className="mb-3 text-secondary">
                      {group.community_name}
                      {group.community_address && (
                        <span className="fw-normal text-muted small ms-2"> — {group.community_address}</span>
                      )}
                    </h5>
                    <Row className="g-3">
                      {group.sites.map((site) => (
                        <Col key={site.id} xs={12} md={6} lg={4}>
                          {renderSiteCard(site)}
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Modal show={showAddModal} onHide={closeAddModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add site</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {submitError && (
              <div className="alert alert-warning py-2 mb-3" role="alert">
                {submitError}
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Site type</Form.Label>
              <Form.Select
                value={form.type}
                onChange={(e) => updateForm('type', e.target.value)}
                aria-label="Site type"
              >
                <option value="individual">Individual</option>
                <option value="community">Community</option>
              </Form.Select>
            </Form.Group>

            {form.type === 'community' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Community</Form.Label>
                  <Form.Select
                    value={form.communityOption}
                    onChange={(e) => updateForm('communityOption', e.target.value)}
                    aria-label="Select community"
                  >
                    <option value="">Select community</option>
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.community_name}
                      </option>
                    ))}
                    <option value="other">Other (new community)</option>
                  </Form.Select>
                </Form.Group>

                {form.communityOption === 'other' && (
                  <Card className="border mb-3 p-3 bg-light">
                    <Card.Body className="p-0">
                      <p className="small text-muted mb-3">Community details</p>
                      <Form.Group className="mb-3">
                        <Form.Label>Community name</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.community_name}
                          onChange={(e) => updateForm('community_name', e.target.value)}
                          placeholder="e.g. Sunset Residency"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.community_address}
                          onChange={(e) => updateForm('community_address', e.target.value)}
                          placeholder="Community address"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Coordinates / Map link</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.community_coordinates}
                          onChange={(e) => updateForm('community_coordinates', e.target.value)}
                          placeholder="Google Maps link or lat,lng (e.g. 12.34,56.78)"
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                )}
              </>
            )}

            <Row className="g-2 mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Site name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.site_name}
                    onChange={(e) => updateForm('site_name', e.target.value)}
                    placeholder="e.g. Plot 1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Client name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.client_name}
                    onChange={(e) => updateForm('client_name', e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Client mobile</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.client_phone}
                    onChange={(e) => updateForm('client_phone', e.target.value)}
                    placeholder="e.g. 9876543210"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-2 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Budget</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.budget}
                    onChange={(e) => updateForm('budget', e.target.value)}
                    placeholder="e.g. 50000 or ₹5,00,000"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={(e) => updateForm('status', e.target.value)}
                    aria-label="Status"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-2 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Supervisor</Form.Label>
                  <Form.Select
                    value={form.supervisor_id}
                    onChange={(e) => updateForm('supervisor_id', e.target.value)}
                    aria-label="Select supervisor"
                  >
                    <option value="">Select supervisor</option>
                    {supervisors.map((u) => (
                      <option key={u.adminId ?? u.id} value={u.adminId ?? u.id}>
                        {u.username ?? u.email ?? `ID ${u.adminId ?? u.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Designer</Form.Label>
                  <Form.Select
                    value={form.designer_id}
                    onChange={(e) => updateForm('designer_id', e.target.value)}
                    aria-label="Select designer"
                  >
                    <option value="">Select designer</option>
                    {designers.map((u) => (
                      <option key={u.adminId ?? u.id} value={u.adminId ?? u.id}>
                        {u.username ?? u.email ?? `ID ${u.adminId ?? u.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {form.type === 'individual' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    placeholder="Site address"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Coordinates / Map link</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.coordinates}
                    onChange={(e) => updateForm('coordinates', e.target.value)}
                    placeholder="Google Maps link or lat,lng (e.g. 12.34,56.78)"
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeAddModal} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add site'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
