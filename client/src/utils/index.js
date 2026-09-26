export const getStatusBadgeClass = (status) => {
  const map = {
    'Active': 'badge-active',
    'Potential Match': 'badge-match',
    'Recovery Requested': 'badge-request',
    'Recovered': 'badge-recovered',
    'Closed': 'badge-closed',
    'Available': 'badge-available',
    'Ownership Requested': 'badge-request',
    'Returned': 'badge-returned',
    'Pending': 'badge-pending',
    'Accepted': 'badge-accepted',
    'Rejected': 'badge-rejected',
    'Disputed': 'badge-disputed',
    'Resolved': 'badge-recovered',
    'Dismissed': 'badge-closed',
  };
  return map[status] || 'badge bg-gray-500/10 text-gray-400 border border-gray-500/20';
};

export const CATEGORIES = [
  'Electronics', 'Clothing', 'Accessories', 'Documents',
  'Keys', 'Bags', 'Jewelry', 'Books', 'Sports', 'Pets', 'Other'
];

export const COLORS = [
  'Black', 'White', 'Gray', 'Brown', 'Red', 'Orange', 'Yellow',
  'Green', 'Teal', 'Purple', 'Pink', 'Gold', 'Silver', 'Multi-color'
];

export const formatDate = (date) => {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const timeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};

export const getScoreColor = (score) => {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-mid';
  return 'score-low';
};

export const getScoreLabel = (score) => {
  if (score >= 80) return { text: 'Very Likely Match', color: 'text-emerald-400' };
  if (score >= 60) return { text: 'Probable Match', color: 'text-teal-400' };
  return { text: 'Possible Match', color: 'text-amber-400' };
};

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const SERVER_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
