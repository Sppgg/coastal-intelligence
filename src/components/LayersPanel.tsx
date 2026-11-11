import React from 'react';
import { 
  Layers, 
  Satellite, 
  Droplet, 
  Thermometer, 
  Waves, 
  Sparkles, 
  Crosshair, 
  Navigation, 
  Compass, 
  Eye, 
  EyeOff,
  ChevronRight,
  ChevronLeft,
  X,
  Wind,
  CloudSun,
  Flame
} from 'lucide-react';
import { LayerSettings } from '../types';

interface LayersPanelProps {
  layers: LayerSettings;
  onToggleLayer: (layerKey: keyof LayerSettings) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  onToggleLayer,
  isOpen,
  onToggleOpen,
}) => {
  if (!isOpen) {
    return (
      <button
        id="btn-open-layers-panel"
        onClick={onToggleOpen}
        className="absolute top-4 left-4 z-20 bg-slate-900/95 hover:bg-slate-800 text-slate-100 px-3.5 py-2.5 rounded-lg border border-cyan-500/40 shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md transition group"
        title="Abrir panel de capas"
      >
        <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
        <span className="font-mono tracking-wider">CAPAS</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      </button>
    );
  }

  return (
    <div
      id="coastal-layers-panel"
      className="absolute top-4 left-4 bottom-24 w-80 max-w-[calc(100vw-2rem)] z-20 bg-slate-950/95 backdrop-blur-md border border-cyan-900/50 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200"
    >
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
            Capas de Información GIS
          </h2>
        </div>
        <button
          id="btn-close-layers-panel"
          onClick={onToggleOpen}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Ocultar panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Groups Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-xs">
        {/* GROUP 1: COPERNICUS MARINE & CAMS / ERA5 (DATOS REALES DEL PDF) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copernicus & CDS (PDF)</span>
            </div>
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              Real API
            </span>
          </div>
          <div className="space-y-1.5 pl-1">
            <LayerToggleItem
              id="layer-toggle-copernicus-sst"
              label="CMEMS Temp. Marina (thetao)"
              description="SST radiométrica superficial a 0.494m de prof."
              active={layers.copernicusSst}
              onToggle={() => onToggleLayer('copernicusSst')}
              badge="0.494m"
              colorDot="bg-rose-400"
            />
            <LayerToggleItem
              id="layer-toggle-copernicus-currents"
              label="CMEMS Corrientes (uo, vo)"
              description="Velocidad y dirección horaria a 0.494m"
              active={layers.copernicusCurrents}
              onToggle={() => onToggleLayer('copernicusCurrents')}
              badge="uo/vo"
              colorDot="bg-cyan-400"
            />
            <LayerToggleItem
              id="layer-toggle-copernicus-fe"
              label="CMEMS Hierro Disuelto (fe)"
              description="Micronutriente biogeoquímico a 0.506m"
              active={layers.copernicusIron}
              onToggle={() => onToggleLayer('copernicusIron')}
              badge="BGC fe"
              colorDot="bg-amber-400"
            />
            <LayerToggleItem
              id="layer-toggle-copernicus-wo"
              label="CMEMS Vel. Vertical (wo)"
              description="Ascenso / descenso vertical (Upwelling a 0.494m)"
              active={layers.copernicusUpwelling}
              onToggle={() => onToggleLayer('copernicusUpwelling')}
              badge="wcur"
              colorDot="bg-blue-400"
            />
            <LayerToggleItem
              id="layer-toggle-cams-dust"
              label="CAMS Polvo Sahariano EAC4"
              description="Espesor óptico de polvo (AOD 550nm) e intrusión"
              active={layers.camsDust}
              onToggle={() => onToggleLayer('camsDust')}
              badge="Calima"
              colorDot="bg-orange-400"
            />
            <LayerToggleItem
              id="layer-toggle-era5-wind"
              label="ERA5 Viento a 10m (u10, v10)"
              description="Reanálisis horario CDS ECMWF de alisios"
              active={layers.era5Wind}
              onToggle={() => onToggleLayer('era5Wind')}
              badge="10m kts"
              colorDot="bg-emerald-400"
            />
          </div>
        </div>

        {/* GROUP 2: SATÉLITE ÓPTICO */}
        <div className="border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2 font-mono">
            <Satellite className="w-3.5 h-3.5" />
            <span>Satélite Óptico</span>
          </div>
          <div className="space-y-1.5 pl-1">
            <LayerToggleItem
              id="layer-toggle-sentinel-2"
              label="Sentinel-2 MSI"
              description="Resolución 10-20m · Óptico multiespectral"
              active={layers.sentinel2}
              onToggle={() => onToggleLayer('sentinel2')}
              badge="MSI B4/B5"
            />
            <LayerToggleItem
              id="layer-toggle-sentinel-3"
              label="Sentinel-3 OLCI"
              description="Color del océano WFR · Bandas Oa08-Oa12"
              active={layers.sentinel3}
              onToggle={() => onToggleLayer('sentinel3')}
              badge="OLCI 300m"
            />
          </div>
        </div>

        {/* GROUP 3: VARIABLES DERIVADAS & ÍNDICES */}
        <div className="border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 font-mono">
            <Droplet className="w-3.5 h-3.5" />
            <span>Variables Derivadas & Índices</span>
          </div>
          <div className="space-y-1.5 pl-1">
            <LayerToggleItem
              id="layer-toggle-ndci"
              label="Índice NDCI (705/665nm)"
              description="Normalizado de clorofila B5-B4"
              active={layers.ndci}
              onToggle={() => onToggleLayer('ndci')}
              colorDot="bg-indigo-400"
            />
            <LayerToggleItem
              id="layer-toggle-chlorophyll"
              label="Clorofila-a Marina"
              description="Concentración estimada por bio-óptica (mg/m³)"
              active={layers.chlorophyll}
              onToggle={() => onToggleLayer('chlorophyll')}
              colorDot="bg-emerald-400"
            />
            <LayerToggleItem
              id="layer-toggle-turbidity"
              label="Turbidez (SPM / NTU)"
              description="Partículas en suspensión litoral"
              active={layers.turbidity}
              onToggle={() => onToggleLayer('turbidity')}
              colorDot="bg-amber-300"
            />
          </div>
        </div>

        {/* GROUP 4: SENSORES OCEANOGRÁFICOS OFICIALES (FUENTES FIABLES) */}
        <div className="border-t border-slate-800/80 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 uppercase tracking-wider font-mono">
              <Compass className="w-3.5 h-3.5" />
              <span>Boyas Oceanográficas Oficiales</span>
            </div>
            <span className="text-[9px] px-1 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
              Puertos del Estado
            </span>
          </div>
          <div className="space-y-1.5 pl-1">
            <LayerToggleItem
              id="layer-toggle-ocean-buoys"
              label="Red Oficial Puertos del Estado / AEMET"
              description="Sensores físicos: SST marina, oleaje (Hs/Tp) y viento"
              active={layers.oceanBuoys}
              onToggle={() => onToggleLayer('oceanBuoys')}
              badge="REDCOS / Exterior"
              colorDot="bg-sky-400"
            />
          </div>
        </div>

        {/* GROUP 5: PREDICCIÓN DE DERIVA */}
        <div className="border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-2 font-mono">
            <Navigation className="w-3.5 h-3.5" />
            <span>Predicción de Deriva Lagrangiana</span>
          </div>
          <div className="space-y-1.5 pl-1">
            <LayerToggleItem
              id="layer-toggle-predicted-trajectory"
              label="Trayectoria Prevista (T0 - 48h)"
              description="Desplazamiento guiado por CMEMS y ERA5"
              active={layers.predictedTrajectory}
              onToggle={() => onToggleLayer('predictedTrajectory')}
              badge="Lagrange"
            />
            <LayerToggleItem
              id="layer-toggle-potential-impact"
              label="Cono de Incertidumbre"
              description="Envolvente de dispersión y probabilidad"
              active={layers.potentialImpactZone}
              onToggle={() => onToggleLayer('potentialImpactZone')}
              colorDot="bg-purple-400"
            />
            <LayerToggleItem
              id="layer-toggle-current-vectors"
              label="Vectores de Corrientes Rejilla"
              description="Flujo hidrodinámico superficial de Canarias"
              active={layers.currentVectors}
              onToggle={() => onToggleLayer('currentVectors')}
              colorDot="bg-sky-300"
            />
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-3.5 py-2 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400 text-center font-mono">
        Copernicus Marine &middot; CDS ECMWF &middot; CAMS EAC4
      </div>
    </div>
  );
};

interface LayerToggleItemProps {
  id: string;
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
  badge?: string;
  colorDot?: string;
}

const LayerToggleItem: React.FC<LayerToggleItemProps> = ({
  id,
  label,
  description,
  active,
  onToggle,
  badge,
  colorDot,
}) => {
  return (
    <button
      id={id}
      onClick={onToggle}
      className={`w-full text-left p-2 rounded-lg border transition flex items-start justify-between gap-2 ${
        active
          ? 'bg-slate-900/90 border-cyan-600/50 text-slate-100 shadow-sm'
          : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-300 hover:bg-slate-900/40'
      }`}
    >
      <div className="flex items-start gap-2">
        {colorDot ? (
          <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${active ? colorDot : 'bg-slate-600'}`} />
        ) : (
          <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${active ? 'bg-cyan-400' : 'bg-slate-600'}`} />
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`font-medium text-[11px] ${active ? 'text-white' : 'text-slate-400'}`}>
              {label}
            </span>
            {badge && (
              <span className="text-[9px] px-1 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                {badge}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-0.5 shrink-0">
        {active ? (
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
        ) : (
          <EyeOff className="w-3.5 h-3.5 text-slate-600" />
        )}
      </div>
    </button>
  );
};
