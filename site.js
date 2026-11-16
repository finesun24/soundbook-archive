(function () {
  'use strict';
  const books = window.SOUNDBOOKS || [];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const library = document.getElementById('library');
  if (library) {
    library.innerHTML = books.map(book => `
      <a class="book-card" href="book.html?id=${encodeURIComponent(book.id)}" aria-label="${esc(book.title)} 상세 페이지 열기">
        <div class="book-image"><img src="${esc(book.cover)}" alt="${esc(book.title)} 표지" loading="lazy"></div>
        <h3>${esc(book.title)}</h3>
        <span class="status ${book.audioReady ? 'ready' : ''}"><span class="status-dot" aria-hidden="true"></span>${book.audioReady ? '오디오북 듣기' : '오디오 준비 중'}</span>
      </a>`).join('');
  }
  const detail = document.getElementById('detail');
  if (detail) {
    const id = new URLSearchParams(location.search).get('id');
    const book = books.find(b => b.id === id);
    if (!book) { detail.className='error'; detail.textContent='작품을 찾지 못했어요. 전체 작품 보기로 돌아가 주세요.'; return; }
    document.title = book.title + ' | 사운드북 아카이브';
    detail.className='detail';
    detail.innerHTML = `
      <img class="detail-cover" src="${esc(book.cover)}" alt="${esc(book.title)} 표지">
      <div class="detail-info"><p class="eyebrow">STORY ${esc(book.id)} / 11</p><h1>${esc(book.title)}</h1>
        <p class="desc">${esc(book.description || '작품 소개는 추후 추가될 예정입니다.')}</p>
        <section class="player" aria-label="오디오북 재생 영역"><h2>오디오북 듣기</h2>
          ${book.audioReady ? `<audio controls preload="metadata" src="${esc(book.audio)}">이 브라우저에서는 오디오 재생을 지원하지 않습니다.</audio>` : `<div class="waiting" role="status"><strong>오디오북을 준비하고 있어요!</strong><span>곧 소리로 만나는 이야기가 찾아옵니다.</span></div>`}
        </section><a class="home-link" href="index.html">전체 작품 둘러보기 →</a>
      </div>`;
  }
})();
