export const formatGHS = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return `GH₵ ${Number(amount).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatOrderDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

export const formatOrderNumber = (value, fallbackId = '') => {
  const raw = String(value || '').trim();
  if (!raw) {
    const tail = String(fallbackId || '').slice(-8).toUpperCase();
    return tail ? `#ORD-${tail}` : '—';
  }

  if (raw.startsWith('#ORD-')) return raw;
  if (raw.startsWith('ORD-')) return `#${raw}`;
  if (raw.startsWith('#')) return raw;
  return `#${raw}`;
};

