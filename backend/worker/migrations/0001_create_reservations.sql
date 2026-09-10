-- Migration number: 0001 	 2026-09-10T09:20:31.111Z
CREATE TABLE reservations
(
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at        TEXT    NOT NULL,
    updated_at        TEXT    NOT NULL,
    smoobu_booking_id INTEGER NOT NULL UNIQUE,
    firstname         TEXT    NOT NULL,
    lastname          TEXT    NOT NULL,
    phone             TEXT,
    arrival           TEXT    NOT NULL,
    departure         TEXT    NOT NULL
);