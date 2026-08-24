// Small formatting helpers shared across the app.

export const formatTime = (time: string | null): string => {
  if (!time) return '—';
  const [h, m] = time.split(':').map(Number);
  const hh = ((h + 11) % 12) + 1;
  const ap = h < 12 ? 'AM' : 'PM';
  return `${hh.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ap}`;
};

export const formatTime24 = (time: string | null): string => time ?? '—';

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export const formatDelay = (minutes: number | null | undefined): string => {
  if (minutes == null) return '—';
  if (minutes === 0) return 'On time';
  return `+${minutes} min`;
};

export const formatCurrency = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const dayName = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short' });
