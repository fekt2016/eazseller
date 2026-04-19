import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import { FiUploadCloud, FiVideo, FiX, FiMove } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MAX_TOTAL_IMAGES = 8;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 20.5;

const formatBytes = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let val = bytes;
  let idx = 0;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx += 1;
  }
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
};

export default function ImageSection({ isSubmitting }) {
  const {
    watch,
    setValue,
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext();

  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoChecking, setVideoChecking] = useState(false);

  const imageCover = watch('imageCover');
  const images = watch('images') || [];
  const video = watch('video');

  const [coverPreview, setCoverPreview] = useState('');
  const [gallerySrc, setGallerySrc] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');

  useEffect(() => {
    let blobUrl = '';
    if (imageCover instanceof File) {
      blobUrl = URL.createObjectURL(imageCover);
      setCoverPreview(blobUrl);
    } else if (typeof imageCover === 'string') {
      setCoverPreview(imageCover);
    } else {
      setCoverPreview('');
    }
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [imageCover]);

  useEffect(() => {
    const blobUrls = [];
    const urls = images.map((img) => {
      if (img instanceof File) {
        const u = URL.createObjectURL(img);
        blobUrls.push(u);
        return u;
      }
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object' && img.url) return img.url;
      return '';
    });
    setGallerySrc(urls);
    return () => {
      blobUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [images]);

  useEffect(() => {
    let blobUrl = '';
    if (video instanceof File) {
      blobUrl = URL.createObjectURL(video);
      setVideoPreview(blobUrl);
    } else if (typeof video === 'string') {
      setVideoPreview(video);
    } else {
      setVideoPreview('');
    }
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [video]);

  const remainingGallerySlots = Math.max(0, MAX_TOTAL_IMAGES - 1 - images.length);

  register('imageCover', {
    validate: () => {
      const cover = getValues('imageCover');
      const gallery = getValues('images') || [];
      const hasCover =
        cover instanceof File ||
        (typeof cover === 'string' && cover.trim()) ||
        (!!cover && typeof cover === 'object' && String(cover.url || '').trim());
      const hasGallery = gallery.some(
        (img) =>
          img instanceof File ||
          (typeof img === 'string' && img.trim()) ||
          (!!img && typeof img === 'object' && String(img.url || '').trim()),
      );
      if (hasCover || hasGallery) return true;
      return 'Please add at least one product image (cover or additional photos).';
    },
  });

  const validateImageFile = (file) => {
    if (!file) return false;
    if (!file.type?.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or less');
      return false;
    }
    return true;
  };

  const onSelectCover = (e) => {
    const file = e.target.files?.[0];
    if (!file || !validateImageFile(file)) {
      e.target.value = '';
      return;
    }
    setValue('imageCover', file, { shouldDirty: true, shouldValidate: true });
    trigger('imageCover');
    e.target.value = '';
  };

  const onSelectGallery = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const valid = selected.filter(validateImageFile);
    if (!valid.length) {
      e.target.value = '';
      return;
    }

    const next = [...images];
    for (const file of valid) {
      if (next.length >= MAX_TOTAL_IMAGES - 1) break;
      next.push(file);
    }
    setValue('images', next, { shouldDirty: true, shouldValidate: true });
    e.target.value = '';
  };

  const removeGalleryImage = (idx) => {
    const next = [...images];
    next.splice(idx, 1);
    setValue('images', next, { shouldDirty: true, shouldValidate: true });
  };

  const reorderGallery = (from, to) => {
    if (from == null || to == null || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setValue('images', next, { shouldDirty: true, shouldValidate: true });
  };

  const onDropSlot = (toIndex) => {
    reorderGallery(dragIndex, toIndex);
    setDragIndex(null);
  };

  const onSelectVideo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith('video/')) {
      toast.error('Please choose a valid video file');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error('Video file size must be less than 50MB');
      e.target.value = '';
      return;
    }

    setVideoChecking(true);
    setVideoProgress(15);

    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src);
      if (videoEl.duration > MAX_VIDEO_SECONDS) {
        toast.error('Product video must be 20 seconds or less');
        setVideoChecking(false);
        setVideoProgress(0);
        setValue('video', '', { shouldDirty: true, shouldValidate: true });
        return;
      }
      setVideoProgress(100);
      setValue('video', file, { shouldDirty: true, shouldValidate: true });
      setTimeout(() => {
        setVideoChecking(false);
        setVideoProgress(0);
      }, 300);
    };
    videoEl.onerror = () => {
      toast.error('Invalid video file');
      window.URL.revokeObjectURL(videoEl.src);
      setVideoChecking(false);
      setVideoProgress(0);
    };
    videoEl.src = URL.createObjectURL(file);
    e.target.value = '';
  };

  const removeVideo = () => {
    setValue('video', '', { shouldDirty: true, shouldValidate: true });
    setVideoProgress(0);
    setVideoChecking(false);
  };

  return (
    <Stack>
      <Card>
        <LabelRow>
          <FieldLabel>
            Cover image <Required>*</Required>
          </FieldLabel>
        </LabelRow>
        <Helper>
          Recommended: 1200×800px · JPG, PNG, WebP · Max 5MB
        </Helper>

        {!coverPreview ? (
          <Dropzone $error={!!errors.imageCover}>
            <IconBubble>
              <FiUploadCloud size={18} />
            </IconBubble>
            <DropTitle>Drop your cover photo here</DropTitle>
            <DropSub>Choose a clear product image buyers see first.</DropSub>
            <PrimaryAction
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={isSubmitting}
            >
              Choose file
            </PrimaryAction>
            <HiddenInput
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={onSelectCover}
            />
          </Dropzone>
        ) : (
          <CoverWrap>
            <CoverBadge>Cover</CoverBadge>
            <CoverPreview>
              <CoverImg src={coverPreview} alt="Cover image" />
            </CoverPreview>
            <InlineActions>
              <InlineLink
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isSubmitting}
              >
                Replace photo
              </InlineLink>
              <InlineDanger
                type="button"
                onClick={() => setValue('imageCover', '', { shouldDirty: true, shouldValidate: true })}
                disabled={isSubmitting}
              >
                Remove
              </InlineDanger>
            </InlineActions>
            <HiddenInput
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={onSelectCover}
            />
          </CoverWrap>
        )}

        {errors.imageCover ? (
          <ErrorText>{errors.imageCover.message}</ErrorText>
        ) : null}
      </Card>

      <Card>
        <LabelRow>
          <FieldLabel>Additional photos</FieldLabel>
          <Optional>Optional</Optional>
        </LabelRow>
        <Helper>{images.length} / {MAX_TOTAL_IMAGES - 1} photos added</Helper>

        <Grid>
          {images.map((img, idx) => (
            <Thumb
              key={`${typeof img === 'string' ? img : img.name}-${idx}`}
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropSlot(idx)}
            >
              <ThumbImage src={gallerySrc[idx] || ''} alt={`Additional ${idx + 1}`} />
              <DeleteBtn type="button" onClick={() => removeGalleryImage(idx)}>
                <FiX size={12} />
              </DeleteBtn>
              <DragHandle>
                <FiMove size={11} />
              </DragHandle>
            </Thumb>
          ))}

          {Array.from({ length: remainingGallerySlots }).map((_, idx) => (
            <EmptySlot key={`empty-${idx}`} onClick={() => galleryInputRef.current?.click()}>
              + Add photo
            </EmptySlot>
          ))}
        </Grid>

        <HiddenInput
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onSelectGallery}
        />

        <Tips>
          <TipsTitle>Photo tips for more sales</TipsTitle>
          <Tip>Natural lighting — shoot near a window</Tip>
          <Tip>Clean white or neutral background</Tip>
          <Tip>Show all angles — front, back, side, detail</Tip>
          <Tip>Min 800×800px for sharp display in buyer app</Tip>
        </Tips>
      </Card>

      <Card>
        <LabelRow>
          <FieldLabel>Product video</FieldLabel>
          <Optional>Optional</Optional>
        </LabelRow>

        {!videoPreview ? (
          <VideoZone>
            <GreyBubble>
              <FiVideo size={18} />
            </GreyBubble>
            <DropTitle>Add a product video</DropTitle>
            <DropSub>Helps customers see your product in action.</DropSub>
            <DropSub>All formats · Max 50MB · Max 20 seconds</DropSub>

            {videoChecking ? (
              <VideoProgressWrap>
                <VideoProgressTrack>
                  <VideoProgressFill style={{ width: `${videoProgress}%` }} />
                </VideoProgressTrack>
                <VideoProgressText>Uploading video... {videoProgress}%</VideoProgressText>
              </VideoProgressWrap>
            ) : null}

            <GhostAction
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={isSubmitting || videoChecking}
            >
              Choose video
            </GhostAction>

            <HiddenInput
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={onSelectVideo}
            />
          </VideoZone>
        ) : (
          <VideoPreviewWrap>
            <video src={videoPreview} controls style={{ width: '100%', borderRadius: 10 }} />
            <Meta>
              <span>{video instanceof File ? video.name : 'Product video'}</span>
              <span>{video instanceof File ? formatBytes(video.size) : ''}</span>
            </Meta>
            <InlineActions>
              <InlineLink
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={isSubmitting}
              >
                Replace video
              </InlineLink>
              <InlineDanger type="button" onClick={removeVideo} disabled={isSubmitting}>
                Remove
              </InlineDanger>
            </InlineActions>
            <HiddenInput
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={onSelectVideo}
            />
          </VideoPreviewWrap>
        )}
      </Card>
    </Stack>
  );
}

