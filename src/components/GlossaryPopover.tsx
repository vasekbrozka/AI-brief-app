import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useSettings } from '../providers/SettingsProvider';
import { useGlossary } from '../providers/GlossaryProvider';

/**
 * The floating "bublina" that explains a tapped term. Fixed-positioned in
 * viewport space (so it works inside any scroll container), anchored under the
 * word, flipping above when there isn't room below.
 */
export function GlossaryPopover() {
  const { lang } = useSettings();
  const { open, close } = useGlossary();
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' });
  const [arrow, setArrow] = useState(20);
  const [flip, setFlip] = useState(false);

  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const pop = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 10;
    const margin = 12;
    const { rect } = open;
    let left = rect.left + rect.width / 2 - pop.width / 2;
    left = Math.max(margin, Math.min(left, vw - margin - pop.width));
    let top = rect.bottom + gap;
    let above = false;
    if (top + pop.height > vh - margin) {
      top = rect.top - gap - pop.height;
      above = true;
    }
    const arrowX = rect.left + rect.width / 2 - left;
    setArrow(Math.max(16, Math.min(arrowX, pop.width - 16)));
    setFlip(above);
    setStyle({ left: Math.round(left), top: Math.round(top) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (ref.current?.contains(target)) return;
      if (target.closest('.term')) return; // let a different term reopen
      close();
    };
    const onMove = () => close(); // scroll or resize dismisses
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer, true);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer, true);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open, close]);

  if (!open) return null;
  const { entry } = open;
  return (
    <div
      ref={ref}
      className="gpop"
      data-flip={flip ? 'true' : 'false'}
      style={style}
      role="dialog"
      aria-label={entry.term[lang]}
    >
      <span className="gpop__arrow" style={{ left: arrow }} aria-hidden="true" />
      <div className="gpop__term">{entry.term[lang]}</div>
      <div className="gpop__body">{entry.short[lang]}</div>
    </div>
  );
}
