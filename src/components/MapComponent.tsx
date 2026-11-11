import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Map as MapIcon, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Compass, 
  Eye, 
  Sliders
} from 'lucide-react';
import { 
  CoastalEpisode, 
  LayerSettings, 
  IslandRegion,
  OceanBuoy,
  AppSection,
  PlasticCandidatePolygon,
  CoastalSector,
  TransectRecord
} from '../types';
import { OceanVector } from '../data/layers';
import { ImportedLayer } from '../services/spatialImportService';

// Fallback archipelago coordinates
const CANARIAS_DEFAULT_CENTER: [number, number] = [28.25, -16.20];

interface MapComponentProps {
  episodes: CoastalEpisode[];
  selectedEpisode: CoastalEpisode | null;
  onSelectEpisode: (episode: CoastalEpisode) => void;
  layers: LayerSettings;
  oceanVectors: OceanVector[];
  oceanBuoys: OceanBuoy[];
  selectedIsland: IslandRegion;
  recenterTarget?: { lat: number; lng: number; ts: number } | null;
  activeSection?: AppSection;
  plasticCandidates?: PlasticCandidatePolygon[];
  selectedPlasticCandidate?: PlasticCandidatePolygon | null;
  onSelectPlasticCandidate?: (c: PlasticCandidatePolygon) => void;
  coastalSectors?: CoastalSector[];
  selectedSectorId?: string;
  selectedTransectId?: string | null;
  onSelectTransect?: (t: TransectRecord) => void;
  importedLayers?: ImportedLayer[];
  swipeSplitPercent?: number;
}

