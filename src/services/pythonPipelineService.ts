import { PythonPipelineTask, PipelineStep } from '../types';

/**
 * Servicio de Automatización y Tubería de Procesamiento Python (Sección 9 y 8).
 * Contiene especificaciones reproducibles, scripts con GeoPandas / Rasterio / Shapely,
 * y monitor de tareas de procesamiento por lotes.
 */

export interface PythonScriptDef {
  id: string;
  title: string;
  module: 'Monitorización Marina' | 'Residuos Plásticos' | 'Dinámica Litoral' | 'General';
  libraries: string[];
  description: string;
  filename: string;
  code: string;
}

export const REPRODUCIBLE_PYTHON_SCRIPTS: PythonScriptDef[] = [
  {
    id: 'PY-INGEST-CMEMS',
    title: 'Ingesta y normalización automática Copernicus Marine (CMEMS)',
    module: 'Monitorización Marina',
    libraries: ['copernicusmarine', 'xarray', 'netCDF4', 'pandas', 'geopandas'],
    filename: 'ingest_copernicus_cmems.py',
    description: 'Descarga automatizada de subsets netCDF físicos (temperatura thetao, corrientes uo/vo, surgencia wo) en el bounding box de Canarias [27N, 30N, 19W, 13W], extracción tabular y reproyección.',
    code: `"""
TELEDETECCIÓN AZUL — Script de Ingesta Automatizada CMEMS
Requisitos: copernicusmarine, xarray, geopandas, shapely
"""
import copernicusmarine
import xarray as xr
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from datetime import datetime

def fetch_canarias_marine_physics(date_str: str, output_nc: str = "canarias_cmems.nc"):
    print(f"[*] Conectando a Copernicus Marine API para fecha {date_str}...")
    copernicusmarine.subset(
        dataset_id="cmems_mod_glo_phy_my_0.083deg_P1D-m",
        variables=["thetao", "uo", "vo", "wo"],
        minimum_longitude=-19.0,
        maximum_longitude=-13.0,
        minimum_latitude=27.0,
        maximum_latitude=30.0,
        start_datetime=f"{date_str}T00:00:00",
        end_datetime=f"{date_str}T23:59:59",
        minimum_depth=0.494,
        maximum_depth=0.494,
        output_filename=output_nc,
        overwrite_output_data=True
    )
    print(f"[+] Archivo netCDF guardado: {output_nc}")
    
    # Procesamiento y vectorización a GeoDataFrame
    ds = xr.open_dataset(output_nc)
    df = ds.to_dataframe().reset_index()
    df = df.dropna(subset=['thetao'])
    
    # Generación de geometrías WGS84
    geometry = [Point(xy) for xy in zip(df.longitude, df.latitude)]
    gdf = gpd.GeoDataFrame(df, geometry=geometry, crs="EPSG:4326")
    
    # Exportación normalizada GeoJSON para visor
    geojson_path = f"cmems_vectors_{date_str}.geojson"
    gdf.to_file(geojson_path, driver="GeoJSON")
    print(f"[OK] {len(gdf)} celdas vectorizadas exportadas a {geojson_path}")
    return gdf

if __name__ == "__main__":
    fetch_canarias_marine_physics("2023-08-23")
`,
  },
  {
    id: 'PY-PLASTICS-SEGMENT',
    title: 'Segmentación de candidatos plásticos e índice FDI con Rasterio',
    module: 'Residuos Plásticos',
    libraries: ['rasterio', 'numpy', 'scipy', 'scikit-image', 'geopandas', 'shapely'],
    filename: 'segment_plastics_fdi.py',
    description: 'Cálculo del Floating Debris Index (FDI, Biermann et al.) y Plastic Index (PI) sobre imágenes multiespectrales, umbralización Otsu y extracción de polígonos candidatos vectoriales en UTM 28N.',
    code: `"""
TELEDETECCIÓN AZUL — Detección y Delimitación de Candidatos Plásticos
Requisitos: rasterio, numpy, scikit-image, geopandas, shapely
"""
import rasterio
from rasterio.features import shapes
import numpy as np
from skimage.filters import threshold_otsu
from skimage.morphology import remove_small_objects, binary_closing, disk
import geopandas as gpd
from shapely.geometry import shape

def compute_plastic_indices(image_path: str, output_geojson: str = "candidatos_plasticos.geojson"):
    print(f"[*] Leyendo bandas multiespectrales de {image_path}...")
    with rasterio.open(image_path) as src:
        # Bandas típicas: 1=Azul, 2=Verde, 3=Rojo, 4=RedEdge, 5=NIR, 6=SWIR
        red = src.read(3).astype(float)
        nir = src.read(5).astype(float)
        swir = src.read(6).astype(float) if src.count >= 6 else nir * 0.8
        profile = src.profile
        transform = src.transform
        crs = src.crs

    # Cálculo Floating Debris Index (FDI)
    # lambda_NIR = 842nm, lambda_RED = 665nm, lambda_SWIR = 1610nm
    nir_prime = red + (swir - red) * ((842.0 - 665.0) / (1610.0 - 665.0)) * 10.0
    fdi = nir - nir_prime
    
    # Máscara binaria por umbral Otsu
    valid_fdi = fdi[~np.isnan(fdi)]
    thresh = threshold_otsu(valid_fdi)
    binary_mask = (fdi > max(thresh, 0.08)).astype(np.uint8)
    
    # Limpieza morfológica de ruido
    cleaned_mask = binary_closing(binary_mask, disk(2))
    cleaned_mask = remove_small_objects(cleaned_mask.astype(bool), min_size=9).astype(np.uint8)
    
    # Poligonización ráster a vector
    results = [
        {'properties': {'fdi_mean': float(np.mean(fdi[mask])), 'area_px': int(np.sum(mask))}, 'geometry': s}
        for s, mask in shapes(cleaned_mask, mask=(cleaned_mask > 0), transform=transform)
    ]
    
    geometries = [shape(r['geometry']) for r in results]
    gdf = gpd.GeoDataFrame(results, geometry=geometries, crs=crs)
    
    # Cálculo de métricas en metros (CRS proyectado UTM 28N)
    gdf['area_m2'] = gdf.geometry.area
    gdf['perimeter_m'] = gdf.geometry.length
    gdf['category'] = 'ANOMALIA_SOSPECHOSA'
    
    # Restricción científica: Requiere comprobación en campo para validar microplásticos
    gdf.to_file(output_geojson, driver='GeoJSON')
    print(f"[OK] {len(gdf)} regiones candidatas delimitadas en {output_geojson}")
    return gdf

if __name__ == "__main__":
    compute_plastic_indices("ortomosaico_poris_uav.tif")
`,
  },
  {
    id: 'PY-COASTAL-DSAS',
    title: 'Cálculo de transectos perpendiculares y tasas DSAS de retroceso costero',
    module: 'Dinámica Litoral',
    libraries: ['geopandas', 'shapely', 'numpy', 'pandas', 'scipy'],
    filename: 'coastal_dsas_transects.py',
    description: 'Generación paramétrica de transectos perpendiculares a una línea base costera, intersección espacial con líneas de costa multitemporales normalizadas y cálculo de EPR (m/año), NSM (m) e incertidumbre.',
    code: `"""
TELEDETECCIÓN AZUL — Análisis de Línea de Costa y Métricas DSAS
Requisitos: geopandas, shapely, numpy, pandas
"""
import geopandas as gpd
from shapely.geometry import LineString, Point
import numpy as np

def generate_dsas_transects(baseline_shp: str, shorelines_shp: str, spacing_m: float = 50.0, length_m: float = 400.0):
    print(f"[*] Cargando línea base y líneas de costa históricas...")
    baseline_gdf = gpd.read_file(baseline_shp).to_crs("EPSG:32628") # UTM 28N
    shorelines_gdf = gpd.read_file(shorelines_shp).to_crs("EPSG:32628")
    
    baseline = baseline_gdf.geometry.iloc[0]
    num_points = int(baseline.length / spacing_m)
    
    transects = []
    for i in range(num_points):
        distance = i * spacing_m
        point = baseline.interpolate(distance)
        tangent_pt = baseline.interpolate(min(distance + 1.0, baseline.length))
        
        # Vector perpendicular ortogonal hacia el mar
        dx = tangent_pt.x - point.x
        dy = tangent_pt.y - point.y
        norm = np.hypot(dx, dy)
        if norm == 0: continue
        
        perp_dx = -dy / norm
        perp_dy = dx / norm
        
        origin = point
        end = Point(point.x + perp_dx * length_m, point.y + perp_dy * length_m)
        transect_line = LineString([origin, end])
        
        # Intersección con líneas de costa para calcular EPR y NSM
        intersections = []
        for _, shore in shorelines_gdf.iterrows():
            inter = transect_line.intersection(shore.geometry)
            if not inter.is_empty:
                pt = inter if isinstance(inter, Point) else inter.geoms[0]
                intersections.append({'date': shore['date'], 'year': shore['year'], 'dist': origin.distance(pt)})
                
        if len(intersections) >= 2:
            intersections.sort(key=lambda x: x['year'])
            earliest = intersections[0]
            latest = intersections[-1]
            time_delta = latest['year'] - earliest['year']
            nsm = latest['dist'] - earliest['dist'] # Desplazamiento neto
            epr = nsm / time_delta if time_delta > 0 else 0.0 # Tasa anual
            
            transects.append({
                'transect_id': f"TR_{i+1:03d}",
                'origin_x': origin.x, 'origin_y': origin.y,
                'nsm_m': round(nsm, 2),
                'epr_m_yr': round(epr, 2),
                'classification': 'EROSION_SEVERA' if epr < -1.5 else ('EROSION_MODERADA' if epr < -0.3 else 'ESTABLE'),
                'geometry': transect_line
            })
            
    gdf_transects = gpd.GeoDataFrame(transects, crs="EPSG:32628")
    gdf_transects.to_file("transectos_dsas_resultado.geojson", driver="GeoJSON")
    print(f"[OK] {len(gdf_transects)} transectos calculados exitosamente.")
    return gdf_transects

if __name__ == "__main__":
    generate_dsas_transects("linea_base_maspalomas.gpkg", "costas_historicas_2018_2026.gpkg")
`,
  },
];

