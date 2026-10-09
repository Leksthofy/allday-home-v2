import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Filter,
  CheckCircle2,
  Trash2,
  Clock,
  MapPin,
  RefreshCw,
  X,
  User,
} from "lucide-react";
import { CalendarEvent, FamilyMember, MemberProfile } from "../types";

interface CalendarViewProps {
  events: CalendarEvent[];
  members: MemberProfile[];
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events = [],
  members = [],
  onAddEvent,
  onDeleteEvent,
}) => {
  const safeEvents = events || [];
  const safeMembers = members || [];
  const [selectedMember, setSelectedMember] = useState<string>("Todos");
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [member, setMember] = useState<FamilyMember>("Thiago");
  const [category, setCategory] = useState<
    "Trabalho" | "Pessoal" | "Saúde" | "Escola" | "Lazer"
  >("Trabalho");
  const [location, setLocation] = useState("");
  const [googleSynced, setGoogleSynced] = useState(true);

  const filteredEvents = safeEvents.filter((e) => {
    if (selectedMember !== "Todos" && e.member !== selectedMember) return false;
    return true;
  });

  const handleSimulateGoogleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("✅ Sincronização com o Google Calendar realizada com sucesso!");
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title,
      date,
      time,
      endTime,
      member,
      category,
      location: location.trim() || undefined,
      googleSynced,
    });

    setTitle("");
    setLocation("");
    setIsModalOpen(false);
  };

  const getMemberColor = (memberName: string) => {
    const found = members.find((m) => m.name === memberName);
    return found?.avatarColor || "bg-amber-500 text-slate-950";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Sincronização Google Calendar</span>
          </div>
          <h2 className="text-xl font-bold text-white">Agenda Unificada da Família</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Google Sync Button */}
          <button
            onClick={handleSimulateGoogleSync}
            disabled={isSyncing}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Sincronizando..." : "Sincronizar Google"}</span>
          </button>

          {/* Add Event Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Compromisso</span>
          </button>
        </div>
      </div>

      {/* Filter by Member & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Family Member Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Membro:</span>
          </span>
          {["Todos", "Thiago", "Erika", "Zoe", "Família"].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMember(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedMember === m
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* View Mode Pills */}
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
          {(["month", "week", "day"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer capitalize ${
                viewMode === mode
                  ? "bg-slate-800 text-amber-300 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {mode === "month" ? "Mês" : mode === "week" ? "Semana" : "Dia"}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">
            Nenhum compromisso encontrado para o filtro selecionado.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getMemberColor(
                      evt.member
                    )}`}
                  >
                    {evt.member}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {evt.googleSynced && (
                      <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-md font-mono">
                        Google
                      </span>
                    )}

                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-100 text-base mb-2">
                  {evt.title}
                </h3>

                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{evt.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {evt.time || "Dia todo"}{" "}
                      {evt.endTime ? `- ${evt.endTime}` : ""}
                    </span>
                  </div>

                  {evt.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{evt.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800 font-medium">
                  {evt.category}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Novo Compromisso</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Atendimento Cliente João / Consulta Zoe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Membro da Família
                  </label>
                  <select
                    value={member}
                    onChange={(e) => setMember(e.target.value as FamilyMember)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-purple-500"
                  >
                    <option value="Thiago">Thiago</option>
                    <option value="Erika">Erika</option>
                    <option value="Zoe">Zoe</option>
                    <option value="Família">Família</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-purple-500"
                  >
                    <option value="Trabalho">Trabalho</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Escola">Escola</option>
                    <option value="Lazer">Lazer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Localização (Opcional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Estúdio / Clínica Infantil"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="googleSyncCheck"
                  checked={googleSynced}
                  onChange={(e) => setGoogleSynced(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="googleSyncCheck" className="text-xs text-slate-300 cursor-pointer">
                  Sincronizar automaticamente com o Google Calendar
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-purple-600/20"
                >
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
