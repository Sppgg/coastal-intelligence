import React from 'react';
import { 
  Globe2, 
  Waves, 
  Trash2, 
  TrendingDown, 
  Database, 
  BarChart3, 
  Settings, 
  Compass,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { AppSection } from '../types';

interface NavigationSidebarProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  marineAlertsCount: number;
  unverifiedPlasticsCount: number;
}

interface NavItem {
  key: AppSection;
  number: string;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeSection,
  onSelectSection,
  marineAlertsCount,
  unverifiedPlasticsCount,
}) => {
  const navItems: NavItem[] = [
    {
      key: 'overview',
      number: '01',
      label: 'Visión general',
      shortDesc: 'Archipiélago y áreas piloto',
      icon: Globe2,
    },
    {
      key: 'marine',
      number: '02',
      label: 'Monitorización marina',
      shortDesc: 'Floraciones y Copernicus CMEMS',
      icon: Waves,
      badge: marineAlertsCount > 0 ? marineAlertsCount : undefined,
    },
    {
      key: 'plastics',
      number: '03',
      label: 'Residuos plásticos',
      shortDesc: 'Detección, FDI y Micro-FTIR',
      icon: Trash2,
      badge: unverifiedPlasticsCount > 0 ? unverifiedPlasticsCount : undefined,
    },
    {
      key: 'dynamics',
      number: '04',
      label: 'Dinámica litoral',
      shortDesc: 'Líneas de costa y DSAS',
      icon: TrendingDown,
    },
    {
      key: 'datasets',
      number: '05',
      label: 'Capas y datasets',
      shortDesc: 'Inventario, metadatos e importación',
      icon: Database,
    },
    {
      key: 'analysis',
      number: '06',
      label: 'Análisis y resultados',
      shortDesc: 'Estadísticas e informes',
      icon: BarChart3,
    },
    {
      key: 'settings',
      number: '07',
      label: 'Configuración y servicios',
      shortDesc: 'Pipeline Python y CRS',
      icon: Settings,
    },
  ];

  return (
    <aside 
      id="institutional-sidebar" 
      aria-label="Navegación principal de Teledetección Azul"
      className="w-64 bg-slate-950 border-r border-slate-800/90 flex flex-col justify-between shrink-0 select-none z-20"
    >
      {/* Top Header / Branding zone */}
      <div>
        <div className="px-5 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-100 block">
                TELEDETECCIÓN AZUL
              </span>
              <span className="text-[10px] text-cyan-400/90 font-medium block">
                Plataforma Geoespacial Canarias
              </span>
            </div>
          </div>
        </div>

        {/* Section Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;

            return (
              <button
                key={item.key}
                id={`nav-item-${item.key}`}
                onClick={() => onSelectSection(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all group ${
                  isActive
                    ? 'bg-cyan-950/80 text-white border border-cyan-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`font-mono text-[10px] font-bold ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
                  }`}>
                    {item.number}
                  </span>
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`} />
                  <div className="truncate">
                    <span className="text-xs font-semibold block truncate leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate leading-tight mt-0.5">
                      {item.shortDesc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer institutional credentials */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/60 text-[10px] text-slate-500 font-mono space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span>SISTEMA GEORREFERENCIADO</span>
          <span className="text-emerald-400 font-semibold">● ONLINE</span>
        </div>
        <div className="text-[9.5px] text-slate-400">
          CRS: EPSG:4326 / EPSG:32628 UTM28N
        </div>
        <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-900/80">
          Gobierno de Canarias &middot; RIS3 &middot; ECOMARIS
        </div>
      </div>
    </aside>
  );
};
