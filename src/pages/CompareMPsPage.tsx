import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompareMPsView } from '../components/CompareMPsView';
import { useMpladsData } from '../context/MpladsDataContext';

export const CompareMPsPage: React.FC = () => {
  const { mps } = useMpladsData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Compare Members of Parliament — Utilization & Allocation Benchmark | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <CompareMPsView
        allMPs={mps}
        onSelectMP={(mpId) => navigate(`/mps/${mpId}`)}
      />
    </div>
  );
};
