import React from "react";
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  CheckSquare,
  Repeat,
  Utensils,
  Image as ImageIcon,
  DollarSign,
  HeartHandshake,
  Settings,
} from "lucide-react";
import { ActiveTab } from "../types";

interface SidebarNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingShoppingCount: number;
  pendingTasksCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  pendingShoppingCount,
  pendingTasksCount,
}) => {
  const navItems = [
    { id: "dashboard" as ActiveTab, label: "Painel", icon: LayoutDashboard },
    { id: "calendar" as ActiveTab, label: "Calendário", icon: Calendar },
    {
      id: "shopping" as ActiveTab,
      label: "Compras",
      icon: ShoppingBag,
      badge: pendingShoppingCount > 0 ? pendingShoppingCount : null,
    },
    {
      id: "tasks" as ActiveTab,
      label: "Tarefas",
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
    },
    { id: "routines" as ActiveTab, label: "Rotinas", icon: Repeat },
    { id: "meals" as ActiveTab, label: "Cardápio", icon: Utensils },
    { id: "photos" as ActiveTab, label: "Fotos", icon: ImageIcon },
    { id: "finances" as ActiveTab, label: "Financeiro", icon: DollarSign },
    { id: "zoe" as ActiveTab, label: "Zoe", icon: HeartHandshake },
    { id: "settings" as ActiveTab, label: "Ajustes", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Vertical Kiosk Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 min-h-[calc(100vh-70px)] sticky top-[70px]">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-3">
          Módulos do Hub
        </div>
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-slate-950" : "text-amber-400/80"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                      isActive
                        ? "bg-slate-950 text-amber-400"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom LG All-In-One Status Info */}
        <div className="mt-auto pt-4 border-t border-slate-800 text-xs text-slate-500">
          <p className="font-semibold text-slate-400">ALLDAY Home v1.0</p>
          <p className="text-[11px] mt-0.5">Kitchen Command Dashboard</p>
        </div>
      </aside>

      {/* Mobile Horizontal Bottom Scroll Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 overflow-x-auto flex items-center justify-between gap-1 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center min-w-[62px] py-1.5 px-2 rounded-xl text-[10px] font-medium transition-all relative cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate w-full text-center">{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span className="absolute top-0.5 right-1 w-4 h-4 text-[9px] bg-red-500 text-white font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
