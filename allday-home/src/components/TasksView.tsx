import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  Filter,
  X,
  AlertTriangle,
} from "lucide-react";
import { TaskItem, FamilyMember, MemberProfile } from "../types";

interface TasksViewProps {
  tasks: TaskItem[];
  members: MemberProfile[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<TaskItem, "id">) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks = [],
  members = [],
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const safeTasks = tasks || [];
  const safeMembers = members || [];
  const [selectedAssignee, setSelectedAssignee] = useState<string>("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<FamilyMember>("Thiago");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState<
    "Limpeza" | "Manutenção" | "Trabalho" | "Pessoal" | "Geral"
  >("Limpeza");

  const filteredTasks = safeTasks.filter((t) => {
    if (selectedAssignee !== "Todos" && t.assignee !== selectedAssignee) return false;
    return true;
  });

  const getMemberColor = (memberName: string) => {
    const found = safeMembers.find((m) => m.name === memberName);
    return found?.avatarColor || "bg-amber-500 text-slate-950";
  };

  const getPriorityBadge = (p: string) => {
    if (p === "high")
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    if (p === "medium")
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-slate-800 text-slate-400 border border-slate-700";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      assignee,
      dueDate,
      completed: false,
      priority,
      category,
    });

    setTitle("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Gestão de Afazeres Domésticos</span>
          </div>
          <h2 className="text-xl font-bold text-white">Tarefas & Responsabilidades</h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Assignee Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        {["Todos", "Thiago", "Erika", "Zoe", "Família"].map((m) => (
          <button
            key={m}
            onClick={() => setSelectedAssignee(m)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedAssignee === m
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">
            Nenhuma tarefa encontrada.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer group ${
                task.completed
                  ? "bg-slate-950/40 border-slate-800/40 opacity-60"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="w-5 h-5 accent-blue-500 rounded mt-0.5 cursor-pointer"
                />

                <div>
                  <p
                    className={`text-sm font-semibold ${
                      task.completed ? "line-through text-slate-500" : "text-slate-100"
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                    <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md font-medium">
                      {task.category}
                    </span>
                    {task.dueDate && <span>Data: {task.dueDate}</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getMemberColor(
                      task.assignee
                    )}`}
                  >
                    {task.assignee}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span
                  className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${getPriorityBadge(
                    task.priority
                  )}`}
                >
                  {task.priority === "high"
                    ? "Alta"
                    : task.priority === "medium"
                    ? "Média"
                    : "Baixa"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Nova Tarefa Doméstica</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Tirar o lixo / Trocar lâmpada da cozinha"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="Thiago">Thiago</option>
                    <option value="Erika">Erika</option>
                    <option value="Zoe">Zoe</option>
                    <option value="Família">Família</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="Limpeza">Limpeza</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Data Limite
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-blue-600/20"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
