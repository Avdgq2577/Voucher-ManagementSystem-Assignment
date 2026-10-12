import { query, get } from '../db.js';

export const getDashboardStats = (req, res) => {
  const { role, id } = req.user;
  const today = new Date().toISOString().split('T')[0];

  if (role === 'Employee') {
    const totalRow = get('SELECT COUNT(*) as count FROM vouchers WHERE employee_id = ?', [id]);
    const draftRow = get("SELECT COUNT(*) as count FROM vouchers WHERE employee_id = ? AND status = 'Draft'", [id]);
    const pendingRow = get("SELECT COUNT(*) as count FROM vouchers WHERE employee_id = ? AND status = 'Submitted'", [id]);
    const approvedRow = get("SELECT COUNT(*) as count FROM vouchers WHERE employee_id = ? AND status = 'Approved'", [id]);
    const rejectedRow = get("SELECT COUNT(*) as count FROM vouchers WHERE employee_id = ? AND status = 'Rejected'", [id]);
    const sumRow = get("SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE employee_id = ? AND status IN ('Submitted', 'Approved')", [id]);
    const recent = query('SELECT * FROM vouchers WHERE employee_id = ? ORDER BY created_at DESC LIMIT 5', [id]);

    return res.json({
      role,
      stats: {
        totalVouchers: totalRow?.count || 0,
        draftVouchers: draftRow?.count || 0,
        pendingApproval: pendingRow?.count || 0,
        approvedVouchers: approvedRow?.count || 0,
        rejectedVouchers: rejectedRow?.count || 0,
        totalAmountClaimed: Number(sumRow?.total || 0).toFixed(2),
        recentActivity: recent
      }
    });
  }

  if (role === 'Director') {
    const pendingCountRow = get("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Submitted'", []);
    const approvedTodayRow = get("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Approved' AND approval_date = ?", [today]);
    const rejectedTodayRow = get("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Rejected' AND approval_date = ?", [today]);
    const pendingAmountRow = get("SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE status = 'Submitted'", []);
    const recent = query('SELECT * FROM vouchers ORDER BY updated_at DESC LIMIT 5', []);

    return res.json({
      role,
      stats: {
        pendingApprovalCount: pendingCountRow?.count || 0,
        approvedToday: approvedTodayRow?.count || 0,
        rejectedToday: rejectedTodayRow?.count || 0,
        totalPendingAmount: Number(pendingAmountRow?.total || 0).toFixed(2),
        recentActivity: recent
      }
    });
  }

  if (role === 'Accounts') {
    const totalRow = get('SELECT COUNT(*) as count FROM vouchers', []);
    const pendingRow = get("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Submitted'", []);
    const approvedRow = get("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Approved'", []);
    const rejectedRow = get("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Rejected'", []);
    const approvedAmountRow = get("SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE status = 'Approved'", []);
    const recentApproved = query("SELECT * FROM vouchers WHERE status = 'Approved' ORDER BY approval_date DESC, updated_at DESC LIMIT 5", []);

    return res.json({
      role,
      stats: {
        totalVouchers: totalRow?.count || 0,
        pendingApproval: pendingRow?.count || 0,
        approvedVouchers: approvedRow?.count || 0,
        rejectedVouchers: rejectedRow?.count || 0,
        totalApprovedAmount: Number(approvedAmountRow?.total || 0).toFixed(2),
        recentApprovedVouchers: recentApproved
      }
    });
  }

  return res.status(400).json({ message: 'Invalid role' });
};
