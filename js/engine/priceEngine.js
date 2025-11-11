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

// 개별 주식 가격 업데이트 (Geometric Brownian Motion)
function updateStockPrice(stockId) {
  const stock = findStock(stockId);
  if (!stock) return;

  const priceData = stockPrices[stockId];
  if (!priceData) return;

  // === Geometric Brownian Motion 구현 ===
  // dS = μ*S*dt + σ*S*dW
  // S(t+1) = S(t) * exp((μ - σ²/2)*dt + σ*sqrt(dt)*Z)

  const S = priceData.current; // 현재 가격
  const dt = 1 / 360; // 1분 = 1/360일 (하루 6시간 거래 기준)

  // 변동성 (연율화) - 게임성을 위해 3배 증가
  const sigma = stock.volatility * CONFIG.volatility[gameState.difficulty] * 3.0;

  // 드리프트 (연평균 수익률)
  let mu = 0.0; // 기본 드리프트

  // 시장 분위기 영향 (드리프트에 추가)
  const moodEffect = getMarketMoodEffect();
  mu += moodEffect;

  // 섹터 트렌드
  const sectorTrend = getSectorTrend(stock.sector);
  mu += sectorTrend;

  // 뉴스 영향 (강력한 드리프트)
  const newsEffect = getActiveNewsEffect(stockId);
  mu += newsEffect * 5; // 뉴스는 강한 영향

  // 표준정규분포에서 랜덤 샘플 (Box-Muller 변환)
  const Z = generateNormalRandom();

  // GBM 공식 적용
  const drift = (mu - (sigma * sigma) / 2) * dt;
  const diffusion = sigma * Math.sqrt(dt) * Z;
  const newPrice = S * Math.exp(drift + diffusion);

  // 서킷브레이커 (±30% 제한)
  const maxPrice = priceData.open * 1.30;
  const minPrice = priceData.open * 0.70;
  let finalPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

  // 최소 가격 (100원)
  finalPrice = Math.max(100, finalPrice);

  // 일일 최고/최저 업데이트
  priceData.high = Math.max(priceData.high, finalPrice);
  priceData.low = Math.min(priceData.low, finalPrice);

  // 가격 업데이트
  priceData.previous = priceData.current;
  priceData.current = Math.round(finalPrice);
  priceData.change = priceData.current - priceData.open;
  priceData.changePercent = ((priceData.current - priceData.open) / priceData.open) * 100;
  priceData.volume += Utils.randomInt(10000, 50000);
  priceData.lastUpdate = Date.now();

  // OHLC 데이터 업데이트 (분봉)
  updateOHLC(stockId, finalPrice, false);

  // 히스토리 저장
  addPriceHistory(stockId, false);

  // 가격 변동 알림 체크
  checkPriceAlert(stockId, false);
}

