/* ============================================
   News Database - 뉴스 데이터베이스
   ============================================ */

const NEWS_TEMPLATES = {
  // 긍정적 뉴스
  positive: [
    // 기술 섹터
    {
      sector: 'technology',
      targets: ['TECH001', 'TECH002', 'TECH003', 'TECH004'],
      templates: [
        { text: '{name}, 차세대 AI 칩 개발 성공 발표', impact: 0.08 },
        { text: '{name}, 글로벌 빅테크와 대규모 공급 계약 체결', impact: 0.12 },
        { text: '{name}, 분기 실적 시장 예상 20% 상회', impact: 0.10 },
        { text: '{name}, 혁신적인 기술 특허 승인', impact: 0.06 },
        { text: '{name}, 클라우드 사업 부문 급성장', impact: 0.07 },
        { text: '정부, {name} 포함 반도체 산업 대규모 지원 발표', impact: 0.09 }
      ]
    },
    // 자동차 섹터
    {
      sector: 'automotive',
      targets: ['AUTO001', 'AUTO002', 'AUTO003'],
      templates: [
        { text: '{name}, 신형 전기차 사전 예약 10만대 돌파', impact: 0.11 },
        { text: '{name}, 자율주행 기술 레벨4 인증 획득', impact: 0.13 },
        { text: '{name}, 배터리 효율 30% 개선 신기술 공개', impact: 0.09 },
        { text: '{name}, 북미 시장 진출 본격화', impact: 0.08 },
        { text: '{name}, 친환경차 부문 정부 보조금 확대', impact: 0.05 }
      ]
    },
    // 금융 섹터
    {
      sector: 'finance',
      targets: ['FIN001', 'FIN002', 'FIN003'],
      templates: [
        { text: '{name}, 순이익 전년 대비 25% 증가', impact: 0.07 },
        { text: '{name}, 디지털 뱅킹 사용자 500만 돌파', impact: 0.08 },
        { text: '{name}, 신용등급 상향 조정', impact: 0.06 },
        { text: '{name}, 해외 금융사와 전략적 제휴', impact: 0.09 },
        { text: '금융당국, {name} 혁신금융서비스 지정', impact: 0.05 }
      ]
    },
    // 엔터테인먼트 섹터
    {
      sector: 'entertainment',
      targets: ['ENT001', 'ENT002', 'ENT003'],
      templates: [
        { text: '{name}, 신규 걸그룹 데뷔곡 빌보드 차트 진입', impact: 0.10 },
        { text: '{name}, 오리지널 드라마 넷플릭스 1위 달성', impact: 0.12 },
        { text: '{name}, 신작 게임 출시 첫 주 100만 다운로드', impact: 0.09 },
        { text: '{name}, 글로벌 엔터사와 공동 제작 계약', impact: 0.08 },
        { text: '{name}, 메타버스 콘서트 성공적 개최', impact: 0.07 }
      ]
    },
    // 소비재 섹터
    {
      sector: 'consumer',
      targets: ['CONS001', 'CONS002', 'CONS003'],
      templates: [
        { text: '{name}, 신제품 출시 첫 달 매출 목표 200% 달성', impact: 0.08 },
        { text: '{name}, 중국 시장 점유율 1위 달성', impact: 0.10 },
        { text: '{name}, 글로벌 뷰티 어워드 수상', impact: 0.06 },
        { text: '{name}, 친환경 제품 라인 큰 호응', impact: 0.05 },
        { text: '{name}, 면세점 입점 확대', impact: 0.07 }
      ]
    },
    // 제조 섹터
    {
      sector: 'manufacturing',
      targets: ['MANU001', 'MANU002', 'MANU003'],
      templates: [
        { text: '{name}, 대형 조선 수주 1조원 규모', impact: 0.11 },
        { text: '{name}, 생산 효율 혁신으로 원가 15% 절감', impact: 0.08 },
        { text: '{name}, 친환경 제강 기술 개발 성공', impact: 0.06 },
        { text: '{name}, 중동 플랜트 사업 수주', impact: 0.09 },
        { text: '철강 수요 급증, {name} 수혜 전망', impact: 0.07 }
      ]
    }
  ],

  // 부정적 뉴스
  negative: [
    // 기술 섹터
    {
      sector: 'technology',
      targets: ['TECH001', 'TECH002', 'TECH003', 'TECH004'],
      templates: [
        { text: '{name}, 개인정보 유출 사고 발생', impact: -0.10 },
        { text: '{name}, 분기 실적 부진 시장 충격', impact: -0.12 },
        { text: '{name}, 주요 고객사 계약 해지', impact: -0.09 },
        { text: '{name}, 반독점 규제 조사 착수', impact: -0.08 },
        { text: '{name}, 신제품 출시 지연 발표', impact: -0.06 },
        { text: '{name}, 핵심 인력 대거 이탈', impact: -0.07 }
      ]
    },
    // 자동차 섹터
    {
      sector: 'automotive',
      targets: ['AUTO001', 'AUTO002', 'AUTO003'],
      templates: [
        { text: '{name}, 배터리 화재 사고로 리콜 발표', impact: -0.13 },
        { text: '{name}, 반도체 수급 문제로 생산 차질', impact: -0.08 },
        { text: '{name}, 자율주행 사고로 소송 제기', impact: -0.10 },
        { text: '{name}, 노조 파업으로 공장 가동 중단', impact: -0.09 },
        { text: '{name}, 판매 부진으로 재고 급증', impact: -0.07 }
      ]
    },
    // 금융 섹터
    {
      sector: 'finance',
      targets: ['FIN001', 'FIN002', 'FIN003'],
      templates: [
        { text: '{name}, 부실채권 급증 우려', impact: -0.09 },
        { text: '{name}, 금융감독원 검사 착수', impact: -0.08 },
        { text: '{name}, 대출 연체율 상승', impact: -0.07 },
        { text: '{name}, 사이버 보안 사고 발생', impact: -0.06 },
        { text: '{name}, 분기 순이익 적자 전환', impact: -0.11 }
      ]
    },
    // 엔터테인먼트 섹터
    {
      sector: 'entertainment',
      targets: ['ENT001', 'ENT002', 'ENT003'],
      templates: [
        { text: '{name}, 소속 아티스트 계약 분쟁', impact: -0.08 },
        { text: '{name}, 신작 흥행 참패', impact: -0.10 },
        { text: '{name}, 게임 서비스 장애 발생', impact: -0.06 },
        { text: '{name}, 표절 논란 확산', impact: -0.09 },
        { text: '{name}, 주요 콘텐츠 제작 취소', impact: -0.07 }
      ]
    },
    // 소비재 섹터
    {
      sector: 'consumer',
      targets: ['CONS001', 'CONS002', 'CONS003'],
      templates: [
        { text: '{name}, 제품 품질 문제로 리콜', impact: -0.09 },
        { text: '{name}, 원자재 가격 급등으로 수익성 악화', impact: -0.07 },
        { text: '{name}, 중국 시장 판매 급감', impact: -0.08 },
        { text: '{name}, 유해 성분 논란', impact: -0.10 },
        { text: '{name}, 경쟁사 신제품에 밀려', impact: -0.06 }
      ]
    },
    // 제조 섹터
    {
      sector: 'manufacturing',
      targets: ['MANU001', 'MANU002', 'MANU003'],
      templates: [
        { text: '{name}, 공장 사고로 생산 중단', impact: -0.10 },
        { text: '{name}, 환경 규제 위반 적발', impact: -0.08 },
        { text: '{name}, 수주 취소로 실적 타격', impact: -0.09 },
        { text: '{name}, 철강 수요 급감 전망', impact: -0.07 },
        { text: '{name}, 노사 갈등 심화', impact: -0.06 }
      ]
    }
  ],

  // 중립/시장 전체 뉴스
  market: [
    { text: '한국은행, 기준금리 0.25%p 인상', impact: -0.03, sectors: ['all'] },
    { text: '한국은행, 기준금리 0.25%p 인하', impact: 0.03, sectors: ['all'] },
    { text: 'KOSPI, 3,000선 돌파', impact: 0.04, sectors: ['all'] },
    { text: 'KOSPI, 2,500선 붕괴', impact: -0.04, sectors: ['all'] },
    { text: '달러-원 환율 1,400원 돌파', impact: -0.02, sectors: ['all'] },
    { text: '달러-원 환율 1,200원 하회', impact: 0.02, sectors: ['all'] },
    { text: '국제유가 배럴당 100달러 돌파', impact: -0.03, sectors: ['automotive', 'manufacturing'] },
    { text: '국제유가 급락, 배럴당 60달러', impact: 0.03, sectors: ['automotive', 'manufacturing'] },
    { text: '미국 증시 급락, 글로벌 증시 동반 하락', impact: -0.05, sectors: ['all'] },
    { text: '미국 증시 사상 최고치 경신', impact: 0.05, sectors: ['all'] },
    { text: '정부, 소비 진작 대책 발표', impact: 0.03, sectors: ['consumer', 'entertainment'] },
    { text: '기업 실적 시즌, 전반적 양호한 흐름', impact: 0.02, sectors: ['all'] },
    { text: '반도체 수출 호조, 무역수지 개선', impact: 0.04, sectors: ['technology'] },
    { text: '중국 경제 성장률 둔화', impact: -0.03, sectors: ['all'] },
    { text: '글로벌 경기 회복 기대감 확산', impact: 0.04, sectors: ['all'] }
  ],

  // 암호화폐 뉴스
  crypto: [
    { text: '비트코인, 사상 최고가 경신', impact: 0.08, targets: ['BTC'] },
    { text: '비트코인 ETF 승인', impact: 0.12, targets: ['BTC', 'ETH'] },
    { text: '주요 국가, 암호화폐 규제 강화', impact: -0.10, targets: 'all' },
    { text: '대형 거래소 해킹 사고', impact: -0.15, targets: 'all' },
    { text: '이더리움 2.0 업그레이드 성공', impact: 0.09, targets: ['ETH'] },
    { text: '테슬라, 비트코인 결제 재개', impact: 0.07, targets: ['BTC'] },
    { text: '엘살바도르, 비트코인 법정화폐 채택', impact: 0.05, targets: ['BTC'] },
    { text: '중국, 암호화폐 거래 전면 금지', impact: -0.12, targets: 'all' },
    { text: 'NFT 시장 급성장', impact: 0.06, targets: ['ETH', 'SOL'] },
    { text: 'DeFi 프로토콜 취약점 발견', impact: -0.08, targets: ['ETH', 'BNB'] },
    { text: '기관투자자 암호화폐 매수 확대', impact: 0.10, targets: 'all' },
    { text: '암호화폐 시장 조정 국면 진입', impact: -0.07, targets: 'all' }
  ]
};

