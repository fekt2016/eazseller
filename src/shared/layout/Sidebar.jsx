import { NavLink as RouterNavLink } from "react-router-dom";
import styled, { css } from "styled-components";
import {
  FaSignOutAlt,
  FaBoxes,
  FaShoppingCart,
  FaStore,
  FaCog,
  FaStar,
  FaHeadset,
  FaWallet,
  FaReceipt,
  FaTruck,
  FaFileAlt,
  FaMapMarkerAlt,
  FaUndo,
} from "react-icons/fa";
import useAuth from '../hooks/useAuth';
import { PATHS } from '../../routes/routePaths';
import { devicesMax } from '../styles/breakpoint';
import { useSellerBalance } from '../hooks/finance/useSellerBalance';
import useMediaQuery from '../hooks/useMediaQuery';

export default function Sidebar({ isOpen, onClose }) {
  const { logout, seller } = useAuth();
  const isMobile = useMediaQuery(devicesMax.md);
  const { availableBalance, isLoading: isBalanceLoading } = useSellerBalance();

  const publicMenuItems = [
    { path: PATHS.SHIPPING_INFO, label: "Shipping Info", icon: <FaTruck /> },
    { path: PATHS.TERMS, label: "Terms of Service", icon: <FaFileAlt /> },
    { path: PATHS.VAT_TAX_POLICY, label: "VAT & Tax Policy", icon: <FaFileAlt /> },
    { path: PATHS.HELP, label: "Help Center", icon: <FaHeadset /> },
  ];

  const menuItems = [
    { path: PATHS.DASHBOARD, label: "Dashboard", icon: <FaStore /> },
    { path: PATHS.ADD_PRODUCT, label: "Add Product", icon: <FaBoxes /> },
    { path: PATHS.PRODUCTS, label: "My Products", icon: <FaBoxes /> },
    { path: PATHS.ORDERS, label: "Orders", icon: <FaShoppingCart /> },
    { path: PATHS.REVIEWS, label: "Reviews", icon: <FaStar /> },
    { path: PATHS.DISCOUNT_PRODUCTS, label: "Discounts", icon: <FaBoxes /> },
    { path: PATHS.FINANCE, label: "Wallet", icon: <FaWallet /> },
    { path: PATHS.TRANSACTIONS, label: "Transactions", icon: <FaReceipt /> },
    { path: PATHS.RETURNS, label: "Returns", icon: <FaUndo /> },
    { path: PATHS.SUPPORT, label: "Support", icon: <FaHeadset /> },
    { path: PATHS.PICKUP_LOCATIONS, label: "Pickup Locations", icon: <FaMapMarkerAlt /> },
    { path: PATHS.SETTINGS, label: "Settings", icon: <FaCog /> },
  ];

  const handleNavClick = () => {
    if (isMobile && onClose) onClose();
  };

  const balanceText = isBalanceLoading
    ? '...'
    : `GH₵ ${(availableBalance || 0).toLocaleString('en-GH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  return (
    <Container $isOpen={isOpen}>
      <SidebarHeader>
        <BrandWrap>
          <BrandIcon>
            <FaStore />
          </BrandIcon>
          <BrandText>Saiisai</BrandText>
        </BrandWrap>
      </SidebarHeader>

      {seller ? (
        <BalanceSection>
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceAmount>{balanceText}</BalanceAmount>
        </BalanceSection>
      ) : null}

      <MenuList>
        {(seller ? menuItems : publicMenuItems).map((item) => (
          <MenuItem key={item.path}>
            <NavLink
              to={item.path}
              end
              className={({ isActive }) => (isActive ? "active" : undefined)}
              onClick={handleNavClick}
            >
              <MenuIcon>{item.icon}</MenuIcon>
              <span>{item.label}</span>
            </NavLink>
          </MenuItem>
        ))}
      </MenuList>

      {seller ? (
        <LogoutButton onClick={() => logout.mutate()}>
          <FaSignOutAlt />
          <span>{logout.isloading ? "Logging out..." : "Logout"}</span>
        </LogoutButton>
      ) : null}
    </Container>
  );
}

const Container = styled.aside`
  width: 240px;
  height: 100vh;
  background: #E8920A;
  color: #FFFFFF;
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
    ${({ $isOpen }) =>
      $isOpen &&
      css`
        transform: translateX(0);
      `}
  }
`;

const SidebarHeader = styled.div`
  padding: 0 1.5rem;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
`;

const BrandWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
`;

const BrandIcon = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.24);
  display: grid;
  place-items: center;
`;

const BrandText = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
`;

const BalanceSection = styled.div`
  padding: 0.9rem 1rem;
  margin: 0 1rem 1rem;
  background: rgba(0, 0, 0, 0.24);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

const BalanceLabel = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.82);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const BalanceAmount = styled.div`
  margin-top: 0.25rem;
  font-size: 1.4rem;
  font-weight: 700;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

const MenuItem = styled.li`
  padding: 0 0.8rem 0.25rem;
`;

const NavLink = styled(RouterNavLink)`
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border-radius: 10px;
  padding: 0.72rem 0.95rem;
  transition: 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
  }

  &.active {
    background: rgba(255, 255, 255, 0.95);
    color: #E8920A;
    font-weight: 600;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  }
`;

const MenuIcon = styled.span`
  font-size: 1.2rem;
  display: inline-flex;
`;

const LogoutButton = styled.button`
  margin: 1rem 1rem 0;
  background: transparent;
  color: #FFFFFF;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding: 1rem 0.2rem 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 8px;
  }
`;
