import React, { useState } from "react";
import {
  Sparkles,
  Mic,
  MicOff,
  X,
  CheckCircle2,
  Calendar,
  ShoppingBag,
  CheckSquare,
  Utensils,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface QuickAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAction: (intent: string, data: any) => void;
}

export const QuickAiModal: React.FC<QuickAiModalProps> = ({
  isOpen,
  onClose,
  onApplyAction,
}) => {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const quickPrompts = [
    "Comprar leite, pão e fralda para a Zoe",
    "Reunião com cliente João quarta às 14h",
    "Lembrar de faxina no sábado com prioridade alta",
    "Organiza minha semana de trabalho e treino",
  ];

  const handleVoiceToggle = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("O seu navegador não suporta a API nativa de reconhecimento de voz. Por favor digite o comando no campo abaixo.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSendPrompt = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setIsLoading(true);
    setErrorMsg("");
    setParsedResult(null);

    try {
      const response = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Falha no servidor de IA");
      }

      const resData = await response.json();
      setParsedResult(resData);
    } catch (err: any) {
      console.error("Erro ao chamar IA:", err);
      setErrorMsg("Não foi possível processar via IA. Tente novamente ou verifique a chave GEMINI_API_KEY.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = () => {
    if (parsedResult) {
      onApplyAction(parsedResult.intent, parsedResult.data);
      setParsedResult(null);
      setInputText("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 text-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Assistente do ALLDAY Home</h2>
            <p className="text-xs text-slate-400">
              Fale ou digite comandos em linguagem natural (Powered by Gemini AI)
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-2xl mb-4 focus-within:border-amber-500 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendPrompt()}
            placeholder="Ex: 'Comprar fraldas e leite' ou 'Reunião quarta às 14h'..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />

          {/* Voice Microphone Toggle Button */}
          <button
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-amber-400"
            }`}
            title="Falar por voz"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Process Prompt Button */}
          <button
            onClick={() => handleSendPrompt()}
            disabled={isLoading || !inputText.trim()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Enviar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick Example Chips */}
        {!parsedResult && !isLoading && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 mb-2">Exemplos rápidos de voz:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(prompt);
                    handleSendPrompt(prompt);
                  }}
                  className="text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/60 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm font-medium text-slate-300">
              Analisando seu comando com inteligência artificial Gemini...
            </p>
          </div>
        )}

        {/* Error Display */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs mb-4">
            {errorMsg}
          </div>
        )}

        {/* Parsed Result Preview */}
        {parsedResult && (
          <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 text-left">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ação Entendida Pela IA</span>
            </div>
            <p className="text-base font-semibold text-white mb-3">
              "{parsedResult.summary}"
            </p>

            {/* Content Details */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs space-y-1.5 text-slate-300 mb-4">
              {parsedResult.intent === "add_shopping" && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Adicionar à Lista de Compras:{" "}
                    <strong className="text-white">
                      {parsedResult.data?.shoppingItem}
                    </strong>{" "}
                    ({parsedResult.data?.shoppingCategory || "Supermercado"})
                  </span>
                </div>
              )}

              {parsedResult.intent === "add_calendar" && (
                <div className="flex items-center gap-2 text-purple-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Agendar Compromisso:{" "}
                    <strong className="text-white">
                      {parsedResult.data?.eventTitle}
                    </strong>{" "}
                    em {parsedResult.data?.eventDate} às {parsedResult.data?.eventTime || "dia todo"} ({parsedResult.data?.eventMember || "Família"})
                  </span>
                </div>
              )}

              {parsedResult.intent === "add_task" && (
                <div className="flex items-center gap-2 text-blue-400">
                  <CheckSquare className="w-4 h-4" />
                  <span>
                    Criar Tarefa:{" "}
                    <strong className="text-white">
                      {parsedResult.data?.taskTitle}
                    </strong>{" "}
                    (Prioridade: {parsedResult.data?.taskPriority || "Média"})
                  </span>
                </div>
              )}

              {parsedResult.intent === "add_meal" && (
                <div className="flex items-center gap-2 text-orange-400">
                  <Utensils className="w-4 h-4" />
                  <span>
                    Cardápio {parsedResult.data?.mealDay}:{" "}
                    <strong className="text-white">
                      {parsedResult.data?.mealName}
                    </strong>
                  </span>
                </div>
              )}

              {parsedResult.intent === "organize_routine" && parsedResult.data?.routineAdvice && (
                <div>
                  <p className="font-semibold text-amber-300 mb-1">
                    Sugestões de Otimização da Rotina:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {parsedResult.data.routineAdvice.map((adv: string, i: number) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Actions */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setParsedResult(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar / Refazer
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aplicar ao Painel da Casa</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
