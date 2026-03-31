import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { devicesMax } from '../../shared/styles/breakpoint';
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
  background: #F9F8F5;
`;

const LogoSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem 0;
  
  @media ${devicesMax.md} {
    margin-bottom: 2rem;
    padding: 1rem 0;
  }
`;

const StatsGrid = styled(Grid)`
  margin-bottom: 2.5rem;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 2rem !important; // Override if needed, but use global
`;

const StatIcon = styled(IconWrapper)`
  background: #FEF3C7;
  color: #E8920A;
  margin-bottom: 1rem;
  font-size: 1.875rem;
`;

const StatNumber = styled.h3`
  font-size: 1.875rem;
  font-weight: 700;
  color: #E8920A;
  margin: 0 0 0.5rem 0;
`;

const StatLabel = styled.p`
  color: #6B7280;
  margin: 0;
  font-size: 1rem;
`;

const Dashboard = () => {
  useDynamicPageTitle({
    title: "Seller Dashboard",
    description: "Manage your Saiisai Seller account and sales.",
    defaultTitle: "Dashboard • Saiisai Seller",
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
