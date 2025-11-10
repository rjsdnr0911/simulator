/* ============================================
   Stock List UI - 종목 리스트 UI
   ============================================ */

// 주식 리스트 UI 업데이트
function updateStockListUI() {
  const stockListElement = document.getElementById('stockList');

  if (!stockListElement) return;

  // 필터 및 정렬 적용
  const searchTerm = document.getElementById('stockSearch')?.value.toLowerCase() || '';
  const sector = document.getElementById('sectorFilter')?.value || 'all';
  const sortBy = document.getElementById('sortBy')?.value || 'name';

  // 종목 필터링
  let filteredStocks = STOCKS.filter(stock => {
    const matchesSearch = stock.nameKo.toLowerCase().includes(searchTerm) ||
                         stock.symbol.toLowerCase().includes(searchTerm);
    const matchesSector = sector === 'all' || stock.sector === sector;

    return matchesSearch && matchesSector;
  });

  // 정렬
  filteredStocks = sortStocks(filteredStocks, sortBy);

  // 리스트 렌더링
  stockListElement.innerHTML = '';

  filteredStocks.forEach(stock => {
    const priceData = stockPrices[stock.id];

    if (!priceData) return;

    const changePercent = priceData.changePercent || 0;
    const isPriceUp = changePercent >= 0;

    const stockItem = document.createElement('div');
    stockItem.className = `stock-item ${gameState.selectedStock === stock.id ? 'selected' : ''}`;
    stockItem.onclick = () => selectStock(stock.id, false);

    stockItem.innerHTML = `
      <div class="stock-item-header">
        <span class="stock-symbol">${stock.symbol}</span>
        <span class="stock-price">${Utils.formatCurrency(priceData.current, 0)}</span>
      </div>
      <div class="stock-item-body">
        <span class="stock-name">${stock.nameKo}</span>
        <span class="stock-change ${isPriceUp ? 'up' : 'down'}">
          ${isPriceUp ? '▲' : '▼'} ${Utils.formatPercent(Math.abs(changePercent))}
        </span>
      </div>
      <div class="stock-item-footer">
        <span class="stock-sector">${getSectorInfo(stock.sector)?.name || stock.sector}</span>
        <span class="stock-volume">${Utils.formatLargeNumber(priceData.volume)}</span>
      </div>
    `;

    stockListElement.appendChild(stockItem);
  });

  // 검색 결과 없음
  if (filteredStocks.length === 0) {
    stockListElement.innerHTML = '<p class="empty-message">검색 결과가 없습니다</p>';
  }
}

// 암호화폐 리스트 UI 업데이트
function updateCryptoListUI() {
  const cryptoListElement = document.getElementById('cryptoList');

  if (!cryptoListElement) return;

  // 필터 및 정렬 적용
  const searchTerm = document.getElementById('cryptoSearch')?.value.toLowerCase() || '';
  const sortBy = document.getElementById('cryptoSortBy')?.value || 'name';

  // 코인 필터링
  let filteredCrypto = CRYPTO.filter(crypto => {
    return crypto.nameKo.toLowerCase().includes(searchTerm) ||
           crypto.symbol.toLowerCase().includes(searchTerm);
  });

  // 정렬
  filteredCrypto = sortCrypto(filteredCrypto, sortBy);

  // 리스트 렌더링
  cryptoListElement.innerHTML = '';

  filteredCrypto.forEach(crypto => {
    const priceData = cryptoPrices[crypto.id];

    if (!priceData) return;

    const changePercent = priceData.changePercent || 0;
    const isPriceUp = changePercent >= 0;

    const cryptoItem = document.createElement('div');
    cryptoItem.className = `stock-item ${gameState.selectedStock === crypto.id ? 'selected' : ''}`;
    cryptoItem.onclick = () => selectStock(crypto.id, true);

    cryptoItem.innerHTML = `
      <div class="stock-item-header">
        <span class="stock-symbol">${crypto.symbol}</span>
        <span class="stock-price">${Utils.formatCurrency(priceData.current, 0)}</span>
      </div>
      <div class="stock-item-body">
        <span class="stock-name">${crypto.nameKo}</span>
        <span class="stock-change ${isPriceUp ? 'up' : 'down'}">
          ${isPriceUp ? '▲' : '▼'} ${Utils.formatPercent(Math.abs(changePercent))}
        </span>
      </div>
      <div class="stock-item-footer">
        <span class="stock-sector">암호화폐</span>
        <span class="stock-volume">${Utils.formatLargeNumber(priceData.volume)}</span>
      </div>
    `;

    cryptoListElement.appendChild(cryptoItem);
  });

  // 검색 결과 없음
  if (filteredCrypto.length === 0) {
    cryptoListElement.innerHTML = '<p class="empty-message">검색 결과가 없습니다</p>';
  }
}

