import React, { useEffect } from 'react';
import { NotFoundView } from '../components/NotFoundView';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = '404 — Ledger Record Not Found | SATYAKSH';
  }, []);

  return <NotFoundView />;
};
