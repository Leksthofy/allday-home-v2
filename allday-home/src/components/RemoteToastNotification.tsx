import React, { useEffect } from "react";
import {
  Smartphone,
  CheckCircle2,
  Sparkles,
  Volume2,
  MessageSquare,
  ShoppingBag,
  Calendar,
  X
} from "lucide-react";
import { RemoteToastNotification as NotificationType } from "../types";

interface RemoteToastProps {
  notifications: NotificationType[];
  onDismiss: (id: string) => void;
}

export function RemoteToastNotificationContainer({
  notifications,
  onDismiss,
}: RemoteToastProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-slate-900/95 border border-amber-500/40 text-slate-100 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3.5 animate-in slide-in-from-top-4 duration-300 ring-1 ring-amber-500/20"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            {notif.type === "voice" ? (
              <Sparkles className="w-5 h-5" />
            ) : notif.type === "alert" ? (
              <MessageSquare className="w-5 h-5" />
            ) : notif.title.includes("Compras") ? (
              <ShoppingBag className="w-5 h-5" />
            ) : notif.title.includes("Agenda") ? (
              <Calendar className="w-5 h-5" />
            ) : (
              <Smartphone className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {notif.title}
              </span>
              <button
                onClick={() => onDismiss(notif.id)}
                className="text-slate-500 hover:text-slate-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-100 mt-0.5 line-clamp-2">
              {notif.message}
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Via Celular de {notif.sender || "Família"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
