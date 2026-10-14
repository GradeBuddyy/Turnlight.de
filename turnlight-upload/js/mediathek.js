/* ==================================================================
   Mediathek – Tabs, Karussell und Lightbox
   Die Inhalte kommen aus medien/liste.js (window.TURNLIGHT_MEDIEN).
   Hier ist nichts zu ändern, wenn neue Bilder oder Videos dazukommen.
   ================================================================== */
(function () {
  const root = document.getElementById('mediathek');
  if (!root) return;

  const ALLE = 'Alle';
  const items = (window.TURNLIGHT_MEDIEN || []).filter(m => m && m.datei);

  const tabsEl = root.querySelector('.mt-tabs');
  const track = root.querySelector('.mt-track');
  const prev = root.querySelector('.mt-prev');
  const next = root.querySelector('.mt-next');
  const box = document.getElementById('mtBox');
  const stage = box.querySelector('.mt-box-stage');
  const cap = box.querySelector('.mt-box-cap');

  let current = ALLE, list = [], idx = 0;

  const esc = s => String(s == null ? '' : s)
    .replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const isVideo = m => String(m.typ).toLowerCase() === 'video';

  /* Ohne Einträge bleibt der ganze Abschnitt aus */
  if (!items.length) { root.style.display = 'none'; return; }

  /* ---------- Tabs aus den Kategorien der Liste aufbauen ---------- */
  const cats = [ALLE];
  items.forEach(m => {
    const k = (m.kategorie || '').trim();
    if (k && !cats.includes(k)) cats.push(k);
  });
  tabsEl.innerHTML = cats.map(k => {
    const n = k === ALLE ? items.length : items.filter(m => (m.kategorie || '').trim() === k).length;
    return `<button class="mt-tab" role="tab" data-k="${esc(k)}">${esc(k)}<span>${n}</span></button>`;
  }).join('');
  tabsEl.addEventListener('click', e => {
    const b = e.target.closest('.mt-tab');
    if (b) show(b.dataset.k);
  });

  /* ---------- Karten der gewählten Kategorie rendern ---------- */
  function show(k) {
    current = k;
    tabsEl.querySelectorAll('.mt-tab').forEach(b => {
      const on = b.dataset.k === k;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on);
    });
    list = k === ALLE ? items : items.filter(m => (m.kategorie || '').trim() === k);

    track.innerHTML = list.map((m, i) => {
      /* #t=0.1 sorgt dafür, dass Videos ohne Poster ein Standbild zeigen */
      const media = isVideo(m)
        ? `<video src="${esc(m.datei)}#t=0.1" ${m.vorschau ? `poster="${esc(m.vorschau)}"` : ''} muted playsinline preload="metadata"></video><span class="mt-play" aria-hidden="true"></span>`
        : `<img src="${esc(m.datei)}" alt="${esc(m.titel)}" loading="lazy">`;
      return `<button class="mt-card${isVideo(m) ? ' is-video' : ''}" data-i="${i}" aria-label="${esc(m.titel || 'Medium')} öffnen">
        ${media}
        <span class="mt-cap">${m.titel ? `<b>${esc(m.titel)}</b>` : ''}${m.text ? `<small>${esc(m.text)}</small>` : ''}</span>
      </button>`;
    }).join('');

    track.scrollLeft = 0;
    updateArrows();
  }

  /* ---------- Pfeile ---------- */
  const step = () => {
    const c = track.querySelector('.mt-card');
    return c ? c.offsetWidth + 20 : 300;   // Kartenbreite + gap
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

  function updateArrows() {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
    root.classList.toggle('mt-fits', max <= 0);
  }
  track.addEventListener('scroll', updateArrows, { passive: true });
  addEventListener('resize', updateArrows);

  /* ---------- Lightbox ---------- */
  track.addEventListener('click', e => {
    const c = e.target.closest('.mt-card');
    if (c) open(+c.dataset.i);
  });

  function open(i) {
    idx = (i + list.length) % list.length;   // zyklisch blättern
    const m = list[idx];
    stage.innerHTML = isVideo(m)
      ? `<video src="${esc(m.datei)}" ${m.vorschau ? `poster="${esc(m.vorschau)}"` : ''} controls autoplay playsinline></video>`
      : `<img src="${esc(m.datei)}" alt="${esc(m.titel)}">`;
    cap.innerHTML = `${m.titel ? `<b>${esc(m.titel)}</b>` : ''}${m.text ? ` <span>${esc(m.text)}</span>` : ''}<em>${idx + 1} / ${list.length}</em>`;
    box.classList.toggle('single', list.length < 2);
    if (!box.open) { box.showModal(); document.body.style.overflow = 'hidden'; }
  }
  function close() { stage.innerHTML = ''; box.close(); }

  box.addEventListener('close', () => { stage.innerHTML = ''; document.body.style.overflow = ''; });
  box.querySelector('.mt-box-close').addEventListener('click', close);
  box.querySelector('.mt-box-prev').addEventListener('click', () => open(idx - 1));
  box.querySelector('.mt-box-next').addEventListener('click', () => open(idx + 1));
  box.addEventListener('click', e => { if (e.target === box || e.target === stage) close(); });
  box.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') open(idx - 1);
    if (e.key === 'ArrowRight') open(idx + 1);
  });

  /* Wischen in der Lightbox */
  let x0 = null;
  stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) open(idx + (dx < 0 ? 1 : -1));
  });

  show(ALLE);
})();
