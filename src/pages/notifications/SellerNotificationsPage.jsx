import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBell, FaCheck, FaCheckDouble, FaTrash, FaTimes, FaShoppingCart, FaTruck, FaMoneyBillWave, FaHeadset, FaBox, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../../shared/hooks/notifications/useNotifications';
import { PageContainer, LoadingSpinner, Button, TitleSection } from '../../shared/components/ui';
import { SkeletonTableRows } from '../../shared/components/ui/LoadingComponents';
import { PATHS } from '../../routes/routePaths';

const SellerNotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: notificationsData, isLoading } = useNotifications({
    read: filter === 'all' ? undefined : filter === 'unread' ? false : true,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.unreadCount || 0;

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = notificationsData?.data?.notifications || [];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <FaShoppingCart />;
      case 'delivery':
        return <FaTruck />;
      case 'payout':
      case 'finance':
        return <FaMoneyBillWave />;
      case 'support':
        return <FaHeadset />;
      case 'product':
        return <FaBox />;
      default:
        return <FaBell />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!(notification.read ?? notification.isRead)) {
      markAsRead.mutate(notification._id);
    }

    // Navigate based on actionUrl or metadata
    let targetPath = null;

    try {
      // Priority 1: Check for order notifications first (most common)
      if (notification.type === 'order' && notification.metadata?.orderId) {
        const orderId = notification.metadata.orderId;
        targetPath = `/dashboard/orders/${orderId}`;
      }
      // Priority 2: Use actionUrl if available
      else if (notification.actionUrl) {
        let actionPath = notification.actionUrl;
        
        // Handle template strings like ${orderId} - replace with actual orderId from metadata
        if (actionPath.includes('${orderId}') && notification.metadata?.orderId) {
          actionPath = actionPath.replace('${orderId}', notification.metadata.orderId);
        }
        
        // Ensure it starts with /dashboard
        if (!actionPath.startsWith('/dashboard')) {
          actionPath = actionPath.startsWith('/') 
            ? `/dashboard${actionPath}` 
            : `/dashboard/${actionPath}`;
        }
        
        targetPath = actionPath;
      }
      // Priority 3: Fallback to metadata-based navigation
      else if (notification.metadata?.orderId) {
        targetPath = `/dashboard/orders/${notification.metadata.orderId}`;
      } else if (notification.metadata?.ticketId) {
        targetPath = `/dashboard/support/tickets/${notification.metadata.ticketId}`;
      } else if (notification.metadata?.withdrawalId) {
        targetPath = `/dashboard/finance/withdrawals/${notification.metadata.withdrawalId}`;
      } else if (notification.metadata?.productId) {
        targetPath = `/dashboard/products/${notification.metadata.productId}`;
      }

      if (targetPath) {
        navigate(targetPath);
      } else {
        navigate('/dashboard/notifications');
      }
    } catch {
      navigate('/dashboard/notifications');
    }
  };

  const TYPE_META = {
    order:   { color: '#E8920A', bg: '#FDF3E3' },
    delivery:{ color: '#3B82F6', bg: '#EFF6FF' },
    payout:  { color: '#10B981', bg: '#ECFDF5' },
    finance: { color: '#10B981', bg: '#ECFDF5' },
    support: { color: '#8B5CF6', bg: '#F5F3FF' },
    product: { color: '#EC4899', bg: '#FDF2F8' },
  };

  const typeMeta = (type) => TYPE_META[type] || { color: '#9CA3AF', bg: '#F9F8F5' };

  if (isLoading) {
    return (
      <Page>
        <SkeletonTableRows count={8} />
      </Page>
    );
  }

  return (
    <Page>
      {/* Header */}
      <PageHeader>
        <div>
          <PageTitle>Notifications</PageTitle>
          <PageSub>Stay updated on orders, payouts, and more</PageSub>
        </div>
        <HeaderRight>
          {unreadCount > 0 && <UnreadBadge>{unreadCount} unread</UnreadBadge>}
          {notifications.length > 0 && unreadCount > 0 && (
            <MarkAllBtn onClick={() => markAllAsRead.mutate()} disabled={markAllAsRead.isPending}>
              <FaCheckDouble size={12} /> Mark all read
            </MarkAllBtn>
          )}
        </HeaderRight>
      </PageHeader>

      {/* Filters */}
      <FiltersCard>
        <FilterRow>
          <FilterLabel>Status</FilterLabel>
          <PillGroup>
            {['all','unread','read'].map((f) => (
              <Pill key={f} $active={filter === f} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Pill>
            ))}
          </PillGroup>
        </FilterRow>
        <FilterRow>
          <FilterLabel>Type</FilterLabel>
          <PillGroup>
            {['all','order','payout','support','product'].map((t) => (
              <Pill key={t} $active={typeFilter === t} onClick={() => setTypeFilter(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Pill>
            ))}
          </PillGroup>
        </FilterRow>
      </FiltersCard>

      {/* List */}
      {notifications.length === 0 ? (
        <StateCard>
          <FaBell size={32} color="#D1D5DB" />
          <EmptyTitle>No notifications</EmptyTitle>
          <EmptyMsg>
            {filter === 'unread' ? "You're all caught up!" : 'Nothing here yet.'}
          </EmptyMsg>
        </StateCard>
      ) : (
        <NotiList>
          {notifications.map((n) => {
            const unread = !(n.read ?? n.isRead);
            const meta = typeMeta(n.type);
            return (
              <NotiItem key={n._id} $unread={unread} onClick={() => handleNotificationClick(n)}>
                <NotiIcon $bg={meta.bg} $color={meta.color}>
                  {getNotificationIcon(n.type)}
                </NotiIcon>
                <NotiBody>
                  <NotiTop>
                    <NotiTitle>{n.title}</NotiTitle>
                    {unread && <UnreadDot />}
                  </NotiTop>
                  <NotiMessage>{n.message}</NotiMessage>
                  <NotiMeta>
                    <NotiTime>
                      {new Date(n.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </NotiTime>
                    <TypeChip $bg={meta.bg} $color={meta.color}>{n.type}</TypeChip>
                  </NotiMeta>
                </NotiBody>
                <NotiActions>
                  {unread && (
                    <IconBtn onClick={(e) => { e.stopPropagation(); markAsRead.mutate(n._id); }} title="Mark as read">
                      <FaCheck size={11} />
                    </IconBtn>
                  )}
                  <IconBtn
                    $danger
                    onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete?')) deleteNotification.mutate(n._id); }}
                    title="Delete"
                  >
                    <FaTrash size={11} />
                  </IconBtn>
                </NotiActions>
              </NotiItem>
            );
          })}
        </NotiList>
      )}
    </Page>
  );
};

export default SellerNotificationsPage;

/* ─── Styled Components ───────────────────────────────────────────────────── */
const Page = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.2rem;
`;

const PageSub = styled.p`
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
`;

const UnreadBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 0.65rem;
  background: #FDF3E3;
  color: #E8920A;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const MarkAllBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 32px;
  padding: 0 0.9rem;
  border-radius: 9px;
  border: 0.5px solid #F1EFE8;
  background: #FFFFFF;
  color: #374151;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;

  &:hover { background: #F9F8F5; border-color: #E8920A; color: #E8920A; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const FiltersCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  min-width: 44px;
`;

const PillGroup = styled.div`
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
`;

const Pill = styled.button`
  height: 28px;
  padding: 0 0.75rem;
  border-radius: 20px;
  border: 0.5px solid ${(p) => p.$active ? '#E8920A' : '#F1EFE8'};
  background: ${(p) => p.$active ? '#E8920A' : '#FFFFFF'};
  color: ${(p) => p.$active ? '#FFFFFF' : '#6B7280'};
  font-size: 0.775rem;
  font-weight: ${(p) => p.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.12s;

  &:hover { border-color: #E8920A; color: ${(p) => p.$active ? '#FFFFFF' : '#E8920A'}; }
`;

const NotiList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NotiItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1rem 1.2rem;
  background: ${(p) => p.$unread ? '#FFFDF9' : '#FFFFFF'};
  border: 0.5px solid #F1EFE8;
  border-left: ${(p) => p.$unread ? '3px solid #E8920A' : '0.5px solid #F1EFE8'};
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: #FFFDF9; }
`;

const NotiIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const NotiBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const NotiTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NotiTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const UnreadDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #E8920A;
  flex-shrink: 0;
`;

const NotiMessage = styled.p`
  font-size: 0.8rem;
  color: #6B7280;
  margin: 0;
  line-height: 1.5;
`;

const NotiMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.1rem;
`;

const NotiTime = styled.span`
  font-size: 0.72rem;
  color: #9CA3AF;
`;

const TypeChip = styled.span`
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: capitalize;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
`;

const NotiActions = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
`;

const IconBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 0.5px solid #F1EFE8;
  background: ${(p) => p.$danger ? '#FEF2F2' : '#FFFFFF'};
  color: ${(p) => p.$danger ? '#EF4444' : '#6B7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s;

  &:hover { border-color: ${(p) => p.$danger ? '#EF4444' : '#E8920A'}; }
`;

const StateCard = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyTitle = styled.h3`
  font-size: 0.975rem;
  font-weight: 600;
  color: #374151;
  margin: 0.5rem 0 0;
`;

const EmptyMsg = styled.p`
  font-size: 0.8rem;
  color: #9CA3AF;
  margin: 0;
`;


