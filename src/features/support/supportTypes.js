/**
 * Support Ticket Types
 * Shared type definitions for support system
 */

/**
 * Support Ticket Status
 */
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  AWAITING_USER: 'awaiting_user',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

/**
 * Support Ticket Priority
 */
export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Support Ticket Department
 */
export const TICKET_DEPARTMENT = {
  ORDERS_DELIVERY: 'Orders & Delivery',
  PAYMENTS_BILLING: 'Payments & Billing',
  SHIPPING_RETURNS: 'Shipping & Returns',
  ACCOUNT_PROFILE: 'Account & Profile',
  PAYOUT_FINANCE: 'Payout & Finance',
  LISTINGS: 'Listings',
  ACCOUNT_VERIFICATION: 'Account Verification',
  INFRASTRUCTURE: 'Infrastructure',
  COMPLIANCE: 'Compliance',
  PAYMENTS: 'Payments',
  SELLERS: 'Sellers',
  ORDERS: 'Orders',
  GENERAL: 'General',
};

/**
 * Support Ticket Role
 */
export const TICKET_ROLE = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
};

/**
 * Status badge colors - using theme variables
 */
export const STATUS_COLORS = {
  open: 'var(--color-brand-500)',
  in_progress: 'var(--color-yellow-700)',
  awaiting_user: 'var(--color-indigo-700)',
  escalated: 'var(--color-red-600)',
  resolved: 'var(--color-green-700)',
  closed: 'var(--color-grey-600)',
};

/**
 * Priority badge colors - using theme variables
 */
export const PRIORITY_COLORS = {
  low: 'var(--color-grey-600)',
  medium: 'var(--color-brand-500)',
  high: 'var(--color-yellow-700)',
  critical: 'var(--color-red-600)',
};

