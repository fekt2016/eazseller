import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * Styled components for EazSeller Landing Page
 * Clean, premium, conversion-focused design
 */

// Main Container
export const LandingContainer = styled.div`
  min-height: 100vh;
  background: var(--color-white-0);
  overflow-x: hidden;
`;

// Navigation Header
export const NavHeader = styled(motion.header)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-white-0);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  padding: var(--spacing-md) var(--spacing-lg);
  
  @media (max-width: 768px) {
    padding: var(--spacing-sm) var(--spacing-md);
  }
`;

export const NavContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const NavLogo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: #00C896;
  font-family: var(--font-heading);
  cursor: pointer;
  text-decoration: none;
  
  svg {
    font-size: var(--font-size-2xl);
  }
`;

export const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavLink = styled.a`
  color: var(--color-grey-700);
  text-decoration: none;
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);
  transition: color var(--transition-base);
  cursor: pointer;
  
  &:hover {
    color: #00C896;
  }
`;

export const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    gap: var(--spacing-sm);
  }
`;

export const NavButton = styled(motion.button)`
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  ${props => props.$variant === 'primary' ? `
    background: #00C896;
    color: var(--color-white-0);
    
    &:hover {
      background: #00A67E;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 200, 150, 0.3);
    }
  ` : `
    background: transparent;
    color: #00C896;
    border: 1px solid #00C896;
    
    &:hover {
      background: #00C896;
      color: var(--color-white-0);
      transform: translateY(-1px);
    }
  `}
  
  @media (max-width: 480px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: var(--color-grey-900);
  font-size: var(--font-size-xl);
  cursor: pointer;
  padding: var(--spacing-xs);
  
  @media (max-width: 768px) {
    display: block;
  }
`;

export const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: var(--color-white-0);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-lg);
  z-index: 999;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

export const MobileNavLink = styled.a`
  display: block;
  color: var(--color-grey-700);
  text-decoration: none;
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-grey-200);
  transition: color var(--transition-base);
  cursor: pointer;
  
  &:hover {
    color: #00C896;
    background: var(--color-grey-50);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const MobileNavButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-grey-200);
  margin-top: var(--spacing-sm);
`;

// Hero Section
export const HeroSection = styled(motion.section)`
  position: relative;
  padding: var(--spacing-4xl) var(--spacing-lg) var(--spacing-3xl);
  background: linear-gradient(135deg, 
    var(--color-white-0) 0%, 
    var(--color-green-50) 50%,
    var(--color-primary-50) 100%
  );
  text-align: center;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(0, 200, 150, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(0, 200, 150, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding: var(--spacing-3xl) var(--spacing-md) var(--spacing-2xl);
    text-align: center;
  }
`;

export const HeroContent = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  
  @media (min-width: 769px) {
    text-align: left;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-3xl);
    align-items: center;
  }
`;

export const HeroLeft = styled.div`
  @media (max-width: 768px) {
    text-align: center;
  }
`;

export const HeroIcon = styled(motion.div)`
  font-size: 6rem;
  color: #00C896;
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: ${props => props.$align || 'center'};
  
  @media (max-width: 768px) {
    justify-content: center;
    font-size: 4rem;
  }
`;

export const HeroTitle = styled(motion.h1)`
  font-size: var(--font-size-5xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-3xl);
  }
  
  @media (max-width: 480px) {
    font-size: var(--font-size-2xl);
  }
`;

export const HeroSubtitle = styled(motion.p)`
  font-size: var(--font-size-xl);
  color: var(--color-grey-600);
  max-width: 60rem;
  margin-bottom: var(--spacing-xl);
  line-height: 1.7;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-lg);
    margin: 0 auto var(--spacing-xl);
  }
  
  @media (max-width: 480px) {
    font-size: var(--font-size-md);
  }
`;

export const HeroButtons = styled(motion.div)`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  justify-content: ${props => props.$justify || 'flex-start'};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const PrimaryButton = styled(motion.button)`
  padding: var(--spacing-md) var(--spacing-xl);
  background: #00C896;
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  
  &:hover {
    background: #00A67E;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 200, 150, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const SecondaryButton = styled(motion.button)`
  padding: var(--spacing-md) var(--spacing-xl);
  background: transparent;
  color: #00C896;
  border: 2px solid #00C896;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  
  &:hover {
    background: #00C896;
    color: var(--color-white-0);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 200, 150, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const HeroRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const HeroIllustration = styled(motion.div)`
  width: 100%;
  max-width: 50rem;
  height: 40rem;
  background: linear-gradient(135deg, #00C896 0%, #00A67E 100%);
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12rem;
  color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 60px rgba(0, 200, 150, 0.2);
`;

// Section Wrapper
export const SectionWrapper = styled(motion.section)`
  padding: var(--spacing-3xl) var(--spacing-lg);
  max-width: 120rem;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-2xl);
  }
`;

export const SectionDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  max-width: 70rem;
  margin: 0 auto var(--spacing-xl);
  line-height: 1.7;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-md);
  }
`;

// Benefits Grid
export const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

export const BenefitCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  text-align: center;
  transition: all var(--transition-base);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
`;

export const BenefitIcon = styled.div`
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background: rgba(0, 200, 150, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  color: #00C896;
  font-size: var(--font-size-2xl);
`;

export const BenefitTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-heading);
`;

export const BenefitDescription = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
`;

