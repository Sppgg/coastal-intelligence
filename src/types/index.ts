export type EpisodeStatus = 
  | 'OBSERVACIÓN' 
  | 'ANOMALÍA' 
  | 'EN INVESTIGACIÓN' 
  | 'VALIDADO' 
  | 'DESCARTADO';

export type RiskLevel = 'Bajo' | 'Moderado' | 'Alto' | 'Muy alto';

export type GroundTruthStatus = 
  | 'Pendiente' 
  | 'En evaluación' 
  | 'Validado' 
  | 'Descartado';

export type IslandRegion = 'Canarias' | 'Tenerife' | 'La Palma' | 'La Gomera' | 'Gran Canaria';

export interface TrajectoryPoint {
  step: 'T0' | '+6 h' | '+12 h' | '+24 h' | '+48 h';
  time: string;
  lat: number;
  lng: number;
  uncertaintyRadiusKm: number;
  estimatedCurrent: string;
  note?: string;
}

export interface CoastalEpisode {
  id: string;
  name: string;
  description?: string;
  island: 'Tenerife' | 'La Palma' | 'La Gomera' | 'Gran Canaria' | 'Canarias';
  shpFile?: string;
  recordsCount?: number;
  totalVertices?: number;
  bbox?: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
  multiPolygons?: [number, number][][]; // All real polygon rings in [lat, lng] format from ESRI Shapefiles
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  area: number; // km²
  ndci: number; // Normalized Difference Chlorophyll Index
  chlorophyll: number; // mg/m³
  sst: number; // Sea Surface Temp °C
  turbidity: number; // NTU
  windSpeed: number; // nudos (knots)
  windDirection: string; // e.g. "NE"
  windHeadingDeg: number;
  currentSpeed: number; // m/s
  currentDirection: string; // e.g. "SW"
  currentHeadingDeg: number;
  distanceToCoast: number; // km
  nearestCoastPoint: string; // e.g. "Costa de Adeje - La Caleta"
  modelProbability: number; // 0 - 1 (e.g. 0.81)
  modelConfidence: number; // 0 - 1 (e.g. 0.92)
  risk: RiskLevel;
  status: EpisodeStatus;
  groundTruthStatus: GroundTruthStatus;
  dataSource: string;
  spectralBands: string;
  groundTruthDetails?: {
    assignedUnit?: string;
    sampleId?: string;
    samplingDate?: string;
    identifiedOrganism?: string; // e.g. "Trichodesmium erythraeum / microalgas planctónicas (pendiente análisis taxonómico)"
    notes?: string;
  };
  // Copernicus Marine & CDS Real Physical/Chemical Variables
  thetao: number; // CMEMS Sea Surface Temperature °C (depth: 0.494m)
  uo: number; // CMEMS Eastward velocity component m/s
  vo: number; // CMEMS Northward velocity component m/s
  u10: number; // ERA5 10m U wind component m/s
  v10: number; // ERA5 10m V wind component m/s
  fe: number; // CMEMS Dissolved Iron (µmol/m³ / depth: 0.506m)
  wo: number; // CMEMS Vertical Water Velocity (10⁻⁵ m/s / depth: 0.494m)
  dustAod550: number; // CAMS Saharan Dust Aerosol Optical Depth 550nm
  pm10: number; // CAMS PM10 µg/m³
  pm25: number; // CAMS PM2.5 µg/m³
  pm1: number; // CAMS PM1 µg/m³
  copernicusDatasetId: string; // e.g. "cmems_mod_glo_phy_my_0.083deg_P1D-m"
  era5DatasetId: string; // "reanalysis-era5-single-levels"
  camsDatasetId: string; // "cams-global-reanalysis-eac4"
  apiPythonSnippet?: string; // Reproducible Python script from PDF
  polygonCoordinates: [number, number][]; // [lat, lng] vertices forming the anomaly shape
  trajectory: TrajectoryPoint[];
  uncertaintyEnvelope: [number, number][]; // [lat, lng] polygon for prediction uncertainty
  historyByDate?: Record<string, Partial<CoastalEpisode>>;
}

