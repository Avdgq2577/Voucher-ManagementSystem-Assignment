import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { VoucherTable } from '../components/VoucherTable';
import { VoucherFilter } from '../components/VoucherFilter';
import { useAuth } from '../context/AuthContext';
import { PlusCircle } from 'lucide-react';

export const VoucherList = ({ initialStatus, pageTitle, pageSubtitle }) => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialFilters = {
    search: '',
    status: initialStatus || 'All',
    department: 'All',
    category: 'All',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  };

  const [filters, setFilters] = useState(initialFilters);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== 'All') params.status = filters.status;
      if (filters.department && filters.department !== 'All') params.department = filters.department;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const res = await api.get('/vouchers', { params });
      setVouchers(res.data.vouchers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleDelete = async (id, voucherNumber) => {
    if (!window.confirm(`Are you sure you want to delete draft voucher ${voucherNumber}?`)) return;
    try {
      await api.delete(`/vouchers/${id}`);
      fetchVouchers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete draft');
    }
  };

  const handleReset = () => {
    setFilters({ ...initialFilters, status: initialStatus || 'All' });
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">{pageTitle || 'Expense Vouchers'}</h1>
          <p className="page-subtitle">
            {pageSubtitle || 'Search, filter, and review all expense reimbursement claims.'}
          </p>
        </div>
        {user?.role === 'Employee' && (
          <Link to="/employee/create" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Create Voucher</span>
          </Link>
        )}
      </div>

      <VoucherFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
        showEmployeeFilter={user?.role !== 'Employee'}
      />

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>Loading vouchers...</div>
      ) : (
        <VoucherTable
          vouchers={vouchers}
          onDelete={handleDelete}
          showEmployee={user?.role !== 'Employee'}
        />
      )}
    </div>
  );
};
