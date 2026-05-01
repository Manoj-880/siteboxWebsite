import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Nav, Button, Offcanvas } from 'react-bootstrap';

/**
 * Shared app layout for all roles:
 * - Side nav (left)
 * - Right: header, then main content (Outlet)
 */
export default function AppLayout({ navLinks, basePath, roleLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentLabel = navLinks.find(
    (l) => l.to === location.pathname || (!l.end && location.pathname.startsWith(l.to + '/'))
  )?.label ?? 'Dashboard';

  const toggleMenu = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 991.98px)').matches) {
      setSidebarOpen((prev) => !prev);
      return;
    }
    setSidebarCollapsed((prev) => !prev);
  };

  const SideNavContent = () => (
    <>
      <div className="app-layout-brand">
        <NavLink
          to={basePath}
          className="app-layout-brand-link"
          onClick={() => setSidebarOpen(false)}
          aria-label="SiteBox home"
        >
          <span className="app-layout-brand-mark">
            <img src="/sitebox.jpeg" alt="SiteBox" className="app-layout-brand-logo" width="72" height="72" />
          </span>
        </NavLink>
      </div>
      <Nav className="app-layout-nav flex-column">
        {navLinks.map(({ to, end, label }) => (
          <Nav.Link
            key={to}
            as={NavLink}
            to={to}
            end={end}
            className="app-layout-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            {label}
          </Nav.Link>
        ))}
      </Nav>
    </>
  );

  return (
    <div className="app-layout">
      {/* Desktop sidebar */}
      <aside className={`app-layout-sidebar d-none d-lg-block${sidebarCollapsed ? ' collapsed' : ''}`}>
        <SideNavContent />
      </aside>

      {/* Mobile offcanvas sidebar */}
      <Offcanvas show={sidebarOpen} onHide={() => setSidebarOpen(false)} placement="start" className="app-layout-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <div className="app-layout-offcanvas-inner">
            <SideNavContent />
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main: header + content */}
      <div className="app-layout-main">
        <header className="app-layout-header">
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              className="app-layout-header-menu-btn"
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
            >
              ☰
            </Button>
            <h1 className="app-layout-header-title">{currentLabel}</h1>
          </div>
          <div className="app-layout-header-actions align-items-center gap-2">
            <span className="app-layout-header-user">{user?.username}</span>
            <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>
        <main className="app-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
