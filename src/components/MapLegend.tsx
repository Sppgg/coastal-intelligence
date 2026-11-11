import React, { useState } from 'react';
import { 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon,
  Navigation,
  Compass
} from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      id="coastal-map-legend"
      className="absolute bottom-20 left-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl overflow-hidden text-xs max-w-xs transition select-none"
    >
      {/* Legend header toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-slate-200 hover:text-white font-mono font-bold text-[11px] tracking-wider uppercase"
      >
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Leyenda Cartográfica</span>
        </div>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {isExpanded && (
        <div className="p-3 space-y-3 font-sans">
          {/* Classification of Risk */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
              Clasificación de Riesgo Predictivo
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 shadow-sm flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-white"></span>
                  </span>
                  <span className="text-slate-200 font-medium">Bajo</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">&lt; 35% prob. / &gt; 10 km</span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-200 shadow-sm flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-white"></span>
                  </span>
                  <span className="text-slate-200 font-medium">Moderado</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">35-65% prob.</span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-200 shadow-sm flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-white"></span>
                  </span>
                  <span className="text-slate-200 font-medium">Alto</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">65-85% / Deriva costa</span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-200 shadow-sm animate-pulse flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-white"></span>
                  </span>
                  <span className="text-rose-300 font-bold">Muy alto</span>
                </div>
                <span className="text-[10px] text-rose-400 font-mono">&gt; 85% / &lt; 5 km costa</span>
              </div>
            </div>
          </div>

          {/* Map symbology */}
          <div className="border-t border-slate-800/80 pt-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 font-mono">
              Simbología de Capas
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded border border-cyan-400 bg-cyan-500/30"></span>
                <span className="text-slate-300">Polígono de anomalía espectral</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 border-b-2 border-dashed border-rose-400"></span>
                <span className="text-slate-300">Trayectoria de deriva (T0-48h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded border border-dashed border-purple-400 bg-purple-500/20"></span>
                <span className="text-slate-300">Cono de incertidumbre</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded bg-sky-400"></span>
                <span className="text-slate-300">Vectores de corrientes (CMEMS)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-white"></span>
                <span className="text-slate-300">Boya oceanográfica oficial (Puertos del Estado)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
