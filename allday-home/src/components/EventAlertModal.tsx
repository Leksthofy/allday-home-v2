import React, { useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  X,
  Volume2,
  ArrowRight,
  Bell,
  Sparkles,
} from "lucide-react";
import { CalendarEvent } from "../types";
import { soundEffects } from "../lib/soundEffects";

interface EventAlertModalProps {
  event: CalendarEvent | null;
  isOneHourBefore?: boolean;
  onDismiss: () => void;
  onViewCalendar: () => void;
}

export const EventAlertModal: React.FC<EventAlertModalProps> = ({
  event,
  isOneHourBefore = true,
  onDismiss,
  onViewCalendar,
}) => {
  if (!event) return null;

  useEffect(() => {
    // Play gentle chime
    soundEffects.playGentleChime();

    // Voice announcement
    const text = isOneHourBefore
      ? `Atenção ${event.member}: Daqui a uma hora você tem o compromisso: ${event.title} às ${event.time || "horário marcado"}.`
      : `Atenção ${event.member}: O compromisso ${event.title} está começando agora.`;

    const timer = setTimeout(() => {
      soundEffects.speak(text);
    }, 700);

    return () => {
      clearTimeout(timer);
      soundEffects.stopAll();
    };
  }, [event, isOneHourBefore]);

  const handleReplayVoice = () => {
    soundEffects.playGentleChime();
    const text = isOneHourBefore
      ? `Atenção ${event.member}: Daqui a uma hora você tem o compromisso: ${event.title} às ${event.time || ""}.`
      : `Atenção ${event.member}: O compromisso ${event.title} está começando agora.`;
    soundEffects.speak(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-purple-500/60 shadow-2xl shadow-purple-500/20 w-full max-w-lg rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-purple-500/20 text-purple-400 border border-purple-500/40">
              <CalendarIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest font-bold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  {isOneHourBefore ? "⏰ Em 1 Hora" : "🔔 Começando Agora"}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {event.time || "Hoje"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Alerta de Compromisso
              </h2>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            title="Dispensar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Content Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-6 relative z-10 shadow-inner space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Responsável:{" "}
              <strong className="text-amber-300 font-bold">{event.member}</strong>
            </span>
            <span className="text-[11px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg">
              {event.category}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
            {event.title}
          </h3>

          {event.location && (
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{event.location}</span>
            </p>
          )}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <Bell className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>
                {isOneHourBefore
                  ? "Aviso com 60 minutos de antecedência"
                  : "Horário previsto do compromisso"}
              </span>
            </div>

            <button
              onClick={handleReplayVoice}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
              title="Ouvir aviso sonoro novamente"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Repetir Voz</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
          <button
            onClick={onDismiss}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
          >
            <span>Entendido / Dispensar</span>
          </button>

          <button
            onClick={() => {
              onDismiss();
              onViewCalendar();
            }}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
          >
            <span>Ver no Calendário</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
