/* ============================================
   Chart UI - 차트 UI
   ============================================ */

let currentChart = null;

// 가격 차트 렌더링
function renderPriceChart(assetId, isCrypto = false) {
  const chartContainer = document.getElementById(`priceChart-${assetId}`);

  if (!chartContainer) return;

  // 기존 차트 제거
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }

  // 캔버스 생성
  chartContainer.innerHTML = '<canvas id="chartCanvas"></canvas>';
  const canvas = document.getElementById('chartCanvas');

  if (!canvas) return;

  // 히스토리 데이터 가져오기
  const history = isCrypto
    ? getCryptoHistory(assetId, CONFIG.chart.maxDataPoints)
    : getStockHistory(assetId, CONFIG.chart.maxDataPoints);

  if (!history || history.length === 0) {
    chartContainer.innerHTML = '<p class="empty-message">차트 데이터가 없습니다</p>';
    return;
  }

  // 데이터 준비
  const labels = history.map(h => new Date(h.timestamp).toLocaleTimeString('ko-KR'));
  const prices = history.map(h => h.price);
  const volumes = history.map(h => h.volume);

  // Chart.js 설정
  const ctx = canvas.getContext('2d');

  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '가격',
        data: prices,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: CONFIG.chart.updateAnimation,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return Utils.formatCurrency(context.parsed.y, 0);
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          }
        },
        y: {
          display: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return Utils.formatLargeNumber(value);
            }
          }
        }
      }
    }
  });
}