// Safe Leaflet runtime monkeypatches to protect against internal (NaN, NaN) exceptions
// caused by Leaflet's flyTo frame calculations, unproject, or PolyUtil.centroid evaluating 0 / 0.
if (typeof window !== 'undefined' && L) {
  const origLatLng = L.latLng;

  // 1. Guard PolyUtil.centroid
  if ((L as any).PolyUtil && typeof (L as any).PolyUtil.centroid === 'function') {
    const origCentroid = (L as any).PolyUtil.centroid;
    (L as any).PolyUtil.centroid = function (coords: any[]) {
      if (!coords || !Array.isArray(coords) || coords.length === 0) {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
      const valid = coords.filter((c: any) => {
        if (!c) return false;
        if (Array.isArray(c)) {
          return typeof c[0] === 'number' && !isNaN(c[0]) && isFinite(c[0]) &&
                 typeof c[1] === 'number' && !isNaN(c[1]) && isFinite(c[1]);
        }
        if (typeof c === 'object' && 'lat' in c && 'lng' in c) {
          return typeof c.lat === 'number' && !isNaN(c.lat) && isFinite(c.lat) &&
                 typeof c.lng === 'number' && !isNaN(c.lng) && isFinite(c.lng);
        }
        return false;
      });
      if (valid.length === 0) {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
      try {
        return origCentroid.call(this, valid);
      } catch {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
    };
  }

  // 2. Guard PolyUtil.polygonCenter
  if ((L as any).PolyUtil && typeof (L as any).PolyUtil.polygonCenter === 'function') {
    const origPolygonCenter = (L as any).PolyUtil.polygonCenter;
    (L as any).PolyUtil.polygonCenter = function (latlngs: any, crs: any) {
      if (!latlngs || (Array.isArray(latlngs) && latlngs.length === 0)) {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
      try {
        return origPolygonCenter.call(this, latlngs, crs);
      } catch {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
    };
  }

  // 3. Guard L.latLng factory against NaN, NaN
  (L as any).latLng = function (...args: any[]) {
    try {
      if (args.length === 1 && Array.isArray(args[0])) {
        const [a, b] = args[0];
        if (typeof a !== 'number' || isNaN(a) || !isFinite(a) || typeof b !== 'number' || isNaN(b) || !isFinite(b)) {
          return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
        }
      } else if (args.length >= 2) {
        const [a, b] = args;
        if (typeof a !== 'number' || isNaN(a) || !isFinite(a) || typeof b !== 'number' || isNaN(b) || !isFinite(b)) {
          return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
        }
      }
      return origLatLng.apply(this, args as any);
    } catch {
      return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
    }
  };

  // 4. Override Map.prototype.flyTo to use setView safely and prevent NaN frame errors
  if ((L as any).Map && (L as any).Map.prototype) {
    (L as any).Map.prototype.flyTo = function (targetCenter: any, targetZoom?: any, _options?: any) {
      const zoom = typeof targetZoom === 'number' && !isNaN(targetZoom) ? targetZoom : this.getZoom();
      let safeLat = CANARIAS_DEFAULT_CENTER[0];
      let safeLng = CANARIAS_DEFAULT_CENTER[1];
      if (Array.isArray(targetCenter) && targetCenter.length >= 2) {
        if (typeof targetCenter[0] === 'number' && !isNaN(targetCenter[0]) && isFinite(targetCenter[0])) {
          safeLat = targetCenter[0];
        }
        if (typeof targetCenter[1] === 'number' && !isNaN(targetCenter[1]) && isFinite(targetCenter[1])) {
          safeLng = targetCenter[1];
        }
      } else if (targetCenter && typeof targetCenter === 'object') {
        if (typeof targetCenter.lat === 'number' && !isNaN(targetCenter.lat) && isFinite(targetCenter.lat)) {
          safeLat = targetCenter.lat;
        }
        if (typeof targetCenter.lng === 'number' && !isNaN(targetCenter.lng) && isFinite(targetCenter.lng)) {
          safeLng = targetCenter.lng;
        }
      }
      try {
        return this.setView([safeLat, safeLng], zoom, { animate: true });
      } catch {
        return this;
      }
    };
  }

  // 5. Guard Map.prototype.unproject against producing NaN LatLng
  if ((L as any).Map?.prototype?.unproject) {
    const origMapUnproject = (L as any).Map.prototype.unproject;
    (L as any).Map.prototype.unproject = function (point: any, zoom?: any) {
      if (!point || isNaN(point.x) || isNaN(point.y) || !isFinite(point.x) || !isFinite(point.y)) {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
      try {
        const res = origMapUnproject.call(this, point, zoom);
        if (!res || isNaN(res.lat) || isNaN(res.lng) || !isFinite(res.lat) || !isFinite(res.lng)) {
          return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
        }
        return res;
      } catch {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
    };
  }

  // 6. Guard SphericalMercator.unproject against NaN points
  if ((L as any).Projection?.SphericalMercator?.unproject) {
    const origSMUnproject = (L as any).Projection.SphericalMercator.unproject;
    (L as any).Projection.SphericalMercator.unproject = function (point: any) {
      if (!point || isNaN(point.x) || isNaN(point.y) || !isFinite(point.x) || !isFinite(point.y)) {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
      try {
        const res = origSMUnproject.call(this, point);
        if (!res || isNaN(res.lat) || isNaN(res.lng) || !isFinite(res.lat) || !isFinite(res.lng)) {
          return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
        }
        return res;
      } catch {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
    };
  }

  // 7. Guard CRS.Earth.pointToLatLng against NaN points
  if ((L as any).CRS?.Earth?.pointToLatLng) {
    const origEarthPointToLatLng = (L as any).CRS.Earth.pointToLatLng;
    (L as any).CRS.Earth.pointToLatLng = function (point: any) {
      if (!point || isNaN(point.x) || isNaN(point.y) || !isFinite(point.x) || !isFinite(point.y)) {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
      try {
        const res = origEarthPointToLatLng.call(this, point);
        if (!res || isNaN(res.lat) || isNaN(res.lng) || !isFinite(res.lat) || !isFinite(res.lng)) {
          return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
        }
        return res;
      } catch {
        return origLatLng(CANARIAS_DEFAULT_CENTER[0], CANARIAS_DEFAULT_CENTER[1]);
      }
    };
  }
}

type BasemapType = 'satellite' | 'pnoa' | 'nautical' | 'dark' | 'osm' | 'mapbox' | 'maptiler';

const getMaptilerKey = (): string | null => {
  const env = (import.meta as any).env || {};
  const k = env.VITE_MAPTILER_API_KEY || env.MAPTILER_API_KEY || env.LEAFLET_API_KEY || env.VITE_LEAFLET_API_KEY || (typeof process !== 'undefined' ? (process.env?.VITE_MAPTILER_API_KEY || process.env?.MAPTILER_API_KEY || process.env?.LEAFLET_API_KEY) : '');
  if (!k || typeof k !== 'string') return null;
  const trimmed = k.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed.startsWith('MY_') || trimmed.length < 5) return null;
  return trimmed;
};

const getMapboxToken = (): string | null => {
  const env = (import.meta as any).env || {};
  const k = env.VITE_MAPBOX_ACCESS_TOKEN || env.MAPBOX_ACCESS_TOKEN || env.MAPBOX_TOKEN || env.VITE_MAPBOX_TOKEN || (typeof process !== 'undefined' ? (process.env?.VITE_MAPBOX_ACCESS_TOKEN || process.env?.MAPBOX_ACCESS_TOKEN) : '');
  if (!k || typeof k !== 'string') return null;
  const trimmed = k.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed.startsWith('MY_') || trimmed.length < 10) return null;
  return trimmed;
};

// Center coordinates for regions
const REGION_COORDINATES: Record<IslandRegion, { center: [number, number]; zoom: number }> = {
  Canarias: { center: [28.25, -16.50], zoom: 8 },
  Tenerife: { center: [28.29, -16.60], zoom: 10 },
  'La Palma': { center: [28.65, -17.88], zoom: 10 },
  'La Gomera': { center: [28.11, -17.20], zoom: 11 },
  'Gran Canaria': { center: [27.95, -15.55], zoom: 10 },
};

export const MapComponent: React.FC<MapComponentProps> = ({
  episodes,
  selectedEpisode,
  onSelectEpisode,
  layers,
  oceanVectors,
  oceanBuoys,
  selectedIsland,
  recenterTarget,
  activeSection,
  plasticCandidates = [],
  selectedPlasticCandidate,
  onSelectPlasticCandidate,
  coastalSectors = [],
  selectedSectorId,
  selectedTransectId,
  onSelectTransect,
  importedLayers = [],
  swipeSplitPercent = 50,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);

  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('satellite');
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measuredDistanceM, setMeasuredDistanceM] = useState<number | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialRegion = REGION_COORDINATES[selectedIsland] || REGION_COORDINATES['Canarias'];
    const safeCenter = (
      initialRegion &&
      Array.isArray(initialRegion.center) &&
      typeof initialRegion.center[0] === 'number' && !isNaN(initialRegion.center[0]) &&
      typeof initialRegion.center[1] === 'number' && !isNaN(initialRegion.center[1])
    ) ? initialRegion.center : CANARIAS_DEFAULT_CENTER;

    const map = L.map(mapContainerRef.current, {
      center: safeCenter,
      zoom: initialRegion?.zoom || 8,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom layer group for GIS features
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Set initial basemap
    updateBasemap('satellite', map);

    // Track cursor coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (e.latlng) {
        setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      try {
        map.remove();
      } catch (err) {
        console.warn('Map removal error:', err);
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap function
  const updateBasemap = (type: BasemapType, targetMap?: L.Map) => {
    const map = targetMap || mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
    }

    if (type === 'satellite') {
      // Esri World Imagery (Alta resolución satelital) - 100% libre sin API key
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, attribution: 'Esri, Maxar, Earthstar Geographics' }
      ).addTo(map);

      // Esri Boundaries and Places en superposición para navegación de toponimia costera (100% libre sin API key)
      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, attribution: 'Esri Reference' }
      ).addTo(map);
    } else if (type === 'pnoa') {
      // IGN España / GRAFCAN - Plan Nacional de Ortofotografía Aérea (PNOA Máxima Resolución 25cm/px Canarias) - 100% libre sin clave
      tileLayerRef.current = L.tileLayer(
        'https://www.ign.es/wmts/pnoa-ma?request=GetTile&service=WMTS&version=1.0.0&layer=OI.OrthoimageCoverage&style=default&format=image/jpeg&TileMatrixSet=GoogleMapsCompatible&TileMatrix={z}&TileRow={y}&TileCol={x}',
        { maxZoom: 19, attribution: '© IGN España - PNOA / IDE Canarias' }
      ).addTo(map);

      // Esri Reference Labels libres sin clave
      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Esri Reference' }
      ).addTo(map);
    } else if (type === 'nautical') {
      // Esri World Ocean Base - Cartografía oceanográfica oficial con batimetría y fondo marino (100% libre sin API key)
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, attribution: 'Esri, GEBCO, NOAA, National Geographic' }
      ).addTo(map);

      // Esri Ocean Reference (batimetría, fosas marinas y nombres oceánicos)
      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16 }
      ).addTo(map);
    } else if (type === 'dark') {
      // Esri Dark Gray Canvas Base - Modo oceanográfico nocturno (100% libre sin API key)
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, attribution: 'Esri, HERE, Garmin, OpenStreetMap' }
      ).addTo(map);

      // Esri Dark Gray Reference
      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16 }
      ).addTo(map);
    } else if (type === 'osm') {
      // OpenStreetMap Standard - 100% libre sin API key
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap contributors' }
      ).addTo(map);
    } else if (type === 'mapbox') {
      const token = getMapboxToken();
      if (token) {
        tileLayerRef.current = L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${token}`,
          { tileSize: 512, zoomOffset: -1, maxZoom: 20, attribution: '© Mapbox © OpenStreetMap' }
        ).addTo(map);
      } else {
        // Fallback robusto a Esri World Imagery (abierto) para evitar fallos de renderizado
        tileLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 18, attribution: 'Esri World Imagery (Activo: Mapbox token no configurado en entorno)' }
        ).addTo(map);
        labelsLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 18 }
        ).addTo(map);
      }
    } else if (type === 'maptiler') {
      const key = getMaptilerKey();
      if (key) {
        // Solo solicitar MapTiler si existe una clave válida detectada en variables de entorno
        tileLayerRef.current = L.tileLayer(
          `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${key}`,
          { tileSize: 512, zoomOffset: -1, maxZoom: 20, attribution: '© MapTiler © OpenStreetMap' }
        ).addTo(map);
      } else {
        // Fallback inmediato a Esri World Imagery: NUNCA solicitar a api.maptiler.com sin clave,
        // ya que MapTiler devuelve imágenes con la marca de agua "API key required"
        tileLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 18, attribution: 'Esri World Imagery (Activo: MapTiler key no configurada en entorno)' }
        ).addTo(map);
        labelsLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 18 }
        ).addTo(map);
      }
    }

    setCurrentBasemap(type);
  };

  // Center map when island selector changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const region = REGION_COORDINATES[selectedIsland] || REGION_COORDINATES['Canarias'];
    if (
      region &&
      Array.isArray(region.center) &&
      typeof region.center[0] === 'number' && !isNaN(region.center[0]) && isFinite(region.center[0]) &&
      typeof region.center[1] === 'number' && !isNaN(region.center[1]) && isFinite(region.center[1])
    ) {
      try {
        mapInstanceRef.current.setView(region.center, region.zoom || 8, {
          animate: true,
        });
      } catch (err) {
        console.warn('Map navigation error:', err);
      }
    }
  }, [selectedIsland]);

  // Center map on selected episode if requested
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedEpisode) return;
    if (
      typeof selectedEpisode.latitude === 'number' &&
      !isNaN(selectedEpisode.latitude) &&
      isFinite(selectedEpisode.latitude) &&
      typeof selectedEpisode.longitude === 'number' &&
      !isNaN(selectedEpisode.longitude) &&
      isFinite(selectedEpisode.longitude)
    ) {
      try {
        mapInstanceRef.current.panTo([selectedEpisode.latitude, selectedEpisode.longitude], {
          animate: true,
          duration: 0.8,
        });
      } catch (err) {
        console.warn('Map panTo error:', err);
      }
    }
  }, [selectedEpisode?.id]);

  // Center map on explicit recenter target
  useEffect(() => {
    if (!mapInstanceRef.current || !recenterTarget) return;
    if (
      typeof recenterTarget.lat === 'number' &&
      !isNaN(recenterTarget.lat) &&
      isFinite(recenterTarget.lat) &&
      typeof recenterTarget.lng === 'number' &&
      !isNaN(recenterTarget.lng) &&
      isFinite(recenterTarget.lng)
    ) {
      try {
        mapInstanceRef.current.setView([recenterTarget.lat, recenterTarget.lng], 12, {
          animate: true,
        });
      } catch (err) {
        console.warn('Map recenter error:', err);
      }
    }
  }, [recenterTarget]);

  // Render all GIS Layers dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    try {
      map.closePopup();
      map.closeTooltip();
    } catch {
      // Safe no-op
    }

    layerGroup.clearLayers();

    const getRiskColor = (risk: string) => {
      switch (risk) {
        case 'Bajo': return '#10b981'; // green
        case 'Moderado': return '#f59e0b'; // yellow/amber
        case 'Alto': return '#f97316'; // orange
        case 'Muy alto': return '#ef4444'; // red
        default: return '#06b6d4';
      }
    };

    // 1. OCEAN CURRENT VECTORS (CMEMS PHY)
    if (layers.currentVectors && Array.isArray(oceanVectors)) {
      oceanVectors.forEach((vec) => {
        if (
          !vec ||
          typeof vec.lat !== 'number' || isNaN(vec.lat) || !isFinite(vec.lat) ||
          typeof vec.lng !== 'number' || isNaN(vec.lng) || !isFinite(vec.lng)
        ) {
          return;
        }

        try {
          const arrowHtml = `
            <div style="
              transform: rotate(${vec.directionDeg || 0}deg);
              color: #38bdf8;
              font-size: 16px;
              font-weight: 900;
              text-shadow: 0 0 3px black;
              user-select: none;
            ">
              ➔
            </div>
          `;
          const icon = L.divIcon({
            html: arrowHtml,
            className: 'current-vector-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          const marker = L.marker([vec.lat, vec.lng], { icon, interactive: false });
          layerGroup.addLayer(marker);
        } catch (err) {
          console.warn('Failed to add vector marker:', err);
        }
      });
    }

    // 2. OFFICIAL OCEANOGRAPHIC BUOYS (Puertos del Estado / AEMET)
    if (layers.oceanBuoys && Array.isArray(oceanBuoys)) {
      oceanBuoys.forEach((buoy) => {
        if (
          !buoy ||
          typeof buoy.lat !== 'number' || isNaN(buoy.lat) || !isFinite(buoy.lat) ||
          typeof buoy.lng !== 'number' || isNaN(buoy.lng) || !isFinite(buoy.lng)
        ) {
          return;
        }

        try {
          const buoyHtml = `
            <div style="
              width: 22px; 
              height: 22px; 
              border-radius: 50%; 
              background: #0284c7; 
              border: 2px solid #ffffff; 
              box-shadow: 0 0 8px rgba(2,132,199,0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
              cursor: pointer;
            ">
              ⚓
            </div>
          `;
          const icon = L.divIcon({
            html: buoyHtml,
            className: 'custom-buoy-icon',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const marker = L.marker([buoy.lat, buoy.lng], { icon });
          marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 11px; min-width: 230px; color: #0f172a; line-height: 1.4;">
              <div style="font-weight: bold; font-size: 12px; color: #0369a1; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 5px;">
                ⚓ ${buoy.name}
              </div>
              <div style="font-size: 9.5px; color: #64748b; font-family: monospace; margin-bottom: 6px;">
                ${buoy.network}
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px;">
                <div><b>Temp. Marina (SST):</b> <span style="color:#0284c7; font-weight:bold;">${buoy.sst} °C</span></div>
                <div><b>Oleaje (Hs / Tp):</b> ${buoy.waveHeightM} m · ${buoy.wavePeriodS} s</div>
                <div><b>Viento:</b> ${buoy.windKnots} nudos (${buoy.windDirection})</div>
                <div><b>Corriente Superficial:</b> ${buoy.surfaceCurrentMs} m/s (${buoy.currentDirection})</div>
                <div style="margin-top: 5px; font-size: 9.5px; color: #059669; font-weight: bold;">
                  ● Sensor ${buoy.status} &middot; Sync: ${buoy.lastSync}
                </div>
              </div>
            </div>
          `);
          layerGroup.addLayer(marker);
        } catch (err) {
          console.warn('Failed to add ocean buoy:', buoy.id, err);
        }
      });
    }

    // 3. MICROALGAE EPISODES (ANOMALIES, TRAJECTORIES, UNCERTAINTY ENVELOPES)
    if (Array.isArray(episodes)) {
      episodes.forEach((ep) => {
        if (!ep) return;
        const isSelected = selectedEpisode?.id === ep.id;
        const riskColor = getRiskColor(ep.risk);

        // (A) Uncertainty Envelope Polygon (Predicción)
        if (layers.potentialImpactZone && Array.isArray(ep.uncertaintyEnvelope)) {
          const validEnvelope = ep.uncertaintyEnvelope.filter(
            (c) => Array.isArray(c) &&
              c.length >= 2 &&
              typeof c[0] === 'number' && !isNaN(c[0]) && isFinite(c[0]) &&
              typeof c[1] === 'number' && !isNaN(c[1]) && isFinite(c[1])
          );

          if (validEnvelope.length >= 3) {
            try {
              const uncertaintyPoly = L.polygon(validEnvelope as [number, number][], {
                color: '#c084fc', // purple
                weight: 1.5,
                dashArray: '4, 4',
                fillColor: '#a855f7',
                fillOpacity: 0.12,
              });
              uncertaintyPoly.bindTooltip(
                `<strong>Cono de Incertidumbre de Predicción</strong><br/><span style="font-size: 10px;">${ep.id} &middot; Modelo de Deriva Lagrangiano</span>`,
                { className: 'coastal-tooltip', sticky: true }
              );
              layerGroup.addLayer(uncertaintyPoly);
            } catch (err) {
              console.warn('Failed to add uncertainty envelope:', ep.id, err);
            }
          }
        }

        // (B) Predicted Trajectory Line & Waypoints
        if (layers.predictedTrajectory && Array.isArray(ep.trajectory)) {
          const validTrajectoryPoints: [number, number][] = [];

          ep.trajectory.forEach((pt, idx) => {
            if (
              !pt ||
              typeof pt.lat !== 'number' || isNaN(pt.lat) || !isFinite(pt.lat) ||
              typeof pt.lng !== 'number' || isNaN(pt.lng) || !isFinite(pt.lng)
            ) {
              return;
            }

            validTrajectoryPoints.push([pt.lat, pt.lng]);

            try {
              const ptHtml = `
                <div style="
                  width: ${idx === 0 ? '16px' : '12px'};
                  height: ${idx === 0 ? '16px' : '12px'};
                  border-radius: 50%;
                  background: ${idx === 0 ? '#fb7185' : '#1e293b'};
                  border: 2px solid #fb7185;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 8px;
                  font-family: monospace;
                  font-weight: bold;
                  box-shadow: 0 0 6px rgba(251,113,133,0.8);
                ">
                  ${idx === 0 ? '●' : ''}
                </div>
              `;
              const ptIcon = L.divIcon({
                html: ptHtml,
                className: 'trajectory-pt-icon',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });
              const ptMarker = L.marker([pt.lat, pt.lng], { icon: ptIcon });
              ptMarker.bindTooltip(
                `<strong>Trayectoria Estimada: ${pt.step || ''}</strong><br/>` +
                `Hora: ${pt.time || ''}<br/>` +
                `Radio de Incertidumbre: ±${pt.uncertaintyRadiusKm ?? 0} km<br/>` +
                `Corriente: ${pt.estimatedCurrent || ''}`,
                { className: 'coastal-tooltip' }
              );
              layerGroup.addLayer(ptMarker);
            } catch (err) {
              console.warn('Failed to add trajectory point:', ep.id, idx, err);
            }
          });

          if (validTrajectoryPoints.length > 1) {
            try {
              const polyline = L.polyline(validTrajectoryPoints, {
                color: '#fb7185', // rose
                weight: isSelected ? 3.5 : 2.5,
                dashArray: '6, 8',
                opacity: 0.9,
              });
              layerGroup.addLayer(polyline);
            } catch (err) {
              console.warn('Failed to add trajectory polyline:', ep.id, err);
            }
          }
        }

        // (C) Detected Anomaly Shape (ESRI Shapefile Polygons & MultiPolygons)
        if (layers.detectedAnomalies) {
          if (Array.isArray(ep.multiPolygons) && ep.multiPolygons.length > 0) {
            const validRings = ep.multiPolygons
              .map((ring) =>
                ring.filter(
                  (c) =>
                    Array.isArray(c) &&
                    c.length >= 2 &&
                    typeof c[0] === 'number' && !isNaN(c[0]) && isFinite(c[0]) &&
                    typeof c[1] === 'number' && !isNaN(c[1]) && isFinite(c[1])
                )
              )
              .filter((ring) => ring.length >= 3);

            if (validRings.length > 0) {
              try {
                const shapeLayer = L.polygon(validRings as any, {
                  color: isSelected ? '#38bdf8' : riskColor,
                  weight: isSelected ? 3.5 : 2,
                  fillColor: riskColor,
                  fillOpacity: isSelected ? 0.48 : 0.30,
                  dashArray: isSelected ? undefined : '4, 2',
                });

                shapeLayer.on('click', () => {
                  onSelectEpisode(ep);
                });

                shapeLayer.bindTooltip(
                  `<strong>${ep.id}</strong> (${ep.shpFile || 'SHP'})<br/>` +
                  `<b>${ep.name || ''}</b><br/>` +
                  `<b>Área Shapefile:</b> ${(ep.area ?? 0).toFixed(2)} km² (${ep.recordsCount || validRings.length} partes)<br/>` +
                  `<b>Riesgo:</b> ${ep.risk} (${((ep.modelProbability ?? 0) * 100).toFixed(0)}% prob.)<br/>` +
                  `<b>Clorofila-a:</b> ${ep.chlorophyll ?? 0} mg/m³ · <b>NDCI:</b> ${(ep.ndci ?? 0).toFixed(2)}<br/>` +
                  `<b>Distancia a Costa:</b> ${ep.distanceToCoast ?? 0} km`,
                  { className: 'coastal-tooltip', sticky: true }
                );

                layerGroup.addLayer(shapeLayer);
              } catch (err) {
                console.warn('Failed to add shapefile multipolygon:', ep.id, err);
              }
            }
          } else if (Array.isArray(ep.polygonCoordinates)) {
            const validAnomalyCoords = ep.polygonCoordinates.filter(
              (c) => Array.isArray(c) &&
                c.length >= 2 &&
                typeof c[0] === 'number' && !isNaN(c[0]) && isFinite(c[0]) &&
                typeof c[1] === 'number' && !isNaN(c[1]) && isFinite(c[1])
            );

            if (validAnomalyCoords.length >= 3) {
              try {
                const anomalyPolygon = L.polygon(validAnomalyCoords as [number, number][], {
                  color: isSelected ? '#38bdf8' : riskColor,
                  weight: isSelected ? 3.5 : 2,
                  fillColor: riskColor,
                  fillOpacity: isSelected ? 0.45 : 0.28,
                });

                anomalyPolygon.on('click', () => {
                  onSelectEpisode(ep);
                });

                anomalyPolygon.bindTooltip(
                  `<strong>${ep.id}</strong> - ${ep.name || ''}<br/>` +
                  `<b>Riesgo:</b> ${ep.risk} (${((ep.modelProbability ?? 0) * 100).toFixed(0)}% prob.)<br/>` +
                  `<b>Clorofila-a:</b> ${ep.chlorophyll ?? 0} mg/m³ · <b>NDCI:</b> ${(ep.ndci ?? 0).toFixed(2)}<br/>` +
                  `<b>Distancia a Costa:</b> ${ep.distanceToCoast ?? 0} km`,
                  { className: 'coastal-tooltip', sticky: true }
                );

                layerGroup.addLayer(anomalyPolygon);
              } catch (err) {
                console.warn('Failed to add anomaly polygon:', ep.id, err);
              }
            }
          }
        }

        // (D) Center Marker / Identifier Pin
        if (
          typeof ep.latitude === 'number' && !isNaN(ep.latitude) && isFinite(ep.latitude) &&
          typeof ep.longitude === 'number' && !isNaN(ep.longitude) && isFinite(ep.longitude)
        ) {
          try {
            const markerHtml = `
              <div style="
                display: flex;
                align-items: center;
                gap: 4px;
                background: rgba(15, 23, 42, 0.88);
                border: 1.5px solid ${riskColor};
                padding: 2px 6px;
                border-radius: 9999px;
                box-shadow: 0 0 10px ${riskColor}88;
                color: white;
                font-size: 10px;
                font-family: monospace;
                font-weight: bold;
                white-space: nowrap;
                cursor: pointer;
                transform: scale(${isSelected ? '1.15' : '1.0'});
                transition: transform 0.2s ease;
              ">
                <span style="
                  width: 7px;
                  height: 7px;
                  border-radius: 50%;
                  background: ${riskColor};
                  display: inline-block;
                "></span>
                <span>${ep.id}</span>
              </div>
            `;

            const divIcon = L.divIcon({
              html: markerHtml,
              className: 'custom-episode-marker',
              iconSize: [80, 24],
              iconAnchor: [40, 12],
            });

            const centerMarker = L.marker([ep.latitude, ep.longitude], { icon: divIcon });
            centerMarker.on('click', () => {
              onSelectEpisode(ep);
            });

            layerGroup.addLayer(centerMarker);
          } catch (err) {
            console.warn('Failed to add center marker:', ep.id, err);
          }
        }
      });
    }

    // 4. MÓDULO B — PLASTIC CANDIDATE POLYGONS (RESIDUOS Y ANOMALÍAS)
    if (Array.isArray(plasticCandidates) && (activeSection === 'plastics' || activeSection === 'overview')) {
      plasticCandidates.forEach((c) => {
        if (!c || !Array.isArray(c.coordinates) || c.coordinates.length < 3) return;
        const isSelected = selectedPlasticCandidate?.id === c.id;

        const strokeColor = 
          c.category === 'MICROPLASTICO_CONFIRMADO' ? '#10b981' :
          c.category === 'RESIDUO_VISIBLE' ? '#f59e0b' : '#06b6d4';

        try {
          const poly = L.polygon(c.coordinates as [number, number][], {
            color: isSelected ? '#ffffff' : strokeColor,
            weight: isSelected ? 3 : 2,
            fillColor: strokeColor,
            fillOpacity: isSelected ? 0.6 : 0.35,
            dashArray: c.category === 'ANOMALIA_SOSPECHOSA' ? '4, 3' : undefined,
          });

          poly.on('click', () => {
            if (onSelectPlasticCandidate) onSelectPlasticCandidate(c);
          });

          const categoryText = 
            c.category === 'MICROPLASTICO_CONFIRMADO' ? '● Microplástico Confirmado (FTIR/Raman)' :
            c.category === 'RESIDUO_VISIBLE' ? '● Residuo Plástico Visible' : '▲ Anomalía Espectral Sospechosa';

          poly.bindTooltip(`
            <div style="font-family: sans-serif; font-size: 11px; min-width: 200px; color: #0f172a; line-height: 1.4;">
              <div style="font-weight: bold; color: ${strokeColor}; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                ${c.name} (${c.id})
              </div>
              <div><b>Categoría:</b> ${categoryText}</div>
              <div><b>Superficie:</b> <span style="font-family: monospace; font-weight: bold;">${c.areaM2} m²</span> · Perímetro: ${c.perimeterM} m</div>
              <div><b>Índice FDI:</b> <span style="font-family: monospace;">${c.spectralIndices.fdi}</span> · <b>PI:</b> ${c.spectralIndices.pi}</div>
              <div><b>Método:</b> ${c.method}</div>
              ${c.fieldSample ? `
                <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #059669; font-weight: bold;">
                  ✓ Muestra: ${c.fieldSample.id} (${c.fieldSample.polymerType})
                </div>
              ` : `
                <div style="margin-top: 4px; font-size: 9.5px; color: #64748b; font-style: italic;">
                  Sin validación de laboratorio (Criterio científico)
                </div>
              `}
            </div>
          `, { className: 'coastal-tooltip', sticky: true });

          layerGroup.addLayer(poly);
        } catch (err) {
          console.warn('Failed to add plastic candidate polygon:', c.id, err);
        }
      });
    }

    // 5. MÓDULO C — CAMBIOS GEOMORFOLÓGICOS Y LÍNEAS DE COSTA (DSAS)
    if (Array.isArray(coastalSectors) && (activeSection === 'dynamics' || activeSection === 'overview')) {
      const activeSector = coastalSectors.find((s) => s.id === selectedSectorId) || coastalSectors[0];

      if (activeSector) {
        // (A) Baseline
        if (Array.isArray(activeSector.baselinePolyline) && activeSector.baselinePolyline.length > 1) {
          try {
            const baseline = L.polyline(activeSector.baselinePolyline as [number, number][], {
              color: '#0891b2',
              weight: 3.5,
              dashArray: '8, 6',
            });
            baseline.bindTooltip(`<strong>Línea Base en Tierra: ${activeSector.name}</strong>`, { className: 'coastal-tooltip' });
            layerGroup.addLayer(baseline);
          } catch (err) {
            console.warn('Failed to add baseline:', err);
          }
        }

        // (B) Historical Shorelines
        if (Array.isArray(activeSector.shorelines)) {
          activeSector.shorelines.forEach((shore) => {
            if (!shore.polyline || shore.polyline.length < 2) return;
            const shoreColor = shore.year === 2018 ? '#38bdf8' : shore.year === 2021 ? '#f59e0b' : '#10b981';

            try {
              const shorePolyline = L.polyline(shore.polyline as [number, number][], {
                color: shoreColor,
                weight: 2.5,
                opacity: 0.9,
              });
              shorePolyline.bindTooltip(`
                <strong>Línea de Costa ${shore.year} (${shore.campaignName})</strong><br/>
                Indicador: ${shore.proxyType} · Marea: +${shore.tideHeightM}m<br/>
                Incertidumbre posicional: ±${shore.geoUncertaintyM}m
              `, { className: 'coastal-tooltip' });
              layerGroup.addLayer(shorePolyline);
            } catch (err) {
              console.warn('Failed to add shoreline:', shore.id, err);
            }
          });
        }

        // (C) Perpendicular DSAS Transects
        if (Array.isArray(activeSector.transects)) {
          activeSector.transects.forEach((tr) => {
            if (!tr.origin || !tr.end) return;
            const isSelected = selectedTransectId === tr.id;

            const trColor = 
              tr.classification === 'EROSION_SEVERA' ? '#f43f5e' :
              tr.classification === 'EROSION_MODERADA' ? '#f59e0b' :
              tr.classification === 'AVANCE_ACRECION' ? '#10b981' :
              tr.classification === 'ESTABLE' ? '#94a3b8' : '#a855f7';

            try {
              const trLine = L.polyline([tr.origin, tr.end], {
                color: isSelected ? '#ffffff' : trColor,
                weight: isSelected ? 4 : 2.5,
                opacity: 0.95,
              });

              trLine.on('click', () => {
                if (onSelectTransect) onSelectTransect(tr);
              });

              trLine.bindTooltip(`
                <div style="font-family: sans-serif; font-size: 11px; min-width: 210px; color: #0f172a;">
                  <div style="font-weight: bold; color: ${trColor}; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                    Transecto ${tr.id} (Nº ${tr.transectNumber})
                  </div>
                  ${tr.classification === 'ANALISIS_NO_DISPONIBLE' ? `
                    <div style="color: #64748b; font-style: italic;">Análisis No Disponible: Faltan datos batimétricos</div>
                  ` : `
                    <div><b>Tasa EPR:</b> <span style="font-family: monospace; font-weight: bold; color: ${tr.eprRateMYear < 0 ? '#e11d48' : '#059669'};">${tr.eprRateMYear > 0 ? '+' : ''}${tr.eprRateMYear} m/año</span></div>
                    <div><b>Desplazamiento Neto (NSM):</b> <span style="font-family: monospace;">${tr.nsmDistanceM > 0 ? '+' : ''}${tr.nsmDistanceM} m</span></div>
                    <div><b>Incertidumbre:</b> ±${tr.uncertaintyMarginM} m (marea + oleaje)</div>
                  `}
                  <div style="font-size: 9.5px; color: #64748b; margin-top: 3px;">
                    Longitud: ${tr.lengthM}m · Azimut: ${tr.azimuthDeg}°
                  </div>
                </div>
              `, { className: 'coastal-tooltip', sticky: true });

              layerGroup.addLayer(trLine);
            } catch (err) {
              console.warn('Failed to add transect:', tr.id, err);
            }
          });
        }
      }
    }

    // 6. IMPORTED USER LAYERS (GeoJSON / CSV)
    if (Array.isArray(importedLayers)) {
      importedLayers.forEach((impLayer) => {
        if (!impLayer.visible || !Array.isArray(impLayer.features)) return;

        impLayer.features.forEach((feat) => {
          if (!feat.geometry) return;
          try {
            if (feat.type === 'Point' && Array.isArray(feat.coordinates)) {
              const [lng, lat] = feat.coordinates;
              const marker = L.circleMarker([lat, lng], {
                radius: 6,
                color: impLayer.color,
                fillColor: impLayer.color,
                fillOpacity: 0.8,
              });
              marker.bindTooltip(`<strong>${impLayer.name}</strong><br/>${JSON.stringify(feat.properties)}`, { className: 'coastal-tooltip' });
              layerGroup.addLayer(marker);
            } else if (feat.type === 'Polygon' && Array.isArray(feat.coordinates)) {
              const rings = feat.coordinates.map((ring: any) =>
                ring.map((pt: any) => [pt[1], pt[0]])
              );
              const poly = L.polygon(rings, {
                color: impLayer.color,
                fillColor: impLayer.color,
                fillOpacity: 0.25,
                weight: 2,
              });
              poly.bindTooltip(`<strong>${impLayer.name}</strong>`, { className: 'coastal-tooltip' });
              layerGroup.addLayer(poly);
            }
          } catch (err) {
            console.warn('Failed to render imported feature:', err);
          }
        });
      });
    }
  }, [
    episodes, 
    selectedEpisode, 
    layers, 
    oceanVectors, 
    oceanBuoys, 
    activeSection, 
    plasticCandidates, 
    selectedPlasticCandidate, 
    coastalSectors, 
    selectedSectorId, 
    selectedTransectId, 
    importedLayers
  ]);

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    const region = REGION_COORDINATES[selectedIsland] || REGION_COORDINATES['Canarias'];
    if (
      region &&
      Array.isArray(region.center) &&
      typeof region.center[0] === 'number' && !isNaN(region.center[0]) && isFinite(region.center[0]) &&
      typeof region.center[1] === 'number' && !isNaN(region.center[1]) && isFinite(region.center[1])
    ) {
      try {
        mapInstanceRef.current?.setView(region.center, region.zoom || 8, { animate: true });
      } catch (err) {
        console.warn('Map reset view error:', err);
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* Map DOM Canvas */}
      <div id="map-container" ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Basemap Switcher Control */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
        <button
          id="btn-basemap-selector"
          onClick={() => setShowBasemapMenu(!showBasemapMenu)}
          className="bg-slate-900/95 hover:bg-slate-800 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md transition"
          title="Cambiar mapa base"
        >
          <MapIcon className="w-4 h-4 text-cyan-400" />
          <span className="capitalize">
            {currentBasemap === 'satellite' ? 'Satélite Esri' :
             currentBasemap === 'pnoa' ? 'PNOA Canarias' :
             currentBasemap === 'nautical' ? 'Ocean Náutico' :
             currentBasemap === 'dark' ? 'Nocturno Dark' :
             currentBasemap === 'osm' ? 'OpenStreetMap' :
             currentBasemap === 'mapbox' ? 'Mapbox' : 'MapTiler'}
          </span>
        </button>

        {showBasemapMenu && (
          <div className="mt-1.5 bg-slate-950/95 border border-slate-700 rounded-lg p-2 shadow-2xl space-y-1 text-xs backdrop-blur-md w-56">
            <div className="px-2 py-1 text-[10px] uppercase font-mono text-slate-400 font-bold border-b border-slate-800 flex items-center justify-between">
              <span>Capas Abiertas</span>
              <span className="text-emerald-400 text-[9px]">Sin API Key</span>
            </div>
            <button
              onClick={() => {
                updateBasemap('satellite');
                setShowBasemapMenu(false);
              }}
              className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                currentBasemap === 'satellite' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🛰️ Esri World Satélite</span>
              <span className="text-[9px] text-emerald-400 font-mono">Recomendado</span>
            </button>
            <button
              onClick={() => {
                updateBasemap('pnoa');
                setShowBasemapMenu(false);
              }}
              className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                currentBasemap === 'pnoa' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🏝️ PNOA Ortofoto (IGN)</span>
              <span className="text-[9px] text-emerald-400 font-mono">25cm/px</span>
            </button>
            <button
              onClick={() => {
                updateBasemap('nautical');
                setShowBasemapMenu(false);
              }}
              className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                currentBasemap === 'nautical' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>⚓ Esri Ocean Náutico</span>
              <span className="text-[9px] text-emerald-400 font-mono">Libre</span>
            </button>
            <button
              onClick={() => {
                updateBasemap('dark');
                setShowBasemapMenu(false);
              }}
              className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                currentBasemap === 'dark' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🌙 Esri Dark Nocturno</span>
              <span className="text-[9px] text-emerald-400 font-mono">Libre</span>
            </button>
            <button
              onClick={() => {
                updateBasemap('osm');
                setShowBasemapMenu(false);
              }}
              className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                currentBasemap === 'osm' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🗺️ OpenStreetMap</span>
              <span className="text-[9px] text-emerald-400 font-mono">Libre</span>
            </button>

            <div className="px-2 pt-2 pb-0.5 text-[10px] uppercase font-mono text-slate-400 font-bold border-t border-slate-800 flex items-center justify-between">
              <span>Proveedores Opcionales</span>
              <span className="text-slate-500 text-[9px]">Token/Key</span>
            </div>
            <button
              onClick={() => {
                updateBasemap('mapbox');
                setShowBasemapMenu(false);
              }}
              className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                currentBasemap === 'mapbox' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🌐 Mapbox Satélite</span>
              <span className="text-[9px] font-mono text-cyan-400">
                {getMapboxToken() ? 'Activo' : 'Fallback libre'}
              </span>
            </button>
            <button
              onClick={() => {
                updateBasemap('maptiler');
                setShowBasemapMenu(false);
              }}
              className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                currentBasemap === 'maptiler' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🌊 MapTiler Híbrido</span>
              <span className="text-[9px] font-mono text-cyan-400">
                {getMaptilerKey() ? 'Activo' : 'Fallback libre'}
              </span>
            </button>

            <div className="px-2 py-1.5 mt-1 rounded bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
              <span className="text-emerald-400 font-semibold block">✓ Sin marcas de agua:</span>
              Leaflet y las capas principales (Esri World y PNOA Canarias) operan al 100% abiertas sin requerir clave.
            </div>
          </div>
        )}
      </div>

      {/* Floating Zoom & Compass Controls */}
      <div className="absolute right-4 bottom-28 z-20 flex flex-col gap-1.5">
        <button
          id="btn-map-zoom-in"
          onClick={handleZoomIn}
          className="w-9 h-9 bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg border border-slate-700 shadow-xl flex items-center justify-center transition"
          title="Acercar zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-map-zoom-out"
          onClick={handleZoomOut}
          className="w-9 h-9 bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg border border-slate-700 shadow-xl flex items-center justify-center transition"
          title="Alejar zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-map-reset-view"
          onClick={handleResetView}
          className="w-9 h-9 bg-slate-900/90 hover:bg-slate-800 text-cyan-400 rounded-lg border border-slate-700 shadow-xl flex items-center justify-center transition"
          title="Centrar en archipiélago"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Coordinates & Geodetic HUD (Bottom-Left) */}
      <div className="absolute left-4 bottom-4 z-20 hidden sm:flex items-center gap-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-300 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">WGS84:</span>
          <span className="text-cyan-300 font-bold">
            {mouseCoords 
              ? `${mouseCoords.lat.toFixed(4)}°N, ${Math.abs(mouseCoords.lng).toFixed(4)}°W`
              : '28.2500°N, 16.5000°W'}
          </span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">UTM 28N:</span>
          <span className="text-slate-200">
            {mouseCoords
              ? `X: ${Math.round(500000 + 0.9996 * 6378137 * (mouseCoords.lng * Math.PI / 180 + 15 * Math.PI / 180) * Math.cos(mouseCoords.lat * Math.PI / 180)).toLocaleString()} m`
              : 'X: 352,410 m'}
          </span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="text-slate-500">
          Escala visual 1:25.000
        </div>
      </div>
    </div>
  );
};
