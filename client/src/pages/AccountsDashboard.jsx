import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { VoucherTable } from '../components/VoucherTable';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Files
} from 'lucide-react';

export const AccountsDashboard = () => {
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

  if (loading) {
    return <div className="page-body">Loading dashboard...</div>;
  }

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts Reimbursement Dashboard</h1>
          <p className="page-subtitle">Monitor approved expense vouchers and process finance disbursements.</p>
        </div>
        <Link to="/accounts/vouchers" className="btn btn-primary">
          <Files size={18} />
          <span>Monitor All Vouchers</span>
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
          title="Total Approved Expense Amount"
          value={`₹${Number(data?.totalApprovedAmount || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="#059669"
          bgLight="#ecfdf5"
        />
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recently Approved Vouchers Ready for Payment</h2>
          <Link to="/accounts/vouchers" className="btn btn-secondary btn-sm">
            View All Vouchers
          </Link>
        </div>
        <VoucherTable
          vouchers={data?.recentApprovedVouchers || []}
          showEmployee={true}
        />
      </div>
    </div>
  );
};
