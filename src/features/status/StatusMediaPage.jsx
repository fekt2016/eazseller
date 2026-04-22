import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FaPlayCircle, FaRedo, FaTrash, FaUpload, FaVideo } from 'react-icons/fa';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import {
  useCreateStatusVideo,
  useDeleteStatusVideo,
  useMyStatusVideos,
  useRepostStatusVideo,
} from '../../shared/hooks/useStatusVideos';
import useProduct from '../products/useProduct';
import useAuth from '../../shared/hooks/useAuth';

const MAX_CAPTION = 150;

export default function StatusMediaPage() {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [playingStatus, setPlayingStatus] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { seller } = useAuth();
  const sellerId = seller?._id || seller?.id;
  const { useGetAllProductBySeller } = useProduct();
  const { data: sellerProductsData } = useGetAllProductBySeller(sellerId);

  const { data: statuses = [], isLoading, isError, refetch } = useMyStatusVideos(true);
  const createMutation = useCreateStatusVideo();
  const deleteMutation = useDeleteStatusVideo();
  const repostMutation = useRepostStatusVideo();

  const sellerProducts = useMemo(() => {
    const raw =
      sellerProductsData?.data?.data ||
      sellerProductsData?.data?.products ||
      sellerProductsData?.products ||
      sellerProductsData;

    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.map((product) => ({
      id: String(product?._id || product?.id || ''),
      name: product?.name || 'Unnamed product',
    })).filter((product) => product.id);
  }, [sellerProductsData]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return sellerProducts;
    return sellerProducts.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
  }, [productSearch, sellerProducts]);

  const sortedStatuses = useMemo(
    () =>
      [...statuses].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ),
    [statuses]
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (file.type !== 'video/mp4') {
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || createMutation.isPending) return;

    await createMutation.mutateAsync({
      file: selectedFile,
      caption: caption.trim() || undefined,
      productId: selectedProductId || undefined,
    });
    setCaption('');
    clearSelection();
    setSelectedProductId('');
    setProductSearch('');
    setIsComposerOpen(false);
  };

  const handleDelete = (statusId) => {
    if (!statusId) return;
    const sid = String(statusId);
    if (
      deleteMutation.isPending &&
      String(deleteMutation.variables ?? '') === sid
    ) {
      return;
    }
    if (
      repostMutation.isPending &&
      String(repostMutation.variables ?? '') === sid
    ) {
      return;
    }
    const confirmed = window.confirm('Delete this status video?');
    if (!confirmed) return;
    deleteMutation.mutate(statusId);
  };

  const handleRepost = (statusId) => {
    if (!statusId) return;
    const sid = String(statusId);
    if (
      repostMutation.isPending &&
      String(repostMutation.variables ?? '') === sid
    ) {
      return;
    }
    if (
      deleteMutation.isPending &&
      String(deleteMutation.variables ?? '') === sid
    ) {
      return;
    }
    repostMutation.mutate(statusId);
  };

  const repostTargetId = repostMutation.isPending
    ? String(repostMutation.variables ?? '')
    : '';
  const deleteTargetId = deleteMutation.isPending
    ? String(deleteMutation.variables ?? '')
    : '';

  const isRepostingRow = (rawId) =>
    Boolean(rawId) && repostTargetId === String(rawId);
  const isDeletingRow = (rawId) =>
    Boolean(rawId) && deleteTargetId === String(rawId);

  return (
    <Page>
      <HeaderCard>
        <HeaderRow>
          <TitleRow>
            <FaVideo />
            <h1>My Status Videos</h1>
          </TitleRow>
          <PrimaryButton type="button" onClick={() => setIsComposerOpen((prev) => !prev)}>
            <FaUpload />
            {isComposerOpen ? 'Close' : 'Add'}
          </PrimaryButton>
        </HeaderRow>
        <p>
          Share a video status to reach buyers in their feed. Repost or delete
          only affects the video you choose—other videos stay available.
        </p>
      </HeaderCard>

      {isComposerOpen ? (
        <UploadCard onSubmit={handleSubmit}>
          <UploadTitle>Post a status video</UploadTitle>
          <UploadField>
            <label htmlFor="status-video-file">Video (MP4)</label>
            <input
              id="status-video-file"
              type="file"
              accept="video/mp4"
              onChange={handleFileChange}
            />
          </UploadField>

          {previewUrl ? (
            <PreviewWrap>
              <video src={previewUrl} controls />
            </PreviewWrap>
          ) : null}

          <UploadField>
            <label htmlFor="status-caption">Caption (optional)</label>
            <textarea
              id="status-caption"
              value={caption}
              maxLength={MAX_CAPTION}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a short caption"
            />
            <small>
              {caption.length}/{MAX_CAPTION}
            </small>
          </UploadField>

          <UploadField>
            <label htmlFor="status-product">Linked product (optional)</label>
            <input
              id="status-product-search"
              type="text"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search products by name"
            />
            <select
              id="status-product"
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
            >
              <option value="">None</option>
              {filteredProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <small>
              {filteredProducts.length} of {sellerProducts.length} products
            </small>
          </UploadField>

          <ActionRow>
            <SecondaryButton type="button" onClick={clearSelection}>
              Clear
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={!selectedFile || createMutation.isPending}
            >
              <FaUpload />
              {createMutation.isPending ? 'Posting...' : 'Post status'}
            </PrimaryButton>
          </ActionRow>
        </UploadCard>
      ) : null}

      <ListCard>
        <ListHeader>
          <h2>My status videos</h2>
          <SecondaryButton type="button" onClick={() => refetch()}>
            Refresh
          </SecondaryButton>
        </ListHeader>

        {isLoading ? <LoadingSpinner /> : null}
        {isError ? <ErrorText>Could not load status videos.</ErrorText> : null}
        {!isLoading && !isError && sortedStatuses.length === 0 ? (
          <EmptyText>No status videos yet. Use Add to post your first one.</EmptyText>
        ) : null}

        <VideoGrid>
          {sortedStatuses.map((item) => {
            const id = item?._id || item?.id;
            return (
              <VideoCard key={id}>
                <VideoThumb onClick={() => setPlayingStatus(item)}>
                  <FaPlayCircle />
                </VideoThumb>
                <VideoMeta>
                  <Caption>{item?.caption || 'No caption'}</Caption>
                  {item?.product?.name ? (
                    <ProductMeta>Product: {item.product.name}</ProductMeta>
                  ) : null}
                  <Timestamp>
                    {item?.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : 'Unknown date'}
                  </Timestamp>
                  <ViewCount>
                    {(() => {
                      const totalViews = Number(item?.viewCount ?? item?.views ?? 0);
                      const safeViews = Number.isFinite(totalViews) && totalViews > 0
                        ? Math.floor(totalViews)
                        : 0;
                      return `${safeViews} view${safeViews === 1 ? '' : 's'}`;
                    })()}
                  </ViewCount>
                </VideoMeta>
                <StatusActions>
                  <RepostButton
                    type="button"
                    onClick={() => handleRepost(id)}
                    disabled={isRepostingRow(id) || isDeletingRow(id)}
                    aria-label={`Repost this video (${item?.caption?.slice(0, 40) || 'no caption'})`}
                  >
                    <FaRedo />
                    {isRepostingRow(id) ? 'Reposting…' : 'Repost this video'}
                  </RepostButton>
                  <DeleteButton
                    type="button"
                    onClick={() => handleDelete(id)}
                    disabled={isDeletingRow(id) || isRepostingRow(id)}
                  >
                    <FaTrash />
                    {isDeletingRow(id) ? 'Deleting…' : 'Delete'}
                  </DeleteButton>
                </StatusActions>
              </VideoCard>
            );
          })}
        </VideoGrid>
      </ListCard>

      {playingStatus?.video ? (
        <VideoModalBackdrop onClick={() => setPlayingStatus(null)}>
          <VideoModal onClick={(event) => event.stopPropagation()}>
            <video src={playingStatus.video} controls autoPlay />
            <VideoModalBar>
              <ModalViewCount>
                {(() => {
                  const totalViews = Number(
                    playingStatus?.viewCount ?? playingStatus?.views ?? 0
                  );
                  const safeViews =
                    Number.isFinite(totalViews) && totalViews > 0
                      ? Math.floor(totalViews)
                      : 0;
                  return `${safeViews} view${safeViews === 1 ? '' : 's'}`;
                })()}
              </ModalViewCount>
              <ModalRepostButton
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  const vid = playingStatus?._id || playingStatus?.id;
                  if (vid) handleRepost(vid);
                }}
                disabled={
                  isRepostingRow(playingStatus?._id || playingStatus?.id) ||
                  isDeletingRow(playingStatus?._id || playingStatus?.id)
                }
              >
                <FaRedo />
                {isRepostingRow(playingStatus?._id || playingStatus?.id)
                  ? 'Reposting…'
                  : 'Repost this video'}
              </ModalRepostButton>
              <ModalCloseButton
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPlayingStatus(null);
                }}
              >
                Close
              </ModalCloseButton>
            </VideoModalBar>
          </VideoModal>
        </VideoModalBackdrop>
      ) : null}
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeaderCard = styled.section`
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 12px;
  padding: 1rem 1.25rem;

  p {
    margin: 0.5rem 0 0;
    color: #6b7280;
    font-size: 0.9rem;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  h1 {
    margin: 0;
    font-size: 1.1rem;
  }
`;

