// Copy from EazMain Button.jsx, but change primary to --color-brand-500
import styled, { css } from 'styled-components';
import { FaSpinner } from 'react-icons/fa';

const buttonBaseStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.12s;
  text-decoration: none;
  

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  svg {
    font-size: 1em;
  }
`;

const Button = styled.button`
  ${buttonBaseStyles}

  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return css`
          background: #E8920A;
          color: #FFFFFF;
          

          &:hover:not(:disabled) {
            background: #E8920A;
            
          }
        `;
      case 'secondary':
        return css`
          background: #F9F8F5;
          color: #374151;
          border: 1px solid #F1EFE8;

          &:hover:not(:disabled) {
            background: #F9F8F5;
            border-color: #E5E7EB;
          }
        `;
      case 'outline':
        return css`
          background: transparent;
          color: #E8920A;
          border: 1px solid #E8920A;

          &:hover:not(:disabled) {
            background: #E8920A;
            color: #FFFFFF;
          }
        `;
      case 'danger':
        return css`
          background: #A32D2D;
          color: #FFFFFF;
          border: 1px solid #A32D2D;

          &:hover:not(:disabled) {
            background: #A32D2D;
            border-color: #A32D2D;
          }
        `;
      default:
        return css`
          background: #E8920A;
          color: #FFFFFF;
        `;
    }
  }}

  // ... rest same as EazMain (sizes, fullWidth)
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
        `;
      case 'lg':
        return css`
          padding: 1.5rem 2rem;
          font-size: 1rem;
        `;
      default:
        return css`
          padding: 1rem 1.5rem;
        `;
    }
  }}

  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
`;

const Spinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ButtonComponent = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  loading = false, 
  disabled = false, 
  ...props 
}) => {
  return (
    <Button 
      variant={variant} 
      size={size} 
      fullWidth={fullWidth} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </Button>
  );
};

export default ButtonComponent;
