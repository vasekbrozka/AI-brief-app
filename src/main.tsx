import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { SettingsProvider } from './providers/SettingsProvider';
import { ReadProvider } from './providers/ReadProvider';
import { StreakProvider } from './providers/StreakProvider';
import { GlossaryProvider } from './providers/GlossaryProvider';
import { GlossaryPopover } from './components/GlossaryPopover';
import { clearBadge, ensureSubscribed } from './lib/push';
import { App } from './App';
import './index.css';

// Keep the installed app fresh without prompting. iOS rarely re-checks the
// service worker for a pinned (standalone) app on its own, so we also check
// whenever the app returns to the foreground and once an hour; with
// `autoUpdate` a found update activates and reloads the app automatically.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const check = () => registration.update().catch(() => {});
    window.setInterval(check, 60 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
    // Push subscriptions on iOS can silently expire — re-affirm on launch.
    ensureSubscribed();
  },
});

// The morning push sets a badge on the app icon; opening the app clears it.
clearBadge();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') clearBadge();
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <SettingsProvider>
      <ReadProvider>
        <StreakProvider>
          <GlossaryProvider>
            <App />
            <GlossaryPopover />
          </GlossaryProvider>
        </StreakProvider>
      </ReadProvider>
    </SettingsProvider>
  </StrictMode>,
);
