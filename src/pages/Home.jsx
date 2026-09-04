import { useState } from 'react';
import { Reveal } from '../components/Reveal';
import HeroStage from '../components/HeroStage';
import IxSurface from '../components/IxSurface';
import { StoreBadges } from '../components/SiteFooter';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'https://testapp.getsitebox.com';

const PROOF = [
  { value: 'Sites', label: 'Individual & community projects' },
  { value: 'Field', label: 'Attendance, tasks, photo updates' },
  { value: 'Orders', label: 'Requests → quotes → delivery' },
  { value: 'Money', label: 'Collections, payouts, ledger' },
];

const FEATURE_HERO = {
  title: 'Owner command center',
  desc: 'See sites at risk, overdue work, receivables, and approvals in one dense desktop view — built for owners who run multiple projects at once.',
};

const FEATURES = [
  {
    title: 'Sites & communities',
    desc: 'Budgets, schedules, status, supervisors, and designers across every active site — individual or community.',
  },
  {
    title: 'Attendance & staff',
    desc: 'Mark present/absent, follow salaries, and know who is on which site — supervisors through office staff.',
  },
  {
    title: 'Tasks & site updates',
    desc: 'Assign work, chase delays, review photo updates from the field, and keep designers locked in sync.',
  },
  {
    title: 'Materials & orders',
    desc: 'Catalog, requests, vendor quotations, public quote links, and delivery tracking — request to delivery.',
  },
  {
    title: 'Payments & ledger',
    desc: 'Site collections, staff/vendor/contractor payouts, and a searchable transactions ledger in one place.',
  },
  {
    title: 'Attention signals',
    desc: 'Overdue tasks, pending quotes, and money that needs action surface as clear lime signals — not buried lists.',
  },
];

const OUTCOMES = [
  {
    title: 'Stop chasing WhatsApp threads',
    desc: 'Attendance, updates, and orders live in one system — not scattered across chats and spreadsheets.',
  },
  {
    title: 'Know which site needs you',
    desc: 'Attention signals surface overdue tasks, pending quotes, and money that needs action right away.',
  },
  {
    title: 'One brand, two surfaces',
    desc: 'Admin web for the war room. Field mobile for supervisors, vendors, and contractors — same Pulse.',
  },
];

const WORKFLOW = [
  {
    title: 'Set up your company',
    desc: 'Create your workspace, invite admins and designers, load units and your material catalog.',
  },
  {
    title: 'Spin up sites & team',
    desc: 'Add sites, assign supervisors and designers, invite staff, contractors, vendors, and factories.',
  },
  {
    title: 'Operate every day',
    desc: 'Track attendance, tasks, updates, orders, and money — with clear signals when something needs you.',
  },
];

const FAQ = [
  {
    q: 'Is SiteBox for construction, interiors, or both?',
    a: 'Both. Interior and construction companies use SiteBox to run sites, field teams, materials, and payments in one place.',
  },
  {
    q: 'Do owners use the same app as supervisors?',
    a: 'Owners and designers work primarily in the Admin web portal. Supervisors, vendors, contractors, and factories use the SiteBox mobile app for day-to-day field work.',
  },
  {
    q: 'Can vendors send quotations?',
    a: 'Yes. Material requests flow to vendors, quotations can be shared via public links, and orders move through delivery tracking.',
  },
  {
    q: 'How do we get started?',
    a: 'Request a demo below. We walk you through Admin web + field mobile on a sample project, then onboard your company.',
  },
];

function DemoForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    mobile: '',
    email: '',
    interest: 'full',
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`SiteBox demo — ${form.company || form.name}`);
    const body = encodeURIComponent(
      [
        `Name: ${form.name}`,
        `Company: ${form.company}`,
        `Mobile: ${form.mobile}`,
        `Email: ${form.email}`,
        `Interest: ${form.interest}`,
      ].join('\n')
    );
    window.location.href = `mailto:hello@getsitebox.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <form className="cta-form" onSubmit={onSubmit}>
      {sent ? (
        <div className="cta-form__success">Thanks — your email client should open with the demo request.</div>
      ) : null}
      <label>
        Your name
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Ajay"
        />
      </label>
      <label>
        Company
        <input
          required
          value={form.company}
          onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
          placeholder="Interior / construction company"
        />
      </label>
      <label>
        Mobile
        <input
          required
          inputMode="tel"
          value={form.mobile}
          onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
          placeholder="10-digit mobile"
        />
      </label>
      <label>
        Work email
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@company.com"
        />
      </label>
      <label>
        What do you want to see?
        <select
          value={form.interest}
          onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
        >
          <option value="full">Full platform walkthrough</option>
          <option value="admin">Admin web command center</option>
          <option value="mobile">Field mobile app</option>
          <option value="orders">Materials & orders flow</option>
        </select>
      </label>
      <button type="submit" className="btn btn-jet btn-press">
        Request a demo
      </button>
      <p className="cta-form__note">
        We reply with a walkthrough of Admin web + field mobile — the same Sitebox Pulse experience your team will use.
      </p>
    </form>
  );
}

function FaqList() {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <Reveal key={item.q} delay={(i % 3) + 1}>
            <div className={`faq__item${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="faq__q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <i className="faq__icon" aria-hidden />
              </button>
              <div className="faq__a">
                <p>{item.a}</p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

export default function Home() {
  return (
    <main id="top">
      <section className="hero" aria-label="SiteBox hero">
        <div className="hero__bg" aria-hidden />
        <div className="hero__grid" aria-hidden />
        <div className="hero__glow" aria-hidden />
        <div className="hero__layout">
          <div className="hero__content">
            <p className="hero__live">
              <span className="hero__live-dot" aria-hidden />
              Live on web + mobile
            </p>
            <h1 className="hero__brand">
              Site<span>Box</span>
            </h1>
            <p className="hero__headline">Run every site like a command center.</p>
            <p className="hero__sub">
              Construction & interior teams manage sites, attendance, materials, orders, and payments —
              jet black precision with neon lime signals. Field app on the App Store &amp; Google Play.
            </p>
            <div className="hero__ctas">
              <a className="btn btn-lime btn-press" href="#demo">
                Get a demo
              </a>
              <a className="btn btn-ghost btn-press" href="#download">
                Get the app
              </a>
            </div>
          </div>
          <div className="hero__visual">
            <HeroStage />
          </div>
        </div>
      </section>

      <section className="proof" aria-label="What SiteBox covers">
        <div className="container proof__inner">
          {PROOF.map((item) => (
            <button type="button" key={item.value} className="proof__item" tabIndex={0}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="why" className="section">
        <div className="container">
          <Reveal className="section__head">
            <p className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden />
              Why SiteBox
            </p>
            <h2 className="section-title">Built for how construction teams actually work</h2>
            <p className="section-lead">
              Spreadsheets and chat groups break when you have more than a few sites. SiteBox gives owners
              a war room and the field a phone that stays in sync.
            </p>
          </Reveal>
          <div className="card-grid card-grid--3">
            {OUTCOMES.map((o, i) => (
              <Reveal key={o.title} delay={i + 1} fill>
                <IxSurface as="article" className="ix-card outcome">
                  <span className="outcome__index">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="outcome__title">{o.title}</h3>
                  <p className="outcome__desc">{o.desc}</p>
                </IxSurface>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section section--zinc">
        <div className="container">
          <Reveal className="section__head">
            <p className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden />
              Platform
            </p>
            <h2 className="section-title">Everything that moves a project</h2>
            <p className="section-lead">
              From the first site kickoff to the last payment — SiteBox covers the ops that decide whether
              a project stays on track.
            </p>
          </Reveal>

          <Reveal>
            <IxSurface as="article" className="ix-card feature-tile feature-tile--wide">
              <h3 className="feature-tile__title">{FEATURE_HERO.title}</h3>
              <p className="feature-tile__desc">{FEATURE_HERO.desc}</p>
              <span className="feature-tile__hint">Hover to explore · click sections below</span>
            </IxSurface>
          </Reveal>

          <div className="card-grid card-grid--3 feature-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) + 1} fill>
                <IxSurface as="article" className="ix-card feature-tile">
                  <h3 className="feature-tile__title">{f.title}</h3>
                  <p className="feature-tile__desc">{f.desc}</p>
                </IxSurface>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="section section--jet">
        <div className="container">
          <Reveal className="section__head">
            <p className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden />
              Who it&apos;s for
            </p>
            <h2 className="section-title">Web for owners. Mobile for the site.</h2>
            <p className="section-lead">
              One product, two surfaces — Admin portal for command, SiteBox app for field execution.
            </p>
          </Reveal>

          <div className="card-grid card-grid--2">
            <Reveal fill>
              <IxSurface className="ix-card role-panel role-panel--accent">
                <h3 className="role-panel__title">Admin web portal</h3>
                <p className="role-panel__desc">
                  Desktop-first war room: dashboards, staff, sites, orders, transactions, and catalog
                  control — dense enough for owners who live in ops.
                </p>
                <ul className="role-list">
                  <li>Company admin portal with attention signals</li>
                  <li>Designer workspace for drawings, reviews, and requests</li>
                  <li>Full ledger of collections, payouts, and site money</li>
                </ul>
                <div className="role-chips">
                  <span className="role-chip">Admin</span>
                  <span className="role-chip">Designer</span>
                </div>
              </IxSurface>
            </Reveal>
            <Reveal delay={2} fill>
              <IxSurface className="ix-card role-panel">
                <h3 className="role-panel__title">Field mobile app</h3>
                <p className="role-panel__desc">
                  Supervisors, contractors, vendors, and factories run day-to-day work from the phone —
                  same Pulse brand as the web portal.
                </p>
                <ul className="role-list">
                  <li>Attendance, tasks, and site updates with photos</li>
                  <li>Material requests and vendor order flow</li>
                  <li>Factory and contractor site access</li>
                </ul>
                <div className="role-chips">
                  <span className="role-chip">Supervisor</span>
                  <span className="role-chip">Contractor</span>
                  <span className="role-chip">Vendor</span>
                  <span className="role-chip">Factory</span>
                </div>
              </IxSurface>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="surfaces" className="section">
        <div className="container">
          <Reveal className="section__head">
            <p className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden />
              Surfaces
            </p>
            <h2 className="section-title">Command on desktop. Pulse on the go.</h2>
            <p className="section-lead">
              Jet black precision with neon lime signals — consistent across Admin web and the field app.
            </p>
          </Reveal>
          <div className="card-grid card-grid--2">
            <Reveal fill>
              <IxSurface as="article" className="ix-card surface surface--web">
                <div className="surface__tag">Admin web</div>
                <h3 className="surface__title">War-room density</h3>
                <p className="surface__desc">
                  Tables, command strips, and status signals designed for owners reviewing sites,
                  orders, and money on a large screen.
                </p>
                <ul className="surface__list">
                  <li>Live KPIs and attention chips</li>
                  <li>Sites, staff, tasks, updates</li>
                  <li>Orders, payments, transactions</li>
                </ul>
              </IxSurface>
            </Reveal>
            <Reveal delay={2} fill>
              <IxSurface as="article" className="ix-card surface surface--mobile">
                <div className="surface__tag">Mobile app</div>
                <h3 className="surface__title">Field-ready actions</h3>
                <p className="surface__desc">
                  Fast, thumb-friendly flows for people on site — mark attendance, push updates, move
                  materials, keep vendors moving.
                </p>
                <ul className="surface__list">
                  <li>Attendance & daily presence</li>
                  <li>Photo site updates</li>
                  <li>Requests & order status</li>
                </ul>
              </IxSurface>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="download" className="section section--download">
        <div className="container download-band">
          <Reveal>
            <p className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden />
              Field app
            </p>
            <h2 className="section-title">SiteBox is on the App Store &amp; Google Play</h2>
            <p className="section-lead">
              Supervisors, vendors, contractors, and factories run the day from their phone — same Pulse
              brand as the Admin web portal. Download the SiteBox app and stay in sync with the war room.
            </p>
            <StoreBadges className="download-band__badges" />
            <p className="download-band__note">
              Available for iOS and Android. Prefer a guided setup?{' '}
              <a href="#demo">Request a demo</a>.
            </p>
          </Reveal>
          <Reveal delay={2}>
            <div className="download-phone" aria-hidden>
              <div className="download-phone__bezel">
                <div className="download-phone__notch" />
                <div className="download-phone__screen">
                  <div className="download-phone__brand">
                    Site<span>Box</span>
                  </div>
                  <div className="download-phone__chip">Live · Field</div>
                  <div className="download-phone__rows">
                    <span>Attendance</span>
                    <span>Site updates</span>
                    <span>Material requests</span>
                    <span>Orders</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="how" className="section section--zinc">
        <div className="container">
          <Reveal className="section__head">
            <p className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden />
              How it works
            </p>
            <h2 className="section-title">From first site to live ledger</h2>
            <p className="section-lead">Three steps to run operations without spreadsheet chaos.</p>
          </Reveal>

          <div className="card-grid card-grid--3">
            {WORKFLOW.map((step, i) => (
              <Reveal key={step.title} delay={i + 1} fill>
                <IxSurface as="article" className="ix-card step">
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__desc">{step.desc}</p>
                </IxSurface>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="container">
          <Reveal className="section__head">
            <p className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden />
              FAQ
            </p>
            <h2 className="section-title">Questions teams ask before switching</h2>
          </Reveal>
          <FaqList />
        </div>
      </section>

      <section id="demo" className="section section--cta">
        <div className="container cta-band">
          <Reveal>
            <p className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden />
              Next step
            </p>
            <h2 className="section-title">See SiteBox on your projects</h2>
            <p className="section-lead" style={{ marginBottom: '1.25rem' }}>
              Book a walkthrough of the Admin command center and the field app — or jump into the live
              portal and explore.
            </p>
            <div className="cta-band__actions">
              <a className="btn btn-outline btn-press" href={PORTAL_URL} target="_blank" rel="noopener noreferrer">
                Open web portal
              </a>
              <a className="btn btn-lime btn-press" href="mailto:hello@getsitebox.com">
                Email us
              </a>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <DemoForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
