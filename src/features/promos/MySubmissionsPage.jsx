import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { PATHS } from '../../routes/routePaths';
import {
  sellerPromoSelectors,
  useMyPromoSubmissions,
  useSellerPromo,
  useSellerPromos,
  useUpdateSubmission,
  useWithdrawSubmission,
} from '../../shared/hooks/useSellerPromos';
import { formatCurrency, formatDate } from '../../shared/utils/helpers';

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected', 'withdrawn'];
const MOBILE_SUBMISSIONS_BREAKPOINT = 900;

const getStatusTone = (status) => {
  if (status === 'approved') return { bg: '#EAFAF1', color: '#27AE60' };
  if (status === 'rejected') return { bg: '#FDEDEC', color: '#E74C3C' };
  return { bg: '#FEF9E7', color: '#F39C12' };
};

const calculateMetrics = ({ discountType, discountValue, regularPrice }) => {
  const safeDiscount = Number(discountValue || 0);
  const safeRegular = Number(regularPrice || 0);

  if (!Number.isFinite(safeRegular) || safeRegular <= 0) {
    return { promoPrice: 0, effectivePercent: 0 };
  }
  if (!Number.isFinite(safeDiscount) || safeDiscount <= 0) {
    return { promoPrice: safeRegular, effectivePercent: 0 };
  }

  if (discountType === 'fixed') {
    const promoPrice = Math.max(safeRegular - safeDiscount, 0);
    const effectivePercent = ((safeRegular - promoPrice) / safeRegular) * 100;
    return { promoPrice, effectivePercent };
  }

  const promoPrice = Math.max(safeRegular - (safeRegular * safeDiscount) / 100, 0);
  const effectivePercent = ((safeRegular - promoPrice) / safeRegular) * 100;
  return { promoPrice, effectivePercent };
};

