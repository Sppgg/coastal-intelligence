import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  RotateCcw,
  Sparkles,
  History
} from 'lucide-react';
import { TemporalFilter } from '../types';

interface TimelineBarProps {
  temporalFilter: TemporalFilter;
  onDateChange: (date: string) => void;
  onOpenCalendar?: () => void;
}

const BASE_TIMELINE_STEPS = [
  { key: '2023-08-21', label: '21 AGO 23', desc: 'Inicio subset CMEMS PHY' },
  { key: '2023-08-22', label: '22 AGO 23', desc: 'Intrusión calima CAMS' },
  { key: '2023-08-23', label: '23 AGO 23', desc: 'Pico máximo (thetao 25.5°C)' },
  { key: '2023-08-24', label: '24 AGO 23', desc: 'Canal interinsular' },
  { key: '2023-08-25', label: '25 AGO 23', desc: 'Validación en campo' },
];

const HISTORICAL_EVENTS = [
  { key: '2022-09-18', label: 'SEP 2022', desc: 'Episodio Septiembre 2022' },
  { key: '2017-08-15', label: 'AGO 2017', desc: 'Gran Floración Histórica' },
];

export const TimelineBar: React.FC<TimelineBarProps> = ({
  temporalFilter,
  onDateChange,
  onOpenCalendar,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedDate = temporalFilter.date;
  const isRangeMode = temporalFilter.mode === 'range';
  const rangeStart = temporalFilter.startDate;
  const rangeEnd = temporalFilter.endDate;

  // Auto-play through 2023 dates in sequence
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const currentIndex = BASE_TIMELINE_STEPS.findIndex((s) => s.key === selectedDate);
      const nextIndex = (currentIndex + 1) % BASE_TIMELINE_STEPS.length;
      onDateChange(BASE_TIMELINE_STEPS[nextIndex].key);
    }, 2200);

    return () => clearInterval(interval);
  }, [isPlaying, selectedDate, onDateChange]);

  const currentIndex = BASE_TIMELINE_STEPS.findIndex((s) => s.key === selectedDate);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onDateChange(BASE_TIMELINE_STEPS[currentIndex - 1].key);
    }
  };

  const handleNext = () => {
    if (currentIndex < BASE_TIMELINE_STEPS.length - 1) {
      onDateChange(BASE_TIMELINE_STEPS[currentIndex + 1].key);
    }
  };

  const formatDateLabel = (isoDate: string) => {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const day = parts[2];
      const monthNum = parseInt(parts[1], 10);
      const year = parts[0];
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      return `${day} ${months[monthNum - 1] || ''} '${year.slice(2)}`;
    }
    return isoDate;
  };

  const isCustomDate = !BASE_TIMELINE_STEPS.some((s) => s.key === selectedDate) &&
                       !HISTORICAL_EVENTS.some((h) => h.key === selectedDate);

  return (
    <div
      id="coastal-timeline-bar"
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-auto max-w-[calc(100vw-2rem)] bg-slate-950/95 backdrop-blur-md border border-cyan-900/50 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-2 sm:gap-3 select-none"
    >
      {/* Play / Pause button */}
      <button
        id="btn-timeline-play"
        onClick={() => setIsPlaying(!isPlaying)}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition border ${
          isPlaying
            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
            : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400/50'
        }`}
        title={isPlaying ? 'Pausar evolución temporal' : 'Reproducir evolución temporal (21-25 AGO 2023)'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />}
      </button>

      {/* Prev step */}
      <button
        id="btn-timeline-prev"
        onClick={handlePrev}
        disabled={currentIndex <= 0}
        className="p-1 sm:p-1.5 rounded-md text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
        title="Día anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Copernicus 2023 Steps */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {BASE_TIMELINE_STEPS.map((step) => {
          const isSelected = !isRangeMode && selectedDate === step.key;
          const isInRange = isRangeMode && step.key >= rangeStart && step.key <= rangeEnd;

          let btnClasses = 'flex flex-col items-center px-2.5 py-1 rounded-lg border transition text-left ';

          if (isSelected) {
            btnClasses += 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 scale-105 ';
          } else if (isInRange) {
            btnClasses += 'bg-cyan-950/70 border-cyan-600 text-cyan-200 shadow-sm ';
          } else {
            btnClasses += 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 ';
          }

          return (
            <button
              key={step.key}
              id={`timeline-step-${step.key}`}
              onClick={() => {
                setIsPlaying(false);
                onDateChange(step.key);
              }}
              className={btnClasses}
            >
              <span className={`text-[11px] sm:text-xs font-mono font-bold ${isSelected || isInRange ? 'text-cyan-300' : ''}`}>
                {step.label}
              </span>
              <span className="text-[9px] text-slate-400 hidden md:block">
                {step.desc}
              </span>
            </button>
          );
        })}

        {/* Separator to historical events */}
        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Historical Events from PDF */}
        <div className="hidden sm:flex items-center gap-1">
          {HISTORICAL_EVENTS.map((event) => {
            const isSelected = !isRangeMode && selectedDate === event.key;
            return (
              <button
                key={event.key}
                onClick={() => {
                  setIsPlaying(false);
                  onDateChange(event.key);
                }}
                className={`flex flex-col items-center px-2 py-1 rounded-lg border transition ${
                  isSelected
                    ? 'bg-amber-600 border-amber-400 text-white font-bold shadow-md'
                    : 'bg-slate-900/40 border-slate-800 text-amber-400/80 hover:text-amber-300 hover:bg-slate-800'
                }`}
                title={event.desc}
              >
                <span className="text-[10px] font-mono font-semibold flex items-center gap-0.5">
                  <History className="w-2.5 h-2.5 inline" /> {event.label}
                </span>
                <span className="text-[8px] text-slate-500 hidden lg:block">Histórico</span>
              </button>
            );
          })}
        </div>

        {/* If custom date is chosen from calendar */}
        {isCustomDate && !isRangeMode && (
          <button
            onClick={() => onDateChange(selectedDate)}
            className="flex flex-col items-center px-2.5 py-1 rounded-lg border border-cyan-400 bg-cyan-950 text-white shadow-md"
          >
            <span className="text-[11px] font-mono font-bold text-cyan-300">
              {formatDateLabel(selectedDate)}
            </span>
            <span className="text-[9px] text-slate-400">Personalizada</span>
          </button>
        )}
      </div>

      {/* Next step */}
      <button
        id="btn-timeline-next"
        onClick={handleNext}
        disabled={currentIndex >= BASE_TIMELINE_STEPS.length - 1}
        className="p-1 sm:p-1.5 rounded-md text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
        title="Día siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Open full Calendar shortcut */}
      {onOpenCalendar && (
        <button
          onClick={onOpenCalendar}
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-[10px] font-mono transition ml-1"
          title="Abrir calendario completo"
        >
          <Calendar className="w-3 h-3" />
          <span>Calendario</span>
        </button>
      )}

      {/* Badge indicating Copernicus dataset connection */}
      <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-800 text-[10px] text-cyan-400/80 font-mono">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>Copernicus CMEMS &middot; CAMS EAC4</span>
      </div>
    </div>
  );
};
