import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../../shared/components/ui/Button';
import { FaMoneyBillWave, FaHistory, FaCreditCard, FaReceipt } from 'react-icons/fa';
import { PATHS } from '../../routes/routePaths';
import { devicesMax } from '../../shared/styles/breakpoint';

const Panel = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-lg);
  }
`;

const Title = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-lg);
  font-family: var(--font-heading);
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled(Button)`
  width: 100%;
  justify-content: center;
`;

const QuickActionsPanel = ({ availableBalance }) => {
  return (
    <Panel>
      <Title>Quick Actions</Title>
      <ActionsGrid>
        <ActionButton
          as={Link}
          to={PATHS.WITHDRAWALS}
          variant="primary"
          size="lg"
          disabled={availableBalance <= 0}
        >
          <FaMoneyBillWave /> Request Withdrawal
        </ActionButton>
        <ActionButton
          as={Link}
          to={PATHS.WITHDRAWALS}
          variant="outline"
          size="lg"
        >
          <FaHistory /> View History
        </ActionButton>
        <ActionButton
          as={Link}
          to={PATHS.PAYMENT_METHODS}
          variant="outline"
          size="lg"
        >
          <FaCreditCard /> Payment Methods
        </ActionButton>
        <ActionButton
          as={Link}
          to={PATHS.TRANSACTIONS}
          variant="outline"
          size="lg"
        >
          <FaReceipt /> View All Transactions
        </ActionButton>
      </ActionsGrid>
    </Panel>
  );
};

export default QuickActionsPanel;

