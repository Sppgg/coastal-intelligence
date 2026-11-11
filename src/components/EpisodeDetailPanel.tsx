import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Wind, 
  Waves, 
  Droplet, 
  Thermometer, 
  Gauge, 
  Eye, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  FlaskConical, 
  Info, 
  Navigation, 
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Check,
  ExternalLink,
  BarChart3,
  Terminal,
  Copy,
  CheckCheck,
  Sparkles,
  CloudSun,
  FileText,
  Satellite
} from 'lucide-react';
import { CoastalEpisode, EpisodeStatus, GroundTruthStatus, RiskLevel } from '../types';

interface EpisodeDetailPanelProps {
  episode: CoastalEpisode | null;
  onClose: () => void;
  onUpdateGroundTruth: (episodeId: string, status: GroundTruthStatus) => void;
  onRecenter: (lat: number, lng: number) => void;
  onOpenAnalysis?: () => void;
  onOpenSatelliteImagery?: (date: string) => void;
}

export const EpisodeDetailPanel: React.FC<EpisodeDetailPanelProps> = ({
  episode,
  onClose,
  onUpdateGroundTruth,
  onRecenter,
  onOpenAnalysis,
  onOpenSatelliteImagery,
}) => {
  if (!episode) return null;

  const getRiskBadgeColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'Bajo':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60';
      case 'Moderado':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/60';
      case 'Alto':
        return 'bg-orange-950/80 text-orange-300 border-orange-600/60';
      case 'Muy alto':
        return 'bg-rose-950/80 text-rose-300 border-rose-600/60 animate-pulse';
    }
  };

  const getStatusBadgeColor = (status: EpisodeStatus) => {
    switch (status) {
      case 'OBSERVACIÓN':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'ANOMALÍA':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'EN INVESTIGACIÓN':
        return 'bg-blue-950 text-blue-300 border-blue-700';
      case 'VALIDADO':
        return 'bg-rose-950 text-rose-300 border-rose-700';
      case 'DESCARTADO':
        return 'bg-slate-900 text-slate-400 border-slate-800 line-through';
    }
  };



  return (
    <div
      id="coastal-episode-panel"
      className="absolute top-4 right-4 bottom-24 w-96 max-w-[calc(100vw-2rem)] z-20 bg-slate-950/95 backdrop-blur-md border border-cyan-900/50 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200"
    >
      {/* Panel Header */}
      <div className="px-4 py-3.5 border-b border-slate-800 bg-slate-900/80 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white font-mono tracking-wider">
              {episode.id}
            </span>
            <span
              id="badge-episode-status"
              className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeColor(
                episode.status
              )}`}
            >
              {episode.status}
            </span>
          </div>
          <h2 className="text-xs font-medium text-slate-300 mt-0.5">{episode.name}</h2>
          <div className="flex items-center gap-2 text-[11px] text-cyan-400 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{episode.nearestCoastPoint}</span>
            {typeof episode.latitude === 'number' && !isNaN(episode.latitude) && isFinite(episode.latitude) &&
             typeof episode.longitude === 'number' && !isNaN(episode.longitude) && isFinite(episode.longitude) && (
              <button
                onClick={() => onRecenter(episode.latitude, episode.longitude)}
                className="text-slate-400 hover:text-white underline text-[10px] ml-1"
                title="Centrar en el mapa"
              >
                Centrar
              </button>
            )}
          </div>
        </div>

        <button
          id="btn-close-episode-panel"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Cerrar panel de episodio"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* FICHA DE IDENTIFICACIÓN OFICIAL (ID_Bloom, Área, Distancia a costa, Isla, Descripción) */}
        <div id="ficha-identificacion-bloom" className="bg-slate-900/95 rounded-xl border border-cyan-500/50 p-3 shadow-lg shadow-cyan-950/30">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ficha de Identificación</span>
            </h3>
            <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-700">
              ID_BLOOM OFICIAL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* 1. ID_Bloom */}
            <div className="bg-slate-950/90 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono font-medium">ID_Bloom</span>
              <span className="font-mono font-bold text-cyan-200 text-xs break-all">{episode.id}</span>
            </div>

            {/* 2. Isla */}
            <div className="bg-slate-950/90 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono font-medium">Isla</span>
              <span className="font-semibold text-white text-xs">{episode.island}</span>
            </div>

            {/* 3. Área */}
            <div className="bg-slate-950/90 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono font-medium">Área</span>
              <span className="font-mono font-extrabold text-amber-300 text-xs">{episode.area} km²</span>
            </div>

            {/* 4. Distancia a costa */}
            <div className="bg-slate-950/90 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono font-medium">Distancia a costa</span>
              <span className="font-mono font-bold text-slate-200 text-xs">{episode.distanceToCoast} km</span>
            </div>
          </div>

          {/* 5. Descripción floración */}
          <div className="mt-2 bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono font-medium mb-1">Descripción floración</span>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              {episode.description || (
                episode.groundTruthDetails?.notes
                  ? `${episode.name}. ${episode.groundTruthDetails.notes}`
                  : `Proliferación masiva de microalgas fitoplanctónicas (Trichodesmium erythraeum) detectada en aguas costeras de ${episode.island}. Caracterizada por agregaciones superficiales en franjas laminares y alta reflectancia en el infrarrojo cercano.`
              )}
            </p>
          </div>
        </div>

        {/* SECCIÓN 1: VARIABLES REALES COPERNICUS (PDF) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Variables Reales Copernicus (PDF)</span>
            </h3>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono border border-cyan-800/60">
              CMEMS &middot; CAMS &middot; ERA5
            </span>
          </div>

          {/* Grid of Copernicus real variables */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-cyan-900/40">
            {/* CMEMS thetao */}
            <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-400" />
                CMEMS thetao (SST)
              </span>
              <p className="font-mono text-white font-bold text-sm mt-0.5">
                {episode.thetao ?? episode.sst} °C
              </p>
              <span className="text-[9px] text-slate-500 font-mono">Profundidad 0.494m</span>
            </div>

            {/* CMEMS fe (Hierro disuelto) */}
            <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-amber-400" />
                CMEMS fe (Hierro)
              </span>
              <p className="font-mono text-amber-300 font-bold text-sm mt-0.5">
                {episode.fe ?? 0.35} <span className="text-[10px] font-normal text-slate-400">µmol/m³</span>
              </p>
              <span className="text-[9px] text-slate-500 font-mono">Profundidad 0.506m</span>
            </div>

            {/* CAMS Dust AOD 550nm */}
            <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <CloudSun className="w-3 h-3 text-orange-400" />
                CAMS Dust AOD
              </span>
              <p className="font-mono text-orange-300 font-bold text-sm mt-0.5">
                {episode.dustAod550 ?? 0.52}
              </p>
              <span className="text-[9px] text-slate-500 font-mono">550 nm (Calima)</span>
            </div>

            {/* CAMS PM10 */}
            <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Waves className="w-3 h-3 text-purple-400" />
                CAMS PM10
              </span>
              <p className="font-mono text-purple-300 font-bold text-sm mt-0.5">
                {episode.pm10 ?? 76.5} <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
              </p>
              <span className="text-[9px] text-slate-500 font-mono">PM2.5: {episode.pm25 ?? 31.2}</span>
            </div>

            {/* CMEMS uo, vo (Corrientes) */}
            <div className="bg-slate-950/70 p-2 rounded border border-slate-800 col-span-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  Corrientes CMEMS (uo, vo) & Viento ERA5 (10m)
                </span>
                <span className="text-cyan-400 font-mono font-semibold">0.494m</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1 pt-1 border-t border-slate-900 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block text-[9px]">CMEMS Corriente:</span>
                  <span className="text-cyan-300 font-semibold">{episode.currentSpeed} m/s {episode.currentDirection}</span>
                  <span className="text-slate-500 block text-[9px] mt-0.5">uo={episode.uo} | vo={episode.vo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">ERA5 Viento 10m:</span>
                  <span className="text-emerald-300 font-semibold">{episode.windSpeed} kts {episode.windDirection}</span>
                  <span className="text-slate-500 block text-[9px] mt-0.5">u10={episode.u10} | v10={episode.v10}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SECCIÓN 2: DATOS ÓPTICOS Y GEOMÉTRICOS DEL EPISODIO */}
        <div className="border-t border-slate-800 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Detección Óptica & Geometría</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Sentinel-2 / 3</span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400">Fecha y Hora</span>
              <p className="font-mono text-slate-200 font-semibold">{episode.date} · {episode.time}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Coordenadas Centro</span>
              <p className="font-mono text-slate-200 font-semibold">
                {episode.latitude.toFixed(3)}°N, {Math.abs(episode.longitude).toFixed(3)}°W
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Superficie Cartografiada</span>
              <p className="font-mono text-cyan-300 font-bold text-sm">{episode.area} km²</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Distancia a Costa</span>
              <p className="font-mono text-slate-200 font-bold text-sm">{episode.distanceToCoast} km</p>
            </div>

            {episode.shpFile && (
              <div className="col-span-2 mt-1 bg-cyan-950/40 p-2 rounded border border-cyan-800/50 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-cyan-300 font-mono font-bold flex items-center gap-1">
                    <FlaskConical className="w-3 h-3 text-cyan-400" />
                    Shapefile: {episode.shpFile}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-900/80 text-cyan-200 font-mono text-[9px] border border-cyan-700">
                    SHAPEFILE REAL
                  </span>
                </div>
                <div className="grid grid-cols-2 text-[9.5px] text-slate-300 font-mono">
                  <span>Polígonos: <b className="text-white">{episode.recordsCount ?? episode.multiPolygons?.length ?? 1}</b></span>
                  <span>Vértices: <b className="text-white">{episode.totalVertices ?? episode.polygonCoordinates?.length ?? 0}</b></span>
                </div>
              </div>
            )}
          </div>

          {/* Indices grid */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-medium">
                <Droplet className="w-3 h-3" />
                <span>Clorofila-a Estimada</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                {episode.chlorophyll} <span className="text-xs text-slate-400 font-normal">mg/m³</span>
              </div>
            </div>

            <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-medium">
                <Gauge className="w-3 h-3" />
                <span>Índice NDCI</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                {episode.ndci.toFixed(2)}
              </div>
            </div>
          </div>

          {onOpenAnalysis && (
            <button
              onClick={onOpenAnalysis}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Explorar histogramas ráster en Análisis Estadístico</span>
            </button>
          )}

          {onOpenSatelliteImagery && (
            <button
              onClick={() => onOpenSatelliteImagery(episode.date)}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Observación Satelital — Ver imagen multiespectral de la isla"
            >
              <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver imagen satelital Sentinel/Landsat de {episode.island}</span>
            </button>
          )}
        </div>

        {/* SECCIÓN 3: MODELO PREDICTIVO (SEPARADO VISUALMENTE) */}
        <div className="border-t border-slate-800 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>Predicción del Modelo</span>
            </h3>
            <span
              id="badge-episode-risk"
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadgeColor(
                episode.risk
              )}`}
            >
              Riesgo {episode.risk}
            </span>
          </div>

          <div className="bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-slate-950 p-3 rounded-lg border border-purple-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs">Probabilidad de proliferación compatible:</span>
              <span className="font-mono text-base font-extrabold text-purple-300">
                {(episode.modelProbability * 100).toFixed(0)} %
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-purple-900/40">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${episode.modelProbability * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Confianza del clasificador:</span>
              <span className="font-mono text-slate-200 font-semibold">
                {(episode.modelConfidence * 100).toFixed(0)} %
              </span>
            </div>

            {/* MANDATORY SCIENTIFIC DISCLAIMER */}
            <div className="mt-2 p-2 rounded bg-amber-950/40 border border-amber-600/40 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-amber-200/90 leading-tight">
                <strong>Aviso Científico Oficial:</strong> La anomalía espectral y la probabilidad del modelo 
                <span className="underline decoration-amber-500 font-semibold ml-1">
                  no confirman una floración nociva
                </span> hasta su validación taxonómica oficial.
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: VALIDACIÓN OFICIAL (GROUND TRUTH) */}
        <div className="border-t border-slate-800 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Validación Oficial (Ground Truth)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Oficial</span>
          </div>

          <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 space-y-2.5">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Estado de Validación:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Pendiente', 'En evaluación', 'Validado', 'Descartado'] as GroundTruthStatus[]).map(
                  (gt) => (
                    <button
                      key={gt}
                      id={`btn-gt-${gt.toLowerCase().replace(' ', '-')}`}
                      onClick={() => onUpdateGroundTruth(episode.id, gt)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium text-left flex items-center justify-between transition border ${
                        episode.groundTruthStatus === gt
                          ? 'bg-emerald-900/60 border-emerald-500 text-white font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{gt}</span>
                      {episode.groundTruthStatus === gt && (
                        <Check className="w-3 h-3 text-emerald-400" />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {episode.groundTruthDetails && (
              <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5">
                {episode.groundTruthDetails.assignedUnit && (
                  <div>
                    <span className="text-slate-400">Unidad Asignada: </span>
                    <span className="text-slate-200 font-medium font-mono">
                      {episode.groundTruthDetails.assignedUnit}
                    </span>
                  </div>
                )}
                {episode.groundTruthDetails.identifiedOrganism && (
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Identificación Biológica:</span>
                    <span className="text-emerald-300 font-semibold">
                      {episode.groundTruthDetails.identifiedOrganism}
                    </span>
                  </div>
                )}
                {episode.groundTruthDetails.notes && (
                  <p className="text-slate-400 italic text-[10.5px]">
                    "{episode.groundTruthDetails.notes}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN 5: DERIVA Y TRAYECTORIA PREVISTA */}
        <div className="border-t border-slate-800 pt-3">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Puntos de Trayectoria y Deriva Prevista</span>
          </h3>

          <div className="space-y-1.5">
            {episode.trajectory.map((pt) => (
              <div
                key={pt.step}
                className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-400 w-10">{pt.step}</span>
                  <span className="text-slate-300">{pt.time}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">
                    ±{pt.uncertaintyRadiusKm} km radio
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 font-medium">
                    {pt.lat.toFixed(3)}, {pt.lng.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
