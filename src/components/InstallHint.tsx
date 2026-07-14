import { useState } from 'react';
import { isStandalone } from '../lib/pwa';
import { useSettings } from '../providers/SettingsProvider';
import { Icon } from './Icon';

const DISMISS_KEY = 'aibrief.installHintDismissed';

/** Dismissible banner nudging iOS users to add the app to their Home Screen. */
export function InstallHint() {
  const { t } = useSettings();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [open, setOpen] = useState(false);

  if (isStandalone() || dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <div className="install-hint">
      <div className="install-hint__row">
        <div className="install-hint__icon">
          <Icon name="share" size={22} />
        </div>
        <div className="install-hint__text">
          <strong>{t.installHintTitle}</strong>
          <span>{t.installHintBody}</span>
        </div>
        <button type="button" className="install-hint__action" onClick={() => setOpen((o) => !o)}>
          {t.installHintAction}
        </button>
        <button
          type="button"
          className="install-hint__close"
          aria-label={t.dismiss}
          onClick={dismiss}
        >
          <Icon name="close" size={18} />
        </button>
      </div>
      {open && (
        <ol className="install-hint__steps">
          {t.installSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
