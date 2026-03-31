import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FaMoneyBillWave, FaPlus, FaTrash } from 'react-icons/fa';
import {
  PageContainer,
  PageHeader,
  TitleSection,
  Section,
  SectionHeader,
} from '../../../shared/components/ui/SpacingSystem';
import Button from '../../../shared/components/ui/Button';
import { ErrorState, SkeletonStatCards, SkeletonTableRows } from '../../../shared/components/ui/LoadingComponents';
import { useSellerFunds } from '../hooks/useSellerFunds';
import { useGetPaymentRequests, useDeletePaymentRequest } from '../../../shared/hooks/usePaymentRequest';
import { useGetPaymentMethods } from '../../../shared/hooks/usePaymentMethod';
import FundsSummaryCard from '../components/FundsSummaryCard';
import TransactionsTable from '../components/TransactionsTable';
import RequestWithdrawalModal from '../components/RequestWithdrawalModal';
import useDynamicPageTitle from '../../../shared/hooks/useDynamicPageTitle';
import { ConfirmationModal } from '../../../shared/components/modal/ConfirmationModal';
// Helper to format currency with GHS symbol
const formatGHS = (value) => {
  return `GH₵${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Seller Funds Management Page
 * Displays wallet summary, transactions, and withdrawal management
 */
const SellerFundsPage = () => {
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [deletingWithdrawalId, setDeletingWithdrawalId] = useState(null);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState(null);

  const { getWalletSummary, getTransactions, requestWithdrawal, deleteWithdrawal } = useSellerFunds();
  const walletSummary = getWalletSummary();
  const { data: transactionsData, isLoading: isLoadingTransactions } = getTransactions({ limit: 20 });
  const { data: paymentRequestsData } = useGetPaymentRequests();
  const { data: paymentMethods = [] } = useGetPaymentMethods();

  const requestWithdrawalMutation = requestWithdrawal();
  const deleteWithdrawalMutation = deleteWithdrawal();

  useDynamicPageTitle({
    title: 'Funds & Wallet - Saiisai Seller',
    description: 'Manage your earnings, transactions, and withdrawals',
    defaultTitle: 'Funds & Wallet - Saiisai Seller',
  });

  const {
    availableBalance = 0,
    pendingBalance = 0,
    totalEarnings = 0,
    withdrawnAmount = 0,
    isLoading: isBalanceLoading,
  } = walletSummary;

  // Calculate total refunds from transactions
  const totalRefunds = useMemo(() => {
    if (!transactionsData?.transactions) return 0;
    return transactionsData.transactions
      .filter((t) => t.type === 'REFUND_DEDUCTION' || t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  }, [transactionsData]);

  const transactions = transactionsData?.transactions || [];
  const paymentRequests = paymentRequestsData?.paymentRequests || [];

  // Get pending withdrawal requests
  const pendingWithdrawals = useMemo(() => {
    return paymentRequests.filter(
      (req) => req.status === 'pending' || req.status === 'PENDING'
    );
  }, [paymentRequests]);

  const handleRequestWithdrawal = async (withdrawalData) => {
    try {
      await requestWithdrawalMutation.mutateAsync(withdrawalData);
      setIsWithdrawalModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error requesting withdrawal:', error);
    }
  };

  const handleDeleteWithdrawal = async (withdrawalId) => {
    setWithdrawalToDelete(withdrawalId);
  };

  const handleConfirmDeleteWithdrawal = async () => {
    const withdrawalId = withdrawalToDelete;
    setWithdrawalToDelete(null);
    try {
      setDeletingWithdrawalId(withdrawalId);
      await deleteWithdrawalMutation.mutateAsync(withdrawalId);
    } catch (error) {
      console.error('Error deleting withdrawal:', error);
    } finally {
      setDeletingWithdrawalId(null);
    }
  };

  if (isBalanceLoading) {
    return (
      <PageContainer>
        <SkeletonStatCards count={3} />
        <SkeletonTableRows count={6} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Funds & Wallet</h1>
          <p>Manage your earnings, transactions, and withdrawals</p>
        </TitleSection>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsWithdrawalModalOpen(true)}
          disabled={availableBalance <= 0}
        >
          <FaPlus /> Request Withdrawal
        </Button>
      </PageHeader>

      {/* Wallet Summary */}
      <Section $marginBottom="lg">
        <FundsSummaryCard
          availableBalance={availableBalance}
          pendingBalance={pendingBalance}
          totalEarnings={totalEarnings}
          totalRefunds={totalRefunds}
          isLoading={isBalanceLoading}
        />
      </Section>

      {/* Pending Withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <Section $marginBottom="lg">
          <SectionHeader $padding="md" $marginBottom="md">
            <h3>Pending Withdrawal Requests</h3>
          </SectionHeader>
          <WithdrawalsList>
            {pendingWithdrawals.map((withdrawal) => (
              <WithdrawalCard key={withdrawal._id}>
                <WithdrawalInfo>
                  <WithdrawalAmount>
                    {formatGHS(withdrawal.amount || 0)}
                  </WithdrawalAmount>
                  <WithdrawalMeta>
                    <WithdrawalStatus $status={withdrawal.status?.toLowerCase()}>
                      {withdrawal.status || 'PENDING'}
                    </WithdrawalStatus>
                    <WithdrawalDate>
                      Requested: {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </WithdrawalDate>
                  </WithdrawalMeta>
                </WithdrawalInfo>
                <WithdrawalActions>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWithdrawal(withdrawal._id)}
                    disabled={deletingWithdrawalId === withdrawal._id || withdrawal.status !== 'pending'}
                    title={
                      withdrawal.status !== 'pending'
                        ? 'Cannot delete approved withdrawal'
                        : 'Delete withdrawal request'
                    }
                  >
                    <FaTrash /> Delete
                  </Button>
                </WithdrawalActions>
              </WithdrawalCard>
            ))}
          </WithdrawalsList>
        </Section>
      )}

      {/* Recent Transactions */}
      <Section $marginBottom="lg">
        <SectionHeader $padding="md" $marginBottom="md">
          <h3>Recent Transactions</h3>
        </SectionHeader>
        <TransactionsTable
          transactions={transactions}
          isLoading={isLoadingTransactions}
        />
      </Section>

      {/* Request Withdrawal Modal */}
      <RequestWithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSubmit={handleRequestWithdrawal}
        availableBalance={availableBalance}
        paymentMethods={paymentMethods}
        isLoading={requestWithdrawalMutation.isPending}
      />

      <ConfirmationModal
        isOpen={!!withdrawalToDelete}
        onClose={() => setWithdrawalToDelete(null)}
        onConfirm={handleConfirmDeleteWithdrawal}
        title="Delete Withdrawal Request"
        message="Are you sure you want to delete this withdrawal request? This action cannot be undone."
        confirmText="Delete"
        confirmColor="#ef4444"
      />
    </PageContainer>
  );
};

export default SellerFundsPage;

// Styled Components
const WithdrawalsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const WithdrawalCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 1rem;
  
  border: 1px solid #F1EFE8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #F1EFE8;
  transition: all 0.12s;

  &:hover {
    
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const WithdrawalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const WithdrawalAmount = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
`;

const WithdrawalMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const WithdrawalStatus = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1rem 1rem;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background-color: #FAEEDA;
  color: #854F0B;
`;

const WithdrawalDate = styled.span`
  font-size: 0.875rem;
  color: #6B7280;
`;

const WithdrawalActions = styled.div`
  display: flex;
  gap: 1rem;
`;

