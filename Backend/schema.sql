CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS music (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    artist TEXT NOT NULL,
    video_key TEXT NOT NULL,
    thumbnail_key TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_music_created_at ON music (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_artist ON music (artist);
CREATE INDEX IF NOT EXISTS idx_music_title ON music (title);
CREATE INDEX IF NOT EXISTS idx_music_video_key ON music (video_key);
