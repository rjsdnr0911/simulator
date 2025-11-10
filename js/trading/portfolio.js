/* ============================================
   Portfolio - 포트폴리오 관리
   ============================================ */

// 포트폴리오 통계
const portfolioStats = {
  totalTrades: 0,
  successfulTrades: 0,
  winRate: 0,
  totalProfitLoss: 0,
  biggestWin: 0,
  biggestLoss: 0,
  favoriteAsset: null
};

// 포트폴리오 UI 업데이트
function updatePortfolioUI() {
  const portfolioContent = document.getElementById('portfolioContent');

  if (!portfolioContent) return;

  const holdings = getAllHoldings();

  if (holdings.length === 0) {
    portfolioContent.innerHTML = `
      <div class="empty-state">
        <p class="empty-message">보유 중인 종목이 없습니다</p>
        <p class="empty-hint">주식 또는 코인 탭에서 종목을 매수해보세요!</p>
      </div>
    `;
    return;
  }

  // 포트폴리오 헤더
  let html = `
    <div class="portfolio-header">
      <h2>보유 종목</h2>
      <div class="portfolio-summary">
        <div class="summary-item">
          <span class="summary-label">총 평가액</span>
          <span class="summary-value">${Utils.formatCurrency(gameState.stockValue, 0)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">총 손익</span>
          <span class="summary-value ${gameState.stockValue - calculateTotalInvested() >= 0 ? 'profit' : 'loss'}">
            ${Utils.formatCurrency(gameState.stockValue - calculateTotalInvested(), 0)}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">수익률</span>
          <span class="summary-value ${gameState.stockValue - calculateTotalInvested() >= 0 ? 'profit' : 'loss'}">
            ${Utils.formatPercent(((gameState.stockValue - calculateTotalInvested()) / calculateTotalInvested()) * 100)}
          </span>
        </div>
      </div>
    </div>

    <div class="portfolio-list">
  `;

  // 보유 종목 리스트
  holdings.forEach(item => {
    const { asset, holding, currentPrice, currentValue, profitLoss, profitLossPercent, isCrypto } = item;

    const isProfitable = profitLoss >= 0;

    html += `
      <div class="portfolio-item">
        <div class="portfolio-item-header">
          <div class="portfolio-item-info">
            <h3 class="portfolio-item-name">${asset.nameKo}</h3>
            <span class="portfolio-item-symbol">${asset.symbol}</span>
            <span class="portfolio-item-badge ${isCrypto ? 'crypto' : 'stock'}">
              ${isCrypto ? '코인' : '주식'}
            </span>
          </div>
          <button class="btn btn-danger btn-small" onclick="handleSellAll('${item.assetId}', ${isCrypto})">
            전량 매도
          </button>
        </div>

        <div class="portfolio-item-stats">
          <div class="stat-row">
            <span class="stat-label">보유 수량</span>
            <span class="stat-value">${holding.quantity.toLocaleString()}주</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">평균 단가</span>
            <span class="stat-value">${Utils.formatCurrency(holding.avgPrice, 0)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">현재가</span>
            <span class="stat-value">${Utils.formatCurrency(currentPrice, 0)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">평가액</span>
            <span class="stat-value">${Utils.formatCurrency(currentValue, 0)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">손익</span>
            <span class="stat-value ${isProfitable ? 'profit' : 'loss'}">
              ${Utils.formatCurrency(profitLoss, 0)} (${Utils.formatPercent(profitLossPercent)})
            </span>
          </div>
        </div>

        <div class="portfolio-item-actions">
          <button class="btn btn-secondary btn-small" onclick="showTradeModal('${item.assetId}', ${isCrypto}, 'sell')">
            매도
          </button>
          <button class="btn btn-secondary btn-small" onclick="showAssetDetail('${item.assetId}', ${isCrypto})">
            상세보기
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  portfolioContent.innerHTML = html;
}

// 총 투자금 계산
function calculateTotalInvested() {
  let total = 0;

  for (const assetId in gameState.holdings) {
    const holding = gameState.holdings[assetId];
    if (holding && holding.quantity > 0) {
      total += holding.avgPrice * holding.quantity;
    }
  }

  return total;
}

// 전량 매도 핸들러
window.handleSellAll = function(assetId, isCrypto) {
  const asset = isCrypto ? findCrypto(assetId) : findStock(assetId);

  if (!asset) return;

  const holding = gameState.holdings[assetId];

  if (!holding) return;

  // 확인 다이얼로그
  const confirmed = confirm(
    `${asset.nameKo} ${holding.quantity}주를 전량 매도하시겠습니까?`
  );

  if (confirmed) {
    sellAllHolding(assetId, isCrypto);
  }
};

// 자산 상세 보기
window.showAssetDetail = function(assetId, isCrypto) {
  gameState.selectedStock = assetId;
  gameState.selectedType = isCrypto ? 'crypto' : 'stock';

  // 해당 탭으로 전환
  const tabName = isCrypto ? 'crypto' : 'stocks';
  switchTab(tabName);

  // 상세 정보 업데이트
  if (typeof updateStockDetailUI === 'function') {
    updateStockDetailUI(assetId);
  }
};

// 포트폴리오 통계 계산
function calculatePortfolioStats() {
  const holdings = getAllHoldings();

  // 총 평가액 대비 비율 계산
  const totalValue = gameState.stockValue;

  const stats = holdings.map(item => {
    const weight = (item.currentValue / totalValue) * 100;

    return {
      assetId: item.assetId,
      assetName: item.asset.nameKo,
      weight: weight,
      value: item.currentValue,
      profitLoss: item.profitLoss,
      profitLossPercent: item.profitLossPercent
    };
  });

  return stats;
}

// 포트폴리오 다양성 점수 계산 (0-100)
function calculateDiversificationScore() {
  const holdings = getAllHoldings();

  if (holdings.length === 0) return 0;

  const stats = calculatePortfolioStats();

  // 허핀달 지수 (Herfindahl Index) 사용
  // HHI = sum of (weight^2)
  // 낮을수록 분산되어 있음 (좋음)

  let hhi = 0;
  stats.forEach(stat => {
    const weight = stat.weight / 100; // 0-1 범위로 변환
    hhi += weight * weight;
  });

  // HHI를 0-100 점수로 변환 (낮을수록 좋으므로 반전)
  // HHI 범위: 1/n (완전 분산) ~ 1 (완전 집중)
  // 점수: 100 (완전 분산) ~ 0 (완전 집중)

  const maxHHI = 1;
  const minHHI = 1 / holdings.length;

  const score = ((maxHHI - hhi) / (maxHHI - minHHI)) * 100;

  return Math.max(0, Math.min(100, score));
}

// 포트폴리오 리스크 레벨 계산
function calculatePortfolioRisk() {
  const holdings = getAllHoldings();

  if (holdings.length === 0) return 'NONE';

  // 변동성 가중 평균 계산
  let totalVolatility = 0;
  let totalWeight = 0;

  holdings.forEach(item => {
    const asset = item.asset;
    const weight = item.currentValue / gameState.stockValue;

    const assetVolatility = asset.volatility || 1.0;

    totalVolatility += assetVolatility * weight;
    totalWeight += weight;
  });

  const avgVolatility = totalVolatility / totalWeight;

  // 리스크 레벨 분류
  if (avgVolatility < 0.7) {
    return 'LOW';
  } else if (avgVolatility < 1.2) {
    return 'MEDIUM';
  } else if (avgVolatility < 2.0) {
    return 'HIGH';
  } else {
    return 'VERY_HIGH';
  }
}

// 추천 행동 제안
function getPortfolioRecommendations() {
  const holdings = getAllHoldings();
  const recommendations = [];

  if (holdings.length === 0) {
    recommendations.push({
      type: 'INFO',
      message: '포트폴리오가 비어있습니다. 투자를 시작해보세요!'
    });
    return recommendations;
  }

  // 다양성 체크
  const diversificationScore = calculateDiversificationScore();

  if (diversificationScore < 30 && holdings.length < 3) {
    recommendations.push({
      type: 'WARNING',
      message: '포트폴리오가 집중되어 있습니다. 다양한 종목에 분산 투자를 고려하세요.'
    });
  }

  // 손실 종목 체크
  const losingHoldings = holdings.filter(h => h.profitLoss < 0);

  if (losingHoldings.length > holdings.length * 0.7) {
    recommendations.push({
      type: 'DANGER',
      message: '대부분의 보유 종목이 손실 상태입니다. 손절 또는 추가 매수를 고려하세요.'
    });
  }

  // 큰 수익 종목 체크
  const bigWinners = holdings.filter(h => h.profitLossPercent > 20);

  if (bigWinners.length > 0) {
    recommendations.push({
      type: 'SUCCESS',
      message: `${bigWinners.length}개 종목이 20% 이상 수익 중입니다. 익절을 고려해보세요.`
    });
  }

  // 현금 비율 체크
  const cashRatio = (gameState.cash / gameState.totalAssets) * 100;

  if (cashRatio < 10) {
    recommendations.push({
      type: 'WARNING',
      message: '현금 비율이 낮습니다. 급격한 하락 시 대응이 어려울 수 있습니다.'
    });
  } else if (cashRatio > 70) {
    recommendations.push({
      type: 'INFO',
      message: '현금 비율이 높습니다. 투자 기회를 찾아보세요.'
    });
  }

  return recommendations;
}
