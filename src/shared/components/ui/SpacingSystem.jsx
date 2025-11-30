import styled, { css } from "styled-components";
import { devicesMax } from "../../styles/breakpoint";

// Spacing values from CSS variables
const spacing = {
  xs: 'var(--spacing-xs)',    // 0.4rem
  sm: 'var(--spacing-sm)',    // 0.8rem
  md: 'var(--spacing-md)',    // 1.6rem
  lg: 'var(--spacing-lg)',    // 2.4rem
  xl: 'var(--spacing-xl)',    // 3.2rem
  '2xl': 'var(--spacing-2xl)' // 4.8rem
};

// Spacing props system
export const SpacingProps = css`
  ${({ $padding }) => $padding && `padding: ${spacing[$padding]};`}
  ${({ $margin }) => $margin && `margin: ${spacing[$margin]};`}
  ${({ $marginTop }) => $marginTop && `margin-top: ${spacing[$marginTop]};`}
  ${({ $marginBottom }) => $marginBottom && `margin-bottom: ${spacing[$marginBottom]};`}
  ${({ $marginLeft }) => $marginLeft && `margin-left: ${spacing[$marginLeft]};`}
  ${({ $marginRight }) => $marginRight && `margin-right: ${spacing[$marginRight]};`}
  ${({ $gap }) => $gap && `gap: ${spacing[$gap]};`}
`;

// Page Container
export const PageContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-md);
  }
`;

// Page Header
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${SpacingProps}
  margin-bottom: ${({ $marginBottom }) => $marginBottom ? spacing[$marginBottom] : spacing.lg};
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
`;

export const TitleSection = styled.div`
  flex: 1;
  
  h1 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
    margin-bottom: var(--spacing-xs);
    font-family: var(--font-heading);
  }
  
  p {
    font-size: var(--font-size-md);
    color: var(--color-grey-600);
    font-family: var(--font-body);
  }
  
  @media ${devicesMax.sm} {
    h1 {
      font-size: var(--font-size-xl);
    }
  }
`;

export const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  @media ${devicesMax.sm} {
    width: 100%;
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`;

// Section Component
export const Section = styled.section`
  ${SpacingProps}
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
  overflow: hidden;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${SpacingProps}
  border-bottom: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);
  
  h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-semibold);
    color: var(--color-grey-900);
    font-family: var(--font-heading);
  }
`;

// Grid System
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  ${SpacingProps}
  
  @media ${devicesMax.lg} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  ${SpacingProps}
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

// Toolbar
export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  ${SpacingProps}
  background: var(--color-white-0);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  ${SpacingProps}
  
  @media ${devicesMax.sm} {
    width: 100%;
    flex-direction: column;
    
    select {
      width: 100%;
    }
  }
`;

// Responsive Visibility
export const DesktopView = styled.div`
  display: block;
  
  @media ${devicesMax.md} {
    display: none;
  }
`;

export const MobileView = styled.div`
  display: none;
  
  @media ${devicesMax.md} {
    display: block;
  }
`;

// Export spacing object for direct use
export { spacing };

