import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Compass, Droplets, AlertTriangle, Radio, Users } from 'lucide-react';
import { Equipment, Region, Pipeline, Alarm, UserProfile } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  equipmentList: Equipment[];
  regions: Region[];
  pipelines: Pipeline[];
  activeAlarms: Alarm[];
  selectedEquipment: Equipment | null;
  onSelectEquipment: (equipment: Equipment) => void;
  hoveredEquipment: Equipment | null;
  onHoverEquipment: (equipment: Equipment | null) => void;
  theme?: 'dark' | 'light';
  userProfile?: UserProfile;
  onUpdateEquipmentCoordinates?: (id: string, x: number, y: number) => void;
  onUpdateRegionVertex?: (regionId: string, vertexIndex: number, x: number, y: number) => void;
  onAddRegionVertex?: (regionId: string, vertexIndex: number, x: number, y: number) => void;
  onDeleteRegionVertex?: (regionId: string, vertexIndex: number) => void;
  onUpdateRegionInfo?: (regionId: string, updates: Partial<Region>) => void;
  onDeleteRegion?: (regionId: string) => void;
  onAddNewRegion?: () => void;
}

export default function InteractiveMap({
  equipmentList,
  regions,
  pipelines,
  activeAlarms,
  selectedEquipment,
  onSelectEquipment,
  hoveredEquipment,
  onHoverEquipment,
  theme = 'dark',
  userProfile = 'operator',
  onUpdateEquipmentCoordinates,
  onUpdateRegionVertex,
  onAddRegionVertex,
  onDeleteRegionVertex,
  onUpdateRegionInfo,
  onDeleteRegion,
  onAddNewRegion,
}: InteractiveMapProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [showPipelines, setShowPipelines] = useState<boolean>(true);
  const [showRegions, setShowRegions] = useState<boolean>(true);
  const [mapMode, setMapMode] = useState<'scada' | 'ruas' | 'satelite' | 'topografia'>('ruas');

  const leafletContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const scadaContainerRef = useRef<HTMLDivElement | null>(null);

  // Convert SCADA coordinates [0..100] to real Manacapuru Lat/Lng coordinates
  const mapToLatLng = (x: number, y: number): [number, number] => {
    // Center: Lat -3.3000, Lng -60.6200
    // x: 0..100 -> Lng -60.6400 .. -60.6000
    // y: 0..100 -> Lat -3.2800 .. -3.3200
    const lat = -3.2800 - (y / 100) * 0.0400;
    const lng = -60.6400 + (x / 100) * 0.0400;
    return [lat, lng];
  };

  const getPipelineLatLngs = (pipe: Pipeline, fromEq: Equipment, toEq: Equipment): [number, number][] => {
    if (pipe.points) {
      const pts = pipe.points.split(' ');
      if (pts.length >= 2) {
        pts[0] = `${fromEq.x},${fromEq.y}`;
        pts[pts.length - 1] = `${toEq.x},${toEq.y}`;
        return pts.map(pair => {
          const [px, py] = pair.split(',').map(Number);
          return mapToLatLng(px, py);
        });
      }
    }
    return [mapToLatLng(fromEq.x, fromEq.y), mapToLatLng(toEq.x, toEq.y)];
  };

  // Pan and Zoom States
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggingEquipmentId, setDraggingEquipmentId] = useState<string | null>(null);
  const [draggingVertex, setDraggingVertex] = useState<{ regionId: string; index: number } | null>(null);
  
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isLight = theme === 'light';

  // Interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    dragStartCoords.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingVertex && scadaContainerRef.current) {
      const { regionId, index } = draggingVertex;
      const rect = scadaContainerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      
      const svgSpaceX = (relativeX / rect.width) * 1000;
      const svgSpaceY = (relativeY / rect.height) * 600;
      
      const logicalX = (svgSpaceX - position.x) / scale;
      const logicalY = (svgSpaceY - position.y) / scale;
      
      const ptX = parseFloat((logicalX / 10).toFixed(1));
      const ptY = parseFloat((logicalY / 6).toFixed(1));
      
      onUpdateRegionVertex?.(regionId, index, ptX, ptY);
      return;
    }

    if (draggingEquipmentId && scadaContainerRef.current) {
      const rect = scadaContainerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      
      const svgSpaceX = (relativeX / rect.width) * 1000;
      const svgSpaceY = (relativeY / rect.height) * 600;
      
      const logicalX = (svgSpaceX - position.x) / scale;
      const logicalY = (svgSpaceY - position.y) / scale;
      
      const eqX = parseFloat((logicalX / 10).toFixed(2));
      const eqY = parseFloat((logicalY / 6).toFixed(2));
      
      onUpdateEquipmentCoordinates?.(draggingEquipmentId, eqX, eqY);
      return;
    }

    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingEquipmentId(null);
    setDraggingVertex(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const zoomFactor = 1.15;
    let newScale = scale;
    if (e.deltaY < 0) {
      newScale = Math.min(scale * zoomFactor, 5);
    } else {
      newScale = Math.max(scale / zoomFactor, 0.5);
    }
    setScale(newScale);
  };

  const isClickAction = (e: React.MouseEvent) => {
    const diffX = Math.abs(e.clientX - dragStartCoords.current.x);
    const diffY = Math.abs(e.clientY - dragStartCoords.current.y);
    return diffX < 6 && diffY < 6;
  };

  // Helper to determine if an equipment has an active alarm
  const getEquipmentAlarms = (id: string) => {
    return activeAlarms.filter(a => a.equipmentId === id && a.status === 'ativo');
  };

  const getStatusColor = (eq: Equipment) => {
    const alarms = getEquipmentAlarms(eq.id);
    if (alarms.some(a => a.severity === 'critico')) return 'red';
    if (alarms.some(a => a.severity === 'alto')) return 'orange';

    switch (eq.status) {
      case 'ligada': return 'green';
      case 'automatico': return 'blue';
      case 'desligada': return 'gray';
      case 'manutencao': return 'yellow';
      case 'falha': return 'red';
      case 'pressao_normal': return 'green';
      case 'pressao_baixa': return 'yellow';
      case 'pressao_critica': return 'red';
      case 'aberta': return 'green';
      case 'fechada': return 'gray';
      default: return 'gray';
    }
  };

  const getColorHex = (color: string) => {
    switch (color) {
      case 'green': return '#10b981';
      case 'blue': return '#3b82f6';
      case 'yellow': return '#f59e0b';
      case 'red': return '#ef4444';
      case 'orange': return '#f97316';
      case 'gray': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  // Render SVG Icon for Equipment Type
  const renderEquipmentIcon = (eq: Equipment) => {
    const statusColor = getStatusColor(eq);
    const colorHex = getColorHex(statusColor);
    const hasAlarm = getEquipmentAlarms(eq.id).length > 0;
    const isRunning = eq.status === 'ligada' || eq.status === 'automatico' || eq.status === 'aberta';

    // Base wrapper with alarm pulse animation
    return (
      <g className="cursor-pointer select-none">
        {/* Active alarm backdrop pulsing ring */}
        {hasAlarm && (
          <circle 
            cx="0" 
            cy="0" 
            r="16" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="1.5" 
            className="animate-ping" 
            opacity="0.65"
          />
        )}
        
        {/* Selected Highlight Ring */}
        {selectedEquipment?.id === eq.id && (
          <circle 
            cx="0" 
            cy="0" 
            r="18" 
            fill="none" 
            stroke="#60a5fa" 
            strokeWidth="2" 
            strokeDasharray="3 2"
          />
        )}

        {/* Outer casing */}
        <circle cx="0" cy="0" r="11" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

        {/* Render specific symbols */}
        {eq.type === 'bomba' || eq.type === 'booster' ? (
          // Pump symbol: detailed impeller
          <g>
            <circle cx="0" cy="0" r="9" fill={colorHex} opacity="0.15" />
            <circle cx="0" cy="0" r="7" fill="none" stroke={colorHex} strokeWidth="1.5" />
            {/* Rotating blades for running pumps */}
            <g className={isRunning ? 'animate-[spin_4s_linear_infinite]' : ''}>
              <line x1="0" y1="-6" x2="0" y2="6" stroke={colorHex} strokeWidth="1" />
              <line x1="-6" y1="0" x2="6" y2="0" stroke={colorHex} strokeWidth="1" />
              <circle cx="0" cy="0" r="2.5" fill={colorHex} />
            </g>
          </g>
        ) : eq.type === 'reservatorio' ? (
          // Reservoir symbol: water tank
          <g>
            <rect x="-7" y="-7" width="14" height="14" rx="2" fill="none" stroke={colorHex} strokeWidth="1.5" />
            {/* Water level fill */}
            <rect 
              x="-6" 
              y={6 - 12 * ((eq.level || 0) / 100)} 
              width="12" 
              height={12 * ((eq.level || 0) / 100)} 
              rx="0.5" 
              fill={colorHex} 
              opacity="0.6" 
            />
            {/* Level tick line */}
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#1e293b" strokeWidth="0.5" />
          </g>
        ) : eq.type === 'poco' ? (
          // Deep well symbol
          <g>
            <circle cx="0" cy="0" r="8" fill="none" stroke={colorHex} strokeWidth="1.5" />
            <line x1="-5" y1="3" x2="5" y2="3" stroke={colorHex} strokeWidth="1.5" />
            <line x1="-3" y1="0" x2="3" y2="0" stroke={colorHex} strokeWidth="1.5" />
            <line x1="0" y1="-5" x2="0" y2="6" stroke={colorHex} strokeWidth="1" />
          </g>
        ) : eq.type === 'pressao' ? (
          // Pressure Gauge
          <g>
            <circle cx="0" cy="0" r="8" fill="none" stroke={colorHex} strokeWidth="1.5" />
            <path d="M-4,1 A5,5 0 0,1 4,1" fill="none" stroke={colorHex} strokeWidth="1" />
            {/* Needle */}
            <line 
              x1="0" 
              y1="3" 
              x2={eq.pressure && eq.pressure > 3 ? 4 : -4} 
              y2={eq.pressure && eq.pressure > 3 ? -3 : -2} 
              stroke={colorHex} 
              strokeWidth="1.5" 
            />
          </g>
        ) : eq.type === 'vazao' ? (
          // Flow meter
          <g>
            <circle cx="0" cy="0" r="8" fill="none" stroke={colorHex} strokeWidth="1.5" />
            <path d="M-5,0 L5,0 M1,3 L5,0 M1,-3 L5,0" fill="none" stroke={colorHex} strokeWidth="1" />
          </g>
        ) : eq.type === 'valvula' ? (
          // Valve symbol (Bow-tie)
          <g>
            <polygon points="-6,-5 -6,5 6,-5 6,5" fill="none" stroke={colorHex} strokeWidth="1.5" />
            {/* Valve center core */}
            <circle cx="0" cy="0" r="2" fill={colorHex} />
          </g>
        ) : (
          <circle cx="0" cy="0" r="6" fill={colorHex} />
        )}

        {/* Code indicator text badge above/below the icon */}
        <rect
          x="-16"
          y="-22"
          width="32"
          height="10"
          rx="2"
          fill={isLight ? "#ffffff" : "#0a0b0e"}
          stroke={isLight ? "#94a3b8" : "#334155"}
          strokeWidth="1"
          opacity="0.9"
        />
        <text 
          y="-14" 
          textAnchor="middle" 
          fill={isLight ? "#0f172a" : "#cbd5e1"} 
          fontSize="8" 
          fontWeight="bold" 
          fontFamily="monospace"
        >
          {eq.id}
        </text>
      </g>
    );
  };

  const getPipelineColor = (status: Pipeline['status']) => {
    switch (status) {
      case 'normal': return '#3b82f6'; // normal blue flow
      case 'baixa_pressao': return '#eab308'; // warning yellow
      case 'falha': return '#ef4444'; // critical red
      case 'sem_comunicacao': return '#4b5563'; // disabled gray
    }
  };

  // Leaflet Map Initialization (triggers only when mapMode or theme changes)
  useEffect(() => {
    if (mapMode === 'scada') {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        layerGroupRef.current = null;
      }
      return;
    }

    if (!leafletContainerRef.current) return;

    // Clean up previous instance before creating a new one
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
      layerGroupRef.current = null;
    }

    // Center coordinates for Manacapuru: -3.3000, -60.6200
    const map = L.map(leafletContainerRef.current, {
      center: [-3.3000, -60.6200],
      zoom: 14,
      zoomControl: false, // Custom zoom controls
      attributionControl: true,
    });

    leafletMapRef.current = map;

    // Set Up Tile Layer based on mapMode
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attrib = '&copy; OpenStreetMap';

    if (mapMode === 'ruas') {
      if (isLight) {
        tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        attrib = '&copy; OpenStreetMap &copy; CARTO';
      } else {
        tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        attrib = '&copy; OpenStreetMap &copy; CARTO';
      }
    } else if (mapMode === 'satelite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attrib = 'Esri &copy; DigitalGlobe';
    } else if (mapMode === 'topografia') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attrib = '&copy; OpenTopoMap';
    }

    L.tileLayer(tileUrl, {
      attribution: attrib,
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [mapMode, theme]);

  // Render/Update Leaflet Map layers dynamically without tearing down the map
  useEffect(() => {
    const map = leafletMapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup || mapMode === 'scada') return;

    // Clear previous elements
    layerGroup.clearLayers();

    // Render Regions Polygons
    if (showRegions) {
      regions.forEach(reg => {
        const transformedPoints = reg.points
          .split(' ')
          .map(pair => {
            const [px, py] = pair.split(',').map(Number);
            return mapToLatLng(px, py);
          });

        const polygon = L.polygon(transformedPoints, {
          color: reg.color,
          fillColor: reg.color,
          fillOpacity: selectedRegionId === reg.id ? 0.25 : 0.08,
          weight: selectedRegionId === reg.id ? 3 : 1.5,
          dashArray: selectedRegionId === reg.id ? undefined : '5, 5'
        });

        polygon.on('click', () => {
          setSelectedRegionId(prev => prev === reg.id ? null : reg.id);
        });

        polygon.addTo(layerGroup);

        polygon.bindTooltip(reg.name, {
          sticky: true,
          className: 'bg-slate-900 border-none text-white text-[10px] font-sans font-semibold rounded px-1.5 py-0.5 shadow'
        });

        // IF ADMIN AND SELECTED: Add interactive handles for vertex editing in Leaflet
        if (userProfile === 'admin' && selectedRegionId === reg.id) {
          const pts = reg.points.split(' ').map(pair => {
            const [px, py] = pair.split(',').map(Number);
            return { x: px, y: py };
          });

          // Draw Vertex Handles
          pts.forEach((p, idx) => {
            const latlng = mapToLatLng(p.x, p.y);
            const vertexIcon = L.divIcon({
              className: 'leaflet-edit-vertex-handle',
              html: `
                <div class="w-4 h-4 bg-white border-2 border-red-500 rounded-full flex items-center justify-center shadow" style="transform: translate(-4px, -4px); cursor: move;">
                  <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              `,
              iconSize: [8, 8]
            });

            L.marker(latlng, {
              icon: vertexIcon,
              draggable: true
            })
            .on('dragend', (e) => {
              const pos = e.target.getLatLng();
              const y = ((-3.2800 - pos.lat) / 0.0400) * 100;
              const x = ((pos.lng + 60.6400) / 0.0400) * 100;
              onUpdateRegionVertex?.(reg.id, idx, parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1)));
            })
            .on('dblclick', (e) => {
              L.DomEvent.stopPropagation(e);
              if (pts.length > 3) {
                onDeleteRegionVertex?.(reg.id, idx);
              } else {
                alert("Um polígono precisa ter pelo menos 3 vértices!");
              }
            })
            .addTo(layerGroup);
          });

          // Draw Midpoint Handles
          pts.forEach((p, idx) => {
            const nextP = pts[(idx + 1) % pts.length];
            const midX = (p.x + nextP.x) / 2;
            const midY = (p.y + nextP.y) / 2;
            const latlng = mapToLatLng(midX, midY);

            const midIcon = L.divIcon({
              className: 'leaflet-edit-mid-handle',
              html: `
                <div class="w-3 h-3 bg-red-400 border border-white rounded-full shadow" style="transform: translate(-3px, -3px); cursor: pointer; opacity: 0.7;"></div>
              `,
              iconSize: [6, 6]
            });

            L.marker(latlng, {
              icon: midIcon,
              draggable: true
            })
            .on('dragstart', (e) => {
              onAddRegionVertex?.(reg.id, idx + 1, midX, midY);
            })
            .on('dragend', (e) => {
              const pos = e.target.getLatLng();
              const y = ((-3.2800 - pos.lat) / 0.0400) * 100;
              const x = ((pos.lng + 60.6400) / 0.0400) * 100;
              onUpdateRegionVertex?.(reg.id, idx + 1, parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1)));
            })
            .addTo(layerGroup);
          });
        }
      });
    }

    // Render Pipelines
    if (showPipelines) {
      pipelines.forEach(pipe => {
        const fromEq = equipmentList.find(e => e.id === pipe.fromId);
        const toEq = equipmentList.find(e => e.id === pipe.toId);
        if (!fromEq || !toEq) return;

        const pipeColor = getPipelineColor(pipe.status);
        const latlngs = getPipelineLatLngs(pipe, fromEq, toEq);
        const isHovered = hoveredEquipment?.id === pipe.fromId || hoveredEquipment?.id === pipe.toId;

        const polyline = L.polyline(latlngs, {
          color: pipeColor,
          weight: isHovered ? 6 : 3.5,
          opacity: isHovered ? 0.9 : 0.65,
          dashArray: (pipe.status === 'normal' || pipe.status === 'baixa_pressao') ? '6, 8' : undefined
        });

        polyline.addTo(layerGroup);
      });
    }

    // Render Equipment Markers
    equipmentList.forEach(eq => {
      const statusColor = getStatusColor(eq);
      const colorHex = getColorHex(statusColor);
      const alarms = getEquipmentAlarms(eq.id);
      const hasAlarm = alarms.length > 0;
      const isSelected = selectedEquipment?.id === eq.id;

      // Map SVG representation of icons to raw HTML/SVG for L.divIcon
      let iconHtml = '';
      if (eq.type === 'bomba' || eq.type === 'booster') {
        const isRunning = eq.status === 'ligada' || eq.status === 'automatico';
        iconHtml = `
          <svg viewBox="-10 -10 20 20" class="w-full h-full">
            <circle cx="0" cy="0" r="7" fill="none" stroke="${colorHex}" stroke-width="1.5" />
            <g class="${isRunning ? 'animate-spin' : ''}" style="transform-origin: center;">
              <line x1="0" y1="-6" x2="0" y2="6" stroke="${colorHex}" stroke-width="1.2" />
              <line x1="-6" y1="0" x2="6" y2="0" stroke="${colorHex}" stroke-width="1.2" />
              <circle cx="0" cy="0" r="2" fill="${colorHex}" />
            </g>
          </svg>
        `;
      } else if (eq.type === 'reservatorio') {
        iconHtml = `
          <svg viewBox="-10 -10 20 20" class="w-full h-full">
            <rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none" stroke="${colorHex}" stroke-width="1.5" />
            <rect x="-5" y="${5 - 10 * ((eq.level || 0) / 100)}" width="10" height="${10 * ((eq.level || 0) / 100)}" fill="${colorHex}" opacity="0.6" />
          </svg>
        `;
      } else if (eq.type === 'poco') {
        iconHtml = `
          <svg viewBox="-10 -10 20 20" class="w-full h-full">
            <circle cx="0" cy="0" r="7" fill="none" stroke="${colorHex}" stroke-width="1.5" />
            <line x1="-4" y1="2" x2="4" y2="2" stroke="${colorHex}" stroke-width="1.5" />
            <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="${colorHex}" stroke-width="1.5" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="${colorHex}" stroke-width="1.2" />
          </svg>
        `;
      } else if (eq.type === 'pressao') {
        iconHtml = `
          <svg viewBox="-10 -10 20 20" class="w-full h-full">
            <circle cx="0" cy="0" r="7" fill="none" stroke="${colorHex}" stroke-width="1.5" />
            <path d="M-3.5,1.5 A4,4 0 0,1 3.5,1.5" fill="none" stroke="${colorHex}" stroke-width="1" />
            <line x1="0" y1="2.5" x2="${eq.pressure && eq.pressure > 3 ? 3 : -3}" y2="${eq.pressure && eq.pressure > 3 ? -2.5 : -1.5}" stroke="${colorHex}" stroke-width="1.5" />
          </svg>
        `;
      } else if (eq.type === 'vazao') {
        iconHtml = `
          <svg viewBox="-10 -10 20 20" class="w-full h-full">
            <circle cx="0" cy="0" r="7" fill="none" stroke="${colorHex}" stroke-width="1.5" />
            <path d="M-4.5,0 L4.5,0 M1,2.5 L4.5,0 M1,-2.5 L4.5,0" fill="none" stroke="${colorHex}" stroke-width="1.2" />
          </svg>
        `;
      } else if (eq.type === 'valvula') {
        iconHtml = `
          <svg viewBox="-10 -10 20 20" class="w-full h-full">
            <polygon points="-5,-4 -5,4 5,-4 5,4" fill="none" stroke="${colorHex}" stroke-width="1.5" />
            <circle cx="0" cy="0" r="1.5" fill="${colorHex}" />
          </svg>
        `;
      } else {
        iconHtml = `
          <svg viewBox="-10 -10 20 20" class="w-full h-full">
            <circle cx="0" cy="0" r="5" fill="${colorHex}" />
          </svg>
        `;
      }

      const divIcon = L.divIcon({
        className: 'leaflet-custom-marker-wrapper',
        html: `
          <div class="relative flex items-center justify-center select-none ${isSelected ? 'scale-110' : ''}">
            <!-- Active alarm backdrop pulsing ring -->
            ${hasAlarm ? `
              <div class="absolute w-10 h-10 rounded-full bg-red-500 animate-ping opacity-60"></div>
            ` : ''}
            <!-- Outer casing style matching SVG -->
            <div class="w-8 h-8 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center shadow-lg transition-transform hover:scale-115 relative z-10">
              ${iconHtml}
            </div>
            <!-- Code indicator text badge -->
            <div class="absolute -top-4 px-1 py-0.2 bg-slate-950 border border-slate-700 rounded text-[7px] font-mono text-white font-bold whitespace-nowrap z-20">
              ${eq.id}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const [lat, lng] = mapToLatLng(eq.x, eq.y);
      const marker = L.marker([lat, lng], { 
        icon: divIcon,
        draggable: userProfile === 'admin'
      })
        .on('click', () => {
          onSelectEquipment(eq);
        })
        .on('mouseover', () => {
          onHoverEquipment(eq);
        })
        .on('mouseout', () => {
          onHoverEquipment(null);
        })
        .on('dragend', (event) => {
          const m = event.target;
          const pos = m.getLatLng();
          const y = ((-3.2800 - pos.lat) / 0.0400) * 100;
          const x = ((pos.lng + 60.6400) / 0.0400) * 100;
          onUpdateEquipmentCoordinates?.(eq.id, parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2)));
        })
        .addTo(layerGroup);

      // Create a polished Leaflet popup / tooltip
      marker.bindTooltip(`
        <div class="font-sans text-xs p-1">
          <div class="font-bold text-slate-900 border-b border-slate-100 pb-0.5 flex gap-1 items-center">
            <span class="w-2 h-2 rounded-full" style="background-color: ${colorHex}"></span>
            ${eq.name} (${eq.id})
          </div>
          <div class="text-[10px] text-slate-500 font-mono mt-1 space-y-0.5">
            ${eq.level !== undefined ? `Nível: <strong>${eq.level}% (${eq.volume}m³)</strong>` : ''}
            ${eq.pressure !== undefined ? `Pressão: <strong>${eq.pressure} mca</strong>` : ''}
            ${eq.flowRate !== undefined ? `Vazão: <strong>${eq.flowRate} L/s</strong>` : ''}
            <div>Status: <span class="capitalize"><strong>${eq.status}</strong></span></div>
            ${hasAlarm ? `<div class="text-red-600 font-bold mt-0.5">⚠️ ALARME ATIVO</div>` : ''}
          </div>
        </div>
      `, { direction: 'top', offset: [0, -10] });
    });
  }, [mapMode, regions, pipelines, equipmentList, selectedEquipment, hoveredEquipment, showRegions, showPipelines, selectedRegionId, userProfile]);

  return (
    <div className="relative w-full h-full bg-scada-main border border-scada rounded-2xl overflow-hidden shadow-2xl flex flex-col select-none">
      
      {/* Top Map Toolbar */}
      <div className={`w-full p-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 transition-all duration-200 z-10 ${
        isLight 
          ? 'bg-white text-slate-800 border-slate-200' 
          : 'bg-[#111827] text-white border-[#2A3B52]'
      }`}>
        <div className={`flex items-center gap-1.5 border-r pr-3 ${isLight ? 'border-slate-200' : 'border-[#2A3B52]'}`}>
          <Droplets className={`w-4 h-4 ${isLight ? 'text-teal-600' : 'text-scada-icon'}`} />
          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'} hidden sm:inline`}>Rede SAAE Manacapuru</span>
          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'} sm:hidden`}>SAAE</span>
        </div>
        
        {/* Map Layers Toggles */}
        <div className="flex gap-2 flex-wrap">
          <button 
            id="toggle-pipelines"
            onClick={() => setShowPipelines(!showPipelines)} 
            className={`px-2 py-1 rounded transition-all font-medium cursor-pointer text-[10px] border ${
              showPipelines 
                ? (isLight ? 'bg-blue-600/15 text-blue-700 border-blue-500/30 font-semibold' : 'bg-blue-500/20 text-blue-400 border-blue-500/35')
                : (isLight ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100' : 'bg-[#0B1220]/40 text-slate-400 border-[#2A3B52]')
            }`}
          >
            Tubulações
          </button>
          <button 
            id="toggle-regions"
            onClick={() => setShowRegions(!showRegions)} 
            className={`px-2 py-1 rounded transition-all font-medium cursor-pointer text-[10px] border ${
              showRegions 
                ? (isLight ? 'bg-teal-600/15 text-teal-700 border-teal-500/30 font-semibold' : 'bg-teal-500/20 text-teal-400 border-teal-500/35')
                : (isLight ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100' : 'bg-[#0B1220]/40 text-slate-400 border-[#2A3B52]')
            }`}
          >
            Polígonos
          </button>
          {userProfile === 'admin' && (
            <button
              id="add-new-region-btn"
              onClick={() => {
                onAddNewRegion?.();
                setShowRegions(true);
              }}
              className={`px-2 py-1 rounded transition-all font-semibold cursor-pointer text-[10px] border flex items-center gap-1 ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
              title="Adicionar Novo Polígono"
            >
              + Polígono
            </button>
          )}
        </div>

        {/* Real Map Toggles */}
        <div className={`flex gap-1 p-0.5 rounded-lg border flex-wrap ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0B1220]/60 border-[#2A3B52]'}`}>
          <button 
            id="map-mode-scada"
            onClick={() => setMapMode('scada')} 
            className={`px-1.5 py-0.5 rounded text-[9px] transition-all font-semibold cursor-pointer border ${
              mapMode === 'scada' 
                ? (isLight ? 'bg-white text-slate-900 border-slate-200 shadow-sm' : 'bg-[#111827] text-white border-[#2A3B52] shadow-sm') 
                : (isLight ? 'text-slate-500 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent')
            }`}
          >
            Vetor SAAE
          </button>
          <button 
            id="map-mode-ruas"
            onClick={() => setMapMode('ruas')} 
            className={`px-1.5 py-0.5 rounded text-[9px] transition-all font-semibold cursor-pointer border ${
              mapMode === 'ruas' 
                ? (isLight ? 'bg-white text-slate-900 border-slate-200 shadow-sm' : 'bg-[#111827] text-white border-[#2A3B52] shadow-sm') 
                : (isLight ? 'text-slate-500 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent')
            }`}
          >
            Ruas
          </button>
          <button 
            id="map-mode-satelite"
            onClick={() => setMapMode('satelite')} 
            className={`px-1.5 py-0.5 rounded text-[9px] transition-all font-semibold cursor-pointer border ${
              mapMode === 'satelite' 
                ? (isLight ? 'bg-white text-slate-900 border-slate-200 shadow-sm' : 'bg-[#111827] text-white border-[#2A3B52] shadow-sm') 
                : (isLight ? 'text-slate-500 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent')
            }`}
          >
            Satélite
          </button>
          <button 
            id="map-mode-topografia"
            onClick={() => setMapMode('topografia')} 
            className={`px-1.5 py-0.5 rounded text-[9px] transition-all font-semibold cursor-pointer border ${
              mapMode === 'topografia' 
                ? (isLight ? 'bg-white text-slate-900 border-slate-200 shadow-sm' : 'bg-[#111827] text-white border-[#2A3B52] shadow-sm') 
                : (isLight ? 'text-slate-500 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent')
            }`}
          >
            Topografia
          </button>
        </div>

        {/* Pan and Zoom Controls */}
        <div className={`flex items-center gap-1 border-l pl-3 ${isLight ? 'border-slate-200' : 'border-[#2A3B52]'}`}>
          <button
            onClick={() => {
              if (mapMode === 'scada') {
                setScale(prev => Math.min(prev * 1.2, 5));
              } else if (leafletMapRef.current) {
                leafletMapRef.current.zoomIn();
              }
            }}
            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] transition-all cursor-pointer border ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm' 
                : 'bg-[#111827] hover:bg-[#18212F] text-white border-[#2A3B52]'
            }`}
            title="Aumentar Zoom (+)"
          >
            +
          </button>
          <button
            onClick={() => {
              if (mapMode === 'scada') {
                setScale(prev => Math.max(prev / 1.2, 0.5));
              } else if (leafletMapRef.current) {
                leafletMapRef.current.zoomOut();
              }
            }}
            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] transition-all cursor-pointer border ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm' 
                : 'bg-[#111827] hover:bg-[#18212F] text-white border-[#2A3B52]'
            }`}
            title="Diminuir Zoom (-)"
          >
            -
          </button>
          <button
            onClick={() => {
              if (mapMode === 'scada') {
                setScale(1);
                setPosition({ x: 0, y: 0 });
              } else if (leafletMapRef.current) {
                leafletMapRef.current.setView([-3.3000, -60.6200], 14);
              }
            }}
            className={`px-1.5 h-6 rounded-md flex items-center justify-center font-medium text-[10px] transition-all cursor-pointer border ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 shadow-sm' 
                : 'bg-[#111827] hover:bg-[#18212F] text-slate-300 hover:text-white border-[#2A3B52]'
            }`}
            title="Resetar visualização"
          >
            Resetar
          </button>
        </div>
      </div>

      {/* Map Legend Overlay (Bottom Left) */}
      <div className={`absolute bottom-3 left-3 z-[1000] p-3 rounded-xl backdrop-blur-md text-[10px] space-y-2 shadow-lg w-52 border transition-all duration-200 hidden sm:block ${
        isLight 
          ? 'bg-white/95 text-slate-800 border-slate-200 shadow-slate-200/50' 
          : 'bg-[#111827]/95 text-white border-[#2A3B52] shadow-black/40'
      }`}>
        <div className={`text-[11px] font-bold border-b pb-1 flex justify-between items-center ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-[#2A3B52]'}`}>
          <span>Legenda Operacional</span>
          <Compass className={`w-3.5 h-3.5 animate-spin-slow ${isLight ? 'text-teal-600' : 'text-scada-icon'}`} />
        </div>
        <div className={`grid grid-cols-2 gap-x-2 gap-y-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
            <span>Ligada / Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20"></span>
            <span>Automático</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Desligada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20 animate-pulse"></span>
            <span>Alerta/Pressão B.</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-4 ring-red-500/40 animate-ping"></span>
            <span className={`font-bold ${isLight ? 'text-red-600' : 'text-red-400'}`}>Falha Crítica / Alarme</span>
          </div>
        </div>
        <div className={`border-t pt-1.5 font-mono text-[9px] leading-tight space-y-0.5 ${isLight ? 'border-slate-200 text-slate-500' : 'border-[#2A3B52] text-slate-400'}`}>
          <p>📍 Rio Solimões (Canal de Abastecimento)</p>
          <p>📡 Coordenadas: 3°17'59"S 60°37'14"W</p>
        </div>
      </div>

      {/* Map Region Info Card (Top Right) */}
      {selectedRegionId && (
        <div className={`absolute top-16 right-3 z-[1000] p-4 rounded-xl backdrop-blur-md shadow-xl w-[calc(100%-24px)] sm:max-w-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 border transition-all duration-200 ${
          isLight 
            ? 'bg-white/95 text-slate-800 border-slate-200 shadow-slate-200/50' 
            : 'bg-[#111827]/95 text-white border-[#2A3B52] shadow-black/40'
        }`}>
          {(() => {
            const reg = regions.find(r => r.id === selectedRegionId);
            if (!reg) return null;
            
            const isAdmin = userProfile === 'admin';

            return (
              <>
                <div className={`flex justify-between items-center border-b pb-1.5 ${isLight ? 'border-slate-200' : 'border-[#2A3B52]'}`}>
                  {isAdmin ? (
                    <div className="flex items-center gap-1.5 w-full mr-2">
                      <input 
                        type="color" 
                        value={reg.color} 
                        onChange={(e) => onUpdateRegionInfo?.(reg.id, { color: e.target.value })}
                        className="w-5 h-5 rounded cursor-pointer border-none bg-transparent shrink-0"
                        title="Cor do polígono"
                      />
                      <input 
                        type="text" 
                        value={reg.name} 
                        onChange={(e) => onUpdateRegionInfo?.(reg.id, { name: e.target.value })}
                        className={`font-bold text-xs px-1.5 py-0.5 rounded w-full border ${
                          isLight 
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' 
                            : 'bg-[#111827] border-[#2A3B52] text-white focus:bg-[#1f2937]'
                        }`}
                        placeholder="Nome da Região"
                      />
                    </div>
                  ) : (
                    <h4 className={`font-bold text-sm flex items-center gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: reg.color }}></span>
                      {reg.name}
                    </h4>
                  )}
                  <button 
                    onClick={() => setSelectedRegionId(null)}
                    className={`font-mono text-xs px-1 rounded cursor-pointer shrink-0 ${isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-[#0B1220]'}`}
                  >
                    fechar
                  </button>
                </div>

                <div className={`grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <div className="space-y-1 col-span-2">
                    <span className={`text-[10px] block font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Responsável (Operador)</span>
                    {isAdmin ? (
                      <input 
                        type="text" 
                        value={reg.operator} 
                        onChange={(e) => onUpdateRegionInfo?.(reg.id, { operator: e.target.value })}
                        className={`text-xs px-2 py-1 rounded w-full border ${
                          isLight 
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' 
                            : 'bg-[#111827] border-[#2A3B52] text-white focus:bg-[#1f2937]'
                        }`}
                        placeholder="Nome do Operador"
                      />
                    ) : (
                      <span className={`font-medium flex items-center gap-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}><Users className="w-3 h-3 text-slate-400" />{reg.operator}</span>
                    )}
                  </div>
                  
                  <div className="space-y-0.5">
                    <span className={`text-[10px] block ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Equipamentos</span>
                    <span className={`font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{reg.bombasCount + reg.reservatoriosCount + reg.medidoresCount}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-[10px] block ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Bombas / Reserv.</span>
                    <span className={`font-mono font-bold ${isLight ? 'text-teal-600' : 'text-scada-icon'}`}>{reg.bombasCount} B / {reg.reservatoriosCount} R</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-2 border-t border-dashed border-slate-700/50 flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir a região "${reg.name}"?`)) {
                          onDeleteRegion?.(reg.id);
                          setSelectedRegionId(null);
                        }
                      }}
                      className="text-[10px] bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-md cursor-pointer font-semibold transition-all"
                    >
                      Excluir Polígono
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Conditionally mount Leaflet Map or SCADA SVG Vector Canvas */}
      {mapMode !== 'scada' ? (
        <div className="flex-1 relative w-full h-full overflow-hidden bg-scada-main z-0">
          <div ref={leafletContainerRef} className="absolute inset-0 w-full h-full z-0" style={{ minWidth: '100%', minHeight: '100%' }} />
        </div>
      ) : (
        /* Primary SVG Vector Canvas */
        <div 
          ref={scadaContainerRef}
          className={`flex-1 relative w-full h-full overflow-hidden transition-colors duration-200 ${isLight ? 'bg-[#f1f5f9]' : 'bg-[#0d0f12]'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
        
        {/* Grid Background */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"
          style={{
            '--grid-color': isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(30, 41, 59, 0.15)'
          } as React.CSSProperties}
        ></div>

        <svg 
          viewBox="0 0 1000 600" 
          className="w-full h-full text-slate-100"
          preserveAspectRatio="none"
        >
          {/* DEFINITIONS */}
          <defs>
            {/* Gradients for land / water */}
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isLight ? "#60a5fa" : "#1e3a8a"} stopOpacity={isLight ? "0.6" : "0.8"} />
              <stop offset="100%" stopColor={isLight ? "#3b82f6" : "#0f172a"} stopOpacity={isLight ? "0.8" : "0.95"} />
            </linearGradient>
            
            <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isLight ? "#f8fafc" : "#09101d"} />
              <stop offset="100%" stopColor={isLight ? "#f1f5f9" : "#080e1a"} />
            </linearGradient>

            {/* Glowing filter for pipelines */}
            <filter id="pipelineGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <filter id="alarmGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Pan and Zoom wrapping group */}
          <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>

            {/* REAL MAP BACKGROUND LAYER */}
            {mapMode !== 'scada' && (
              <image
                id="real-map-bg-manacapuru"
                href={
                  mapMode === 'satelite'
                    ? 'https://static-maps.yandex.ru/1.x/?ll=-60.6200,-3.3000&z=13&l=sat,skl&size=650,450'
                    : 'https://static-maps.yandex.ru/1.x/?ll=-60.6200,-3.3000&z=13&l=map&size=650,450'
                }
                x="0"
                y="0"
                width="1000"
                height="600"
                preserveAspectRatio="none"
                opacity={isLight ? 0.95 : 0.65}
                style={{
                  filter: isLight 
                    ? 'none' 
                    : mapMode === 'satelite' 
                      ? 'brightness(0.55) contrast(1.1)' 
                      : 'invert(1) hue-rotate(185deg) brightness(0.65) contrast(1.15) saturate(1.2)'
                }}
              />
            )}

            {/* 1. GEOGRAPHY & RIVER BASE - Solimões River at the bottom */}
            {mapMode === 'scada' && (
              <g id="river-solimoes">
                {/* Outer water body */}
                <path 
                  d="M 0,480 Q 200,450 400,510 T 800,480 T 1000,530 L 1000,600 L 0,600 Z" 
                  fill="url(#riverGrad)" 
                  stroke="#2563eb" 
                  strokeWidth="2"
                  opacity="0.85" 
                />
                {/* Decorative river bank beach sand lines */}
                <path 
                  d="M 0,480 Q 200,450 400,510 T 800,480 T 1000,530" 
                  fill="none" 
                  stroke="#fbbf24" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 8"
                  opacity="0.5"
                />
                
                {/* Animated water flow lines */}
                <path 
                  d="M 50,530 Q 250,500 450,560 T 850,530" 
                  fill="none" 
                  stroke="#60a5fa" 
                  strokeWidth="1.5" 
                  strokeDasharray="150 200"
                  className="animate-[dash_8s_linear_infinite]"
                  opacity="0.3"
                />
                <path 
                  d="M 100,560 Q 300,530 500,590 T 900,560" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="1" 
                  strokeDasharray="80 150"
                  className="animate-[dash_6s_linear_infinite]"
                  opacity="0.2"
                />

                {/* River Landmark Label */}
                <text x="350" y="560" fill="#60a5fa" fontSize="14" fontWeight="500" letterSpacing="4" opacity="0.6" fontFamily="sans-serif">
                  RIO SOLIMÕES (CAPTAÇÃO PRINCIPAL SAAE)
                </text>
              </g>
            )}

            {/* 2. REGION POLYGONS (with hover interaction) */}
            {showRegions && mapMode === 'scada' && (
              <g id="region-shapes">
                {regions.map((reg) => {
                  // Parse points to multiply by viewBox scale (x * 10, y * 6)
                  const transformedPoints = reg.points
                    .split(' ')
                    .map(pair => {
                      const [px, py] = pair.split(',').map(Number);
                      return `${px * 10},${py * 6}`;
                    })
                    .join(' ');

                  const isSelected = selectedRegionId === reg.id;

                  return (
                    <polygon
                      key={reg.id}
                      id={`region-${reg.id}`}
                      points={transformedPoints}
                      fill={reg.color}
                      fillOpacity={isSelected ? 0.16 : selectedRegionId ? 0.03 : 0.06}
                      stroke={reg.color}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray={isSelected ? "none" : "5 5"}
                      className="transition-all duration-300 cursor-pointer hover:fill-opacity-15"
                      onClick={() => setSelectedRegionId(reg.id === selectedRegionId ? null : reg.id)}
                    />
                  );
                })}

                {/* SVG region shape editing handles for senior engineer */}
                {userProfile === 'admin' && selectedRegionId && (
                  <g id="region-svg-edit-handles">
                    {(() => {
                      const reg = regions.find(r => r.id === selectedRegionId);
                      if (!reg) return null;
                      const pts = reg.points.split(' ').map(pair => {
                        const [px, py] = pair.split(',').map(Number);
                        return { x: px, y: py };
                      });

                      return (
                        <>
                          {/* 1. Connecting dashed line outline */}
                          <polygon
                            points={pts.map(p => `${p.x * 10},${p.y * 6}`).join(' ')}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />

                          {/* 2. Virtual Mid-points for creating new vertices */}
                          {pts.map((p, idx) => {
                            const nextP = pts[(idx + 1) % pts.length];
                            const midX = (p.x + nextP.x) / 2;
                            const midY = (p.y + nextP.y) / 2;

                            return (
                              <circle
                                key={`mid-${idx}`}
                                cx={midX * 10}
                                cy={midY * 6}
                                r="4.5"
                                fill="#ef4444"
                                fillOpacity="0.5"
                                stroke="#ffffff"
                                strokeWidth="1"
                                className="cursor-pointer hover:fill-opacity-90 hover:scale-115 transition-all"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  onAddRegionVertex?.(reg.id, idx + 1, midX, midY);
                                  setDraggingVertex({ regionId: reg.id, index: idx + 1 });
                                }}
                              />
                            );
                          })}

                          {/* 3. Drag handles for existing vertices */}
                          {pts.map((p, idx) => {
                            return (
                              <g key={`vertex-${idx}`} className="group">
                                <circle
                                  cx={p.x * 10}
                                  cy={p.y * 6}
                                  r="7.5"
                                  fill="#ffffff"
                                  stroke="#ef4444"
                                  strokeWidth="2"
                                  className="cursor-move hover:scale-120 transition-transform"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setDraggingVertex({ regionId: reg.id, index: idx });
                                  }}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    if (pts.length > 3) {
                                      onDeleteRegionVertex?.(reg.id, idx);
                                    } else {
                                      alert("Um polígono precisa ter pelo menos 3 vértices!");
                                    }
                                  }}
                                />
                                <circle
                                  cx={p.x * 10}
                                  cy={p.y * 6}
                                  r="2.5"
                                  fill="#ef4444"
                                  pointerEvents="none"
                                />
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </g>
                )}
              </g>
            )}

            {/* Landmark Text Placards on map */}
            {mapMode === 'scada' && (
              <g id="map-landmarks" opacity="0.4" pointerEvents="none" className="font-sans text-[10px] fill-slate-500 font-semibold tracking-wider">
                <text x="250" y="320">BAIRRO LIBERDADE</text>
                <text x="600" y="160">BAIRRO APARECIDA</text>
                <text x="380" y="440">CENTRO HISTÓRICO</text>
                <text x="800" y="380">NOVO MANACAPURU</text>
                <text x="50" y="50" fill="#3b82f6" fontSize="11">AM-070 (ESTRADA DE MANACAPURU-MANAUS)</text>
                <line x1="50" y1="58" x2="350" y2="58" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" />
              </g>
            )}

          {/* 3. PIPELINES (DISTRIBUTION NETWORK LINES) */}
          {showPipelines && (
            <g id="pipelines">
              {pipelines.map((pipe) => {
                // Resolve SVG points based on equipment coordinates
                const fromEq = equipmentList.find(e => e.id === pipe.fromId);
                const toEq = equipmentList.find(e => e.id === pipe.toId);
                if (!fromEq || !toEq) return null;

                const pipeColor = getPipelineColor(pipe.status);
                
                // Parse points string or calculate direct link
                let svgPoints = `${fromEq.x * 10},${fromEq.y * 6} ${toEq.x * 10},${toEq.y * 6}`;
                if (pipe.points) {
                  const pts = pipe.points.split(' ');
                  if (pts.length >= 2) {
                    pts[0] = `${fromEq.x},${fromEq.y}`;
                    pts[pts.length - 1] = `${toEq.x},${toEq.y}`;
                    svgPoints = pts
                      .map(pair => {
                        const [px, py] = pair.split(',').map(Number);
                        return `${px * 10},${py * 6}`;
                      })
                      .join(' ');
                  }
                }

                const isPipeActive = pipe.status === 'normal' || pipe.status === 'baixa_pressao';

                return (
                  <g key={pipe.id}>
                    {/* Background wider track for pipe glow and highlight */}
                    <polyline
                      points={svgPoints}
                      fill="none"
                      stroke={pipeColor}
                      strokeWidth={hoveredEquipment?.id === pipe.fromId || hoveredEquipment?.id === pipe.toId ? 6 : 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={hoveredEquipment?.id === pipe.fromId || hoveredEquipment?.id === pipe.toId ? 0.35 : 0.15}
                      className="transition-all duration-300"
                    />
                    
                    {/* Base Solid pipe line */}
                    <polyline
                      points={svgPoints}
                      fill="none"
                      stroke={pipeColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.85"
                    />

                    {/* Animated flow dots inside pipes */}
                    {isPipeActive && (
                      <polyline
                        points={svgPoints}
                        fill="none"
                        stroke="#93c5fd"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="8 20"
                        className="animate-[dash_4s_linear_infinite]"
                        opacity="0.9"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* 4. EQUIPMENT NODE Badges plotted as overlay */}
          <g id="equipment-nodes">
            {equipmentList.map((eq) => {
              const svgX = eq.x * 10;
              const svgY = eq.y * 6;

              return (
                <g 
                  key={eq.id} 
                  transform={`translate(${svgX}, ${svgY})`}
                  onMouseDown={(e) => {
                    // Prevent map drag starting from nodes
                    e.stopPropagation();
                    dragStartCoords.current = { x: e.clientX, y: e.clientY };
                    if (userProfile === 'admin') {
                      setDraggingEquipmentId(eq.id);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isClickAction(e)) {
                      onSelectEquipment(eq);
                    }
                  }}
                  onMouseEnter={() => onHoverEquipment(eq)}
                  onMouseLeave={() => onHoverEquipment(null)}
                  className={userProfile === 'admin' ? "cursor-move" : "cursor-pointer"}
                >
                  {/* Transparent solid hit target circle to make clicking extremely easy & responsive */}
                  <circle cx="0" cy="0" r="18" fill="rgba(0,0,0,0)" className={userProfile === 'admin' ? "cursor-move" : "cursor-pointer"} />
                  {renderEquipmentIcon(eq)}
                </g>
              );
            })}
          </g>
        </g> {/* Close Pan and Zoom wrapping group */}
      </svg>

      {/* Hover quick-info tooltip card on map */}
      {hoveredEquipment && (
        <div 
          className={`absolute z-30 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 pointer-events-none transition-all duration-200 border ${
            isLight 
              ? 'bg-white/95 text-slate-800 border-slate-200 shadow-slate-200/50' 
              : 'bg-[#111827]/95 text-white border-[#2A3B52] shadow-black/40'
          }`}
          style={{ 
            left: `${position.x + (hoveredEquipment.x * 10) * scale}px`, 
            top: `${position.y + (hoveredEquipment.y * 6) * scale}px`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <div className={`flex items-center gap-1.5 border-b pb-1 flex-wrap ${isLight ? 'border-slate-200' : 'border-[#2A3B52]'}`}>
            <span className={`w-2 h-2 rounded-full ${getColorHex(getStatusColor(hoveredEquipment)) === '#ef4444' ? 'bg-red-500 animate-ping' : ''}`} style={{ backgroundColor: getColorHex(getStatusColor(hoveredEquipment)) }}></span>
            <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{hoveredEquipment.name}</span>
            <span className={`font-mono text-[9px] px-1 py-0.2 rounded ml-auto ${isLight ? 'text-slate-600 bg-slate-100' : 'text-slate-400 bg-scada-main/80'}`}>{hoveredEquipment.id}</span>
          </div>

          <div className={`grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {hoveredEquipment.pressure !== undefined && (
              <>
                <span className={isLight ? 'text-slate-400' : 'text-scada-secondary/60'}>Pressão:</span>
                <span className={hoveredEquipment.status.includes('pressao') ? 'text-amber-600 font-bold' : (isLight ? 'text-blue-600' : 'text-blue-400')}>
                  {hoveredEquipment.pressure} mca
                </span>
              </>
            )}
            {hoveredEquipment.flowRate !== undefined && (
              <>
                <span className={isLight ? 'text-slate-400' : 'text-scada-secondary/60'}>Vazão:</span>
                <span className={isLight ? 'text-emerald-600 font-bold' : 'text-emerald-400'}>{hoveredEquipment.flowRate} L/s</span>
              </>
            )}
            {hoveredEquipment.level !== undefined && (
              <>
                <span className={isLight ? 'text-slate-400' : 'text-scada-secondary/60'}>Nível:</span>
                <span className={isLight ? 'text-blue-600 font-bold' : 'text-blue-400'}>{hoveredEquipment.level}% ({hoveredEquipment.volume} m³)</span>
              </>
            )}
            {hoveredEquipment.hoursWorked !== undefined && (
              <>
                <span className={isLight ? 'text-slate-400' : 'text-scada-secondary/60'}>Horas Trab.:</span>
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{hoveredEquipment.hoursWorked} h</span>
              </>
            )}
            {hoveredEquipment.voltage !== undefined && hoveredEquipment.voltage > 0 && (
              <>
                <span className={isLight ? 'text-slate-400' : 'text-scada-secondary/60'}>Elétrico:</span>
                <span className={isLight ? 'text-amber-600 font-bold' : 'text-yellow-400'}>{hoveredEquipment.voltage}V / {hoveredEquipment.current}A</span>
              </>
            )}
            <span className={isLight ? 'text-slate-400' : 'text-scada-secondary/60'}>Região:</span>
            <span className={`capitalize ${isLight ? 'text-slate-800 font-medium' : 'text-white'}`}>{hoveredEquipment.regionId}</span>
            <span className={isLight ? 'text-slate-400' : 'text-scada-secondary/60'}>Última Com.:</span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-scada-secondary'}`}>{new Date(hoveredEquipment.lastCommunication).toLocaleTimeString('pt-BR')}</span>
          </div>

          {getEquipmentAlarms(hoveredEquipment.id).length > 0 && (
            <div className={`border-t pt-1.5 flex items-center gap-1 text-[10px] text-red-500 font-bold ${isLight ? 'border-slate-200' : 'border-[#2A3B52]'}`}>
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>ALARME OPERACIONAL ATIVO</span>
            </div>
          )}
        </div>
      )}
        </div>
      )}

      {/* Map Bottom Status Bar (Water utilities details) */}
      <div className="bg-scada-navbar border-t border-scada px-4 py-2 flex justify-between items-center text-[11px] font-mono text-scada-secondary z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Telemetria: Canal Ativo GPRS/MQTT</span>
          <span className="text-slate-600">|</span>
          <span>Latência Média: 124ms</span>
        </div>
        <div>
          <span>Polígonos PostGIS: EPSG:4326 (WGS 84) • SAAE Manacapuru AM</span>
        </div>
      </div>

    </div>
  );
}