export const INITIAL_PIPELINE_TASKS: PythonPipelineTask[] = [
  {
    id: 'TASK-01',
    name: 'Ingesta de subset CMEMS PHY (thetao, uo, vo)',
    step: 'INGESTA',
    status: 'COMPLETADO',
    timestamp: '2026-11-10 07:15 UTC',
    inputDataset: 'cmems_mod_glo_phy_my_0.083deg_P1D-m',
    outputDataset: 'canarias_cmems_phy_2026.nc',
    scriptFile: 'ingest_copernicus_cmems.py',
    recordsProcessed: 1420,
    durationMs: 1420,
    params: { bbox: [27, -19, 30, -13], depth: 0.494 },
    notes: 'Descarga satelital CMEMS completada sin anomalías de formato.',
  },
  {
    id: 'TASK-02',
    name: 'Validación geométrica y topológica de capas vectoriales',
    step: 'VALIDACION',
    status: 'COMPLETADO',
    timestamp: '2026-11-10 07:16 UTC',
    inputDataset: 'inventario_vectorial_canarias.gpkg',
    outputDataset: 'blooms_shapes_validated.geojson',
    scriptFile: 'validate_geometries.py',
    recordsProcessed: 14,
    durationMs: 820,
    params: { fix_self_intersections: true, min_area_km2: 0.05 },
    notes: '14 polígonos verificados con control topológico sin errores de intersección.',
  },
  {
    id: 'TASK-03',
    name: 'Extracción de polígonos candidatos a plásticos con FDI',
    step: 'ENRIQUECIMIENTO',
    status: 'COMPLETADO',
    timestamp: '2026-11-10 07:18 UTC',
    inputDataset: 'ortomosaico_uav_poris_2026.tif',
    outputDataset: 'candidatos_plasticos_poris.geojson',
    scriptFile: 'segment_plastics_fdi.py',
    recordsProcessed: 6,
    durationMs: 2340,
    params: { fdi_threshold: 0.08, min_cluster_size_px: 9 },
    notes: '6 regiones candidatas delimitadas en Porís de Abona. 2 asociadas a muestras Micro-FTIR.',
  },
  {
    id: 'TASK-04',
    name: 'Cálculo de métricas DSAS y transectos de erosión en Maspalomas',
    step: 'PUBLICACION',
    status: 'COMPLETADO',
    timestamp: '2026-11-10 07:20 UTC',
    inputDataset: 'costas_historicas_pnoa_grafcan_uav.geojson',
    outputDataset: 'transectos_dsas_maspalomas.geojson',
    scriptFile: 'coastal_dsas_transects.py',
    recordsProcessed: 6,
    durationMs: 1150,
    params: { spacing_m: 50.0, length_m: 400.0, crs: 'EPSG:32628' },
    notes: 'Transecto TR-06 marcado con Análisis No Disponible por falta de batimetría reciente.',
  },
];

