# Undangan Pernikahan Digital — Tika & Okxy

Website undangan pernikahan digital: elegan, mobile-first, dengan RSVP yang tersimpan ke Google Sheets, Wedding Wishes real-time, countdown, integrasi Google Maps & Google Calendar.

## Struktur File

```
wedding-invitation/
├── index.html              → struktur halaman
├── style.css                → desain (tema navy, abu, dan putih bernuansa floral)
├── script.js                 → logika countdown, RSVP, wishes, kalender, maps, musik
├── config.js                 → SATU tempat untuk semua data pernikahan (edit di sini)
├── assets/
│   ├── images/                → foto/ilustrasi (format .webp, sudah dikompres)
│   └── music/                 → musik latar (.mp3)
├── google-apps-script/
│   └── Code.gs                → backend RSVP (tempel ke Apps Script)
└── README.md                  → panduan ini
```

## 1. Cara Mengganti Data Mempelai, Tanggal, Venue, dll.

Buka file **`config.js`**. Semua teks yang tampil di website diambil dari file ini — kamu tidak perlu menyentuh file lain untuk mengganti data:

- `bride`, `groom`, `brideNickname`, `groomNickname` → nama lengkap & panggilan
- `brideFather`, `brideMother`, `groomFather`, `groomMother` → nama orang tua
- `venueName`, `venueAddress`, `mapsUrl` → lokasi acara (mapsUrl = link Google Maps venue kamu)
- `weddingDateDisplay` → tanggal yang tampil di layar (teks bebas)
- `weddingISODate` → **wajib format ISO** `YYYY-MM-DDTHH:MM:SS+07:00`, dipakai countdown & Save the Date. `+07:00` = WIB, ganti ke `+08:00` untuk WITA atau `+09:00` untuk WIT.
- `akadTime`, `resepsiTime` → teks jam akad/resepsi
- `quoteText`, `quoteSource` → kutipan di bagian Quote
- `rsvpApiUrl` → **wajib diisi** dengan URL Web App Google Apps Script (lihat bagian 3)
- `musicSrc` → path file musik latar

Simpan file, refresh browser — semua bagian website otomatis ikut berubah.

## 2. Cara Mengganti Foto & Musik

- Foto: ganti file di `assets/images/` (pertahankan nama file `couple.webp`, `bride.webp`, `groom.webp`, atau ubah namanya lalu sesuaikan path `src=""` di `index.html`).
  - Disarankan format `.webp`, lebar maksimal 700–1000px, agar tetap ringan.
  - Jika kamu punya file `.jpg`/`.png` baru, kompres dulu (mis. lewat [squoosh.app](https://squoosh.app)) sebelum diunggah.
- Musik: ganti file di `assets/music/`, lalu perbarui `musicSrc` di `config.js` jika nama filenya beda.

## 3. Setup Google Sheets + Google Apps Script (Backend RSVP)

1. Buka [sheets.google.com](https://sheets.google.com) → buat spreadsheet baru, beri nama misalnya **"RSVP Tika & Okxy"**.
2. Di menu, klik **Extensions → Apps Script**.
3. Hapus kode default (`function myFunction() {}`), lalu tempel seluruh isi file **`google-apps-script/Code.gs`**.
4. Klik **Deploy → New deployment**.
   - Klik ikon gerigi ⚙️ di samping "Select type" → pilih **Web app**.
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
5. Klik **Deploy**. Google akan meminta izin (authorization) — klik **Authorize access**, pilih akun Google-mu, lalu klik **Advanced → Go to [nama project] (unsafe)** jika muncul peringatan (ini normal karena skrip belum diverifikasi Google, tapi kamu sendiri pemilik dan pembuatnya).
6. Setelah berhasil, salin **Web app URL** (berakhiran `/exec`).
7. Tempelkan URL itu ke `rsvpApiUrl` di `config.js`.
8. Struktur sheet "RSVP" akan otomatis terbentuk saat RSVP pertama masuk:

   | Timestamp | Nama Lengkap | Kehadiran | Jumlah Tamu | Ucapan |
   |---|---|---|---|---|

**Mengelola data tamu:** buka spreadsheet-nya langsung — kamu bisa memfilter kolom "Kehadiran", menjumlahkan kolom "Jumlah Tamu" dengan rumus `=SUM(D2:D1000)`, atau mengekspor via **File → Download → Excel/CSV**.

**Catatan:** setiap kali kamu mengedit `Code.gs`, kamu harus membuat deployment baru (**Deploy → Manage deployments → edit (pensil) → New version**) agar perubahan berlaku pada URL yang sama.

## 4. Deploy ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `wedding-invitation`.
2. Upload seluruh isi folder ini (semua file & folder `assets/`, `google-apps-script/`) ke repository tersebut.
3. Buka repository → **Settings → Pages**.
4. Pada **Build and deployment → Source**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, klik **Save**.
6. Tunggu 1–2 menit, GitHub akan menampilkan URL situsmu, formatnya:
   `https://<username-github-kamu>.github.io/wedding-invitation/`
7. Buka URL tersebut dari HP dan desktop untuk memastikan semua bagian tampil dan berfungsi normal.

## 5. Checklist Pengujian Sebelum Dibagikan

- [ ] Form RSVP bisa diisi & tombol "Kirim RSVP" berhasil (cek data masuk ke Google Sheets)
- [ ] Setiap RSVP membuat baris baru (tidak menimpa data lama)
- [ ] Ucapan yang dikirim muncul di bagian Wedding Wishes
- [ ] Countdown menghitung mundur dengan benar sesuai zona waktu
- [ ] Tombol "Lihat Lokasi Pernikahan" membuka Google Maps ke alamat yang benar
- [ ] Tombol "+ Save The Date" membuka Google Calendar dengan judul, tanggal, jam, lokasi yang benar
- [ ] Musik latar bisa dinyalakan/dimatikan lewat tombol mengambang
- [ ] Dicoba dari HP (iPhone & Android) dan desktop, tidak ada scroll horizontal
- [ ] Tidak ada error di console browser (klik kanan → Inspect → Console)

## Batasan yang Perlu Diketahui

- **Google Apps Script sebagai backend gratis punya kuota harian** (± 20.000 permintaan/hari untuk akun biasa) — lebih dari cukup untuk undangan pribadi.
- **Embed peta langsung (iframe Google Maps)** tidak disertakan karena link Maps yang diberikan berupa short-link (`maps.app.goo.gl`), yang tidak selalu kompatibel untuk di-embed langsung; sebagai gantinya disediakan tombol yang membuka Google Maps di tab baru — cara ini justru lebih ringan dan lebih andal di HP.
- Autentikasi Google (OAuth saat deploy Apps Script) dan pengaturan GitHub Pages **harus dilakukan langsung oleh pemilik akun** — ini bukan sesuatu yang bisa dilakukan pihak lain atas nama kamu, sesuai kebijakan keamanan Google & GitHub.
