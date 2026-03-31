import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { FaUndo, FaFilter } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import {
  PageContainer,
  PageHeader,
  TitleSection,
  Section,
  SectionHeader,
} from '../../../shared/components/ui/SpacingSystem';
import Button from '../../../shared/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/components/ui/LoadingComponents';
import { useSellerReturns } from '../hooks/useSellerReturns';
import ReturnListTable from '../components/ReturnListTable';
import ReturnDetailModal from '../components/ReturnDetailModal';
import useDynamicPageTitle from '../../../shared/hooks/useDynamicPageTitle';

/**
 * Seller Returns Management Page
 * Allows sellers to view, approve, and reject return requests
 */
const SellerReturnAndFundsPage = () => {
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [lastAutoOpenOrderId, setLastAutoOpenOrderId] = useState(null);
  const [searchParams] = useSearchParams();

  const { getAllSellerReturns, approveReturn, rejectReturn } = useSellerReturns();
  const { data: returnsData, isLoading, error } = getAllSellerReturns({ status: statusFilter });
  
  // Extract returns array from response - handle both direct array and nested structure
  const returns = Array.isArray(returnsData) ? returnsData : (returnsData?.refunds || returnsData?.returns || []);
  const approveMutation = approveReturn();
  const rejectMutation = rejectReturn();

  useDynamicPageTitle({
    title: 'Returns Management - Saiisai Seller',
    description: 'Manage return requests from buyers',
    defaultTitle: 'Returns Management - Saiisai Seller',
  });

  // Filter returns by status
  const filteredReturns = useMemo(() => {
    if (!statusFilter) return returns;
    return returns.filter((ret) => ret.status?.toUpperCase() === statusFilter.toUpperCase());
  }, [returns, statusFilter]);

  // When navigated from Orders page with ?orderId=..., auto-open the first matching return detail
  useEffect(() => {
    const orderIdFromQuery = searchParams.get('orderId');
    if (
      !orderIdFromQuery ||
      orderIdFromQuery === lastAutoOpenOrderId ||
      isModalOpen ||
      selectedReturn ||
      !Array.isArray(filteredReturns)
    )
      return;

    const match = filteredReturns.find((ret) => {
      const retOrderId = ret.orderId || ret.order?._id || ret.order;
      return retOrderId && String(retOrderId) === String(orderIdFromQuery);
    });

    if (match) {
      setSelectedReturn(match);
      setIsModalOpen(true);
      setLastAutoOpenOrderId(orderIdFromQuery);
    }
  }, [searchParams, filteredReturns, isModalOpen, selectedReturn, lastAutoOpenOrderId]);

  const handleViewReturn = (returnItem) => {
    setSelectedReturn(returnItem);
    setIsModalOpen(true);
  };

  const handleApproveReturn = async (returnItem, approvalData = {}) => {
    try {
      const { resolutionType = 'refund', resolutionNote } = approvalData;
      const refundRequestId = returnItem.returnId || returnItem._id;
      await approveMutation.mutateAsync({
        returnId: refundRequestId,
        data: {
          notes: resolutionNote || '',
          resolutionType,
          ...(resolutionNote && { resolutionNote }),
        },
      });
      setIsModalOpen(false);
      setSelectedReturn(null);
    } catch (error) {
      console.error('Error approving return:', error);
      // Error is handled by the mutation
    }
  };

  const handleRejectReturn = async (returnItem, data = {}) => {
    try {
      const refundRequestId = returnItem.returnId || returnItem._id;
      await rejectMutation.mutateAsync({
        returnId: refundRequestId,
        data,
      });
      setIsModalOpen(false);
      setSelectedReturn(null);
    } catch (error) {
      console.error('Error rejecting return:', error);
      // Error is handled by the mutation
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReturn(null);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading returns..." />;
  }

  // Error state
  if (error) {
    return <ErrorState message="Failed to load returns. Please try again." />;
  }

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Returns Management</h1>
          <p>Review and manage return requests from buyers</p>
        </TitleSection>
      </PageHeader>

      {/* Filters Section */}
      <FilterSection>
        <FilterCard>
          <FilterGroup>
            <FilterLabel>
              <FaFilter /> Filter by Status:
            </FilterLabel>
            <FilterSelect
              value={statusFilter}
              onChange={handleFilterChange}
            >
              <option value="">All Returns</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REFUNDED">Refunded</option>
            </FilterSelect>
          </FilterGroup>
        </FilterCard>
      </FilterSection>

      {/* Returns Table Section */}
      <Section $marginBottom="lg">
        <SectionHeader $padding="md" $marginBottom="md">
          <h3>
            <FaUndo /> Return Requests ({filteredReturns.length})
          </h3>
        </SectionHeader>
        {filteredReturns.length === 0 ? (
          <EmptyState message="No returns found matching your criteria." />
        ) : (
          <ReturnListTable
            returns={filteredReturns}
            onView={handleViewReturn}
            onApprove={handleApproveReturn}
            onReject={handleRejectReturn}
            isLoading={isLoading}
          />
        )}
      </Section>

      {/* Return Detail Modal */}
      <ReturnDetailModal
        returnItem={selectedReturn}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApproveReturn}
        onReject={handleRejectReturn}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    </PageContainer>
  );
};

export default SellerReturnAndFundsPage;

// Styled Components
const FilterSection = styled.div`
  margin-bottom: 1rem;
`;

const FilterCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 1rem;
  
  border: 1px solid #F1EFE8;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;

  svg {
    color: #E8920A;
  }
`;

const FilterSelect = styled.select`
  padding: 1rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 0.875rem;
  color: #111827;
  background-color: #FFFFFF;
  min-width: 200px;
  transition: all 0.12s;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #E8920A;
    box-shadow: 0 0 0 3px #FEF3C7;
  }

  &:hover {
    border-color: #D1D5DB;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
`;
