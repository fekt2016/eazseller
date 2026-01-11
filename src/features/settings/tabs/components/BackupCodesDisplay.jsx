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
      a.download = 'eazshop-2fa-backup-codes.txt';
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
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-yellow-50);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-yellow-200);
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Title = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
`;

const Warning = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-yellow-800);
  line-height: 1.5;
`;

const CodesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const VisibilityToggle = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: 1px solid var(--color-yellow-300);
  border-radius: var(--border-radius-sm);
  color: var(--color-yellow-800);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    background: var(--color-yellow-100);
    border-color: var(--color-yellow-400);
  }

  svg {
    font-size: var(--font-size-md);
  }
`;

const CodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-yellow-200);
`;

const CodeItem = styled.div`
  padding: var(--spacing-sm);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-sm);
  font-family: 'Courier New', monospace;
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  text-align: center;
  user-select: all;
`;

const Actions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
`;

