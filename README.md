# selfCheckIn

SelfCheckIn ist ein kleines Full-Stack-Projekt mit einem React/Vite-Frontend und einem Node-/Express-Backend. Das Projekt kann lokal entwickelt und später auch mit Cloudflare Wrangler deployed werden.

## Projektstruktur

```text
selfCheckIn/
├── backend/                    # lokales Backend für Entwicklung
│   ├── .env                    # lokale Umgebungsvariablen für Express-Server
│   ├── README.md               # Backend-spezifische Hinweise
│   ├── package.json            # Scripts für local dev / typecheck
│   ├── server.ts               # Express-Server
│   ├── mailService.ts          # Mail-Service für Express-Server
│   ├── defineKeypadCode.ts     # API-Logik
│   ├── getCheckInInformation.ts
│   ├── initiateCheckInProcess.ts
│   ├── validation.ts
│   ├── types                   # TypeScript-Typen
│   └── worker/                 # Cloudflare Worker-Version des Backends
│       ├── wrangler.jsonc      # Wrangler-Konfiguration für Worker
│       ├── package.json
│       └── src                 # Quellcode für den Worker
│           └── types           # TypeScript-Typen
├── frontend/                   # Vite + React Frontend
│   ├── .env                    # lokale API-URL für Entwicklung
│   ├── .env.production         # ggf. Produktions-URL für Build
│   ├── README.md               # Frontend-spezifische Hinweise
│   ├── package.json            # npm-Skripte und DevDeps
│   ├── wrangler.jsonc          # Wrangler-Konfiguration für static asset deploy
│   ├── vite.config.ts
│   └── src/
└── README.md                   # Projekt-Übersicht / Deployment-Hinweise
```

## Lokale Entwicklung

### 1) Backend starten

```bash
cd backend
npm install
npm run dev
```

Das Backend läuft standardmäßig auf:

- http://localhost:7071

Die Backend-Umgebung erwartet in `backend/.env` folgende Werte:

```env
SMOOBU_API_KEY=""
NUKI_API_TOKEN=""
NUKI_SMARTLOCK_ID=""
ADMIN_NAME=""
BREVO_API_KEY=""
EMAIL_FROM=""
```

### 2) Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Die Frontend-Umgebung erwartet in `frontend/.env` eine passende URL:

```env
// Mit wrangler DEV aktiv:
//VITE_API_BASE_URL=http://127.0.0.1:8787

//Nur lokal:
VITE_API_BASE_URL=http://127.0.0.1:7071
```

Wichtig: Wenn das Frontend an das lokale Backend koppelt, muss die URL mit dem Backend-Port übereinstimmen. Das Frontend verwendet `import.meta.env.VITE_API_BASE_URL`.

## Deployment mit Wrangler

### Voraussetzungen

- Cloudflare-Account
- `wrangler` installiert
- einmalige Anmeldung:

```bash
npx wrangler login
```

### Backend deployen (Cloudflare Worker)

```bash
cd backend/worker
npm install
npx wrangler deploy
```

Die Konfiguration liegt in `backend/worker/wrangler.jsonc` und deployt den Worker direkt auf Cloudflare.

### Frontend deployen (Static Assets / Worker-Assets)

```bash
cd frontend
npm install
npm run build
npx wrangler deploy
```

Die Datei `frontend/wrangler.jsonc` konfiguriert den Upload des gebauten Frontends aus `./dist`.

Hinweis: Vor dem Build in der Produktion muss die API-URL in `frontend/.env.production` korrekt gesetzt sein, damit das Frontend beim Deployment nicht auf den falschen Backend-Endpunkt zeigt.

Inhalt von `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://selfcheckin.raz-check-in.workers.dev
```

## Wichtige Deployment-Checks

- Frontend-Build prüfen: `npm run build`
- Backend-Check prüfen: `npm run typecheck`
- Produktions-URL im Frontend immer mit dem tatsächlich deployten Backend abstimmen
- Bei Worker-Deployments `wrangler.jsonc` und `.env`/`.env.production` nicht vergessen

## Secret zu Wrangler hinzufügen (Im worker Verzeichnis)

