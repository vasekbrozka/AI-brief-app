import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { haptic } from '../lib/haptics';
import { Icon, type IconName } from './Icon';

const ACTION_WIDTH = 76; // px revealed when a panel is open
const OPEN_AT = 40; // drag further than this (px) snaps open on release
const AXIS_LOCK = 12; // px of travel before the gesture's axis is decided
const H_BIAS = 0.7; // meaningful swipes win even when slightly diagonal
const FLICK = 0.5; // px/ms — a fast release opens/closes regardless of distance
const HARD_FLICK = 1.1; // px/ms — a hard fling fires the action directly
const OVERDRAG_DAMP = 0.5; // rubber-band resistance past the open position
const COMMIT_EXTRA = 28; // shown px past open that triggers the action on release
const SETTLE_MS = 340; // slightly over the CSS snap transition

export interface SwipeAction {
  label: string;
  icon: IconName;
  onAction: () => void;
}

interface SwipeToRevealProps {
  children: ReactNode;
  /** Revealed by swiping LEFT — sits on the right (e.g. Share). */
  right: SwipeAction;
  /** Revealed by swiping RIGHT — sits on the left (e.g. Save). Optional. */
  left?: SwipeAction;
}

/**
 * iOS-style swipe-to-reveal, inset-card variant: the shell IS the card — it
 * owns the border, rounding and shadow and never moves. Only the content
 * slides, and each action sits behind it inside the shell, clipped by the
 * card's own rounding. Swipe left reveals the right action; swipe right (when
 * a left action is given) reveals the left one. Because the reveal is purely
 * the content's transform, the colour shows exactly where the content moved
 * away — no notches, no clipped borders, no end-of-animation flashes.
 *
 * Gesture forgiveness (both directions): slightly diagonal swipes still count
 * (thumbs arc), a fast flick opens from any distance, and dragging far past the
 * open point rubber-bands and fires the action directly on release.
 */
export function SwipeToReveal({ children, right, left }: SwipeToRevealProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0); // -ACTION_WIDTH (right open) … 0 … +ACTION_WIDTH (left open)
  const rafRef = useRef(0);
  const hideRef = useRef(0);
  const startRef = useRef<{ x: number; y: number; base: number } | null>(null);
  const axisRef = useRef<'?' | 'h' | 'v'>('?');
  const movedRef = useRef(false);
  const commitRef = useRef(0); // -1 right-action armed, 0 none, +1 left-action armed
  const velRef = useRef(0);
  const lastRef = useRef({ x: 0, t: 0 });
  const [open, setOpen] = useState(0); // -1 right open, 0 closed, +1 left open (a11y)

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(hideRef.current);
    },
    [],
  );

  // Once the gesture locks horizontal, block native vertical scrolling for the
  // rest of the touch. Needs a raw non-passive listener; React registers touch
  // handlers as passive.
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
      shell.classList.add('swipe--right');
      shell.classList.remove('swipe--left');
    } else if (offset > 0) {
      shell.classList.add('swipe--left');
      shell.classList.remove('swipe--right');
    } else {
      // Keep the action visible until the content has slid back over it.
      hideRef.current = window.setTimeout(
        () => shell.classList.remove('swipe--right', 'swipe--left'),
        animate ? SETTLE_MS : 0,
      );
    }
  }

  function settle(target: number) {
    cancelAnimationFrame(rafRef.current);
    offsetRef.current = target;
    apply(target, true);
    setOpen(target < 0 ? -1 : target > 0 ? 1 : 0);
  }

  function down(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY, base: offsetRef.current };
    axisRef.current = '?';
    movedRef.current = false;
    commitRef.current = 0;
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
      // A swipe that means something wins even when slightly diagonal (thumbs
      // arc): left always reveals the right action; right reveals the left
      // action only when one exists; and any direction while already open. A
      // plain rightward drag with no left action stays strict, so ordinary
      // scrolling is never hijacked.
      const meaningful = dx < 0 || (dx > 0 && left != null) || start.base !== 0;
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
    const maxRight = left != null ? ACTION_WIDTH : 0;
    if (next < -ACTION_WIDTH) {
      const over = -ACTION_WIDTH - next;
      next = -ACTION_WIDTH - over * OVERDRAG_DAMP;
    } else if (next > maxRight) {
      const over = next - maxRight;
      next = maxRight + over * OVERDRAG_DAMP;
    }

    let commit = 0;
    if (next <= -(ACTION_WIDTH + COMMIT_EXTRA)) commit = -1;
    else if (left != null && next >= ACTION_WIDTH + COMMIT_EXTRA) commit = 1;
    if (commit !== commitRef.current) {
      commitRef.current = commit;
      shellRef.current?.classList.toggle('swipe--commit', commit !== 0);
      if (commit !== 0) haptic(); // crossing the fire-on-release point
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
    const off = offsetRef.current;
    const commit = commitRef.current;
    commitRef.current = 0;

    // Dragged past the commit point, or flung hard — fire the action directly.
    if (commit < 0 || (v < -HARD_FLICK && off <= -OPEN_AT)) {
      haptic();
      right.onAction();
      settle(0);
      return;
    }
    if (left != null && (commit > 0 || (v > HARD_FLICK && off >= OPEN_AT))) {
      haptic();
      left.onAction();
      settle(0);
      return;
    }

    if (off < 0) {
      if (v < -FLICK) {
        haptic();
        settle(-ACTION_WIDTH);
      } else if (v > FLICK) {
        settle(0);
      } else {
        const opening = off <= -OPEN_AT;
        if (opening && off !== -ACTION_WIDTH) haptic();
        settle(opening ? -ACTION_WIDTH : 0);
      }
    } else if (off > 0 && left != null) {
      if (v > FLICK) {
        haptic();
        settle(ACTION_WIDTH);
      } else if (v < -FLICK) {
        settle(0);
      } else {
        const opening = off >= OPEN_AT;
        if (opening && off !== ACTION_WIDTH) haptic();
        settle(opening ? ACTION_WIDTH : 0);
      }
    } else {
      settle(0);
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
    if (open !== 0) {
      e.preventDefault();
      e.stopPropagation();
      settle(0);
    }
  }

  return (
    <div ref={shellRef} className="swipe">
      {left && (
        <div className="swipe__action swipe__action--left" aria-hidden={open !== 1}>
          <button
            type="button"
            className="swipe__action-btn"
            tabIndex={open === 1 ? 0 : -1}
            onClick={() => {
              left.onAction();
              settle(0);
            }}
          >
            <Icon name={left.icon} size={20} />
            <span>{left.label}</span>
          </button>
        </div>
      )}
      <div className="swipe__action swipe__action--right" aria-hidden={open !== -1}>
        <button
          type="button"
          className="swipe__action-btn"
          tabIndex={open === -1 ? 0 : -1}
          onClick={() => {
            right.onAction();
            settle(0);
          }}
        >
          <Icon name={right.icon} size={20} />
          <span>{right.label}</span>
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