export interface LayerSettings {
  // Satélite óptico
  sentinel2: boolean;
  sentinel3: boolean;
  // Copernicus Marine & CAMS / ERA5 (Datos reales del PDF)
  copernicusSst: boolean; // thetao
  copernicusCurrents: boolean; // uo, vo
  copernicusIron: boolean; // fe
  copernicusUpwelling: boolean; // wo
  camsDust: boolean; // dust_aerosol_optical_depth_550nm
  era5Wind: boolean; // 10m_u & 10m_v wind
  // Variables derivadas & índices
  chlorophyll: boolean;
  sst: boolean;
  turbidity: boolean;
  // Análisis
  ndci: boolean;
  detectedAnomalies: boolean;
  // Sensores Oceanográficos Oficiales Físicos (Puertos del Estado / AEMET)
  oceanBuoys: boolean;
  // Predicción de Deriva
  predictedTrajectory: boolean;
  potentialImpactZone: boolean;
  currentVectors: boolean;
}

export interface OceanBuoy {
  id: string;
  name: string;
  network: string; // 'Red de Boyas Costeras (Puertos del Estado / AEMET)' | 'Red Exterior de Boyas de Aguas Profundas'
  lat: number;
  lng: number;
  sst: number; // Temperatura superficial (°C)
  waveHeightM: number; // Altura significante de oleaje (m)
  wavePeriodS: number; // Periodo de pico de oleaje (s)
  windKnots: number; // Viento medio (nudos)
  windDirection: string; // e.g. "NE"
  surfaceCurrentMs: number; // Corriente superficial (m/s)
  currentDirection: string; // e.g. "SW"
  status: 'OPERATIVO' | 'EN MANTENIMIENTO';
  lastSync: string;
}

export interface CoastalAlert {
  id: string;
  timestamp: string;
  priority: 'ALTA' | 'MODERADA' | 'INFORMATIVA';
  title: string;
  description: string;
  episodeId: string;
  targetCoast: string;
  recommendedAction: string;
  active: boolean;
}

export interface SystemMetrics {
  activeEpisodes: number;
  detectedAnomalies: number;
  inValidation: number;
  activeAlerts: number;
  lastUpdate: string;
  satellitePasses: string;
  sensorNetworkStatus: 'OPERATIVO' | 'DEGRADADO' | 'CALIBRANDO';
}

export type StatisticalVariableKey = 
  | 'thetao'
  | 'fe'
  | 'wo'
  | 'dustAod550'
  | 'pm10'
  | 'windSpeed'
  | 'ndci' 
  | 'chlorophyll' 
  | 'sst' 
  | 'turbidity' 
  | 'modelProbability' 
  | 'distanceToCoast' 
  | 'area';

export interface StatisticalVariableMeta {
  key: StatisticalVariableKey;
  label: string;
  shortName: string;
  unit: string;
  formatValue: (val: number) => string;
  description: string;
}

export interface StatisticalSummary {
  variableKey: StatisticalVariableKey;
  title: string;
  unit: string;
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
}

export interface HistogramBin {
  binIndex: number;
  rangeLabel: string;
  min: number;
  max: number;
  mid: number;
  count: number;
  percentage: number;
}

export type BinsOption = 'auto' | 10 | 20 | 30;

export type DateFilterMode = 'single' | 'range';

