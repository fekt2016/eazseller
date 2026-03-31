import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { formatGHS, formatOrderDate, formatOrderNumber } from '../../shared/utils/dashboardFormatters';
import StatusBadge from './StatusBadge';

const Card = styled.section`
  margin-top: 0.9rem;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.7rem;
`;

const Title = styled.h3`
  font-size: 1.3rem;
  font-weight: 500;
  color: #111827;
`;

const ViewAll = styled(Link)`
  font-size: 1.1rem;
  color: #E8920A;
  text-decoration: none;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.45rem 0.4rem;
  font-size: 1rem;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
  border-bottom: 0.5px solid #F1EFE8;
`;

const Td = styled.td`
  padding: 0.7rem 0.4rem;
  font-size: 1.2rem;
  color: #111827;
  border-bottom: 0.5px solid #F1EFE8;
`;

const Row = styled.tr`
  transition: background 0.2s ease;

  &:hover {
    background: #FDF3E3;
  }

  &:last-child td {
    border-bottom: none;
  }
`;

const OrderLink = styled(Link)`
  color: #185FA5;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-decoration: none;
`;

const Amount = styled.span`
  color: #E8920A;
  font-weight: 500;
`;

const Empty = styled.div`
  border: 0.5px dashed #F1EFE8;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  color: #6B7280;
  font-size: 1.2rem;
`;

const EmptyTitle = styled.div`
  color: #111827;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

export default function RecentOrdersTable({ orders, ordersPath, orderDetailPath }) {
  const getDisplayStatus = (order) => {
    const paymentStatus = (order?.paymentStatus || '').toString().toLowerCase();
    const rawStatus = (
      order?.status ||
      order?.currentStatus ||
      order?.orderStatus ||
      'pending'
    ).toString().toLowerCase();

    const isPaymentConfirmed =
      paymentStatus === 'paid' || paymentStatus === 'completed';
    if (isPaymentConfirmed && (rawStatus === 'pending' || rawStatus === 'pending_payment' || rawStatus === 'cancelled')) {
      return 'processing';
    }

    return rawStatus;
  };

  if (!orders?.length) {
    return (
      <Card>
        <Header>
          <Title>Recent orders</Title>
        </Header>
        <Empty>
          <EmptyTitle>No orders yet</EmptyTitle>
          <div>Orders from buyers will appear here</div>
          <ViewAll to={ordersPath}>View all orders</ViewAll>
        </Empty>
      </Card>
    );
  }

  return (
    <Card>
      <Header>
        <Title>Recent orders</Title>
        <ViewAll to={ordersPath}>View all →</ViewAll>
      </Header>
      <Table>
        <thead>
          <tr>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Date</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const id = order?._id || order?.id;
            const number = formatOrderNumber(order?.orderNumber, id);
            const customer = order?.user?.name || order?.buyer?.name || 'Not provided';
            const amount = Number(order?.amount ?? order?.total ?? order?.subtotal ?? 0);
            const status = getDisplayStatus(order);
            const to = orderDetailPath.replace(':id', id);
            return (
              <Row key={id}>
                <Td>
                  <OrderLink to={to}>{number}</OrderLink>
                </Td>
                <Td>{customer}</Td>
                <Td>{formatOrderDate(order?.createdAt)}</Td>
                <Td>
                  <Amount>{formatGHS(amount)}</Amount>
                </Td>
                <Td>
                  <StatusBadge status={status} />
                </Td>
              </Row>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
}

