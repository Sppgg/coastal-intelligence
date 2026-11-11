import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  X, 
  Check, 
  Clock, 
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { TemporalFilter, DateFilterMode } from '../types';
import { NoBloomsAlertModal } from './NoBloomsAlertModal';

interface CalendarSelectorProps {
  temporalFilter: TemporalFilter;
  onChangeFilter: (filter: TemporalFilter) => void;
  // Available dates in prototype data with satellite passes
  satelliteDates?: string[];
  onOpenSatelliteImagery?: (date: string) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  temporalFilter,
  onChangeFilter,
  satelliteDates = [
    '2023-08-21', '2023-08-22', '2023-08-23', '2023-08-24', '2023-08-25',
    '2017-08-04', '2017-08-06', '2017-08-07', '2017-08-09', '2017-08-11',
    '2017-08-12', '2017-08-13', '2017-08-14', '2017-08-16', '2017-08-17', '2017-08-22'
  ],
  onOpenSatelliteImagery,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [noBloomsModalDate, setNoBloomsModalDate] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view year and month from the current filter
  const initialDate = new Date(temporalFilter.date || '2023-08-23');
  const [viewYear, setViewYear] = useState(initialDate.getFullYear() || 2023);
  const [viewMonth, setViewMonth] = useState(isNaN(initialDate.getMonth()) ? 7 : initialDate.getMonth()); // 0 - 11 (7 = August)

  // Temporary selection state inside popover
  const [mode, setMode] = useState<DateFilterMode>(temporalFilter.mode);
  const [selectedSingle, setSelectedSingle] = useState<string>(temporalFilter.date || '2023-08-23');
  const [rangeStart, setRangeStart] = useState<string>(temporalFilter.startDate || '2023-08-21');
  const [rangeEnd, setRangeEnd] = useState<string>(temporalFilter.endDate || '2023-08-25');
  const [rangeSelectingStep, setRangeSelectingStep] = useState<'start' | 'end'>('start');

  // Sync internal state when external filter changes
  useEffect(() => {
    setMode(temporalFilter.mode);
    setSelectedSingle(temporalFilter.date);
    if (temporalFilter.startDate) setRangeStart(temporalFilter.startDate);
    if (temporalFilter.endDate) setRangeEnd(temporalFilter.endDate);
    const d = new Date(temporalFilter.date);
    if (!isNaN(d.getTime())) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [temporalFilter]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format YYYY-MM-DD to DD/MM/YYYY
  const formatDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  };

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Handle Day Click
  const handleDayClick = (dayString: string) => {
    const hasBloom = satelliteDates.includes(dayString);
    if (mode === 'single') {
      setSelectedSingle(dayString);
      onChangeFilter({
        mode: 'single',
        date: dayString,
        startDate: dayString,
        endDate: dayString,
      });
      setIsOpen(false);
      if (!hasBloom) {
        setNoBloomsModalDate(dayString);
      }
    } else {
      // Range mode selection
      if (rangeSelectingStep === 'start') {
        setRangeStart(dayString);
        if (dayString > rangeEnd) {
          setRangeEnd(dayString);
        }
        setRangeSelectingStep('end');
      } else {
        if (dayString < rangeStart) {
          setRangeStart(dayString);
        } else {
          setRangeEnd(dayString);
        }
        setRangeSelectingStep('start');
      }
    }
  };

  const handleSelectToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    setSelectedSingle(today);
    setMode('single');
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onChangeFilter({
      mode: 'single',
      date: today,
      startDate: today,
      endDate: today,
    });
    setIsOpen(false);
    if (!satelliteDates.includes(today)) {
      setNoBloomsModalDate(today);
    }
  };

  const handleApplyRange = () => {
    const s = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
    const e = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
    onChangeFilter({
      mode: 'range',
      date: e, // latest date in range as anchor
      startDate: s,
      endDate: e,
    });
    setIsOpen(false);
  };

  const handleResetToCurrentData = () => {
    const defaultDate = '2023-08-23';
    setSelectedSingle(defaultDate);
    setMode('single');
    setViewYear(2023);
    setViewMonth(7); // August (0-indexed)
    onChangeFilter({
      mode: 'single',
      date: defaultDate,
      startDate: defaultDate,
      endDate: defaultDate,
    });
    setIsOpen(false);
  };

  const handleJumpToHistorical = (date: string, year: number, month: number) => {
    setSelectedSingle(date);
    setMode('single');
    setViewYear(year);
    setViewMonth(month);
    onChangeFilter({
      mode: 'single',
      date,
      startDate: date,
      endDate: date,
    });
    setIsOpen(false);
  };

