import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaStore,
  FaCreditCard,
  FaArrowLeft,
  FaShieldAlt,
  FaLock,
  FaBell,
  FaUser,
} from 'react-icons/fa';
import { PATHS } from '../../routes/routePaths';
import BusinessProfilePage from '../profile/BusinessProfilePage';
import PaymentMethodPage from '../profile/PaymentMethodPage';
import VerificationPage from '../profile/VerificationPage';
import SecurityTab from './tabs/SecurityTab';
import NotificationsTab from './tabs/NotificationsTab';
import AccountTab from './tabs/AccountTab';

const VALID_TABS = ['profile', 'payment', 'verification', 'security', 'notifications', 'account'];

const resolveTab = (search, hash) => {
  const tabParam = new URLSearchParams(search).get('tab');
  if (tabParam && VALID_TABS.includes(tabParam)) return tabParam;
  const h = hash.replace('#', '');
  if (h === 'payment' || h === 'payment-methods') return 'payment';
  if (h === 'verification' || h === 'verify') return 'verification';
  if (h === 'security') return 'security';
  if (h === 'notifications') return 'notifications';
  if (h === 'account') return 'account';
  if (h === 'profile' || h === 'business-profile') return 'profile';
  return 'profile';
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(location.search, location.hash)
  );

  const tabs = [
    { id: 'profile', label: 'Business Profile', description: 'Business info & documents', icon: <FaStore /> },
    { id: 'payment', label: 'Payment Methods', description: 'Add and manage payout methods', icon: <FaCreditCard /> },
    { id: 'verification', label: 'Verification', description: 'Verify email & contact info', icon: <FaShieldAlt /> },
    { id: 'security', label: 'Security', description: 'Password, 2FA & sessions', icon: <FaLock /> },
    { id: 'notifications', label: 'Notifications', description: 'Manage notification preferences', icon: <FaBell /> },
    { id: 'account', label: 'Account', description: 'Account settings & status', icon: <FaUser /> },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `${location.pathname}#${tabId}`);
  };

  useEffect(() => {
    const tab = resolveTab(location.search, location.hash);
    if (VALID_TABS.includes(tab)) setActiveTab(tab);
  }, [location.search, location.hash]);

  return (
    <Page>
      <Layout>
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <BackBtn onClick={() => navigate(PATHS.DASHBOARD)} aria-label="Back">
              <FaArrowLeft size={11} />
            </BackBtn>
            <div>
              <SidebarTitle>Settings</SidebarTitle>
              <SidebarSub>Configure your account</SidebarSub>
            </div>
          </SidebarHeader>
          <NavList>
            {tabs.map((tab) => (
              <NavItem
                key={tab.id}
                $active={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
              >
                <NavIcon $active={activeTab === tab.id}>
                  {tab.icon}
                </NavIcon>
                <NavText>
                  <NavLabel $active={activeTab === tab.id}>{tab.label}</NavLabel>
                  <NavDesc>{tab.description}</NavDesc>
                </NavText>
              </NavItem>
            ))}
          </NavList>
        </Sidebar>

        {/* Main Content */}
        <ContentCard>
          <TabContent>
            {activeTab === 'profile' && <BusinessProfilePage embedded />}
            {activeTab === 'payment' && <PaymentMethodPage embedded />}
            {activeTab === 'verification' && <VerificationPage embedded />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'account' && <AccountTab />}
          </TabContent>
        </ContentCard>
      </Layout>
    </Page>
  );
};

export default SettingsPage;

/* ─── Styled Components ─────────────────────────────────────────────────────── */
const Page = styled.div`
  padding: 1.25rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 0.75rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem;
  position: sticky;
  top: 1.25rem;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const BackBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 0.5px solid #F1EFE8;
  background: #F9F8F5;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.12s;

  &:hover { border-color: #E8920A; color: #E8920A; background: #FDF3E3; }
`;

const SidebarTitle = styled.h2`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.1rem;
`;

const SidebarSub = styled.p`
  font-size: 0.7rem;
  color: #9CA3AF;
  margin: 0;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 900px) {
    flex-direction: row;
    overflow-x: auto;
    gap: 4px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`;

const NavItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.12s;
  background: ${(p) => p.$active ? '#FDF3E3' : 'transparent'};
  white-space: nowrap;

  &:hover {
    background: ${(p) => p.$active ? '#FDF3E3' : '#F9F8F5'};
  }

  @media (max-width: 900px) {
    padding: 0.5rem 0.75rem;
    background: ${(p) => p.$active ? '#E8920A' : '#FFFFFF'};
    border: 0.5px solid ${(p) => p.$active ? '#E8920A' : '#F1EFE8'};
    &:hover { background: ${(p) => p.$active ? '#D97706' : '#F9F8F5'}; }
  }
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: ${(p) => p.$active ? '#E8920A' : '#F3F0EB'};
  color: ${(p) => p.$active ? '#FFFFFF' : '#6B7280'};
  font-size: 0.75rem;
  flex-shrink: 0;

  @media (max-width: 900px) {
    background: ${(p) => p.$active ? 'rgba(255,255,255,0.2)' : '#F3F0EB'};
    color: ${(p) => p.$active ? '#FFFFFF' : '#6B7280'};
  }
`;

const NavText = styled.div`
  @media (max-width: 900px) {
    display: flex;
    align-items: center;
  }
`;

const NavLabel = styled.div`
  font-size: 0.825rem;
  font-weight: ${(p) => p.$active ? 600 : 500};
  color: ${(p) => p.$active ? '#E8920A' : '#374151'};
  line-height: 1.3;

  @media (max-width: 900px) {
    color: ${(p) => p.$active ? '#FFFFFF' : '#374151'};
  }
`;

const NavDesc = styled.div`
  font-size: 0.7rem;
  color: #9CA3AF;
  margin-top: 0.1rem;

  @media (max-width: 900px) {
    display: none;
  }
`;

const ContentCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  overflow: hidden;
`;

const TabContent = styled.div`
  padding: 1.5rem;
  min-height: 400px;

  > div { padding: 0; }
`;
