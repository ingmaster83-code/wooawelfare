/**
 * wooa-sidebar.js (KO)
 * tool-sidebar / index-sidebar: AdSense(1419180025)
 * 도구 페이지 인콘텐츠 광고는 wooahouse-originals-tool.js 에서 처리
 */
(function () {
  function init() {
    var t = document.querySelector('.tool-sidebar') || document.querySelector('.index-sidebar');
    if (!t || t.children.length > 0) return;

    function mkCard(extraStyle) {
      var d = document.createElement('div');
      d.className = 'ad-card';
      if (extraStyle) d.style.cssText = extraStyle;
      return d;
    }

    function mkIns(slot) {
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.cssText = 'display:block;width:100%';
      ins.setAttribute('data-ad-client', 'ca-pub-6464921081676309');
      ins.setAttribute('data-ad-slot', slot);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      return ins;
    }

    // ── AdSense 1 ──────────────────────────────────────────
    var card1 = mkCard();
    card1.appendChild(mkIns('1419180025'));
    t.appendChild(card1);
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
