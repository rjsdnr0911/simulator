/* ============================================
   Main - 메인 애플리케이션 로직
   ============================================ */

// 전역 게임 상태
const gameState = {
  // 기본 정보
  isRunning: false,
  isPaused: false,
  difficulty: 'normal',
  timeSpeed: 2,

  // 자산
  cash: 10000000,
  totalAssets: 10000000,
  stockValue: 0,
  profitRate: 0,
  maxAssets: 10000000,

  // 보유 종목
  holdings: {},  // { stockId: { quantity, avgPrice, purchaseTime } }

  // 게임 시간
  gameTime: 0,
  playTime: 0,

  // 현재 선택된 종목
  selectedStock: null,
  selectedType: 'stock',  // 'stock' or 'crypto'

  // 현재 탭
  currentTab: 'stocks'
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  Utils.log('Application initialized');

  // 시작 화면 이벤트 리스너
  initStartScreen();

  // 난이도 선택 UI 초기화
  initDifficultySelection();
});

// 시작 화면 초기화
function initStartScreen() {
  const startGameBtn = document.getElementById('startGameBtn');
  const loadGameBtn = document.getElementById('loadGameBtn');

  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      const difficulty = document.querySelector('.difficulty-card.selected')?.dataset.difficulty || 'normal';
      const timeSpeed = parseInt(document.querySelector('input[name="timeSpeed"]:checked')?.value) || 2;
      const showTutorial = document.getElementById('showTutorial')?.checked || false;

      startNewGame(difficulty, timeSpeed, showTutorial);
    });
  }

  if (loadGameBtn) {
    loadGameBtn.addEventListener('click', () => {
      loadSavedGame();
    });
  }
}

// 난이도 선택 초기화
function initDifficultySelection() {
  const difficultyCards = document.querySelectorAll('.difficulty-card');

  difficultyCards.forEach(card => {
    card.addEventListener('click', () => {
      // 모든 카드에서 selected 제거
      difficultyCards.forEach(c => c.classList.remove('selected'));
      // 클릭한 카드에 selected 추가
      card.classList.add('selected');
    });
  });
}

// 새 게임 시작
function startNewGame(difficulty, timeSpeed, showTutorial) {
  Utils.log('Starting new game', { difficulty, timeSpeed, showTutorial });

  // 게임 상태 초기화
  const settings = getDifficultySettings(difficulty);

  gameState.difficulty = difficulty;
  gameState.timeSpeed = timeSpeed;
  gameState.cash = settings.initialCash;
  gameState.totalAssets = settings.initialCash;
  gameState.stockValue = 0;
  gameState.profitRate = 0;
  gameState.maxAssets = settings.initialCash;
  gameState.holdings = {};
  gameState.gameTime = 0;
  gameState.playTime = 0;
  gameState.isRunning = true;
  gameState.isPaused = false;

  // 화면 전환
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');

  // 게임 초기화
  initGame();

  // 튜토리얼 표시 (선택된 경우)
  if (showTutorial) {
    showTutorialModal();
  }
}

// 게임 초기화
function initGame() {
  Utils.log('Initializing game...');

  // 종목 데이터 초기화
  initializeStockData();

  // 엔진 시작
  startPriceEngine();
  startNewsEngine();
  startMarketMoodSystem();
  startTimeManager();

  // 자동 저장 설정
  setupAutoSave();

  // UI 초기화
  updateDashboard();
  updateStockListUI();
  updateCryptoListUI();
  updateMarketMoodUI();

  // 이벤트 리스너 등록
  initGameEventListeners();

  Utils.log('Game initialized successfully');
}

// 게임 이벤트 리스너 초기화
function initGameEventListeners() {
  // 탭 전환
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });

  // 설정 버튼
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showSettingsModal();
    });
  }

  // 저장 버튼
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveGame();
    });
  }

  // 일시정지 버튼
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      togglePause();
    });
  }

  // 검색 및 필터
  const stockSearch = document.getElementById('stockSearch');
  if (stockSearch) {
    stockSearch.addEventListener('input', Utils.debounce(() => {
      updateStockListUI();
    }, 300));
  }

  const cryptoSearch = document.getElementById('cryptoSearch');
  if (cryptoSearch) {
    cryptoSearch.addEventListener('input', Utils.debounce(() => {
      updateCryptoListUI();
    }, 300));
  }

  const sectorFilter = document.getElementById('sectorFilter');
  if (sectorFilter) {
    sectorFilter.addEventListener('change', () => {
      updateStockListUI();
    });
  }

  const sortBy = document.getElementById('sortBy');
  if (sortBy) {
    sortBy.addEventListener('change', () => {
      updateStockListUI();
    });
  }

  const cryptoSortBy = document.getElementById('cryptoSortBy');
  if (cryptoSortBy) {
    cryptoSortBy.addEventListener('change', () => {
      updateCryptoListUI();
    });
  }
}

