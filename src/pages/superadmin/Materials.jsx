import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { superAdminApi } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import './MaterialsCatalog.css';

const OTHER_OPTION = '__other__';

const emptyThicknessRow = () => ({
  key: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label: '',
  value_mm: ''
});

function materialToForm(material) {
  const firstBrand = material?.brands?.[0];
  const rows =
    (firstBrand?.thickness_links || []).map((l) => ({
      key: `t-${l.id}`,
      label: l?.thickness?.label || '',
      value_mm:
        l?.thickness?.value_mm != null && l?.thickness?.value_mm !== ''
          ? String(l.thickness.value_mm)
          : ''
    })) || [];
  return {
    material_name: material?.material_name || '',
    material_code: material?.material_code || '',
    unit_id: material?.unit_id != null ? String(material.unit_id) : '',
    material_image_path: material?.image_path || '',
    category_name: material?.category?.category_name || '',
    category_image_path: material?.category?.image_path || '',
    brand_name: firstBrand?.brand_name || '',
    brand_image_path: firstBrand?.brand_image || '',
    thickness_rows: rows.length ? rows : [emptyThicknessRow()]
  };
}

export default function SuperAdminMaterials() {
  const { user } = useAuth();
  const adminId = user?.id;

  const [materials, setMaterials] = useState([]);
  const [materialTree, setMaterialTree] = useState([]);
  const [temporarySubmissions, setTemporarySubmissions] = useState([]);
  const [units, setUnits] = useState([]);

  const [matLoading, setMatLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [showMatModal, setShowMatModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvingSubmission, setApprovingSubmission] = useState(null);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [form, setForm] = useState(() => ({
    material_name: '',
    material_code: '',
    unit_id: '',
    material_image_path: '',
    category_name: '',
    category_image_path: '',
    brand_name: '',
    brand_image_path: '',
    thickness_rows: [emptyThicknessRow()]
  }));
  const [materialImageFile, setMaterialImageFile] = useState(null);
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [brandImageFile, setBrandImageFile] = useState(null);
  const [categorySelect, setCategorySelect] = useState('');
  const [brandSelect, setBrandSelect] = useState('');
  const [approvalForm, setApprovalForm] = useState({
    category_name: '',
    brand_name: '',
    material_name: '',
    material_code: '',
    unit_id: '',
    super_admin_notes: ''
  });

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await superAdminApi.uploadCatalogAsset(fd);
    const path = res.data?.data?.path;
    if (!path) throw new Error('Upload did not return a path');
    return path;
  };

  const loadUnits = useCallback(async () => {
    try {
      const res = await superAdminApi.getUnits();
      const raw = res.data?.data;
      setUnits(Array.isArray(raw) ? raw : raw?.units || []);
    } catch {
      setUnits([]);
    }
  }, []);

  const loadMaterials = useCallback(async () => {
    if (!adminId) {
      setMaterials([]);
      return;
    }
    setMatLoading(true);
    setError('');
    try {
      const res = await superAdminApi.getMaterialsCatalog(adminId);
      setMaterials(res.data?.data?.materials || []);
      setMaterialTree(res.data?.data?.material_tree || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load materials');
      setMaterials([]);
      setMaterialTree([]);
    } finally {
      setMatLoading(false);
    }
  }, [adminId]);

  const loadTemporarySubmissions = useCallback(async () => {
    if (!adminId) return;
    try {
      const res = await superAdminApi.getTemporaryMaterials(adminId, { status: 'pending' });
      setTemporarySubmissions(res.data?.data?.submissions || []);
    } catch {
      setTemporarySubmissions([]);
    }
  }, [adminId]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  useEffect(() => {
    loadTemporarySubmissions();
  }, [loadTemporarySubmissions]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const openCreateMaterial = () => {
    setEditingMaterialId(null);
    setForm({
      material_name: '',
      material_code: '',
      unit_id: units[0]?.id != null ? String(units[0].id) : '',
      material_image_path: '',
      category_name: '',
      category_image_path: '',
      brand_name: '',
      brand_image_path: '',
      thickness_rows: [emptyThicknessRow()]
    });
    setMaterialImageFile(null);
    setCategoryImageFile(null);
    setBrandImageFile(null);
    setCategorySelect('');
    setBrandSelect('');
    setShowMatModal(true);
  };

  const openEditMaterial = (m) => {
    setEditingMaterialId(m.id);
    setForm(materialToForm(m));
    setMaterialImageFile(null);
    setCategoryImageFile(null);
    setBrandImageFile(null);
    setCategorySelect(m?.category?.category_name || '');
    setBrandSelect(m?.brands?.[0]?.brand_name || '');
    setShowMatModal(true);
  };

  const payloadFromForm = async () => {
    let material_image_path = form.material_image_path?.trim() || null;
    if (materialImageFile) {
      material_image_path = await uploadFile(materialImageFile);
    }
    let category_image_path = form.category_image_path?.trim() || null;
    if (categoryImageFile) category_image_path = await uploadFile(categoryImageFile);
    let brand_image_path = form.brand_image_path?.trim() || null;
    if (brandImageFile) brand_image_path = await uploadFile(brandImageFile);

    const thicknesses = [];
    for (const row of form.thickness_rows || []) {
      const label = String(row.label ?? '').trim();
      if (!label) continue;
      const vmRaw = String(row.value_mm ?? '').trim();
      const value_mm = vmRaw === '' ? undefined : Number(vmRaw);
      thicknesses.push({
        label,
        ...(value_mm !== undefined && !Number.isNaN(value_mm) ? { value_mm } : {})
      });
    }

    const unitId = Number(form.unit_id);

    return {
      admin_id: adminId,
      category_name: form.category_name.trim(),
      category_image_path,
      unit_id: unitId,
      material_code: form.material_code.trim(),
      material_name: form.material_name.trim(),
      image_path: material_image_path,
      brands: [
        {
          brand_name: form.brand_name.trim(),
          brand_image: brand_image_path,
          thicknesses
        }
      ]
    };
  };

  const saveMaterial = async (e) => {
    e.preventDefault();
    if (!adminId) return;
    if (!form.category_name.trim()) {
      setError('Please select category first.');
      return;
    }
    if (!form.brand_name.trim()) {
      setError('Please select brand first.');
      return;
    }
    if (!form.material_code.trim()) {
      setError('Material code is required.');
      return;
    }
    if (!form.material_name.trim() || !form.unit_id) return;

    setSaving(true);
    setError('');
    try {
      const body = await payloadFromForm();
      if (editingMaterialId) {
        await superAdminApi.updateMaterialCatalog(editingMaterialId, body);
      } else {
        await superAdminApi.createMaterialCatalog(body);
      }
      setShowMatModal(false);
      await loadMaterials();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const removeMaterial = async (m) => {
    if (!adminId) return;
    if (!window.confirm(`Delete material "${m.material_name}"?`)) return;
    setSaving(true);
    setError('');
    try {
      await superAdminApi.deleteMaterialCatalog(m.id, adminId);
      await loadMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const openApproveModal = (submission) => {
    setApprovingSubmission(submission);
    setApprovalForm({
      category_name: submission.category_name || '',
      brand_name: submission.brand_name || '',
      material_name: submission.material_name || '',
      material_code: submission.material_code || '',
      unit_id: submission.unit_id ? String(submission.unit_id) : '',
      super_admin_notes: ''
    });
    setShowApproveModal(true);
  };

  const approveSubmission = async (e) => {
    e.preventDefault();
    if (!approvingSubmission || !adminId) return;
    if (!approvalForm.category_name.trim() || !approvalForm.brand_name.trim() || !approvalForm.material_name.trim()) {
      setError('Category, brand and material name are required for approval.');
      return;
    }
    if (!approvalForm.unit_id) {
      setError('Unit is required for approval.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await superAdminApi.approveTemporaryMaterial(approvingSubmission.id, adminId, {
        category_name: approvalForm.category_name.trim(),
        brand_name: approvalForm.brand_name.trim(),
        material_name: approvalForm.material_name.trim(),
        material_code: approvalForm.material_code.trim(),
        unit_id: Number(approvalForm.unit_id),
        super_admin_notes: approvalForm.super_admin_notes.trim() || null
      });
      setShowApproveModal(false);
      setApprovingSubmission(null);
      await Promise.all([loadMaterials(), loadTemporarySubmissions()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    } finally {
      setSaving(false);
    }
  };

  const updateThicknessRow = (rowKey, patch) => {
    setForm((f) => ({
      ...f,
      thickness_rows: (f.thickness_rows || []).map((r) => (r.key === rowKey ? { ...r, ...patch } : r))
    }));
  };

  const addThicknessRow = () => {
    setForm((f) => ({
      ...f,
      thickness_rows: [...(f.thickness_rows || []), emptyThicknessRow()]
    }));
  };

  const removeThicknessRow = (rowKey) => {
    setForm((f) => ({
      ...f,
      thickness_rows: (f.thickness_rows || []).filter((r) => r.key !== rowKey).length
        ? (f.thickness_rows || []).filter((r) => r.key !== rowKey)
        : [emptyThicknessRow()]
    }));
  };

  const sortedMaterials = useMemo(
    () => [...materials].sort((a, b) => String(a.material_name).localeCompare(String(b.material_name))),
    [materials]
  );
  const categoryOptions = useMemo(() => {
    const rows = Array.from(
      new Set((materialTree || []).map((x) => x.category_name).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return [...rows, OTHER_OPTION];
  }, [materialTree]);

  const brandOptionsForSelectedCategory = useMemo(() => {
    const c = (materialTree || []).find((x) => x.category_name === form.category_name);
    const rows = Array.from(new Set((c?.brands || []).map((b) => b.brand_name).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b)
    );
    return [...rows, OTHER_OPTION];
  }, [materialTree, form.category_name]);

  return (
    <div className="materials-catalog-page">
      <div className="admin-page-header mb-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 className="admin-page-title mb-1">Materials catalog</h1>
          <p className="admin-page-subtitle mb-0">
            Each material has a unit and image, then brands with thickness rows. Material code is unique across the
            system.
          </p>
        </div>
        <Button variant="primary" onClick={openCreateMaterial}>
          Add material
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="fw-semibold">Temporary material submissions</div>
            <Badge bg="warning" text="dark">
              {temporarySubmissions.length} pending
            </Badge>
          </div>
          {temporarySubmissions.length === 0 ? (
            <div className="small text-muted">No pending submissions.</div>
          ) : (
            <Row className="g-2">
              {temporarySubmissions.map((s) => (
                <Col xs={12} md={6} lg={4} key={s.id}>
                  <Card className="h-100 border">
                    <Card.Body className="d-flex flex-column">
                      <div className="fw-semibold text-truncate">{s.material_name}</div>
                      <div className="small text-muted">{s.company?.company_name || 'Unknown company'}</div>
                      <div className="small text-muted">Category: {s.category_name}</div>
                      <div className="small text-muted">Brand: {s.brand_name}</div>
                      <div className="small text-muted mb-2">Code: {s.material_code || '—'}</div>
                      <Button size="sm" className="mt-auto" onClick={() => openApproveModal(s)}>
                        Approve and publish
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {matLoading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="g-3">
          <Col xs={12}>
            {sortedMaterials.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-muted py-5 text-center">No materials yet. Add one to start.</Card.Body>
              </Card>
            ) : (
              <Row className="g-3">
                {sortedMaterials.map((m) => (
                  <Col key={m.id} xs={12} sm={6} md={4} lg={3}>
                    <Card className="border-0 shadow-sm h-100 materials-catalog-card">
                      <div className="materials-catalog-thumb">
                        {m.image_url ? (
                          <img src={m.image_url} alt="" />
                        ) : (
                          <span className="text-muted small">No image</span>
                        )}
                      </div>
                      <Card.Body>
                        <div className="fw-semibold text-truncate" title={m.material_name}>
                          {m.material_name}
                        </div>
                        <div className="small text-muted">
                          Category: {m.category?.category_name || 'Uncategorized'}
                        </div>
                        <div className="small text-muted mb-2">
                          Unit: {m.unit?.measuring_unit || m.unit_id || '—'}
                        </div>
                        <div className="small text-muted font-monospace mb-2">Code: {m.material_code || '—'}</div>
                        <Badge bg="secondary" className="me-1">
                          {(m.brands || []).length} brand(s)
                        </Badge>
                        <div className="d-flex gap-2 mt-3">
                          <Button size="sm" variant="outline-primary" onClick={() => openEditMaterial(m)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => removeMaterial(m)} disabled={saving}>
                            Delete
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      )}

      <Modal
        show={showMatModal}
        onHide={() => !saving && setShowMatModal(false)}
        size="lg"
        centered
        scrollable
        className="materials-catalog-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingMaterialId ? 'Edit material' : 'Add material'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="materials-catalog-modal-body">
          <Form id="material-catalog-form" onSubmit={saveMaterial}>
            <Row className="g-2 mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={categorySelect}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCategorySelect(value);
                      setBrandSelect('');
                      if (value && value !== OTHER_OPTION) {
                        const treeCat = materialTree.find((x) => x.category_name === value);
                        setForm((f) => ({
                          ...f,
                          category_name: value,
                          category_image_path: treeCat?.category_image_path || f.category_image_path,
                          brand_name: '',
                          brand_image_path: ''
                        }));
                      } else if (value === OTHER_OPTION) {
                        setForm((f) => ({ ...f, category_name: '', category_image_path: '', brand_name: '', brand_image_path: '' }));
                      }
                    }}
                  >
                    <option value="">Select category…</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c === OTHER_OPTION ? 'Others' : c}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {categorySelect === OTHER_OPTION ? (
              <Row className="g-2 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Category name</Form.Label>
                    <Form.Control
                      value={form.category_name}
                      onChange={(e) => setForm((f) => ({ ...f, category_name: e.target.value }))}
                      placeholder="New category name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Category image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCategoryImageFile(e.target.files?.[0] || null)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            ) : null}

            <Row className="g-2 mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Brand</Form.Label>
                  <Form.Select
                    value={brandSelect}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBrandSelect(value);
                      if (value && value !== OTHER_OPTION) {
                        const treeCat = materialTree.find((x) => x.category_name === form.category_name);
                        const treeBrand = treeCat?.brands?.find((b) => b.brand_name === value);
                        setForm((f) => ({
                          ...f,
                          brand_name: value,
                          brand_image_path: treeBrand?.brand_image_path || f.brand_image_path
                        }));
                      } else if (value === OTHER_OPTION) {
                        setForm((f) => ({ ...f, brand_name: '', brand_image_path: '' }));
                      }
                    }}
                    disabled={!form.category_name}
                  >
                    <option value="">{form.category_name ? 'Select brand…' : 'Select category first'}</option>
                    {brandOptionsForSelectedCategory.map((b) => (
                      <option key={b} value={b}>
                        {b === OTHER_OPTION ? 'Others' : b}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {brandSelect === OTHER_OPTION ? (
              <Row className="g-2 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Brand name</Form.Label>
                    <Form.Control
                      value={form.brand_name}
                      onChange={(e) => setForm((f) => ({ ...f, brand_name: e.target.value }))}
                      placeholder="New brand name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Brand image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBrandImageFile(e.target.files?.[0] || null)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            ) : null}

            <Row className="g-2 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Material name</Form.Label>
                  <Form.Control
                    value={form.material_name}
                    onChange={(e) => setForm((f) => ({ ...f, material_name: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Material code</Form.Label>
                  <Form.Control
                    value={form.material_code}
                    onChange={(e) => setForm((f) => ({ ...f, material_code: e.target.value }))}
                    placeholder="e.g. MAT-PLY-001"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-2 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Unit</Form.Label>
                  <Form.Select
                    value={form.unit_id}
                    onChange={(e) => setForm((f) => ({ ...f, unit_id: e.target.value }))}
                    required
                  >
                    <option value="">Select unit…</option>
                    {units.map((u) => (
                      <option key={u.id} value={String(u.id)}>
                        {u.measuring_unit}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Material image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setMaterialImageFile(e.target.files?.[0] || null)}
              />
              <Form.Text className="text-muted">
                Optional. Uploads to storage; leave empty to keep existing path when editing.
              </Form.Text>
              {!materialImageFile && form.material_image_path ? (
                <div className="small text-muted mt-1">Current path: {form.material_image_path}</div>
              ) : null}
            </Form.Group>
            <div className="small text-muted mb-1">Thicknesses</div>
            {(form.thickness_rows || []).map((row) => (
              <div key={row.key} className="materials-catalog-thickness-row mb-2">
                <Row className="g-1 align-items-end">
                  <Col xs={12} sm={7}>
                    <Form.Label className="small mb-0">Label</Form.Label>
                    <Form.Control
                      size="sm"
                      value={row.label}
                      onChange={(e) => updateThicknessRow(row.key, { label: e.target.value })}
                      placeholder="18mm"
                    />
                  </Col>
                  <Col xs={8} sm={4}>
                    <Form.Label className="small mb-0">mm (opt.)</Form.Label>
                    <Form.Control
                      size="sm"
                      value={row.value_mm}
                      onChange={(e) => updateThicknessRow(row.key, { value_mm: e.target.value })}
                      placeholder="18"
                    />
                  </Col>
                  <Col xs={4} sm={1} className="text-end">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="text-danger py-0 px-0"
                      title="Remove row"
                      onClick={() => removeThicknessRow(row.key)}
                    >
                      ×
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
            <Button type="button" variant="outline-secondary" size="sm" onClick={addThicknessRow}>
              + Thickness
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={() => setShowMatModal(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="material-catalog-form" variant="primary" disabled={saving}>
            {saving ? 'Saving…' : editingMaterialId ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showApproveModal} onHide={() => !saving && setShowApproveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Approve temporary material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={approveSubmission}>
            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Control
                value={approvalForm.category_name}
                onChange={(e) => setApprovalForm((f) => ({ ...f, category_name: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                value={approvalForm.brand_name}
                onChange={(e) => setApprovalForm((f) => ({ ...f, brand_name: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Material name</Form.Label>
              <Form.Control
                value={approvalForm.material_name}
                onChange={(e) => setApprovalForm((f) => ({ ...f, material_name: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Material code</Form.Label>
              <Form.Control
                value={approvalForm.material_code}
                onChange={(e) => setApprovalForm((f) => ({ ...f, material_code: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Unit</Form.Label>
              <Form.Select
                value={approvalForm.unit_id}
                onChange={(e) => setApprovalForm((f) => ({ ...f, unit_id: e.target.value }))}
                required
              >
                <option value="">Select unit...</option>
                {units.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.measuring_unit}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={approvalForm.super_admin_notes}
                onChange={(e) => setApprovalForm((f) => ({ ...f, super_admin_notes: e.target.value }))}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowApproveModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Approving…' : 'Approve'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