// 종목 정렬
function sortStocks(stocks, sortBy) {
  const sorted = [...stocks];

  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.nameKo.localeCompare(b.nameKo, 'ko'));
      break;

    case 'price':
      sorted.sort((a, b) => {
        const priceA = stockPrices[a.id]?.current || 0;
        const priceB = stockPrices[b.id]?.current || 0;
        return priceB - priceA; // 높은 가격순
      });
      break;

    case 'change':
      sorted.sort((a, b) => {
        const changeA = stockPrices[a.id]?.changePercent || 0;
        const changeB = stockPrices[b.id]?.changePercent || 0;
        return changeB - changeA; // 높은 등락률순
      });
      break;

    default:
      break;
  }

  return sorted;
}

// 암호화폐 정렬
function sortCrypto(cryptos, sortBy) {
  const sorted = [...cryptos];

  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.nameKo.localeCompare(b.nameKo, 'ko'));
      break;

    case 'price':
      sorted.sort((a, b) => {
        const priceA = cryptoPrices[a.id]?.current || 0;
        const priceB = cryptoPrices[b.id]?.current || 0;
        return priceB - priceA;
      });
      break;

    case 'change':
      sorted.sort((a, b) => {
        const changeA = cryptoPrices[a.id]?.changePercent || 0;
        const changeB = cryptoPrices[b.id]?.changePercent || 0;
        return changeB - changeA;
      });
      break;

    default:
      break;
  }

  return sorted;
}

// 종목 선택
function selectStock(assetId, isCrypto) {
  gameState.selectedStock = assetId;
  gameState.selectedType = isCrypto ? 'crypto' : 'stock';

  // 리스트 UI 업데이트 (선택 표시)
  if (isCrypto) {
    updateCryptoListUI();
  } else {
    updateStockListUI();
  }

  // 상세 정보 표시
  updateStockDetailUI(assetId);
}

