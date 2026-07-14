import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { SettingsProvider } from './providers/SettingsProvider';
import { ReadProvider } from './providers/ReadProvider';
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
  },
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <SettingsProvider>
      <ReadProvider>
        <App />
      </ReadProvider>
    </SettingsProvider>
  </StrictMode>,
);
