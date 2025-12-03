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
} from "react-icons/fa";
import useAuth from '../hooks/useAuth';
import { PATHS } from '../../routes/routePaths';
import { devicesMax } from '../styles/breakpoint';
import Logo from '../components/Logo';

export default function Sidebar({ role, isOpen, onClose }) {
  const { logout } = useAuth();

  // Combine role-specific menu with common menu
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
    // Payment Request menu item removed - using withdrawal system instead
    {
      path: PATHS.WITHDRAWALS,
      label: "Withdrawals",
      icon: <FaMoneyBillWave />,
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
      <MenuList>
        {menuItems.map((item) => (
          <MenuItem key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleNavClick}
            >
              <MenuIcon>{item.icon}</MenuIcon>
              {item.label}
            </NavLink>
          </MenuItem>
        ))}
      </MenuList>
      <LogoutButton onClick={handleLogout}>
        <FaSignOutAlt />
        {logout.isloading ? "Logging out..." : "Logout"}
      </LogoutButton>
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
