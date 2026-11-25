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
  if (!detail) return;
  const id = new URLSearchParams(location.search).get('id');
  const book = books.find(b => b.id === id);
  if (!book) { detail.className = 'error'; detail.textContent = '작품을 찾지 못했어요. 전체 작품 보기로 돌아가 주세요.'; return; }
  document.title = book.title + ' | 사운드북 아카이브';
  detail.className = 'detail';
  detail.innerHTML = `
    <div class="story-page">
      <header class="story-heading">
        <p class="eyebrow">STORY ${esc(book.id)} / 11</p>
        <h1>${esc(book.title)}</h1>
      </header>
      <div class="story-cover-wrap">
        <img class="detail-cover" src="${esc(book.cover)}" alt="${esc(book.title)} 표지">
      </div>
      <section class="player" aria-label="오디오북 재생 영역"><h2>오디오북 듣기</h2>
        ${book.audioReady ? `
          <div class="audio-player">
            <audio id="soundbook-audio" preload="metadata" src="${esc(book.audio)}"></audio>
            <label class="sr-only" for="audio-seek">재생 위치 이동</label>
            <input id="audio-seek" class="audio-seek" type="range" min="0" max="1000" step="1" value="0" aria-label="오디오북 재생 위치 이동" aria-valuetext="0분 0초">
            <div class="audio-times"><output id="audio-current">00:00</output><output id="audio-duration">--:--</output></div>
            <div class="audio-controls">
              <button type="button" id="audio-back" aria-label="10초 뒤로 이동"><span aria-hidden="true">↶</span><small>10초 뒤로</small></button>
              <button type="button" id="audio-play" class="audio-play" aria-label="오디오북 재생"><span id="audio-play-icon" aria-hidden="true">▶</span><small id="audio-play-text">재생</small></button>
              <button type="button" id="audio-forward" aria-label="10초 앞으로 이동"><span aria-hidden="true">↷</span><small>10초 앞으로</small></button>
            </div>
            <p class="audio-message" id="audio-message" role="status" aria-live="polite"></p>
          </div>` : `<div class="waiting" role="status"><strong>오디오북을 준비하고 있어요!</strong><span>곧 소리로 만나는 이야기가 찾아옵니다.</span></div>`}
      </section>
      <section class="creators" aria-labelledby="creators-title">
        <h2 id="creators-title">만든 사람들</h2>
        <dl>
          <div><dt>이야기 창작</dt><dd>${esc(book.storyAuthor || '미등록')}</dd></div>
          <div><dt>사운드북 제작</dt><dd>${esc(book.soundbookProducer || '미등록')}</dd></div>
        </dl>
      </section>
      <section class="synopsis" aria-labelledby="synopsis-title">
        <h2 id="synopsis-title">이야기 소개</h2>
        <p class="desc">${esc(book.description || '작품 소개는 추후 추가될 예정입니다.')}</p>
      </section>
      <a class="home-link" href="index.html">전체 작품 둘러보기 →</a>
    </div>`;
  if (!book.audioReady) return;
  const audio = document.getElementById('soundbook-audio');
  const seek = document.getElementById('audio-seek');
  const current = document.getElementById('audio-current');
  const duration = document.getElementById('audio-duration');
  const play = document.getElementById('audio-play');
  const icon = document.getElementById('audio-play-icon');
  const playText = document.getElementById('audio-play-text');
  const message = document.getElementById('audio-message');
  const fmt = s => { s = Number.isFinite(s) && s >= 0 ? Math.floor(s) : 0; return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  function update() {
    const total = audio.duration;
    const pos = audio.currentTime || 0;
    current.textContent = fmt(pos);
    duration.textContent = Number.isFinite(total) ? fmt(total) : '--:--';
    seek.value = Number.isFinite(total) && total > 0 ? String(Math.round(pos / total * 1000)) : '0';
    seek.style.setProperty('--pct', seek.value / 10 + '%');
    seek.setAttribute('aria-valuetext', fmt(pos) + ' / ' + (Number.isFinite(total) ? fmt(total) : '전체 길이 확인 중'));
  }
  function syncPlay() {
    const active = !audio.paused && !audio.ended;
    icon.textContent = active ? 'Ⅱ' : '▶';
    playText.textContent = active ? '일시정지' : '재생';
    play.setAttribute('aria-label', active ? '오디오북 일시정지' : '오디오북 재생');
  }
  play.addEventListener('click', async () => {
    if (!audio.paused) { audio.pause(); return; }
    try { await audio.play(); message.textContent = ''; }
    catch (err) { message.textContent = '오디오를 재생할 수 없어요. 연결 상태를 확인해 주세요.'; }
  });
  document.getElementById('audio-back').addEventListener('click', () => { audio.currentTime = Math.max(0, audio.currentTime - 10); update(); });
  document.getElementById('audio-forward').addEventListener('click', () => { if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(audio.duration, audio.currentTime + 10); update(); });
  seek.addEventListener('input', () => { if (Number.isFinite(audio.duration)) { audio.currentTime = Number(seek.value) / 1000 * audio.duration; update(); } });
  audio.addEventListener('loadedmetadata', update);
  audio.addEventListener('durationchange', update);
  audio.addEventListener('timeupdate', update);
  audio.addEventListener('play', syncPlay);
  audio.addEventListener('pause', syncPlay);
  audio.addEventListener('ended', syncPlay);
  audio.addEventListener('error', () => { message.textContent = '오디오를 불러오지 못했어요. 파일 경로 또는 인터넷 연결을 확인해 주세요.'; });
  syncPlay(); update();
})();
