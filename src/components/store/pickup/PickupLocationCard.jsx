import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaUser, FaPhone, FaEdit, FaTrash, FaCheckCircle, FaStickyNote, FaCompass } from 'react-icons/fa';
import Button from '../../../shared/components/ui/Button';
import Card from '../../ui/Card';
import { PATHS } from '../../../routes/routePaths';
import { ConfirmationModal } from '../../../shared/components/modal/ConfirmationModal';

/**
 * Pickup Location Card Component
 * Displays a single pickup location in the list view
 * 
 * @param {Object} location - Location data object
 * @param {Function} onDelete - Delete handler
 */
const PickupLocationCard = ({ location, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onDelete(location._id);
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
            style={{ color: '#A32D2D' }}
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

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Pickup Location"
        message={`Are you sure you want to delete "${location.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="#ef4444"
      />
    </StyledCard>
  );
};

export default PickupLocationCard;

// Styled Components
const StyledCard = styled(Card)`
  transition: all 0.12s;
  border: 1px solid #F1EFE8;

  &:hover {
    
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #F1EFE8;
`;

const LocationName = styled.h3`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;

  svg {
    color: #E8920A;
    font-size: 0.9rem;
  }
`;

const DefaultBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  background-color: #3B6D11;
  color: #3B6D11;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 1rem;

  svg {
    font-size: 0.8rem;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const InfoLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  min-width: 120px;
  flex-shrink: 0;

  svg {
    color: #9CA3AF;
    font-size: 0.8rem;
  }

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  color: #111827;
  flex: 1;
  word-break: break-word;
`;

const PhoneLink = styled.a`
  color: #E8920A;
  text-decoration: none;
  transition: color 0.12s;

  &:hover {
    color: #E8920A;
    text-decoration: underline;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed #F1EFE8;
  margin: 1rem 0;
`;

const CardFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #F1EFE8;
`;

const DefaultNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: #3B6D11;
  border: 1px solid #3B6D11;
  border-radius: 9px;
  font-size: 0.875rem;
  color: #3B6D11;

  svg {
    color: #3B6D11;
    font-size: 0.9rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

