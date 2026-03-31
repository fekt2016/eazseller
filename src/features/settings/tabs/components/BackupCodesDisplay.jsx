import React, { useState } from 'react';
import styled from 'styled-components';
import { FaDownload, FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../../../../shared/components/ui/Button';

const BackupCodesDisplay = ({ backupCodes, onRegenerate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (backupCodes && backupCodes.length > 0) {
      const codesText = backupCodes.join('\n');
      navigator.clipboard.writeText(codesText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (backupCodes && backupCodes.length > 0) {
      const codesText = backupCodes.join('\n');
      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'saiisai-2fa-backup-codes.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!backupCodes || backupCodes.length === 0) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>Backup Codes</Title>
        <Warning>
          Save these codes in a safe place. You can use them to access your account if you lose your authenticator device.
        </Warning>
      </Header>

      <CodesContainer>
        <VisibilityToggle onClick={() => setIsVisible(!isVisible)}>
          {isVisible ? <FaEyeSlash /> : <FaEye />}
          {isVisible ? 'Hide Codes' : 'Show Codes'}
        </VisibilityToggle>

        {isVisible && (
          <CodesGrid>
            {backupCodes.map((code, index) => (
              <CodeItem key={index}>{code}</CodeItem>
            ))}
          </CodesGrid>
        )}
      </CodesContainer>

      <Actions>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={copied}
        >
          <FaCopy />
          {copied ? 'Copied!' : 'Copy All'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
        >
          <FaDownload />
          Download
        </Button>
        {onRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
          >
            Regenerate Codes
          </Button>
        )}
      </Actions>
    </Container>
  );
};

export default BackupCodesDisplay;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #854F0B;
  border-radius: 12px;
  border: 1px solid #854F0B;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #6B7280;
`;

const Warning = styled.p`
  font-size: 0.875rem;
  color: #854F0B;
  line-height: 1.5;
`;

const CodesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VisibilityToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  background: transparent;
  border: 1px solid #854F0B;
  border-radius: 6px;
  color: #854F0B;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    background: #854F0B;
    border-color: #854F0B;
  }

  svg {
    font-size: 0.9rem;
  }
`;

const CodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: #FFFFFF;
  border-radius: 9px;
  border: 1px solid #854F0B;
`;

const CodeItem = styled.div`
  padding: 1rem;
  background: #6B7280;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  text-align: center;
  user-select: all;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

