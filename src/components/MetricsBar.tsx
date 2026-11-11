import React from 'react';
import { 
  Radar, 
  AlertTriangle, 
  BellRing, 
  Clock, 
  Filter, 
  X,
  Layers,
  Satellite
} from 'lucide-react';
import { EpisodeStatus, RiskLevel, SystemMetrics, TemporalFilter } from '../types';
import { CalendarSelector } from './CalendarSelector';

interface MetricsBarProps {
  metrics: SystemMetrics;
  selectedRiskFilter: RiskLevel | 'TODOS';
  onRiskFilterChange: (risk: RiskLevel | 'TODOS') => void;
  selectedStatusFilter: EpisodeStatus | 'TODOS';
  onStatusFilterChange: (status: EpisodeStatus | 'TODOS') => void;
  totalVisibleEpisodes: number;
  temporalFilter: TemporalFilter;
  onChangeTemporalFilter: (filter: TemporalFilter) => void;
  onOpenSatelliteImagery?: (date?: string) => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  metrics,
  selectedRiskFilter,
  onRiskFilterChange,
  selectedStatusFilter,
  onStatusFilterChange,
  totalVisibleEpisodes,
  temporalFilter,
  onChangeTemporalFilter,
  onOpenSatelliteImagery,
}) => {
  const hasActiveFilters = 
    selectedRiskFilter !== 'TODOS' || 
    selectedStatusFilter !== 'TODOS' || 
    temporalFilter.mode === 'range' ||
    temporalFilter.date !== '2023-08-23';

  return (
    <div id="coastal-metrics-bar" className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Metrics Cards */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {/* Metric 1: Episodios Activos */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-sm">
          <div className="p-1 rounded bg-cyan-950 text-cyan-400">
            <Radar className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Episodios Activos</div>
            <div className="text-sm font-extrabold text-cyan-300 font-mono leading-none">
              {metrics.activeEpisodes}
            </div>
          </div>
        </div>

        {/* Metric 2: Anomalías Detectadas */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-sm">
          <div className="p-1 rounded bg-amber-950 text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Anomalías Detectadas</div>
            <div className="text-sm font-extrabold text-amber-300 font-mono leading-none">
              {metrics.detectedAnomalies}
            </div>
          </div>
        </div>


        {/* Metric 4: Alertas Activas */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-sm">
          <div className="p-1 rounded bg-rose-950 text-rose-400">
            <BellRing className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Alertas Activas</div>
            <div className="text-sm font-extrabold text-rose-300 font-mono leading-none">
              {metrics.activeAlerts}
            </div>
          </div>
        </div>

        {/* Metric 5: Última actualización */}
        <div className="hidden 2xl:flex items-center gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-sm">
          <div className="p-1 rounded bg-slate-800 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Última Actualización</div>
            <div className="text-xs font-medium text-slate-200 font-mono leading-none">
              {metrics.lastUpdate}
            </div>
          </div>
        </div>
      </div>

      {/* Filter controls & Calendar Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Calendar Date Picker */}
        <CalendarSelector
          temporalFilter={temporalFilter}
          onChangeFilter={onChangeTemporalFilter}
          onOpenSatelliteImagery={onOpenSatelliteImagery}
        />

        {/* Sentinel & Landsat satellite imagery button */}
        {onOpenSatelliteImagery && (
          <button
            id="btn-open-satellite-imagery"
            onClick={() => onOpenSatelliteImagery(temporalFilter.date)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-medium transition shadow-sm"
            title="Ver imágenes satelitales Sentinel y Landsat de gran resolución de la isla"
          >
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Imágenes Satélite</span>
          </button>
        )}

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>

        {/* Risk Filter */}
        <select
          id="select-risk-filter"
          value={selectedRiskFilter}
          onChange={(e) => onRiskFilterChange(e.target.value as RiskLevel | 'TODOS')}
          aria-label="Filtrar por clasificación de riesgo"
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-md px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
        >
          <option value="TODOS">Riesgo: Todos</option>
          <option value="Bajo">🟢 Bajo</option>
          <option value="Moderado">🟡 Moderado</option>
          <option value="Alto">🟠 Alto</option>
          <option value="Muy alto">🔴 Muy alto</option>
        </select>

        {/* Status Filter */}
        <select
          id="select-status-filter"
          value={selectedStatusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as EpisodeStatus | 'TODOS')}
          aria-label="Filtrar por estado del episodio"
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-md px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
        >
          <option value="TODOS">Estado: Todos</option>
          <option value="OBSERVACIÓN">Observación</option>
          <option value="ANOMALÍA">Anomalía</option>
          <option value="EN INVESTIGACIÓN">En Investigación</option>
          <option value="VALIDADO">Validado</option>
          <option value="DESCARTADO">Descartado</option>
        </select>

        {/* Reset filters if active */}
        {hasActiveFilters && (
          <button
            id="btn-reset-filters"
            onClick={() => {
              onRiskFilterChange('TODOS');
              onStatusFilterChange('TODOS');
              onChangeTemporalFilter({
                mode: 'single',
                date: '2023-08-23',
                startDate: '2023-08-21',
                endDate: '2023-08-25',
              });
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
            title="Restablecer todos los filtros"
          >
            <X className="w-3 h-3" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}

        <div className="text-[11px] text-slate-400 font-mono pl-1">
          ({totalVisibleEpisodes} visible{totalVisibleEpisodes !== 1 ? 's' : ''})
        </div>
      </div>
    </div>
  );
};

