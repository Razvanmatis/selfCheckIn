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
```

### 2) Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Die Frontend-Umgebung erwartet in `frontend/.env` eine passende URL:

```env
VITE_API_BASE_URL=http://localhost:7071
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
VITE_API_BASE_URL=https://raz-check-in.workers.dev
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

Damit bleibt das Deployment reproduzierbar und leicht nachvollziehbar.
