/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { NavigationSidebar } from './components/NavigationSidebar';
import { OverviewSection } from './components/OverviewSection';
import { MetricsBar } from './components/MetricsBar';
import { LayersPanel } from './components/LayersPanel';
import { EpisodeDetailPanel } from './components/EpisodeDetailPanel';
import { TimelineBar } from './components/TimelineBar';
import { AlertsPanel } from './components/AlertsPanel';
import { MapLegend } from './components/MapLegend';
import { ArchitectureModal } from './components/ArchitectureModal';
import { MapComponent } from './components/MapComponent';
import { StatisticalAnalysisPanel } from './components/StatisticalAnalysisPanel';
import { SatelliteImageryModal } from './components/SatelliteImageryModal';
import { PlasticsModule } from './components/PlasticsModule';
import { CoastalDynamicsModule } from './components/CoastalDynamicsModule';
import { DatasetsModule } from './components/DatasetsModule';
import { AnalysisResultsModule } from './components/AnalysisResultsModule';
import { SettingsPipelineModule } from './components/SettingsPipelineModule';

import { 
  AppSection,
  CoastalEpisode, 
  CoastalAlert, 
  SystemMetrics, 
  LayerSettings, 
  IslandRegion, 
  RiskLevel, 
  EpisodeStatus, 
  GroundTruthStatus,
  TemporalFilter,
  OceanBuoy,
  PlasticCandidatePolygon,
  CoastalSector,
  TransectRecord
} from './types';
import { OceanVector } from './data/layers';
import { coastalService } from './services/coastalService';
import { REAL_PLASTIC_CANDIDATES } from './data/plasticsData';
import { REAL_COASTAL_SECTORS } from './data/coastalDynamicsData';
import { spatialImportService, ImportedLayer } from './services/spatialImportService';

