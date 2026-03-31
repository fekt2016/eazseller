import styled, { css } from "styled-components";
import { devicesMax } from "../../styles/breakpoint";
import { spin } from "../../styles/animations";

const sizeStyles = {
  xs: css`
    padding: 1rem;
    font-size: 0.8rem;
    border-radius: 6px;
    min-height: 2.4rem;
  `,
  sm: css`
    padding: 1rem 1rem;
    font-size: 0.875rem;
    border-radius: 6px;
    min-height: 3.2rem;
  `,
  md: css`
    padding: 1rem 1rem;
    font-size: 0.9rem;
    border-radius: 9px;
    min-height: 4rem;
  `,
  lg: css`
    padding: 1rem 1rem;
    font-size: 1.1rem;
    border-radius: 12px;
    min-height: 4.8rem;
  `,
};

const variantStyles = {
  primary: css`
    background-color: #E8920A;
    color: #FFFFFF;
    border: none;
    &:hover:not(:disabled) {
      background-color: #E8920A;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(43, 122, 255, 0.3);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  secondary: css`
    background-color: #1F2937;
    color: #FFFFFF;
    border: none;
    &:hover:not(:disabled) {
      background-color: #374151;
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  outline: css`
    background-color: transparent;
    color: #374151;
    border: 1px solid #E5E7EB;
    &:hover:not(:disabled) {
      background-color: #F9F8F5;
      border-color: #D1D5DB;
    }
  `,
  danger: css`
    background-color: #A32D2D;
    color: #FFFFFF;
    border: none;
    &:hover:not(:disabled) {
      background-color: #A32D2D;
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: #374151;
    border: none;
    &:hover:not(:disabled) {
      background-color: #F9F8F5;
    }
  `,
  success: css`
    background-color: #3B6D11;
    color: #FFFFFF;
    border: none;
    &:hover:not(:disabled) {
      background-color: #3B6D11;
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  link: css`
    background-color: transparent;
    color: #E8920A;
    border: none;
    text-decoration: underline;
    padding: 0;
    min-height: auto;
    &:hover:not(:disabled) {
      color: #E8920A;
    }
  `,
  accent: css`
    background-color: #FFFDF9;
    color: #FFFFFF;
    border: none;
    &:hover:not(:disabled) {
      background-color: #FEF3C7;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 87, 51, 0.3);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
};

const ButtonStyled = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  font-weight: ${({ $weight }) => $weight || 500};
  cursor: pointer;
  transition: 0.12s;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  position: relative;
  white-space: nowrap;
  text-decoration: none;
  
  /* Icon-only button (circular/square) */
  ${({ $iconOnly, $size }) =>
    $iconOnly &&
    css`
      width: ${$size === "xs" ? "2.4rem" : $size === "sm" ? "3.2rem" : $size === "md" ? "4rem" : "4.8rem"};
      height: ${$size === "xs" ? "2.4rem" : $size === "sm" ? "3.2rem" : $size === "md" ? "4rem" : "4.8rem"};
      padding: 0;
      border-radius: ${({ $round }) => ($round ? "50%" : "9px")};
    `}

  ${({ $size }) => sizeStyles[$size || "md"]};
  ${({ $variant }) => variantStyles[$variant || "primary"]};

  /* Gradient variant */
  ${({ $gradient }) =>
    $gradient &&
    css`
      background: linear-gradient(135deg, #E8920A 0%, #E8920A 100%);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }
    `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(43, 122, 255, 0.2);
  }
  
  @media ${devicesMax.sm} {
    font-size: ${({ $size }) => {
    if ($size === "lg") return "0.9rem";
    if ($size === "md") return "0.875rem";
    return "0.8rem";
  }};
    padding: ${({ $size, $iconOnly }) => {
    if ($iconOnly) return "0";
    if ($size === "lg") return "1rem 1rem";
    return "1rem 1rem";
  }};
  }
`;

const Spinner = styled.span`
  width: ${({ $size }) => ($size === "xs" ? 12 : $size === "sm" ? 14 : $size === "lg" ? 18 : 16)}px;
  height: ${({ $size }) => ($size === "xs" ? 12 : $size === "sm" ? 14 : $size === "lg" ? 18 : 16)}px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

/**
 * Universal Button Component for Saiisai Seller
 * 
 * @param {string} variant - Button style: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'link'
 * @param {string} size - Button size: 'xs' | 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Make button full width
 * @param {boolean} isLoading - Show loading spinner
 * @param {boolean} iconOnly - Icon-only button (circular/square)
 * @param {boolean} round - Make icon-only button circular
 * @param {boolean} gradient - Apply gradient background
 * @param {string} weight - Font weight: '400' | '500' | '600' | '700'
 * @param {ReactNode} children - Button content
 * @param {object} props - All other button props (onClick, disabled, type, etc.)
 * 
 * @example
 * <Button variant="primary" size="md">Click Me</Button>
 * <Button variant="outline" iconOnly round><FaIcon /></Button>
 * <Button variant="danger" isLoading>Delete</Button>
 * <Button as={Link} to="/path" variant="ghost">Navigate</Button>
 */
export default function Button({
  isLoading,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  round = false,
  gradient = false,
  weight,
  ...props
}) {
  return (
    <ButtonStyled
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $iconOnly={iconOnly}
      $round={round}
      $gradient={gradient}
      $weight={weight}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Spinner $size={size} />}
      {children}
    </ButtonStyled>
  );
}

