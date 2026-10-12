export const StatCard = ({ title, value, icon: Icon, color = '#2563eb', bgLight = '#eff6ff' }) => {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
      {Icon && (
        <div className="stat-icon" style={{ background: bgLight, color }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};
