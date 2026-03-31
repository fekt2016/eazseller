import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Wrap = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.2rem;
`;

const Muted = styled(Link)`
  color: #6B7280;
  text-decoration: none;
`;

const Sep = styled.span`
  color: #9CA3AF;
`;

const Current = styled.span`
  color: #111827;
  font-weight: 500;
`;

export default function BreadcrumbNav({ orderNumber, ordersPath = '/dashboard/orders' }) {
  return (
    <Wrap aria-label="Breadcrumb">
      <Muted to={ordersPath}>Orders</Muted>
      <Sep>/</Sep>
      <Current>{orderNumber || 'Order details'}</Current>
    </Wrap>
  );
}

