import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaStore,
  FaCreditCard,
  FaCog,
  FaArrowLeft,
  FaShieldAlt,
  FaLock,
  FaBell,
  FaUser,
  FaChevronRight
} from 'react-icons/fa';
import { PATHS } from '../../routes/routePaths';
import Button from '../../shared/components/ui/Button';
import { PageContainer, PageHeader, TitleSection } from '../../shared/components/ui/SpacingSystem';
import BusinessProfilePage from '../profile/BusinessProfilePage';
import PaymentMethodPage from '../profile/PaymentMethodPage';
import VerificationPage from '../profile/VerificationPage';
import SecurityTab from './tabs/SecurityTab';
import NotificationsTab from './tabs/NotificationsTab';
import AccountTab from './tabs/AccountTab';
import { devicesMax, devicesMin } from '../../shared/styles/breakpoint';

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Check query parameter first, then hash
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    if (tabParam) {
      if (['profile', 'payment', 'verification', 'security', 'notifications', 'account'].includes(tabParam)) {
        return tabParam;
      }
    }

    // Fallback to hash
    const hash = location.hash.replace('#', '');
    if (hash === 'payment' || hash === 'payment-methods') {
      return 'payment';
    } else if (hash === 'verification' || hash === 'verify') {
      return 'verification';
    } else if (hash === 'security') {
      return 'security';
    } else if (hash === 'notifications') {
      return 'notifications';
    } else if (hash === 'account') {
      return 'account';
    } else if (hash === 'profile' || hash === 'business-profile') {
      return 'profile';
    }
    return 'profile'; // Default to business profile
  });

  const tabs = [
    {
      id: 'profile',
      label: 'Business Profile',
      description: 'Manage your business information and documents',
      icon: <FaStore />,
      color: 'var(--color-primary-500)',
    },
    {
      id: 'payment',
      label: 'Payment Methods',
      description: 'Add and manage your payout methods',
      icon: <FaCreditCard />,
      color: 'var(--color-green-700)',
    },
    {
      id: 'verification',
      label: 'Verification',
      description: 'Verify your email and contact information',
      icon: <FaShieldAlt />,
      color: 'var(--color-blue-700)',
    },
    {
      id: 'security',
      label: 'Security',
      description: 'Password, 2FA, and security settings',
      icon: <FaLock />,
      color: 'var(--color-red-600)',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Manage your notification preferences',
      icon: <FaBell />,
      color: 'var(--color-indigo-600)',
    },
    {
      id: 'account',
      label: 'Account',
      description: 'Account settings and preferences',
      icon: <FaUser />,
      color: 'var(--color-grey-700)',
    },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Preserve query parameters when updating URL
    const searchParams = new URLSearchParams(location.search);
    const newSearch = searchParams.toString();
    window.history.replaceState(
      null,
      '',
      `${location.pathname}${newSearch ? `?${newSearch}` : ''}#${tabId}`
    );
  };

  // Sync with URL query parameter or hash on mount
  useEffect(() => {
    // Check query parameter first
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    if (tabParam && ['profile', 'payment', 'verification', 'security', 'notifications', 'account'].includes(tabParam)) {
      setActiveTab(tabParam);
      return;
    }

    // Fallback to hash
    const hash = location.hash.replace('#', '');
    if (hash === 'payment' || hash === 'payment-methods') {
      setActiveTab('payment');
    } else if (hash === 'verification' || hash === 'verify') {
      setActiveTab('verification');
    } else if (hash === 'security') {
      setActiveTab('security');
    } else if (hash === 'notifications') {
      setActiveTab('notifications');
    } else if (hash === 'account') {
      setActiveTab('account');
    } else if (hash === 'profile' || hash === 'business-profile') {
      setActiveTab('profile');
    }
  }, [location.search, location.hash]);

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <SettingsContainer>


      {/* Settings Layout */}
      <SettingsLayout>
        {/* Sidebar Navigation */}
        <Sidebar>
          <SidebarHeader>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
              <BackButton
                onClick={() => navigate(PATHS.DASHBOARD)}
                aria-label="Back to Dashboard"
                style={{ width: '30px', height: '30px', marginRight: 'var(--spacing-sm)' }}
              >
                <FaArrowLeft style={{ fontSize: '1.2rem' }} />
              </BackButton>
              <SidebarTitle style={{ margin: 0 }}>Settings</SidebarTitle>
            </div>
            <SidebarSubtitle>Configure your account</SidebarSubtitle>
          </SidebarHeader>
          <NavList>
            {tabs.map((tab) => (
              <NavItem
                key={tab.id}
                $active={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                $color={tab.color}
              >
                <NavIcon $active={activeTab === tab.id} $color={tab.color}>
                  {tab.icon}
                </NavIcon>
                <NavContent>
                  <NavLabel>{tab.label}</NavLabel>
                  <NavDescription>{tab.description}</NavDescription>
                </NavContent>
                {activeTab === tab.id && (
                  <NavIndicator $color={tab.color} />
                )}
              </NavItem>
            ))}
          </NavList>
        </Sidebar>

        {/* Main Content Area */}
        <MainContent>
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
        </MainContent>
      </SettingsLayout>
    </SettingsContainer>
  );
};

