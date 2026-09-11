import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  MP, 
  Project, 
  StateStats, 
  NationalAnalytics, 
  OfficerNotification, 
  WatchlistItem, 
  FieldVerificationRequest 
} from '../types';
import { 
  OFFICIAL_MPS_DATA, 
  ALL_STATES_AND_UTS, 
  OFFICIAL_PROJECTS_DATA, 
  NATIONAL_MPLADS_ANALYTICS 
} from '../data/mpladsData';

interface MpladsDataContextType {
  analytics: NationalAnalytics;
  mps: MP[];
  states: StateStats[];
  projects: Project[];
  notifications: OfficerNotification[];
  watchlist: WatchlistItem[];
  fieldRequests: FieldVerificationRequest[];
  loading: boolean;
  refreshData: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  removeWatchlistItem: (id: string) => Promise<void>;
  addWatchlistItem: (item: Partial<WatchlistItem>) => Promise<void>;
  createVerificationRequest: (req: Partial<FieldVerificationRequest>) => Promise<void>;
  getProjectById: (idOrWorkCode?: string) => Project | undefined;
  getMPById: (idOrSlug?: string) => MP | undefined;
  getStateByCode: (code?: string) => StateStats | undefined;
}

const MpladsDataContext = createContext<MpladsDataContextType | undefined>(undefined);

export const MpladsDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analytics, setAnalytics] = useState<NationalAnalytics>(NATIONAL_MPLADS_ANALYTICS);
  const [mps, setMps] = useState<MP[]>(OFFICIAL_MPS_DATA);
  const [states, setStates] = useState<StateStats[]>(ALL_STATES_AND_UTS);
  const [projects, setProjects] = useState<Project[]>(OFFICIAL_PROJECTS_DATA);
  const [notifications, setNotifications] = useState<OfficerNotification[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [fieldRequests, setFieldRequests] = useState<FieldVerificationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        resAnalytics, 
        resMps, 
        resStates, 
        resProjects,
        resNotifs,
        resWatchlist,
        resFieldReqs
      ] = await Promise.all([
        fetch('/api/analytics').then(r => r.ok ? r.json() : null),
        fetch('/api/mps').then(r => r.ok ? r.json() : null),
        fetch('/api/states').then(r => r.ok ? r.json() : null),
        fetch('/api/projects').then(r => r.ok ? r.json() : null),
        fetch('/api/notifications').then(r => r.ok ? r.json() : null),
        fetch('/api/watchlist').then(r => r.ok ? r.json() : null),
        fetch('/api/verification-requests').then(r => r.ok ? r.json() : null)
      ]);

      if (resAnalytics?.success && resAnalytics.analytics) {
        setAnalytics(resAnalytics.analytics);
      }
      if (resMps?.success && resMps.mps) {
        setMps(resMps.mps);
      }
      if (resStates?.success && resStates.states) {
        setStates(resStates.states);
      }
      if (resProjects?.success && resProjects.projects) {
        setProjects(resProjects.projects);
      }
      if (resNotifs?.success && resNotifs.notifications) {
        setNotifications(resNotifs.notifications);
      }
      if (resWatchlist?.success && resWatchlist.watchlist) {
        setWatchlist(resWatchlist.watchlist);
      }
      if (resFieldReqs?.success && resFieldReqs.requests) {
        setFieldRequests(resFieldReqs.requests);
      }
    } catch (err) {
      console.warn('Backend API defaulted to cached official ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Failed to mark all read:', err);
    }
  };

  const removeWatchlistItem = async (id: string) => {
    try {
      await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
      setWatchlist(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.warn('Failed to remove watchlist item:', err);
    }
  };

  const addWatchlistItem = async (item: Partial<WatchlistItem>) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (data.success && data.item) {
        setWatchlist(prev => [data.item, ...prev]);
      }
    } catch (err) {
      console.warn('Failed to add watchlist item:', err);
    }
  };

  const createVerificationRequest = async (req: Partial<FieldVerificationRequest>) => {
    try {
      const res = await fetch('/api/verification-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      const data = await res.json();
      if (data.success && data.request) {
        setFieldRequests(prev => [data.request, ...prev]);
      }
    } catch (err) {
      console.warn('Failed to create verification request:', err);
    }
  };

  const getProjectById = (idOrWorkCode?: string): Project | undefined => {
    if (!idOrWorkCode) return undefined;
    const clean = idOrWorkCode.trim().toLowerCase();
    return projects.find(p => p.id.toLowerCase() === clean || p.workCode.toLowerCase() === clean);
  };

  const getMPById = (idOrSlug?: string): MP | undefined => {
    if (!idOrSlug) return undefined;
    const clean = idOrSlug.trim().toLowerCase();
    return mps.find(m => 
      m.id.toLowerCase() === clean || 
      m.name.toLowerCase().replace(/\s+/g, '-') === clean ||
      m.name.toLowerCase() === clean
    );
  };

  const getStateByCode = (code?: string): StateStats | undefined => {
    if (!code) return undefined;
    const clean = code.trim().toLowerCase();
    return states.find(s => s.stateCode.toLowerCase() === clean || s.stateName.toLowerCase() === clean);
  };

  return (
    <MpladsDataContext.Provider
      value={{
        analytics,
        mps,
        states,
        projects,
        notifications,
        watchlist,
        fieldRequests,
        loading,
        refreshData: fetchData,
        markNotificationRead,
        markAllNotificationsRead,
        removeWatchlistItem,
        addWatchlistItem,
        createVerificationRequest,
        getProjectById,
        getMPById,
        getStateByCode
      }}
    >
      {children}
    </MpladsDataContext.Provider>
  );
};

export const useMpladsData = (): MpladsDataContextType => {
  const context = useContext(MpladsDataContext);
  if (!context) {
    throw new Error('useMpladsData must be used within a MpladsDataProvider');
  }
  return context;
};
