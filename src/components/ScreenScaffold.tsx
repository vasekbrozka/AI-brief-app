import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScreenScaffoldProps {
  title: string;
  subtitle?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}

/**
 * iOS-style screen: a translucent sticky nav bar whose centered title fades in
 * once the large title scrolls out of view.
 */
export function ScreenScaffold({ title, subtitle, left, right, children }: ScreenScaffoldProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setCondensed(!entry.isIntersecting),
      { rootMargin: '-52px 0px 0px 0px', threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="screen">
      <header className={`navbar${condensed ? ' navbar--condensed' : ''}`}>
        <div className="navbar__side navbar__side--left">{left}</div>
        <div className="navbar__title">{title}</div>
        <div className="navbar__side navbar__side--right">{right}</div>
      </header>

      <div className="screen__content">
        <div className="large-title">
          <h1 className="large-title__heading">{title}</h1>
          {subtitle != null && <div className="large-title__subtitle">{subtitle}</div>}
        </div>
        <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
