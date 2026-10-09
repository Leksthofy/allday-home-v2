import {
  CalendarEvent,
  ShoppingItem,
  TaskItem,
  DailyRoutine,
  MealPlanItem,
  FamilyPhoto,
  BillItem,
  ChildLogRecord,
  HomeReminder,
} from "../types";
import {
  initialEvents,
  initialShopping,
  initialTasks,
  initialRoutines,
  initialMeals,
  initialPhotos,
  initialBills,
  initialChildLogs,
  initialReminders,
} from "../data/initialData";

const STORAGE_KEYS = {
  EVENTS: "allday_events_v1",
  SHOPPING: "allday_shopping_v1",
  TASKS: "allday_tasks_v1",
  ROUTINES: "allday_routines_v1",
  MEALS: "allday_meals_v1",
  PHOTOS: "allday_photos_v1",
  BILLS: "allday_bills_v1",
  ZOE_LOGS: "allday_zoe_logs_v1",
  REMINDERS: "allday_reminders_v1",
  SETTINGS: "allday_settings_v1",
};

export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) return defaultValue;
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) return defaultValue;
    return parsed;
  } catch (e) {
    console.error(`Erro ao ler do storage [${key}]:`, e);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("allday_storage_change"));
  } catch (e) {
    console.error(`Erro ao salvar no storage [${key}]:`, e);
  }
}

export const Storage = {
  getEvents: (): CalendarEvent[] => getStoredData(STORAGE_KEYS.EVENTS, initialEvents),
  setEvents: (data: CalendarEvent[]) => setStoredData(STORAGE_KEYS.EVENTS, data),

  getShopping: (): ShoppingItem[] => getStoredData(STORAGE_KEYS.SHOPPING, initialShopping),
  setShopping: (data: ShoppingItem[]) => setStoredData(STORAGE_KEYS.SHOPPING, data),

  getTasks: (): TaskItem[] => getStoredData(STORAGE_KEYS.TASKS, initialTasks),
  setTasks: (data: TaskItem[]) => setStoredData(STORAGE_KEYS.TASKS, data),

  getRoutines: (): DailyRoutine[] => getStoredData(STORAGE_KEYS.ROUTINES, initialRoutines),
  setRoutines: (data: DailyRoutine[]) => setStoredData(STORAGE_KEYS.ROUTINES, data),

  getMeals: (): MealPlanItem[] => getStoredData(STORAGE_KEYS.MEALS, initialMeals),
  setMeals: (data: MealPlanItem[]) => setStoredData(STORAGE_KEYS.MEALS, data),

  getPhotos: (): FamilyPhoto[] => getStoredData(STORAGE_KEYS.PHOTOS, initialPhotos),
  setPhotos: (data: FamilyPhoto[]) => setStoredData(STORAGE_KEYS.PHOTOS, data),

  getBills: (): BillItem[] => getStoredData(STORAGE_KEYS.BILLS, initialBills),
  setBills: (data: BillItem[]) => setStoredData(STORAGE_KEYS.BILLS, data),

  getChildLogs: (): ChildLogRecord[] => getStoredData(STORAGE_KEYS.ZOE_LOGS, initialChildLogs),
  setChildLogs: (data: ChildLogRecord[]) => setStoredData(STORAGE_KEYS.ZOE_LOGS, data),

  getReminders: (): HomeReminder[] => getStoredData(STORAGE_KEYS.REMINDERS, initialReminders),
  setReminders: (data: HomeReminder[]) => setStoredData(STORAGE_KEYS.REMINDERS, data),

  resetAllToDefault: () => {
    setStoredData(STORAGE_KEYS.EVENTS, initialEvents);
    setStoredData(STORAGE_KEYS.SHOPPING, initialShopping);
    setStoredData(STORAGE_KEYS.TASKS, initialTasks);
    setStoredData(STORAGE_KEYS.ROUTINES, initialRoutines);
    setStoredData(STORAGE_KEYS.MEALS, initialMeals);
    setStoredData(STORAGE_KEYS.PHOTOS, initialPhotos);
    setStoredData(STORAGE_KEYS.BILLS, initialBills);
    setStoredData(STORAGE_KEYS.ZOE_LOGS, initialChildLogs);
    setStoredData(STORAGE_KEYS.REMINDERS, initialReminders);
  },

  exportAllData: () => ({
    events: Storage.getEvents(),
    shopping: Storage.getShopping(),
    tasks: Storage.getTasks(),
    routines: Storage.getRoutines(),
    meals: Storage.getMeals(),
    photos: Storage.getPhotos(),
    bills: Storage.getBills(),
    childLogs: Storage.getChildLogs(),
    reminders: Storage.getReminders(),
    exportDate: new Date().toISOString(),
    version: "1.0",
  }),

  importAllData: (data: any) => {
    if (!data || typeof data !== "object") return false;
    if (Array.isArray(data.events)) Storage.setEvents(data.events);
    if (Array.isArray(data.shopping)) Storage.setShopping(data.shopping);
    if (Array.isArray(data.tasks)) Storage.setTasks(data.tasks);
    if (Array.isArray(data.routines)) Storage.setRoutines(data.routines);
    if (Array.isArray(data.meals)) Storage.setMeals(data.meals);
    if (Array.isArray(data.photos)) Storage.setPhotos(data.photos);
    if (Array.isArray(data.bills)) Storage.setBills(data.bills);
    if (Array.isArray(data.childLogs)) Storage.setChildLogs(data.childLogs);
    if (Array.isArray(data.reminders)) Storage.setReminders(data.reminders);
    return true;
  }
};
