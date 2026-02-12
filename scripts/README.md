# 🎬 Anleitung: Filmdaten in die Datenbank laden

Diese Anleitung beschreibt, wie Sie Filminformationen und Poster aus dem FILM-Ordner in die Datenbank importieren.

## 📋 Schritte

### 1️⃣ Filmdaten importieren

Alle Filminformationen und Poster aus dem FILM-Ordner in das Projekt übernehmen:

```bash
cd cinemor-react
node scripts/importMovies.cjs
```

**Dieses Script:**
- ✅ Durchsucht alle Unterordner im FILM-Ordner
- ✅ Liest die Filminformationen aus der Textdatei pro Film aus
- ✅ Kopiert die Poster in den Ordner `public/images/movies/`
- ✅ Legt den Status „Coming Soon“ / „Now Showing“ automatisch anhand des Datums fest
- ✅ Erstellt die Datei `movies-data.json`

**Ausgabe:**
- `movies-data.json` – alle Filmdaten im JSON-Format
- `public/images/movies/comingsoon/` – Poster von „Demnächst“-Filmen
- `public/images/movies/nowshowing/` – Poster von Filmen „Jetzt im Kino“

### 2️⃣ Backend starten

Stellen Sie sicher, dass die Backend-API läuft:

```bash
cd cinemor-api
.\mvnw.cmd spring-boot:run
```

Das Backend muss unter folgender Adresse erreichbar sein: `http://localhost:8080`

### 3️⃣ Daten in die Datenbank laden

Daten vom Frontend-Projekt an das Backend senden:

```bash
cd cinemor-react
node scripts/uploadMoviesToDB.cjs
```

**Hinweis:** Bei Node.js unter Version 18 das Paket `node-fetch` installieren:
```bash
npm install node-fetch
```

Und im Script einbinden:
```javascript
const fetch = require('node-fetch');
```

### 4️⃣ Daten prüfen

Backend-API-Endpunkte testen:

- **Alle Filme:** `GET http://localhost:8080/api/movies`
- **Coming Soon:** `GET http://localhost:8080/api/movies/coming-soon`
- **Now Showing:** `GET http://localhost:8080/api/movies/now-showing`
- **Einzelner Film:** `GET http://localhost:8080/api/movies/{id}`

## 📊 Datenstruktur

Jeder Film enthält unter anderem:

```json
{
  "title": "Filmtitel",
  "originalTitle": "Originaltitel",
  "genre": "Genre",
  "duration": "Länge",
  "director": "Regisseur",
  "cast": "Darsteller",
  "year": "Jahr",
  "country": "Land",
  "releaseDate": "Startdatum",
  "fsk": "Altersfreigabe",
  "posterPath": "/images/movies/...",
  "isComingSoon": true/false
}
```

## 🔄 Aktualisierung

Wenn neue Filme hinzukommen:

1. Neuen Ordner im FILM-Ordner anlegen
2. `importMovies.cjs` erneut ausführen
3. `uploadMoviesToDB.cjs` ausführen

**Hinweis:** Existiert bereits ein Film mit gleichem Namen, wird er aktualisiert (kein doppelter Eintrag).

## 🛠️ Fehlerbehebung

### Backend-Verbindungsfehler
- Prüfen, ob das Backend läuft
- In `application.properties` die Datenbankeinstellungen prüfen
- CORS-Einstellungen prüfen

### Film wird nicht gefunden
- FILM-Ordnerstruktur prüfen
- In jedem Ordner muss eine Datei `Yeni Textdokument.txt` (oder entsprechende Textdatei) liegen
- In der Textdatei muss das Feld „Filmtitel“ vorhanden sein

### Poster wurde nicht kopiert
- Im Ordner muss eine Datei mit Endung .jpg, .jpeg oder .png liegen
- Der Dateiname darf nicht „Textdokument“ enthalten

## 📝 Hinweise

- Das Script legt den Status „Coming Soon“ / „Now Showing“ anhand des Datums automatisch fest
- Bei gleichem Filmtitel wird aktualisiert, es wird kein neuer Datensatz angelegt
- Poster werden automatisch in die passenden Ordner kopiert
