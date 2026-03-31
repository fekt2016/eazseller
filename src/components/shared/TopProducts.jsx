import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { formatGHS } from './CurrencyDisplay';

const Card = styled.section`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr auto auto;
  gap: 0.6rem;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: ${({ $last }) => ($last ? 'none' : '0.5px solid #F1EFE8')};
`;

const Img = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  background: #F1EFE8;
`;

const Name = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Sold = styled.div`
  font-size: 1rem;
  color: #6B7280;
  margin-top: 0.1rem;
`;

const Revenue = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: #E8920A;
`;

const Rank = styled.span`
  font-size: 1rem;
  border-radius: 999px;
  padding: 0.2rem 0.45rem;
  background: ${({ $tone }) =>
    $tone === 'gold' ? '#FDF3E3' : $tone === 'silver' ? '#F1EFE8' : '#FAEEDA'};
  color: ${({ $tone }) =>
    $tone === 'gold' ? '#E8920A' : $tone === 'silver' ? '#6B7280' : '#854F0B'};
`;

const Empty = styled.div`
  border: 0.5px dashed #F1EFE8;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
`;

const EmptyTitle = styled.div`
  color: #6B7280;
  font-size: 1.2rem;
`;

const EmptySub = styled.div`
  color: #6B7280;
  font-size: 1.1rem;
  margin-top: 0.2rem;
`;

const imageFor = (p) =>
  p?.productImage ||
  p?.images?.[0]?.thumbnail ||
  p?.images?.[0]?.url ||
  p?.images?.[0] ||
  '';

export default function TopProducts({ products, hasSales, productsPath }) {
  const list = Array.isArray(products) ? products.slice(0, 5) : [];
  if (!hasSales || list.length === 0) {
    return (
      <Card>
        <Header>
          <Title>Top selling products</Title>
        </Header>
        <Empty>
          <EmptyTitle>No sales data yet.</EmptyTitle>
          <EmptySub>Make your first sale to see top products here.</EmptySub>
        </Empty>
      </Card>
    );
  }

  return (
    <Card>
      <Header>
        <Title>Top selling products</Title>
        <ViewAll to={productsPath}>View all →</ViewAll>
      </Header>
      {list.map((row, index) => {
        const rankTone = index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze';
        return (
          <Row key={String(row?.productId || row?._id || index)} $last={index === list.length - 1}>
            <Img src={imageFor(row)} alt={row?.productName || row?.name || 'Product'} />
            <div>
              <Name>{row?.productName || row?.name || 'Product'}</Name>
              <Sold>{`${Number(row?.totalSold || row?.unitsSold || 0)} sold`}</Sold>
            </div>
            <Revenue>{formatGHS(row?.totalRevenue || row?.revenue || 0)}</Revenue>
            {index < 3 ? <Rank $tone={rankTone}>{`#${index + 1}`}</Rank> : <span />}
          </Row>
        );
      })}
    </Card>
  );
}