const Stack = styled.div`
  display: grid;
  gap: 14px;
`;

const Card = styled.section`
  background: #ffffff;
  border: 0.5px solid #ece7df;
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 10px;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const FieldLabel = styled.h4`
  margin: 0;
  font-size: 0.8125rem;
  color: #111827;
  font-weight: 600;
`;

const Required = styled.span`
  color: #a32d2d;
`;

const Optional = styled.span`
  font-size: 0.6875rem;
  color: #64748b;
  border: 0.5px solid #e2e8f0;
  border-radius: 999px;
  padding: 2px 8px;
`;

const Helper = styled.p`
  margin: 0;
  font-size: 0.6875rem;
  color: #6b7280;
`;

const Dropzone = styled.div`
  width: 100%;
  min-height: 280px;
  border: 1.5px dashed ${({ $error }) => ($error ? '#a32d2d' : '#e8920a')};
  background: ${({ $error }) => ($error ? '#fcebeb' : '#fdf3e3')};
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-sizing: border-box;
`;

const IconBubble = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #e8920a;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const GreyBubble = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #f1efe8;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const DropTitle = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1f2937;
`;

const DropSub = styled.p`
  margin: 0;
  font-size: 0.6875rem;
  color: #6b7280;
`;

const PrimaryAction = styled.button`
  height: 32px;
  border: 0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
  background: #e8920a;
  cursor: pointer;
`;

