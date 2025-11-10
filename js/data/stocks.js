/* ============================================
   Stock Data - 종목 데이터
   ============================================ */

// 주식 종목 데이터
const STOCKS = [
  // 기술 섹터
  {
    id: 'TECH001',
    symbol: 'APEX',
    name: 'ApexTech',
    nameKo: '에이펙스테크',
    sector: 'technology',
    initialPrice: 150000,
    volatility: 0.8,
    marketCap: 5000000000000, // 5조
    description: '글로벌 반도체 제조 및 AI 칩 개발 기업'
  },
  {
    id: 'TECH002',
    symbol: 'NEXUS',
    name: 'NexusSoft',
    nameKo: '넥서스소프트',
    sector: 'technology',
    initialPrice: 85000,
    volatility: 1.0,
    marketCap: 2500000000000,
    description: '클라우드 컴퓨팅 및 엔터프라이즈 소프트웨어 솔루션'
  },
  {
    id: 'TECH003',
    symbol: 'QBIT',
    name: 'QuantumBit',
    nameKo: '퀀텀비트',
    sector: 'technology',
    initialPrice: 220000,
    volatility: 1.5,
    marketCap: 1000000000000,
    description: '양자컴퓨팅 및 보안 기술 연구개발'
  },
  {
    id: 'TECH004',
    symbol: 'CYNET',
    name: 'CyberNet',
    nameKo: '사이버넷',
    sector: 'technology',
    initialPrice: 45000,
    volatility: 0.9,
    marketCap: 800000000000,
    description: '사이버보안 및 네트워크 인프라'
  },

  // 자동차 섹터
  {
    id: 'AUTO001',
    symbol: 'EMOT',
    name: 'E-Motors',
    nameKo: '이모터스',
    sector: 'automotive',
    initialPrice: 180000,
    volatility: 1.2,
    marketCap: 4000000000000,
    description: '전기차 제조 및 자율주행 기술 선도 기업'
  },
  {
    id: 'AUTO002',
    symbol: 'KCAR',
    name: 'Korea Auto',
    nameKo: '코리아오토',
    sector: 'automotive',
    initialPrice: 95000,
    volatility: 0.7,
    marketCap: 3000000000000,
    description: '국내 최대 자동차 제조사'
  },
  {
    id: 'AUTO003',
    symbol: 'BATT',
    name: 'PowerCell',
    nameKo: '파워셀',
    sector: 'automotive',
    initialPrice: 120000,
    volatility: 1.3,
    marketCap: 1500000000000,
    description: '차세대 배터리 및 에너지 저장 시스템'
  },

  // 금융 섹터
  {
    id: 'FIN001',
    symbol: 'KBANK',
    name: 'Korea Bank',
    nameKo: '코리아뱅크',
    sector: 'finance',
    initialPrice: 65000,
    volatility: 0.5,
    marketCap: 8000000000000,
    description: '국내 1위 종합 금융 그룹'
  },
  {
    id: 'FIN002',
    symbol: 'FINTECH',
    name: 'FinTech Plus',
    nameKo: '핀테크플러스',
    sector: 'finance',
    initialPrice: 38000,
    volatility: 1.1,
    marketCap: 500000000000,
    description: '모바일 결제 및 디지털 금융 서비스'
  },
  {
    id: 'FIN003',
    symbol: 'INSURE',
    name: 'SecureLife',
    nameKo: '시큐어라이프',
    sector: 'finance',
    initialPrice: 55000,
    volatility: 0.6,
    marketCap: 2000000000000,
    description: '생명보험 및 자산관리'
  },

  // 엔터테인먼트 섹터
  {
    id: 'ENT001',
    symbol: 'KPOP',
    name: 'K-Entertainment',
    nameKo: '케이엔터테인먼트',
    sector: 'entertainment',
    initialPrice: 75000,
    volatility: 1.4,
    marketCap: 1200000000000,
    description: 'K-POP 아이돌 기획 및 콘텐츠 제작'
  },
  {
    id: 'ENT002',
    symbol: 'STREAM',
    name: 'StreamBox',
    nameKo: '스트림박스',
    sector: 'entertainment',
    initialPrice: 105000,
    volatility: 1.0,
    marketCap: 900000000000,
    description: 'OTT 플랫폼 및 오리지널 콘텐츠'
  },
  {
    id: 'ENT003',
    symbol: 'GAME',
    name: 'GameStudio',
    nameKo: '게임스튜디오',
    sector: 'entertainment',
    initialPrice: 92000,
    volatility: 1.2,
    marketCap: 700000000000,
    description: '온라인 게임 개발 및 퍼블리싱'
  },

  // 소비재 섹터
  {
    id: 'CONS001',
    symbol: 'FOOD',
    name: 'K-Foods',
    nameKo: '케이푸드',
    sector: 'consumer',
    initialPrice: 58000,
    volatility: 0.4,
    marketCap: 3500000000000,
    description: '식품 및 음료 제조'
  },
  {
    id: 'CONS002',
    symbol: 'BEAUTY',
    name: 'BeautyLab',
    nameKo: '뷰티랩',
    sector: 'consumer',
    initialPrice: 48000,
    volatility: 0.8,
    marketCap: 600000000000,
    description: 'K-뷰티 화장품 및 스킨케어'
  },
  {
    id: 'CONS003',
    symbol: 'FASH',
    name: 'Fashion Korea',
    nameKo: '패션코리아',
    sector: 'consumer',
    initialPrice: 32000,
    volatility: 0.9,
    marketCap: 400000000000,
    description: '의류 및 패션 브랜드'
  },

  // 제조 섹터
  {
    id: 'MANU001',
    symbol: 'STEEL',
    name: 'Korea Steel',
    nameKo: '코리아스틸',
    sector: 'manufacturing',
    initialPrice: 42000,
    volatility: 0.6,
    marketCap: 5000000000000,
    description: '철강 및 금속 제조'
  },
  {
    id: 'MANU002',
    symbol: 'CHEM',
    name: 'ChemTech',
    nameKo: '켐테크',
    sector: 'manufacturing',
    initialPrice: 78000,
    volatility: 0.7,
    marketCap: 2000000000000,
    description: '화학 소재 및 정밀화학'
  },
  {
    id: 'MANU003',
    symbol: 'SHIP',
    name: 'Ocean Build',
    nameKo: '오션빌드',
    sector: 'manufacturing',
    initialPrice: 68000,
    volatility: 0.8,
    marketCap: 3000000000000,
    description: '조선 및 해양플랜트'
  }
];

