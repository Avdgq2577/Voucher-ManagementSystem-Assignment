import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'vouchers.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const { run, get, exec } = await import('./db.js');

const mockEmployeeSig = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60"><path d="M 20 40 Q 50 10 80 35 T 140 25 T 200 45" stroke="%232563eb" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';
const mockDirectorSig = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60"><path d="M 15 35 Q 40 5 90 40 T 160 15 T 205 30" stroke="%23059669" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';

const seed = () => {
  const passwordHash = bcrypt.hashSync('password123', 10);

  const users = [
    {
      name: 'John Doe',
      email: 'employee@example.com',
      password: passwordHash,
      role: 'Employee',
      employee_code: 'EMP-101',
      department: 'Engineering'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: passwordHash,
      role: 'Employee',
      employee_code: 'EMP-102',
      department: 'Marketing'
    },
    {
      name: 'Robert Vance',
      email: 'director@example.com',
      password: passwordHash,
      role: 'Director',
      employee_code: 'DIR-001',
      department: 'Executive'
    },
    {
      name: 'Sarah Connor',
      email: 'accounts@example.com',
      password: passwordHash,
      role: 'Accounts',
      employee_code: 'ACC-001',
      department: 'Finance'
    }
  ];

  for (const u of users) {
    run(`
      INSERT INTO users (name, email, password, role, employee_code, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [u.name, u.email, u.password, u.role, u.employee_code, u.department]);
  }

  const john = get('SELECT id, name, employee_code, department FROM users WHERE email = ?', ['employee@example.com']);
  const jane = get('SELECT id, name, employee_code, department FROM users WHERE email = ?', ['jane@example.com']);
  const director = get('SELECT id, name FROM users WHERE email = ?', ['director@example.com']);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const vouchers = [
    {
      voucher_number: 'EV-2026-0001',
      voucher_date: today,
      expense_date: today,
      department: 'Engineering',
      expense_title: 'Local Client Onsite Travel & Parking',
      expense_category: 'Travel',
      expense_description: 'Uber fare and parking fees for visiting client data center for deployment verification.',
      amount: 1450.00,
      employee_id: john.id,
      employee_name: john.name,
      employee_code: john.employee_code,
      employee_signature: null,
      status: 'Draft',
      director_id: null,
      director_name: null,
      director_signature: null,
      approval_date: null,
      rejection_reason: null,
      created_at: now,
      updated_at: now
    },
    {
      voucher_number: 'EV-2026-0002',
      voucher_date: today,
      expense_date: today,
      department: 'Engineering',
      expense_title: 'Sprint Release Working Dinner',
      expense_category: 'Meals',
      expense_description: 'Dinner for sprint delivery team during late deployment cutover window.',
      amount: 3200.00,
      employee_id: john.id,
      employee_name: john.name,
      employee_code: john.employee_code,
      employee_signature: mockEmployeeSig,
      status: 'Submitted',
      director_id: null,
      director_name: null,
      director_signature: null,
      approval_date: null,
      rejection_reason: null,
      created_at: now,
      updated_at: now
    },
    {
      voucher_number: 'EV-2026-0003',
      voucher_date: today,
      expense_date: today,
      department: 'Engineering',
      expense_title: 'AWS Certified Solutions Architect Exam',
      expense_category: 'Training',
      expense_description: 'Reimbursement for cloud architecture exam fee as pre-approved under learning budget.',
      amount: 14200.00,
      employee_id: john.id,
      employee_name: john.name,
      employee_code: john.employee_code,
      employee_signature: mockEmployeeSig,
      status: 'Approved',
      director_id: director.id,
      director_name: director.name,
      director_signature: mockDirectorSig,
      approval_date: today,
      rejection_reason: null,
      created_at: now,
      updated_at: now
    },
    {
      voucher_number: 'EV-2026-0004',
      voucher_date: today,
      expense_date: today,
      department: 'Marketing',
      expense_title: 'Custom Ergonomic Split Keyboard',
      expense_category: 'Office Supplies',
      expense_description: 'Ergonomic equipment purchase for home workstation.',
      amount: 7800.00,
      employee_id: jane.id,
      employee_name: jane.name,
      employee_code: jane.employee_code,
      employee_signature: mockEmployeeSig,
      status: 'Rejected',
      director_id: director.id,
      director_name: director.name,
      director_signature: null,
      approval_date: today,
      rejection_reason: 'Hardware and peripheral requests must be routed through the IT Helpdesk procurement portal directly.',
      created_at: now,
      updated_at: now
    },
    {
      voucher_number: 'EV-2026-0005',
      voucher_date: today,
      expense_date: today,
      department: 'Marketing',
      expense_title: 'Monthly Social Media Analytics SaaS',
      expense_category: 'Software',
      expense_description: 'Subscription license for marketing campaign analysis dashboard for Q1.',
      amount: 5400.00,
      employee_id: jane.id,
      employee_name: jane.name,
      employee_code: jane.employee_code,
      employee_signature: mockEmployeeSig,
      status: 'Approved',
      director_id: director.id,
      director_name: director.name,
      director_signature: mockDirectorSig,
      approval_date: today,
      rejection_reason: null,
      created_at: now,
      updated_at: now
    }
  ];

  for (const v of vouchers) {
    run(`
      INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department,
        expense_title, expense_category, expense_description, amount,
        employee_id, employee_name, employee_code, employee_signature,
        status, director_id, director_name, director_signature,
        approval_date, rejection_reason, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      v.voucher_number, v.voucher_date, v.expense_date, v.department,
      v.expense_title, v.expense_category, v.expense_description, v.amount,
      v.employee_id, v.employee_name, v.employee_code, v.employee_signature,
      v.status, v.director_id, v.director_name, v.director_signature,
      v.approval_date, v.rejection_reason, v.created_at, v.updated_at
    ]);
  }

  console.log('Database seeded successfully with demo users and sample vouchers.');
};

seed();
