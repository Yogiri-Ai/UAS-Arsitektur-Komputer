# 💻 Mini Computer 3D – Simulasi Denda Keterlambatan Pengembalian Alat
**Tugas Proyek UAS Organisasi dan Arsitektur Komputer**  
*Kelas G – Kelompok 4 (Kategori: Intermediate)*

---

## 👥 Anggota Kelompok 4
1. **Rizki Muhamad Awaludinsyah** (257006111200) — *Perancangan Flowchart, Alur Control Unit & Tabel Skenario Pengujian*
2. **Fakhri Dinal Maulana Putra** (257006111205) — *Koordinator Proyek, Integrasi Simulator Web & Logika Komputasi ALU*
3. **Marcellino Herlambang** (257006111195) — *Analisis IPO, Pemetaan Memori RAM & Alokasi Register CPU*
4. **Muhammad Ramdhani Fathul Muttaqin** (257006111216) — *Aturan Perhitungan, Validasi Input & Perancangan Sistem I/O*

---

## 📌 Deskripsi Proyek
Aplikasi web statis interaktif bertema 3D (**100% Pure HTML/CSS/JS tanpa ketergantungan `node_modules`**) yang mensimulasikan arsitektur komputer (*Von Neumann Machine*) untuk studi kasus perhitungan denda keterlambatan pengembalian alat.

$$\text{Total Denda} = \begin{cases} \text{Rp}0, & \text{jika } \text{Hari} \le 1 \\ \min(\text{Hari} \times \text{Tarif},\; \text{Rp}500.000), & \text{jika } \text{Hari} > 1 \end{cases}$$

---

## 📂 Struktur Folder Siap Deploy

```text
Revisi WEB/
├── .gitignore                   # Pengaman agar file sampah tidak ikut ter-push
├── index.html                   # Halaman utama aplikasi (7 slide interaktif)
├── README.md                    # Dokumentasi proyek
├── css/
│   ├── variables.css
│   ├── layout.css
│   ├── components.css
│   ├── animations.css
│   └── style.css
└── js/
    ├── simulator.js             # CPU 12-instruksi, Flag CMP, validasi, sistem bus & preset
    ├── background.js            # Partikel matematika canvas interaktif
    ├── chart.js                 # Kurva SVG berbatas + sinkronisasi kategori alat
    ├── presentation.js          # Mesin slide 3D, swipe, keyboard & kartu tilt
    └── main.js                  # Inisialisasi aplikasi
```

*(Catatan: File `Mini_Computer_Tugas Kelompok kami_ revisi kata temen ku.html` merupakan arsip cadangan lokal).*

---

## 🚀 Cara Menjalankan & Deploy ke Hosting

### 1. Jalankan Lokal
Klik ganda (double-click) [index.html](index.html) langsung di browser, atau jalankan server statis sederhana (`npx serve` / *Live Server* VS Code).

### 2. Deploy ke GitHub Pages / Vercel / Netlify
Karena proyek ini **murni HTML, CSS, dan JavaScript tanpa build step**:
* **GitHub Pages:** Upload/push isi folder ini ke repositori GitHub $\rightarrow$ masuk ke **Settings $\rightarrow$ Pages** $\rightarrow$ pilih branch `main` folder `/ (root)` $\rightarrow$ Save.
* **Vercel / Netlify:** Import repo GitHub langsung, biarkan *Build Command* kosong (Static Site) dan *Output Directory* `.` (root).
