/* ============================================
   Save/Load System - 저장/불러오기 시스템
   ============================================ */

// 게임 저장
function saveGameData() {
  const saveData = {
    version: CONFIG.version,
    timestamp: Date.now(),
    gameState: {
      difficulty: gameState.difficulty,
      timeSpeed: gameState.timeSpeed,
      cash: gameState.cash,
      totalAssets: gameState.totalAssets,
      stockValue: gameState.stockValue,
      profitRate: gameState.profitRate,
      maxAssets: gameState.maxAssets,
      holdings: gameState.holdings,
      gameTime: gameState.gameTime,
      playTime: gameState.playTime
    },
    transactions: transactionLog.transactions.slice(0, 100),
    portfolioStats: portfolioStats
  };

  try {
    localStorage.setItem('stockcoin_save', JSON.stringify(saveData));
    Utils.log('Game saved successfully');
    return true;
  } catch (error) {
    Utils.error('Save failed:', error);
    return false;
  }
}

// 게임 불러오기
function loadGameData() {
  try {
    const saveDataStr = localStorage.getItem('stockcoin_save');

    if (!saveDataStr) {
      return null;
    }

    const saveData = JSON.parse(saveDataStr);

    return saveData;
  } catch (error) {
    Utils.error('Load failed:', error);
    return null;
  }
}

// 저장 데이터 적용
function applySaveData(saveData) {
  if (!saveData) return false;

  // 게임 상태 복원
  Object.assign(gameState, saveData.gameState);

  // 거래 기록 복원
  if (saveData.transactions) {
    transactionLog.transactions = saveData.transactions;
  }

  // 포트폴리오 통계 복원
  if (saveData.portfolioStats) {
    Object.assign(portfolioStats, saveData.portfolioStats);
  }

  Utils.log('Save data applied');
  return true;
}

// 자동 저장
function setupAutoSave() {
  if (!CONFIG.storage.autoSaveEnabled) return;

  setInterval(() => {
    if (gameState.isRunning && !gameState.isPaused) {
      saveGameData();
      Utils.log('Auto-saved');
    }
  }, CONFIG.timers.autoSave);
}
