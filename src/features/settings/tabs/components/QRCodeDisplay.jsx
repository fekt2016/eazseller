import React from 'react';
import styled from 'styled-components';
import { QRCodeSVG } from 'qrcode.react';
import { FaCopy } from 'react-icons/fa';

const QRCodeDisplay = ({ otpAuthUrl, secret, onCopySecret }) => {
  const handleCopySecretClick = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      if (onCopySecret) {
        onCopySecret();
      }
    }
  };

  return (
    <Container>
      <Instructions>
        <Title>Scan QR Code</Title>
        <Description>
          Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
        </Description>
      </Instructions>
      
      <QRContainer>
        {otpAuthUrl ? (
          <QRCodeSVG value={otpAuthUrl} size={256} level="M" />
        ) : (
          <Placeholder>Loading QR code...</Placeholder>
        )}
      </QRContainer>

      {secret && (
        <SecretSection>
          <SecretLabel>Or enter this secret manually:</SecretLabel>
          <SecretContainer>
            <SecretCode>{secret}</SecretCode>
            <CopyButton onClick={handleCopySecretClick} title="Copy secret">
              <FaCopy />
            </CopyButton>
          </SecretContainer>
        </SecretSection>
      )}
    </Container>
  );
};

export default QRCodeDisplay;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
`;

const Instructions = styled.div`
  text-align: center;
  width: 100%;
`;

const Title = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
`;

const Description = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  line-height: 1.5;
`;

const QRContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-white-0);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const Placeholder = styled.div`
  width: 256px;
  height: 256px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-500);
  font-size: var(--font-size-sm);
`;

const SecretSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const SecretLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  color: var(--color-grey-700);
`;

const SecretContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const SecretCode = styled.code`
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: var(--font-size-sm);
  color: var(--color-grey-900);
  word-break: break-all;
  user-select: all;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
  background: transparent;
  border: none;
  color: var(--color-grey-600);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-grey-100);
    color: var(--color-primary-600);
  }

  svg {
    font-size: var(--font-size-md);
  }
`;

