import { Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  if (status === 'Draft') {
    return (
      <span className="badge badge-draft">
        <FileEdit size={13} />
        Draft
      </span>
    );
  }

  if (status === 'Submitted') {
    return (
      <span className="badge badge-submitted">
        <Clock size={13} />
        Pending Approval
      </span>
    );
  }

  if (status === 'Approved') {
    return (
      <span className="badge badge-approved">
        <CheckCircle2 size={13} />
        Approved
      </span>
    );
  }

  if (status === 'Rejected') {
    return (
      <span className="badge badge-rejected">
        <XCircle size={13} />
        Rejected
      </span>
    );
  }

  return <span className="badge">{status}</span>;
};
