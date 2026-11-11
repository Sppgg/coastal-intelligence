import React, { useState, useRef } from 'react';
import { 
  Database, 
  Upload, 
  Download, 
  FileCode2, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  AlertCircle, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { DatasetSourceItem, ProjectProvenance } from '../types';
import { OFFICIAL_DATASETS_CATALOG } from '../data/datasetsCatalog';
import { spatialImportService, ImportedLayer } from '../services/spatialImportService';

interface DatasetsModuleProps {
  onLayersUpdated?: () => void;
  onFocusCoordinates?: (lat: number, lng: number, zoom?: number) => void;
}

export const DatasetsModule: React.FC<DatasetsModuleProps> = ({
  onLayersUpdated,
  onFocusCoordinates,
}) => {
  const [datasets] = useState<DatasetSourceItem[]>(OFFICIAL_DATASETS_CATALOG);
  const [selectedProvenance, setSelectedProvenance] = useState<ProjectProvenance | 'TODOS'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<DatasetSourceItem | null>(datasets[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // File import state
  const [importedLayers, setImportedLayers] = useState<ImportedLayer[]>(spatialImportService.getImportedLayers());
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDatasets = datasets.filter((ds) => {
    if (selectedProvenance !== 'TODOS' && ds.project !== selectedProvenance) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ds.name.toLowerCase().includes(q) ||
        ds.id.toLowerCase().includes(q) ||
        ds.description.toLowerCase().includes(q) ||
        ds.crs.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopySnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let newLayer: ImportedLayer;

        if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
          newLayer = spatialImportService.parseGeoJSON(content, file.name);
        } else if (file.name.endsWith('.csv')) {
          newLayer = spatialImportService.parseCSV(content, file.name);
        } else {
          throw new Error('Formato no soportado. Cargue archivos .geojson o .csv con columnas de latitud y longitud.');
        }

        setImportedLayers(spatialImportService.getImportedLayers());
        setImportSuccess(`Capa "${newLayer.name}" importada exitosamente (${newLayer.featureCount} geometrías).`);
        if (onLayersUpdated) onLayersUpdated();

        // Focus map to layer center
        if (onFocusCoordinates && newLayer.bounds) {
          const centerLat = (newLayer.bounds[0] + newLayer.bounds[2]) / 2;
          const centerLng = (newLayer.bounds[1] + newLayer.bounds[3]) / 2;
          onFocusCoordinates(centerLat, centerLng, 10);
        }
      } catch (err: any) {
        setImportError(err.message || 'Error al procesar el archivo geoespacial.');
      }
    };

    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleToggleImportedLayer = (layerId: string) => {
    spatialImportService.toggleLayerVisibility(layerId);
    setImportedLayers(spatialImportService.getImportedLayers());
    if (onLayersUpdated) onLayersUpdated();
  };

  const handleRemoveImportedLayer = (layerId: string) => {
    spatialImportService.removeLayer(layerId);
    setImportedLayers(spatialImportService.getImportedLayers());
    if (onLayersUpdated) onLayersUpdated();
  };

  const getProvenanceBadge = (prov: ProjectProvenance) => {
    switch (prov) {
      case 'Coastal Guardian RIS3':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800/80';
      case 'Teledetección Azul':
        return 'bg-blue-950 text-blue-300 border-blue-800/80';
      case 'ECOMARIS':
        return 'bg-teal-950 text-teal-300 border-teal-800/80';
      case 'GRAFCAN':
        return 'bg-amber-950 text-amber-300 border-amber-800/80';
      case 'Copernicus CMEMS':
      case 'Copernicus CDS / CAMS':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800/80';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700/80';
    }
  };

  return (
    <div id="datasets-module-panel" className="h-full flex flex-col bg-slate-950 text-slate-200 select-none">
      {/* Top Header / Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Inventario de Capas, Datasets y Trazabilidad de Procedencia</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro estructurado con metadatos técnicos (CRS, resolución espacial, licencias) e importador geoespacial cliente.
          </p>
        </div>

        {/* Upload Trigger Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".geojson,.json,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload-input"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar GeoJSON / CSV</span>
          </button>
        </div>
      </div>

      {/* Import Feedback Banners */}
      {importSuccess && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 px-5 py-2 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importSuccess}</span>
          </div>
          <button onClick={() => setImportSuccess(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {importError && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-5 py-2 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{importError}</span>
          </div>
          <button onClick={() => setImportError(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Filter & Dataset Catalog List */}
        <div className="w-80 md:w-96 border-r border-slate-800/80 flex flex-col bg-slate-950/70 shrink-0 overflow-y-auto p-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por dataset, CRS o variable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Provenance Filter */}
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1 font-bold">
              Filtrar por Procedencia del Proyecto
            </label>
            <div className="flex flex-wrap gap-1 text-[10px] font-mono">
              {(['TODOS', 'Coastal Guardian RIS3', 'Teledetección Azul', 'ECOMARIS', 'GRAFCAN', 'Copernicus CMEMS'] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => setSelectedProvenance(prov as any)}
                  className={`px-2 py-1 rounded border transition ${
                    selectedProvenance === prov
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* Imported User Layers (if any exist) */}
          {importedLayers.length > 0 && (
            <div className="p-3 bg-slate-900/90 rounded-lg border border-cyan-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase">
                  Capas Importadas por Usuario ({importedLayers.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">En tiempo de ejecución</span>
              </div>

              <div className="space-y-1.5">
                {importedLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{layer.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {layer.format} &middot; {layer.featureCount} geometrías ({layer.geometryType})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleImportedLayer(layer.id)}
                        className={`p-1 rounded ${layer.visible ? 'text-cyan-400 hover:bg-slate-900' : 'text-slate-600 hover:text-slate-400'}`}
                        title={layer.visible ? 'Ocultar en mapa' : 'Mostrar en mapa'}
                      >
                        {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleRemoveImportedLayer(layer.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900"
                        title="Eliminar capa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catalog List */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
              Datasets Registrados ({filteredDatasets.length})
            </span>

            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {filteredDatasets.map((ds) => {
                const isSelected = selectedDataset?.id === ds.id;
                const provBadge = getProvenanceBadge(ds.project);

                return (
                  <button
                    key={ds.id}
                    id={`dataset-item-${ds.id.toLowerCase()}`}
                    onClick={() => setSelectedDataset(ds)}
                    className={`w-full text-left p-2.5 rounded-lg border transition ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate max-w-[190px]">{ds.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{ds.format}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded border ${provBadge}`}>
                        {ds.project}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500 mt-1.5 pt-1 border-t border-slate-800/50">
                      <span>CRS: {ds.crs.split(' ')[0]}</span>
                      <span>{ds.spatialResolution}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata Detail Workbench */}
        <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4">
          {selectedDataset ? (
            <div className="space-y-4 max-w-4xl">
              {/* Dataset Title & Provenance Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{selectedDataset.id}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getProvenanceBadge(selectedDataset.project)}`}>
                    {selectedDataset.project}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                    {selectedDataset.validationStatus}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedDataset.name}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedDataset.description}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  <strong>Atribución oficial:</strong> {selectedDataset.attribution}
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Sistema de Coordenadas (CRS)</span>
                  <span className="text-xs font-mono font-bold text-cyan-300 mt-1 block">{selectedDataset.crs}</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Resolución Espacial</span>
                  <span className="text-xs font-mono font-bold text-white mt-1 block">{selectedDataset.spatialResolution}</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Cobertura Temporal</span>
                  <span className="text-xs font-mono font-bold text-white mt-1 block">{selectedDataset.temporalCoverage}</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Licencia de Uso</span>
                  <span className="text-xs font-mono text-slate-200 mt-1 block truncate">{selectedDataset.license}</span>
                </div>
              </div>

              {/* Protocolo de Ingesta y Conformidad OGC */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Conformidad OGC & Especificación de Ingesta</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[10px] font-mono text-cyan-300">
                    Estándar OGC / INSPIRE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Formato Nativo</span>
                    <span className="font-semibold text-slate-200 font-mono">{selectedDataset.format}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Sistema de Referencia</span>
                    <span className="font-semibold text-slate-200 font-mono">EPSG:32628 / WGS84</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Licencia de Uso</span>
                    <span className="font-semibold text-emerald-400 font-mono text-[11px] truncate block">{selectedDataset.license}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
                  {selectedDataset.citation}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
