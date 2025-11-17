# AMJ Social Media Workshops

One-page landing page for the Ahmadiyya Muslim Jamaat (Deutschland) to promote three curated
social-media workshops including a dynamic registration workflow with database persistence
and e-mail notifications.

## Entwicklung & Betrieb

```bash
npm install
npm start
```

The server runs on `http://localhost:3000` by default and serves the static single page
application from the `public/` directory.

### Umgebung konfigurieren

Duplicate `.env.example` and adjust the SMTP credentials so that confirmation e-mails can be
sent both to interested participants and the administrator.

| Variable | Beschreibung |
| --- | --- |
| `PORT` | Optionaler Port für den Express-Server |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Zugangsdaten zu eurem SMTP-Server |
| `SMTP_USER`, `SMTP_PASS` | Login für das Absenderpostfach |
| `ADMIN_EMAIL` | Empfängeradresse für Backoffice-Notifications |

Ohne SMTP-Konfiguration werden Anmeldungen weiterhin gespeichert, aber es erfolgt kein
Mailversand.

### Datenbank

- SQLite-Datenbank unter `data/workshop_registrations.db`
- Tabelle `registrations` speichert Stammdaten sowie dynamische Antworten als JSON
- Export als CSV via `GET /api/registrations/export`

## Frontend-Funktionen

- Hero-Slider mit Autoplay und manueller Navigation
- Workshops als Karten mit CTA und erklärenden Texten
- Dynamisches Formular: spezifische Fragen je Workshop, Validierung im Browser
- Smooth-Scrolling und Sticky-Navigation

## Backend-Funktionen

- Express-API zum Speichern der Anmeldungen
- Nodemailer-Integration (optional) für Versand an Interessent:in und Admin
- SQLite-Persistence samt CSV-Export
