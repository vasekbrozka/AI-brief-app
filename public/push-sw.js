/* Push handlers imported into the generated service worker via
   workbox.importScripts (see vite.config.ts). iOS requires every push to
   show a notification; the payload also carries the app-icon badge count. */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    /* ignore malformed payloads */
  }
  const tasks = [
    self.registration.showNotification(data.title || 'AIspresso', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      data: { url: '/' },
    }),
  ];
  if ('setAppBadge' in self.navigator) {
    tasks.push(self.navigator.setAppBadge(data.badge || 1).catch(() => {}));
  }
  event.waitUntil(Promise.all(tasks));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('/');
    }),
  );
});
