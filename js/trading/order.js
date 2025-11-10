/* ============================================
   Order System - 주문 시스템
   ============================================ */

// 주문 유형
const ORDER_TYPES = {
  MARKET_BUY: 'market_buy',     // 시장가 매수
  MARKET_SELL: 'market_sell',   // 시장가 매도
  LIMIT_BUY: 'limit_buy',       // 지정가 매수
  LIMIT_SELL: 'limit_sell'      // 지정가 매도
};

// 주문 검증
function validateOrder(assetId, quantity, orderType, isCrypto = false) {
  const errors = [];

  // 수량 검증
  if (!quantity || quantity <= 0) {
    errors.push('수량은 0보다 커야 합니다');
  }

  if (!Number.isInteger(quantity) && !isCrypto) {
    errors.push('주식 수량은 정수여야 합니다');
  }

  // 자산 존재 여부 확인
  const asset = isCrypto ? findCrypto(assetId) : findStock(assetId);
  if (!asset) {
    errors.push('존재하지 않는 종목입니다');
  }

  // 가격 정보 확인
  const priceData = isCrypto ? cryptoPrices[assetId] : stockPrices[assetId];
  if (!priceData) {
    errors.push('가격 정보를 찾을 수 없습니다');
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    asset: asset,
    priceData: priceData
  };
}

// 시장가 매수
function executeBuyOrder(assetId, quantity, isCrypto = false) {
  Utils.log('Executing buy order:', assetId, quantity, isCrypto);

  // 주문 검증
  const validation = validateOrder(assetId, quantity, ORDER_TYPES.MARKET_BUY, isCrypto);

  if (!validation.isValid) {
    const errorMessage = validation.errors.join(', ');
    Utils.error('Buy order validation failed:', errorMessage);

    if (typeof showNotification === 'function') {
      showNotification({
        type: 'TRADE_ERROR',
        title: '매수 실패',
        message: errorMessage,
        duration: 3000
      });
    }

    return {
      success: false,
      error: errorMessage
    };
  }

  const { asset, priceData } = validation;

  // 매수 가격 (현재가)
  const buyPrice = priceData.current;

  // 총 금액 계산
  const totalCost = buyPrice * quantity;

  // 수수료 계산
  const fee = calculateTradingFee(buyPrice, quantity, isCrypto);

  // 최종 필요 금액
  const totalRequired = totalCost + fee;

  // 현금 확인
  if (gameState.cash < totalRequired) {
    const shortfall = totalRequired - gameState.cash;

    if (typeof showNotification === 'function') {
      showNotification({
        type: 'TRADE_ERROR',
        title: '현금 부족',
        message: `${Utils.formatCurrency(shortfall)} 부족합니다`,
        duration: 3000
      });
    }

    return {
      success: false,
      error: '현금이 부족합니다'
    };
  }

  // 보유 종목 업데이트
  if (!gameState.holdings[assetId]) {
    gameState.holdings[assetId] = {
      quantity: 0,
      avgPrice: 0,
      totalInvested: 0,
      purchaseTime: Date.now()
    };
  }

  const holding = gameState.holdings[assetId];

  // 평균 단가 계산
  const newTotalQuantity = holding.quantity + quantity;
  const newTotalInvested = (holding.avgPrice * holding.quantity) + totalCost;
  const newAvgPrice = newTotalInvested / newTotalQuantity;

  // 보유량 업데이트
  holding.quantity = newTotalQuantity;
  holding.avgPrice = newAvgPrice;
  holding.totalInvested = newTotalInvested;

  // 현금 차감
  gameState.cash -= totalRequired;

  // 거래 기록
  const transaction = {
    id: `txn_${Date.now()}_${Utils.randomInt(1000, 9999)}`,
    type: 'BUY',
    assetId: assetId,
    assetName: asset.nameKo,
    assetType: isCrypto ? 'crypto' : 'stock',
    quantity: quantity,
    price: buyPrice,
    totalAmount: totalCost,
    fee: fee,
    timestamp: Date.now(),
    gameTime: gameState.gameTime
  };

  // 거래 로그에 추가
  if (typeof logTransaction === 'function') {
    logTransaction(transaction);
  }

  Utils.log('Buy order executed:', transaction);

  // 포트폴리오 가치 업데이트
  if (typeof updatePortfolioValue === 'function') {
    updatePortfolioValue();
  }

  // 성공 알림
  if (typeof showNotification === 'function') {
    showNotification({
      type: 'TRADE_SUCCESS',
      title: `✅ ${asset.nameKo} 매수 완료`,
      message: `${quantity}주 @ ${Utils.formatCurrency(buyPrice)}`,
      duration: 3000
    });
  }

  // UI 업데이트
  if (typeof updatePortfolioUI === 'function') {
    updatePortfolioUI();
  }

  return {
    success: true,
    transaction: transaction,
    holding: holding
  };
}