export default function App() {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Main Institutional Navigation Section (01 - 07)
  const [activeSection, setActiveSection] = useState<AppSection>('overview');

  // Region State
  const [selectedIsland, setSelectedIsland] = useState<IslandRegion>('Canarias');

  // Unified Global Temporal State (Default: Today's date with Copernicus Baseline)
  const [temporalFilter, setTemporalFilter] = useState<TemporalFilter>({
    mode: 'single',
    date: '2023-08-23', // Anchor date for Copernicus bloom subset
    startDate: '2023-08-21',
    endDate: '2023-08-25',
  });

  // Satellite Imagery Viewer Modal State
  const [isSatelliteModalOpen, setIsSatelliteModalOpen] = useState(false);
  const [satelliteModalDate, setSatelliteModalDate] = useState<string>('2023-08-23');

  const handleOpenSatelliteImagery = (date?: string) => {
    setSatelliteModalDate(date || temporalFilter.date);
    setIsSatelliteModalOpen(true);
  };

  // Filters State (Marine Monitoring)
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<RiskLevel | 'TODOS'>('TODOS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<EpisodeStatus | 'TODOS'>('TODOS');

  // Data State: Módulo A (Marine Monitoring)
  const [episodes, setEpisodes] = useState<CoastalEpisode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<CoastalEpisode | null>(null);
  const [alerts, setAlerts] = useState<CoastalAlert[]>([]);
  const [oceanVectors, setOceanVectors] = useState<OceanVector[]>([]);
  const [oceanBuoys, setOceanBuoys] = useState<OceanBuoy[]>([]);

  // Data State: Módulo B (Residuos Plásticos)
  const [plasticCandidates, setPlasticCandidates] = useState<PlasticCandidatePolygon[]>(REAL_PLASTIC_CANDIDATES);
  const [selectedPlasticCandidate, setSelectedPlasticCandidate] = useState<PlasticCandidatePolygon | null>(
    REAL_PLASTIC_CANDIDATES[0] || null
  );

  // Data State: Módulo C (Dinámica Litoral)
  const [coastalSectors] = useState<CoastalSector[]>(REAL_COASTAL_SECTORS);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('SECTOR-MASPALOMAS');
  const [selectedTransect, setSelectedTransect] = useState<TransectRecord | null>(
    REAL_COASTAL_SECTORS[0]?.transects[0] || null
  );

  // Data State: Módulo 05 (Capas Importadas en Tiempo de Ejecución)
  const [importedLayers, setImportedLayers] = useState<ImportedLayer[]>(spatialImportService.getImportedLayers());

  // UI Panels State
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [recenterTarget, setRecenterTarget] = useState<{ lat: number; lng: number; ts: number } | null>(null);

  // Active Layers Settings (Copernicus + Derived Indices + Lagrangian Drift)
  const [layers, setLayers] = useState<LayerSettings>({
    sentinel2: true,
    sentinel3: true,
    copernicusSst: true,
    copernicusCurrents: true,
    copernicusIron: true,
    copernicusUpwelling: true,
    camsDust: true,
    era5Wind: true,
    chlorophyll: true,
    sst: true,
    turbidity: true,
    ndci: true,
    detectedAnomalies: true,
    modelProbability: true,
    oceanBuoys: true,
    predictedTrajectory: true,
    potentialImpactZone: true,
    currentVectors: true,
  });

  // Load data reactively when temporal filter or island changes
  useEffect(() => {
    async function loadData() {
      const [fetchedEpisodes, fetchedAlerts, envLayers] = await Promise.all([
        coastalService.getEpisodes(temporalFilter, selectedIsland),
        coastalService.getAlerts(),
        coastalService.getEnvironmentalLayers(),
      ]);

      setEpisodes(fetchedEpisodes);
      setAlerts(fetchedAlerts);
      setOceanVectors(envLayers.oceanVectors);
      setOceanBuoys(envLayers.oceanBuoys);

      // Keep selectedEpisode in sync if attributes update
      if (selectedEpisode) {
        const matching = fetchedEpisodes.find((e) => e.id === selectedEpisode.id);
        if (matching) {
          setSelectedEpisode(matching);
        }
      }
    }

    loadData();
  }, [temporalFilter, selectedIsland]);

  // Apply Risk & Status Filters to current episodes
  const visibleEpisodes = useMemo(() => {
    return episodes.filter((ep) => {
      if (selectedRiskFilter !== 'TODOS' && ep.risk !== selectedRiskFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'TODOS' && ep.status !== selectedStatusFilter) {
        return false;
      }
      return true;
    });
  }, [episodes, selectedRiskFilter, selectedStatusFilter]);

  // Filter alerts based on island and visible episodes
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (selectedIsland !== 'Canarias') {
        const ep = episodes.find((e) => e.id === alert.episodeId);
        if (ep && ep.island !== selectedIsland) return false;
      }
      return true;
    });
  }, [alerts, episodes, selectedIsland]);

  // Dynamic system metrics recalculation
  const metrics: SystemMetrics = useMemo(() => {
    const activeEpisodes = visibleEpisodes.filter((e) => e.status !== 'DESCARTADO').length;
    const detectedAnomalies = visibleEpisodes.filter((e) => e.status === 'ANOMALÍA').length;
    const inValidation = visibleEpisodes.filter(
      (e) => e.groundTruthStatus === 'Pendiente' || e.groundTruthStatus === 'En evaluación'
    ).length;
    const activeAlerts = filteredAlerts.filter((a) => a.active).length;

    const displayDate = temporalFilter.mode === 'single' ? temporalFilter.date : temporalFilter.endDate;
    const parts = displayDate.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : displayDate;

    return {
      activeEpisodes,
      detectedAnomalies,
      inValidation,
      activeAlerts,
      lastUpdate: `${formattedDate} 12:45 UTC`,
      satellitePasses: 'Copernicus CMEMS PHY | CAMS EAC4 | Sentinel-2/3',
      sensorNetworkStatus: 'OPERATIVO',
    };
  }, [visibleEpisodes, filteredAlerts, temporalFilter]);

  // Format readable string for date scope
  const dateFilterDescription = useMemo(() => {
    if (temporalFilter.mode === 'single') {
      const parts = temporalFilter.date.split('-');
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : temporalFilter.date;
    }
    const sParts = temporalFilter.startDate.split('-');
    const eParts = temporalFilter.endDate.split('-');
    const s = sParts.length === 3 ? `${sParts[2]}/${sParts[1]}` : temporalFilter.startDate;
    const e = eParts.length === 3 ? `${eParts[2]}/${eParts[1]}/${eParts[0]}` : temporalFilter.endDate;
    return `${s} a ${e}`;
  }, [temporalFilter]);

  // Toggle single layer
  const handleToggleLayer = (layerKey: keyof LayerSettings) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  // Select episode handler
  const handleSelectEpisode = (episode: CoastalEpisode) => {
    setSelectedEpisode(episode);
  };

  // Select episode by ID (used by Alerts and navigation)
  const handleSelectEpisodeById = (id: string) => {
    const ep = episodes.find((e) => e.id === id);
    if (ep) {
      setSelectedEpisode(ep);
      setRecenterTarget({ lat: ep.latitude, lng: ep.longitude, ts: Date.now() });
      setIsAlertsOpen(false);
    }
  };

  // Update ground truth status
  const handleUpdateGroundTruth = async (episodeId: string, status: GroundTruthStatus) => {
    try {
      const updated = await coastalService.updateGroundTruth(episodeId, status);
      setEpisodes((prev) => prev.map((e) => (e.id === episodeId ? updated : e)));
      if (selectedEpisode?.id === episodeId) {
        setSelectedEpisode(updated);
      }
    } catch (err) {
      console.error('Error updating ground truth:', err);
    }
  };

  // Timeline date change
  const handleTimelineDateChange = (date: string) => {
    setTemporalFilter({
      mode: 'single',
      date,
      startDate: date,
      endDate: date,
    });
  };

  // Focus map to coordinates
  const handleFocusCoordinates = (lat: number, lng: number, zoom?: number) => {
    setRecenterTarget({ lat, lng, ts: Date.now() });
  };

  const unverifiedPlasticsCount = useMemo(() => {
    return plasticCandidates.filter((c) => c.category === 'ANOMALIA_SOSPECHOSA').length;
  }, [plasticCandidates]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Institutional Top Bar (Header conforms to Top Bar Contract) */}
      <Header
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        selectedIsland={selectedIsland}
        onIslandChange={setSelectedIsland}
        activeAlertsCount={metrics.activeAlerts}
        onOpenAlerts={() => {
          setIsAlertsOpen(true);
          setIsAnalysisOpen(false);
        }}
        onOpenAnalysis={() => {
          setIsAnalysisOpen(true);
          setIsAlertsOpen(false);
        }}
        onOpenSatelliteImagery={handleOpenSatelliteImagery}
        isAlertsOpen={isAlertsOpen}
        isAnalysisOpen={isAnalysisOpen}
        lastUpdate={metrics.lastUpdate}
      />

      {/* Main Layout: Horizontal Split (Sidebar + Active Workbench) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Institutional Navigation Sidebar (7 Sections) */}
        <NavigationSidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          marineAlertsCount={metrics.activeAlerts}
          unverifiedPlasticsCount={unverifiedPlasticsCount}
        />

        {/* Center Workspace Stage */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-950">
          {/* SECTION 01: VISIÓN GENERAL */}
          {activeSection === 'overview' && (
            <div className="flex-1 overflow-y-auto">
              <OverviewSection
                onSelectSection={setActiveSection}
                onSelectIsland={setSelectedIsland}
                onFocusCoordinates={handleFocusCoordinates}
                activeEpisodesCount={visibleEpisodes.length}
                activeAlertsCount={metrics.activeAlerts}
              />
            </div>
          )}

          {/* SECTION 02: MONITORIZACIÓN MARINA (COASTAL GUARDIAN EVOLVED) */}
          {activeSection === 'marine' && (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Metrics & Filter Bar */}
              <MetricsBar
                metrics={metrics}
                selectedRiskFilter={selectedRiskFilter}
                onRiskFilterChange={setSelectedRiskFilter}
                selectedStatusFilter={selectedStatusFilter}
                onStatusFilterChange={setSelectedStatusFilter}
                totalVisibleEpisodes={visibleEpisodes.length}
                temporalFilter={temporalFilter}
                onChangeTemporalFilter={setTemporalFilter}
                onOpenSatelliteImagery={handleOpenSatelliteImagery}
              />

              {/* Central Map Canvas */}
              <div className="flex-1 relative overflow-hidden">
                <MapComponent
                  episodes={visibleEpisodes}
                  selectedEpisode={selectedEpisode}
                  onSelectEpisode={handleSelectEpisode}
                  layers={layers}
                  oceanVectors={oceanVectors}
                  oceanBuoys={oceanBuoys}
                  selectedIsland={selectedIsland}
                  recenterTarget={recenterTarget}
                  activeSection={activeSection}
                  importedLayers={importedLayers}
                />

                {/* Left Drawer: GIS Layers Panel */}
                <LayersPanel
                  layers={layers}
                  onToggleLayer={handleToggleLayer}
                  isOpen={isLayersOpen}
                  onToggleOpen={() => setIsLayersOpen((prev) => !prev)}
                />

                {/* Right Drawer: Episode Detail Panel */}
                {selectedEpisode && (
                  <EpisodeDetailPanel
                    episode={selectedEpisode}
                    onClose={() => setSelectedEpisode(null)}
                    onUpdateGroundTruth={handleUpdateGroundTruth}
                    onRecenter={(lat, lng) => {
                      if (
                        typeof lat === 'number' && !isNaN(lat) && isFinite(lat) &&
                        typeof lng === 'number' && !isNaN(lng) && isFinite(lng)
                      ) {
                        setRecenterTarget({ lat, lng, ts: Date.now() });
                      }
                    }}
                    onOpenAnalysis={() => {
                      setIsAnalysisOpen(true);
                      setIsAlertsOpen(false);
                    }}
                    onOpenSatelliteImagery={handleOpenSatelliteImagery}
                  />
                )}

                {/* Map Legend */}
                <MapLegend />

                {/* Bottom Timeline Bar */}
                <TimelineBar
                  temporalFilter={temporalFilter}
                  onDateChange={handleTimelineDateChange}
                />
              </div>
            </div>
          )}

          {/* SECTION 03: RESIDUOS PLÁSTICOS (MÓDULO B) */}
          {activeSection === 'plastics' && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left/Center: Plastics Workbench Panel */}
              <div className="w-full lg:w-3/5 h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-slate-800">
                <PlasticsModule
                  onFocusCoordinates={handleFocusCoordinates}
                  selectedCandidateId={selectedPlasticCandidate?.id}
                  onSelectCandidate={setSelectedPlasticCandidate}
                />
              </div>

              {/* Right: Map View with High-Res Plastic Polygons */}
              <div className="w-full lg:w-2/5 h-1/2 lg:h-full relative">
                <MapComponent
                  episodes={[]}
                  selectedEpisode={null}
                  onSelectEpisode={() => {}}
                  layers={layers}
                  oceanVectors={[]}
                  oceanBuoys={[]}
                  selectedIsland={selectedIsland}
                  recenterTarget={recenterTarget}
                  activeSection={activeSection}
                  plasticCandidates={plasticCandidates}
                  selectedPlasticCandidate={selectedPlasticCandidate}
                  onSelectPlasticCandidate={setSelectedPlasticCandidate}
                  importedLayers={importedLayers}
                />
              </div>
            </div>
          )}

          {/* SECTION 04: DINÁMICA LITORAL (MÓDULO C) */}
          {activeSection === 'dynamics' && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left/Center: Coastal Dynamics Workbench Panel */}
              <div className="w-full lg:w-3/5 h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-slate-800">
                <CoastalDynamicsModule
                  onFocusCoordinates={handleFocusCoordinates}
                  selectedTransectId={selectedTransect?.id}
                  onSelectTransect={setSelectedTransect}
                />
              </div>

              {/* Right: Map View with Historical Shorelines & Transects */}
              <div className="w-full lg:w-2/5 h-1/2 lg:h-full relative">
                <MapComponent
                  episodes={[]}
                  selectedEpisode={null}
                  onSelectEpisode={() => {}}
                  layers={layers}
                  oceanVectors={[]}
                  oceanBuoys={[]}
                  selectedIsland={selectedIsland}
                  recenterTarget={recenterTarget}
                  activeSection={activeSection}
                  coastalSectors={coastalSectors}
                  selectedSectorId={selectedSectorId}
                  selectedTransectId={selectedTransect?.id}
                  onSelectTransect={setSelectedTransect}
                  importedLayers={importedLayers}
                />
              </div>
            </div>
          )}

          {/* SECTION 05: CAPAS Y DATASETS */}
          {activeSection === 'datasets' && (
            <div className="flex-1 overflow-hidden">
              <DatasetsModule
                onLayersUpdated={() => setImportedLayers(spatialImportService.getImportedLayers())}
                onFocusCoordinates={handleFocusCoordinates}
              />
            </div>
          )}

          {/* SECTION 06: ANÁLISIS Y RESULTADOS */}
          {activeSection === 'analysis' && (
            <div className="flex-1 overflow-hidden">
              <AnalysisResultsModule
                episodes={episodes}
                lastUpdate={metrics.lastUpdate}
              />
            </div>
          )}

          {/* SECTION 07: CONFIGURACIÓN Y SERVICIOS */}
          {activeSection === 'settings' && (
            <div className="flex-1 overflow-hidden">
              <SettingsPipelineModule />
            </div>
          )}
        </div>
      </div>

      {/* Global Modals (Alerts, Architecture, Satellite Viewer, Analysis) */}
      <AlertsPanel
        alerts={filteredAlerts}
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onSelectEpisode={handleSelectEpisodeById}
      />

      <StatisticalAnalysisPanel
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        episodes={visibleEpisodes}
        selectedIsland={selectedIsland}
        dateFilterDescription={dateFilterDescription}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <SatelliteImageryModal
        isOpen={isSatelliteModalOpen}
        onClose={() => setIsSatelliteModalOpen(false)}
        selectedDate={satelliteModalDate}
        selectedIsland={selectedIsland}
        onSelectIsland={setSelectedIsland}
      />
    </div>
  );
}
