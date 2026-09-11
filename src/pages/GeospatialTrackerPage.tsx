import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RealtimeGeospatialTracker } from '../components/RealtimeGeospatialTracker';
import { useMpladsData } from '../context/MpladsDataContext';

export const GeospatialTrackerPage: React.FC = () => {
  const { projects } = useMpladsData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Geospatial Project Tracker — Dynamic GIS Mapping | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <RealtimeGeospatialTracker
        projects={projects}
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
      />
    </div>
  );
};