// 암호화폐 데이터
const CRYPTO = [
  {
    id: 'BTC',
    symbol: 'BTC',
    name: 'Bitcoin',
    nameKo: '비트코인',
    initialPrice: 85000000, // 8500만원
    volatility: 2.0,
    marketCap: 1700000000000000, // 1700조
    description: '최초의 암호화폐, 디지털 금'
  },
  {
    id: 'ETH',
    symbol: 'ETH',
    name: 'Ethereum',
    nameKo: '이더리움',
    initialPrice: 4500000, // 450만원
    volatility: 2.2,
    marketCap: 550000000000000,
    description: '스마트 컨트랙트 플랫폼'
  },
  {
    id: 'BNB',
    symbol: 'BNB',
    name: 'Binance Coin',
    nameKo: '바이낸스코인',
    initialPrice: 680000,
    volatility: 2.5,
    marketCap: 100000000000000,
    description: '바이낸스 거래소 유틸리티 토큰'
  },
  {
    id: 'XRP',
    symbol: 'XRP',
    name: 'Ripple',
    nameKo: '리플',
    initialPrice: 1200,
    volatility: 2.8,
    marketCap: 65000000000000,
    description: '국제 송금 및 결제 프로토콜'
  },
  {
    id: 'ADA',
    symbol: 'ADA',
    name: 'Cardano',
    nameKo: '카르다노',
    initialPrice: 850,
    volatility: 2.4,
    marketCap: 30000000000000,
    description: '3세대 블록체인 플랫폼'
  },
  {
    id: 'SOL',
    symbol: 'SOL',
    name: 'Solana',
    nameKo: '솔라나',
    initialPrice: 180000,
    volatility: 3.0,
    marketCap: 80000000000000,
    description: '고성능 블록체인 네트워크'
  },
  {
    id: 'DOGE',
    symbol: 'DOGE',
    name: 'Dogecoin',
    nameKo: '도지코인',
    initialPrice: 180,
    volatility: 3.5,
    marketCap: 25000000000000,
    description: '밈에서 시작된 커뮤니티 코인'
  },
  {
    id: 'DOT',
    symbol: 'DOT',
    name: 'Polkadot',
    nameKo: '폴카닷',
    initialPrice: 12000,
    volatility: 2.6,
    marketCap: 15000000000000,
    description: '크로스체인 상호운용성 프로토콜'
  },
  {
    id: 'MATIC',
    symbol: 'MATIC',
    name: 'Polygon',
    nameKo: '폴리곤',
    initialPrice: 1800,
    volatility: 2.9,
    marketCap: 12000000000000,
    description: '이더리움 레이어2 스케일링 솔루션'
  },
  {
    id: 'LINK',
    symbol: 'LINK',
    name: 'Chainlink',
    nameKo: '체인링크',
    initialPrice: 25000,
    volatility: 2.7,
    marketCap: 14000000000000,
    description: '탈중앙화 오라클 네트워크'
  }
];

