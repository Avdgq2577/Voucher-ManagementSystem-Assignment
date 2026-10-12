import { Link } from 'react-router-dom';
import { Eye, Edit3, Trash2, Printer } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';

export const VoucherTable = ({ vouchers = [], onDelete, showEmployee = false }) => {
  const { user } = useAuth();

  if (!vouchers.length) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
        <p style={{ fontWeight: 600, fontSize: '1rem' }}>No expense vouchers found</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Try adjusting your search filters or create a new voucher.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Voucher #</th>
            <th>Expense Date</th>
            {showEmployee && <th>Employee</th>}
            <th>Department</th>
            <th>Title & Category</th>
            <th>Amount (₹)</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr key={v.id}>
              <td>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {v.voucher_number}
                </span>
              </td>
              <td>{v.expense_date}</td>
              {showEmployee && (
                <td>
                  <div style={{ fontWeight: 600 }}>{v.employee_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.employee_code}</div>
                </td>
              )}
              <td>{v.department}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{v.expense_title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.expense_category}</div>
              </td>
              <td>
                <span className="mono" style={{ fontWeight: 700 }}>
                  ₹{Number(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </td>
              <td>
                <StatusBadge status={v.status} />
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link
                    to={`/vouchers/${v.id}`}
                    className="btn btn-secondary btn-sm"
                    title="View Voucher Details"
                  >
                    <Eye size={15} />
                    <span>View</span>
                  </Link>

                  {user?.role === 'Employee' && v.status === 'Draft' && (
                    <>
                      <Link
                        to={`/vouchers/${v.id}/edit`}
                        className="btn btn-secondary btn-sm"
                        title="Edit Draft"
                      >
                        <Edit3 size={15} color="#2563eb" />
                      </Link>
                      {onDelete && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onDelete(v.id, v.voucher_number)}
                          title="Delete Draft"
                        >
                          <Trash2 size={15} color="#ef4444" />
                        </button>
                      )}
                    </>
                  )}

                  {user?.role === 'Accounts' && (
                    <Link
                      to={`/vouchers/${v.id}/print`}
                      className="btn btn-secondary btn-sm"
                      title="Print / Download Voucher"
                    >
                      <Printer size={15} />
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
