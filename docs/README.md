# TurnLight

Statische Produktseite für kabellose Service-Lampen in der Gastronomie.
Kein Build, kein Framework – HTML, CSS und Vanilla-JS.

```bash
python3 tools/devserver.py 4788
```

`tools/devserver.py` ist `http.server` plus `Cache-Control: no-store`. Der
eingebaute Server schickt gar keine Cache-Header, worauf Safari und Chrome
Bilder heuristisch behalten – nach einem Bildtausch zeigen sie dann tagelang
die alte Datei, besonders hartnäckig bei `.webp` aus `<picture>`. Deshalb der
eigene Server. Zusätzlich hängt an allen Bildpfaden in `index.html` und
`medien/liste.js` ein `?v=2`; das war die einmalige Spülung für Caches, die
sich schon vergiftet hatten. Beim nächsten Bildtausch hochzählen, falls doch
noch etwas klebt.

Dann http://localhost:4788 aufrufen. (In Claude Code: Launch-Config `lumacall`.)

## Aufbau

```
index.html          Startseite – alle Abschnitte
impressum.html      ┐
datenschutz.html    ├ Rechtsseiten, Layout über .legal
agb.html            ┘
css/fonts.css       @font-face für Fraunces, Inter, Poppins (Google-CDN)
css/style.css       komplettes Stylesheet, nach Abschnitten sortiert
js/main.js          Nav, Scroll-Reveal, Lampen-Demo, Farbwähler, Rechner, Formular
js/mediathek.js     Tabs, Karussell und Lightbox der Mediathek
js/legal.js         Mini-Skript der Rechtsseiten
medien/liste.js     << hier Bilder & Videos der Mediathek eintragen
medien/*            Medien der Mediathek
img/, video/        Bilder und Videos der Startseite
```

## Farben ändern

Alle Akzentfarben hängen an vier Tokens ganz oben in `css/style.css`:

```css
--accent:#d9c08c;          /* Markenfarbe */
--accent-soft:#f0e3c6;     /* kursive Akzente in Headlines */
--accent-rgb:217,192,140;  /* dieselbe Farbe für alle rgba()-Schleier */
--accent-soft-rgb:240,227,198;
--accent-ink:#1d1708;      /* Text auf gefüllten Akzentflächen */
```

Es gibt keine fest verdrahteten Akzent-Hexwerte mehr – `--accent` und
`--accent-rgb` zusammen ändern, dann zieht die gesamte Seite mit (Buttons,
Glows, Rahmen, Slider, Mediathek). Zwei Dinge bleiben bewusst außen vor:

- `--red` ist das Signalrot des Service-Rufs und darf nicht zur Markenfarbe werden.
- Die sieben Lichtfarben im Abschnitt „Farben" sind ein Produktmerkmal, keine
  Markenfarben. Sie stehen als `data-c` an den Swatches in `index.html`.

## Logo

Inline-SVG in `index.html` (Nav und Footer) plus Wortmarke als HTML-Text –
dadurch skaliert es verlustfrei und färbt über dieselben Tokens mit. Die
Formen liegen in `.logo-mark` in `css/style.css`:

```
.lm-arc      Drehbogen        → var(--accent)
.lm-head     Pfeilspitze      → var(--accent)
.lm-knob     Drehknopf        → var(--accent-soft)
.lm-pointer  Markierung       → var(--ink-dim)
```

`img/favicon.svg` enthält dieselbe Marke auf dunklem Grund; die beiden PNGs
sind daraus gerendert. Nach einer Änderung am SVG neu erzeugen:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --screenshot=favicon-180.png --window-size=180,180 \
  --default-background-color=00000000 file://$PWD/img/favicon.svg
