import { useState, useEffect } from 'react';
import { Card, Carousel, Spinner } from 'react-bootstrap';
import { adminApi } from '../../api/axiosConfig';
import './Updates.css';

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatUpdateDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  let label;
  if (dDate.getTime() === today.getTime()) {
    label = 'Today';
  } else if (dDate.getTime() === yesterday.getTime()) {
    label = 'Yesterday';
  } else {
    label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  }
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const full = d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  return { label, time, full };
}

function UpdatePostCard({ post }) {
  const title = post.title ?? post.site_name ?? 'Update';
  const description = post.description ?? post.message ?? '';
  const dateObj = formatUpdateDate(post.posted_at ?? post.date ?? null);
  const images = Array.isArray(post.images) ? post.images : [];
  const supervisor = post.supervisor_name || '';

  return (
    <article className="updates-post-card" aria-label={`Update: ${title}`}>
      <div className="updates-post-inner">
        {/* Header: avatar + title row + date */}
        <header className="updates-post-header">
          <div className="updates-post-avatar" aria-hidden="true">
            {getInitials(supervisor)}
          </div>
          <div className="updates-post-heading">
            <h3 className="updates-post-title">{title}</h3>
            {supervisor && (
              <p className="updates-post-byline">Posted by {supervisor}</p>
            )}
          </div>
          {dateObj && (
            <div className="updates-post-date-wrap" title={dateObj.full}>
              <span className="updates-post-date-label">{dateObj.label}</span>
              <span className="updates-post-date-time">{dateObj.time}</span>
            </div>
          )}
        </header>

        {/* Images carousel */}
        {images.length > 0 && (
          <div className="updates-post-media">
            <Carousel
              controls={images.length > 1}
              indicators={images.length > 1}
              interval={null}
              className="updates-carousel"
              prevLabel="Previous image"
              nextLabel="Next image"
            >
              {images.map((src, idx) => (
                <Carousel.Item key={idx}>
                  <div className="updates-carousel-slide">
                    <img
                      src={src}
                      alt={`${title} – image ${idx + 1} of ${images.length}`}
                      className="updates-carousel-img"
                      loading="lazy"
                    />
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
            {images.length > 1 && (
              <span className="updates-carousel-badge" aria-hidden="true">
                {images.length} photos
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="updates-post-body">
            <p className="updates-post-description">{description}</p>
          </div>
        )}
      </div>
    </article>
  );
}

function UpdatesEmpty() {
  return (
    <Card className="updates-empty-card border-0">
      <Card.Body className="updates-empty-body">
        <div className="updates-empty-icon" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h4 className="updates-empty-title">No updates yet</h4>
        <p className="updates-empty-text">
          Supervisor updates will appear here as they post from sites. Check back later.
        </p>
      </Card.Body>
    </Card>
  );
}

export default function AdminUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getUpdates()
      .then((res) => setUpdates(res.data?.data?.updates ?? []))
      .catch(() => setUpdates([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="updates-page">
        <div className="updates-page-header">
          <h1 className="updates-page-title">Updates</h1>
          <p className="updates-page-subtitle">All supervisor posted updates</p>
        </div>
        <div className="updates-loading">
          <Spinner animation="border" className="updates-loading-spinner" />
          <p className="updates-loading-text">Loading updates…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="updates-page">
      <div className="updates-page-header">
        <div className="updates-page-header-top">
          <div>
            <h1 className="updates-page-title">Updates</h1>
            <p className="updates-page-subtitle">All supervisor posted updates</p>
          </div>
          {updates.length > 0 && (
            <span className="updates-page-count" aria-live="polite">
              {updates.length} {updates.length === 1 ? 'update' : 'updates'}
            </span>
          )}
        </div>
      </div>

      {updates.length === 0 ? (
        <UpdatesEmpty />
      ) : (
        <div className="updates-feed" role="feed" aria-label="Site updates">
          {updates.map((u) => (
            <UpdatePostCard key={u.id} post={u} />
          ))}
        </div>
      )}
    </div>
  );
}
