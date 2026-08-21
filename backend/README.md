# SelfCheckIn Backend (Local)

Dieser lokale Host stellt die Route `POST /api/initiateCheckInProcess` bereit, die vom Frontend aufgerufen wird.

## Voraussetzungen

- Node.js 18+ (wegen globalem `fetch`)

## Start

```powershell
Set-Location "C:\Users\TF82121\Documents\Projects\SelfCheckIn\backend"
npm install
npm run dev
```

Standard-Port: `7071` (passt zu `frontend/.env.example`).

## Kurzer Test

```powershell
Invoke-WebRequest -Method Post "http://localhost:7071/api/initiateCheckInProcess" `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"firstName":"Max","lastName":"Mustermann","checkInDate":"2026-08-25","checkOutDate":"2026-08-27"}'
```

