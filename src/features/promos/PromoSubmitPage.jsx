import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { PATHS } from '../../routes/routePaths';
import {
  sellerPromoSelectors,
  useMyPromoSubmissions,
  useSellerPromo,
  useSellerPromoEligibleProducts,
  useSubmitSellerPromoProducts,
} from '../../shared/hooks/useSellerPromos';
import { formatCurrency } from '../../shared/utils/helpers';
import {
  getOptimizedImageUrl,
  IMAGE_SLOTS,
} from '../../shared/utils/cloudinaryConfig';

const DEFAULT_DISCOUNT_TYPE = 'percentage';
const STATUS_CHIP_STYLES = {
  pending: { bg: '#FEF9E7', color: '#B45309', label: 'Pending' },
  approved: { bg: '#EAFAF1', color: '#15803D', label: 'Approved' },
  rejected: { bg: '#FDEDEC', color: '#B91C1C', label: 'Rejected' },
  withdrawn: { bg: '#F3F4F6', color: '#4B5563', label: 'Withdrawn' },
};

const toProductId = (row) =>
  String(
    row?.productId ||
      row?.product?._id ||
      row?.product?.id ||
      row?._id ||
      row?.id ||
      ''
  );

const toProductName = (row) =>
  row?.product?.name || row?.name || row?.productName || 'Product';

const toRegularPrice = (row) =>
  Number(row?.regularPrice ?? row?.price ?? row?.product?.price ?? 0);

const toImageSource = (row) =>
  row?.product?.imageCover || row?.imageCover || row?.product?.images?.[0] || row?.images?.[0];

const toEligibilityReason = (row) =>
  row?.reason || row?.ineligibleReason || row?.disabledReason || null;

const isRowEligible = (row) => {
  if (typeof row?.eligible === 'boolean') return row.eligible;
  if (typeof row?.isEligible === 'boolean') return row.isEligible;
  return !toEligibilityReason(row);
};

const getSubmissionChip = (sub) => {
  if (!sub) return null;
  const key = String(sub.status || '').toLowerCase();
  return STATUS_CHIP_STYLES[key] || null;
};

const getDiscountMetrics = (discountType, discountValue, regularPrice) => {
  const value = Number(discountValue || 0);
  const price = Number(regularPrice || 0);
  if (!price || !value) {
    return { promoPrice: price, effectivePercent: 0 };
  }

  if (discountType === 'fixed') {
    const promoPrice = Math.max(price - value, 0);
    return {
      promoPrice,
      effectivePercent: ((price - promoPrice) / price) * 100,
    };
  }

  const promoPrice = Math.max(price - (price * value) / 100, 0);
  return {
    promoPrice,
    effectivePercent: ((price - promoPrice) / price) * 100,
  };
};

