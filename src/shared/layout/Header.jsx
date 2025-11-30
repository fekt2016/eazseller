import styled from "styled-components";
import { FaBell, FaBars, FaTimes } from "react-icons/fa";
import { devicesMax } from '../styles/breakpoint';

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
        <IconButton>
          <FaBell />
          <NotificationBadge>3</NotificationBadge>
        </IconButton>
        <UserProfile>
          <UserAvatar>{user.avatar}</UserAvatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: "12px", color: "var(--color-grey-500)" }}>
              {user.shopName}
            </div>
          </div>
        </UserProfile>
      </TopbarRight>
    </Container>
  );
};

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary-500);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-weight: 600;
  font-size: 18px;
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--color-red-600);
  color: var(--color-white-0);
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const IconButton = styled.button`
  position: relative;
  background: var(--color-grey-100);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-grey-900);
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
  color: var(--color-grey-900);
  align-items: center;
  justify-content: center;
  transition: var(--transition-base);

  &:hover {
    background: var(--color-grey-100);
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

// const NavItems = styled.nav`
//   display: flex;
//   align-items: center;
//   /* gap: 2rem; */

//   @media (max-width: 768px) {
//     gap: 1rem;
//   }
// `;
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

// const UserProfile = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 1rem;
//   cursor: pointer;

//   img {
//     width: 40px;
//     height: 40px;
//     border-radius: 50%;
//     object-fit: cover;
//   }
// `;

export default Header;
