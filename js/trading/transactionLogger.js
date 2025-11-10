/* ============================================
   Transaction Logger - 거래 기록 시스템
   ============================================ */

// 거래 기록 저장소
const transactionLog = {
  transactions: [],
  maxTransactions: CONFIG.storage.maxTransactions || 500
};

// 거래 기록 추가
function logTransaction(transaction) {
  transactionLog.transactions.unshift(transaction);

  // 최대 개수 제한
  if (transactionLog.transactions.length > transactionLog.maxTransactions) {
    transactionLog.transactions = transactionLog.transactions.slice(0, transactionLog.maxTransactions);
  }

  Utils.log('Transaction logged:', transaction.id);

  // 거래일지 UI 업데이트 (현재 탭이 거래일지인 경우)
  if (gameState.currentTab === 'transactions' && typeof updateTransactionLogUI === 'function') {
    updateTransactionLogUI();
  }

  // 통계 업데이트
  updateTransactionStats(transaction);
}

// 거래 통계 업데이트
function updateTransactionStats(transaction) {
  portfolioStats.totalTrades++;

  if (transaction.type === 'SELL' && transaction.profitLoss) {
    // 수익 거래
    if (transaction.profitLoss > 0) {
      portfolioStats.successfulTrades++;
    }

    // 총 손익
    portfolioStats.totalProfitLoss += transaction.profitLoss;

    // 최대 수익/손실 업데이트
    if (transaction.profitLoss > portfolioStats.biggestWin) {
      portfolioStats.biggestWin = transaction.profitLoss;
    }

    if (transaction.profitLoss < portfolioStats.biggestLoss) {
      portfolioStats.biggestLoss = transaction.profitLoss;
    }
  }

  // 승률 계산
  const sellCount = transactionLog.transactions.filter(t => t.type === 'SELL').length;
  if (sellCount > 0) {
    portfolioStats.winRate = (portfolioStats.successfulTrades / sellCount) * 100;
  }
}

// 모든 거래 기록 가져오기
function getAllTransactions(limit = 100) {
  return transactionLog.transactions.slice(0, limit);
}

// 특정 자산의 거래 기록 가져오기
function getTransactionsByAsset(assetId, limit = 50) {
  return transactionLog.transactions
    .filter(t => t.assetId === assetId)
    .slice(0, limit);
}

// 매수 기록만 가져오기
function getBuyTransactions(limit = 50) {
  return transactionLog.transactions
    .filter(t => t.type === 'BUY')
    .slice(0, limit);
}

// 매도 기록만 가져오기
function getSellTransactions(limit = 50) {
  return transactionLog.transactions
    .filter(t => t.type === 'SELL')
    .slice(0, limit);
}

