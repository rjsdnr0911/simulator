/* ============================================
   Validators - 검증 유틸리티
   ============================================ */

// 숫자 유효성 검증
function isValidNumber(value, min = -Infinity, max = Infinity) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

// 양의 정수 검증
function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

// 거래 가능 시간 검증 (실제 시간 모드)
function isMarketOpen() {
  if (gameState.marketHours !== 'real') return true;

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;

  const openTime = 9 * 60;
  const closeTime = 15 * 60 + 30;

  return currentTime >= openTime && currentTime < closeTime;
}
