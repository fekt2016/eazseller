import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { devicesMax } from "../styles/breakpoint";
import Header from "./Header";
import PublicHeader from "./PublicHeader";
import Sidebar from "./Sidebar";
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import { LoadingSpinner, LoadingContainer } from '../components/LoadingSpinner';
import SellerChatWidget from '../../features/chat/SellerChatWidget';

// Theme constants
const SIDEBAR_WIDTH = "240px";
const HEADER_HEIGHT = "64px";
const BREAKPOINT_MD = "768px";

const DashboardWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #F9F8F5;
  color: #374151;

  @media ${devicesMax.md} {
    flex-direction: column;
  }

  .dashboard-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: ${SIDEBAR_WIDTH};
    width: calc(100% - ${SIDEBAR_WIDTH});

    @media ${devicesMax.md} {
      margin-left: 0;
      width: 100%;
    }

    &.no-sidebar {
      margin-left: 0;
      width: 100%;
    }
  }

  .dashboard-main {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    background: #F9F8F5;
    max-height: calc(100vh - ${HEADER_HEIGHT});

    &.no-header {
      max-height: 100vh;
      padding: 0;
    }

    &.full-page {
      padding: 0;
      overflow-y: visible;
      max-height: none;
      background: transparent;
    }

    @media ${devicesMax.md} {
      padding: 1.5rem;
      max-height: calc(100vh - ${HEADER_HEIGHT} - 60px);

      &.no-header {
        padding: 0;
        max-height: 100vh;
      }

      &.full-page {
        padding: 0;
        overflow-y: visible;
        max-height: none;
      }
    }
  }
`;

export default function DashboardLayout({ showSidebar = true, showHeader = true, fullPage = false }) {
  const { seller } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const trackedRef = useRef(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Determine if sidebar should be shown
  // Hide sidebar if:
  // 1. showSidebar prop is false (for public pages)
  // 2. User is not authenticated (public pages)
  const shouldShowSidebar = showSidebar && !!seller;

  useEffect(() => {
    const shouldTrackHomepageSession = Boolean(seller || fullPage);
    if (!shouldTrackHomepageSession || trackedRef.current) return;

    trackedRef.current = true;
    const sessionKey = 'saiisai_seller_analytics_session_id';
    const existingSessionId =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem(sessionKey)
        : null;
    const homepageVariant = seller ? 'SELLER_DASH' : 'SELLER_GUEST';
    const sessionId =
      existingSessionId ||
      `seller-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    if (typeof window !== 'undefined' && !existingSessionId) {
      window.sessionStorage.setItem(sessionKey, sessionId);
    }

    api
      .post('/analytics/screen-views', {
        screen: `home:variant_seen:${homepageVariant}`,
        sessionId,
      })
      .catch(() => {});
    api
      .post('/analytics/screen-views', {
        screen: `home:dashboard_open:${homepageVariant}`,
        sessionId,
      })
      .catch(() => {});
  }, [fullPage, seller]);

  // Allow layout to render even if auth is loading or has errors (for public pages)
  // ProtectedRoute will handle authentication requirements for protected routes
  // Public pages can use this layout without authentication
  // Errors from useAuth are handled gracefully - seller will be null for unauthenticated users

  return (
    <DashboardWrapper>
      {shouldShowSidebar && (
        <>
          <Sidebar role={seller?.role} isOpen={isSidebarOpen} onClose={closeSidebar} />
          <Overlay $isOpen={isSidebarOpen} onClick={closeSidebar} />
        </>
      )}
      <div className={`dashboard-content ${!shouldShowSidebar ? 'no-sidebar' : ''}`}>
        {showHeader && (
          shouldShowSidebar ? (
            <Header
              user={seller}
              onToggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
            />
          ) : (
            <PublicHeader />
          )
        )}
        <main className={`dashboard-main ${!showHeader ? 'no-header' : ''} ${fullPage ? 'full-page' : ''}`}>
          <Outlet />
        </main>
      </div>
      <SellerChatWidget />
    </DashboardWrapper>
  );
}

// Styled components

const ErrorContainer = styled.div`
  padding: 2rem;
  color: #A32D2D;
  background: #FCEBEB;
  text-align: center;
  font-size: 1.2rem;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;

  @media (max-width: 768px) {
    display: block;
  }
`;