export default SettingsPage;

// Modern Styled Components
const SettingsContainer = styled(PageContainer)`
  padding: 0;
  background: var(--color-grey-50);
  min-height: 100vh;
`;

const ModernHeader = styled.div`
  background: linear-gradient(135deg, var(--color-white-0) 0%, var(--color-grey-50) 100%);
  border-bottom: 1px solid var(--color-grey-200);
  padding: var(--spacing-lg) var(--spacing-xl);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-md);
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex: 1;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
  background: var(--color-white-0);
  color: var(--color-grey-700);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-grey-300);
    color: var(--color-grey-900);
    transform: translateX(-2px);
  }

  svg {
    font-size: var(--font-size-md);
  }
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
`;

const BreadcrumbLink = styled.button`
  color: var(--color-grey-600);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-primary-600);
  }
`;

const BreadcrumbSeparator = styled.span`
  color: var(--color-grey-400);
  display: flex;
  align-items: center;
  
  svg {
    font-size: 1rem;
  }
`;

const BreadcrumbCurrent = styled.span`
  color: var(--color-grey-700);
  font-weight: var(--font-medium);
`;

const Title = styled.h1`
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0 0 var(--spacing-xs) 0;
  background: linear-gradient(135deg, var(--color-grey-900) 0%, var(--color-primary-600) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  margin: 0;
  line-height: 1.5;
`;

const SettingsLayout = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  
  @media ${devicesMax.md} {
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
  }
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }
`;

const Sidebar = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-grey-200);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  
  @media ${devicesMax.md} {
    border-radius: var(--border-radius-lg);
  }
`;

const SidebarHeader = styled.div`
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);
  margin-bottom: var(--spacing-lg);
`;

const SidebarTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0 0 var(--spacing-xs) 0;
`;

const SidebarSubtitle = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin: 0;
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  
  /* Hide scrollbar for styling */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const NavItem = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$active ? props.$color : 'var(--color-white-0)'};
  border: 1px solid ${props => props.$active ? props.$color : 'var(--color-grey-200)'};
  white-space: nowrap;
  box-shadow: ${props => props.$active ? `0 4px 12px ${props.$color}40` : 'none'};

  &:hover {
    background: ${props => props.$active ? props.$color : 'var(--color-grey-50)'};
    border-color: ${props => props.$active ? props.$color : 'var(--color-grey-300)'};
  }
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--border-radius-sm);
  color: ${props => props.$active ? 'var(--color-white-0)' : 'var(--color-grey-500)'};
  transition: all 0.2s ease;
  
  svg {
    font-size: var(--font-size-md);
  }
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
`;

const NavLabel = styled.div`
  font-size: var(--font-size-md);
  font-weight: ${props => props.$active ? 'var(--font-semibold)' : 'var(--font-medium)'};
  color: ${props => props.$active ? 'var(--color-white-0)' : 'var(--color-grey-700)'};
  transition: all 0.2s ease;
`;

const NavDescription = styled.div`
  display: none;
`;

const NavIndicator = styled.div`
  display: none;
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-width: 0;
`;

const ContentHeader = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-grey-200);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
`;

const ContentTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
`;

const ContentIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--border-radius-lg);
  background: ${props => props.$color ? `${props.$color}15` : 'var(--color-grey-100)'};
  color: ${props => props.$color || 'var(--color-grey-700)'};
  flex-shrink: 0;
  
  svg {
    font-size: var(--font-size-xl);
  }
`;

const ContentTitleText = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0 0 var(--spacing-xs) 0;
`;

const ContentSubtitle = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin: 0;
`;

const ContentCard = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-grey-200);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TabContent = styled.div`
  padding: var(--spacing-xl);
  min-height: 400px;
  
  /* When embedded, remove page container padding */
  > div {
    padding: 0;
  }
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-lg);
  }
`;
