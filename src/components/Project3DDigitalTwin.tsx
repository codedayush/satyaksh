import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Layers, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  Info, 
  Sliders, 
  ShieldCheck, 
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';
import { Project, DigitalTwinLayer } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface Project3DDigitalTwinProps {
  project: Project;
  onReportIssue?: (defectCategory: string) => void;
}

export const Project3DDigitalTwin: React.FC<Project3DDigitalTwinProps> = ({
  project,
  onReportIssue
}) => {
  const { language, currentLanguageMeta, t, term, speak, isSpeaking } = useI18n();

  // Canvas & Render state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationAngle, setRotationAngle] = useState(45); // in degrees
  const [elevationAngle, setElevationAngle] = useState(30); // in degrees
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isAutoOrbit, setIsAutoOrbit] = useState(true);
  const [isXRayMode, setIsXRayMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'3d' | 'layers' | 'inspections'>('3d');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Simulated milestone progress slider for structural lifecycle inspection
  const [simulatedProgress, setSimulatedProgress] = useState(project.physicalProgress || 75);

  // Active structural layers
  const [layers, setLayers] = useState<DigitalTwinLayer[]>([
    {
      id: 'layer-foundation',
      name: 'Substructure & Deep RCC Raft Foundation',
      category: 'FOUNDATION',
      progress: 100,
      status: 'COMPLETED',
      costLakhs: 4.8,
      specs: 'M25 Grade Concrete, 16mm Fe500D TMT Reinforcement Rebars',
      inspected: true,
    },
    {
      id: 'layer-superstructure',
      name: 'RCC Column Frame, Beams & Roof Slab',
      category: 'SUPERSTRUCTURE',
      progress: 85,
      status: 'IN_PROGRESS',
      costLakhs: 8.2,
      specs: 'Columns 300x300mm with lateral ties @ 150mm c/c',
      inspected: true,
    },
    {
      id: 'layer-masonry',
      name: 'Fly Ash Brick Masonry & 12mm Cement Plaster',
      category: 'FINISHES',
      progress: 60,
      status: 'IN_PROGRESS',
      costLakhs: 3.5,
      specs: '1:4 Cement Sand Mortar with damp-proof course (DPC)',
      inspected: true,
      defectFlag: project.physicalProgress < 50,
    },
    {
      id: 'layer-utilities',
      name: 'Rooftop Solar PV Array, Wiring & Plumbing Line',
      category: 'UTILITIES_SOLAR',
      progress: 40,
      status: 'PENDING',
      costLakhs: 2.0,
      specs: '3kW Monocrystalline Solar Grid & CPVC Class 1 Piping',
      inspected: false,
    },
    {
      id: 'layer-safety',
      name: 'Fire Exit Ramp, Lightning Arrester & Quality Sensor',
      category: 'SAFETY_AUDIT',
      progress: 30,
      status: 'PENDING',
      costLakhs: 1.2,
      specs: 'Copper ESE Lightning Protection & Disabled Wheelchair Ramp',
      inspected: false,
    }
  ]);

  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    'layer-foundation': true,
    'layer-superstructure': true,
    'layer-masonry': true,
    'layer-utilities': true,
    'layer-safety': true,
  });

  // Auto orbit tick
  useEffect(() => {
    if (!isAutoOrbit) return;
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 0.5) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoOrbit]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background (Clean architectural blueprint grid canvas)
    ctx.fillStyle = isXRayMode ? '#0f172a' : '#faf9f5';
    ctx.fillRect(0, 0, width, height);

    // Draw isometric grid lines
    ctx.strokeStyle = isXRayMode ? 'rgba(56, 189, 248, 0.1)' : 'rgba(214, 211, 209, 0.6)';
    ctx.lineWidth = 1;

    const gridSize = 24 * zoomLevel;
    const centerX = width / 2;
    const centerY = height / 2 + 30;

    for (let x = -width; x < width * 2; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height * 0.5, height);
      ctx.stroke();
    }

    // 3D Projection math
    const radY = (rotationAngle * Math.PI) / 180;
    const radX = (elevationAngle * Math.PI) / 180;

    const project3D = (x: number, y: number, z: number) => {
      // Rotation around Y
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const rotX = x * cosY - z * sinY;
      const rotZ = x * sinY + z * cosY;

      // Rotation around X (elevation pitch)
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const rotY = y * cosX - rotZ * sinX;

      // Isometric scale
      const scale = 1.4 * zoomLevel;
      const screenX = centerX + rotX * scale;
      const screenY = centerY - rotY * scale;
      return { x: screenX, y: screenY, depth: rotZ };
    };

    // Helper: Draw 3D Box
    const drawBox = (
      x: number, y: number, z: number,
      w: number, h: number, d: number,
      colors: { top: string; front: string; side: string },
      isWireframe = false
    ) => {
      const p1 = project3D(x - w / 2, y, z - d / 2);
      const p2 = project3D(x + w / 2, y, z - d / 2);
      const p3 = project3D(x + w / 2, y, z + d / 2);
      const p4 = project3D(x - w / 2, y, z + d / 2);

      const p5 = project3D(x - w / 2, y + h, z - d / 2);
      const p6 = project3D(x + w / 2, y + h, z - d / 2);
      const p7 = project3D(x + w / 2, y + h, z + d / 2);
      const p8 = project3D(x - w / 2, y + h, z + d / 2);

      if (isWireframe || isXRayMode) {
        ctx.strokeStyle = isXRayMode ? '#38bdf8' : '#78716c';
        ctx.lineWidth = 1.5;
        const edges = [
          [p1, p2], [p2, p3], [p3, p4], [p4, p1],
          [p5, p6], [p6, p7], [p7, p8], [p8, p5],
          [p1, p5], [p2, p6], [p3, p7], [p4, p8]
        ];
        edges.forEach(([start, end]) => {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        });
        return;
      }

      // Top Face
      ctx.fillStyle = colors.top;
      ctx.beginPath();
      ctx.moveTo(p5.x, p5.y);
      ctx.lineTo(p6.x, p6.y);
      ctx.lineTo(p7.x, p7.y);
      ctx.lineTo(p8.x, p8.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.stroke();

      // Front Face
      ctx.fillStyle = colors.front;
      ctx.beginPath();
      ctx.moveTo(p4.x, p4.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p7.x, p7.y);
      ctx.lineTo(p8.x, p8.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Side Face
      ctx.fillStyle = colors.side;
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p6.x, p6.y);
      ctx.lineTo(p7.x, p7.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // 1. Layer: Foundation Base Raft
    if (visibleLayers['layer-foundation']) {
      drawBox(
        0, -30, 0,
        180, 20, 140,
        { top: '#e2e8f0', front: '#cbd5e1', side: '#94a3b8' }
      );

      // Footing piers
      const footings = [
        [-65, -10, -50], [65, -10, -50],
        [-65, -10, 50], [65, -10, 50],
        [0, -10, -50], [0, -10, 50]
      ];
      footings.forEach(([fx, fy, fz]) => {
        drawBox(fx, fy, fz, 26, 20, 26, { top: '#cbd5e1', front: '#94a3b8', side: '#64748b' });
      });
    }

    // 2. Layer: Columns & RCC Superstructure
    if (visibleLayers['layer-superstructure'] && simulatedProgress >= 25) {
      const columnHeight = Math.min(100, (simulatedProgress / 50) * 100);
      const columns = [
        [-65, 10, -50], [65, 10, -50],
        [-65, 10, 50], [65, 10, 50],
        [0, 10, -50], [0, 10, 50]
      ];
      columns.forEach(([cx, cy, cz]) => {
        drawBox(
          cx, cy, cz,
          16, columnHeight, 16,
          { top: '#d6d3d1', front: '#a8a29e', side: '#78716c' }
        );
      });

      // Roof Beams & Slab if progress >= 50%
      if (simulatedProgress >= 50) {
        drawBox(
          0, 110, 0,
          190, 12, 150,
          { top: '#f1f5f9', front: '#cbd5e1', side: '#94a3b8' }
        );
      }
    }

    // 3. Layer: Masonry Walls & Finishes
    if (visibleLayers['layer-masonry'] && simulatedProgress >= 45) {
      const wallHeight = Math.min(90, ((simulatedProgress - 40) / 40) * 90);
      
      // Left Wall
      drawBox(
        -65, 10, 0,
        12, wallHeight, 85,
        { top: '#fed7aa', front: '#fdba74', side: '#fb923c' }
      );

      // Back Wall
      drawBox(
        0, 10, -50,
        115, wallHeight, 12,
        { top: '#fed7aa', front: '#fdba74', side: '#fb923c' }
      );

      // Front Partial Wall with Doorway
      drawBox(
        -35, 10, 50,
        45, wallHeight, 10,
        { top: '#fed7aa', front: '#fdba74', side: '#fb923c' }
      );
      drawBox(
        40, 10, 50,
        35, wallHeight, 10,
        { top: '#fed7aa', front: '#fdba74', side: '#fb923c' }
      );
    }

    // 4. Layer: Utilities & Solar Array
    if (visibleLayers['layer-utilities'] && simulatedProgress >= 70) {
      // Solar Panels on roof
      drawBox(
        -30, 124, 0,
        50, 4, 70,
        { top: '#1e3a8a', front: '#172554', side: '#1e40af' }
      );
      drawBox(
        30, 124, 0,
        50, 4, 70,
        { top: '#1e3a8a', front: '#172554', side: '#1e40af' }
      );
    }

    // 5. Inspection Hotspot Pins
    if (visibleLayers['layer-safety']) {
      const hotspots = [
        { id: 'pin-1', x: 0, y: 130, z: 0, label: 'Solar Inverter Inspection Point' },
        { id: 'pin-2', x: -65, y: 60, z: 0, label: 'Plaster Quality & Moisture Check' },
        { id: 'pin-3', x: 65, y: -20, z: 50, label: 'Concrete Foundation Rebar Core Test' }
      ];

      hotspots.forEach((pin) => {
        const p = project3D(pin.x, pin.y, pin.z);
        
        // Pin ring
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pulsing glow
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

  }, [rotationAngle, elevationAngle, zoomLevel, isXRayMode, simulatedProgress, visibleLayers]);

  // Voice narration helper for digital twin
  const handleNarrateModel = () => {
    const speech = `${project.title} का 3डी डिजिटल मॉडल। वर्तमान भौतिक प्रगति ${simulatedProgress}% है। नींव एवं आरसीसी कॉलम का कार्य प्रमाणित है।`;
    speak(speech);
  };

  return (
    <div className="bg-white border border-stone-300 rounded-xs shadow-xs overflow-hidden mb-6">
      
      {/* Header bar */}
      <div className="p-4 bg-[#faf9f5] border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-stone-900 text-amber-300 rounded-xs">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-stone-950">
                {t('project.digitalTwin', '3D Structural Digital Twin & CAD Inspection')}
              </h3>
              <span className="px-1.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-bold rounded-xs">
                3D SPATIAL MODEL
              </span>
            </div>
            <p className="text-xs text-stone-600 font-sans">
              Interactive structural layers, foundation cross-section, and certified milestone visualization.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNarrateModel}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-stone-300 hover:border-amber-600 text-stone-800 text-xs font-medium rounded-xs transition-colors cursor-pointer shadow-xs"
            title="Listen to 3D model explanation"
          >
            <Volume2 className={`w-3.5 h-3.5 text-amber-700 ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span>{t('simple.listen', 'Audio Guide')}</span>
          </button>

          <button
            onClick={() => setIsXRayMode(!isXRayMode)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xs border transition-colors cursor-pointer ${
              isXRayMode 
                ? 'bg-sky-900 text-sky-200 border-sky-700' 
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>{isXRayMode ? 'X-Ray Active' : 'X-Ray Wireframe'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Viewport + Inspector Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-b border-stone-200">
        
        {/* Left 2 Cols: 3D Interactive Canvas */}
        <div className="lg:col-span-2 relative bg-[#faf9f5] border-r border-stone-200 min-h-[380px] flex items-center justify-center overflow-hidden">
          
          <canvas
            ref={canvasRef}
            className="w-full h-[380px] cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startY = e.clientY;
              const startAngle = rotationAngle;
              const startElev = elevationAngle;
              setIsAutoOrbit(false);

              const onMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaY = moveEvent.clientY - startY;
                setRotationAngle((startAngle + deltaX * 0.8) % 360);
                setElevationAngle(Math.max(10, Math.min(80, startElev - deltaY * 0.4)));
              };

              const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
              };

              window.addEventListener('mousemove', onMouseMove);
              window.addEventListener('mouseup', onMouseUp);
            }}
          />

          {/* Floating Canvas Camera Controls Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs border border-stone-300 rounded-xs p-1.5 flex items-center gap-1 shadow-xs text-xs font-mono">
            <button
              onClick={() => setIsAutoOrbit(!isAutoOrbit)}
              className={`px-2 py-1 rounded-xs transition-colors ${
                isAutoOrbit ? 'bg-amber-600 text-white font-bold' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
              title="Toggle Auto Rotation"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoOrbit ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setZoomLevel(prev => Math.min(1.8, prev + 0.15))}
              className="p-1 hover:bg-stone-200 rounded-xs text-stone-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.15))}
              className="p-1 hover:bg-stone-200 rounded-xs text-stone-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="px-1.5 text-stone-500 text-[10px]">
              Yaw: {Math.round(rotationAngle)}°
            </span>
          </div>

          {/* Top Right Blueprint Stamp */}
          <div className="absolute top-3 right-3 bg-stone-900/90 text-white px-2.5 py-1.5 rounded-xs font-mono text-[10px] shadow-xs">
            <div className="text-amber-400 font-bold">CAD BIM LEVEL 2</div>
            <div className="text-stone-300">{project.workCode}</div>
          </div>

        </div>

        {/* Right Col: Structural Layer Explorer & Inspection Panel */}
        <div className="p-4 bg-white flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200">
              <span className="font-mono text-xs font-bold text-stone-900 uppercase">
                Structural Component Layers
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                {Object.values(visibleLayers).filter(Boolean).length}/5 Visible
              </span>
            </div>

            {/* Layers Checklist */}
            <div className="space-y-2 text-xs">
              {layers.map((layer) => {
                const isVisible = visibleLayers[layer.id];
                return (
                  <div 
                    key={layer.id}
                    className={`p-2.5 rounded-xs border transition-all ${
                      isVisible 
                        ? 'bg-[#faf9f5] border-stone-300' 
                        : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => setVisibleLayers(prev => ({ ...prev, [layer.id]: !prev[layer.id] }))}
                          className="accent-amber-600 rounded-xs"
                        />
                        <span className="font-semibold text-stone-900 leading-tight">
                          {layer.name}
                        </span>
                      </label>

                      <span className="font-mono text-[10px] bg-stone-200 text-stone-800 px-1.5 py-0.5 rounded-xs whitespace-nowrap">
                        ₹{layer.costLakhs}L
                      </span>
                    </div>

                    <div className="mt-1 pl-5 text-[11px] text-stone-500 font-mono flex items-center justify-between">
                      <span>{layer.specs}</span>
                      <span className={layer.inspected ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                        {layer.inspected ? '✓ QA Inspected' : 'Pending Lab'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Physical Progress Milestone Simulator Slider */}
          <div className="mt-4 pt-3 border-t border-stone-200">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-stone-700 font-bold flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-700" />
                <span>{term('physicalProgress')} Milestone</span>
              </span>
              <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-xs">
                {simulatedProgress}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={simulatedProgress}
              onChange={(e) => setSimulatedProgress(Number(e.target.value))}
              className="w-full accent-amber-600 bg-stone-200 rounded-lg cursor-pointer h-2"
            />

            <div className="flex justify-between text-[9px] font-mono text-stone-500 mt-1">
              <span>0% Site Prep</span>
              <span>30% Raft</span>
              <span>65% Superstructure</span>
              <span>100% Handover</span>
            </div>
          </div>

        </div>

      </div>

      {/* Footer Info & Report Ground Reality Shortcut */}
      <div className="p-3 bg-[#faf9f5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-600">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            3D CAD geometry correlates MoSPI expenditure ledger with georeferenced field inspections.
          </span>
        </div>

        {onReportIssue && (
          <button
            onClick={() => onReportIssue('STRUCTURAL_DEFECT')}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-medium rounded-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('project.reportIssue', 'Report Structural Discrepancy')}</span>
          </button>
        )}
      </div>

    </div>
  );
};
