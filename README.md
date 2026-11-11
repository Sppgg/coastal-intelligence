
# Coastal Intelligence

### Teledetección Azul · Coastal Geospatial Monitoring in the Canary Islands

[![Live Demo](https://img.shields.io/badge/Live_Demo-Netlify-00C7B7?logo=netlify&logoColor=white)](https://coastal-intelligence.netlify.app/)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Status](https://img.shields.io/badge/Status-Prototype-orange)

**Coastal Intelligence** is an evolving web application focused on geospatial visualization and remote-sensing workflows for coastal environmental monitoring in the Canary Islands, Spain.

Presented as **Teledetección Azul**, the project explores the intersection of interactive cartography, environmental monitoring, geospatial data visualization, and applied artificial intelligence.

The long-term objective is to develop an accessible platform for exploring coastal environmental phenomena, including microalgae blooms, microplastics monitoring, and spatial changes in marine and coastal ecosystems.

> **Project status:** Prototype / Work in Progress.
>
> The application is under active development. Some analytical and AI-related capabilities described in this document represent future development objectives rather than fully implemented features.

---

## Live Application

**[Explore Coastal Intelligence](https://coastal-intelligence.netlify.app/)**

The application is deployed on Netlify.

---

## Project Objectives

Coastal Intelligence aims to:

- Develop interactive geospatial visualization tools for coastal environments.
- Explore the integration of remote-sensing imagery and environmental datasets.
- Support the interpretation of coastal and marine environmental indicators.
- Investigate geospatial AI applications for environmental analysis.
- Establish reproducible workflows for spatial and temporal data analysis.
- Make geospatial information more accessible through modern web interfaces.

The project combines geographic information systems (GIS), frontend development, remote sensing, and applied AI.

---

## Technology Stack

The repository includes the following technologies and dependencies:

| Category | Technology |
|----------|------------|
| Frontend | React 19 |
| Programming Language | TypeScript 5.8 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Interactive Mapping | Leaflet, MapLibre GL |
| Data Visualization | Recharts |
| UI Components | Lucide React |
| Animations | Motion |
| AI SDK | Google GenAI |
| Server Dependency | Express |
| Deployment | Netlify |

**Technical note:** The presence of a dependency does not necessarily indicate that all its capabilities are currently implemented or active in the deployed application.

---

## Repository Structure

```text
coastal-intelligence/
├── public/               # Static assets
├── src/                  # Application source code
├── .env.example          # Environment configuration example
├── index.html            # HTML entry point
├── package.json          # Dependencies and npm scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md             # Project documentation
```

---

## Getting Started

### Prerequisites

Before running the project locally, ensure you have:

- Node.js (a compatible current LTS version)
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/Sppgg/coastal-intelligence.git
```

Navigate to the project directory:

```bash
cd coastal-intelligence
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a local environment file based on the example:

```bash
cp .env.example .env
```

The repository includes configuration placeholders for mapping services:

```dotenv
VITE_MAPBOX_ACCESS_TOKEN=""
VITE_MAPTILER_API_KEY=""
```

Additional variables may be required depending on the features enabled.

**Security:** Never commit private API keys or other credentials to the repository. Variables prefixed with `VITE_` may be exposed to the browser and should only contain values intended for client-side use.

### Development Server

Start the application:

```bash
npm run dev
```

The development server is configured to use:

```text
http://localhost:3000
```

### Production Build

Generate an optimized build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Type Checking

Run the existing TypeScript validation command:

```bash
npm run lint
```

Currently, this command executes `tsc --noEmit`. It performs TypeScript checks rather than conventional ESLint validation.

---

## Environmental Applications

Coastal Intelligence is designed as a foundation for exploring several environmental monitoring use cases.

### Coastal Monitoring

Interactive visualization of geographic information related to coastal areas, marine environments, and environmental observations.

### Microalgae Monitoring

Potential integration of environmental indicators and remote-sensing products relevant to the observation of harmful or extensive algal blooms.

### Microplastics Monitoring

Exploration of spatial representations of microplastic sampling data and other scientifically validated observations.

Reliable direct detection of microplastics should not be assumed from conventional remote-sensing imagery.

### Spatial and Temporal Analysis

Future development may include comparisons of georeferenced datasets across multiple acquisition dates to identify and quantify environmental changes.

### Geospatial Artificial Intelligence

The project provides a foundation for investigating AI-assisted geospatial workflows, potentially including classification, segmentation, and environmental pattern analysis.

These applications represent development directions and should not be interpreted as a verified list of currently implemented analytical capabilities.

---

## Development Roadmap

### Phase 1 — Application Foundation

- [x] Establish the React and TypeScript project structure.
- [x] Configure the Vite development environment.
- [x] Add geospatial visualization dependencies.
- [x] Establish a public GitHub repository.
- [x] Configure a Netlify deployment.
- [ ] Document and validate all existing application features.

### Phase 2 — Technical Improvements

- [ ] Review application architecture and component organization.
- [ ] Improve documentation and code maintainability.
- [ ] Audit environment variables and API credential handling.
- [ ] Introduce automated tests.
- [ ] Add a dedicated linting workflow.
- [ ] Document data sources and spatial reference systems.

### Phase 3 — Geospatial Analysis

- [ ] Integrate validated environmental datasets.
- [ ] Develop reproducible spatial analysis workflows.
- [ ] Introduce temporal comparison capabilities.
- [ ] Support export of geospatial analysis results.
- [ ] Document analytical methodology and uncertainty.

### Phase 4 — Applied GeoAI

- [ ] Evaluate suitable machine-learning approaches.
- [ ] Explore geospatial classification and segmentation models.
- [ ] Integrate explainable analytical outputs.
- [ ] Validate model performance using appropriate datasets.
- [ ] Publish technical case studies demonstrating the workflows.

---

## Data Quality and Scientific Limitations

Environmental monitoring requires careful consideration of data quality, spatial resolution, acquisition dates, and analytical uncertainty.

Any future analytical functionality should document:

- Data provenance and acquisition date.
- Coordinate reference systems.
- Spatial and temporal resolution.
- Processing methods.
- Model assumptions and limitations.
- Validation procedures and uncertainty.

Coastal Intelligence should not be considered an operational environmental alert or early-warning system without appropriate scientific and operational validation.

---

## Project Background

Coastal Intelligence is part of an exploratory technical portfolio focused on the intersection of:

**Geographic Information Systems · Remote Sensing · Web Development · Applied Artificial Intelligence**

The project provides a practical environment for progressively developing and documenting geospatial software, interactive visualization tools, and environmental data analysis workflows.

Its development emphasizes technical transparency, reproducibility, and the responsible application of emerging technologies to environmental challenges.

---

## License

This repository does not currently declare an open-source license.

All rights are reserved by default. A license may be added in the future if public reuse and redistribution are intended.

---

**Repository:** https://github.com/Sppgg/coastal-intelligence

**Live Demo:** https://coastal-intelligence.netlify.app/
