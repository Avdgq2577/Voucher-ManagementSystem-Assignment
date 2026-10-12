import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { VoucherTable } from '../components/VoucherTable';
import {
  FileText,
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  PlusCircle
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setData(res.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDelete = async (id, voucherNumber) => {
    if (!window.confirm(`Are you sure you want to delete draft voucher ${voucherNumber}?`)) return;
    try {
      await api.delete(`/vouchers/${id}`);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete draft');
    }
  };

  if (loading) {
    return <div className="page-body">Loading dashboard...</div>;
  }

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Expense Dashboard</h1>
          <p className="page-subtitle">Track, create, and submit your business reimbursement claims.</p>
        </div>
        <Link to="/employee/create" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Create Voucher</span>
        </Link>
      </div>

      <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          title="Total Vouchers"
          value={data?.totalVouchers || 0}
          icon={FileText}
          color="#2563eb"
          bgLight="#eff6ff"
        />
        <StatCard
          title="Draft Vouchers"
          value={data?.draftVouchers || 0}
          icon={FileEdit}
          color="#64748b"
          bgLight="#f1f5f9"
        />
        <StatCard
          title="Pending Approval"
          value={data?.pendingApproval || 0}
          icon={Clock}
          color="#f59e0b"
          bgLight="#fffbeb"
        />
        <StatCard
          title="Approved Vouchers"
          value={data?.approvedVouchers || 0}
          icon={CheckCircle2}
          color="#10b981"
          bgLight="#ecfdf5"
        />
        <StatCard
          title="Rejected Vouchers"
          value={data?.rejectedVouchers || 0}
          icon={XCircle}
          color="#ef4444"
          bgLight="#fef2f2"
        />
        <StatCard
          title="Total Amount Claimed"
          value={`₹${Number(data?.totalAmountClaimed || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="#4f46e5"
          bgLight="#eef2ff"
        />
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Expense Vouchers</h2>
          <Link to="/employee/vouchers" className="btn btn-secondary btn-sm">
            View All
          </Link>
        </div>
        <VoucherTable
          vouchers={data?.recentActivity || []}
          onDelete={handleDelete}
          showEmployee={false}
        />
      </div>
    </div>
  );
};
