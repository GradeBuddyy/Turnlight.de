/* ==================================================================
   TurnLight – Interaktionen der Startseite
   Nav-Schatten · Scroll-Reveal · Laufband · Lampen-Demo · Farbwähler
   Zeitersparnis-Rechner · Scrollspy der mobilen Tab-Bar · Kontaktformular
   ================================================================== */

/* Access Key von https://web3forms.com – dort die eigene Empfängeradresse
   eintragen, der Key kommt per Mail. Ohne gültigen Key wird KEINE Nachricht
   zugestellt: der Versand schlägt fehl und das Formular zeigt stattdessen
   den Hinweis mit der Mailadresse. */
const WEB3FORMS_KEY = 'HIER-EIGENEN-ACCESS-KEY-EINTRAGEN';
const KEY_FEHLT = !WEB3FORMS_KEY || WEB3FORMS_KEY.startsWith('HIER-');

if (KEY_FEHLT) {
  console.warn(
    '[TurnLight] Kontaktformular ist NICHT scharf geschaltet: in js/main.js ' +
    'steht noch der Platzhalter statt eines Web3Forms-Access-Keys. ' +
    'Abgeschickte Nachrichten kommen nirgends an.'
  );
}

/* ---------- Nav: Trennlinie erscheint beim Scrollen ---------- */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });

/* ---------- Scroll-Reveal ---------- */
/* Nachtragen, was beim Hereinscrollen uebersprungen wurde.
   Der Observer meldet nur Elemente, die tatsaechlich einmal in einem
   gerenderten Frame im Sichtfeld lagen. Springt man per Ankerlink mitten in
   die Seite (auf dem Handy die Tab-Leiste), bleiben die uebersprungenen
   Abschnitte sonst dauerhaft auf opacity:0 – also unsichtbarer Inhalt. */
function revealSweep() {
  const unten = innerHeight;
  document.querySelectorAll('.reveal:not(.in)').forEach(el => {
    if (el.getBoundingClientRect().top < unten) {
      el.classList.add('in');
      io.unobserve(el);
    }
  });
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
  /* Haengt bewusst am Observer und nicht an scroll oder
     requestAnimationFrame: beide werden in Hintergrund-Tabs ausgesetzt, und
     ob ein Abschnitt sichtbar wird, darf davon nicht abhaengen. */
  revealSweep();
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Zusaetzliche Ausloeser fuer echte Browser */
let letzterSweep = 0;
addEventListener('scroll', () => {
  const jetzt = Date.now();
  if (jetzt - letzterSweep < 120) return;
  letzterSweep = jetzt;
  revealSweep();
}, { passive: true });
addEventListener('hashchange', () => setTimeout(revealSweep, 60));
addEventListener('resize', revealSweep, { passive: true });

/* Letzte Absicherung, ohne Abhaengigkeit von irgendeinem Ereignis: solange
   noch etwas unsichtbar ist, alle 300 ms nachsehen – aber nur, wenn sich die
   Scrollposition ueberhaupt geaendert hat. Sobald alles eingeblendet ist,
   schaltet sich der Waechter ab. Scroll-Ereignisse und rAF werden in
   Hintergrund-Tabs ausgesetzt; unsichtbarer Inhalt darf daran nicht haengen. */
let letzteY = -1;
const waechter = setInterval(() => {
  if (scrollY !== letzteY) { letzteY = scrollY; revealSweep(); }
  if (!document.querySelector('.reveal:not(.in)')) clearInterval(waechter);
}, 300);

/* ---------- Laufband: Inhalt verdoppeln für nahtlosen Loop ----------
   Die Keyframes schieben die Spur um -50 %. Das passt nur, wenn der
   Inhalt genau zweimal vorhanden ist – darum hier verdoppeln. */
const track = document.getElementById('stripTrack');
track.innerHTML += track.innerHTML;

/* ---------- Lampen-Demo im Hero ----------
   Ziehen (Maus/Finger) kippt die Lampe; ab ~5° schaltet sie auf
   Signalrot und springt nach 4,2 s von allein zurück.
   Ein einfacher Klick löst dieselbe Demo aus. */
const lamp = document.getElementById('lamp');
const stage = document.getElementById('lampStage');
let dragging = false, startX = 0, rot = 0, resetTimer = null;

function activate() {
  lamp.classList.add('is-red');
  stage.classList.add('active');
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    lamp.classList.remove('is-red');
    stage.classList.remove('active');
    rot = 0;
    lamp.style.transform = '';
  }, 4200);
}
const pointX = e => (e.touches ? e.touches[0] : e).clientX;

