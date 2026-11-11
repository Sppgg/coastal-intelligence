import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  ExternalLink, 
  MapPin, 
  CheckCircle,
  Filter
} from 'lucide-react';
import { CoastalAlert } from '../types';

interface AlertsPanelProps {
  alerts: CoastalAlert[];
  isOpen: boolean;
  onClose: () => void;
  onSelectEpisode: (episodeId: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  isOpen,
  onClose,
  onSelectEpisode,
}) => {
  const [filterPriority, setFilterPriority] = useState<'TODAS' | 'ALTA' | 'MODERADA' | 'INFORMATIVA'>('TODAS');

  if (!isOpen) return null;

  const filteredAlerts = filterPriority === 'TODAS' 
    ? alerts 
    : alerts.filter((a) => a.priority === filterPriority);

  const getPriorityBadge = (priority: CoastalAlert['priority']) => {
    switch (priority) {
      case 'ALTA':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 uppercase tracking-wider">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            Alerta Alta
          </span>
        );
      case 'MODERADA':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Alerta Moderada
          </span>
        );
      case 'INFORMATIVA':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700 uppercase tracking-wider">
            <Info className="w-3 h-3 text-blue-400" />
            Informativa
          </span>
        );
    }
  };

  return (
    <div
      id="coastal-alerts-panel"
      className="absolute top-4 right-4 sm:right-20 bottom-24 w-96 max-w-[calc(100vw-2rem)] z-30 bg-slate-950/98 backdrop-blur-md border border-amber-900/40 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
            Alertas y Notificaciones Activas
          </h2>
        </div>
        <button
          id="btn-close-alerts-panel"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Cerrar panel de alertas"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Priority Filter Bar */}
      <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400">Prioridad:</span>
        <div className="flex gap-1">
          {(['TODAS', 'ALTA', 'MODERADA'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                filterPriority === p
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No hay alertas activas en esta categoría.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border text-xs transition ${
                alert.priority === 'ALTA'
                  ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-600'
                  : alert.priority === 'MODERADA'
                  ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                {getPriorityBadge(alert.priority)}
                <span className="text-[10px] text-slate-400 font-mono">
                  {alert.timestamp}
                </span>
              </div>

              <h3 className="font-bold text-slate-100 mt-2 text-xs leading-snug">
                {alert.title}
              </h3>

              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {alert.description}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[10px] text-slate-400">
                  Episodio: <span className="font-mono text-cyan-300 font-semibold">{alert.episodeId}</span>
                </div>

                <button
                  id={`btn-view-alert-map-${alert.id}`}
                  onClick={() => {
                    onSelectEpisode(alert.episodeId);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-medium text-[11px] transition"
                >
                  <span>Ver en mapa</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Action notice */}
              <div className="mt-2 bg-slate-950/70 p-2 rounded text-[10px] text-slate-300 border border-slate-900">
                <span className="text-amber-400 font-bold">Acción: </span>
                {alert.recommendedAction}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400 text-center font-mono">
        Protocolo de Coordinación Autonómica · PEIN / Protección Civil
      </div>
    </div>
  );
};
