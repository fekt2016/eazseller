import { useState } from "react";
import { Outlet } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import Header from "./Header";
import PublicHeader from "./PublicHeader";
import Sidebar from "./Sidebar";
import useAuth from '../hooks/useAuth';
import { LoadingSpinner, LoadingContainer } from '../components/LoadingSpinner';

// Theme constants
const SIDEBAR_WIDTH = "240px";
const HEADER_HEIGHT = "64px";
const BREAKPOINT_MD = "768px";

// Create theme-based global styles specifically for this layout
const DashboardGlobalStyle = createGlobalStyle`
  .dashboard-layout {
    --sidebar-width: ${SIDEBAR_WIDTH};
    --header-height: ${HEADER_HEIGHT};
    --breakpoint-md: ${BREAKPOINT_MD};
    
    display: flex;
    min-height: 100vh;
    background-color: var(--color-grey-50);
    font-family: var(--font-body);
    color: var(--color-grey-700);
    
    @media (max-width: ${BREAKPOINT_MD}) {
      flex-direction: column;
    }
  }
  
  .dashboard-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: var(--sidebar-width);
    width: calc(100% - var(--sidebar-width));
    
    @media (max-width: ${BREAKPOINT_MD}) {
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
    max-height: calc(100vh - var(--header-height));
    background: var(--color-grey-100);
    
    @media (max-width: ${BREAKPOINT_MD}) {
      padding: 1.5rem;
      max-height: calc(100vh - var(--header-height) - 60px);
    }
  }
`;

export default function DashboardLayout({ showSidebar = true }) {
  const { seller, isLoading: isSellerLoading, error: sellerError } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Allow layout to render even if auth is loading or has errors (for public pages)
  // ProtectedRoute will handle authentication requirements for protected routes
  // Public pages can use this layout without authentication
  // Errors from useAuth are handled gracefully - seller will be null for unauthenticated users

  return (
    <>
      <DashboardGlobalStyle />
      <div className="dashboard-layout">
        {shouldShowSidebar && (
          <>
            <Sidebar role={seller?.role} isOpen={isSidebarOpen} onClose={closeSidebar} />
            <Overlay $isOpen={isSidebarOpen} onClick={closeSidebar} />
          </>
        )}
        <div className={`dashboard-content ${!shouldShowSidebar ? 'no-sidebar' : ''}`}>
          {shouldShowSidebar ? (
            <Header 
              user={seller} 
              onToggleSidebar={toggleSidebar} 
              isSidebarOpen={isSidebarOpen} 
            />
          ) : (
            <PublicHeader />
          )}
          <main className="dashboard-main">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

// Styled components

const ErrorContainer = styled.div`
  padding: 2rem;
  color: var(--color-red-700);
  background: var(--color-red-100);
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
