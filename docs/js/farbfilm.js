/* ==================================================================
   Farbfilm – scrollgesteuerte Bildfolge
   ------------------------------------------------------------------
   Das Video wurde in 240 Einzelbilder zerlegt (img/film/f001…f240.webp,
   1280x720, erzeugt von tools/film-frames.py).
   Die Scrollposition innerhalb des Abschnitts bestimmt, welches Bild
   gezeichnet wird; daneben steht die Bedeutung der gerade gezeigten Farbe.

   Warum Einzelbilder und kein <video>: Das Scrubben per currentTime ist
   ruckelig und auf iOS unzuverlässig, weil der Browser nur zu Keyframes
   springt. Einzelbilder sind hier billig – 4 KB pro Frame, knapp 1 MB
   insgesamt, weil der Hintergrund fast schwarz ist.
   ================================================================== */
(function () {
  const section = document.getElementById('farbfilm');
  const canvas = document.getElementById('filmCanvas');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const elFarbe = document.getElementById('filmFarbe');
  const elBedeutung = document.getElementById('filmBedeutung');
  const elBalken = document.getElementById('filmBalken');
  const elHinweis = document.getElementById('filmHinweis');

  const ANZAHL = 240;
  const pfad = i => `img/film/f${String(i).padStart(3, '0')}.webp?v=32`;

  /* Abschnitte, ausgemessen am Video (Frame-Bereiche, 1-basiert).
     Die Grenzen stammen aus der gemessenen Bandfarbe, nicht aus Schätzung. */
  const ABSCHNITTE = [
    { bis:  51, farbe: 'Warmes Licht', hex: '#f0d9a0',
      text: 'Im Normalbetrieb leuchtet die Lampe ruhig warm – wie eine Kerze, nur ohne Flamme.' },
    { bis:  99, farbe: 'Ein Dreh',     hex: '#ff8a6a',
      text: 'Der Gast dreht die Lampe. Keine Knöpfe, keine App, kein Winken.' },
    { bis: 137, farbe: 'Service bitte', hex: '#ff4136',
      text: 'Signalrot – im ganzen Raum sichtbar. Ihr Team geht gezielt dorthin.' },
    { bis: 167, farbe: '16 Stunden Akku', hex: '#d9c08c',
      text: 'Eine Ladung hält einen kompletten Service-Tag. Abends gemeinsam laden.' },
    { bis: 198, farbe: '7 Signalfarben',  hex: '#d9c08c',
      text: 'Jede Farbe sagt Ihrem Team, worum es geht – von Getränken bis Rechnung.' },
    { bis: 219, farbe: 'IP65',      hex: '#d9c08c',
      text: 'Staubdicht und gegen Spritzwasser geschützt. Auch auf der Terrasse.' },
    { bis: ANZAHL, farbe: 'Keine Installation', hex: '#d9c08c',
      text: 'Auspacken, aufstellen, fertig. Kein Strom am Tisch, kein Handwerker.' },
  ];

  /* ---------- Bilder laden ---------- */
  const bilder = new Array(ANZAHL + 1);
  let geladen = 0;

  function laden(i) {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => {
      bilder[i] = im;
      geladen++;
      /* Solange noch nichts im Rahmen steht, bei jedem Ladevorgang neu
         zeichnen – sonst bleibt die Leinwand schwarz, bis gescrollt wird. */
      if (letzterIndex === -1) zeichne();
    };
    im.onerror = () => { geladen++; };
    im.src = pfad(i);
  }
  /* Das erste Bild zuerst, danach der Rest – so steht sofort etwas im Rahmen */
  laden(1);
  for (let i = 2; i <= ANZAHL; i++) laden(i);

  /* Nächstes vorhandenes Bild suchen, falls eines noch nicht geladen ist.
     Sonst blitzt beim Scrollen während des Ladens ein leerer Rahmen auf. */
  function naechstesBild(i) {
    for (let d = 0; d <= ANZAHL; d++) {
      if (bilder[i - d]) return bilder[i - d];
      if (bilder[i + d]) return bilder[i + d];
    }
    return null;
  }

  /* ---------- Fortschritt aus der Scrollposition ---------- */
  function fortschritt() {
    const r = section.getBoundingClientRect();
    const weg = r.height - innerHeight;      // Strecke, die gescrollt wird
    if (weg <= 0) return 0;
    return Math.min(1, Math.max(0, -r.top / weg));
  }

  /* ---------- Randloses Zeichnen ----------
     Die Leinwand fuellt ihre Buehne bis an die Kanten, hat also nicht das
     Seitenverhaeltnis der Bilder. Statt das Bild zu verzerren, wird der
     groesstmoegliche Ausschnitt formatfuellend gezeichnet.

     Der Ausschnitt sitzt bewusst nicht mittig: FOKUS_X unter 0.5 schneidet
     links weniger weg als rechts und schiebt damit die Lampe nach rechts –
     neben den Text, nicht darunter. FOKUS_Y ueber 0.5 behaelt eher den
     unteren Bildteil, wo Lampenfuss und Spiegelung liegen. */
  const FOKUS_X = 0.34;
  const FOKUS_Y = 0.62;

  /* Die Pixelgroesse der Leinwand muss der Anzeigegroesse folgen, sonst
     zeichnet der Browser ein 300x150 grosses Standardbild hoch. Mehr als
     zwei Geraetepixel pro CSS-Pixel bringt hier nichts sichtbares mehr. */
  function groesseAnpassen() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const dichte = Math.min(window.devicePixelRatio || 1, 2);
    const b = Math.round(r.width * dichte);
    const h = Math.round(r.height * dichte);
    if (b === canvas.width && h === canvas.height) return false;
    canvas.width = b;
    canvas.height = h;
    return true;
  }

  function malen(im) {
    const bw = canvas.width, bh = canvas.height;
    const skala = Math.max(bw / im.naturalWidth, bh / im.naturalHeight);
    const zw = im.naturalWidth * skala, zh = im.naturalHeight * skala;
    ctx.clearRect(0, 0, bw, bh);
    ctx.drawImage(im, (bw - zw) * FOKUS_X, (bh - zh) * FOKUS_Y, zw, zh);
  }

  let letzterIndex = -1;
  let letzterAbschnitt = -1;

  function zeichne() {
    const p = fortschritt();
    const index = Math.min(ANZAHL, Math.max(1, Math.round(p * (ANZAHL - 1)) + 1));

    /* Nach einer Groessenaenderung ist die Leinwand leer und muss auch dann
       neu bemalt werden, wenn derselbe Frame an der Reihe ist. */
    const neuVermessen = groesseAnpassen();

    if (index !== letzterIndex || neuVermessen) {
      const im = naechstesBild(index);
      /* letzterIndex nur merken, wenn wirklich gezeichnet wurde. Sonst gilt
         der Frame als erledigt, obwohl das Bild noch gar nicht da war. */
      if (im) {
        malen(im);
        letzterIndex = index;
      }
    }
    if (elBalken) elBalken.style.width = (p * 100).toFixed(1) + '%';

    /* Beschriftung nur bei echtem Abschnittswechsel anfassen – sonst
       schreibt man bei jedem Frame ins DOM. */
    const a = ABSCHNITTE.findIndex(s => index <= s.bis);
    if (a !== -1 && a !== letzterAbschnitt) {
      const s = ABSCHNITTE[a];
      elFarbe.textContent = s.farbe;
      elFarbe.style.setProperty('--signal', s.hex);
      elBedeutung.textContent = s.text;
      elFarbe.classList.remove('wechsel');
      void elFarbe.offsetWidth;            // Neustart der Animation erzwingen
      elFarbe.classList.add('wechsel');
      letzterAbschnitt = a;
    }
    if (elHinweis) elHinweis.style.opacity = p > 0.04 ? '0' : '';
  }

  /* ---------- Anbindung ans Scrollen ----------
     requestAnimationFrame glättet die Zeichenaufrufe. Anders als bei der
     Einblend-Animation ist das hier unkritisch: Ein Scrub ist nur relevant,
     wenn der Abschnitt tatsächlich sichtbar ist. */
  let geplant = false;
  function anfordern() {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(() => { geplant = false; zeichne(); });
  }
  addEventListener('scroll', anfordern, { passive: true });
  addEventListener('resize', anfordern, { passive: true });
  zeichne();
})();
