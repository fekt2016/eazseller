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
  gap: 1rem;
  padding: 1rem;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #6B7280;
`;

const Instructions = styled.div`
  text-align: center;
  width: 100%;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  line-height: 1.5;
`;

const QRContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: #FFFFFF;
  border-radius: 9px;
  border: 1px solid #6B7280;
`;

const Placeholder = styled.div`
  width: 256px;
  height: 256px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 0.875rem;
`;

const SecretSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SecretLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
`;

const SecretContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  background: #6B7280;
  border-radius: 9px;
  border: 1px solid #6B7280;
`;

const SecretCode = styled.code`
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #6B7280;
  word-break: break-all;
  user-select: all;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #6B7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #6B7280;
    color: #E8920A;
  }

  svg {
    font-size: 0.9rem;
  }
`;

