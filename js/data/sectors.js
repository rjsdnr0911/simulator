/* ============================================
   Sectors Data - 섹터 정보
   ============================================ */

const SECTORS = {
  technology: {
    name: '기술',
    nameEn: 'Technology',
    icon: '💻',
    color: '#3b82f6',
    description: 'IT, 반도체, 소프트웨어 등',
    sensitivity: {
      interest: -0.8,      // 금리에 민감 (낮을수록 좋음)
      innovation: 1.2,     // 혁신 뉴스에 민감
      regulation: -0.6     // 규제에 민감
    }
  },
  automotive: {
    name: '자동차',
    nameEn: 'Automotive',
    icon: '🚗',
    color: '#ef4444',
    description: '자동차, 배터리, 전기차 등',
    sensitivity: {
      interest: -0.5,
      oilPrice: -0.7,      // 유가에 민감
      innovation: 0.9
    }
  },
  finance: {
    name: '금융',
    nameEn: 'Finance',
    icon: '🏦',
    color: '#10b981',
    description: '은행, 보험, 핀테크 등',
    sensitivity: {
      interest: 0.8,       // 금리 상승 시 유리
      regulation: -0.9,
      economy: 1.0         // 경제 상황에 민감
    }
  },
  entertainment: {
    name: '엔터테인먼트',
    nameEn: 'Entertainment',
    icon: '🎬',
    color: '#f59e0b',
    description: '미디어, 게임, 콘텐츠 등',
    sensitivity: {
      consumer: 0.8,       // 소비심리에 민감
      cultural: 1.0,       // 문화 트렌드에 민감
      platform: 0.7
    }
  },
  consumer: {
    name: '소비재',
    nameEn: 'Consumer',
    icon: '🛍️',
    color: '#8b5cf6',
    description: '식품, 화장품, 의류 등',
    sensitivity: {
      consumer: 1.0,
      economy: 0.6,
      seasonal: 0.5        // 계절성 있음
    }
  },
  manufacturing: {
    name: '제조',
    nameEn: 'Manufacturing',
    icon: '🏭',
    color: '#64748b',
    description: '철강, 화학, 조선 등',
    sensitivity: {
      economy: 0.9,
      commodity: 0.8,      // 원자재 가격에 민감
      export: 0.7          // 수출에 민감
    }
  }
};

// 섹터 정보 가져오기
function getSectorInfo(sectorKey) {
  return SECTORS[sectorKey];
}

// 모든 섹터 목록
function getAllSectors() {
  return Object.entries(SECTORS).map(([key, value]) => ({
    key,
    ...value
  }));
}

// 섹터 색상 가져오기
function getSectorColor(sectorKey) {
  return SECTORS[sectorKey]?.color || '#6b7280';
}

// 섹터 아이콘 가져오기
function getSectorIcon(sectorKey) {
  return SECTORS[sectorKey]?.icon || '📊';
}
