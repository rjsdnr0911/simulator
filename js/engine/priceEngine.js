/* ============================================
   Price Engine - 가격 변동 엔진
   ============================================ */

// 가격 변동 엔진 상태
const priceEngine = {
  isRunning: false,
  stockTimer: null,
  cryptoTimer: null,
  lastStockUpdate: 0,
  lastCryptoUpdate: 0
};

// 가격 엔진 시작
function startPriceEngine() {
  if (priceEngine.isRunning) {
    Utils.log('Price engine already running');
    return;
  }

  Utils.log('Starting price engine...');

  // 주식 데이터 초기화
  initializeStockData();

  // 주식 가격 업데이트 타이머
  const stockInterval = CONFIG.timers.stockUpdate / gameState.timeSpeed;
  priceEngine.stockTimer = setInterval(() => {
    if (!gameState.isPaused && gameState.isRunning) {
      updateAllStockPrices();
    }
  }, stockInterval);

  // 암호화폐 가격 업데이트 타이머 (더 빠름)
  const cryptoInterval = CONFIG.timers.cryptoUpdate / gameState.timeSpeed;
  priceEngine.cryptoTimer = setInterval(() => {
    if (!gameState.isPaused && gameState.isRunning) {
      updateAllCryptoPrices();
    }
  }, cryptoInterval);

  priceEngine.isRunning = true;
  Utils.log('Price engine started');
}

// 가격 엔진 중지
function stopPriceEngine() {
  if (!priceEngine.isRunning) return;

  clearInterval(priceEngine.stockTimer);
  clearInterval(priceEngine.cryptoTimer);
  priceEngine.isRunning = false;

  Utils.log('Price engine stopped');
}

// 모든 주식 가격 업데이트
function updateAllStockPrices() {
  STOCKS.forEach(stock => {
    updateStockPrice(stock.id);
  });

  priceEngine.lastStockUpdate = Date.now();

  // UI 업데이트
  if (gameState.currentTab === 'stocks') {
    updateStockListUI();
  }

  // 선택된 종목이 있으면 상세 정보 업데이트
  if (gameState.selectedStock && gameState.selectedType === 'stock') {
    updateStockDetailUI(gameState.selectedStock);
  }

  // 포트폴리오 업데이트
  updatePortfolioValue();
}

// 모든 암호화폐 가격 업데이트
function updateAllCryptoPrices() {
  CRYPTO.forEach(crypto => {
    updateCryptoPrice(crypto.id);
  });

  priceEngine.lastCryptoUpdate = Date.now();

  // UI 업데이트
  if (gameState.currentTab === 'crypto') {
    updateCryptoListUI();
  }

  // 선택된 코인이 있으면 상세 정보 업데이트
  if (gameState.selectedStock && gameState.selectedType === 'crypto') {
    updateStockDetailUI(gameState.selectedStock);
  }

  // 포트폴리오 업데이트
  updatePortfolioValue();
}

// 개별 주식 가격 업데이트
function updateStockPrice(stockId) {
  const stock = findStock(stockId);
  if (!stock) return;

  const priceData = stockPrices[stockId];
  if (!priceData) return;

  // 기본 변동률 계산 (랜덤 워크)
  const baseVolatility = stock.volatility * CONFIG.volatility[gameState.difficulty];
  let changePercent = Utils.randomFloat(-baseVolatility, baseVolatility);

  // 시장 분위기 영향
  const moodEffect = getMarketMoodEffect();
  changePercent += moodEffect * 0.3;

  // 섹터별 영향 (시장 전체 트렌드)
  const sectorTrend = getSectorTrend(stock.sector);
  changePercent += sectorTrend;

  // 뉴스 영향 적용
  const newsEffect = getActiveNewsEffect(stockId);
  changePercent += newsEffect;

  // 가격 계산
  const change = priceData.current * (changePercent / 100);
  let newPrice = priceData.current + change;

  // 최소 가격 (100원)
  newPrice = Math.max(100, newPrice);

  // 일일 최고/최저 업데이트
  priceData.high = Math.max(priceData.high, newPrice);
  priceData.low = Math.min(priceData.low, newPrice);

  // 가격 업데이트
  priceData.previous = priceData.current;
  priceData.current = Math.round(newPrice);
  priceData.change = priceData.current - priceData.open;
  priceData.changePercent = ((priceData.current - priceData.open) / priceData.open) * 100;
  priceData.volume += Utils.randomInt(10000, 50000);
  priceData.lastUpdate = Date.now();

  // 히스토리 저장
  addPriceHistory(stockId, false);

  // 가격 변동 알림 체크
  checkPriceAlert(stockId, false);
}

