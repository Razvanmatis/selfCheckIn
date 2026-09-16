-- Migration number: 0002    2026-09-15T15:00:00.000Z

ALTER TABLE reservations
    ADD COLUMN whatsapp_status TEXT NOT NULL DEFAULT 'message_not_sent'
        CHECK (whatsapp_status IN ('message_not_sent', 'message_sent'));