const UploadCard = styled.form`
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: grid;
  gap: 0.85rem;
`;

const UploadTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
`;

const UploadField = styled.div`
  display: grid;
  gap: 0.35rem;

  label {
    font-size: 0.85rem;
    color: #374151;
    font-weight: 600;
  }

  input[type='file'],
  textarea,
  select {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0.65rem;
    font-size: 0.9rem;
  }

  textarea {
    min-height: 84px;
    resize: vertical;
  }

  small {
    color: #6b7280;
    font-size: 0.75rem;
  }
`;

const PreviewWrap = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  max-width: 420px;

  video {
    width: 100%;
    display: block;
    background: #000;
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
`;

const BaseButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 0.6rem 0.95rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

const PrimaryButton = styled(BaseButton)`
  background: #e8920a;
  color: #111827;
`;

const SecondaryButton = styled(BaseButton)`
  background: #f3f4f6;
  color: #374151;
`;

const ListCard = styled.section`
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 12px;
  padding: 1rem 1.25rem;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;

  h2 {
    margin: 0;
    font-size: 1rem;
  }
`;

const VideoGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
`;

const VideoCard = styled.article`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;

`;

const VideoThumb = styled.button`
  width: 100%;
  aspect-ratio: 16 / 10;
  border: none;
  background: #111827;
  color: rgba(255, 255, 255, 0.92);
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 2.4rem;
`;

const VideoMeta = styled.div`
  padding: 0.7rem 0.8rem 0;