// 개별 암호화폐 가격 업데이트 (Geometric Brownian Motion)
function updateCryptoPrice(cryptoId) {
  const crypto = findCrypto(cryptoId);
  if (!crypto) return;

  const priceData = cryptoPrices[cryptoId];
  if (!priceData) return;

  // === Geometric Brownian Motion 구현 ===
  const S = priceData.current;
  const dt = 20 / (360 * 60); // 20초 = 20/(360*60)일

  // 암호화폐는 변동성이 더 높음 - 게임성을 위해 4.5배 증가
  const sigma = crypto.volatility * CONFIG.volatility[gameState.difficulty] * 4.5;

  // 드리프트
  let mu = 0.0;

  // 비트코인 영향 (비트코인이 아닌 경우)
  if (cryptoId !== 'BTC') {
    const btcData = cryptoPrices['BTC'];
    if (btcData && btcData.previous > 0) {
      const btcReturn = (btcData.current - btcData.previous) / btcData.previous;
      mu += btcReturn * 0.6; // BTC 수익률의 60% 영향
    }
  }

  // 뉴스 영향
  const newsEffect = getActiveNewsEffect(cryptoId, true);
  mu += newsEffect * 8; // 암호화폐는 뉴스에 더 민감

  // 표준정규분포 랜덤
  const Z = generateNormalRandom();

  // GBM 공식
  const drift = (mu - (sigma * sigma) / 2) * dt;
  const diffusion = sigma * Math.sqrt(dt) * Z;
  const newPrice = S * Math.exp(drift + diffusion);

  // 서킷브레이커 (±50% - 암호화폐는 더 넓게)
  const maxPrice = priceData.open * 1.50;
  const minPrice = priceData.open * 0.50;
  let finalPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

  // 최소 가격 (초기 가격의 1%)
  const absoluteMin = crypto.initialPrice * 0.01;
  finalPrice = Math.max(absoluteMin, finalPrice);

  // 일일 최고/최저 업데이트
  priceData.high = Math.max(priceData.high, finalPrice);
  priceData.low = Math.min(priceData.low, finalPrice);

  // 가격 업데이트
  priceData.previous = priceData.current;
  priceData.current = Math.round(finalPrice);
  priceData.change = priceData.current - priceData.open;
  priceData.changePercent = ((priceData.current - priceData.open) / priceData.open) * 100;
  priceData.volume += Utils.randomInt(1000, 10000);
  priceData.lastUpdate = Date.now();

  // OHLC 데이터 업데이트 (20초봉)
  updateOHLC(cryptoId, finalPrice, true);

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

// ===== 헬퍼 함수 =====

// 표준정규분포 랜덤 생성 (Box-Muller 변환)
function generateNormalRandom() {
  // Box-Muller 변환으로 N(0,1) 생성
  let u1, u2;
  do {
    u1 = Math.random();
  } while (u1 === 0); // u1이 0이면 log(0) = -∞이므로 제외

  u2 = Math.random();

  // Box-Muller 공식
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  // const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2); // 두 번째 값도 사용 가능

  return z0;
}

// OHLC 데이터 저장소
const ohlcData = {
  stocks: {}, // { stockId: [{ timestamp, open, high, low, close, volume }, ...] }
  crypto: {}  // { cryptoId: [{ timestamp, open, high, low, close, volume }, ...] }
};

// OHLC 캔들 간격 (밀리초)
const CANDLE_INTERVAL = {
  stock: 60000,  // 1분
  crypto: 20000  // 20초
};

// 현재 캔들 임시 저장소
const currentCandle = {
  stocks: {},
  crypto: {}
};

// OHLC 데이터 업데이트
function updateOHLC(assetId, price, isCrypto = false) {
  const type = isCrypto ? 'crypto' : 'stocks';
  const interval = isCrypto ? CANDLE_INTERVAL.crypto : CANDLE_INTERVAL.stock;
  const now = Date.now();

  // OHLC 저장소 초기화
  if (!ohlcData[type][assetId]) {
    ohlcData[type][assetId] = [];
  }

  // 현재 캔들 초기화
  if (!currentCandle[type][assetId]) {
    currentCandle[type][assetId] = {
      timestamp: now,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 0
    };
  }

  const candle = currentCandle[type][assetId];
  const priceData = isCrypto ? cryptoPrices[assetId] : stockPrices[assetId];

  // 새로운 캔들 시작 시간인지 확인
  if (now - candle.timestamp >= interval) {
    // 이전 캔들을 저장
    ohlcData[type][assetId].push({ ...candle });

    // 최대 캔들 개수 제한 (1000개)
    if (ohlcData[type][assetId].length > 1000) {
      ohlcData[type][assetId] = ohlcData[type][assetId].slice(-1000);
    }

    // 새 캔들 시작
    currentCandle[type][assetId] = {
      timestamp: now,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: priceData.volume
    };
  } else {
    // 현재 캔들 업데이트
    candle.high = Math.max(candle.high, price);
    candle.low = Math.min(candle.low, price);
    candle.close = price;
    candle.volume = priceData.volume;
  }
}

// OHLC 데이터 가져오기
function getOHLCData(assetId, isCrypto = false, limit = 100) {
  const type = isCrypto ? 'crypto' : 'stocks';
  const data = ohlcData[type][assetId] || [];
  return data.slice(-limit);
}

// 일일 시가 리셋 (새로운 거래일 시작)
function resetDailyPrices() {
  // 주식 시가 리셋
  STOCKS.forEach(stock => {
    const priceData = stockPrices[stock.id];
    if (priceData) {
      priceData.open = priceData.current;
      priceData.high = priceData.current;
      priceData.low = priceData.current;
      priceData.change = 0;
      priceData.changePercent = 0;
      priceData.volume = 0;
    }
  });

  // 암호화폐 시가 리셋
  CRYPTO.forEach(crypto => {
    const priceData = cryptoPrices[crypto.id];
    if (priceData) {
      priceData.open = priceData.current;
      priceData.high = priceData.current;
      priceData.low = priceData.current;
      priceData.change = 0;
      priceData.changePercent = 0;
      priceData.volume = 0;
    }
  });

  Utils.log('Daily prices reset');
}
