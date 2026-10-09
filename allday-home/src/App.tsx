import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { SidebarNav } from "./components/SidebarNav";
import { DashboardView } from "./components/DashboardView";
import { CalendarView } from "./components/CalendarView";
import { ShoppingView } from "./components/ShoppingView";
import { TasksView } from "./components/TasksView";
import { RoutinesView } from "./components/RoutinesView";
import { MealsView } from "./components/MealsView";
import { PhotosView } from "./components/PhotosView";
import { FinancesView } from "./components/FinancesView";
import { KidsTrackerView } from "./components/KidsTrackerView";
import { SettingsView } from "./components/SettingsView";
import { QuickAiModal } from "./components/QuickAiModal";
import { KioskScreenSaver } from "./components/KioskScreenSaver";
import { MobileRemoteModal } from "./components/MobileRemoteModal";
import { MobileRemoteView } from "./components/MobileRemoteView";
import { RemoteToastNotificationContainer } from "./components/RemoteToastNotification";
import { ActiveReminderModal } from "./components/ActiveReminderModal";
import { JarvisBriefingModal } from "./components/JarvisBriefingModal";
import { EventAlertModal } from "./components/EventAlertModal";
import { KitchenVoiceAssistant } from "./components/KitchenVoiceAssistant";

import { Storage } from "./lib/storage";
import { remoteClient, ConnectionStatus } from "./lib/remoteClient";
import { soundEffects } from "./lib/soundEffects";
import { initialMembers, dailyQuotes } from "./data/initialData";
import {
  ActiveTab,
  CalendarEvent,
  ShoppingItem,
  TaskItem,
  DailyRoutine,
  MealPlanItem,
  FamilyPhoto,
  BillItem,
  ChildLogRecord,
  WeatherData,
  RemoteToastNotification,
  HomeReminder,
} from "./types";

