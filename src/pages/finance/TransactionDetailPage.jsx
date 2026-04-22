import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaReceipt, FaCalendar, FaTag, FaCheckCircle } from 'react-icons/fa';
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
import Button from '../../shared/components/ui/Button';
import TransactionStatusBadge from '../../components/finance/transactions/TransactionStatusBadge';
import { SkeletonTableRows, ErrorState } from '../../shared/components/ui/LoadingComponents';
import { PATHS } from '../../routes/routePaths';

const TransactionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Use transaction passed via navigation state immediately (already loaded in list)
  const stateTransaction = location.state?.transaction;

  useDynamicPageTitle({
    title: `Transaction Details - Saiisai Seller`,
    description: 'View detailed transaction information',
    defaultTitle: 'Transaction Details • Saiisai Seller',
  });

  const {
    data: fetchedTransaction,
    isLoading,
    error,
  } = useTransactionById(stateTransaction ? null : id);

  const transaction = stateTransaction || fetchedTransaction;

  if (!stateTransaction && isLoading) {
    return (
      <Page>
        <SkeletonTableRows count={5} />
      </Page>
    );
  }

  if (error || !transaction) {
    return (
      <Page>
        <ErrorState
          title="Transaction not found"
          message={error?.message || 'The transaction you are looking for does not exist'}
          action={
            <Button onClick={() => navigate(PATHS.TRANSACTIONS)}>
              <FaArrowLeft /> Back to Transactions
            </Button>
          }
        />
      </Page>
    );
  }

  const isCredit = isCreditTransaction(transaction);
  const orderRef = getOrderReference(transaction);
  const withdrawalRef = getWithdrawalReference(transaction);
  const orderId = transaction.sellerOrder?.order?._id || transaction.orderId;

  return (
    <Page>
      {/* Header */}
      <Header>
        <BackBtn onClick={() => navigate(PATHS.TRANSACTIONS)}>
          <FaArrowLeft size={11} /> Back to Transactions
        </BackBtn>
        <div>
          <PageTitle>Transaction Details</PageTitle>
          <PageSub>View detailed information about this transaction</PageSub>
        </div>
      </Header>

      {/* Amount hero */}
      <AmountCard $isCredit={isCredit}>
        <AmountValue $isCredit={isCredit}>
          {formatTransactionAmount(transaction)}
        </AmountValue>
        <TransactionStatusBadge status={transaction.status} />
      </AmountCard>

      {/* Detail fields */}
      <DetailCard>
        <DetailGrid>
          <DetailItem>
            <DetailLabel><FaTag size={10} /> Type</DetailLabel>
            <DetailValue>{getTransactionTypeLabel(transaction)}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel><FaCalendar size={10} /> Date & Time</DetailLabel>
            <DetailValue>{formatTransactionDate(transaction.createdAt)}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel><FaReceipt size={10} /> Transaction ID</DetailLabel>
            <DetailValue $mono>
              {(transaction._id || transaction.id)?.toString().slice(-12)}
            </DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel><FaCheckCircle size={10} /> Status</DetailLabel>
            <DetailValue>
              <TransactionStatusBadge status={transaction.status} />
            </DetailValue>
          </DetailItem>
        </DetailGrid>

        <Divider />

        <SectionLabel>Description</SectionLabel>
        <DescriptionText>
          {transaction.description || 'No description available'}
        </DescriptionText>

        {(orderRef || withdrawalRef) && (
          <>
            <Divider />
            <SectionLabel>Related References</SectionLabel>
            <RefsGrid>
              {orderRef && orderId && (
                <DetailItem>
                  <DetailLabel>Order Reference</DetailLabel>
                  <RefLink to={PATHS.ORDER_DETAIL.replace(':id', orderId)}>
                    {orderRef} →
                  </RefLink>
                </DetailItem>
              )}
              {withdrawalRef && (
                <DetailItem>
                  <DetailLabel>Withdrawal Reference</DetailLabel>
                  <RefLink to={PATHS.WITHDRAWALS}>
                    #{withdrawalRef} →
                  </RefLink>
                </DetailItem>
              )}
            </RefsGrid>
          </>
        )}

        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
          <>
            <Divider />
            <SectionLabel>Additional Information</SectionLabel>
            <RefsGrid>
              {Object.entries(transaction.metadata).map(([key, value]) => (
                <DetailItem key={key}>
                  <DetailLabel>{key.replace(/([A-Z])/g, ' $1').trim()}</DetailLabel>
                  <DetailValue>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </DetailValue>
                </DetailItem>
              ))}
            </RefsGrid>
          </>
        )}
      </DetailCard>
    </Page>
  );
};

export default TransactionDetailPage;

/* ─── Styled Components ─────────────────────────────────────────────────────── */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const Header = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 30px;
  padding: 0 0.85rem;
  background: #F9F8F5;
  border: 0.5px solid #F1EFE8;
  border-radius: 8px;
  font-size: 0.775rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.12s;

  &:hover { border-color: #E8920A; color: #E8920A; background: #FDF3E3; }
`;

const PageTitle = styled.h1`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.1rem;
`;

const PageSub = styled.p`
  font-size: 0.8rem;
  color: #9CA3AF;
  margin: 0;
`;

const AmountCard = styled.div`
  background: ${({ $isCredit }) => $isCredit ? '#F0FDF4' : '#FEF2F2'};
  border-radius: 12px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const AmountValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  color: ${({ $isCredit }) => $isCredit ? '#15803D' : '#DC2626'};
`;

const DetailCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.25rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const DetailLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const DetailValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  font-family: ${({ $mono }) => $mono ? "ui-monospace, 'Courier New', monospace" : 'inherit'};
`;

const Divider = styled.div`
  border-top: 0.5px solid #F1EFE8;
  margin: 1rem 0;
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.6rem;
`;

const DescriptionText = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  line-height: 1.6;
  margin: 0;
`;

const RefsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const RefLink = styled(Link)`
  font-size: 0.825rem;
  font-weight: 600;
  color: #E8920A;
  text-decoration: none;

  &:hover { text-decoration: underline; }
`;
