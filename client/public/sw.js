const CACHE_NAME = 'alarmclock-v1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Handle alarm notifications
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'snooze') {
    // Handle snooze action
    event.waitUntil(
      self.registration.showNotification('Alarm Snoozed', {
        body: 'Alarm will ring again in 5 minutes',
        icon: '/manifest-icon-192.png',
        tag: 'alarm-snooze'
      })
    );
  } else {
    // Handle dismiss or default click
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Listen for messages from the main thread to show notifications
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SHOW_ALARM_NOTIFICATION') {
    const { alarm } = event.data;
    
    self.registration.showNotification(`Alarm: ${alarm.label}`, {
      body: `It's ${alarm.time}`,
      icon: '/manifest-icon-192.png',
      badge: '/manifest-icon-192.png',
      vibrate: alarm.vibration ? [500, 250, 500] : undefined,
      requireInteraction: true,
      actions: [
        {
          action: 'snooze',
          title: 'Snooze'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      tag: `alarm-${alarm.id}`,
      renotify: true
    });
  }
});
