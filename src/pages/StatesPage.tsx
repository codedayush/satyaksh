import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StateIntelligenceView } from '../components/StateIntelligenceView';
import { useMpladsData } from '../context/MpladsDataContext';

export const StatesPage: React.FC = () => {
  const { states, mps } = useMpladsData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'States & Union Territories Financial Drilldown | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <StateIntelligenceView
        states={states}
        mps={mps}
        onSelectMP={(mpId) => navigate(`/mps/${mpId}`)}
      />
    </div>
  );
};
