// Semua logika interaktif undangan. Data diambil dari WEDDING_CONFIG (config.js).
document.addEventListener('DOMContentLoaded', function () {

  // ---------- Ornamen bunga pada pemisah ----------
  document.querySelectorAll('.orn').forEach(el => {
    el.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#flower" width="100" height="100"/></svg>';
  });

  // ---------- Isi data dari config ----------
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('coverGroom', WEDDING_CONFIG.groomNickname);
  setText('coverBride', WEDDING_CONFIG.brideNickname);
  setText('coverDate', WEDDING_CONFIG.weddingDateDisplay);
  setText('brideNameFull', WEDDING_CONFIG.bride);
  setText('groomNameFull', WEDDING_CONFIG.groom);
  setText('brideParents', `Putri dari Bapak ${WEDDING_CONFIG.brideFather} & Ibu ${WEDDING_CONFIG.brideMother}`);
  setText('groomParents', `Putra dari Bapak ${WEDDING_CONFIG.groomFather} & Ibu ${WEDDING_CONFIG.groomMother}`);
  setText('quoteText', `"${WEDDING_CONFIG.quoteText}"`);
  setText('quoteSource', `— ${WEDDING_CONFIG.quoteSource}`);
  setText('eventDate', WEDDING_CONFIG.weddingDateDisplay);
  setText('akadTime', WEDDING_CONFIG.akadTime);
  setText('resepsiTime', WEDDING_CONFIG.resepsiTime);
  setText('venueName', WEDDING_CONFIG.venueName);
  setText('venueAddress', WEDDING_CONFIG.venueAddress);
  setText('closingNames', `${WEDDING_CONFIG.brideNickname} & ${WEDDING_CONFIG.groomNickname}`);

  // ---------- Buka undangan ----------
  const openBtn = document.getElementById('openBtn');
  if (openBtn) {
    openBtn.addEventListener('click', function () {
      document.body.classList.remove('closed');
      document.getElementById('main').scrollIntoView({ behavior: 'smooth' });
      const music = document.getElementById('bgMusic');
      music.play().then(() => { playing = true; musicBtn.textContent = '❚❚'; }).catch(() => {});
    });
  }

  // ---------- Musik ----------
  const musicBtn = document.getElementById('musicBtn');
  const bgMusic = document.getElementById('bgMusic');
  let playing = false;
  musicBtn.addEventListener('click', function () {
    if (playing) { bgMusic.pause(); musicBtn.textContent = '♪'; }
    else { bgMusic.play().catch(() => {}); musicBtn.textContent = '❚❚'; }
    playing = !playing;
  });

  // ---------- Countdown ----------
  function updateCountdown() {
    const target = new Date(WEDDING_CONFIG.weddingISODate).getTime();
    const diff = target - Date.now();
    const box = document.getElementById('countdown');
    const done = document.getElementById('countdownDone');
    if (diff <= 0) {
      box.style.display = 'none';
      done.style.display = 'block';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    setText('cd-days', String(d).padStart(2, '0'));
    setText('cd-hours', String(h).padStart(2, '0'));
    setText('cd-mins', String(m).padStart(2, '0'));
    setText('cd-secs', String(s).padStart(2, '0'));
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ---------- Google Calendar ----------
  function buildCalendarLink() {
    const start = new Date(WEDDING_CONFIG.weddingISODate);
    const end = new Date(start.getTime() + WEDDING_CONFIG.calendarDurationHours * 3600000);
    const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = encodeURIComponent(WEDDING_CONFIG.calendarTitle);
    const details = encodeURIComponent(WEDDING_CONFIG.calendarDescription);
    const location = encodeURIComponent(WEDDING_CONFIG.venueAddress);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${location}`;
  }
  const calBtn = document.getElementById('calendarLink');
  if (calBtn) calBtn.href = buildCalendarLink();

  // ---------- Google Maps ----------
  const mapsBtn = document.getElementById('mapsLink');
  if (mapsBtn) mapsBtn.href = WEDDING_CONFIG.mapsUrl;

  // ---------- RSVP ----------
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpStatus = document.getElementById('rsvpStatus');
  const rsvpSubmit = document.getElementById('rsvpSubmit');

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('fullName').value.trim();
    const message = document.getElementById('message').value.trim();
    if (!name || name.length > 60 || message.length > 300) {
      rsvpStatus.className = 'err';
      rsvpStatus.textContent = 'Mohon periksa kembali isian Anda (nama & ucapan tidak boleh terlalu panjang).';
      return;
    }
    rsvpSubmit.disabled = true;
    rsvpStatus.className = '';
    rsvpStatus.textContent = 'Mengirim...';

    const payload = {
      action: 'rsvp',
      name: name,
      attendance: document.getElementById('attendance').value,
      guests: document.getElementById('guestCount').value,
      message: message
    };

    fetch(WEDDING_CONFIG.rsvpApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // menghindari CORS preflight di Apps Script
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          rsvpStatus.className = 'ok';
          rsvpStatus.textContent = data.message || 'Terima kasih! RSVP Anda telah kami terima.';
          rsvpForm.reset();
          loadWishes(true);
        } else {
          throw new Error(data.message || 'Gagal mengirim RSVP');
        }
      })
      .catch(err => {
        rsvpStatus.className = 'err';
        rsvpStatus.textContent = 'RSVP gagal terkirim. Periksa koneksi internet Anda dan coba lagi.';
        console.error(err);
      })
      .finally(() => { rsvpSubmit.disabled = false; });
  });

  // ---------- Wedding Wishes ----------
  let allWishes = [];
  let shown = 5;
  const WISHES_PAGE = 5;

  function renderWishes() {
    const list = document.getElementById('wishesList');
    const empty = document.getElementById('wishesEmpty');
    const loadMore = document.getElementById('loadMoreWishes');
    list.innerHTML = '';
    if (allWishes.length === 0) {
      empty.style.display = 'block';
      loadMore.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    allWishes.slice(0, shown).forEach(w => {
      const div = document.createElement('div');
      div.className = 'wish';
      const name = document.createElement('div');
      name.className = 'wish-name';
      name.textContent = w.name || 'Tamu';
      const msg = document.createElement('div');
      msg.className = 'wish-msg';
      msg.textContent = `"${w.message || ''}"`;
      div.appendChild(name);
      div.appendChild(msg);
      list.appendChild(div);
    });
    loadMore.style.display = shown < allWishes.length ? 'inline-block' : 'none';
  }

  function loadWishes() {
    fetch(`${WEDDING_CONFIG.rsvpApiUrl}?action=wishes`)
      .then(r => r.json())
      .then(data => {
        allWishes = (data.wishes || []).slice().reverse(); // terbaru duluan
        renderWishes();
      })
      .catch(err => console.error('Gagal memuat ucapan', err));
  }
  document.getElementById('loadMoreWishes').addEventListener('click', function () {
    shown += WISHES_PAGE;
    renderWishes();
  });
  loadWishes();
});
