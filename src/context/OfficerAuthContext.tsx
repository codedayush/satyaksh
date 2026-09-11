import React, { createContext, useContext, useState, useEffect } from 'react';
import { OfficerUser, OfficerRole } from '../types';

export const OFFICIAL_OFFICERS: OfficerUser[] = [
  {
    id: 'usr-super-admin-01',
    badgeId: 'MOSPI-DIR-001',
    name: 'Dr. Rameshwar Varma, IAS',
    designation: 'Joint Secretary & Director General (Vigilance & Monitoring)',
    department: 'Ministry of Statistics & Programme Implementation (MoSPI)',
    email: 'rameshwar.varma@nic.in',
    role: 'SUPER_ADMIN',
    jurisdiction: 'National - All States & Union Territories',
    assignedCasesCount: 14,
    lastLogin: '2026-09-01T08:15:00Z'
  },
  {
    id: 'usr-admin-officer-02',
    badgeId: 'DM-NODAL-BR-04',
    name: 'Priyanka Sen, IAS',
    designation: 'District Magistrate & Chief Nodal Officer',
    department: 'District Planning & MPLADS Administration, Katihar',
    email: 'priyanka.sen@bihar.gov.in',
    role: 'ADMIN_OFFICER',
    jurisdiction: 'Bihar - Katihar & Purnia Region',
    assignedCasesCount: 8,
    lastLogin: '2026-09-01T07:45:00Z'
  },
  {
    id: 'usr-investigation-03',
    badgeId: 'OFF-VIG-2026-904',
    name: 'Vikramaditya Sharma',
    designation: 'Senior Executive Engineer (Forensic Quality Audit)',
    department: 'State Vigilance Cell & Anti-Duplication Bureau',
    email: 'v.sharma@vigilance.gov.in',
    role: 'INVESTIGATION_OFFICER',
    jurisdiction: 'Northern Eastern Zone',
    assignedCasesCount: 5,
    lastLogin: '2026-09-01T08:30:00Z'
  },
  {
    id: 'usr-analyst-04',
    badgeId: 'ANL-PFMS-552',
    name: 'Ananya Deshmukh',
    designation: 'Senior Geospatial & Financial Data Scientist',
    department: 'PFMS Analytics & Network Intelligence Unit',
    email: 'ananya.deshmukh@pfms.nic.in',
    role: 'ANALYST',
    jurisdiction: 'National Technical Intelligence',
    assignedCasesCount: 3,
    lastLogin: '2026-08-31T17:20:00Z'
  },
  {
    id: 'usr-viewer-05',
    badgeId: 'PUB-AUDIT-109',
    name: 'Citizen / Legislative Auditor',
    designation: 'Accredited Transparency Observer',
    department: 'Parliamentary Accounts & Public Oversight',
    email: 'observer.public@satyaksh.gov.in',
    role: 'VIEWER',
    jurisdiction: 'Public Domain Read-Only',
    assignedCasesCount: 0,
    lastLogin: '2026-09-01T06:00:00Z'
  }
];

interface OfficerAuthContextType {
  currentUser: OfficerUser;
  setCurrentUser: (user: OfficerUser) => void;
  allOfficers: OfficerUser[];
  switchRole: (role: OfficerRole) => void;
  hasPermission: (action: 'MANAGE_SYSTEM' | 'ASSIGN_INVESTIGATION' | 'INVESTIGATE' | 'VIEW_ANALYTICS' | 'MANAGE_EVIDENCE' | 'TRIGGER_SYNC') => boolean;
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
}

const OfficerAuthContext = createContext<OfficerAuthContextType | undefined>(undefined);

export const OfficerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<OfficerUser>(() => {
    const savedId = localStorage.getItem('satyaksh_officer_id');
    const found = OFFICIAL_OFFICERS.find(o => o.id === savedId);
    return found || OFFICIAL_OFFICERS[0]; // Default to Super Admin for seamless evaluation
  });

  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    return localStorage.getItem('satyaksh_demo_mode') === 'true';
  });

  const setDemoMode = (enabled: boolean) => {
    setDemoModeState(enabled);
    localStorage.setItem('satyaksh_demo_mode', enabled ? 'true' : 'false');
  };

  const switchRole = (role: OfficerRole) => {
    const matching = OFFICIAL_OFFICERS.find(o => o.role === role) || OFFICIAL_OFFICERS[0];
    setCurrentUser(matching);
    localStorage.setItem('satyaksh_officer_id', matching.id);
  };

  const hasPermission = (action: 'MANAGE_SYSTEM' | 'ASSIGN_INVESTIGATION' | 'INVESTIGATE' | 'VIEW_ANALYTICS' | 'MANAGE_EVIDENCE' | 'TRIGGER_SYNC'): boolean => {
    const role = currentUser.role;
    if (role === 'SUPER_ADMIN') return true;

    switch (action) {
      case 'MANAGE_SYSTEM':
      case 'TRIGGER_SYNC':
        return role === 'SUPER_ADMIN';
      case 'ASSIGN_INVESTIGATION':
        return role === 'ADMIN_OFFICER';
      case 'INVESTIGATE':
      case 'MANAGE_EVIDENCE':
        return role === 'INVESTIGATION_OFFICER' || role === 'ADMIN_OFFICER';
      case 'VIEW_ANALYTICS':
        return role === 'ANALYST' || role === 'ADMIN_OFFICER' || role === 'INVESTIGATION_OFFICER';
      default:
        return false;
    }
  };

  return (
    <OfficerAuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allOfficers: OFFICIAL_OFFICERS,
        switchRole,
        hasPermission,
        demoMode,
        setDemoMode
      }}
    >
      {children}
    </OfficerAuthContext.Provider>
  );
};

export const useOfficerAuth = () => {
  const context = useContext(OfficerAuthContext);
  if (!context) {
    throw new Error('useOfficerAuth must be used within an OfficerAuthProvider');
  }
  return context;
};
