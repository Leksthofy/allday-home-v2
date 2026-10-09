export type FamilyMember = "Thiago" | "Erika" | "Zoe" | "Família";

export interface MemberProfile {
  id: string;
  name: FamilyMember;
  role: string;
  avatarColor: string;
  initials: string;
  avatarUrl?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string;
  member: FamilyMember;
  category: "Trabalho" | "Pessoal" | "Saúde" | "Escola" | "Lazer";
  location?: string;
  googleSynced?: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: "Supermercado" | "Farmácia" | "Feira" | "Casa" | "Outros";
  completed: boolean;
  addedBy: FamilyMember;
  quantity?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  assignee: FamilyMember;
  dueDate?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: "Limpeza" | "Manutenção" | "Trabalho" | "Pessoal" | "Geral";
}

export interface DailyRoutine {
  id: string;
  dayOfWeek: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo";
  title: string;
  assignee: FamilyMember;
  completed: boolean;
  completedAt?: string; // ISO date timestamp for 24h cycle
  timeOfDay?: "Manhã" | "Tarde" | "Noite";
}

export interface MealPlanItem {
  id: string;
  dayOfWeek: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo";
  lunch: string;
  dinner: string;
  breakfast?: string;
  snack?: string;
  breakfastItems?: string[];
  lunchItems?: string[];
  snackItems?: string[];
  dinnerItems?: string[];
  customMeals?: Array<{ id: string; name: string; items: string[] }>;
  ingredientsNeeded?: string[];
  profile?: string; // e.g. "Família", "Zoe", or custom name
}

export interface FamilyPhoto {
  id: string;
  title: string;
  url: string;
  caption?: string;
  dateAdded: string;
  source?: "google_drive" | "upload" | "sample";
  driveFileId?: string;
}

export interface BillItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paid: boolean;
  category: "Moradia" | "Serviços" | "Educação" | "Saúde" | "Outros";
  autoDebit?: boolean;
}

export interface ChildLogRecord {
  id: string;
  type: "Vacina" | "Consulta" | "Crescimento" | "Remédio";
  title: string;
  date: string;
  notes?: string;
  value?: string; // e.g. "82 cm / 11.5 kg"
  time?: string; // e.g. "15:00"
  hasReminder?: boolean;
}

export interface HomeReminder {
  id: string;
  title: string; // e.g. "Dar remédio da Zoe (Paracetamol)"
  time: string; // HH:mm format, e.g. "15:00"
  member: FamilyMember;
  category: "Remédio" | "Saúde" | "Rotina" | "Casa" | "Geral";
  date?: string; // specific date YYYY-MM-DD or empty for every day
  repeatDaily: boolean;
  soundEnabled: boolean;
  voiceAlert: boolean;
  completed?: boolean;
  snoozedUntil?: number; // timestamp ms
  lastDismissedDate?: string; // YYYY-MM-DD
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  uvIndex: number;
  forecast: Array<{ day: string; temp: number; icon: string; text: string }>;
  hourly: Array<{ time: string; temp: number; icon: string }>;
}

export type ActiveTab =
  | "dashboard"
  | "calendar"
  | "shopping"
  | "tasks"
  | "routines"
  | "meals"
  | "photos"
  | "finances"
  | "zoe"
  | "settings";

export type RemoteCommandType =
  | "NAVIGATE_TAB"
  | "TOGGLE_SCREENSAVER"
  | "SET_SCREENSAVER"
  | "NEXT_PHOTO"
  | "PREV_PHOTO"
  | "SCROLL_SCREEN"
  | "ADD_SHOPPING"
  | "TOGGLE_SHOPPING"
  | "DELETE_SHOPPING"
  | "ADD_EVENT"
  | "DELETE_EVENT"
  | "ADD_TASK"
  | "TOGGLE_TASK"
  | "DELETE_TASK"
  | "ADD_ZOE_LOG"
  | "DELETE_ZOE_LOG"
  | "ADD_REMINDER"
  | "TOGGLE_REMINDER"
  | "DELETE_REMINDER"
  | "DISMISS_REMINDER"
  | "TOGGLE_BILL"
  | "TRIGGER_JARVIS_BRIEFING"
  | "TEST_SOUND"
  | "SEND_ANNOUNCEMENT"
  | "OPEN_AI_VOICE"
  | "TRIGGER_AI_PARSE"
  | "REQUEST_STATE_SYNC"
  | "SYNC_FULL_STATE";

export interface RemoteCommand {
  id: string;
  type: RemoteCommandType;
  payload?: any;
  sender?: string;
  timestamp: number;
}

export interface RemoteToastNotification {
  id: string;
  title: string;
  message: string;
  sender?: string;
  type?: "info" | "success" | "alert" | "voice";
  timestamp: number;
}

