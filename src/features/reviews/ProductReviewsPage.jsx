import styled from "styled-components";
import { useState, useMemo } from "react";
import { FaStar, FaReply, FaFlag } from "react-icons/fa";
import { useGetSellerReviews, useReplyToReview } from "../../shared/hooks/useReview";
import { LoadingState, ErrorState } from "../../shared/components/ui/LoadingComponents";

export default function ProductReviewsPage() {
  const [filter, setFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);

  const { data: reviewsData, isLoading } = useGetSellerReviews({
    status: filter !== "all" ? filter : undefined,
  });

  const replyMutation = useReplyToReview();

  const reviews = useMemo(() => {
    if (!reviewsData) return [];
    if (Array.isArray(reviewsData)) return reviewsData;
    return reviewsData?.results || [];
  }, [reviewsData]);

  const handleReply = async () => {
    if (!replyText.trim() || !selectedReview) return;

    try {
      await replyMutation.mutateAsync({
        id: selectedReview._id || selectedReview.id,
        reply: replyText.trim(),
      });
      setShowReplyModal(false);
      setSelectedReview(null);
      setReplyText("");
    } catch (error) {
      console.error("Failed to reply:", error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} filled={i < rating} />
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#166534";
      case "pending":
        return "#854d0e";
      case "rejected":
        return "#b91c1c";
      case "flagged":
        return "#92400e";
      default:
        return "#64748b";
    }
  };

  if (isLoading) return <LoadingState message="Loading reviews..." />;

  return (
    <Container>
      <Header>
        <Title>Product Reviews</Title>
        <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="flagged">Flagged</option>
        </FilterSelect>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatValue>{reviews.length}</StatValue>
          <StatLabel>Total Reviews</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
              : "0.0"}
          </StatValue>
          <StatLabel>Average Rating</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {reviews.filter((r) => r.rating === 5).length}
          </StatValue>
          <StatLabel>5-Star Reviews</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {reviews.filter((r) => r.rating <= 2).length}
          </StatValue>
          <StatLabel>Low Ratings (≤2)</StatLabel>
        </StatCard>
      </StatsGrid>

      <ReviewsList>
        {reviews.length === 0 ? (
          <EmptyState>
            <EmptyMessage>No reviews found for your products</EmptyMessage>
          </EmptyState>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review._id || review.id}>
              <ReviewHeader>
                <ProductInfo>
                  <ProductName>{review.product?.name || "Unknown Product"}</ProductName>
                  <ReviewerName>{review.user?.name || "Anonymous"}</ReviewerName>
                </ProductInfo>
                <Rating>
                  {renderStars(review.rating || 0)}
                  <RatingValue>{review.rating || 0}/5</RatingValue>
                </Rating>
              </ReviewHeader>
              <ReviewBody>
                <ReviewTitle>{review.title || "No title"}</ReviewTitle>
                <ReviewText>{review.review || review.comment || "No review text"}</ReviewText>
                <ReviewMeta>
                  <StatusBadge $color={getStatusColor(review.status || "pending")}>
                    {(review.status || "pending").toUpperCase()}
                  </StatusBadge>
                  <ReviewDate>
                    {new Date(review.reviewDate || review.createdAt).toLocaleDateString()}
                  </ReviewDate>
                </ReviewMeta>
              </ReviewBody>
              {review.sellerReply ? (
                <SellerReply>
                  <ReplyLabel>Your Reply:</ReplyLabel>
                  <ReplyText>{review.sellerReply.reply}</ReplyText>
                  <ReplyDate>
                    {new Date(review.sellerReply.repliedAt).toLocaleDateString()}
                  </ReplyDate>
                </SellerReply>
              ) : (
                <ReviewActions>
                  <ReplyButton
                    onClick={() => {
                      setSelectedReview(review);
                      setShowReplyModal(true);
                    }}
                  >
                    <FaReply /> Reply
                  </ReplyButton>
                </ReviewActions>
              )}
            </ReviewCard>
          ))
        )}
      </ReviewsList>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <ModalOverlay onClick={() => {
          setShowReplyModal(false);
          setSelectedReview(null);
          setReplyText("");
        }}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Reply to Review</ModalTitle>
              <CloseButton onClick={() => {
                setShowReplyModal(false);
                setSelectedReview(null);
                setReplyText("");
              }}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <ReviewPreview>
                <ReviewPreviewText>"{selectedReview.review || selectedReview.comment}"</ReviewPreviewText>
                <ReviewPreviewAuthor>- {selectedReview.user?.name || "Anonymous"}</ReviewPreviewAuthor>
              </ReviewPreview>
              <ReplyTextArea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                rows={5}
              />
              <ModalActions>
                <ModalButton $secondary onClick={() => {
                  setShowReplyModal(false);
                  setSelectedReview(null);
                  setReplyText("");
                }}>
                  Cancel
                </ModalButton>
                <ModalButton
                  $primary
                  onClick={handleReply}
                  disabled={!replyText.trim() || replyMutation.isPending}
                >
                  {replyMutation.isPending ? "Posting..." : "Post Reply"}
                </ModalButton>
              </ModalActions>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ProductInfo = styled.div``;

const ProductName = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const ReviewerName = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StarIcon = styled(FaStar)`
  color: ${({ filled }) => (filled ? "#fbbf24" : "#e2e8f0")};
  font-size: 1rem;
`;

const RatingValue = styled.span`
  font-weight: 600;
  color: #475569;
`;

const ReviewBody = styled.div`
  margin-bottom: 1rem;
`;

const ReviewTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const ReviewText = styled.p`
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ReviewMeta = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
`;

const ReviewDate = styled.span`
  font-size: 0.875rem;
  color: #94a3b8;
`;

const SellerReply = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #6366f1;
  margin-top: 1rem;
`;

const ReplyLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const ReplyText = styled.p`
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const ReplyDate = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ReplyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #4f46e5;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
`;

const EmptyMessage = styled.p`
  color: #64748b;
  font-size: 1.125rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background: #f1f5f9;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ReviewPreview = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ReviewPreviewText = styled.p`
  color: #1e293b;
  font-style: italic;
  margin-bottom: 0.5rem;
`;

const ReviewPreviewAuthor = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  text-align: right;
`;

const ReplyTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  ${({ $primary, $secondary }) => {
    if ($primary) {
      return `
        background: #6366f1;
        color: white;
        &:hover:not(:disabled) {
          background: #4f46e5;
        }
      `;
    }
    if ($secondary) {
      return `
        background: #f1f5f9;
        color: #475569;
        &:hover:not(:disabled) {
          background: #e2e8f0;
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

