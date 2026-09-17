CREATE TABLE whatsapp_messages
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    phone      TEXT    NOT NULL,
    role       TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX idx_whatsapp_messages_phone_created
    ON whatsapp_messages (phone, created_at);