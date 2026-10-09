import React, { useState, useEffect } from "react";
import {
  Clock,
  Sun,
  CloudSun,
  Maximize2,
  Sparkles,
  Tv,
  Calendar as CalendarIcon,
  Smartphone,
  Radio,
} from "lucide-react";
import { WeatherData } from "../types";

interface HeaderProps {
  weather: WeatherData | null;
  onOpenAiModal: () => void;
  onActivateScreenSaver: () => void;
  isKioskMode: boolean;
  onToggleFullscreen: () => void;
  onOpenRemoteModal: () => void;
  connectedDevicesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  weather,
  onOpenAiModal,
  onActivateScreenSaver,
  onToggleFullscreen,
  onOpenRemoteModal,
  connectedDevicesCount = 1,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const secondsString = currentTime.toLocaleTimeString("pt-BR", {
    second: "2-digit",
  });

  const dateFormatted = currentTime.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Capitalize first letter of weekday
  const capitalizedDate =
    dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  const hour = currentTime.getHours();
  let greeting = "Bom dia";
  if (hour >= 12 && hour < 18) greeting = "Boa tarde";
  else if (hour >= 18 || hour < 5) greeting = "Boa noite";

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3.5 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Family Greeting */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-md shadow-orange-500/20">
              AH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  ALLDAY <span className="text-amber-400 font-light">Home</span>
                </h1>
                <span className="text-[10px] uppercase tracking-wider bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                  Kitchen Hub
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {greeting}, Thiago, Erika & Zoe 👋
              </p>
            </div>
          </div>

          {/* Mobile Clock Snippet */}
          <div className="md:hidden text-right">
            <div className="text-xl font-bold font-mono text-amber-300">
              {timeString}
            </div>
            <p className="text-[10px] text-slate-400 capitalize">
              {currentTime.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Center: Live Date & Time (Optimized for LG Screen 2-3m readability) */}
        <div className="hidden md:flex items-center gap-6 bg-slate-950/60 border border-slate-800 px-5 py-2 rounded-2xl">
          <div className="flex items-center gap-3 border-r border-slate-800 pr-5">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono tracking-tight text-amber-300">
                {timeString}
              </span>
              <span className="text-xs font-mono text-slate-400 font-medium">
                :{secondsString}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              {capitalizedDate}
            </span>
          </div>
        </div>

        {/* Right: Weather & Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {/* Weather Widget */}
          {weather && (
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-xl transition-all">
              <CloudSun className="w-5 h-5 text-amber-400" />
              <div className="text-left leading-tight">
                <div className="text-sm font-bold text-slate-100">
                  {weather.temperature}°C
                </div>
                <div className="text-[10px] text-slate-400 max-w-[90px] truncate">
                  {weather.condition}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Remote Pairing Button */}
          <button
            onClick={onOpenRemoteModal}
            className="flex items-center gap-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-amber-500/40 hover:border-amber-500 font-bold px-3 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Conectar smartphone para controlar a tela"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Celular</span>
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {connectedDevicesCount > 1 ? `${connectedDevicesCount}` : "ON"}
            </span>
          </button>

          {/* Voice/AI Quick Assistant Button */}
          <button
            onClick={onOpenAiModal}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            title="Abrir Assistente de Voz / Comandos IA"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Comando IA</span>
          </button>

          {/* Ambient Photo Mode Trigger */}
          <button
            onClick={onActivateScreenSaver}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-all cursor-pointer"
            title="Modo Porta-Retrato Ambient"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle for Kitchen All-In-One */}
          <button
            onClick={onToggleFullscreen}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-all cursor-pointer"
            title="Tela Cheia (Modo Kiosk)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
