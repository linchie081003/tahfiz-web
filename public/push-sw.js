/* Dimuat oleh service worker PWA (workbox.importScripts). Menangani Web Push. */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    /* abaikan payload rusak */
  }
  const title = data.title || "Hafiz";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "Waktunya murojaah!",
      icon: "/icons/mascot-pwa.svg",
      badge: "/icons/mascot-pwa.svg",
      tag: data.tag || "hafiz",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
