/**
 * simulator.js
 * Logika Simulasi Arsitektur Mini Computer (Von Neumann Machine)
 * Mendukung: Kategori Alat, Input Desimal, Validasi Ketat, Percabangan (CMP/JLE/JGT/JMP),
 * Batas Denda Maksimum, dan Visualisasi Sistem Bus.
 */

(function () {
  let pc = 0;
  let r1 = 0;
  let r2 = 0;
  let r3 = 0;
  let mem100 = 0;
  let timer = null;
  let flag = 0;

  const HARI_BEBAS = 1;
  const DENDA_MAKS = 500000;
  const TARIF_MAKS = 100000;
  const HARI_MAKS = 365;

  const program = [
    "INPUT R1",
    "INPUT R2",
    "CMP R1, 1",
    "JLE 9",
    "MUL R3, R1, R2",
    "CMP R3, 500000",
    "JGT 8",
    "JMP 9",
    "MOV R3, 500000",
    "STORE R3, 100",
    "OUTPUT R3",
    "HALT"
  ];

  const $ = id => document.getElementById(id);
  const fmt = n => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const fmtRp = n => 'Rp' + fmt(Math.round(n));

  function renderRam() {
    const body = $('ramBody');
    if (!body) return;
    body.innerHTML =
      program.map((ins, i) => `<tr id="ram-${i}"><td>${i}</td><td>${ins}</td></tr>`).join('') +
      `<tr id="ram-100"><td>100</td><td id="mem100">0</td></tr>`;
  }

  function clearRam() {
    document.querySelectorAll('#ramBody tr').forEach(tr => tr.classList.remove('active'));
  }

  function setBusState(addr, data, ctrl) {
    const bA = $('busAddress');
    const bD = $('busData');
    const bC = $('busControl');
    if (bA) bA.classList.toggle('active', Boolean(addr));
    if (bD) bD.classList.toggle('active', Boolean(data));
    if (bC) bC.classList.toggle('active', Boolean(ctrl));
  }

  function setLog(text, type = '') {
    const l = $('statusLog');
    if (!l) return;
    l.textContent = text;
    l.classList.remove('pop', 'error', 'ok');
    if (type === 'error') l.classList.add('error');
    if (type === 'ok') l.classList.add('ok');
    void l.offsetWidth;
    l.classList.add('pop');
  }

  function flash(id) {
    const e = $(id);
    if (!e) return;
    e.classList.remove('flash');
    void e.offsetWidth;
    e.classList.add('flash');
  }

  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    const btn = $('bAuto');
    if (btn) btn.textContent = '⏵⏵ Otomatis';
  }

  function spinCube(sym) {
    const cf = $('cf');
    if (cf) cf.textContent = sym;
    const c = $('cube');
    if (!c) return;
    c.classList.add('fast');
    setTimeout(() => c.classList.remove('fast'), 1400);
  }

  function countUp(el, to) {
    const t0 = performance.now();
    (function f(t) {
      const p = Math.min(1, (t - t0) / 900);
      el.textContent = fmtRp(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  function clearValidationErrors() {
    if ($('inputHari')) $('inputHari').classList.remove('input-error');
    if ($('inputTarif')) $('inputTarif').classList.remove('input-error');
  }

  function getVal(x) {
    const map = { R1: r1, R2: r2, R3: r3 };
    return x in map ? map[x] : Number(x);
  }

  function setReg(x, val) {
    if (x === 'R1') {
      r1 = val;
      if ($('regR1')) $('regR1').textContent = fmt(r1);
      flash('t1');
    } else if (x === 'R2') {
      r2 = val;
      if ($('regR2')) $('regR2').textContent = fmt(r2);
      flash('t2');
    } else {
      r3 = val;
      if ($('regR3')) $('regR3').textContent = fmt(r3);
      flash('t3');
    }
  }

  function bacaInput() {
    clearValidationErrors();
    const hRaw = String($('inputHari')?.value || '').trim().replace(',', '.');
    const tRaw = String($('inputTarif')?.value || '').trim().replace(',', '.');

    if (hRaw === '') {
      if ($('inputHari')) $('inputHari').classList.add('input-error');
      return { error: 'Jumlah hari belum diisi.' };
    }
    if (tRaw === '') {
      if ($('inputTarif')) $('inputTarif').classList.add('input-error');
      return { error: 'Tarif denda belum diisi.' };
    }

    const hari = Number(hRaw);
    const tarif = Number(tRaw);

    if (!Number.isFinite(hari)) {
      if ($('inputHari')) $('inputHari').classList.add('input-error');
      return { error: 'Jumlah hari harus berupa angka (contoh: 5 atau 2,5).' };
    }
    if (!Number.isFinite(tarif)) {
      if ($('inputTarif')) $('inputTarif').classList.add('input-error');
      return { error: 'Tarif denda harus berupa angka (contoh: 20000).' };
    }
    if (hari < 0) {
      if ($('inputHari')) $('inputHari').classList.add('input-error');
      return { error: 'Jumlah hari tidak boleh negatif.' };
    }
    if (hari > HARI_MAKS) {
      if ($('inputHari')) $('inputHari').classList.add('input-error');
      return { error: `Jumlah hari maksimum ${HARI_MAKS} hari.` };
    }
    if (tarif <= 0) {
      if ($('inputTarif')) $('inputTarif').classList.add('input-error');
      return { error: 'Tarif denda harus lebih dari Rp0.' };
    }
    if (tarif > TARIF_MAKS) {
      if ($('inputTarif')) $('inputTarif').classList.add('input-error');
      return { error: `Tarif denda maksimum Rp${fmt(TARIF_MAKS)} per hari.` };
    }
    return { hari, tarif };
  }

  function mulaiSimulasi() {
    stopAuto();
    clearValidationErrors();
    pc = 0;
    r1 = r2 = r3 = mem100 = 0;
    flag = 0;
    renderRam();
    setBusState(false, false, false);

    if ($('regPC')) $('regPC').textContent = 0;
    if ($('regIR')) $('regIR').textContent = '-';
    if ($('regFlag')) $('regFlag').textContent = '0';
    if ($('regR1')) $('regR1').textContent = '0';
    if ($('regR2')) $('regR2').textContent = '0';
    if ($('regR3')) $('regR3').textContent = '0';

    if ($('resultBox')) {
      $('resultBox').hidden = true;
      $('resultBox').classList.remove('ok');
    }
    if ($('resultNote')) $('resultNote').textContent = '';
    setLog('Program di-reset. Siap dieksekusi per langkah.');
  }

  function langkahEksekusi() {
    if (pc >= program.length) {
      stopAuto();
      setLog('Program sudah berhenti (HALT). Tekan Reset untuk mengulang.');
      return false;
    }

    const tok = program[pc].split(/[\s,]+/);
    const op = tok[0];

    // Validasi sebelum Fetch/Execute INPUT agar langsung terhenti bila input salah
    let inputVal = null;
    if (op === 'INPUT') {
      inputVal = bacaInput();
      if (inputVal.error) {
        stopAuto();
        setBusState(false, false, false);
        setLog('⚠ ' + inputVal.error, 'error');
        if ($('regIR')) $('regIR').textContent = '-';
        return false;
      }
    }

    clearRam();
    if ($('regIR')) $('regIR').textContent = program[pc];
    const row = $('ram-' + pc);
    if (row) row.classList.add('active');

    let jumped = false;

    switch (op) {
      case 'INPUT': {
        setBusState(true, true, true);
        spinCube('→');
        if (tok[1] === 'R1') {
          setReg('R1', inputVal.hari);
          setLog(`[Input] Membaca ${fmt(inputVal.hari)} hari keterlambatan ke R1.`);
        } else {
          setReg('R2', inputVal.tarif);
          setLog(`[Input] Membaca tarif Rp${fmt(inputVal.tarif)}/hari ke R2.`);
        }
        break;
      }

      case 'CMP': {
        flag = getVal(tok[1]) - getVal(tok[2]);
        if ($('regFlag')) $('regFlag').textContent = flag > 0 ? `+${fmt(flag)}` : fmt(flag);
        setBusState(false, false, true);
        spinCube('⇄');
        setLog(`[Bandingkan] ${tok[1]} (${fmt(getVal(tok[1]))}) dengan ${tok[2]} (${fmt(getVal(tok[2]))}) → ${flag <= 0 ? '≤' : '>'}.`);
        break;
      }

      case 'JLE':
        setBusState(false, false, true);
        if (flag <= 0) {
          pc = Number(tok[1]);
          jumped = true;
          spinCube('↷');
          setLog(`[Lompat] Syarat ≤ terpenuhi, PC melompat ke alamat ${pc} (bebas denda).`);
        } else {
          setLog('[Lompat] Syarat ≤ tidak terpenuhi, lanjut ke instruksi berikutnya.');
        }
        break;

      case 'JGT':
        setBusState(false, false, true);
        if (flag > 0) {
          pc = Number(tok[1]);
          jumped = true;
          spinCube('↷');
          setLog(`[Lompat] Syarat > terpenuhi, PC melompat ke alamat ${pc} (kena batas maks).`);
        } else {
          setLog('[Lompat] Syarat > tidak terpenuhi, lanjut ke instruksi berikutnya.');
        }
        break;

      case 'JMP':
        setBusState(false, false, true);
        pc = Number(tok[1]);
        jumped = true;
        spinCube('↷');
        setLog(`[Lompat] Tanpa syarat, PC melompat ke alamat ${pc}.`);
        break;

      case 'MUL': {
        const a = getVal(tok[2]);
        const b = getVal(tok[3]);
        setReg(tok[1], a * b);
        setBusState(false, false, true);
        spinCube('×');
        setLog(`[ALU] ${fmt(a)} × ${fmt(b)} = ${fmt(a * b)} disimpan di ${tok[1]}.`);
        break;
      }

      case 'MOV': {
        const v = getVal(tok[2]);
        setReg(tok[1], v);
        setBusState(false, false, true);
        spinCube('=');
        setLog(`[Pindah] ${tok[1]} diisi ${fmt(v)} (batas maksimum denda Rp500.000).`);
        break;
      }

      case 'STORE':
        mem100 = r3;
        if ($('mem100')) $('mem100').textContent = fmtRp(mem100);
        setBusState(true, true, true);
        spinCube('=');
        setLog(`[Memory] ${tok[1]} disimpan via Address & Data Bus ke RAM[${tok[2]}] = ${fmtRp(mem100)}.`);
        break;

      case 'OUTPUT': {
        const finalDenda = Math.round(r3);
        const isBebas = r1 <= HARI_BEBAS;
        const isCapped = !isBebas && r1 * r2 > DENDA_MAKS;
        setBusState(false, true, true);
        spinCube('∑');

        if ($('resultBox')) {
          $('resultBox').hidden = false;
          $('resultBox').classList.toggle('ok', isBebas);
        }
        if ($('resultVal')) countUp($('resultVal'), r3);
        if ($('resultNote')) {
          if (isBebas) {
            $('resultNote').textContent = `Status: Bebas Denda (keterlambatan ${fmt(r1)} hari ≤ 1 hari).`;
          } else if (isCapped) {
            $('resultNote').textContent = `${fmt(r1)} hari × Rp${fmt(r2)} = Rp${fmt(Math.round(r1 * r2))} → dibatasi maksimum Rp500.000.`;
          } else {
            $('resultNote').textContent = `Terlambat ${fmt(r1)} hari × Rp${fmt(r2)}/hari`;
          }
        }
        setLog(`[Output] Total denda Rp${fmt(finalDenda)}.`, isBebas ? 'ok' : '');
        if (typeof window.burst === 'function') {
          window.burst(window.innerWidth / 2, window.innerHeight * 0.6, 26);
        }
        break;
      }

      case 'HALT':
        setBusState(false, false, true);
        spinCube('∞');
        setLog('[HALT] Eksekusi program selesai.', r1 <= HARI_BEBAS ? 'ok' : '');
        stopAuto();
        break;
    }

    if (!jumped) pc++;
    if ($('regPC')) $('regPC').textContent = pc < program.length ? pc : 'HALT';
    return true;
  }

  function initSimulator() {
    renderRam();

    const bReset = $('bReset');
    const bStep = $('bStep');
    const bAuto = $('bAuto');

    if (bReset) bReset.onclick = mulaiSimulasi;
    if (bStep) bStep.onclick = langkahEksekusi;
    if (bAuto) {
      bAuto.onclick = () => {
        if (timer) {
          stopAuto();
          return;
        }
        if (pc >= program.length) mulaiSimulasi();
        if (pc === 0) {
          const v = bacaInput();
          if (v.error) {
            setLog('⚠ ' + v.error, 'error');
            return;
          }
        }
        bAuto.textContent = '⏸ Jeda';
        if (!langkahEksekusi()) return;
        timer = setInterval(() => {
          if (pc >= program.length) {
            stopAuto();
            return;
          }
          langkahEksekusi();
        }, 1300);
      };
    }

    // Preset skenario cepat
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hariVal = btn.dataset.hari;
        const tarifVal = btn.dataset.tarif;
        const katVal = btn.dataset.kat;

        if ($('inputHari')) $('inputHari').value = hariVal;
        if ($('inputTarif')) $('inputTarif').value = tarifVal;
        if ($('inputKategori') && katVal) $('inputKategori').value = katVal;

        mulaiSimulasi();
        if (typeof window.drawChart === 'function') window.drawChart(false);

        const check = bacaInput();
        if (check.error) {
          setLog('⚠ ' + check.error, 'error');
        } else {
          setLog(`Skenario dimuat: ${fmt(check.hari)} hari, tarif Rp${fmt(check.tarif)}/hari. Tekan "Langkah" atau "Otomatis".`);
        }
      });
    });

    ['inputHari', 'inputTarif'].forEach(id => {
      const el = $(id);
      if (el) {
        el.addEventListener('input', () => {
          clearValidationErrors();
        });
      }
    });
  }

  window.mulaiSimulasi = mulaiSimulasi;
  window.langkahEksekusi = langkahEksekusi;
  window.initSimulator = initSimulator;
})();
