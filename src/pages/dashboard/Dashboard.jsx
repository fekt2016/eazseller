import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import Container from '../../components/ui/Container';
import Grid from '../../components/ui/Grid';
import Card from '../../components/ui/Card';
import SectionTitle from '../../components/ui/SectionTitle';
import Button from '../../components/ui/Button';
import IconWrapper from '../../components/ui/IconWrapper';
import { FaChartLine, FaBox, FaDollarSign, FaUsers } from 'react-icons/fa';
import { useSellerStats } from '../../shared/hooks/useSellerStats'; // Assume existing hook
import Logo from '../../shared/components/Logo';
import { PATHS } from '../../routes/routePaths';

const DashboardWrapper = styled.div`
  background: var(--color-grey-50);
`;

const LogoSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--space-2xl);
  padding: var(--space-lg) 0;
  
  @media (max-width: 768px) {
    margin-bottom: var(--space-xl);
    padding: var(--space-md) 0;
  }
`;

const StatsGrid = styled(Grid)`
  margin-bottom: var(--space-2xl);
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: var(--space-xl) !important; // Override if needed, but use global
`;

const StatIcon = styled(IconWrapper)`
  background: var(--color-primary-100);
  color: var(--color-primary-500);
  margin-bottom: var(--space-md);
  font-size: var(--text-3xl);
`;

const StatNumber = styled.h3`
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-500);
  margin: 0 0 var(--space-sm) 0;
`;

const StatLabel = styled.p`
  color: var(--color-grey-600);
  margin: 0;
  font-size: var(--text-base);
`;

const Dashboard = () => {
  useDynamicPageTitle({
    title: "Seller Dashboard",
    description: "Manage your EazSeller account and sales.",
    defaultTitle: "Dashboard • EazSeller",
  });

  const { data: stats, isLoading } = useSellerStats();

  if (isLoading) {
    return (
      <DashboardWrapper>
        <Container>
          {/* Loading skeleton using global */}
          <Grid responsiveColumns>
            <Card variant="elevated">
              <StatIcon size="lg"><FaChartLine /></StatIcon>
              <StatNumber>Loading...</StatNumber>
              <StatLabel>Total Orders</StatLabel>
            </Card>
            {/* Repeat for other stats */}
          </Grid>
        </Container>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <Container>
        <LogoSection>
          <Logo to={PATHS.DASHBOARD} variant="default" />
        </LogoSection>
        <SectionTitle title="Dashboard Overview" subtitle="Your seller stats at a glance" />
        
        <StatsGrid responsiveColumns columns={4}>
          <StatCard variant="elevated">
            <StatIcon size="lg"><FaBox /></StatIcon>
            <StatNumber>{stats?.totalOrders || 0}</StatNumber>
            <StatLabel>Total Orders</StatLabel>
          </StatCard>
          
          <StatCard variant="elevated">
            <StatIcon size="lg"><FaDollarSign /></StatIcon>
            <StatNumber>{stats?.totalRevenue || 0}</StatNumber>
            <StatLabel>Revenue</StatLabel>
          </StatCard>
          
          <StatCard variant="elevated">
            <StatIcon size="lg"><FaUsers /></StatIcon>
            <StatNumber>{stats?.totalCustomers || 0}</StatNumber>
            <StatLabel>Customers</StatLabel>
          </StatCard>
          
          <StatCard variant="elevated">
            <StatIcon size="lg"><FaChartLine /></StatIcon>
            <StatNumber>{stats?.growthRate || 0}%</StatNumber>
            <StatLabel>Growth</StatLabel>
          </StatCard>
        </StatsGrid>

        <SectionTitle title="Recent Orders" />
        <Grid responsiveColumns>
          {/* Orders cards using Card and Button for actions */}
          {stats?.recentOrders?.map(order => (
            <Card key={order._id} clickable variant="elevated">
              <h4>Order #{order.id}</h4>
              <p>Total: {order.total}</p>
              <Button variant="primary" size="sm">View Details</Button>
            </Card>
          ))}
        </Grid>

        <Button variant="primary" fullWidth>View All Orders</Button>
      </Container>
    </DashboardWrapper>
  );
};

export default Dashboard;
