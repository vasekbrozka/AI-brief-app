// Light haptic tick, best-effort. Android/desktop browsers expose
// navigator.vibrate; iOS Safari doesn't, but toggling a native switch
// control produces the system's light haptic (iOS 17.4+), which also works
// in standalone PWAs. Everywhere else this is a silent no-op.
let switchEl: HTMLInputElement | null = null;

function iosSwitchTick(): void {
  try {
    if (!switchEl) {
      switchEl = document.createElement('input');
      switchEl.type = 'checkbox';
      switchEl.setAttribute('switch', '');
      switchEl.tabIndex = -1;
      switchEl.setAttribute('aria-hidden', 'true');
      switchEl.style.position = 'fixed';
      switchEl.style.top = '-100px';
      switchEl.style.opacity = '0';
      switchEl.style.pointerEvents = 'none';
      document.body.appendChild(switchEl);
    }
    switchEl.click();
  } catch {
    /* no-op */
  }
}

export function haptic(): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate(10)) {
      return;
    }
  } catch {
    /* fall through to the iOS path */
  }
  iosSwitchTick();
}
