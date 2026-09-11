import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home, Share2, Check } from 'lucide-react';
import { useMpladsData } from '../context/MpladsDataContext';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { projectId, mpId } = useParams<{ projectId?: string; mpId?: string }>();
  const { getProjectById, getMPById } = useMpladsData();
  const [copied, setCopied] = React.useState(false);

  // If on home page, hide breadcrumbs
  if (location.pathname === '/') {
    return null;
  }

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const routeLabelMap: Record<string, string> = {
    'projects': 'Project Explorer',
    'analytics': 'Project Monitoring & Analytics',
    'risk-intelligence': 'Risk Intelligence',
    'spatial-screening': 'Spatial Risk Screening',
    'geospatial-tracker': 'Geospatial Project Tracker',
    'compare-mps': 'Compare Members of Parliament',
    'states': 'States & UTs Ledger',
    'money-flow': 'Statutory Money Flow',
    'signals': 'Transparency Signals & Red Flags',
    'investigations': 'Vigilance Investigations',
    'evidence-vault': 'Evidence Vault',
    'grievances': 'Citizen Grievances & Action',
    'data-health': 'Data Provenance & Health',
    'data-sources': 'Official Data Sources',
    'mps': 'Parliamentarians'
  };

  const breadcrumbs: { label: string; path: string; isCurrent: boolean }[] = [
    { label: 'Home', path: '/', isCurrent: false }
  ];

  let accumulatedPath = '';
  pathSegments.forEach((segment, index) => {
    accumulatedPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    let label = routeLabelMap[segment] || segment;

    // Check if this segment is a projectId
    if (projectId && (segment === projectId || segment.toLowerCase() === projectId.toLowerCase())) {
      const proj = getProjectById(projectId);
      label = proj ? `${proj.workCode}: ${proj.title.slice(0, 32)}${proj.title.length > 32 ? '...' : ''}` : `Project ${segment}`;
    } else if (mpId && (segment === mpId || segment.toLowerCase() === mpId.toLowerCase())) {
      const mp = getMPById(mpId);
      label = mp ? `${mp.name} (${mp.constituency})` : `MP ${segment}`;
    }

    breadcrumbs.push({
      label,
      path: accumulatedPath,
      isCurrent: isLast
    });
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center justify-between py-2.5 px-3.5 bg-white border border-stone-200/90 rounded-xs shadow-2xs text-xs"
    >
      <ol className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5 text-stone-600 min-w-0">
        {breadcrumbs.map((crumb, idx) => {
          const isFirst = idx === 0;
          const isLast = crumb.isCurrent;

          return (
            <li key={crumb.path} className="flex items-center whitespace-nowrap min-w-0">
              {!isFirst && (
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 mx-1 shrink-0" />
              )}
              {isLast ? (
                <span 
                  className="font-semibold text-stone-950 truncate max-w-xs md:max-w-md bg-stone-100 px-2 py-0.5 rounded-xs"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 hover:underline transition-colors cursor-pointer text-xs"
                >
                  {isFirst && <Home className="w-3.5 h-3.5 shrink-0 text-stone-500" />}
                  <span>{crumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <button
        onClick={handleShare}
        title="Copy direct shareable link"
        className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xs transition-colors shrink-0 ml-3 cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-600" />
            <span className="text-emerald-700 font-sans font-medium">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3 h-3 text-stone-500" />
            <span className="font-sans">Share Page</span>
          </>
        )}
      </button>
    </nav>
  );
};
