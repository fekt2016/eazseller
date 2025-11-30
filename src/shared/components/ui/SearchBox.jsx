import styled from "styled-components";
import { FaSearch } from "react-icons/fa";

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all 0.2s ease;
  flex: 1;
  max-width: 400px;
  
  &:focus-within {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
`;

const SearchIcon = styled(FaSearch)`
  color: var(--color-grey-400);
  margin-right: var(--spacing-sm);
  font-size: 1.4rem;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-700);
  
  &::placeholder {
    color: var(--color-grey-400);
  }
`;

export default function SearchBox({ placeholder = "Search...", value, onChange, ...props }) {
  return (
    <SearchContainer {...props}>
      <SearchIcon />
      <SearchInput 
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </SearchContainer>
  );
}

