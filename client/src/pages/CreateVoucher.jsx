import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SignaturePad } from '../components/SignaturePad';
import { ArrowLeft, Save, Send, AlertCircle } from 'lucide-react';

export const CreateVoucher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    expense_date: today,
    department: user?.department || 'Engineering',
    expense_title: '',
    expense_category: 'Travel',
    expense_description: '',
    amount: '',
    employee_signature: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const departments = ['Engineering', 'Marketing', 'Finance', 'Executive', 'Human Resources', 'Sales', 'Operations'];
  const categories = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Training', 'Client Entertainment', 'General'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = (isSubmitting) => {
    if (!formData.department.trim()) return 'Department is mandatory';
    if (!formData.expense_title.trim()) return 'Expense title is mandatory';
    if (!formData.expense_date) return 'Expense date is mandatory';
    const num = parseFloat(formData.amount);
    if (isNaN(num) || num <= 0) return 'Amount is mandatory and must be greater than zero';
    if (isSubmitting && (!formData.employee_signature || !formData.employee_signature.trim())) {
      return 'Employee signature is mandatory before submitting for approval';
    }
    return null;
  };

  const handleAction = async (actionType) => {
    setError('');
    const validationError = validate(actionType === 'submit');
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/vouchers', {
        ...formData,
        action: actionType
      });
      navigate('/employee/vouchers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create expense voucher');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-body" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/employee/dashboard" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="page-title">Create Expense Voucher</h1>
        <p className="page-subtitle">Submit a new business expenditure reimbursement request.</p>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--danger-light)',
          color: '#b91c1c',
          border: '1px solid #fecaca',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Employee Information</h2>
        </div>

        <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Employee Name</label>
            <input type="text" readOnly className="form-input" value={user?.name || ''} style={{ background: 'var(--bg-subtle)' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Employee Code</label>
            <input type="text" readOnly className="form-input" value={user?.employee_code || 'EMP-101'} style={{ background: 'var(--bg-subtle)' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Voucher Date</label>
            <input type="text" readOnly className="form-input" value={today} style={{ background: 'var(--bg-subtle)' }} />
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Expense Details</h2>
        </div>

        <div className="grid-cols-2">
          <div className="form-group">
            <label className="form-label required">Department</label>
            <select
              className="form-select"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">Expense Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.expense_date}
              onChange={(e) => handleChange('expense_date', e.target.value)}
            />
          </div>
        </div>

        <div className="grid-cols-2">
          <div className="form-group">
            <label className="form-label required">Expense Category</label>
            <select
              className="form-select"
              value={formData.expense_category}
              onChange={(e) => handleChange('expense_category', e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="form-input"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label required">Expense Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Travel to client site for software rollout"
            value={formData.expense_title}
            onChange={(e) => handleChange('expense_title', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Expense Description</label>
          <textarea
            className="form-textarea"
            placeholder="Provide context, purpose, and breakdown details..."
            value={formData.expense_description}
            onChange={(e) => handleChange('expense_description', e.target.value)}
          />
        </div>

        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Employee Signature Authorization</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Required before submitting the voucher for Director approval.</p>
        </div>

        <SignaturePad
          value={formData.employee_signature}
          onChange={(sig) => handleChange('employee_signature', sig)}
          label="Employee Signature"
        />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border)'
        }}>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleAction('draft')}
            className="btn btn-secondary"
          >
            <Save size={18} />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleAction('submit')}
            className="btn btn-primary"
          >
            <Send size={18} />
            <span>Submit for Approval</span>
          </button>
        </div>
      </div>
    </div>
  );
};
