/* ============================================
   News Ticker - 뉴스 티커 UI
   ============================================ */

// 뉴스 티커 업데이트
function updateNewsTicker(news) {
  const ticker = document.getElementById('newsTicker');

  if (!ticker) return;

  // 뉴스 아이템 생성
  const newsItem = document.createElement('span');
  newsItem.className = 'news-item';
  newsItem.textContent = `📰 ${news.text}`;

  // 기존 뉴스 제거 후 새 뉴스 추가
  ticker.innerHTML = '';
  ticker.appendChild(newsItem);
}
