/* ==================================================================
   TurnLight – Interaktionen der Startseite
   Nav-Schatten · Scroll-Reveal · Laufband · Lampen-Demo · Farbwähler
   Zeitersparnis-Rechner · Scrollspy der mobilen Tab-Bar · Kontaktformular
   ================================================================== */

/* Zustellung des Kontaktformulars. Die Seite liegt auf GitHub Pages und hat
   keinen eigenen Mailserver, also uebernimmt das ein Formulardienst.
   Zwei davon sind hinterlegt: faellt einer aus - und das kommt bei Gratis-
   diensten vor -, wird der naechste versucht. Scheitern beide, bietet das
   Formular die Anfrage als fertige Mail an, damit nichts verloren geht. */
const EMPFAENGER = 'turnlight.de@gmail.com';

/* Access Key von https://web3forms.com, ausgestellt auf EMPFAENGER. Laut
   Web3Forms ein oeffentlicher Schluessel, ausdruecklich fuer Code im Browser
   gedacht - er erlaubt nur das Absenden an genau diese eine Adresse und gibt
   niemandem Zugriff auf das Postfach. Steht hier stattdessen der Platzhalter,
   wird dieser Weg einfach uebersprungen. */
const WEB3FORMS_KEY = 'fb231041-5fab-4617-b6a1-957de0e6f67f';
const WEB3FORMS_BEREIT = !!WEB3FORMS_KEY && !WEB3FORMS_KEY.startsWith('HIER-');

/* Reihenfolge ist Absicht: Web3Forms zuerst, sobald ein Key da ist, denn der
   Dienst laeuft zuverlaessiger. FormSubmit braucht keinerlei Konto und ist
   deshalb der Weg, der auch ohne jede Einrichtung funktioniert. */
const FORM_WEGE = [
  WEB3FORMS_BEREIT && {
    name: 'Web3Forms',
    ziel: 'https://api.web3forms.com/submit',
    /* Antwortet normalerweise in unter einer Sekunde. Braucht er zehn,
       stimmt etwas nicht, und der naechste Weg ist schneller am Ziel. */
    geduld: 10000,
    bauen: f => ({
      access_key: WEB3FORMS_KEY,
      subject: `Kontaktanfrage über TurnLight Website – ${f.Betrieb}`,
      from_name: 'TurnLight Website',
      email: f.email,
      Name: f.Name, Betrieb: f.Betrieb, Telefon: f.Telefon, Stadt: f.Stadt,
      'Anzahl Tische': f['Anzahl Tische'], Nachricht: f.Nachricht,
    }),
    geglueckt: (res, d) => res.ok && d.success === true,
  },
  {
    name: 'FormSubmit',
    ziel: 'https://formsubmit.co/ajax/' + EMPFAENGER,
    /* Gemessen: der Dienst laesst eine Anfrage schon mal knapp 29 Sekunden
       liegen, bevor er antwortet - die Verbindung steht dabei sofort, er
       rechnet einfach lange. Eine knappe Grenze wuerde hier eine Anfrage
       wegwerfen, die gleich zugestellt worden waere. Lieber warten. */
    geduld: 40000,
    bauen: f => ({
      _subject: `Kontaktanfrage über TurnLight Website – ${f.Betrieb}`,
      _template: 'table',
      _captcha: 'false',
      _honey: f._honey,
      email: f.email,
      Name: f.Name, Betrieb: f.Betrieb, Telefon: f.Telefon, Stadt: f.Stadt,
      'Anzahl Tische': f['Anzahl Tische'], Nachricht: f.Nachricht,
    }),
    /* FormSubmit antwortet mit der Zeichenkette "true", nicht mit einem
       Wahrheitswert - ein lockerer Vergleich waere hier eine Falle. */
    geglueckt: (res, d) => res.ok && String(d.success) === 'true',
  },
].filter(Boolean);

/* ---------- Nav: Trennlinie erscheint beim Scrollen ----------
   Ausnahme ist der Farbfilm: der laeuft randlos bis unter die Nav, und eine
   Trennlinie quer durchs Bild waere genau die Kante, die dort nicht hingehoert.
   Solange er hinter der Nav steht, loest sie sich deshalb ins Bild auf. */
const nav = document.getElementById('nav');
const film = document.getElementById('farbfilm');

function navPruefen() {
  nav.classList.toggle('scrolled', scrollY > 10);
  if (!film) return;
  const r = film.getBoundingClientRect();
  nav.classList.toggle('ueber-film', r.top <= 0 && r.bottom > 0);
}
addEventListener('scroll', navPruefen, { passive: true });
navPruefen();

/* ---------- Knopf zum Weiterscrollen ----------
   Er soll da sein, wenn gerade nicht gescrollt wird, und aus dem Weg gehen,
   sobald es weitergeht. Deshalb kein Dauerzustand, sondern eine Ruhefrist:
   jedes Scrollereignis blendet ihn aus und setzt die Frist neu.

   Am Seitenende bleibt er weg – dort gaebe es nichts mehr zu zeigen, und ein
   Knopf, der nichts tut, ist schlimmer als keiner. */
