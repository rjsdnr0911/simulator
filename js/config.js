/* ============================================
   Configuration - 전역 설정
   ============================================ */

const CONFIG = {
  // 버전
  version: '1.0.0',

  // 초기 자금
  initialCash: {
    easy: 50000000,      // 5천만원
    normal: 10000000,    // 1천만원
    hard: 5000000,       // 500만원
    custom: 10000000
  },

  // 타이머 설정 (밀리초)
  timers: {
    stockUpdate: 60000,      // 주식: 1분 (60초)
    cryptoUpdate: 20000,     // 코인: 20초
    newsGeneration: 600000,  // 뉴스: 10분 (기본값, 난이도별 다름)
    moodChange: 1800000,     // 시장 분위기: 30분 (기본값)
    autoSave: 60000          // 자동 저장: 1분
  },

  // 수수료 (%)
  fees: {
    stock: {
      easy: 0.0001,     // 0.01%
      normal: 0.00015,  // 0.015%
      hard: 0.0002,     // 0.02%
      custom: 0.00015
    },
    crypto: {
      easy: 0.0003,     // 0.03%
      normal: 0.0005,   // 0.05%
      hard: 0.0008,     // 0.08%
      custom: 0.0005
    }
  },

  // 가격 변동성
  volatility: {
    easy: 0.5,
    normal: 1.0,
    hard: 1.5,
    custom: 1.0
  },

  // 뉴스 영향력
  newsImpact: {
    easy: 0.7,
    normal: 1.0,
    hard: 1.3,
    custom: 1.0
  },

  // 뉴스 명확도
  newsClarity: {
    easy: 'high',      // 명확한 힌트
    normal: 'medium',  // 보통 힌트
    hard: 'low',       // 모호한 힌트
    custom: 'medium'
  },

  // 시장 분위기 확률
  marketMoodProbability: {
    easy: {
      bull: 0.5,      // 강세장 50%
      bear: 0.2,      // 약세장 20%
      sideways: 0.3   // 박스권 30%
    },
    normal: {
      bull: 0.4,
      bear: 0.3,
      sideways: 0.3
    },
    hard: {
      bull: 0.3,
      bear: 0.4,
      sideways: 0.3
    },
    custom: {
      bull: 0.4,
      bear: 0.3,
      sideways: 0.3
    }
  },

  // 파산 시스템
  bankruptcyEnabled: {
    easy: false,
    normal: false,
    hard: true,
    custom: false
  },

  // 차트 설정
  chart: {
    maxDataPoints: 100,      // 차트에 표시할 최대 데이터 포인트
    sampleThreshold: 500,    // 샘플링 시작 임계값
    updateAnimation: false   // 실시간 업데이트 시 애니메이션 비활성화
  },

  // 저장소 설정
  storage: {
    maxTransactions: 500,    // 최대 거래 기록 개수
    autoSaveEnabled: true,
    useIndexedDB: true       // IndexedDB 사용 여부
  },

  // 알림 설정
  notifications: {
    priceAlert5: true,       // ±5% 가격 변동 알림
    priceAlert10: true,      // ±10% 가격 변동 알림
    assetMilestone: true,    // 자산 목표 달성 알림
    profitTarget: true,      // 수익률 목표 달성 알림
    lossAlert: true,         // 손실 경고 알림
    majorNews: true,         // 중요 뉴스 알림
    holdingNews: true,       // 보유 종목 관련 뉴스 알림
    marketChange: true,      // 시장 분위기 변경 알림
    soundEnabled: true,      // 사운드 활성화
    soundVolume: 0.8,        // 볼륨 (0.0 ~ 1.0)
    doNotDisturb: false      // 방해 금지 모드
  },

  // 알림 쿨다운 (밀리초)
  notificationCooldowns: {
    price5: 300000,    // 5분
    price10: 180000,   // 3분
    asset: 600000,     // 10분
    news: 120000       // 2분
  },

  // 자산 목표 (원)
  assetMilestones: [
    50000000,     // 5천만
    100000000,    // 1억
    500000000,    // 5억
    1000000000,   // 10억
    10000000000   // 100억
  ],

  // 시간 가속
  timeSpeed: {
    normal: 1,
    fast: 2,
    veryFast: 5
  },

  // 디버그 모드
  debug: false
};

// 난이도별 설정을 가져오는 헬퍼 함수
function getDifficultySettings(difficulty) {
  return {
    initialCash: CONFIG.initialCash[difficulty],
    volatility: CONFIG.volatility[difficulty],
    newsImpact: CONFIG.newsImpact[difficulty],
    newsClarity: CONFIG.newsClarity[difficulty],
    stockFee: CONFIG.fees.stock[difficulty],
    cryptoFee: CONFIG.fees.crypto[difficulty],
    marketMoodProbability: CONFIG.marketMoodProbability[difficulty],
    bankruptcyEnabled: CONFIG.bankruptcyEnabled[difficulty]
  };
}

// 글로벌 유틸리티 함수들
const Utils = {
  // 숫자를 통화 형식으로 변환
  formatCurrency(value, decimals = 2) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  // 달러 형식으로 변환
  formatDollar(value, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  // 퍼센트 형식으로 변환
  formatPercent(value, decimals = 2) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  },

  // 큰 숫자를 축약 형식으로 변환 (1,000,000 -> 100만)
  formatLargeNumber(value) {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}만`;
    }
    return value.toLocaleString('ko-KR');
  },

  // 시간을 형식화 (초 -> HH:MM:SS)
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },

  // 기간을 형식화 (밀리초 -> "2시간 35분")
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}일 ${hours % 24}시간`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    } else {
      return `${seconds}초`;
    }
  },

  // 날짜를 형식화
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  // 랜덤 정수 생성
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // 랜덤 실수 생성
  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  // 랜덤 선택
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  // 디바운스
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 스로틀
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // 깊은 복사
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // 로그 (디버그 모드일 때만)
  log(...args) {
    if (CONFIG.debug) {
      console.log('[StockCoin]', ...args);
    }
  },

  // 에러 로그
  error(...args) {
    console.error('[StockCoin Error]', ...args);
  }
};
