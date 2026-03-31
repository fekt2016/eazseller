import { useState, useRef } from 'react';
import { FaPaperclip, FaSpinner, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';
import { Section } from '../ui/SpacingSystem';
import Button from '../ui/Button';

const ReplyContainer = styled(Section)`
  padding: 1rem;
`;

const ReplyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 12rem;
  padding: 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  font-size: 0.9rem;
  
  color: #111827;
  background: #FFFFFF;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #E8920A;
    box-shadow: 0 0 0 3px rgba(43, 122, 255, 0.1);
  }
  
  &::placeholder {
    color: #D1D5DB;
  }
`;

const AttachmentsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #F9F8F5;
  border-radius: 9px;
  border: 1px solid #F1EFE8;
  min-height: 6rem;
  align-items: flex-start;
`;

const AttachmentPreview = styled.div`
  position: relative;
  width: 8rem;
  height: 8rem;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  overflow: hidden;
  background: #FFFFFF;
`;

const AttachmentImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AttachmentName = styled.div`
  padding: 1rem;
  font-size: 0.8rem;
  color: #374151;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #FFFFFF;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #FFFFFF;
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
  gap: 1rem;
  padding: 1rem 1rem;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 9px;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  
  &:hover {
    background: #F9F8F5;
    border-color: #E8920A;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  
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

