/* ============================================
   Difficulty System - 난이도 시스템
   ============================================ */

// 난이도별 설정 적용
function applyDifficultySettings(difficulty) {
  const settings = getDifficultySettings(difficulty);

  Utils.log('Applying difficulty settings:', difficulty, settings);

  // 게임 상태에 난이도 설정 적용
  gameState.difficulty = difficulty;
  gameState.initialCash = settings.initialCash;

  return settings;
}

// 난이도별 수수료 계산
function calculateTradingFee(price, quantity, isCrypto = false) {
  const feeRate = isCrypto
    ? CONFIG.fees.crypto[gameState.difficulty]
    : CONFIG.fees.stock[gameState.difficulty];

  const totalAmount = price * quantity;
  const fee = totalAmount * feeRate;

  return Math.round(fee);
}

// 난이도별 변동성 적용
function getDifficultyVolatility() {
  return CONFIG.volatility[gameState.difficulty];
}

// 난이도별 뉴스 영향력
function getDifficultyNewsImpact() {
  return CONFIG.newsImpact[gameState.difficulty];
}

// 난이도별 뉴스 명확도
function getDifficultyNewsClarity() {
  return CONFIG.newsClarity[gameState.difficulty];
}

// 파산 시스템 활성화 여부
function isBankruptcyEnabled() {
  return CONFIG.bankruptcyEnabled[gameState.difficulty];
}

// 난이도 정보 가져오기
function getDifficultyInfo(difficulty) {
  const settings = getDifficultySettings(difficulty);

  const difficultyInfo = {
    easy: {
      name: '쉬움',
      icon: '🌱',
      color: '#10b981',
      description: '처음 해보는 분께 추천',
      features: [
        `시작 자금: ${Utils.formatLargeNumber(settings.initialCash)}`,
        `변동성: 낮음 (${CONFIG.volatility.easy * 100}%)`,
        `수수료: ${(CONFIG.fees.stock.easy * 100).toFixed(2)}%`,
        '뉴스: 명확한 힌트',
        '파산: 없음'
      ]
    },
    normal: {
      name: '보통',
      icon: '⚖️',
      color: '#3b82f6',
      description: '적당한 도전을 원하는 분께',
      features: [
        `시작 자금: ${Utils.formatLargeNumber(settings.initialCash)}`,
        `변동성: 보통 (${CONFIG.volatility.normal * 100}%)`,
        `수수료: ${(CONFIG.fees.stock.normal * 100).toFixed(3)}%`,
        '뉴스: 보통 힌트',
        '파산: 없음'
      ]
    },
    hard: {
      name: '어려움',
      icon: '🔥',
      color: '#ef4444',
      description: '전문가를 위한 하드코어',
      features: [
        `시작 자금: ${Utils.formatLargeNumber(settings.initialCash)}`,
        `변동성: 높음 (${CONFIG.volatility.hard * 100}%)`,
        `수수료: ${(CONFIG.fees.stock.hard * 100).toFixed(2)}%`,
        '뉴스: 모호한 힌트',
        '파산: 가능 ⚠️'
      ]
    },
    custom: {
      name: '커스텀',
      icon: '⚙️',
      color: '#8b5cf6',
      description: '내 마음대로 설정',
      features: [
        '모든 설정 직접 조정 가능'
      ]
    }
  };

  return difficultyInfo[difficulty] || difficultyInfo.normal;
}

// 커스텀 난이도 설정 적용
function applyCustomSettings(customSettings) {
  if (!customSettings) return;

  Utils.log('Applying custom settings:', customSettings);

  // 커스텀 설정을 CONFIG에 적용
  if (customSettings.initialCash) {
    CONFIG.initialCash.custom = customSettings.initialCash;
  }

  if (customSettings.volatility) {
    CONFIG.volatility.custom = customSettings.volatility;
  }

  if (customSettings.newsImpact) {
    CONFIG.newsImpact.custom = customSettings.newsImpact;
  }

  if (customSettings.newsClarity) {
    CONFIG.newsClarity.custom = customSettings.newsClarity;
  }

  if (customSettings.stockFee) {
    CONFIG.fees.stock.custom = customSettings.stockFee;
  }

  if (customSettings.cryptoFee) {
    CONFIG.fees.crypto.custom = customSettings.cryptoFee;
  }

  if (customSettings.bankruptcyEnabled !== undefined) {
    CONFIG.bankruptcyEnabled.custom = customSettings.bankruptcyEnabled;
  }

  if (customSettings.marketMoodProbability) {
    CONFIG.marketMoodProbability.custom = customSettings.marketMoodProbability;
  }
}

// 난이도 변경 (게임 중 - 주의해서 사용)
function changeDifficulty(newDifficulty) {
  if (gameState.difficulty === newDifficulty) return;

  const oldDifficulty = gameState.difficulty;

  // 새로운 난이도 설정 적용
  applyDifficultySettings(newDifficulty);

  Utils.log('Difficulty changed:', oldDifficulty, '->', newDifficulty);

  if (typeof showNotification === 'function') {
    const diffInfo = getDifficultyInfo(newDifficulty);
    showNotification({
      type: 'SETTING_CHANGE',
      title: '난이도 변경',
      message: `${diffInfo.icon} ${diffInfo.name}으로 변경되었습니다`,
      duration: 3000
    });
  }

  // 엔진들 재시작하여 새 설정 적용
  restartEnginesWithNewSettings();
}

// 엔진 재시작
function restartEnginesWithNewSettings() {
  // 가격 엔진 재시작
  if (priceEngine.isRunning) {
    stopPriceEngine();
    startPriceEngine();
  }

  // 뉴스 엔진 재시작
  if (newsEngine.isRunning) {
    stopNewsEngine();
    startNewsEngine();
  }

  // 시장 분위기 시스템 재시작
  if (marketMood.timer) {
    stopMarketMoodSystem();
    startMarketMoodSystem();
  }
}

// 난이도별 추천 전략 가져오기
function getDifficultyStrategy(difficulty) {
  const strategies = {
    easy: {
      title: '초보자 전략',
      tips: [
        '💡 장기 투자 위주로 진행하세요',
        '💡 뉴스를 잘 읽고 힌트를 따라가세요',
        '💡 한 종목에 너무 많이 투자하지 마세요',
        '💡 손실이 나도 파산하지 않으니 여유있게 플레이하세요'
      ]
    },
    normal: {
      title: '중급자 전략',
      tips: [
        '💡 시장 분위기를 파악하고 대응하세요',
        '💡 수수료를 고려한 단타/장타를 선택하세요',
        '💡 포트폴리오를 다양하게 구성하세요',
        '💡 뉴스와 차트를 함께 분석하세요'
      ]
    },
    hard: {
      title: '고급자 전략',
      tips: [
        '💡 변동성이 크므로 리스크 관리가 중요합니다',
        '💡 파산 가능성이 있으니 현금을 항상 확보하세요',
        '💡 모호한 뉴스를 해석하는 능력이 필요합니다',
        '💡 손절/익절 타이밍을 정확히 잡으세요'
      ]
    },
    custom: {
      title: '커스텀 전략',
      tips: [
        '💡 설정한 난이도에 맞게 전략을 조정하세요',
        '💡 변동성과 수수료를 고려하세요'
      ]
    }
  };

  return strategies[difficulty] || strategies.normal;
}
