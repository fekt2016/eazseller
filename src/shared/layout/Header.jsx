import { Link } from 'react-router-dom';
import styled from "styled-components";
import { FaBars, FaTimes } from "react-icons/fa";
import { PATHS } from '../../routes/routePaths';
import { devicesMax } from '../styles/breakpoint';
import { getOptimizedImageUrl, IMAGE_SLOTS } from '../utils/cloudinaryConfig';

const Header = ({ user, onToggleSidebar, isSidebarOpen = false }) => {
  return (
    <Container>
      <LeftSection>
        {onToggleSidebar && (
          <HamburgerButton
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </HamburgerButton>
        )}
      </LeftSection>
      <TopbarRight>
        {user ? (
          <UserChip>
            <UserAvatar className="avatar-container">
              {user.avatar ? (
                <img
                  src={getOptimizedImageUrl(user.avatar, IMAGE_SLOTS.AVATAR)}
                  alt={user.name || 'User'}
                  loading="eager"
                  fetchpriority="high"
                />
              ) : (
                user.name?.[0] || 'U'
              )}
            </UserAvatar>
            <UserTextWrap>
              <UserName>{user.name || 'User'}</UserName>
              <StoreName>{user.shopName || 'Seller'}</StoreName>
            </UserTextWrap>
          </UserChip>
        ) : (
          <PublicActions>
            <LoginLink to={PATHS.LOGIN}>
              Login
            </LoginLink>
          </PublicActions>
        )}
      </TopbarRight>
    </Container>
  );
};

const UserChip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 9999px;
  padding: 0.4rem 0.7rem 0.4rem 0.4rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #E8920A;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-weight: 600;
  font-size: 18px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const HamburgerButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  color: #111827;
  align-items: center;
  justify-content: center;
  transition: 0.12s;

  &:hover {
    background: #F9F8F5;
  }

  @media ${devicesMax.md} {
    display: flex;
  }
`;

const TopbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Container = styled.header`
  height: 52px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.2rem;
  border-bottom: 0.5px solid #F1EFE8;
  position: sticky;
  top: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const UserTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.15;
`;

const UserName = styled.div`
  color: #111827;
  font-size: 1.2rem;
  font-weight: 600;
`;

const StoreName = styled.div`
  color: #6B7280;
  font-size: 1.1rem;
`;

const PublicActions = styled.div`
  display: flex;
  align-items: center;
`;

const LoginLink = styled(Link)`
  color: #E8920A;
  font-size: 1.2rem;
  text-decoration: none;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;

  &:hover {
    background: #FDF3E3;
  }
`;


export default Header;
