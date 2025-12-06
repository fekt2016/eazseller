import { useQuery } from '@tanstack/react-query';
import balanceApi from '../../services/balanceApi';

/**
 * Enhanced hook for seller transactions with pagination and filtering
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.type - Filter by type: 'credit' or 'debit'
 * @param {string} params.status - Filter by status: 'pending', 'completed', 'failed', 'cancelled'
 * @param {string} params.startDate - Start date for date range filter (ISO string)
 * @param {string} params.endDate - End date for date range filter (ISO string)
 * @param {string} params.search - Search term (searches description and references)
 * 
 * @returns {Object} Query result with transactions, pagination, and metadata
 */
export const useSellerTransactions = (params = {}) => {
  const {
    page = 1,
    limit = 20,
    type,
    status,
    startDate,
    endDate,
    search,
    ...otherParams
  } = params;

  // Build query params
  const queryParams = {
    page,
    limit,
    ...(type && { type }),
    ...(status && { status }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(search && { search }),
    ...otherParams,
  };

  return useQuery({
    queryKey: ['sellerTransactions', queryParams],
    queryFn: async () => {
      const response = await balanceApi.getTransactions(queryParams);
      const data = response?.data?.data || response?.data || response;
      
      return {
        transactions: data.transactions || data || [],
        pagination: {
          page: data.page || page,
          limit: data.limit || limit,
          total: data.total || 0,
          totalPages: data.totalPages || Math.ceil((data.total || 0) / (data.limit || limit)),
          results: data.results || (data.transactions || data || []).length,
        },
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    keepPreviousData: true, // Keep previous data while fetching new page
  });
};

/**
 * Get single transaction by ID
 * @param {string} transactionId - Transaction ID
 * @returns {Object} Query result with transaction data
 */
export const useTransactionById = (transactionId) => {
  return useQuery({
    queryKey: ['sellerTransaction', transactionId],
    queryFn: async () => {
      // Try direct endpoint first (if backend supports it)
      try {
        const directResponse = await balanceApi.getTransactionById(transactionId);
        if (directResponse?.data?.data || directResponse?.data) {
          return directResponse.data.data || directResponse.data;
        }
      } catch (error) {
        // Endpoint doesn't exist, fall through to search method
      }
      
      // Fallback: Search through transactions
      // Fetch transactions with a reasonable limit and find the matching one
      let page = 1;
      let found = null;
      const limit = 100;
      const maxPages = 10; // Safety limit
      
      while (!found && page <= maxPages) {
        const response = await balanceApi.getTransactions({ page, limit });
        const data = response?.data?.data || response?.data || response;
        const transactions = data.transactions || data || [];
        
        found = transactions.find(t => 
          (t._id || t.id)?.toString() === transactionId
        );
        
        if (found) break;
        
        // If we got fewer results than limit, we've reached the end
        if (transactions.length < limit) break;
        
        page++;
      }
      
      if (!found) {
        throw new Error('Transaction not found');
      }
      
      return found;
    },
    enabled: !!transactionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Export transactions to CSV
 * @param {Array} transactions - Array of transaction objects
 * @param {string} filename - Output filename (default: 'transactions.csv')
 */
export const exportTransactionsToCSV = (transactions, filename = 'transactions.csv') => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  // CSV headers
  const headers = [
    'Date',
    'Type',
    'Description',
    'Amount',
    'Status',
    'Order Reference',
    'Withdrawal Reference',
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map(transaction => {
    const date = transaction.createdAt 
      ? new Date(transaction.createdAt).toLocaleString('en-US')
      : 'N/A';
    const type = transaction.type || (transaction.amount >= 0 ? 'credit' : 'debit');
    const description = transaction.description || 'N/A';
    const amount = transaction.amount || 0;
    const status = transaction.status || 'completed';
    const orderRef = transaction.sellerOrder?.order?.orderNumber || 
                     (transaction.orderId ? `#${transaction.orderId.toString().slice(-8)}` : '');
    const withdrawalRef = transaction.payoutRequest?._id ? 
                          transaction.payoutRequest._id.toString().slice(-8) : '';

    return [
      date,
      type,
      description,
      amount.toFixed(2),
      status,
      orderRef,
      withdrawalRef,
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export default useSellerTransactions;

