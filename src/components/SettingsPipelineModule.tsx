import React, { useState } from 'react';
import { 
  Settings, 
  Terminal, 
  Cpu, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  Compass,
  FileCode2,
  Workflow,
  Sparkles
} from 'lucide-react';
import { PythonPipelineTask } from '../types';
import { pythonPipelineService, REPRODUCIBLE_PYTHON_SCRIPTS } from '../services/pythonPipelineService';

export const SettingsPipelineModule: React.FC = () => {
  const [tasks, setTasks] = useState<PythonPipelineTask[]>(pythonPipelineService.getTasks());
  const [scripts] = useState(REPRODUCIBLE_PYTHON_SCRIPTS);
  const [selectedScriptId, setSelectedScriptId] = useState<string>(scripts[0]?.id || '');
  const [isRunning, setIsRunning] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // CRS Calculator state
  const [activeCRS, setActiveCRS] = useState<'EPSG:4326' | 'EPSG:32628'>('EPSG:4326');
  const [calcLat, setCalcLat] = useState<number>(28.25);
  const [calcLng, setCalcLng] = useState<number>(-16.50);

  const selectedScript = scripts.find((s) => s.id === selectedScriptId) || scripts[0];

  // Approximate transformation from WGS84 (Lat, Lng) to UTM zone 28N (X, Y)
  const computeUTM28N = (lat: number, lng: number) => {
    // Standard central meridian for UTM Zone 28N is -15°
    const lambda0 = -15 * (Math.PI / 180);
    const phi = lat * (Math.PI / 180);
    const lambda = lng * (Math.PI / 180);
    const a = 6378137.0; // WGS84 semi-major axis
    const k0 = 0.9996;
    const x = 500000 + k0 * a * (lambda - lambda0) * Math.cos(phi);
    const y = k0 * a * phi;
    return {
      eastingX: Math.round(x),
      northingY: Math.round(y),
    };
  };

  const utmCoords = computeUTM28N(calcLat, calcLng);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunTask = async (scriptId: string) => {
    setIsRunning(true);
    try {
      await pythonPipelineService.runPipelineTask(scriptId);
      setTasks(pythonPipelineService.getTasks());
    } finally {
      setIsRunning(false);
    }
  };

  const getStepBadge = (step: PythonPipelineTask['step']) => {
    switch (step) {
      case 'INGESTA': return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'VALIDACION': return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'NORMALIZACION': return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      case 'GEOREFERENCIACION': return 'bg-teal-950 text-teal-300 border-teal-800';
      case 'CONTROL_DUPLICADOS': return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'ENRIQUECIMIENTO': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'EXPORTACION': return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'PUBLICACION': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div id="settings-pipeline-module" className="h-full flex flex-col bg-slate-950 text-slate-200 select-none overflow-y-auto p-5 space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Workflow className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase">MÓDULO 07</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-white">
            Configuración Geoespacial & Pipeline de Automatización Python
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadena reproducible de procesamiento científico (Rasterio, GeoPandas, Shapely) y especificación de backend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Servicios de Procesamiento: Activos</span>
          </div>
        </div>
      </div>

      {/* Section A: Formal Processing Pipeline Chain */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-white">Cadena Formal de Procesamiento Reproducible</h3>
          <p className="text-xs text-slate-400">
            Flujo de trabajo estandarizado para la ingesta, control topológico, enriquecimiento y publicación de inventarios
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs font-mono">
          {[
            { step: '01. INGESTA', desc: 'NetCDF / Satélite / UAV' },
            { step: '02. VALIDACIÓN', desc: 'Topología & Nulos' },
            { step: '03. NORMALIZACIÓN', desc: 'Atributos & Esquema' },
            { step: '04. GEOREF', desc: 'EPSG:4326 / 32628' },
            { step: '05. DUPLICADOS', desc: 'Intersección IoU' },
            { step: '06. ENRIQUECER', desc: 'FDI, SST, Viento' },
            { step: '07. EXPORTAR', desc: 'GeoJSON / GeoTIFF' },
            { step: '08. PUBLICAR', desc: 'Visor Operativo' },
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-cyan-400">{item.step}</span>
              <span className="text-[9px] text-slate-500 mt-1">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section B: Coordinate Reference System (CRS) Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Parámetros Geodésicos & Conversión de Coordenadas</h3>
            <p className="text-xs text-slate-400">
              Soporte nativo para sistemas de referencia oficiales en Canarias
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            RECAN95 / UTM 28N &middot; WGS84
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <span className="text-slate-400 font-bold block">EPSG:4326 &middot; Coordenadas Geográficas (WGS84)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block">Latitud (°N):</label>
                <input
                  type="number"
                  step="0.001"
                  value={calcLat}
                  onChange={(e) => setCalcLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Longitud (°W):</label>
                <input
                  type="number"
                  step="0.001"
                  value={calcLng}
                  onChange={(e) => setCalcLng(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <span className="text-slate-400 font-bold block">EPSG:32628 &middot; Coordenadas Proyectadas UTM Huso 28N</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block">X Este (metros):</label>
                <div className="p-1.5 rounded bg-slate-900 text-cyan-300 font-bold border border-slate-800">
                  {utmCoords.eastingX.toLocaleString()} m
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Y Norte (metros):</label>
                <div className="p-1.5 rounded bg-slate-900 text-cyan-300 font-bold border border-slate-800">
                  {utmCoords.northingY.toLocaleString()} m
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section B.2: Arquitectura Leaflet & Proveedores de Teselas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Arquitectura de Leaflet & Proveedores de Teselas Cartográficas</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Estado de licencias, llaves de acceso y conexión con servicios de mapas satelitales
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">
            Leaflet v1.9.4 &middot; Open-Source
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Leaflet Core Engine</span>
              <span className="text-[10px] text-emerald-400 font-mono">Sin API Key</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Leaflet es una biblioteca JavaScript 100% libre (licencia BSD de 2 cláusulas) que <strong>no requiere ninguna API key propia</strong> para funcionar ni impone límites de inicialización.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Capas Base Abiertas</span>
              <span className="text-[10px] text-emerald-400 font-mono">Operativas</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Proveedores por defecto 100% abiertos sin marcas de agua: <strong>Esri World Satélite</strong>, <strong>PNOA Ortofoto Canarias (IGN)</strong>, <strong>Esri Ocean Náutico</strong>, <strong>Esri Dark Nocturno</strong> y <strong>OpenStreetMap</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Proveedores Comerciales (.env)</span>
              <span className="text-[10px] text-cyan-400 font-mono">Opcional</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Soporte integrado para tokens de Mapbox (<code className="text-cyan-300">VITE_MAPBOX_ACCESS_TOKEN</code>) o MapTiler (<code className="text-cyan-300">VITE_MAPTILER_API_KEY</code>) configurables en el archivo de entorno.
            </p>
          </div>
        </div>
      </div>

      {/* Section C: Reproducible Python Code & Script Runner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              <span>Scripts Python de Procesamiento Científico (GeoPandas / Rasterio / Shapely)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Código fuente oficial y reproducible para ejecución local o en contenedor de backend
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedScriptId}
              onChange={(e) => setSelectedScriptId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
            >
              {scripts.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.module}: {sc.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleCopyCode(selectedScript.code, selectedScript.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition"
            >
              {copiedId === selectedScript.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === selectedScript.id ? 'Copiado' : 'Copiar Script'}</span>
            </button>

            <button
              onClick={() => handleRunTask(selectedScript.id)}
              disabled={isRunning}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Ejecutando...' : 'Lanzar Tarea'}</span>
            </button>
          </div>
        </div>

        {/* Script Details */}
        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-400">Bibliotecas:</span>
            {selectedScript.libraries.map((lib) => (
              <span key={lib} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                {lib}
              </span>
            ))}
          </div>
          <p className="text-slate-300 text-xs">{selectedScript.description}</p>
        </div>

        {/* Code Preview */}
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-80 leading-relaxed">
          {selectedScript.code}
        </pre>
      </div>

      {/* Section D: Processing Tasks Activity Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Registro de Actividad y Tareas Geoprocesadas</h3>
          <span className="text-[10px] font-mono text-slate-400">{tasks.length} registros</span>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-500">{task.id}</span>
                  <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${getStepBadge(task.step)}`}>
                    {task.step}
                  </span>
                  <span className="font-semibold text-white">{task.name}</span>
                </div>
                <p className="text-[11px] text-slate-400">{task.notes}</p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 shrink-0">
                <span>Registros: <strong className="text-cyan-300">{task.recordsProcessed}</strong></span>
                <span>Duración: {task.durationMs}ms</span>
                <span className="text-slate-500">{task.timestamp}</span>
                <span className="text-emerald-400 font-bold">● {task.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
