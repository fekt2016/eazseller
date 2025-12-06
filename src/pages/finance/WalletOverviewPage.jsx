import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaWallet, FaLock, FaClock, FaDollarSign, FaArrowDown, FaMoneyBillWave } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { useSellerBalance } from '../../shared/hooks/finance/useSellerBalance';
import { PageContainer, PageHeader, TitleSection, ActionSection, StatsGrid } from '../../shared/components/ui/SpacingSystem';
import Button from '../../shared/components/ui/Button';
import BalanceSummaryCard from '../../components/finance/BalanceSummaryCard';
import QuickActionsPanel from '../../components/finance/QuickActionsPanel';
import TransactionList from '../../components/finance/TransactionList';
import { LoadingState, ErrorState } from '../../shared/components/ui/LoadingComponents';
import { devicesMax } from '../../shared/styles/breakpoint';
import { PATHS } from '../../routes/routePaths';

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  
  @media ${devicesMax.lg} {
    grid-template-columns: 1fr;
  }
`;

const BalanceCardsGrid = styled(StatsGrid)`
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: var(--spacing-xl);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const WalletOverviewPage = () => {
  useDynamicPageTitle({
    title: 'Wallet Overview - EazSeller',
    description: 'View your balance, earnings, and transaction history',
    defaultTitle: 'Wallet • EazSeller',
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
      <PageContainer>
        <LoadingState message="Loading wallet information..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          title="Failed to load wallet data"
          message={error?.message || 'Please try again later'}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Wallet Overview</h1>
          <p>Manage your earnings and withdrawals</p>
        </TitleSection>
        <ActionSection>
          <Button
            as={Link}
            to={PATHS.WITHDRAWALS}
            variant="primary"
            size="lg"
            gradient
          >
            <FaMoneyBillWave /> Withdrawals
          </Button>
        </ActionSection>
      </PageHeader>

      {/* Balance Summary Cards */}
      <BalanceCardsGrid $gap="md" $marginBottom="lg">
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
        {/* Left Column: Transactions */}
        <div>
          <TransactionList limit={10} />
        </div>

        {/* Right Column: Quick Actions */}
        <div>
          <QuickActionsPanel availableBalance={availableBalance} />
        </div>
      </ContentGrid>

      {/* Additional Info */}
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
    </PageContainer>
  );
};

const InfoBanner = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-yellow-100);
  border: 1px solid var(--color-yellow-300);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  color: var(--color-yellow-800);
  
  svg {
    font-size: var(--font-size-lg);
    flex-shrink: 0;
  }
`;

const InfoText = styled.div`
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  line-height: 1.5;
  
  strong {
    font-weight: var(--font-semibold);
  }
`;

const LastUpdated = styled.div`
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
  font-family: var(--font-body);
  margin-top: var(--spacing-lg);
`;

export default WalletOverviewPage;

