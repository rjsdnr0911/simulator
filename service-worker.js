/* ============================================
   Service Worker - PWA 오프라인 지원
   ============================================ */

const CACHE_NAME = 'stockcoin-simulator-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',

  // CSS
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/layout.css',
  '/css/notifications.css',
  '/css/difficulty.css',
  '/css/responsive.css',

  // JS - Data
  '/js/data/stocks.js',
  '/js/data/newsDatabase.js',
  '/js/data/sectors.js',

  // JS - Engine
  '/js/engine/priceEngine.js',
  '/js/engine/marketMood.js',
  '/js/engine/newsEngine.js',
  '/js/engine/timeManager.js',
  '/js/engine/difficultySystem.js',

  // JS - Trading
  '/js/trading/order.js',
  '/js/trading/portfolio.js',
  '/js/trading/transactionLogger.js',

  // JS - UI
  '/js/ui/chart.js',
  '/js/ui/stockList.js',
  '/js/ui/dashboard.js',
  '/js/ui/newsTicker.js',
  '/js/ui/notificationSystem.js',
  '/js/ui/transactionLog.js',
  '/js/ui/statistics.js',
  '/js/ui/difficultySelect.js',

  // JS - Storage
  '/js/storage/saveLoad.js',

  // JS - Utils
  '/js/utils/formatters.js',
  '/js/utils/calculator.js',
  '/js/utils/validators.js',

  // JS - Main
  '/js/config.js',
  '/js/main.js',

  // Libraries
  '/lib/chart.min.js'
];

// 설치 이벤트 - 캐시에 파일 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Cache installation failed:', err);
      })
  );
  self.skipWaiting();
});

// Fetch 이벤트 - 캐시된 리소스 제공
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response;
        }

        // 캐시에 없으면 네트워크에서 가져옴
        return fetch(event.request)
          .then(response => {
            // 유효한 응답인지 확인
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답을 복사하여 캐시에 저장
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(err => {
            console.error('Fetch failed:', err);
            // 오프라인 페이지를 여기에 반환할 수 있음
          });
      })
  );
});

// Activate 이벤트 - 오래된 캐시 삭제
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Background Sync (선택 사항)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-game-data') {
    event.waitUntil(syncGameData());
  }
});

async function syncGameData() {
  // 게임 데이터 동기화 로직 (필요 시 구현)
  console.log('Syncing game data...');
}

// Push Notification (선택 사항)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('StockCoin Simulator', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
