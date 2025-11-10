/* ============================================
   Time Manager - 시간 관리 시스템
   ============================================ */

const timeManager = {
  startTime: 0,
  pausedTime: 0,
  totalPausedDuration: 0,
  isRunning: false,
  timer: null
};

// 시간 관리 시작
function startTimeManager() {
  if (timeManager.isRunning) {
    Utils.log('Time manager already running');
    return;
  }

  Utils.log('Starting time manager...');

  timeManager.startTime = Date.now();
  timeManager.isRunning = true;

  // 1초마다 게임 시간 업데이트
  timeManager.timer = setInterval(() => {
    if (gameState.isRunning && !gameState.isPaused) {
      // 게임 시간 증가 (배속 적용)
      gameState.gameTime += gameState.timeSpeed;

      // 실제 플레이 시간 증가
      gameState.playTime += 1;

      // 시장 분위기 지속 시간 업데이트
      if (typeof updateMarketMoodDuration === 'function') {
        updateMarketMoodDuration();
      }

      // 대시보드 시간 표시 업데이트
      updateGameTimeDisplay();

      // 시장 개장/폐장 체크 (실제 시간 모드)
      if (gameState.marketHours === 'real') {
        checkMarketHours();
      }
    }
  }, 1000);

  Utils.log('Time manager started');
}

// 시간 관리 중지
function stopTimeManager() {
  if (timeManager.timer) {
    clearInterval(timeManager.timer);
    timeManager.timer = null;
  }
  timeManager.isRunning = false;
  Utils.log('Time manager stopped');
}

// 게임 시간 표시 업데이트
function updateGameTimeDisplay() {
  const timeDisplay = document.getElementById('gameTimeDisplay');
  if (timeDisplay) {
    timeDisplay.textContent = Utils.formatTime(gameState.gameTime);
  }
}

// 시장 개장 시간 체크 (실제 시간 모드)
function checkMarketHours() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 한국 주식시장: 09:00 - 15:30
  const marketOpen = hours === 9 && minutes === 0;
  const marketClose = hours === 15 && minutes === 30;

  const currentTime = hours * 60 + minutes;
  const openTime = 9 * 60; // 09:00
  const closeTime = 15 * 60 + 30; // 15:30

  const isMarketOpen = currentTime >= openTime && currentTime < closeTime;

  if (marketOpen && typeof showNotification === 'function') {
    showNotification({
      type: 'MARKET_OPEN',
      title: '🔔 장 시작',
      message: '주식 시장이 개장했습니다!',
      duration: 4000
    });
  } else if (marketClose && typeof showNotification === 'function') {
    showNotification({
      type: 'MARKET_CLOSE',
      title: '🔔 장 마감',
      message: '주식 시장이 폐장했습니다.',
      duration: 4000
    });

    // 일일 시세 리셋
    resetDailyPrices();
  }

  // 장외 시간에는 주식 가격 업데이트 중지
  // (암호화폐는 24시간 거래)
  if (!isMarketOpen && priceEngine.stockTimer) {
    // 주식 타이머만 일시 중지 로직 (선택사항)
  }
}

// 일일 시세 리셋
function resetDailyPrices() {
  // 주식 시가/고가/저가 리셋
  STOCKS.forEach(stock => {
    const priceData = stockPrices[stock.id];
    if (priceData) {
      priceData.open = priceData.current;
      priceData.high = priceData.current;
      priceData.low = priceData.current;
      priceData.volume = 0;
    }
  });

  Utils.log('Daily prices reset');
}

// 게임 일시정지
function pauseGame() {
  if (gameState.isPaused) return;

  gameState.isPaused = true;
  timeManager.pausedTime = Date.now();

  Utils.log('Game paused');
}

// 게임 재개
function resumeGame() {
  if (!gameState.isPaused) return;

  gameState.isPaused = false;

  const pauseDuration = Date.now() - timeManager.pausedTime;
  timeManager.totalPausedDuration += pauseDuration;

  Utils.log('Game resumed after', pauseDuration, 'ms');
}

// 총 플레이 시간 가져오기 (밀리초)
function getTotalPlayTime() {
  if (!timeManager.startTime) return 0;

  const now = Date.now();
  const totalElapsed = now - timeManager.startTime;
  const actualPlayTime = totalElapsed - timeManager.totalPausedDuration;

  return actualPlayTime;
}

// 플레이 시간 포맷 (사람이 읽기 쉬운 형식)
function getFormattedPlayTime() {
  const playTimeMs = getTotalPlayTime();
  return Utils.formatDuration(playTimeMs);
}

// 게임 시간 가져오기 (초)
function getGameTime() {
  return gameState.gameTime;
}

// 게임 시간 포맷
function getFormattedGameTime() {
  return Utils.formatTime(gameState.gameTime);
}

// 시간 배속 변경
function setTimeSpeed(speed) {
  const oldSpeed = gameState.timeSpeed;

  if (speed === oldSpeed) return;

  gameState.timeSpeed = speed;

  // 가격 엔진 속도 업데이트
  if (typeof updatePriceEngineSpeed === 'function') {
    updatePriceEngineSpeed(speed);
  }

  // 뉴스 엔진 재시작 (배속 적용)
  if (newsEngine.isRunning) {
    stopNewsEngine();
    startNewsEngine();
  }

  // 시장 분위기 시스템 재시작
  if (marketMood.timer) {
    stopMarketMoodSystem();
    startMarketMoodSystem();
  }

  Utils.log('Time speed changed:', oldSpeed, '->', speed);

  if (typeof showNotification === 'function') {
    showNotification({
      type: 'SETTING_CHANGE',
      title: '⏱️ 시간 배속 변경',
      message: `${speed}배속으로 변경되었습니다`,
      duration: 2000
    });
  }
}
