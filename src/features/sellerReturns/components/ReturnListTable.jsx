import React from 'react';
import styled from 'styled-components';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import { formatDate } from '../../../shared/utils/helpers';
import { devicesMax } from '../../../shared/styles/breakpoint';

// Format refund reason code for display (e.g. not_as_described -> Not as described)
const formatReasonLabel = (reason) => {
  if (!reason) return 'No reason provided';
  const label = String(reason)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return label.length > 30 ? `${label.substring(0, 30)}...` : label;
};

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
                <ReasonText title={returnItem.reason}>
                  {formatReasonLabel(returnItem.reason)}
                </ReasonText>
              </TableCell>
              <TableCell>
                <StatusBadge $status={(returnItem.status || 'PENDING').toLowerCase()}>
                  {(returnItem.status || 'PENDING').charAt(0).toUpperCase() + (returnItem.status || 'PENDING').slice(1).toLowerCase()}
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
                <InfoValue>{formatReasonLabel(returnItem.reason)}</InfoValue>
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
  background: #FFFFFF;
  border-radius: 12px;
  
  border: 1px solid #F1EFE8;
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
  background-color: #F9F8F5;
  border-bottom: 2px solid #F1EFE8;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #F1EFE8;
  transition: background-color 0.12s;

  &:hover {
    background-color: #F9F8F5;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
`;

const ProductInfo = styled.div`
  font-weight: 500;
  color: #111827;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ReasonText = styled.span`
  color: #6B7280;
  font-size: 0.875rem;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1rem 1rem;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;

  background-color: ${({ $status }) => {
    switch ($status) {
      case 'approved':
      case 'refunded':
        return '#DCFCE7';
      case 'pending':
      case 'requested':
        return '#FAEEDA';
      case 'rejected':
        return '#FCEBEB';
      case 'seller_review':
      case 'admin_review':
        return '#E6F1FB';
      default:
        return '#F9F8F5';
    }
  }};

  color: ${({ $status }) => {
    switch ($status) {
      case 'approved':
      case 'refunded':
        return '#3B6D11';
      case 'pending':
      case 'requested':
        return '#854F0B';
      case 'rejected':
        return '#A32D2D';
      case 'seller_review':
      case 'admin_review':
        return '#185FA5';
      default:
        return '#374151';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const LoadingMessage = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6B7280;
  font-size: 0.9rem;
`;

const EmptyMessage = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6B7280;
  font-size: 0.9rem;
`;

// Mobile Styles
const MobileCardList = styled.div`
  display: none;

  @media ${devicesMax.md} {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
`;

const MobileCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem;
  
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #F1EFE8;
`;

const CardTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  min-width: 80px;
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  color: #111827;
  text-align: right;
  flex: 1;
`;

const CardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

