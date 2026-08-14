// Service worker minimal : sert uniquement à rendre le site installable sur
// téléphone. Volontairement sans cache agressif — un cache mal réglé sert du
// vieux contenu après un déploiement, et c'est très difficile à diagnostiquer.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
