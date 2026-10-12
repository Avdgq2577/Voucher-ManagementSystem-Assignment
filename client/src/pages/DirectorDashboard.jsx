import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { VoucherTable } from '../components/VoucherTable';
import {
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  CheckSquare
} from 'lucide-react';

export const DirectorDashboard = () => {
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
          <h1 className="page-title">Director Approval Dashboard</h1>
          <p className="page-subtitle">Review, audit, and authorize company-wide employee expense reimbursements.</p>
        </div>
        <Link to="/director/pending" className="btn btn-primary">
          <CheckSquare size={18} />
          <span>Review Pending Approvals ({data?.pendingApprovalCount || 0})</span>
        </Link>
      </div>

      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Pending Approval"
          value={data?.pendingApprovalCount || 0}
          icon={Clock}
          color="#f59e0b"
          bgLight="#fffbeb"
        />
        <StatCard
          title="Approved Today"
          value={data?.approvedToday || 0}
          icon={CheckCircle2}
          color="#10b981"
          bgLight="#ecfdf5"
        />
        <StatCard
          title="Rejected Today"
          value={data?.rejectedToday || 0}
          icon={XCircle}
          color="#ef4444"
          bgLight="#fef2f2"
        />
        <StatCard
          title="Total Pending Amount"
          value={`₹${Number(data?.totalPendingAmount || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="#2563eb"
          bgLight="#eff6ff"
        />
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Organization Voucher Activity</h2>
          <Link to="/director/vouchers" className="btn btn-secondary btn-sm">
            View All Vouchers
          </Link>
        </div>
        <VoucherTable
          vouchers={data?.recentActivity || []}
          showEmployee={true}
        />
      </div>
    </div>
  );
};
