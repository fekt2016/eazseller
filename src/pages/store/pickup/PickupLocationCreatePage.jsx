import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import PickupLocationForm from '../../../components/store/pickup/PickupLocationForm';
import { usePickupLocations } from '../../../shared/hooks/pickup/usePickupLocations';
import { PATHS } from '../../../routes/routePaths';
import useDynamicPageTitle from '../../../shared/hooks/useDynamicPageTitle';

/**
 * Pickup Location Create Page
 * Allows sellers to create a new pickup location
 */
const PickupLocationCreatePage = () => {
  const navigate = useNavigate();
  const { createLocation, setDefaultLocation } = usePickupLocations();
  const createMutation = createLocation();
  const setDefaultMutation = setDefaultLocation();

  useDynamicPageTitle({
    title: 'Add Pickup Location - Saiisai Seller',
    description: 'Create a new pickup location for order dispatch',
    defaultTitle: 'Add Pickup Location - Saiisai Seller',
  });

  const handleSubmit = async (formData) => {
    try {
      const result = await createMutation.mutateAsync(formData);
      
      // If this is set as default, update it
      if (formData.isDefault && result?._id) {
        await setDefaultMutation.mutateAsync(result._id);
      }

      // Navigate back to list
      navigate(PATHS.PICKUP_LOCATIONS);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Error creating pickup location:', error);
    }
  };

  const handleCancel = () => {
    navigate(PATHS.PICKUP_LOCATIONS);
  };

  return (
    <PageContainer>
      <PageHeader $padding="lg" $marginBottom="lg">
        <TitleSection>
          <h1>Add Pickup Location</h1>
          <p>Create a new location where dispatch riders can pick up your orders</p>
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
            <FormTitle>Location Details</FormTitle>
          </FormHeader>
          <PickupLocationForm
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending || setDefaultMutation.isPending}
            onCancel={handleCancel}
          />
        </Card>
      </Section>
    </PageContainer>
  );
};

export default PickupLocationCreatePage;

// Styled Components
const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #F1EFE8;
`;

const FormIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  background-color: #FEF3C7;
  color: #E8920A;

  svg {
    font-size: 1.25rem;
  }
`;

const FormTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

