import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Volume2,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  Bot,
  HelpCircle,
  Headphones,
  Check,
} from "lucide-react";
import {
  ActiveTab,
  CalendarEvent,
  ShoppingItem,
  TaskItem,
  MealPlanItem,
  ChildLogRecord,
  HomeReminder,
} from "../types";
import { soundEffects } from "../lib/soundEffects";

interface KitchenVoiceAssistantProps {
  isScreenSaverActive: boolean;
  onSetScreenSaver: (active: boolean) => void;
  activeTab: ActiveTab;
  onNavigateTab: (tab: ActiveTab) => void;
  onAddShoppingItem: (item: Omit<ShoppingItem, "id">) => void;
  onAddCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  onAddTaskItem: (task: Omit<TaskItem, "id">) => void;
  events: CalendarEvent[];
  tasks: TaskItem[];
  shopping: ShoppingItem[];
  meals: MealPlanItem[];
  childLogs: ChildLogRecord[];
  reminders: HomeReminder[];
  addToast: (
    title: string,
    message: string,
    sender: string,
    type: "info" | "success" | "alert" | "voice"
  ) => void;
}

export type WakeWordOption = "ok_allday" | "allday" | "jarvis" | "any";

interface WakeDetectionResult {
  detected: boolean;
  matchedWakeWord: string | null;
  extractedCommand: string;
}

function normalizeSpokenText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'!\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ultra-sensitive Wake Word detector for Brazilian Portuguese variations of "Jarvis" and "Ok, Allday"
 */
function matchWakeWord(
  text: string,
  preferredOption: WakeWordOption = "any"
): WakeDetectionResult {
  const rawClean = text.trim();
  if (!rawClean) {
    return { detected: false, matchedWakeWord: null, extractedCommand: "" };
  }

  const norm = normalizeSpokenText(rawClean);

  // Common conversational prefixes in Brazilian Portuguese (normalized without accents)
  const prefixGroup =
    "(?:ok|ei|ola|oi|hey|alo|fala|e\\s+ai|ou|por\\s+favor|por\\s+gentileza|bom\\s+dia|boa\\s+tarde|boa\\s+noite)?\\s*";

  // Phonetic variations of "Jarvis" in Portuguese speech recognition
  const jarvisTokens =
    "(?:jarvis|iarvis|charvis|xarvis|jarves|jarve|jarbas|jarbis|jarvi|jervis|jerves|gervis|gerbis|gerbes|djarvis|djarve|djarves|javis|javes|yavis|yarvis|travis|jabis|chalves|chaves)";

  const jarvisRegex = new RegExp(`(?:^|\\s)${prefixGroup}(${jarvisTokens})(?:\\s|$|[.,!?:])`, "i");

  // Phonetic variations of "Allday" / "Aldei"
  const alldayTokens =
    "(?:allday|all\\s*day|al\\s*day|old\\s*day|olday|all\\s*dei|oldei|aldei|al\\s*dei|audi|auday|all-day)";

  const alldayRegex = new RegExp(`(?:^|\\s)${prefixGroup}(${alldayTokens})(?:\\s|$|[.,!?:])`, "i");

  // 1. Check Jarvis (Priority)
  if (
    preferredOption === "jarvis" ||
    preferredOption === "any" ||
    preferredOption === "ok_allday"
  ) {
    const jarvisMatch = norm.match(jarvisRegex);
    if (jarvisMatch) {
      const matchIndex = norm.indexOf(jarvisMatch[0].trim());
      const afterMatchNorm = norm.slice(matchIndex + jarvisMatch[0].trim().length).trim();

      // Find split point in raw text to preserve case and formatting of the command
      const rawTokens = rawClean.split(/\s+/);
      const normTokens = norm.split(/\s+/);
      const wakeWordToken = jarvisMatch[1].toLowerCase();
      let splitIdx = -1;

      for (let i = 0; i < normTokens.length; i++) {
        if (normTokens[i] === wakeWordToken || normTokens[i].includes(wakeWordToken)) {
          splitIdx = i;
          break;
        }
      }

      let extracted = "";
      if (splitIdx !== -1 && splitIdx < rawTokens.length - 1) {
        extracted = rawTokens.slice(splitIdx + 1).join(" ").trim();
      } else if (afterMatchNorm) {
        extracted = afterMatchNorm;
      }

      // Clean punctuation from extracted command
      extracted = extracted.replace(/^[.,:;!?-]+\s*/, "").trim();

      return {
        detected: true,
        matchedWakeWord: "Jarvis",
        extractedCommand: extracted,
      };
    }
  }

  // 2. Check Allday
  if (
    preferredOption === "allday" ||
    preferredOption === "ok_allday" ||
    preferredOption === "any"
  ) {
    const alldayMatch = norm.match(alldayRegex);
    if (alldayMatch) {
      const matchIndex = norm.indexOf(alldayMatch[0].trim());
      const afterMatchNorm = norm.slice(matchIndex + alldayMatch[0].trim().length).trim();

      const rawTokens = rawClean.split(/\s+/);
      const normTokens = norm.split(/\s+/);
      const wakeWordToken = alldayMatch[1].toLowerCase();
      let splitIdx = -1;

      for (let i = 0; i < normTokens.length; i++) {
        if (normTokens[i] === wakeWordToken || normTokens[i].includes(wakeWordToken)) {
          splitIdx = i;
          break;
        }
      }

      let extracted = "";
      if (splitIdx !== -1 && splitIdx < rawTokens.length - 1) {
        extracted = rawTokens.slice(splitIdx + 1).join(" ").trim();
      } else if (afterMatchNorm) {
        extracted = afterMatchNorm;
      }

      extracted = extracted.replace(/^[.,:;!?-]+\s*/, "").trim();

      return {
        detected: true,
        matchedWakeWord: "Allday",
        extractedCommand: extracted,
      };
    }
  }

  return { detected: false, matchedWakeWord: null, extractedCommand: rawClean };
}

