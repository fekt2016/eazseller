import { useState } from 'react';
import { FaFile, FaFilePdf, FaFileImage, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';

const AttachmentsContainer = styled.div`
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-grey-200);
`;

const AttachmentsTitle = styled.h4`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-heading);
`;

const AttachmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--spacing-sm);
`;

const AttachmentItem = styled.div`
  position: relative;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--color-primary-500);
    box-shadow: var(--shadow-sm);
  }
`;

const AttachmentThumbnail = styled.div`
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-grey-50);
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AttachmentIcon = styled.div`
  font-size: 2.4rem;
  color: var(--color-grey-400);
`;

const AttachmentName = styled.div`
  padding: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-grey-700);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-body);
`;

const ImagePreview = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
`;

const PreviewImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: var(--color-white-0);
  border: none;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-grey-900);
  font-size: 1.6rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--color-grey-100);
  }
`;

const getFileIcon = (url) => {
  const extension = url?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    return <FaFileImage />;
  }
  if (extension === 'pdf') {
    return <FaFilePdf />;
  }
  return <FaFile />;
};

const isImage = (url) => {
  const extension = url?.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
};

/**
 * Ticket Attachments Component
 * Displays ticket attachments with thumbnails and preview
 */
export default function TicketAttachments({ attachments = [] }) {
  const [previewImage, setPreviewImage] = useState(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <>
      <AttachmentsContainer>
        <AttachmentsTitle>Attachments ({attachments.length})</AttachmentsTitle>
        <AttachmentsGrid>
          {attachments.map((attachment, index) => {
            const url = attachment.url || attachment;
            const name = attachment.name || attachment.filename || `Attachment ${index + 1}`;
            const isImg = isImage(url);

            return (
              <AttachmentItem
                key={index}
                onClick={() => isImg && setPreviewImage(url)}
              >
                <AttachmentThumbnail>
                  {isImg ? (
                    <img src={url} alt={name} />
                  ) : (
                    <AttachmentIcon>{getFileIcon(url)}</AttachmentIcon>
                  )}
                </AttachmentThumbnail>
                <AttachmentName title={name}>{name}</AttachmentName>
              </AttachmentItem>
            );
          })}
        </AttachmentsGrid>
      </AttachmentsContainer>

      {previewImage && (
        <ImagePreview onClick={() => setPreviewImage(null)}>
          <CloseButton onClick={() => setPreviewImage(null)}>
            <FaTimes />
          </CloseButton>
          <PreviewImage src={previewImage} alt="Preview" />
        </ImagePreview>
      )}
    </>
  );
}