// 거래일지 UI 업데이트
function updateTransactionLogUI() {
  const transactionsContent = document.getElementById('transactionsContent');

  if (!transactionsContent) return;

  const transactions = getAllTransactions(100);

  if (transactions.length === 0) {
    transactionsContent.innerHTML = `
      <div class="empty-state">
        <p class="empty-message">거래 기록이 없습니다</p>
        <p class="empty-hint">거래를 시작하면 여기에 기록됩니다</p>
      </div>
    `;
    return;
  }

  // 필터 UI
  let html = `
    <div class="transaction-header">
      <h2>거래일지</h2>
      <div class="transaction-filters">
        <select id="transactionTypeFilter" class="filter-select">
          <option value="all">전체</option>
          <option value="BUY">매수만</option>
          <option value="SELL">매도만</option>
        </select>
        <select id="transactionAssetFilter" class="filter-select">
          <option value="all">전체 종목</option>
          <option value="stock">주식만</option>
          <option value="crypto">코인만</option>
        </select>
      </div>
    </div>

    <div class="transaction-stats">
      <div class="stat-card">
        <span class="stat-label">총 거래 수</span>
        <span class="stat-value">${portfolioStats.totalTrades}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">승률</span>
        <span class="stat-value">${portfolioStats.winRate.toFixed(1)}%</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">총 손익</span>
        <span class="stat-value ${portfolioStats.totalProfitLoss >= 0 ? 'profit' : 'loss'}">
          ${Utils.formatCurrency(portfolioStats.totalProfitLoss, 0)}
        </span>
      </div>
      <div class="stat-card">
        <span class="stat-label">최대 수익</span>
        <span class="stat-value profit">${Utils.formatCurrency(portfolioStats.biggestWin, 0)}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">최대 손실</span>
        <span class="stat-value loss">${Utils.formatCurrency(portfolioStats.biggestLoss, 0)}</span>
      </div>
    </div>

    <div class="transaction-list">
  `;

  // 거래 기록 리스트
  transactions.forEach(txn => {
    const isBuy = txn.type === 'BUY';
    const typeClass = isBuy ? 'buy' : 'sell';
    const typeText = isBuy ? '매수' : '매도';
    const typeIcon = isBuy ? '📈' : '📉';

    const profitLossHtml = txn.profitLoss !== undefined ? `
      <div class="transaction-profit ${txn.profitLoss >= 0 ? 'profit' : 'loss'}">
        ${txn.profitLoss >= 0 ? '+' : ''}${Utils.formatCurrency(txn.profitLoss, 0)}
        (${Utils.formatPercent(txn.profitLossPercent || 0)})
      </div>
    ` : '';

    html += `
      <div class="transaction-item ${typeClass}">
        <div class="transaction-icon">${typeIcon}</div>
        <div class="transaction-details">
          <div class="transaction-main">
            <span class="transaction-type ${typeClass}">${typeText}</span>
            <span class="transaction-name">${txn.assetName}</span>
            <span class="transaction-badge ${txn.assetType}">${txn.assetType === 'crypto' ? '코인' : '주식'}</span>
          </div>
          <div class="transaction-info">
            <span>${txn.quantity.toLocaleString()}주 @ ${Utils.formatCurrency(txn.price, 0)}</span>
            <span class="transaction-total">${Utils.formatCurrency(txn.totalAmount, 0)}</span>
            <span class="transaction-fee">수수료: ${Utils.formatCurrency(txn.fee, 0)}</span>
          </div>
          ${profitLossHtml}
          <div class="transaction-time">${Utils.formatDate(txn.timestamp)}</div>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  transactionsContent.innerHTML = html;

  // 필터 이벤트 리스너
  const typeFilter = document.getElementById('transactionTypeFilter');
  const assetFilter = document.getElementById('transactionAssetFilter');

  if (typeFilter) {
    typeFilter.addEventListener('change', filterTransactions);
  }

  if (assetFilter) {
    assetFilter.addEventListener('change', filterTransactions);
  }
}

// 거래 필터링
function filterTransactions() {
  const typeFilter = document.getElementById('transactionTypeFilter')?.value || 'all';
  const assetFilter = document.getElementById('transactionAssetFilter')?.value || 'all';

  let filtered = transactionLog.transactions;

  // 거래 유형 필터
  if (typeFilter !== 'all') {
    filtered = filtered.filter(t => t.type === typeFilter);
  }

  // 자산 유형 필터
  if (assetFilter !== 'all') {
    filtered = filtered.filter(t => t.assetType === assetFilter);
  }

  // 필터링된 리스트 표시
  displayFilteredTransactions(filtered);
}

// 필터링된 거래 표시
function displayFilteredTransactions(transactions) {
  const listContainer = document.querySelector('.transaction-list');

  if (!listContainer) return;

  if (transactions.length === 0) {
    listContainer.innerHTML = '<p class="empty-message">조건에 맞는 거래가 없습니다</p>';
    return;
  }

  let html = '';

  transactions.forEach(txn => {
    const isBuy = txn.type === 'BUY';
    const typeClass = isBuy ? 'buy' : 'sell';
    const typeText = isBuy ? '매수' : '매도';
    const typeIcon = isBuy ? '📈' : '📉';

    const profitLossHtml = txn.profitLoss !== undefined ? `
      <div class="transaction-profit ${txn.profitLoss >= 0 ? 'profit' : 'loss'}">
        ${txn.profitLoss >= 0 ? '+' : ''}${Utils.formatCurrency(txn.profitLoss, 0)}
        (${Utils.formatPercent(txn.profitLossPercent || 0)})
      </div>
    ` : '';

    html += `
      <div class="transaction-item ${typeClass}">
        <div class="transaction-icon">${typeIcon}</div>
        <div class="transaction-details">
          <div class="transaction-main">
            <span class="transaction-type ${typeClass}">${typeText}</span>
            <span class="transaction-name">${txn.assetName}</span>
            <span class="transaction-badge ${txn.assetType}">${txn.assetType === 'crypto' ? '코인' : '주식'}</span>
          </div>
          <div class="transaction-info">
            <span>${txn.quantity.toLocaleString()}주 @ ${Utils.formatCurrency(txn.price, 0)}</span>
            <span class="transaction-total">${Utils.formatCurrency(txn.totalAmount, 0)}</span>
            <span class="transaction-fee">수수료: ${Utils.formatCurrency(txn.fee, 0)}</span>
          </div>
          ${profitLossHtml}
          <div class="transaction-time">${Utils.formatDate(txn.timestamp)}</div>
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = html;
}

// 거래 기록 초기화
function clearTransactionLog() {
  transactionLog.transactions = [];
  portfolioStats.totalTrades = 0;
  portfolioStats.successfulTrades = 0;
  portfolioStats.winRate = 0;
  portfolioStats.totalProfitLoss = 0;
  portfolioStats.biggestWin = 0;
  portfolioStats.biggestLoss = 0;

  Utils.log('Transaction log cleared');
}

// 거래 통계 내보내기
function exportTransactionStats() {
  return {
    totalTrades: portfolioStats.totalTrades,
    successfulTrades: portfolioStats.successfulTrades,
    winRate: portfolioStats.winRate,
    totalProfitLoss: portfolioStats.totalProfitLoss,
    biggestWin: portfolioStats.biggestWin,
    biggestLoss: portfolioStats.biggestLoss,
    transactionCount: transactionLog.transactions.length
  };
}
