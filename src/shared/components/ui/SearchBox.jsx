import styled from "styled-components";
import { FaSearch } from "react-icons/fa";

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #F1EFE8;
  border-radius: 9px;
  padding: 1rem 1rem;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 400px;
  
  &:focus-within {
    border-color: #E8920A;
    box-shadow: 0 0 0 3px #E8920A;
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #D1D5DB;
  margin-right: 1rem;
  font-size: 1.4rem;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 0.9rem;
  
  color: #374151;
  
  &::placeholder {
    color: #D1D5DB;
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

