import React, { useState, useEffect } from "react";
import { Clock, Calendar, Heart, X } from "lucide-react";
import { FamilyPhoto, WeatherData } from "../types";

interface KioskScreenSaverProps {
  photos: FamilyPhoto[];
  weather: WeatherData | null;
  quoteOfDay: string;
  onExit: () => void;
}

export const KioskScreenSaver: React.FC<KioskScreenSaverProps> = ({
  photos,
  weather,
  quoteOfDay,
  onExit,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (photos.length <= 1) return;
    const photoTimer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 6000);
    return () => clearInterval(photoTimer);
  }, [photos]);

  const activePhoto = photos[photoIndex] || {
    title: "Família ALLDAY Home",
    url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    caption: "Momentos especiais em família",
  };

  const timeString = currentTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateFormatted = currentTime.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      onClick={onExit}
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-8 sm:p-12 cursor-pointer select-none overflow-hidden animate-in fade-in duration-500"
    >
      {/* Background Image with subtle Ken Burns effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          key={activePhoto.id || photoIndex}
          src={activePhoto.url}
          alt={activePhoto.title}
          className="w-full h-full object-cover opacity-60 animate-in fade-in duration-1000 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
      </div>

      {/* Top Bar Overlay */}
      <div className="relative z-10 flex items-center justify-between text-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-lg shadow-lg">
            AH
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">ALLDAY Home</h1>
            <p className="text-xs text-amber-300 font-medium">Toque em qualquer lugar para usar</p>
          </div>
        </div>

        {weather && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-2xl text-right">
            <span className="text-xl font-bold text-amber-300">
              {weather.temperature}°C
            </span>
            <p className="text-xs text-slate-300">{weather.condition}</p>
          </div>
        )}
      </div>

      {/* Center Clock & Quote */}
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4 my-auto">
        <div className="inline-flex items-center justify-center bg-slate-950/70 backdrop-blur-md border border-slate-800/80 px-8 py-4 rounded-3xl shadow-2xl">
          <span className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-amber-300">
            {timeString}
          </span>
        </div>

        <p className="text-xl sm:text-2xl font-medium text-white capitalize drop-shadow-md">
          {dateFormatted}
        </p>

        <p className="text-sm sm:text-base text-slate-300 italic max-w-xl mx-auto drop-shadow-sm">
          "{quoteOfDay}"
        </p>
      </div>

      {/* Bottom Photo Caption Overlay */}
      <div className="relative z-10 flex items-end justify-between text-xs text-slate-300">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl max-w-md space-y-1">
          <div className="flex items-center gap-2">
            {activePhoto.source === "google_drive" ? (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                📁 Google Drive • Proteção de Tela
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Memória da Família
              </span>
            )}
            {photos.length > 1 && (
              <span className="text-[10px] text-slate-400">
                {photoIndex + 1} de {photos.length}
              </span>
            )}
          </div>
          <p className="font-bold text-white text-sm">{activePhoto.title}</p>
          {activePhoto.caption && <p className="text-slate-300 text-xs">{activePhoto.caption}</p>}
        </div>

        <div className="text-right text-slate-400 text-[11px] bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-800">
          Modo Porta-Retrato Digital • Toque para retornar ao Painel
        </div>
      </div>
    </div>
  );
};
