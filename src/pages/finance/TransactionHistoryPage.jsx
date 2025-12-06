import { useState, useMemo } from 'react';
import styled from 'styled-components';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { useSellerTransactions } from '../../shared/hooks/finance/useSellerTransactions';
import { PageContainer, PageHeader, TitleSection, ActionSection } from '../../shared/components/ui/SpacingSystem';
import TransactionFilterBar from '../../components/finance/transactions/TransactionFilterBar';
import TransactionTable from '../../components/finance/transactions/TransactionTable';
import ExportTransactionsButton from '../../components/finance/transactions/ExportTransactionsButton';
import Pagination from '../../components/finance/transactions/Pagination';
import { LoadingState, ErrorState } from '../../shared/components/ui/LoadingComponents';
import { devicesMax } from '../../shared/styles/breakpoint';

const ContentSection = styled.section`
  margin-top: var(--spacing-xl);
`;

const TransactionHistoryPage = () => {
  useDynamicPageTitle({
    title: 'Transaction History - EazSeller',
    description: 'View and manage your transaction history',
    defaultTitle: 'Transactions • EazSeller',
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
      <PageContainer>
        <LoadingState message="Loading transaction history..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          title="Failed to load transactions"
          message={error?.message || 'Please try again later'}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Transaction History</h1>
          <p>View all your financial transactions and earnings</p>
        </TitleSection>
        <ActionSection>
          <ExportTransactionsButton 
            transactions={transactions}
            filename={`transactions-${new Date().toISOString().split('T')[0]}.csv`}
          />
        </ActionSection>
      </PageHeader>

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
    </PageContainer>
  );
};

export default TransactionHistoryPage;

