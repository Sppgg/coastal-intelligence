import React, { useState } from 'react';
import { 
  TrendingDown, 
  MapPin, 
  Sliders, 
  Calendar, 
  Layers, 
  Download, 
  AlertTriangle, 
  Info, 
  SplitSquareVertical, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  FileCode2,
  BarChart3
} from 'lucide-react';
import { 
  CoastalSector, 
  TransectRecord, 
  ShorelineProxyType, 
  ShorelineObservation 
} from '../types';
import { REAL_COASTAL_SECTORS } from '../data/coastalDynamicsData';

interface CoastalDynamicsModuleProps {
  onFocusCoordinates: (lat: number, lng: number, zoom?: number) => void;
  selectedTransectId?: string | null;
  onSelectTransect?: (transect: TransectRecord | null) => void;
}

export const CoastalDynamicsModule: React.FC<CoastalDynamicsModuleProps> = ({
  onFocusCoordinates,
  selectedTransectId,
  onSelectTransect,
}) => {
  const [sectors] = useState<CoastalSector[]>(REAL_COASTAL_SECTORS);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('SECTOR-MASPALOMAS');
  const [activeProxy, setActiveProxy] = useState<ShorelineProxyType>('HWL');
  const [swipeSplitPercent, setSwipeSplitPercent] = useState<number>(50); // 0 to 100 for swipe comparator
  const [comparisonCampaigns, setComparisonCampaigns] = useState<{ before: string; after: string }>({
    before: '2018',
    after: '2026',
  });
  const [selectedTransect, setSelectedTransect] = useState<TransectRecord | null>(
    sectors[0].transects[0] || null
  );

  const currentSector = sectors.find((s) => s.id === selectedSectorId) || sectors[0];

  const handleSelectSector = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    const sector = sectors.find((s) => s.id === sectorId);
    if (sector) {
      setSelectedTransect(sector.transects[0] || null);
      onFocusCoordinates(sector.center[0], sector.center[1], sector.zoom);
    }
  };

  const handleSelectTransectItem = (tr: TransectRecord) => {
    setSelectedTransect(tr);
    if (onSelectTransect) onSelectTransect(tr);
    onFocusCoordinates(tr.origin[0], tr.origin[1], 17);
  };

  // Export transects to GeoJSON
  const handleExportTransectsGeoJSON = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      features: currentSector.transects.map((tr) => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [tr.origin[1], tr.origin[0]],
            [tr.end[1], tr.end[0]],
          ],
        },
        properties: {
          id: tr.id,
          sector: currentSector.name,
          number: tr.transectNumber,
          length_m: tr.lengthM,
          azimuth_deg: tr.azimuthDeg,
          epr_m_yr: tr.eprRateMYear,
          nsm_m: tr.nsmDistanceM,
          uncertainty_m: tr.uncertaintyMarginM,
          classification: tr.classification,
          missing_notes: tr.missingDataNotes || null,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transectos_dsas_${currentSector.id.toLowerCase()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export transects to CSV
  const handleExportTransectsCSV = () => {
    const headers = ['id', 'sector', 'numero_transecto', 'longitud_m', 'azimut_deg', 'tasa_epr_m_ano', 'desplazamiento_nsm_m', 'incertidumbre_sigma_m', 'clasificacion', 'notas_datos_faltantes'];
    const rows = currentSector.transects.map((tr) => [
      tr.id,
      `"${currentSector.name}"`,
      tr.transectNumber,
      tr.lengthM,
      tr.azimuthDeg,
      tr.eprRateMYear,
      tr.nsmDistanceM,
      tr.uncertaintyMarginM,
      tr.classification,
      `"${tr.missingDataNotes || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transectos_dsas_${currentSector.id.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getClassificationBadge = (cls: TransectRecord['classification']) => {
    switch (cls) {
      case 'EROSION_SEVERA':
        return {
          label: 'Erosión Severa (> 1.5 m/año)',
          classes: 'bg-rose-950 text-rose-300 border border-rose-700/80',
          color: 'text-rose-400',
        };
      case 'EROSION_MODERADA':
        return {
          label: 'Erosión Moderada (0.3 - 1.5 m/año)',
          classes: 'bg-amber-950 text-amber-300 border border-amber-700/80',
          color: 'text-amber-400',
        };
      case 'ESTABLE':
        return {
          label: 'Dinámica Estable (±0.3 m/año)',
          classes: 'bg-slate-900 text-slate-300 border border-slate-700/80',
          color: 'text-slate-400',
        };
      case 'AVANCE_ACRECION':
        return {
          label: 'Avance / Acreción (> 0.3 m/año)',
          classes: 'bg-emerald-950 text-emerald-300 border border-emerald-700/80',
          color: 'text-emerald-400',
        };
      case 'ANALISIS_NO_DISPONIBLE':
        return {
          label: 'Análisis No Disponible',
          classes: 'bg-slate-900 text-slate-400 border border-slate-800 line-through',
          color: 'text-slate-500',
        };
    }
  };

  return (
    <div id="coastal-dynamics-module" className="h-full flex flex-col bg-slate-950 text-slate-200 select-none">
      {/* Top Banner: Scientific Restriction on Waterline vs Erosion */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-300 leading-normal">
          <strong className="text-white">Criterio Geomorfométrico Oficial:</strong> El desplazamiento de la línea instantánea de agua entre dos imágenes <em>no</em> debe interpretarse de forma inmediata como erosión o pérdida de costa. El modelo incorpora corrección de marea astronómica (+0.42m a +1.15m), propagación de oleaje (runup), resolución espacial y definición explícita del indicador costero (HWL / base de cantil).
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Sector Selection, Comparator & Transects List */}
        <div className="w-80 md:w-96 border-r border-slate-800/80 flex flex-col bg-slate-950/70 shrink-0 overflow-y-auto p-4 space-y-4">
          {/* Sector Selector */}
          <div>
            <label className="text-[11px] uppercase font-mono text-slate-400 block mb-1.5 font-bold">
              Sector Litoral Monitorizado
            </label>
            <div className="space-y-1.5">
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  id={`btn-sector-${sector.id.toLowerCase()}`}
                  onClick={() => handleSelectSector(sector.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition ${
                    selectedSectorId === sector.id
                      ? 'bg-cyan-950/80 border-cyan-600 text-white shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{sector.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/60">
                      {sector.island}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{sector.description}</p>
                  <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500 mt-1.5 pt-1 border-t border-slate-800/60">
                    <span>{sector.geomorphologyType}</span>
                    <span>{sector.transects.length} transectos</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Multitemporal Comparator Control */}
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-300">
                Comparador Multitemporal (Swipe)
              </span>
              <SplitSquareVertical className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-mono block">Campaña Base:</label>
                <select
                  value={comparisonCampaigns.before}
                  onChange={(e) => setComparisonCampaigns({ ...comparisonCampaigns, before: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-xs"
                >
                  <option value="2018">2018 (GRAFCAN / PNOA)</option>
                  <option value="2021">2021 (Ortofoto Base)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-mono block">Campaña Reciente:</label>
                <select
                  value={comparisonCampaigns.after}
                  onChange={(e) => setComparisonCampaigns({ ...comparisonCampaigns, after: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-xs"
                >
                  <option value="2024">2024 (Vuelo UAV Litoral)</option>
                  <option value="2026">2026 (Campaña Reciente)</option>
                </select>
              </div>
            </div>

            {/* Cortina / Slider control */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>{comparisonCampaigns.before} (Base)</span>
                <span className="text-cyan-400 font-bold">{swipeSplitPercent}%</span>
                <span>{comparisonCampaigns.after} (Reciente)</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={swipeSplitPercent}
                onChange={(e) => setSwipeSplitPercent(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
              />
            </div>
          </div>

          {/* Morphological Proxy Selector */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-[11px] font-mono font-bold text-slate-300 block">
              Indicador de Línea de Costa
            </span>
            <div className="space-y-1 text-xs">
              {(['HWL', 'PIE_ACANTILADO', 'VEGETACION', 'LINEA_INSTANTANEA'] as ShorelineProxyType[]).map((proxyKey) => (
                <button
                  key={proxyKey}
                  onClick={() => setActiveProxy(proxyKey)}
                  className={`w-full text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                    activeProxy === proxyKey
                      ? 'bg-cyan-950 border-cyan-500 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-[11px] block">
                      {proxyKey === 'HWL' && 'HWL (High Water Line / Pleamar media)'}
                      {proxyKey === 'PIE_ACANTILADO' && 'Pie / Base morfológica de cantil'}
                      {proxyKey === 'VEGETACION' && 'Borde de vegetación dunar / halófila'}
                      {proxyKey === 'LINEA_INSTANTANEA' && 'Línea instantánea con corrección mareal'}
                    </span>
                  </div>
                  {activeProxy === proxyKey && <span className="text-cyan-400 text-xs">●</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Transects List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                Transectos DSAS ({currentSector.transects.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleExportTransectsGeoJSON}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                  title="Exportar transectos en GeoJSON"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleExportTransectsCSV}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                  title="Exportar métricas tabulares en CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {currentSector.transects.map((tr) => {
                const badge = getClassificationBadge(tr.classification);
                const isSelected = selectedTransect?.id === tr.id;

                return (
                  <button
                    key={tr.id}
                    id={`transect-row-${tr.id.toLowerCase()}`}
                    onClick={() => handleSelectTransectItem(tr)}
                    className={`w-full text-left p-2.5 rounded-lg border transition ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white font-mono">{tr.id} (Nº {tr.transectNumber})</span>
                      {tr.classification === 'ANALISIS_NO_DISPONIBLE' ? (
                        <span className="text-[10px] text-slate-500 font-mono">No disponible</span>
                      ) : (
                        <span className={`text-[10px] font-mono font-bold ${tr.eprRateMYear < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {tr.eprRateMYear > 0 ? '+' : ''}{tr.eprRateMYear} m/año
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      {badge.label}
                    </div>

                    <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500 mt-1.5 pt-1 border-t border-slate-800/50">
                      <span>L: {tr.lengthM} m</span>
                      <span>Azimut: {tr.azimuthDeg}°</span>
                      <span>±{tr.uncertaintyMarginM} m</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Inspection & Synthesis Workbench */}
        <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4">
          {selectedTransect ? (
            <div className="space-y-4 max-w-4xl">
              {/* Transect Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-400">{selectedTransect.id}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${getClassificationBadge(selectedTransect.classification).classes}`}>
                      {getClassificationBadge(selectedTransect.classification).label}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Transecto Perpendicular Nº {selectedTransect.transectNumber} &middot; {currentSector.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Azimut: {selectedTransect.azimuthDeg}° ortogonal al frente costero &middot; Longitud analizada: {selectedTransect.lengthM} metros
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onFocusCoordinates(selectedTransect.origin[0], selectedTransect.origin[1], 18)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Centrar en Mapa</span>
                  </button>
                </div>
              </div>

              {/* If Analysis Not Available: Explain Scientifically */}
              {selectedTransect.classification === 'ANALISIS_NO_DISPONIBLE' ? (
                <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-5 space-y-2 text-slate-200">
                  <div className="flex items-center gap-2 text-amber-300">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <h3 className="text-sm font-bold">Análisis Geomorfométrico No Disponible en Este Sector</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedTransect.missingDataNotes}
                  </p>
                  <div className="pt-2 border-t border-amber-900/50 text-[11px] font-mono text-amber-200/80">
                    Requisitos pendientes para cálculo riguroso: Registro batimétrico de alta resolución post-temporal + Datos sincrónicos de marea astronómica (REDMAR Puertos del Estado).
                  </div>
                </div>
              ) : (
                /* Metrics DSAS Cards */
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Tasa EPR (End Point Rate)</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={`text-2xl font-mono font-bold ${selectedTransect.eprRateMYear < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {selectedTransect.eprRateMYear > 0 ? '+' : ''}{selectedTransect.eprRateMYear}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">m/año</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">LRR: {selectedTransect.lrrRateMYear ?? selectedTransect.eprRateMYear} m/año</span>
                  </div>

                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Desplazamiento Neto (NSM)</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-mono font-bold text-white">
                        {selectedTransect.nsmDistanceM > 0 ? '+' : ''}{selectedTransect.nsmDistanceM}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">m</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Periodo: {comparisonCampaigns.before} - {comparisonCampaigns.after}</span>
                  </div>

                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Incertidumbre Estimada (±σ)</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-mono font-bold text-cyan-400">
                        ±{selectedTransect.uncertaintyMarginM}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">m</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Error georref + marea + runup</span>
                  </div>

                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Indicador Morfológico</span>
                    <div className="mt-1">
                      <span className="text-xs font-semibold text-slate-200 block">{activeProxy}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">CRS: EPSG:32628 UTM 28N</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sediment Budget & Emerged Area Balance */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Balance Sedimentario en Polígono Comparable</h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Ventana temporal: {currentSector.sedimentBudgetM2.timeSpanYears} años
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Superficie Ganada</span>
                    <span className="text-base font-mono font-bold text-emerald-400 mt-1 block">
                      +{currentSector.sedimentBudgetM2.gainM2.toLocaleString()} m²
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Superficie Erosionada</span>
                    <span className="text-base font-mono font-bold text-rose-400 mt-1 block">
                      -{currentSector.sedimentBudgetM2.lossM2.toLocaleString()} m²
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Balance Neto</span>
                    <span className={`text-base font-mono font-bold mt-1 block ${
                      currentSector.sedimentBudgetM2.netM2 < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {currentSector.sedimentBudgetM2.netM2 > 0 ? '+' : ''}
                      {currentSector.sedimentBudgetM2.netM2.toLocaleString()} m²
                    </span>
                  </div>
                </div>

                {currentSector.hasDemComparison && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block">Diferencia de Elevación Media (LiDAR / MDT):</span>
                      <span className="text-[11px] text-slate-400">Comparación fotogramétrica de nubes de puntos georreferenciadas</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-cyan-300">
                      {currentSector.elevationDiffMeanM && currentSector.elevationDiffMeanM > 0 ? '+' : ''}
                      {currentSector.elevationDiffMeanM} m
                    </span>
                  </div>
                )}
              </div>

              {/* Campaigns Timeline in Sector */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase block">
                  Vuelos y Campañas Históricas Registradas en este Sector
                </span>
                <div className="space-y-1.5">
                  {currentSector.historicalCampaigns.map((camp) => (
                    <div 
                      key={camp.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">{camp.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {camp.provider} &middot; GSD: {camp.resGsdCm} cm
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400">{camp.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
