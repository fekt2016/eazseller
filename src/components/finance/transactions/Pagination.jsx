import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import { devicesMax } from '../../../shared/styles/breakpoint';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #FFFFFF;
  border-top: 1px solid #F1EFE8;
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    gap: 1rem;
  }
`;

const PageInfo = styled.div`
  font-size: 0.875rem;
  color: #6B7280;
  
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const PageButton = styled(Button)`
  min-width: 3.2rem;
  padding: 1rem 1rem;
`;

const Pagination = ({ 
  currentPage, 
  totalPages, 
  total, 
  limit, 
  onPageChange 
}) => {
  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <PaginationContainer>
      <PageInfo>
        Showing {startItem} to {endItem} of {total} transactions
      </PageInfo>
      <PaginationButtons>
        <PageButton
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </PageButton>
        <PageInfo style={{ margin: '0 1rem' }}>
          Page {currentPage} of {totalPages}
        </PageInfo>
        <PageButton
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </PageButton>
      </PaginationButtons>
    </PaginationContainer>
  );
};

export default Pagination;