export default function PromoSubmitPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightedProductId = (searchParams.get('resubmitProductId') || '').trim();
  const highlightedRowRef = useRef(null);

  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [rowConfig, setRowConfig] = useState({});
  const [rowErrors, setRowErrors] = useState({});

  const promoQuery = useSellerPromo(id);
  const submissionsQuery = useMyPromoSubmissions({ promoId: id, page: 1, limit: 100 });
  const eligibleProductsQuery = useSellerPromoEligibleProducts(id, {
    search: search || undefined,
    includeIneligible: true,
    page: 1,
    limit: 200,
  });
  const submitMutation = useSubmitSellerPromoProducts(id);

  const promo = promoQuery.data?.promo || promoQuery.data || {};
  const submissions = useMemo(
    () => sellerPromoSelectors.submissions(submissionsQuery.data),
    [submissionsQuery.data]
  );
  const eligibleRows = useMemo(
    () => sellerPromoSelectors.eligibleProducts(eligibleProductsQuery.data),
    [eligibleProductsQuery.data]
  );

  const maxSlots = Number(promo?.maxProductsPerSeller || 0);
  const usedSlots = Number(
    promo?.sellerUsage?.used ??
      promo?.sellerSubmissionStats?.used ??
      promo?.sellerSubmissionCount ??
      submissions.length
  );
  const remainingSlots = maxSlots > 0 ? Math.max(maxSlots - usedSlots, 0) : Infinity;
  const minDiscountPercent = Number(promo?.minDiscountPercent || 0);

  const filteredRows = useMemo(
    () =>
      eligibleRows.filter((row) =>
        toProductName(row).toLowerCase().includes(search.toLowerCase())
      ),
    [eligibleRows, search]
  );

  useEffect(() => {
    if (step !== 1 || !highlightedProductId) return;
    const exists = filteredRows.some(
      (row) => toProductId(row) === highlightedProductId
    );
    if (!exists || !highlightedRowRef.current) return;
    highlightedRowRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [filteredRows, highlightedProductId, step]);

  const reviewRows = useMemo(() => {
    const rowMap = new Map(eligibleRows.map((row) => [toProductId(row), row]));
    return selectedIds.map((productId) => rowMap.get(productId)).filter(Boolean);
  }, [eligibleRows, selectedIds]);

  const existingSubmissionsByProductId = useMemo(() => {
    const map = new Map();
    submissions.forEach((sub) => {
      const pid = String(sub?.product?._id || sub?.product?.id || sub?.product || '');
      if (pid) map.set(pid, sub);
    });
    return map;
  }, [submissions]);

  const sortedRows = useMemo(() => {
    const priority = (row) => {
      const existing = existingSubmissionsByProductId.get(toProductId(row));
      const status = String(existing?.status || '').toLowerCase();
      if (!existing || status === 'withdrawn') return 0;
      if (status === 'pending') return 1;
      if (status === 'approved') return 2;
      if (status === 'rejected') return 3;
      return 4;
    };
    return [...filteredRows].sort((a, b) => priority(a) - priority(b));
  }, [filteredRows, existingSubmissionsByProductId]);

  const averageDiscount = useMemo(() => {
    if (reviewRows.length === 0) return 0;
    const total = reviewRows.reduce((sum, row) => {
      const productId = toProductId(row);
      const config = rowConfig[productId] || {};
      const metrics = getDiscountMetrics(
        config.discountType || DEFAULT_DISCOUNT_TYPE,
        config.discountValue,
        toRegularPrice(row)
      );
      return sum + metrics.effectivePercent;
    }, 0);
    return total / reviewRows.length;
  }, [reviewRows, rowConfig]);

  const updateRowConfig = (productId, updates) => {
    setRowConfig((prev) => ({
      ...prev,
      [productId]: {
        discountType: DEFAULT_DISCOUNT_TYPE,
        discountValue: '',
        stockForPromo: '',
        ...prev[productId],
        ...updates,
      },
    }));
  };

  const toggleSelection = (row) => {
    const productId = toProductId(row);
    if (!productId || !isRowEligible(row)) return;

    const existing = existingSubmissionsByProductId.get(productId);
    if (existing && String(existing.status || '').toLowerCase() !== 'withdrawn') {
      const statusLabel = String(existing.status || 'submitted').toLowerCase();
      toast.info(`Already ${statusLabel} for this promo.`);
      return;
    }

    if (!selectedIds.includes(productId)) {
      if (remainingSlots !== Infinity && selectedIds.length >= remainingSlots) {
        toast.error(`You can submit only ${remainingSlots} more product(s).`);
        return;
      }
    }

    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((idValue) => idValue !== productId)
        : [...prev, productId]
    );
  };

  const validateRows = () => {
    const nextErrors = {};

    reviewRows.forEach((row) => {
      const productId = toProductId(row);
      const config = rowConfig[productId] || {};
      const discountValue = Number(config.discountValue || 0);
      const metrics = getDiscountMetrics(
        config.discountType || DEFAULT_DISCOUNT_TYPE,
        discountValue,
        toRegularPrice(row)
      );

      if (discountValue <= 0) {
        nextErrors[productId] = 'Discount value must be greater than 0.';
        return;
      }

      if (metrics.promoPrice <= 0) {
        nextErrors[productId] = 'Promo price must be greater than 0.';
        return;
      }

      if (metrics.effectivePercent < minDiscountPercent) {
        nextErrors[productId] =
          `Discount must be at least ${minDiscountPercent}%.`;
      }
    });

    setRowErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const mapServerRowErrors = (error) => {
    const details = error?.response?.data?.errors || error?.response?.data?.details;
    if (!Array.isArray(details)) return;

    const mapped = {};
    details.forEach((item) => {
      const rowKey = String(
        item?.productId || item?.product || item?.product_id || item?.id || ''
      );
      if (rowKey && item?.message) {
        mapped[rowKey] = item.message;
      }
    });

    if (Object.keys(mapped).length > 0) {
      setRowErrors((prev) => ({ ...prev, ...mapped }));
    }
  };

  const handleSubmit = async () => {
    if (!validateRows()) {
      toast.error('Please fix row validation errors before submitting.');
      return;
    }

    const products = reviewRows.map((row) => {
      const productId = toProductId(row);
      const config = rowConfig[productId] || {};
      return {
        productId,
        discountType: config.discountType || DEFAULT_DISCOUNT_TYPE,
        discountValue: Number(config.discountValue || 0),
        stockForPromo:
          config.stockForPromo === '' ? undefined : Number(config.stockForPromo),
      };
    });

    try {
      await submitMutation.mutateAsync({ products });
      toast.success('Submission sent for review.');
      navigate(`${PATHS.MY_PROMO_SUBMISSIONS}?status=pending`);
    } catch (error) {
      mapServerRowErrors(error);
      toast.error(error?.response?.data?.message || 'Submission failed.');
    }
  };

  if (promoQuery.isLoading || eligibleProductsQuery.isLoading) {
    return <StateCard>Loading promo submission flow...</StateCard>;
  }

  if (!promo?._id && !promo?.id) {
    return <StateCard>Promo not found.</StateCard>;
  }

  if (maxSlots > 0 && remainingSlots <= 0) {
    return <StateCard>You already reached your cap for this promo.</StateCard>;
  }

  return (
    <Page>
      <Header>
        <h1>Submit Products</h1>
        <p>
          {promo?.name || 'Promo'} - min discount {minDiscountPercent}% - remaining
          slots: {remainingSlots === Infinity ? 'Unlimited' : remainingSlots}
        </p>
      </Header>

      <Steps role='tablist' aria-label='Promo submission steps'>
        <Step $active={step === 1}>1. Pick products</Step>
        <Step $active={step === 2}>2. Configure pricing</Step>
        <Step $active={step === 3}>3. Review and submit</Step>
      </Steps>

      {step === 1 ? (
        <Card>
          <SearchInput
            type='search'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search eligible products'
            aria-label='Search eligible products'
          />

          <LegendWrap role='note' aria-label='Submission status legend'>
            <LegendText>Legend:</LegendText>
            <StatusChip
              $bg='#EEF2FF'
              $color='#3730A3'
              aria-label='Available'
            >
              Available
            </StatusChip>
            <StatusChip
              $bg={STATUS_CHIP_STYLES.pending.bg}
              $color={STATUS_CHIP_STYLES.pending.color}
              aria-label='Pending'
            >
              Pending
            </StatusChip>
            <StatusChip
              $bg={STATUS_CHIP_STYLES.approved.bg}
              $color={STATUS_CHIP_STYLES.approved.color}
              aria-label='Approved'
            >
              Approved
            </StatusChip>
            <StatusChip
              $bg={STATUS_CHIP_STYLES.rejected.bg}
              $color={STATUS_CHIP_STYLES.rejected.color}
              aria-label='Rejected'
            >
              Rejected
            </StatusChip>
            <LegendNote>
              — products already in this promo cannot be re-selected unless withdrawn.
            </LegendNote>
          </LegendWrap>

          <Rows>
            {sortedRows.map((row) => {
              const productId = toProductId(row);
              const selected = selectedIds.includes(productId);
              const existing = existingSubmissionsByProductId.get(productId);
              const existingStatus = String(existing?.status || '').toLowerCase();
              const disabledBySubmission = Boolean(
                existing && existingStatus !== 'withdrawn'
              );
              const disabledByEligibility = !isRowEligible(row);
              const disabled = disabledByEligibility || disabledBySubmission;
              const rowTitle = disabledBySubmission
                ? `Already ${existingStatus || 'submitted'} for this promo`
                : undefined;
              const chip = getSubmissionChip(existing);
              const showRejectedResubmitNote =
                Boolean(highlightedProductId) &&
                highlightedProductId === productId &&
                existingStatus === 'rejected';
              return (
                <ProductRow
                  key={productId}
                  ref={
                    highlightedProductId && productId === highlightedProductId
                      ? highlightedRowRef
                      : null
                  }
                  $disabled={disabled}
                  $disabledBySubmission={disabledBySubmission}
                  $highlighted={
                    Boolean(highlightedProductId) && productId === highlightedProductId
                  }
                  aria-disabled={disabled}
                  title={rowTitle}
                  onClick={() => {
                    if (disabled) return;
                    toggleSelection(row);
                  }}
                >
                  <input
                    type='checkbox'
                    checked={selected}
                    onChange={() => {
                      if (disabled) return;
                      toggleSelection(row);
                    }}
                    disabled={disabled}
                    aria-label={`Select ${toProductName(row)}`}
                    title={rowTitle}
                  />
                  <img
                    src={getOptimizedImageUrl(toImageSource(row), IMAGE_SLOTS.TABLE_THUMB)}
                    alt={toProductName(row)}
                    loading='lazy'
                  />
                  <div>
                    <strong>{toProductName(row)}</strong>
                    <small>{formatCurrency(toRegularPrice(row))}</small>
                    {disabledByEligibility ? (
                      <Reason>{toEligibilityReason(row)}</Reason>
                    ) : null}
                    {chip ? (
                      <StatusChip
                        $bg={chip.bg}
                        $color={chip.color}
                        aria-label={`Submission ${chip.label}`}
                      >
                        {chip.label}
                      </StatusChip>
                    ) : null}
                    {showRejectedResubmitNote ? (
                      <HelperNote>
                        To resubmit, withdraw or wait for the rejected submission to be reopened.
                      </HelperNote>
                    ) : null}
                  </div>
                </ProductRow>
              );
            })}
          </Rows>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          {reviewRows.length === 0 ? (
            <StateCardNoMargin>No products selected.</StateCardNoMargin>
          ) : (
            <Rows>
              {reviewRows.map((row) => {
                const productId = toProductId(row);
                const config = rowConfig[productId] || {
                  discountType: DEFAULT_DISCOUNT_TYPE,
                  discountValue: '',
                  stockForPromo: '',
                };
                const metrics = getDiscountMetrics(
                  config.discountType,
                  config.discountValue,
                  toRegularPrice(row)
                );

                return (
                  <DiscountRow key={productId}>
                    <div>
                      <strong>{toProductName(row)}</strong>
                      <small>Regular: {formatCurrency(toRegularPrice(row))}</small>
                    </div>

                    <ToggleGroup role='group' aria-label='Discount type'>
                      <button
                        type='button'
                        onClick={() =>
                          updateRowConfig(productId, { discountType: 'percentage' })
                        }
                        aria-pressed={config.discountType === 'percentage'}
                      >
                        %
                      </button>
                      <button
                        type='button'
                        onClick={() =>
                          updateRowConfig(productId, { discountType: 'fixed' })
                        }
                        aria-pressed={config.discountType === 'fixed'}
                      >
                        GHS
                      </button>
                    </ToggleGroup>

                    <Field>
                      <label htmlFor={`discount-value-${productId}`}>Discount value</label>
                      <input
                        id={`discount-value-${productId}`}
                        type='number'
                        min='0'
                        step='0.01'
                        value={config.discountValue}
                        onChange={(event) =>
                          updateRowConfig(productId, {
                            discountValue: event.target.value,
                          })
                        }
                      />
                    </Field>

                    <Metric>Promo: {formatCurrency(metrics.promoPrice)}</Metric>
                    <Metric>Effective: {metrics.effectivePercent.toFixed(1)}%</Metric>

                    <Field>
                      <label htmlFor={`stock-${productId}`}>Promo stock (optional)</label>
                      <input
                        id={`stock-${productId}`}
                        type='number'
                        min='0'
                        step='1'
                        value={config.stockForPromo}
                        onChange={(event) =>
                          updateRowConfig(productId, {
                            stockForPromo: event.target.value,
                          })
                        }
                      />
                    </Field>

                    {rowErrors[productId] ? (
                      <RowError role='alert'>{rowErrors[productId]}</RowError>
                    ) : null}
                  </DiscountRow>
                );
              })}
            </Rows>
          )}
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <SummaryRow>
            <span>Total products</span>
            <strong>{reviewRows.length}</strong>
          </SummaryRow>
          <SummaryRow>
            <span>Average discount</span>
            <strong>{averageDiscount.toFixed(1)}%</strong>
          </SummaryRow>
          <SummaryRow>
            <span>Minimum required</span>
            <strong>{minDiscountPercent}%</strong>
          </SummaryRow>
        </Card>
      ) : null}

      <Actions>
        <ActionButton
          type='button'
          onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
          disabled={step === 1}
        >
          Back
        </ActionButton>

        {step < 3 ? (
          <ActionButton
            type='button'
            $primary
            onClick={() => {
              if (step === 1 && selectedIds.length === 0) {
                toast.error('Select at least one product before continuing.');
                return;
              }
              if (step === 2 && !validateRows()) {
                toast.error('Please fix validation issues before continuing.');
                return;
              }
              setStep((prev) => Math.min(prev + 1, 3));
            }}
          >
            Continue
          </ActionButton>
        ) : (
          <ActionButton
            type='button'
            $primary
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit for approval'}
          </ActionButton>
        )}
      </Actions>
    </Page>
  );
}

