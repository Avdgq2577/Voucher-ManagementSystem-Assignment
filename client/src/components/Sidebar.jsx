import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileSpreadsheet,
  CheckSquare,
  Files
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {role === 'Employee' && (
          <>
            <NavLink
              to="/employee/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/employee/create"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <PlusCircle size={18} />
              <span>Create Voucher</span>
            </NavLink>
            <NavLink
              to="/employee/vouchers"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FileSpreadsheet size={18} />
              <span>My Vouchers</span>
            </NavLink>
          </>
        )}

        {role === 'Director' && (
          <>
            <NavLink
              to="/director/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/director/pending"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <CheckSquare size={18} />
              <span>Pending Approvals</span>
            </NavLink>
            <NavLink
              to="/director/vouchers"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Files size={18} />
              <span>All Vouchers</span>
            </NavLink>
          </>
        )}

        {role === 'Accounts' && (
          <>
            <NavLink
              to="/accounts/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/accounts/vouchers"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Files size={18} />
              <span>All Vouchers</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};
