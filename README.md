# Expense Voucher Management System

A web-based Expense Voucher Management System developed for Prachay Securities Private Limited (PSPL) to digitize the manual employee reimbursement, approval, and accounts monitoring lifecycle.

---

## 1. Project Overview

The system replaces manual paper expense vouchers with a role-based digital workflow:
- **Employee**: Creates expense vouchers, saves as Draft, edits/deletes drafts, uploads signatures (or draws via signature pad), submits vouchers for approval, and tracks status. Employees can only access their own vouchers.
- **Director (Admin)**: Reviews submitted expense vouchers across the organization, inspects details, approves vouchers with a mandatory director signature, or rejects vouchers with a mandatory rejection explanation.
- **Accounts Team**: Monitors all approved and submitted vouchers across departments, views employee & director signatures, and prints or exports formal vouchers for reimbursement payment processing.

---

## 2. Technology Stack

- **Frontend**: React (Vite), React Router v7, Axios, Lucide Icons, Pure CSS Design System.
- **Backend**: Node.js, Express.js, RESTful API architecture, JWT authentication (`jsonwebtoken`), password hashing (`bcryptjs`), file upload handler (`multer`).
- **Database**: SQLite with ACID compliance (`node:sqlite` built into Node.js 22/24), structured schema with foreign keys and indexes.

---

## 3. Project Structure

```
expense-voucher-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── SignaturePad.jsx
│   │   │   ├── VoucherFilter.jsx
│   │   │   └── VoucherTable.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── DirectorDashboard.jsx
│   │   │   ├── AccountsDashboard.jsx
│   │   │   ├── CreateVoucher.jsx
│   │   │   ├── EditVoucher.jsx
│   │   │   ├── VoucherList.jsx
│   │   │   ├── VoucherDetails.jsx
│   │   │   └── VoucherPrint.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   └── voucherController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── voucherRoutes.js
│   ├── data/
│   ├── uploads/
│   ├── db.js
│   ├── schema.sql
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── schema.sql
├── .env.example
├── package.json
└── README.md
```

---

## 4. Setup Instructions

### Prerequisites
- Node.js (v20+ recommended, v22/v24 fully supported)
- npm (v9+)

### Installation

1. Clone or navigate to the repository:
```bash
cd expense-voucher-app
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
cd ..
```

4. Seed the database with sample users and vouchers:
```bash
cd server
npm run seed
cd ..
```

5. Start the backend server (runs on `http://localhost:5000`):
```bash
cd server
npm run dev
```

6. In a second terminal, start the frontend client (runs on `http://localhost:5173`):
```bash
cd client
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`.

---

## 5. Demo Credentials

The seed script creates ready-to-test accounts for all roles. One-click demo login buttons are also provided directly on the Login page:

| Role | Email | Password | Details |
|---|---|---|---|
| Employee 1 | `employee@example.com` | `password123` | John Doe, Engineering (EMP-101) |
| Employee 2 | `jane@example.com` | `password123` | Jane Smith, Marketing (EMP-102) |
| Director | `director@example.com` | `password123` | Robert Vance, Executive (DIR-001) |
| Accounts | `accounts@example.com` | `password123` | Sarah Connor, Finance (ACC-001) |

---

## 6. Database Schema Explanation

The database consists of two primary tables defined in `schema.sql`:

### `users` Table
Stores registered employees and administrative users.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT): Unique identifier.
- `name` (TEXT NOT NULL): Full name of the user.
- `email` (TEXT UNIQUE NOT NULL): Corporate email address used for authentication.
- `password` (TEXT NOT NULL): Bcrypt hashed password.
- `role` (TEXT NOT NULL): Role constraint `('Employee', 'Director', 'Accounts')`.
- `employee_code` (TEXT): Employee identifier code (e.g., EMP-101).
- `department` (TEXT): Primary department affiliation.
- `created_at` (TEXT NOT NULL): Creation timestamp.

### `vouchers` Table
Stores all expense voucher submissions and their lifecycle state.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT): Internal primary key.
- `voucher_number` (TEXT UNIQUE NOT NULL): Auto-generated unique voucher identifier formatted as `EV-YYYY-XXXX`.
- `voucher_date` (TEXT NOT NULL): Date voucher record was initialized (YYYY-MM-DD).
- `expense_date` (TEXT NOT NULL): Date when business expenditure took place (YYYY-MM-DD).
- `department` (TEXT NOT NULL): Mandatory department associated with the claim.
- `expense_title` (TEXT NOT NULL): Mandatory summary title of expenditure.
- `expense_category` (TEXT NOT NULL): Category (Travel, Meals, Office Supplies, Software, Training, General).
- `expense_description` (TEXT): Detailed context, breakdown, or justification.
- `amount` (REAL NOT NULL): Total reimbursement amount (must be > 0).
- `employee_id` (INTEGER NOT NULL): Foreign key referencing `users(id)`.
- `employee_name` (TEXT NOT NULL): Cached claimant name for display and audit.
- `employee_code` (TEXT): Claimant employee code.
- `employee_signature` (TEXT): Image URL or signature canvas data URL. Mandatory before submission.
- `status` (TEXT NOT NULL DEFAULT 'Draft'): Workflow state `('Draft', 'Submitted', 'Approved', 'Rejected')`.
- `director_id` (INTEGER): Foreign key referencing director `users(id)` upon decision.
- `director_name` (TEXT): Name of director who approved or rejected.
- `director_signature` (TEXT): Director signature image URL or canvas data URL. Mandatory before approval.
- `approval_date` (TEXT): Date when approval or rejection occurred (YYYY-MM-DD).
- `rejection_reason` (TEXT): Mandatory explanation if rejected.
- `created_at` (TEXT NOT NULL): ISO timestamp of creation.
- `updated_at` (TEXT NOT NULL): ISO timestamp of most recent status or field modification.