const Page = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.header`
  h1 {
    margin: 0;
    font-size: 1.35rem;
    color: #111827;
  }

  p {
    margin: 0.2rem 0 0;
    color: #6b7280;
    font-size: 0.9rem;
  }
`;

const Steps = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Step = styled.span`
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? '#e8920a' : '#d1d5db')};
  background: ${({ $active }) => ($active ? '#fdf3e3' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#b45309' : '#4b5563')};
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
`;

const Card = styled.article`
  border: 1px solid #ece8df;
  border-radius: 12px;
  background: #ffffff;
  padding: 0.9rem;
`;

const SearchInput = styled.input`
  width: 100%;
  min-height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  margin-bottom: 0.75rem;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const LegendWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
`;

const LegendText = styled.span`
  font-size: 0.78rem;
  color: #4b5563;
  font-weight: 600;
`;

const LegendNote = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`;

const ProductRow = styled.label`
  border: 1px solid ${({ $disabled }) => ($disabled ? '#e5e7eb' : '#ece8df')};
  background: ${({ $disabled, $highlighted }) => {
    if ($highlighted) return '#fff7e8';
    return $disabled ? '#f9fafb' : '#ffffff';
  }};
  border-radius: 8px;
  padding: 0.6rem;
  display: grid;
  grid-template-columns: auto 44px minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabledBySubmission }) => ($disabledBySubmission ? 0.6 : 1)};
  box-shadow: ${({ $highlighted }) =>
    $highlighted ? '0 0 0 2px rgba(232, 146, 10, 0.18)' : 'none'};

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
  }

  img {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    object-fit: cover;
  }

  strong {
    display: block;
    color: #111827;
    font-size: 0.9rem;
  }

  small {
    display: block;
    color: #6b7280;
    font-size: 0.8rem;
  }
