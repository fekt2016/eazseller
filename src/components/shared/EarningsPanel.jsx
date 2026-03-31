import styled from 'styled-components';

const Card = styled.section`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.6rem;
`;

const Heading = styled.h4`
  color: #6B7280;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.8rem;
`;

const Amount = styled.div`
  color: #E8920A;
  font-size: 2.6rem;
  font-weight: 500;
  line-height: 1.1;
`;

const Sub = styled.div`
  color: #6B7280;
  margin-top: 0.2rem;
  font-size: 1.2rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0;
  font-size: 1.3rem;
  color: #374151;
`;

const Divider = styled.hr`
  border: none;
  border-top: 0.5px solid #F1EFE8;
  margin: 0.4rem 0;
`;

const Net = styled(Row)`
  font-weight: 600;
  color: #3B6D11;
`;

const RowsWrap = styled.div`
  margin-top: 1rem;
`;

const Skeleton = styled.div`
  height: ${({ $h }) => $h || '14px'};
  width: ${({ $w }) => $w || '100%'};
  border-radius: 6px;
  background: #F1EFE8;
  margin: 0.6rem 0;
  animation: pulse 1.2s ease-in-out infinite;

  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 0.9; }
    100% { opacity: 0.5; }
  }
`;

const formatGHS = (value) =>
  `GH₵ ${Number(value || 0).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function EarningsPanel({ earnings, isLoading = false }) {
  if (isLoading) {
    return (
      <Card>
        <Heading>Your earnings</Heading>
        <Skeleton $h="36px" $w="70%" />
        <Skeleton $w="55%" />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </Card>
    );
  }

  const itemTotal = Number(
    earnings?.itemTotal ??
      earnings?.totalBasePrice ??
      earnings?.grossEarnings ??
      0
  );
  const platformFeePercent = Number(
    earnings?.platformFeePercent ??
      earnings?.commissionRatePercent ??
      0
  );
  const platformFeeAmount = Number(
    earnings?.platformFeeAmount ??
      earnings?.commissionAmount ??
      0
  );
  const netPayout = Number(
    earnings?.netPayout ??
      earnings?.netEarnings ??
      earnings?.payoutAmount ??
      itemTotal - platformFeeAmount
  );

  return (
    <Card>
      <Heading>Your earnings</Heading>
      <Amount>{formatGHS(netPayout)}</Amount>
      <Sub>{`After ${platformFeePercent}% platform fee`}</Sub>
      <RowsWrap>
        <Row>
          <span>Item total</span>
          <span>{formatGHS(itemTotal)}</span>
        </Row>
        <Row>
          <span>{`Platform fee (${platformFeePercent}%)`}</span>
          <span>{formatGHS(platformFeeAmount)}</span>
        </Row>
        <Divider />
        <Net>
          <span>Net payout</span>
          <span>{formatGHS(netPayout)}</span>
        </Net>
      </RowsWrap>
    </Card>
  );
}