  // Build calendar matrix for viewMonth / viewYear
  const getCalendarDays = () => {
    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days = [];
    // Leading empty days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days of current month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const monthPadded = String(viewMonth + 1).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      const dateString = `${viewYear}-${monthPadded}-${dayPadded}`;
      days.push({
        dayNumber: day,
        dateString,
        hasSatellitePass: satelliteDates.includes(dateString),
      });
    }
    return days;
  };

  const calendarGrid = getCalendarDays();

  return (
    <div ref={containerRef} className="relative inline-block text-left select-none">
      {/* Visual Trigger Button */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400 font-mono hidden md:inline-block">
          Fecha de observación:
        </span>
        <button
          id="btn-open-calendar-selector"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition shadow-sm ${
            isOpen 
              ? 'bg-cyan-950 border-cyan-400 text-cyan-200' 
              : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-cyan-500/70 hover:text-white'
          }`}
          title="Abrir selector de fecha y calendario"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            {temporalFilter.mode === 'single'
              ? formatDisplay(temporalFilter.date)
              : `${formatDisplay(temporalFilter.startDate)} - ${formatDisplay(temporalFilter.endDate)}`}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 uppercase font-sans">
            {temporalFilter.mode === 'single' ? 'Día' : 'Rango'}
          </span>
        </button>
      </div>

      {/* Popover / Calendar Dropdown */}
      {isOpen && (
        <div
          id="coastal-calendar-popover"
          className="absolute left-0 top-full mt-2 w-80 bg-slate-950 border border-slate-700/90 rounded-xl shadow-2xl p-3.5 z-50 text-slate-200 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 font-sans"
        >
          {/* Header Mode Switcher: Fecha Única vs Rango */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <button
                id="btn-mode-single-date"
                onClick={() => setMode('single')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                  mode === 'single'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fecha Única
              </button>
              <button
                id="btn-mode-range-date"
                onClick={() => setMode('range')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                  mode === 'range'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rango de Fechas
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Range summary indicators if in range mode */}
          {mode === 'range' && (
            <div className="py-2.5 px-3 my-2 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] flex items-center justify-between font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Desde:</span>
                <span className="text-cyan-300 font-bold">{formatDisplay(rangeStart)}</span>
              </div>
              <span className="text-slate-500">&rarr;</span>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Hasta:</span>
                <span className="text-cyan-300 font-bold">{formatDisplay(rangeEnd)}</span>
              </div>
            </div>
          )}

          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between py-2">
            <button
              id="btn-calendar-prev-month"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100 font-mono">
              <span>{MONTH_NAMES[viewMonth]}</span>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-cyan-400 font-mono text-xs focus:outline-none"
              >
                <option value={2017}>2017</option>
                <option value={2022}>2022</option>
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>

            <button
              id="btn-calendar-next-month"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-400 py-1">
            {DAY_NAMES.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 py-1">
            {calendarGrid.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="w-8 h-8" />;
              }

              const { dayNumber, dateString, hasSatellitePass } = item;
              
              // Determine selection state
              const isSelectedSingle = mode === 'single' && selectedSingle === dateString;
              const isRangeStart = mode === 'range' && rangeStart === dateString;
              const isRangeEnd = mode === 'range' && rangeEnd === dateString;
              const isInRange = mode === 'range' && dateString > rangeStart && dateString < rangeEnd;

              let cellClasses = 'w-8 h-8 rounded-lg flex flex-col items-center justify-center text-xs font-mono transition relative ';

              if (isSelectedSingle || isRangeStart || isRangeEnd) {
                cellClasses += 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30 ';
              } else if (isInRange) {
                cellClasses += 'bg-cyan-950 text-cyan-200 font-semibold border border-cyan-800/60 ';
              } else {
                cellClasses += 'hover:bg-slate-800 text-slate-300 ';
              }

              return (
                <button
                  key={dateString}
                  onClick={() => handleDayClick(dateString)}
                  className={cellClasses}
                  title={`${formatDisplay(dateString)}${hasSatellitePass ? ' (Pase Sentinel verificado)' : ''}`}
                >
                  <span>{dayNumber}</span>
                  {/* Indicator dot for verified satellite passes */}
                  {hasSatellitePass && (
                    <span
                      className={`w-1 h-1 rounded-full absolute bottom-1 ${
                        isSelectedSingle || isRangeStart || isRangeEnd
                          ? 'bg-slate-950'
                          : 'bg-cyan-400 animate-pulse'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick presets for the 3 real events in the PDF */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">Eventos Reales Copernicus (PDF):</span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={handleSelectToday}
                className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 font-mono font-bold transition flex items-center gap-1"
                title="Ver fecha y mapa de hoy (Copernicus tiempo real)"
              >
                <span>📅 Hoy (Tiempo Real)</span>
              </button>
              <button
                onClick={() => handleJumpToHistorical('2023-08-23', 2023, 7)}
                className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 font-mono transition"
              >
                23/08/2023 (TF02 Sur)
              </button>
              <button
                onClick={() => handleJumpToHistorical('2023-08-25', 2023, 7)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-mono transition"
              >
                25/08/2023 (TF03 Oeste)
              </button>
              <button
                onClick={() => handleJumpToHistorical('2023-08-21', 2023, 7)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 font-mono transition"
              >
                21/08/2023 (LP01 La Palma)
              </button>
              <button
                onClick={() => handleJumpToHistorical('2017-08-11', 2017, 7)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700 font-mono transition"
              >
                11/08/2017 (TF11 Pico 279km²)
              </button>
              <button
                onClick={() => handleJumpToHistorical('2017-08-22', 2017, 7)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 font-mono transition"
              >
                22/08/2017 (LG22 La Gomera)
              </button>
            </div>
          </div>

          {/* Calendar Footer Actions */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={handleResetToCurrentData}
              className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono py-1 px-2 rounded hover:bg-slate-900 transition"
              title="Volver a los datos de Agosto 2023"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Pico 2023 (23/08/2023)</span>
            </button>

            {mode === 'range' && (
              <button
                onClick={handleApplyRange}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shadow-sm flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Aplicar Rango</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pop-up Modal when user selects a date without bloom events */}
      <NoBloomsAlertModal
        isOpen={Boolean(noBloomsModalDate)}
        onClose={() => setNoBloomsModalDate(null)}
        selectedDate={noBloomsModalDate || ''}
        onJumpToDate={(date) => {
          const parts = date.split('-');
          handleJumpToHistorical(date, Number(parts[0]), Number(parts[1]) - 1);
          setNoBloomsModalDate(null);
        }}
        onOpenSatelliteImagery={() => {
          if (onOpenSatelliteImagery && noBloomsModalDate) {
            onOpenSatelliteImagery(noBloomsModalDate);
          }
          setNoBloomsModalDate(null);
        }}
      />
    </div>
  );
};
