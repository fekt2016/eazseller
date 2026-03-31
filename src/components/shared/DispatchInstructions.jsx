import styled from 'styled-components';
import { FaTruck } from 'react-icons/fa';

const Wrap = styled.div`
  border: 0.5px solid #FAC775;
  background: #FDF3E3;
  border-radius: 10px;
  padding: 1.2rem 1.4rem;
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
`;

const IconWrap = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: #E8920A;
  color: #FFFFFF;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const Title = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #854F0B;
`;

const Body = styled.div`
  font-size: 1.2rem;
  color: #854F0B;
  margin-top: 0.3rem;
`;

export default function DispatchInstructions({ deliveryMethod }) {
  if (deliveryMethod !== 'dispatch' && deliveryMethod !== 'saiisai_dispatch_rider') {
    return null;
  }

  return (
    <Wrap>
      <IconWrap>
        <FaTruck size={12} />
      </IconWrap>
      <div>
        <Title>Saiisai rider will pick up your item</Title>
        <Body>Have the order ready for pickup.</Body>
      </div>
    </Wrap>
  );
}

