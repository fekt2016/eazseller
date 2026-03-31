export const normalizeAttentionStatus = (order) => {
  const raw = String(
    order?.currentStatus || order?.status || order?.FulfillmentStatus || 'pending'
  ).toLowerCase();

  if (raw === 'pending' || raw === 'pending_payment') return 'pending';
  if (raw === 'confirmed' || raw === 'payment_completed') return 'confirmed';
  return 'other';
};

export const getAttentionCountsFromOrders = (orders = []) => {
  const list = Array.isArray(orders) ? orders : [];
  const pending = list.filter(
    (order) => normalizeAttentionStatus(order) === 'pending'
  ).length;
  const confirmed = list.filter(
    (order) => normalizeAttentionStatus(order) === 'confirmed'
  ).length;

  return {
    pending,
    confirmed,
    attention: pending + confirmed,
  };
};

const breakdownCount = (value) => {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    return Number(value.count || 0);
  }
  return 0;
};

export const getAttentionCountsFromBreakdown = (statusBreakdown = {}) => {
  const pending = breakdownCount(statusBreakdown?.pending);
  const confirmed = breakdownCount(statusBreakdown?.confirmed);

  return {
    pending,
    confirmed,
    attention: pending + confirmed,
  };
};

