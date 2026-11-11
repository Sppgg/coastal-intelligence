import React, { useState } from 'react';
import { 
  Trash2, 
  MapPin, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  FlaskConical, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Eye, 
  Info,
  Maximize2,
  RefreshCw,
  FileSpreadsheet,
  FileCode2,
  Cpu
} from 'lucide-react';
import { 
  PlasticStudyZone, 
  PlasticCandidatePolygon, 
  PlasticDetectionCategory, 
  PlasticSegmentationMethod,
  FieldSampleRecord 
} from '../types';
import { REAL_PLASTIC_STUDY_ZONES, REAL_PLASTIC_CANDIDATES } from '../data/plasticsData';

interface PlasticsModuleProps {
  onFocusCoordinates: (lat: number, lng: number, zoom?: number) => void;
  selectedCandidateId?: string | null;
  onSelectCandidate?: (candidate: PlasticCandidatePolygon | null) => void;
}

export const PlasticsModule: React.FC<PlasticsModuleProps> = ({
  onFocusCoordinates,
  selectedCandidateId,
  onSelectCandidate,
}) => {
  const [zones] = useState<PlasticStudyZone[]>(REAL_PLASTIC_STUDY_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ZONE-PORIS');
  const [candidates, setCandidates] = useState<PlasticCandidatePolygon[]>(REAL_PLASTIC_CANDIDATES);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<PlasticDetectionCategory | 'TODOS'>('TODOS');
  const [activeMethod, setActiveMethod] = useState<PlasticSegmentationMethod>('SIG_CONVENCIONAL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSpectralIndex, setActiveSpectralIndex] = useState<'RGB' | 'FDI' | 'PI' | 'NDWI'>('FDI');
  const [selectedCandidate, setSelectedCandidate] = useState<PlasticCandidatePolygon | null>(
    candidates[0] || null
  );

  // Field sample association modal
  const [isAssociatingSample, setIsAssociatingSample] = useState(false);
  const [sampleForm, setSampleForm] = useState<Partial<FieldSampleRecord>>({
    labMethod: 'Micro-FTIR',
    polymerType: 'Polietileno (PE)',
    concentration: 25.0,
    concentrationUnit: 'partículas/m²',
    sizeFraction: '1 - 5 mm (Microplástico)',
    labResponsible: 'Laboratorio de Teledetección y Química Marina (ULL)',
    labNotes: 'Análisis espectrométrico de micropartículas extraídas en cuadrícula 50x50cm.',
    validationStatus: 'VALIDADO_LABORATORIO',
  });

  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  const filteredCandidates = candidates.filter((c) => {
    if (c.zoneId !== selectedZoneId) return false;
    if (activeCategoryFilter !== 'TODOS' && c.category !== activeCategoryFilter) return false;
    return true;
  });

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    const zone = zones.find((z) => z.id === zoneId);
    if (zone) {
      onFocusCoordinates(zone.center[0], zone.center[1], zone.zoom);
    }
  };

  const handleSelectCandidateItem = (c: PlasticCandidatePolygon) => {
    setSelectedCandidate(c);
    if (onSelectCandidate) onSelectCandidate(c);
    onFocusCoordinates(c.centroid[0], c.centroid[1], 18);
  };

  // Run segmentation pipeline on current AOI
  const handleRunSegmentation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Produce an additional candidate polygon with realistic coordinates
      const newCandidate: PlasticCandidatePolygon = {
        id: `CAND-${Date.now().toString().slice(-4)}`,
        zoneId: selectedZoneId,
        name: `Detección ${activeMethod === 'SIG_CONVENCIONAL' ? 'SIG (FDI)' : activeMethod === 'MACHINE_LEARNING' ? 'ML (RF)' : 'DL (U-Net)'} #${filteredCandidates.length + 1}`,
        coordinates: [
          [currentZone.center[0] + 0.0002, currentZone.center[1] + 0.0002],
          [currentZone.center[0] + 0.00035, currentZone.center[1] + 0.0001],
          [currentZone.center[0] + 0.00028, currentZone.center[1] - 0.0001],
          [currentZone.center[0] + 0.00012, currentZone.center[1] + 0.00005],
          [currentZone.center[0] + 0.0002, currentZone.center[1] + 0.0002],
        ],
        areaM2: Number((Math.random() * 15 + 4).toFixed(1)),
        perimeterM: Number((Math.random() * 10 + 8).toFixed(1)),
        centroid: [currentZone.center[0] + 0.00024, currentZone.center[1] + 0.00006],
        category: 'ANOMALIA_SOSPECHOSA', // By scientific restriction: starts as anomaly until lab verified!
        method: activeMethod,
        confidenceScore: Number((Math.random() * 0.2 + 0.75).toFixed(2)),
        spectralIndices: {
          fdi: Number((Math.random() * 0.15 + 0.09).toFixed(3)),
          pi: Number((Math.random() * 0.2 + 0.55).toFixed(2)),
          ndwi: -0.28,
        },
        detectionDate: new Date().toISOString().split('T')[0],
        sensor: currentZone.sensorResolution,
        resolutionM: 0.025,
        status: 'CANDIDATO',
        reviewedBy: 'Técnico de guardia Teledetección Azul',
        reviewNotes: 'Delimitación automática mediante umbralización adaptativa. Pendiente de revisión in situ.',
      };

      setCandidates((prev) => [newCandidate, ...prev]);
      setSelectedCandidate(newCandidate);
      onFocusCoordinates(newCandidate.centroid[0], newCandidate.centroid[1], 18);
    }, 1100);
  };

  // Associate field sample to current candidate
  const handleSaveFieldSample = () => {
    if (!selectedCandidate) return;

    const sampleRecord: FieldSampleRecord = {
      id: `MUESTRA-LAB-${Date.now().toString().slice(-4)}`,
      samplingDate: new Date().toISOString().split('T')[0],
      sampleCoordinates: selectedCandidate.centroid,
      labMethod: sampleForm.labMethod as any || 'Micro-FTIR',
      polymerType: sampleForm.polymerType as any || 'Polietileno (PE)',
      concentration: Number(sampleForm.concentration) || 20,
      concentrationUnit: sampleForm.concentrationUnit as any || 'partículas/m²',
      sizeFraction: sampleForm.sizeFraction as any || '1 - 5 mm (Microplástico)',
      labResponsible: sampleForm.labResponsible || 'Lab. Química Marina',
      labNotes: sampleForm.labNotes || 'Confirmación de laboratorio registrada.',
      validationStatus: 'VALIDADO_LABORATORIO',
      certificateRef: `CERT-${Date.now().toString().slice(-5)}`,
    };

    const updated: PlasticCandidatePolygon = {
      ...selectedCandidate,
      category: 'MICROPLASTICO_CONFIRMADO', // Now empirically confirmed!
      fieldSample: sampleRecord,
      status: 'CONFIRMADO',
      reviewNotes: `Validado con muestra analítica ${sampleRecord.id} (${sampleRecord.labMethod} - ${sampleRecord.polymerType}).`,
    };

    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCandidate(updated);
    setIsAssociatingSample(false);
  };

  // Export filtered candidates to GeoJSON
  const handleExportGeoJSON = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      features: filteredCandidates.map((c) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [c.coordinates.map((pt) => [pt[1], pt[0]])], // [lng, lat]
        },
        properties: {
          id: c.id,
          name: c.name,
          category: c.category,
          method: c.method,
          area_m2: c.areaM2,
          perimeter_m: c.perimeterM,
          fdi: c.spectralIndices.fdi,
          pi: c.spectralIndices.pi,
          confidence: c.confidenceScore,
          date: c.detectionDate,
          sensor: c.sensor,
          lab_validation: c.fieldSample?.validationStatus || 'NO_VERIFICADO',
          polymer: c.fieldSample?.polymerType || null,
          concentration: c.fieldSample ? `${c.fieldSample.concentration} ${c.fieldSample.concentrationUnit}` : null,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidatos_plasticos_${currentZone.id.toLowerCase()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export filtered candidates to CSV
  const handleExportCSV = () => {
    const headers = ['id', 'nombre', 'zona', 'categoria', 'metodo', 'area_m2', 'perimetro_m', 'fdi', 'pi', 'fecha', 'metodo_lab', 'polimero', 'concentracion', 'estado_validacion'];
    const rows = filteredCandidates.map((c) => [
      c.id,
      `"${c.name}"`,
      currentZone.name,
      c.category,
      c.method,
      c.areaM2,
      c.perimeterM,
      c.spectralIndices.fdi,
      c.spectralIndices.pi,
      c.detectionDate,
      c.fieldSample?.labMethod || 'N/A',
      c.fieldSample?.polymerType || 'N/A',
      c.fieldSample?.concentration || 'N/A',
      c.fieldSample?.validationStatus || 'PENDIENTE',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidatos_plasticos_${currentZone.id.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryBadge = (cat: PlasticDetectionCategory) => {
    switch (cat) {
      case 'MICROPLASTICO_CONFIRMADO':
        return {
          label: 'Microplástico Confirmado (Lab)',
          classes: 'bg-emerald-950 text-emerald-300 border border-emerald-700/80',
          dot: 'bg-emerald-400',
        };
      case 'RESIDUO_VISIBLE':
        return {
          label: 'Residuo Plástico Visible',
          classes: 'bg-amber-950 text-amber-300 border border-amber-700/80',
          dot: 'bg-amber-400',
        };
      case 'ANOMALIA_SOSPECHOSA':
        return {
          label: 'Anomalía Espectral Sospechosa',
          classes: 'bg-cyan-950 text-cyan-300 border border-cyan-800/80',
          dot: 'bg-cyan-400',
        };
    }
  };

  return (
    <div id="plastics-module-panel" className="h-full flex flex-col bg-slate-950 text-slate-200 select-none">
      {/* Top Banner: Scientific Restriction (Mandatory) */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-300 leading-normal">
          <strong className="text-white">Criterio Científico Riguroso:</strong> Ninguna detección por teledetección (RGB/multiespectral) se clasifica como microplástico exclusivamente por su respuesta espectral. El sistema distingue entre <span className="text-amber-300 font-semibold">Residuos visibles</span>, <span className="text-cyan-300 font-semibold">Anomalías sospechosas</span> y <span className="text-emerald-300 font-semibold">Microplásticos confirmados</span> (únicamente con análisis Micro-FTIR o Raman).
        </p>
      </div>

      {/* Main Content Workspace: Left Sidebar + Center Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Controls, Zones & Candidate List */}
        <div className="w-80 md:w-96 border-r border-slate-800/80 flex flex-col bg-slate-950/70 shrink-0 overflow-y-auto p-4 space-y-4">
          {/* Study Zone Selection */}
          <div>
            <label className="text-[11px] uppercase font-mono text-slate-400 block mb-1.5 font-bold">
              Zona de Estudio Costera (Canarias)
            </label>
            <div className="space-y-1.5">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  id={`btn-zone-${zone.id.toLowerCase()}`}
                  onClick={() => handleSelectZone(zone.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition ${
                    selectedZoneId === zone.id
                      ? 'bg-cyan-950/80 border-cyan-600 text-white shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{zone.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/60">
                      {zone.island}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{zone.description}</p>
                  <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500 mt-1.5 pt-1 border-t border-slate-800/60">
                    <span>GSD: {zone.sensorResolution.split('(')[0]}</span>
                    <span>Vuelo: {zone.recentFlightDate}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Spectral Index & Segmentation Controls */}
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-300 block mb-1.5">
                Capa de Análisis Espectral
              </span>
              <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
                {(['RGB', 'FDI', 'PI', 'NDWI'] as const).map((idxKey) => (
                  <button
                    key={idxKey}
                    onClick={() => setActiveSpectralIndex(idxKey)}
                    className={`py-1 rounded text-center font-bold transition border ${
                      activeSpectralIndex === idxKey
                        ? 'bg-cyan-600 border-cyan-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {idxKey}
                  </button>
                ))}
              </div>
              <p className="text-[9.5px] text-slate-500 mt-1 font-mono">
                {activeSpectralIndex === 'FDI' && 'FDI: Floating Debris Index (Biermann et al. 2020)'}
                {activeSpectralIndex === 'PI' && 'PI: Plastic Index (Themistocleous et al. 2020)'}
                {activeSpectralIndex === 'NDWI' && 'NDWI: Normalized Difference Water Index (McFeeters)'}
                {activeSpectralIndex === 'RGB' && 'Composición color verdadero ortomosaico UAV'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold text-slate-300 block mb-1.5">
                Método de Segmentación
              </span>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setActiveMethod('SIG_CONVENCIONAL')}
                  className={`w-full text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                    activeMethod === 'SIG_CONVENCIONAL'
                      ? 'bg-cyan-950 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-semibold block text-[11px]">Nivel 1 &middot; SIG Convencional</span>
                    <span className="text-[9.5px] text-slate-500 block">Umbralización Otsu + Morfología ráster</span>
                  </div>
                  {activeMethod === 'SIG_CONVENCIONAL' && <span className="text-cyan-400 text-xs">●</span>}
                </button>

                <button
                  onClick={() => setActiveMethod('MACHINE_LEARNING')}
                  className={`w-full text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                    activeMethod === 'MACHINE_LEARNING'
                      ? 'bg-cyan-950 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-semibold block text-[11px]">Nivel 2 &middot; Machine Learning</span>
                    <span className="text-[9.5px] text-slate-500 block">Random Forest sobre firmas espectrales</span>
                  </div>
                  {activeMethod === 'MACHINE_LEARNING' && <span className="text-cyan-400 text-xs">●</span>}
                </button>

                <button
                  onClick={() => setActiveMethod('DEEP_LEARNING')}
                  className={`w-full text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                    activeMethod === 'DEEP_LEARNING'
                      ? 'bg-cyan-950 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-semibold block text-[11px]">Nivel 3 &middot; Deep Learning</span>
                    <span className="text-[9.5px] text-slate-500 block">Segmentación semántica U-Net (MARIDA)</span>
                  </div>
                  {activeMethod === 'DEEP_LEARNING' && <span className="text-cyan-400 text-xs">●</span>}
                </button>
              </div>
            </div>

            <button
              onClick={handleRunSegmentation}
              disabled={isProcessing}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Ejecutando segmentación...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Delimitar Candidatos en AOI</span>
                </>
              )}
            </button>
          </div>

          {/* Candidates Filter & List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                Candidatos ({filteredCandidates.length})
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleExportGeoJSON}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                  title="Exportar GeoJSON de polígonos candidatos"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                  title="Exportar CSV tabular"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1 text-[10px]">
              {(['TODOS', 'RESIDUO_VISIBLE', 'ANOMALIA_SOSPECHOSA', 'MICROPLASTICO_CONFIRMADO'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded border transition ${
                    activeCategoryFilter === cat
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'TODOS' ? 'Todos' : cat === 'RESIDUO_VISIBLE' ? 'Visible' : cat === 'ANOMALIA_SOSPECHOSA' ? 'Anomalía' : 'Confirmado'}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {filteredCandidates.map((c) => {
                const badge = getCategoryBadge(c.category);
                const isSelected = selectedCandidate?.id === c.id;

                return (
                  <button
                    key={c.id}
                    id={`candidate-row-${c.id.toLowerCase()}`}
                    onClick={() => handleSelectCandidateItem(c)}
                    className={`w-full text-left p-2.5 rounded-lg border transition ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate max-w-[190px]">{c.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{c.areaM2} m²</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span className="text-[10px] text-slate-400 truncate">{badge.label}</span>
                    </div>

                    <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500 mt-1.5 pt-1 border-t border-slate-800/50">
                      <span>FDI: {c.spectralIndices.fdi}</span>
                      <span>Método: {c.method === 'SIG_CONVENCIONAL' ? 'SIG' : c.method === 'MACHINE_LEARNING' ? 'ML' : 'DL'}</span>
                      {c.fieldSample ? (
                        <span className="text-emerald-400 font-bold">● Lab OK</span>
                      ) : (
                        <span className="text-slate-500">Sin muestra</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Inspection Workbench */}
        <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4">
          {selectedCandidate ? (
            <div className="space-y-4 max-w-4xl">
              {/* Header of Candidate */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-400">{selectedCandidate.id}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${getCategoryBadge(selectedCandidate.category).classes}`}>
                      {getCategoryBadge(selectedCandidate.category).label}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedCandidate.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sector: {currentZone.name} &middot; Centroide: {selectedCandidate.centroid[0].toFixed(5)}, {selectedCandidate.centroid[1].toFixed(5)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onFocusCoordinates(selectedCandidate.centroid[0], selectedCandidate.centroid[1], 19)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Ver en Mapa</span>
                  </button>

                  <button
                    onClick={() => setIsAssociatingSample(true)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>{selectedCandidate.fieldSample ? 'Editar Muestra Lab' : 'Asociar Muestra Campo'}</span>
                  </button>
                </div>
              </div>

              {/* Spatial & Spectral Attributes Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Superficie Delimitada</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-mono font-bold text-white">{selectedCandidate.areaM2}</span>
                    <span className="text-xs text-slate-400 font-mono">m²</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Perímetro: {selectedCandidate.perimeterM} m</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Índice FDI (Biermann)</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-mono font-bold text-cyan-400">{selectedCandidate.spectralIndices.fdi}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">PI (Themistocleous): {selectedCandidate.spectralIndices.pi}</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Sensor / Resolución</span>
                  <div className="mt-1">
                    <span className="text-xs font-semibold text-slate-200 block truncate">{selectedCandidate.sensor}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">GSD: {selectedCandidate.resolutionM * 100} cm</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Método de Detección</span>
                  <div className="mt-1">
                    <span className="text-xs font-semibold text-slate-200 block">{selectedCandidate.method}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Confianza: {selectedCandidate.confidenceScore ? `${Math.round(selectedCandidate.confidenceScore * 100)}%` : 'No calibrada'}</span>
                  </div>
                </div>
              </div>

              {/* Field & Lab Validation Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Validación de Laboratorio y Muestreo de Campo</h3>
                  </div>

                  {selectedCandidate.fieldSample ? (
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/80 font-bold">
                      ● Muestra Verificada
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-700/80">
                      Sin muestra de referencia asociada
                    </span>
                  )}
                </div>

                {selectedCandidate.fieldSample ? (
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block">ID Muestra:</span>
                        <span className="text-white font-bold">{selectedCandidate.fieldSample.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Técnica Analítica:</span>
                        <span className="text-cyan-300 font-bold">{selectedCandidate.fieldSample.labMethod}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Polímero Identificado:</span>
                        <span className="text-emerald-300 font-bold">{selectedCandidate.fieldSample.polymerType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Concentración Real:</span>
                        <span className="text-white font-bold">{selectedCandidate.fieldSample.concentration} {selectedCandidate.fieldSample.concentrationUnit}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-slate-500 text-[10px] block font-mono">Informe del Laboratorio:</span>
                      <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">{selectedCandidate.fieldSample.labNotes}</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Responsable: {selectedCandidate.fieldSample.labResponsible} &middot; Cert: {selectedCandidate.fieldSample.certificateRef}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 p-4 rounded-lg border border-dashed border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                      Esta región se mantiene como <strong>Anomalía Sospechosa</strong> o <strong>Residuo Visible</strong>. 
                      Para acreditar científicamente la presencia de microplásticos, asocie un registro analítico de laboratorio Micro-FTIR o Raman.
                    </p>
                    <button
                      onClick={() => setIsAssociatingSample(true)}
                      className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition inline-flex items-center gap-1.5"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Registrar toma de muestra en campo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Review & Notes */}
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-1">
                <span className="text-slate-400 font-mono text-[10px] block">Notas de inspección humana:</span>
                <p className="text-slate-300">{selectedCandidate.reviewNotes || 'Sin notas registradas.'}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Revisado por: {selectedCandidate.reviewedBy || 'Sistema automatizado'} &middot; Fecha detección: {selectedCandidate.detectionDate}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <Trash2 className="w-10 h-10 text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No hay candidato seleccionado</p>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                Seleccione un polígono candidato del panel izquierdo o ejecute la segmentación en el área de interés.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Associate Field Sample */}
      {isAssociatingSample && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Vincular Muestra de Campo & Análisis de Laboratorio</h3>
              </div>
              <button 
                onClick={() => setIsAssociatingSample(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Método Analítico de Laboratorio:</label>
                <select
                  value={sampleForm.labMethod}
                  onChange={(e) => setSampleForm({ ...sampleForm, labMethod: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs"
                >
                  <option value="Micro-FTIR">Micro-FTIR (Espectroscopía infrarroja por transformada de Fourier)</option>
                  <option value="Micro-Raman">Micro-Raman (Microespectrometría Raman)</option>
                  <option value="Pirólisis-GCMS">Pirólisis-GCMS (Cromatografía de gases / Masas)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Polímero Principal:</label>
                  <select
                    value={sampleForm.polymerType}
                    onChange={(e) => setSampleForm({ ...sampleForm, polymerType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs"
                  >
                    <option value="Polietileno (PE)">Polietileno (PE / LDPE / HDPE)</option>
                    <option value="Polipropileno (PP)">Polipropileno (PP)</option>
                    <option value="Poliestireno (PS)">Poliestireno (PS / EPS)</option>
                    <option value="PET">Polietileno tereftalato (PET)</option>
                    <option value="PVC">Policloruro de vinilo (PVC)</option>
                    <option value="Mezcla / Fibras sintéticas">Mezcla / Fibras sintéticas</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Concentración Medida:</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={sampleForm.concentration}
                      onChange={(e) => setSampleForm({ ...sampleForm, concentration: parseFloat(e.target.value) })}
                      className="w-20 bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs"
                    />
                    <select
                      value={sampleForm.concentrationUnit}
                      onChange={(e) => setSampleForm({ ...sampleForm, concentrationUnit: e.target.value as any })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-xs"
                    >
                      <option value="partículas/m²">partículas/m²</option>
                      <option value="mg/kg sedimento">mg/kg sedimento</option>
                      <option value="ítems/100m transecto">ítems/100m transecto</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Laboratorio Responsable:</label>
                <input
                  type="text"
                  value={sampleForm.labResponsible}
                  onChange={(e) => setSampleForm({ ...sampleForm, labResponsible: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Dictamen y Observaciones Técnicas:</label>
                <textarea
                  rows={3}
                  value={sampleForm.labNotes}
                  onChange={(e) => setSampleForm({ ...sampleForm, labNotes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAssociatingSample(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFieldSample}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm"
              >
                Acreditar Muestra y Validar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
