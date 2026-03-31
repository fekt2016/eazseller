import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 0.65rem 0;
  border-bottom: ${({ $last }) => ($last ? 'none' : '0.5px solid #F1EFE8')};
`;

const Label = styled.div`
  color: #6B7280;
  font-size: 1.2rem;
  min-width: 9rem;
`;

const Value = styled.div`
  color: #111827;
  font-size: 1.3rem;
  font-weight: 500;
  text-align: right;
  white-space: pre-line;
`;

export default function InfoRow({ label, value, last = false, valueAs = null }) {
  return (
    <Row $last={last}>
      <Label>{label}</Label>
      <Value>{valueAs || value || 'Not provided'}</Value>
    </Row>
  );
}