// 종목 가격 데이터 저장소 (실시간 가격)
const stockPrices = {};
const cryptoPrices = {};

// 가격 히스토리 저장소 (차트용)
const stockHistory = {};
const cryptoHistory = {};

// 초기화 함수
function initializeStockData() {
  // 주식 초기 가격 설정
  STOCKS.forEach(stock => {
    stockPrices[stock.id] = {
      current: stock.initialPrice,
      open: stock.initialPrice,
      high: stock.initialPrice,
      low: stock.initialPrice,
      previous: stock.initialPrice,
      volume: Utils.randomInt(100000, 1000000),
      change: 0,
      changePercent: 0,
      lastUpdate: Date.now()
    };

    stockHistory[stock.id] = [{
      timestamp: Date.now(),
      price: stock.initialPrice,
      volume: stockPrices[stock.id].volume
    }];
  });

  // 암호화폐 초기 가격 설정
  CRYPTO.forEach(crypto => {
    cryptoPrices[crypto.id] = {
      current: crypto.initialPrice,
      open: crypto.initialPrice,
      high: crypto.initialPrice,
      low: crypto.initialPrice,
      previous: crypto.initialPrice,
      volume: Utils.randomInt(10000, 100000),
      change: 0,
      changePercent: 0,
      lastUpdate: Date.now()
    };

    cryptoHistory[crypto.id] = [{
      timestamp: Date.now(),
      price: crypto.initialPrice,
      volume: cryptoPrices[crypto.id].volume
    }];
  });

  Utils.log('Stock data initialized:', STOCKS.length, 'stocks,', CRYPTO.length, 'cryptocurrencies');
}

// 종목 검색
function findStock(idOrSymbol) {
  return STOCKS.find(s => s.id === idOrSymbol || s.symbol === idOrSymbol);
}

function findCrypto(idOrSymbol) {
  return CRYPTO.find(c => c.id === idOrSymbol || c.symbol === idOrSymbol);
}

// 섹터별 종목 가져오기
function getStocksBySector(sector) {
  if (sector === 'all') return STOCKS;
  return STOCKS.filter(s => s.sector === sector);
}

// 가격 정보 가져오기
function getStockPrice(stockId) {
  return stockPrices[stockId];
}

function getCryptoPrice(cryptoId) {
  return cryptoPrices[cryptoId];
}

// 히스토리 가져오기
function getStockHistory(stockId, limit = 100) {
  const history = stockHistory[stockId] || [];
  return history.slice(-limit);
}

function getCryptoHistory(cryptoId, limit = 100) {
  const history = cryptoHistory[cryptoId] || [];
  return history.slice(-limit);
}
