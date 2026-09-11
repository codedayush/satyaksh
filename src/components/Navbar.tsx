import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Layers, 
  FileSpreadsheet, 
  GitBranch, 
  Map, 
  Scale, 
  AlertTriangle, 
  Database, 
  Sparkles, 
  Download,
  Menu,
  X,
  Languages,
  MessageSquareWarning,
  MapPin,
  ShieldAlert,
  Activity,
  Briefcase,
  FolderLock,
  HeartPulse,
  ChevronDown,
  ShieldCheck,
  Compass,
  FileCheck,
  ChevronRight,
  Navigation,
  ArrowLeft
} from 'lucide-react';
import { exportMPsToCSV } from '../services/exportService';
import { OFFICIAL_MPS_DATA } from '../data/mpladsData';
import { useI18n } from '../i18n/I18nContext';

export type NavTab = 
  | 'dashboard'
  | 'realtime-dashboard'
  | 'geospatial-map'
  | 'risk-dashboard'
  | 'projects'
  | 'intelligence'
  | 'investigations'
  | 'evidence'
  | 'data-health'
  | 'grievances'
  | 'money-flow'
  | 'states'
  | 'compare'
  | 'signals'
  | 'sources'
  | 'about';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAiModal: () => void;
  onOpenLanguageModal?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  canGoBack?: boolean;
  onNavigateBack?: () => void;
}

interface NavItemDef {
  id: string;
  path: string;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenAiModal,
  onOpenLanguageModal,
  onNavigateBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { currentLanguageMeta, simpleMode, setSimpleMode, t } = useI18n();

  // Determine back navigation capability
  const hasHistory = typeof window !== 'undefined' && window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0;
  const isNotRoot = location.pathname !== '/';
  const canGoBack = isNotRoot || hasHistory;

