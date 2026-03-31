import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  Form,
  ListGroup,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import './Materials.css';

const blankCategoryForm = { name: '' };
const blankMaterialForm = {
  material_name: '',
  material_description: '',
  unit_id: '',
  vendor_user_ids: [],
  brandsText: '',
  finishingsText: '',
  thicknessesText: '',
};

const parseCommaList = (value) =>
  String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

function hydrateMaterialForm(material) {
  return {
    material_name: material?.material_name || '',
    material_description: material?.material_description || '',
    unit_id: material?.unit_id ? String(material.unit_id) : '',
    brandsText: (material?.brands || []).map((b) => b?.brand?.name).filter(Boolean).join(', '),
    finishingsText: (material?.finishings || []).map((f) => f?.finishing?.name).filter(Boolean).join(', '),
    thicknessesText: (material?.thicknesses || []).map((t) => t?.thickness?.label).filter(Boolean).join(', '),
  };
}

export default function AdminMaterials() {
  const { user } = useAuth();
  const adminId = user?.id;

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materialSuppliers, setMaterialSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error, setError] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingMaterial, setIsEditingMaterial] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryForm, setCategoryForm] = useState(blankCategoryForm);
  const [materialForm, setMaterialForm] = useState(blankMaterialForm);
  const [newBrand, setNewBrand] = useState('');
  const [newFinishing, setNewFinishing] = useState('');
  const [newThickness, setNewThickness] = useState('');
  const [newSupplierId, setNewSupplierId] = useState('');

  const selectedMaterialDetails = useMemo(() => {
    if (!selectedMaterial) return null;
    return materials.find((m) => m.id === selectedMaterial.id) || selectedMaterial;
  }, [materials, selectedMaterial]);

  const loadCategoriesAndUnits = async () => {
    if (!adminId) return;
    setLoading(true);
    setError('');
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        adminApi.getCategories(adminId),
        adminApi.getUnits(adminId),
      ]);
      const vendorsRes = await adminApi.getEmployeesWeb(6);
      const nextCategories = categoriesRes.data?.data?.categories || [];
      const nextUnits = unitsRes.data?.data?.units || [];
      const nextVendors = vendorsRes.data?.data || [];
      setCategories(nextCategories);
      setUnits(nextUnits);
      setVendors(nextVendors);

      setSelectedCategory((prev) => nextCategories.find((c) => c.id === prev?.id) || null);
      setSelectedMaterial((prev) => prev || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories/units');
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliersByMaterial = async (materialId) => {
    if (!adminId || !materialId) {
      setMaterialSuppliers([]);
      return;
    }
    try {
      const res = await adminApi.getMaterialSuppliers(materialId, adminId);
      setMaterialSuppliers(res.data?.data?.suppliers || []);
    } catch (_) {
      setMaterialSuppliers([]);
    }
  };

  const loadMaterialsByCategory = async (categoryId, preferredMaterialId = null) => {
    if (!adminId || !categoryId) {
      setMaterials([]);
      setSelectedMaterial(null);
      return;
    }
    setLoadingMaterials(true);
    setError('');
    try {
      const res = await adminApi.getMaterialsByCategory(categoryId, adminId);
      const nextMaterials = res.data?.data?.materials || [];
      setMaterials(nextMaterials);

      const selected =
        nextMaterials.find((m) => m.id === preferredMaterialId) ||
        nextMaterials.find((m) => m.id === selectedMaterial?.id) ||
        null;
      setSelectedMaterial(selected);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load materials');
      setMaterials([]);
      setSelectedMaterial(null);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    loadCategoriesAndUnits();
  }, [adminId]);

  useEffect(() => {
    loadMaterialsByCategory(selectedCategory?.id);
  }, [selectedCategory?.id, adminId]);

  useEffect(() => {
    loadSuppliersByMaterial(selectedMaterial?.id);
  }, [selectedMaterial?.id, adminId]);

  const openAddCategoryModal = () => {
    setIsEditingCategory(false);
    setCategoryForm(blankCategoryForm);
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = () => {
    if (!selectedCategory) return;
    setIsEditingCategory(true);
    setCategoryForm({ name: selectedCategory.name || '' });
    setShowCategoryModal(true);
  };

  const openAddMaterialModal = () => {
    if (!selectedCategory) return;
    setIsEditingMaterial(false);
    setMaterialForm(blankMaterialForm);
    setShowMaterialModal(true);
  };

  const openEditMaterialModal = () => {
    if (!selectedMaterialDetails) return;
    setIsEditingMaterial(true);
    setMaterialForm({
      ...hydrateMaterialForm(selectedMaterialDetails),
      vendor_user_ids: materialSuppliers.map((s) => s.supplier_user_id),
    });
    setShowMaterialModal(true);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!adminId) return;
    const name = categoryForm.name.trim();
    if (!name) return;

    setSaving(true);
    setError('');
    try {
      if (isEditingCategory && selectedCategory) {
        await adminApi.updateCategory(selectedCategory.id, { admin_id: adminId, name });
      } else {
        await adminApi.createCategory({ admin_id: adminId, name });
      }
      await loadCategoriesAndUnits();
      setShowCategoryModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const hasCategorySelected = Boolean(selectedCategory);
  const hasMaterialSelected = Boolean(selectedMaterialDetails);

  const saveMaterial = async (e) => {
    e.preventDefault();
    if (!adminId || !selectedCategory) return;

    const payload = {
      admin_id: adminId,
      category_id: selectedCategory.id,
      material_name: materialForm.material_name.trim(),
      material_description: materialForm.material_description.trim() || null,
      unit_id: Number(materialForm.unit_id),
      brands: parseCommaList(materialForm.brandsText),
      finishings: parseCommaList(materialForm.finishingsText),
      thicknesses: parseCommaList(materialForm.thicknessesText),
    };

    if (!payload.material_name || !payload.unit_id) return;

    setSaving(true);
    setError('');
    try {
      let changedMaterialId = selectedMaterial?.id || null;
      if (isEditingMaterial && selectedMaterial) {
        await adminApi.updateMaterial(selectedMaterial.id, payload);
        changedMaterialId = selectedMaterial.id;
      } else {
        const createRes = await adminApi.createMaterial(payload);
        changedMaterialId = createRes.data?.data?.material?.id || null;
      }

      const desiredVendorIds = Array.from(new Set((materialForm.vendor_user_ids || []).map((id) => Number(id)).filter(Boolean)));
      const currentSuppliersRes = await adminApi.getMaterialSuppliers(changedMaterialId, adminId);
      const currentSuppliers = currentSuppliersRes.data?.data?.suppliers || [];
      const currentVendorIds = currentSuppliers.map((s) => Number(s.supplier_user_id));

      const toAdd = desiredVendorIds.filter((id) => !currentVendorIds.includes(id));
      const toRemove = currentSuppliers.filter((s) => !desiredVendorIds.includes(Number(s.supplier_user_id)));

      await Promise.all(
        toRemove.map((s) => adminApi.deleteMaterialSupplier(s.id, adminId))
      );
      await Promise.all(
        toAdd.map((vendorId) =>
          adminApi.createMaterialSupplier({
            admin_id: adminId,
            material_id: changedMaterialId,
            supplier_user_id: vendorId,
          })
        )
      );

      await loadMaterialsByCategory(selectedCategory.id, changedMaterialId);
      await loadSuppliersByMaterial(changedMaterialId);
      setShowMaterialModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save material');
    } finally {
      setSaving(false);
    }
  };

  const appendMaterialMetadata = async (type) => {
    if (!adminId || !selectedCategory || !selectedMaterialDetails) return;

    const basePayload = {
      admin_id: adminId,
      category_id: selectedCategory.id,
      unit_id: selectedMaterialDetails.unit_id,
      material_name: selectedMaterialDetails.material_name,
      material_description: selectedMaterialDetails.material_description || null,
      brands: (selectedMaterialDetails.brands || []).map((b) => b?.brand?.name).filter(Boolean),
      finishings: (selectedMaterialDetails.finishings || []).map((f) => f?.finishing?.name).filter(Boolean),
      thicknesses: (selectedMaterialDetails.thicknesses || []).map((t) => t?.thickness?.label).filter(Boolean),
    };

    if (type === 'brand') {
      const value = newBrand.trim();
      if (!value) return;
      if (!basePayload.brands.includes(value)) basePayload.brands.push(value);
    } else if (type === 'finishing') {
      const value = newFinishing.trim();
      if (!value) return;
      if (!basePayload.finishings.includes(value)) basePayload.finishings.push(value);
    } else if (type === 'thickness') {
      const value = newThickness.trim();
      if (!value) return;
      if (!basePayload.thicknesses.includes(value)) basePayload.thicknesses.push(value);
    }

    setSaving(true);
    setError('');
    try {
      await adminApi.updateMaterial(selectedMaterialDetails.id, basePayload);
      await loadMaterialsByCategory(selectedCategory.id, selectedMaterialDetails.id);
      if (type === 'brand') setNewBrand('');
      if (type === 'finishing') setNewFinishing('');
      if (type === 'thickness') setNewThickness('');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to add ${type}`);
    } finally {
      setSaving(false);
    }
  };

  const addSupplierToMaterial = async () => {
    if (!adminId || !selectedMaterialDetails) return;
    const supplierId = Number(newSupplierId);
    if (!supplierId) return;

    const exists = materialSuppliers.some((s) => Number(s.supplier_user_id) === supplierId);
    if (exists) {
      setError('Supplier already linked to this material');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await adminApi.createMaterialSupplier({
        admin_id: adminId,
        material_id: selectedMaterialDetails.id,
        supplier_user_id: supplierId,
      });
      await loadSuppliersByMaterial(selectedMaterialDetails.id);
      setNewSupplierId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add supplier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-materials">
      <div className="admin-page-header mb-3">
        <h1 className="admin-page-title mb-1">Materials</h1>
        <p className="admin-page-subtitle mb-0">Browse categories and manage material catalog</p>
      </div>

      <Breadcrumb className="mb-3">
        <Breadcrumb.Item active>Materials</Breadcrumb.Item>
        {selectedCategory && <Breadcrumb.Item active>{selectedCategory.name}</Breadcrumb.Item>}
        {selectedMaterialDetails && <Breadcrumb.Item active>{selectedMaterialDetails.material_name}</Breadcrumb.Item>}
      </Breadcrumb>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="g-3">
          <Col xl={hasMaterialSelected ? 6 : 12} lg={12}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <strong>Categories & Materials</strong>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-primary" onClick={openAddCategoryModal}>
                    + Category
                  </Button>
                  <Button size="sm" variant="primary" disabled={!selectedCategory} onClick={openAddMaterialModal}>
                    + Material
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {!hasCategorySelected ? (
                  <div>
                    <div className="materials-column-title">Categories</div>
                    <ListGroup className="materials-list">
                      {categories.length === 0 ? (
                        <ListGroup.Item className="text-muted">No categories found</ListGroup.Item>
                      ) : (
                        categories.map((category) => (
                          <ListGroup.Item
                            key={category.id}
                            action
                            active={selectedCategory?.id === category.id}
                            onClick={() => {
                              setSelectedCategory(category);
                              setSelectedMaterial(null);
                            }}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <span>{category.name}</span>
                          </ListGroup.Item>
                        ))
                      )}
                    </ListGroup>
                  </div>
                ) : (
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="materials-column-title">Categories</div>
                      <ListGroup className="materials-list">
                        {categories.length === 0 ? (
                          <ListGroup.Item className="text-muted">No categories found</ListGroup.Item>
                        ) : (
                          categories.map((category) => (
                            <ListGroup.Item
                              key={category.id}
                              action
                              active={selectedCategory?.id === category.id}
                              onClick={() => {
                                setSelectedCategory(category);
                                setSelectedMaterial(null);
                              }}
                            className="d-flex justify-content-between align-items-center"
                            >
                              <span>{category.name}</span>
                            {selectedCategory?.id === category.id && (
                              <Button
                                size="sm"
                                variant="link"
                                className="materials-icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditCategoryModal();
                                }}
                                title="Edit category"
                              >
                                ✎
                              </Button>
                            )}
                            </ListGroup.Item>
                          ))
                        )}
                      </ListGroup>
                    </Col>

                    <Col md={6}>
                      <div className="materials-column-title">Materials</div>
                      {loadingMaterials ? (
                        <div className="py-4 text-center">
                          <Spinner animation="border" size="sm" />
                        </div>
                      ) : (
                        <ListGroup className="materials-list">
                          {materials.length === 0 ? (
                            <ListGroup.Item className="text-muted">
                              No materials in this category
                            </ListGroup.Item>
                          ) : (
                            materials.map((material) => (
                              <ListGroup.Item
                                key={material.id}
                                action
                                active={selectedMaterial?.id === material.id}
                                onClick={() => setSelectedMaterial(material)}
                                className="d-flex justify-content-between align-items-center"
                              >
                                <span>{material.material_name}</span>
                                {selectedMaterial?.id === material.id && (
                                  <Button
                                    size="sm"
                                    variant="link"
                                    className="materials-icon-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditMaterialModal();
                                    }}
                                    title="Edit material"
                                  >
                                    ✎
                                  </Button>
                                )}
                              </ListGroup.Item>
                            ))
                          )}
                        </ListGroup>
                      )}
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>

          {hasMaterialSelected && (
            <Col xl={6} lg={12}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header>
                <strong>{selectedMaterialDetails?.material_name || 'Material Details'}</strong>
              </Card.Header>
              <Card.Body>
                  <div className="pt-2 mb-3 border-bottom pb-2">
                    <p className="mb-1"><strong>Category:</strong> {selectedMaterialDetails.category?.name || '—'}</p>
                    <p className="mb-1"><strong>Unit:</strong> {selectedMaterialDetails.unit?.measuring_unit || '—'}</p>
                    <p className="mb-1"><strong>Status:</strong> {selectedMaterialDetails.record_status || '—'}</p>
                    <p className="mb-0">
                      <strong>Description:</strong> {selectedMaterialDetails.material_description || '—'}
                    </p>
                  </div>
                  <Tabs defaultValue="brands" id="material-details-tabs" className="mb-3">
                    <TabsList>
                      <TabsTrigger value="brands">Brands</TabsTrigger>
                      <TabsTrigger value="finishings">Finishings</TabsTrigger>
                      <TabsTrigger value="thickness">Thickness</TabsTrigger>
                      <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="brands">
                      <div className="d-flex gap-2 pt-2">
                        <Form.Control
                          size="sm"
                          placeholder="Add brand name"
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                        />
                        <Button size="sm" onClick={() => appendMaterialMetadata('brand')} disabled={saving}>
                          + Add
                        </Button>
                      </div>
                      <ListGroup variant="flush" className="pt-2">
                        {(selectedMaterialDetails.brands || []).length === 0 ? (
                          <ListGroup.Item className="text-muted px-0">No brands added</ListGroup.Item>
                        ) : (
                          selectedMaterialDetails.brands.map((item) => (
                            <ListGroup.Item key={item.id} className="px-0">
                              {item.brand?.name || '—'}
                            </ListGroup.Item>
                          ))
                        )}
                      </ListGroup>
                    </TabsContent>

                    <TabsContent value="finishings">
                      <div className="d-flex gap-2 pt-2">
                        <Form.Control
                          size="sm"
                          placeholder="Add finishing name"
                          value={newFinishing}
                          onChange={(e) => setNewFinishing(e.target.value)}
                        />
                        <Button size="sm" onClick={() => appendMaterialMetadata('finishing')} disabled={saving}>
                          + Add
                        </Button>
                      </div>
                      <ListGroup variant="flush" className="pt-2">
                        {(selectedMaterialDetails.finishings || []).length === 0 ? (
                          <ListGroup.Item className="text-muted px-0">No finishings added</ListGroup.Item>
                        ) : (
                          selectedMaterialDetails.finishings.map((item) => (
                            <ListGroup.Item key={item.id} className="px-0">
                              {item.finishing?.name || '—'}
                            </ListGroup.Item>
                          ))
                        )}
                      </ListGroup>
                    </TabsContent>

                    <TabsContent value="thickness">
                      <div className="d-flex gap-2 pt-2">
                        <Form.Control
                          size="sm"
                          placeholder="Add thickness label (e.g. 18mm)"
                          value={newThickness}
                          onChange={(e) => setNewThickness(e.target.value)}
                        />
                        <Button size="sm" onClick={() => appendMaterialMetadata('thickness')} disabled={saving}>
                          + Add
                        </Button>
                      </div>
                      <ListGroup variant="flush" className="pt-2">
                        {(selectedMaterialDetails.thicknesses || []).length === 0 ? (
                          <ListGroup.Item className="text-muted px-0">No thickness values added</ListGroup.Item>
                        ) : (
                          selectedMaterialDetails.thicknesses.map((item) => (
                            <ListGroup.Item key={item.id} className="px-0">
                              {item.thickness?.label || '—'}
                              {item.thickness?.value_mm != null ? ` (${item.thickness.value_mm} mm)` : ''}
                            </ListGroup.Item>
                          ))
                        )}
                      </ListGroup>
                    </TabsContent>

                    <TabsContent value="suppliers">
                      <div className="d-flex gap-2 pt-2">
                        <Form.Select
                          size="sm"
                          value={newSupplierId}
                          onChange={(e) => setNewSupplierId(e.target.value)}
                        >
                          <option value="">Select vendor</option>
                          {vendors.map((vendor) => {
                            const vendorId = Number(vendor.adminId ?? vendor.id);
                            return (
                              <option key={vendorId} value={vendorId}>
                                {vendor.username} {vendor.mobile ? `(${vendor.mobile})` : ''}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Button size="sm" onClick={addSupplierToMaterial} disabled={saving || !newSupplierId}>
                          + Add
                        </Button>
                      </div>
                      <ListGroup variant="flush" className="pt-2">
                        {materialSuppliers.length === 0 ? (
                          <ListGroup.Item className="text-muted px-0">No suppliers linked</ListGroup.Item>
                        ) : (
                          materialSuppliers.map((supplier) => {
                            const matchedVendor = vendors.find(
                              (v) => Number(v.adminId ?? v.id) === Number(supplier.supplier_user_id)
                            );
                            return (
                              <ListGroup.Item key={supplier.id} className="px-0">
                                {matchedVendor?.username || `Vendor #${supplier.supplier_user_id}`}
                                {matchedVendor?.mobile ? ` (${matchedVendor.mobile})` : ''}
                              </ListGroup.Item>
                            );
                          })
                        )}
                      </ListGroup>
                    </TabsContent>
                  </Tabs>
              </Card.Body>
            </Card>
          </Col>
          )}
        </Row>
      )}

      <Modal show={showCategoryModal} onHide={() => !saving && setShowCategoryModal(false)}>
        <Form onSubmit={saveCategory}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditingCategory ? 'Update category' : 'Add category'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ name: e.target.value })}
                placeholder="Category name"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : isEditingCategory ? 'Update' : 'Add'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showMaterialModal} onHide={() => !saving && setShowMaterialModal(false)}>
        <Form onSubmit={saveMaterial}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditingMaterial ? 'Update material' : 'Add material'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Material name</Form.Label>
              <Form.Control
                value={materialForm.material_name}
                onChange={(e) => setMaterialForm((f) => ({ ...f, material_name: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Unit</Form.Label>
              <Form.Select
                value={materialForm.unit_id}
                onChange={(e) => setMaterialForm((f) => ({ ...f, unit_id: e.target.value }))}
                required
              >
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.measuring_unit}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Vendors (optional)</Form.Label>
              <Form.Select
                multiple
                value={(materialForm.vendor_user_ids || []).map(String)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
                  setMaterialForm((f) => ({ ...f, vendor_user_ids: values }));
                }}
              >
                {vendors.map((vendor) => {
                  const vendorId = Number(vendor.adminId ?? vendor.id);
                  return (
                    <option key={vendorId} value={vendorId}>
                      {vendor.username} {vendor.mobile ? `(${vendor.mobile})` : ''}
                    </option>
                  );
                })}
              </Form.Select>
              <Form.Text className="text-muted">
                Hold Ctrl/Cmd to select multiple vendors.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={materialForm.material_description}
                onChange={(e) => setMaterialForm((f) => ({ ...f, material_description: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Brands (comma separated)</Form.Label>
              <Form.Control
                value={materialForm.brandsText}
                onChange={(e) => setMaterialForm((f) => ({ ...f, brandsText: e.target.value }))}
                placeholder="Brand A, Brand B"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Finishings (comma separated)</Form.Label>
              <Form.Control
                value={materialForm.finishingsText}
                onChange={(e) => setMaterialForm((f) => ({ ...f, finishingsText: e.target.value }))}
                placeholder="Matte, Glossy"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Thickness (comma separated labels)</Form.Label>
              <Form.Control
                value={materialForm.thicknessesText}
                onChange={(e) => setMaterialForm((f) => ({ ...f, thicknessesText: e.target.value }))}
                placeholder="6mm, 12mm, 18mm"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMaterialModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : isEditingMaterial ? 'Update' : 'Add'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
