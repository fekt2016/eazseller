// Copy from EazMain Card.jsx - identical since global vars
import styled, { css } from 'styled-components';

const cardBaseStyles = css`
  background: #FFFFFF;
  border-radius: 9px;
  padding: 1rem;
  width: 100%;
  position: relative;
`;

const StyledCard = styled.div`
  ${cardBaseStyles}

  ${({ variant }) => {
    switch (variant) {
      case 'elevated':
        return css`
          
          border: 1px solid #F9F8F5;

          &:hover {
            
          }
        `;
      case 'outlined':
        return css`
          border: 1px solid #F1EFE8;
          box-shadow: none;
        `;
      default:
        return css`
          
          border: 1px solid #F9F8F5;
        `;
    }
  }}

  ${({ noPadding }) => noPadding && css`
    padding: 0;
  `}

  ${({ clickable }) => clickable && css`
    cursor: pointer;
    transition: all 0.12s;

    &:hover {
      transform: translateY(-2px);
      
    }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #F1EFE8;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CardContent = styled.div`
  flex-grow: 1;
`;

const CardFooter = styled.div`
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #F1EFE8;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Card = ({ 
  children, 
  variant = 'default', 
  noPadding = false, 
  clickable = false, 
  title,
  headerActions,
  footerActions 
}) => {
  return (
    <StyledCard variant={variant} noPadding={noPadding} clickable={clickable}>
      {(title || headerActions) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {headerActions && headerActions}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footerActions && <CardFooter>{footerActions}</CardFooter>}
    </StyledCard>
  );
};

export default Card;
export { CardHeader, CardTitle, CardContent, CardFooter };
