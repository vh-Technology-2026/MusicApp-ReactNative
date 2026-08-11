-- Migration number: 0001 	 2026-08-11T15:40:00.000Z
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial sample data
INSERT OR IGNORE INTO users (id, name, email, role) VALUES 
(1, 'Nguyen Van A', 'vana@example.com', 'admin'),
(2, 'Tran Thi B', 'thib@example.com', 'user');