`;

const Caption = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #1f2937;
`;

const Timestamp = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  color: #6b7280;
`;

const ViewCount = styled.p`
  margin: 0.3rem 0 0;
  font-size: 0.75rem;
  color: #374151;
  font-weight: 600;
`;

const ProductMeta = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  color: #374151;
`;

const DeleteButton = styled(BaseButton)`
  background: #fee2e2;
  color: #b91c1c;
`;

const StatusActions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 0.8rem 0.8rem;
`;

const RepostButton = styled(BaseButton)`
  background: #fff3ee;
  color: #ff6b35;
  border: 1px solid rgba(255, 107, 53, 0.35);

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const EmptyText = styled.p`
  margin: 0;
  color: #6b7280;
`;

const ErrorText = styled.p`
  margin: 0;
  color: #b91c1c;
`;

const VideoModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  padding: 1rem;
`;

const VideoModal = styled.div`
  width: min(960px, 92vw);
  max-height: 86vh;
  background: #000;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  video {
    width: 100%;
    flex: 1;
    min-height: 0;
    max-height: min(72vh, calc(86vh - 3.5rem));
    display: block;
    background: #000;
  }
`;

const VideoModalBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  background: #111827;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
`;

const ModalViewCount = styled.p`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #e5e7eb;
`;

const ModalRepostButton = styled(BaseButton)`
  background: #fff3ee;
  color: #ff6b35;
  border: 1px solid rgba(255, 107, 53, 0.35);

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const ModalCloseButton = styled(BaseButton)`
  background: #f3f4f6;
  color: #374151;
`;
