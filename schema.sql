CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('Employee', 'Director', 'Accounts')),
  employee_code TEXT,
  department TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vouchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voucher_number TEXT UNIQUE NOT NULL,
  voucher_date TEXT NOT NULL,
  expense_date TEXT NOT NULL,
  department TEXT NOT NULL,
  expense_title TEXT NOT NULL,
  expense_category TEXT NOT NULL,
  expense_description TEXT,
  amount REAL NOT NULL,
  employee_id INTEGER NOT NULL REFERENCES users(id),
  employee_name TEXT NOT NULL,
  employee_code TEXT,
  employee_signature TEXT,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
  director_id INTEGER REFERENCES users(id),
  director_name TEXT,
  director_signature TEXT,
  approval_date TEXT,
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vouchers_employee_id ON vouchers(employee_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_number ON vouchers(voucher_number);
