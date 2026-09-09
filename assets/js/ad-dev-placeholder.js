/**
 * ad-dev-placeholder.js
 * 로컬 프리뷰(localhost 등)에서는 AdSense가 절대 채워지지 않아 <ins class="adsbygoogle">
 * 자리가 빈 공간으로 보인다. 이 스크립트는 로컬 환경에서만 그 자리에 눈에 띄는
 * placeholder를 대신 띄워서 광고 위치를 바로 확인할 수 있게 한다.
 * 실제 배포 도메인에서는 아무 동작도 하지 않는다 (raw <ins> 태그와
 * wooa-sidebar.js 등이 JS로 나중에 삽입하는 <ins> 태그 모두 감지한다).
 */
(function () {
  var isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname) ||
    location.protocol === 'file:';
  if (!isLocal) return;

  var style = document.createElement('style');
  style.textContent =
    '.ad-dev-placeholder{background:repeating-linear-gradient(45deg,#f5f5f5,#f5f5f5 10px,#ebebeb 10px,#ebebeb 20px);' +
    'border:2px dashed #ccc;border-radius:8px;padding:16px;text-align:center;color:#999;' +
    'font-size:.8rem;font-weight:500;min-height:50px;display:flex;align-items:center;justify-content:center;' +
    'width:100%;box-sizing:border-box;}';
  document.head.appendChild(style);

  function decorate(ins) {
    if (ins.dataset.adDevDone) return;
    ins.dataset.adDevDone = '1';
    var slot = ins.getAttribute('data-ad-slot') || '?';
    var box = document.createElement('div');
    box.className = 'ad-dev-placeholder';
    box.textContent = '📢 광고 영역 (slot: ' + slot + ')';
    ins.style.display = 'none';
    ins.insertAdjacentElement('afterend', box);
  }

  function scan() {
    document.querySelectorAll('ins.adsbygoogle').forEach(decorate);
  }

  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
