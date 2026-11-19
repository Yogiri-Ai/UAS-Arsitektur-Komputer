/**
 * chart.js
 * Visualisasi Kurva Denda Berbatas (SVG Dinamis & Interaktif)
 * Mendukung Bebas Denda (<= 1 hari), Batas Maksimum (Rp500.000), & Sinkronisasi Kategori Alat
 */

(function () {
  let CH = null;
  const HARI_BEBAS = 1;
  const DENDA_MAKS = 500000;

  const $ = id => document.getElementById(id);
  const fmt = n => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const sh = v => (v >= 1e6 ? +(v / 1e6).toFixed(1) + ' jt' : v >= 1e3 ? Math.round(v / 1e3) + ' rb' : '' + v);

  function syncCategorySelect(tarifVal) {
    const sel = $('inputKategori');
    if (!sel) return;
    const match = [...sel.options].find(o => o.value === String(tarifVal));
    sel.value = match ? match.value : 'custom';
  }

  function drawChart(anim = true) {
    const hariInput = $('inputHari');
    const tarifInput = $('inputTarif');
    if (!hariInput || !tarifInput) return;

    const hari = Math.max(0, Number(String(hariInput.value).replace(',', '.')) || 0);
    const tarif = Math.max(0, Number(String(tarifInput.value).replace(',', '.')) || 0);
    const nilai = x => (x <= HARI_BEBAS ? 0 : Math.min(tarif * x, DENDA_MAKS));

    if ($('rgH')) $('rgH').value = hari;
    if ($('rgT')) $('rgT').value = tarif;
    if ($('vh')) $('vh').textContent = fmt(hari) + ' hari';
    if ($('vt')) $('vt').textContent = 'Rp' + fmt(tarif);

    const T = nilai(hari);
    if ($('fx')) {
      $('fx').textContent =
        hari <= HARI_BEBAS
          ? `Bebas denda: keterlambatan ≤ ${HARI_BEBAS} hari`
          : `Total = ${fmt(tarif)} × ${fmt(hari)} = Rp${fmt(Math.round(T))}${T >= DENDA_MAKS ? ' (batas maksimum)' : ''}`;
    }

    const M = Math.max(10, Math.ceil((hari + 1) / 5) * 5);
    const Ym = Math.max(1, Math.min(tarif * M, DENDA_MAKS));
    const w = 640, h = 340, l = 64, r = 22, t = 22, b = 46;
    const X = x => l + (x / M) * (w - l - r);
    const Y = y => h - b - (y / Ym) * (h - t - b);

    let s =
      '<defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#ffd166" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#ffd166" stop-opacity="0"/>' +
      '</linearGradient></defs>';

    for (let i = 0; i <= 5; i++) {
      const y = (Ym * i) / 5;
      s += `<line class="gl" x1="${l}" x2="${w - r}" y1="${Y(y)}" y2="${Y(y)}"/><text class="tx" x="${l - 8}" y="${Y(y) + 4}" text-anchor="end">${sh(y)}</text>`;
    }
    for (let i = 0; i <= M; i += M / 5) {
      s += `<text class="tx" x="${X(i)}" y="${h - b + 20}" text-anchor="middle">${i}</text>`;
    }
    s += `<text class="tx" x="${(l + w - r) / 2}" y="${h - 6}" text-anchor="middle">hari terlambat</text>`;
    s += `<path d="M${X(0)} ${Y(0)}L${X(hari)} ${Y(T)}L${X(hari)} ${Y(0)}Z" fill="url(#ga)"/>`;

    let jalur = `M${X(0)} ${Y(0)}`;
    for (let i = 1; i <= M; i++) {
      jalur += `L${X(i)} ${Y(nilai(i))}`;
    }
    s += `<path class="ln" pathLength="1" d="${jalur}"/>`;

    const stepDot = M > 50 ? Math.ceil(M / 30) : 1;
    for (let i = 0; i <= M; i += stepDot) {
      s += `<circle class="dt" style="animation-delay:${(0.3 + (i * 1.1) / M).toFixed(2)}s" cx="${X(i)}" cy="${Y(nilai(i))}" r="3.5"/>`;
    }

    s += `<line class="mk" x1="${X(hari)}" x2="${X(hari)}" y1="${Y(0)}" y2="${Y(T)}"/><line class="mk" x1="${l}" x2="${X(hari)}" y1="${Y(T)}" y2="${Y(T)}"/>`;
    s += `<circle class="pt" cx="${X(hari)}" cy="${Y(T)}" r="8"/>`;
    s += `<g id="cx" style="display:none"><line class="cl" id="cxl" y1="${t}" y2="${h - b}"/><circle id="cxc" r="6" fill="#4de2e8"/></g>`;

    const chartEl = $('chart');
    if (chartEl) {
      chartEl.innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Kurva total denda terhadap hari terlambat">${s}</svg>`;
      chartEl.classList.toggle('noanim', !anim);
    }
    CH = { w, l, r, M, X, Y, tarif, nilai };
  }

  function initChart() {
    const chartEl = $('chart');
    if (chartEl) {
      chartEl.addEventListener('pointermove', e => {
        if (!CH) return;
        const svg = chartEl.querySelector('svg');
        if (!svg) return;
        const rc = svg.getBoundingClientRect();
        let d = Math.round((((e.clientX - rc.left) / rc.width) * CH.w - CH.l) / (CH.w - CH.l - CH.r) * CH.M);
        d = Math.max(0, Math.min(CH.M, d));

        const val = CH.nilai(d);
        const cx = $('cx');
        const cxl = $('cxl');
        const cxc = $('cxc');
        const readout = $('readout');

        if (cx) cx.style.display = '';
        if (cxl) {
          cxl.setAttribute('x1', CH.X(d));
          cxl.setAttribute('x2', CH.X(d));
        }
        if (cxc) {
          cxc.setAttribute('cx', CH.X(d));
          cxc.setAttribute('cy', CH.Y(val));
        }
        if (readout) readout.textContent = `Hari ke-${d}: Rp${fmt(Math.round(val))}`;
      });

      chartEl.addEventListener('pointerleave', () => {
        const g = $('cx');
        if (g) g.style.display = 'none';
        const readout = $('readout');
        if (readout) readout.textContent = 'Arahkan kursor ke kurva untuk melihat nilai tiap hari.';
      });
    }

    const rgH = $('rgH');
    const rgT = $('rgT');
    if (rgH) {
      rgH.addEventListener('input', e => {
        if ($('inputHari')) $('inputHari').value = e.target.value;
        drawChart(false);
      });
    }
    if (rgT) {
      rgT.addEventListener('input', e => {
        if ($('inputTarif')) $('inputTarif').value = e.target.value;
        syncCategorySelect(e.target.value);
        drawChart(false);
      });
    }

    ['inputHari', 'inputTarif'].forEach(id => {
      const el = $(id);
      if (el) {
        el.addEventListener('input', e => {
          if (id === 'inputTarif') syncCategorySelect(e.target.value);
          drawChart(false);
        });
      }
    });

    const katEl = $('inputKategori');
    if (katEl) {
      katEl.addEventListener('change', e => {
        if (e.target.value === 'custom') {
          if ($('inputTarif')) $('inputTarif').focus();
          return;
        }
        if ($('inputTarif')) $('inputTarif').value = e.target.value;
        drawChart(false);
      });
    }
  }

  window.drawChart = drawChart;
  window.initChart = initChart;
})();
