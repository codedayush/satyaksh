import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { OfficerAuthBar } from '../components/OfficerAuthBar';
import { OfficialDataSourceBanner } from '../components/OfficialDataSourceBanner';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { AiAssistantModal } from '../components/AiAssistantModal';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { WatchlistModal } from '../components/WatchlistModal';
import { FieldVerificationRequestsModal } from '../components/FieldVerificationRequestsModal';
import { useMpladsData } from '../context/MpladsDataContext';

// Scroll to top automatically whenever path changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export interface RootLayoutContextType {
  openSearch: () => void;
  openAi: () => void;
  openLanguage: () => void;
  openNotifications: () => void;
  openWatchlist: () => void;
  openFieldVerification: () => void;
}

export const RootLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    notifications,
    watchlist,
    fieldRequests,
    projects,
    markNotificationRead,
    markAllNotificationsRead,
    removeWatchlistItem,
    addWatchlistItem,
    createVerificationRequest
  } = useMpladsData();

  // Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isFieldVerificationOpen, setIsFieldVerificationOpen] = useState(false);

  const isDetailPage = location.pathname.startsWith('/projects/') || location.pathname.startsWith('/mps/');
  const isHomePage = location.pathname === '/';

  const handleTabOrRouteNavigate = (target: string) => {
    if (target.startsWith('/')) {
      navigate(target);
      return;
    }
    const tabToRouteMap: Record<string, string> = {
      'dashboard': '/',
      'realtime-dashboard': '/analytics',
      'analytics': '/analytics',
      'risk-dashboard': '/risk-intelligence',
      'risk-intelligence': '/risk-intelligence',
      'intelligence': '/spatial-screening',
      'spatial-screening': '/spatial-screening',
      'geospatial-map': '/geospatial-tracker',
      'geospatial-tracker': '/geospatial-tracker',
      'projects': '/projects',
      'compare': '/compare-mps',
      'compare-mps': '/compare-mps',
      'states': '/states',
      'money-flow': '/money-flow',
      'signals': '/signals',
      'investigations': '/investigations',
      'evidence': '/evidence-vault',
      'evidence-vault': '/evidence-vault',
      'grievances': '/grievances',
      'data-health': '/data-health',
      'sources': '/data-sources',
      'data-sources': '/data-sources',
    };
    navigate(tabToRouteMap[target] || `/${target}`);
  };

  const layoutContext: RootLayoutContextType = {
    openSearch: () => setIsSearchOpen(true),
    openAi: () => setIsAiOpen(true),
    openLanguage: () => setIsLanguageModalOpen(true),
    openNotifications: () => setIsNotificationsOpen(true),
    openWatchlist: () => setIsWatchlistOpen(true),
    openFieldVerification: () => setIsFieldVerificationOpen(true)
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf7] text-stone-900 selection:bg-amber-300 selection:text-stone-950">
      <ScrollToTop />

      {/* Top Officer Auth Ribbon */}
      <OfficerAuthBar
        unreadNotifsCount={notifications.filter(n => !n.read).length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        watchlistCount={watchlist.length}
      />

      {/* Primary Navigation Bar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAiModal={() => setIsAiOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
      />

      {/* Main Multi-Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-12 space-y-4 sm:space-y-6">
        
        {/* Breadcrumb Navigation Trail */}
        {!isHomePage && <Breadcrumbs />}

        {/* Official Data Source Telemetry Banner */}
        {!isDetailPage && (
          <OfficialDataSourceBanner
            onNavigateToDataHealth={() => navigate('/data-sources')}
          />
        )}

        {/* Dynamic Page Outlet */}
        <Outlet context={layoutContext} />
      </main>

      {/* Institutional Footer */}
      <Footer />

      {/* Shared Platform Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMP={(mpId) => {
          navigate(`/mps/${mpId}`);
          setIsSearchOpen(false);
        }}
        onSelectProject={(projectId) => {
          navigate(`/projects/${projectId}`);
          setIsSearchOpen(false);
        }}
        onSelectState={() => {
          navigate('/states');
          setIsSearchOpen(false);
        }}
      />

      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onSelectProject={(proj) => {
          navigate(`/projects/${proj.id}`);
          setIsAiOpen(false);
        }}
        onNavigate={(tabOrRoute) => {
          handleTabOrRouteNavigate(tabOrRoute);
          setIsAiOpen(false);
        }}
      />

      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
        onSelectProject={(projectId) => {
          navigate(`/projects/${projectId}`);
          setIsNotificationsOpen(false);
        }}
        onNavigateToInvestigations={() => {
          navigate('/investigations');
          setIsNotificationsOpen(false);
        }}
      />

      <WatchlistModal
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        onRemoveItem={removeWatchlistItem}
        onAddItem={addWatchlistItem}
        onSelectProject={(projectId) => {
          navigate(`/projects/${projectId}`);
          setIsWatchlistOpen(false);
        }}
        onSelectMP={(mpId) => {
          navigate(`/mps/${mpId}`);
          setIsWatchlistOpen(false);
        }}
      />

      <FieldVerificationRequestsModal
        isOpen={isFieldVerificationOpen}
        onClose={() => setIsFieldVerificationOpen(false)}
        requests={fieldRequests}
        projects={projects}
        onCreateRequest={createVerificationRequest}
        onSelectProject={(projectId) => {
          navigate(`/projects/${projectId}`);
          setIsFieldVerificationOpen(false);
        }}
      />
    </div>
  );
};
