/**
 * Real Copernicus Marine & ECMWF Copernicus Climate Data Store (CDS) Dataset Specifications
 * Extracted directly from official Copernicus API queries in Llamadas_API_a084db25.pdf
 */

export interface CopernicusDatasetSpec {
  id: string;
  name: string;
  provider: 'Copernicus Marine Service (CMEMS)' | 'Copernicus Climate Data Store (CDS/ECMWF)';
  serviceType: 'Subset API (copernicusmarine)' | 'CDS API (cdsapi)';
  variables: {
    code: string;
    name: string;
    unit: string;
    description: string;
  }[];
  spatialBounds: {
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
    description: string;
  };
  depthMeters?: number;
  timeCoverage: string;
  pythonSnippet: string;
}

export const COPERNICUS_DATASETS: Record<string, CopernicusDatasetSpec> = {
  CMEMS_PHY: {
    id: 'cmems_mod_glo_phy_my_0.083deg_P1D-m',
    name: 'Global Ocean Physics Reanalysis (0.083° Daily)',
    provider: 'Copernicus Marine Service (CMEMS)',
    serviceType: 'Subset API (copernicusmarine)',
    variables: [
      { code: 'thetao', name: 'Temperatura superficial del mar (SST)', unit: '°C', description: 'Sea water potential temperature at surface layer' },
      { code: 'uo', name: 'Corriente marina componente Este (uo)', unit: 'm/s', description: 'Eastward sea water velocity' },
      { code: 'vo', name: 'Corriente marina componente Norte (vo)', unit: 'm/s', description: 'Northward sea water velocity' },
    ],
    spatialBounds: {
      minLon: -19.0,
      maxLon: -13.0,
      minLat: 27.0,
      maxLat: 30.0,
      description: 'Archipiélago Canario y aguas abiertas circundantes',
    },
    depthMeters: 0.49402499198913574,
    timeCoverage: '2023-08-21T00:00:00 a 2023-08-25T00:00:00',
    pythonSnippet: `import copernicusmarine

copernicusmarine.subset(
    dataset_id="cmems_mod_glo_phy_my_0.083deg_P1D-m",
    variables=["thetao", "uo", "vo"],
    minimum_longitude=-19,
    maximum_longitude=-13,
    minimum_latitude=27,
    maximum_latitude=30,
    start_datetime="2023-08-21T00:00:00",
    end_datetime="2023-08-25T00:00:00",
    minimum_depth=0.49402499198913574,
    maximum_depth=0.49402499198913574,
)`,
  },

  ERA5_WIND: {
    id: 'reanalysis-era5-single-levels',
    name: 'ERA5 Reanálisis Horario de Viento a 10m',
    provider: 'Copernicus Climate Data Store (CDS/ECMWF)',
    serviceType: 'CDS API (cdsapi)',
    variables: [
      { code: '10m_u_component_of_wind', name: 'Viento zonal a 10m (u10)', unit: 'm/s', description: 'Eastward 10 metre wind component' },
      { code: '10m_v_component_of_wind', name: 'Viento meridional a 10m (v10)', unit: 'm/s', description: 'Northward 10 metre wind component' },
    ],
    spatialBounds: {
      minLon: -18.5,
      maxLon: -13.25,
      minLat: 27.25,
      maxLat: 29.5,
      description: 'Canarias: [North: 29.5, West: -18.5, South: 27.25, East: -13.25]',
    },
    timeCoverage: 'Años 2017 (Jun-Oct), 2022 (Sep), 2023 (Ago-Oct) - Resolución horaria 00:00 - 23:00',
    pythonSnippet: `import cdsapi

client = cdsapi.Client()
client.retrieve(
    "reanalysis-era5-single-levels",
    {
        "product_type": ["reanalysis"],
        "variable": ["10m_u_component_of_wind", "10m_v_component_of_wind"],
        "year": ["2023"],
        "month": ["08", "09", "10"],
        "day": [f"{i:02d}" for i in range(1, 32)],
        "time": [f"{i:02d}:00" for i in range(24)],
        "data_format": "grib",
        "download_format": "unarchived",
        "area": [29.5, -18.5, 27.25, -13.25]
    }
).download()`,
  },

  CMEMS_BGC_FE: {
    id: 'cmems_mod_glo_bgc_my_0.25deg_P1M-m',
    name: 'Global Ocean Biogeochemistry Reanalysis (Hierro Disuelto fe)',
    provider: 'Copernicus Marine Service (CMEMS)',
    serviceType: 'Subset API (copernicusmarine)',
    variables: [
      { code: 'fe', name: 'Hierro disuelto en superficie (fe)', unit: 'µmol/m³', description: 'Dissolved iron concentration at sea surface layer' },
    ],
    spatialBounds: {
      minLon: -18.5,
      maxLon: -13.25,
      minLat: 27.25,
      maxLat: 29.5,
      description: 'Área marítima de Canarias',
    },
    depthMeters: 0.5057600140571594,
    timeCoverage: '2017 (06 a 10), 2022 (09), 2023 (08 a 10)',
    pythonSnippet: `import copernicusmarine

copernicusmarine.subset(
    dataset_id="cmems_mod_glo_bgc_my_0.25deg_P1M-m",
    variables=["fe"],
    minimum_longitude=-18.5,
    maximum_longitude=-13.25,
    minimum_latitude=27.25,
    maximum_latitude=29.5,
    start_datetime="2023-08-01T00:00:00",
    end_datetime="2023-10-31T00:00:00",
    minimum_depth=0.5057600140571594,
    maximum_depth=0.5057600140571594,
)`,
  },

  CMEMS_WCUR: {
    id: 'cmems_mod_glo_phy-wcur_anfc_0.083deg_P1M-m',
    name: 'Velocidad Vertical del Agua (Upwelling / Downwelling wo)',
    provider: 'Copernicus Marine Service (CMEMS)',
    serviceType: 'Subset API (copernicusmarine)',
    variables: [
      { code: 'wo', name: 'Velocidad vertical del agua (wo)', unit: '10⁻⁵ m/s', description: 'Vertical velocity of water at 0.494m depth' },
    ],
    spatialBounds: {
      minLon: -18.5,
      maxLon: -13.25,
      minLat: 27.25,
      maxLat: 29.5,
      description: 'Área marítima de Canarias',
    },
    depthMeters: 0.49402499198913574,
    timeCoverage: '2017 (06 a 10), 2022 (09), 2023 (08 a 10)',
    pythonSnippet: `import copernicusmarine

copernicusmarine.subset(
    dataset_id="cmems_mod_glo_phy-wcur_anfc_0.083deg_P1M-m",
    variables=["wo"],
    minimum_longitude=-18.5,
    maximum_longitude=-13.25,
    minimum_latitude=27.25,
    maximum_latitude=29.5,
    start_datetime="2023-08-01T00:00:00",
    end_datetime="2023-10-31T00:00:00",
    minimum_depth=0.49402499198913574,
    maximum_depth=0.49402499198913574,
)`,
  },

  CAMS_EAC4_DUST: {
    id: 'cams-global-reanalysis-eac4',
    name: 'CAMS Reanálisis Global de Polvo Sahariano y Aerosoles (EAC4)',
    provider: 'Copernicus Climate Data Store (CDS/ECMWF)',
    serviceType: 'CDS API (cdsapi)',
    variables: [
      { code: 'dust_aerosol_optical_depth_550nm', name: 'AOD Polvo Mineral Sahariano (550nm)', unit: 'adimensional', description: 'Dust aerosol optical depth at 550 nm (Calima)' },
      { code: 'particulate_matter_10um', name: 'Material particulado PM10', unit: 'µg/m³', description: 'Particulate matter d < 10 µm' },
      { code: 'particulate_matter_2.5um', name: 'Material particulado PM2.5', unit: 'µg/m³', description: 'Particulate matter d < 2.5 µm' },
      { code: 'particulate_matter_1um', name: 'Material particulado PM1', unit: 'µg/m³', description: 'Particulate matter d < 1 µm' },
      { code: 'total_aerosol_optical_depth_550nm', name: 'AOD Total 550nm', unit: 'adimensional', description: 'Total aerosol optical depth at 550 nm' },
    ],
    spatialBounds: {
      minLon: -18.5,
      maxLon: -13.25,
      minLat: 27.25,
      maxLat: 29.5,
      description: 'Canarias: [29.5, -18.5, 27.25, -13.25]',
    },
    timeCoverage: '2017 (06-01 a 10-31), 2022 (09-01 a 09-30), 2023 (08-01 a 10-31) cada 3 horas',
    pythonSnippet: `import cdsapi

client = cdsapi.Client()
client.retrieve(
    "cams-global-reanalysis-eac4",
    {
        "variable": [
            "dust_aerosol_optical_depth_550nm",
            "organic_matter_aerosol_optical_depth_550nm",
            "particulate_matter_1um",
            "particulate_matter_2.5um",
            "particulate_matter_10um",
            "sulphate_aerosol_optical_depth_550nm",
            "total_aerosol_optical_depth_469nm",
            "total_aerosol_optical_depth_550nm",
            "total_aerosol_optical_depth_670nm",
            "total_aerosol_optical_depth_865nm",
            "total_aerosol_optical_depth_1240nm"
        ],
        "date": ["2023-08-01/2023-10-31"],
        "time": ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
        "data_format": "grib",
        "area": [29.5, -18.5, 27.25, -13.25]
    }
).download()`,
  },
};
