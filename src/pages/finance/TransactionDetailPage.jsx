import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaReceipt, FaCalendar, FaTag, FaCheckCircle, FaClock, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { useTransactionById } from '../../shared/hooks/finance/useSellerTransactions';
import {
  formatTransactionAmount,
  formatTransactionDate,
  getTransactionTypeLabel,
  getOrderReference,
  getWithdrawalReference,
  isCreditTransaction,
} from '../../shared/utils/formatTransaction';
import { PageContainer, PageHeader, TitleSection } from '../../shared/components/ui/SpacingSystem';
import Button from '../../shared/components/ui/Button';
import TransactionStatusBadge from '../../components/finance/transactions/TransactionStatusBadge';
import { LoadingState, ErrorState } from '../../shared/components/ui/LoadingComponents';
import { PATHS } from '../../routes/routePaths';
import { devicesMax } from '../../shared/styles/breakpoint';

const DetailCard = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
  margin-top: var(--spacing-xl);
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-lg);
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const DetailLabel = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-600);
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const AmountDisplay = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: ${({ $isCredit }) => 
    $isCredit ? 'var(--color-green-700)' : 'var(--color-red-700)'};
  font-family: var(--font-heading);
  text-align: center;
  padding: var(--spacing-xl);
  background: ${({ $isCredit }) => 
    $isCredit ? 'var(--color-green-50)' : 'var(--color-red-50)'};
  border-radius: var(--border-radius-lg);
  margin: var(--spacing-xl) 0;
  
  @media ${devicesMax.sm} {
    font-size: var(--font-size-2xl);
    padding: var(--spacing-lg);
  }
`;

const DescriptionBox = styled.div`
  padding: var(--spacing-lg);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--color-primary-500);
  margin: var(--spacing-lg) 0;
`;

const DescriptionText = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-grey-700);
  font-family: var(--font-body);
  line-height: 1.6;
  margin: 0;
`;

const LinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-primary-500);
  text-decoration: none;
  font-weight: var(--font-semibold);
  font-family: var(--font-body);
  transition: color var(--transition-base);
  
  &:hover {
    color: var(--color-primary-600);
    text-decoration: underline;
  }
`;

const MetadataSection = styled.div`
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const TransactionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useDynamicPageTitle({
    title: `Transaction Details - EazSeller`,
    description: 'View detailed transaction information',
    defaultTitle: 'Transaction Details • EazSeller',
  });

  const {
    data: transaction,
    isLoading,
    error,
  } = useTransactionById(id);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading transaction details..." />
      </PageContainer>
    );
  }

  if (error || !transaction) {
    return (
      <PageContainer>
        <ErrorState
          title="Transaction not found"
          message={error?.message || 'The transaction you are looking for does not exist'}
          action={
            <Button onClick={() => navigate(PATHS.TRANSACTIONS)}>
              <FaArrowLeft /> Back to Transactions
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const isCredit = isCreditTransaction(transaction);
  const orderRef = getOrderReference(transaction);
  const withdrawalRef = getWithdrawalReference(transaction);
  const orderId = transaction.sellerOrder?.order?._id || transaction.orderId;
  const withdrawalId = transaction.payoutRequest?._id || transaction.payoutRequestId;

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(PATHS.TRANSACTIONS)}
            style={{ marginBottom: 'var(--spacing-md)' }}
          >
            <FaArrowLeft /> Back to Transactions
          </Button>
          <h1>Transaction Details</h1>
          <p>View detailed information about this transaction</p>
        </TitleSection>
      </PageHeader>

      <DetailCard>
        <AmountDisplay $isCredit={isCredit}>
          {formatTransactionAmount(transaction)}
        </AmountDisplay>

        <DetailGrid>
          <DetailItem>
            <DetailLabel>
              <FaTag /> Type
            </DetailLabel>
            <DetailValue>{getTransactionTypeLabel(transaction)}</DetailValue>
          </DetailItem>

          <DetailItem>
            <DetailLabel>
              <FaCheckCircle /> Status
            </DetailLabel>
            <DetailValue>
              <TransactionStatusBadge status={transaction.status} />
            </DetailValue>
          </DetailItem>

          <DetailItem>
            <DetailLabel>
              <FaCalendar /> Date & Time
            </DetailLabel>
            <DetailValue>{formatTransactionDate(transaction.createdAt)}</DetailValue>
          </DetailItem>

          <DetailItem>
            <DetailLabel>
              <FaReceipt /> Transaction ID
            </DetailLabel>
            <DetailValue style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>
              {(transaction._id || transaction.id)?.toString().slice(-12)}
            </DetailValue>
          </DetailItem>
        </DetailGrid>

        <DescriptionBox>
          <DetailLabel style={{ marginBottom: 'var(--spacing-sm)' }}>Description</DetailLabel>
          <DescriptionText>{transaction.description || 'No description available'}</DescriptionText>
        </DescriptionBox>

        {(orderRef || withdrawalRef) && (
          <MetadataSection>
            <DetailLabel style={{ marginBottom: 'var(--spacing-md)' }}>Related References</DetailLabel>
            <MetadataGrid>
              {orderRef && orderId && (
                <DetailItem>
                  <DetailLabel>Order Reference</DetailLabel>
                  <LinkButton to={PATHS.ORDER_DETAIL.replace(':id', orderId)}>
                    {orderRef} →
                  </LinkButton>
                </DetailItem>
              )}
              {withdrawalRef && (
                <DetailItem>
                  <DetailLabel>Withdrawal Reference</DetailLabel>
                  <LinkButton to={PATHS.WITHDRAWALS}>
                    #{withdrawalRef} →
                  </LinkButton>
                </DetailItem>
              )}
            </MetadataGrid>
          </MetadataSection>
        )}

        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
          <MetadataSection>
            <DetailLabel style={{ marginBottom: 'var(--spacing-md)' }}>Additional Information</DetailLabel>
            <MetadataGrid>
              {Object.entries(transaction.metadata).map(([key, value]) => (
                <DetailItem key={key}>
                  <DetailLabel>{key.replace(/([A-Z])/g, ' $1').trim()}</DetailLabel>
                  <DetailValue style={{ fontSize: 'var(--font-size-base)' }}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </DetailValue>
                </DetailItem>
              ))}
            </MetadataGrid>
          </MetadataSection>
        )}
      </DetailCard>
    </PageContainer>
  );
};

export default TransactionDetailPage;

