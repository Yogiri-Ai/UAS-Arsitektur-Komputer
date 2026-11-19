/**
 * main.js
 * Inisialisasi Aplikasi Mini Computer 3D Presentation & Simulator
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi simulator CPU
  if (typeof window.initSimulator === 'function') {
    window.initSimulator();
  }

  // 2. Inisialisasi kurva SVG
  if (typeof window.initChart === 'function') {
    window.initChart();
  }

  // 3. Inisialisasi presentasi & kontrol slide
  if (typeof window.initPresentation === 'function') {
    window.initPresentation();
  }

  // 4. Inisialisasi animasi latar canvas
  if (typeof window.initBackgroundLoop === 'function') {
    window.initBackgroundLoop();
  }

  // 5. Gambar awal kurva & buka slide pertama
  if (typeof window.drawChart === 'function') {
    window.drawChart(false);
  }
  if (typeof window.goTo === 'function') {
    window.goTo(0);
  }

  console.log('🚀 Mini Computer 3D Simulator berhasil diinisialisasi.');
});
