// Echo Pulse Service Worker
// Enables offline gameplay and caching

const CACHE_NAME = 'echo-pulse-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './game.js',
  './styles.css',
  './manifest.json'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  console.log('Echo Pulse Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Echo Pulse Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Echo Pulse Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  console.log('Echo Pulse Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Echo Pulse Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Echo Pulse Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Echo Pulse Service Worker: Serving from cache', event.request.url);
          return response;
        }
        
        console.log('Echo Pulse Service Worker: Fetching from network', event.request.url);
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Background sync for game state (future feature)
self.addEventListener('sync', event => {
  if (event.tag === 'echo-pulse-sync') {
    console.log('Echo Pulse Service Worker: Background sync triggered');
    // Could sync high scores, achievements, etc.
  }
});

// Push notifications (future feature)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log('Echo Pulse Service Worker: Push notification received', data);
    
    const options = {
      body: data.body || 'New update available!',
      icon: './icon-192.png',
      badge: './icon-72.png',
      vibrate: [200, 100, 200],
      data: data.url || './',
      actions: [
        {
          action: 'open',
          title: 'Play Now',
          icon: './icon-play.png'
        },
        {
          action: 'close',
          title: 'Later',
          icon: './icon-close.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Echo Pulse', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Echo Pulse Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data || './')
    );
  }
});

// Share target (future feature for sharing high scores)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHARE_SCORE') {
    console.log('Echo Pulse Service Worker: Share score request', event.data);
    // Handle score sharing
  }
});

console.log('Echo Pulse Service Worker: Loaded successfully');
