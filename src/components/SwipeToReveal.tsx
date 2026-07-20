import { useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { Icon } from './Icon';

const ACTION_WIDTH = 76; // px revealed when the panel is open
const OPEN_AT = 40; // drag further than this (px) snaps open on release
const AXIS_LOCK = 8; // px of travel before committing to a horizontal swipe

interface SwipeToRevealProps {
  children: ReactNode;
  actionLabel: string;
  onAction: () => void;
}

/**
 * iOS-style swipe-left-to-reveal. Keeps the card face clean — the action
 * (Share) hides behind it and appears only on a horizontal swipe. Vertical
 * scrolling is untouched (touch-action: pan-y + an axis lock).
 */
export function SwipeToReveal({ children, actionLabel, onAction }: SwipeToRevealProps) {
  const [offset, setOffset] = useState(0); // 0 closed … -ACTION_WIDTH open
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number; base: number } | null>(null);
  const axisRef = useRef<'?' | 'h' | 'v'>('?');
  const movedRef = useRef(false);

  const open = offset <= -OPEN_AT;

  function down(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY, base: offset };
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
      if (axisRef.current === 'h') {
        setDragging(true);
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }
    }
    if (axisRef.current !== 'h') return;
    movedRef.current = true;
    let next = start.base + dx;
    if (next > 0) next = 0;
    if (next < -ACTION_WIDTH) next = -ACTION_WIDTH;
    setOffset(next);
  }

  function up() {
    if (!startRef.current) return;
    startRef.current = null;
    if (axisRef.current === 'h') setOffset((o) => (o <= -OPEN_AT ? -ACTION_WIDTH : 0));
    setDragging(false);
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
      setOffset(0);
    }
  }

  return (
    <div className="swipe">
      <div className="swipe__action" aria-hidden={!open}>
        <button
          type="button"
          className="swipe__action-btn"
          tabIndex={open ? 0 : -1}
          onClick={() => {
            onAction();
            setOffset(0);
          }}
        >
          <Icon name="share" size={20} />
          <span>{actionLabel}</span>
        </button>
      </div>
      <div
        className={`swipe__fg${dragging ? ' is-dragging' : ''}`}
        style={{ transform: `translate3d(${offset}px, 0, 0)` }}
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
