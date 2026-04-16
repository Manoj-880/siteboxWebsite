import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { adminApi, superAdminApi } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import './Materials.css';

const BRAND_ACCENT_PALETTE = ['#c92a2a', '#e67700', '#2b8a3e', '#1864ab', '#5f3dc4', '#a61e4d', '#0b7285'];

function brandAccentColor(name) {
  const s = String(name || '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h + s.charCodeAt(i) * (i + 1)) % 997;
  return BRAND_ACCENT_PALETTE[h % BRAND_ACCENT_PALETTE.length];
}

export default function AdminMaterials() {
  const { user } = useAuth();
  const adminId = user?.id;

  const [materialTree, setMaterialTree] = useState([]);
  const [loadingMats, setLoadingMats] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedBrandName, setSelectedBrandName] = useState('');
  const [materialModal, setMaterialModal] = useState(null);
  const [showTempModal, setShowTempModal] = useState(false);
  const [submittingTemp, setSubmittingTemp] = useState(false);
  const [units, setUnits] = useState([]);
  const [tempForm, setTempForm] = useState({
    category_name: '',
    brand_name: '',
    material_name: '',
    material_code: '',
    unit_id: '',
    thicknesses_text: ''
  });
  const [tempFiles, setTempFiles] = useState({
    category: null,
    brand: null,
    material: null
  });
  const [listRefreshing, setListRefreshing] = useState(false);
  const materialsFetchSeq = useRef(0);
  /** After first materials request finishes, use inline refresh instead of full-page spinner. */
  const materialsInitialFetchDoneRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    materialsInitialFetchDoneRef.current = false;
  }, [adminId]);

  const loadMaterials = useCallback(async () => {
    if (!adminId) return;
    const seq = ++materialsFetchSeq.current;
    const blockingLoad = !materialsInitialFetchDoneRef.current;
    setError('');
    if (blockingLoad) {
      setLoadingMats(true);
    } else {
      setListRefreshing(true);
    }
    try {
      const params = debouncedSearch ? { q: debouncedSearch } : {};
      const res = await adminApi.getMaterials(adminId, params);
      if (seq !== materialsFetchSeq.current) return;
      const tree = res.data?.data?.material_tree || [];
      setMaterialTree(tree);
      setSelectedCategoryName((prevCat) => {
        const nextCat =
          prevCat && tree.some((c) => c.category_name === prevCat) ? prevCat : tree[0]?.category_name || '';
        setSelectedBrandName((prevBrand) => {
          if (!nextCat || !prevBrand) return '';
          const cat = tree.find((c) => c.category_name === nextCat);
          const brandsInCat = (cat?.brands || []).map((b) => b.brand_name);
          return brandsInCat.includes(prevBrand) ? prevBrand : '';
        });
        return nextCat;
      });
    } catch (err) {
      if (seq !== materialsFetchSeq.current) return;
      setError(err.response?.data?.message || 'Failed to load materials');
      setMaterialTree([]);
      setSelectedCategoryName('');
      setSelectedBrandName('');
    } finally {
      if (seq !== materialsFetchSeq.current) return;
      materialsInitialFetchDoneRef.current = true;
      if (blockingLoad) {
        setLoadingMats(false);
      } else {
        setListRefreshing(false);
      }
    }
  }, [adminId, debouncedSearch]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  useEffect(() => {
    if (!adminId) return;
    adminApi
      .getUnits(adminId)
      .then((res) => {
        const rows = res.data?.data?.units || [];
        setUnits(rows);
        if (rows[0]?.id) {
          setTempForm((f) => ({ ...f, unit_id: String(f.unit_id || rows[0].id) }));
        }
      })
      .catch(() => setUnits([]));
  }, [adminId]);

  const uploadFile = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append('file', file);
    const res = await superAdminApi.uploadCatalogAsset(fd);
    return res.data?.data?.path || null;
  };

  const submitTemporaryMaterial = async (e) => {
    e.preventDefault();
    if (!tempForm.category_name.trim() || !tempForm.brand_name.trim() || !tempForm.material_name.trim()) {
      setError('Category, brand, and material name are required.');
      return;
    }
    if (!tempForm.unit_id) {
      setError('Unit is required.');
      return;
    }

    setSubmittingTemp(true);
    setError('');
    try {
      const [categoryImagePath, brandImagePath, materialImagePath] = await Promise.all([
        uploadFile(tempFiles.category),
        uploadFile(tempFiles.brand),
        uploadFile(tempFiles.material)
      ]);
      const thicknesses = String(tempForm.thicknesses_text || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)
        .map((label) => ({ label }));

      await adminApi.submitTemporaryMaterial({
        category_name: tempForm.category_name.trim(),
        category_image_path: categoryImagePath,
        brand_name: tempForm.brand_name.trim(),
        brand_image_path: brandImagePath,
        material_name: tempForm.material_name.trim(),
        material_code: tempForm.material_code.trim() || null,
        unit_id: Number(tempForm.unit_id),
        image_path: materialImagePath,
        thicknesses
      });

      setShowTempModal(false);
      setTempForm((f) => ({
        ...f,
        category_name: '',
        brand_name: '',
        material_name: '',
        material_code: '',
        thicknesses_text: ''
      }));
      setTempFiles({ category: null, brand: null, material: null });
      setError('');
      await loadMaterials();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit temporary material');
    } finally {
      setSubmittingTemp(false);
    }
  };

  const selectedCategory = useMemo(
    () => materialTree.find((c) => c.category_name === selectedCategoryName) || null,
    [materialTree, selectedCategoryName]
  );
  const brands = selectedCategory?.brands || [];
  const selectedBrand = useMemo(
    () => brands.find((b) => b.brand_name === selectedBrandName) || null,
    [brands, selectedBrandName]
  );

  return (
    <div className="admin-materials materials-browser">
      <div className="admin-page-header mb-3">
        <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
          <div>
            <h1 className="admin-page-title mb-1">Materials</h1>
            <p className="admin-page-subtitle mb-0">
              Search globally by category, brand, material name, or material code.
            </p>
          </div>
          <Button
            onClick={() => setShowTempModal(true)}
            variant="outline-primary"
            className="flex-shrink-0"
          >
            Submit temporary material
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}

      {loadingMats ? (
        <div className="d-flex justify-content-center align-items-center py-5 materials-browser-loading">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="g-0 materials-browser-row">
          <Col xs={12} className="materials-browser-main-col p-0">
            <Row className="g-0 materials-browser-drill-row">
              <Col xs={12} md={4} lg={3} xl={3} className="materials-browser-sidebar-col">
                <aside className="materials-browser-sidebar">
                  <div className="materials-browser-sidebar-title">Categories</div>
                  <div className="materials-browser-sidebar-search">
                    <Form.Control
                      size="sm"
                      type="search"
                      placeholder="Search category, brand, material, code…"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.preventDefault();
                      }}
                      aria-label="Search materials globally"
                      autoComplete="off"
                    />
                    {listRefreshing ? (
                      <div className="materials-browser-sidebar-search-hint text-muted small mt-1">Updating…</div>
                    ) : null}
                  </div>
                  <div className="materials-browser-sidebar-list">
                    {materialTree.length === 0 ? (
                      <div className="materials-browser-empty text-muted small p-3">No materials in the catalog.</div>
                    ) : (
                      materialTree.map((category) => {
                        const active = selectedCategoryName === category.category_name;
                        return (
                          <button
                            key={category.category_name}
                            type="button"
                            className={`materials-browser-sidebar-item${active ? ' materials-browser-sidebar-item--active' : ''}`}
                            onClick={() => {
                              setSelectedCategoryName(category.category_name);
                              setSelectedBrandName('');
                              setMaterialModal(null);
                            }}
                          >
                            <div className="materials-browser-sidebar-text">
                              <span className="materials-browser-sidebar-name">{category.category_name}</span>
                              <span className="materials-browser-sidebar-meta">
                                {(category.brands || []).length} brand(s)
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </aside>
              </Col>

              <Col xs={12} md={4} lg={3} xl={3} className="materials-browser-sidebar-col materials-browser-brands-col">
                <aside className="materials-browser-sidebar">
                  <div className="materials-browser-sidebar-title">Brands</div>
                  <div className="materials-browser-sidebar-list">
                    {!selectedCategory ? (
                      <div className="materials-browser-empty text-muted small p-3">Select a category.</div>
                    ) : brands.length === 0 ? (
                      <div className="materials-browser-empty text-muted small p-3">No brands in this category.</div>
                    ) : (
                      brands.map((b) => {
                        const active = selectedBrandName === b.brand_name;
                        return (
                          <button
                            key={b.brand_name}
                            type="button"
                            className={`materials-browser-sidebar-item${active ? ' materials-browser-sidebar-item--active' : ''}`}
                            onClick={() => {
                              setSelectedBrandName(b.brand_name);
                              setMaterialModal(null);
                            }}
                          >
                            <div className="materials-browser-sidebar-thumb">
                              {b.brand_image_url ? (
                                <img src={b.brand_image_url} alt="" />
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </div>
                            <div className="materials-browser-sidebar-text">
                              <span className="materials-browser-sidebar-name">{b.brand_name}</span>
                              <span className="materials-browser-sidebar-meta">{(b.materials || []).length} material(s)</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </aside>
              </Col>

              <Col xs={12} md={4} lg={6} xl={6} className="materials-browser-main-col">
                <main className="materials-browser-main">
                  {!selectedCategory ? (
                    <div className="materials-browser-placeholder text-muted">Select a category from the left.</div>
                  ) : !selectedBrand ? (
                    <div className="materials-browser-placeholder text-muted">Select a brand to view materials.</div>
                  ) : (
                    <>
                      <div className="materials-browser-hero">
                        <div className="materials-browser-hero-text">
                          <h2 className="materials-browser-hero-title">{selectedBrand.brand_name}</h2>
                          <p className="materials-browser-hero-sub mb-0">
                            Category: <strong>{selectedCategory.category_name}</strong>
                          </p>
                        </div>
                        <div className="materials-browser-hero-visual">
                          {selectedBrand.brand_image_url ? (
                            <img src={selectedBrand.brand_image_url} alt="" />
                          ) : (
                            <span className="text-white-50 small">No image</span>
                          )}
                        </div>
                      </div>

                      <div className="materials-browser-section-label">Materials</div>
                      {(selectedBrand.materials || []).length === 0 ? (
                        <div className="text-muted py-4">No materials for this brand.</div>
                      ) : (
                        <div className="materials-brand-grid">
                          {(selectedBrand.materials || []).map((m) => (
                            <button
                              key={`${selectedBrand.brand_name}-${m.id}`}
                              type="button"
                              className="materials-brand-card"
                              onClick={() => setMaterialModal({ ...m, brand_name: selectedBrand.brand_name })}
                            >
                              <div
                                className="materials-brand-card-header"
                                style={{ background: brandAccentColor(selectedBrand.brand_name) }}
                              >
                                {m.material_name}
                              </div>
                              <div className="materials-brand-card-body">
                                {m.image_url ? (
                                  <img src={m.image_url} alt="" />
                                ) : (
                                  <div className="materials-brand-card-placeholder text-muted small">No image</div>
                                )}
                              </div>
                              <div className="materials-brand-card-footer">
                                <span className="materials-brand-card-footer-name">{m.material_name}</span>
                                <span className="materials-brand-card-footer-hint font-monospace">
                                  {m.material_code || '—'}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </main>
              </Col>
            </Row>
          </Col>
        </Row>
      )}

      <Modal show={!!materialModal} onHide={() => setMaterialModal(null)} centered size="md" className="materials-brand-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div className="d-flex align-items-center gap-3 w-100">
            <div className="materials-brand-modal-thumb flex-shrink-0">
              {materialModal?.image_url ? (
                <img src={materialModal.image_url} alt="" />
              ) : (
                <span className="text-muted small">—</span>
              )}
            </div>
            <div className="min-w-0">
              <Modal.Title as="h5" className="mb-0 text-truncate">
                {materialModal?.material_name}
              </Modal.Title>
              <div className="small text-muted text-truncate">
                {materialModal?.brand_name}
                {materialModal?.material_code ? ` · ${materialModal.material_code}` : ''}
              </div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <div className="materials-brand-modal-section">Available thicknesses</div>
          {(materialModal?.thicknesses || []).length === 0 ? (
            <p className="text-muted small mb-0">No thickness options for this brand.</p>
          ) : (
            <ul className="materials-thickness-list list-unstyled mb-0">
              {materialModal.thicknesses.map((th) => (
                <li key={th.id} className="materials-thickness-list-item">
                  <span className="materials-thickness-label">{th.label || '—'}</span>
                  <div className="materials-thickness-meta">
                    {th.value_mm != null ? (
                      <span className="materials-thickness-mm text-muted">
                        {String(th.value_mm)} mm
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showTempModal} onHide={() => !submittingTemp && setShowTempModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Submit Temporary Material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitTemporaryMaterial}>
            <Row className="g-2">
              <Col md={6}>
                <Form.Label>Category name</Form.Label>
                <Form.Control
                  value={tempForm.category_name}
                  onChange={(e) => setTempForm((f) => ({ ...f, category_name: e.target.value }))}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Brand name</Form.Label>
                <Form.Control
                  value={tempForm.brand_name}
                  onChange={(e) => setTempForm((f) => ({ ...f, brand_name: e.target.value }))}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Material name</Form.Label>
                <Form.Control
                  value={tempForm.material_name}
                  onChange={(e) => setTempForm((f) => ({ ...f, material_name: e.target.value }))}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Material code</Form.Label>
                <Form.Control
                  value={tempForm.material_code}
                  onChange={(e) => setTempForm((f) => ({ ...f, material_code: e.target.value }))}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Unit</Form.Label>
                <Form.Select
                  value={tempForm.unit_id}
                  onChange={(e) => setTempForm((f) => ({ ...f, unit_id: e.target.value }))}
                  required
                >
                  <option value="">Select unit...</option>
                  {units.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {u.measuring_unit || u.unit_name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Thicknesses (one per line)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={tempForm.thicknesses_text}
                  onChange={(e) => setTempForm((f) => ({ ...f, thicknesses_text: e.target.value }))}
                  placeholder={'18mm\n12mm'}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Category image (optional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTempFiles((f) => ({ ...f, category: e.target.files?.[0] || null }))}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Brand image (optional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTempFiles((f) => ({ ...f, brand: e.target.files?.[0] || null }))}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Material image (optional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTempFiles((f) => ({ ...f, material: e.target.files?.[0] || null }))}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowTempModal(false)} disabled={submittingTemp}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingTemp}>
                {submittingTemp ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
