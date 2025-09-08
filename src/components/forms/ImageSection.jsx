import styled from "styled-components";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FiUploadCloud, FiX } from "react-icons/fi";

export default function ImageSection({ isSubmitting }) {
  const { watch, setValue } = useFormContext();
  const [coverPreview, setCoverPreview] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  // Watch form values for images
  const imageCover = watch("imageCover");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const images = watch("images") || [];

  // Sync cover preview
  useEffect(() => {
    if (typeof imageCover === "string") {
      setCoverPreview(imageCover);
    } else if (imageCover instanceof File) {
      const preview = URL.createObjectURL(imageCover);
      setCoverPreview(preview);
    } else {
      setCoverPreview("");
    }
  }, [imageCover]);

  // Sync images previews
  useEffect(() => {
    const previews = images.map((img) => {
      if (typeof img === "string") return img;
      if (img instanceof File) return URL.createObjectURL(img);
      return "";
    });

    setImagePreviews(previews);
  }, [images]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
      imagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [coverPreview, imagePreviews]);

  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("imageCover", file);
    }
  };

  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setValue("images", [...images, ...files]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setValue("images", newImages);
  };

  return (
    <ImageSectionContainer>
      <SectionTitle>Product Images</SectionTitle>

      {/* Cover Image Upload */}
      <ImageUploadCard>
        <UploadLabel>Cover Image *</UploadLabel>
        <UploadArea>
          <UploadIcon>
            <FiUploadCloud />
          </UploadIcon>
          <UploadText>
            <strong>Click to upload</strong> or drag and drop
          </UploadText>
          <UploadText>Recommended size: 1200x800 pixels</UploadText>
          <FileInput
            type="file"
            accept="image/*"
            onChange={handleCoverImage}
            disabled={isSubmitting}
          />
        </UploadArea>

        {coverPreview && (
          <PreviewContainer>
            <PreviewTitle>Cover Preview</PreviewTitle>
            <CoverPreview>
              <CoverImage src={coverPreview} alt="Cover preview" />
            </CoverPreview>
          </PreviewContainer>
        )}
      </ImageUploadCard>

      {/* Additional Images Upload */}
      <ImageUploadCard>
        <UploadLabel>Additional Images</UploadLabel>
        <UploadArea>
          <UploadIcon>
            <FiUploadCloud />
          </UploadIcon>
          <UploadText>
            <strong>Click to upload</strong> or drag and drop
          </UploadText>
          <UploadText>You can select multiple images</UploadText>
          <FileInput
            type="file"
            multiple
            accept="image/*"
            onChange={handleAdditionalImages}
            disabled={isSubmitting}
          />
        </UploadArea>

        {imagePreviews.length > 0 && (
          <PreviewContainer>
            <PreviewTitle>Additional Images Preview</PreviewTitle>
            <PreviewGrid>
              {imagePreviews.map((preview, index) => (
                <ImagePreview key={index}>
                  <PreviewImage src={preview} alt={`Product ${index + 1}`} />
                  <RemoveButton
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isSubmitting}
                  >
                    <FiX />
                  </RemoveButton>
                </ImagePreview>
              ))}
            </PreviewGrid>
          </PreviewContainer>
        )}
      </ImageUploadCard>
    </ImageSectionContainer>
  );
}

// Styled components remain the same
const ImageSectionContainer = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ImageUploadCard = styled.div`
  padding: 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const UploadLabel = styled.label`
  display: block;
  margin-bottom: 1rem;
  font-weight: 500;
  color: #4a5568;
`;

const UploadArea = styled.div`
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: #3182ce;
    background-color: #f8fafc;
  }
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: #a0aec0;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  margin: 0;
  color: #718096;

  strong {
    color: #3182ce;
    font-weight: 500;
  }
`;

const FileInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
`;

const PreviewContainer = styled.div`
  margin-top: 1.5rem;
`;

const PreviewTitle = styled.h4`
  font-size: 1.1rem;
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 1rem;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  aspect-ratio: 1/1;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  background: rgba(229, 62, 62, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #c53030;
    transform: scale(1.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CoverPreview = styled.div`
  max-width: 400px;
  margin-top: 1rem;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CoverImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
`;
