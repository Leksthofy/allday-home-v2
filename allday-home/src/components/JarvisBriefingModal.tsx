import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  Pill,
  DollarSign,
  Utensils,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  Sun,
  Bot,
  Heart,
} from "lucide-react";
import {
  CalendarEvent,
  TaskItem,
  HomeReminder,
  BillItem,
  MealPlanItem,
  ActiveTab,
} from "../types";
import { soundEffects } from "../lib/soundEffects";

interface JarvisBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  events?: CalendarEvent[];
  tasks?: TaskItem[];
  reminders?: HomeReminder[];
  bills?: BillItem[];
  meals?: MealPlanItem[];
  weather?: {
    city?: string;
    temperature?: number;
    description?: string;
    humidity?: number;
    windSpeed?: number;
  } | null;
  quoteOfDay?: string;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const JarvisBriefingModal: React.FC<JarvisBriefingModalProps> = ({
  isOpen,
  onClose,
  events = [],
  tasks = [],
  reminders = [],
  bills = [],
  meals = [],
  weather,
  quoteOfDay = "",
  onNavigateTab,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiBriefingData, setAiBriefingData] = useState<{
    greeting?: string;
    speechText?: string;
    highlight?: string;
    motivationalTip?: string;
  } | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentHour = now.getHours();

  const greeting =
    currentHour < 12
      ? "Bom dia, Thiago & Erika!"
      : currentHour < 18
      ? "Boa tarde, Thiago & Erika!"
      : "Boa noite, Thiago & Erika!";

  const daysMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const currentDayOfWeek = daysMap[now.getDay()];

  const fullDateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Today's items
  const safeEvents = events || [];
  const safeTasks = tasks || [];
  const safeReminders = reminders || [];
  const safeBills = bills || [];
  const safeMeals = meals || [];

  const todayEvents = safeEvents.filter((e) => e.date === todayStr);
  const todayTasks = safeTasks.filter((t) => t.dueDate === todayStr || !t.completed);
  const todayReminders = safeReminders.filter((r) => r.repeatDaily || r.date === todayStr);

  // Urgent bills (within 5 days or overdue)
  const pendingBills = safeBills.filter((b) => !b.paid);

  // Meals for today
  const familyMeal =
    safeMeals.find((m) => m.dayOfWeek === currentDayOfWeek && (m.profile === "Família" || !m.profile)) ||
    safeMeals[0];
  const zoeMeal = safeMeals.find(
    (m) => m.dayOfWeek === currentDayOfWeek && m.profile === "Zoe"
  );

  const buildSpeechScript = (): string => {
    let script = `${greeting}. Aqui está o briefing matinal do ALLDAY Home para hoje, ${currentDayOfWeek}. `;

    if (todayEvents.length > 0) {
      script += `Na sua agenda para hoje temos ${todayEvents.length} compromisso${
        todayEvents.length > 1 ? "s" : ""
      }: `;
      todayEvents.forEach((evt) => {
        script += `${evt.title}${evt.time ? ` às ${evt.time}` : ""}, com ${evt.member}. `;
      });
    } else {
      script += "Na agenda de hoje, nenhum compromisso externo agendado. ";
    }

    const pendingHighTasks = todayTasks.filter((t) => !t.completed);
    if (pendingHighTasks.length > 0) {
      script += `Nas tarefas prioritárias do dia: ${pendingHighTasks
        .slice(0, 3)
        .map((t) => t.title)
        .join(", ")}. `;
    }

    if (todayReminders.length > 0) {
      script += `Lembretes da casa e remédios: `;
      todayReminders.forEach((r) => {
        script += `${r.title} às ${r.time}. `;
      });
    }

    if (familyMeal) {
      script += `Para o almoço da família teremos: ${familyMeal.lunch}. `;
    }
    if (zoeMeal) {
      script += `E no cardápio da Zoe: ${zoeMeal.lunch}. `;
    }

    if (pendingBills.length > 0) {
      script += `Atenção aos boletos: você tem ${pendingBills.length} conta${
        pendingBills.length > 1 ? "s" : ""
      } pendente${pendingBills.length > 1 ? "s" : ""}, incluindo ${pendingBills[0].title}. `;
    }

    script += `Que vocês tenham um dia maravilhoso e muito produtivo!`;
    return script;
  };

  const handleGenerateAiBriefing = async () => {
    setIsGeneratingAi(true);
    soundEffects.playWakeTone();
    try {
      const res = await fetch("/api/ai/daily-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: todayEvents,
          tasks: todayTasks,
          reminders: todayReminders,
          bills: pendingBills,
          meals: safeMeals,
          weather,
          quoteOfDay,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiBriefingData(data);
        if (data.speechText) {
          setIsSpeaking(true);
          soundEffects.playAcknowledgeTone();
          setTimeout(() => {
            soundEffects.speak(data.speechText);
          }, 400);
        }
      }
    } catch (e) {
      console.error("Falha ao gerar briefing com IA:", e);
      handleToggleSpeak();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      soundEffects.stopAll();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      soundEffects.playGentleChime();
      const text = aiBriefingData?.speechText || buildSpeechScript();
      soundEffects.speak(text);

      // Listen for speech end
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const checkEnd = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsSpeaking(false);
            clearInterval(checkEnd);
          }
        }, 500);
      }
    }
  };

  const handleCloseModal = () => {
    soundEffects.stopAll();
    setIsSpeaking(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 shadow-2xl shadow-amber-500/10 w-full max-w-4xl rounded-3xl p-5 sm:p-8 text-white relative my-auto">
        {/* Ambient Top Lights */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Sun className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  ☀️ RESUMO DO DIA • ALLDAY HOME
                </span>
                <span className="text-xs text-slate-400 capitalize">{fullDateStr}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {aiBriefingData?.greeting || greeting}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Generate with Gemini AI Button */}
            <button
              onClick={handleGenerateAiBriefing}
              disabled={isGeneratingAi}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 fill-slate-950 ${isGeneratingAi ? "animate-spin" : ""}`} />
              <span>{isGeneratingAi ? "Gerando com Gemini..." : "Gerar com IA Gemini"}</span>
            </button>

            <button
              onClick={handleToggleSpeak}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isSpeaking
                  ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Pausar Voz</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Ouvir Voz</span>
                </>
              )}
            </button>

            <button
              onClick={handleCloseModal}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Highlight Banner if available */}
        {aiBriefingData?.highlight && (
          <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <Bot className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Destaque do Jarvis IA</p>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">{aiBriefingData.highlight}</p>
            </div>
          </div>
        )}

        {/* Motivational Quote Banner */}
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Heart className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400" />
          <p className="text-xs sm:text-sm italic text-amber-200">
            "{aiBriefingData?.motivationalTip || quoteOfDay}"
          </p>
        </div>

        {/* 4-Panel Grid of Today */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6">
          {/* PANEL 1: Compromissos do Dia */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4" />
                  Compromissos ({todayEvents.length})
                </span>
                <button
                  onClick={() => {
                    handleCloseModal();
                    onNavigateTab("calendar");
                  }}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Agenda</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {todayEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Nenhum compromisso marcado para hoje.
                  </p>
                ) : (
                  todayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded">
                          {evt.time || "Dia todo"}
                        </span>
                        <div>
                          <p className="font-semibold text-white">{evt.title}</p>
                          {evt.location && (
                            <p className="text-[10px] text-slate-400">{evt.location}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium">
                        {evt.member}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* PANEL 2: Tarefas da Casa */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  Tarefas Prioritárias
                </span>
                <button
                  onClick={() => {
                    handleCloseModal();
                    onNavigateTab("tasks");
                  }}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Ver todas</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {todayTasks.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Tudo limpo! Nenhuma tarefa pendente.
                  </p>
                ) : (
                  todayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                        <span className="text-slate-200 font-medium line-clamp-1">
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                        {task.assignee}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* PANEL 3: Remédios & Alarmes da Zoe */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Pill className="w-4 h-4" />
                  Medicamentos & Alarmes
                </span>
                <button
                  onClick={() => {
                    handleCloseModal();
                    onNavigateTab("zoe");
                  }}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Diário Zoe</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {todayReminders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Nenhum alarme de remédio programado para hoje.
                  </p>
                ) : (
                  todayReminders.map((r) => (
                    <div
                      key={r.id}
                      className="p-2.5 bg-slate-900 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="font-mono font-bold text-rose-300">{r.time}</span>
                        <span className="text-white font-medium">{r.title}</span>
                      </div>
                      <span className="text-[10px] bg-rose-500/15 text-rose-300 font-bold px-2 py-0.5 rounded">
                        {r.member}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* PANEL 4: Cardápio do Dia (Família e Zoe) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4" />
                  Cardápio do Dia ({currentDayOfWeek})
                </span>
                <button
                  onClick={() => {
                    handleCloseModal();
                    onNavigateTab("meals");
                  }}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Cardápio</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {familyMeal && (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      👨‍👩‍👧 Família
                    </span>
                    <p className="text-slate-200 mt-0.5 font-medium line-clamp-1">
                      <strong>Almoço:</strong> {familyMeal.lunch}
                    </p>
                  </div>
                )}

                {zoeMeal && (
                  <div className="p-2.5 bg-slate-900 border border-amber-500/20 rounded-xl">
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">
                      👶 Zoe
                    </span>
                    <p className="text-slate-200 mt-0.5 font-medium line-clamp-1">
                      <strong>Almoço:</strong> {zoeMeal.lunch}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Dica: você pode abrir este briefing a qualquer momento pelo botão no topo do painel ou no celular.
          </div>

          <button
            onClick={handleCloseModal}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 cursor-pointer transition-all"
          >
            Iniciar o Dia • Fechar Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
