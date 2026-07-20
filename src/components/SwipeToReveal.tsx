import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { Icon } from './Icon';

const ACTION_WIDTH = 76; // px revealed when the panel is open
const OPEN_AT = 40; // drag further than this (px) snaps open on release
const AXIS_LOCK = 8; // px of travel before committing to a horizontal swipe
// How far the blue panel slides under the card, so the card's rounded right
// corners sit on blue instead of the page background. Matches --radius.
const OVERLAP = 18;

interface SwipeToRevealProps {
  children: ReactNode;
  actionLabel: string;
  onAction: () => void;
}

/**
 * iOS-style swipe-left-to-reveal. Keeps the card face clean — the action
 * (Share) hides behind it and appears only on a horizontal swipe. Vertical
 * scrolling is untouched (touch-action: pan-y + an axis lock).
 *
 * Nothing is clipped: the card keeps its full border while sliding, and the
 * action panel's width tracks the revealed gap (plus a slide-under overlap
 * that backs the card's rounded corners). Zero width at rest = no blue ever
 * bleeds through. Drag frames are written straight to the DOM via rAF — no
 * React re-renders mid-gesture — so the motion stays smooth.
 */
export function SwipeToReveal({ children, actionLabel, onAction }: SwipeToRevealProps) {
  const fgRef = useRef<HTMLDivElement | null>(null);
  const actionRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0); // 0 closed … -ACTION_WIDTH open
  const rafRef = useRef(0);
  const startRef = useRef<{ x: number; y: number; base: number } | null>(null);
  const axisRef = useRef<'?' | 'h' | 'v'>('?');
  const movedRef = useRef(false);
  const [open, setOpen] = useState(false); // resting position, for a11y only

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function apply(offset: number, animate: boolean) {
    const fg = fgRef.current;
    const action = actionRef.current;
    if (!fg || !action) return;
    fg.style.transition = animate ? '' : 'none';
    action.style.transition = animate ? '' : 'none';
    fg.style.transform = `translate3d(${offset}px, 0, 0)`;
    action.style.width = offset < 0 ? `${-offset + OVERLAP}px` : '0px';
  }

  function settle(target: number) {
    cancelAnimationFrame(rafRef.current);
    offsetRef.current = target;
    apply(target, true);
    setOpen(target !== 0);
  }

  function down(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY, base: offsetRef.current };
    axisRef.current = '?';
    movedRef.current = false;
  }

  function move(e: PointerEvent<HTMLDivElement>) {
    const start = startRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (axisRef.current === '?') {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      axisRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      if (axisRef.current === 'h') e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    if (axisRef.current !== 'h') return;
    movedRef.current = true;
    let next = start.base + dx;
    if (next > 0) next = 0;
    if (next < -ACTION_WIDTH) next = -ACTION_WIDTH;
    offsetRef.current = next;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => apply(next, false));
  }

  function up() {
    if (!startRef.current) return;
    startRef.current = null;
    if (axisRef.current === 'h') settle(offsetRef.current <= -OPEN_AT ? -ACTION_WIDTH : 0);
  }

  // Stop the click that ends a swipe — or a tap while open — from reaching the
  // card's own read-toggle / source links.
  function clickCapture(e: MouseEvent) {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
      return;
    }
    if (open) {
      e.preventDefault();
      e.stopPropagation();
      settle(0);
    }
  }

  return (
    <div className="swipe">
      <div ref={actionRef} className="swipe__action" style={{ width: 0 }} aria-hidden={!open}>
        <button
          type="button"
          className="swipe__action-btn"
          tabIndex={open ? 0 : -1}
          onClick={() => {
            onAction();
            settle(0);
          }}
        >
          <Icon name="share" size={20} />
          <span>{actionLabel}</span>
        </button>
      </div>
      <div
        ref={fgRef}
        className="swipe__fg"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={clickCapture}
      >
        {children}
      </div>
    </div>
  );
}
