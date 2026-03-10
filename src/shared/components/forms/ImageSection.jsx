import styled from "styled-components";
import { useEffect, useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { FiUploadCloud } from "react-icons/fi";
import { toast } from "react-toastify";
import { getOptimizedImageUrl, IMAGE_SLOTS } from "../../utils/cloudinaryConfig";
import OptimizedImage from "../OptimizedImage";

// Styled components - defined before component to ensure they're available
const ImageSectionContainer = styled.div`
  margin-bottom: 2rem;
`;

const ImageUploadCard = styled.div`
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  
  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }
`;

const UploadLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
  font-weight: 500;
  color: #1e293b;
  font-size: 0.9375rem;
`;

const Required = styled.span`
  color: #ef4444;
  font-weight: 600;
  margin-left: 0.25rem;
`;

const Optional = styled.span`
  color: #64748b;
  font-weight: 400;
  font-size: 0.8125rem;
  margin-left: 0.25rem;
`;

const HelperText = styled.span`
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 400;
  line-height: 1.4;
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.$hasError ? '#e53e3e' : '#cbd5e0'};
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  background: ${props => props.$hasError ? '#fef2f2' : '#f8fafc'};

  &:hover {
    border-color: ${props => props.$hasError ? '#e53e3e' : 'var(--color-primary-500)'};
    background-color: ${props => props.$hasError ? '#fee2e2' : '#fefce8'};
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const ImageErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.75rem;
  font-weight: 400;
  padding: 0.5rem;
  background: #fed7d7;
  border-radius: 4px;
  border-left: 3px solid #e53e3e;
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: var(--color-primary-500);
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
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
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
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
  object-fit: contain;
  background-color: #f8fafc;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  background: rgba(229, 62, 62, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 32px; /* Touch-friendly */
  min-height: 32px;
  z-index: 10;

  &:hover {
    background: #c53030;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    top: 0.375rem;
    right: 0.375rem;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const CoverPreview = styled.div`
  max-width: 400px;
  margin-top: 1rem;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  aspect-ratio: 1 / 1;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-grey-200);
`;

export default function ImageSection({ isSubmitting }) {
  const { watch, setValue, register, trigger, formState: { errors } } = useFormContext();
  const [coverPreview, setCoverPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");

  // Refs to track files
  const coverImageRef = useRef(null);
  const videoRef = useRef(null);

  // Watch form values for previews
  const imageCover = watch("imageCover");
  const video = watch("video");

  // Update refs when values change
  useEffect(() => {
    if (imageCover) coverImageRef.current = imageCover;
  }, [imageCover]);

  useEffect(() => {
    if (video) videoRef.current = video;
  }, [video]);

  // Register imageCover for validation
  useEffect(() => {
    register("imageCover", {
      required: "Please upload a cover image for your product",
      validate: (value) => {
        if (!value || (typeof value === 'string' && value === '')) {
          return "Please upload a cover image for your product";
        }
        return true;
      }
    });
  }, [register]);

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

  // Sync video preview
  useEffect(() => {
    if (typeof video === "string") {
      setVideoPreview(video);
    } else if (video instanceof File) {
      const preview = URL.createObjectURL(video);
      setVideoPreview(preview);
    } else {
      setVideoPreview("");
    }
  }, [video]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
      if (videoPreview && videoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [coverPreview, videoPreview]);

  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("imageCover", file, { shouldValidate: true, shouldDirty: true });
      coverImageRef.current = file;
      trigger("imageCover");
      e.target.value = '';
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Check file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video file size must be less than 50MB");
        return;
      }

      // 2. Check video duration (20s)
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = function () {
        window.URL.revokeObjectURL(videoElement.src);
        const duration = videoElement.duration;

        if (duration > 20.5) { // Allowing a tiny buffer for browser rounding
          toast.error("Product video must be 20 seconds or less");
          setValue("video", "", { shouldValidate: true });
          return;
        }

        setValue("video", file, { shouldValidate: true, shouldDirty: true });
        videoRef.current = file;
      };

      videoElement.onerror = function () {
        toast.error("Invalid video file");
        window.URL.revokeObjectURL(videoElement.src);
      };

      videoElement.src = URL.createObjectURL(file);
      e.target.value = '';
    }
  };

  return (
    <ImageSectionContainer>
      {/* Cover Image Upload */}
      <ImageUploadCard>
        <UploadLabel>
          Cover Image <Required>*</Required>
          <HelperText>This is the main image customers will see first</HelperText>
        </UploadLabel>
        <UploadArea $hasError={!!errors.imageCover}>
          <UploadIcon>
            <FiUploadCloud />
          </UploadIcon>
          <UploadText>
            <strong>Click to upload</strong> or drag and drop
          </UploadText>
          <UploadText>Recommended: 1200x800 pixels (JPG, PNG, WebP)</UploadText>
          <FileInput
            type="file"
            accept="image/*"
            onChange={handleCoverImage}
            disabled={isSubmitting}
            name="imageCover"
            key={`cover-image-${imageCover ? 'has-file' : 'no-file'}`}
          />
        </UploadArea>
        {errors.imageCover && (
          <ImageErrorMessage>{errors.imageCover.message}</ImageErrorMessage>
        )}

        {coverPreview && (
          <PreviewContainer>
            <PreviewTitle>Cover Preview</PreviewTitle>
            <CoverPreview>
              <OptimizedImage
                src={coverPreview}
                slot={IMAGE_SLOTS.FORM_PREVIEW}
                aspectRatio="1/1"
                alt="Cover preview"
                objectFit="contain"
              />
            </CoverPreview>
          </PreviewContainer>
        )}
      </ImageUploadCard>

      {/* Video Upload */}
      <ImageUploadCard>
        <UploadLabel>
          Product Video <Optional>(Optional)</Optional>
          <HelperText>Adding a video helps customers see your product in action (Max 20 seconds)</HelperText>
        </UploadLabel>
        <UploadArea $hasError={!!errors.video}>
          <UploadIcon>
            <FiUploadCloud />
          </UploadIcon>
          <UploadText>
            <strong>Click to upload</strong> or drag and drop
          </UploadText>
          <UploadText>Supported: All video formats (Max 50MB, Max 20s)</UploadText>
          <FileInput
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={isSubmitting}
            name="video"
          />
        </UploadArea>
        {errors.video && (
          <ImageErrorMessage>{errors.video.message}</ImageErrorMessage>
        )}

        {videoPreview && (
          <PreviewContainer>
            <PreviewTitle>Video Preview</PreviewTitle>
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
              <video
                src={videoPreview}
                controls
                style={{ width: '100%', maxHeight: '400px', borderRadius: '8px' }}
              />
              <RemoveButton
                type="button"
                onClick={() => setValue("video", "", { shouldDirty: true })}
              >
                ×
              </RemoveButton>
            </div>
          </PreviewContainer>
        )}
      </ImageUploadCard>
    </ImageSectionContainer>
  );
}
