import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RealtimeAnalyticsDashboard } from '../components/RealtimeAnalyticsDashboard';
import { useMpladsData } from '../context/MpladsDataContext';

export const AnalyticsPage: React.FC = () => {
  const { projects, mps, states, analytics } = useMpladsData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Project Monitoring & Analytics Dashboard | SATYAKSH';
  }, []);

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

  return (
    <div className="space-y-6">
      <RealtimeAnalyticsDashboard
        initialProjects={projects}
        mps={mps}
        states={states}
        analytics={analytics}
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
        onSelectMP={(mpId) => navigate(`/mps/${mpId}`)}
        onNavigateToTab={handleTabOrRouteNavigate}
      />
    </div>
  );
};
