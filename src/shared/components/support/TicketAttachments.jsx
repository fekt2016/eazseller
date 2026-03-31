import { useState } from 'react';
import { FaFile, FaFilePdf, FaFileImage, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';
import { getOptimizedImageUrl, IMAGE_SLOTS } from '../../utils/cloudinaryConfig';

const AttachmentsContainer = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #F1EFE8;
`;

const AttachmentsTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  
`;

const AttachmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
`;

const AttachmentItem = styled.div`
  position: relative;
  border: 1px solid #F1EFE8;
  border-radius: 9px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #E8920A;
    
  }
`;

const AttachmentThumbnail = styled.div`
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9F8F5;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AttachmentIcon = styled.div`
  font-size: 2.4rem;
  color: #D1D5DB;
`;

const AttachmentName = styled.div`
  padding: 1rem;
  font-size: 0.8rem;
  color: #374151;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
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
  padding: 1rem;
`;

const PreviewImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #FFFFFF;
  border: none;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #111827;
  font-size: 1.6rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F9F8F5;
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
                    <img src={getOptimizedImageUrl(url, IMAGE_SLOTS.TABLE_THUMB)} alt={name} />
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
          <PreviewImage src={getOptimizedImageUrl(previewImage, IMAGE_SLOTS.PRODUCT_DETAIL)} alt="Preview" />
        </ImagePreview>
      )}
    </>
  );
}

