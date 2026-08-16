-- Performance optimization indexes for music table
CREATE INDEX IF NOT EXISTS idx_music_created_at ON music (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_artist ON music (artist);
CREATE INDEX IF NOT EXISTS idx_music_title ON music (title);
CREATE INDEX IF NOT EXISTS idx_music_video_key ON music (video_key);