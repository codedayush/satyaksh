import React, { useEffect } from 'react';
import { DataSourcesView } from '../components/DataSourcesView';

export const DataSourcesPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Official Data Sources & MoSPI Provenance | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <DataSourcesView />
    </div>
  );
};
