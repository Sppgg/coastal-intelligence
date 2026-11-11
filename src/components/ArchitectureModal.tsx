import React, { useState } from 'react';
import { 
  Workflow, 
  X, 
  Satellite, 
  Cpu, 
  Database, 
  ShieldAlert, 
  FlaskConical, 
  Bell, 
  MonitorCheck,
  ArrowDown,
  Layers,
  Sparkles,
  Plane,
  Terminal,
  Copy,
  CheckCheck,
  Code2
} from 'lucide-react';
import { COPERNICUS_DATASETS } from '../data/copernicusDatasets';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PIPELINE_STEPS = [
  {
    icon: Satellite,
    title: '1. Ingesta Multi-Fuente Geoespacial (Cartografía Vectorial Oficial & Copernicus)',
    desc: 'Cartografía vectorial oficial de floraciones en Canarias (Tenerife, La Palma, La Gomera), Copernicus Marine CMEMS Ocean Physics (0.494m), CMEMS Biogeochemistry (Hierro fe a 0.506m), Reanálisis ERA5 de Viento a 10m y CAMS EAC4 (Polvo sahariano y PM10).',
    badge: 'Cartografía & Copernicus',
    color: 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300',
  },
  {
    icon: Cpu,
    title: '2. Preprocesado Radiométrico & Atmosférico',
    desc: 'Corrección C2RCC / ACOLITE, enmascaramiento de nubes y sombras, cálculo de reflectancia marina superficial (Rrs) en Sentinel-2 MSI y Sentinel-3 OLCI.',
    badge: 'Pre-processing',
    color: 'border-blue-500/60 bg-blue-950/40 text-blue-300',
  },
  {
    icon: Layers,
    title: '3. Variables Geoespaciales Derivadas',
    desc: 'Cálculo de índices ópticos: NDCI (705/665nm), Clorofila-a (mg/m³), SST thetao (°C), Turbidez (SPM), deposición de fe y velocidad vertical wo.',
    badge: 'Derived Geo-Variables',
    color: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300',
  },
  {
    icon: Sparkles,
    title: '4. Análisis Espaciotemporal',
    desc: 'Detección de discontinuidades espectrales, persistencia multitemporal y filtrado de interferencias por fondos someros o turbidez inorgánica.',
    badge: 'Analysis',
    color: 'border-indigo-500/60 bg-indigo-950/40 text-indigo-300',
  },
  {
    icon: Cpu,
    title: '5. Modelos Numéricos y Algoritmos de Clasificación Bio-Óptica',
    desc: 'Clasificadores espectrales bio-ópticos + modelos de transporte advectivo-difusivo lagrangiano guiados por vectores CMEMS (uo, vo) y vientos horarios ERA5.',
    badge: 'Hydrodynamic Engine',
    color: 'border-purple-500/60 bg-purple-950/40 text-purple-300',
  },
  {
    icon: ShieldAlert,
    title: '6. Anomalía Espectral / Probabilidad Estimada',
    desc: 'Segmentación de polígonos, gradiente de coincidencia (%) y nivel de riesgo predictivo (Bajo, Moderado, Alto, Muy Alto).',
    badge: 'Anomaly / Prob',
    color: 'border-amber-500/60 bg-amber-950/40 text-amber-300',
  },
  {
    icon: FlaskConical,
    title: '7. Validación Oficial (Ground Truth Gate)',
    desc: 'Determinación taxonómica oficial de Trichodesmium erythraeum por autoridades sanitarias y organismos científicos de Canarias.',
    badge: 'Ground Truth Gate',
    color: 'border-teal-500/60 bg-teal-950/40 text-teal-300',
  },
  {
    icon: Bell,
    title: '8. Sistema de Alertas Tempranas',
    desc: 'Generación de avisos automáticos clasificados por severidad para capitanías marítimas, ayuntamientos costeros y servicios de emergencias (1-1-2).',
    badge: 'Alerts',
    color: 'border-rose-500/60 bg-rose-950/40 text-rose-300',
  },
  {
    icon: MonitorCheck,
    title: '9. Visor Web GIS Coastal Guardian',
    desc: 'Plataforma interactiva para la toma de decisiones informadas, visualización de trayectorias, histogramas de distribución y gobernanza ambiental.',
    badge: 'Web GIS Dashboard',
    color: 'border-cyan-400 bg-cyan-950/60 text-white',
  },
];

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'copernicusApis'>('pipeline');
  const [selectedApiDataset, setSelectedApiDataset] = useState<string>('CMEMS_PHY');

  if (!isOpen) return null;

  return (
    <div
      id="coastal-architecture-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-cyan-800/60 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Workflow className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                Arquitectura del Sistema &middot; Pipeline Técnico
              </h2>
              <p className="text-xs text-slate-400">
                Flujo de datos desde Copernicus y CDS hasta la toma de decisiones costera
              </p>
            </div>
          </div>
          <button
            id="btn-close-architecture-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950 px-6 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 ${
              activeTab === 'pipeline'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>1. Pipeline Funcional (9 Fases)</span>
          </button>

          <button
            onClick={() => setActiveTab('copernicusApis')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 ${
              activeTab === 'copernicusApis'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. Datasets Satelitales & Copernicus</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {activeTab === 'pipeline' ? (
            <>
              {/* Conceptual Flow Diagram */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto text-center leading-relaxed">
                <span className="text-slate-400">COPERNICUS CMEMS/ERA5/CAMS</span> &rarr;{' '}
                <span className="text-slate-400">PREPROCESADO</span> &rarr;{' '}
                <span className="text-emerald-400">VARIABLES GEOESPACIALES</span> &rarr;{' '}
                <span className="text-indigo-400">ANÁLISIS</span> &rarr;{' '}
                <span className="text-purple-400">MODELO</span> &rarr;{' '}
                <span className="text-amber-400">ANOMALÍA / PROBABILIDAD</span> &rarr;{' '}
                <span className="text-teal-400 font-bold">VALIDACIÓN OFICIAL</span> &rarr;{' '}
                <span className="text-rose-400">ALERTA</span> &rarr;{' '}
                <span className="text-cyan-400 font-bold">VISOR GIS</span>
              </div>

              <div className="space-y-3">
                {PIPELINE_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="relative">
                      <div className={`p-3.5 rounded-xl border flex items-start gap-3.5 ${step.color}`}>
                        <div className="p-2 rounded-lg bg-slate-950/80 shrink-0 border border-slate-800">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-slate-100 text-sm">{step.title}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-950 border border-slate-800">
                              {step.badge}
                            </span>
                          </div>
                          <p className="text-slate-300 mt-1 leading-relaxed text-xs">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                      {idx < PIPELINE_STEPS.length - 1 && (
                        <div className="flex justify-center -my-1 text-slate-600">
                          <ArrowDown className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Core Principle Notice */}
              <div className="mt-4 p-4 rounded-xl bg-cyan-950/30 border border-cyan-700/40 text-cyan-200">
                <h4 className="font-bold font-mono text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                  Principio Científico de COASTAL GUARDIAN
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Una anomalía espectral o una concentración elevada de clorofila calculada por satélite
                  refleja un parámetro óptico y una acumulación potencial de biomasa, pero <strong>nunca debe
                  interpretarse de forma aislada como una floración de microalgas nociva</strong> ni asociarse a
                  una especie específica sin la previa validación taxonómica en laboratorio (Ground Truth).
                </p>
              </div>
            </>
          ) : (
            /* COPERNICUS DATASETS SPECIFICATION TAB */
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                <p>
                  Catálogo técnico de productos oceanográficos y atmosféricos de Copernicus Marine Service (CMEMS)
                  y Climate Data Store (CDS/ECMWF) integrados para la vigilancia ambiental del archipiélago canario.
                </p>
              </div>

              {/* Dataset buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(COPERNICUS_DATASETS).map(([key, spec]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedApiDataset(key)}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      selectedApiDataset === key
                        ? 'bg-cyan-950 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-cyan-400 font-semibold">{spec.serviceType}</div>
                    <div className="font-bold text-xs mt-0.5 truncate">{spec.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-1 truncate">{spec.id}</div>
                  </button>
                ))}
              </div>

              {/* Selected Dataset Technical Details */}
              {COPERNICUS_DATASETS[selectedApiDataset] && (
                <div className="p-4 bg-slate-950 rounded-xl border border-cyan-900/60 space-y-3 font-mono">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-sans">
                        {COPERNICUS_DATASETS[selectedApiDataset].name}
                      </h4>
                      <div className="text-[10px] text-cyan-400 mt-0.5">
                        Identificador de Producto: {COPERNICUS_DATASETS[selectedApiDataset].id}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Servicio Emisor: {COPERNICUS_DATASETS[selectedApiDataset].provider}
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 text-[10px] border border-slate-700">
                      OGC NetCDF-4
                    </span>
                  </div>

                  {/* Variables table */}
                  <div className="pt-2 border-t border-slate-800 text-[10px]">
                    <span className="text-slate-400 font-bold block mb-1">Variables y Parámetros Biofísicos:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {COPERNICUS_DATASETS[selectedApiDataset].variables.map((v) => (
                        <div key={v.code} className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-cyan-300 font-bold">{v.code}</span>
                          <span className="text-slate-400 ml-1">({v.unit})</span>: {v.name}
                          <p className="text-[9px] text-slate-500 mt-0.5">{v.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spatial and temporal bounds */}
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                    <div><b>Región Geográfica (Bounding Box):</b> {COPERNICUS_DATASETS[selectedApiDataset].spatialBounds.description}</div>
                    <div><b>Ventana Temporal de Validación:</b> {COPERNICUS_DATASETS[selectedApiDataset].timeCoverage}</div>
                    {COPERNICUS_DATASETS[selectedApiDataset].depthMeters !== undefined && (
                      <div><b>Nivel de Profundidad Evaluado:</b> {COPERNICUS_DATASETS[selectedApiDataset].depthMeters} metros (capa de superficie marina)</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>COASTAL GUARDIAN &middot; Estándar OGC / Copernicus Marine & CDS</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
