import React from 'react';
import styled from 'styled-components';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import { formatDate } from '../../../shared/utils/helpers';
import { devicesMax } from '../../../shared/styles/breakpoint';

/**
 * Return List Table Component
 * Displays returns in a responsive table format
 */
const ReturnListTable = ({ returns, onView, onApprove, onReject, isLoading = false }) => {
  if (isLoading) {
    return <LoadingMessage>Loading returns...</LoadingMessage>;
  }

  if (!returns || returns.length === 0) {
    return <EmptyMessage>No returns found</EmptyMessage>;
  }

  return (
    <TableContainer>
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableHeader>Order ID</TableHeader>
            <TableHeader>Product</TableHeader>
            <TableHeader>Buyer</TableHeader>
            <TableHeader>Quantity</TableHeader>
            <TableHeader>Reason</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Date Requested</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {returns.map((returnItem) => (
            <TableRow key={returnItem._id}>
              <TableCell>
                #{returnItem.order?.orderNumber || returnItem.orderId?.slice(-8) || 'N/A'}
              </TableCell>
              <TableCell>
                <ProductInfo>
                  {returnItem.product?.name || returnItem.productName || 'N/A'}
                </ProductInfo>
              </TableCell>
              <TableCell>
                {returnItem.buyer?.name || returnItem.user?.name || 'N/A'}
              </TableCell>
              <TableCell>{returnItem.quantity || 1}</TableCell>
              <TableCell>
                <ReasonText>
                  {returnItem.reason?.substring(0, 30) || 'No reason provided'}
                  {returnItem.reason?.length > 30 && '...'}
                </ReasonText>
              </TableCell>
              <TableCell>
                <StatusBadge $status={returnItem.status?.toLowerCase()}>
                  {returnItem.status || 'PENDING'}
                </StatusBadge>
              </TableCell>
              <TableCell>{formatDate(returnItem.createdAt)}</TableCell>
              <TableCell>
                <ActionButtons>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(returnItem)}
                    title="View Details"
                  >
                    <FaEye /> View
                  </Button>
                  {returnItem.status === 'PENDING' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onApprove(returnItem)}
                        title="Approve Return"
                      >
                        <FaCheck /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReject(returnItem)}
                        title="Reject Return"
                      >
                        <FaTimes /> Reject
                      </Button>
                    </>
                  )}
                </ActionButtons>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>

      {/* Mobile Card View */}
      <MobileCardList>
        {returns.map((returnItem) => (
          <MobileCard key={returnItem._id}>
            <CardHeader>
              <CardTitle>
                Order #{returnItem.order?.orderNumber || returnItem.orderId?.slice(-8) || 'N/A'}
              </CardTitle>
              <StatusBadge $status={returnItem.status?.toLowerCase()}>
                {returnItem.status || 'PENDING'}
              </StatusBadge>
            </CardHeader>
            <CardContent>
              <InfoRow>
                <InfoLabel>Product:</InfoLabel>
                <InfoValue>{returnItem.product?.name || returnItem.productName || 'N/A'}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Buyer:</InfoLabel>
                <InfoValue>{returnItem.buyer?.name || returnItem.user?.name || 'N/A'}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Quantity:</InfoLabel>
                <InfoValue>{returnItem.quantity || 1}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Reason:</InfoLabel>
                <InfoValue>
                  {returnItem.reason?.substring(0, 50) || 'No reason provided'}
                  {returnItem.reason?.length > 50 && '...'}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Date:</InfoLabel>
                <InfoValue>{formatDate(returnItem.createdAt)}</InfoValue>
              </InfoRow>
            </CardContent>
            <CardActions>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(returnItem)}
                style={{ width: '100%' }}
              >
                <FaEye /> View Details
              </Button>
              {returnItem.status === 'PENDING' && (
                <ActionGroup>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onApprove(returnItem)}
                    style={{ flex: 1 }}
                  >
                    <FaCheck /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(returnItem)}
                    style={{ flex: 1 }}
                  >
                    <FaTimes /> Reject
                  </Button>
                </ActionGroup>
              )}
            </CardActions>
          </MobileCard>
        ))}
      </MobileCardList>
    </TableContainer>
  );
};

export default ReturnListTable;

// Styled Components
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;

  @media ${devicesMax.md} {
    display: none;
  }
`;

const TableHead = styled.thead`
  background-color: var(--color-grey-50);
  border-bottom: 2px solid var(--color-grey-200);
`;

const TableHeader = styled.th`
  padding: var(--spacing-md);
  text-align: left;
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-grey-200);
  transition: background-color var(--transition-base);

  &:hover {
    background-color: var(--color-grey-50);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
`;

const ProductInfo = styled.div`
  font-weight: var(--font-medium);
  color: var(--color-grey-900);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ReasonText = styled.span`
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-cir);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  white-space: nowrap;

  background-color: ${({ $status }) => {
    switch ($status) {
      case 'approved':
      case 'refunded':
        return 'var(--color-green-100)';
      case 'pending':
        return 'var(--color-yellow-100)';
      case 'rejected':
        return 'var(--color-red-100)';
      default:
        return 'var(--color-grey-100)';
    }
  }};

  color: ${({ $status }) => {
    switch ($status) {
      case 'approved':
      case 'refunded':
        return 'var(--color-green-700)';
      case 'pending':
        return 'var(--color-yellow-700)';
      case 'rejected':
        return 'var(--color-red-700)';
      default:
        return 'var(--color-grey-700)';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  flex-wrap: wrap;
`;

const LoadingMessage = styled.div`
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-grey-600);
  font-size: var(--font-size-md);
`;

const EmptyMessage = styled.div`
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-grey-600);
  font-size: var(--font-size-md);
`;

// Mobile Styles
const MobileCardList = styled.div`
  display: none;

  @media ${devicesMax.md} {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
`;

const MobileCard = styled.div`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-grey-200);
`;

const CardTitle = styled.h4`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
`;

const InfoLabel = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  min-width: 80px;
`;

const InfoValue = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-900);
  text-align: right;
  flex: 1;
`;

const CardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const ActionGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