const runter = document.getElementById('runter');
if (runter) {
  const RUHE = 900;   // ms ohne Scrollen, bis er auftaucht
  const REST = 140;   // ab so wenig Restweg lohnt sich der Sprung nicht mehr
  let frist;

  const restWeg = () =>
    document.documentElement.scrollHeight - window.innerHeight - window.scrollY;

  function pruefen() {
    runter.classList.toggle('da', restWeg() > REST);
  }

  function verstecken() {
    runter.classList.remove('da');
    clearTimeout(frist);
    frist = setTimeout(pruefen, RUHE);
  }

  addEventListener('scroll', verstecken, { passive: true });
  addEventListener('resize', verstecken, { passive: true });
  frist = setTimeout(pruefen, RUHE);

  runter.addEventListener('click', () => {
    /* Knapp unter einer Bildschirmhoehe: so bleibt immer ein Streifen des
       Vorherigen stehen und man verliert den Faden nicht. Ein Sprung zum
       naechsten Abschnitt waere im Farbfilm fatal – der ist vier Bildschirme
       hoch und wuerde komplett uebersprungen. */
    const weich = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollBy({ top: Math.round(window.innerHeight * 0.85), behavior: weich ? 'smooth' : 'auto' });
  });
}

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
   Versand über FormSubmit, damit kein eigener Mailserver nötig ist. */
/* Wie lange wir hoechstens auf einen Dienst warten, falls er keine eigene
   Grenze mitbringt. Ganz ohne Grenze bliebe der Knopf bei einer ausbleibenden
   Antwort fuer immer auf "Wird gesendet ..." stehen. */
const FORM_GEDULD = 20000;

/* Ab wann wir zugeben, dass es dauert. Ohne das starrt der Besucher einen
   unveraenderten Knopf an und haelt die Seite fuer kaputt - genau dann wird
   abgebrochen, obwohl die Zustellung noch laeuft. */
const FORM_GEDULDSFADEN = 5000;

/* Baut aus den Eingaben eine fertige Mail. Der Rettungsweg, falls kein Dienst
   erreichbar ist: ein Klick, und alles Getippte steht im Mailprogramm, statt
   verloren zu gehen. */
function notfallMailto(f) {
  const text = [
    `Name: ${f.Name}`,
    `Betrieb: ${f.Betrieb}`,
    `E-Mail: ${f.email}`,
    `Telefon: ${f.Telefon || '-'}`,
    `Stadt: ${f.Stadt || '-'}`,
    `Anzahl Tische: ${f['Anzahl Tische']}`,
    '',
    f.Nachricht || '',
  ].join('\n');
  return `mailto:${EMPFAENGER}`
    + `?subject=${encodeURIComponent('Anfrage von ' + f.Betrieb)}`
    + `&body=${encodeURIComponent(text)}`;
}

/* Ein Zustellversuch ueber einen Weg, mit harter Zeitgrenze. */
async function versuchen(weg, felder) {
  const abbruch = new AbortController();
  const wecker = setTimeout(() => abbruch.abort(), weg.geduld || FORM_GEDULD);
  try {
    const res = await fetch(weg.ziel, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(weg.bauen(felder)),
      signal: abbruch.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!weg.geglueckt(res, data)) {
      throw new Error(data.message || `${weg.name}: Senden fehlgeschlagen (${res.status})`);
    }
  } finally {
    clearTimeout(wecker);
  }
}

document.getElementById('contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type=submit]');
  const successEl = document.getElementById('formSuccess');
  const errorEl = document.getElementById('formError');
  successEl.style.display = 'none';
  errorEl.style.display = 'none';

  const felder = {
    /* Der Koeder: ein fuer Menschen unsichtbares Feld. Wer es ausfuellt, ist
       keiner - solche Einsendungen werden lautlos verworfen. */
    _honey: document.getElementById('fHoney').value,
    /* Damit eine Antwort direkt im Postfach an den Absender geht. */
    email: document.getElementById('fMail').value,
    Name: document.getElementById('fName').value,
    Betrieb: document.getElementById('fBiz').value,
    Telefon: document.getElementById('fPhone').value,
    Stadt: document.getElementById('fCity').value,
    /* Massgeblich ist das Eingabefeld - es kann ueber den Reglerbereich
       hinausgehen. */
    'Anzahl Tische': fTablesNum.value || 'keine Angabe',
    Nachricht: document.getElementById('fMsg').value,
  };

  const originalBtnHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Wird gesendet …';
  const faden = setTimeout(() => {
    submitBtn.textContent = 'Dauert gerade länger – bitte kurz warten …';
  }, FORM_GEDULDSFADEN);

  let zugestellt = false;
  for (const weg of FORM_WEGE) {
    try {
      await versuchen(weg, felder);
      zugestellt = true;
      break;
    } catch (err) {
      console.warn(`[TurnLight] ${weg.name} hat nicht zugestellt:`, err);
    }
  }

  clearTimeout(faden);

  if (zugestellt) {
    successEl.style.display = 'block';
    submitBtn.style.display = 'none';
    form.reset();
    return;
  }

  console.error('[TurnLight] Kein Zustellweg erreichbar – Anfrage wird als Mail angeboten.');
  /* Nichts geht verloren: der Hinweis traegt die Eingaben als fertige Mail
     bei sich. */
  const link = errorEl.querySelector('a');
  if (link) {
    link.href = notfallMailto(felder);
    link.removeAttribute('target');
  }
  errorEl.style.display = 'block';
  submitBtn.disabled = false;
  submitBtn.innerHTML = originalBtnHtml;
});
