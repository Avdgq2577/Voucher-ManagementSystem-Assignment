import { useAuth } from '../context/AuthContext';
import { LogOut, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <ReceiptText size={28} color="#2563eb" />
        <span>Expense Voucher System</span>
        <span className="brand-badge">PSPL</span>
      </div>

      <div className="navbar-user">
        <div className="user-profile">
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role-tag">{user?.role} • {user?.department || 'General'}</div>
          </div>
          <div className="user-avatar">
            {getInitials(user?.name)}
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Logout">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
