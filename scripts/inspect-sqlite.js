const Database = require('better-sqlite3');
const db = new Database('prisma/dev.db', { verbose: console.log });

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table'")
  .all();
console.log('Tables:', tables);

tables.forEach(table => {
  if (table.name === 'sqlite_sequence') return;
  const count = db.prepare(`SELECT count(*) as count FROM ${table.name}`).get();
  console.log(`Table ${table.name} has ${count.count} rows`);

  const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 1`).get();
  console.log(`Sample from ${table.name}:`, sample);
});