// 개별 암호화폐 가격 업데이트
function updateCryptoPrice(cryptoId) {
  const crypto = findCrypto(cryptoId);
  if (!crypto) return;

  const priceData = cryptoPrices[cryptoId];
  if (!priceData) return;

  // 암호화폐는 변동성이 더 높음
  const baseVolatility = crypto.volatility * CONFIG.volatility[gameState.difficulty];
  let changePercent = Utils.randomFloat(-baseVolatility, baseVolatility);

  // 비트코인 영향 (비트코인이 아닌 경우)
  if (cryptoId !== 'BTC') {
    const btcData = cryptoPrices['BTC'];
    if (btcData) {
      const btcChange = ((btcData.current - btcData.previous) / btcData.previous) * 100;
      changePercent += btcChange * 0.4; // BTC 변동의 40% 영향
    }
  }

  // 뉴스 영향
  const newsEffect = getActiveNewsEffect(cryptoId, true);
  changePercent += newsEffect;

  // 가격 계산
  const change = priceData.current * (changePercent / 100);
  let newPrice = priceData.current + change;

  // 최소 가격
  const minPrice = crypto.initialPrice * 0.01; // 초기 가격의 1%
  newPrice = Math.max(minPrice, newPrice);

  // 일일 최고/최저 업데이트
  priceData.high = Math.max(priceData.high, newPrice);
  priceData.low = Math.min(priceData.low, newPrice);

  // 가격 업데이트
  priceData.previous = priceData.current;
  priceData.current = Math.round(newPrice);
  priceData.change = priceData.current - priceData.open;
  priceData.changePercent = ((priceData.current - priceData.open) / priceData.open) * 100;
  priceData.volume += Utils.randomInt(1000, 10000);
  priceData.lastUpdate = Date.now();

  // 히스토리 저장
  addPriceHistory(cryptoId, true);

  // 가격 변동 알림 체크
  checkPriceAlert(cryptoId, true);
}

// 가격 히스토리 추가
function addPriceHistory(assetId, isCrypto = false) {
  const history = isCrypto ? cryptoHistory : stockHistory;
  const priceData = isCrypto ? cryptoPrices[assetId] : stockPrices[assetId];

  if (!history[assetId]) {
    history[assetId] = [];
  }

  history[assetId].push({
    timestamp: Date.now(),
    price: priceData.current,
    volume: priceData.volume
  });

  // 최대 데이터 포인트 제한
  const maxPoints = CONFIG.chart.maxDataPoints * 2; // 여유있게 저장
  if (history[assetId].length > maxPoints) {
    history[assetId] = history[assetId].slice(-maxPoints);
  }
}

// 섹터 트렌드 가져오기 (간단한 구현)
function getSectorTrend(sector) {
  // 랜덤하게 섹터 트렌드 생성 (-0.2% ~ +0.2%)
  return Utils.randomFloat(-0.2, 0.2);
}

// 활성 뉴스 영향 가져오기
function getActiveNewsEffect(assetId, isCrypto = false) {
  // newsEngine에서 관리되는 활성 뉴스 효과 가져오기
  if (typeof getNewsEffectForAsset === 'function') {
    return getNewsEffectForAsset(assetId, isCrypto);
  }
  return 0;
}

