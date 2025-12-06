import { useState, useRef } from 'react';
import { FaPaperclip, FaSpinner, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';
import { Section } from '../ui/SpacingSystem';
import Button from '../ui/Button';

const ReplyContainer = styled(Section)`
  padding: var(--spacing-lg);
`;

const ReplyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 12rem;
  padding: var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background: var(--color-white-0);
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(43, 122, 255, 0.1);
  }
  
  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const AttachmentsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  min-height: 6rem;
  align-items: flex-start;
`;

const AttachmentPreview = styled.div`
  position: relative;
  width: 8rem;
  height: 8rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background: var(--color-white-0);
`;

const AttachmentImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AttachmentName = styled.div`
  padding: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-grey-700);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--color-white-0);
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: var(--color-white-0);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-body);
  
  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-primary-500);
  }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const isImage = (file) => {
  return file.type?.startsWith('image/');
};

/**
 * Ticket Reply Box Component
 * Form for replying to a ticket with message and attachments
 */
export default function TicketReplyBox({ onSubmit, isLoading, disabled }) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) {
      return;
    }
    onSubmit({ message: message.trim(), attachments });
    setMessage('');
    setAttachments([]);
  };

  return (
    <ReplyContainer>
      <ReplyForm onSubmit={handleSubmit}>
        <TextArea
          placeholder="Type your reply here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading || disabled}
          required
        />

        {attachments.length > 0 && (
          <AttachmentsSection>
            {attachments.map((file, index) => (
              <AttachmentPreview key={index}>
                {isImage(file) ? (
                  <AttachmentImage
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                  />
                ) : (
                  <AttachmentName>{file.name}</AttachmentName>
                )}
                <RemoveButton
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <FaTimes />
                </RemoveButton>
              </AttachmentPreview>
            ))}
          </AttachmentsSection>
        )}

        <ActionsRow>
          <FileInputLabel>
            <FaPaperclip />
            Attach Files
            <FileInput
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              disabled={isLoading || disabled}
            />
          </FileInputLabel>

          <Button
            type="submit"
            variant="primary"
            disabled={(!message.trim() && attachments.length === 0) || isLoading || disabled}
            isLoading={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reply'}
          </Button>
        </ActionsRow>
      </ReplyForm>
    </ReplyContainer>
  );
}

