import React from 'react';
import styled from 'styled-components';
import { GHANA_REGIONS } from '../../../shared/data/ghanaRegions';

const SelectContainer = styled.div`
  width: 100%;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background-color: var(--color-white-0);
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &:disabled {
    background-color: var(--color-grey-100);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
`;

const ErrorText = styled.span`
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-red-600);
`;

const HelperText = styled.span`
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
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
          {required && <span style={{ color: 'var(--color-red-600)' }}> *</span>}
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

