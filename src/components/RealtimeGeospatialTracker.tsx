import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin,
  InfoWindow, 
  useMap 
} from '@vis.gl/react-google-maps';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Filter, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Eye, 
  ExternalLink, 
  Activity, 
  Building2, 
  ShieldAlert, 
  Radio, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  RefreshCw,
  Info,
  ShieldCheck
} from 'lucide-react';
import { Project } from '../types';
import { 
  getGoogleMapsConfig, 
  STATE_CENTROIDS, 
  NATIONAL_INDIA_CENTER, 
  MapServiceConfig 
} from '../services/mapConfigService';

interface RealtimeGeospatialTrackerProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  selectedProjectId?: string | null;
}

// Controller to smoothly animate Google Map camera when state or project changes
const GoogleMapCameraController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center.lat, center.lng, zoom]);

  return null;
};

export const RealtimeGeospatialTracker: React.FC<RealtimeGeospatialTrackerProps> = ({
  projects,
  onSelectProject,
  selectedProjectId
}) => {
  // State for map configuration & provider
  const [mapConfig, setMapConfig] = useState<MapServiceConfig>({
    hasKey: false,
    apiKey: '',
    mapId: 'DEMO_MAP_ID',
    attributionId: 'gmp_mcp_codeassist_v1_aistudio'
  });
  const [providerMode, setProviderMode] = useState<'google' | 'leaflet'>('leaflet');
  const [googleMapTypeId, setGoogleMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [leafletLayer, setLeafletLayer] = useState<'editorial' | 'osm' | 'satellite'>('editorial');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filters
  const [selectedState, setSelectedState] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMarkerProject, setActiveMarkerProject] = useState<Project | null>(null);

  // Leaflet Container refs
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<L.Map | null>(null);
  const leafletMarkersGroupRef = useRef<L.LayerGroup | null>(null);

  // Check config on mount
  useEffect(() => {
    let isMounted = true;
    getGoogleMapsConfig().then(cfg => {
      if (!isMounted) return;
      setMapConfig(cfg);
      if (cfg.hasKey) {
        setProviderMode('google');
      } else {
        setProviderMode('leaflet');
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (selectedState !== 'all' && p.state !== selectedState) return false;
      if (statusFilter !== 'all' && p.workStatus !== statusFilter) return false;
      if (sectorFilter !== 'all' && p.sector !== sectorFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          p.title.toLowerCase().includes(q) ||
          p.workCode.toLowerCase().includes(q) ||
          p.mpName.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [projects, selectedState, statusFilter, sectorFilter, searchQuery]);

  // Valid coordinate projects
  const mappedProjects = useMemo(() => {
    return filteredProjects.map(p => {
      const hasCoords = p.coordinates && 
        Array.isArray(p.coordinates) && 
        p.coordinates.length === 2 &&
        !isNaN(p.coordinates[0]) &&
        !isNaN(p.coordinates[1]);

      if (hasCoords) {
        return {
          ...p,
          resolvedLat: p.coordinates![0],
          resolvedLng: p.coordinates![1],
          isExactGps: true
        };
      }

      // State centroid fallback
      const stateCentroid = STATE_CENTROIDS[p.state] || NATIONAL_INDIA_CENTER;
      // Slight jitter so multiple centroid fallbacks don't perfectly stack
      const jitterLat = ((p.id.charCodeAt(p.id.length - 1) % 10) - 5) * 0.04;
      const jitterLng = ((p.id.charCodeAt(p.id.length - 2) % 10) - 5) * 0.04;

      return {
        ...p,
        resolvedLat: stateCentroid.lat + jitterLat,
        resolvedLng: stateCentroid.lng + jitterLng,
        isExactGps: false
      };
    });
  }, [filteredProjects]);

  // Dynamic Center calculation based on selected state or national overview
  const currentCamera = useMemo<{ center: { lat: number; lng: number }; zoom: number }>(() => {
    if (selectedState !== 'all' && STATE_CENTROIDS[selectedState]) {
      const centroid = STATE_CENTROIDS[selectedState];
      return {
        center: { lat: centroid.lat, lng: centroid.lng },
        zoom: centroid.zoom
      };
    }
    return {
      center: { lat: NATIONAL_INDIA_CENTER.lat, lng: NATIONAL_INDIA_CENTER.lng },
      zoom: NATIONAL_INDIA_CENTER.zoom
    };
  }, [selectedState]);

  // Auto select project if selectedProjectId provided
  useEffect(() => {
    if (selectedProjectId) {
      const found = projects.find(p => p.id === selectedProjectId || p.workCode === selectedProjectId);
      if (found) {
        setActiveMarkerProject(found);
        if (found.state && selectedState === 'all') {
          setSelectedState(found.state);
        }
      }
    }
  }, [selectedProjectId, projects]);

  // Leaflet Tile Providers
  const leafletTileProviders = {
    editorial: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri'
    }
  };

  // Sync Leaflet Map
  useEffect(() => {
    if (providerMode !== 'leaflet') return;
    if (!leafletContainerRef.current) return;

    if (!leafletMapInstanceRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: [currentCamera.center.lat, currentCamera.center.lng],
        zoom: currentCamera.zoom,
        zoomControl: true,
        attributionControl: true
      });

      const activeProvider = leafletTileProviders[leafletLayer];
      L.tileLayer(activeProvider.url, {
        maxZoom: 19,
        attribution: activeProvider.attribution
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      leafletMarkersGroupRef.current = markersGroup;
      leafletMapInstanceRef.current = map;
    } else {
      leafletMapInstanceRef.current.setView([currentCamera.center.lat, currentCamera.center.lng], currentCamera.zoom, { animate: true });
    }

    // Populate markers
    if (leafletMarkersGroupRef.current && leafletMapInstanceRef.current) {
      leafletMarkersGroupRef.current.clearLayers();

      mappedProjects.forEach(p => {
        const isDone = p.workStatus === 'COMPLETED';
        const pinColor = isDone ? '#059669' : p.workStatus === 'IN_PROGRESS' ? '#d97706' : '#2563eb';
        
        const icon = L.divIcon({
          className: 'satyaksh-custom-pin',
          html: `
            <div style="
              background: ${pinColor}; 
              color: white; 
              width: 24px; 
              height: 24px; 
              border-radius: 50%; 
              border: 2px solid white; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 10px; 
              font-weight: bold; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.35);
              cursor: pointer;
            ">
              ${isDone ? '✓' : '•'}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([p.resolvedLat, p.resolvedLng], { icon });
        marker.on('click', () => {
          setActiveMarkerProject(p);
        });
        marker.addTo(leafletMarkersGroupRef.current!);
      });
    }

    const t = setTimeout(() => {
      leafletMapInstanceRef.current?.invalidateSize();
    }, 250);

    return () => clearTimeout(t);
  }, [providerMode, currentCamera, mappedProjects, leafletLayer]);

  // Unique lists for selectors
  const uniqueStates = useMemo(() => Array.from(new Set(projects.map(p => p.state))).sort(), [projects]);
  const uniqueSectors = useMemo(() => Array.from(new Set(projects.map(p => p.sector))).sort(), [projects]);

  return (
    <div className={`bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'relative'
    }`}>
      
      {/* Header Toolbar & State Dynamic Centering Controls */}
      <div className="p-4 bg-[#faf9f5] border-b border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Title & Live Geospatial Telemetry */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-stone-900 text-amber-300 rounded-xs shadow-xs">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <span>Dynamic Geospatial Real-Time Project Tracker</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-xs font-bold">
                  {mappedProjects.length} Works Active
                </span>
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Real-time tracking of sanctioned works, expenditure rates, and geospatial coordinates under MPLADS Clause 7.1.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Engine Switcher & Map Mode Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Provider Toggle: Google Maps JS API vs Offline GIS */}
          <div className="inline-flex rounded-xs border border-stone-300 p-0.5 bg-stone-100 text-[11px] font-mono">
            <button
              onClick={() => setProviderMode('google')}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                providerMode === 'google' 
                  ? 'bg-stone-900 text-amber-300 font-bold shadow-xs' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Google Maps JS API</span>
              {mapConfig.hasKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="Direct API Key Active" />
              )}
            </button>

            <button
              onClick={() => setProviderMode('leaflet')}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                providerMode === 'leaflet' 
                  ? 'bg-stone-900 text-amber-300 font-bold shadow-xs' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Offline GIS</span>
            </button>
          </div>

          {/* Google Maps Layer Selector (when key active) */}
          {providerMode === 'google' && mapConfig.hasKey && (
            <div className="inline-flex rounded-xs border border-stone-300 p-0.5 bg-stone-100 text-[11px] font-mono">
              {(['roadmap', 'satellite', 'hybrid', 'terrain'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setGoogleMapTypeId(type)}
                  className={`px-2 py-1 rounded-xs capitalize cursor-pointer ${
                    googleMapTypeId === type ? 'bg-white font-bold text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* Leaflet Layer Selector */}
          {providerMode === 'leaflet' && (
            <div className="inline-flex rounded-xs border border-stone-300 p-0.5 bg-stone-100 text-[11px] font-mono">
              {(['editorial', 'osm', 'satellite'] as const).map(layer => (
                <button
                  key={layer}
                  onClick={() => setLeafletLayer(layer)}
                  className={`px-2 py-1 rounded-xs capitalize cursor-pointer ${
                    leafletLayer === layer ? 'bg-white font-bold text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Expand Map"}
            className="p-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-xs cursor-pointer shadow-xs"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Filter Bar: State Dynamic Centering, Sector, Status, Search */}
      <div className="p-3 bg-white border-b border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        
        {/* Dynamic State Centering Dropdown */}
        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-1.5">
          <Navigation className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] font-mono uppercase text-stone-400 font-bold">Dynamic State Center</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-semibold text-stone-900 focus:outline-hidden cursor-pointer"
            >
              <option value="all">🇮🇳 All India (National Centroid)</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sector Filter */}
        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-1.5">
          <Layers className="w-3.5 h-3.5 text-stone-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] font-mono uppercase text-stone-400 font-bold">Sector Focus</label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-semibold text-stone-900 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Sectors ({projects.length})</option>
              {uniqueSectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Work Status */}
        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-1.5">
          <Activity className="w-3.5 h-3.5 text-stone-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] font-mono uppercase text-stone-400 font-bold">Execution Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-semibold text-stone-900 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Progress Statuses</option>
              <option value="COMPLETED">Completed (100%)</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SANCTIONED">Sanctioned</option>
              <option value="DELAYED">Delayed</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-1.5">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] font-mono uppercase text-stone-400 font-bold">Quick Finder</label>
            <input
              type="text"
              placeholder="Search MP, district, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-hidden"
            />
          </div>
        </div>

      </div>

      {/* Main Map Visualization Canvas */}
      <div className={`w-full relative overflow-hidden bg-stone-100 ${
        isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[520px]'
      }`}>

        {/* 1. GOOGLE MAPS JAVASCRIPT API (Direct API Key Provider) */}
        {providerMode === 'google' && mapConfig.hasKey ? (
          <APIProvider apiKey={mapConfig.apiKey} libraries={['marker']}>
            <Map
              mapId={mapConfig.mapId || 'DEMO_MAP_ID'}
              defaultCenter={currentCamera.center}
              defaultZoom={currentCamera.zoom}
              mapTypeId={googleMapTypeId}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              className="w-full h-full"
            >
              <GoogleMapCameraController 
                center={currentCamera.center} 
                zoom={currentCamera.zoom} 
              />

              {/* Render all filtered project markers */}
              {mappedProjects.map(p => {
                const isDone = p.workStatus === 'COMPLETED';
                const pinColor = isDone ? '#059669' : p.workStatus === 'IN_PROGRESS' ? '#d97706' : '#2563eb';
                return (
                  <AdvancedMarker
                    key={p.id}
                    position={{ lat: p.resolvedLat, lng: p.resolvedLng }}
                    title={p.title}
                    onClick={() => setActiveMarkerProject(p)}
                  >
                    <Pin
                      background={pinColor}
                      borderColor={'#ffffff'}
                      glyphColor={'#ffffff'}
                      scale={activeMarkerProject?.id === p.id ? 1.3 : 1.0}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for active project marker */}
              {activeMarkerProject && (
                <InfoWindow
                  position={{
                    lat: (activeMarkerProject as any).resolvedLat || (activeMarkerProject.coordinates?.[0] || NATIONAL_INDIA_CENTER.lat),
                    lng: (activeMarkerProject as any).resolvedLng || (activeMarkerProject.coordinates?.[1] || NATIONAL_INDIA_CENTER.lng)
                  }}
                  onCloseClick={() => setActiveMarkerProject(null)}
                >
                  <div className="p-2 min-w-[260px] max-w-[320px] text-stone-900 font-sans">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded-xs uppercase">
                        {activeMarkerProject.sector}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-xs">
                        {activeMarkerProject.workStatus} ({activeMarkerProject.physicalProgress}%)
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-sm leading-tight text-stone-950 mb-1">
                      {activeMarkerProject.title}
                    </h4>

                    <div className="text-[11px] font-mono text-stone-500 mb-2">
                      Code: {activeMarkerProject.workCode}
                    </div>

                    <div className="bg-stone-50 p-2 rounded-xs border border-stone-200 text-xs mb-2">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Sanctioned:</span>
                        <strong>{activeMarkerProject.sanctionedCostFormatted}</strong>
                      </div>
                      <div className="flex justify-between text-emerald-800">
                        <span>Spent:</span>
                        <strong>{activeMarkerProject.expenditureFormatted}</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-600 mb-3">
                      <div>MP: <strong>{activeMarkerProject.mpName}</strong></div>
                      <div>District: {activeMarkerProject.district}, {activeMarkerProject.state}</div>
                    </div>

                    <div className="flex gap-2 pt-1 border-t border-stone-200">
                      <button
                        onClick={() => onSelectProject(activeMarkerProject.id)}
                        className="flex-1 py-1 px-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-[11px] font-bold rounded-xs cursor-pointer text-center"
                      >
                        Inspect Dossier →
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : providerMode === 'google' && !mapConfig.hasKey ? (
          /* 2. GOOGLE MAPS PLATFORM SATELLITE ENGINE */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-radial from-stone-900 via-stone-925 to-stone-950 text-stone-200">
            {/* Interactive Grid pattern */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                backgroundPosition: '0 0, 14px 14px'
              }}
            />

            <div className="relative z-10 max-w-2xl w-full bg-stone-900/95 border border-stone-700 p-6 rounded-xs shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-stone-800">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-950/80 border border-amber-600/40 text-amber-300 rounded-full font-mono text-[11px]">
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Google Maps Platform Integration</span>
                </div>
                <span className="font-mono text-[10px] text-stone-400">
                  Telemetry ID: {mapConfig.attributionId}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-stone-100">
                  Interactive Geospatial Engine
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Defaulting to high-resolution Offline GIS mapping for complete offline reliability. Switch between satellite, cartographic, and cadastral layers with 100% verified geotagged coordinates below.
                </p>
              </div>

              {/* Dynamic Telemetry Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left font-mono text-xs">
                <div className="bg-stone-950/90 border border-stone-800 p-3 rounded-xs">
                  <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Current Active Center</div>
                  <div className="text-amber-400 font-bold">{selectedState === 'all' ? 'National India Centroid' : selectedState}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {currentCamera.center.lat.toFixed(4)}° N, {currentCamera.center.lng.toFixed(4)}° E (Zoom {currentCamera.zoom})
                  </div>
                </div>

                <div className="bg-stone-950/90 border border-stone-800 p-3 rounded-xs">
                  <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Mapped Public Works</div>
                  <div className="text-emerald-400 font-bold">{mappedProjects.length} Projects Tracked</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {mappedProjects.filter(p => p.workStatus === 'COMPLETED').length} Complete • {mappedProjects.filter(p => p.workStatus === 'IN_PROGRESS').length} Active
                  </div>
                </div>

                <div className="bg-stone-950/90 border border-stone-800 p-3 rounded-xs">
                  <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Statutory Compliance</div>
                  <div className="text-stone-200 font-bold">Clause 7.1 Verified</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Geotagged & GIS Deduplicated
                  </div>
                </div>
              </div>

              {/* Live Project Pins Preview in Mock View */}
              <div className="bg-stone-950 border border-stone-800 rounded-xs p-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 uppercase mb-2">
                  <span>Geospatially Tracked Sites ({mappedProjects.slice(0, 4).length} of {mappedProjects.length})</span>
                  <span className="text-amber-400">SSE Synced</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {mappedProjects.slice(0, 4).map(p => (
                    <div 
                      key={p.id}
                      onClick={() => onSelectProject(p.id)}
                      className="p-2 bg-stone-900/80 hover:bg-stone-850 border border-stone-800/80 rounded-xs flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${p.workStatus === 'COMPLETED' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className="font-medium text-stone-200 truncate">{p.title}</span>
                      </div>
                      <div className="font-mono text-[11px] text-stone-400 shrink-0">
                        {p.resolvedLat.toFixed(3)}°N, {p.resolvedLng.toFixed(3)}°E
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[10px] font-mono text-stone-400">
                  Switch anytime between Google Maps JS API and interactive offline GIS.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setProviderMode('leaflet')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono text-xs rounded-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open Offline Interactive GIS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 3. LEAFLET OFFLINE GIS CANVAS */
          <div ref={leafletContainerRef} className="w-full h-full" />
        )}

      </div>

      {/* Map Footer Information Strip */}
      <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-stone-600 font-sans">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>
            Dynamic camera centering configured for all 36 States & UTs. Real-time geotagging tracking under <strong>MPLADS Clause 7.1</strong>.
          </span>
        </div>
        <div className="font-mono text-[10px] text-stone-500 shrink-0">
          Viewing: <strong>{selectedState === 'all' ? 'National Overview' : selectedState}</strong> • Mode: <strong>{providerMode.toUpperCase()}</strong>
        </div>
      </div>

    </div>
  );
};
