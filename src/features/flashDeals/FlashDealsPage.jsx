import { useMemo, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import useAuth from "../../shared/hooks/useAuth";
import useProduct from "../../shared/hooks/useProduct";
import {
  useGetActiveFlashDeals,
  useGetMySubmissions,
  useSubmitProduct,
  useWithdrawSubmission,
} from "../../shared/hooks/useFlashDeal";

const Page = styled.div`
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  margin: 1.5rem 0 0.75rem;
  font-size: 1.15rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-card-bg, #fff);
`;

const Banner = styled.div`
  height: 120px;
  background: ${({ $img }) =>
    $img ? `center/cover no-repeat url(${$img})` : "#f3f4f6"};
`;

const CardBody = styled.div`
  padding: 0.75rem 1rem 1rem;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $tone }) =>
    $tone === "pending"
      ? "#fef9c3"
      : $tone === "approved"
        ? "#dcfce7"
        : $tone === "rejected"
          ? "#fee2e2"
          : "#e5e7eb"};
  color: #111827;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  background: var(--color-card-bg, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
`;

const Td = styled.td`
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #eef2f7;
`;

const Btn = styled.button`
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-primary-500, #fbbf24);
  cursor: pointer;
  font-weight: 600;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalBg = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  padding: 1rem;
  max-height: 90vh;
  overflow-y: auto;
`;

const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

function useCountdown(targetDate) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => {
      const t = new Date(targetDate).getTime() - Date.now();
      setLeft(Math.max(0, t));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return left;
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
}

function previewFlashPrice(original, type, value) {
  const o = Number(original);
  const v = Number(value);
  if (!Number.isFinite(o) || o <= 0 || !Number.isFinite(v)) return null;
  let fp =
    type === "percentage" ? o * (1 - v / 100) : o - v;
  fp = Math.round(fp * 100) / 100;
  if (fp <= 0 || fp >= o) return null;
  return fp;
}

function displayStatus(deal) {
  return deal?.currentStatus || deal?.status;
}

export default function FlashDealsPage() {
  const { seller } = useAuth();
  const sellerId = seller?.id || seller?._id;
  const { useGetAllProductBySeller } = useProduct();
  const { data: productData } = useGetAllProductBySeller(sellerId);

  const sellerProducts = useMemo(() => {
    const payload = productData?.data || productData;
    const candidates = [
      payload?.data,
      payload?.products,
      payload?.data?.products,
      payload?.items,
    ];
    for (const value of candidates) {
      if (Array.isArray(value)) return value;
    }
    return [];
  }, [productData]);

  const activeProducts = useMemo(
    () =>
      sellerProducts.filter(
        (p) =>
          p.status === "active" &&
          (!p.moderationStatus || p.moderationStatus === "approved") &&
          !p.isDeleted
      ),
    [sellerProducts]
  );

  const { data: deals = [], isLoading, refetch } = useGetActiveFlashDeals();
  const { data: submissions = [], refetch: refetchSubs } = useGetMySubmissions(
    {}
  );
  const submitMut = useSubmitProduct();
  const withdrawMut = useWithdrawSubmission();

  const [modalDeal, setModalDeal] = useState(null);
  const [productId, setProductId] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");

  const submittedProductIdsForDeal = useCallback(
    (dealId) => {
      const set = new Set();
      submissions.forEach((s) => {
        if (String(s.flashDeal?._id || s.flashDeal) === String(dealId)) {
          set.add(String(s.product?._id || s.product));
        }
      });
      return set;
    },
    [submissions]
  );

  const selectableProducts = useMemo(() => {
    if (!modalDeal) return [];
    const taken = submittedProductIdsForDeal(modalDeal._id);
    return activeProducts.filter((p) => !taken.has(String(p._id)));
  }, [modalDeal, activeProducts, submittedProductIdsForDeal]);

  const selectedProduct = useMemo(
    () => activeProducts.find((p) => String(p._id) === String(productId)),
    [activeProducts, productId]
  );

  const preview = useMemo(() => {
    if (!selectedProduct || !discountValue) return null;
    return previewFlashPrice(
      selectedProduct.price,
      discountType,
      discountValue
    );
  }, [selectedProduct, discountType, discountValue]);

  const discountPctPreview = useMemo(() => {
    if (!selectedProduct || preview == null) return 0;
    const o = Number(selectedProduct.price);
    if (!o) return 0;
    return Math.round(((o - preview) / o) * 100);
  }, [selectedProduct, preview]);

  const handleSubmit = async () => {
    if (!modalDeal || !productId || !discountValue) {
      toast.error("Select product and discount");
      return;
    }
    try {
      await submitMut.mutateAsync({
        flashDealId: modalDeal._id,
        productId,
        discountType,
        discountValue: Number(discountValue),
      });
      toast.success("Submitted for review");
      setModalDeal(null);
      setProductId("");
      setDiscountValue("");
      refetch();
      refetchSubs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Submit failed");
    }
  };

  return (
    <Page>
      <h1>Flash Deals</h1>
      <SectionTitle>Available flash deals</SectionTitle>
      {isLoading ? (
        <p>Loading…</p>
      ) : deals.length === 0 ? (
        <p>No upcoming or live flash deals right now.</p>
      ) : (
        <Grid>
          {deals.map((deal) => (
            <DealCard
              key={deal._id}
              deal={deal}
              onSubmit={() => {
                setModalDeal(deal);
                setProductId("");
                setDiscountType("percentage");
                setDiscountValue("");
              }}
            />
          ))}
        </Grid>
      )}

      <SectionTitle>My submissions</SectionTitle>
      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Deal</Th>
            <Th>Prices</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s._id}>
              <Td>{s.product?.name}</Td>
              <Td>{s.flashDeal?.title}</Td>
              <Td>
                GH₵{s.originalPrice} → GH₵{s.flashPrice} (
                {s.originalPrice
                  ? Math.round(
                      ((s.originalPrice - s.flashPrice) / s.originalPrice) *
                        100
                    )
                  : 0}
                %)
              </Td>
              <Td>
                <Badge
                  $tone={
                    s.status === "pending"
                      ? "pending"
                      : s.status === "approved"
                        ? "approved"
                        : "rejected"
                  }
                >
                  {s.status}
                </Badge>
                {s.status === "rejected" && s.rejectionReason && (
                  <div style={{ fontSize: "0.75rem", marginTop: 4 }}>
                    {s.rejectionReason}
                  </div>
                )}
              </Td>
              <Td>
                {s.status === "pending" && (
                  <Btn
                    type="button"
                    onClick={async () => {
                      try {
                        await withdrawMut.mutateAsync(s._id);
                        toast.success("Withdrawn");
                        refetchSubs();
                        refetch();
                      } catch (e) {
                        toast.error(e?.response?.data?.message || "Failed");
                      }
                    }}
                    disabled={withdrawMut.isPending}
                  >
                    Withdraw
                  </Btn>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {modalDeal && (
        <ModalBg onClick={() => setModalDeal(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Submit product</h3>
            <p style={{ fontSize: "0.9rem" }}>{modalDeal.title}</p>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Discount range: {modalDeal.discountRules?.minDiscountPercent}%
              –{modalDeal.discountRules?.maxDiscountPercent}%
            </p>
            <Label>Product</Label>
            <Select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select…</option>
              {selectableProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — GH₵{p.price}
                </option>
              ))}
            </Select>
            <Label>Discount type</Label>
            <Select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed (GH₵)</option>
            </Select>
            <Label>Value</Label>
            <Input
              type="number"
              min={1}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
            {selectedProduct && preview != null && (
              <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
                Flash price preview: <strong>GH₵{preview}</strong> (~
                {discountPctPreview}% off)
              </p>
            )}
            {discountPctPreview > 50 && (
              <p style={{ color: "#b45309", fontSize: "0.85rem" }}>
                Large discount — ensure margins are healthy.
              </p>
            )}
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <Btn type="button" onClick={() => setModalDeal(null)}>
                Cancel
              </Btn>
              <Btn
                type="button"
                onClick={handleSubmit}
                disabled={submitMut.isPending}
              >
                Submit
              </Btn>
            </div>
          </Modal>
        </ModalBg>
      )}
    </Page>
  );
}

function DealCard({ deal, onSubmit }) {
  const toEndMs = useCountdown(deal.endTime);
  const toStartMs = useCountdown(deal.startTime);
  const st = displayStatus(deal);
  const full =
    (deal.approvedProductCount || 0) >= (deal.maxProducts || 50);

  return (
    <Card>
      <Banner $img={deal.bannerImage} />
      <CardBody>
        <strong>{deal.title}</strong>
        <div style={{ fontSize: "0.85rem", color: "#4b5563", marginTop: 6 }}>
          {st === "scheduled" && (
            <span>Starts in {formatDuration(toStartMs)}</span>
          )}
          {st === "active" && <span>Ends in {formatDuration(toEndMs)}</span>}
        </div>
        <div style={{ fontSize: "0.85rem", marginTop: 6 }}>
          Discount: {deal.discountRules?.minDiscountPercent ?? 10}% –{" "}
          {deal.discountRules?.maxDiscountPercent ?? 70}%
        </div>
        <div style={{ fontSize: "0.85rem", marginTop: 4 }}>
          Slots: {deal.approvedProductCount || 0}/{deal.maxProducts || 50}
        </div>
        {deal.mySubmission ? (
          <div style={{ marginTop: 10 }}>
            <Badge $tone={deal.mySubmission.status}>
              {deal.mySubmission.status}
            </Badge>
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <Btn type="button" onClick={onSubmit} disabled={full}>
              Submit product
            </Btn>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
