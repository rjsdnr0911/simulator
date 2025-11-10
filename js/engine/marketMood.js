/* ============================================
   Market Mood - 시장 분위기 시스템
   ============================================ */

// 시장 분위기 상태
const marketMood = {
  current: 'sideways', // 'bull', 'bear', 'sideways'
  intensity: 0.5, // 0.0 ~ 1.0
  duration: 0, // 지속 시간 (초)
  timer: null,
  changeInterval: 1800 // 30분 (기본값)
};

// 시장 분위기 정의
const MARKET_MOODS = {
  bull: {
    name: '강세장',
    nameEn: 'Bull Market',
    icon: '📈',
    color: '#10b981',
    description: '시장 전반적 상승세',
    effect: 0.5, // 긍정적 영향 (+0.5%)
    emoji: '🐂'
  },
  bear: {
    name: '약세장',
    nameEn: 'Bear Market',
    icon: '📉',
    color: '#ef4444',
    description: '시장 전반적 하락세',
    effect: -0.5, // 부정적 영향 (-0.5%)
    emoji: '🐻'
  },
  sideways: {
    name: '박스권',
    nameEn: 'Sideways',
    icon: '➡️',
    color: '#6b7280',
    description: '보통 변동성',
    effect: 0, // 중립
    emoji: '🌡️'
  },
  volatile: {
    name: '고변동성',
    nameEn: 'High Volatility',
    icon: '⚡',
    color: '#f59e0b',
    description: '큰 폭 등락',
    effect: 0, // 중립이지만 변동성 증가
    volatilityMultiplier: 1.5,
    emoji: '⚡'
  }
};

// 시장 분위기 시스템 시작
function startMarketMoodSystem() {
  Utils.log('Starting market mood system...');

  // 초기 시장 분위기 설정
  setRandomMarketMood();

  // 주기적으로 시장 분위기 변경
  const interval = (CONFIG.timers.moodChange || 1800000) / gameState.timeSpeed;

  marketMood.timer = setInterval(() => {
    if (!gameState.isPaused && gameState.isRunning) {
      changeMarketMood();
    }
  }, interval);

  // UI 업데이트
  updateMarketMoodUI();

  Utils.log('Market mood system started');
}

// 시장 분위기 시스템 중지
function stopMarketMoodSystem() {
  if (marketMood.timer) {
    clearInterval(marketMood.timer);
    marketMood.timer = null;
  }
  Utils.log('Market mood system stopped');
}

// 랜덤 시장 분위기 설정
function setRandomMarketMood() {
  const probabilities = CONFIG.marketMoodProbability[gameState.difficulty];

  const rand = Math.random();
  let cumulativeProbability = 0;

  if (rand < (cumulativeProbability += probabilities.bull)) {
    marketMood.current = 'bull';
  } else if (rand < (cumulativeProbability += probabilities.bear)) {
    marketMood.current = 'bear';
  } else {
    marketMood.current = 'sideways';
  }

  // 가끔 고변동성 상태 (10% 확률)
  if (Math.random() < 0.1) {
    marketMood.current = 'volatile';
  }

  // 강도 설정 (0.3 ~ 1.0)
  marketMood.intensity = Utils.randomFloat(0.3, 1.0);

  // 지속 시간 초기화
  marketMood.duration = 0;

  Utils.log('Market mood set to:', marketMood.current, 'intensity:', marketMood.intensity);
}

// 시장 분위기 변경
function changeMarketMood() {
  const oldMood = marketMood.current;

  // 새로운 분위기 설정
  setRandomMarketMood();

  const newMood = marketMood.current;

  // UI 업데이트
  updateMarketMoodUI();

  // 알림 표시
  if (CONFIG.notifications.marketChange && typeof showNotification === 'function') {
    const moodInfo = MARKET_MOODS[newMood];
    showNotification({
      type: 'MARKET_CHANGE',
      title: '시장 분위기 변화',
      message: `${moodInfo.emoji} ${moodInfo.name} - ${moodInfo.description}`,
      duration: 4000
    });
  }

  Utils.log('Market mood changed:', oldMood, '->', newMood);
}

// 시장 분위기 효과 가져오기
function getMarketMoodEffect() {
  const moodInfo = MARKET_MOODS[marketMood.current];

  if (!moodInfo) return 0;

  // 기본 효과에 강도 곱하기
  let effect = moodInfo.effect * marketMood.intensity;

  return effect;
}

// 변동성 배수 가져오기
function getVolatilityMultiplier() {
  const moodInfo = MARKET_MOODS[marketMood.current];

  if (moodInfo.volatilityMultiplier) {
    return moodInfo.volatilityMultiplier;
  }

  return 1.0;
}

// 시장 분위기 UI 업데이트
function updateMarketMoodUI() {
  const moodInfo = MARKET_MOODS[marketMood.current];

  if (!moodInfo) return;

  // 분위기 표시줄 업데이트
  const moodIndicator = document.getElementById('marketMoodIndicator');
  if (moodIndicator) {
    const moodIcon = moodIndicator.querySelector('.mood-icon');
    const moodText = moodIndicator.querySelector('.mood-text');
    const moodDescription = moodIndicator.querySelector('.mood-description');

    if (moodIcon) moodIcon.textContent = moodInfo.emoji;
    if (moodText) moodText.textContent = moodInfo.name;
    if (moodDescription) moodDescription.textContent = moodInfo.description;

    // 색상 변경
    moodIndicator.style.backgroundColor = moodInfo.color + '20'; // 20% opacity
    moodIndicator.style.borderLeft = `4px solid ${moodInfo.color}`;
  }

  // 분위기 바 (선택사항)
  const moodBar = document.querySelector('.market-mood-bar');
  if (moodBar) {
    moodBar.style.backgroundColor = moodInfo.color + '10';
  }
}

// 현재 시장 분위기 정보 가져오기
function getCurrentMarketMood() {
  return {
    ...marketMood,
    info: MARKET_MOODS[marketMood.current]
  };
}

// 시장 분위기 지속 시간 업데이트 (1초마다 호출)
function updateMarketMoodDuration() {
  if (gameState.isRunning && !gameState.isPaused) {
    marketMood.duration++;
  }
}