// Steps Section
export const StepsSection = styled(motion.section)`
  background: var(--color-grey-50);
  padding: var(--spacing-3xl) var(--spacing-lg);
  margin: var(--spacing-3xl) 0;
  
  @media (max-width: 768px) {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const StepsContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
`;

export const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

export const StepCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  text-align: center;
  position: relative;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
`;

export const StepNumber = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: #00C896;
  color: var(--color-white-0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  margin: 0 auto var(--spacing-md);
  font-family: var(--font-heading);
`;

export const StepIcon = styled.div`
  font-size: var(--font-size-3xl);
  color: #00C896;
  margin-bottom: var(--spacing-md);
`;

export const StepTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-heading);
`;

export const StepDescription = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
`;

// Trust Section
export const TrustSection = styled(motion.section)`
  padding: var(--spacing-3xl) var(--spacing-lg);
  max-width: 120rem;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const TrustGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

export const TrustCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
`;

export const TrustNumber = styled.div`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  color: #00C896;
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-heading);
`;

export const TrustLabel = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  margin: 0;
`;

// CTA Section
export const CTASection = styled(motion.section)`
  background: linear-gradient(135deg, #00C896 0%, #00A67E 100%);
  padding: var(--spacing-4xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-white-0);
  margin: var(--spacing-3xl) 0;
  border-radius: var(--border-radius-xl);
  
  @media (max-width: 768px) {
    padding: var(--spacing-3xl) var(--spacing-md);
  }
`;

export const CTAContainer = styled.div`
  max-width: 80rem;
  margin: 0 auto;
`;

export const CTATitle = styled.h2`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-2xl);
  }
`;

export const CTASubtitle = styled.p`
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
  opacity: 0.95;
  line-height: 1.7;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-md);
  }
`;

export const CTAButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
`;

export const CTAButtonPrimary = styled(motion.button)`
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-white-0);
  color: #00C896;
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  
  &:hover {
    background: var(--color-grey-50);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const CTAButtonSecondary = styled(motion.button)`
  padding: var(--spacing-md) var(--spacing-xl);
  background: transparent;
  color: var(--color-white-0);
  border: 2px solid var(--color-white-0);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Footer Section
export const FooterSection = styled(motion.footer)`
  background: var(--color-grey-900);
  color: var(--color-white-0);
  padding: var(--spacing-2xl) var(--spacing-lg);
  margin-top: var(--spacing-3xl);
  
  @media (max-width: 768px) {
    padding: var(--spacing-xl) var(--spacing-md);
    margin-top: var(--spacing-2xl);
  }
`;

export const FooterContent = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  text-align: center;
`;

export const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: var(--spacing-md);
    flex-direction: column;
  }
`;

export const FooterLink = styled.a`
  color: var(--color-grey-300);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-base);
  
  &:hover {
    color: #00C896;
  }
`;

export const FooterCopyright = styled.p`
  color: var(--color-grey-400);
  font-size: var(--font-size-sm);
  margin: 0;
`;

