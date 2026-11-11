import React from 'react';
import { 
  X, 
  AlertCircle, 
  Calendar, 
  Satellite, 
  CheckCircle, 
  ArrowRight, 
  Waves, 
  Compass,
  Sparkles
} from 'lucide-react';

interface NoBloomsAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onJumpToDate: (date: string) => void;
  onOpenSatelliteImagery?: () => void;
}

export const NoBloomsAlertModal: React.FC<NoBloomsAlertModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onJumpToDate,
  onOpenSatelliteImagery,
}) => {
  if (!isOpen) return null;

  const parts = selectedDate.split('-');
  const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : selectedDate;

  return (
    <div 
      id="modal-no-blooms-alert"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-800/80 rounded-2xl shadow-2xl p-5 text-slate-100 font-sans overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-700/60 text-cyan-300">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Sin Floraciones Detectadas
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {formattedDate}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                No constan episodios activos de microalgas en esta fecha
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Cerrar ventana informativa"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3.5 text-xs text-slate-300">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
            <p>
              Para el día <b className="text-cyan-300">{formattedDate}</b>, los sensores multiespectrales de Copernicus (Sentinel-2, Sentinel-3) y Landsat 8/9 <b className="text-emerald-400">no registran anomalías espectrales</b> ni acumulaciones superficiales de biomasa de microalgas en el litoral de las Islas Canarias.
            </p>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Las condiciones oceánicas (temperatura superficial, clorofila-a y corrientes) se mantienen en niveles basales sin riesgo para la costa.
            </p>
          </div>

          {/* Quick jump suggestions */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-400 block tracking-wider">
              ¿Deseas consultar un episodio de floración registrado?
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  onJumpToDate('2023-08-23');
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/70 text-left transition group"
              >
                <div>
                  <div className="text-xs font-bold text-cyan-200 group-hover:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>23 de Agosto de 2023 (Tenerife TF02)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Pico de floración activa · Área: 24.06 km² · Costa Sureste
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => {
                  onJumpToDate('2017-08-11');
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-rose-400" />
                    <span>11 de Agosto de 2017 (Gran Floración Histórica)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Mayor evento registrado · Área: 279.1 km² · Archipiélago
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {onOpenSatelliteImagery ? (
            <button
              onClick={() => {
                onClose();
                onOpenSatelliteImagery();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition shadow-sm"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Ver Imágenes Satelitales Sentinel/Landsat</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Ver Mapa Base de Este Día
          </button>
        </div>

      </div>
    </div>
  );
};