// 시장가 매도
function executeSellOrder(assetId, quantity, isCrypto = false) {
  Utils.log('Executing sell order:', assetId, quantity, isCrypto);

  // 주문 검증
  const validation = validateOrder(assetId, quantity, ORDER_TYPES.MARKET_SELL, isCrypto);

  if (!validation.isValid) {
    const errorMessage = validation.errors.join(', ');
    Utils.error('Sell order validation failed:', errorMessage);

    if (typeof showNotification === 'function') {
      showNotification({
        type: 'TRADE_ERROR',
        title: '매도 실패',
        message: errorMessage,
        duration: 3000
      });
    }

    return {
      success: false,
      error: errorMessage
    };
  }

  const { asset, priceData } = validation;

  // 보유 확인
  const holding = gameState.holdings[assetId];

  if (!holding || holding.quantity < quantity) {
    const message = holding
      ? `보유량 부족 (${holding.quantity}주 보유)`
      : '보유하지 않은 종목입니다';

    if (typeof showNotification === 'function') {
      showNotification({
        type: 'TRADE_ERROR',
        title: '매도 실패',
        message: message,
        duration: 3000
      });
    }

    return {
      success: false,
      error: message
    };
  }

  // 매도 가격 (현재가)
  const sellPrice = priceData.current;

  // 총 금액 계산
  const totalRevenue = sellPrice * quantity;

  // 수수료 계산
  const fee = calculateTradingFee(sellPrice, quantity, isCrypto);

  // 최종 수령 금액
  const netRevenue = totalRevenue - fee;

  // 손익 계산
  const costBasis = holding.avgPrice * quantity;
  const profitLoss = totalRevenue - costBasis;
  const profitLossPercent = (profitLoss / costBasis) * 100;

  // 보유량 업데이트
  holding.quantity -= quantity;

  // 보유량이 0이 되면 기록 제거
  if (holding.quantity === 0) {
    delete gameState.holdings[assetId];
  }

  // 현금 증가
  gameState.cash += netRevenue;

  // 거래 기록
  const transaction = {
    id: `txn_${Date.now()}_${Utils.randomInt(1000, 9999)}`,
    type: 'SELL',
    assetId: assetId,
    assetName: asset.nameKo,
    assetType: isCrypto ? 'crypto' : 'stock',
    quantity: quantity,
    price: sellPrice,
    totalAmount: totalRevenue,
    fee: fee,
    profitLoss: profitLoss,
    profitLossPercent: profitLossPercent,
    timestamp: Date.now(),
    gameTime: gameState.gameTime
  };

  // 거래 로그에 추가
  if (typeof logTransaction === 'function') {
    logTransaction(transaction);
  }

  Utils.log('Sell order executed:', transaction);

  // 포트폴리오 가치 업데이트
  if (typeof updatePortfolioValue === 'function') {
    updatePortfolioValue();
  }

  // 성공 알림
  const profitLossText = profitLoss >= 0
    ? `+${Utils.formatCurrency(profitLoss)} (${Utils.formatPercent(profitLossPercent)})`
    : `${Utils.formatCurrency(profitLoss)} (${Utils.formatPercent(profitLossPercent)})`;

  if (typeof showNotification === 'function') {
    showNotification({
      type: profitLoss >= 0 ? 'TRADE_PROFIT' : 'TRADE_LOSS',
      title: `✅ ${asset.nameKo} 매도 완료`,
      message: `${quantity}주 @ ${Utils.formatCurrency(sellPrice)} | ${profitLossText}`,
      duration: 4000
    });
  }

  // UI 업데이트
  if (typeof updatePortfolioUI === 'function') {
    updatePortfolioUI();
  }

  return {
    success: true,
    transaction: transaction,
    holding: holding,
    profitLoss: profitLoss,
    profitLossPercent: profitLossPercent
  };
}

// 전량 매도
function sellAllHolding(assetId, isCrypto = false) {
  const holding = gameState.holdings[assetId];

  if (!holding || holding.quantity <= 0) {
    return {
      success: false,
      error: '보유하지 않은 종목입니다'
    };
  }

  return executeSellOrder(assetId, holding.quantity, isCrypto);
}

// 보유 종목 정보 가져오기
function getHolding(assetId) {
  return gameState.holdings[assetId] || null;
}

// 모든 보유 종목 가져오기
function getAllHoldings() {
  return Object.entries(gameState.holdings)
    .filter(([_, holding]) => holding.quantity > 0)
    .map(([assetId, holding]) => {
      const stock = findStock(assetId);
      const crypto = findCrypto(assetId);
      const asset = stock || crypto;
      const isCrypto = !!crypto;

      const priceData = isCrypto ? cryptoPrices[assetId] : stockPrices[assetId];

      const currentValue = priceData ? priceData.current * holding.quantity : 0;
      const profitLoss = currentValue - (holding.avgPrice * holding.quantity);
      const profitLossPercent = ((priceData.current - holding.avgPrice) / holding.avgPrice) * 100;

      return {
        assetId,
        asset,
        isCrypto,
        holding,
        currentPrice: priceData?.current || 0,
        currentValue,
        profitLoss,
        profitLossPercent
      };
    })
    .sort((a, b) => b.currentValue - a.currentValue); // 가치 높은 순
}

// 최대 매수 가능 수량 계산
function getMaxBuyQuantity(assetId, isCrypto = false) {
  const priceData = isCrypto ? cryptoPrices[assetId] : stockPrices[assetId];

  if (!priceData) return 0;

  const price = priceData.current;
  const feeRate = isCrypto
    ? CONFIG.fees.crypto[gameState.difficulty]
    : CONFIG.fees.stock[gameState.difficulty];

  // 수수료를 고려한 최대 매수 가능 수량
  // cash = price * quantity + (price * quantity * feeRate)
  // cash = price * quantity * (1 + feeRate)
  // quantity = cash / (price * (1 + feeRate))

  const maxQuantity = Math.floor(gameState.cash / (price * (1 + feeRate)));

  return Math.max(0, maxQuantity);
}