const GhostAction = styled.button`
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  background: #ffffff;
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ErrorText = styled.div`
  font-size: 0.75rem;
  color: #a32d2d;
`;

const CoverWrap = styled.div`
  display: grid;
  gap: 8px;
`;

const CoverBadge = styled.span`
  display: inline-flex;
  width: fit-content;
  font-size: 0.625rem;
  font-weight: 600;
  color: #854f0b;
  border: 1px solid rgba(232, 146, 10, 0.35);
  background: #fdf3e3;
  border-radius: 999px;
  padding: 3px 8px;
`;

const CoverPreview = styled.div`
  position: relative;
  width: 100%;
  min-height: 280px;
  aspect-ratio: 16 / 10;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const CoverImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const InlineActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const InlineLink = styled.button`
  border: 0;
  background: transparent;
  color: #e8920a;
  font-size: 0.75rem;
  cursor: pointer;
`;

const InlineDanger = styled.button`
  border: 0;
  background: transparent;
  color: #a32d2d;
  font-size: 0.75rem;
  cursor: pointer;
`;

const Grid = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;

  @media (min-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Thumb = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  min-height: 120px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const ThumbImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const DeleteBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 999px;
  background: #ffffff;
  color: #374151;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const DragHandle = styled.div`
  position: absolute;
  left: 4px;
  bottom: 4px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const EmptySlot = styled.button`
  aspect-ratio: 1;
  min-height: 120px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Tips = styled.div`
  border: 0.5px solid #ece7df;
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
  display: grid;
  gap: 6px;
`;

const TipsTitle = styled.p`
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #374151;
`;

const Tip = styled.p`
  margin: 0;
  font-size: 0.6875rem;
  color: #4b5563;

  &::before {
    content: '• ';
    color: #e8920a;
  }
`;

const VideoZone = styled.div`
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  padding: 16px;
  text-align: center;
  display: grid;
  justify-items: center;
  gap: 8px;
`;

const VideoProgressWrap = styled.div`
  width: 100%;
  max-width: 320px;
`;

const VideoProgressTrack = styled.div`
  height: 6px;
  width: 100%;
  border-radius: 999px;
  background: #f1efe8;
  overflow: hidden;
`;

const VideoProgressFill = styled.div`
  height: 100%;
  background: #e8920a;
  transition: width 0.2s ease;
`;

const VideoProgressText = styled.p`
  margin: 6px 0 0 0;
  font-size: 0.6875rem;
  color: #6b7280;
`;

const VideoPreviewWrap = styled.div`
  display: grid;
  gap: 8px;
`;

const Meta = styled.div`
  font-size: 0.6875rem;
  color: #6b7280;
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;
