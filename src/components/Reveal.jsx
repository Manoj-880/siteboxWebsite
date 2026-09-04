import { useEffect, useRef, useState } from 'react';

/** Scroll reveal — always resolves to visible (hash jumps + late observers safe). */
export function Reveal({ children, className = '', delay = 0, fill = false }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setInView(true);
      return undefined;
    }

    const show = () => setInView(true);

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    if (rect.top < vh * 0.92 && rect.bottom > 0) {
      show();
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
    );
    io.observe(el);

    const failSafe = window.setTimeout(show, 2200);

    return () => {
      io.disconnect();
      window.clearTimeout(failSafe);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${inView ? ' is-in' : ''}${fill ? ' reveal--fill' : ''}${
        delay ? ` reveal-delay-${delay}` : ''
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
