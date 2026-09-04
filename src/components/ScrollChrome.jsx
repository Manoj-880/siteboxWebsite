import { useEffect, useState } from 'react';

/** Top progress bar + floating demo CTA — keeps attention while scrolling. */
export default function ScrollChrome() {
  const [progress, setProgress] = useState(0);
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      setShowFab(window.scrollY > window.innerHeight * 0.55);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden>
        <i style={{ width: `${progress}%` }} />
      </div>
      <a
        href="#demo"
        className={`scroll-fab${showFab ? ' is-on' : ''}`}
        aria-label="Get a demo"
      >
        <span className="scroll-fab__pulse" aria-hidden />
        Get demo
      </a>
    </>
  );
}
