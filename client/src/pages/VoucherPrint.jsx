import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Printer, ArrowLeft } from 'lucide-react';

export const VoucherPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const res = await api.get(`/vouchers/${id}`);
        setVoucher(res.data.voucher);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVoucher();
  }, [id]);

  if (loading) {
    return <div className="page-body">Preparing printable voucher...</div>;
  }

  if (!voucher) {
    return <div className="page-body">Voucher not found.</div>;
  }

  return (
    <div className="page-body">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', maxWidth: '860px', margin: '0 auto 2rem auto' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <button onClick={() => window.print()} className="btn btn-primary">
          <Printer size={18} />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      <div className="printable-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>PRACHAY SECURITIES PRIVATE LIMITED</h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Official Expense Reimbursement Voucher</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>{voucher.voucher_number}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>Date: {voucher.voucher_date}</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: voucher.status === 'Approved' ? '#059669' : '#0f172a', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              Status: {voucher.status}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>Claimant Details</h3>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}><strong>Employee Name:</strong> {voucher.employee_name}</p>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}><strong>Employee ID:</strong> {voucher.employee_code || 'N/A'}</p>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}><strong>Department:</strong> {voucher.department}</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>Expenditure Metadata</h3>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}><strong>Expense Date:</strong> {voucher.expense_date}</p>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}><strong>Category:</strong> {voucher.expense_category}</p>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}><strong>Approval Date:</strong> {voucher.approval_date || 'Pending'}</p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}>Expense Item / Title</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}>Description & Purpose</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.875rem 0.75rem', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 600 }}>{voucher.expense_title}</td>
              <td style={{ padding: '0.875rem 0.75rem', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}>{voucher.expense_description || 'N/A'}</td>
              <td className="mono" style={{ padding: '0.875rem 0.75rem', border: '1px solid #cbd5e1', textAlign: 'right', fontSize: '0.875rem', fontWeight: 700 }}>
                ₹{Number(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
            <tr style={{ background: '#f8fafc' }}>
              <td colSpan={2} style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem' }}>
                Total Reimbursement Claim:
              </td>
              <td className="mono" style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: '#2563eb' }}>
                ₹{Number(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {voucher.employee_signature ? (
                <img src={voucher.employee_signature} alt="Employee Signature" style={{ maxHeight: '60px', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending Signature</span>
              )}
            </div>
            <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{voucher.employee_name}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Employee Authorization</p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {voucher.director_signature ? (
                <img src={voucher.director_signature} alt="Director Signature" style={{ maxHeight: '60px', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending Signature</span>
              )}
            </div>
            <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{voucher.director_name || 'Director'}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Executive Approval</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          This document is generated by the Expense Voucher Management System. Audit Ref: EV-{voucher.id}-{Date.now()}
        </div>
      </div>
    </div>
  );
};
