import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { SignaturePad } from '../components/SignaturePad';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Send,
  Printer,
  Calendar,
  Building,
  User,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const VoucherDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [directorSignature, setDirectorSignature] = useState('');
  const [employeeSignature, setEmployeeSignature] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVoucher = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vouchers/${id}`);
      setVoucher(res.data.voucher);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete draft voucher ${voucher.voucher_number}?`)) return;
    try {
      await api.delete(`/vouchers/${id}`);
      navigate('/employee/vouchers');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete voucher');
    }
  };

  const handleApprove = async () => {
    if (!directorSignature.trim()) {
      alert('Director signature is mandatory before approval');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/vouchers/${id}/approve`, {
        director_signature: directorSignature
      });
      setShowApproveModal(false);
      setDirectorSignature('');
      fetchVoucher();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve voucher');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Rejection reason is mandatory');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/vouchers/${id}/reject`, {
        rejection_reason: rejectionReason
      });
      setShowRejectModal(false);
      setRejectionReason('');
      fetchVoucher();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject voucher');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitDraft = async () => {
    const finalSig = employeeSignature || voucher.employee_signature;
    if (!finalSig) {
      alert('Employee signature is mandatory before submission');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/vouchers/${id}/submit`, {
        employee_signature: finalSig
      });
      setShowSubmitModal(false);
      fetchVoucher();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit voucher');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="page-body">Loading voucher details...</div>;
  }

  if (error || !voucher) {
    return (
      <div className="page-body">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Voucher Not Found</h2>
          <p>{error || 'The requested voucher could not be loaded.'}</p>
          <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getBackUrl = () => {
    if (user?.role === 'Employee') return '/employee/vouchers';
    if (user?.role === 'Director') return '/director/vouchers';
    return '/accounts/vouchers';
  };

  return (
    <div className="page-body" style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to={getBackUrl()} className="btn btn-secondary btn-sm" style={{ marginBottom: '0.75rem' }}>
            <ArrowLeft size={16} />
            <span>Back to Vouchers</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 className="page-title mono" style={{ fontSize: '1.75rem' }}>{voucher.voucher_number}</h1>
            <StatusBadge status={voucher.status} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {voucher.status === 'Approved' && (
            <Link to={`/vouchers/${voucher.id}/print`} className="btn btn-secondary">
              <Printer size={16} />
              <span>Print / Download</span>
            </Link>
          )}

          {user?.role === 'Employee' && voucher.status === 'Draft' && (
            <>
              <Link to={`/vouchers/${voucher.id}/edit`} className="btn btn-secondary">
                <Edit3 size={16} />
                <span>Edit</span>
              </Link>
              <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary">
                <Send size={16} />
                <span>Submit for Approval</span>
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </>
          )}

          {user?.role === 'Director' && voucher.status === 'Submitted' && (
            <>
              <button onClick={() => setShowApproveModal(true)} className="btn btn-success">
                <CheckCircle size={16} />
                <span>Approve Voucher</span>
              </button>
              <button onClick={() => setShowRejectModal(true)} className="btn btn-danger">
                <XCircle size={16} />
                <span>Reject Voucher</span>
              </button>
            </>
          )}
        </div>
      </div>

      {voucher.status === 'Rejected' && (
        <div style={{
          background: 'var(--danger-light)',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={24} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ color: '#b91c1c', fontWeight: 700, fontSize: '1rem' }}>Rejection Notice</h3>
            <p style={{ color: '#7f1d1d', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              <strong>Reason:</strong> {voucher.rejection_reason}
            </p>
            {voucher.approval_date && (
              <span style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.5rem', display: 'block' }}>
                Reviewed on {voucher.approval_date} by {voucher.director_name || 'Director'}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Expense Title
            </span>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginTop: '0.25rem' }}>{voucher.expense_title}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Claimed Amount
            </span>
            <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
              ₹{Number(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <Calendar size={14} />
              <span>Expense Date</span>
            </div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{voucher.expense_date}</div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <Building size={14} />
              <span>Department</span>
            </div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{voucher.department}</div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Category</div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{voucher.expense_category}</div>
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>Expense Description</div>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            lineHeight: 1.6
          }}>
            {voucher.expense_description || 'No description provided.'}
          </div>
        </div>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary)" />
              <span>Employee Information</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Name:</span>
              <span style={{ fontWeight: 600 }}>{voucher.employee_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Employee Code:</span>
              <span className="mono">{voucher.employee_code || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Voucher Date:</span>
              <span>{voucher.voucher_date}</span>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Employee Signature:</span>
              {voucher.employee_signature ? (
                <div style={{ background: '#f8fafc', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <img src={voucher.employee_signature} alt="Employee Signature" style={{ maxHeight: '70px', objectFit: 'contain' }} />
                </div>
              ) : (
                <span style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>Not signed yet (Draft)</span>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary)" />
              <span>Approval Status & Signoff</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>
              <StatusBadge status={voucher.status} />
            </div>

            {voucher.status === 'Approved' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Approved By:</span>
                  <span style={{ fontWeight: 600 }}>{voucher.director_name || 'Director'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Approval Date:</span>
                  <span>{voucher.approval_date}</span>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Director Signature:</span>
                  <div style={{ background: '#f8fafc', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <img src={voucher.director_signature} alt="Director Signature" style={{ maxHeight: '70px', objectFit: 'contain' }} />
                  </div>
                </div>
              </>
            )}

            {voucher.status === 'Submitted' && (
              <div style={{ background: 'var(--warning-light)', color: '#b45309', padding: '0.875rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                Pending review and signature signoff by Director.
              </div>
            )}

            {voucher.status === 'Draft' && (
              <div style={{ background: '#f1f5f9', color: 'var(--text-muted)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                Voucher is currently in Draft mode. You may edit or submit for approval.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>Created: {new Date(voucher.created_at).toLocaleString()}</span>
          <span>Last Updated: {new Date(voucher.updated_at).toLocaleString()}</span>
        </div>
      </div>

      {showApproveModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Approve Expense Voucher</h3>
              <button type="button" onClick={() => setShowApproveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                To approve voucher <strong>{voucher.voucher_number}</strong> for ₹{Number(voucher.amount).toLocaleString('en-IN')}, please provide your Director signature authorization.
              </p>
              <SignaturePad
                value={directorSignature}
                onChange={setDirectorSignature}
                label="Director Signature Authorization"
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowApproveModal(false)}>
                Cancel
              </button>
              <button type="button" disabled={actionLoading} className="btn btn-success" onClick={handleApprove}>
                {actionLoading ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Reject Expense Voucher</h3>
              <button type="button" onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Please specify the mandatory reason for rejecting voucher <strong>{voucher.voucher_number}</strong>. This explanation will be displayed to the employee.
              </p>
              <div className="form-group">
                <label className="form-label required">Rejection Reason</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="e.g. Missing attached invoice receipt, or expense not permitted under corporate policy..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button type="button" disabled={actionLoading} className="btn btn-danger" onClick={handleReject}>
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Submit Voucher for Approval</h3>
              <button type="button" onClick={() => setShowSubmitModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Are you ready to submit voucher <strong>{voucher.voucher_number}</strong> for Director approval? Once submitted, the voucher cannot be edited.
              </p>
              {!voucher.employee_signature && (
                <SignaturePad
                  value={employeeSignature}
                  onChange={setEmployeeSignature}
                  label="Employee Signature Authorization"
                />
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </button>
              <button type="button" disabled={actionLoading} className="btn btn-primary" onClick={handleSubmitDraft}>
                {actionLoading ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
