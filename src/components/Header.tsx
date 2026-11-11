import React from 'react';
import { 
  Waves, 
  Satellite, 
  Layers, 
  Bell, 
  Workflow, 
  Download,
  BarChart3,
  Compass,
  FileText
} from 'lucide-react';
import { IslandRegion, AppSection } from '../types';

interface HeaderProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  selectedIsland: IslandRegion;
  onIslandChange: (island: IslandRegion) => void;
  activeAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenAnalysis: () => void;
  onOpenSatelliteImagery?: () => void;
  isAlertsOpen: boolean;
  isAnalysisOpen: boolean;
  lastUpdate: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onSelectSection,
  selectedIsland,
  onIslandChange,
  activeAlertsCount,
  onOpenAlerts,
  onOpenAnalysis,
  onOpenSatelliteImagery,
  isAlertsOpen,
  isAnalysisOpen,
  lastUpdate,
}) => {
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'overview': return '01. Visión General del Litoral Canario';
      case 'marine': return '02. Monitorización de Fenómenos Marinos (Módulo A)';
      case 'plastics': return '03. Detección y Análisis de Residuos Plásticos (Módulo B)';
      case 'dynamics': return '04. Cambios Geomorfológicos y Retroceso Costero (Módulo C)';
      case 'datasets': return '05. Inventario de Capas, Metadatos e Importación';
      case 'analysis': return '06. Estadísticas, Histogramas e Informes Científicos';
      case 'settings': return '07. Configuración Geoespacial y Pipeline de Procesamiento';
      default: return 'Plataforma Geoespacial';
    }
  };

  return (
    <header 
      id="coastal-header" 
      className="h-14 bg-slate-950 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between gap-8 z-30 select-none"
    >
      {/* Zone 1: Brand title, single line */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
          <Waves className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-extrabold tracking-wider text-base text-white font-mono whitespace-nowrap">
            TELEDETECCIÓN <span className="text-cyan-400">AZUL</span>
          </span>
          <span className="hidden xl:inline text-[11px] text-slate-400 font-medium">
            &middot; Litoral de Canarias
          </span>
        </div>
      </div>

      {/* Zone 2: Context breadcrumb & Island Region Switcher */}
      <div className="hidden lg:flex items-center gap-4 min-w-0">
        <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5 truncate">
          <span className="text-slate-500">Módulo:</span>
          <span className="text-cyan-300 font-semibold truncate">{getSectionTitle()}</span>
        </div>

        <div className="h-4 w-px bg-slate-800 shrink-0" />

        {/* Island filter selector */}
        <div className="flex items-center bg-slate-900/90 rounded-md p-0.5 border border-slate-800 text-xs shrink-0">
          {(['Canarias', 'Tenerife', 'La Palma', 'La Gomera', 'Gran Canaria'] as IslandRegion[]).map((island) => (
            <button
              key={island}
              id={`filter-island-${island.toLowerCase().replace(' ', '-')}`}
              onClick={() => onIslandChange(island)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                selectedIsland === island
                  ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {island}
            </button>
          ))}
        </div>
      </div>

      {/* Zone 3: 1-2 Primary actions & Quick tools */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Mobile / Tablet Island Dropdown */}
        <div className="lg:hidden">
          <select
            id="mobile-island-select"
            value={selectedIsland}
            onChange={(e) => onIslandChange(e.target.value as IslandRegion)}
            aria-label="Seleccionar región costera"
            className="bg-slate-900 border border-slate-700 text-xs text-cyan-300 rounded px-2 py-1 font-medium"
          >
            <option value="Canarias">Canarias</option>
            <option value="Tenerife">Tenerife</option>
            <option value="La Palma">La Palma</option>
            <option value="La Gomera">La Gomera</option>
            <option value="Gran Canaria">Gran Canaria</option>
          </select>
        </div>

        {/* Satellite Imagery View */}
        {onOpenSatelliteImagery && (
          <button
            id="btn-header-satellite"
            onClick={onOpenSatelliteImagery}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-medium transition"
            title="Ver imagen satelital Sentinel/Landsat de la zona"
          >
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Satélite Isla</span>
          </button>
        )}

        {/* Statistical Analysis Button */}
        <button
          id="btn-open-statistical-analysis"
          onClick={onOpenAnalysis}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition ${
            isAnalysisOpen
              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
          }`}
          title="Abrir análisis estadístico"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Estadísticas</span>
        </button>

        {/* Marine Alerts toggle */}
        <button
          id="btn-toggle-alerts"
          onClick={onOpenAlerts}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition ${
            isAlertsOpen
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
          title="Ver alertas ambientales activas"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Alertas</span>
          {activeAlertsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 ml-0.5">
              {activeAlertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