export const KitchenVoiceAssistant: React.FC<KitchenVoiceAssistantProps> = ({
  isScreenSaverActive,
  onSetScreenSaver,
  activeTab,
  onNavigateTab,
  onAddShoppingItem,
  onAddCalendarEvent,
  onAddTaskItem,
  events,
  tasks,
  shopping,
  meals,
  childLogs,
  reminders,
  addToast,
}) => {
  // Preferences: Default to true so it behaves like Alexa (always listening)
  const [isHandsFreeActive, setIsHandsFreeActive] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("allday_handsfree_active");
      if (saved === null) return true; // Always active by default
      return saved === "true";
    }
    return true;
  });

  const [wakeWordOption, setWakeWordOption] = useState<WakeWordOption>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("allday_wake_word_option");
      if (saved) return saved as WakeWordOption;
    }
    return "any"; // Default to "any" so "Jarvis" and "Allday" BOTH work out of the box!
  });

  const [isListening, setIsListening] = useState(false);
  const [isAwake, setIsAwake] = useState(false); // Active grace listening period after hearing wake word
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [detectedWakeWordDisplay, setDetectedWakeWordDisplay] = useState<string | null>(null);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  const [lastExchange, setLastExchange] = useState<{
    userQuery: string;
    speechReply: string;
    summary: string;
    intent: string;
    timestamp: number;
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // Synchronization Refs to prevent stale closure states during Web Speech rapid events
  const recognitionRef = useRef<any>(null);
  const isHandsFreeActiveRef = useRef(isHandsFreeActive);
  const isListeningRef = useRef(isListening);
  const isAwakeRef = useRef(isAwake);
  const isProcessingRef = useRef(isProcessing);
  const wakeWordOptionRef = useRef(wakeWordOption);
  const isManuallyTriggeredRef = useRef(false);
  const awakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef(isSpeaking);

  // Keep refs in sync with state
  useEffect(() => {
    isHandsFreeActiveRef.current = isHandsFreeActive;
  }, [isHandsFreeActive]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isAwakeRef.current = isAwake;
  }, [isAwake]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    wakeWordOptionRef.current = wakeWordOption;
  }, [wakeWordOption]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
    // When Jarvis finishes speaking aloud, instantly resume microphone listening
    if (!isSpeaking && isHandsFreeActiveRef.current && !isListeningRef.current) {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        try {
          if (recognitionRef.current && isHandsFreeActiveRef.current) {
            recognitionRef.current.start();
          } else {
            recognitionRef.current = initRecognition();
            recognitionRef.current?.start();
          }
        } catch (e) {}
      }, 150);
    }
  }, [isSpeaking]);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSupport =
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      setIsSupported(hasSupport);
    }
  }, []);

  // Monitor SpeechSynthesis speaking status
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const interval = setInterval(() => {
      setIsSpeaking(window.speechSynthesis.speaking);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Helper to wake up assistant and set grace period
  const triggerAwakeState = useCallback((wakeWordName: string = "Jarvis") => {
    isAwakeRef.current = true;
    setIsAwake(true);
    setDetectedWakeWordDisplay(wakeWordName);
    soundEffects.playWakeTone();

    if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
    awakeTimeoutRef.current = setTimeout(() => {
      isAwakeRef.current = false;
      setIsAwake(false);
      isManuallyTriggeredRef.current = false;
      setDetectedWakeWordDisplay(null);
    }, 8500); // 8.5 seconds grace period
  }, []);

  // Dispatch spoken command to backend
  const processVoiceCommand = useCallback(
    async (rawText: string) => {
      const cleanText = rawText.trim();
      if (!cleanText) return;

      isAwakeRef.current = false;
      setIsAwake(false);
      isManuallyTriggeredRef.current = false;
      if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);

      setIsProcessing(true);
      isProcessingRef.current = true;
      setCurrentTranscript(cleanText);

      // Context of the house right now
      const todayISO = new Date().toISOString().split("T")[0];
      const dayNames = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
      ];
      const todayDayOfWeek = dayNames[new Date().getDay()];

      const todayMeals = meals.filter(
        (m) =>
          m.day === todayDayOfWeek ||
          m.day.toLowerCase() === todayDayOfWeek.toLowerCase()
      );
      const todayEvents = events.filter((e) => e.date === todayISO);
      const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 10);
      const pendingShopping = shopping.filter((s) => !s.completed).slice(0, 12);
      const todayChildLogs = childLogs.filter((l) =>
        l.timestamp.startsWith(todayISO)
      );
      const todayReminders = reminders.filter((r) => !r.completed);

      const contextPayload = {
        currentDate: todayISO,
        currentDayOfWeek: todayDayOfWeek,
        currentTime: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        meals: todayMeals,
        events: todayEvents,
        tasks: pendingTasks,
        shopping: pendingShopping,
        childLogs: todayChildLogs,
        reminders: todayReminders,
      };

      try {
        const response = await fetch("/api/ai/voice-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanText,
            context: contextPayload,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro no servidor de voz");
        }

        const resData = await response.json();
        const {
          intent,
          speechText,
          summary,
          targetTab,
          screensaverAction,
          data,
        } = resData;

        // Apply Actions
        if (intent === "add_shopping" && data?.shoppingItem) {
          onAddShoppingItem({
            name: data.shoppingItem,
            category: data.shoppingCategory || "Supermercado",
            completed: false,
            addedBy: data.eventMember || "Voz Cozinha",
          });
          onNavigateTab("shopping");
        } else if (intent === "add_calendar" && data?.eventTitle) {
          onAddCalendarEvent({
            title: data.eventTitle,
            date: data.eventDate || todayISO,
            time: data.eventTime || "12:00",
            member: data.eventMember || "Família",
            category: "Pessoal",
            googleSynced: true,
          });
          onNavigateTab("calendar");
        } else if (intent === "add_task" && data?.taskTitle) {
          onAddTaskItem({
            title: data.taskTitle,
            assignee: data.eventMember || "Thiago",
            dueDate: todayISO,
            completed: false,
            priority: data.taskPriority || "medium",
            category: data.taskCategory || "Casa",
          });
          onNavigateTab("tasks");
        }

        if (targetTab) {
          onNavigateTab(targetTab as ActiveTab);
          if (isScreenSaverActive) {
            onSetScreenSaver(false);
          }
        }

        if (screensaverAction === "activate") {
          onSetScreenSaver(true);
        } else if (screensaverAction === "deactivate") {
          onSetScreenSaver(false);
        }

        // Store last exchange
        setLastExchange({
          userQuery: cleanText,
          speechReply: speechText || summary || "Comando executado!",
          summary: summary || "Comando processado com sucesso",
          intent: intent || "general_chat",
          timestamp: Date.now(),
        });

        // Notify UI toast
        addToast(
          summary || "Jarvis Voz",
          speechText || "Comando atendido com sucesso.",
          "ALLDAY Voz",
          "voice"
        );

        // Play feedback tone then speak response aloud
        soundEffects.playAcknowledgeTone();
        setTimeout(() => {
          if (speechText) {
            soundEffects.speak(speechText);
          }
        }, 300);
      } catch (err) {
        console.error("Erro ao processar voz com Gemini:", err);
        const fallback =
          "Desculpe, não consegui entender o comando agora. Pode repetir?";
        soundEffects.speak(fallback);
        addToast("Voz Cozinha", fallback, "Jarvis", "alert");
      } finally {
        setIsProcessing(false);
        isProcessingRef.current = false;
      }
    },
    [
      meals,
      events,
      tasks,
      shopping,
      childLogs,
      reminders,
      onAddShoppingItem,
      onAddCalendarEvent,
      onAddTaskItem,
      onNavigateTab,
      onSetScreenSaver,
      isScreenSaverActive,
      addToast,
    ]
  );

  // Initialize and maintain speech recognition loop
  const initRecognition = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      return null;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();

      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "pt-BR";
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setMicPermissionDenied(false);
      };

      rec.onresult = (event: any) => {
        // Discard microphone input while the assistant is speaking out loud to prevent echo loops
        if (isSpeakingRef.current) return;

        let interimText = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += trans;
          } else {
            interimText += trans;
          }
        }

        const spoken = (finalText || interimText).trim();
        if (!spoken) return;

        setCurrentTranscript(spoken);

        // Check wake-word match
        const wakeCheck = matchWakeWord(spoken, wakeWordOptionRef.current);

        // 1. Wake word detected while sleeping (works on interim speech immediately!)
        if (wakeCheck.detected && !isAwakeRef.current) {
          triggerAwakeState(wakeCheck.matchedWakeWord || "Jarvis");

          // If the user already said the command in the same breath (e.g. "Jarvis adicione feijão")
          if (wakeCheck.extractedCommand.length > 2 && finalText) {
            processVoiceCommand(wakeCheck.extractedCommand);
            return;
          }
        }

        // 2. Already awake (grace period active or manually clicked): process command
        if (
          isAwakeRef.current ||
          isManuallyTriggeredRef.current
        ) {
          // If we have a final recognized sentence
          if (finalText) {
            // Strip wake-word prefix if present
            const commandToRun = wakeCheck.detected
              ? wakeCheck.extractedCommand
              : finalText.trim();

            if (commandToRun.length > 1) {
              processVoiceCommand(commandToRun);
            }
          }
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Reconhecimento de voz aviso:", e.error);
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          // Browsers require 1 user interaction/gesture to unlock audio & mic permissions
          setNeedsUserGesture(true);
          setIsListening(false);
          isListeningRef.current = false;
        } else if (e.error === "no-speech" || e.error === "network" || e.error === "aborted") {
          // Immediate seamless restart on silence or transient network reconnect
          if (isHandsFreeActiveRef.current && !isSpeakingRef.current) {
            setTimeout(() => {
              try {
                if (recognitionRef.current && isHandsFreeActiveRef.current) {
                  recognitionRef.current.start();
                }
              } catch (err) {
                try {
                  recognitionRef.current = initRecognition();
                  recognitionRef.current?.start();
                } catch (e2) {}
              }
            }, 100);
          }
        }
      };

      rec.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;

        // Automatically restart if hands-free is enabled (continuous loop like Alexa)
        if (isHandsFreeActiveRef.current && !isSpeakingRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            try {
              if (recognitionRef.current && isHandsFreeActiveRef.current) {
                recognitionRef.current.start();
              }
            } catch (err) {
              try {
                recognitionRef.current = initRecognition();
                recognitionRef.current?.start();
              } catch (e2) {}
            }
          }, 100);
        }
      };

      return rec;
    } catch (e) {
      console.error("Falha ao inicializar SpeechRecognition:", e);
      return null;
    }
  }, [processVoiceCommand, triggerAwakeState]);

  // Handle Hands-Free Toggle
  const toggleHandsFree = () => {
    if (!isSupported) {
      alert(
        "Seu navegador não possui suporte à API de reconhecimento de voz. Recomendamos o Google Chrome ou Edge no computador LG."
      );
      return;
    }

    const nextState = !isHandsFreeActive;
    setIsHandsFreeActive(nextState);
    isHandsFreeActiveRef.current = nextState;

    try {
      localStorage.setItem("allday_handsfree_active", String(nextState));
    } catch (e) {}

    if (nextState) {
      soundEffects.playGentleChime();
      addToast(
        "Modo Viva-Voz Cozinha ATIVADO",
        'Ouvindo continuamente no ambiente. Diga "Ok, Allday" a qualquer momento!',
        "ALLDAY Voz",
        "success"
      );
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }
      try {
        recognitionRef.current?.start();
      } catch (err) {}
    } else {
      soundEffects.playSuccessTone();
      addToast(
        "Modo Viva-Voz Pausado",
        "O microfone contínuo foi desativado.",
        "ALLDAY Voz",
        "info"
      );
      try {
        recognitionRef.current?.stop();
      } catch (err) {}
      setIsAwake(false);
      isAwakeRef.current = false;
    }
  };

  // Immediate Push-to-Talk (One-click)
  const handlePushToTalk = () => {
    isManuallyTriggeredRef.current = true;
    triggerAwakeState("Falar Agora");
    setCurrentTranscript("");

    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    try {
      recognitionRef.current?.start();
    } catch (err) {
      // Already running
    }
  };

  // Run Quick Simulation / Preset Command (Great for immediate testing!)
  const handleRunPreset = (presetPhrase: string) => {
    isManuallyTriggeredRef.current = true;
    triggerAwakeState("Jarvis");
    setCurrentTranscript(presetPhrase);

    // Strip wake-word for process
    const stripped = matchWakeWord(presetPhrase, "any").extractedCommand || presetPhrase;
    setTimeout(() => {
      processVoiceCommand(stripped);
    }, 450);
  };

  const handleSelectWakeWord = (opt: WakeWordOption) => {
    setWakeWordOption(opt);
    wakeWordOptionRef.current = opt;
    try {
      localStorage.setItem("allday_wake_word_option", opt);
    } catch (e) {}
    soundEffects.playSuccessTone();
  };

  // Setup / Teardown & Continuous Watchdog Heartbeat
  useEffect(() => {
    // Warm up microphone permission in browser if possible
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          setNeedsUserGesture(false);
          if (isHandsFreeActiveRef.current && !isListeningRef.current) {
            try {
              if (!recognitionRef.current) {
                recognitionRef.current = initRecognition();
              }
              recognitionRef.current?.start();
            } catch (e) {}
          }
        })
        .catch(() => {
          // Handled if browser prompts for initial user gesture
        });
    }

    if (isHandsFreeActive) {
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    }

    // High-frequency Watchdog (every 1.2s) to guarantee 24/7 continuous listening on Kitchen LG Kiosk PC
    watchdogTimerRef.current = setInterval(() => {
      if (
        isHandsFreeActiveRef.current &&
        !isListeningRef.current &&
        !isSpeakingRef.current &&
        !isProcessingRef.current
      ) {
        try {
          if (!recognitionRef.current) {
            recognitionRef.current = initRecognition();
          }
          recognitionRef.current?.start();
        } catch (err) {
          try {
            recognitionRef.current = initRecognition();
            recognitionRef.current?.start();
          } catch (e) {}
        }
      }
    }, 1200);

    // Auto-resume and browser audio/mic unlock on ANY ambient touch/click
    const handleUnlockAndResume = () => {
      soundEffects.playSuccessTone();
      setNeedsUserGesture(false);
      if (isHandsFreeActiveRef.current) {
        try {
          if (!recognitionRef.current) {
            recognitionRef.current = initRecognition();
          }
          recognitionRef.current?.start();
        } catch (e) {}
      }
    };

    window.addEventListener("click", handleUnlockAndResume);
    window.addEventListener("touchstart", handleUnlockAndResume);
    window.addEventListener("pointerdown", handleUnlockAndResume);

    return () => {
      window.removeEventListener("click", handleUnlockAndResume);
      window.removeEventListener("touchstart", handleUnlockAndResume);
      window.removeEventListener("pointerdown", handleUnlockAndResume);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
      if (watchdogTimerRef.current) clearInterval(watchdogTimerRef.current);
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    };
  }, [initRecognition, isHandsFreeActive]);

  const quickPresets = [
    {
      label: '🛒 "Jarvis, adicione feijão na lista"',
      command: "Jarvis, adicione feijão na minha lista de compras",
    },
    {
      label: '🍲 "Jarvis, qual o cardápio de hoje para Zoe?"',
      command: "Jarvis, qual o cardápio de hoje para a Zoe?",
    },
    {
      label: '📅 "Jarvis, quais os meus compromissos hoje?"',
      command: "Jarvis, quais são os meus compromissos de hoje?",
    },
    {
      label: '👶 "Jarvis, a Zoe tomou remédio hoje?"',
      command: "Jarvis, a Zoe já tomou remédio ou vitamina hoje?",
    },
    {
      label: '🧹 "Jarvis, me lembre de trocar o filtro sábado"',
      command: "Jarvis, me lembre de trocar o filtro do ar condicionado no sábado",
    },
    {
      label: '🖼️ "Jarvis, ativar o descanso de tela"',
      command: "Jarvis, ativar o descanso de tela",
    },
  ];

  return (
    <>
      {/* FLOATING KITCHEN VOICE WIDGET (Always visible on screen in Kiosk Mode & Screensaver) */}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2 pointer-events-auto">
        {/* Browser First-Touch Gesture Prompt */}
        {needsUserGesture && (
          <div
            onClick={() => {
              setNeedsUserGesture(false);
              try {
                if (!recognitionRef.current) {
                  recognitionRef.current = initRecognition();
                }
                recognitionRef.current?.start();
              } catch (e) {}
            }}
            className="cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-4 py-2 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce border border-amber-300"
          >
            <Mic className="w-4 h-4 fill-slate-950" />
            <span>Toque 1 vez na tela para ligar o microfone contínuo do Jarvis!</span>
          </div>
        )}

        {/* Active Speech Transcription / Jarvis Reply Floating Bubble */}
        {(isAwake || isProcessing || isSpeaking || currentTranscript) && (
          <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 text-white p-4 rounded-3xl shadow-2xl max-w-sm sm:max-w-md animate-in slide-in-from-bottom-3 duration-200 space-y-2">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isSpeaking
                        ? "bg-cyan-400"
                        : isProcessing
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      isSpeaking
                        ? "bg-cyan-500"
                        : isProcessing
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  {isSpeaking
                    ? "Jarvis Falando..."
                    : isProcessing
                    ? "Processando com IA..."
                    : isAwake
                    ? `Ouvindo (${detectedWakeWordDisplay || "Jarvis"})...`
                    : "Jarvis Voz"}
                </span>
              </div>
              <button
                onClick={() => {
                  soundEffects.stopAll();
                  setCurrentTranscript("");
                  setIsAwake(false);
                  isAwakeRef.current = false;
                }}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transcript or Audio Waveform */}
            {isAwake && !isProcessing && (
              <div className="py-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 mb-1">Você falando:</p>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    🟢 Jarvis Ativado
                  </span>
                </div>
                <p className="text-sm font-medium text-emerald-300 italic min-h-[22px]">
                  "{currentTranscript || "Estou ouvindo... Fale agora..."}"
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="h-3 w-1 bg-amber-400 animate-pulse rounded-full" />
                  <span className="h-5 w-1 bg-amber-400 animate-pulse delay-75 rounded-full" />
                  <span className="h-2 w-1 bg-amber-400 animate-pulse delay-150 rounded-full" />
                  <span className="h-6 w-1 bg-amber-400 animate-pulse delay-100 rounded-full" />
                  <span className="h-4 w-1 bg-amber-400 animate-pulse delay-200 rounded-full" />
                  <span className="text-[11px] text-slate-400 ml-2">
                    Diga sua instrução...
                  </span>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center gap-2.5 py-1 text-slate-300 text-xs font-medium">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Processando comando com Gemini 3.8 Flash...</span>
              </div>
            )}

            {lastExchange && !isAwake && !isProcessing && (
              <div className="py-1 space-y-1.5">
                <p className="text-xs text-slate-400">
                  Comando:{" "}
                  <span className="text-slate-200 font-semibold">
                    "{lastExchange.userQuery}"
                  </span>
                </p>
                <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/60">
                  <div className="flex items-start gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-cyan-200 font-medium leading-relaxed">
                      {lastExchange.speechReply}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Master Control Capsule */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-full p-1.5 shadow-2xl flex items-center gap-2 transition-all">
          {/* Main Push to Talk or Status */}
          <button
            onClick={handlePushToTalk}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all shadow-md cursor-pointer ${
              isAwake
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 animate-pulse shadow-emerald-500/30"
                : isProcessing
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950"
                : isHandsFreeActive
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 hover:brightness-110 shadow-amber-500/25"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
            title="Diga 'Jarvis' ou 'ALLDAY' no ambiente ou clique para falar"
          >
            <Mic className="w-4 h-4" />
            <span>
              {isAwake
                ? "Ouvindo você... Fale agora!"
                : isProcessing
                ? "Jarvis pensando..."
                : isHandsFreeActive
                ? 'Diga "Jarvis" ou "ALLDAY"'
                : "Falar com Jarvis"}
            </span>
          </button>

          {/* Continuous Listening Toggle Button */}
          <button
            onClick={toggleHandsFree}
            className={`p-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
              isHandsFreeActive
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
            title={
              isHandsFreeActive
                ? 'Modo Viva-Voz Cozinha ATIVO (Sempre ouvindo "Jarvis" ou "ALLDAY"). Clique para pausar.'
                : 'Modo Viva-Voz Cozinha DESATIVADO. Clique para ativar escuta contínua de "Jarvis".'
            }
          >
            <Radio
              className={`w-4 h-4 ${
                isHandsFreeActive ? "animate-pulse text-emerald-400" : ""
              }`}
            />
          </button>

          {/* Quick Assistant Hub Dialog Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="Configurar Palavra-Chave (Wake-Word) e Testar"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* FULL VOICE CONFIG & WAKE-WORD TEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Detecção de Wake-Word ("Jarvis" / "ALLDAY")
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Escuta viva-voz 100% contínua sem necessidade de toque ou mouse.
                </p>
              </div>
            </div>

            {/* Wake-Word Selection Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                <Headphones className="w-4 h-4" />
                <span>Escolha a Palavra de Ativação Principal (Wake-Word)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  {
                    id: "any",
                    label: '"Jarvis" ou "ALLDAY" (Padrão)',
                    desc: "Aceita tanto 'Jarvis' quanto 'Ok, Allday'",
                  },
                  {
                    id: "jarvis",
                    label: '"Jarvis" ou "Ok, Jarvis"',
                    desc: "Ativação direta ao estilo Homem de Ferro",
                  },
                  {
                    id: "ok_allday",
                    label: '"Ok, Allday"',
                    desc: "Palavra-chave clássica da casa",
                  },
                  {
                    id: "allday",
                    label: '"Allday"',
                    desc: "Ativação rápida com uma palavra",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectWakeWord(opt.id as WakeWordOption)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      wakeWordOption === opt.id
                        ? "bg-amber-500/10 border-amber-500 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{opt.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                    {wakeWordOption === opt.id && (
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                    Status do Modo Cozinha
                  </span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {isHandsFreeActive
                      ? 'Pronto e Ouvindo no ambiente • Diga "Jarvis..."'
                      : "Pausado (Ative para escuta contínua)"}
                  </p>
                </div>
                <button
                  onClick={toggleHandsFree}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
                    isHandsFreeActive
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isHandsFreeActive ? "Desativar" : "Ativar Modo Cozinha"}</span>
                </button>
              </div>

              {micPermissionDenied && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Permissão de Microfone Bloqueada</p>
                    <p className="text-slate-300 mt-0.5">
                      Clique no ícone de cadeado na barra de endereços do seu
                      navegador e marque <strong>Microfone: Permitir</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Test Voice Push to Talk */}
            <div className="text-center py-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3">
              <p className="text-xs text-slate-400">
                Teste de Microfone em Tempo Real:
              </p>
              <button
                onClick={handlePushToTalk}
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                  isAwake
                    ? "bg-emerald-500 text-slate-950 ring-8 ring-emerald-500/30 animate-pulse scale-105"
                    : "bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 hover:scale-105 shadow-amber-500/30"
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>
              <p className="text-xs font-semibold text-slate-300">
                {isAwake
                  ? "Ouvindo você... Fale agora!"
                  : isProcessing
                  ? "Processando resposta com IA..."
                  : 'Fale "Jarvis" ou "ALLDAY" ou clique no microfone'}
              </p>
              {currentTranscript && (
                <div className="px-4 py-2 bg-slate-900 rounded-xl max-w-md mx-auto border border-slate-800">
                  <p className="text-xs text-emerald-400 italic">
                    "{currentTranscript}"
                  </p>
                </div>
              )}
            </div>

            {/* 1-Click Simulation / Testing Chips */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exemplos com "Jarvis" (Clique para Simular)</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  Teste o som e a resposta
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRunPreset(preset.command)}
                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 text-left transition cursor-pointer group flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition">
                      {preset.label}
                    </span>
                    <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tips for LG All-in-One PC */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Como usar na cozinha sem teclado e sem mouse:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>
                  Diga <strong>"Jarvis"</strong> (ou <strong>"ALLDAY"</strong>), aguarde o sinal sonoro futurista e fale o comando (ou fale tudo direto, ex: <em>"Jarvis, adicione feijão na lista"</em>).
                </li>
                <li>
                  O monitor LG responderá falando em voz alta pelos alto-falantes embutidos.
                </li>
                <li>
                  O sistema possui reinicialização contínua automática para manter a escuta ativa 24 horas por dia sem precisar tocar na tela.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