```

## Was noch zu erledigen ist

- **Impressum-Anschrift** fehlt noch (siehe Rechtsseiten). E-Mail und
  Instagram sind eingetragen.
- **Formular ist noch nicht scharf geschaltet** – siehe „Kontaktformular".
- **Rechtsseiten:** Impressum, Datenschutz und AGB enthalten Platzhalter –
  vor einem Livegang ausfüllen, AGB anwaltlich prüfen lassen.
- **Videomaterial:** Der Abschnitt „In der Praxis" und der Mediathek-Tab
  „Videos" sind ausgesetzt, weil die Clips aus der Vorlage stammten. Sie
  liegen in `_vorlage-original/` (nicht eingebunden, nicht freigegeben).
  Mit eigenen Clips: Dateien nach `video/` legen, in `index.html` den
  Abschnitt entkommentieren, in `medien/liste.js` die Einträge aktivieren.
- **Bildauflösung:** alle Produktbilder stammen aus 920 px breiten
  Screenshots. Durch die Originaldateien der Instagram-Posts ersetzen.
- **Bildschärfe:** siehe „Bildmaterial" – die Produktbilder sollen neu
  erzeugt oder durch die Originaldateien ersetzt werden.

## Kontaktformular

**Aktuell wird keine Nachricht zugestellt.** In `js/main.js` steht noch der
Platzhalter statt eines Access Keys. Das Formular erkennt das, sendet dann
gar nicht erst (die Daten des Absenders verlassen den Rechner nicht) und
zeigt stattdessen den Hinweis mit der Mailadresse. In der Browser-Konsole
steht eine deutliche Warnung.

Scharf schalten in zwei Schritten:

1. Auf web3forms.com `turnlight.de@gmail.com` eintragen – der Access Key
   kommt per Mail. Es ist eine Anmeldung: Mailadresse bestätigen und
   Marketing-Kontakt zustimmen.
2. In `js/main.js` ganz oben eintragen:
   `const WEB3FORMS_KEY = '<der-key>';`

Danach eine Testnachricht abschicken und prüfen, ob sie ankommt.

Die Empfängeradresse `turnlight.de@gmail.com` steht bereits überall, wo sie
hingehört (Kontaktblock, Fehlerhinweis, Impressum, Datenschutz) – **das
allein stellt aber nichts zu.** Ohne Access Key geht keine Nachricht raus.

Bei **„Anzahl Tische"** gibt es zwei Wege zum selben Wert: einen
Schieberegler von 1 bis 100 und daneben ein Feld, in das man die Zahl direkt
tippt. Beide halten sich gegenseitig nach. Wer mehr als 100 Tische hat, tippt
die Zahl ein (bis 999) – der Regler bleibt dann am Anschlag stehen, es gilt
die getippte Zahl. Auch in der Mail steht der Wert aus dem Eingabefeld.

Drei Stolpersteine beim Ändern:

- Die Regel `.form-field input` setzt Hintergrund, Rahmen und Polster der
  Textfelder und würde den Regler zerlegen – `.form-field input[type=range]`
  nimmt das gezielt zurück.
- Das Zahlenfeld sieht bewusst aus wie die übrigen Formularfelder (Rahmen,
  Hintergrund, Radius). Als bloße unterstrichene Zahl wurde es nicht als
  eingebbar erkannt. Seine Höhe gibt die Zeilenhöhe vor, der Regler dehnt
  sich darauf aus – dadurch sitzt die Zeile von selbst bündig zum Nachbarfeld,
  ohne feste Pixelwerte.
- Ein leeres Zahlenfeld wird beim Tippen **nicht** überschrieben, sonst
  springt einem die Zahl unter den Fingern weg. Aufgeräumt wird erst beim
  Verlassen des Feldes.

Web3Forms sitzt in den USA und ist in der Datenschutzerklärung als
Auftragsverarbeiter genannt. Wird ein anderer Dienst verwendet, muss der
Abschnitt angepasst werden.

## Mobil

Geprüft bei 375 px und 320 px: kein horizontaler Überlauf, Tab-Leiste unten,
Tippziele mindestens 34 px.

Vier Eigenheiten, die beim Ändern leicht wieder kaputtgehen:

- **Galeriebilder unter 700 px.** Jedes Motiv ist in einem festen
  Seitenverhältnis erzeugt (1,62:1 schmal, 2,44:1 breit). Der ursprüngliche
  starre `height:280px` schnitt davon auf dem Handy bis zu 54 % weg – von der
  Siebenerreihe blieben drei Lampen. Deshalb bekommen die Bilder dort
  `aspect-ratio` statt fester Höhe, und die Bildunterschrift sitzt **unter**
  dem Bild: als Overlay würde sie einen nur 130 px hohen Streifen fast
  vollständig verdecken.

- **Einblend-Animation darf Inhalt nicht verstecken.** `.reveal` startet auf
  `opacity:0`. Der IntersectionObserver meldet aber nur Elemente, die einmal
  tatsächlich im Sichtfeld gerendert wurden – springt man über die Tab-Leiste
  mitten in die Seite, blieben die übersprungenen Abschnitte sonst dauerhaft
  unsichtbar. Deshalb in `js/main.js`: `revealSweep()` trägt nach, was schon
  oberhalb der Unterkante liegt, ausgelöst vom Observer, von `scroll`, von
  `hashchange`, `resize` **und** von einem Wächter-Intervall, das sich selbst
  abschaltet, sobald alles sichtbar ist. Scroll-Ereignisse und
  `requestAnimationFrame` werden in Hintergrund-Tabs ausgesetzt – daran darf
  Sichtbarkeit von Inhalt nicht hängen. Zusätzlich greift der Startzustand nur
  unter `.js` am `<html>`: ohne JavaScript bleibt alles sichtbar.
- **Schieberegler im Rechner** sind 34 px hoch, damit sie sich mit dem Finger
  treffen lassen. Die Spur wird als 5-px-Band mittig hineingezeichnet
  (`background-size:100% 5px`), sieht also weiter schlank aus. Die Höhe nicht
  auf 5 px zurücksetzen – dann ist der Regler am Handy unbedienbar.
- **Farbkreise** brauchen unter 620 px `row-gap:30px`, sonst ragt die
  Beschriftung des aktiven Kreises in die zweite Reihe. Dort ist sie ohnehin
  ausgeblendet, weil die Bedeutung darunter in `.swatch-meaning` steht.

## Signalfarben

Die sieben Farben sind **Signale, keine Deko** – so wie es der Instagram-Kanal
definiert. Die Zuordnung steht als `data-meaning` an den Swatches in
`index.html`, der Farbwähler in `js/main.js` schaltet Lampe, Farbname und
Bedeutung zusammen:

| Farbe | Bedeutung        | Farbe | Bedeutung         |
|-------|------------------|-------|-------------------|
| Rot   | Service bitte    | Cyan  | Information bitte |
| Rosa  | Getränke bitte   | Gelb  | Bestellung bitte  |
| Lila  | Rechnung bitte   | Grün  | Alles ok          |
| Blau  | Hilfe bitte      |       |                   |

Eine Farbe ändern heißt: `data-c` und `data-meaning` am Swatch anpassen – der
Rest zieht automatisch mit.

## Bildmaterial

Alle Produktbilder sind mit **gemini-3.1-flash-image** über den Figma-MCP
erzeugt – für **jeden Platz ein eigenes Motiv im Seitenverhältnis seines
Rahmens**, damit nichts beschnitten oder verzerrt wirkt:

| Platz | Verhältnis | Dateien |
|-------|-----------|---------|
| Hero (`.lamp`) | 1,40 : 1 | `lamp-yellow-solo`, `lamp-red-solo` |
| Schrittkarten (`.step-media`) | 1,62 : 1 | `hero`, `turn`, `waiter` |
| Galerie schmal | 1,62 : 1 | `service-ruf`, `station` |
| Galerie breit (`.g-wide`) | 2,44 : 1 | `interior`, `charging-detail` |
| Mediathek (`.mt-card`) | 4 : 5 | `medien/*.jpg` |

**Die Produktform muss in jedem Prompt wörtlich wiederholt werden**, sonst
driftet sie zu Kegeln oder Kuppeln ab:

> gerader Zylinder, etwa doppelt so hoch wie breit, über die ganze Höhe
> gleicher Durchmesser, keine Verjüngung und keine Kuppel. Von oben nach
> unten vier saubere Bänder: gebürsteter **Edelstahl** mit flacher Deckfläche
> und kleinem Mittelpunkt (28 %), mattweißes Milchglasband mit scharfen
> Kanten (38 %), gebürsteter Edelstahl-Sockel (29 %), dünner schwarzer
> Fußring (5 %). Kühles Silber, **kein Messing**, keine Knöpfe, kein Logo.

Zwei Bilder sind **abgeleitet statt erzeugt**:

- `lamp-red-solo` entsteht mit `tools/rot-ableiten.py` aus
  `lamp-yellow-solo`. Zwei getrennte Aufnahmen träfen die Proportionen nie
  gleich, dadurch spränge die Form beim Überblenden im Hero. Das Skript
  erklärt auch die zwei Fallen dabei: ein globaler Farbton-Shift färbt sonst
  den ganzen Raum rot, und Rot am Rand der HSV-Skala erzeugt ohne Aufwickeln
  einen Grünschimmer auf dem Edelstahl.
- `medien/cafe-fliesentisch.jpg` ist die grüne Variante von
  `medien/restaurant-tisch.jpg` – das Tageskontingent war aufgebraucht.

**Figma-Kontingent:** rund **10 Bilder pro Tag**, danach „usage limit" für
beide Gemini-Modelle gemeinsam. Rückgabe-URLs verfallen nach 7 Tagen, also
sofort herunterladen.

## Herkunft

Layout und Struktur sind als Nachbau von luma-call.com entstanden. Marke,
Name, Logo, Farbwelt und sämtliche Bilder sind eigenständig. Gegen das Original abgeglichen
wurde über Layout-Fingerprints (BoundingBoxes aller Sektionen) bei 1440 px
und 375 px.

Eine bewusste Abweichung: das Original liefert alle `.reveal`-Elemente schon
mit Klasse `in` aus, dadurch läuft die Einblend-Animation dort nie. Hier steht
nur `reveal`, die Abschnitte blenden beim Scrollen ein.
