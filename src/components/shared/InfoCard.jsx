import styled from 'styled-components';

const Card = styled.section`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.6rem 1.8rem;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  color: #111827;
`;

const IconWrap = styled.span`
  color: #E8920A;
  display: inline-flex;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export default function InfoCard({ icon, title, children }) {
  return (
    <Card>
      <Header>
        <IconWrap>{icon}</IconWrap>
        <Title>{title}</Title>
      </Header>
      {children}
    </Card>
  );
}

