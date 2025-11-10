/* ============================================
   News Engine - 뉴스 엔진
   ============================================ */

// 뉴스 엔진 상태
const newsEngine = {
  isRunning: false,
  timer: null,
  activeNews: [], // 현재 활성화된 뉴스
  newsHistory: [], // 뉴스 히스토리
  maxActiveNews: 5, // 최대 활성 뉴스 개수
  newsDuration: 600000 // 뉴스 효과 지속 시간 (10분)
};

// 뉴스 엔진 시작
function startNewsEngine() {
  if (newsEngine.isRunning) {
    Utils.log('News engine already running');
    return;
  }

  Utils.log('Starting news engine...');

  // 초기 뉴스 생성
  generateAndPublishNews();

  // 주기적으로 뉴스 생성
  const interval = (CONFIG.timers.newsGeneration || 600000) / gameState.timeSpeed;

  newsEngine.timer = setInterval(() => {
    if (!gameState.isPaused && gameState.isRunning) {
      generateAndPublishNews();
      cleanupExpiredNews();
    }
  }, interval);

  newsEngine.isRunning = true;
  Utils.log('News engine started');
}

// 뉴스 엔진 중지
function stopNewsEngine() {
  if (newsEngine.timer) {
    clearInterval(newsEngine.timer);
    newsEngine.timer = null;
  }
  newsEngine.isRunning = false;
  Utils.log('News engine stopped');
}

// 뉴스 생성 및 발행
function generateAndPublishNews() {
  // 주식 또는 암호화폐 뉴스 선택 (70% 주식, 30% 암호화폐)
  const isCryptoNews = Math.random() < 0.3;

  // 뉴스 생성
  const news = generateNews(gameState.difficulty, isCryptoNews);

  if (!news) return;

  // 뉴스 ID 부여
  news.id = `news_${Date.now()}_${Utils.randomInt(1000, 9999)}`;
  news.expiresAt = Date.now() + newsEngine.newsDuration;
  news.isActive = true;

  // 활성 뉴스에 추가
  newsEngine.activeNews.push(news);

  // 최대 개수 제한
  if (newsEngine.activeNews.length > newsEngine.maxActiveNews) {
    newsEngine.activeNews.shift(); // 가장 오래된 뉴스 제거
  }

  // 히스토리에 추가
  newsEngine.newsHistory.unshift(news);

  // 히스토리 최대 100개 제한
  if (newsEngine.newsHistory.length > 100) {
    newsEngine.newsHistory = newsEngine.newsHistory.slice(0, 100);
  }

  Utils.log('News published:', news.text, 'Impact:', news.impact, 'Targets:', news.targets);

  // UI 업데이트
  updateNewsTickerUI(news);

  // 중요 뉴스 알림 (영향력이 큰 뉴스)
  if (Math.abs(news.impact) >= 0.08 && CONFIG.notifications.majorNews) {
    showMajorNewsNotification(news);
  }

  // 보유 종목 관련 뉴스 알림
  if (CONFIG.notifications.holdingNews) {
    checkHoldingNewsAlert(news);
  }
}

// 만료된 뉴스 정리
function cleanupExpiredNews() {
  const now = Date.now();

  newsEngine.activeNews = newsEngine.activeNews.filter(news => {
    if (news.expiresAt <= now) {
      news.isActive = false;
      Utils.log('News expired:', news.text);
      return false;
    }
    return true;
  });
}

// 자산에 대한 뉴스 효과 가져오기
function getNewsEffectForAsset(assetId, isCrypto = false) {
  let totalEffect = 0;

  newsEngine.activeNews.forEach(news => {
    if (!news.isActive) return;

    // 뉴스가 해당 자산을 타겟으로 하는지 확인
    if (news.targets && news.targets.includes(assetId)) {
      // 시간에 따라 효과 감소 (선형)
      const elapsed = Date.now() - news.timestamp;
      const remaining = news.expiresAt - Date.now();
      const effectMultiplier = remaining / newsEngine.newsDuration;

      totalEffect += news.impact * effectMultiplier;
    }
  });

  return totalEffect;
}

// 뉴스 티커 UI 업데이트
function updateNewsTickerUI(news) {
  if (typeof updateNewsTicker === 'function') {
    updateNewsTicker(news);
  } else {
    // 기본 구현
    const ticker = document.getElementById('newsTicker');
    if (ticker) {
      // 뉴스 아이템 생성
      const newsItem = document.createElement('span');
      newsItem.className = 'news-item';
      newsItem.textContent = `📰 ${news.text}`;

      // 뉴스 추가
      ticker.innerHTML = '';
      ticker.appendChild(newsItem);

      // 3초 후 스크롤 시작
      setTimeout(() => {
        if (ticker.firstChild === newsItem) {
          newsItem.style.animation = 'ticker-scroll 20s linear infinite';
        }
      }, 3000);
    }
  }
}

// 중요 뉴스 알림
function showMajorNewsNotification(news) {
  if (typeof showNotification === 'function') {
    const isPositive = news.impact > 0;

    showNotification({
      type: isPositive ? 'NEWS_POSITIVE' : 'NEWS_NEGATIVE',
      title: isPositive ? '📈 호재 뉴스' : '📉 악재 뉴스',
      message: news.text,
      duration: 6000
    });
  }
}

// 보유 종목 뉴스 알림 체크
function checkHoldingNewsAlert(news) {
  if (!news.targets) return;

  // 보유 종목 중 뉴스 타겟이 있는지 확인
  for (const assetId of news.targets) {
    if (gameState.holdings[assetId] && gameState.holdings[assetId].quantity > 0) {
      // 보유 종목 관련 뉴스
      const asset = findStock(assetId) || findCrypto(assetId);

      if (asset && typeof showNotification === 'function') {
        const isPositive = news.impact > 0;

        showNotification({
          type: 'HOLDING_NEWS',
          title: `💼 보유 종목: ${asset.nameKo}`,
          message: news.text,
          duration: 5000
        });

        break; // 한 번만 알림
      }
    }
  }
}

// 활성 뉴스 목록 가져오기
function getActiveNews() {
  return newsEngine.activeNews.filter(news => news.isActive);
}

// 뉴스 히스토리 가져오기
function getNewsHistory(limit = 20) {
  return newsEngine.newsHistory.slice(0, limit);
}

// 특정 자산 관련 뉴스 가져오기
function getNewsForAsset(assetId, limit = 10) {
  return newsEngine.newsHistory
    .filter(news => news.targets && news.targets.includes(assetId))
    .slice(0, limit);
}

// 수동으로 뉴스 생성 (디버그/테스트용)
function forceGenerateNews(type = 'random', assetId = null) {
  if (type === 'random') {
    generateAndPublishNews();
  } else {
    // 특정 자산에 대한 뉴스 생성
    const isCrypto = !!findCrypto(assetId);
    const news = generateNews(gameState.difficulty, isCrypto);

    if (assetId && news.targets) {
      news.targets = [assetId];
    }

    news.id = `news_${Date.now()}_${Utils.randomInt(1000, 9999)}`;
    news.expiresAt = Date.now() + newsEngine.newsDuration;
    news.isActive = true;

    newsEngine.activeNews.push(news);
    newsEngine.newsHistory.unshift(news);

    updateNewsTickerUI(news);
  }
}
