import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import { devicesMax } from '../../../shared/styles/breakpoint';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border-top: 1px solid var(--color-grey-200);
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;

const PageInfo = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-family: var(--font-body);
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
`;

const PageButton = styled(Button)`
  min-width: 3.2rem;
  padding: var(--spacing-xs) var(--spacing-sm);
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
        <PageInfo style={{ margin: '0 var(--spacing-sm)' }}>
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

