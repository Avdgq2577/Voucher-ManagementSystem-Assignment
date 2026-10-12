import { query, get, run } from '../db.js';

const generateVoucherNumber = () => {
  const currentYear = new Date().getFullYear();
  const row = get('SELECT COUNT(*) as total FROM vouchers WHERE voucher_number LIKE ?', [`EV-${currentYear}-%`]);
  const sequence = ((row?.total || 0) + 1).toString().padStart(4, '0');
  const candidate = `EV-${currentYear}-${sequence}`;
  const existing = get('SELECT id FROM vouchers WHERE voucher_number = ?', [candidate]);
  if (existing) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `EV-${currentYear}-${randomSuffix}`;
  }
  return candidate;
};

export const getVouchers = (req, res) => {
  const {
    search,
    status,
    department,
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  let sql = 'SELECT * FROM vouchers WHERE 1=1';
  const params = [];

  if (req.user.role === 'Employee') {
    sql += ' AND employee_id = ?';
    params.push(req.user.id);
  }

  if (status && status !== 'All') {
    sql += ' AND status = ?';
    params.push(status);
  }

  if (department && department !== 'All') {
    sql += ' AND department = ?';
    params.push(department);
  }

  if (category && category !== 'All') {
    sql += ' AND expense_category = ?';
    params.push(category);
  }

  if (startDate) {
    sql += ' AND expense_date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    sql += ' AND expense_date <= ?';
    params.push(endDate);
  }

  if (minAmount) {
    sql += ' AND amount >= ?';
    params.push(Number(minAmount));
  }

  if (maxAmount) {
    sql += ' AND amount <= ?';
    params.push(Number(maxAmount));
  }

  if (search && search.trim() !== '') {
    const term = `%${search.trim()}%`;
    sql += ' AND (voucher_number LIKE ? OR employee_name LIKE ? OR expense_title LIKE ? OR department LIKE ?)';
    params.push(term, term, term, term);
  }

  const allowedSortCols = ['created_at', 'voucher_date', 'expense_date', 'amount', 'status', 'voucher_number'];
  const safeSortBy = allowedSortCols.includes(sortBy) ? sortBy : 'created_at';
  const safeOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  sql += ` ORDER BY ${safeSortBy} ${safeOrder}`;

  const rows = query(sql, params);
  return res.json({ vouchers: rows });
};

export const getVoucherById = (req, res) => {
  const { id } = req.params;
  const voucher = get('SELECT * FROM vouchers WHERE id = ?', [id]);

  if (!voucher) {
    return res.status(404).json({ message: 'Voucher not found' });
  }

  if (req.user.role === 'Employee' && voucher.employee_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied: You can only view your own vouchers' });
  }

  return res.json({ voucher });
};

export const createVoucher = (req, res) => {
  if (req.user.role !== 'Employee') {
    return res.status(403).json({ message: 'Only employees can create expense vouchers' });
  }

  const {
    expense_date,
    department,
    expense_title,
    expense_category,
    expense_description,
    amount,
    employee_signature,
    action = 'draft'
  } = req.body;

  if (!department || !department.trim()) {
    return res.status(400).json({ message: 'Department is mandatory' });
  }

  if (!expense_title || !expense_title.trim()) {
    return res.status(400).json({ message: 'Expense title is mandatory' });
  }

  if (!expense_date) {
    return res.status(400).json({ message: 'Expense date is mandatory' });
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: 'Amount is mandatory and must be greater than zero' });
  }

  const isSubmitting = action === 'submit';
  if (isSubmitting && (!employee_signature || !employee_signature.trim())) {
    return res.status(400).json({ message: 'Employee signature is mandatory before submission' });
  }

  const voucher_number = generateVoucherNumber();
  const voucher_date = new Date().toISOString().split('T')[0];
  const status = isSubmitting ? 'Submitted' : 'Draft';
  const now = new Date().toISOString();

  const insertSql = `
    INSERT INTO vouchers (
      voucher_number, voucher_date, expense_date, department,
      expense_title, expense_category, expense_description, amount,
      employee_id, employee_name, employee_code, employee_signature,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = run(insertSql, [
    voucher_number,
    voucher_date,
    expense_date,
    department.trim(),
    expense_title.trim(),
    expense_category || 'General',
    expense_description ? expense_description.trim() : '',
    numericAmount,
    req.user.id,
    req.user.name,
    req.user.employee_code || '',
    employee_signature || null,
    status,
    now,
    now
  ]);

  const newVoucher = get('SELECT * FROM vouchers WHERE id = ?', [result.lastInsertRowid]);
  return res.status(201).json({
    message: isSubmitting ? 'Voucher submitted successfully' : 'Voucher saved as draft',
    voucher: newVoucher
  });
};

export const updateVoucher = (req, res) => {
  if (req.user.role !== 'Employee') {
    return res.status(403).json({ message: 'Only employees can edit vouchers' });
  }

  const { id } = req.params;
  const existing = get('SELECT * FROM vouchers WHERE id = ?', [id]);

  if (!existing) {
    return res.status(404).json({ message: 'Voucher not found' });
  }

  if (existing.employee_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied: You can only edit your own vouchers' });
  }

  if (existing.status !== 'Draft') {
    return res.status(400).json({ message: 'Only vouchers in Draft status can be edited' });
  }

  const {
    expense_date,
    department,
    expense_title,
    expense_category,
    expense_description,
    amount,
    employee_signature,
    action = 'draft'
  } = req.body;

  if (!department || !department.trim()) {
    return res.status(400).json({ message: 'Department is mandatory' });
  }

  if (!expense_title || !expense_title.trim()) {
    return res.status(400).json({ message: 'Expense title is mandatory' });
  }

  if (!expense_date) {
    return res.status(400).json({ message: 'Expense date is mandatory' });
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: 'Amount is mandatory and must be greater than zero' });
  }

  const isSubmitting = action === 'submit';
  const finalSignature = employee_signature || existing.employee_signature;

  if (isSubmitting && (!finalSignature || !finalSignature.trim())) {
    return res.status(400).json({ message: 'Employee signature is mandatory before submission' });
  }

  const nextStatus = isSubmitting ? 'Submitted' : 'Draft';
  const now = new Date().toISOString();

  run(`
    UPDATE vouchers SET
      expense_date = ?,
      department = ?,
      expense_title = ?,
      expense_category = ?,
      expense_description = ?,
      amount = ?,
      employee_signature = ?,
      status = ?,
      updated_at = ?
    WHERE id = ?
  `, [
    expense_date,
    department.trim(),
    expense_title.trim(),
    expense_category || 'General',
    expense_description ? expense_description.trim() : '',
    numericAmount,
    finalSignature,
    nextStatus,
    now,
    id
  ]);

  const updated = get('SELECT * FROM vouchers WHERE id = ?', [id]);
  return res.json({
    message: isSubmitting ? 'Voucher submitted successfully' : 'Draft updated successfully',
    voucher: updated
  });
};

export const deleteVoucher = (req, res) => {
  if (req.user.role !== 'Employee') {
    return res.status(403).json({ message: 'Only employees can delete vouchers' });
  }

  const { id } = req.params;
  const voucher = get('SELECT * FROM vouchers WHERE id = ?', [id]);

  if (!voucher) {
    return res.status(404).json({ message: 'Voucher not found' });
  }

  if (voucher.employee_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied: You can only delete your own vouchers' });
  }

  if (voucher.status !== 'Draft') {
    return res.status(400).json({ message: 'Only vouchers in Draft status can be deleted' });
  }

  run('DELETE FROM vouchers WHERE id = ?', [id]);
  return res.json({ message: 'Voucher deleted successfully' });
};

export const submitVoucher = (req, res) => {
  if (req.user.role !== 'Employee') {
    return res.status(403).json({ message: 'Only employees can submit vouchers' });
  }

  const { id } = req.params;
  const voucher = get('SELECT * FROM vouchers WHERE id = ?', [id]);

  if (!voucher) {
    return res.status(404).json({ message: 'Voucher not found' });
  }

  if (voucher.employee_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (voucher.status !== 'Draft') {
    return res.status(400).json({ message: 'Only vouchers in Draft status can be submitted' });
  }

  const signature = req.body.employee_signature || voucher.employee_signature;
  if (!signature || !signature.trim()) {
    return res.status(400).json({ message: 'Employee signature is mandatory before submission' });
  }

  const now = new Date().toISOString();
  run(`
    UPDATE vouchers SET
      employee_signature = ?,
      status = 'Submitted',
      updated_at = ?
    WHERE id = ?
  `, [signature, now, id]);

  const updated = get('SELECT * FROM vouchers WHERE id = ?', [id]);
  return res.json({ message: 'Voucher submitted successfully', voucher: updated });
};

export const approveVoucher = (req, res) => {
  if (req.user.role !== 'Director') {
    return res.status(403).json({ message: 'Only the Director can approve vouchers' });
  }

  const { id } = req.params;
  const { director_signature } = req.body;

  if (!director_signature || !director_signature.trim()) {
    return res.status(400).json({ message: 'Director signature is mandatory before approval' });
  }

  const voucher = get('SELECT * FROM vouchers WHERE id = ?', [id]);
  if (!voucher) {
    return res.status(404).json({ message: 'Voucher not found' });
  }

  if (voucher.status !== 'Submitted') {
    return res.status(400).json({ message: 'Only submitted vouchers awaiting approval can be approved' });
  }

  const now = new Date().toISOString();
  const approvalDate = now.split('T')[0];

  run(`
    UPDATE vouchers SET
      status = 'Approved',
      director_id = ?,
      director_name = ?,
      director_signature = ?,
      approval_date = ?,
      updated_at = ?
    WHERE id = ?
  `, [
    req.user.id,
    req.user.name,
    director_signature,
    approvalDate,
    now,
    id
  ]);

  const updated = get('SELECT * FROM vouchers WHERE id = ?', [id]);
  return res.json({ message: 'Voucher approved successfully', voucher: updated });
};

export const rejectVoucher = (req, res) => {
  if (req.user.role !== 'Director') {
    return res.status(403).json({ message: 'Only the Director can reject vouchers' });
  }

  const { id } = req.params;
  const { rejection_reason } = req.body;

  if (!rejection_reason || !rejection_reason.trim()) {
    return res.status(400).json({ message: 'Rejection reason is mandatory if a voucher is rejected' });
  }

  const voucher = get('SELECT * FROM vouchers WHERE id = ?', [id]);
  if (!voucher) {
    return res.status(404).json({ message: 'Voucher not found' });
  }

  if (voucher.status !== 'Submitted') {
    return res.status(400).json({ message: 'Only submitted vouchers awaiting approval can be rejected' });
  }

  const now = new Date().toISOString();
  const decisionDate = now.split('T')[0];

  run(`
    UPDATE vouchers SET
      status = 'Rejected',
      director_id = ?,
      director_name = ?,
      rejection_reason = ?,
      approval_date = ?,
      updated_at = ?
    WHERE id = ?
  `, [
    req.user.id,
    req.user.name,
    rejection_reason.trim(),
    decisionDate,
    now,
    id
  ]);

  const updated = get('SELECT * FROM vouchers WHERE id = ?', [id]);
  return res.json({ message: 'Voucher rejected', voucher: updated });
};

export const uploadSignatureImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({ url: fileUrl });
};
