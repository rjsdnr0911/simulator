/* ============================================
   Statistics - 통계 UI
   ============================================ */

// 통계 UI 업데이트
function updateStatisticsUI() {
  const statsContent = document.getElementById('statisticsContent');

  if (!statsContent) return;

  const stats = exportTransactionStats();
  const portfolioRisk = calculatePortfolioRisk();
  const diversificationScore = calculateDiversificationScore();

  statsContent.innerHTML = `
    <div class="statistics-container">
      <h2>거래 통계</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">총 거래 수</div>
          <div class="stat-value">${stats.totalTrades}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">승률</div>
          <div class="stat-value">${stats.winRate.toFixed(1)}%</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">총 손익</div>
          <div class="stat-value ${stats.totalProfitLoss >= 0 ? 'profit' : 'loss'}">
            ${Utils.formatCurrency(stats.totalProfitLoss, 0)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">다양성 점수</div>
          <div class="stat-value">${diversificationScore.toFixed(0)}/100</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">포트폴리오 리스크</div>
          <div class="stat-value">${portfolioRisk}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">플레이 시간</div>
          <div class="stat-value">${getFormattedPlayTime()}</div>
        </div>
      </div>

      <h3>추천 사항</h3>
      <div class="recommendations">
        ${getPortfolioRecommendations().map(rec => `
          <div class="recommendation ${rec.type.toLowerCase()}">
            ${rec.message}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
