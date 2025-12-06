import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaUser, FaPhone, FaEdit, FaTrash, FaCheckCircle, FaStickyNote, FaCompass } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import Card from '../../ui/Card';
import { PATHS } from '../../../routes/routePaths';

/**
 * Pickup Location Card Component
 * Displays a single pickup location in the list view
 * 
 * @param {Object} location - Location data object
 * @param {Function} onDelete - Delete handler
 */
const PickupLocationCard = ({ location, onDelete }) => {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      onDelete(location._id);
    }
  };

  return (
    <StyledCard variant="elevated" $padding="lg">
      <CardHeader>
        <LocationName>
          <FaMapMarkerAlt />
          {location.name}
          {location.isDefault && (
            <DefaultBadge>
              <FaCheckCircle /> Default
            </DefaultBadge>
          )}
        </LocationName>
        <CardActions>
          <Button
            as={Link}
            to={PATHS.PICKUP_LOCATION_EDIT.replace(':id', location._id)}
            variant="outline"
            size="sm"
            $iconOnly
            title="Edit Location"
          >
            <FaEdit />
          </Button>
          <Button
            variant="outline"
            size="sm"
            $iconOnly
            onClick={handleDelete}
            title="Delete Location"
            style={{ color: 'var(--color-red-600)' }}
          >
            <FaTrash />
          </Button>
        </CardActions>
      </CardHeader>

      <CardContent>
        <InfoRow>
          <InfoLabel>Region:</InfoLabel>
          <InfoValue>{location.region}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>City/Town:</InfoLabel>
          <InfoValue>{location.city}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>Address:</InfoLabel>
          <InfoValue>{location.address}</InfoValue>
        </InfoRow>

        {location.digitalAddress && (
          <InfoRow>
            <InfoLabel>
              <FaCompass /> Digital Address:
            </InfoLabel>
            <InfoValue>{location.digitalAddress}</InfoValue>
          </InfoRow>
        )}

        <Divider />

        <InfoRow>
          <InfoLabel>
            <FaUser /> Contact:
          </InfoLabel>
          <InfoValue>{location.contactName}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>
            <FaPhone /> Phone:
          </InfoLabel>
          <InfoValue>
            <PhoneLink href={`tel:${location.contactPhone}`}>
              {location.contactPhone}
            </PhoneLink>
          </InfoValue>
        </InfoRow>

        {location.notes && (
          <>
            <Divider />
            <InfoRow>
              <InfoLabel>
                <FaStickyNote /> Notes:
              </InfoLabel>
              <InfoValue>{location.notes}</InfoValue>
            </InfoRow>
          </>
        )}
      </CardContent>

      {location.isDefault && (
        <CardFooter>
          <DefaultNotice>
            <FaCheckCircle /> This is your default pickup location. Dispatch riders will use this address unless you specify otherwise during order preparation.
          </DefaultNotice>
        </CardFooter>
      )}
    </StyledCard>
  );
};

export default PickupLocationCard;

// Styled Components
const StyledCard = styled(Card)`
  transition: all var(--transition-base);
  border: 1px solid var(--color-grey-200);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-grey-200);
`;

const LocationName = styled.h3`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;
  flex: 1;

  svg {
    color: var(--color-primary-500);
    font-size: var(--font-size-md);
  }
`;

const DefaultBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-green-100);
  color: var(--color-green-700);
  border-radius: var(--border-radius-cir);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  margin-left: var(--spacing-sm);

  svg {
    font-size: var(--font-size-xs);
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const InfoRow = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
`;

const InfoLabel = styled.span`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  min-width: 120px;
  flex-shrink: 0;

  svg {
    color: var(--color-grey-500);
    font-size: var(--font-size-xs);
  }

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const InfoValue = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-900);
  flex: 1;
  word-break: break-word;
`;

const PhoneLink = styled.a`
  color: var(--color-primary-600);
  text-decoration: none;
  transition: color var(--transition-base);

  &:hover {
    color: var(--color-primary-700);
    text-decoration: underline;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed var(--color-grey-200);
  margin: var(--spacing-sm) 0;
`;

const CardFooter = styled.div`
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-grey-200);
`;

const DefaultNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-green-50);
  border: 1px solid var(--color-green-200);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-green-800);

  svg {
    color: var(--color-green-600);
    font-size: var(--font-size-md);
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

