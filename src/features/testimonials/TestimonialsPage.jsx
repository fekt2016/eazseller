import { useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { FaStar, FaEdit, FaTrash, FaQuoteLeft, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetMyTestimonial,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
} from "../../shared/hooks/useTestimonial";
import { LoadingSpinner } from "../../shared/components/LoadingSpinner";
import usePageTitle from "../../shared/hooks/usePageTitle";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const STATUS_CONFIG = {
  pending: { label: "Pending Review", icon: <FaClock />, color: "#B45309", bg: "#FEF3C7" },
  approved: { label: "Approved", icon: <FaCheckCircle />, color: "#15803D", bg: "#DCFCE7" },
  rejected: { label: "Rejected", icon: <FaTimesCircle />, color: "#B91C1C", bg: "#FEE2E2" },
};

export default function TestimonialsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: testimonial, isLoading } = useGetMyTestimonial();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();

  usePageTitle({
    title: "Testimonials - Seller Dashboard | Saiisai",
    description: "Share your experience selling on Saiisai",
    keywords: "testimonials, seller, Saiisai",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim().length < 10) return;

    if (testimonial && isEditing) {
      await updateMutation.mutateAsync({
        id: testimonial._id,
        data: { content: content.trim(), rating },
      });
    } else {
      await createMutation.mutateAsync({ content: content.trim(), rating });
    }
    setIsEditing(false);
    setContent("");
    setRating(5);
  };

  const handleEdit = () => {
    setContent(testimonial.content);
    setRating(testimonial.rating);
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your testimonial?")) {
      await deleteMutation.mutateAsync(testimonial._id);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setContent("");
    setRating(5);
  };

  if (isLoading) {
    return (
      <Page>
        <LoadingSpinner />
      </Page>
    );
  }

  const showForm = !testimonial || isEditing;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Page>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <PageHeader>
          <HeaderLeft>
            <PageTitle>My Testimonial</PageTitle>
            <PageSub>Share your experience selling on Saiisai</PageSub>
          </HeaderLeft>
        </PageHeader>
      </motion.div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FormCard onSubmit={handleSubmit}>
              <FormTitle>
                {isEditing ? "Edit Your Testimonial" : "Write Your Testimonial"}
              </FormTitle>
              <FormDescription>
                Tell other sellers about your experience. Your testimonial will appear on our
                homepage once approved.
              </FormDescription>

              <RatingSection>
                <RatingLabel>Your Rating</RatingLabel>
                <Stars>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarButton
                      key={star}
                      type="button"
                      $active={star <= (hoveredStar || rating)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setRating(star)}
                    >
                      <FaStar />
                    </StarButton>
                  ))}
                  <RatingText>{rating} out of 5</RatingText>
                </Stars>
              </RatingSection>

              <TextAreaWrapper>
                <Label>Your Experience</Label>
                <TextArea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share what you love about selling on Saiisai — how it has helped your business, what makes it different, or any feature you particularly enjoy..."
                  rows={5}
                  maxLength={500}
                />
                <CharCount $near={content.length > 400}>
                  {content.length}/500
                </CharCount>
              </TextAreaWrapper>

              <ButtonGroup>
                {isEditing && (
                  <CancelButton type="button" onClick={handleCancel}>
                    Cancel
                  </CancelButton>
                )}
                <SubmitButton
                  type="submit"
                  disabled={content.trim().length < 10 || isSaving}
                >
                  {isSaving
                    ? "Submitting..."
                    : isEditing
                    ? "Update Testimonial"
                    : "Submit Testimonial"}
                </SubmitButton>
              </ButtonGroup>
            </FormCard>
          </motion.div>
        ) : (
          <motion.div
            key="testimonial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TestimonialCard>
              <CardTop>
                <QuoteIcon>
                  <FaQuoteLeft />
                </QuoteIcon>
                <StatusBadge $status={testimonial.status}>
                  {STATUS_CONFIG[testimonial.status]?.icon}
                  {STATUS_CONFIG[testimonial.status]?.label}
                </StatusBadge>
              </CardTop>

              <TestimonialContent>"{testimonial.content}"</TestimonialContent>

              <CardBottom>
                <Stars>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      color={star <= testimonial.rating ? "#E8920A" : "#E5E7EB"}
                      size={18}
                    />
                  ))}
                </Stars>

                <ActionButtons>
                  <IconButton onClick={handleEdit} title="Edit">
                    <FaEdit />
                  </IconButton>
                  <IconButton
                    $danger
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    title="Delete"
                  >
                    <FaTrash />
                  </IconButton>
                </ActionButtons>
              </CardBottom>

              {testimonial.status === "rejected" && testimonial.adminNote && (
                <RejectionNote>
                  <strong>Feedback:</strong> {testimonial.adminNote}
                </RejectionNote>
              )}

              {testimonial.status === "pending" && (
                <InfoBanner>
                  Your testimonial is under review. It will appear on the homepage once approved.
                </InfoBanner>
              )}

              {testimonial.status === "approved" && testimonial.isPublished && (
                <InfoBanner $success>
                  Your testimonial is live on the Saiisai homepage!
                </InfoBanner>
              )}
            </TestimonialCard>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}