// 종목 상세 정보 UI 업데이트
function updateStockDetailUI(assetId) {
  const detailPanel = gameState.selectedType === 'crypto'
    ? document.getElementById('cryptoDetailPanel')
    : document.getElementById('stockDetailPanel');

  if (!detailPanel) return;

  const isCrypto = gameState.selectedType === 'crypto';
  const asset = isCrypto ? findCrypto(assetId) : findStock(assetId);
  const priceData = isCrypto ? cryptoPrices[assetId] : stockPrices[assetId];

  if (!asset || !priceData) {
    detailPanel.innerHTML = '<p class="empty-message">종목 정보를 불러올 수 없습니다</p>';
    return;
  }

  const changePercent = priceData.changePercent || 0;
  const isPriceUp = changePercent >= 0;

  // 보유 정보
  const holding = getHolding(assetId);
  const holdingHtml = holding ? `
    <div class="detail-holding">
      <h4>보유 정보</h4>
      <div class="holding-stats">
        <div class="stat-row">
          <span>보유 수량</span>
          <span>${holding.quantity.toLocaleString()}주</span>
        </div>
        <div class="stat-row">
          <span>평균 단가</span>
          <span>${Utils.formatCurrency(holding.avgPrice, 0)}</span>
        </div>
        <div class="stat-row">
          <span>평가액</span>
          <span>${Utils.formatCurrency(priceData.current * holding.quantity, 0)}</span>
        </div>
        <div class="stat-row">
          <span>손익</span>
          <span class="${(priceData.current - holding.avgPrice) >= 0 ? 'profit' : 'loss'}">
            ${Utils.formatCurrency((priceData.current - holding.avgPrice) * holding.quantity, 0)}
            (${Utils.formatPercent(((priceData.current - holding.avgPrice) / holding.avgPrice) * 100)})
          </span>
        </div>
      </div>
    </div>
  ` : '';

  // 섹터 정보 (주식만)
  const sectorHtml = !isCrypto ? `
    <div class="detail-sector">
      <span class="sector-badge" style="background-color: ${getSectorColor(asset.sector)}20; color: ${getSectorColor(asset.sector)}">
        ${getSectorIcon(asset.sector)} ${getSectorInfo(asset.sector)?.name || asset.sector}
      </span>
    </div>
  ` : '';

  detailPanel.innerHTML = `
    <div class="stock-detail">
      <div class="detail-header">
        <div class="detail-title">
          <h2>${asset.nameKo}</h2>
          <span class="detail-symbol">${asset.symbol}</span>
        </div>
        ${sectorHtml}
      </div>

      <div class="detail-price">
        <div class="price-main">
          <span class="price-value">${Utils.formatCurrency(priceData.current, 0)}</span>
          <span class="price-change ${isPriceUp ? 'up' : 'down'}">
            ${isPriceUp ? '▲' : '▼'} ${Utils.formatCurrency(Math.abs(priceData.change), 0)}
            (${Utils.formatPercent(Math.abs(changePercent))})
          </span>
        </div>
      </div>

      <div class="detail-stats">
        <div class="stat-row">
          <span>시가</span>
          <span>${Utils.formatCurrency(priceData.open, 0)}</span>
        </div>
        <div class="stat-row">
          <span>고가</span>
          <span class="profit">${Utils.formatCurrency(priceData.high, 0)}</span>
        </div>
        <div class="stat-row">
          <span>저가</span>
          <span class="loss">${Utils.formatCurrency(priceData.low, 0)}</span>
        </div>
        <div class="stat-row">
          <span>거래량</span>
          <span>${Utils.formatLargeNumber(priceData.volume)}</span>
        </div>
        <div class="stat-row">
          <span>변동성</span>
          <span>${(asset.volatility * 100).toFixed(0)}%</span>
        </div>
      </div>

      ${holdingHtml}

      <div class="detail-description">
        <p>${asset.description}</p>
      </div>

      <div class="detail-chart" id="priceChart-${assetId}">
        <!-- 차트가 여기에 렌더링됩니다 -->
      </div>

      <div class="detail-actions">
        <button class="btn btn-primary" onclick="showTradeModal('${assetId}', ${isCrypto}, 'buy')">
          매수
        </button>
        <button class="btn btn-secondary" onclick="showTradeModal('${assetId}', ${isCrypto}, 'sell')">
          매도
        </button>
      </div>
    </div>
  `;

  // 차트 렌더링
  if (typeof renderPriceChart === 'function') {
    renderPriceChart(assetId, isCrypto);
  }
}

