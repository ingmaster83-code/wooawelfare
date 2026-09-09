(function () {
  const INFO_VISIBLE_COUNT = 5;
  const SITES = [
    { icon: '🔗', name: 'WooaHouse', host: 'wooahouse.com',           url: 'https://wooahouse.com/' },
    { icon: '📄', name: 'WooaPDF',   host: 'pdfkit.wooahouse.com',    url: 'https://pdfkit.wooahouse.com/' },
    { icon: '🖼️', name: 'WooaImage', host: 'imagekit.wooahouse.com',  url: 'https://imagekit.wooahouse.com/' },
    { icon: '🎨', name: 'WooaColor', host: 'colorkit.wooahouse.com',  url: 'https://colorkit.wooahouse.com/' },
    { icon: '✏️', name: 'WooaText',  host: 'textkit.wooahouse.com',   url: 'https://textkit.wooahouse.com/' },
    { icon: '📱', name: 'WooaQR',    host: 'qrkit.wooahouse.com',     url: 'https://qrkit.wooahouse.com/' },
    { icon: '🧮', name: 'WooaCalc',  host: 'calckit.wooahouse.com',   url: 'https://calckit.wooahouse.com/' },
    { icon: '🔤', name: 'WooaFont',  host: 'fontkit.wooahouse.com',   url: 'https://fontkit.wooahouse.com/' },
    { icon: '🍎', name: 'WooaMac',   host: 'mactools.wooahouse.com',  url: 'https://mactools.wooahouse.com/' },
    { icon: '🖥️', name: 'WooaPC',    host: 'pctools.wooahouse.com',   url: 'https://pctools.wooahouse.com/' },
    { icon: '💻', name: 'WooaVS',    host: 'vskit.wooahouse.com',     url: 'https://vskit.wooahouse.com/' },
    { icon: '🎵', name: 'WooaAudio', host: 'wooaaudio.wooahouse.com', url: 'https://wooaaudio.wooahouse.com/' },
    { icon: '🎬', name: 'WooaVideo', host: 'wooavideo.wooahouse.com', url: 'https://wooavideo.wooahouse.com/' },
    { icon: '🔍', name: 'WooaViewer',host: 'wooaviewer.wooahouse.com',url: 'https://wooaviewer.wooahouse.com/' },
    { icon: '🛠️', name: 'WooaDev',   host: 'wooadev.wooahouse.com',   url: 'https://wooadev.wooahouse.com/' },
    { icon: '🔎', name: 'WooaOCR',   host: 'wooaocr.wooahouse.com',   url: 'https://wooaocr.wooahouse.com/' },
    { icon: '📊', name: 'WooaSheet', host: 'wooasheet.wooahouse.com', url: 'https://wooasheet.wooahouse.com/' },
    { icon: '🔎', name: 'WooaSEO',   host: 'wooaseo.wooahouse.com',   url: 'https://wooaseo.wooahouse.com/' },
    { icon: '📝', name: 'WooaGosa',  host: 'wooagosa.wooahouse.com',  url: 'https://wooagosa.wooahouse.com/', badge: 'update' },
    { icon: '📋', name: 'WooaForm',  host: 'wooaform.wooahouse.com',  url: 'https://wooaform.wooahouse.com/', badge: 'new' },
    { divider: true },
    { icon: '💊', name: '이약뭐야',   host: 'wooayak.wooahouse.com',   url: 'https://wooayak.wooahouse.com/',  info: true },
    { icon: '🏥', name: '병원/약국',  host: 'hosppass.wooahouse.com',  url: 'https://hosppass.wooahouse.com/', info: true },
    { icon: '📜', name: '자격증일정', host: 'wooagosapass.wooahouse.com', url: 'https://wooagosapass.wooahouse.com/', info: true },
    { icon: '💰', name: '보조금',     host: 'wooabojopass.wooahouse.com', url: 'https://wooabojopass.wooahouse.com/', info: true },
    { icon: '🏠', name: '청약정보',   host: 'wooaaptpass.wooahouse.com',  url: 'https://wooaaptpass.wooahouse.com/',  info: true },
    { icon: '🏪', name: '전국5일장', host: 'wooasijang.wooahouse.com', url: 'https://wooasijang.wooahouse.com/', info: true },
    { icon: '🅿️', name: '전국 공영주차장', host: 'wooaparking.wooahouse.com', url: 'https://wooaparking.wooahouse.com/', info: true },
    { icon: '📚', name: '전국 도서관', host: 'wooalib.wooahouse.com', url: 'https://wooalib.wooahouse.com/', info: true },
    { icon: '⛺', name: '전국 캠핑장', host: 'wooacamp.wooahouse.com', url: 'https://wooacamp.wooahouse.com/', info: true },
    { icon: '🧸', name: '아이랑 갈만한 곳', host: 'wooakids.wooahouse.com', url: 'https://wooakids.wooahouse.com/', info: true },
    { icon: '🗑️', name: '대형폐기물 수수료', host: 'wooatrash.wooahouse.com', url: 'https://wooatrash.wooahouse.com/', info: true },
  ];

  // ── 검색 모달 ────────────────────────────────────────────────────────────────
  const TOOLS_URL = 'https://wooahouse.com/tools.json';
  let _tools = null, _fetchPromise = null;

  function fetchTools() {
    if (_tools) return Promise.resolve(_tools);
    if (_fetchPromise) return _fetchPromise;
    _fetchPromise = fetch(TOOLS_URL)
      .then(r => r.json())
      .then(data => { _tools = data; return data; })
      .catch(() => { _tools = []; return []; });
    return _fetchPromise;
  }

  function openSearch() {
    injectSearchStyle();
    let modal = document.getElementById('wooa-search-modal');
    if (!modal) {
      modal = buildModal();
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    const inp = document.getElementById('ws-input');
    inp.value = '';
    inp.focus();
    setResults('');
    fetchTools().then(() => setResults(inp.value));
  }

  function closeSearch() {
    const m = document.getElementById('wooa-search-modal');
    if (m) m.style.display = 'none';
  }

  function setResults(q) {
    const el = document.getElementById('ws-results');
    if (!el) return;
    const isEN = window.location.pathname.includes('/en/');
    const isJA = window.location.pathname.includes('/ja/');
    if (!q) {
      el.innerHTML = '<div class="ws-hint">' + (isJA ? 'WooaHouseの全ツールを検索します' : isEN ? 'Search across all WooaHouse tools' : 'WooaHouse 전체 도구를 통합 검색합니다') + '</div>';
      return;
    }
    if (!_tools) {
      el.innerHTML = '<div class="ws-hint">' + (isJA ? '読み込み中...' : isEN ? 'Loading...' : '로딩 중...') + '</div>';
      return;
    }
    const lower = q.toLowerCase();
    const hits = _tools.filter(t => {
      const name = (isEN || isJA) ? (t.ne || t.n) : t.n;
      const desc = (isEN || isJA) ? (t.de || t.d) : t.d;
      return name.toLowerCase().includes(lower) ||
             t.s.toLowerCase().includes(lower) ||
             (desc && desc.toLowerCase().includes(lower));
    }).slice(0, 20);
    if (!hits.length) {
      el.innerHTML = '<div class="ws-hint">' + (isJA ? '検索結果が見つかりません' : isEN ? 'No results found' : '검색 결과가 없습니다') + '</div>';
      return;
    }
    el.innerHTML = hits.map(t => {
      const name = (isEN || isJA) ? (t.ne || t.n) : t.n;
      const url  = (isEN || isJA) ? (t.ue || t.u) : t.u;
      const desc = (isEN || isJA) ? (t.de || t.d) : t.d;
      return `
      <div class="ws-item">
        <a href="${t.su}" class="ws-site-badge" target="_blank" rel="noopener">${t.s}</a>
        <div class="ws-item-right">
          <a href="${url}" class="ws-tool-name">${name}</a>
          ${desc ? `<span class="ws-tool-desc">${desc}</span>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  function buildModal() {
    const isEN = window.location.pathname.includes('/en/');
    const isJA = window.location.pathname.includes('/ja/');
    const ph = isJA ? 'ツール検索... (例: PDF分割, 画像, 圧縮)' : isEN ? 'Search tools... (e.g. PDF, image, compress)' : '도구 검색... (예: PDF 분할, 이미지, 압축)';
    const m = document.createElement('div');
    m.id = 'wooa-search-modal';
    m.innerHTML = `
      <div id="ws-backdrop"></div>
      <div id="ws-box" role="dialog" aria-modal="true" aria-label="통합 검색">
        <div id="ws-header">
          <span id="ws-search-icon">🔍</span>
          <input id="ws-input" type="search" placeholder="${ph}" autocomplete="off" spellcheck="false"/>
          <button id="ws-close-btn" aria-label="닫기">✕</button>
        </div>
        <div id="ws-results">
          <div class="ws-hint">${isJA ? 'WooaHouseの全ツールを検索します' : isEN ? 'Search across all WooaHouse tools' : 'WooaHouse 전체 도구를 통합 검색합니다'}</div>
        </div>
        <div id="ws-footer">
          <span>↵ ${isJA ? '移動' : isEN ? 'Go' : '이동'}</span>
          <span>Esc ${isJA ? '閉じる' : isEN ? 'Close' : '닫기'}</span>
          <span>Ctrl+K ${isJA ? '開く' : isEN ? 'Open' : '열기'}</span>
          <a href="${isEN ? 'https://wooahouse.com/en/search.html' : 'https://wooahouse.com/search.html'}" id="ws-full-link" target="_blank" rel="noopener">
            ${isJA ? '🔎 全体検索ページ' : isEN ? '🔎 Full search page' : '🔎 전체 검색 페이지'}
          </a>
        </div>
      </div>`;
    m.querySelector('#ws-backdrop').addEventListener('click', closeSearch);
    m.querySelector('#ws-close-btn').addEventListener('click', closeSearch);
    m.querySelector('#ws-input').addEventListener('input', e => setResults(e.target.value.trim()));
    m.querySelector('#ws-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const first = document.querySelector('#ws-results .ws-tool-name');
        if (first) window.location.href = first.href;
      }
    });
    return m;
  }

  function injectSearchStyle() {
    if (document.getElementById('ws-style')) return;
    const s = document.createElement('style');
    s.id = 'ws-style';
    s.textContent = `
#wooa-search-modal{display:none;position:fixed;inset:0;z-index:99999;align-items:flex-start;justify-content:center;padding-top:80px}
#ws-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(3px)}
#ws-box{position:relative;z-index:1;background:#fff;border-radius:16px;width:100%;max-width:620px;max-height:70vh;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.25);overflow:hidden}
#ws-header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #e5e7eb}
#ws-search-icon{font-size:18px;flex-shrink:0}
#ws-input{flex:1;border:none;outline:none;font-size:16px;background:transparent;color:#111;min-width:0}
#ws-input::placeholder{color:#9ca3af}
#ws-close-btn{background:none;border:none;cursor:pointer;font-size:16px;color:#6b7280;padding:4px 6px;border-radius:6px;line-height:1}
#ws-close-btn:hover{background:#f3f4f6;color:#111}
#ws-results{overflow-y:auto;flex:1;padding:8px 0}
.ws-hint{padding:20px 16px;color:#9ca3af;font-size:14px;text-align:center}
.ws-item{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;transition:background .12s}
.ws-item:hover{background:#f9fafb}
.ws-site-badge{flex-shrink:0;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;background:#eff6ff;color:#2563eb;text-decoration:none;white-space:nowrap;transition:background .12s}
.ws-site-badge:hover{background:#dbeafe}
.ws-item-right{display:flex;flex-direction:column;gap:2px;min-width:0}
.ws-tool-name{font-size:14px;font-weight:600;color:#111;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ws-tool-name:hover{color:#2563eb;text-decoration:underline}
.ws-tool-desc{font-size:12px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ws-footer{display:flex;align-items:center;gap:16px;padding:8px 16px;border-top:1px solid #e5e7eb;background:#f9fafb;font-size:11px;color:#9ca3af}
#ws-footer span{white-space:nowrap}
#ws-full-link{margin-left:auto;font-size:11px;color:#6b7280;text-decoration:none;white-space:nowrap}
#ws-full-link:hover{color:#2563eb}
@media(max-width:640px){#wooa-search-modal{padding-top:0;align-items:flex-end}#ws-box{border-radius:16px 16px 0 0;max-height:80vh}}
`;
    document.head.appendChild(s);
  }

  // Ctrl+K / Esc 단축키
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    else if (e.key === 'Escape') closeSearch();
  });

  // 외부에서 호출 가능하도록 전역 노출
  window.wooaSearch = openSearch;

  // ── 사이트 바 렌더링 ─────────────────────────────────────────────────────────
  const currentHost = window.location.hostname;
  const isEN = window.location.pathname.includes('/en/');
  const isJA = window.location.pathname.includes('/ja/');
  const label = isJA ? '🏠 WooaHouseファミリーサイト' : isEN ? '🏠 WooaHouse Family Sites' : '🏠 우아하우스 패밀리 사이트 · 도구모음';

  const existing = document.querySelector('.our-sites-bar');
  const bar = document.createElement('div');
  bar.className = 'our-sites-bar';
  const toolSites = SITES.filter(s => !s.divider && !s.info);
  const infoSites = SITES.filter(s => s.info);

  bar.innerHTML = `
    <div class="our-sites-inner">
      <span class="our-sites-label">${label}</span>
      <div class="our-sites-links">
        ${toolSites.map(s => `<a href="${s.url}"${s.host === currentHost ? ' class="active"' : ''} ${s.host === currentHost ? '' : 'target="_blank" rel="noopener"'}>${s.icon} ${s.name}${s.badge === 'new' ? '<span class="ws-nav-badge ws-badge-new">NEW</span>' : s.badge === 'update' ? '<span class="ws-nav-badge ws-badge-update">UPDATE</span>' : ''}</a>`).join('')}
      </div>
      <button class="ws-open-btn" title="${isJA ? 'ツール検索 (Ctrl+K)' : isEN ? 'Search tools (Ctrl+K)' : '도구 검색 (Ctrl+K)'}">🔍 ${isJA ? '検索' : isEN ? 'Search' : '검색'}</button>
    </div>
    <div class="our-sites-info-row">
      <span class="our-sites-info-label">${isJA ? '📌 インフォサイト' : isEN ? '📌 Info Sites' : '📌 패밀리 정보 사이트'}</span>
      ${infoSites.slice(0, INFO_VISIBLE_COUNT).map(s => `<a href="${s.url}" class="sites-info-btn${s.host === currentHost ? ' active' : ''}" target="_blank" rel="noopener">${s.icon} ${s.name}</a>`).join('')}
      ${infoSites.length > INFO_VISIBLE_COUNT ? `<button class="ws-info-more-btn">${isJA ? 'もっと見る' : isEN ? 'More' : '더보기'} (${infoSites.length - INFO_VISIBLE_COUNT}) ▾</button>` : ''}
      ${infoSites.slice(INFO_VISIBLE_COUNT).map(s => `<a href="${s.url}" class="sites-info-btn sites-info-hidden${s.host === currentHost ? ' active' : ''}" target="_blank" rel="noopener">${s.icon} ${s.name}</a>`).join('')}
    </div>`;

  bar.querySelector('.ws-open-btn').addEventListener('click', openSearch);

  const infoMoreBtn = bar.querySelector('.ws-info-more-btn');
  if (infoMoreBtn) {
    infoMoreBtn.addEventListener('click', () => {
      const expanded = bar.classList.toggle('info-expanded');
      infoMoreBtn.innerHTML = expanded
        ? `${isJA ? '閉じる' : isEN ? 'Less' : '접기'} ▴`
        : `${isJA ? 'もっと見る' : isEN ? 'More' : '더보기'} (${infoSites.length - INFO_VISIBLE_COUNT}) ▾`;
    });
  }

  // .ws-open-btn 스타일 (sites-bar 내 버튼)
  const btnStyle = document.createElement('style');
  btnStyle.textContent = `.ws-open-btn{flex-shrink:0;display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:inherit;border-radius:20px;padding:3px 12px;font-size:12px;cursor:pointer;white-space:nowrap;transition:background .15s}.ws-open-btn:hover{background:rgba(255,255,255,.28)}.our-sites-info-row{display:flex;justify-content:center;align-items:center;gap:10px;padding:8px 16px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,.08)}.our-sites-info-label{color:rgba(255,255,255,.5);font-size:12px;white-space:nowrap;margin-right:4px}.sites-info-btn{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.25);color:rgba(255,255,255,.85);border-radius:24px;padding:7px 20px;font-size:15px;font-weight:600;white-space:nowrap;text-decoration:none;transition:background .15s,border-color .15s,transform .1s;flex-shrink:0}.sites-info-btn:hover{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.5);color:#fff;transform:translateY(-1px)}.sites-info-btn.active{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.6)}.our-sites-links a{position:relative}.ws-nav-badge{position:absolute;top:-5px;right:-4px;font-size:7px;font-weight:800;padding:1px 4px;border-radius:6px;line-height:1.4;letter-spacing:.02em;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.3)}.ws-badge-new{background:#EF4444;color:#fff;}.ws-badge-update{background:#10B981;color:#fff;}.sites-info-hidden{display:none;}.our-sites-bar.info-expanded .sites-info-hidden{display:inline-flex;}.ws-info-more-btn{display:inline-flex;align-items:center;gap:4px;background:transparent;border:1.5px dashed rgba(255,255,255,.4);color:rgba(255,255,255,.75);border-radius:24px;padding:7px 16px;font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer;transition:background .15s,color .15s;}.ws-info-more-btn:hover{background:rgba(255,255,255,.12);color:#fff;}`;
  document.head.appendChild(btnStyle);

  if (existing) {
    existing.replaceWith(bar);
  } else {
    const header = document.querySelector('header');
    if (header) header.insertAdjacentElement('afterend', bar);
    else document.body.prepend(bar);
  }
})();
