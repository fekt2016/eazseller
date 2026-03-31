import styled from 'styled-components';
import { FaTrash, FaTimes } from 'react-icons/fa';

const ConfirmDeleteModal = ({ product, isDeleting, onConfirm, onCancel }) => {
  if (!product) return null;

  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <IconWrap>
            <FaTrash />
          </IconWrap>
          <CloseBtn onClick={onCancel} disabled={isDeleting}>
            <FaTimes />
          </CloseBtn>
        </ModalHeader>

        <ModalBody>
          <Title>Delete product?</Title>
          <Message>
            This will permanently remove{' '}
            <strong>"{product.name}"</strong> and all its variants.
            This action cannot be undone.
          </Message>
        </ModalBody>

        <ModalFooter>
          <CancelBtn type="button" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </CancelBtn>
          <DeleteBtn type="button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete product'}
          </DeleteBtn>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};

export default ConfirmDeleteModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
`;

const Modal = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.25rem 0.85rem;
`;

const IconWrap = styled.div`
  width: 36px;
  height: 36px;
  background: #FCEBEB;
  border: 0.5px solid #FECACA;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A32D2D;
  font-size: 0.9rem;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.12s, color 0.12s;

  &:hover:not(:disabled) {
    background: #F9F8F5;
    color: #111827;
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ModalBody = styled.div`
  padding: 0 1.25rem 1.25rem;
`;

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
`;

const Message = styled.p`
  font-size: 0.9rem;
  color: #6B7280;
  line-height: 1.6;
  margin: 0;

  strong {
    color: #111827;
    font-weight: 600;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 0.85rem 1.25rem;
  border-top: 0.5px solid #F1EFE8;
  background: #FAFAF9;
  border-radius: 0 0 12px 12px;
`;

const CancelBtn = styled.button`
  height: 36px;
  padding: 0 1rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  background: #FFFFFF;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;

  &:hover:not(:disabled) { background: #F9F8F5; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const DeleteBtn = styled.button`
  height: 36px;
  padding: 0 1rem;
  border: 0.5px solid #FECACA;
  border-radius: 9px;
  background: #FCEBEB;
  color: #A32D2D;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;

  &:hover:not(:disabled) { background: #FEE2E2; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
