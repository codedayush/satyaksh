import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { DashboardView } from '../components/DashboardView';
import { useMpladsData } from '../context/MpladsDataContext';
import { RootLayoutContextType } from '../layouts/RootLayout';

export const HomePage: React.FC = () => {
  const { analytics, mps, states } = useMpladsData();
  const navigate = useNavigate();
  const { openAi } = useOutletContext<RootLayoutContextType>();

  useEffect(() => {
    document.title = 'SATYAKSH | See Where Public Money Goes — National Overview';
  }, []);

  return (
    <div className="space-y-6">
      <HeroSection
        analytics={analytics}
        onExploreData={() => navigate('/projects')}
        onCompareMPs={() => navigate('/compare-mps')}
        onOpenAi={openAi}
      />
      <DashboardView
        analytics={analytics}
        mps={mps}
        states={states}
        onSelectMP={(mpId) => navigate(`/mps/${mpId}`)}
        onSelectState={() => navigate('/states')}
        onNavigateToProjects={() => navigate('/projects')}
        onNavigateToRealtimeDashboard={() => navigate('/analytics')}
      />
    </div>
  );
};
