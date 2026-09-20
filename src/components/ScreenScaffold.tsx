import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScreenScaffoldProps {
  title: string;
  subtitle?: ReactNode;
  /** Shown in the floating bar while scrolled instead of the title (e.g. date · progress). */
  barContent?: ReactNode;
  /** Reading progress 0–1, drawn as a thin line under the floating bar once scrolled. */
  progress?: number | null;
  /** Reserve room for two subtitle lines, so controls below never move when the text changes. */
  subtitleLines?: 1 | 2;
  /** Control beside the title block, centred on its height (e.g. the reading-progress ring). */
  accessory?: ReactNode;
  /** Reading screens: on a desktop they may use the whole width (columns, a right rail). */
  wide?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}

/**
 * iOS-style screen. The nav bar floats above the content instead of
 * reserving layout space: at rest it is invisible, a frosted backdrop fades
 * in as soon as the page scrolls (so text never slides bare under the iOS
 * status bar), and the centered title appears once the large title scrolls
 * out of view. Screens with side controls (e.g. a back button) keep the
 * reserved top row so the control does not overlap the large title.
 */
export function ScreenScaffold({
  title,
  subtitle,
  barContent,
  progress,
  subtitleLines = 1,
  accessory,
  wide = false,
  left,
  right,
  children,
}: ScreenScaffoldProps) {
  const headerRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    // Condense once the large title passes under the floating bar; measure
    // the bar so the threshold includes the device safe-area inset.
    const navHeight = headerRef.current?.offsetHeight ?? 50;
    const obs = new IntersectionObserver(
      ([entry]) => setCondensed(!entry.isIntersecting),
      { rootMargin: `-${navHeight + 2}px 0px 0px 0px`, threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hasChrome = left != null || right != null;
  const navClass = `navbar${scrolled ? ' navbar--scrolled' : ''}${condensed ? ' navbar--condensed' : ''}`;
  const clamped = progress == null ? null : Math.min(1, Math.max(0, progress));

  return (
    <div className={`screen${wide ? ' screen--wide' : ''}`}>
      <header ref={headerRef} className={navClass}>
        <div className="navbar__side navbar__side--left">{left}</div>
        <div className={`navbar__title${barContent != null ? ' navbar__title--info' : ''}`}>
          {barContent ?? title}
        </div>
        <div className="navbar__side navbar__side--right">{right}</div>
        {clamped != null && (
          <div className="navbar__progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${clamped})` }} />
          </div>
        )}
      </header>

      <div className={`screen__content${hasChrome ? ' screen__content--chrome' : ''}`}>
        <div className="large-title">
          <div className="large-title__text">
            <h1 className="large-title__heading">{title}</h1>
            {subtitle != null && (
              <div
                className={`large-title__subtitle${subtitleLines === 2 ? ' large-title__subtitle--two' : ''}`}
              >
                {subtitle}
              </div>
            )}
          </div>
          {accessory != null && <div className="large-title__accessory">{accessory}</div>}
        </div>
        <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
