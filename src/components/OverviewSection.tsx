import React from 'react';
import { 
  Globe2, 
  Waves, 
  Trash2, 
  TrendingDown, 
  Database, 
  BarChart3, 
  ArrowRight, 
  ShieldCheck, 
  Satellite, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Compass,
  FileText,
  Sparkles
} from 'lucide-react';
import { AppSection, IslandRegion } from '../types';
import { REAL_PLASTIC_STUDY_ZONES } from '../data/plasticsData';
import { REAL_COASTAL_SECTORS } from '../data/coastalDynamicsData';

interface OverviewSectionProps {
  onSelectSection: (section: AppSection) => void;
  onSelectIsland: (island: IslandRegion) => void;
  onFocusCoordinates?: (lat: number, lng: number, zoom?: number) => void;
  activeEpisodesCount: number;
  activeAlertsCount: number;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  onSelectSection,
  onSelectIsland,
  onFocusCoordinates,
  activeEpisodesCount,
  activeAlertsCount,
}) => {
  return (
    <div id="overview-section" className="p-5 space-y-6 text-slate-200 font-sans max-w-7xl mx-auto">
      {/* Institutional Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
            <span>SISTEMA DE TELEDETECCIÓN Y ANÁLISIS GEOESPACIAL LITORAL</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
            Monitorización ambiental y dinámica costera del archipiélago canario
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
            Plataforma institucional para el estudio empírico de floraciones algales, delimitación espectral
            de acumulaciones de residuos marinos y análisis multitemporal de retroceso de línea de costa mediante
            datos satelitales Copernicus (CMEMS/CAMS/ERA5), vuelos fotogramétricos UAV y muestreos de referencia.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-mono">
            <span className="text-slate-400">Proyectos integrados:</span>
            <span className="text-cyan-300">Coastal Guardian RIS3</span>
            <span className="text-slate-600">&middot;</span>
            <span className="text-cyan-300">Teledetección Azul</span>
            <span className="text-slate-600">&middot;</span>
            <span className="text-cyan-300">ECOMARIS</span>
            <span className="text-slate-600">&middot;</span>
            <span className="text-slate-400">SITCAN / GRAFCAN</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-400 uppercase font-mono block">Floraciones Registradas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-white tabular-nums">{activeEpisodesCount}</span>
            <span className="text-[10px] text-cyan-400 font-mono">14 SHP Reales</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Copernicus CMEMS &middot; Sentinel-2/3</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-400 uppercase font-mono block">Alertas Activas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-amber-400 tabular-nums">{activeAlertsCount}</span>
            <span className="text-[10px] text-amber-500/80 font-mono">Costas vigiladas</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Riesgo por deriva litoral</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-400 uppercase font-mono block">Zonas Plásticos (UAV)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-cyan-300 tabular-nums">3</span>
            <span className="text-[10px] text-cyan-400 font-mono">15 candidatos</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Con validación Micro-FTIR</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-400 uppercase font-mono block">Sectores DSAS Costa</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">3</span>
            <span className="text-[10px] text-emerald-400 font-mono">15 transectos</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Tasas EPR e incertidumbre</span>
        </div>
      </div>

      {/* The 3 Core Modules Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono mb-3">
          Módulos de Investigación y Monitorización
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Module A */}
          <div 
            onClick={() => onSelectSection('marine')}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-600/70 rounded-xl p-4.5 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                  <Waves className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">
                  MÓDULO A
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Monitorización de Fenómenos Marinos
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Inventario cartográfico de manchas marinas, floraciones de cianobacterias (Trichodesmium)
                y seguimiento de variables oceanográficas reales (temperatura thetao, corrientes uo/vo,
                calima CAMS y viento ERA5).
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
              <span>Abrir visor de manchas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module B */}
          <div 
            onClick={() => onSelectSection('plastics')}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-600/70 rounded-xl p-4.5 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800/80 flex items-center justify-center text-blue-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/50">
                  MÓDULO B
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Detección y Análisis de Residuos Plásticos
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Inspección de ortomosaicos UAV de alta resolución, cálculo de índices espectrales (FDI, PI),
                segmentación en 3 niveles y vinculación estricta de muestras de laboratorio Micro-FTIR/Raman.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
              <span>Examinar zonas y candidatos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module C */}
          <div 
            onClick={() => onSelectSection('dynamics')}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-600/70 rounded-xl p-4.5 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50">
                  MÓDULO C
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Cambios Geomorfológicos y Línea de Costa
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Análisis multitemporal (2018-2026), comparador Before/After tipo swipe cortina,
                cálculo de transectos DSAS con tasas EPR (m/año), NSM e incertidumbre propagada por marea y oleaje.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
              <span>Ver comparador y transectos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Pilot Areas Quick Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Sectores Costeros Piloto en Canarias</h3>
            <p className="text-xs text-slate-400">Observaciones y campañas de calibración georreferenciadas</p>
          </div>
          <button 
            onClick={() => onSelectSection('datasets')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Ver catálogo completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {REAL_PLASTIC_STUDY_ZONES.map((zone) => (
            <div 
              key={zone.id} 
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{zone.name}</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/50">
                    {zone.island}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{zone.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-500">
                  <span>Res: {zone.sensorResolution}</span>
                  <span>&middot;</span>
                  <span>{zone.candidatesCount} candidatos</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectSection('plastics');
                  if (onFocusCoordinates) onFocusCoordinates(zone.center[0], zone.center[1], zone.zoom);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] shrink-0 font-medium transition"
              >
                Localizar
              </button>
            </div>
          ))}

          {REAL_COASTAL_SECTORS.map((sector) => (
            <div 
              key={sector.id} 
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{sector.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800/50">
                    {sector.island}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{sector.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-500">
                  <span>DSAS: {sector.transects.length} transectos</span>
                  <span>&middot;</span>
                  <span>Balance: {sector.sedimentBudgetM2.netM2 > 0 ? '+' : ''}{sector.sedimentBudgetM2.netM2} m²</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectSection('dynamics');
                  if (onFocusCoordinates) onFocusCoordinates(sector.center[0], sector.center[1], sector.zoom);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] shrink-0 font-medium transition"
              >
                Localizar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
