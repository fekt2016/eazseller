import styled from 'styled-components';

const Card = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
`;

const Label = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #9CA3AF;
  line-height: 1.3;
`;

const IconWrap = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #FDF3E3;
  color: #E8920A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
`;

const Amount = styled.div`
  font-size: 2.25rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  letter-spacing: -0.03em;
`;

const BalanceSummaryCard = ({ label, amount, icon }) => {
  return (
    <Card>
      <CardTop>
        <Label>{label}</Label>
        {icon && <IconWrap>{icon}</IconWrap>}
      </CardTop>
      <Amount>
        GH₵{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Amount>
    </Card>
  );
};

export default BalanceSummaryCard;
