import React from "react";
import {
  Calendar as CalendarIcon,
  ShoppingBag,
  CheckSquare,
  Repeat,
  Utensils,
  Sun,
  AlertCircle,
  Plus,
  CheckCircle2,
  ArrowRight,
  Heart,
  ExternalLink,
  Bell,
  Clock,
  Pill,
  Volume2,
  Sparkles,
  DollarSign,
  Bot,
} from "lucide-react";
import {
  CalendarEvent,
  ShoppingItem,
  TaskItem,
  DailyRoutine,
  MealPlanItem,
  FamilyPhoto,
  BillItem,
  ActiveTab,
  MemberProfile,
  HomeReminder,
} from "../types";

interface DashboardViewProps {
  events: CalendarEvent[];
  shopping: ShoppingItem[];
  tasks: TaskItem[];
  routines: DailyRoutine[];
  meals: MealPlanItem[];
  photos: FamilyPhoto[];
  bills: BillItem[];
  members: MemberProfile[];
  reminders?: HomeReminder[];
  onToggleReminder?: (id: string) => void;
  onTestSound?: () => void;
  onToggleShoppingItem: (id: string) => void;
  onToggleTaskItem: (id: string) => void;
  onToggleRoutineItem: (id: string) => void;
  onToggleBillPaid?: (id: string) => void;
  onOpenJarvisBriefing?: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAiModal: () => void;
  quoteOfDay: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  events = [],
  shopping = [],
  tasks = [],
  routines = [],
  meals = [],
  photos = [],
  bills = [],
  members = [],
  reminders = [],
  onToggleReminder,
  onTestSound,
  onToggleShoppingItem,
  onToggleTaskItem,
  onToggleRoutineItem,
  onToggleBillPaid,
  onOpenJarvisBriefing,
  onNavigateTab,
  onOpenAiModal,
  quoteOfDay,
}) => {
  const safeEvents = events || [];
  const safeShopping = shopping || [];
  const safeTasks = tasks || [];
  const safeRoutines = routines || [];
  const safeMeals = meals || [];
  const safeBills = bills || [];
  const safeMembers = members || [];
  const safeReminders = reminders || [];

  const todayStr = new Date().toISOString().split("T")[0];

  // Helper for member avatar badge
  const getMemberColor = (memberName: string) => {
    const member = safeMembers.find((m) => m.name === memberName);
    return member?.avatarColor || "bg-amber-500 text-slate-950";
  };

  // Filter today's events
  const todayEvents = safeEvents.filter((e) => e.date === todayStr);

  // Filter urgent shopping items
  const activeShopping = safeShopping.filter((s) => !s.completed);

  // Filter today tasks
  const todayTasks = safeTasks.filter((t) => t.dueDate === todayStr || !t.completed);

  // Current Day of Week in PT-BR
  const daysMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const currentDayOfWeek = daysMap[new Date().getDay()];

  // Today's routines
  const todayRoutines = safeRoutines.filter((r) => r.dayOfWeek === currentDayOfWeek);

  // Today's Meal Plans (Família e Zoe)
  const familyMeal =
    safeMeals.find(
      (m) =>
        m.dayOfWeek === currentDayOfWeek &&
        (m.profile === "Família" || !m.profile)
    ) || safeMeals[0] || {
      dayOfWeek: currentDayOfWeek,
      lunch: "Grelhado de Frango e Salada",
      dinner: "Omelete e sopa leve",
    };

  const zoeMeal = safeMeals.find(
    (m) => m.dayOfWeek === currentDayOfWeek && m.profile === "Zoe"
  );

  // Urgent Unpaid Bills
  const pendingBills = safeBills.filter((b) => !b.paid);
  const totalPendingBillsAmount = pendingBills.reduce(
    (acc, b) => acc + (b.amount || 0),
    0
  );

  // Helper for days difference
  const getDaysDiff = (dateStr: string) => {
    try {
      const due = new Date(dateStr + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const formatDateBr = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Quote & Jarvis Briefing Trigger */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-amber-400" />
            <span>Lembrete do Dia • ALLDAY Home</span>
          </div>
          <p className="text-base md:text-lg font-medium text-slate-100 italic">
            "{quoteOfDay}"
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenJarvisBriefing && (
            <button
              onClick={onOpenJarvisBriefing}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
              title="Abrir o resumo e prioridades do dia em tela inteira"
            >
              <Sun className="w-4 h-4" />
              <span>☀️ Resumo do Dia (Tela Cheia)</span>
            </button>
          )}

          <button
            onClick={onOpenAiModal}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Comando de Voz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Smart Alarms & Notifications Strip (JARVIS Kitchen Hub) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">
                Alarmes & Lembretes da Casa
              </h3>
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                {reminders.length} programados
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Notificação visual e som suave no horário exato (ex: remédio da Zoe às 15h)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-start md:justify-end">
          {/* Active Reminder Badges */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
            {reminders.slice(0, 3).map((r) => (
              <div
                key={r.id}
                onClick={() => onNavigateTab(r.member === "Zoe" ? "zoe" : "tasks")}
                className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-slate-200 cursor-pointer transition-all shrink-0"
              >
                {r.category === "Remédio" ? (
                  <Pill className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span className="font-mono font-bold text-amber-300">{r.time}</span>
                <span className="max-w-[140px] truncate">{r.title}</span>
              </div>
            ))}
          </div>

          {onTestSound && (
            <button
              onClick={onTestSound}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Testar alarme sonoro suave agora"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Testar Som</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab("zoe")}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Lembrete</span>
          </button>
        </div>
      </div>

      {/* Primary Kiosk Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1: Próximos Compromissos */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Compromissos de Hoje</h3>
                  <p className="text-xs text-slate-400">{todayEvents.length} agendados</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("calendar")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver tudo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Event List */}
            <div className="space-y-2.5">
              {todayEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  Nenhum compromisso pendente para hoje.
                </div>
              ) : (
                todayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg">
                        {evt.time || "Dia todo"}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-100 line-clamp-1">
                          {evt.title}
                        </p>
                        {evt.location && (
                          <p className="text-[11px] text-slate-400">{evt.location}</p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getMemberColor(
                        evt.member
                      )}`}
                    >
                      {evt.member}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("calendar")}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Adicionar Compromisso</span>
          </button>
        </div>

        {/* CARD 2: Tarefas da Casa */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Tarefas do Dia</h3>
                  <p className="text-xs text-slate-400">
                    {todayTasks.filter((t) => t.completed).length}/{todayTasks.length} concluídas
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("tasks")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Gerenciar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {todayTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTaskItem(task.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    task.completed
                      ? "bg-slate-950/40 border-slate-800/40 text-slate-500 line-through"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTaskItem(task.id)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getMemberColor(
                      task.assignee
                    )}`}
                  >
                    {task.assignee}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("tasks")}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Nova Tarefa</span>
          </button>
        </div>

        {/* CARD 3: Lista de Compras (Itens Ativos) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Lista de Compras</h3>
                  <p className="text-xs text-slate-400">
                    {activeShopping.length} itens pendentes
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("shopping")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver lista</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Shopping Item Quick List */}
            <div className="space-y-2">
              {activeShopping.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  🎉 Nenhum item pendente na lista de compras!
                </div>
              ) : (
                activeShopping.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleShoppingItem(item.id)}
                    className="p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => onToggleShoppingItem(item.id)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {item.name}
                        </p>
                        {item.quantity && (
                          <p className="text-[10px] text-slate-400">{item.quantity}</p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] uppercase tracking-wider font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg">
                      {item.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("shopping")}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Adicionar à Lista</span>
          </button>
        </div>

        {/* CARD 4: Rotinas de Hoje */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">
                    Rotina de {currentDayOfWeek}
                  </h3>
                  <p className="text-xs text-slate-400">Habituais da família</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("routines")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Grade</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {todayRoutines.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-sm">
                  Sem rotinas cadastradas para hoje.
                </div>
              ) : (
                todayRoutines.map((routine) => (
                  <div
                    key={routine.id}
                    onClick={() => onToggleRoutineItem(routine.id)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      routine.completed
                        ? "bg-slate-950/40 border-slate-800/40 text-slate-500 line-through"
                        : "bg-slate-950/70 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={routine.completed}
                        onChange={() => onToggleRoutineItem(routine.id)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium">{routine.title}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getMemberColor(
                        routine.assignee
                      )}`}
                    >
                      {routine.assignee}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("routines")}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Ver Rotina Completa da Semana
          </button>
        </div>

        {/* CARD 5: Cardápio do Dia (Família e Zoe) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Refeições de Hoje</h3>
                  <p className="text-xs text-slate-400">{currentDayOfWeek}</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("meals")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Semana</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Cardápio Família */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    👨‍👩‍👧 Família
                  </span>
                  <span className="text-[10px] text-slate-400">Almoço & Jantar</span>
                </div>
                <p className="text-xs font-semibold text-slate-100 line-clamp-1">
                  ☀️ {familyMeal.lunch}
                </p>
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                  🌙 {familyMeal.dinner}
                </p>
              </div>

              {/* Cardápio Zoe */}
              {zoeMeal && (
                <div className="p-3 bg-slate-950/70 border border-amber-500/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">
                      👶 Zoe
                    </span>
                    <span className="text-[10px] text-slate-400">Cardápio Especial</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-100 line-clamp-1">
                    ☀️ {zoeMeal.lunch}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                    🌙 {zoeMeal.dinner}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("meals")}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Editar Cardápios da Semana
          </button>
        </div>

        {/* CARD 6: Contas, Boletos & Vencimentos Próximos (Substituindo o porta-retrato conforme solicitado) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Boletos & Vencimentos</h3>
                  <p className="text-xs text-slate-400">
                    {pendingBills.length} pendentes • Total: R$ {totalPendingBillsAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("finances")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver tudo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {pendingBills.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  🎉 Todas as contas estão pagas e em dia!
                </div>
              ) : (
                pendingBills.slice(0, 3).map((bill) => {
                  const daysDiff = getDaysDiff(bill.dueDate);
                  const isDueToday = daysDiff === 0;
                  const isOverdue = daysDiff < 0;
                  const isDueTomorrow = daysDiff === 1;

                  return (
                    <div
                      key={bill.id}
                      onClick={() => onToggleBillPaid && onToggleBillPaid(bill.id)}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isDueToday || isOverdue
                          ? "bg-rose-950/25 border-rose-500/40 hover:border-rose-500/60"
                          : isDueTomorrow
                          ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={bill.paid}
                          onChange={() => onToggleBillPaid && onToggleBillPaid(bill.id)}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-100 truncate">
                            {bill.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400">
                              Venc: {formatDateBr(bill.dueDate)}
                            </span>
                            {bill.autoDebit && (
                              <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1 py-0.2 rounded border border-blue-500/20">
                                Débito Auto
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono text-amber-400 block">
                          R$ {bill.amount.toFixed(2)}
                        </span>
                        {isOverdue && (
                          <span className="text-[9px] font-black text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded uppercase">
                            Vencido
                          </span>
                        )}
                        {isDueToday && (
                          <span className="text-[9px] font-black text-rose-300 bg-rose-500/30 px-1.5 py-0.5 rounded uppercase animate-pulse">
                            Vence Hoje
                          </span>
                        )}
                        {isDueTomorrow && (
                          <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                            Amanhã
                          </span>
                        )}
                        {!isOverdue && !isDueToday && !isDueTomorrow && (
                          <span className="text-[9px] text-slate-400">
                            Em {daysDiff}d
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("finances")}
            className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Cadastrar Nova Conta / Boleto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
