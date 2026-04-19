import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PATHS } from '../../routes/routePaths';
import {
  sellerPromoSelectors,
  useSellerPromos,
} from '../../shared/hooks/useSellerPromos';
import { formatDate } from '../../shared/utils/helpers';
import {
  getOptimizedImageUrl,
  IMAGE_SLOTS,
} from '../../shared/utils/cloudinaryConfig';

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
];

const getUsage = (promo) => {
  const used = Number(
    promo?.sellerUsage?.used ??
      promo?.sellerSubmissionStats?.used ??
      promo?.sellerSubmissionCount ??
      0
  );
  const total = Number(promo?.maxProductsPerSeller ?? 0);
  return { used, total };
};

const hasReachedCap = (promo) => {
  const usage = getUsage(promo);
  return usage.total > 0 && usage.used >= usage.total;
};

const getCountdownText = (promo, tab) => {
  const now = Date.now();
  const start = new Date(promo?.startDate).getTime();
  const end = new Date(promo?.endDate).getTime();

  if (tab === 'upcoming' && Number.isFinite(start) && start > now) {
    const days = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return `${days} day${days === 1 ? '' : 's'} to start`;
  }

  if (tab === 'active' && Number.isFinite(end) && end > now) {
    const hours = Math.ceil((end - now) / (1000 * 60 * 60));
    return `Live - ends in ${hours}h`;
  }

  return 'Campaign ended';
};

const getPromoBannerUrl = (promo) => {
  const banner = promo?.banner;
  if (!banner) return null;
  if (typeof banner === 'string') return banner;
  if (typeof banner === 'object') {
    return banner.url || banner.secure_url || banner.image || null;
  }
  return null;
};

export default function SellerPromosPage() {
  const [tab, setTab] = useState('active');
  const { data, isLoading } = useSellerPromos({ tab, page: 1, limit: 24 });
  const promos = useMemo(() => sellerPromoSelectors.promos(data), [data]);

  return (
    <Page>
      <Header>
        <Title>Promos</Title>
        <SubTitle>
          Browse active campaigns and submit eligible products for approval.
        </SubTitle>
      </Header>

      <Tabs role='tablist' aria-label='Promo status tabs'>
        {TABS.map((item) => (
          <TabButton
            key={item.id}
            type='button'
            role='tab'
            aria-selected={tab === item.id}
            $active={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </TabButton>
        ))}
      </Tabs>

      {isLoading ? (
        <StateCard>Loading promos...</StateCard>
      ) : promos.length === 0 ? (
        <StateCard>No promos found in this tab.</StateCard>
      ) : (
        <Grid>
          {promos.map((promo) => {
            const promoId = promo?._id || promo?.id;
            const detailPath = PATHS.PROMO_DETAIL.replace(':id', promoId);
            const submitPath = PATHS.PROMO_SUBMIT.replace(':id', promoId);
            const isPast = tab === 'past';
            const capReached = hasReachedCap(promo);
            const disableSubmit = isPast || capReached;
            const usage = getUsage(promo);

            return (
              <Card key={promoId}>
                <Banner
                  src={getOptimizedImageUrl(getPromoBannerUrl(promo), IMAGE_SLOTS.HOME_HERO)}
                  alt={`${promo?.name || 'Promo'} banner`}
                  loading='lazy'
                />
                <CardBody>
                  <TopRow>
                    <h2>{promo?.name || 'Untitled promo'}</h2>
                    <TypeBadge>{promo?.type || 'promo'}</TypeBadge>
                  </TopRow>
                  <Meta>{formatDate(promo?.startDate)} - {formatDate(promo?.endDate)}</Meta>
                  <Meta>Min discount: {Number(promo?.minDiscountPercent || 0)}%</Meta>
                  <Meta>
                    Used/Total:{' '}
                    {usage.total > 0 ? `${usage.used}/${usage.total}` : `${usage.used}/No cap`}
                  </Meta>
                  <Countdown>{getCountdownText(promo, tab)}</Countdown>

                  <Actions>
                    <SecondaryLink to={detailPath}>View details</SecondaryLink>
                    <PrimaryLink
                      to={submitPath}
                      aria-disabled={disableSubmit}
                      $disabled={disableSubmit}
                      onClick={(event) => {
                        if (disableSubmit) event.preventDefault();
                      }}
                    >
                      {capReached ? 'Cap reached' : 'Submit products'}
                    </PrimaryLink>
                  </Actions>
                </CardBody>
              </Card>
            );
          })}
        </Grid>
      )}
    </Page>
  );
}

const Page = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: #111827;
`;

const SubTitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  min-height: 36px;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? '#e8920a' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#fdf3e3' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#b45309' : '#374151')};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 48rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 64rem) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Card = styled.article`
  border: 1px solid #ece8df;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
`;

const Banner = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
`;

const CardBody = styled.div`
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;

  h2 {
    margin: 0;
    font-size: 0.95rem;
    color: #111827;
  }
`;

const TypeBadge = styled.span`
  border-radius: 999px;
  background: #ebf5fb;
  color: #3498db;
  padding: 0.2rem 0.55rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const Meta = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
`;

const Countdown = styled.p`
  margin: 0.1rem 0 0;
  color: #b45309;
  font-size: 0.82rem;
  font-weight: 600;
`;

const Actions = styled.div`
  margin-top: 0.45rem;
  display: flex;
  gap: 0.5rem;
`;

const SecondaryLink = styled(Link)`
  text-decoration: none;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.45rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 600;
`;

const PrimaryLink = styled(Link)`
  text-decoration: none;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e8920a;
  color: ${({ $disabled }) => ($disabled ? '#9ca3af' : '#ffffff')};
  background: ${({ $disabled }) => ($disabled ? '#f3f4f6' : '#e8920a')};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  padding: 0.45rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 600;
`;

const StateCard = styled.div`
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  color: #6b7280;
  padding: 1.2rem;
`;