function onDown(e) { dragging = true; startX = pointX(e); }
function onMove(e) {
  if (!dragging) return;
  rot = Math.max(-9, Math.min(9, (pointX(e) - startX) * .08));
  lamp.style.transform = `rotate(${rot}deg)`;
  if (Math.abs(rot) > 5 && !lamp.classList.contains('is-red')) activate();
}
function onUp() {
  if (!dragging) return;
  dragging = false;
  if (!lamp.classList.contains('is-red')) { rot = 0; lamp.style.transform = ''; }
}
lamp.addEventListener('mousedown', onDown);
lamp.addEventListener('touchstart', onDown, { passive: true });
addEventListener('mousemove', onMove);
addEventListener('touchmove', onMove, { passive: true });
addEventListener('mouseup', onUp);
addEventListener('touchend', onUp);
lamp.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    lamp.style.transform = 'rotate(6deg)';
    activate();
  }
});
lamp.addEventListener('click', () => {
  if (Math.abs(rot) < 2 && !lamp.classList.contains('is-red')) {
    lamp.style.transform = 'rotate(6deg)';
    activate();
  }
});

/* ---------- Farbwähler ----------
   Setzt --pick (Schirmfarbe) und --pick-glow (Lichthof) auf der
   CSS-Lampe; den Rest macht das Stylesheet. */
const miniLamp = document.getElementById('miniLamp');
const hexToRgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
};
const meaningEl = document.getElementById('swatchMeaning');

function pickSwatch(swatch) {
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('on'));
  swatch.classList.add('on');
  const c = swatch.dataset.c;
  miniLamp.style.setProperty('--pick', c);
  miniLamp.style.setProperty('--pick-glow', hexToRgba(c, .45));
  if (meaningEl) {
    /* Name in der Signalfarbe, Bedeutung daneben */
    meaningEl.style.setProperty('--pick-ink', c);
    meaningEl.innerHTML = `<b>${swatch.dataset.name}</b><span>${swatch.dataset.meaning}</span>`;
  }
}
document.querySelectorAll('.swatch').forEach(s =>
  s.addEventListener('click', () => pickSwatch(s)));

const aktiv = document.querySelector('.swatch.on');
if (aktiv) pickSwatch(aktiv);

/* ---------- Zeitersparnis-Rechner ---------- */
const inTables = document.getElementById('inTables');
const inRounds = document.getElementById('inRounds');
const inHours = document.getElementById('inHours');

/* Füllstand des Sliders als CSS-Variable – der Verlauf im Stylesheet liest sie */
function paintRange(el) {
  const p = (el.value - el.min) / (el.max - el.min) * 100;
  el.style.setProperty('--fill', p + '%');
}

function calc() {
  const tables = +inTables.value, rounds = +inRounds.value, hours = +inHours.value;
  document.getElementById('outTables').textContent = tables;
  document.getElementById('outRounds').textContent = rounds;
  document.getElementById('outHours').textContent = hours;

  const roundsPerEvening = rounds * hours;
  const savedWalks = Math.round(roundsPerEvening * 0.7);
  const minutesPerRound = Math.max(1, Math.round(tables / 8));
  const timeSaved = savedWalks * minutesPerRound;

  document.getElementById('resRoundsNow').textContent = roundsPerEvening;
  document.getElementById('resSavedWalks').textContent = savedWalks;
  document.getElementById('resTimeSaved').textContent = '~ ' + timeSaved + ' Min.';
  [inTables, inRounds, inHours].forEach(paintRange);
}
[inTables, inRounds, inHours].forEach(el => el.addEventListener('input', calc));
calc();

