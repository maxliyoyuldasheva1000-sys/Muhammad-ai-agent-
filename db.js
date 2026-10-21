
const Database = require("better-sqlite3");

const db = new Database("agent.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    status TEXT DEFAULT 'yangi',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("Ma'lumotlar bazasi tayyor!");

module.exports = db;
