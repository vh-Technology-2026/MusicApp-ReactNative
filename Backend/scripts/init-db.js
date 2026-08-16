const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const schemaPath = path.join(__dirname, '..', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
const d1Dir = path.join(__dirname, '..', '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');

if (fs.existsSync(d1Dir)) {
  const files = fs.readdirSync(d1Dir).filter((f) => f.endsWith('.sqlite'));
  for (const file of files) {
    const dbPath = path.join(d1Dir, file);
    const db = new DatabaseSync(dbPath);
    db.exec(schema);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(`✅ Database [${file}] tables:`, tables.map((t) => t.name));
    db.close();
  }
} else {
  console.log('No miniflare directory yet. It will be created on first wrangler dev run.');
}
