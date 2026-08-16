-- Music tracks table
CREATE TABLE IF NOT EXISTS music (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    artist TEXT NOT NULL,
    video_key TEXT NOT NULL,
    thumbnail_key TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);