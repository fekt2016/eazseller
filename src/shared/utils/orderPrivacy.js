/**
 * Seller-facing buyer PII gating.
 *
 * Denylist approach — unknown or missing statuses are treated as pre-shipment so PII is
 * hidden by default. The backend has three parallel status fields (status, currentStatus,
 * orderStatus) and we check all of them.
 */

const POST_SHIPMENT_STATUSES = new Set([
  // currentStatus values indicating the order has left the seller
  'international_shipped',
  'customs_clearance',
  'arrived_destination',
  'local_dispatch',
  'out_for_delivery',
  'delivery_attempted',
  'delivered',
  // Order.status / orderStatus / SellerOrder.status values
  'shipped',
  'delievered', // schema typo preserved intentionally
  'partially_shipped',
  'completed',
]);

/**
 * @param {object|null|undefined} order
 * @returns {boolean} true when no candidate status is post-shipment (hide full PII)
 */
export function isPreShipment(order) {
  if (!order) return true; // fail safe: hide PII when shape unknown
  const candidates = [
    order.status,
    order.currentStatus,
    order.orderStatus,
    order.fulfillmentStatus,
  ].filter(Boolean);
  // pre-shipment = none of the candidates are in the post-shipment set
  return !candidates.some((s) => POST_SHIPMENT_STATUSES.has(s));
}

export function firstNameOnly(fullName) {
  const trimmed = String(fullName || '').trim();
  if (!trimmed) return '';
  return trimmed.split(/\s+/)[0];
}

export function buyerContactVisibility(order) {
  const preShip = isPreShipment(order);
  return {
    showFullName: !preShip,
    showEmail: !preShip,
    showPhone: !preShip,
    showExactAddress: !preShip,
    // always safe
    showFirstName: true,
    showAreaAndRegion: true,
  };
}
