import { useState } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import { devicesMax } from '../../../shared/styles/breakpoint';

const FilterContainer = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 1rem;
  
  border: 1px solid #F1EFE8;
  margin-bottom: 1rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  
`;

const Select = styled.select`
  padding: 1rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 1rem;
  
  color: #111827;
  background: #FFFFFF;
  transition: all 0.12s;
  
  &:focus {
    outline: none;
    border-color: #E8920A;
    box-shadow: 0 0 0 3px #E8920A;
  }
`;

const Input = styled.input`
  padding: 1rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 1rem;
  
  color: #111827;
  background: #FFFFFF;
  transition: all 0.12s;
  
  &:focus {
    outline: none;
    border-color: #E8920A;
    box-shadow: 0 0 0 3px #E8920A;
  }
`;

const SearchInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  input {
    padding-left: 1rem;
    width: 100%;
  }
  
  svg {
    position: absolute;
    left: 1rem;
    color: #D1D5DB;
    pointer-events: none;
  }
`;

const DateRangeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
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

