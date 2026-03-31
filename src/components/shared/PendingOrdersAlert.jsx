import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const Wrap = styled.section`
  border: 0.5px solid #FAC775;
  background: #FAEEDA;
  border-radius: 12px;
  padding: 0.9rem;
  display: flex;
  gap: 0.8rem;
`;

const IconWrap = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #FDF3E3;
  color: #E8920A;
`;

const Title = styled.div`
  color: #854F0B;
  font-size: 1.2rem;
  font-weight: 500;
`;

const Body = styled.div`
  color: #854F0B;
  font-size: 1.1rem;
  margin-top: 0.15rem;
`;

const Cta = styled(Link)`
  color: #E8920A;
  font-size: 1.1rem;
  font-weight: 500;
  text-decoration: none;
  margin-top: 0.35rem;
  display: inline-block;
`;

export default function PendingOrdersAlert({ count, to }) {
  if (!count || count <= 0) return null;
  return (
    <Wrap>
      <IconWrap>
        <FaExclamationTriangle size={12} />
      </IconWrap>
      <div>
        <Title>{`${count} orders need attention`}</Title>
        <Body>Review pending and confirmed orders, then prepare dispatch.</Body>
        <Cta to={to}>View attention orders →</Cta>
      </div>
    </Wrap>
  );
}