export interface TemporalFilter {
  mode: DateFilterMode;
  date: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface RasterQuery {
  layer: string;
  geometry?: [number, number][];
  date?: string;
}

// ==========================================
// SECCIONES DE NAVEGACIÓN INSTITUCIONAL
// ==========================================
export type AppSection = 
  | 'overview'       // 01 — Visión general
  | 'marine'         // 02 — Monitorización marina (Módulo A)
  | 'plastics'       // 03 — Residuos plásticos (Módulo B)
  | 'dynamics'       // 04 — Dinámica litoral (Módulo C)
  | 'datasets'       // 05 — Capas y datasets
  | 'analysis'       // 06 — Análisis y resultados
  | 'settings';      // 07 — Configuración y servicios

// ==========================================
// MÓDULO B — DETECCIÓN Y ANÁLISIS DE RESIDUOS PLÁSTICOS
// ==========================================

export type PlasticDetectionCategory = 
  | 'RESIDUO_VISIBLE'        // Objetos potencialmente reconocibles a la resolución disponible
  | 'ANOMALIA_SOSPECHOSA'    // Regiones que requieren investigación espectral/espacial adicional
  | 'MICROPLASTICO_CONFIRMADO'; // ÚNICAMENTE con muestras y análisis de laboratorio acreditados

export type PlasticSegmentationMethod = 
  | 'SIG_CONVENCIONAL'  // Nivel 1: Umbrales, índices FDI/PI, morfología ráster
  | 'MACHINE_LEARNING'  // Nivel 2: Random Forest, firmas espectrales
  | 'DEEP_LEARNING';    // Nivel 3: Segmentación semántica U-Net / MARIDA pre-entrenado

export type LabValidationStatus = 
  | 'VALIDADO_LABORATORIO' 
  | 'PENDIENTE' 
  | 'NO_CONCLUYENTE' 
  | 'DESCARTADO';

export interface FieldSampleRecord {
  id: string;
  samplingDate: string;
  sampleCoordinates: [number, number]; // [lat, lng]
  labMethod: 'Micro-FTIR' | 'Micro-Raman' | 'Pirólisis-GCMS';
  polymerType: 'Polietileno (PE)' | 'Polipropileno (PP)' | 'Poliestireno (PS)' | 'PET' | 'PVC' | 'Mezcla / Fibras sintéticas';
  concentration: number;
  concentrationUnit: 'mg/kg sedimento' | 'partículas/m²' | 'ítems/100m transecto';
  sizeFraction: '1 - 5 mm (Microplástico)' | '< 1 mm' | '5 - 25 mm (Mesoplástico)' | '> 25 mm (Macroplástico)';
  labResponsible: string; // e.g. "Inst. Univ. ECOAQUA / Grupo EOMAR"
  labNotes: string;
  validationStatus: LabValidationStatus;
  certificateRef?: string;
}

export interface PlasticCandidatePolygon {
  id: string;
  zoneId: string;
  name: string;
  coordinates: [number, number][]; // [lat, lng] vertices
  areaM2: number;
  perimeterM: number;
  centroid: [number, number];
  category: PlasticDetectionCategory;
  method: PlasticSegmentationMethod;
  confidenceScore?: number; // 0-1 (solo si calibrado)
  spectralIndices: {
    fdi: number; // Floating Debris Index (Biermann et al.)
    pi: number;  // Plastic Index (Themistocleous et al.)
    ndwi: number; // Normalized Difference Water Index
    ndvi?: number;
  };
  detectionDate: string;
  sensor: string; // e.g. "UAV RGB 2cm" | "Sentinel-2 MSI 10m"
  resolutionM: number;
  fieldSample?: FieldSampleRecord;
  status: 'CANDIDATO' | 'CONFIRMADO' | 'DESCARTADO';
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface PlasticStudyZone {
  id: string;
  name: string;
  island: IslandRegion;
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
  description: string;
  sensorResolution: string;
  recentFlightDate: string;
  coastalType: 'Playa arenosa' | 'Caleta rocosa' | 'Litoral mixto' | 'Zona de acumulación por corriente';
  hydrodynamicNotes: string;
  candidatesCount: number;
  orthomosaicUrl?: string;
}

// ==========================================
// MÓDULO C — CAMBIOS GEOMORFOLÓGICOS Y RETROCESO DE LA LÍNEA DE COSTA
// ==========================================

export type ShorelineProxyType = 
  | 'HWL'                // High Water Line (pleamar astronómica media)
  | 'PIE_ACANTILADO'     // Base morfológica del acantilado
  | 'VEGETACION'         // Borde de vegetación dunar / terrestre
  | 'LINEA_INSTANTANEA'; // Línea instantánea de agua (requiere corrección de marea)

export interface ShorelineObservation {
  id: string;
  date: string;
  year: number;
  campaignName: string;
  provider: 'GRAFCAN' | 'PNOA' | 'UAV Teledetección Azul' | 'Sentinel-2';
  proxyType: ShorelineProxyType;
  tideHeightM: number;     // Altura de marea astronómica (m s.n.m.)
  waveRunupM: number;      // Runup de oleaje modelizado (m)
  geoUncertaintyM: number; // Incertidumbre de georreferenciación (m)
  polyline: [number, number][]; // Coordenadas [lat, lng] de la línea
  crs: string;             // e.g. "RECAN95 / UTM zone 28N (EPSG:32628)"
}

export type TransectClassification = 
  | 'EROSION_SEVERA'     // Retroceso > 1.5 m/año
  | 'EROSION_MODERADA'   // Retroceso entre 0.3 y 1.5 m/año
  | 'ESTABLE'            // Cambio entre -0.3 y +0.3 m/año
  | 'AVANCE_ACRECION'    // Avance > 0.3 m/año
  | 'ANALISIS_NO_DISPONIBLE'; // Faltan datos oceanográficos/topográficos esenciales

export interface TransectRecord {
  id: string;
  sectorId: string;
  transectNumber: number;
  origin: [number, number]; // [lat, lng] en la línea base en tierra
  end: [number, number];    // [lat, lng] hacia el mar
  lengthM: number;
  azimuthDeg: number;
  eprRateMYear: number;      // End Point Rate (m/año)
  nsmDistanceM: number;      // Net Shoreline Movement (m)
  lrrRateMYear?: number;     // Linear Regression Rate (m/año)
  sceM?: number;             // Shoreline Change Envelope (m)
  uncertaintyMarginM: number; // ± sigma considerando marea, oleaje y resolución
  classification: TransectClassification;
  missingDataNotes?: string; // Explicación técnica cuando 'ANALISIS_NO_DISPONIBLE'
}

export interface CoastalSector {
  id: string;
  name: string;
  island: IslandRegion;
  center: [number, number];
  zoom: number;
  description: string;
  baselinePolyline: [number, number][];
  transects: TransectRecord[];
  shorelines: ShorelineObservation[];
  sedimentBudgetM2: {
    gainM2: number;
    lossM2: number;
    netM2: number;
    timeSpanYears: number;
  };
  historicalCampaigns: {
    id: string;
    name: string;
    date: string;
    provider: string;
    resGsdCm: number;
  }[];
  hasDemComparison: boolean;
  elevationDiffMeanM?: number;
  geomorphologyType: 'Playa de arena volcánica' | 'Cordón de dunas' | 'Frente acantilado' | 'Plataforma rocosa de abrasión';
}

// ==========================================
// MÓDULO 05 — CATÁLOGO DE DATASETS Y TRAZABILIDAD
// ==========================================

export type ProjectProvenance = 
  | 'Coastal Guardian RIS3'
  | 'Teledetección Azul'
  | 'ECOMARIS'
  | 'GRAFCAN'
  | 'Copernicus CMEMS'
  | 'Copernicus CDS / CAMS'
  | 'AEMET / Puertos del Estado';

export interface DatasetSourceItem {
  id: string;
  name: string;
  project: ProjectProvenance;
  category: 'Satelital' | 'In Situ / Boyas' | 'UAV / Ortomosaicos' | 'Vectores / Modelos' | 'Líneas de Costa' | 'Muestreos de Campo';
  crs: string; // e.g. "EPSG:4326 (WGS84)" o "EPSG:32628 (UTM 28N)"
  spatialResolution: string; // e.g. "10 m", "2 cm", "0.083°"
  temporalCoverage: string;
  format: 'GeoJSON' | 'Shapefile (.shp)' | 'NetCDF' | 'GeoTIFF' | 'CSV / Tabular';
  license: string;
  version: string;
  validationStatus: 'Oficial' | 'Científico Verificado' | 'En Validación' | 'Datos Demostración';
  recordsCount?: number;
  attribution: string;
  description: string;
  downloadUrl?: string;
  pythonSnippet?: string;
}

// ==========================================
// MÓDULO 07 — CADENA DE PROCESAMIENTO PYTHON
// ==========================================

export type PipelineStep = 
  | 'INGESTA' 
  | 'VALIDACION' 
  | 'NORMALIZACION' 
  | 'GEOREFERENCIACION' 
  | 'CONTROL_DUPLICADOS' 
  | 'ENRIQUECIMIENTO' 
  | 'EXPORTACION' 
  | 'PUBLICACION';

export interface PythonPipelineTask {
  id: string;
  name: string;
  step: PipelineStep;
  status: 'COMPLETADO' | 'EN_EJECUCION' | 'PENDIENTE' | 'ERROR';
  timestamp: string;
  inputDataset: string;
  outputDataset: string;
  scriptFile: string;
  recordsProcessed: number;
  durationMs: number;
  params: Record<string, any>;
  notes?: string;
}


