import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  X, 
  Sliders, 
  Info, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  Layers,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { 
  CoastalEpisode, 
  StatisticalVariableKey, 
  BinsOption,
  IslandRegion 
} from '../types';
import { 
  STATISTICAL_VARIABLES, 
  calculateStatistics, 
  calculateHistogram, 
  extractVariableObservations 
} from '../services/statisticsService';

interface StatisticalAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  episodes: CoastalEpisode[];
  selectedIsland: IslandRegion;
  dateFilterDescription: string;
}

export const StatisticalAnalysisPanel: React.FC<StatisticalAnalysisPanelProps> = ({
  isOpen,
  onClose,
  episodes,
  selectedIsland,
  dateFilterDescription,
}) => {
  // Active variable (Default: Copernicus thetao)
  const [selectedVarKey, setSelectedVarKey] = useState<StatisticalVariableKey>('thetao');
  // Active Bins option
  const [binsOption, setBinsOption] = useState<BinsOption>('auto');
  // Show mean and median reference lines toggle
  const [showReferenceLines, setShowReferenceLines] = useState<boolean>(true);

  // Meta for active variable
  const activeMeta = useMemo(() => {
    return STATISTICAL_VARIABLES.find((v) => v.key === selectedVarKey) || STATISTICAL_VARIABLES[0];
  }, [selectedVarKey]);

  // Extract observations from the filtered episodes
  const observations = useMemo(() => {
    return extractVariableObservations(episodes, selectedVarKey);
  }, [episodes, selectedVarKey]);

  // Descriptive statistics
  const stats = useMemo(() => {
    return calculateStatistics(observations, selectedVarKey, activeMeta.unit);
  }, [observations, selectedVarKey, activeMeta.unit]);

  // Histogram Bins calculation
  const histogramBins = useMemo(() => {
    return calculateHistogram(observations, binsOption);
  }, [observations, binsOption]);

  if (!isOpen) return null;

  // Custom QGIS-style tooltip
  const CustomHistogramTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const data = payload[0].payload;
      if (!data) return null;
      return (
        <div className="bg-slate-950/95 border border-cyan-500/70 p-2.5 rounded-lg shadow-2xl text-xs backdrop-blur-md font-mono">
          <div className="font-bold text-cyan-300 pb-1 border-b border-slate-800 flex items-center justify-between gap-4">
            <span>Rango:</span>
            <span>{data.rangeLabel || ''} {activeMeta.unit}</span>
          </div>
          <div className="pt-1.5 space-y-1 text-slate-200">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-sans">Observaciones:</span>
              <span className="font-bold text-white text-sm">{data.count ?? 0}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400">
              <span className="font-sans">Frecuencia relativa:</span>
              <span>{(data.percentage ?? 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="coastal-statistical-panel"
      className="absolute top-4 right-4 sm:right-16 bottom-24 w-96 sm:w-[440px] max-w-[calc(100vw-2rem)] z-30 bg-slate-950/98 backdrop-blur-md border border-cyan-800/60 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 text-xs"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-700/60 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono flex items-center gap-2">
              <span>ANÁLISIS ESTADÍSTICO</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                QGIS Raster Model
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Distribución de variables y análisis exploratorio de píxeles
            </p>
          </div>
        </div>
        <button
          id="btn-close-stats-panel"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Cerrar panel de análisis"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scope Banner: Filters applied */}
      <div className="px-3.5 py-2 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-slate-500">Alcance:</span>
          <span className="font-semibold text-cyan-300">{selectedIsland}</span>
          <span className="text-slate-600">&middot;</span>
          <span className="text-slate-400">{dateFilterDescription}</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
          {episodes.length} {episodes.length === 1 ? 'episodio' : 'episodios'}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Controls: Variable Selector & Bins Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Variable Selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">
              Variable Geoespacial
            </label>
            <select
              id="select-statistical-variable"
              value={selectedVarKey}
              onChange={(e) => setSelectedVarKey(e.target.value as StatisticalVariableKey)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500 transition"
            >
              {STATISTICAL_VARIABLES.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.shortName} {v.unit ? `(${v.unit})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Bins Selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">
              Intervalos (Bins)
            </label>
            <select
              id="select-histogram-bins"
              value={binsOption}
              onChange={(e) => {
                const val = e.target.value;
                setBinsOption(val === 'auto' ? 'auto' : (Number(val) as 10 | 20 | 30));
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500 transition"
            >
              <option value="auto">Automático (Sturges)</option>
              <option value="10">10 Bins</option>
              <option value="20">20 Bins</option>
              <option value="30">30 Bins</option>
            </select>
          </div>
        </div>

        {/* Variable Description */}
        <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
          {activeMeta.description}
        </p>

        {/* HISTOGRAM CHART */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 font-bold">
              Histograma de Frecuencia ({stats.title})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Eje Y: Frecuencia &middot; Eje X: {activeMeta.shortName}
            </span>
          </div>

          {observations.length > 0 ? (
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramBins} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="mid" 
                    tickFormatter={(v) => Number(v).toFixed(2)}
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomHistogramTooltip />} />
                  {showReferenceLines && (
                    <>
                      <ReferenceLine 
                        x={stats.mean} 
                        stroke="#06b6d4" 
                        strokeDasharray="3 3" 
                        label={{ value: 'Media', fill: '#06b6d4', fontSize: 9, position: 'top' }} 
                      />
                      <ReferenceLine 
                        x={stats.median} 
                        stroke="#f59e0b" 
                        strokeDasharray="2 2" 
                        label={{ value: 'Mediana', fill: '#f59e0b', fontSize: 9, position: 'insideTopRight' }} 
                      />
                    </>
                  )}
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {histogramBins.map((entry, index) => {
                      const counts = histogramBins.map((b) => (b && typeof b.count === 'number' ? b.count : 0));
                      const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
                      const isMax = entry && entry.count === maxCount && maxCount > 0;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isMax ? '#06b6d4' : '#0e7490'}
                          className="hover:fill-cyan-400 transition cursor-pointer"
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 space-y-1">
              <AlertCircle className="w-5 h-5 text-slate-600" />
              <p className="text-xs">No hay datos suficientes con los filtros actuales</p>
            </div>
          )}

          {/* Reference legends */}
          <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-cyan-400"></span>
                <span>Media ({activeMeta.formatValue(stats.mean)})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-amber-400"></span>
                <span>Mediana ({activeMeta.formatValue(stats.median)})</span>
              </div>
            </div>
            <button
              onClick={() => setShowReferenceLines(!showReferenceLines)}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              {showReferenceLines ? 'Ocultar guías' : 'Mostrar guías'}
            </button>
          </div>
        </div>

        {/* DESCRIPTIVE STATISTICS TABLE */}
        <div className="bg-slate-900/70 rounded-xl border border-slate-800 p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-300 font-mono tracking-wider mb-2 flex items-center justify-between">
            <span>Estadísticos Descriptivos</span>
            <span className="text-[9px] text-slate-500 lowercase font-sans">
              n = {stats.count} observaciones
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-sans block">Observaciones:</span>
              <span className="text-sm font-bold text-white">{stats.count}</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-sans block">Media:</span>
              <span className="text-sm font-bold text-cyan-300">
                {activeMeta.formatValue(stats.mean)}
              </span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-sans block">Mediana:</span>
              <span className="text-sm font-bold text-amber-300">
                {activeMeta.formatValue(stats.median)}
              </span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-sans block">Desv. estándar (σ):</span>
              <span className="text-sm font-bold text-slate-200">
                {stats.stdDev.toFixed(3)} {activeMeta.unit}
              </span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-sans block">Mínimo:</span>
              <span className="text-sm font-bold text-emerald-400">
                {activeMeta.formatValue(stats.min)}
              </span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-sans block">Máximo:</span>
              <span className="text-sm font-bold text-rose-400">
                {activeMeta.formatValue(stats.max)}
              </span>
            </div>
          </div>
        </div>

        {/* Cartography & reanalysis dataset source */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
          <span className="text-cyan-400 font-bold">Datos Reales Cartográficos & Reanálisis Copernicus</span>
          <span>14 Shapefiles ESRI · CMEMS / CAMS / ERA5</span>
        </div>

        {/* Scientific Disclaimer required by spec */}
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-[11px] text-slate-400 leading-relaxed">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-mono text-[10px] uppercase mb-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Consideración Metodológica</span>
          </div>
          <p>
            Análisis exploratorio de la distribución de valores. No constituye diagnóstico ambiental por sí solo.
            Una distribución elevada de NDCI o clorofila-a indica concentración óptica de biomasa pero no confirma una especie nociva sin microscopía o análisis genético de laboratorio.
          </p>
        </div>
      </div>
    </div>
  );
};
