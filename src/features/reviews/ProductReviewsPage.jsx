import styled from "styled-components";
import { useState, useMemo } from "react";
import { FaStar, FaReply, FaBoxOpen, FaTimes } from "react-icons/fa";
import { useGetSellerReviews, useReplyToReview } from "../../shared/hooks/useReview";
import { ErrorState, SkeletonTableRows, EmptyState } from "../../shared/components/ui/LoadingComponents";

const FILTERS = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "flagged",  label: "Flagged" },
];

const STATUS_CONFIG = {
  approved: { bg: "#DCFCE7", color: "#15803D" },
  pending:  { bg: "#FEF3C7", color: "#B45309" },
  flagged:  { bg: "#FEE2E2", color: "#B91C1C" },
  rejected: { bg: "#FEE2E2", color: "#B91C1C" },
};

function getInitials(name = "") {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function avatarColor(name = "") {
  const colors = ["#E8920A", "#185FA5", "#15803D", "#6D28D9", "#B45309", "#0E7490"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

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

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  const handleReply = async () => {
    if (!replyText.trim() || !selectedReview) return;
    try {
      await replyMutation.mutateAsync({
        id: selectedReview._id || selectedReview.id,
        reply: replyText.trim(),
      });
      closeModal();
    } catch (err) {
      console.error("Failed to reply:", err);
    }
  };

  const closeModal = () => {
    setShowReplyModal(false);
    setSelectedReview(null);
    setReplyText("");
  };

  const renderStars = (rating, size = "0.85rem") => (
    <Stars>
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar key={i} style={{ color: i < rating ? "#F59E0B" : "#E5E7EB", fontSize: size }} />
      ))}
    </Stars>
  );

  if (isLoading) return <Page><SkeletonTableRows count={6} /></Page>;

  return (
    <Page>
      {/* Header */}
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Product Reviews</PageTitle>
          <PageSub>Monitor and respond to customer feedback</PageSub>
        </HeaderLeft>
        <FilterTabs>
          {FILTERS.map((f) => (
            <FilterTab key={f.key} $active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
              {f.key === "all" && reviews.length > 0 && (
                <FilterCount $active={filter === f.key}>{reviews.length}</FilterCount>
              )}
            </FilterTab>
          ))}
        </FilterTabs>
      </PageHeader>

      {/* Stats */}
      <StatsGrid>
        <StatCard $accent="#E8920A">
          <StatTop>
            <StatLabel>Total Reviews</StatLabel>
          </StatTop>
          <StatValue>{reviews.length}</StatValue>
        </StatCard>
        <StatCard $accent="#F59E0B">
          <StatTop>
            <StatLabel>Average Rating</StatLabel>
            {renderStars(Math.round(parseFloat(avgRating)))}
          </StatTop>
          <StatValue>{avgRating}<StatUnit>/5</StatUnit></StatValue>
        </StatCard>
        <StatCard $accent="#15803D">
          <StatTop>
            <StatLabel>5-Star Reviews</StatLabel>
          </StatTop>
          <StatValue>{reviews.filter((r) => r.rating === 5).length}</StatValue>
        </StatCard>
        <StatCard $accent="#B91C1C">
          <StatTop>
            <StatLabel>Low Ratings (≤2)</StatLabel>
          </StatTop>
          <StatValue>{reviews.filter((r) => r.rating <= 2).length}</StatValue>
        </StatCard>
      </StatsGrid>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <EmptyState
          icon={<FaStar size={40} />}
          title="No reviews yet"
          message="Customer reviews for your products will appear here."
        />
      ) : (
        <ReviewsList>
          {reviews.map((review) => {
            const name = review.user?.name || "Anonymous";
            const status = review.status || "pending";
            const cfg = STATUS_CONFIG[status] || { bg: "#F3F4F6", color: "#6B7280" };

            return (
              <ReviewCard key={review._id || review.id}>
                {/* Top row: avatar + reviewer + product + rating + badge */}
                <ReviewTop>
                  <Avatar $bg={avatarColor(name)}>{getInitials(name)}</Avatar>
                  <ReviewerBlock>
                    <ReviewerName>{name}</ReviewerName>
                    <ProductTag>{review.product?.name || "Unknown Product"}</ProductTag>
                  </ReviewerBlock>
                  <ReviewMeta>
                    {renderStars(review.rating || 0)}
                    <RatingNum>{review.rating || 0}/5</RatingNum>
                  </ReviewMeta>
                  <StatusBadge $bg={cfg.bg} $color={cfg.color}>{status}</StatusBadge>
                  <ReviewDate>
                    {new Date(review.reviewDate || review.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </ReviewDate>
                </ReviewTop>

                {/* Review content */}
                <ReviewContent>
                  {review.title && <ReviewTitle>{review.title}</ReviewTitle>}
                  <ReviewText>{review.review || review.comment || "No review text provided."}</ReviewText>
                </ReviewContent>

                {/* Seller reply or reply button */}
                {review.sellerReply ? (
                  <SellerReply>
                    <ReplyMeta>
                      <ReplyLabel>Your reply</ReplyLabel>
                      <ReplyDate>
                        {new Date(review.sellerReply.repliedAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </ReplyDate>
                    </ReplyMeta>
                    <ReplyText>{review.sellerReply.reply}</ReplyText>
                  </SellerReply>
                ) : (
                  <ReviewActions>
                    <ReplyButton onClick={() => { setSelectedReview(review); setShowReplyModal(true); }}>
                      <FaReply size={12} /> Reply
                    </ReplyButton>
                  </ReviewActions>
                )}
              </ReviewCard>
            );
          })}
        </ReviewsList>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Reply to Review</ModalTitle>
              <CloseButton onClick={closeModal}><FaTimes size={13} /></CloseButton>
            </ModalHeader>
            <ModalBody>
              <ReviewPreview>
                <ReviewPreviewText>
                  "{selectedReview.review || selectedReview.comment}"
                </ReviewPreviewText>
                <ReviewPreviewAuthor>— {selectedReview.user?.name || "Anonymous"}</ReviewPreviewAuthor>
              </ReviewPreview>
              <ReplyTextArea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply…"
                rows={4}
              />
              <ModalActions>
                <CancelBtn onClick={closeModal}>Cancel</CancelBtn>
                <SubmitBtn
                  onClick={handleReply}
                  disabled={!replyText.trim() || replyMutation.isPending}
                >
                  {replyMutation.isPending ? "Posting…" : "Post Reply"}
                </SubmitBtn>
              </ModalActions>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Page>
  );
}

/* ── Layout ──────────────────────────────────────────────────────────────── */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  border-left: 3px solid #E8920A;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
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
  color: #9CA3AF;
  margin: 0;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 32px;
  padding: 0 0.875rem;
  border-radius: 20px;
  border: 0.5px solid ${({ $active }) => $active ? "#E8920A" : "#F1EFE8"};
  background: ${({ $active }) => $active ? "#FDF3E3" : "#FFFFFF"};
  color: ${({ $active }) => $active ? "#E8920A" : "#6B7280"};
  font-size: 0.8rem;
  font-weight: ${({ $active }) => $active ? "600" : "400"};
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    border-color: #E8920A;
    color: #E8920A;
  }
`;

const FilterCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  background: ${({ $active }) => $active ? "#E8920A" : "#F1EFE8"};
  color: ${({ $active }) => $active ? "#FFFFFF" : "#6B7280"};
`;

/* ── Stats ───────────────────────────────────────────────────────────────── */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  border-left: 3px solid ${({ $accent }) => $accent};
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
`;

const StatUnit = styled.span`
  font-size: 1rem;
  font-weight: 400;
  color: #9CA3AF;
`;

const Stars = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

/* ── Review cards ────────────────────────────────────────────────────────── */
const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ReviewCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  transition: border-color 0.12s;

  &:hover { border-color: #E8920A; }
`;

const ReviewTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: #FFFFFF;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ReviewerBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
`;

const ReviewerName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductTag = styled.div`
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 0.5rem;
  background: #F9F8F5;
  border: 0.5px solid #F1EFE8;
  border-radius: 6px;
  font-size: 0.7rem;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
`;

const ReviewMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const RatingNum = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #6B7280;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 0.625rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const ReviewDate = styled.span`
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-left: auto;
  white-space: nowrap;
`;

const ReviewContent = styled.div`
  padding-left: 3rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const ReviewTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ReviewText = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  line-height: 1.6;
  margin: 0;
`;

/* ── Seller reply ────────────────────────────────────────────────────────── */
const SellerReply = styled.div`
  margin-left: 3rem;
  background: #F9F8F5;
  border: 0.5px solid #F1EFE8;
  border-left: 3px solid #E8920A;
  border-radius: 9px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const ReplyMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ReplyLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #E8920A;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const ReplyDate = styled.span`
  font-size: 0.72rem;
  color: #9CA3AF;
`;

const ReplyText = styled.p`
  font-size: 0.875rem;
  color: #374151;
  margin: 0;
  line-height: 1.5;
`;

const ReviewActions = styled.div`
  padding-left: 3rem;
`;

const ReplyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 30px;
  padding: 0 0.875rem;
  background: transparent;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  color: #6B7280;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    background: #FDF3E3;
    border-color: #E8920A;
    color: #E8920A;
  }
`;

/* ── Modal ───────────────────────────────────────────────────────────────── */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
`;

const ModalContent = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 0.5px solid #F1EFE8;
`;

const ModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: #9CA3AF;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;

  &:hover { background: #F9F8F5; color: #111827; }
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`;

const ReviewPreview = styled.blockquote`
  background: #F9F8F5;
  border: 0.5px solid #F1EFE8;
  border-left: 3px solid #E8920A;
  border-radius: 9px;
  padding: 0.75rem 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const ReviewPreviewText = styled.p`
  font-size: 0.875rem;
  color: #374151;
  font-style: italic;
  margin: 0;
  line-height: 1.5;
`;

const ReviewPreviewAuthor = styled.span`
  font-size: 0.8rem;
  color: #9CA3AF;
`;

const ReplyTextArea = styled.textarea`
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.875rem;
  color: #111827;
  background: #F9F8F5;
  font-family: inherit;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.12s, background 0.12s;

  &:focus { border-color: #E8920A; background: #FFFFFF; }
  &::placeholder { color: #9CA3AF; }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const CancelBtn = styled.button`
  height: 36px;
  padding: 0 1rem;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  background: #F3F4F6;
  color: #374151;
  border: 0.5px solid #F1EFE8;
  transition: background 0.12s;

  &:hover { background: #E5E7EB; }
`;

const SubmitBtn = styled.button`
  height: 36px;
  padding: 0 1.25rem;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  background: #E8920A;
  color: #FFFFFF;
  border: none;
  transition: opacity 0.12s;

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