// 가격 변동 알림 체크
function checkPriceAlert(assetId, isCrypto = false) {
  const priceData = isCrypto ? cryptoPrices[assetId] : stockPrices[assetId];
  const changePercent = Math.abs(priceData.changePercent);

  // 보유 종목인지 확인
  const isHolding = gameState.holdings[assetId] && gameState.holdings[assetId].quantity > 0;

  if (!CONFIG.notifications.holdingNews && isHolding) return;

  // ±10% 변동
  if (changePercent >= 10 && CONFIG.notifications.priceAlert10) {
    const asset = isCrypto ? findCrypto(assetId) : findStock(assetId);
    if (asset && typeof showNotification === 'function') {
      showNotification({
        type: priceData.changePercent > 0 ? 'PRICE_SURGE' : 'PRICE_DROP',
        title: `${asset.nameKo} ${priceData.changePercent > 0 ? '급등' : '급락'}!`,
        message: `${Utils.formatPercent(priceData.changePercent)} 변동`,
        duration: 5000
      });
    }
  }
  // ±5% 변동
  else if (changePercent >= 5 && CONFIG.notifications.priceAlert5) {
    const asset = isCrypto ? findCrypto(assetId) : findStock(assetId);
    if (asset && isHolding && typeof showNotification === 'function') {
      showNotification({
        type: 'PRICE_CHANGE',
        title: `${asset.nameKo} 가격 변동`,
        message: `${Utils.formatPercent(priceData.changePercent)}`,
        duration: 3000
      });
    }
  }
}

// 포트폴리오 가치 업데이트
function updatePortfolioValue() {
  let stockValue = 0;

  // 모든 보유 종목의 가치 계산
  for (const assetId in gameState.holdings) {
    const holding = gameState.holdings[assetId];
    if (!holding || holding.quantity <= 0) continue;

    // 주식인지 암호화폐인지 확인
    const stockPrice = stockPrices[assetId];
    const cryptoPrice = cryptoPrices[assetId];

    if (stockPrice) {
      stockValue += stockPrice.current * holding.quantity;
    } else if (cryptoPrice) {
      stockValue += cryptoPrice.current * holding.quantity;
    }
  }

  gameState.stockValue = stockValue;
  gameState.totalAssets = gameState.cash + stockValue;

  // 최고 자산 갱신
  if (gameState.totalAssets > gameState.maxAssets) {
    gameState.maxAssets = gameState.totalAssets;

    // 마일스톤 체크
    checkAssetMilestone();
  }

  // 손익률 계산
  const initialCash = CONFIG.initialCash[gameState.difficulty];
  gameState.profitRate = ((gameState.totalAssets - initialCash) / initialCash) * 100;

  // 대시보드 업데이트
  if (typeof updateDashboard === 'function') {
    updateDashboard();
  }

  // 파산 체크
  if (CONFIG.bankruptcyEnabled[gameState.difficulty]) {
    checkBankruptcy();
  }
}

// 자산 마일스톤 체크
function checkAssetMilestone() {
  if (!CONFIG.notifications.assetMilestone) return;

  for (const milestone of CONFIG.assetMilestones) {
    if (gameState.totalAssets >= milestone && gameState.totalAssets - milestone < 1000000) {
      if (typeof showNotification === 'function') {
        showNotification({
          type: 'ASSET_MILESTONE',
          title: '🎉 목표 달성!',
          message: `총 자산 ${Utils.formatLargeNumber(milestone)} 달성!`,
          duration: 5000
        });
      }
      break;
    }
  }
}

// 파산 체크
function checkBankruptcy() {
  // 현금이 음수이고 보유 자산도 부족한 경우
  if (gameState.cash < 0 && gameState.totalAssets < 100000) {
    if (typeof handleBankruptcy === 'function') {
      handleBankruptcy();
    } else {
      Utils.log('Bankruptcy detected');
      alert('파산했습니다! 게임이 종료됩니다.');
      gameState.isRunning = false;
      stopPriceEngine();
    }
  }
}

// 타이머 속도 변경
function updatePriceEngineSpeed(newSpeed) {
  if (priceEngine.isRunning) {
    stopPriceEngine();
    gameState.timeSpeed = newSpeed;
    startPriceEngine();
  } else {
    gameState.timeSpeed = newSpeed;
  }
}
