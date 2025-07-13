-- Up
CREATE TABLE debts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  debt REAL NOT NULL,
  periodicity TEXT NOT NULL,
  payment_term INTEGER NOT NULL,
  nir REAL NOT NULL,
  aer REAL NOT NULL
);

CREATE TABLE global_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  monthly_income REAL NOT NULL,
  max_debt_percentage REAL NOT NULL
);

-- Down
DROP TABLE debts;
DROP TABLE global_info;
