import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaWallet, FaLock, FaClock, FaDollarSign, FaArrowDown, FaMoneyBillWave } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { useSellerBalance } from '../../shared/hooks/finance/useSellerBalance';
import Button from '../../shared/components/ui/Button';
import BalanceSummaryCard from '../../components/finance/BalanceSummaryCard';
import QuickActionsPanel from '../../components/finance/QuickActionsPanel';
import TransactionList from '../../components/finance/TransactionList';
import { ErrorState, SkeletonStatCards, SkeletonTableRows } from '../../shared/components/ui/LoadingComponents';
import { PATHS } from '../../routes/routePaths';

const WalletPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const WalletHeader = styled.div`
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

const WalletTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.2rem;
`;

const WalletSubtitle = styled.p`
  font-size: 0.875rem;
  color: #9CA3AF;
  margin: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0.75rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const BalanceCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const WalletOverviewPage = () => {
  useDynamicPageTitle({
    title: 'Wallet Overview - Saiisai Seller',
    description: 'View your balance, earnings, and transaction history',
    defaultTitle: 'Wallet • Saiisai Seller',
  });

  const {
    availableBalance,
    pendingBalance,
    totalEarnings,
    withdrawnAmount,
    lockedBalance,
    isLoading,
    error,
    lastUpdated,
  } = useSellerBalance();

  if (isLoading) {
    return (
      <WalletPage>
        <SkeletonStatCards count={3} />
        <SkeletonTableRows count={6} />
      </WalletPage>
    );
  }

  if (error) {
    return (
      <WalletPage>
        <ErrorState
          title="Failed to load wallet data"
          message={error?.message || 'Please try again later'}
        />
      </WalletPage>
    );
  }

  return (
    <WalletPage>
      <WalletHeader>
        <div>
          <WalletTitle>Wallet Overview</WalletTitle>
          <WalletSubtitle>Manage your earnings and withdrawals</WalletSubtitle>
        </div>
        <Button
          as={Link}
          to={PATHS.WITHDRAWALS}
          variant="primary"
          size="md"
        >
          <FaMoneyBillWave /> Withdrawals
        </Button>
      </WalletHeader>

      {/* Balance Summary Cards */}
      <BalanceCardsGrid>
        <BalanceSummaryCard
          label="Available Balance"
          amount={availableBalance}
          icon={<FaWallet />}
        />
        <BalanceSummaryCard
          label="Pending Clearance"
          amount={pendingBalance}
          icon={<FaClock />}
        />
        <BalanceSummaryCard
          label="Total Earnings"
          amount={totalEarnings}
          icon={<FaDollarSign />}
        />
        <BalanceSummaryCard
          label="Withdrawn Amount"
          amount={withdrawnAmount}
          icon={<FaArrowDown />}
          highlight
        />
      </BalanceCardsGrid>

      {/* Main Content Grid */}
      <ContentGrid>
        <div>
          <TransactionList limit={10} />
        </div>
        <div>
          <QuickActionsPanel availableBalance={availableBalance} />
        </div>
      </ContentGrid>

      {lockedBalance > 0 && (
        <InfoBanner>
          <FaLock />
          <InfoText>
            <strong>Locked Balance:</strong> GH₵{lockedBalance.toFixed(2)} is currently locked.
            Contact support if you have questions.
          </InfoText>
        </InfoBanner>
      )}

      {lastUpdated && (
        <LastUpdated>
          Last updated: {lastUpdated.toLocaleString()}
        </LastUpdated>
      )}
    </WalletPage>
  );
};

const InfoBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #FFFBEB;
  border: 0.5px solid #FDE68A;
  border-radius: 9px;
  color: #92400E;

  svg {
    font-size: 0.9rem;
    flex-shrink: 0;
  }
`;

const InfoText = styled.div`
  font-size: 0.9rem;
  line-height: 1.5;

  strong {
    font-weight: 600;
  }
`;

const LastUpdated = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: #9CA3AF;
`;

export default WalletOverviewPage;

