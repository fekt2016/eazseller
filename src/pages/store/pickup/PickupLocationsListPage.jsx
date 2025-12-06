import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import {
  PageContainer,
  PageHeader,
  TitleSection,
  Section,
  SectionHeader,
} from '../../../shared/components/ui/SpacingSystem';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../components/ui/Card';
import { LoadingState, EmptyState, ErrorState } from '../../../shared/components/ui/LoadingComponents';
import { usePickupLocations } from '../../../shared/hooks/pickup/usePickupLocations';
import PickupLocationCard from '../../../components/store/pickup/PickupLocationCard';
import { PATHS } from '../../../routes/routePaths';
import useDynamicPageTitle from '../../../shared/hooks/useDynamicPageTitle';

/**
 * Pickup Locations List Page
 * Displays all pickup locations for the seller
 * Allows creating, editing, and deleting locations
 */
const PickupLocationsListPage = () => {
  const navigate = useNavigate();
  const { getLocations, deleteLocation } = usePickupLocations();
  const { data: locations = [], isLoading, error } = getLocations();
  const deleteMutation = deleteLocation();

  useDynamicPageTitle({
    title: 'Pickup Locations - EazSeller',
    description: 'Manage your pickup locations for order dispatch',
    defaultTitle: 'Pickup Locations - EazSeller',
  });

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <LoadingState message="Loading pickup locations..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load pickup locations. Please try again." />;
  }

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Pickup Locations</h1>
          <p>Manage locations where dispatch riders will pick up your orders</p>
        </TitleSection>
        <Button
          as={Link}
          to={PATHS.PICKUP_LOCATION_CREATE}
          variant="primary"
          size="md"
        >
          <FaPlus /> Add New Location
        </Button>
      </PageHeader>

      {/* Info Banner */}
      <InfoBanner>
        <FaInfoCircle />
        <div>
          <InfoTitle>How Pickup Locations Work</InfoTitle>
          <InfoText>
            EazShop dispatch riders will pick up orders from your specified locations.
            Set a default location that will be used automatically, or choose a specific location when preparing each order.
            {/* TODO: Backend integration - Link to order preparation screen when implemented */}
          </InfoText>
        </div>
      </InfoBanner>

      {/* Locations List */}
      {locations.length === 0 ? (
        <EmptyState
          message="No pickup locations found"
          action={
            <Button
              as={Link}
              to={PATHS.PICKUP_LOCATION_CREATE}
              variant="primary"
              size="md"
            >
              <FaPlus /> Create Your First Location
            </Button>
          }
        />
      ) : (
        <Section $marginBottom="lg">
          <SectionHeader $padding="md" $marginBottom="md">
            <h3>
              <FaMapMarkerAlt /> Your Locations ({locations.length})
            </h3>
          </SectionHeader>
          <LocationsGrid>
            {locations.map((location) => (
              <PickupLocationCard
                key={location._id}
                location={location}
                onDelete={handleDelete}
              />
            ))}
          </LocationsGrid>
        </Section>
      )}

      {/* Logistics Integration Note */}
      <LogisticsNote>
        <Card variant="outlined" $padding="lg">
          <NoteTitle>Logistics Integration</NoteTitle>
          <NoteText>
            {/* TODO: Backend integration required */}
            When preparing orders, you'll be able to select which pickup location to use.
            The default location will be pre-selected, but you can change it per order if needed.
            Dispatch riders will receive the pickup address for each order.
          </NoteText>
        </Card>
      </LogisticsNote>
    </PageContainer>
  );
};

export default PickupLocationsListPage;

// Styled Components
const InfoBanner = styled.div`
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-blue-50);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-xl);

  svg {
    color: var(--color-blue-600);
    font-size: var(--font-size-lg);
    flex-shrink: 0;
    margin-top: 2px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
`;

const InfoTitle = styled.h4`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-blue-900);
  margin: 0 0 var(--spacing-xs) 0;
`;

const InfoText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-blue-800);
  margin: 0;
  line-height: 1.6;
`;

const LocationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

const LogisticsNote = styled.div`
  margin-top: var(--spacing-xl);
`;

const NoteTitle = styled.h4`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0 0 var(--spacing-sm) 0;
`;

const NoteText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  margin: 0;
  line-height: 1.6;
`;

