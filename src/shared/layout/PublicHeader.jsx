import { Link } from 'react-router-dom';
import styled from "styled-components";
import { PATHS } from '../../routes/routePaths';
import Logo from '../components/Logo';

/**
 * Public Header Component
 * Used for public pages (landing, login, signup, etc.)
 * Only links to public routes, never to protected dashboard pages
 */
const PublicHeader = () => {
  return (
    <Container>
      <LeftSection>
        <Logo to={PATHS.LANDING} variant="compact" />
      </LeftSection>
      <TopbarRight>
        <NavLinks>
          <NavLink to={PATHS.EDUCATION}>Education</NavLink>
          <NavLink to={PATHS.HELP}>Help Center</NavLink>
        </NavLinks>
        <AuthLinks>
          <LoginLink to={PATHS.LOGIN}>Login</LoginLink>
          <SignupLink to={PATHS.SIGNUP}>Sign Up</SignupLink>
        </AuthLinks>
      </TopbarRight>
    </Container>
  );
};

const Container = styled.header`
  height: var(--header-height);
  background: var(--color-white-0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const TopbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: var(--color-grey-700);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  transition: color var(--transition-base);
  
  &:hover {
    color: var(--color-primary-500);
  }
`;

const AuthLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LoginLink = styled(Link)`
  color: var(--color-primary-500);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: var(--transition-base);

  &:hover {
    background: var(--color-primary-50);
  }
`;

const SignupLink = styled(Link)`
  color: var(--color-white-0);
  background: var(--color-primary-500);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: var(--transition-base);

  &:hover {
    background: var(--color-primary-600);
  }
`;

export default PublicHeader;

