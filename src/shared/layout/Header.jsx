import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from "styled-components";
import { FaBars, FaTimes } from "react-icons/fa";
import { PATHS } from '../../routes/routePaths';
import { devicesMax } from '../styles/breakpoint';
import { useUnreadCount } from '../hooks/notifications/useNotifications';
import NotificationDropdown from '../components/NotificationDropdown';

const Header = ({ user, onToggleSidebar, isSidebarOpen = false }) => {
  const { data: unreadData, isLoading, error } = useUnreadCount();
  
  // FIX: Extract unread count from response - handle different possible response structures
  const unreadCount = useMemo(() => {
    if (!unreadData) return 0;
    
    // Backend returns: { status: 'success', data: { unreadCount: number } }
    const count = unreadData?.data?.unreadCount ?? 
                  unreadData?.data?.data?.unreadCount ?? 
                  unreadData?.unreadCount ?? 
                  0;
    
    // Ensure it's a valid number
    const numCount = Number(count) || 0;
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development' && !isLoading) {
      console.log('[Seller Header] Unread count debug:', {
        unreadData,
        extractedCount: numCount,
        rawData: unreadData
      });
    }
    
    return numCount;
  }, [unreadData, isLoading]);

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
          <>
            <NotificationDropdown unreadCount={unreadCount} />
            <UserProfile>
              <UserAvatar>{user.avatar || user.name?.[0] || 'U'}</UserAvatar>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 600 }}>{user.name || 'User'}</div>
                <div style={{ fontSize: "12px", color: "var(--color-grey-500)" }}>
                  {user.shopName || 'Seller'}
                </div>
              </div>
            </UserProfile>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
            <Link 
              to={PATHS.LOGIN}
              style={{ 
                color: "var(--color-primary-500)", 
                fontSize: "var(--font-size-sm)",
                textDecoration: "none",
                fontWeight: "var(--font-semibold)",
                padding: "var(--spacing-xs) var(--spacing-sm)",
                borderRadius: "var(--border-radius-md)",
                transition: "var(--transition-base)"
              }}
              onMouseEnter={(e) => e.target.style.background = "var(--color-primary-50)"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
            >
              Login
            </Link>
          </div>
        )}
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