// 탭 전환
function switchTab(tabName) {
  // 모든 탭 비활성화
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // 선택한 탭 활성화
  document.querySelector(`.tab[data-tab="${tabName}"]`)?.classList.add('active');
  document.getElementById(`${tabName}-panel`)?.classList.add('active');

  gameState.currentTab = tabName;

  // 탭별 초기화
  switch(tabName) {
    case 'stocks':
      if (typeof updateStockListUI === 'function') updateStockListUI();
      break;
    case 'crypto':
      if (typeof updateCryptoListUI === 'function') updateCryptoListUI();
      break;
    case 'portfolio':
      if (typeof updatePortfolioUI === 'function') updatePortfolioUI();
      break;
    case 'transactions':
      if (typeof updateTransactionLogUI === 'function') updateTransactionLogUI();
      break;
    case 'statistics':
      if (typeof updateStatisticsUI === 'function') updateStatisticsUI();
      break;
  }
}

// 대시보드 업데이트
function updateDashboard() {
  // 현금
  const cashDisplay = document.getElementById('cashDisplay');
  if (cashDisplay) {
    cashDisplay.textContent = Utils.formatDollar(gameState.cash, 0);
  }

  // 평가 자산
  const stockValueDisplay = document.getElementById('stockValueDisplay');
  if (stockValueDisplay) {
    stockValueDisplay.textContent = Utils.formatDollar(gameState.stockValue, 0);
  }

  // 총 자산
  const totalAssetsDisplay = document.getElementById('totalAssetsDisplay');
  if (totalAssetsDisplay) {
    totalAssetsDisplay.textContent = Utils.formatDollar(gameState.totalAssets, 0);
  }

  // 손익률
  const profitRateDisplay = document.getElementById('profitRateDisplay');
  if (profitRateDisplay) {
    const profitRate = ((gameState.totalAssets - CONFIG.initialCash[gameState.difficulty]) / CONFIG.initialCash[gameState.difficulty]) * 100;
    profitRateDisplay.textContent = Utils.formatPercent(profitRate);

    // 색상 변경
    if (profitRate > 0) {
      profitRateDisplay.className = 'asset-value profit';
    } else if (profitRate < 0) {
      profitRateDisplay.className = 'asset-value loss';
    } else {
      profitRateDisplay.className = 'asset-value';
    }
  }

  // 게임 시간
  const gameTimeDisplay = document.getElementById('gameTimeDisplay');
  if (gameTimeDisplay) {
    gameTimeDisplay.textContent = Utils.formatTime(gameState.gameTime);
  }
}

// 일시정지 토글
function togglePause() {
  gameState.isPaused = !gameState.isPaused;

  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.textContent = gameState.isPaused ? '▶️' : '⏸️';
    pauseBtn.title = gameState.isPaused ? '재개' : '일시정지';
  }

  Utils.log('Game', gameState.isPaused ? 'paused' : 'resumed');
}

// 게임 저장
function saveGame() {
  try {
    const success = saveGameData();

    if (success) {
      showNotification({
        type: 'SAVE_SUCCESS',
        title: '저장 완료',
        message: '게임이 저장되었습니다.',
        duration: 2000
      });
    } else {
      throw new Error('Save failed');
    }
  } catch (error) {
    Utils.error('Save failed:', error);
    showNotification({
      type: 'SAVE_ERROR',
      title: '저장 실패',
      message: '게임 저장 중 오류가 발생했습니다.',
      duration: 3000
    });
  }
}

// 게임 불러오기
function loadSavedGame() {
  try {
    const saveData = loadGameData();

    if (!saveData) {
      alert('저장된 게임이 없습니다.');
      return;
    }

    // 저장 데이터 적용
    const success = applySaveData(saveData);

    if (success) {
      // 화면 전환
      document.getElementById('start-screen').classList.remove('active');
      document.getElementById('game-screen').classList.add('active');

      // 게임 초기화
      gameState.isRunning = true;
      gameState.isPaused = false;
      initGame();

      showNotification({
        type: 'SAVE_SUCCESS',
        title: '불러오기 완료',
        message: '게임을 불러왔습니다.',
        duration: 2000
      });
    }
  } catch (error) {
    Utils.error('Load failed:', error);
    alert('게임 불러오기 중 오류가 발생했습니다.');
  }
}

// 설정 모달 표시
function showSettingsModal() {
  // TODO: 설정 모달 구현
  Utils.log('Opening settings...');
  alert('설정 기능은 개발 중입니다.');
}

// 튜토리얼 모달 표시
function showTutorialModal() {
  // TODO: 튜토리얼 모달 구현
  Utils.log('Showing tutorial...');
}

// showNotification 함수는 notificationSystem.js에서 정의됨

// 게임 루프 (임시)
function gameLoop() {
  if (!gameState.isRunning || gameState.isPaused) {
    return;
  }

  // 게임 시간과 대시보드는 timeManager에서 관리
  // 이 함수는 더 이상 필요하지 않음
}

// 게임 루프는 timeManager에서 관리됨

// 디버그용 전역 함수
window.debugGameState = () => {
  console.log('Current Game State:', gameState);
};
