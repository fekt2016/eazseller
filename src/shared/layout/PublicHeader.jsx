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
  height: 64px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  
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
  color: #374151;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.12s;
  
  &:hover {
    color: #E8920A;
  }
`;

const AuthLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LoginLink = styled(Link)`
  color: #E8920A;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 1rem 1rem;
  border-radius: 9px;
  transition: 0.12s;

  &:hover {
    background: #E8920A;
  }
`;

const SignupLink = styled(Link)`
  color: #FFFFFF;
  background: #E8920A;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 1rem 1rem;
  border-radius: 9px;
  transition: 0.12s;

  &:hover {
    background: #E8920A;
  }
`;

export default PublicHeader;