```bash
npx wrangler secret put <SECRET_NAME>
```
Auf cloudflare.com unter Compute → Workers & Pages → selfcheckin → Settings → Runtime variables and secrets kann man die Secrets einsehen und bearbeiten.

## Typische Reihenfolge für neues Deployment

```bash
cd backend/worker
npm install
npx wrangler deploy

cd ../../frontend
npm install
npm run build
npx wrangler deploy
```

## Lokal Wrangler testen

```bash
cd backend/worker
npx wrangler dev
```
Damit bleibt das Deployment reproduzierbar und leicht nachvollziehbar.

## .dev.vars Datei für Wrangler Dev

```bash
cd backend/worker
```
Dort muss auch eine .dev.vars Datei liegen, die die Secrets enthält, damit Wrangler Dev lokal die Secrets kennt. Beispiel:

```env
SMOOBU_API_KEY=...
NUKI_API_TOKEN=...
NUKI_SMARTLOCK_ID=...
ADMIN_NAME=...
BREVO_API_KEY=...
EMAIL_FROM=...
```

## Für lokales Testen des Projekts ohne AI
frontend/.env:

```env
VITE_API_BASE_URL=http://localhost:7071
```
Frontend und backend lokal starten

## Für lokales testen des Projekts mit AI
im backend/worker Verzeichnis:
```bash
npx wrangler dev
```
frontend/.env: (Die Adresse vom backend worker dev übernehmen)
```env
VITE_API_BASE_URL=http://127.0.0.1:8787
```
frontend lokal starten

## AI
Alle vorhanden Embeddings löschen:
```bash
$vectors = npx wrangler vectorize list-vectors apartment-knowledge --count=1000 --json | ConvertFrom-Json
$ids = $vectors.vectors.id
npx wrangler vectorize delete-vectors apartment-knowledge --ids $ids
```
Prüfen ob auch wirklich alle Embeddings gelöscht wurden:
```bash
$vectors = npx wrangler vectorize list-vectors apartment-knowledge --count=1000 --json | ConvertFrom-Json
$vectors.count
```
Erstellen aller Embeddings als vektorisierte Daten für die Datei backend/worker/src/knowledge.ts über folgenden Befehl:
```bash
npx wrangler dev
Invoke-RestMethod -Method Post -Uri "http://localhost:8787/api/ai/seed-knowledge"
```
Danach befinden sich alle Daten direkt auf Cloudflare

## KV Erzeugen
Nur einmalig ausführen:
```bash
npx wrangler kv namespace create PROMPTS
```
KV Eintrag hinzufügen:
```bash
npx wrangler kv key put --namespace-id 2378b10eb26e44389c54217c4fe4e8dc system-prompt --remote --path system-prompt.txt
```
KV-Eintrag abrufen für Kontrolle:
```bash
npx wrangler kv key get --namespace-id 2378b10eb26e44389c54217c4fe4e8dc system-prompt --remote
```
Auf cloudflare.com unter Storage & Databases → Workers KV → PROMPTS → KV Pairs kann man die Einträge auch sehen und bearbeiten.

## Erreichbarkeit der Produktiv-UI
Die UI ist aktuell erreichbar unter: https://ui.raz-check-in.workers.dev

## D1 Datenbank
Migration lokal ausführen:
```bash
cd backend/worker
npx wrangler d1 migrations apply selfcheckin-db --local
```
Prüfen ob Tabelle angelegt wurde:
```bash
npx wrangler d1 execute selfcheckin-db --local --command "SELECT name FROM sqlite_master WHERE type='table'"
```
Migration für PROD:
```bash
npx wrangler d1 migrations apply selfcheckin-db --remote
```
Ausgabe von der Tabelle in PROD:
```bash
npx wrangler d1 execute selfcheckin-db --remote --command "SELECT * FROM reservations"
```
## Komplette Datenbank neu befüllen
Die Adresse https://selfcheckin.raz-check-in.workers.dev/api/smoobu/initWholeDatabase aufrufen und den SMOOBU_TOKEN als Query-Parameter `token` mitgeben, dann werden alle Daten aus Smoobu in die D1-Datenbank geschrieben.