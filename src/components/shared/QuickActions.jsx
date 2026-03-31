import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Card = styled.section`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const Header = styled.h3`
  padding: 0.9rem 1rem;
  border-bottom: 0.5px solid #F1EFE8;
  font-size: 1.3rem;
  font-weight: 500;
  color: #111827;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const Item = styled(Link)`
  min-height: 72px;
  border-right: 0.5px solid #F1EFE8;
  border-bottom: 0.5px solid #F1EFE8;
  padding: 0.8rem;
  text-decoration: none;
  color: #111827;
  transition: background 0.2s ease;

  &:nth-child(2n) {
    border-right: none;
  }

  &:nth-last-child(-n + 2) {
    border-bottom: none;
  }

  &:hover {
    background: #FDF3E3;
  }
`;

const IconBox = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: grid;
  place-items: center;
  margin-bottom: 0.4rem;
`;

const Label = styled.div`
  font-size: 1.1rem;
  color: #6B7280;
`;

export default function QuickActions({ actions }) {
  return (
    <Card>
      <Header>Quick actions</Header>
      <Grid>
        {actions.map((action) => (
          <Item key={action.label} to={action.to}>
            <IconBox $bg={action.toneBg} $color={action.toneColor}>
              {action.icon}
            </IconBox>
            <Label>{action.label}</Label>
          </Item>
        ))}
      </Grid>
    </Card>
  );
}

