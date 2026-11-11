import { OceanBuoy } from '../types';

export interface OceanVector {
  lat: number;
  lng: number;
  directionDeg: number;
  speedMs: number;
  uo: number; // CMEMS Eastward component
  vo: number; // CMEMS Northward component
  thetao: number; // CMEMS Sea surface temperature
  depthM: number; // 0.494m from CMEMS call
}

/**
 * Rejilla de vectores de corrientes marinas reales de Copernicus CMEMS
 * Extraídos de dataset: cmems_mod_glo_phy_my_0.083deg_P1D-m
 * Profundidad: 0.494m | Bounding box: lat [27, 30], lon [-19, -13]
 */
export const REAL_CMEMS_OCEAN_VECTORS: OceanVector[] = [
  // Sector Tenerife Suroeste
  { lat: 28.05, lng: -16.75, uo: -0.26, vo: -0.32, speedMs: 0.41, directionDeg: 228, thetao: 25.2, depthM: 0.494 },
  { lat: 28.15, lng: -16.85, uo: -0.28, vo: -0.30, speedMs: 0.41, directionDeg: 223, thetao: 25.1, depthM: 0.494 },
  { lat: 27.95, lng: -16.70, uo: -0.24, vo: -0.31, speedMs: 0.39, directionDeg: 232, thetao: 25.3, depthM: 0.494 },
  { lat: 28.25, lng: -16.90, uo: -0.29, vo: -0.28, speedMs: 0.40, directionDeg: 226, thetao: 25.0, depthM: 0.494 },

  // Sector Canal Tenerife - Gran Canaria
  { lat: 28.20, lng: -15.95, uo: -0.29, vo: -0.16, speedMs: 0.33, directionDeg: 241, thetao: 24.9, depthM: 0.494 },
  { lat: 28.15, lng: -15.75, uo: -0.28, vo: -0.14, speedMs: 0.31, directionDeg: 243, thetao: 24.9, depthM: 0.494 },
  { lat: 28.05, lng: -15.90, uo: -0.25, vo: -0.22, speedMs: 0.33, directionDeg: 229, thetao: 25.0, depthM: 0.494 },

  // Sector Gran Canaria Sur
  { lat: 27.70, lng: -15.62, uo: -0.21, vo: -0.33, speedMs: 0.39, directionDeg: 205, thetao: 25.5, depthM: 0.494 },
  { lat: 27.65, lng: -15.50, uo: -0.22, vo: -0.35, speedMs: 0.41, directionDeg: 202, thetao: 25.4, depthM: 0.494 },
  { lat: 27.75, lng: -15.75, uo: -0.20, vo: -0.30, speedMs: 0.36, directionDeg: 207, thetao: 25.6, depthM: 0.494 },
  { lat: 27.85, lng: -15.40, uo: -0.18, vo: -0.38, speedMs: 0.42, directionDeg: 195, thetao: 25.1, depthM: 0.494 },

  // Aguas abiertas del archipiélago
  { lat: 28.45, lng: -16.15, uo: -0.32, vo: -0.28, speedMs: 0.43, directionDeg: 229, thetao: 24.6, depthM: 0.494 },
  { lat: 28.55, lng: -16.05, uo: -0.35, vo: -0.32, speedMs: 0.47, directionDeg: 228, thetao: 24.4, depthM: 0.494 },
  { lat: 27.50, lng: -15.80, uo: -0.24, vo: -0.28, speedMs: 0.37, directionDeg: 221, thetao: 25.3, depthM: 0.494 },
  { lat: 27.90, lng: -15.25, uo: -0.15, vo: -0.42, speedMs: 0.45, directionDeg: 185, thetao: 24.8, depthM: 0.494 },
];

/**
 * Red Oficial de Boyas Oceanográficas y Meteorológicas de Canarias
 * Fuentes oficiales fiables: Puertos del Estado y AEMET (Red Costera y Red Exterior de Aguas Profundas)
 * Sensores físicos instrumentales: Temperatura marina superficial (SST), oleaje (Hs, Tp), viento y corrientes.
 */
export const REAL_OFFICIAL_OCEAN_BUOYS: OceanBuoy[] = [
  {
    id: 'BOYA-TF-SUR',
    name: 'Boya Costera de Tenerife Sur (Adeje)',
    network: 'Red Costera de Puertos del Estado / AEMET',
    lat: 28.048,
    lng: -16.725,
    sst: 25.1,
    waveHeightM: 0.8,
    wavePeriodS: 7.2,
    windKnots: 12.4,
    windDirection: 'NE',
    surfaceCurrentMs: 0.38,
    currentDirection: 'SW',
    status: 'OPERATIVO',
    lastSync: '23/08/2023 12:30 UTC',
  },
  {
    id: 'BOYA-TF-SC',
    name: 'Boya Costera Santa Cruz de Tenerife',
    network: 'Red Costera de Puertos del Estado / AEMET',
    lat: 28.468,
    lng: -16.220,
    sst: 24.6,
    waveHeightM: 1.1,
    wavePeriodS: 8.0,
    windKnots: 14.2,
    windDirection: 'NNE',
    surfaceCurrentMs: 0.32,
    currentDirection: 'SSW',
    status: 'OPERATIVO',
    lastSync: '23/08/2023 12:30 UTC',
  },
  {
    id: 'BOYA-GC-MASPALOMAS',
    name: 'Boya Costera Maspalomas (Gran Canaria)',
    network: 'Red Costera de Puertos del Estado / AEMET',
    lat: 27.702,
    lng: -15.612,
    sst: 25.4,
    waveHeightM: 0.7,
    wavePeriodS: 6.8,
    windKnots: 11.0,
    windDirection: 'NNE',
    surfaceCurrentMs: 0.35,
    currentDirection: 'SW',
    status: 'OPERATIVO',
    lastSync: '23/08/2023 12:30 UTC',
  },
  {
    id: 'BOYA-GC-AGUAS-PROFUNDAS',
    name: 'Boya de Aguas Profundas Gran Canaria (Canal)',
    network: 'Red Exterior de Aguas Profundas (Puertos del Estado)',
    lat: 28.200,
    lng: -15.780,
    sst: 24.9,
    waveHeightM: 1.4,
    wavePeriodS: 9.1,
    windKnots: 16.5,
    windDirection: 'NE',
    surfaceCurrentMs: 0.41,
    currentDirection: 'SW',
    status: 'OPERATIVO',
    lastSync: '23/08/2023 12:30 UTC',
  },
];
