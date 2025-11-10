/* ============================================
   Calculator - 계산기 유틸리티
   ============================================ */

// 수익률 계산
function calculateReturnRate(buyPrice, sellPrice) {
  return ((sellPrice - buyPrice) / buyPrice) * 100;
}

// 복리 수익률 계산
function calculateCompoundReturn(initialAmount, finalAmount, periods) {
  return (Math.pow(finalAmount / initialAmount, 1 / periods) - 1) * 100;
}

// 샤프 비율 계산 (간단한 버전)
function calculateSharpeRatio(returns, riskFreeRate = 0) {
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );

  return stdDev === 0 ? 0 : (avgReturn - riskFreeRate) / stdDev;
}