export default function App() {
  // Check if opened with ?mode=remote or in remote companion mode
  const [isRemoteMode, setIsRemoteMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("mode") === "remote" || window.location.hash === "#remote";
    }
    return false;
  });

  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);
  const [connectedDevicesCount, setConnectedDevicesCount] = useState<number>(1);
  const [remoteToasts, setRemoteToasts] = useState<RemoteToastNotification[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isScreenSaverActive, setIsScreenSaverActive] = useState(false);
  const [isJarvisBriefingOpen, setIsJarvisBriefingOpen] = useState(false);
  const [upcomingEventAlert, setUpcomingEventAlert] = useState<CalendarEvent | null>(null);
  const [idleTimeoutMinutes, setIdleTimeoutMinutes] = useState(2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Core Data States loaded from Storage
  const [events, setEvents] = useState<CalendarEvent[]>(() => Storage.getEvents());
  const [shopping, setShopping] = useState<ShoppingItem[]>(() => Storage.getShopping());
  const [tasks, setTasks] = useState<TaskItem[]>(() => Storage.getTasks());
  const [routines, setRoutines] = useState<DailyRoutine[]>(() => Storage.getRoutines());
  const [meals, setMeals] = useState<MealPlanItem[]>(() => Storage.getMeals());
  const [photos, setPhotos] = useState<FamilyPhoto[]>(() => Storage.getPhotos());
  const [bills, setBills] = useState<BillItem[]>(() => Storage.getBills());
  const [childLogs, setChildLogs] = useState<ChildLogRecord[]>(() => Storage.getChildLogs());
  const [reminders, setReminders] = useState<HomeReminder[]>(() => Storage.getReminders());
  const [activeReminder, setActiveReminder] = useState<HomeReminder | null>(null);
  const triggeredRemindersRef = useRef<Set<string>>(new Set());

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [quoteOfDay, setQuoteOfDay] = useState("");

  const addRemoteToast = useCallback((title: string, message: string, sender: string = "Celular", type: "info" | "success" | "alert" | "voice" = "info") => {
    const newToast: RemoteToastNotification = {
      id: `toast_${Date.now()}_${Math.random()}`,
      title,
      message,
      sender,
      type,
      timestamp: Date.now(),
    };
    setRemoteToasts((prev) => [newToast, ...prev.slice(0, 3)]);

    // Auto dismiss after 4.5s
    setTimeout(() => {
      setRemoteToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  }, []);

  const handleDismissToast = (id: string) => {
    setRemoteToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state changes back to Storage
  const syncToStorage = useCallback(() => {
    setEvents(Storage.getEvents());
    setShopping(Storage.getShopping());
    setTasks(Storage.getTasks());
    setRoutines(Storage.getRoutines());
    setMeals(Storage.getMeals());
    setPhotos(Storage.getPhotos());
    setBills(Storage.getBills());
    setChildLogs(Storage.getChildLogs());
    setReminders(Storage.getReminders());
  }, []);

  useEffect(() => {
    window.addEventListener("allday_storage_change", syncToStorage);
    return () => window.removeEventListener("allday_storage_change", syncToStorage);
  }, [syncToStorage]);

  // Fetch weather and daily quote
  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data) => setWeather(data))
      .catch((err) => console.error("Erro ao buscar clima:", err));

    const quote = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)];
    setQuoteOfDay(quote);
  }, []);

  // Idle Screen Saver Timer logic
  useEffect(() => {
    if (idleTimeoutMinutes === 0) return;

    let timeoutId: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(timeoutId);
      if (!isScreenSaverActive) {
        timeoutId = setTimeout(() => {
          setIsScreenSaverActive(true);
        }, idleTimeoutMinutes * 60 * 1000);
      }
    };

    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("touchstart", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);

    resetIdleTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
    };
  }, [idleTimeoutMinutes, isScreenSaverActive]);

  const handleToggleFullscreen = () => {
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;

      const isFS = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (!isFS) {
        const req =
          docEl.requestFullscreen ||
          docEl.webkitRequestFullscreen ||
          docEl.mozRequestFullScreen ||
          docEl.msRequestFullscreen;

        if (typeof req === "function") {
          req.call(docEl).catch(() => {});
        }
        setIsFullscreen(true);
      } else {
        const exit =
          doc.exitFullscreen ||
          doc.webkitExitFullscreen ||
          doc.mozCancelFullScreen ||
          doc.msExitFullscreen;

        if (typeof exit === "function") {
          exit.call(doc).catch(() => {});
        }
        setIsFullscreen(false);
      }
    } catch (e) {
      // Fallback toggle state when Fullscreen API is unavailable in iframe
      setIsFullscreen((prev) => !prev);
    }
  };

  // Handlers for Shopping
  const handleToggleShoppingItem = (id: string) => {
    const updated = shopping.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setShopping(updated);
    Storage.setShopping(updated);
  };

  const handleAddShoppingItem = (item: Omit<ShoppingItem, "id">) => {
    const newItem: ShoppingItem = { ...item, id: `s_${Date.now()}` };
    const updated = [newItem, ...shopping];
    setShopping(updated);
    Storage.setShopping(updated);
  };

  const handleDeleteShoppingItem = (id: string) => {
    const updated = shopping.filter((s) => s.id !== id);
    setShopping(updated);
    Storage.setShopping(updated);
  };

  const handleClearCompletedShopping = () => {
    const updated = shopping.filter((s) => !s.completed);
    setShopping(updated);
    Storage.setShopping(updated);
  };

  // Handlers for Tasks
  const handleToggleTaskItem = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    Storage.setTasks(updated);
  };

  const handleAddTaskItem = (task: Omit<TaskItem, "id">) => {
    const newTask: TaskItem = { ...task, id: `t_${Date.now()}` };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    Storage.setTasks(updated);
  };

  const handleDeleteTaskItem = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    Storage.setTasks(updated);
  };

  // Handlers for Events
  const handleAddCalendarEvent = (evt: Omit<CalendarEvent, "id">) => {
    const newEvt: CalendarEvent = { ...evt, id: `e_${Date.now()}` };
    const updated = [newEvt, ...events];
    setEvents(updated);
    Storage.setEvents(updated);
  };

  const handleDeleteCalendarEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    Storage.setEvents(updated);
  };

  // Handlers for Routines
  const handleToggleRoutineItem = (id: string) => {
    const updated = routines.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setRoutines(updated);
    Storage.setRoutines(updated);
  };

  const handleAddRoutineItem = (rtn: Omit<DailyRoutine, "id">) => {
    const newRtn: DailyRoutine = { ...rtn, id: `r_${Date.now()}` };
    const updated = [...routines, newRtn];
    setRoutines(updated);
    Storage.setRoutines(updated);
  };

  const handleDeleteRoutineItem = (id: string) => {
    const updated = routines.filter((r) => r.id !== id);
    setRoutines(updated);
    Storage.setRoutines(updated);
  };

  // Handlers for Meals
  const handleUpdateMeal = (updatedMeal: MealPlanItem) => {
    const updated = meals.map((m) =>
      m.id === updatedMeal.id ? updatedMeal : m
    );
    setMeals(updated);
    Storage.setMeals(updated);
  };

  const handleAddMealIngredientsToShopping = (ingredients: string[]) => {
    const newItems: ShoppingItem[] = ingredients.map((ing, idx) => ({
      id: `s_meal_${Date.now()}_${idx}`,
      name: ing,
      category: "Supermercado",
      completed: false,
      addedBy: "Família",
    }));

    const updated = [...newItems, ...shopping];
    setShopping(updated);
    Storage.setShopping(updated);
  };

  // Handlers for Photos
  const handleAddPhoto = (photo: Omit<FamilyPhoto, "id">) => {
    const newPhoto: FamilyPhoto = { ...photo, id: `p_${Date.now()}` };
    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    Storage.setPhotos(updated);
  };

  const handleDeletePhoto = (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    Storage.setPhotos(updated);
  };

  const handleSyncDrivePhotos = useCallback((drivePhotos: FamilyPhoto[]) => {
    setPhotos((prev) => {
      const nonDrive = prev.filter((p) => p.source !== "google_drive");
      const updated = [...drivePhotos, ...nonDrive];
      Storage.setPhotos(updated);
      return updated;
    });
  }, []);

  // Handlers for Bills
  const handleToggleBillPaid = useCallback((id: string) => {
    setBills((prev) => {
      const updated = prev.map((b) =>
        b.id === id ? { ...b, paid: !b.paid } : b
      );
      Storage.setBills(updated);
      return updated;
    });
  }, []);

  const handleAddBill = (bill: Omit<BillItem, "id">) => {
    const newBill: BillItem = { ...bill, id: `b_${Date.now()}` };
    const updated = [newBill, ...bills];
    setBills(updated);
    Storage.setBills(updated);
  };

  const handleDeleteBill = (id: string) => {
    const updated = bills.filter((b) => b.id !== id);
    setBills(updated);
    Storage.setBills(updated);
  };

  // Handlers for Child Log
  const handleAddChildLog = (log: Omit<ChildLogRecord, "id">) => {
    const newLog: ChildLogRecord = { ...log, id: `cl_${Date.now()}` };
    const updated = [newLog, ...childLogs];
    setChildLogs(updated);
    Storage.setChildLogs(updated);
  };

  const handleDeleteChildLog = (id: string) => {
    const updated = childLogs.filter((l) => l.id !== id);
    setChildLogs(updated);
    Storage.setChildLogs(updated);
  };

  // Handlers for Reminders
  const handleAddReminder = useCallback(
    (reminder: Omit<HomeReminder, "id">) => {
      const newReminder: HomeReminder = {
        ...reminder,
        id: `rem_${Date.now()}`,
      };
      const updated = [newReminder, ...reminders];
      setReminders(updated);
      Storage.setReminders(updated);
    },
    [reminders]
  );

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setReminders(updated);
    Storage.setReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    Storage.setReminders(updated);
  };

  const handleDismissActiveReminder = () => {
    soundEffects.stopAll();
    setActiveReminder(null);
  };

  const handleCompleteActiveReminder = (id: string) => {
    soundEffects.stopAll();
    handleToggleReminder(id);
    setActiveReminder(null);
    addRemoteToast(
      "Lembrete Concluído",
      "Remédio / compromisso confirmado com sucesso!",
      "Sistema",
      "success"
    );
  };

  const handleSnoozeReminder = (id: string, minutes: number) => {
    soundEffects.stopAll();
    setActiveReminder(null);
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozedTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const updated = reminders.map((r) =>
      r.id === id ? { ...r, time: snoozedTime, completed: false } : r
    );
    setReminders(updated);
    Storage.setReminders(updated);
    addRemoteToast(
      "Adiado por 10 min",
      `Novo alarme programado para às ${snoozedTime}`,
      "Sistema",
      "info"
    );
  };

  const handleTestSound = () => {
    soundEffects.playMedicationAlertChime();
    setTimeout(() => {
      soundEffects.speakReminder(
        "Atenção: Teste do alarme sonoro suave do ALLDAY Home. Remédio da Zoe às 15 horas.",
        "Zoe"
      );
    }, 1200);
    addRemoteToast(
      "Teste de Som",
      "Alarme suave e voz tocados com sucesso!",
      "Sistema",
      "info"
    );
  };

  // Reminder / Medicine Alarm Monitoring Loop (Checks every 5 seconds)
  useEffect(() => {
    if (isRemoteMode) return;

    const checkReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayKey = now.toISOString().split("T")[0];

      reminders.forEach((reminder) => {
        if (reminder.completed) return;
        if (!reminder.soundEnabled) return;

        const triggerKey = `${reminder.id}_${todayKey}_${reminder.time}`;
        if (
          reminder.time === currentTimeStr &&
          !triggeredRemindersRef.current.has(triggerKey)
        ) {
          triggeredRemindersRef.current.add(triggerKey);
          setActiveReminder(reminder);

          // Play gentle chime
          soundEffects.playMedicationAlertChime();

          // Speak reminder aloud if voice alert is enabled
          if (reminder.voiceAlert) {
            setTimeout(() => {
              soundEffects.speakReminder(reminder.title, reminder.member);
            }, 1200);
          }

          addRemoteToast(
            "⏰ ALARME DA CASA",
            `${reminder.title} - Agora (${reminder.time})`,
            "Sistema",
            "alert"
          );
        }
      });

      // Check upcoming events happening in approximately 1 hour
      events.forEach((ev) => {
        if (ev.date !== todayKey || !ev.startTime) return;
        const [evH, evM] = ev.startTime.split(":").map(Number);
        if (isNaN(evH) || isNaN(evM)) return;
        const eventTimeInMin = evH * 60 + evM;
        const nowTimeInMin = now.getHours() * 60 + now.getMinutes();
        const diff = eventTimeInMin - nowTimeInMin;
        const eventTriggerKey = `event_${ev.id}_${todayKey}`;

        if (diff === 60 && !triggeredRemindersRef.current.has(eventTriggerKey)) {
          triggeredRemindersRef.current.add(eventTriggerKey);
          setUpcomingEventAlert(ev);
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 5000);
    return () => clearInterval(interval);
  }, [reminders, events, isRemoteMode, addRemoteToast]);

  // Auto-open daily briefing silently on first load of the day (when computer starts)
  useEffect(() => {
    if (isRemoteMode) return;
    const todayKey = new Date().toISOString().split("T")[0];
    try {
      const lastBriefingDate = localStorage.getItem("allday_last_daily_briefing_date");
      if (lastBriefingDate !== todayKey) {
        const timer = setTimeout(() => {
          setIsJarvisBriefingOpen(true);
          localStorage.setItem("allday_last_daily_briefing_date", todayKey);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn("Erro ao checar briefing diário:", e);
    }
  }, [isRemoteMode]);

  // Reset Factory Data
  const handleResetFactory = () => {
    Storage.resetAllToDefault();
    syncToStorage();
  };

  // AI Quick Action Application
  const handleApplyAiAction = useCallback((intent: string, data: any) => {
    if (intent === "add_shopping" && data?.shoppingItem) {
      handleAddShoppingItem({
        name: data.shoppingItem,
        category: data.shoppingCategory || "Supermercado",
        completed: false,
        addedBy: "Família",
      });
      setActiveTab("shopping");
    } else if (intent === "add_calendar" && data?.eventTitle) {
      handleAddCalendarEvent({
        title: data.eventTitle,
        date: data.eventDate || new Date().toISOString().split("T")[0],
        time: data.eventTime || "10:00",
        member: data.eventMember || "Família",
        category: "Pessoal",
        googleSynced: true,
      });
      setActiveTab("calendar");
    } else if (intent === "add_task" && data?.taskTitle) {
      handleAddTaskItem({
        title: data.taskTitle,
        assignee: "Thiago",
        dueDate: new Date().toISOString().split("T")[0],
        completed: false,
        priority: data.taskPriority || "medium",
        category: data.taskCategory || "Geral",
      });
      setActiveTab("tasks");
    }
  }, [handleAddShoppingItem, handleAddCalendarEvent, handleAddTaskItem]);

  // Real-Time SSE Setup & Remote Command Dispatcher
  useEffect(() => {
    remoteClient.init(isRemoteMode ? "mobile" : "kiosk", isRemoteMode ? "Celular" : "Painel Cozinha");

    const unsubStatus = remoteClient.onStatusChange((_status, count) => {
      setConnectedDevicesCount(count);
    });

    const unsubCmd = remoteClient.onCommand((cmd) => {
      switch (cmd.type) {
        case "NAVIGATE_TAB":
          if (cmd.payload?.tab) {
            setActiveTab(cmd.payload.tab);
            setIsScreenSaverActive(false);
            addRemoteToast(
              "Navegação Remota",
              `Mudou para a aba: ${cmd.payload.tab.toUpperCase()}`,
              cmd.sender || "Celular",
              "info"
            );
          }
          break;
        case "TOGGLE_SCREENSAVER":
          setIsScreenSaverActive((prev) => !prev);
          addRemoteToast(
            "Porta-Retrato",
            "Alternou o descanso de tela da cozinha",
            cmd.sender || "Celular",
            "info"
          );
          break;
        case "SET_SCREENSAVER":
          setIsScreenSaverActive(!!cmd.payload?.active);
          break;
        case "SCROLL_SCREEN": {
          const direction = cmd.payload?.direction || "down";
          const amount = Number(cmd.payload?.amount) || 380;
          if (direction === "top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            const el = document.getElementById("main-content-scroll");
            if (el) el.scrollTo({ top: 0, behavior: "smooth" });
          } else if (direction === "bottom") {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            const el = document.getElementById("main-content-scroll");
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
          } else {
            const delta = direction === "up" ? -amount : amount;
            window.scrollBy({ top: delta, behavior: "smooth" });
            const el = document.getElementById("main-content-scroll");
            if (el) el.scrollBy({ top: delta, behavior: "smooth" });
          }
          break;
        }
        case "ADD_SHOPPING":
          if (cmd.payload?.item) {
            handleAddShoppingItem(cmd.payload.item);
            addRemoteToast(
              "Lista de Compras",
              `Adicionou: ${cmd.payload.item.name}`,
              cmd.sender || "Celular",
              "success"
            );
          }
          break;
        case "ADD_EVENT":
          if (cmd.payload?.event) {
            handleAddCalendarEvent(cmd.payload.event);
            addRemoteToast(
              "Agenda da Família",
              `Novo evento: ${cmd.payload.event.title}`,
              cmd.sender || "Celular",
              "success"
            );
          }
          break;
        case "ADD_TASK":
          if (cmd.payload?.task) {
            handleAddTaskItem(cmd.payload.task);
            addRemoteToast(
              "Nova Tarefa",
              `Adicionou: ${cmd.payload.task.title}`,
              cmd.sender || "Celular",
              "success"
            );
          }
          break;
        case "ADD_ZOE_LOG":
          if (cmd.payload?.log) {
            handleAddChildLog(cmd.payload.log);
            addRemoteToast(
              "Diário da Zoe",
              `Registro adicionado: ${cmd.payload.log.title}`,
              cmd.sender || "Celular",
              "success"
            );
          }
          break;
        case "TRIGGER_AI_PARSE":
          if (cmd.payload?.intent && cmd.payload?.data) {
            handleApplyAiAction(cmd.payload.intent, cmd.payload.data);
            addRemoteToast(
              "Comando IA Executado",
              cmd.payload.summary || "Ação de IA aplicada na tela",
              cmd.sender || "Celular",
              "voice"
            );
          }
          break;
        case "ADD_REMINDER":
          if (cmd.payload?.reminder) {
            handleAddReminder(cmd.payload.reminder);
            addRemoteToast(
              "Alarme Agendado",
              `${cmd.payload.reminder.title} às ${cmd.payload.reminder.time}`,
              cmd.sender || "Celular",
              "alert"
            );
          }
          break;
        case "TOGGLE_REMINDER":
          if (cmd.payload?.id) {
            handleToggleReminder(cmd.payload.id);
          }
          break;
        case "DELETE_REMINDER":
          if (cmd.payload?.id) {
            handleDeleteReminder(cmd.payload.id);
          }
          break;
        case "DISMISS_REMINDER":
          handleDismissActiveReminder();
          break;
        case "TEST_SOUND":
          handleTestSound();
          break;
        case "OPEN_AI_VOICE":
          setIsAiModalOpen(true);
          break;
        case "TOGGLE_BILL":
          if (cmd.payload?.id) {
            handleToggleBillPaid(cmd.payload.id);
            addRemoteToast(
              "Conta / Boleto",
              "Status de pagamento atualizado",
              cmd.sender || "Celular",
              "success"
            );
          }
          break;
        case "TRIGGER_JARVIS_BRIEFING":
          setIsJarvisBriefingOpen(true);
          addRemoteToast(
            "Briefing Jarvis",
            "Iniciando resumo matinal em tela inteira",
            cmd.sender || "Celular",
            "voice"
          );
          break;
      }
    });

    const unsubAnn = remoteClient.onAnnouncement((ann) => {
      addRemoteToast(ann.title, ann.message, ann.sender, ann.type);
    });

    return () => {
      unsubStatus();
      unsubCmd();
      unsubAnn();
    };
  }, [
    isRemoteMode,
    addRemoteToast,
    handleAddShoppingItem,
    handleAddCalendarEvent,
    handleAddTaskItem,
    handleAddChildLog,
    handleApplyAiAction,
    handleAddReminder,
    handleToggleReminder,
    handleDeleteReminder,
    handleDismissActiveReminder,
    handleTestSound,
    handleToggleBillPaid,
  ]);

  const pendingShoppingCount = (shopping || []).filter((s) => !s.completed).length;
  const pendingTasksCount = (tasks || []).filter((t) => !t.completed).length;

  // Render Mobile Remote Mode (Phone Companion Interface)
  if (isRemoteMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <MobileRemoteView
          onExitRemoteMode={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete("mode");
            window.history.pushState({}, "", url.pathname);
            setIsRemoteMode(false);
          }}
          activeScreenTab={activeTab}
          onScreenTabChange={(tab) => setActiveTab(tab)}
          isScreenSaverActive={isScreenSaverActive}
          onToggleScreenSaver={() => setIsScreenSaverActive((prev) => !prev)}
          shopping={shopping}
          onAddShoppingItem={handleAddShoppingItem}
          onToggleShoppingItem={handleToggleShoppingItem}
          events={events}
          onAddCalendarEvent={handleAddCalendarEvent}
          tasks={tasks}
          onAddTaskItem={handleAddTaskItem}
          onToggleTaskItem={handleToggleTaskItem}
          childLogs={childLogs}
          onAddChildLog={handleAddChildLog}
          onAddReminder={handleAddReminder}
          onTriggerAiAction={handleApplyAiAction}
        />
      </div>
    );
  }

  // Render Standard Kitchen Display (Kiosk / Monitor View)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notifications from Mobile Phone Actions */}
      <RemoteToastNotificationContainer
        notifications={remoteToasts}
        onDismiss={handleDismissToast}
      />

      {/* Header */}
      <Header
        weather={weather}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onActivateScreenSaver={() => setIsScreenSaverActive(true)}
        isKioskMode={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenRemoteModal={() => setIsRemoteModalOpen(true)}
        connectedDevicesCount={connectedDevicesCount}
      />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row pb-20 lg:pb-8">
        {/* Navigation Sidebar */}
        <SidebarNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingShoppingCount={pendingShoppingCount}
          pendingTasksCount={pendingTasksCount}
        />

        {/* View Content Area */}
        <main id="main-content-scroll" className="flex-1 p-4 sm:p-6 lg:p-8 scroll-smooth">
          {activeTab === "dashboard" && (
            <DashboardView
              events={events}
              shopping={shopping}
              tasks={tasks}
              routines={routines}
              meals={meals}
              photos={photos}
              bills={bills}
              members={initialMembers}
              reminders={reminders}
              onToggleReminder={handleToggleReminder}
              onTestSound={handleTestSound}
              onToggleShoppingItem={handleToggleShoppingItem}
              onToggleTaskItem={handleToggleTaskItem}
              onToggleRoutineItem={handleToggleRoutineItem}
              onToggleBillPaid={handleToggleBillPaid}
              onOpenJarvisBriefing={() => setIsJarvisBriefingOpen(true)}
              onNavigateTab={setActiveTab}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              quoteOfDay={quoteOfDay}
            />
          )}

          {activeTab === "calendar" && (
            <CalendarView
              events={events}
              members={initialMembers}
              onAddEvent={handleAddCalendarEvent}
              onDeleteEvent={handleDeleteCalendarEvent}
            />
          )}

          {activeTab === "shopping" && (
            <ShoppingView
              shopping={shopping}
              onToggleItem={handleToggleShoppingItem}
              onAddItem={handleAddShoppingItem}
              onDeleteItem={handleDeleteShoppingItem}
              onClearCompleted={handleClearCompletedShopping}
            />
          )}

          {activeTab === "tasks" && (
            <TasksView
              tasks={tasks}
              members={initialMembers}
              onToggleTask={handleToggleTaskItem}
              onAddTask={handleAddTaskItem}
              onDeleteTask={handleDeleteTaskItem}
            />
          )}

          {activeTab === "routines" && (
            <RoutinesView
              routines={routines}
              members={initialMembers}
              onToggleRoutine={handleToggleRoutineItem}
              onAddRoutine={handleAddRoutineItem}
              onDeleteRoutine={handleDeleteRoutineItem}
            />
          )}

          {activeTab === "meals" && (
            <MealsView
              meals={meals}
              onUpdateMeal={handleUpdateMeal}
              onAddShoppingItems={handleAddMealIngredientsToShopping}
            />
          )}

          {activeTab === "photos" && (
            <PhotosView
              photos={photos}
              onAddPhoto={handleAddPhoto}
              onDeletePhoto={handleDeletePhoto}
              onStartSlideshow={() => setIsScreenSaverActive(true)}
              onSyncDrivePhotos={handleSyncDrivePhotos}
            />
          )}

          {activeTab === "finances" && (
            <FinancesView
              bills={bills}
              onTogglePaid={handleToggleBillPaid}
              onAddBill={handleAddBill}
              onDeleteBill={handleDeleteBill}
            />
          )}

          {activeTab === "zoe" && (
            <KidsTrackerView
              logs={childLogs}
              onAddLog={handleAddChildLog}
              onDeleteLog={handleDeleteChildLog}
              reminders={reminders}
              onAddReminder={handleAddReminder}
              onDeleteReminder={handleDeleteReminder}
              onTestSound={handleTestSound}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              members={initialMembers}
              idleTimeoutMinutes={idleTimeoutMinutes}
              onChangeIdleTimeout={setIdleTimeoutMinutes}
              onResetFactoryData={handleResetFactory}
            />
          )}
        </main>
      </div>

      {/* Mobile Remote Pairing QR Code Modal */}
      <MobileRemoteModal
        isOpen={isRemoteModalOpen}
        onClose={() => setIsRemoteModalOpen(false)}
        onOpenRemoteDirectly={() => {
          setIsRemoteModalOpen(false);
          setIsRemoteMode(true);
        }}
      />

      {/* Gemini AI Quick Voice Modal */}
      <QuickAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyAction={handleApplyAiAction}
      />

      {/* Fullscreen Jarvis Morning Briefing Modal */}
      <JarvisBriefingModal
        isOpen={isJarvisBriefingOpen}
        onClose={() => setIsJarvisBriefingOpen(false)}
        events={events}
        tasks={tasks}
        reminders={reminders}
        bills={bills}
        weather={weather}
        meals={meals}
        quoteOfDay={quoteOfDay}
        onNavigateTab={setActiveTab}
      />

      {/* 1-Hour Approaching Calendar Event Alert Modal */}
      {upcomingEventAlert && (
        <EventAlertModal
          event={upcomingEventAlert}
          onClose={() => setUpcomingEventAlert(null)}
        />
      )}

      {/* Active Medicine Alarm / Notification Popup Modal with Gentle Sound */}
      {activeReminder && (
        <ActiveReminderModal
          reminder={activeReminder}
          onDismiss={handleDismissActiveReminder}
          onSnooze={handleSnoozeReminder}
          onComplete={handleCompleteActiveReminder}
        />
      )}

      {/* Ambient Kiosk Photo Frame / Screen Saver */}
      {isScreenSaverActive && (
        <KioskScreenSaver
          photos={photos}
          weather={weather}
          quoteOfDay={quoteOfDay}
          onExit={() => setIsScreenSaverActive(false)}
        />
      )}

      {/* Dedicated Hands-Free Kitchen Voice Assistant ("ALLDAY" / "Jarvis") */}
      {!isRemoteMode && (
        <KitchenVoiceAssistant
          isScreenSaverActive={isScreenSaverActive}
          onSetScreenSaver={setIsScreenSaverActive}
          activeTab={activeTab}
          onNavigateTab={setActiveTab}
          onAddShoppingItem={handleAddShoppingItem}
          onAddCalendarEvent={handleAddCalendarEvent}
          onAddTaskItem={handleAddTaskItem}
          events={events}
          tasks={tasks}
          shopping={shopping}
          meals={meals}
          childLogs={childLogs}
          reminders={reminders}
          addToast={addRemoteToast}
        />
      )}
    </div>
  );
}
