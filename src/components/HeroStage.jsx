import { useState } from 'react';

/** Animated command-center mock — rows respond to hover / tap. */
export default function HeroStage() {
  const [active, setActive] = useState(1);

  const rows = [
    { label: 'Orbit · Sundar', status: 'On track', kind: 'is-ok' },
    { label: 'Material request #12', status: 'Quote due', kind: 'is-warn' },
    { label: 'Supervisor update', status: 'New', kind: 'is-live' },
  ];

  return (
    <div className="hero-stage" aria-hidden="true">
      <div className="hero-stage__glow" />

      <div className="hero-float hero-float--a">
        <div className="hero-float__label">Attention</div>
        <div className="hero-float__value">3 overdue</div>
        <div className="hero-float__bar">
          <span />
        </div>
      </div>

      <div className="hero-float hero-float--b">
        <div className="hero-float__live">
          <i /> Live
        </div>
        <div className="hero-float__value">12 on site</div>
        <div className="hero-float__sub">Attendance today</div>
      </div>

      <div className="hero-panel">
        <div className="hero-panel__top">
          <span className="hero-panel__brand">SiteBox</span>
          <span className="hero-panel__pill">Command</span>
        </div>
        <div className="hero-panel__kpis">
          <button type="button" className={`hero-kpi${active === 0 ? ' is-active' : ''}`} onClick={() => setActive(0)}>
            <span>Active sites</span>
            <strong>24</strong>
          </button>
          <button type="button" className={`hero-kpi hero-kpi--lime${active === 1 ? ' is-active' : ''}`} onClick={() => setActive(1)}>
            <span>Receivables</span>
            <strong>₹8.4L</strong>
          </button>
          <button type="button" className={`hero-kpi${active === 2 ? ' is-active' : ''}`} onClick={() => setActive(2)}>
            <span>Orders</span>
            <strong>18</strong>
          </button>
        </div>
        <div className="hero-panel__chart">
          <div className="hero-bars">
            <i style={{ '--h': '42%' }} />
            <i style={{ '--h': '68%' }} />
            <i style={{ '--h': '55%' }} />
            <i style={{ '--h': '82%' }} />
            <i style={{ '--h': '70%' }} />
            <i style={{ '--h': '90%' }} />
            <i style={{ '--h': '60%' }} />
          </div>
        </div>
        <div className="hero-panel__rows">
          {rows.map((row) => (
            <button type="button" key={row.label} className="hero-row">
              <span>{row.label}</span>
              <em className={row.kind}>{row.status}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="hero-float hero-float--c">
        <div className="hero-float__label">Order #3</div>
        <div className="hero-float__value">₹42,000</div>
        <div className="hero-float__sub">Vendor · Sheet</div>
      </div>
    </div>
  );
}
