import React from 'react';
import styled from 'styled-components';
import { GHANA_REGIONS } from '../../../shared/data/ghanaRegions';

const SelectContainer = styled.div`
  width: 100%;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 1rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 0.9rem;
  
  color: #111827;
  background-color: #FFFFFF;
  transition: all 0.12s;

  &:focus {
    outline: none;
    border-color: #E8920A;
    box-shadow: 0 0 0 3px #E8920A;
  }

  &:disabled {
    background-color: #F9F8F5;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const ErrorText = styled.span`
  display: block;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #A32D2D;
`;

const HelperText = styled.span`
  display: block;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #6B7280;
`;

const GhanaRegionSelect = ({
  value,
  onChange,
  onBlur,
  name = 'region',
  id = 'region',
  label = 'Region',
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  ...props
}) => {
  return (
    <SelectContainer>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span style={{ color: '#A32D2D' }}> *</span>}
        </Label>
      )}
      <StyledSelect
        id={id}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        {...props}
      >
        <option value="">Select a region</option>
        {GHANA_REGIONS.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </StyledSelect>
      {error && <ErrorText>{error}</ErrorText>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </SelectContainer>
  );
};

export default GhanaRegionSelect;

