// "just now", "5 min ago", "3 h ago", "2 days ago", then a date.
export function timeAgo(value, now = Date.now()) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.floor((now - then) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(value).toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export function hoursSince(value, now = Date.now()) {
  if (!value) return 0;
  return (now - new Date(value).getTime()) / 3600000;
}
