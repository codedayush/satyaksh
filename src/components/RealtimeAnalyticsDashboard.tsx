import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Download, 
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ArrowUpDown,
  MapPin,
  Calendar,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  Compass,
  DollarSign,
  Users,
  Eye,
  Edit3,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  Cell, 
  PieChart, 
  Pie, 
  LineChart, 
  Line,
  Legend
} from 'recharts';
import L from 'leaflet';
import { MP, Project, StateStats, NationalAnalytics } from '../types';
import { exportProjectsToCSV } from '../services/exportService';
import { useI18n } from '../i18n/I18nContext';
import { RealtimeGeospatialTracker } from './RealtimeGeospatialTracker';

interface RealtimeAnalyticsDashboardProps {
  initialProjects: Project[];
  mps: MP[];
  states: StateStats[];
  analytics: NationalAnalytics;
  onSelectProject: (projectId: string) => void;
  onSelectMP: (mpId: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

const SECTOR_COLORS: Record<string, string> = {
  'Roads & Bridges': '#b45309',
  'Drinking Water': '#0284c7',
  'Education': '#059669',
  'Healthcare': '#dc2626',
  'Sanitation': '#7c3aed',
  'Electricity & Solar': '#d97706',
  'Community Infrastructure': '#475569',
  'Irrigation': '#0d9488',
  'Other': '#64748b'
};

const STATUS_COLORS: Record<string, string> = {
  'COMPLETED': '#16a34a',
  'IN_PROGRESS': '#d97706',
  'SANCTIONED': '#2563eb',
  'RECOMMENDED': '#64748b',
  'DELAYED': '#dc2626',
  'CANCELLED': '#991b1b'
};

export const RealtimeAnalyticsDashboard: React.FC<RealtimeAnalyticsDashboardProps> = ({
  initialProjects,
  mps,
  states,
  analytics,
  onSelectProject,
  onSelectMP,
  onNavigateToTab
}) => {
  const { t } = useI18n();

  // Primary Live Dataset state
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [activeEventNotice, setActiveEventNotice] = useState<string | null>(null);

  // Active View Tab inside the unified dashboard
  // 'overview' = Executive KPIs & Charts, 'timeline' = Gantt / Activity Schedule, 'map' = Geographic Map & Spatial Clusters, 'analytics' = Detailed Trend Analysis
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'timeline' | 'map' | 'analytics'>('overview');

  // Unified Global Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all'); // 'last30', 'last90', 'last365', 'all'
  const [minProgress, setMinProgress] = useState<number>(0);

  // Selected project for quick-view or in-place modal update
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editStatus, setEditStatus] = useState<string>('IN_PROGRESS');
  const [editProgress, setEditProgress] = useState<number>(50);
  const [editExpenditure, setEditExpenditure] = useState<number>(10);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  // Map Container & Instance Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapBaseLayer, setMapBaseLayer] = useState<'editorial' | 'osm' | 'satellite'>('editorial');

  // Sync prop updates if parent feeds refreshed data
  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setProjects(initialProjects);
    }
  }, [initialProjects]);

  // Establish Live Server-Sent Events (SSE) stream with automatic reconnect & polling fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollTimer: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/realtime/stream');
        
        eventSource.addEventListener('connected', () => {
          setRealtimeConnected(true);
          setLastSyncTime(new Date());
        });

        eventSource.addEventListener('PROJECT_UPDATED', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data.project) {
              setProjects(prev => {
                const idx = prev.findIndex(p => p.id === data.project.id || p.workCode === data.project.workCode);
                if (idx !== -1) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], ...data.project };
                  return updated;
                }
                return [data.project, ...prev];
              });
              setLastSyncTime(new Date());
              setActiveEventNotice(`Live Update: Project ${data.project.workCode} updated.`);
              setTimeout(() => setActiveEventNotice(null), 6000);
            }
          } catch (err) {
            console.warn('SSE event parsing error:', err);
          }
        });

        eventSource.onerror = () => {
          setRealtimeConnected(false);
          eventSource?.close();
          // Fallback to intelligent periodic polling
          if (!pollTimer) {
            pollTimer = setInterval(pollLatestProjects, 15000);
          }
          // Attempt reconnect after 10s
          setTimeout(connectSSE, 10000);
        };
      } catch {
        setRealtimeConnected(false);
        if (!pollTimer) {
          pollTimer = setInterval(pollLatestProjects, 15000);
        }
      }
    };

    const pollLatestProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.projects)) {
            setProjects(data.projects);
            setLastSyncTime(new Date());
          }
        }
      } catch (err) {
        console.warn('Fallback polling request failed:', err);
      }
    };

    connectSSE();

    return () => {
      eventSource?.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  // Compute available districts based on selected state
  const availableDistricts = useMemo(() => {
    if (selectedState === 'all') return [];
    const stateProjects = projects.filter(p => p.state.toLowerCase() === selectedState.toLowerCase());
    const dSet = new Set<string>();
    stateProjects.forEach(p => { if (p.district) dSet.add(p.district); });
    return Array.from(dSet).sort();
  }, [projects, selectedState]);

  // Apply Unified Global Filter across all tabs
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (selectedState !== 'all' && p.state.toLowerCase() !== selectedState.toLowerCase()) return false;
      if (selectedDistrict !== 'all' && p.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (selectedSector !== 'all' && p.sector.toLowerCase() !== selectedSector.toLowerCase()) return false;
      if (selectedStatus !== 'all' && p.workStatus !== selectedStatus) return false;
      if (selectedFinancialYear !== 'all' && p.financialYear !== selectedFinancialYear) return false;
      if (p.physicalProgress < minProgress) return false;

      if (selectedDateRange !== 'all' && p.startDate) {
        const pDate = new Date(p.startDate).getTime();
        const now = Date.now();
        const daysAgo = (now - pDate) / (1000 * 60 * 60 * 24);
        if (selectedDateRange === 'last30' && daysAgo > 30) return false;
        if (selectedDateRange === 'last90' && daysAgo > 90) return false;
        if (selectedDateRange === 'last365' && daysAgo > 365) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCode = p.workCode.toLowerCase().includes(q);
        const matchesMP = p.mpName.toLowerCase().includes(q);
        const matchesLocation = (p.locationName || '').toLowerCase().includes(q);
        const matchesDistrict = (p.district || '').toLowerCase().includes(q);
        const matchesGP = (p.gramPanchayat || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode && !matchesMP && !matchesLocation && !matchesDistrict && !matchesGP) {
          return false;
        }
      }
      return true;
    });
  }, [
    projects,
    selectedState,
    selectedDistrict,
    selectedSector,
    selectedStatus,
    selectedFinancialYear,
    selectedDateRange,
    minProgress,
    searchQuery
  ]);

  // Dynamically Calculated KPI Metrics (strictly derived from filtered dataset)
  const kpis = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const completedProjects = filteredProjects.filter(p => p.workStatus === 'COMPLETED' || p.physicalProgress === 100).length;
    const inProgressProjects = filteredProjects.filter(p => p.workStatus === 'IN_PROGRESS' || (p.physicalProgress > 0 && p.physicalProgress < 100)).length;
    const sanctionedProjects = filteredProjects.filter(p => p.workStatus === 'SANCTIONED').length;
    const delayedProjects = filteredProjects.filter(p => {
      if (p.workStatus === 'COMPLETED') return false;
      if (p.expectedCompletionDate) {
        return new Date(p.expectedCompletionDate).getTime() < Date.now();
      }
      return false;
    }).length;

    // Total Sanctioned / Allocated Budget (converted Lakh to Crore: / 100)
    const totalSanctionedLakh = filteredProjects.reduce((acc, p) => acc + (p.sanctionedCost || 0), 0);
    const totalExpenditureLakh = filteredProjects.reduce((acc, p) => acc + (p.expenditure || 0), 0);
    const remainingBudgetLakh = Math.max(0, totalSanctionedLakh - totalExpenditureLakh);

    const totalSanctionedCr = Number((totalSanctionedLakh / 100).toFixed(2));
    const totalExpenditureCr = Number((totalExpenditureLakh / 100).toFixed(2));
    const remainingBudgetCr = Number((remainingBudgetLakh / 100).toFixed(2));

    const budgetUtilizationRate = totalSanctionedLakh > 0 
      ? Number(((totalExpenditureLakh / totalSanctionedLakh) * 100).toFixed(1)) 
      : 0;

    const avgCompletion = totalProjects > 0 
      ? Number((filteredProjects.reduce((acc, p) => acc + (p.physicalProgress || 0), 0) / totalProjects).toFixed(1)) 
      : 0;

    // Estimated direct beneficiaries (approx 1,250 citizens per completed rural infrastructure work)
    const totalEstimatedBeneficiaries = (completedProjects * 1250) + (inProgressProjects * 400);

    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      sanctionedProjects,
      delayedProjects,
      totalSanctionedCr,
      totalExpenditureCr,
      remainingBudgetCr,
      budgetUtilizationRate,
      avgCompletion,
      totalEstimatedBeneficiaries
    };
  }, [filteredProjects]);

  // Chart Data: Status Distribution
  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredProjects.forEach(p => {
      const s = p.workStatus || 'SANCTIONED';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name: name === 'IN_PROGRESS' ? 'In Progress' : name.charAt(0) + name.slice(1).toLowerCase(),
      count,
      color: STATUS_COLORS[name] || '#64748b'
    }));
  }, [filteredProjects]);

  // Chart Data: Sector Distribution & Budget
  const sectorChartData = useMemo(() => {
    const map: Record<string, { count: number; sanctionedCr: number; spentCr: number }> = {};
    filteredProjects.forEach(p => {
      const s = p.sector || 'Other';
      if (!map[s]) map[s] = { count: 0, sanctionedCr: 0, spentCr: 0 };
      map[s].count += 1;
      map[s].sanctionedCr += (p.sanctionedCost || 0) / 100;
      map[s].spentCr += (p.expenditure || 0) / 100;
    });
    return Object.entries(map).map(([sector, data]) => ({
      sector,
      count: data.count,
      sanctionedCr: Number(data.sanctionedCr.toFixed(2)),
      spentCr: Number(data.spentCr.toFixed(2)),
      color: SECTOR_COLORS[sector] || '#64748b'
    })).sort((a, b) => b.sanctionedCr - a.sanctionedCr).slice(0, 8);
  }, [filteredProjects]);

  // Chart Data: Monthly Project Timeline & Expenditure Trend
  const monthlyTrendData = useMemo(() => {
    const buckets: Record<string, { month: string; projectsCount: number; expenditureLakh: number; completedCount: number }> = {};
    const defaultMonths = ['2025-01', '2025-04', '2025-07', '2025-10', '2026-01', '2026-04', '2026-07', '2026-08'];
    defaultMonths.forEach(m => {
      buckets[m] = { month: m, projectsCount: 0, expenditureLakh: 0, completedCount: 0 };
    });

    filteredProjects.forEach(p => {
      const m = p.startDate ? p.startDate.slice(0, 7) : '2025-04';
      if (!buckets[m]) {
        buckets[m] = { month: m, projectsCount: 0, expenditureLakh: 0, completedCount: 0 };
      }
      buckets[m].projectsCount += 1;
      buckets[m].expenditureLakh += Number((p.expenditure || 0).toFixed(1));
      if (p.workStatus === 'COMPLETED' || p.physicalProgress === 100) {
        buckets[m].completedCount += 1;
      }
    });

    return Object.keys(buckets).sort().map(k => ({
      month: k,
      projectsCount: buckets[k].projectsCount,
      expenditureLakh: Number(buckets[k].expenditureLakh.toFixed(1)),
      expenditureCr: Number((buckets[k].expenditureLakh / 100).toFixed(2)),
      completedCount: buckets[k].completedCount
    }));
  }, [filteredProjects]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (dashboardTab !== 'map' && dashboardTab !== 'overview') return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.5937, 78.9629], // Geographic center of India
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: true
      });

      const tileUrls = {
        editorial: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      };

      L.tileLayer(tileUrls[mapBaseLayer], {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    // Render Markers & Spatial Clusters
    if (markersLayerRef.current && mapInstanceRef.current) {
      markersLayerRef.current.clearLayers();

      const validCoordProjects = filteredProjects.filter(p => 
        p.coordinates && 
        Array.isArray(p.coordinates) && 
        p.coordinates.length === 2 && 
        !isNaN(p.coordinates[0]) && 
        !isNaN(p.coordinates[1])
      );

      // Simple grid clustering for dense markers
      const clusters: Record<string, { lat: number; lng: number; count: number; items: Project[] }> = {};

      validCoordProjects.forEach(p => {
        const latKey = p.coordinates![0].toFixed(1);
        const lngKey = p.coordinates![1].toFixed(1);
        const gridKey = `${latKey},${lngKey}`;
        if (!clusters[gridKey]) {
          clusters[gridKey] = { lat: p.coordinates![0], lng: p.coordinates![1], count: 0, items: [] };
        }
        clusters[gridKey].count += 1;
        clusters[gridKey].items.push(p);
      });

      const bounds = L.latLngBounds([]);

      Object.values(clusters).forEach(cluster => {
        const isCluster = cluster.count > 1;
        bounds.extend([cluster.lat, cluster.lng]);

        if (isCluster) {
          const clusterIcon = L.divIcon({
            className: 'custom-cluster-marker',
            html: `
              <div style="
                background: #1c1917; 
                color: #f59e0b; 
                border: 2px solid #f59e0b; 
                border-radius: 9999px; 
                width: 38px; 
                height: 38px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-family: monospace; 
                font-weight: bold; 
                font-size: 13px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                cursor: pointer;
              ">
                ${cluster.count}
              </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 19]
          });

          const clusterMarker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon });
          
          const popupHtml = `
            <div style="font-family: sans-serif; min-width: 240px; padding: 10px;">
              <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #b45309; margin-bottom: 4px;">
                ${cluster.count} Projects in District
              </div>
              <div style="font-size: 13px; font-weight: bold; color: #1c1917; margin-bottom: 8px;">
                ${cluster.items[0].district || cluster.items[0].state} Cluster
              </div>
              <div style="max-height: 160px; overflow-y: auto; font-size: 11px; border-top: 1px solid #e7e5e4; padding-top: 6px;">
                ${cluster.items.slice(0, 5).map(item => `
                  <div style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed #f5f5f4;">
                    <div style="font-weight: 600; color: #292524;">${item.title.slice(0, 45)}...</div>
                    <div style="color: #78716c; font-size: 10px;">Status: ${item.workStatus} | ${item.sanctionedCostFormatted}</div>
                  </div>
                `).join('')}
              </div>
              ${cluster.items.length > 5 ? `<div style="font-size: 10px; color: #78716c; text-align: center;">+ ${cluster.items.length - 5} more works</div>` : ''}
            </div>
          `;

          clusterMarker.bindPopup(popupHtml);
          markersLayerRef.current?.addLayer(clusterMarker);
        } else {
          const proj = cluster.items[0];
          const isDone = proj.workStatus === 'COMPLETED';
          const markerColor = isDone ? '#16a34a' : proj.workStatus === 'IN_PROGRESS' ? '#d97706' : '#2563eb';

          const singleIcon = L.divIcon({
            className: 'custom-single-marker',
            html: `
              <div style="
                background: ${markerColor}; 
                width: 16px; 
                height: 16px; 
                border-radius: 9999px; 
                border: 2px solid white; 
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                cursor: pointer;
              "></div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const singleMarker = L.marker([proj.coordinates![0], proj.coordinates![1]], { icon: singleIcon });

          const singlePopupHtml = `
            <div style="font-family: sans-serif; min-width: 250px; padding: 10px;">
              <div style="font-size: 10px; font-family: monospace; color: #78716c;">${proj.workCode}</div>
              <div style="font-size: 13px; font-weight: bold; color: #1c1917; margin: 4px 0;">${proj.title}</div>
              <div style="font-size: 11px; color: #57534e; margin-bottom: 6px;">${proj.locationName || proj.district}, ${proj.state}</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f5f5f4; padding: 6px; border-radius: 4px; font-size: 11px; margin-bottom: 8px;">
                <div><span style="color: #78716c;">Sanction:</span> <strong>${proj.sanctionedCostFormatted}</strong></div>
                <div><span style="color: #78716c;">Progress:</span> <strong>${proj.physicalProgress}%</strong></div>
              </div>
              <div style="font-size: 11px; margin-bottom: 6px;">
                <span style="color: #78716c;">MP:</span> ${proj.mpName} (${proj.mpParty})
              </div>
              <button 
                id="btn-inspect-map-${proj.id}" 
                style="width: 100%; background: #1c1917; color: #fef08a; border: none; padding: 6px; border-radius: 3px; font-size: 11px; font-weight: bold; cursor: pointer;"
              >
                Inspect Official Dossier →
              </button>
            </div>
          `;

          singleMarker.bindPopup(singlePopupHtml);
          singleMarker.on('popupopen', () => {
            const btn = document.getElementById(`btn-inspect-map-${proj.id}`);
            if (btn) {
              btn.onclick = () => onSelectProject(proj.id);
            }
          });

          markersLayerRef.current?.addLayer(singleMarker);
        }
      });

      if (validCoordProjects.length > 0 && bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
      }
    }
  }, [dashboardTab, filteredProjects, mapBaseLayer, onSelectProject]);

  // Quick In-Place Project Update Handler (demonstrating REAL data mutation + SSE broadcast)
  const handleSaveProjectUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setIsUpdating(true);
    setUpdateSuccessMsg(null);

    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workStatus: editStatus,
          physicalProgress: Number(editProgress),
          expenditure: Number(editExpenditure)
        })
      });

      const data = await res.json();
      if (data.success && data.project) {
        setProjects(prev => prev.map(p => p.id === data.project.id ? data.project : p));
        setUpdateSuccessMsg('Project updated successfully! Real-time synchronization broadcasted.');
        setTimeout(() => {
          setEditingProject(null);
          setUpdateSuccessMsg(null);
        }, 1800);
      } else {
        alert(data.error || 'Failed to update project');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Network error while persisting update');
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setEditStatus(p.workStatus);
    setEditProgress(p.physicalProgress || 0);
    setEditExpenditure(p.expenditure || 0);
    setUpdateSuccessMsg(null);
  };

  return (
    <div className="space-y-8 pb-20">

      {/* Real-time Status Notification Banner */}
      {activeEventNotice && (
        <div className="bg-amber-500/10 border border-amber-500/40 text-amber-900 px-4 py-2.5 rounded-xs flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="font-mono font-semibold">{activeEventNotice}</span>
          </div>
          <button onClick={() => setActiveEventNotice(null)} className="text-stone-500 hover:text-stone-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner & Live Connection Bar */}
      <div className="bg-stone-900 text-stone-100 p-6 rounded-xs border border-stone-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-xs">
                Real-Time Executive Intelligence
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-300 font-mono">
                <span className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {realtimeConnected ? 'SSE Live Stream: Synchronized' : 'Polling Sync: Active'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
              National Project Management & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-3xl">
              Comprehensive real-time tracking of public capital expenditure, Gantt execution schedules, geographic project markers, and financial utilization across sovereign constituencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <div className="text-right text-[11px] font-mono text-stone-400 hidden sm:block">
              <div>Last Synced: {lastSyncTime.toLocaleTimeString()}</div>
              <div>Source: MoSPI / PFMS Webhooks</div>
            </div>
            <button
              onClick={() => exportProjectsToCSV(filteredProjects)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold rounded-xs border border-stone-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Filtered ({filteredProjects.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-800">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span>Unified Cross-Component Filters</span>
            <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-xs font-mono text-[10px]">
              {filteredProjects.length} of {projects.length} Works
            </span>
          </div>
          {(selectedState !== 'all' || selectedSector !== 'all' || selectedStatus !== 'all' || selectedFinancialYear !== 'all' || searchQuery || selectedDateRange !== 'all') && (
            <button
              onClick={() => {
                setSelectedState('all');
                setSelectedDistrict('all');
                setSelectedSector('all');
                setSelectedStatus('all');
                setSelectedFinancialYear('all');
                setSelectedDateRange('all');
                setSearchQuery('');
                setMinProgress(0);
              }}
              className="text-xs text-amber-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
            <input
              type="text"
              placeholder="Search work title, ID, MP, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-xs focus:bg-white focus:outline-hidden focus:border-amber-600"
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('all');
              }}
              className="w-full py-1.5 px-2 text-xs bg-stone-50 border border-stone-300 rounded-xs focus:outline-hidden focus:border-amber-600"
            >
              <option value="all">All States & UTs</option>
              {states.map(s => (
                <option key={s.stateCode} value={s.stateName}>{s.stateName}</option>
              ))}
            </select>
          </div>

          {/* District Filter (Conditional) */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={selectedState === 'all' || availableDistricts.length === 0}
              className="w-full py-1.5 px-2 text-xs bg-stone-50 border border-stone-300 rounded-xs focus:outline-hidden focus:border-amber-600 disabled:opacity-50"
            >
              <option value="all">All Districts</option>
              {availableDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-stone-50 border border-stone-300 rounded-xs focus:outline-hidden focus:border-amber-600"
            >
              <option value="all">All Sectors</option>
              {Object.keys(SECTOR_COLORS).map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-stone-50 border border-stone-300 rounded-xs focus:outline-hidden focus:border-amber-600"
            >
              <option value="all">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SANCTIONED">Sanctioned</option>
              <option value="RECOMMENDED">Recommended</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Date Range & Progress Slider */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-stone-700">Time Range:</span>
            {['all', 'last30', 'last90', 'last365'].map(r => (
              <button
                key={r}
                onClick={() => setSelectedDateRange(r)}
                className={`px-2 py-0.5 rounded-xs text-[11px] font-mono cursor-pointer ${
                  selectedDateRange === r 
                    ? 'bg-stone-900 text-amber-300 font-bold' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {r === 'all' ? 'All Time' : r === 'last30' ? '30 Days' : r === 'last90' ? '90 Days' : '12 Months'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Min Progress:</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="10" 
              value={minProgress} 
              onChange={(e) => setMinProgress(Number(e.target.value))} 
              className="w-24 accent-amber-600"
            />
            <span className="font-mono text-stone-900 font-bold w-10 text-right">{minProgress}%</span>
          </div>
        </div>
      </div>

      {/* Dynamic KPI Cards Grid (Strictly derived from live data) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Total Projects */}
        <div className="bg-white p-4 border border-stone-200 rounded-xs shadow-xs">
          <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center justify-between">
            <span>Total Works</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="text-2xl font-serif font-black text-stone-900 mt-1">
            {kpis.totalProjects.toLocaleString()}
          </div>
          <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-bold">{kpis.completedProjects} Completed</span>
          </div>
        </div>

        {/* KPI 2: Active / In Progress */}
        <div className="bg-white p-4 border border-stone-200 rounded-xs shadow-xs">
          <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center justify-between">
            <span>In Execution</span>
            <Activity className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-black text-amber-700 mt-1">
            {kpis.inProgressProjects.toLocaleString()}
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Avg Progress: <span className="font-mono font-bold text-stone-800">{kpis.avgCompletion}%</span>
          </div>
        </div>

        {/* KPI 3: Total Allocated Budget */}
        <div className="bg-white p-4 border border-stone-200 rounded-xs shadow-xs">
          <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center justify-between">
            <span>Sanctioned Budget</span>
            <Building2 className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="text-2xl font-serif font-black text-stone-900 mt-1">
            ₹{kpis.totalSanctionedCr.toFixed(1)} <span className="text-sm font-sans font-normal text-stone-500">Cr</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            PFMS Entitlement Pool
          </div>
        </div>

        {/* KPI 4: Total Expenditure */}
        <div className="bg-white p-4 border border-stone-200 rounded-xs shadow-xs">
          <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center justify-between">
            <span>Certified Spent</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-black text-emerald-800 mt-1">
            ₹{kpis.totalExpenditureCr.toFixed(1)} <span className="text-sm font-sans font-normal text-stone-500">Cr</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Remaining: <span className="font-mono font-bold">₹{kpis.remainingBudgetCr.toFixed(1)} Cr</span>
          </div>
        </div>

        {/* KPI 5: Budget Utilization % */}
        <div className="bg-white p-4 border border-stone-200 rounded-xs shadow-xs">
          <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center justify-between">
            <span>Utilization Rate</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-black text-stone-900 mt-1">
            {kpis.budgetUtilizationRate}%
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kpis.budgetUtilizationRate)}%` }}
            />
          </div>
        </div>

        {/* KPI 6: Estimated Beneficiaries */}
        <div className="bg-white p-4 border border-stone-200 rounded-xs shadow-xs">
          <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center justify-between">
            <span>Beneficiaries</span>
            <Users className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="text-2xl font-serif font-black text-stone-900 mt-1">
            {(kpis.totalEstimatedBeneficiaries / 1000).toFixed(0)}k+
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Citizens impacted on ground
          </div>
        </div>
      </div>

      {/* Primary Sub-Navigation for Dashboard Views */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          onClick={() => setDashboardTab('overview')}
          className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            dashboardTab === 'overview'
              ? 'border-amber-600 text-stone-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Executive Overview & Analytics
        </button>

        <button
          onClick={() => setDashboardTab('timeline')}
          className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            dashboardTab === 'timeline'
              ? 'border-amber-600 text-stone-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Gantt Project Timeline</span>
        </button>

        <button
          onClick={() => setDashboardTab('map')}
          className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            dashboardTab === 'map'
              ? 'border-amber-600 text-stone-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>Geographic Map & Clusters</span>
        </button>

        <button
          onClick={() => setDashboardTab('analytics')}
          className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            dashboardTab === 'analytics'
              ? 'border-amber-600 text-stone-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
          <span>Detailed Trend Analysis</span>
        </button>
      </div>

      {/* VIEW 1: EXECUTIVE OVERVIEW & CHARTS */}
      {dashboardTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Budget vs Expenditure by Sector */}
            <div className="lg:col-span-2 bg-white p-5 border border-stone-200 rounded-xs shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase font-mono tracking-wider">
                    Capital Budget Allocation vs Actual Expenditure (by Sector)
                  </h3>
                  <p className="text-xs text-stone-500">Amounts in ₹ Crores (Cr) based on live PFMS audit records</p>
                </div>
                <span className="text-[11px] font-mono bg-stone-100 px-2 py-0.5 rounded-xs text-stone-600">
                  {sectorChartData.length} Sectors
                </span>
              </div>

              {sectorChartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-stone-400 font-mono">
                  No sectoral projects found for the selected filters.
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                      <XAxis dataKey="sector" tick={{ fontSize: 10, fill: '#78716c' }} interval={0} angle={-25} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px' }} 
                        formatter={(val: any, name: any) => [`₹${val} Cr`, name === 'sanctionedCr' ? 'Sanctioned' : 'Expenditure']}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="sanctionedCr" name="Sanctioned (Cr)" fill="#0284c7" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="spentCr" name="Expenditure (Cr)" fill="#b45309" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 2: Project Work Status Distribution */}
            <div className="bg-white p-5 border border-stone-200 rounded-xs shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase font-mono tracking-wider mb-1">
                  Works Execution Status
                </h3>
                <p className="text-xs text-stone-500 mb-4">Distribution of physical project lifecycles</p>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {statusChartData.map((entry, idx) => (
                          <Cell key={`status-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-stone-100">
                {statusChartData.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-stone-600">
                      <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: s.color }} />
                      <span>{s.name}</span>
                    </span>
                    <span className="font-mono font-bold text-stone-900">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Active Projects Table with Inline Action & Realtime Sync Trigger */}
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900 font-mono uppercase tracking-wider">
                  Live Operational Works Ledger
                </h3>
                <p className="text-xs text-stone-500">Showing synchronized real-time records. Click a project to edit progress or view details.</p>
              </div>
              <span className="text-xs font-mono text-stone-500">
                Displaying {Math.min(10, filteredProjects.length)} of {filteredProjects.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Work Code & Title</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Location / MP</th>
                    <th className="p-3 text-right">Sanctioned</th>
                    <th className="p-3 text-right">Spent</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProjects.slice(0, 10).map((proj) => {
                    const isDone = proj.workStatus === 'COMPLETED';
                    return (
                      <tr key={proj.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-3">
                          <div className="font-mono text-[10px] text-stone-500 font-semibold">{proj.workCode}</div>
                          <div 
                            onClick={() => onSelectProject(proj.id)}
                            className="font-medium text-stone-900 hover:text-amber-700 cursor-pointer line-clamp-1"
                          >
                            {proj.title}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-xs text-[10px] font-medium whitespace-nowrap">
                            {proj.sector}
                          </span>
                        </td>
                        <td className="p-3 text-stone-600">
                          <div>{proj.district}, {proj.state}</div>
                          <div className="text-[10px] text-stone-500">{proj.mpName}</div>
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-stone-900">
                          {proj.sanctionedCostFormatted}
                        </td>
                        <td className="p-3 text-right font-mono text-stone-600">
                          {proj.expenditureFormatted}
                        </td>
                        <td className="p-3">
                          <div className="w-20">
                            <div className="flex justify-between text-[10px] font-mono mb-0.5">
                              <span>{proj.physicalProgress}%</span>
                            </div>
                            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isDone ? 'bg-emerald-600' : 'bg-amber-600'}`}
                                style={{ width: `${proj.physicalProgress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-mono font-semibold ${
                            isDone ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {proj.workStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(proj)}
                              className="p-1 text-stone-600 hover:text-amber-700 hover:bg-stone-100 rounded-xs"
                              title="Update Progress & Status (Live Sync)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectProject(proj.id)}
                              className="p-1 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xs"
                              title="View Full Dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: GANTT-STYLE TIMELINE */}
      {dashboardTab === 'timeline' && (
        <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold font-mono uppercase tracking-wider text-stone-900">
                Project & Activity Gantt Schedule
              </h2>
              <p className="text-xs text-stone-500">
                Visualizing actual sanction dates, execution durations, and physical completion timelines.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-600 rounded-xs" /> Completed</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-600 rounded-xs" /> In Execution</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-sky-600 rounded-xs" /> Sanctioned</span>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs font-mono">
              No projects match current filters for Gantt display.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px] space-y-4">
                {/* Timeline Header Header Ruler */}
                <div className="grid grid-cols-12 text-[10px] font-mono text-stone-400 border-b border-stone-200 pb-2">
                  <div className="col-span-4 font-bold text-stone-700">Project / Activity Name</div>
                  <div className="col-span-1 text-center">Q1 2025</div>
                  <div className="col-span-1 text-center">Q2 2025</div>
                  <div className="col-span-1 text-center">Q3 2025</div>
                  <div className="col-span-1 text-center">Q4 2025</div>
                  <div className="col-span-1 text-center">Q1 2026</div>
                  <div className="col-span-1 text-center">Q2 2026</div>
                  <div className="col-span-1 text-center">Q3 2026</div>
                  <div className="col-span-1 text-center font-bold text-amber-700">Current (Sep 26)</div>
                </div>

                {/* Timeline Rows */}
                {filteredProjects.slice(0, 15).map((proj) => {
                  const isDone = proj.workStatus === 'COMPLETED';
                  // Calculate dynamic visual bar width & offset based on actual dates
                  const startYear = proj.startDate ? parseInt(proj.startDate.slice(0, 4), 10) : 2025;
                  const startMonth = proj.startDate ? parseInt(proj.startDate.slice(5, 7), 10) : 4;
                  const endYear = proj.expectedCompletionDate ? parseInt(proj.expectedCompletionDate.slice(0, 4), 10) : 2026;
                  const endMonth = proj.expectedCompletionDate ? parseInt(proj.expectedCompletionDate.slice(5, 7), 10) : 8;

                  const totalMonths = 24; // 2 years: Jan 2025 - Dec 2026
                  const offsetMonths = Math.max(0, (startYear - 2025) * 12 + (startMonth - 1));
                  const durationMonths = Math.max(2, (endYear - startYear) * 12 + (endMonth - startMonth));

                  const leftPct = Math.min(85, (offsetMonths / totalMonths) * 100);
                  const widthPct = Math.min(95 - leftPct, Math.max(10, (durationMonths / totalMonths) * 100));

                  return (
                    <div key={proj.id} className="grid grid-cols-12 items-center gap-2 py-2 hover:bg-stone-50 rounded-xs group transition-colors">
                      <div className="col-span-4 pr-3">
                        <div 
                          onClick={() => onSelectProject(proj.id)}
                          className="font-medium text-xs text-stone-900 group-hover:text-amber-700 cursor-pointer truncate"
                          title={proj.title}
                        >
                          {proj.title}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono flex items-center gap-2">
                          <span>{proj.workCode}</span>
                          <span>•</span>
                          <span>{proj.district}</span>
                          <span>•</span>
                          <span className="font-semibold text-stone-700">{proj.physicalProgress}%</span>
                        </div>
                      </div>

                      <div className="col-span-8 relative h-7 bg-stone-100 rounded-xs flex items-center px-1">
                        {/* Current Date Vertical Guideline */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10" 
                          style={{ left: '85%' }} 
                          title="Current System Date (Sep 2026)"
                        />

                        {/* Gantt Bar representing actual start to expected completion */}
                        <div
                          onClick={() => onSelectProject(proj.id)}
                          className={`absolute h-5 rounded-xs flex items-center justify-between px-2 text-[10px] text-white font-mono shadow-xs cursor-pointer transition-all hover:brightness-110 ${
                            isDone ? 'bg-emerald-700' : proj.workStatus === 'IN_PROGRESS' ? 'bg-amber-600' : 'bg-sky-600'
                          }`}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        >
                          <span className="truncate pr-1">{proj.startDate || '2025-04'}</span>
                          <span className="font-bold">{proj.physicalProgress}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: GEOGRAPHIC MAP & SPATIAL CLUSTERS */}
      {dashboardTab === 'map' && (
        <div className="space-y-4">
          <RealtimeGeospatialTracker
            projects={projects}
            onSelectProject={onSelectProject}
          />
        </div>
      )}

      {/* VIEW 4: DETAILED TREND ANALYSIS */}
      {dashboardTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Monthly Expenditure Trend */}
            <div className="bg-white p-5 border border-stone-200 rounded-xs shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 uppercase font-mono tracking-wider mb-1">
                Capital Outflow & PFMS Expenditure Run-Rate
              </h3>
              <p className="text-xs text-stone-500 mb-4">Cumulative monthly disbursements in ₹ Crores (Cr)</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b45309" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#b45309" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#78716c' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px' }} 
                      formatter={(val: any) => [`₹${val} Cr`, 'Certified Outlay']}
                    />
                    <Area type="monotone" dataKey="expenditureCr" stroke="#b45309" strokeWidth={2} fillOpacity={1} fill="url(#colorSpent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Cumulative Works Completion Trend */}
            <div className="bg-white p-5 border border-stone-200 rounded-xs shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 uppercase font-mono tracking-wider mb-1">
                Project Delivery & Handover Velocity
              </h3>
              <p className="text-xs text-stone-500 mb-4">Number of completed vs initiated public works by quarter</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#78716c' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="projectsCount" name="Active Works" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="completedCount" name="Completed Handover" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK IN-PLACE EDIT MODAL FOR REALTIME DEMONSTRATION */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-xs shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider font-bold">
                  Live Project Mutation Engine
                </span>
                <h3 className="text-sm font-bold text-stone-900 font-serif">
                  {editingProject.workCode}: {editingProject.title}
                </h3>
              </div>
              <button onClick={() => setEditingProject(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {updateSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">{updateSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSaveProjectUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Execution Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-xs bg-stone-50 focus:bg-white"
                  >
                    <option value="RECOMMENDED">RECOMMENDED</option>
                    <option value="SANCTIONED">SANCTIONED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DELAYED">DELAYED</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Physical Progress</span>
                    <span className="font-mono text-amber-700">{editProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Progressive Certified Expenditure (₹ Lakh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={editingProject.sanctionedCost * 1.5}
                    value={editExpenditure}
                    onChange={(e) => setEditExpenditure(Number(e.target.value))}
                    className="w-full p-2 border border-stone-300 rounded-xs bg-stone-50 focus:bg-white font-mono"
                  />
                  <div className="text-[10px] text-stone-500 mt-1">
                    Sanctioned Ceiling: ₹{editingProject.sanctionedCost} Lakh
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-3 py-1.5 border border-stone-300 text-stone-700 rounded-xs hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-1.5 bg-stone-900 text-amber-300 font-semibold rounded-xs hover:bg-stone-800 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdating ? 'Broadcasting Event...' : 'Save & Sync Live'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
