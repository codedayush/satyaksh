import React, { useEffect } from 'react';
import { MoneyFlowView } from '../components/MoneyFlowView';

export const MoneyFlowPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Statutory Money Flow (Center → State → District Escrow) | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <MoneyFlowView />
    </div>
  );
};
