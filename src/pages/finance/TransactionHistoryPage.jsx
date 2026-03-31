import { useState, useMemo } from 'react';
import styled from 'styled-components';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { useSellerTransactions } from '../../shared/hooks/finance/useSellerTransactions';
import TransactionFilterBar from '../../components/finance/transactions/TransactionFilterBar';
import TransactionTable from '../../components/finance/transactions/TransactionTable';
import ExportTransactionsButton from '../../components/finance/transactions/ExportTransactionsButton';
import Pagination from '../../components/finance/transactions/Pagination';
import { ErrorState, SkeletonTableRows } from '../../shared/components/ui/LoadingComponents';

const TxPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const TxHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const TxTitle = styled.h1`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.1rem;
`;

const TxSubtitle = styled.p`
  font-size: 0.8rem;
  color: #9CA3AF;
  margin: 0;
`;

const ContentSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TransactionHistoryPage = () => {
  useDynamicPageTitle({
    title: 'Transaction History - Saiisai Seller',
    description: 'View and manage your transaction history',
    defaultTitle: 'Transactions • Saiisai Seller',
  });

  // State
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({});

  // Build query params
  const queryParams = useMemo(() => ({
    page,
    limit,
    ...filters,
  }), [page, limit, filters]);

  // Fetch transactions
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useSellerTransactions(queryParams);

  const transactions = useMemo(() => {
    return data?.transactions || [];
  }, [data]);

  const pagination = useMemo(() => {
    return data?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      results: 0,
    };
  }, [data]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && !data) {
    return (
      <TxPage>
        <SkeletonTableRows count={8} />
      </TxPage>
    );
  }

  if (error) {
    return (
      <TxPage>
        <ErrorState
          title="Failed to load transactions"
          message={error?.message || 'Please try again later'}
        />
      </TxPage>
    );
  }

  return (
    <TxPage>
      <TxHeader>
        <div>
          <TxTitle>Transaction History</TxTitle>
          <TxSubtitle>View all your financial transactions and earnings</TxSubtitle>
        </div>
        <ExportTransactionsButton
          transactions={transactions}
          filename={`transactions-${new Date().toISOString().split('T')[0]}.csv`}
        />
      </TxHeader>

      <ContentSection>
        <TransactionFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        <TransactionTable
          transactions={transactions}
          isLoading={isLoading}
          error={error}
        />

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </ContentSection>
    </TxPage>
  );
};

export default TransactionHistoryPage;

