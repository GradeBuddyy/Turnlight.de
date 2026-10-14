/* =====================================================================
   TURNLIGHT MEDIATHEK – HIER BILDER & VIDEOS EINTRAGEN
   ---------------------------------------------------------------------
   Nur diese Datei bearbeiten.

   1. Datei in den Ordner "medien" legen (z. B. medien/bar-abend.jpg)
   2. Unten einen Eintrag kopieren und anpassen
   3. Speichern, Seite neu laden – fertig

   Felder:
     typ        "bild" oder "video"
     datei      Pfad zur Datei, z. B. "medien/bar-abend.jpg"
     vorschau   nur bei Videos: Standbild (optional)
     titel      kurze Überschrift
     text       kurzer Satz darunter (optional)
     kategorie  Name des Tabs. Neuer Name = neuer Tab (automatisch)

   Reihenfolge hier = Reihenfolge auf der Website.
   Wichtig: Jeder Eintrag endet mit },   (Komma nicht vergessen)
   ===================================================================== */

window.TURNLIGHT_MEDIEN = [

  // ---------- Kategorie: Fotos ----------
  { typ: "bild",  datei: "medien/restaurant-abend.jpg?v=20",  titel: "Am Abend",         text: "Warmes Licht zwischen Gedeck und Blumen.", kategorie: "Fotos" },
  { typ: "bild",  datei: "medien/restaurant-tisch.jpg?v=20",  titel: "Service bitte",    text: "Ein Dreh auf Rot – im Raum nicht zu übersehen.", kategorie: "Fotos" },
  { typ: "bild",  datei: "medien/cafe-fliesentisch.jpg?v=20", titel: "Alles ok",         text: "Grün heißt: alles in Ordnung am Tisch.",   kategorie: "Fotos" },

  // ---------- Kategorie: Videos ----------
  // Ausgesetzt: die Videos stammten aus der Vorlage und liegen jetzt in
  // _vorlage-original/. Sobald eigene Clips da sind, hier wieder aktivieren –
  // der Tab "Videos" baut sich dann von selbst wieder auf.
  // { typ: "video", datei: "medien/mein-video-1.mp4", vorschau: "medien/mein-video-1.jpg", titel: "Einfach umdrehen", kategorie: "Videos" },
  // { typ: "video", datei: "medien/mein-video-2.mp4", vorschau: "medien/mein-video-2.jpg", titel: "Im Restaurant",    kategorie: "Videos" },
  // { typ: "video", datei: "medien/mein-video-3.mp4", vorschau: "medien/mein-video-3.jpg", titel: "Im Café",          kategorie: "Videos" },

  // ---------- NEUE EINTRÄGE HIER DRUNTER ----------
  // { typ: "bild",  datei: "medien/mein-foto.jpg", titel: "Titel", text: "Kurzer Satz", kategorie: "Fotos" },
  // { typ: "video", datei: "medien/mein-video.mp4", vorschau: "medien/mein-video.jpg", titel: "Titel", kategorie: "Videos" },

];
