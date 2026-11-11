import { CoastalEpisode, CoastalAlert, SystemMetrics, TemporalFilter, OceanBuoy } from '../types';
import { REAL_COPERNICUS_EPISODES } from '../data/episodes';
import { REAL_COPERNICUS_ALERTS } from '../data/alerts';
import { REAL_CMEMS_OCEAN_VECTORS, REAL_OFFICIAL_OCEAN_BUOYS, OceanVector } from '../data/layers';

/**
 * Coastal Guardian Service Layer
 * Consumes strictly real Copernicus Marine Service (CMEMS), Copernicus Climate Data Store (CDS/ERA5),
 * and CAMS Atmospheric Reanalysis datasets.
 */
class CoastalService {
  private episodes: CoastalEpisode[] = [...REAL_COPERNICUS_EPISODES];
  private alerts: CoastalAlert[] = [...REAL_COPERNICUS_ALERTS];

  // Fetch episodes with temporal filter (single date or range) and island filtering
  async getEpisodes(
    temporalFilter: TemporalFilter | string = '2023-08-23', 
    islandFilter: string = 'Canarias'
  ): Promise<CoastalEpisode[]> {
    const filter: TemporalFilter = typeof temporalFilter === 'string'
      ? { mode: 'single', date: temporalFilter, startDate: temporalFilter, endDate: temporalFilter }
      : temporalFilter;

    return new Promise((resolve) => {
      setTimeout(() => {
        let result: CoastalEpisode[] = [];

        if (filter.mode === 'single') {
          const selectedDate = filter.date || '2023-08-23';
          const selectedYearMonth = selectedDate.substring(0, 7);
          result = this.episodes
            .filter((ep) => {
              if (ep.date === selectedDate) return true;
              if (ep.historyByDate && Boolean(ep.historyByDate[selectedDate])) return true;
              return false;
            })
            .map((ep) => {
              // If a date snapshot exists in historyByDate, project attributes
              if (ep.historyByDate && ep.historyByDate[selectedDate]) {
                const snap = ep.historyByDate[selectedDate];
                const safeLat = (typeof snap.latitude === 'number' && !isNaN(snap.latitude) && isFinite(snap.latitude))
                  ? snap.latitude
                  : ep.latitude;
                const safeLng = (typeof snap.longitude === 'number' && !isNaN(snap.longitude) && isFinite(snap.longitude))
                  ? snap.longitude
                  : ep.longitude;
                return {
                  ...ep,
                  date: selectedDate,
                  latitude: safeLat,
                  longitude: safeLng,
                  area: snap.area ?? ep.area,
                  chlorophyll: snap.chlorophyll ?? ep.chlorophyll,
                  ndci: snap.ndci ?? ep.ndci,
                  sst: snap.sst ?? ep.sst,
                  thetao: snap.thetao ?? ep.thetao,
                  dustAod550: snap.dustAod550 ?? ep.dustAod550,
                  distanceToCoast: snap.distanceToCoast ?? ep.distanceToCoast,
                };
              }
              return ep;
            });
        } else {
          // Range mode: include all episodes whose date or history falls within [startDate, endDate]
          const start = filter.startDate;
          const end = filter.endDate;

          result = this.episodes.filter((ep) => {
            // Check if episode's current date is in range
            if (ep.date >= start && ep.date <= end) return true;
            // Check if any date in historyByDate is in range
            if (ep.historyByDate) {
              const historyDates = Object.keys(ep.historyByDate);
              return historyDates.some((d) => d >= start && d <= end);
            }
            return false;
          }).map((ep) => {
            // If historical points exist within range, take the latest point in range
            if (ep.historyByDate) {
              const matchingDates = Object.keys(ep.historyByDate)
                .filter((d) => d >= start && d <= end)
                .sort();
              if (matchingDates.length > 0) {
                const latestDate = matchingDates[matchingDates.length - 1];
                const snap = ep.historyByDate[latestDate];
                const safeLat = (typeof snap.latitude === 'number' && !isNaN(snap.latitude) && isFinite(snap.latitude))
                  ? snap.latitude
                  : ep.latitude;
                const safeLng = (typeof snap.longitude === 'number' && !isNaN(snap.longitude) && isFinite(snap.longitude))
                  ? snap.longitude
                  : ep.longitude;
                return {
                  ...ep,
                  date: latestDate,
                  latitude: safeLat,
                  longitude: safeLng,
                  area: snap.area ?? ep.area,
                  chlorophyll: snap.chlorophyll ?? ep.chlorophyll,
                  ndci: snap.ndci ?? ep.ndci,
                  sst: snap.sst ?? ep.sst,
                  thetao: snap.thetao ?? ep.thetao,
                  dustAod550: snap.dustAod550 ?? ep.dustAod550,
                  distanceToCoast: snap.distanceToCoast ?? ep.distanceToCoast,
                };
              }
            }
            return ep;
          });
        }

        if (islandFilter !== 'Canarias') {
          result = result.filter((e) => e.island === islandFilter);
        }

        resolve(result);
      }, 50);
    });
  }

  async getEpisodeById(id: string): Promise<CoastalEpisode | undefined> {
    return this.episodes.find((e) => e.id === id);
  }

  async updateGroundTruth(episodeId: string, newStatus: CoastalEpisode['groundTruthStatus'], notes?: string): Promise<CoastalEpisode> {
    const epIndex = this.episodes.findIndex((e) => e.id === episodeId);
    if (epIndex === -1) throw new Error('Episode not found');

    const ep = this.episodes[epIndex];
    const updated: CoastalEpisode = {
      ...ep,
      groundTruthStatus: newStatus,
      status: newStatus === 'Validado' ? 'VALIDADO' : newStatus === 'Descartado' ? 'DESCARTADO' : ep.status,
      groundTruthDetails: {
        ...ep.groundTruthDetails,
        notes: notes ?? ep.groundTruthDetails?.notes,
      },
    };
    this.episodes[epIndex] = updated;
    return updated;
  }

  async getAlerts(): Promise<CoastalAlert[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.alerts]), 50);
    });
  }

  async getEnvironmentalLayers(): Promise<{
    oceanVectors: OceanVector[];
    oceanBuoys: OceanBuoy[];
  }> {
    return {
      oceanVectors: REAL_CMEMS_OCEAN_VECTORS,
      oceanBuoys: REAL_OFFICIAL_OCEAN_BUOYS,
    };
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const activeEpisodes = this.episodes.filter((e) => e.status !== 'DESCARTADO').length;
    const detectedAnomalies = this.episodes.filter((e) => e.status === 'ANOMALÍA').length;
    const inValidation = this.episodes.filter((e) => e.groundTruthStatus === 'Pendiente' || e.groundTruthStatus === 'En evaluación').length;
    const activeAlerts = this.alerts.filter((a) => a.active).length;

    return {
      activeEpisodes,
      detectedAnomalies,
      inValidation,
      activeAlerts,
      lastUpdate: '23/08/2023 12:45 UTC',
      satellitePasses: 'Copernicus CMEMS PHY (0.494m) | CAMS EAC4 | Sentinel-2/3',
      sensorNetworkStatus: 'OPERATIVO',
    };
  }
}

export const coastalService = new CoastalService();
