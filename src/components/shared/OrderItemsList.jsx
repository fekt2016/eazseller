import styled from 'styled-components';

const Card = styled.section`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.2rem 1.4rem;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr auto;
  gap: 0.8rem;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: ${({ $last }) => ($last ? 'none' : '0.5px solid #F1EFE8')};
`;

const Thumb = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  border: 0.5px solid #F1EFE8;
  background: #F1EFE8;
`;

const Name = styled.div`
  color: #111827;
  font-size: 1.2rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.div`
  color: #6B7280;
  font-size: 1.1rem;
  margin-top: 0.1rem;
`;

const Price = styled.div`
  color: #E8920A;
  font-size: 1.2rem;
  font-weight: 600;
`;

const Placeholder = styled.div`
  color: #6B7280;
  font-size: 1.2rem;
`;

const formatGHS = (value) =>
  `GH₵ ${Number(value || 0).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const resolveImage = (item) =>
  item?.product?.imageCover ||
  item?.product?.images?.[0]?.url ||
  item?.product?.images?.[0] ||
  '';

export default function OrderItemsList({ items = [] }) {
  return (
    <Card>
      <Title>Order items</Title>
      {items.length === 0 ? (
        <Placeholder>No items available</Placeholder>
      ) : (
        items.map((item, index) => {
          const quantity = Number(item?.quantity || 0);
          const unitPrice = Number(item?.price || 0);
          return (
            <Row key={item?._id || `${index}`} $last={index === items.length - 1}>
              <Thumb
                src={resolveImage(item)}
                alt={item?.product?.name || item?.productName || 'Product'}
              />
              <div>
                <Name>{item?.product?.name || item?.productName || 'Product'}</Name>
                <Meta>{`${quantity} × ${formatGHS(unitPrice)}`}</Meta>
              </div>
              <Price>{formatGHS(quantity * unitPrice)}</Price>
            </Row>
          );
        })
      )}
    </Card>
  );
}

