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
  Utils.log('Opening settings...');

  const modalHtml = `
    <div class="modal-backdrop" onclick="closeSettingsModal()"></div>
    <div class="modal modal-large">
      <div class="modal-header">
        <h3>⚙️ 설정</h3>
        <button class="modal-close" onclick="closeSettingsModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="settings-section">
          <h4>게임 설정</h4>

          <div class="setting-item">
            <label>시간 배속</label>
            <select id="settingTimeSpeed" class="setting-input">
              <option value="1" ${gameState.timeSpeed === 1 ? 'selected' : ''}>1배속</option>
              <option value="2" ${gameState.timeSpeed === 2 ? 'selected' : ''}>2배속</option>
              <option value="5" ${gameState.timeSpeed === 5 ? 'selected' : ''}>5배속</option>
            </select>
          </div>

          <div class="setting-item">
            <label>난이도 (변경 시 주의)</label>
            <select id="settingDifficulty" class="setting-input">
              <option value="easy" ${gameState.difficulty === 'easy' ? 'selected' : ''}>쉬움</option>
              <option value="normal" ${gameState.difficulty === 'normal' ? 'selected' : ''}>보통</option>
              <option value="hard" ${gameState.difficulty === 'hard' ? 'selected' : ''}>어려움</option>
            </select>
          </div>
        </div>

        <div class="settings-section">
          <h4>알림 설정</h4>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="settingPriceAlert5" ${CONFIG.notifications.priceAlert5 ? 'checked' : ''}>
              <span>±5% 가격 변동 알림</span>
            </label>
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="settingPriceAlert10" ${CONFIG.notifications.priceAlert10 ? 'checked' : ''}>
              <span>±10% 가격 변동 알림</span>
            </label>
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="settingMajorNews" ${CONFIG.notifications.majorNews ? 'checked' : ''}>
              <span>중요 뉴스 알림</span>
            </label>
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="settingHoldingNews" ${CONFIG.notifications.holdingNews ? 'checked' : ''}>
              <span>보유 종목 뉴스 알림</span>
            </label>
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="settingMarketChange" ${CONFIG.notifications.marketChange ? 'checked' : ''}>
              <span>시장 분위기 변경 알림</span>
            </label>
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="settingSound" ${CONFIG.notifications.soundEnabled ? 'checked' : ''}>
              <span>사운드 활성화</span>
            </label>
          </div>

          <div class="setting-item">
            <label>사운드 볼륨</label>
            <input type="range" id="settingSoundVolume" min="0" max="100" value="${CONFIG.notifications.soundVolume * 100}" class="setting-input">
            <span id="volumeValue">${Math.round(CONFIG.notifications.soundVolume * 100)}%</span>
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="settingDoNotDisturb" ${CONFIG.notifications.doNotDisturb ? 'checked' : ''}>
              <span>방해 금지 모드</span>
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h4>디버그</h4>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="settingDebug" ${CONFIG.debug ? 'checked' : ''}>
              <span>디버그 모드</span>
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeSettingsModal()">취소</button>
        <button class="btn btn-primary" onclick="applySettings()">적용</button>
      </div>
    </div>
  `;

  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    modalContainer.innerHTML = modalHtml;

    // 볼륨 슬라이더 이벤트
    const volumeSlider = document.getElementById('settingSoundVolume');
    const volumeValue = document.getElementById('volumeValue');
    if (volumeSlider && volumeValue) {
      volumeSlider.addEventListener('input', (e) => {
        volumeValue.textContent = e.target.value + '%';
      });
    }
  }
}

// 설정 모달 닫기
window.closeSettingsModal = function() {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    modalContainer.innerHTML = '';
  }
};

// 설정 적용
window.applySettings = function() {
  // 시간 배속
  const timeSpeed = parseInt(document.getElementById('settingTimeSpeed')?.value) || 2;
  if (timeSpeed !== gameState.timeSpeed && typeof setTimeSpeed === 'function') {
    setTimeSpeed(timeSpeed);
  }

  // 난이도 (주의: 게임 중 변경 시 영향)
  const difficulty = document.getElementById('settingDifficulty')?.value || 'normal';
  if (difficulty !== gameState.difficulty) {
    const confirmed = confirm('난이도를 변경하면 게임 설정이 변경됩니다. 계속하시겠습니까?');
    if (confirmed && typeof changeDifficulty === 'function') {
      changeDifficulty(difficulty);
    }
  }

  // 알림 설정
  CONFIG.notifications.priceAlert5 = document.getElementById('settingPriceAlert5')?.checked || false;
  CONFIG.notifications.priceAlert10 = document.getElementById('settingPriceAlert10')?.checked || false;
  CONFIG.notifications.majorNews = document.getElementById('settingMajorNews')?.checked || false;
  CONFIG.notifications.holdingNews = document.getElementById('settingHoldingNews')?.checked || false;
  CONFIG.notifications.marketChange = document.getElementById('settingMarketChange')?.checked || false;
  CONFIG.notifications.soundEnabled = document.getElementById('settingSound')?.checked || false;
  CONFIG.notifications.doNotDisturb = document.getElementById('settingDoNotDisturb')?.checked || false;

  // 사운드 볼륨
  const volumeValue = parseInt(document.getElementById('settingSoundVolume')?.value) || 80;
  CONFIG.notifications.soundVolume = volumeValue / 100;

  // 디버그 모드
  CONFIG.debug = document.getElementById('settingDebug')?.checked || false;

  Utils.log('Settings applied');

  showNotification({
    type: 'SETTING_CHANGE',
    title: '설정 변경',
    message: '설정이 적용되었습니다',
    duration: 2000
  });

  closeSettingsModal();
};

