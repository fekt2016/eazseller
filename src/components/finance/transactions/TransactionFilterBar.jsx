import { useState } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import { devicesMax } from '../../../shared/styles/breakpoint';

const FilterContainer = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
  margin-bottom: var(--spacing-xl);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-family: var(--font-body);
`;

const Select = styled.select`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background: var(--color-white-0);
  transition: all var(--transition-base);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
`;

const Input = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background: var(--color-white-0);
  transition: all var(--transition-base);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
`;

const SearchInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  input {
    padding-left: var(--spacing-3xl);
    width: 100%;
  }
  
  svg {
    position: absolute;
    left: var(--spacing-md);
    color: var(--color-grey-400);
    pointer-events: none;
  }
`;

const DateRangeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ClearButton = styled(Button)`
  @media ${devicesMax.sm} {
    width: 100%;
  }
`;

const TransactionFilterBar = ({ filters, onFilterChange, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleClear = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    if (onClear) {
      onClear();
    }
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const hasActiveFilters = Object.values(localFilters).some(v => v && v !== '');

  return (
    <FilterContainer>
      <FilterGrid>
        <FilterGroup>
          <Label>Transaction Type</Label>
          <Select
            value={localFilters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <Label>Status</Label>
          <Select
            value={localFilters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <Label>Date Range</Label>
          <DateRangeGroup>
            <Input
              type="date"
              value={localFilters.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              placeholder="Start Date"
            />
            <Input
              type="date"
              value={localFilters.endDate || ''}
              onChange={(e) => handleChange('endDate', e.target.value)}
              placeholder="End Date"
            />
          </DateRangeGroup>
        </FilterGroup>

        <FilterGroup>
          <Label>Search</Label>
          <SearchInput>
            <FaSearch />
            <Input
              type="text"
              placeholder="Search by description or reference..."
              value={localFilters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </SearchInput>
        </FilterGroup>
      </FilterGrid>

      <ActionsBar>
        <div>
          {hasActiveFilters && (
            <ClearButton
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              <FaTimes /> Clear Filters
            </ClearButton>
          )}
        </div>
      </ActionsBar>
    </FilterContainer>
  );
};

export default TransactionFilterBar;

