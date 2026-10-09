import React, { useState } from "react";
import { Repeat, Plus, Trash2, CheckCircle2, User, X } from "lucide-react";
import { DailyRoutine, FamilyMember, MemberProfile } from "../types";

interface RoutinesViewProps {
  routines: DailyRoutine[];
  members: MemberProfile[];
  onToggleRoutine: (id: string) => void;
  onAddRoutine: (routine: Omit<DailyRoutine, "id">) => void;
  onDeleteRoutine: (id: string) => void;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines = [],
  members = [],
  onToggleRoutine,
  onAddRoutine,
  onDeleteRoutine,
}) => {
  const safeRoutines = routines || [];
  const safeMembers = members || [];
  const [selectedDay, setSelectedDay] = useState<
    "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo"
  >("Segunda");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<FamilyMember>("Thiago");
  const [timeOfDay, setTimeOfDay] = useState<"Manhã" | "Tarde" | "Noite">("Manhã");

  const days: Array<
    "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo"
  > = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  const getMemberColor = (memberName: string) => {
    const found = safeMembers.find((m) => m.name === memberName);
    return found?.avatarColor || "bg-amber-500 text-slate-950";
  };

  const dayRoutines = safeRoutines.filter((r) => r.dayOfWeek === selectedDay);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddRoutine({
      dayOfWeek: selectedDay,
      title,
      assignee,
      completed: false,
      timeOfDay,
    });

    setTitle("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Repeat className="w-4 h-4" />
            <span>Rotinas Recorrentes da Família</span>
          </div>
          <h2 className="text-xl font-bold text-white">Hábitos & Grade Semanal</h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Rotina Recorrente</span>
        </button>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const count = safeRoutines.filter((r) => r.dayOfWeek === day).length;
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                isSelected
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                  isSelected ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Routine Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dayRoutines.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">
            Nenhuma rotina cadastrada para {selectedDay}.
          </div>
        ) : (
          dayRoutines.map((routine) => (
            <div
              key={routine.id}
              onClick={() => onToggleRoutine(routine.id)}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                routine.completed
                  ? "bg-slate-950/40 border-slate-800/40 opacity-60 line-through"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={routine.completed}
                  onChange={() => onToggleRoutine(routine.id)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-100">{routine.title}</p>
                  <p className="text-[10px] text-amber-400/80 uppercase tracking-wider font-semibold mt-0.5">
                    {routine.timeOfDay || "Manhã"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getMemberColor(
                    routine.assignee
                  )}`}
                >
                  {routine.assignee}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRoutine(routine.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Routine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              Nova Rotina ({selectedDay})
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Título da Rotina *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Treino de Natação Zoe / Faxina na Cozinha"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Responsável
                  </label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value as FamilyMember)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  >
                    <option value="Thiago">Thiago</option>
                    <option value="Erika">Erika</option>
                    <option value="Zoe">Zoe</option>
                    <option value="Família">Família</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Período do Dia
                  </label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                  </select>
                </div>
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Salvar Rotina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
