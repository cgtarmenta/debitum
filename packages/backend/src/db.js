const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const DB_PATH = path.resolve(__dirname, process.env.DB_PATH || '../debitum.db');
console.log('DB_PATH being used:', DB_PATH);

/**
 * Initializes the SQLite database and creates necessary tables if they don't exist.
 * @returns {Promise<sqlite.Database>} A promise that resolves with the database instance.
 */
async function initializeDatabase(dbPath = DB_PATH) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      debt REAL NOT NULL,
      periodicity TEXT NOT NULL,
      payment_term INTEGER NOT NULL,
      nir REAL NOT NULL,
      aer REAL NOT NULL,
      start_date TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS global_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monthly_income REAL NOT NULL,
      max_debt_percentage REAL NOT NULL
    );
  `);

  // Insert a default row into global_info if it's empty
  const row = await db.get("SELECT COUNT(*) as count FROM global_info");
  console.log('Count of global_info rows:', row);
  if (!row || row.count === 0) {
    await db.run(`INSERT INTO global_info (monthly_income, max_debt_percentage) VALUES (?, ?)`, [0, 0]);
    console.log('Inserted default global info.');
  }

  console.log('Connected to the SQLite database and tables ensured.');
  return db;
}

module.exports = initializeDatabase;