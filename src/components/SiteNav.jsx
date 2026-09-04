import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#top', label: 'Home' },
  { href: '#why', label: 'Why SiteBox' },
  { href: '#features', label: 'Features' },
  { href: '#roles', label: 'Roles' },
  { href: '#download', label: 'Get the app' },
  { href: '#demo', label: 'Demo' },
];

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'https://testapp.getsitebox.com';

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onMove = (e) => {
      const btn = e.target.closest?.('.btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--btn-x', `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty('--btn-y', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <header className={`site-nav ${scrolled ? 'is-scrolled' : 'is-top'}${open ? ' is-open' : ''}`}>
      <div className="site-nav__inner">
        <a href="#top" className="site-nav__brand" aria-label="SiteBox home" onClick={() => setOpen(false)}>
          <img src="/sitebox.jpeg" alt="" className="site-nav__logo" width="32" height="32" />
          <span className="site-nav__brand-text">
            Site<span className="site-nav__brand-accent">Box</span>
          </span>
        </a>

        <nav className="site-nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="site-nav__actions">
          <a
            className={`btn btn-press site-nav__portal ${scrolled ? 'btn-outline' : 'btn-ghost'}`}
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open portal
          </a>
          <a className="btn btn-lime btn-press site-nav__demo" href="#demo">
            Get demo
          </a>
          <button
            type="button"
            className="site-nav__menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className={`site-nav__drawer${open ? ' is-open' : ''}`} id="mobile-nav">
        <nav className="site-nav__drawer-links" aria-label="Mobile">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="site-nav__drawer-ctas">
          <a className="btn btn-lime btn-press" href="#demo" onClick={() => setOpen(false)}>
            Get demo
          </a>
          <a
            className="btn btn-outline btn-press"
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            Open portal
          </a>
          <a className="btn btn-outline btn-press" href="#download" onClick={() => setOpen(false)}>
            Get the app
          </a>
        </div>
      </div>
    </header>
  );
}
