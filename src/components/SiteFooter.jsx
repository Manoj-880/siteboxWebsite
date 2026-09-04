const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'https://testapp.getsitebox.com';
const PLAY_URL = import.meta.env.VITE_PLAY_STORE_URL || '';
const APPLE_URL = import.meta.env.VITE_APP_STORE_URL || '';

function StoreBadges({ className = '' }) {
  const playHref = PLAY_URL || '#download';
  const appleHref = APPLE_URL || '#download';
  const external = (url) => Boolean(url) && !url.startsWith('#');

  return (
    <div className={`store-badges ${className}`.trim()}>
      <a
        className="store-badge store-badge--apple"
        href={appleHref}
        {...(external(APPLE_URL) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        aria-label="Download on the App Store"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <span>
          <small>Download on the</small>
          <strong>App Store</strong>
        </span>
      </a>
      <a
        className="store-badge store-badge--play"
        href={playHref}
        {...(external(PLAY_URL) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        aria-label="Get it on Google Play"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#EA4335" d="M3.6 2.3l10.8 10.8-2.6 2.6L3 5.9z" />
          <path fill="#FBBC04" d="M3 18.1l8.8-4.8 2.6 2.6L3.6 21.7z" />
          <path fill="#4285F4" d="M20.2 10.6l-3.5-2-2.3 2.3 2.3 2.3 3.5-2z" />
          <path fill="#34A853" d="M3.6 2.3L14.4 13l-2.6 2.6L3 5.9z" opacity=".35" />
          <path fill="#34A853" d="M11.8 13.1L3 18.1V5.9l8.8 7.2z" />
        </svg>
        <span>
          <small>GET IT ON</small>
          <strong>Google Play</strong>
        </span>
      </a>
    </div>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand-col">
          <a href="#top" className="site-footer__brand">
            <img src="/sitebox.jpeg" alt="" width="36" height="36" />
            <span>
              Site<span className="site-footer__brand-accent">Box</span>
            </span>
          </a>
          <p className="site-footer__tagline">
            Construction & interior operations — sites, teams, materials, and money in one pulse.
          </p>
          <p className="site-footer__store-label">Field app available on</p>
          <StoreBadges />
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__heading">Quick Links</h3>
          <nav className="site-footer__nav" aria-label="Quick links">
            <a href="#top">Home</a>
            <a href="#why">Why SiteBox</a>
            <a href="#features">Features</a>
            <a href="#roles">Roles</a>
            <a href="#how">How it works</a>
            <a href="#download">Get the app</a>
            <a href="#demo">Request a demo</a>
          </nav>
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__heading">Company</h3>
          <nav className="site-footer__nav" aria-label="Company">
            <a href="#surfaces">Web + mobile</a>
            <a href="#faq">FAQ</a>
            <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">
              Open portal
            </a>
            <a href="#demo">Book a walkthrough</a>
          </nav>
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__heading">Contact</h3>
          <nav className="site-footer__nav" aria-label="Contact">
            <a href="mailto:hello@getsitebox.com">hello@getsitebox.com</a>
            <a href="#demo">Get a demo</a>
            <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">
              testapp.getsitebox.com
            </a>
          </nav>
          <p className="site-footer__contact-note">
            Tell us about your sites — we&apos;ll walk Admin web + field mobile together.
          </p>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <p className="site-footer__copy">© {year} SiteBox. All rights reserved.</p>
        <div className="site-footer__bottom-links">
          <a href="#download">App Store</a>
          <a href="#download">Google Play</a>
          <a href="mailto:hello@getsitebox.com">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export { StoreBadges };
