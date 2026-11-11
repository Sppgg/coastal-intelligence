/**
 * Servicio de importación y procesamiento de archivos geoespaciales en el cliente.
 * Soporta GeoJSON (FeatureCollection, Feature, Geometry), CSV con coordenadas (lat/lon, latitude/longitude, x/y),
 * y validación de geometrías sin requerir dependencias pesadas de servidor.
 */

export interface ImportedFeature {
  id: string;
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
  geometry: any;
  properties: Record<string, any>;
  coordinates: any;
  areaKm2?: number;
  lengthKm?: number;
}

export interface ImportedLayer {
  id: string;
  name: string;
  fileName: string;
  format: 'GeoJSON' | 'CSV' | 'JSON';
  featureCount: number;
  geometryType: string;
  features: ImportedFeature[];
  bounds: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
  visible: boolean;
  color: string;
  importDate: string;
}

class SpatialImportService {
  private importedLayers: ImportedLayer[] = [];

  // Parse an uploaded GeoJSON text
  parseGeoJSON(content: string, fileName: string): ImportedLayer {
    const parsed = JSON.parse(content);
    let rawFeatures: any[] = [];

    if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      rawFeatures = parsed.features;
    } else if (parsed.type === 'Feature') {
      rawFeatures = [parsed];
    } else if (parsed.coordinates) {
      // Direct geometry
      rawFeatures = [{ type: 'Feature', geometry: parsed, properties: {} }];
    } else {
      throw new Error('El archivo no contiene un formato GeoJSON estándar válido.');
    }

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    const features: ImportedFeature[] = [];

    rawFeatures.forEach((feat, idx) => {
      if (!feat || !feat.geometry) return;
      const geomType = feat.geometry.type;
      const coords = feat.geometry.coordinates;

      // Calculate bounding box and transform coordinates if needed
      const updateBounds = (lng: number, lat: number) => {
        if (typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
        }
      };

      if (geomType === 'Point' && Array.isArray(coords)) {
        updateBounds(coords[0], coords[1]);
      } else if (geomType === 'LineString' && Array.isArray(coords)) {
        coords.forEach((pt: any) => updateBounds(pt[0], pt[1]));
      } else if (geomType === 'Polygon' && Array.isArray(coords)) {
        coords.forEach((ring: any) => {
          if (Array.isArray(ring)) {
            ring.forEach((pt: any) => updateBounds(pt[0], pt[1]));
          }
        });
      }

      features.push({
        id: `imp-${Date.now()}-${idx}`,
        type: geomType,
        geometry: feat.geometry,
        properties: feat.properties || {},
        coordinates: coords,
      });
    });

    if (minLat > maxLat) {
      // Fallback bounds
      minLat = 27.5; maxLat = 29.5; minLng = -18.5; maxLng = -13.0;
    }

    const newLayer: ImportedLayer = {
      id: `layer-${Date.now()}`,
      name: fileName.replace(/\.[^/.]+$/, ''),
      fileName,
      format: 'GeoJSON',
      featureCount: features.length,
      geometryType: features[0]?.type || 'Unknown',
      features,
      bounds: [minLat, minLng, maxLat, maxLng],
      visible: true,
      color: '#06b6d4',
      importDate: new Date().toISOString(),
    };

    this.importedLayers.push(newLayer);
    return newLayer;
  }

  // Parse CSV with Lat/Lng coordinates
  parseCSV(content: string, fileName: string): ImportedLayer {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('El archivo CSV está vacío o carece de cabecera.');
    }

    const header = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase());
    
    // Find latitude and longitude column indices
    const latIdx = header.findIndex((h) => 
      ['lat', 'latitude', 'latitud', 'y', 'lat_deg', 'coord_y'].includes(h)
    );
    const lngIdx = header.findIndex((h) => 
      ['lon', 'lng', 'longitude', 'longitud', 'x', 'lon_deg', 'coord_x'].includes(h)
    );

    if (latIdx === -1 || lngIdx === -1) {
      throw new Error('No se encontraron columnas de latitud (lat/latitude) y longitud (lon/lng) en la cabecera del CSV.');
    }

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    const features: ImportedFeature[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/[,;\t]/);
      const lat = parseFloat(parts[latIdx]);
      const lng = parseFloat(parts[lngIdx]);

      if (!isNaN(lat) && !isNaN(lng)) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;

        const props: Record<string, any> = {};
        header.forEach((h, col) => {
          props[h] = parts[col]?.trim() || '';
        });

        features.push({
          id: `csv-${Date.now()}-${i}`,
          type: 'Point',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: props,
          coordinates: [lng, lat],
        });
      }
    }

    if (features.length === 0) {
      throw new Error('No se pudieron extraer registros con coordenadas numéricas válidas del CSV.');
    }

    const newLayer: ImportedLayer = {
      id: `layer-csv-${Date.now()}`,
      name: fileName.replace(/\.[^/.]+$/, ''),
      fileName,
      format: 'CSV',
      featureCount: features.length,
      geometryType: 'Point',
      features,
      bounds: [minLat, minLng, maxLat, maxLng],
      visible: true,
      color: '#10b981',
      importDate: new Date().toISOString(),
    };

    this.importedLayers.push(newLayer);
    return newLayer;
  }

  getImportedLayers(): ImportedLayer[] {
    return [...this.importedLayers];
  }

  toggleLayerVisibility(id: string): void {
    const layer = this.importedLayers.find((l) => l.id === id);
    if (layer) {
      layer.visible = !layer.visible;
    }
  }

  removeLayer(id: string): void {
    this.importedLayers = this.importedLayers.filter((l) => l.id !== id);
  }
}

export const spatialImportService = new SpatialImportService();
