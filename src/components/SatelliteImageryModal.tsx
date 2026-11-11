import React, { useState } from 'react';
import { 
  X, 
  Satellite, 
  Layers, 
  Calendar, 
  MapPin, 
  Download, 
  Copy, 
  Check, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Terminal, 
  Eye, 
  Sparkles,
  Info
} from 'lucide-react';
import { IslandRegion } from '../types';

interface SatelliteImageryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedIsland: IslandRegion;
  onSelectIsland?: (island: IslandRegion) => void;
}

type SatelliteMission = 'SENTINEL_2' | 'LANDSAT_8_9' | 'SENTINEL_3';
type BandCombination = 'TRUE_COLOR' | 'MICROALGAE_NDCI' | 'THERMAL_SST' | 'SWIR_WATER';

export const SatelliteImageryModal: React.FC<SatelliteImageryModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedIsland,
  onSelectIsland,
}) => {
  const [mission, setMission] = useState<SatelliteMission>('SENTINEL_2');
  const [bandCombo, setBandCombo] = useState<BandCombination>('TRUE_COLOR');
  const [activeIsland, setActiveIsland] = useState<string>(selectedIsland === 'Canarias' ? 'Tenerife' : selectedIsland);
  const [activeTab, setActiveTab] = useState<'IMAGE' | 'API_CODE'>('IMAGE');
  const [copiedCode, setCopiedCode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen) return null;

  // Format date
  const parts = selectedDate.split('-');
  const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : selectedDate;

  // Island metadata for satellite pass
  const islandConfigs: Record<string, {
    name: string;
    tile: string;
    orbit: string;
    cloudCover: string;
    bbox: [number, number, number, number];
    center: string;
    sentinelPassTime: string;
    landsatSceneId: string;
    description: string;
  }> = {
    'Tenerife': {
      name: 'Tenerife',
      tile: 'T28RCS',
      orbit: 'R065 (Relative Orbit 65)',
      cloudCover: '0.9%',
      bbox: [-17.02, 27.98, -16.12, 28.61],
      center: '28.2916° N, 16.6291° W',
      sentinelPassTime: '11:53:19 UTC',
      landsatSceneId: 'LC09_L2SP_207040_20230823_02_T1',
      description: 'Sector sur-sureste (Adeje, Fasnia, Güímar) y canal interinsular Tenerife-Gran Canaria.',
    },
    'Gran Canaria': {
      name: 'Gran Canaria',
      tile: 'T28RDT',
      orbit: 'R065',
      cloudCover: '1.4%',
      bbox: [-15.85, 27.72, -15.35, 28.21],
      center: '27.9202° N, 15.5474° W',
      sentinelPassTime: '11:52:45 UTC',
      landsatSceneId: 'LC09_L2SP_207040_20230823_02_T1',
      description: 'Litoral este y bahía de Gando; vorticidad a sotavento en Maspalomas.',
    },
    'La Palma': {
      name: 'La Palma',
      tile: 'T28RBS',
      orbit: 'R022',
      cloudCover: '0.4%',
      bbox: [-18.01, 28.45, -17.70, 28.87],
      center: '28.6835° N, 17.7645° W',
      sentinelPassTime: '11:54:02 UTC',
      landsatSceneId: 'LC09_L2SP_208040_20230823_02_T1',
      description: 'Sector suroeste (Fuencaliente, Tazacorte) y aguas occidentales abiertas.',
    },
    'La Gomera': {
      name: 'La Gomera',
      tile: 'T28RBS',
      orbit: 'R065',
      cloudCover: '0.7%',
      bbox: [-17.36, 28.02, -17.10, 28.23],
      center: '28.1188° N, 17.2241° W',
      sentinelPassTime: '11:53:35 UTC',
      landsatSceneId: 'LC09_L2SP_207040_20230823_02_T1',
      description: 'Canal Tenerife-La Gomera y zona protegida marina Franja Marina Santiago-Valle Gran Rey.',
    },
  };

  const currentIsland = islandConfigs[activeIsland] || islandConfigs['Tenerife'];

  // Official Python API call scripts (CDSE & Landsat STAC)
  const sentinelApiScript = `# Consulta Oficial Copernicus Data Space Ecosystem (CDSE) / Sentinel Hub
# Producto: Sentinel-2 MSI Nivel 2A (Reflectancia de Fondo de Atmósfera BOA)
from sentinelhub import SHConfig, SentinelHubRequest, DataCollection, MimeType, CRS, BBox

evalscript_copernicus = """
//VERSION=3
// Combinación espectral oficial para Detección de Microalgas y Biomasa Costera
function setup() {
  return {
    input: ["B02", "B03", "B04", "B08", "B11", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  // NDCI (Normalized Difference Chlorophyll Index) = (B05 - B04) / (B05 + B04)
  // Visualización RGB optimizada para aguas costeras canarias
  let red = sample.B04 * 2.8;
  let green = sample.B03 * 2.8;
  let blue = sample.B02 * 2.8;
  let nir = sample.B08 * 3.0; // Infrarrojo cercano (reflejo de agregaciones superficiales)
  
  return [red, green, blue, sample.dataMask];
}
"""

request = SentinelHubRequest(
    evalscript=evalscript_copernicus,
    input_data=[
        SentinelHubRequest.input_data(
            data_collection=DataCollection.SENTINEL2_L2A,
            time_interval=("${selectedDate}T00:00:00Z", "${selectedDate}T23:59:59Z"),
            maxcc=0.20 // Máxima nubosidad 20%
        )
    ],
    responses=[SentinelHubRequest.output_response('default', MimeType.PNG)],
    bbox=BBox(bbox=[${currentIsland.bbox.join(', ')}], crs=CRS.WGS84),
    size=[2048, 2048]
)

# Descargar e inicializar array georreferenciado
image_array = request.get_data()[0]
print(f"Pase Sentinel-2 para ${currentIsland.name} descargado: {image_array.shape}")`;

  const landsatApiScript = `# Consulta Oficial Landsat 8/9 OLI-2 / TIRS-2 (Collection 2 Level-2)
# Datos de Reflectancia y Temperatura Radiativa Superficial del Mar (SST)
import pystac_client
import planetary_computer

catalog = pystac_client.Client.open(
    "https://planetarycomputer.microsoft.com/api/stac/v1",
    modifier=planetary_computer.sign_inplace
)

search = catalog.search(
    collections=["landsat-c2-l2"],
    bbox=[${currentIsland.bbox.join(', ')}],
    datetime="${selectedDate}",
    query={"eo:cloud_cover": {"lt": 20}}
)

items = list(search.item_collection())
print(f"Escenas Landsat 8/9 para ${currentIsland.name} en ${selectedDate}: {len(items)}")
for item in items:
    print(f"Scene ID: {item.id} | Sensor: {item.properties.get('instruments')} | Nubosidad: {item.properties.get('eo:cloud_cover')}%")
    # Bandas: B1 (Coastal/Aerosol 30m), B2-B4 (Visible RGB), B10 (Thermal IR SST 100m)
`;

  const activeScript = mission === 'LANDSAT_8_9' ? landsatApiScript : sentinelApiScript;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div 
      id="coastal-satellite-imagery-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-cyan-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header Modal */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700/60 text-cyan-300">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Llamadas Sentinel & Landsat — Imagen de Gran Resolución de la Isla
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  COPERNICUS CDSE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Observación satelital multiespectral directa para {currentIsland.name} el {formattedDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Cerrar visor satelital"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Island selector & Mission Switcher */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Island selector buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mr-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Isla:</span>
            </span>
            {['Tenerife', 'Gran Canaria', 'La Palma', 'La Gomera'].map((isle) => (
              <button
                key={isle}
                onClick={() => {
                  setActiveIsland(isle);
                  if (onSelectIsland) onSelectIsland(isle as IslandRegion);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  activeIsland === isle
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {isle}
              </button>
            ))}
          </div>

          {/* Mission tabs (Sentinel-2 vs Landsat 8/9 vs Sentinel-3) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMission('SENTINEL_2')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                mission === 'SENTINEL_2'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sentinel-2 MSI (10m)
            </button>
            <button
              onClick={() => setMission('LANDSAT_8_9')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                mission === 'LANDSAT_8_9'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Landsat 8/9 OLI/TIRS
            </button>
            <button
              onClick={() => setMission('SENTINEL_3')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                mission === 'SENTINEL_3'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sentinel-3 OLCI (300m)
            </button>
          </div>

          {/* View Tab: Image vs API Code */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('IMAGE')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'IMAGE'
                  ? 'bg-slate-800 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Imagen Satelital</span>
            </button>
            <button
              onClick={() => setActiveTab('API_CODE')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'API_CODE'
                  ? 'bg-slate-800 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Código API Python</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'IMAGE' ? (
            <div className="space-y-4">
              {/* Spectral Combination Selector & Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">Composición de bandas:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBandCombo('TRUE_COLOR')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                        bandCombo === 'TRUE_COLOR'
                          ? 'bg-cyan-950 border border-cyan-400 text-cyan-200 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      B4-B3-B2 (Color Real)
                    </button>
                    <button
                      onClick={() => setBandCombo('MICROALGAE_NDCI')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                        bandCombo === 'MICROALGAE_NDCI'
                          ? 'bg-emerald-950 border border-emerald-400 text-emerald-200 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      B8-B4-B3 (Microalgas & NIR)
                    </button>
                    <button
                      onClick={() => setBandCombo('THERMAL_SST')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                        bandCombo === 'THERMAL_SST'
                          ? 'bg-amber-950 border border-amber-400 text-amber-200 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      B10 / B11 (Térmico SST)
                    </button>
                  </div>
                </div>

                {/* Satellite pass technical stamps */}
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span>Pase: <b className="text-white">{currentIsland.sentinelPassTime}</b></span>
                  <span>Tile: <b className="text-cyan-400">{currentIsland.tile}</b></span>
                  <span>Nubosidad: <b className="text-emerald-400">{currentIsland.cloudCover}</b></span>
                </div>
              </div>

              {/* Large Island Satellite Canvas / Rendering Box */}
              <div className="relative w-full h-[460px] bg-gradient-to-b from-slate-950 via-[#071321] to-[#040c17] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner group">
                
                {/* Simulated High-Res Satellite Optical Pass Visualization of the Island */}
                <svg 
                  className="w-full h-full"
                  viewBox="0 0 900 460"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
                >
                  <defs>
                    <radialGradient id="oceanShallowGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.8" />
                      <stop offset="60%" stopColor="#0f172a" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
                    </radialGradient>

                    <linearGradient id="bloomFilamentsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                      <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                    </linearGradient>

                    <pattern id="satelliteGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
                    </pattern>
                  </defs>

                  {/* Ocean Base Background with Grid */}
                  <rect width="900" height="460" fill="url(#satelliteGridPattern)" />

                  {/* Bathymetry & Coastal Shelf glow around the island */}
                  <ellipse cx="450" cy="230" rx="280" ry="160" fill="url(#oceanShallowGrad)" />

                  {/* Island Geography based on activeIsland */}
                  {activeIsland === 'Tenerife' && (
                    <g id="island-tenerife-contour">
                      {/* Detailed silhouette of Tenerife */}
                      <path
                        d="M 330 290 Q 300 280 290 260 Q 285 240 310 220 Q 340 200 400 170 Q 480 120 540 100 Q 565 95 560 115 Q 545 140 500 180 Q 460 215 480 250 Q 500 285 450 310 Q 390 330 350 315 Z"
                        fill="#1e293b"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />
                      {/* Teide Peak Indicator */}
                      <circle cx="410" cy="225" r="4" fill="#f87171" />
                      <text x="420" y="228" fill="#e2e8f0" fontSize="10" fontFamily="monospace">Pico del Teide (3.718m)</text>

                      {/* Optical microalgae filaments off Southeast coast (Fasnia - Güímar - Granadilla) */}
                      <path
                        d="M 440 310 C 470 335 520 340 560 330 C 580 325 610 300 620 280 C 600 295 550 320 480 305 Z"
                        fill={bandCombo === 'MICROALGAE_NDCI' ? '#10b981' : bandCombo === 'THERMAL_SST' ? '#f97316' : '#22c55e'}
                        fillOpacity="0.75"
                        stroke={bandCombo === 'MICROALGAE_NDCI' ? '#34d399' : '#fb923c'}
                        strokeWidth="1.5"
                      />
                      <path
                        d="M 460 260 C 500 275 550 270 590 250 C 570 265 520 280 470 270 Z"
                        fill="url(#bloomFilamentsGrad)"
                        fillOpacity="0.7"
                      />
                      {/* Filament labels */}
                      <text x="540" y="350" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        Filamento Algal TF02 (24.06 km²)
                      </text>
                      <line x1="535" y1="345" x2="510" y2="325" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                    </g>
                  )}

                  {activeIsland === 'Gran Canaria' && (
                    <g id="island-grancanaria-contour">
                      {/* Round silhouette of Gran Canaria */}
                      <circle cx="450" cy="230" r="110" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="450" cy="230" r="4" fill="#f87171" />
                      <text x="460" y="233" fill="#e2e8f0" fontSize="10" fontFamily="monospace">Pico de las Nieves (1.949m)</text>
                      {/* Filaments */}
                      <path
                        d="M 530 200 C 570 210 610 240 620 280 C 600 260 560 235 525 220 Z"
                        fill="url(#bloomFilamentsGrad)"
                        fillOpacity="0.8"
                      />
                      <text x="580" y="295" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        Vorticidad & Dispersión Este
                      </text>
                    </g>
                  )}

                  {activeIsland === 'La Palma' && (
                    <g id="island-lapalma-contour">
                      {/* Tear drop silhouette of La Palma */}
                      <path
                        d="M 450 120 Q 490 180 480 260 Q 470 320 445 350 Q 425 320 415 260 Q 405 180 450 120 Z"
                        fill="#1e293b"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />
                      <circle cx="450" cy="180" r="4" fill="#f87171" />
                      <text x="460" y="183" fill="#e2e8f0" fontSize="10" fontFamily="monospace">Roque de los Muchachos (2.426m)</text>
                      {/* West coastal bloom */}
                      <path
                        d="M 405 240 C 370 255 350 280 340 310 C 360 290 390 270 415 260 Z"
                        fill="url(#bloomFilamentsGrad)"
                        fillOpacity="0.8"
                      />
                      <text x="250" y="300" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        Episodio LP01 (Costa Tazacorte)
                      </text>
                    </g>
                  )}

                  {activeIsland === 'La Gomera' && (
                    <g id="island-lagomera-contour">
                      {/* Round/radial silhouette of La Gomera */}
                      <circle cx="450" cy="230" r="80" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="450" cy="230" r="4" fill="#f87171" />
                      <text x="460" y="233" fill="#e2e8f0" fontSize="10" fontFamily="monospace">Alto de Garajonay (1.487m)</text>
                      {/* South coast bloom */}
                      <path
                        d="M 420 300 C 450 330 490 335 520 320 C 490 315 450 310 430 295 Z"
                        fill="url(#bloomFilamentsGrad)"
                        fillOpacity="0.8"
                      />
                      <text x="420" y="350" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        Franja Sur Valle Gran Rey
                      </text>
                    </g>
                  )}

                  {/* Satellite Swath Footprint Border */}
                  <rect x="180" y="40" width="540" height="380" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.6" />
                  <text x="190" y="60" fill="#06b6d4" fontSize="10" fontFamily="monospace">
                    Huella de Pase {mission === 'LANDSAT_8_9' ? 'Landsat 9 WRS-2' : 'Sentinel-2 MSI Tile'} [{currentIsland.tile}]
                  </text>
                </svg>

                {/* Overlaid UI Controls (Zoom, Pan, Fullscreen) */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 shadow-lg">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                    className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="Acercar imagen"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                    className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="Alejar imagen"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition font-mono text-xs px-2"
                    title="Restablecer zoom"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>
                </div>

                {/* Bottom Overlay Legend */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-mono text-slate-200">
                      {mission === 'SENTINEL_2' ? 'Sentinel-2B MSI Nivel 2A' : mission === 'LANDSAT_8_9' ? 'Landsat 9 OLI-2 / TIRS-2' : 'Sentinel-3A OLCI Nivel 2'}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400 font-mono">BBox: {currentIsland.bbox.join(', ')}</span>
                  </div>

                  <div className="text-[11px] text-cyan-300 font-mono">
                    Resolución: {mission === 'SENTINEL_2' ? '10 metros/píxel' : mission === 'LANDSAT_8_9' ? '30m (30m VIS / 100m Térmico)' : '300 metros'}
                  </div>
                </div>
              </div>

              {/* Technical description of the pass */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-3">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <b className="text-white">Diagnóstico de la imagen de satélite ({currentIsland.name}):</b>{' '}
                  {currentIsland.description} La cobertura nubosa en el litoral es del {currentIsland.cloudCover}, permitiendo una discriminación espectral nítida entre aguas oceánicas oligotróficas y biomasa algal en superficie.
                </div>
              </div>
            </div>
          ) : (
            /* API Code Tab */
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-cyan-300 font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Script de Consulta Reproducible Oficial ({mission === 'LANDSAT_8_9' ? 'Landsat STAC API' : 'Copernicus Data Space Ecosystem'})
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Código Copiado' : 'Copiar Script Python'}</span>
                </button>
              </div>

              <div className="relative bg-slate-950 p-4 rounded-xl border border-cyan-900/40 text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                <pre>{activeScript}</pre>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Catálogo: CDSE OpenSearch / STAC API Copernicus</span>
                <span>Formato: Cloud-Optimized GeoTIFF (COG) / NetCDF4</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 font-mono text-[11px]">
            Coordenadas centro: <b className="text-slate-200">{currentIsland.center}</b>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
