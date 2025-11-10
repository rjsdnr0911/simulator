/* ============================================
   Notification System - 알림 시스템
   ============================================ */

// 알림 타입 정의
const NOTIFICATION_TYPES = {
  // 거래 관련
  TRADE_SUCCESS: { icon: '✅', color: '#10b981', duration: 3000 },
  TRADE_ERROR: { icon: '❌', color: '#ef4444', duration: 3000 },
  TRADE_PROFIT: { icon: '💰', color: '#10b981', duration: 4000 },
  TRADE_LOSS: { icon: '📉', color: '#ef4444', duration: 4000 },

  // 가격 변동
  PRICE_SURGE: { icon: '🚀', color: '#10b981', duration: 5000 },
  PRICE_DROP: { icon: '⚠️', color: '#ef4444', duration: 5000 },
  PRICE_CHANGE: { icon: '📊', color: '#3b82f6', duration: 3000 },

  // 뉴스
  NEWS_POSITIVE: { icon: '📈', color: '#10b981', duration: 6000 },
  NEWS_NEGATIVE: { icon: '📉', color: '#ef4444', duration: 6000 },
  HOLDING_NEWS: { icon: '💼', color: '#8b5cf6', duration: 5000 },

  // 시장
  MARKET_CHANGE: { icon: '🌡️', color: '#f59e0b', duration: 4000 },
  MARKET_OPEN: { icon: '🔔', color: '#10b981', duration: 4000 },
  MARKET_CLOSE: { icon: '🔔', color: '#6b7280', duration: 4000 },

  // 자산
  ASSET_MILESTONE: { icon: '🎉', color: '#8b5cf6', duration: 5000 },

  // 시스템
  SETTING_CHANGE: { icon: '⚙️', color: '#6b7280', duration: 2000 },
  SAVE_SUCCESS: { icon: '💾', color: '#10b981', duration: 2000 },
  SAVE_ERROR: { icon: '⚠️', color: '#ef4444', duration: 3000 }
};

// 알림 큐
const notificationQueue = [];
let activeNotifications = [];
const maxActiveNotifications = 5;

// 쿨다운 관리
const notificationCooldowns = {};

// 알림 표시
function showNotification(notification) {
  // 방해 금지 모드 확인
  if (CONFIG.notifications.doNotDisturb) return;

  // 알림 유형 정보 가져오기
  const typeInfo = NOTIFICATION_TYPES[notification.type] || {
    icon: 'ℹ️',
    color: '#6b7280',
    duration: 3000
  };

  // 쿨다운 체크
  if (shouldCooldown(notification.type)) {
    return;
  }

  // 알림 객체 생성
  const notif = {
    id: `notif_${Date.now()}_${Utils.randomInt(1000, 9999)}`,
    type: notification.type,
    icon: typeInfo.icon,
    color: typeInfo.color,
    title: notification.title || '',
    message: notification.message || '',
    duration: notification.duration || typeInfo.duration,
    timestamp: Date.now()
  };

  // 큐에 추가
  notificationQueue.push(notif);

  // 쿨다운 설정
  setCooldown(notification.type);

  // 알림 처리
  processNotificationQueue();

  // 사운드 재생 (선택사항)
  if (CONFIG.notifications.soundEnabled) {
    playNotificationSound(notification.type);
  }
}

// 알림 큐 처리
function processNotificationQueue() {
  // 최대 동시 알림 수 확인
  if (activeNotifications.length >= maxActiveNotifications) {
    return;
  }

  // 큐에서 알림 꺼내기
  const notif = notificationQueue.shift();

  if (!notif) return;

  // 활성 알림에 추가
  activeNotifications.push(notif);

  // DOM에 알림 추가
  renderNotification(notif);

  // 지속 시간 후 제거
  setTimeout(() => {
    removeNotification(notif.id);
  }, notif.duration);

  // 다음 알림 처리
  if (notificationQueue.length > 0) {
    setTimeout(processNotificationQueue, 200);
  }
}

// 알림 렌더링
function renderNotification(notif) {
  const container = document.getElementById('notification-container');

  if (!container) return;

  const notifElement = document.createElement('div');
  notifElement.className = 'notification';
  notifElement.id = `notification-${notif.id}`;
  notifElement.style.borderLeft = `4px solid ${notif.color}`;

  notifElement.innerHTML = `
    <div class="notification-icon">${notif.icon}</div>
    <div class="notification-content">
      ${notif.title ? `<div class="notification-title">${notif.title}</div>` : ''}
      <div class="notification-message">${notif.message}</div>
    </div>
    <button class="notification-close" onclick="removeNotification('${notif.id}')">×</button>
  `;

  container.appendChild(notifElement);

  // 애니메이션 (slide in)
  setTimeout(() => {
    notifElement.classList.add('show');
  }, 10);
}

// 알림 제거
function removeNotification(notifId) {
  const notifElement = document.getElementById(`notification-${notifId}`);

  if (!notifElement) return;

  // Fade out 애니메이션
  notifElement.classList.remove('show');
  notifElement.classList.add('hide');

  setTimeout(() => {
    notifElement.remove();

    // 활성 알림 목록에서 제거
    activeNotifications = activeNotifications.filter(n => n.id !== notifId);

    // 큐에 대기 중인 알림 처리
    if (notificationQueue.length > 0) {
      processNotificationQueue();
    }
  }, 300);
}

// 모든 알림 제거
function clearAllNotifications() {
  activeNotifications.forEach(notif => {
    removeNotification(notif.id);
  });

  notificationQueue.length = 0;
}

// 쿨다운 체크
function shouldCooldown(type) {
  if (!notificationCooldowns[type]) return false;

  const lastNotifTime = notificationCooldowns[type];
  const cooldownDuration = getCooldownDuration(type);

  return (Date.now() - lastNotifTime) < cooldownDuration;
}

// 쿨다운 설정
function setCooldown(type) {
  notificationCooldowns[type] = Date.now();
}

// 쿨다운 시간 가져오기
function getCooldownDuration(type) {
  // 유형별 쿨다운 시간 매핑
  const cooldownMap = {
    PRICE_SURGE: CONFIG.notificationCooldowns.price10,
    PRICE_DROP: CONFIG.notificationCooldowns.price10,
    PRICE_CHANGE: CONFIG.notificationCooldowns.price5,
    NEWS_POSITIVE: CONFIG.notificationCooldowns.news,
    NEWS_NEGATIVE: CONFIG.notificationCooldowns.news,
    ASSET_MILESTONE: CONFIG.notificationCooldowns.asset
  };

  return cooldownMap[type] || 0;
}

// 알림 사운드 재생 (간단한 구현)
function playNotificationSound(type) {
  // 실제 구현에서는 AudioContext API를 사용하여 비프음 생성
  // 여기서는 간단히 로그만 출력

  if (CONFIG.notifications.soundVolume === 0) return;

  Utils.log('Playing notification sound for:', type);

  // TODO: 실제 사운드 재생 로직
  // 예: 짧은 비프음, 틸트음 등
}

// 전역으로 노출 (HTML에서 호출 가능)
window.removeNotification = removeNotification;
