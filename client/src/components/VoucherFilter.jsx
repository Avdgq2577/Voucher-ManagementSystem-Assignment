import { Search, RotateCcw, Filter } from 'lucide-react';

export const VoucherFilter = ({ filters, onChange, onReset, showEmployeeFilter = false }) => {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const departments = ['Engineering', 'Marketing', 'Finance', 'Executive', 'Human Resources', 'Sales', 'Operations'];
  const categories = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Training', 'Client Entertainment', 'General'];
  const statuses = ['Draft', 'Submitted', 'Approved', 'Rejected'];

  return (
    <div className="filter-bar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9375rem' }}>
          <Filter size={18} color="var(--primary)" />
          <span>Search & Filter Vouchers</span>
        </div>
        <button type="button" onClick={onReset} className="btn btn-secondary btn-sm">
          <RotateCcw size={14} />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="filter-row">
        <div style={{ flex: '2', minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder={showEmployeeFilter ? "Search by voucher #, title, employee..." : "Search by voucher #, title..."}
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        <div style={{ flex: '1', minWidth: '150px' }}>
          <select
            className="form-select"
            value={filters.status || 'All'}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="All">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s === 'Submitted' ? 'Pending Approval' : s}</option>)}
          </select>
        </div>

        <div style={{ flex: '1', minWidth: '150px' }}>
          <select
            className="form-select"
            value={filters.department || 'All'}
            onChange={(e) => handleChange('department', e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div style={{ flex: '1', minWidth: '150px' }}>
          <select
            className="form-select"
            value={filters.category || 'All'}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="filter-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '280px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Date:</span>
          <input
            type="date"
            className="form-input"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="form-input"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '260px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Amount (₹):</span>
          <input
            type="number"
            className="form-input"
            placeholder="Min"
            value={filters.minAmount || ''}
            onChange={(e) => handleChange('minAmount', e.target.value)}
          />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>to</span>
          <input
            type="number"
            className="form-input"
            placeholder="Max"
            value={filters.maxAmount || ''}
            onChange={(e) => handleChange('maxAmount', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort:</span>
          <select
            className="form-select"
            value={`${filters.sortBy || 'created_at'}-${filters.sortOrder || 'DESC'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              onChange({ ...filters, sortBy, sortOrder });
            }}
          >
            <option value="created_at-DESC">Newest Created</option>
            <option value="created_at-ASC">Oldest Created</option>
            <option value="expense_date-DESC">Expense Date (Recent)</option>
            <option value="expense_date-ASC">Expense Date (Older)</option>
            <option value="amount-DESC">Amount: High to Low</option>
            <option value="amount-ASC">Amount: Low to High</option>
          </select>
        </div>
      </div>
    </div>
  );
};
