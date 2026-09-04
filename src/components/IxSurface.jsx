import { useCallback, useRef } from 'react';

/** Pointer-reactive surface — drives --ix-x / --ix-y for CSS glow + tilt. */
export default function IxSurface({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty('--ix-x', `${x}%`);
    el.style.setProperty('--ix-y', `${y}%`);
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
    el.style.setProperty('--ix-rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--ix-ry', `${ry.toFixed(2)}deg`);
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--ix-x', '50%');
    el.style.setProperty('--ix-y', '50%');
    el.style.setProperty('--ix-rx', '0deg');
    el.style.setProperty('--ix-ry', '0deg');
  }, []);

  return (
    <Tag
      ref={ref}
      className={`ix ${className}`.trim()}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}
