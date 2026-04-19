import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PATHS } from '../../routes/routePaths';
import {
  sellerPromoSelectors,
  useMyPromoSubmissions,
  useSellerPromo,
} from '../../shared/hooks/useSellerPromos';
import { formatCurrency, formatDate } from '../../shared/utils/helpers';
import {
  getOptimizedImageUrl,
  IMAGE_SLOTS,
} from '../../shared/utils/cloudinaryConfig';

const getCountdownText = (promo) => {
  const now = Date.now();
  const start = new Date(promo?.startDate).getTime();
  const end = new Date(promo?.endDate).getTime();

  if (Number.isFinite(start) && start > now) {
    const days = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return `${days} day${days === 1 ? '' : 's'} to start`;
  }

  if (Number.isFinite(end) && end > now) {
    const hours = Math.ceil((end - now) / (1000 * 60 * 60));
    return `Live - ends in ${hours}h`;
  }

  return 'Campaign ended';
};

const getSellerUsage = (promo, submissions) => {
  const used = Number(
    promo?.sellerUsage?.used ??
      promo?.sellerSubmissionStats?.used ??
      promo?.sellerSubmissionCount ??
      submissions.length
  );
  const total = Number(promo?.maxProductsPerSeller ?? 0);
  const remaining = total > 0 ? Math.max(total - used, 0) : Infinity;
  return { used, total, remaining };
};

export default function SellerPromoDetailPage() {
  const { id } = useParams();
  const promoQuery = useSellerPromo(id);
  const submissionsQuery = useMyPromoSubmissions({ promoId: id, page: 1, limit: 50 });

  const promo = promoQuery.data?.promo || promoQuery.data || {};
  const submissions = useMemo(
    () => sellerPromoSelectors.submissions(submissionsQuery.data),
    [submissionsQuery.data]
  );
  const usage = getSellerUsage(promo, submissions);
  const submitPath = PATHS.PROMO_SUBMIT.replace(':id', id);

  if (promoQuery.isLoading) return <StateCard>Loading promo details...</StateCard>;
  if (!promo?._id && !promo?.id) return <StateCard>Promo not found.</StateCard>;

  return (
    <Page>
      <Hero>
        <HeroImage
          src={getOptimizedImageUrl(promo?.banner, IMAGE_SLOTS.HOME_HERO)}
          alt={`${promo?.name || 'Promo'} banner`}
        />
        <HeroBody>
          <h1>{promo?.name || 'Promo'}</h1>
          <p>{promo?.description || 'No description provided for this promo yet.'}</p>
          <HeroMeta>{formatDate(promo?.startDate)} - {formatDate(promo?.endDate)}</HeroMeta>
          <HeroMeta>{getCountdownText(promo)}</HeroMeta>
          <SubmitLink
            to={submitPath}
            aria-disabled={usage.remaining <= 0}
            $disabled={usage.remaining <= 0}
            onClick={(event) => {
              if (usage.remaining <= 0) event.preventDefault();
            }}
          >
            {usage.remaining <= 0 ? 'Cap reached' : 'Submit more products'}
          </SubmitLink>
        </HeroBody>
      </Hero>

      <Grid>
        <Card>
          <h2>Promo Rules</h2>
          <RuleRow>
            <span>Minimum discount</span>
            <strong>{Number(promo?.minDiscountPercent || 0)}%</strong>
          </RuleRow>
          <RuleRow>
            <span>Used/Total slots</span>
            <strong>{usage.total > 0 ? `${usage.used}/${usage.total}` : `${usage.used}/No cap`}</strong>
          </RuleRow>
          <RuleRow>
            <span>Remaining slots</span>
            <strong>{usage.remaining === Infinity ? 'Unlimited' : usage.remaining}</strong>
          </RuleRow>
          <RuleRow>
            <span>Eligible categories</span>
            <strong>
              {(promo?.eligibleCategories || []).length > 0
                ? promo.eligibleCategories
                    .map((item) => item?.name || item?.title || 'Category')
                    .join(', ')
                : 'All categories'}
            </strong>
          </RuleRow>
        </Card>

        <Card>
          <h2>Your Submissions</h2>
          {submissions.length === 0 ? (
            <Empty>No submissions yet for this promo.</Empty>
          ) : (
            <SubmissionList>
              {submissions.map((submission) => {
                const submissionId = submission?._id || submission?.id;
                const status = submission?.status || 'pending';
                return (
                  <li key={submissionId}>
                    <div>
                      <strong>
                        {submission?.product?.name || submission?.productName || 'Product'}
                      </strong>
                      <small>
                        {formatCurrency(submission?.regularPrice || 0)}
                        {' -> '}
                        {formatCurrency(submission?.promoPrice || 0)}
                      </small>
                    </div>
                    <StatusBadge $status={status}>{status}</StatusBadge>
                  </li>
                );
              })}
            </SubmissionList>
          )}
        </Card>
      </Grid>
    </Page>
  );
}

const Page = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Hero = styled.article`
  border: 1px solid #ece8df;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
`;

const HeroImage = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
`;

const HeroBody = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  h1 {
    margin: 0;
    font-size: 1.4rem;
    color: #111827;
  }

  p {
    margin: 0;
    color: #4b5563;
  }
`;

const HeroMeta = styled.p`
  margin: 0;
  font-size: 0.86rem;
  color: #6b7280;
`;

const SubmitLink = styled(Link)`
  text-decoration: none;
  margin-top: 0.4rem;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  border-radius: 8px;
  border: 1px solid #e8920a;
  color: ${({ $disabled }) => ($disabled ? '#9ca3af' : '#ffffff')};
  background: ${({ $disabled }) => ($disabled ? '#f3f4f6' : '#e8920a')};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  padding: 0.45rem 0.8rem;
  font-size: 0.84rem;
  font-weight: 600;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 64rem) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Card = styled.article`
  border: 1px solid #ece8df;
  border-radius: 12px;
  background: #ffffff;
  padding: 1rem;

  h2 {
    margin: 0 0 0.7rem;
    font-size: 1.05rem;
    color: #111827;
  }
`;

const RuleRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  border-bottom: 1px solid #f1efe8;
  padding: 0.45rem 0;

  &:last-child {
    border-bottom: 0;
  }

  span {
    color: #6b7280;
    font-size: 0.84rem;
  }

  strong {
    color: #1f2937;
    font-size: 0.84rem;
    text-align: right;
  }
`;

const SubmissionList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;

  li {
    border: 1px solid #f1efe8;
    border-radius: 8px;
    padding: 0.6rem 0.7rem;
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
  }

  strong {
    display: block;
    color: #111827;
    font-size: 0.9rem;
  }

  small {
    color: #6b7280;
    font-size: 0.78rem;
  }
`;

const StatusBadge = styled.span`
  text-transform: uppercase;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  height: fit-content;
  background: ${({ $status }) =>
    $status === 'approved'
      ? '#eaFAf1'
      : $status === 'rejected'
        ? '#fdeDEC'
        : '#fef9e7'};
  color: ${({ $status }) =>
    $status === 'approved'
      ? '#27ae60'
      : $status === 'rejected'
        ? '#e74c3c'
        : '#f39c12'};
`;

const Empty = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.85rem;
`;

const StateCard = styled.div`
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  color: #6b7280;
  padding: 1.2rem;
`;