// 튜토리얼 모달 표시
function showTutorialModal() {
  Utils.log('Showing tutorial...');

  const modalHtml = `
    <div class="modal-backdrop" onclick="closeTutorialModal()"></div>
    <div class="modal modal-large">
      <div class="modal-header">
        <h3>📚 게임 가이드</h3>
        <button class="modal-close" onclick="closeTutorialModal()">×</button>
      </div>
      <div class="modal-body tutorial-content">
        <div class="tutorial-section">
          <h4>🎮 게임 목표</h4>
          <p>주식과 암호화폐 거래를 통해 자산을 늘리세요! 목표는 최대한 많은 수익을 내는 것입니다.</p>
        </div>

        <div class="tutorial-section">
          <h4>📊 기본 조작</h4>
          <ul>
            <li><strong>종목 선택:</strong> 주식/코인 탭에서 원하는 종목을 클릭</li>
            <li><strong>매수:</strong> 종목 상세 화면에서 "매수" 버튼 클릭</li>
            <li><strong>매도:</strong> 포트폴리오 탭에서 보유 종목을 매도</li>
            <li><strong>일시정지:</strong> 상단 우측 ⏸️ 버튼으로 게임 일시정지</li>
          </ul>
        </div>

        <div class="tutorial-section">
          <h4>💡 팁</h4>
          <ul>
            <li><strong>뉴스 확인:</strong> 상단 뉴스 티커를 주시하세요. 가격에 영향을 미칩니다</li>
            <li><strong>시장 분위기:</strong> 강세장/약세장/박스권을 확인하세요</li>
            <li><strong>분산 투자:</strong> 여러 종목에 투자하면 리스크를 줄일 수 있습니다</li>
            <li><strong>수수료:</strong> 거래할 때마다 수수료가 발생하니 주의하세요</li>
            <li><strong>손절/익절:</strong> 적절한 타이밍에 매도하는 것이 중요합니다</li>
          </ul>
        </div>

        <div class="tutorial-section">
          <h4>📈 난이도별 특징</h4>
          <ul>
            <li><strong>쉬움:</strong> 시작 자금 5천만원, 낮은 변동성, 명확한 뉴스 힌트</li>
            <li><strong>보통:</strong> 시작 자금 1천만원, 보통 변동성, 보통 힌트</li>
            <li><strong>어려움:</strong> 시작 자금 500만원, 높은 변동성, 모호한 힌트, 파산 가능</li>
          </ul>
        </div>

        <div class="tutorial-section">
          <h4>⚡ 단축키</h4>
          <ul>
            <li><strong>Space:</strong> 일시정지/재개</li>
            <li><strong>S:</strong> 저장</li>
            <li><strong>Esc:</strong> 모달 닫기</li>
          </ul>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeTutorialModal()">시작하기</button>
      </div>
    </div>
  `;

  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    modalContainer.innerHTML = modalHtml;
  }
}

// 튜토리얼 모달 닫기
window.closeTutorialModal = function() {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    modalContainer.innerHTML = '';
  }
};

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

// 키보드 단축키
document.addEventListener('keydown', (e) => {
  // 입력 필드에서는 단축키 비활성화
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    return;
  }

  switch(e.key) {
    case ' ': // Space - 일시정지/재개
      e.preventDefault();
      if (gameState.isRunning) {
        togglePause();
      }
      break;

    case 's':
    case 'S': // S - 저장
      e.preventDefault();
      if (gameState.isRunning) {
        saveGame();
      }
      break;

    case 'Escape': // Esc - 모달 닫기
      e.preventDefault();
      const modalContainer = document.getElementById('modal-container');
      if (modalContainer && modalContainer.innerHTML) {
        modalContainer.innerHTML = '';
      }
      break;

    case '1': // 1 - 주식 탭
      e.preventDefault();
      if (gameState.isRunning) switchTab('stocks');
      break;

    case '2': // 2 - 코인 탭
      e.preventDefault();
      if (gameState.isRunning) switchTab('crypto');
      break;

    case '3': // 3 - 포트폴리오 탭
      e.preventDefault();
      if (gameState.isRunning) switchTab('portfolio');
      break;

    case '4': // 4 - 거래일지 탭
      e.preventDefault();
      if (gameState.isRunning) switchTab('transactions');
      break;

    case '5': // 5 - 통계 탭
      e.preventDefault();
      if (gameState.isRunning) switchTab('statistics');
      break;
  }
});

// 디버그용 전역 함수
window.debugGameState = () => {
  console.log('Current Game State:', gameState);
};
