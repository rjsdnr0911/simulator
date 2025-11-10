/* ============================================
   Dashboard - 대시보드 UI
   ============================================ */

// 대시보드 업데이트 (main.js의 updateDashboard를 확장)
function updateDashboardExtended() {
  updateDashboard(); // 기본 업데이트 호출

  // 추가 정보 업데이트
  updateAssetDistribution();
  updatePerformanceIndicators();
}

// 자산 분포 업데이트
function updateAssetDistribution() {
  const cashRatio = (gameState.cash / gameState.totalAssets) * 100;
  const stockRatio = (gameState.stockValue / gameState.totalAssets) * 100;

  // 자산 분포 표시 (선택사항)
  Utils.log('Asset distribution - Cash:', cashRatio.toFixed(1) + '%', 'Stock:', stockRatio.toFixed(1) + '%');
}

// 성능 지표 업데이트
function updatePerformanceIndicators() {
  const profitRate = gameState.profitRate || 0;

  // 수익률에 따른 색상 변경
  const profitRateDisplay = document.getElementById('profitRateDisplay');
  if (profitRateDisplay) {
    if (profitRate > 0) {
      profitRateDisplay.className = 'asset-value profit';
    } else if (profitRate < 0) {
      profitRateDisplay.className = 'asset-value loss';
    } else {
      profitRateDisplay.className = 'asset-value';
    }
  }
}