/* ---------- Tische im Kontaktformular: Regler + Eingabefeld ----------
   Beide bedienen denselben Wert und halten sich gegenseitig nach. Der Regler
   reicht bis 100; wer mehr Tische hat, tippt die Zahl ins Feld – der Regler
   bleibt dann am Anschlag stehen, die eingetippte Zahl gilt. */
const fTables = document.getElementById('fTables');      // Regler
const fTablesNum = document.getElementById('fTablesNum'); // Eingabefeld

const grenze = (v) => Math.min(+fTablesNum.max, Math.max(+fTablesNum.min, v));

function reglerNachFeld() {
  /* Waehrend des Tippens darf ein leeres Feld nicht ueberschrieben werden,
     sonst springt einem die Zahl unter den Fingern weg. */
  if (fTablesNum.value === '') return;
  fTables.value = Math.min(+fTables.max, grenze(+fTablesNum.value));
  paintRange(fTables);
}

function feldNachRegler() {
  fTablesNum.value = fTables.value;
  paintRange(fTables);
}

fTables.addEventListener('input', feldNachRegler);
fTablesNum.addEventListener('input', reglerNachFeld);
/* Beim Verlassen aufraeumen: leer oder unsinnig wird auf einen gueltigen
   Wert zurechtgerueckt, damit nichts Krummes im Formular stehen bleibt. */
fTablesNum.addEventListener('change', () => {
  fTablesNum.value = fTablesNum.value === '' ? fTables.value : grenze(+fTablesNum.value);
  reglerNachFeld();
});
feldNachRegler();

/* ---------- Scrollspy für die mobile Tab-Bar ---------- */
const tabLinks = document.querySelectorAll('.tabbar a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      tabLinks.forEach(t => t.classList.toggle('on', t.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });
['top', 'funktion', 'farben', 'rechner', 'kontakt'].forEach(id => {
  const el = document.getElementById(id);
  if (el) spy.observe(el);
});

/* ---------- Kontaktformular ----------
   Versand über Web3Forms, damit kein eigener Mailserver nötig ist. */
document.getElementById('contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type=submit]');
  const successEl = document.getElementById('formSuccess');
  const errorEl = document.getElementById('formError');
  successEl.style.display = 'none';
  errorEl.style.display = 'none';

  const biz = document.getElementById('fBiz').value;
  const payload = {
    access_key: WEB3FORMS_KEY,
    subject: `Kontaktanfrage über TurnLight Website – ${biz}`,
    from_name: 'TurnLight Website',
    Name: document.getElementById('fName').value,
    Betrieb: biz,
    'E-Mail': document.getElementById('fMail').value,
    Telefon: document.getElementById('fPhone').value,
    Stadt: document.getElementById('fCity').value,
    /* Massgeblich ist das Eingabefeld – es kann ueber den Reglerbereich
       hinausgehen. */
    'Anzahl Tische': fTablesNum.value || 'keine Angabe',
    Nachricht: document.getElementById('fMsg').value,
  };

  if (KEY_FEHLT) {
    /* Kein Rundweg über einen Dienst, der die Anfrage ohnehin ablehnt –
       und die Daten des Absenders verlassen den Rechner gar nicht erst. */
    errorEl.style.display = 'block';
    return;
  }

  const originalBtnHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Wird gesendet …';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Senden fehlgeschlagen');
    successEl.style.display = 'block';
    submitBtn.style.display = 'none';
    form.reset();
  } catch (err) {
    errorEl.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
  }
});
