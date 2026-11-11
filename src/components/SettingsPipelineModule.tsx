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
            Configuración Geoespacial & Pipeline de Procesamiento Científico
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadena metodológica de procesamiento científico (Rasterio, GeoPandas, Shapely) y especificación de backend.
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

      {/* Section B.2: Arquitectura Cartográfica & Proveedores */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Arquitectura Geoespacial & Proveedores de Teselas</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Conexión de alta disponibilidad con servicios de mapas satelitales y batimétricos
            </p>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 font-bold">
            Estándares OGC &middot; EPSG:3857 / EPSG:4326
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Motor Cartográfico</span>
              <span className="text-[10px] text-cyan-400 font-mono">Web GIS</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Visualización geoespacial de alto rendimiento con soporte nativo para capas ráster, geometrías vectoriales complejas e interactividad en tiempo real.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Capas Base Oficiales</span>
              <span className="text-[10px] text-emerald-400 font-mono">Disponibles</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Mosaicos satelitales y batimétricos integrados: <strong>Esri World Satélite</strong>, <strong>PNOA Ortofoto Canarias (IGN 25cm)</strong>, <strong>Esri Ocean Náutico</strong>, <strong>Esri Dark Nocturno</strong> y <strong>OpenStreetMap</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Interoperabilidad OGC</span>
              <span className="text-[10px] text-cyan-400 font-mono">INSPIRE</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Conectores compatibles con servicios WMTS/WMS del Instituto Geográfico Nacional (IGN), IDE Canarias (GRAFCAN) y Copernicus Marine Service.
            </p>
          </div>
        </div>
      </div>

      {/* Section C: Scientific Geoprocessing Modules */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Módulos de Geoprocesamiento y Algoritmos Científicos</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Parámetros de cálculo y ejecución en servidor de backend (GeoPandas, Rasterio, Shapely)
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
              onClick={() => handleRunTask(selectedScript.id)}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Ejecutando...' : 'Lanzar Tarea de Geoprocesamiento'}</span>
            </button>
          </div>
        </div>

        {/* Module Technical Specification */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold block">{selectedScript.module}</span>
              <h4 className="text-sm font-bold text-white">{selectedScript.title}</h4>
            </div>
            <div className="flex items-center gap-1.5">
              {selectedScript.libraries.map((lib) => (
                <span key={lib} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                  {lib}
                </span>
              ))}
            </div>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">{selectedScript.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="text-slate-500 block text-[9.5px]">MODO DE EJECUCIÓN</span>
              <span className="text-cyan-300">Backend Asíncrono</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="text-slate-500 block text-[9.5px]">PROYECCIÓN DE SALIDA</span>
              <span className="text-emerald-300">UTM 28N / EPSG:32628</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="text-slate-500 block text-[9.5px]">CONFORMIDAD OGC</span>
              <span className="text-slate-300">GeoJSON / NetCDF4</span>
            </div>
          </div>
        </div>
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