// Styled Components
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PageHeader = styled.div`
  background: #ffffff;
  border: 0.5px solid #f1efe8;
  border-radius: 12px;
  border-left: 3px solid #e8920a;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const PageTitle = styled.h1`
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const PageSub = styled.p`
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
`;

const FormCard = styled.form`
  background: #ffffff;
  border: 0.5px solid #f1efe8;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const FormTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const FormDescription = styled.p`
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
`;

const RatingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RatingLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
`;

const Stars = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RatingText = styled.span`
  font-size: 0.8rem;
  color: #9ca3af;
  margin-left: 0.5rem;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.15rem;
  font-size: 1.5rem;
  color: ${(props) => (props.$active ? "#E8920A" : "#E5E7EB")};
  transition: color 0.15s, transform 0.15s;

  &:hover {
    transform: scale(1.15);
    color: #e8920a;
  }
`;

const TextAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #111827;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: #e8920a;
    box-shadow: 0 0 0 3px rgba(232, 146, 10, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const CharCount = styled.span`
  font-size: 0.75rem;
  color: ${(props) => (props.$near ? "#B45309" : "#9CA3AF")};
  text-align: right;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const SubmitButton = styled.button`
  height: 40px;
  padding: 0 1.5rem;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  background: #e8920a;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: opacity 0.12s;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  height: 40px;
  padding: 0 1.5rem;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
  border: none;
  cursor: pointer;
  transition: background 0.12s;

  &:hover {
    background: #e5e7eb;
  }
`;

const TestimonialCard = styled.div`
  background: #ffffff;
  border: 0.5px solid #f1efe8;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const QuoteIcon = styled.div`
  font-size: 1.5rem;
  color: #e8920a;
  opacity: 0.4;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;

  ${(props) => {
    const config = STATUS_CONFIG[props.$status] || STATUS_CONFIG.pending;
    return css`
      color: ${config.color};
      background: ${config.bg};
    `;
  }}
`;

const TestimonialContent = styled.p`
  font-size: 1rem;
  color: #374151;
  line-height: 1.7;
  margin: 0;
  font-style: italic;
`;

const CardBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: ${(props) => (props.$danger ? "#B91C1C" : "#6B7280")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.12s;

  &:hover {
    border-color: ${(props) => (props.$danger ? "#B91C1C" : "#E8920A")};
    color: ${(props) => (props.$danger ? "#B91C1C" : "#E8920A")};
    background: ${(props) => (props.$danger ? "#FEE2E2" : "#FEF3C7")};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const RejectionNote = styled.div`
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.5;
`;

const InfoBanner = styled.div`
  background: ${(props) => (props.$success ? "#DCFCE7" : "#FEF3C7")};
  color: ${(props) => (props.$success ? "#15803D" : "#92400E")};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.5;
`;
