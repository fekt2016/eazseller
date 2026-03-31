import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaMoneyBillWave, FaHistory, FaCreditCard, FaReceipt, FaChevronRight } from 'react-icons/fa';
import { PATHS } from '../../routes/routePaths';

const Panel = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const PanelTitle = styled.div`
  padding: 0.85rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  border-bottom: 0.5px solid #F1EFE8;
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActionItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1.1rem;
  text-decoration: none;
  border-bottom: 0.5px solid #F1EFE8;
  transition: background 0.12s;
  cursor: ${(p) => p.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${(p) => p.$disabled ? 0.45 : 1};
  pointer-events: ${(p) => p.$disabled ? 'none' : 'auto'};

  &:last-child { border-bottom: none; }
  &:hover { background: #FFFDF9; }
`;

const ActionIconWrap = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${(p) => p.$primary ? '#FDF3E3' : '#F9F8F5'};
  color: ${(p) => p.$primary ? '#E8920A' : '#6B7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
`;

const ActionLabel = styled.span`
  flex: 1;
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
`;

const ChevronIcon = styled(FaChevronRight)`
  font-size: 0.65rem;
  color: #D1D5DB;
`;

const ACTIONS = [
  { label: 'Request Withdrawal', icon: <FaMoneyBillWave />, to: PATHS.WITHDRAWALS, primary: true, requiresBalance: true },
  { label: 'View History', icon: <FaHistory />, to: PATHS.WITHDRAWALS },
  { label: 'Payment Methods', icon: <FaCreditCard />, to: PATHS.PAYMENT_METHODS },
  { label: 'All Transactions', icon: <FaReceipt />, to: PATHS.TRANSACTIONS },
];

const QuickActionsPanel = ({ availableBalance }) => {
  return (
    <Panel>
      <PanelTitle>Quick Actions</PanelTitle>
      <ActionsList>
        {ACTIONS.map((action) => (
          <ActionItem
            key={action.label}
            to={action.to}
            $disabled={action.requiresBalance && availableBalance <= 0}
          >
            <ActionIconWrap $primary={action.primary}>{action.icon}</ActionIconWrap>
            <ActionLabel>{action.label}</ActionLabel>
            <ChevronIcon />
          </ActionItem>
        ))}
      </ActionsList>
    </Panel>
  );
};

export default QuickActionsPanel;
