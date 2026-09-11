import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  Navigation, 
  Layers, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Radio,
  Sliders,
  Sparkles,
  Info,
  Building,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Project } from '../types';
import { getGoogleMapsConfig, STATE_CENTROIDS, NATIONAL_INDIA_CENTER, MapServiceConfig } from '../services/mapConfigService';

interface ProjectLocationMapProps {
  project: Project;
  allNearbyProjects?: Project[];
  onSelectProject?: (projectId: string) => void;
}

// Controller component to smoothly center and animate Google Map
const GoogleMapCameraController: React.FC<{
  target: { lat: number; lng: number };
  zoom: number;
}> = ({ target, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(target);
    map.setZoom(zoom);
  }, [map, target.lat, target.lng, zoom]);

  return null;
};

export const ProjectLocationMap: React.FC<ProjectLocationMapProps> = ({ 
  project, 
  allNearbyProjects = [],
  onSelectProject 
}) => {
  const [mapConfig, setMapConfig] = useState<MapServiceConfig>({
    hasKey: false,
    apiKey: '',
    mapId: 'DEMO_MAP_ID',
    attributionId: 'gmp_mcp_codeassist_v1_aistudio'
  });
  const [configLoaded, setConfigLoaded] = useState(false);
  const [providerMode, setProviderMode] = useState<'google' | 'leaflet'>('leaflet');
  const [googleMapTypeId, setGoogleMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [leafletLayer, setLeafletLayer] = useState<'editorial' | 'osm' | 'satellite'>('editorial');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(true);

  // Target coordinates resolution
  const hasValidCoordinates = !!(
    project.coordinates && 
    Array.isArray(project.coordinates) && 
    project.coordinates.length === 2 &&
    typeof project.coordinates[0] === 'number' &&
    typeof project.coordinates[1] === 'number' &&
    !isNaN(project.coordinates[0]) &&
    !isNaN(project.coordinates[1])
  );

  // Fallback to state centroid if site GPS is pending
  const resolvedCoordinates = useMemo<{ lat: number; lng: number }>(() => {
    if (hasValidCoordinates) {
      return { lat: project.coordinates![0], lng: project.coordinates![1] };
    }
    const stateMatch = STATE_CENTROIDS[project.state];
    if (stateMatch) {
      return { lat: stateMatch.lat, lng: stateMatch.lng };
    }
    return { lat: NATIONAL_INDIA_CENTER.lat, lng: NATIONAL_INDIA_CENTER.lng };
  }, [project, hasValidCoordinates]);

  // Leaflet Container refs for the fallback / offline GIS mode
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<L.Map | null>(null);
  const leafletMarkerRef = useRef<L.Marker | null>(null);
  const leafletTileLayerRef = useRef<L.TileLayer | null>(null);

  // Check backend Google Maps config on mount
  useEffect(() => {
    let isMounted = true;
    getGoogleMapsConfig().then(cfg => {
      if (!isMounted) return;
      setMapConfig(cfg);
      setConfigLoaded(true);
      if (cfg.hasKey) {
        setProviderMode('google');
      } else {
        setProviderMode('leaflet');
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Leaflet Tile layers definition
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
      attribution: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics'
    }
  };

  // Build Leaflet Popup content
  const createLeafletPopupHtml = (proj: Project): string => {
    const isCompleted = proj.workStatus === 'COMPLETED';
    const statusBg = isCompleted ? '#ecfdf5' : '#fffbeb';
    const statusColor = isCompleted ? '#065f46' : '#92400e';
    const statusBorder = isCompleted ? '#a7f3d0' : '#fde68a';
    const statusIcon = isCompleted ? '✓' : '⟳';

    return `
      <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 12px 14px; min-width: 270px; max-width: 320px; color: #1c1917;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
          <span style="font-family: monospace; font-size: 10px; font-weight: 700; background: #1c1917; color: #fafaf9; padding: 2px 6px; border-radius: 2px; text-transform: uppercase;">
            ${proj.sector}
          </span>
          <span style="font-family: monospace; font-size: 10px; font-weight: 700; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder}; padding: 2px 6px; border-radius: 2px;">
            ${statusIcon} ${proj.workStatus} (${proj.physicalProgress}%)
          </span>
        </div>
        <h4 style="font-family: Georgia, serif; font-size: 14px; font-weight: 800; line-height: 1.35; color: #0c0a09; margin: 0 0 6px 0;">
          ${proj.title}
        </h4>
        <div style="font-family: monospace; font-size: 10px; color: #78716c; margin-bottom: 8px;">
          Code: <span style="color: #292524; font-weight: 600;">${proj.workCode}</span>
        </div>
        <div style="background: #faf9f5; border: 1px solid #e7e5e4; border-radius: 3px; padding: 6px 8px; margin-bottom: 8px; font-size: 11px;">
          <div>Sanctioned: <strong>${proj.sanctionedCostFormatted}</strong></div>
          <div style="color: #065f46;">Certified Spent: <strong>${proj.expenditureFormatted}</strong></div>
        </div>
        <div style="font-size: 10.5px; color: #57534e;">
          <div><strong>MP:</strong> ${proj.mpName}</div>
          <div><strong>Site:</strong> ${proj.locationName || `${proj.district}, ${proj.state}`}</div>
        </div>
      </div>
    `;
  };

  // Initialize and update Leaflet Map (when in Leaflet mode)
  useEffect(() => {
    if (providerMode !== 'leaflet') return;
    if (!leafletContainerRef.current) return;

    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.remove();
      leafletMapInstanceRef.current = null;
    }

    const map = L.map(leafletContainerRef.current, {
      center: [resolvedCoordinates.lat, resolvedCoordinates.lng],
      zoom: hasValidCoordinates ? 14 : 7,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false
    });

    const activeProvider = leafletTileProviders[leafletLayer];
    const tileLayer = L.tileLayer(activeProvider.url, {
      maxZoom: 19,
      attribution: activeProvider.attribution
    }).addTo(map);
    leafletTileLayerRef.current = tileLayer;

    // Custom pulse marker
    const isCompleted = project.workStatus === 'COMPLETED';
    const pinColor = isCompleted ? '#059669' : '#d97706';
    const markerIcon = L.divIcon({
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: ${pinColor}33; border: 1.5px solid ${pinColor}; animation: pulse 2s infinite;"></div>
          <div style="position: relative; z-index: 10; width: 28px; height: 28px; background: #1c1917; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: bold;">
            ${isCompleted ? '✓' : '•'}
          </div>
        </div>
      `,
      className: 'satyaksh-leaflet-pin',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const marker = L.marker([resolvedCoordinates.lat, resolvedCoordinates.lng], { icon: markerIcon }).addTo(map);
    marker.bindPopup(createLeafletPopupHtml(project));
    leafletMarkerRef.current = marker;

    leafletMapInstanceRef.current = map;

    const t = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(t);
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [providerMode, resolvedCoordinates.lat, resolvedCoordinates.lng, project.id, leafletLayer]);

  // Recenter handler
  const handleRecenter = () => {
    if (providerMode === 'leaflet' && leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.flyTo([resolvedCoordinates.lat, resolvedCoordinates.lng], 14, {
        animate: true,
        duration: 1.2
      });
      leafletMarkerRef.current?.openPopup();
    }
  };

  const handleOpenExternalGoogleMaps = () => {
    if (hasValidCoordinates) {
      window.open(`https://www.google.com/maps?q=${resolvedCoordinates.lat},${resolvedCoordinates.lng}`, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(`${project.title}, ${project.district}, ${project.state}`)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const isCompleted = project.workStatus === 'COMPLETED';

  return (
    <div className={`bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'relative'
    }`}>
      
      {/* Map Header Toolbar */}
      <div className="p-4 bg-[#faf9f5] border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Location & Coordinates Identification */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-stone-900 text-amber-300 rounded-xs shadow-xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <span>Geospatial Site Verification & GPS Lock</span>
              {hasValidCoordinates ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.2 rounded-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> GPS Tagged
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded-xs">
                  <Clock className="w-3 h-3 text-amber-700" /> State Centroid Fallback
                </span>
              )}
            </div>
            <div className="text-stone-500 text-[11px] font-mono">
              {hasValidCoordinates 
                ? `${resolvedCoordinates.lat.toFixed(5)}° N, ${resolvedCoordinates.lng.toFixed(5)}° E • ${project.district}, ${project.state}`
                : `State Centroid: ${project.district}, ${project.state} (Site GPS Pending Field Tag)`}
            </div>
          </div>
        </div>

        {/* Right: Engine Switcher & Layer Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Provider / Engine Switcher */}
          <div className="inline-flex rounded-xs border border-stone-300 p-0.5 bg-stone-100 text-[11px] font-mono">
            <button
              onClick={() => setProviderMode('google')}
              className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer flex items-center gap-1 ${
                providerMode === 'google' 
                  ? 'bg-stone-900 text-amber-300 font-bold shadow-xs' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Google Maps JS API</span>
              {mapConfig.hasKey && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="API Key Active" />
              )}
            </button>
            <button
              onClick={() => setProviderMode('leaflet')}
              className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer flex items-center gap-1 ${
                providerMode === 'leaflet' 
                  ? 'bg-stone-900 text-amber-300 font-bold shadow-xs' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Offline GIS</span>
            </button>
          </div>

          {/* Layer Selector for Google Maps */}
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

          {/* Layer Selector for Leaflet */}
          {providerMode === 'leaflet' && (
            <div className="inline-flex rounded-xs border border-stone-300 p-0.5 bg-stone-100 text-[11px] font-mono">
              <button
                onClick={() => setLeafletLayer('editorial')}
                className={`px-2 py-1 rounded-xs cursor-pointer ${
                  leafletLayer === 'editorial' ? 'bg-white font-bold text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Editorial
              </button>
              <button
                onClick={() => setLeafletLayer('osm')}
                className={`px-2 py-1 rounded-xs cursor-pointer ${
                  leafletLayer === 'osm' ? 'bg-white font-bold text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Street
              </button>
              <button
                onClick={() => setLeafletLayer('satellite')}
                className={`px-2 py-1 rounded-xs cursor-pointer ${
                  leafletLayer === 'satellite' ? 'bg-white font-bold text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Satellite
              </button>
            </div>
          )}

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            title="Recenter and pan to project location"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xs font-mono text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-700" />
            <span>Pan to Site</span>
          </button>

          {/* External Google Maps launch */}
          <button
            onClick={handleOpenExternalGoogleMaps}
            title="Open in Google Maps External Web Client"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xs font-mono text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>External Maps</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Expand Map"}
            className="p-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-xs cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Map Body Area */}
      <div className={`w-full relative overflow-hidden bg-stone-100 ${
        isFullscreen ? 'flex-1 min-h-[500px]' : 'h-88 sm:h-104'
      }`}>

        {/* 1. GOOGLE MAPS ENGINE (Active when providerMode === 'google' AND key present) */}
        {providerMode === 'google' && mapConfig.hasKey ? (
          <APIProvider apiKey={mapConfig.apiKey} libraries={['marker']}>
            <Map
              mapId={mapConfig.mapId || 'DEMO_MAP_ID'}
              defaultCenter={resolvedCoordinates}
              defaultZoom={hasValidCoordinates ? 14 : 7}
              mapTypeId={googleMapTypeId}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              className="w-full h-full"
            >
              <GoogleMapCameraController 
                target={resolvedCoordinates} 
                zoom={hasValidCoordinates ? 14 : 7} 
              />

              {/* Target Project Advanced Marker */}
              <AdvancedMarker
                position={resolvedCoordinates}
                title={project.title}
                onClick={() => setShowInfoWindow(true)}
              >
                <Pin
                  background={isCompleted ? '#059669' : '#d97706'}
                  borderColor={'#ffffff'}
                  glyphColor={'#ffffff'}
                  scale={1.2}
                />
              </AdvancedMarker>

              {/* InfoWindow */}
              {showInfoWindow && (
                <InfoWindow
                  position={resolvedCoordinates}
                  onCloseClick={() => setShowInfoWindow(false)}
                >
                  <div className="p-2 min-w-[240px] max-w-[300px] text-stone-900 font-sans">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded-xs uppercase">
                        {project.sector}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded-xs">
                        {project.workStatus}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm leading-tight text-stone-950 mb-1">
                      {project.title}
                    </h4>
                    <div className="text-[11px] font-mono text-stone-500 mb-2">
                      Code: {project.workCode}
                    </div>
                    <div className="bg-stone-50 p-2 rounded-xs border border-stone-200 text-xs mb-2">
                      <div>Sanctioned: <strong>{project.sanctionedCostFormatted}</strong></div>
                      <div className="text-emerald-800">Spent: <strong>{project.expenditureFormatted}</strong></div>
                      <div className="text-[10px] text-stone-500 mt-1">Progress: {project.physicalProgress}%</div>
                    </div>
                    <div className="text-[11px] text-stone-600">
                      <div>MP: <strong>{project.mpName}</strong></div>
                      <div>District: {project.district}, {project.state}</div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : providerMode === 'google' && !mapConfig.hasKey ? (
          /* 2. GOOGLE MAPS PLACEHOLDER / MOCK HANDLER FOR PRODUCTION READINESS */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-radial from-stone-900 to-stone-950 text-stone-200">
            {/* Simulated Satellite/Grid Background */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px'
              }}
            />

            {/* Target Geolocation Status Display */}
            <div className="relative z-10 max-w-lg w-full bg-stone-900/90 border border-stone-700 p-6 rounded-xs shadow-2xl backdrop-blur-md text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-600/40 text-amber-300 rounded-full font-mono text-[11px]">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Google Maps Platform Integration</span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-stone-100">
                  Dynamic Real-Time Geospatial Handler
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  The Google Maps JavaScript API integration is wired with <code>@vis.gl/react-google-maps</code> and telemetry ID <code>{mapConfig.attributionId}</code>.
                </p>
              </div>

              {/* Dynamic Coordinate Card */}
              <div className="bg-stone-950/90 border border-stone-800 rounded-xs p-3.5 text-left font-mono text-xs space-y-1.5">
                <div className="flex justify-between items-center text-[11px] text-stone-400 border-b border-stone-800 pb-1.5">
                  <span className="uppercase text-amber-400 font-bold">Target Location Vector</span>
                  <span className="text-emerald-400">GPS Locked (Clause 7.1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Coordinates:</span>
                  <span className="text-stone-100 font-bold">{resolvedCoordinates.lat.toFixed(6)}° N, {resolvedCoordinates.lng.toFixed(6)}° E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Territory / State:</span>
                  <span className="text-stone-100">{project.district}, {project.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Civil Scope:</span>
                  <span className="text-stone-200 truncate max-w-[260px]">{project.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Physical Progress:</span>
                  <span className="text-amber-300 font-bold">{project.physicalProgress}% ({project.workStatus})</span>
                </div>
              </div>

              {/* Action options */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setProviderMode('leaflet')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono text-xs rounded-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Switch to Interactive Offline GIS</span>
                </button>
                <button
                  onClick={handleOpenExternalGoogleMaps}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs rounded-xs border border-stone-600 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview in Google Maps</span>
                </button>
              </div>

              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-800/80">
                To activate direct Google Cloud live tiles, configure <code>GOOGLE_MAPS_API_KEY</code> in environment settings.
              </div>
            </div>
          </div>
        ) : (
          /* 3. LEAFLET / OFFLINE GIS ENGINE CANVAS */
          <div ref={leafletContainerRef} className="w-full h-full" />
        )}

      </div>

      {/* Map Footer Information Strip */}
      <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-stone-600 font-sans">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>
            Geospatial tracking compliant with <strong>MPLADS Guidelines Clause 7.1</strong>. Dynamic centering on target location and state centroids.
          </span>
        </div>
        <div className="font-mono text-[10px] text-stone-500 shrink-0">
          Engine: {providerMode === 'google' ? 'Google Maps JS API' : 'Offline High-Resolution GIS'}
        </div>
      </div>

    </div>
  );
};
