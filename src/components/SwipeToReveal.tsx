import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { haptic } from '../lib/haptics';
import { Icon } from './Icon';

const ACTION_WIDTH = 76; // px revealed when the panel is open
const OPEN_AT = 40; // drag further than this (px) snaps open on release
const AXIS_LOCK = 12; // px of travel before the gesture's axis is decided
const H_BIAS = 0.7; // meaningful swipes win even when slightly diagonal
const FLICK = 0.5; // px/ms — a fast release opens/closes regardless of distance
const SHARE_FLICK = 1.1; // px/ms — a hard leftward fling fires Share directly
const OVERDRAG_DAMP = 0.5; // rubber-band resistance past the open position
const COMMIT_EXTRA = 28; // shown px past open that triggers Share on release
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
 *
 * Gesture forgiveness: slightly diagonal swipes still count (thumbs arc), a
 * fast flick opens from any distance, and dragging far past the open point
 * rubber-bands and fires Share directly on release.
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
  const commitRef = useRef(false);
  const velRef = useRef(0);
  const lastRef = useRef({ x: 0, t: 0 });
  const [open, setOpen] = useState(false); // resting position, for a11y only

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(hideRef.current);
    },
    [],
  );

  // Once the gesture locks horizontal, block native vertical scrolling for
  // the rest of the touch — the page must not creep up/down mid-swipe, and
  // iOS must not steal the gesture (pointercancel) halfway through. Needs a
  // raw non-passive listener; React registers touch handlers as passive.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const onTouchMove = (e: TouchEvent) => {
      if (axisRef.current === 'h') e.preventDefault();
    };
    fg.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => fg.removeEventListener('touchmove', onTouchMove);
  }, []);

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
    commitRef.current = false;
    velRef.current = 0;
    lastRef.current = { x: e.clientX, t: e.timeStamp };
  }

  function move(e: PointerEvent<HTMLDivElement>) {
    const start = startRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (axisRef.current === '?') {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      // A swipe in a direction that means something (left, or any way while
      // open) wins even when slightly diagonal — thumbs arc naturally.
      // Plain rightward drags on a closed card stay strict, so ordinary
      // scrolling never gets hijacked.
      const meaningful = dx < 0 || start.base !== 0;
      const horizontal = meaningful
        ? Math.abs(dx) > H_BIAS * Math.abs(dy)
        : Math.abs(dx) > Math.abs(dy);
      axisRef.current = horizontal ? 'h' : 'v';
      if (axisRef.current === 'h') e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    if (axisRef.current !== 'h') return;
    movedRef.current = true;

    // Release velocity (px/ms), lightly smoothed for the flick decision.
    const last = lastRef.current;
    const dt = e.timeStamp - last.t;
    if (dt > 0) {
      const inst = (e.clientX - last.x) / dt;
      velRef.current = 0.7 * inst + 0.3 * velRef.current;
      lastRef.current = { x: e.clientX, t: e.timeStamp };
    }

    let next = start.base + dx;
    if (next > 0) next = 0;
    if (next < -ACTION_WIDTH) {
      // Rubber-band past the open position; far enough commits to Share.
      const over = -ACTION_WIDTH - next;
      next = -ACTION_WIDTH - over * OVERDRAG_DAMP;
    }
    const committed = next <= -(ACTION_WIDTH + COMMIT_EXTRA);
    if (committed !== commitRef.current) {
      commitRef.current = committed;
      shellRef.current?.classList.toggle('swipe--commit', committed);
      if (committed) haptic(); // crossing the fire-on-release point
    }
    offsetRef.current = next;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => apply(next, false));
  }

  function up() {
    if (!startRef.current) return;
    startRef.current = null;
    if (axisRef.current !== 'h') return;
    shellRef.current?.classList.remove('swipe--commit');
    const v = velRef.current;
    // Dragged past the commit point, or flung hard left — share right away.
    if (commitRef.current || (v < -SHARE_FLICK && offsetRef.current <= -OPEN_AT)) {
      commitRef.current = false;
      haptic();
      onAction();
      settle(0);
      return;
    }
    if (v < -FLICK) {
      haptic();
      settle(-ACTION_WIDTH);
    } else if (v > FLICK) {
      settle(0);
    } else {
      const opening = offsetRef.current <= -OPEN_AT;
      if (opening && offsetRef.current !== -ACTION_WIDTH) haptic();
      settle(opening ? -ACTION_WIDTH : 0);
    }
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