export default function MySubmissionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [promoId, setPromoId] = useState(searchParams.get('promoId') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [activeDialog, setActiveDialog] = useState(null);
  const [editInitial, setEditInitial] = useState(null);
  const [editForm, setEditForm] = useState({
    discountType: 'percentage',
    discountValue: '',
    stockForPromo: '',
  });
  const [editServerError, setEditServerError] = useState('');
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth <= MOBILE_SUBMISSIONS_BREAKPOINT
      : false
  );

  const submissionsQuery = useMyPromoSubmissions({
    status: status === 'all' ? undefined : status,
    promoId: promoId || undefined,
    page,
    limit: 20,
  });
  const promosQuery = useSellerPromos({ tab: 'active', page: 1, limit: 100 });
  const withdrawMutation = useWithdrawSubmission();
  const updateMutation = useUpdateSubmission();

  const submissions = useMemo(
    () => sellerPromoSelectors.submissions(submissionsQuery.data),
    [submissionsQuery.data]
  );
  const promoOptions = useMemo(
    () => sellerPromoSelectors.promos(promosQuery.data),
    [promosQuery.data]
  );

  const isPromoActiveNow = (promo) => {
    if (!promo) return false;
    const status = String(promo?.status || '').toLowerCase();
    if (status !== 'active') return false;
    const now = Date.now();
    const start = promo?.startDate ? new Date(promo.startDate).getTime() : null;
    const end = promo?.endDate ? new Date(promo.endDate).getTime() : null;
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
    return now >= start && now <= end;
  };

  const isPromoScheduledNotStarted = (promo) => {
    if (!promo) return false;
    const status = String(promo?.status || '').toLowerCase();
    if (status !== 'scheduled') return false;
    const start = promo?.startDate ? new Date(promo.startDate).getTime() : null;
    if (!Number.isFinite(start)) return false;
    return Date.now() < start;
  };

  const isPromoEnded = (promo) => {
    if (!promo) return false;
    const status = String(promo?.status || '').toLowerCase();
    if (['ended', 'cancelled'].includes(status)) return true;
    const end = promo?.endDate ? new Date(promo.endDate).getTime() : null;
    return Number.isFinite(end) && Date.now() > end;
  };

  const openEditDialog = (row) => {
    setEditServerError('');
    setEditForm({
      discountType:
        row?.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: String(row?.discountValue ?? ''),
      stockForPromo:
        row?.stockForPromo == null ? '' : String(row.stockForPromo),
    });
    setEditInitial({
      discountType:
        row?.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: String(row?.discountValue ?? ''),
      stockForPromo:
        row?.stockForPromo == null ? '' : String(row.stockForPromo),
    });
    setActiveDialog({
      type: 'edit',
      row,
    });
  };

  const syncQuery = (next) => {
    const query = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) query.set(key, String(value));
      else query.delete(key);
    });
    setSearchParams(query);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= MOBILE_SUBMISSIONS_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderSubmissionActions = (row) => {
    const statusValue = String(row?.status || '').toLowerCase();
    const promoIdValue = row?.promo?._id || row?.promo?.id;
    const productIdValue = row?.product?._id || row?.product?.id;

    if (statusValue === 'pending') {
      return (
        <ActionGroup>
          <ActionBtn
            type='button'
            $toneBg='#EEF2FF'
            $toneColor='#4338CA'
            aria-label={`Edit submission for ${
              row?.product?.name || row?.productName || 'product'
            }`}
            onClick={() => openEditDialog(row)}
          >
            Edit
          </ActionBtn>
          <ActionBtn
            type='button'
            $variant='ghost'
            aria-label={`Withdraw submission for ${
              row?.product?.name || row?.productName || 'product'
            }`}
            onClick={() =>
              setActiveDialog({
                type: 'withdraw',
                row,
              })
            }
          >
            Withdraw
          </ActionBtn>
        </ActionGroup>
      );
    }

    if (statusValue === 'approved') {
      const canEditApproved = isPromoScheduledNotStarted(row?.promo);
      const promoLiveOrScheduled = !isPromoEnded(row?.promo);
      if (!promoLiveOrScheduled) {
        return <MutedDash>—</MutedDash>;
      }
      return (
        <ActionGroup>
          {canEditApproved ? (
            <ActionBtn
              type='button'
              $toneBg='#EEF2FF'
              $toneColor='#4338CA'
              aria-label={`Edit approved submission for ${
                row?.product?.name || row?.productName || 'product'
              }`}
              onClick={() => openEditDialog(row)}
            >
              Edit
            </ActionBtn>
          ) : null}
          <ActionBtn
            type='button'
            $variant='ghost'
            aria-label={`Remove product ${
              row?.product?.name || row?.productName || 'product'
            } from promo`}
            onClick={() =>
              setActiveDialog({
                type: 'withdraw',
                row,
              })
            }
          >
            Remove from promo
          </ActionBtn>
        </ActionGroup>
      );
    }

    if (statusValue === 'rejected') {
      return (
        <ActionGroup>
          <ActionBtn
            type='button'
            $variant='ghost'
            aria-label={`View rejection reason for ${
              row?.product?.name || row?.productName || 'product'
            }`}
            onClick={() =>
              setActiveDialog({
                type: 'rejected',
                row,
              })
            }
          >
            View reason
          </ActionBtn>
          <ActionBtn
            type='button'
            $variant='outlinePrimary'
            aria-label={`Resubmit ${
              row?.product?.name || row?.productName || 'product'
            }`}
            onClick={() => {
              const path = PATHS.PROMO_SUBMIT.replace(':id', promoIdValue);
              const query = productIdValue
                ? `?resubmitProductId=${encodeURIComponent(productIdValue)}`
                : '';
              navigate(`${path}${query}`);
            }}
          >
            Resubmit
          </ActionBtn>
        </ActionGroup>
      );
    }

    if (statusValue === 'withdrawn') {
      return <MutedDash>—</MutedDash>;
    }

    return <MutedDash>—</MutedDash>;
  };

  return (
    <Page>
      <Header>
        <h1>My Submissions</h1>
        <p>Review promo/product submission status across all campaigns.</p>
      </Header>

      <Filters>
        <FilterField>
          <label htmlFor='submission-status-filter'>Status</label>
          <select
            id='submission-status-filter'
            value={status}
            onChange={(event) => {
              const next = event.target.value;
              setStatus(next);
              setPage(1);
              syncQuery({ status: next === 'all' ? null : next, page: null });
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField>
          <label htmlFor='submission-promo-filter'>Promo</label>
          <select
            id='submission-promo-filter'
            value={promoId}
            onChange={(event) => {
              const next = event.target.value;
              setPromoId(next);
              setPage(1);
              syncQuery({ promoId: next || null, page: null });
            }}
          >
            <option value=''>All promos</option>
            {promoOptions.map((promo) => {
              const value = promo?._id || promo?.id;
              return (
                <option key={value} value={value}>
                  {promo?.name || 'Promo'}
                </option>
              );
            })}
          </select>
        </FilterField>
      </Filters>

      {submissionsQuery.isLoading ? (
        <StateCard>Loading submissions...</StateCard>
      ) : submissions.length === 0 ? (
        <StateCard>No submissions found for this filter.</StateCard>
      ) : (
        <>
          {!isMobileView ? (
            <DesktopTableWrap>
              <TableWrap>
                <table>
                  <thead>
                    <tr>
                      <th>Promo</th>
                      <th>Product</th>
                      <th>Discount</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((row) => {
                      const statusValue = row?.status || 'pending';
                      const tone = getStatusTone(statusValue);
                      const promoIdValue = row?.promo?._id || row?.promo?.id;
                      const discountValue = Number(row?.discountValue || 0);
                      const liveNow = statusValue === 'approved' && isPromoActiveNow(row?.promo);
                      return (
                        <tr key={row?._id || row?.id}>
                          <td>
                            {promoIdValue ? (
                              <InlineLink to={PATHS.PROMO_DETAIL.replace(':id', promoIdValue)}>
                                {row?.promo?.name || 'Promo'}
                              </InlineLink>
                            ) : (
                              row?.promo?.name || 'Promo'
                            )}
                          </td>
                          <td>{row?.product?.name || row?.productName || 'Product'}</td>
                          <td>
                            {row?.discountType === 'fixed'
                              ? formatCurrency(discountValue)
                              : `${discountValue}%`}
                          </td>
                          <td>
                            <StatusWrap>
                              <StatusBadge
                                $bg={tone.bg}
                                $color={tone.color}
                                aria-label={`Status ${statusValue}`}
                              >
                                {statusValue}
                              </StatusBadge>
                              {liveNow ? <LiveBadge aria-label='Live promo'>Live</LiveBadge> : null}
                              {statusValue === 'approved' ? (
                                <StatusMeta>Sold: {Number(row?.unitsSold || 0)}</StatusMeta>
                              ) : null}
                            </StatusWrap>
                          </td>
                          <td>{formatDate(row?.submittedAt || row?.createdAt)}</td>
                          <td>{renderSubmissionActions(row)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableWrap>
            </DesktopTableWrap>
          ) : (
            <MobileSubmissionList>
              {submissions.map((row) => {
                const statusValue = row?.status || 'pending';
                const tone = getStatusTone(statusValue);
                const promoIdValue = row?.promo?._id || row?.promo?.id;
                const discountValue = Number(row?.discountValue || 0);
                const liveNow = statusValue === 'approved' && isPromoActiveNow(row?.promo);

                return (
                  <MobileSubmissionCard key={`mobile-${row?._id || row?.id}`}>
                    <MobileTopRow>
                      <MobileLabel>Status</MobileLabel>
                      <StatusWrap>
                        <StatusBadge
                          $bg={tone.bg}
                          $color={tone.color}
                          aria-label={`Status ${statusValue}`}
                        >
                          {statusValue}
                        </StatusBadge>
                        {liveNow ? <LiveBadge aria-label='Live promo'>Live</LiveBadge> : null}
                      </StatusWrap>
                    </MobileTopRow>

                    <MobileMetaGrid>
                      <MobileMetaItem>
                        <MobileLabel>Promo</MobileLabel>
                        {promoIdValue ? (
                          <InlineLink to={PATHS.PROMO_DETAIL.replace(':id', promoIdValue)}>
                            {row?.promo?.name || 'Promo'}
                          </InlineLink>
                        ) : (
                          <span>{row?.promo?.name || 'Promo'}</span>
                        )}
                      </MobileMetaItem>
                      <MobileMetaItem>
                        <MobileLabel>Product</MobileLabel>
                        <span>{row?.product?.name || row?.productName || 'Product'}</span>
                      </MobileMetaItem>
                      <MobileMetaItem>
                        <MobileLabel>Discount</MobileLabel>
                        <span>
                          {row?.discountType === 'fixed'
                            ? formatCurrency(discountValue)
                            : `${discountValue}%`}
                        </span>
                      </MobileMetaItem>
                      <MobileMetaItem>
                        <MobileLabel>Submitted</MobileLabel>
                        <span>{formatDate(row?.submittedAt || row?.createdAt)}</span>
                      </MobileMetaItem>
                      {statusValue === 'approved' ? (
                        <MobileMetaItem>
                          <MobileLabel>Sold</MobileLabel>
                          <span>{Number(row?.unitsSold || 0)}</span>
                        </MobileMetaItem>
                      ) : null}
                    </MobileMetaGrid>

                    <MobileActions>{renderSubmissionActions(row)}</MobileActions>
                  </MobileSubmissionCard>
                );
              })}
            </MobileSubmissionList>
          )}
        </>
      )}

      <Pagination>
        <PageButton
          type='button'
          onClick={() => {
            const next = Math.max(page - 1, 1);
            setPage(next);
            syncQuery({ page: next === 1 ? null : next });
          }}
          disabled={page <= 1}
        >
          Prev
        </PageButton>
        <span>Page {page}</span>
        <PageButton
          type='button'
          onClick={() => {
            const next = page + 1;
            setPage(next);
            syncQuery({ page: next });
          }}
        >
          Next
        </PageButton>
      </Pagination>

      <SubmissionActionDialog
        dialog={activeDialog}
        onClose={() => setActiveDialog(null)}
        onConfirmWithdraw={async () => {
          const row = activeDialog?.row;
          const submissionId = row?._id || row?.id;
          if (!submissionId) {
            setActiveDialog(null);
            return;
          }
          try {
            await withdrawMutation.mutateAsync(submissionId);
            submissionsQuery.refetch();
            const isApproved = String(row?.status || '').toLowerCase() === 'approved';
            toast.success(isApproved ? 'Removed from promo.' : 'Submission withdrawn.');
          } catch (error) {
            toast.error(
              error?.response?.data?.message || 'Unable to withdraw submission.'
            );
          } finally {
            setActiveDialog(null);
          }
        }}
        onResubmit={() => {
          const row = activeDialog?.row || {};
          const promoIdValue = row?.promo?._id || row?.promo?.id;
          const productIdValue = row?.product?._id || row?.product?.id;
          if (!promoIdValue) return;
          const path = PATHS.PROMO_SUBMIT.replace(':id', promoIdValue);
          const query = productIdValue
            ? `?resubmitProductId=${encodeURIComponent(productIdValue)}`
            : '';
          navigate(`${path}${query}`);
        }}
        editForm={editForm}
        editInitial={editInitial}
        onEditFormChange={(updater) => {
          setEditServerError('');
          if (typeof updater === 'function') {
            setEditForm((prev) => updater(prev));
            return;
          }
          setEditForm(updater);
        }}
        isUpdating={updateMutation.isPending}
        editServerError={editServerError}
        onSaveEdit={async () => {
          const row = activeDialog?.row;
          const submissionId = row?._id || row?.id;
          if (!submissionId) {
            setActiveDialog(null);
            return;
          }

          const discountValue = Number(editForm.discountValue || 0);
          const payload = {
            discountType: editForm.discountType,
            discountValue,
          };
          if (String(editForm.stockForPromo).trim() === '') {
            payload.stockForPromo = null;
          } else {
            payload.stockForPromo = Number(editForm.stockForPromo);
          }

          try {
            await updateMutation.mutateAsync({ submissionId, payload });
            submissionsQuery.refetch();
            toast.success('Submission updated.');
            setActiveDialog(null);
          } catch (error) {
            const statusCode = Number(error?.response?.status || 0);
            const message =
              error?.response?.data?.message || 'Unable to update submission.';
            if (statusCode === 409) {
              setEditServerError(message);
              return;
            }
            toast.error(message);
          }
        }}
      />
    </Page>
  );
}

function SubmissionActionDialog({
  dialog,
  onClose,
  onConfirmWithdraw,
  onResubmit,
  editForm,
  editInitial,
  onEditFormChange,
  isUpdating,
  editServerError,
  onSaveEdit,
}) {
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!dialog) return;
    const active = ['withdraw', 'edit'].includes(dialog.type)
      ? confirmBtnRef.current
      : closeBtnRef.current;
    active?.focus();
  }, [dialog]);

  useEffect(() => {
    if (!dialog) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (!dialog) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const isShift = event.shiftKey;

        if (isShift && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!isShift && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [dialog, onClose]);

  const row = dialog?.row || {};
  const isWithdraw = dialog?.type === 'withdraw';
  const isEdit = dialog?.type === 'edit';
  const isApprovedWithdraw =
    isWithdraw && String(row?.status || '').toLowerCase() === 'approved';
  const promoId = row?.promo?._id || row?.promo?.id;
  const promoQuery = useSellerPromo(promoId);
  const promoMinDiscount = Number(
    promoQuery?.data?.promo?.minDiscountPercent ??
      promoQuery?.data?.minDiscountPercent ??
      row?.promo?.minDiscountPercent ??
      0
  );
  const regularPrice = Number(row?.regularPrice || row?.product?.price || 0);
  const metrics = calculateMetrics({
    discountType: editForm.discountType,
    discountValue: editForm.discountValue,
    regularPrice,
  });
  const fixedDiscountTooHigh =
    editForm.discountType === 'fixed' &&
    Number(editForm.discountValue || 0) >= regularPrice;
  const minDiscountInvalid =
    metrics.effectivePercent < promoMinDiscount;
  const discountValueInvalid = Number(editForm.discountValue || 0) <= 0;
  const isFormValid =
    !discountValueInvalid &&
    !fixedDiscountTooHigh &&
    !minDiscountInvalid &&
    Number(metrics.promoPrice) > 0;
  const isFormChanged =
    editInitial &&
    (String(editInitial.discountType) !== String(editForm.discountType) ||
      String(editInitial.discountValue) !== String(editForm.discountValue) ||
      String(editInitial.stockForPromo ?? '') !== String(editForm.stockForPromo ?? ''));

  if (!dialog) return null;

  return (
    <DialogOverlay role='presentation' onClick={onClose}>
      <DialogCard
        ref={modalRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='submission-action-title'
        aria-describedby='submission-action-description'
        onClick={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <h3 id='submission-action-title'>
            {isWithdraw
              ? isApprovedWithdraw
                ? 'Remove product from this promo?'
                : 'Withdraw submission'
              : isEdit
                ? `Edit submission - ${row?.product?.name || row?.productName || 'Product'}`
                : 'Submission rejected'}
          </h3>
          <DialogCloseBtn
            ref={closeBtnRef}
            type='button'
            aria-label='Close dialog'
            onClick={onClose}
          >
            ×
          </DialogCloseBtn>
        </DialogHeader>

        {isWithdraw ? (
          <DialogText id='submission-action-description'>
            {isApprovedWithdraw
              ? 'The product will revert to its regular price. You can resubmit later.'
              : 'Withdraw this submission? You can resubmit later.'}
          </DialogText>
        ) : isEdit ? (
          <EditForm id='submission-action-description'>
            <DialogHint>
              Edit submission - {row?.product?.name || row?.productName || 'Product'}
            </DialogHint>
            <ReadOnlyGrid>
              <ReadOnlyItem>
                <span>Promo</span>
                <strong>{row?.promo?.name || 'Promo'}</strong>
              </ReadOnlyItem>
              <ReadOnlyItem>
                <span>Regular price</span>
                <strong>{formatCurrency(regularPrice)}</strong>
              </ReadOnlyItem>
              <ReadOnlyItem>
                <span>Minimum discount required</span>
                <strong>{promoMinDiscount}%</strong>
              </ReadOnlyItem>
            </ReadOnlyGrid>
            <FieldGroup>
              <label>Discount type</label>
              <RadioGroup role='radiogroup' aria-label='Discount type'>
                <RadioOption>
                  <input
                    type='radio'
                    name='edit-discount-type'
                    value='percentage'
                    checked={editForm.discountType === 'percentage'}
                    onChange={(event) =>
                      onEditFormChange((prev) => ({
                        ...prev,
                        discountType: event.target.value,
                      }))
                    }
                  />
                  Percentage
                </RadioOption>
                <RadioOption>
                  <input
                    type='radio'
                    name='edit-discount-type'
                    value='fixed'
                    checked={editForm.discountType === 'fixed'}
                    onChange={(event) =>
                      onEditFormChange((prev) => ({
                        ...prev,
                        discountType: event.target.value,
                      }))
                    }
                  />
                  Fixed (GHS)
                </RadioOption>
              </RadioGroup>
            </FieldGroup>

            <FieldGroup>
              <label htmlFor='edit-discount-value'>Discount value</label>
              <input
                id='edit-discount-value'
                type='number'
                min='0'
                step='0.01'
                value={editForm.discountValue}
                onChange={(event) =>
                  onEditFormChange((prev) => ({
                    ...prev,
                    discountValue: event.target.value,
                  }))
                }
              />
            </FieldGroup>

            <FieldGroup>
              <label htmlFor='edit-stock-for-promo'>Stock for promo (optional)</label>
              <input
                id='edit-stock-for-promo'
                type='number'
                min='0'
                step='1'
                value={editForm.stockForPromo}
                onChange={(event) =>
                  onEditFormChange((prev) => ({
                    ...prev,
                    stockForPromo: event.target.value,
                  }))
                }
              />
              <small>Leave blank for all stock</small>
            </FieldGroup>
            <PreviewRow>
              Promo price: {formatCurrency(metrics.promoPrice)} | Effective discount:{' '}
              {Number(metrics.effectivePercent || 0).toFixed(1)}%
            </PreviewRow>
            {discountValueInvalid ? (
              <InlineError>Discount value must be greater than 0.</InlineError>
            ) : null}
            {fixedDiscountTooHigh ? (
              <InlineError>Discount cannot exceed price.</InlineError>
            ) : null}
            {minDiscountInvalid ? (
              <InlineError>Must be at least {promoMinDiscount}%.</InlineError>
            ) : null}
            {editServerError ? <InlineError>{editServerError}</InlineError> : null}
          </EditForm>
        ) : (
          <>
            <DialogText id='submission-action-description'>
              {row?.rejectionReason || 'No rejection reason provided.'}
            </DialogText>
            <DialogHint>
              Resubmission opens this promo with your previous product highlighted.
            </DialogHint>
          </>
        )}

        <DialogActions>
          <DialogButton type='button' onClick={onClose}>
            {isWithdraw || isEdit ? 'Cancel' : 'Close'}
          </DialogButton>
          {isWithdraw ? (
            <DialogButton
              ref={confirmBtnRef}
              type='button'
              $tone='rejected'
              onClick={onConfirmWithdraw}
            >
              {isApprovedWithdraw ? 'Remove from promo' : 'Confirm withdraw'}
            </DialogButton>
          ) : isEdit ? (
            <DialogButton
              ref={confirmBtnRef}
              type='button'
              $tone='pending'
              onClick={onSaveEdit}
              aria-label='Save edited submission'
              disabled={isUpdating || !isFormValid || !isFormChanged}
            >
              {isUpdating ? 'Saving...' : 'Save changes'}
            </DialogButton>
          ) : (
            <DialogButton
              type='button'
              $tone='pending'
              onClick={onResubmit}
              aria-label='Resubmit product to this promo'
            >
              Resubmit
            </DialogButton>
          )}
        </DialogActions>
      </DialogCard>
    </DialogOverlay>
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
    color: #111827;
    font-size: 1.35rem;
  }

  p {
    margin: 0.2rem 0 0;
    color: #6b7280;
    font-size: 0.9rem;
  }
`;

const Filters = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 48rem) {
    grid-template-columns: repeat(2, minmax(0, 240px));
  }
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  label {
    font-size: 0.78rem;
    color: #6b7280;
  }

  select {
    min-height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0.45rem 0.6rem;
    background: #ffffff;
    color: #111827;
  }
`;

const TableWrap = styled.div`
  border: 1px solid #ece8df;
  border-radius: 12px;
  background: #ffffff;
  overflow: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 720px;
  }

  thead th {
    text-align: left;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #6b7280;
    background: #f8f9fa;
    padding: 0.7rem 0.8rem;
  }

  tbody td {
    padding: 0.7rem 0.8rem;
    border-top: 1px solid #f1efe8;
    font-size: 0.84rem;
    color: #1f2937;
    vertical-align: middle;
  }
`;

const DesktopTableWrap = styled.div`
  display: block;
`;

const MobileSubmissionList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const MobileSubmissionCard = styled.article`
  border: 1px solid #ece8df;
  border-radius: 12px;
  background: #ffffff;
  padding: 0.75rem;
  display: grid;
  gap: 0.65rem;
`;

const MobileTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const MobileMetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
`;

const MobileMetaItem = styled.div`
  display: grid;
  gap: 0.2rem;
  min-width: 0;

  span {
    font-size: 0.82rem;
    color: #1f2937;
    word-break: break-word;
  }
`;

const MobileLabel = styled.span`
  font-size: 0.68rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #6b7280;
`;

const MobileActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const InlineLink = styled(Link)`
  color: #b45309;
  text-decoration: none;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const StatusWrap = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
`;

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.15rem 0.45rem;
  font-size: 0.66rem;
  font-weight: 700;
  background: #dcfce7;
  color: #166534;
  text-transform: uppercase;
`;

const StatusMeta = styled.span`
  font-size: 0.72rem;
  color: #6b7280;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.55rem;

  span {
    font-size: 0.82rem;
    color: #4b5563;
  }

  @media (max-width: 48rem) {
    justify-content: center;
  }
`;

const PageButton = styled.button`
  min-height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #374151;
  padding: 0.45rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActionBtn = styled.button`
  min-height: 30px;
  border-radius: 8px;
  padding: 0.25rem 0.65rem;
  font-size: 0.77rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${({ $variant, $toneColor }) => {
    if ($variant === 'outlinePrimary') return '#e8920a';
    if ($variant === 'ghost') return '#d1d5db';
    return $toneColor || '#d1d5db';
  }};
  background: ${({ $variant, $toneBg }) => {
    if ($variant === 'outlinePrimary') return '#ffffff';
    if ($variant === 'ghost') return 'transparent';
    if ($toneBg) return $toneBg;
    return '#ffffff';
  }};
  color: ${({ $variant, $toneColor }) => {
    if ($variant === 'outlinePrimary') return '#b45309';
    if ($variant === 'ghost') return '#374151';
    return $toneColor || '#374151';
  }};
`;

const ActionGroup = styled.div`
  display: inline-flex;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const MutedDash = styled.span`
  color: #9ca3af;
`;

const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1200;
`;

const DialogCard = styled.div`
  width: min(100%, 480px);
  background: #ffffff;
  border: 1px solid #ece8df;
  border-radius: 12px;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.2);
  padding: 0.9rem;
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;

  h3 {
    margin: 0;
    color: #111827;
    font-size: 1rem;
  }
`;

const DialogCloseBtn = styled.button`
  border: 0;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.35rem;
  line-height: 1;
`;

const DialogText = styled.p`
  margin: 0.4rem 0 0;
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.45;
`;

const DialogHint = styled.p`
  margin: 0.5rem 0 0;
  color: #6b7280;
  font-size: 0.78rem;
`;

const EditForm = styled.div`
  margin-top: 0.35rem;
  display: grid;
  gap: 0.55rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  label {
    font-size: 0.78rem;
    color: #6b7280;
  }

  input,
  select {
    min-height: 36px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0.4rem 0.55rem;
    color: #111827;
    background: #ffffff;
  }

  small {
    font-size: 0.74rem;
    color: #6b7280;
  }
`;

const ReadOnlyGrid = styled.div`
  border: 1px solid #ece8df;
  border-radius: 8px;
  padding: 0.55rem;
  display: grid;
  gap: 0.4rem;
`;

const ReadOnlyItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;

  span {
    font-size: 0.78rem;
    color: #6b7280;
  }

  strong {
    font-size: 0.82rem;
    color: #111827;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const RadioOption = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #374151;
`;

const PreviewRow = styled.div`
  padding: 0.5rem;
  border-radius: 8px;
  background: #f8fafc;
  color: #1f2937;
  font-size: 0.8rem;
  font-weight: 600;
`;

const InlineError = styled.p`
  margin: 0;
  color: #b91c1c;
  font-size: 0.78rem;
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const DialogButton = styled.button`
  min-height: 34px;
  border-radius: 8px;
  border: 1px solid
    ${({ $tone }) => {
      if ($tone === 'rejected') return '#ef4444';
      if ($tone === 'pending') return '#f59e0b';
      return '#d1d5db';
    }};
  background: ${({ $tone }) => {
    if ($tone === 'rejected') return '#ef4444';
    if ($tone === 'pending') return '#f59e0b';
    return '#ffffff';
  }};
  color: ${({ $tone }) => ($tone ? '#ffffff' : '#374151')};
  padding: 0.4rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
`;

const StateCard = styled.div`
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  color: #6b7280;
  padding: 1.2rem;
`;
