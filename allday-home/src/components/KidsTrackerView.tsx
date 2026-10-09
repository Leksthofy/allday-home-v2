import React, { useState } from "react";
import {
  HeartHandshake,
  Plus,
  Trash2,
  ShieldCheck,
  Stethoscope,
  Ruler,
  Pill,
  X,
  Bell,
  Clock,
  Volume2,
  Sparkles,
} from "lucide-react";
import { ChildLogRecord, HomeReminder } from "../types";

interface KidsTrackerViewProps {
  logs: ChildLogRecord[];
  onAddLog: (log: Omit<ChildLogRecord, "id">) => void;
  onDeleteLog: (id: string) => void;
  reminders?: HomeReminder[];
  onAddReminder?: (reminder: Omit<HomeReminder, "id">) => void;
  onDeleteReminder?: (id: string) => void;
  onTestSound?: () => void;
}

export const KidsTrackerView: React.FC<KidsTrackerViewProps> = ({
  logs = [],
  onAddLog,
  onDeleteLog,
  reminders = [],
  onAddReminder,
  onDeleteReminder,
  onTestSound,
}) => {
  const safeLogs = logs || [];
  const safeReminders = reminders || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickAlarmModalOpen, setIsQuickAlarmModalOpen] = useState(false);

  // Form
  const [type, setType] = useState<"Vacina" | "Consulta" | "Crescimento" | "Remédio">("Remédio");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderTime, setReminderTime] = useState("15:00");
  const [createAlarm, setCreateAlarm] = useState(true);

  // Quick alarm modal state
  const [quickAlarmTitle, setQuickAlarmTitle] = useState("Remédio da Zoe");
  const [quickAlarmTime, setQuickAlarmTime] = useState("15:00");

  const zoeReminders = safeReminders.filter((r) => r.member === "Zoe");

  const getTypeIcon = (t: string) => {
    if (t === "Vacina") return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    if (t === "Consulta") return <Stethoscope className="w-5 h-5 text-purple-400" />;
    if (t === "Crescimento") return <Ruler className="w-5 h-5 text-amber-400" />;
    return <Pill className="w-5 h-5 text-rose-400" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddLog({
      type,
      title: title.trim(),
      date,
      value: value.trim() || undefined,
      notes: notes.trim() || undefined,
      time: type === "Remédio" && createAlarm ? reminderTime : undefined,
      hasReminder: type === "Remédio" && createAlarm,
    });

    // Also register scheduled reminder alarm
    if (type === "Remédio" && createAlarm && onAddReminder) {
      onAddReminder({
        title: `Remédio da Zoe: ${title.trim()}`,
        time: reminderTime,
        member: "Zoe",
        category: "Remédio",
        repeatDaily: true,
        soundEnabled: true,
        voiceAlert: true,
        completed: false,
      });
    }

    setTitle("");
    setValue("");
    setNotes("");
    setIsModalOpen(false);
  };

  const handleQuickAlarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAlarmTitle.trim() || !onAddReminder) return;

    onAddReminder({
      title: quickAlarmTitle.trim(),
      time: quickAlarmTime,
      member: "Zoe",
      category: "Remédio",
      repeatDaily: true,
      soundEnabled: true,
      voiceAlert: true,
      completed: false,
    });

    setIsQuickAlarmModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Acompanhamento Infantil</span>
          </div>
          <h2 className="text-xl font-bold text-white">Diário da Zoe (Saúde, Remédios & Crescimento)</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onTestSound && (
            <button
              onClick={onTestSound}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Testar alarme sonoro suave"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Testar Som Suave</span>
            </button>
          )}

          <button
            onClick={() => setIsQuickAlarmModalOpen(true)}
            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <Bell className="w-4 h-4" />
            <span>+ Alarme de Remédio</span>
          </button>

          <button
            onClick={() => {
              setType("Remédio");
              setIsModalOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar no Diário</span>
          </button>
        </div>
      </div>

      {/* Zoe Active Alarms Widget */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/30 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Alarmes e Horários dos Remédios da Zoe
              </h3>
              <p className="text-xs text-slate-400">
                A tela tocará um som suave e exibirá o alerta na hora exata
              </p>
            </div>
          </div>

          <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            {zoeReminders.length} ativo(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {zoeReminders.length === 0 ? (
            <div className="col-span-full py-5 text-center text-slate-500 text-xs">
              Nenhum alarme programado para a Zoe. Clique em "+ Alarme de Remédio" para programar.
            </div>
          ) : (
            zoeReminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center bg-rose-500/10 border border-rose-500/30 rounded-xl px-2.5 py-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400 mb-0.5" />
                    <span className="text-xs font-black font-mono text-rose-300">
                      {rem.time}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-100">{rem.title}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      <span>Alarme suave ativado</span>
                      {rem.repeatDaily && <span>• Diário</span>}
                    </p>
                  </div>
                </div>

                {onDeleteReminder && (
                  <button
                    onClick={() => onDeleteReminder(rem.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
                    title="Excluir alarme"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-md hover:border-slate-700 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                {getTypeIcon(log.type)}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {log.type}
                  </span>
                  <span className="text-xs text-slate-400">{log.date}</span>
                  {log.time && (
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      ⏰ {log.time}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-slate-100 text-base">{log.title}</h3>

                {log.value && (
                  <p className="text-xs font-mono font-bold text-amber-300 mt-1">
                    {log.value}
                  </p>
                )}

                {log.notes && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {log.notes}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDeleteLog(log.id)}
              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Quick Alarm Modal */}
      {isQuickAlarmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsQuickAlarmModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase mb-2">
              <Pill className="w-4 h-4" />
              <span>Programar Alarme</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">
              Novo Horário de Remédio da Zoe
            </h3>

            <form onSubmit={handleQuickAlarmSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nome do Remédio / Descrição *
                </label>
                <input
                  type="text"
                  required
                  value={quickAlarmTitle}
                  onChange={(e) => setQuickAlarmTitle(e.target.value)}
                  placeholder="Ex: Remédio da Zoe (Paracetamol às 15h)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Horário do Alarme * (HH:mm)
                </label>
                <input
                  type="time"
                  required
                  value={quickAlarmTime}
                  onChange={(e) => setQuickAlarmTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-rose-300 font-mono text-base font-bold outline-none focus:border-rose-500"
                />
              </div>

              <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                🔔 Quando for <strong>{quickAlarmTime}</strong>, o painel da cozinha tocará um som suave e exibirá a notificação na tela.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAlarmModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-rose-600/30"
                >
                  Ativar Alarme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Log Modal */}
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
              Novo Registro no Diário da Zoe
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Tipo de Registro
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  >
                    <option value="Remédio">Remédio / Vitamina</option>
                    <option value="Vacina">Vacina</option>
                    <option value="Consulta">Consulta Pediatra</option>
                    <option value="Crescimento">Medição (Peso/Altura)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Paracetamol para febre / Vitamina D diária"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Valor / Dose / Medida (Opcional)
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ex: 3 gotas às 15h ou 10ml"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              {/* Medicine Alarm Section */}
              {type === "Remédio" && (
                <div className="bg-slate-950 border border-rose-500/30 rounded-2xl p-4 space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-rose-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createAlarm}
                      onChange={(e) => setCreateAlarm(e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <span>⏰ Ativar alarme sonoro na tela no horário programado</span>
                  </label>

                  {createAlarm && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Horário do Remédio
                        </label>
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-rose-300 font-mono font-bold outline-none"
                        />
                      </div>
                      <div className="flex items-center text-[11px] text-slate-400 pt-4">
                        <span>A tela tocará um som suave às {reminderTime}.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Observações & Anotações
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Tomar após as refeições ou com um pouco de água."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 resize-none"
                />
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
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
