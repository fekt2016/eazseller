import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import {
  FaSignOutAlt,
  FaUsersCog,
  FaBoxes,
  FaShoppingCart,
  FaStore,
  FaCog,
  FaStar,
  FaMoneyBillWave,
  FaHeadset,
  FaWallet,
  FaReceipt,
  FaTruck,
  FaFileAlt,
  FaMapMarkerAlt,
  FaBell,
  FaUndo,
} from "react-icons/fa";
import useAuth from '../hooks/useAuth';
import { PATHS } from '../../routes/routePaths';
import { devicesMax } from '../styles/breakpoint';
import Logo from '../components/Logo';
import { useUnreadCount } from '../hooks/notifications/useNotifications';
import { useSellerBalance } from '../hooks/finance/useSellerBalance';

export default function Sidebar({ role, isOpen, onClose }) {
  const { logout, seller } = useAuth();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.unreadCount || 0;
  
  // Get seller balance using the same hook as other pages for consistency
  const { availableBalance, isLoading: isBalanceLoading } = useSellerBalance();

  // Combine role-specific menu with common menu
  // For public pages, only show public navigation items
  const publicMenuItems = [
    { path: PATHS.SHIPPING_INFO, label: "Shipping Info", icon: <FaTruck /> },
    { path: PATHS.TERMS, label: "Terms of Service", icon: <FaFileAlt /> },
    { path: PATHS.HELP, label: "Help Center", icon: <FaHeadset /> },
  ];
  
  const menuItems = [
    { path: PATHS.DASHBOARD, label: "Dashboard", icon: <FaStore /> },
    {
      path: PATHS.ADD_PRODUCT,
      label: "Add Product",
      icon: <FaBoxes />,
    },
    {
      path: PATHS.PRODUCTS,
      label: "My Products",
      icon: <FaBoxes />,
    },
    {
      path: PATHS.ORDERS,
      label: "Orders",
      icon: <FaShoppingCart />,
    },
    {
      path: PATHS.REVIEWS,
      label: "Reviews",
      icon: <FaStar />,
    },
    {
      path: PATHS.DISCOUNT_PRODUCTS,
      label: "Discount Product",
      icon: <FaBoxes />,
    },
    {
      path: PATHS.FINANCE,
      label: "Wallet",
      icon: <FaWallet />,
    },
    {
      path: PATHS.WITHDRAWALS,
      label: "Withdrawals",
      icon: <FaMoneyBillWave />,
    },
    {
      path: PATHS.TRANSACTIONS,
      label: "Transactions",
      icon: <FaReceipt />,
    },
    {
      path: PATHS.RETURNS,
      label: "Returns",
      icon: <FaUndo />,
    },
    {
      path: PATHS.FUNDS,
      label: "Funds & Wallet",
      icon: <FaWallet />,
    },
    {
      path: PATHS.SUPPORT,
      label: "Support",
      icon: <FaHeadset />,
    },
    {
      path: PATHS.CHAT_SUPPORT,
      label: "Chat Support",
      icon: <FaUsersCog />,
    },
    {
      path: PATHS.NOTIFICATIONS,
      label: "Notifications",
      icon: <FaBell />,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      path: PATHS.PICKUP_LOCATIONS,
      label: "Pickup Locations",
      icon: <FaMapMarkerAlt />,
    },
    {
      path: PATHS.SETTINGS,
      label: "Settings",
      icon: <FaCog />,
    },
  ];
  const handleLogout = () => {
    logout.mutate();
  };

  // Close sidebar when clicking on a nav item on mobile
  const handleNavClick = () => {
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <Container $isOpen={isOpen}>
      <SidebarHeader>
        <Logo variant="compact" />
      </SidebarHeader>
      
      {/* Balance Display */}
      {seller && (
        <BalanceSection>
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceAmount>
            {isBalanceLoading ? (
              <BalanceLoading>...</BalanceLoading>
            ) : (
              `GH₵${(availableBalance || 0).toFixed(2)}`
            )}
          </BalanceAmount>
        </BalanceSection>
      )}
      
      <MenuList>
        {/* Show public menu items for unauthenticated users, full menu for authenticated */}
        {(seller ? menuItems : publicMenuItems).map((item) => (
          <MenuItem key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleNavClick}
            >
              <MenuIcon>{item.icon}</MenuIcon>
              {item.label}
              {item.badge && item.badge > 0 && (
                <Badge>{item.badge > 99 ? '99+' : item.badge}</Badge>
              )}
            </NavLink>
          </MenuItem>
        ))}
      </MenuList>
      {seller && (
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt />
          {logout.isloading ? "Logging out..." : "Logout"}
        </LogoutButton>
      )}
    </Container>
  );
}

// Header Component

export const NavItems = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

// Sidebar Component
const Container = styled.aside`
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  z-index: 1000;
  transition: transform 0.3s ease;

  @media ${devicesMax.md} {
    transform: translateX(-100%);
    
    ${props => props.$isOpen && css`
      transform: translateX(0);
    `}
  }
`;
const NavLink = styled(Link)`
  color: var(--color-grey-500);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition-base);

  &:hover {
    color: var(--color-primary-500);
  }

  &.active {
    color: var(--color-primary-500);
    font-weight: 500;
  }
`;

const SidebarHeader = styled.div`
  padding: 0 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

const MenuItem = styled.li`
  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: var(--transition-base);

    &:hover {
      background: var(--color-primary-600);
      color: var(--color-white-0);
    }

    &.active {
      background: var(--color-primary-600);
      color: var(--color-white-0);
      border-left: 4px solid var(--color-white-0);
    }
  }
`;

const MenuIcon = styled.span`
  font-size: 1.2rem;
  display: flex;
`;

const Badge = styled.span`
  background: var(--color-red-600);
  color: var(--color-white-0);
  font-size: 0.75rem;
  font-weight: var(--font-semibold);
  padding: 0.125rem 0.5rem;
  border-radius: var(--border-radius-full);
  min-width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
`;

const BalanceSection = styled.div`
  padding: 1rem 1.5rem;
  margin: 0 1rem 1rem;
  background: var(--color-primary-600);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const BalanceLabel = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const BalanceAmount = styled.div`
  font-size: 1.5rem;
  font-weight: var(--font-bold);
  color: var(--color-white-0);
  display: flex;
  align-items: center;
`;

const BalanceLoading = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
`;

const LogoutButton = styled.button`
  background: var(--color-primary-600);
  color: var(--color-white-0);
  border: none;
  padding: 1rem 1.5rem;
  margin: 1rem;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: var(--transition-base);

  &:hover {
    background: var(--color-primary-700);
  }
`;
