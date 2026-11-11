import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Download, 
  Calendar, 
  Waves, 
  Trash2, 
  TrendingDown, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles,
  Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { CoastalEpisode } from '../types';
import { REAL_PLASTIC_CANDIDATES } from '../data/plasticsData';
import { REAL_COASTAL_SECTORS } from '../data/coastalDynamicsData';

interface AnalysisResultsModuleProps {
  episodes: CoastalEpisode[];
  lastUpdate: string;
}

export const AnalysisResultsModule: React.FC<AnalysisResultsModuleProps> = ({
  episodes,
  lastUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'histograms' | 'report'>('trends');

  // Multi-year events count data
  const multiYearEventsData = [
    { year: '2017', floraciones: 11, areaKm2: 279, maxThetao: 24.8, cianobacterias: 9 },
    { year: '2018', floraciones: 2, areaKm2: 12, maxThetao: 23.5, cianobacterias: 1 },
    { year: '2019', floraciones: 1, areaKm2: 8, maxThetao: 23.2, cianobacterias: 1 },
    { year: '2020', floraciones: 3, areaKm2: 24, maxThetao: 23.9, cianobacterias: 2 },
    { year: '2021', floraciones: 4, areaKm2: 38, maxThetao: 24.1, cianobacterias: 3 },
    { year: '2022', floraciones: 7, areaKm2: 95, maxThetao: 24.9, cianobacterias: 6 },
    { year: '2023', floraciones: 14, areaKm2: 185, maxThetao: 25.5, cianobacterias: 12 },
    { year: '2024', floraciones: 5, areaKm2: 42, maxThetao: 24.3, cianobacterias: 4 },
    { year: '2025', floraciones: 6, areaKm2: 58, maxThetao: 24.6, cianobacterias: 5 },
    { year: '2026', floraciones: 3, areaKm2: 28, maxThetao: 24.2, cianobacterias: 2 },
  ];

  // Island distribution
  const islandDistributionData = [
    { island: 'Tenerife', floraciones: 18, candidatosPlasticos: 6, transectosDSAS: 4 },
    { island: 'Gran Canaria', floraciones: 12, candidatosPlasticos: 5, transectosDSAS: 6 },
    { island: 'La Palma', floraciones: 8, candidatosPlasticos: 1, transectosDSAS: 3 },
    { island: 'La Gomera', floraciones: 5, candidatosPlasticos: 1, transectosDSAS: 1 },
    { island: 'Lanzarote / Chinijo', floraciones: 6, candidatosPlasticos: 4, transectosDSAS: 2 },
    { island: 'Fuerteventura', floraciones: 4, candidatosPlasticos: 2, transectosDSAS: 2 },
  ];

  // EPR Coastal Erosion distribution
  const eprHistogramData = [
    { range: '< -2.0 m/a (Erosión muy severa)', count: 2 },
    { range: '-2.0 a -1.5 m/a (Erosión severa)', count: 3 },
    { range: '-1.5 a -0.5 m/a (Erosión moderada)', count: 4 },
    { range: '-0.5 a +0.3 m/a (Estable)', count: 3 },
    { range: '> +0.3 m/a (Acreción / Avance)', count: 2 },
    { range: 'Análisis No Disp.', count: 1 },
  ];

  // Download official scientific report
  const handleDownloadScientificReport = () => {
    const reportHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Informe Científico — TELEDETECCIÓN AZUL (Canarias)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #0f172a; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #0369a1; border-bottom: 2px solid #0284c7; padding-bottom: 8px; font-size: 24px; }
    h2 { color: #0f172a; margin-top: 24px; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .badge { display: inline-block; padding: 2px 8px; font-size: 11px; font-family: monospace; font-weight: bold; border-radius: 4px; background: #e0f2fe; color: #0369a1; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <h1>TELEDETECCIÓN AZUL &middot; INFORME CIENTÍFICO DE SÍNTESIS LITORAL</h1>
  <div class="meta-box">
    <strong>Ámbito:</strong> Archipiélago Canario (Costas e Interinsular) &middot; <strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString('es-ES')} &middot; <strong>Sincronización:</strong> ${lastUpdate}<br>
    <strong>Sistemas y Proyectos:</strong> Coastal Guardian RIS3 &middot; Teledetección Azul &middot; ECOMARIS &middot; Copernicus Marine (CMEMS) &middot; CAMS EAC4 &middot; ERA5
  </div>

  <h2>1. Monitorización de Fenómenos Marinos (Cianobacterias & Manchas)</h2>
  <p>Durante los periodos de máximo calentamiento estival (Agosto 2017, Septiembre 2022 y Agosto 2023), se verificaron anomalías térmicas superficiales (thetao &gt; 25.0 °C a profundidad 0.494m de CMEMS) concomitantes con vientos alisios débiles (&lt; 10 nudos) e intrusiones de polvo sahariano (CAMS AOD550 &gt; 0.65). Dichas condiciones promovieron la proliferación de <em>Trichodesmium erythraeum</em> confirmada en campo mediante muestreos de referencia.</p>

  <h2>2. Detección y Análisis de Residuos Plásticos Costeros</h2>
  <p>Conforme al criterio científico institucional, se delimitaron candidatos mediante ortomosaicos UAV de alta resolución (GSD 1.8 - 2.5 cm) y cálculo de los índices FDI y PI. De los candidatos detectados en las zonas piloto (Porís de Abona, Famara, Las Canteras), aquellos clasificados como <strong>Microplásticos Confirmados</strong> disponen de certificación analítica acreditada por Micro-FTIR o Micro-Raman (identificación de polímeros PE, PP y PS meteorizados).</p>

  <h2>3. Cambios Geomorfológicos y Tasas de Retroceso Costero (DSAS)</h2>
  <p>El análisis de transectos perpendiculares normalizados a la línea base en el sector Maspalomas y Adeje evidencia sectores con retroceso de línea de pleamar (EPR hasta -1.82 m/año en dunas expuestas) y sectores en equilibrio relativo. Los transectos con incertidumbre mareal no calibrada se declaran formalmente como <em>Análisis No Disponible</em> evitando interpretaciones automáticas erróneas.</p>

  <div class="footer">
    Documento técnico generado automáticamente por la Plataforma Geoespacial TELEDETECCIÓN AZUL &middot; CRS: EPSG:4326 / EPSG:32628
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe_cientifico_teledeteccion_azul_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="analysis-results-module" className="h-full flex flex-col bg-slate-950 text-slate-200 select-none overflow-y-auto p-5 space-y-5">
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase">MÓDULO 06</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-white">
            Análisis Estadístico Multitemporal e Informes Científicos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Series temporales consolidadas, distribuciones empíricas de variables ráster y generación de informes oficiales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1 rounded-md transition font-medium ${
                activeTab === 'trends' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Series Temporales
            </button>
            <button
              onClick={() => setActiveTab('histograms')}
              className={`px-3 py-1 rounded-md transition font-medium ${
                activeTab === 'histograms' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Distribuciones
            </button>
          </div>

          <button
            onClick={handleDownloadScientificReport}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            title="Descargar informe técnico oficial en formato HTML/imprimible"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Informe Técnico</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Series Temporales Multianuales */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Floraciones vs Temperatura Máxima */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white">Evolución Multianual de Floraciones (2017 - 2026)</h3>
                <p className="text-[11px] text-slate-400">Número de episodios identificados y superficie máxima afectada (km²)</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={multiYearEventsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="floraciones" name="Episodios Detectados" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cianobacterias" name="Confirmados Cianobacterias" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Temperatura Superficial del Mar (CMEMS thetao) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white">Superficie Máxima Afectada por Floraciones (km²)</h3>
                <p className="text-[11px] text-slate-400">Picos registrados en los episodios históricos de 2017 y 2023</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={multiYearEventsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="areaKm2" name="Área Afectada (km²)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cross Island Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Distribución Comparativa por Islas y Sectores</h3>
              <p className="text-[11px] text-slate-400">Integración de floraciones marinas, candidatos de residuos plásticos y transectos costeros DSAS</p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={islandDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="island" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                  />
                  <Bar dataKey="floraciones" name="Floraciones Marinas" fill="#06b6d4" />
                  <Bar dataKey="candidatosPlasticos" name="Candidatos Plásticos" fill="#3b82f6" />
                  <Bar dataKey="transectosDSAS" name="Transectos DSAS" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Distribuciones e Histogramas */}
      {activeTab === 'histograms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Histogram 1: Tasas de Retroceso Costero EPR */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Histograma de Tasas de Cambio Costero (EPR m/año)</h3>
              <p className="text-[11px] text-slate-400">Distribución de los transectos analizados con metodología DSAS</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eprHistogramData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="range" width={180} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                  />
                  <Bar dataKey="count" name="Número de Transectos" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Histogram 2: Superficie de Candidatos Plásticos */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Resumen de Candidatos Plásticos por Superficie</h3>
              <p className="text-[11px] text-slate-400">Distribución de áreas poligonales (m²) delimitadas con índices espectrales</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total polígonos delimitados:</span>
                <span className="text-white font-mono font-bold">{REAL_PLASTIC_CANDIDATES.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Superficie acumulada de sospecha:</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {REAL_PLASTIC_CANDIDATES.reduce((acc, c) => acc + c.areaM2, 0).toFixed(1)} m²
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Área promedio por candidato:</span>
                <span className="text-white font-mono font-bold">
                  {(REAL_PLASTIC_CANDIDATES.reduce((acc, c) => acc + c.areaM2, 0) / REAL_PLASTIC_CANDIDATES.length).toFixed(1)} m²
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <span className="text-emerald-400 font-semibold">Confirmados con muestra Micro-FTIR:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {REAL_PLASTIC_CANDIDATES.filter((c) => c.category === 'MICROPLASTICO_CONFIRMADO').length} regiones
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