class PythonPipelineService {
  private tasks: PythonPipelineTask[] = [...INITIAL_PIPELINE_TASKS];

  getTasks(): PythonPipelineTask[] {
    return [...this.tasks];
  }

  getScripts(): PythonScriptDef[] {
    return [...REPRODUCIBLE_PYTHON_SCRIPTS];
  }

  async runPipelineTask(scriptId: string, customParams?: Record<string, any>): Promise<PythonPipelineTask> {
    const script = REPRODUCIBLE_PYTHON_SCRIPTS.find((s) => s.id === scriptId);
    if (!script) throw new Error('Script no encontrado en el repositorio.');

    const newTask: PythonPipelineTask = {
      id: `TASK-${Date.now().toString().slice(-4)}`,
      name: `Ejecución: ${script.title}`,
      step: script.id.includes('INGEST') ? 'INGESTA' : script.id.includes('PLAST') ? 'ENRIQUECIMIENTO' : 'PUBLICACION',
      status: 'EN_EJECUCION',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      inputDataset: 'Pipeline Input Streams',
      outputDataset: `${script.filename.replace('.py', '')}_output.geojson`,
      scriptFile: script.filename,
      recordsProcessed: 0,
      durationMs: 0,
      params: customParams || {},
      notes: 'Ejecutando proceso de geoprocesamiento reproducible...',
    };

    this.tasks.unshift(newTask);

    // Simulate completion
    return new Promise((resolve) => {
      setTimeout(() => {
        newTask.status = 'COMPLETADO';
        newTask.recordsProcessed = Math.floor(Math.random() * 25) + 5;
        newTask.durationMs = Math.floor(Math.random() * 1500) + 800;
        newTask.notes = 'Proceso completado exitosamente con GDAL/GeoPandas. Resultados listos para visualización.';
        resolve(newTask);
      }, 1200);
    });
  }
}

export const pythonPipelineService = new PythonPipelineService();
