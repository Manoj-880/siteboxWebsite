import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Spinner, Row, Col, Modal, Form, Alert } from 'react-bootstrap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { adminApi } from '../../api/axiosConfig';
import { ROLE_IDS, ROLE_NAMES } from '../../constants/roles';
import StaffCard from './StaffCard';
import './Staff.css';

const STAFF_TABS = [
  { value: 'supervisors', title: 'Supervisors', singularTitle: 'Supervisor', roleId: ROLE_IDS.SUPERVISOR },
  { value: 'designers', title: 'Designers', singularTitle: 'Designer', roleId: ROLE_IDS.DESIGNER },
  { value: 'vendors', title: 'Vendors', singularTitle: 'Vendor', roleId: ROLE_IDS.VENDOR },
  { value: 'contractors', title: 'Contractors', singularTitle: 'Contractor', roleId: ROLE_IDS.CONTRACTOR },
  { value: 'factories', title: 'Factories', singularTitle: 'Factory', roleId: ROLE_IDS.FACTORY },
  { value: 'project-managers', title: 'Project Managers', singularTitle: 'Project Manager', roleId: ROLE_IDS.PROJECT_MANAGER },
  { value: 'purchase-teams', title: 'Purchase Teams', singularTitle: 'Purchase Team', roleId: ROLE_IDS.PURCHASE_TEAM },
  { value: 'accountants', title: 'Accountants', singularTitle: 'Accountant', roleId: ROLE_IDS.ACCOUNTANT },
  { value: 'sales-teams', title: 'Sales Teams', singularTitle: 'Sales Team', roleId: ROLE_IDS.SALES },
  { value: 'office-staffs', title: 'Office Staff', singularTitle: 'Office Staff', roleId: ROLE_IDS.OFFICE_STAFF },
];

const SALARY_INTERVALS = [
  { value: 'per_day', label: 'Per day' },
  { value: 'per_week', label: 'Per week' },
  { value: 'per_month', label: 'Per month' },
];

export default function AdminStaff() {
  const [value, setValue] = useState('supervisors');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState(null);
  const [form, setForm] = useState({
    userName: '',
    email: '',
    mobile: '',
    gender: '',
    salary: '',
    interval: 'per_month',
  });

  const currentTab = STAFF_TABS.find((t) => t.value === value) || STAFF_TABS[0];
  const roleId = currentTab.roleId;
  const salaryRequired = roleId !== ROLE_IDS.VENDOR && roleId !== ROLE_IDS.FACTORY;

  const fetchEmployees = useCallback((role) => {
    setLoading(true);
    setError(null);
    adminApi
      .getEmployeesWeb(role)
      .then((res) => setEmployees(res.data?.data ?? []))
      .catch((err) => {
        setEmployees([]);
        setError(err.response?.data?.message || err.message || 'Failed to load staff');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchEmployees(roleId);
  }, [roleId, fetchEmployees]);

  const handleTabChange = (v) => {
    setValue(v || 'supervisors');
  };

  const openAddModal = () => {
    setAddError(null);
    setForm({
      userName: '',
      email: '',
      mobile: '',
      gender: '',
      salary: '',
      interval: 'per_month',
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setAddError(null);
    const { userName, email, mobile, gender, salary, interval } = form;
    if (!userName?.trim() || !mobile?.trim()) {
      setAddError('Name and mobile are required.');
      return;
    }

    let salaryNum = null;
    if (salaryRequired) {
      if (salary === '' || !interval) {
        setAddError('Salary and interval are required for this role.');
        return;
      }
      salaryNum = parseFloat(salary);
      if (isNaN(salaryNum) || salaryNum < 0) {
        setAddError('Salary must be a valid non-negative number.');
        return;
      }
    }
    setSaving(true);
    adminApi
      .addEmployeeWeb({
        userName: userName.trim(),
        email: email?.trim() || undefined,
        mobile: mobile.trim(),
        userRoleId: roleId,
        gender: gender?.trim() || undefined,
        ...(salaryRequired ? { salary: salaryNum, interval } : {}),
      })
      .then(() => {
        setShowAddModal(false);
        fetchEmployees(roleId);
      })
      .catch((err) => {
        setAddError(err.response?.data?.message || err.message || 'Failed to add employee');
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="admin-staff">
      <div className="admin-page-header mb-4">
        <h1 className="admin-page-title mb-1">Staff</h1>
        <p className="admin-page-subtitle mb-0">Manage supervisors, designers, vendors, and contractors</p>
      </div>

      <Tabs value={value} onValueChange={handleTabChange} className="mb-3">
        <TabsList>
          {STAFF_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.title}</TabsTrigger>
          ))}
        </TabsList>
        {STAFF_TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                  <span className="text-muted small">
                    {ROLE_NAMES[t.roleId]} list
                  </span>
                  <Button variant="primary" size="sm" onClick={openAddModal}>
                    + Add {t.singularTitle}
                  </Button>
                </div>
                {loading ? (
                  <div className="py-5 text-center">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : error ? (
                  <Alert variant="warning" className="m-3 mb-0">{error}</Alert>
                ) : employees.length === 0 ? (
                  <p className="py-5 text-center text-muted mb-0">No {t.title.toLowerCase()} yet. Add one to get started.</p>
                ) : (
                  <Row className="g-3 p-3">
                    {employees.map((emp) => (
                      <Col key={emp.adminId ?? emp.id} xs={12} sm={6} md={6} lg={4}>
                        <StaffCard employee={emp} />
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Modal show={showAddModal} onHide={() => !saving && setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add {currentTab.singularTitle}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body>
            {addError && <Alert variant="danger" dismissible onClose={() => setAddError(null)}>{addError}</Alert>}
            <Form.Group className="mb-2">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                value={form.userName}
                onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
                placeholder="Full name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Mobile *</Form.Label>
              <Form.Control
                type="tel"
                value={form.mobile}
                onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                placeholder="10–15 digits"
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Optional"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            {salaryRequired ? (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>Salary *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salary}
                    onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Salary interval *</Form.Label>
                  <Form.Select
                    value={form.interval}
                    onChange={(e) => setForm((f) => ({ ...f, interval: e.target.value }))}
                  >
                    {SALARY_INTERVALS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </>
            ) : (
              <div className="small text-muted mb-2">
                Salary is not required for vendors/factory (paid by tasks).
              </div>
            )}
            <p className="small text-muted mb-0">Role: {ROLE_NAMES[roleId]}. Password will be set to mobile number. User is created inactive.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Adding…' : 'Add'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
