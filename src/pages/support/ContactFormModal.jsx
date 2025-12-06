import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperclip, FaSpinner } from 'react-icons/fa';
import styled from 'styled-components';
import { useCreateTicket } from '../../shared/hooks/useSupport';
import useAuth from '../../shared/hooks/useAuth';
import { useGetSellerOrders } from '../../shared/hooks/useOrder';

/**
 * Contact Form Modal Component
 * Reusable modal for submitting support tickets
 */
const ContactFormModal = ({
  isOpen,
  onClose,
  preselectedDepartment = null,
  role = 'seller',
  departments = [],
  showPriority = false,
  primaryColor = 'var(--color-primary-500)',
  relatedOrderId = null, // Order ID if ticket is related to an order
}) => {
  const { mutateAsync: submitTicket, isPending: isSubmitting } = useCreateTicket();
  const { seller } = useAuth();

  // Fetch seller orders for dropdown (only if seller is authenticated and modal is open)
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useGetSellerOrders({
    enabled: isOpen && !!seller, // Only fetch when modal is open and seller is authenticated
  });

  // Extract orders from response
  const orders = useMemo(() => {
    return ordersData?.data?.data?.orders || [];
  }, [ordersData]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: preselectedDepartment || '',
    subject: '',
    message: '',
    screenshot: null,
    priority: showPriority ? 'Medium' : undefined,
    relatedOrderId: relatedOrderId || '',
  });

  const [errors, setErrors] = useState({});
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  // Auto-fill from user profile
  useEffect(() => {
    if (seller && isOpen) {
      setFormData((prev) => ({
        ...prev,
        name: seller.name || seller.businessName || prev.name,
        email: seller.email || prev.email,
      }));
    }
  }, [seller, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        department: preselectedDepartment || '',
        subject: '',
        message: '',
        screenshot: null,
        priority: showPriority ? 'Medium' : undefined,
        relatedOrderId: relatedOrderId || '',
      });
      setErrors({});
      setScreenshotPreview(null);
    }
  }, [isOpen, preselectedDepartment, showPriority, relatedOrderId]);

  // Update relatedOrderId when prop changes
  useEffect(() => {
    if (relatedOrderId && isOpen) {
      setFormData((prev) => ({
        ...prev,
        relatedOrderId: relatedOrderId,
      }));
    }
  }, [relatedOrderId, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          screenshot: 'Please upload an image file',
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          screenshot: 'File size must be less than 5MB',
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, screenshot: file }));
      setErrors((prev) => ({ ...prev, screenshot: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setFormData((prev) => ({ ...prev, screenshot: null }));
    setScreenshotPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (showPriority && !formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const ticketData = {
        department: formData.department,
        subject: formData.subject,
        title: formData.subject,
        message: formData.message,
        screenshot: formData.screenshot,
        priority: formData.priority || 'medium',
      };

      // Add order reference if provided
      if (formData.relatedOrderId && formData.relatedOrderId.trim()) {
        ticketData.relatedOrderId = formData.relatedOrderId.trim();
      }

      await submitTicket(ticketData);

      // Close modal after successful submission
      // Note: Navigation is handled by the hook's onSuccess callback
      setTimeout(() => {
        onClose();
      }, 500); // Close modal quickly, navigation happens in hook
    } catch (error) {
      // Error is handled by the hook's onError callback
      console.error('Failed to submit ticket:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          $primaryColor={primaryColor}
        >
          <ModalHeader>
            <ModalTitle>Contact Support</ModalTitle>
            <CloseButton onClick={onClose} aria-label="Close modal">
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormBody>
              <FormGroup>
                <Label htmlFor="name">
                  Full Name <Required>*</Required>
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                  $hasError={!!errors.name}
                />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">
                  Email <Required>*</Required>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  $hasError={!!errors.email}
                />
                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="department">
                  Department <Required>*</Required>
                </Label>
                <Select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  $hasError={!!errors.department}
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
                {errors.department && (
                  <ErrorMessage>{errors.department}</ErrorMessage>
                )}
              </FormGroup>

              {/* Order Reference Field - Show if relatedOrderId is provided or if user wants to add one */}
              {(relatedOrderId || role === 'seller') && (
                <FormGroup>
                  <Label htmlFor="relatedOrderId">
                    Related Order {relatedOrderId && <Required>*</Required>}
                  </Label>
                  {relatedOrderId ? (
                    // If order ID is pre-selected, show as read-only
                    <>
                      <Input
                        type="text"
                        id="relatedOrderId"
                        name="relatedOrderId"
                        value={relatedOrderId}
                        disabled
                        $hasError={!!errors.relatedOrderId}
                      />
                      <p style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--color-grey-600)', 
                        marginTop: 'var(--spacing-xs)' 
                      }}>
                        This ticket is linked to order: {relatedOrderId}
                      </p>
                    </>
                  ) : (
                    // Show dropdown for selecting orders
                    <>
                      <Select
                        id="relatedOrderId"
                        name="relatedOrderId"
                        value={formData.relatedOrderId}
                        onChange={handleChange}
                        disabled={isSubmitting || isLoadingOrders}
                        $hasError={!!errors.relatedOrderId}
                      >
                        <option value="">Select an order (optional)</option>
                        {isLoadingOrders ? (
                          <option value="" disabled>Loading orders...</option>
                        ) : ordersError ? (
                          <option value="" disabled>Error loading orders</option>
                        ) : orders.length === 0 ? (
                          <option value="" disabled>No orders found</option>
                        ) : (
                          orders.map((order) => {
                            const orderId = order._id || order.id;
                            const orderNumber = order.orderNumber || order.order?.orderNumber || `#${orderId?.slice(-8)}`;
                            const orderDate = order.createdAt || order.order?.createdAt;
                            const formattedDate = orderDate 
                              ? new Date(orderDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })
                              : '';
                            const status = order.status || order.order?.status || order.currentStatus || 'Unknown';
                            const totalPrice = order.totalPrice || order.order?.totalPrice || 0;
                            const displayText = `${orderNumber} - ${formattedDate} - ${status} - ₦${totalPrice?.toLocaleString() || '0'}`;
                            
                            return (
                              <option key={orderId} value={orderId}>
                                {displayText}
                              </option>
                            );
                          })
                        )}
                      </Select>
                      {isLoadingOrders && (
                        <p style={{ 
                          fontSize: 'var(--font-size-xs)', 
                          color: 'var(--color-grey-600)', 
                          marginTop: 'var(--spacing-xs)' 
                        }}>
                          Loading your orders...
                        </p>
                      )}
                      {ordersError && (
                        <p style={{ 
                          fontSize: 'var(--font-size-xs)', 
                          color: 'var(--color-red-600)', 
                          marginTop: 'var(--spacing-xs)' 
                        }}>
                          Unable to load orders. You can still create a ticket without selecting an order.
                        </p>
                      )}
                      {!isLoadingOrders && !ordersError && orders.length > 0 && (
                        <p style={{ 
                          fontSize: 'var(--font-size-xs)', 
                          color: 'var(--color-grey-600)', 
                          marginTop: 'var(--spacing-xs)' 
                        }}>
                          Select an order if this ticket is related to a specific order
                        </p>
                      )}
                    </>
                  )}
                  {errors.relatedOrderId && (
                    <ErrorMessage>{errors.relatedOrderId}</ErrorMessage>
                  )}
                </FormGroup>
              )}

              {showPriority && (
                <FormGroup>
                  <Label htmlFor="priority">
                    Priority Level <Required>*</Required>
                  </Label>
                  <Select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    $hasError={!!errors.priority}
                  >
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </Select>
                  {errors.priority && (
                    <ErrorMessage>{errors.priority}</ErrorMessage>
                  )}
                </FormGroup>
              )}

              <FormGroup>
                <Label htmlFor="subject">
                  Subject <Required>*</Required>
                </Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief description of your issue"
                  disabled={isSubmitting}
                  $hasError={!!errors.subject}
                />
                {errors.subject && (
                  <ErrorMessage>{errors.subject}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="message">
                  Message <Required>*</Required>
                </Label>
                <TextArea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please provide detailed information about your issue..."
                  rows={6}
                  disabled={isSubmitting}
                  $hasError={!!errors.message}
                />
                {errors.message && (
                  <ErrorMessage>{errors.message}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="screenshot">
                  Screenshot (Optional)
                </Label>
                <FileInputWrapper>
                  <FileInput
                    type="file"
                    id="screenshot"
                    name="screenshot"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                  <FileInputLabel htmlFor="screenshot">
                    <FaPaperclip />
                    <span>
                      {formData.screenshot
                        ? formData.screenshot.name
                        : 'Choose file or drag and drop'}
                    </span>
                  </FileInputLabel>
                </FileInputWrapper>
                {errors.screenshot && (
                  <ErrorMessage>{errors.screenshot}</ErrorMessage>
                )}
                {screenshotPreview && (
                  <ScreenshotPreview>
                    <PreviewImage src={screenshotPreview} alt="Preview" />
                    <RemoveButton type="button" onClick={removeScreenshot}>
                      <FaTimes />
                    </RemoveButton>
                  </ScreenshotPreview>
                )}
              </FormGroup>
            </FormBody>

            <ModalFooter>
              <CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </CancelButton>
              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                $primaryColor={primaryColor}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner" />
                    Submitting...
                  </>
                ) : (
                  'Submit Ticket'
                )}
              </SubmitButton>
            </ModalFooter>
          </Form>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default ContactFormModal;

// Styled Components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-md);
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 60rem;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);
`;

const ModalTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-800);
  margin: 0;
  font-family: var(--font-heading);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--color-grey-500);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-base);

  &:hover {
    background: var(--color-grey-200);
    color: var(--color-grey-700);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const FormBody = styled.div`
  padding: var(--spacing-xl);
  overflow-y: auto;
  flex: 1;
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const Label = styled.label`
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  margin-bottom: var(--spacing-xs);
  font-family: var(--font-heading);
`;

const Required = styled.span`
  color: var(--color-red-600);
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid
    ${(props) =>
      props.$hasError ? 'var(--color-red-500)' : 'var(--color-grey-300)'};
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: ${(props) => props.$primaryColor || 'var(--color-primary-500)'};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError
          ? 'var(--color-red-100)'
          : props.$primaryColor
          ? `${props.$primaryColor}20`
          : 'var(--color-primary-100)'};
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid
    ${(props) =>
      props.$hasError ? 'var(--color-red-500)' : 'var(--color-grey-300)'};
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  background: var(--color-white-0);
  cursor: pointer;
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError
          ? 'var(--color-red-100)'
          : 'var(--color-primary-100)'};
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid
    ${(props) =>
      props.$hasError ? 'var(--color-red-500)' : 'var(--color-grey-300)'};
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-family: var(--font-body);
  color: var(--color-grey-900);
  resize: vertical;
  min-height: 12rem;
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError
          ? 'var(--color-red-100)'
          : 'var(--color-primary-100)'};
  }

  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const FileInputWrapper = styled.div`
  position: relative;
`;

const FileInput = styled.input`
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 2px dashed var(--color-grey-300);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-50);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);

  &:hover {
    border-color: var(--color-primary-500);
    background: var(--color-primary-50);
    color: var(--color-primary-700);
  }

  svg {
    font-size: var(--font-size-md);
  }
`;

const ScreenshotPreview = styled.div`
  position: relative;
  margin-top: var(--spacing-sm);
  display: inline-block;
`;

const PreviewImage = styled.img`
  max-width: 20rem;
  max-height: 15rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-300);
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -0.8rem;
  right: -0.8rem;
  background: var(--color-red-600);
  color: var(--color-white-0);
  border: none;
  border-radius: 50%;
  width: 2.4rem;
  height: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-base);

  &:hover {
    background: var(--color-red-700);
    transform: scale(1.1);
  }
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-red-600);
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);

  @media (max-width: 768px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const CancelButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-white-0);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover:not(:disabled) {
    background: var(--color-grey-50);
    border-color: var(--color-grey-400);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background: ${(props) => props.$primaryColor || 'var(--color-primary-500)'};
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  justify-content: center;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