---

## 7. API Documentation

### Base URL
All API routes are prefixed with `/api`.

### Authentication Endpoints

#### `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "employee@example.com",
  "password": "password123"
}
```
- **Response**: `200 OK`
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "employee@example.com",
    "role": "Employee",
    "employee_code": "EMP-101",
    "department": "Engineering"
  }
}
```

#### `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` with authenticated user profile.

---

### Dashboard Endpoints

#### `GET /api/dashboard/stats`
- **Headers**: `Authorization: Bearer <token>`
- Returns role-scoped statistical aggregations:
  - **Employee**: Total vouchers, draft count, pending count, approved count, rejected count, total claimed sum, recent activity (scoped to employee).
  - **Director**: Pending approval count, approved today count, rejected today count, total pending sum, recent organization activity.
  - **Accounts**: Total vouchers across org, pending count, approved count, rejected count, total approved reimbursement sum, recent approved vouchers.

---

### Voucher Endpoints

#### `GET /api/vouchers`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `search`: Searches across voucher number, employee name, title, department.
  - `status`: Filter by `Draft`, `Submitted`, `Approved`, `Rejected`, or `All`.
  - `department`: Filter by department name.
  - `category`: Filter by expense category.
  - `startDate`: Filter expense date `>= startDate`.
  - `endDate`: Filter expense date `<= endDate`.
  - `minAmount`: Filter amount `>= minAmount`.
  - `maxAmount`: Filter amount `<= maxAmount`.
  - `sortBy`: `created_at`, `voucher_date`, `expense_date`, `amount`, `status`.
  - `sortOrder`: `ASC` or `DESC`.
- **Access Rule**: Employees receive only their own vouchers. Directors and Accounts receive all vouchers across the company.

#### `GET /api/vouchers/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` with full voucher object and audit metadata.

#### `POST /api/vouchers`
- **Headers**: `Authorization: Bearer <token>` (Employee only)
- **Request Body**:
```json
{
  "expense_date": "2026-10-12",
  "department": "Engineering",
  "expense_title": "Cloud Server Scaling",
  "expense_category": "Software",
  "expense_description": "Additional server instance allocation during launch.",
  "amount": 4500.00,
  "employee_signature": "data:image/png;base64,...",
  "action": "submit"
}
```
- `action` can be `"draft"` or `"submit"`. If submitting, `employee_signature` is required.

#### `PUT /api/vouchers/:id`
- **Headers**: `Authorization: Bearer <token>` (Employee only)
- **Constraint**: Allowed only when voucher status is `Draft`. Submitted or decided vouchers return `400 Bad Request`.

#### `DELETE /api/vouchers/:id`
- **Headers**: `Authorization: Bearer <token>` (Employee only)
- **Constraint**: Allowed only when voucher status is `Draft`.

#### `POST /api/vouchers/:id/submit`
- **Headers**: `Authorization: Bearer <token>` (Employee only)
- Submits an existing draft voucher for approval. Requires `employee_signature`.

#### `POST /api/vouchers/:id/approve`
- **Headers**: `Authorization: Bearer <token>` (Director only)
- **Request Body**:
```json
{
  "director_signature": "data:image/png;base64,..."
}
```
- Approves submitted voucher. Signature is mandatory.

#### `POST /api/vouchers/:id/reject`
- **Headers**: `Authorization: Bearer <token>` (Director only)
- **Request Body**:
```json
{
  "rejection_reason": "Receipts do not match the declared expense amount."
}
```
- Rejection reason is mandatory.

#### `POST /api/vouchers/upload-signature`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- Accepts image files (PNG, JPG, WEBP) up to 5MB and returns static file URL.

---

## 8. Business Rules & Validations Enforced

1. **Unique Voucher Number**: Auto-generated sequentially (`EV-YYYY-XXXX`) ensuring no manual collisions.
2. **Draft Immutability**: Once an employee submits a voucher (`Submitted`), it becomes strictly read-only for the employee. Edits and deletes are rejected at both API and UI layers.
3. **Approval Exclusivity**: Only users with the `Director` role can approve or reject vouchers.
4. **Signature Requirements**:
   - Every submitted voucher requires the employee's signature.
   - Every approved voucher requires the director's signature.
5. **Rejection Justification**: Rejection requests without a non-empty reason are blocked.
6. **Data Isolation**: Employees cannot view vouchers submitted by other colleagues.
7. **Accounts Read-Only Access**: Accounts personnel can search, filter, view signatures, and print/download vouchers across the company, but cannot edit, create, approve, or reject.
8. **Input Validations**:
   - Department: Required
   - Expense Title: Required
   - Expense Date: Required
   - Amount: Required, numeric, and > 0

---

## 9. Assumptions Made During Development

1. **Currency**: Amounts are denoted in Indian Rupees (₹ - INR) with standard Indian numbering formatting.
2. **Signatures**: The system provides an interactive signature canvas pad (mouse and touchscreen friendly) and also supports direct image file upload (PNG/JPG/WEBP).
3. **Database Portability**: SQLite was selected so that the full application runs immediately upon `git clone` without requiring external database server setup, while fully maintaining relational schema and SQL integrity.
4. **Print and PDF Export**: Accounts personnel and employees can print vouchers directly or use the browser print dialog to save as a formatted PDF with company branding and dual signatures.
