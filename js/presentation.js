/**
 * presentation.js
 * 3D Presentation Engine: Slide Camera Transitions, Tilt Cards, Magnetic Buttons & Gesture Controls
 */

(function () {
let cur = 0;
let S = [];
let dots = null;

function initPresentation() {
  S = [...document.querySelectorAll('.slide')];
  dots = document.getElementById('dots');
  if (!dots) return;

  dots.innerHTML = '';
  S.forEach((s, i) => {
    const d = document.createElement('button');
    d.className = 'dot';
    d.title = s.dataset.t || `Slide ${i + 1}`;
    d.setAttribute('aria-label', 'Slide ' + (i + 1) + ': ' + (s.dataset.t || ''));
    d.onclick = () => goTo(i);
    dots.appendChild(d);
  });

  const bPrev = document.getElementById('bPrev');
  const bNext = document.getElementById('bNext');
  const bAgain = document.getElementById('bAgain');

  if (bPrev) bPrev.onclick = () => goTo(cur - 1);
  if (bNext) bNext.onclick = () => goTo(cur + 1);
  if (bAgain) {
    bAgain.onclick = () => {
      if (typeof window.mulaiSimulasi === 'function') window.mulaiSimulasi();
      const simIdx = S.findIndex(s => s.dataset.t === 'Simulator');
      goTo(simIdx >= 0 ? simIdx : 2);
    };
  }

  document.querySelectorAll('[data-go]').forEach(b => {
    b.addEventListener('click', () => goTo(+b.dataset.go));
  });

  window.addEventListener('keydown', e => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') goTo(cur + 1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') goTo(cur - 1);
  });

  let tx0 = 0;
  let ty0 = 0;
  window.addEventListener('touchstart', e => {
    tx0 = e.touches[0].clientX;
    ty0 = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx0;
    const dy = e.changedTouches[0].clientY - ty0;
    const target = e.target;
    if (
      Math.abs(dx) > 75 &&
      Math.abs(dx) > Math.abs(dy) * 1.4 &&
      !['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) &&
      !target.closest('button') &&
      !target.closest('input') &&
      !target.closest('select') &&
      !target.closest('#chart')
    ) {
      goTo(cur + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  // 3D Card Tilt (desktop/mouse only)
  document.querySelectorAll('.tilt').forEach(c => {
    c.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--ry', (x - 0.5) * 12 + 'deg');
      c.style.setProperty('--rx', (0.5 - y) * 12 + 'deg');
      c.style.setProperty('--mx', x * 100 + '%');
      c.style.setProperty('--my', y * 100 + '%');
      c.style.setProperty('--gl', 1);
    });
    c.addEventListener('pointerleave', () => {
      c.style.setProperty('--rx', '0deg');
      c.style.setProperty('--ry', '0deg');
      c.style.setProperty('--gl', 0);
    });
  });

  // Magnetic Buttons & Burst Effect (mouse magnetic + touch/click burst)
  document.querySelectorAll('.b3').forEach(b => {
    b.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = b.getBoundingClientRect();
      b.style.translate = (e.clientX - r.left - r.width / 2) * 0.08 + 'px 0';
    });
    b.addEventListener('pointerleave', () => {
      b.style.translate = '0 0';
    });
    b.addEventListener('click', e => {
      const r = b.getBoundingClientRect();
      if (typeof window.burst === 'function') {
        window.burst(r.left + r.width / 2, r.top + r.height / 2, 16);
      }
    });
  });
}

function goTo(n) {
  if (S.length === 0) return;
  n = Math.max(0, Math.min(S.length - 1, n));
  const previous = cur;
  cur = n;

  const stage = document.getElementById('stage');
  if (stage) {
    stage.classList.remove('bg-forward', 'bg-back');
    void stage.offsetWidth;
    if (n !== previous) stage.classList.add(n > previous ? 'bg-forward' : 'bg-back');
  }

  S.forEach((s, i) => {
    s.className = 'slide ' + (i < n ? 'before' : i > n ? 'after' : 'cur');
  });

  if (dots && dots.children) {
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === n));
  }

  if (S[n]) S[n].scrollTop = 0;

  const bPrev = document.getElementById('bPrev');
  const bNext = document.getElementById('bNext');
  if (bPrev) bPrev.disabled = n === 0;
  if (bNext) bNext.disabled = n === S.length - 1;

  // HUD
  const pct = ((n + 1) / S.length) * 100;
  const progressFill = document.getElementById('progressFill');
  const slideCount = document.getElementById('slideCount');
  const slideName = document.getElementById('slideName');

  if (progressFill) progressFill.style.width = pct + '%';
  if (slideCount) slideCount.textContent = String(n + 1).padStart(2, '0') + ' / ' + String(S.length).padStart(2, '0');
  if (slideName) slideName.textContent = (S[n]?.dataset.t || 'SLIDE').toUpperCase();

  // Replay animation
  const active = S[n];
  if (active) {
    active.classList.remove('replay');
    void active.offsetWidth;
    active.classList.add('replay');
  }

  if (S[n]?.dataset.t === 'Kurva' && typeof window.drawChart === 'function') {
    window.drawChart(true);
  }
}

window.goTo = goTo;
window.initPresentation = initPresentation;
})();
