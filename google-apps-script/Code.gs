/**
 * BACKEND RSVP UNDANGAN PERNIKAHAN — GOOGLE APPS SCRIPT
 * ------------------------------------------------------------
 * CARA SETUP:
 * 1. Buat Google Sheet baru. Beri nama tab pertama "RSVP".
 *    Baris 1 (header) akan dibuat otomatis oleh skrip ini:
 *    Timestamp | Nama Lengkap | Kehadiran | Jumlah Tamu | Ucapan
 * 2. Di Sheet, buka menu Extensions > Apps Script.
 * 3. Hapus kode bawaan (myFunction), tempel seluruh isi file ini.
 * 4. Klik Deploy > New deployment.
 *    - Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Klik Deploy, lalu klik "Authorize access" dan setujui izin yang diminta Google
 *    (akun Google-mu sendiri, bukan pihak ketiga).
 * 6. Salin "Web app URL" yang muncul (berakhiran /exec).
 * 7. Tempelkan URL tersebut ke `rsvpApiUrl` di config.js.
 * 8. Setiap kali kamu mengubah kode ini, buat "New deployment" lagi (versi baru)
 *    agar perubahan ikut ter-update di URL yang sama, atau gunakan "Manage deployments".
 * ------------------------------------------------------------
 */

const SHEET_NAME = "RSVP";
const MAX_NAME_LENGTH = 60;
const MAX_MESSAGE_LENGTH = 300;

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action !== "rsvp") {
      return jsonResponse({ success: false, message: "Aksi tidak dikenali" });
    }

    const name = sanitize(data.name, MAX_NAME_LENGTH);
    const attendance = sanitize(data.attendance, 20);
    const guests = parseInt(data.guests, 10) || 1;
    const message = sanitize(data.message, MAX_MESSAGE_LENGTH);

    if (!name) {
      return jsonResponse({ success: false, message: "Nama tidak boleh kosong" });
    }
    if (attendance !== "Hadir" && attendance !== "Tidak Hadir") {
      return jsonResponse({ success: false, message: "Konfirmasi kehadiran tidak valid" });
    }

    const sheet = getSheet();
    sheet.appendRow([new Date(), name, attendance, guests, message]);

    return jsonResponse({ success: true, message: "RSVP berhasil disimpan" });
  } catch (err) {
    return jsonResponse({ success: false, message: "Terjadi kesalahan pada server" });
  }
}

function doGet(e) {
  try {
    if (e.parameter.action === "wishes") {
      const sheet = getSheet();
      const values = sheet.getDataRange().getValues();
      const wishes = values.slice(1) // lewati header
        .filter(row => row[1] && row[4]) // ada nama dan ucapan
        .map(row => ({ name: row[1], message: row[4] }));
      return jsonResponse({ success: true, wishes: wishes });
    }
    return jsonResponse({ success: false, message: "Aksi tidak dikenali" });
  } catch (err) {
    return jsonResponse({ success: false, message: "Terjadi kesalahan pada server" });
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Nama Lengkap", "Kehadiran", "Jumlah Tamu", "Ucapan"]);
  }
  return sheet;
}

// Hapus tag HTML dan potong panjang teks agar aman dari XSS/spam
function sanitize(str, maxLen) {
  if (!str) return "";
  const stripped = String(str).replace(/<[^>]*>/g, "").trim();
  return stripped.substring(0, maxLen);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
