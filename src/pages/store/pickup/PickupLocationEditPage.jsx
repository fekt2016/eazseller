import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import {
  PageContainer,
  PageHeader,
  TitleSection,
  Section,
} from '../../../shared/components/ui/SpacingSystem';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../components/ui/Card';
import { LoadingState, ErrorState } from '../../../shared/components/ui/LoadingComponents';
import PickupLocationForm from '../../../components/store/pickup/PickupLocationForm';
import { usePickupLocations } from '../../../shared/hooks/pickup/usePickupLocations';
import { PATHS } from '../../../routes/routePaths';
import useDynamicPageTitle from '../../../shared/hooks/useDynamicPageTitle';

/**
 * Pickup Location Edit Page
 * Allows sellers to update an existing pickup location
 */
const PickupLocationEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getLocationById, updateLocation, setDefaultLocation } = usePickupLocations();
  const { data: location, isLoading, error } = getLocationById(id);
  const updateMutation = updateLocation();
  const setDefaultMutation = setDefaultLocation();

  useDynamicPageTitle({
    title: location ? `Edit ${location.name} - EazSeller` : 'Edit Pickup Location - EazSeller',
    description: 'Update pickup location details',
    defaultTitle: 'Edit Pickup Location - EazSeller',
  });

  const handleSubmit = async (formData) => {
    try {
      await updateMutation.mutateAsync({ id, data: formData });

      // If this is set as default, update it
      if (formData.isDefault) {
        await setDefaultMutation.mutateAsync(id);
      }

      // Navigate back to list
      navigate(PATHS.PICKUP_LOCATIONS);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Error updating pickup location:', error);
    }
  };

  const handleCancel = () => {
    navigate(PATHS.PICKUP_LOCATIONS);
  };

  if (isLoading) {
    return <LoadingState message="Loading location details..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load location. Please try again." />;
  }

  if (!location) {
    return <ErrorState message="Location not found." />;
  }

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Edit Pickup Location</h1>
          <p>Update location details for "{location.name}"</p>
        </TitleSection>
        <Button
          variant="ghost"
          size="md"
          onClick={handleCancel}
        >
          <FaArrowLeft /> Back to Locations
        </Button>
      </PageHeader>

      <Section $marginBottom="lg">
        <Card variant="elevated" $padding="xl">
          <FormHeader>
            <FormIcon>
              <FaMapMarkerAlt />
            </FormIcon>
            <FormTitle>Update Location Details</FormTitle>
          </FormHeader>
          <PickupLocationForm
            initialData={location}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending || setDefaultMutation.isPending}
            onCancel={handleCancel}
          />
        </Card>
      </Section>
    </PageContainer>
  );
};

export default PickupLocationEditPage;

// Styled Components
const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);
`;

const FormIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: var(--border-radius-lg);
  background-color: var(--color-primary-100);
  color: var(--color-primary-600);

  svg {
    font-size: var(--font-size-xl);
  }
`;

const FormTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;
`;