// 난이도별 뉴스 명확도
const NEWS_CLARITY = {
  high: {
    // 쉬움: 명확한 힌트
    positivePrefix: ['📈 호재!', '🎉 긍정적!', '✨ 좋은 소식!'],
    negativePrefix: ['📉 악재!', '⚠️ 주의!', '❌ 나쁜 소식!'],
    showImpact: true
  },
  medium: {
    // 보통: 보통 힌트
    positivePrefix: ['📰', '뉴스속보:', ''],
    negativePrefix: ['📰', '뉴스속보:', ''],
    showImpact: false
  },
  low: {
    // 어려움: 모호한 힌트
    positivePrefix: ['', '', ''],
    negativePrefix: ['', '', ''],
    showImpact: false
  }
};

// 뉴스 생성 함수
function generateNews(difficulty = 'normal', forCrypto = false) {
  const clarity = CONFIG.newsClarity[difficulty];
  const templates = forCrypto ? NEWS_TEMPLATES.crypto : null;

  let selectedNews;
  let targets = [];
  let impact = 0;

  if (forCrypto) {
    // 암호화폐 뉴스
    selectedNews = Utils.randomChoice(NEWS_TEMPLATES.crypto);
    if (selectedNews.targets === 'all') {
      targets = CRYPTO.map(c => c.id);
    } else {
      targets = selectedNews.targets;
    }
    impact = selectedNews.impact;
  } else {
    // 주식 뉴스
    const newsType = Math.random();

    if (newsType < 0.35) {
      // 긍정적 뉴스 (35%)
      const sectorNews = Utils.randomChoice(NEWS_TEMPLATES.positive);
      const template = Utils.randomChoice(sectorNews.templates);
      const stock = Utils.randomChoice(sectorNews.targets.map(id => findStock(id)));

      selectedNews = {
        text: template.text.replace('{name}', stock.nameKo),
        impact: template.impact
      };
      targets = [stock.id];
      impact = template.impact;
    } else if (newsType < 0.70) {
      // 부정적 뉴스 (35%)
      const sectorNews = Utils.randomChoice(NEWS_TEMPLATES.negative);
      const template = Utils.randomChoice(sectorNews.templates);
      const stock = Utils.randomChoice(sectorNews.targets.map(id => findStock(id)));

      selectedNews = {
        text: template.text.replace('{name}', stock.nameKo),
        impact: template.impact
      };
      targets = [stock.id];
      impact = template.impact;
    } else {
      // 시장 전체 뉴스 (30%)
      selectedNews = Utils.randomChoice(NEWS_TEMPLATES.market);

      if (selectedNews.sectors.includes('all')) {
        targets = STOCKS.map(s => s.id);
      } else {
        targets = STOCKS
          .filter(s => selectedNews.sectors.includes(s.sector))
          .map(s => s.id);
      }
      impact = selectedNews.impact;
    }
  }

  // 난이도에 따라 뉴스 표시 형식 조정
  let displayText = selectedNews.text;

  if (clarity === 'high') {
    const prefix = impact > 0
      ? Utils.randomChoice(NEWS_CLARITY.high.positivePrefix)
      : Utils.randomChoice(NEWS_CLARITY.high.negativePrefix);

    if (prefix) {
      displayText = `${prefix} ${displayText}`;
    }
  }

  return {
    text: displayText,
    impact: impact * CONFIG.newsImpact[difficulty],
    targets: targets,
    timestamp: Date.now(),
    type: forCrypto ? 'crypto' : 'stock'
  };
}