// 매매 모달 표시
window.showTradeModal = function(assetId, isCrypto, action) {
  const asset = isCrypto ? findCrypto(assetId) : findStock(assetId);
  const priceData = isCrypto ? cryptoPrices[assetId] : stockPrices[assetId];

  if (!asset || !priceData) return;

  const isBuy = action === 'buy';
  const maxQuantity = isBuy
    ? getMaxBuyQuantity(assetId, isCrypto)
    : (getHolding(assetId)?.quantity || 0);

  const modalHtml = `
    <div class="modal-backdrop" onclick="closeTradeModal()"></div>
    <div class="modal">
      <div class="modal-header">
        <h3>${isBuy ? '매수' : '매도'} - ${asset.nameKo}</h3>
        <button class="modal-close" onclick="closeTradeModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="trade-info">
          <div class="info-row">
            <span>현재가</span>
            <span>${Utils.formatCurrency(priceData.current, 0)}</span>
          </div>
          <div class="info-row">
            <span>보유 현금</span>
            <span>${Utils.formatCurrency(gameState.cash, 0)}</span>
          </div>
          <div class="info-row">
            <span>${isBuy ? '최대 매수 가능' : '보유 수량'}</span>
            <span>${maxQuantity.toLocaleString()}주</span>
          </div>
        </div>

        <div class="trade-form">
          <label>수량</label>
          <div class="quantity-input">
            <input type="number" id="tradeQuantity" min="1" max="${maxQuantity}" value="1" />
            <button class="btn btn-small" onclick="setTradeQuantity(${Math.floor(maxQuantity / 4)})">25%</button>
            <button class="btn btn-small" onclick="setTradeQuantity(${Math.floor(maxQuantity / 2)})">50%</button>
            <button class="btn btn-small" onclick="setTradeQuantity(${Math.floor(maxQuantity * 0.75)})">75%</button>
            <button class="btn btn-small" onclick="setTradeQuantity(${maxQuantity})">100%</button>
          </div>

          <div class="trade-summary" id="tradeSummary">
            <!-- 거래 요약이 여기에 표시됩니다 -->
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTradeModal()">취소</button>
        <button class="btn btn-primary" onclick="executeTrade('${assetId}', ${isCrypto}, '${action}')">
          ${isBuy ? '매수' : '매도'} 확인
        </button>
      </div>
    </div>
  `;

  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    modalContainer.innerHTML = modalHtml;

    // 수량 입력 이벤트
    const quantityInput = document.getElementById('tradeQuantity');
    if (quantityInput) {
      quantityInput.addEventListener('input', () => updateTradeSummary(assetId, isCrypto, action));
      updateTradeSummary(assetId, isCrypto, action);
    }
  }
};

// 거래 수량 설정
window.setTradeQuantity = function(quantity) {
  const input = document.getElementById('tradeQuantity');
  if (input) {
    input.value = Math.max(1, Math.floor(quantity));
    input.dispatchEvent(new Event('input'));
  }
};

// 거래 요약 업데이트
function updateTradeSummary(assetId, isCrypto, action) {
  const quantity = parseInt(document.getElementById('tradeQuantity')?.value) || 0;
  const priceData = isCrypto ? cryptoPrices[assetId] : stockPrices[assetId];

  if (!priceData || quantity <= 0) {
    document.getElementById('tradeSummary').innerHTML = '';
    return;
  }

  const price = priceData.current;
  const totalAmount = price * quantity;
  const fee = calculateTradingFee(price, quantity, isCrypto);
  const finalAmount = action === 'buy' ? totalAmount + fee : totalAmount - fee;

  document.getElementById('tradeSummary').innerHTML = `
    <div class="summary-row">
      <span>거래 금액</span>
      <span>${Utils.formatCurrency(totalAmount, 0)}</span>
    </div>
    <div class="summary-row">
      <span>수수료</span>
      <span>${Utils.formatCurrency(fee, 0)}</span>
    </div>
    <div class="summary-row total">
      <span>${action === 'buy' ? '필요 금액' : '수령 금액'}</span>
      <span>${Utils.formatCurrency(finalAmount, 0)}</span>
    </div>
  `;
}

// 거래 실행
window.executeTrade = function(assetId, isCrypto, action) {
  const quantity = parseInt(document.getElementById('tradeQuantity')?.value) || 0;

  if (quantity <= 0) {
    alert('올바른 수량을 입력하세요');
    return;
  }

  if (action === 'buy') {
    executeBuyOrder(assetId, quantity, isCrypto);
  } else {
    executeSellOrder(assetId, quantity, isCrypto);
  }

  closeTradeModal();
};

// 모달 닫기
window.closeTradeModal = function() {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    modalContainer.innerHTML = '';
  }
};