  const handleGlobalBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
      return;
    }
    if (hasHistory) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const isPathActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Primary anchor items (Row 1 main bar)
  const primaryNavItems: NavItemDef[] = [
    { id: 'dashboard', path: '/', label: t('nav.home', 'National Overview'), shortLabel: 'Overview', icon: Building2 },
    { id: 'realtime-dashboard', path: '/analytics', label: 'Project Monitoring & Analytics', shortLabel: 'Analytics', icon: Activity },
    { id: 'risk-dashboard', path: '/risk-intelligence', label: 'Risk Intelligence', shortLabel: 'Risk Intel', icon: ShieldAlert, badge: 'AI' },
    { id: 'projects', path: '/projects', label: t('nav.projects', 'Project Explorer'), shortLabel: 'Projects', icon: FileSpreadsheet },
  ];

  // Secondary grouped categories (Row 2 multi-level navigation)
  const intelligenceItems: NavItemDef[] = [
    { id: 'risk-dashboard', path: '/risk-intelligence', label: 'Risk Intelligence', icon: ShieldAlert, description: 'Spatial duplicate detection & high-risk flagging' },
    { id: 'intelligence', path: '/spatial-screening', label: 'Spatial Duplicate & Risk Screening', icon: Sparkles, description: 'GPS proximity and project-scope similarity screening' },
    { id: 'signals', path: '/signals', label: 'Signals & Red Flags', icon: AlertTriangle, description: 'Contractor collusion & unspent escrow alerts' },
    { id: 'compare', path: '/compare-mps', label: 'Compare MPs', icon: Scale, description: 'Side-by-side constituency performance benchmark' },
  ];

  const explorerItems: NavItemDef[] = [
    { id: 'geospatial-map', path: '/geospatial-tracker', label: 'Geospatial Project Tracker', icon: Navigation, description: 'Google Maps dynamic centering & real-time project tracking', badge: 'MAPS' },
    { id: 'projects', path: '/projects', label: t('nav.projects', 'Project Explorer'), icon: FileSpreadsheet, description: 'Searchable master ledger with GIS coordinates' },
    { id: 'states', path: '/states', label: t('nav.hierarchy', 'States & UTs Drilldown'), icon: Map, description: 'State-by-state allocation & utilization audit' },
    { id: 'money-flow', path: '/money-flow', label: 'Money Flow', icon: GitBranch, description: 'Center → State → District escrow fund paths' },
  ];

  const investigationItems: NavItemDef[] = [
    { id: 'investigations', path: '/investigations', label: 'Investigations Case File', icon: Briefcase, description: 'Formal inquiry tracking & vigilance dossiers' },
    { id: 'evidence', path: '/evidence-vault', label: 'Evidence Vault', icon: FolderLock, description: 'Geotagged photos, audit reports & affidavits' },
    { id: 'grievances', path: '/grievances', label: t('nav.complaints', 'Citizen Grievances & Action'), icon: MessageSquareWarning, description: 'Public complaints & DM action tracker' },
  ];

  const dataIntegrityItems: NavItemDef[] = [
    { id: 'data-health', path: '/data-health', label: 'Data Provenance & Health', icon: HeartPulse, description: 'Sync freshness, schema health & validation errors' },
    { id: 'sources', path: '/data-sources', label: t('nav.sources', 'Official Data Sources'), icon: Database, description: 'MoSPI, PFMS, Lok Sabha & state portals' },
  ];

  // All navigation items for mobile drawer and search
  const allNavGroups: { groupName: string; icon: React.ElementType; items: NavItemDef[] }[] = [
    {
      groupName: 'Core Platform',
      icon: Building2,
      items: [
        { id: 'dashboard', path: '/', label: t('nav.home', 'National Overview'), icon: Building2, description: 'National metrics & financial summary' },
        { id: 'realtime-dashboard', path: '/analytics', label: 'Project Monitoring & Analytics', icon: Activity, description: 'Project tracking, Gantt schedules & analytics' },
      ]
    },
    {
      groupName: 'Intelligence & Forensics',
      icon: ShieldAlert,
      items: intelligenceItems
    },
    {
      groupName: 'Exploration & Geospatial',
      icon: Compass,
      items: explorerItems
    },
    {
      groupName: 'Investigations & Action',
      icon: Briefcase,
      items: investigationItems
    },
    {
      groupName: 'Audit & Provenance',
      icon: Database,
      items: dataIntegrityItems
    }
  ];

  const isGroupActive = (items: NavItemDef[]) => items.some(item => isPathActive(item.path));

  return (
    <header className="sticky top-0 z-40 bg-[#fbfaf7] border-b border-stone-200 shadow-xs">
      {/* ========================================================================= */}
      {/* ROW 1: PRIMARY BRANDING, DIRECT ANCHOR TABS & SEARCH/ACTION               */}
      {/* ========================================================================= */}
      <div className="border-b border-stone-200/90 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 gap-2 sm:gap-3 md:gap-4 w-full min-w-0">
            
            {/* Left section: Global Back Navigation & Brand Identity */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
              {/* Global Back Navigation Button */}
              <button
                id="global-back-nav-button"
                onClick={handleGlobalBack}
                disabled={!canGoBack}
                aria-label="Go back to previous screen"
                title={canGoBack ? "Go back to previous screen" : "At root dashboard"}
                className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-xs border transition-all select-none shrink-0 ${
                  canGoBack
                    ? 'bg-stone-900 text-stone-100 hover:bg-stone-800 hover:text-amber-300 border-stone-800 shadow-xs cursor-pointer active:scale-95'
                    : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-45'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span className="font-sans hidden xs:inline">Back</span>
              </button>

              <div className="h-5 w-px bg-stone-200 hidden sm:block shrink-0" />

              {/* Brand Identity */}
              <Link 
                to="/"
                className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer select-none min-w-0 shrink-0 text-inherit no-underline"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xs bg-stone-900 flex items-center justify-center text-amber-400 border border-amber-500/30 shadow-xs shrink-0">
                  <span className="font-serif font-black text-lg sm:text-xl tracking-tight">स</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-serif text-lg sm:text-2xl font-black tracking-tight text-stone-900 leading-none">
                      SATYAKSH
                    </span>
                    <span className="hidden sm:inline-block text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 bg-stone-100 text-stone-700 border border-stone-300 rounded-xs font-semibold shrink-0">
                      GOV.IN DATA
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[10.5px] font-sans text-stone-500 tracking-tight font-medium leading-none mt-0.5 hidden md:block">
                    See Where Public Money Goes.
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Direct Anchor Tabs (Primary items in Row 1) */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 min-w-0 overflow-hidden mx-2 xl:mx-4">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.path);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xs transition-all cursor-pointer whitespace-nowrap shrink-0 no-underline ${
                      isActive
                        ? 'bg-stone-900 text-amber-400 shadow-xs font-semibold'
                        : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/90'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="inline xl:hidden">{item.shortLabel || item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1 py-0.2 font-mono font-bold rounded-xs shrink-0 ${
                        isActive ? 'bg-amber-400 text-stone-950' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search, Ask AI & Mobile Trigger */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
              {/* Global Search Button */}
              <button
                id="navbar-search-button"
                onClick={onOpenSearch}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 md:px-3 py-1.5 bg-stone-100 hover:bg-stone-200/80 active:bg-stone-200 text-stone-600 hover:text-stone-900 border border-stone-300 rounded-xs text-xs transition-colors cursor-pointer shrink-0"
                title="Search MP, Work, Constituency (⌘K)"
                aria-label="Search Ledger"
              >
                <Search className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="hidden md:inline font-medium">Search Ledger...</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-white border border-stone-300 rounded-xs text-stone-500 shadow-2xs">
                  ⌘K
                </kbd>
              </button>

              {/* Ask AI Button */}
              <button 
                id="navbar-ask-ai-button"
                onClick={onOpenAiModal}
                className="inline-flex items-center justify-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 lg:px-3 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-amber-300 rounded-xs text-xs font-semibold transition-all cursor-pointer border border-stone-800 shadow-xs shrink-0 select-none active:scale-95"
                title="Ask AI Intelligence Assistant"
                aria-label="Ask AI Assistant"
              >
                <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline font-sans tracking-wide">Ask AI</span>
              </button>

              {/* Mobile Drawer Toggle */}
              <button
                id="navbar-mobile-menu-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xs text-stone-800 hover:bg-stone-100 active:bg-stone-200 border border-stone-300 cursor-pointer shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: SECONDARY CATEGORY ROW WITH EXPANDABLE GROUP MENUS                 */}
      {/* ========================================================================= */}
      <div className="hidden lg:block bg-[#fbfaf7] border-b border-stone-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9">
            
            <div className="flex items-center space-x-2">
              <span className="text-[10.5px] font-mono text-stone-400 uppercase tracking-wider font-semibold mr-1">
                Explore Modules:
              </span>

              {/* Group 1: Intelligence & Forensics Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('intelligence')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'intelligence' ? null : 'intelligence')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                    isGroupActive(intelligenceItems)
                      ? 'bg-stone-800 text-amber-300 font-semibold shadow-2xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  <span>Intelligence & Risk</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {activeDropdown === 'intelligence' && (
                  <div className="absolute left-0 top-full mt-0.5 w-76 bg-white border border-stone-200 rounded-xs shadow-xl z-50 p-1 divide-y divide-stone-100">
                    {intelligenceItems.map(item => {
                      const Icon = item.icon;
                      const isItemActive = isPathActive(item.path);
                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => setActiveDropdown(null)}
                          className={`w-full text-left p-2 rounded-xs flex items-start gap-2.5 transition-colors cursor-pointer no-underline ${
                            isItemActive ? 'bg-amber-50/90 text-amber-950 font-semibold' : 'hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isItemActive ? 'text-amber-700' : 'text-stone-500'}`} />
                          <div>
                            <div className="text-xs font-medium leading-tight">{item.label}</div>
                            {item.description && (
                              <div className="text-[10px] text-stone-500 mt-0.5 leading-snug">{item.description}</div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Group 2: Exploration & Geospatial Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('explorer')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'explorer' ? null : 'explorer')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                    isGroupActive(explorerItems)
                      ? 'bg-stone-800 text-amber-300 font-semibold shadow-2xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-amber-700" />
                  <span>Geospatial & Ledger</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {activeDropdown === 'explorer' && (
                  <div className="absolute left-0 top-full mt-0.5 w-76 bg-white border border-stone-200 rounded-xs shadow-xl z-50 p-1 divide-y divide-stone-100">
                    {explorerItems.map(item => {
                      const Icon = item.icon;
                      const isItemActive = isPathActive(item.path);
                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => setActiveDropdown(null)}
                          className={`w-full text-left p-2 rounded-xs flex items-start gap-2.5 transition-colors cursor-pointer no-underline ${
                            isItemActive ? 'bg-amber-50/90 text-amber-950 font-semibold' : 'hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isItemActive ? 'text-amber-700' : 'text-stone-500'}`} />
                          <div>
                            <div className="text-xs font-medium leading-tight">{item.label}</div>
                            {item.description && (
                              <div className="text-[10px] text-stone-500 mt-0.5 leading-snug">{item.description}</div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Group 3: Investigation & Case Files Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('investigations')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'investigations' ? null : 'investigations')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                    isGroupActive(investigationItems)
                      ? 'bg-stone-800 text-amber-300 font-semibold shadow-2xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                  <span>Investigations & Vault</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {activeDropdown === 'investigations' && (
                  <div className="absolute left-0 top-full mt-0.5 w-76 bg-white border border-stone-200 rounded-xs shadow-xl z-50 p-1 divide-y divide-stone-100">
                    {investigationItems.map(item => {
                      const Icon = item.icon;
                      const isItemActive = isPathActive(item.path);
                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => setActiveDropdown(null)}
                          className={`w-full text-left p-2 rounded-xs flex items-start gap-2.5 transition-colors cursor-pointer no-underline ${
                            isItemActive ? 'bg-amber-50/90 text-amber-950 font-semibold' : 'hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isItemActive ? 'text-amber-700' : 'text-stone-500'}`} />
                          <div>
                            <div className="text-xs font-medium leading-tight">{item.label}</div>
                            {item.description && (
                              <div className="text-[10px] text-stone-500 mt-0.5 leading-snug">{item.description}</div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Group 4: Data Provenance & Health Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('data')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'data' ? null : 'data')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                    isGroupActive(dataIntegrityItems)
                      ? 'bg-stone-800 text-amber-300 font-semibold shadow-2xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
                  }`}
                >
                  <HeartPulse className="w-3.5 h-3.5 text-amber-700" />
                  <span>Provenance & Sources</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {activeDropdown === 'data' && (
                  <div className="absolute left-0 top-full mt-0.5 w-76 bg-white border border-stone-200 rounded-xs shadow-xl z-50 p-1 divide-y divide-stone-100">
                    {dataIntegrityItems.map(item => {
                      const Icon = item.icon;
                      const isItemActive = isPathActive(item.path);
                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => setActiveDropdown(null)}
                          className={`w-full text-left p-2 rounded-xs flex items-start gap-2.5 transition-colors cursor-pointer no-underline ${
                            isItemActive ? 'bg-amber-50/90 text-amber-950 font-semibold' : 'hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isItemActive ? 'text-amber-700' : 'text-stone-500'}`} />
                          <div>
                            <div className="text-xs font-medium leading-tight">{item.label}</div>
                            {item.description && (
                              <div className="text-[10px] text-stone-500 mt-0.5 leading-snug">{item.description}</div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Direct Quick Shortcuts on Row 2 Right */}
            <div className="flex items-center space-x-3 text-[11px] text-stone-600">
              <Link
                to="/grievances"
                className={`inline-flex items-center gap-1 transition-colors cursor-pointer no-underline ${
                  isPathActive('/grievances') ? 'text-amber-800 font-bold' : 'hover:text-stone-900 text-stone-600'
                }`}
              >
                <MessageSquareWarning className="w-3 h-3 text-amber-700" />
                <span>Grievances</span>
              </Link>

              <span className="text-stone-300">•</span>

              <Link
                to="/data-health"
                className={`inline-flex items-center gap-1 transition-colors cursor-pointer no-underline ${
                  isPathActive('/data-health') ? 'text-amber-800 font-bold' : 'hover:text-stone-900 text-stone-600'
                }`}
              >
                <HeartPulse className="w-3 h-3 text-emerald-700" />
                <span>Sync Health</span>
              </Link>

              <span className="text-stone-300">•</span>

              <Link
                to="/data-sources"
                className={`inline-flex items-center gap-1 transition-colors cursor-pointer no-underline ${
                  isPathActive('/data-sources') ? 'text-amber-800 font-bold' : 'hover:text-stone-900 text-stone-600'
                }`}
              >
                <Database className="w-3 h-3 text-stone-500" />
                <span>Sources</span>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: UTILITY & ACTION STRIP (Language, Simple Mode, Sync Status & CSV)   */}
      {/* ========================================================================= */}
      <div className="bg-[#18181b] text-stone-300 text-[11px] py-1 px-3 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-amber-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Official Data Sync: MoSPI / PFMS
            </span>
            <span className="hidden md:inline text-stone-600">•</span>
            <span className="hidden md:inline text-stone-400 text-[10.5px]">
              18th Lok Sabha & Rajya Sabha Active Ledger • Clause 7.1 Verified
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Language Switcher */}
            <button
              onClick={onOpenLanguageModal}
              className="inline-flex items-center gap-1 text-[11px] bg-stone-800 hover:bg-stone-700 text-amber-300 px-2 py-0.5 rounded-xs border border-stone-700 font-medium transition-colors cursor-pointer"
              title="Change Language / भाषा बदलें"
            >
              <Languages className="w-3 h-3 text-amber-400" />
              <span>{currentLanguageMeta.nativeName}</span>
            </button>

            {/* Simple Mode Toggle */}
            <button
              onClick={() => setSimpleMode(!simpleMode)}
              className={`inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-xs border transition-colors cursor-pointer ${
                simpleMode 
                  ? 'bg-amber-600 text-white border-amber-500 font-semibold' 
                  : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:text-white'
              }`}
              title="Toggle simplified interface for citizens"
            >
              <span>{simpleMode ? '✓ ' + t('nav.simpleMode', 'Simple') : t('nav.simpleMode', 'Simple Mode')}</span>
            </button>

            <span className="text-stone-600 hidden xs:inline">|</span>

            {/* Export Master CSV */}
            <button 
              onClick={() => exportMPsToCSV(OFFICIAL_MPS_DATA)}
              className="inline-flex items-center gap-1 text-stone-300 hover:text-stone-100 transition-colors cursor-pointer text-[11px]"
              title="Download Master MPLADS CSV Ledger"
            >
              <Download className="w-3 h-3 text-stone-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER: LOGICALLY GROUPED & CONTAINS ALL EXISTING FEATURES         */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#fbfaf7] px-4 pt-3 pb-6 max-h-[80vh] overflow-y-auto divide-y divide-stone-200 shadow-2xl">
          {/* Mobile Drawer First Action: Ask AI Assistant */}
          <div className="pb-3">
            <button
              id="mobile-drawer-ask-ai-button"
              onClick={() => {
                onOpenAiModal();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-amber-300 p-2.5 rounded-xs flex items-center justify-between cursor-pointer border border-stone-800 shadow-xs transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xs bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 leading-tight">
                    <span>Ask AI Assistant</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-xs">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400 font-normal leading-tight mt-0.5">
                    Constituency intelligence, work status & fund tracking
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {allNavGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.groupName} className="py-3">
                <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-amber-800 font-bold mb-2">
                  <GroupIcon className="w-3.5 h-3.5 text-amber-700" />
                  <span>{group.groupName}</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isPathActive(item.path);
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full flex items-center justify-between p-2 rounded-xs text-xs font-medium transition-colors cursor-pointer no-underline ${
                          isActive
                            ? 'bg-stone-900 text-amber-400 font-semibold'
                            : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[8px] font-mono px-1 bg-amber-400 text-stone-950 rounded-xs font-bold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Mobile Utility Controls */}
          <div className="pt-4 flex items-center justify-between text-xs text-stone-600 flex-wrap gap-2">
            <button
              onClick={() => {
                onOpenLanguageModal?.();
                setMobileMenuOpen(false);
              }}
              className="text-amber-800 font-semibold flex items-center gap-1 cursor-pointer bg-stone-100 px-2.5 py-1.5 rounded-xs border border-stone-200"
            >
              <Languages className="w-4 h-4 text-amber-700" />
              <span>Language: {currentLanguageMeta.nativeName}</span>
            </button>
            
            <button
              onClick={() => {
                onOpenAiModal();
                setMobileMenuOpen(false);
              }}
              className="bg-stone-900 text-amber-300 font-semibold px-3 py-1.5 rounded-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
