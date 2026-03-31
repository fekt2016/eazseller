import styled from "styled-components";
import { useState, useEffect } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { getOptimizedImageUrl, IMAGE_SLOTS } from "../../../shared/utils/cloudinaryConfig";

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
              <ImagePreview src={getOptimizedImageUrl(preview, IMAGE_SLOTS.FORM_PREVIEW)} alt={`Variant image ${index + 1}`} />
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
  gap: 1rem;
  padding: 1rem;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #F1EFE8;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  
`;

const HelperText = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  
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
    border-color: #E8920A;
    box-shadow: 0 0 0 3px #E8920A;
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
  gap: 1rem;
  padding: 1rem;
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  background: #F9F8F5;
  cursor: pointer;
  transition: 0.12s;
  min-height: 200px;

  &:hover {
    border-color: #E8920A;
    background: #E8920A;
  }
`;

const UploadIcon = styled.div`
  color: #D1D5DB;
  transition: 0.12s;

  ${UploadLabel}:hover & {
    color: #E8920A;
  }
`;

const UploadText = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  
`;

const UploadSubtext = styled.span`
  font-size: 0.875rem;
  color: #6B7280;
  
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const ImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 9px;
  overflow: hidden;
  border: 1px solid #F1EFE8;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #A32D2D;
  color: #FFFFFF;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.12s;
  

  &:hover {
    background: #A32D2D;
    transform: scale(1.1);
  }
`;

const MaxImagesMessage = styled.div`
  padding: 1rem 1rem;
  background: #854F0B;
  border: 1px solid #854F0B;
  border-radius: 9px;
  color: #854F0B;
  font-size: 0.875rem;
  
  text-align: center;
`;

