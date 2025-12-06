import styled from "styled-components";
import { useState, useEffect } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";

export default function VariantMediaUploader({
  images = [],
  onImagesChange,
  maxImages = 5,
}) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const newPreviews = images.map((img) => {
      if (typeof img === "string") return img;
      if (img instanceof File) return URL.createObjectURL(img);
      return "";
    });
    setPreviews(newPreviews);

    // Cleanup object URLs
    return () => {
      newPreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [images]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    onImagesChange([...images, ...filesToAdd]);
    e.target.value = ""; // Reset input
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <MediaUploaderContainer>
      <SectionTitle>Variant Images</SectionTitle>
      <HelperText>
        Upload variant-specific images (max {maxImages} images)
      </HelperText>

      {canAddMore && (
        <UploadArea>
          <UploadInput
            type="file"
            id="variant-images"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            disabled={!canAddMore}
          />
          <UploadLabel htmlFor="variant-images">
            <UploadIcon>
              <FiUploadCloud size={24} />
            </UploadIcon>
            <UploadText>
              Click to upload or drag and drop
            </UploadText>
            <UploadSubtext>
              PNG, JPG, GIF up to 10MB
            </UploadSubtext>
          </UploadLabel>
        </UploadArea>
      )}

      {previews.length > 0 && (
        <ImagesGrid>
          {previews.map((preview, index) => (
            <ImageWrapper key={index}>
              <ImagePreview src={preview} alt={`Variant image ${index + 1}`} />
              <RemoveImageButton
                type="button"
                onClick={() => handleRemoveImage(index)}
                aria-label={`Remove image ${index + 1}`}
              >
                <FiX size={16} />
              </RemoveImageButton>
            </ImageWrapper>
          ))}
        </ImagesGrid>
      )}

      {!canAddMore && (
        <MaxImagesMessage>
          Maximum {maxImages} images allowed. Remove an image to add more.
        </MaxImagesMessage>
      )}
    </MediaUploaderContainer>
  );
}

// Styled Components
const MediaUploaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
`;

const SectionTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  font-family: var(--font-heading);
`;

const HelperText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-family: var(--font-body);
  margin: 0;
`;

const UploadArea = styled.div`
  position: relative;
  width: 100%;
`;

const UploadInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;

  &:focus + label {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &:disabled + label {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const UploadLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-2xl);
  border: 2px dashed var(--color-grey-300);
  border-radius: var(--border-radius-lg);
  background: var(--color-grey-50);
  cursor: pointer;
  transition: var(--transition-base);
  min-height: 200px;

  &:hover {
    border-color: var(--color-primary-400);
    background: var(--color-primary-50);
  }
`;

const UploadIcon = styled.div`
  color: var(--color-grey-400);
  transition: var(--transition-base);

  ${UploadLabel}:hover & {
    color: var(--color-primary-500);
  }
`;

const UploadText = styled.span`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-family: var(--font-body);
`;

const UploadSubtext = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-family: var(--font-body);
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
`;

const ImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 1px solid var(--color-grey-200);
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-red-600);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-cir);
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--shadow-sm);

  &:hover {
    background: var(--color-red-700);
    transform: scale(1.1);
  }
`;

const MaxImagesMessage = styled.div`
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-yellow-50);
  border: 1px solid var(--color-yellow-200);
  border-radius: var(--border-radius-md);
  color: var(--color-yellow-800);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  text-align: center;
`;

