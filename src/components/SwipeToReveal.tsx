import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { Icon } from './Icon';

const ACTION_WIDTH = 76; // px revealed when the panel is open
const OPEN_AT = 40; // drag further than this (px) snaps open on release
const AXIS_LOCK = 8; // px of travel before committing to a horizontal swipe
const SETTLE_MS = 340; // slightly over the CSS snap transition

interface SwipeToRevealProps {
  children: ReactNode;
  actionLabel: string;
  onAction: () => void;
}

/**
 * iOS-style swipe-left-to-reveal, inset-card variant: the shell IS the card —
 * it owns the border, rounding and shadow and never moves. Only the content
 * slides, and the Share action sits behind it inside the shell, clipped by
 * the card's own rounding. Because the reveal is purely the content's
 * transform (the action never animates), the blue is visible exactly where
 * the content has moved away — no notches, no clipped borders, no end-of-
 * animation flashes. Drag frames go straight to the DOM via rAF, so nothing
 * re-renders mid-gesture.
 */
export function SwipeToReveal({ children, actionLabel, onAction }: SwipeToRevealProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0); // 0 closed … -ACTION_WIDTH open
  const rafRef = useRef(0);
  const hideRef = useRef(0);
  const startRef = useRef<{ x: number; y: number; base: number } | null>(null);
  const axisRef = useRef<'?' | 'h' | 'v'>('?');
  const movedRef = useRef(false);
  const [open, setOpen] = useState(false); // resting position, for a11y only

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(hideRef.current);
    },
    [],
  );

  function apply(offset: number, animate: boolean) {
    const fg = fgRef.current;
    const shell = shellRef.current;
    if (!fg || !shell) return;
    fg.style.transition = animate ? '' : 'none';
    fg.style.transform = `translate3d(${offset}px, 0, 0)`;
    window.clearTimeout(hideRef.current);
    if (offset < 0) {
      shell.classList.add('swipe--active');
    } else {
      // Keep the action visible until the content has slid back over it.
      hideRef.current = window.setTimeout(
        () => shell.classList.remove('swipe--active'),
        animate ? SETTLE_MS : 0,
      );
    }
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
    <div ref={shellRef} className="swipe">
      <div className="swipe__action" aria-hidden={!open}>
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