`;

const Reason = styled.small`
  color: #b45309;
`;

const StatusChip = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  margin-left: 0.5rem;
`;

const HelperNote = styled.small`
  display: block;
  margin-top: 0.3rem;
  color: #6b7280;
  font-size: 0.74rem;
`;

const DiscountRow = styled.div`
  border: 1px solid #ece8df;
  border-radius: 8px;
  padding: 0.75rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.6rem;

  strong {
    display: block;
    color: #111827;
    font-size: 0.9rem;
  }

  small {
    color: #6b7280;
    font-size: 0.8rem;
  }
`;

const ToggleGroup = styled.div`
  display: inline-flex;
  width: fit-content;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;

  button {
    border: 0;
    min-height: 36px;
    background: #ffffff;
    color: #374151;
    padding: 0.4rem 0.65rem;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 600;
  }

  button[aria-pressed='true'] {
    background: #fdf3e3;
    color: #b45309;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  label {
    font-size: 0.76rem;
    color: #6b7280;
  }

  input {
    min-height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0.45rem 0.6rem;
  }
`;

const Metric = styled.span`
  font-size: 0.82rem;
  color: #374151;
`;

const RowError = styled.p`
  margin: 0;
  color: #b91c1c;
  font-size: 0.8rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #f1efe8;
  padding: 0.45rem 0;

  &:last-child {
    border-bottom: 0;
  }

  span {
    color: #6b7280;
    font-size: 0.85rem;
  }

  strong {
    color: #111827;
    font-size: 0.85rem;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  min-height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ $primary }) => ($primary ? '#e8920a' : '#d1d5db')};
  background: ${({ $primary }) => ($primary ? '#e8920a' : '#ffffff')};
  color: ${({ $primary }) => ($primary ? '#ffffff' : '#374151')};
  padding: 0.45rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StateCard = styled.div`
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  color: #6b7280;
  padding: 1.2rem;
`;

const StateCardNoMargin = styled(StateCard)`
  margin: 0;
`;
