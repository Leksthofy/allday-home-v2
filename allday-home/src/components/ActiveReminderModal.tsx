import React, { useEffect } from "react";
import {
  Bell,
  Clock,
  Pill,
  CheckCircle2,
  Volume2,
  X,
  Repeat,
  Heart,
  Sparkles,
} from "lucide-react";
import { HomeReminder } from "../types";
import { soundEffects } from "../lib/soundEffects";

interface ActiveReminderModalProps {
  reminder: HomeReminder | null;
  onDismiss: () => void;
  onComplete: () => void;
  onSnooze: (minutes: number) => void;
}

export const ActiveReminderModal: React.FC<ActiveReminderModalProps> = ({
  reminder,
  onDismiss,
  onComplete,
  onSnooze,
}) => {
  if (!reminder) return null;

  const isMedicine = reminder.category === "Remédio";

  const handleReplayChime = () => {
    if (isMedicine) {
      soundEffects.playMedicationAlertChime();
    } else {
      soundEffects.playGentleChime();
    }
    if (reminder.voiceAlert) {
      soundEffects.speak(`Lembrete: ${reminder.title}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/60 shadow-2xl shadow-amber-500/20 w-full max-w-lg rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                isMedicine
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              }`}
            >
              {isMedicine ? (
                <Pill className="w-6 h-6 animate-pulse" />
              ) : (
                <Bell className="w-6 h-6 animate-bounce" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {reminder.category || "Alarme"}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {reminder.time}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Lembrete Inteligente
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

        {/* Reminder Content Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-6 relative z-10 shadow-inner">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Para:{" "}
              <strong className="text-amber-300 font-bold">
                {reminder.member}
              </strong>
            </span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              Hora exata ({reminder.time})
            </span>
          </div>

          <p className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
            {reminder.title}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-400" />
              Alarme suave reproduzido
            </span>
            <button
              onClick={handleReplayChime}
              className="text-amber-400 hover:text-amber-300 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              Repetir som 🔔
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
          <button
            onClick={onComplete}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Concluir / Já realizado</span>
          </button>

          <button
            onClick={() => onSnooze(10)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Adiar 10 minutos</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onDismiss}
            className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
          >
            Fechar aviso
          </button>
        </div>
      </div>
    </div>
  );
};
