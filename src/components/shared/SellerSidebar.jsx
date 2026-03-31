import { FaStore } from 'react-icons/fa';
import styled from 'styled-components';
import Sidebar from '../../shared/layout/Sidebar';
import { useGetSellerBalance } from '../../shared/hooks/useBalance';
import useAuth from '../../shared/hooks/useAuth';

const Wrapper = styled.div`
  position: relative;
`;

const BalanceChip = styled.div`
  position: absolute;
  top: 68px;
  left: 16px;
  right: 16px;
  border-radius: 10px;
  padding: 0.9rem;
  background: rgba(0, 0, 0, 0.24);
  color: #FFFFFF;
  z-index: 2;
`;

const Label = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Amount = styled.div`
  margin-top: 0.25rem;
  font-size: 1.4rem;
  font-weight: 700;
`;

const Brand = styled.div`
  position: absolute;
  top: 18px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #FFFFFF;
  z-index: 2;
  font-weight: 700;
`;

const formatGHS = (value) =>
  `GH₵ ${Number(value || 0).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function SellerSidebar({ isOpen, onClose }) {
  const { seller } = useAuth();
  const { data: balanceData } = useGetSellerBalance();
  const balance = balanceData?.withdrawableBalance ?? balanceData?.availableBalance ?? 0;

  return (
    <Wrapper>
      <Brand>
        <FaStore size={14} />
        <span>Saiisai</span>
      </Brand>
      <BalanceChip>
        <Label>Available balance</Label>
        <Amount>{formatGHS(balance)}</Amount>
      </BalanceChip>
      <Sidebar role={seller?.role} isOpen={isOpen} onClose={onClose} />
    </Wrapper>
  );
}

