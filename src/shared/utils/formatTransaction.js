/**
 * Transaction Formatting Utilities
 * Centralized functions for formatting transaction data
 * DRY: Reuse these functions across all transaction displays
 */

/**
 * Format transaction amount with sign and currency
 * @param {Object} transaction - Transaction object
 * @returns {string} Formatted amount string
 */
export const formatTransactionAmount = (transaction) => {
  const amount = transaction.amount || 0;
  const type = transaction.type || (amount >= 0 ? 'credit' : 'debit');
  const isCredit = type === 'credit' || amount >= 0;
  const sign = isCredit ? '+' : '-';
  return `${sign}GH₵${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Get transaction type label
 * @param {Object} transaction - Transaction object
 * @returns {string} Human-readable type label
 */
export const getTransactionTypeLabel = (transaction) => {
  const type = transaction.type || (transaction.amount >= 0 ? 'credit' : 'debit');
  const description = transaction.description || '';
  
  // Map common descriptions to type labels
  if (description.toLowerCase().includes('order') || description.toLowerCase().includes('earning')) {
    return 'Order Earning';
  }
  if (description.toLowerCase().includes('withdrawal') || description.toLowerCase().includes('payout')) {
    return 'Withdrawal';
  }
  if (description.toLowerCase().includes('refund')) {
    return 'Refund';
  }
  if (description.toLowerCase().includes('fee')) {
    return 'Fee';
  }
  if (description.toLowerCase().includes('adjustment')) {
    return 'Adjustment';
  }
  
  return type === 'credit' ? 'Credit' : 'Debit';
};

/**
 * Get transaction status color
 * @param {string} status - Transaction status
 * @returns {string} CSS variable for status color
 */
export const getTransactionStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'var(--color-green-700)';
    case 'pending':
      return 'var(--color-yellow-700)';
    case 'failed':
    case 'cancelled':
      return 'var(--color-red-700)';
    default:
      return 'var(--color-grey-700)';
  }
};

/**
 * Get transaction status background color
 * @param {string} status - Transaction status
 * @returns {string} CSS variable for status background color
 */
export const getTransactionStatusBgColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'var(--color-green-100)';
    case 'pending':
      return 'var(--color-yellow-100)';
    case 'failed':
    case 'cancelled':
      return 'var(--color-red-100)';
    default:
      return 'var(--color-grey-100)';
  }
};

/**
 * Get transaction icon type
 * @param {Object} transaction - Transaction object
 * @returns {string} Icon type: 'credit' or 'debit'
 */
export const getTransactionIconType = (transaction) => {
  const type = transaction.type || (transaction.amount >= 0 ? 'credit' : 'debit');
  return type === 'credit' ? 'credit' : 'debit';
};

/**
 * Get order reference from transaction
 * @param {Object} transaction - Transaction object
 * @returns {string|null} Order number or null
 */
export const getOrderReference = (transaction) => {
  if (transaction.sellerOrder?.order?.orderNumber) {
    return transaction.sellerOrder.order.orderNumber;
  }
  if (transaction.orderId) {
    return `#${transaction.orderId.toString().slice(-8)}`;
  }
  return null;
};

/**
 * Get withdrawal reference from transaction
 * @param {Object} transaction - Transaction object
 * @returns {string|null} Withdrawal ID or reference
 */
export const getWithdrawalReference = (transaction) => {
  if (transaction.payoutRequest?._id) {
    return transaction.payoutRequest._id.toString().slice(-8);
  }
  if (transaction.payoutRequestId) {
    return transaction.payoutRequestId.toString().slice(-8);
  }
  return null;
};

/**
 * Format transaction date
 * @param {string|Date} date - Transaction date
 * @returns {string} Formatted date string
 */
export const formatTransactionDate = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Format transaction date (short format)
 * @param {string|Date} date - Transaction date
 * @returns {string} Formatted date string
 */
export const formatTransactionDateShort = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Check if transaction is credit
 * @param {Object} transaction - Transaction object
 * @returns {boolean} True if credit transaction
 */
export const isCreditTransaction = (transaction) => {
  const type = transaction.type || (transaction.amount >= 0 ? 'credit' : 'debit');
  return type === 'credit' || transaction.amount >= 0;
};

export default {
  formatTransactionAmount,
  getTransactionTypeLabel,
  getTransactionStatusColor,
  getTransactionStatusBgColor,
  getTransactionIconType,
  getOrderReference,
  getWithdrawalReference,
  formatTransactionDate,
  formatTransactionDateShort,
  isCreditTransaction,
};

