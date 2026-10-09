import React, { useState } from "react";
import {
  Bot,
  Volume2,
  Sparkles,
  Play,
  Calendar,
  CheckSquare,
  Utensils,
  Pill,
  Bell,
  Mic,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  CalendarEvent,
  TaskItem,
  HomeReminder,
  MealPlanItem,
  BillItem,
} from "../types";
import { soundEffects } from "../lib/soundEffects";

interface JarvisHubViewProps {
  onOpenBriefing: () => void;
  events: CalendarEvent[];
  tasks: TaskItem[];
  reminders: HomeReminder[];
  bills: BillItem[];
  meals: MealPlanItem[];
}

export const JarvisHubView: React.FC<JarvisHubViewProps> = ({
  onOpenBriefing,
  events,
  tasks,
  reminders,
  bills,
  meals,
}) => {
  const [customPhrase, setCustomPhrase] = useState("");
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);

  const handleSpeakCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhrase.trim()) return;
    soundEffects.playGentleChime();
    soundEffects.speak(customPhrase);
    setLastSpoken(customPhrase);
    setCustomPhrase("");
  };

  const quickAnnouncements = [
    { label: "🍽️ O almoço está pronto!", phrase: "Atenção família: O almoço está servido na mesa!" },
    { label: "🤫 Zoe dormiu", phrase: "Silêncio na casa por favor, a bebê Zoe acabou de adormecer." },
    { label: "🎒 Hora da Escola / Natação", phrase: "Atenção: Hora de organizar a bolsa para sair!" },
    { label: "🛒 Conferir Lista de Compras", phrase: "Lembrete: Thiago está indo ao supermercado, confiram os itens no painel." },
    { label: "✨ Boa noite família", phrase: "Boa noite família! Que todos tenham um ótimo descanso." },
  ];

  const handlePlayQuick = (phrase: string) => {
    soundEffects.playGentleChime();
    soundEffects.speak(phrase);
    setLastSpoken(phrase);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Bot className="w-4 h-4" />
            <span>Assistente Residencial Inteligente da Cozinha</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Central Jarvis • Viva-Voz Cozinha
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mt-1">
            Controle por voz inteligente no computador LG da cozinha. Fale "Jarvis" (ou "ALLDAY") para adicionar compras, consultar o cardápio da Zoe ou checar seus compromissos 100% viva-voz.
          </p>
        </div>

        <button
          onClick={onOpenBriefing}
          className="relative z-10 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-amber-500/25 flex items-center gap-3 transition-all cursor-pointer shrink-0"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>Abrir Briefing Matinal Completo</span>
        </button>
      </div>

      {/* NEW SECTION: Hands-Free Voice Commands for Kitchen LG PC */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-500/20">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg sm:text-xl">
                  Comandos de Voz Viva-Voz ("Jarvis")
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Escuta Contínua Ativa 24h
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Fale diretamente no ambiente: diga "Jarvis" e dê a ordem sem precisar clicar em nada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.playWakeTone();
                setTimeout(() => {
                  soundEffects.speak("Olá Thiago e Erika! O sistema Jarvis está ativo e ouvindo continuamente na cozinha. É só dizer: Jarvis, adicione feijão na lista!");
                }, 400);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Testar Som do Jarvis</span>
            </button>
          </div>
        </div>

        {/* Examples Grid */}
        <div className="space-y-3">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Exemplos que você pode falar na cozinha (ou clique para testar agora):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: '🛒 "Jarvis, adicione feijão na lista"',
                desc: "Adiciona diretamente na lista de compras e confirma em voz alta.",
                actionText: "Jarvis, adicione feijão na minha lista de compras",
              },
              {
                title: '🍲 "Jarvis, qual o cardápio de hoje para a Zoe?"',
                desc: "Lê em voz alta as refeições cadastradas da Zoe para o dia de hoje.",
                actionText: "Jarvis, qual o cardápio de hoje para a Zoe?",
              },
              {
                title: '📅 "Jarvis, quais meus compromissos hoje?"',
                desc: "Consulta a agenda familiar e lista os horários em voz alta.",
                actionText: "Jarvis, quais os meus compromissos de hoje?",
              },
              {
                title: '🍼 "Jarvis, a Zoe já tomou remédio hoje?"',
                desc: "Verifica os registros do diário infantil e avisa os pais.",
                actionText: "Jarvis, a Zoe já tomou vitamina ou remédio hoje?",
              },
              {
                title: '🧹 "Jarvis, me lembre de trocar o filtro sábado"',
                desc: "Cria uma nova tarefa com alta prioridade para o sábado.",
                actionText: "Jarvis, me lembre de trocar o filtro do ar no sábado",
              },
              {
                title: '🖼️ "Jarvis, ativar o descanso de tela"',
                desc: "Coloca a tela no modo porta-retrato ambiente para economizar energia.",
                actionText: "Jarvis, ativar o descanso de tela",
              },
            ].map((card, i) => (
              <button
                key={i}
                onClick={() => {
                  soundEffects.playWakeTone();
                  soundEffects.speak(`Comando simulado: ${card.actionText}`);
                }}
                className="p-4 bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl text-left transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                    {card.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-amber-400">
                  <span>Toque para ouvir simulação</span>
                  <Zap className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Setup advice for LG All-in-One PC */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Dica para o monitor da cozinha:
            </span>
            <p className="text-slate-400">
              No botão flutuante no canto inferior direito da tela, deixe o <strong>Modo Viva-Voz Cozinha</strong> ativado para ele ficar sempre em prontidão ouvindo a palavra <strong>"ALLDAY"</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Voice Announcements & Audio Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Anúncios Rápidos em Voz Alta */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Avisos em Voz Alta na Cozinha</h3>
              <p className="text-xs text-slate-400">
                Toque para o Jarvis falar na tela principal
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickAnnouncements.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handlePlayQuick(item.phrase)}
                className="p-3 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                  {item.label}
                </span>
                <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0" />
              </button>
            ))}
          </div>

          {/* Custom Announcement Input */}
          <form onSubmit={handleSpeakCustom} className="pt-3 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Falar frase personalizada:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPhrase}
                onChange={(e) => setCustomPhrase(e.target.value)}
                placeholder="Ex: Pessoal, a pizza acabou de chegar!"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Mic className="w-4 h-4" />
                <span>Falar</span>
              </button>
            </div>
            {lastSpoken && (
              <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                <span>🔊 Último aviso falado:</span>
                <em>"{lastSpoken}"</em>
              </p>
            )}
          </form>
        </div>

        {/* Box 2: Monitor de Notificações Automáticas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Alertas Automáticos Programados</h3>
                <p className="text-xs text-slate-400">
                  Notificações inteligentes prioritárias na tela
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <div>
                  <strong className="text-white block">Briefing Matinal Automático</strong>
                  <span className="text-slate-400">
                    Apresenta resumo na tela inteira logo pela manhã com leitura de voz.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                <div>
                  <strong className="text-white block">Alerta 1 Hora Antes de Compromissos</strong>
                  <span className="text-slate-400">
                    Calcula horários dos ensaios e consultas e exibe modal prioritário em tela cheia.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                <div>
                  <strong className="text-white block">Alarmes de Remédios da Zoe</strong>
                  <span className="text-slate-400">
                    Sino medicinal suave e tela prioritária com botão de soneca ou confirmação.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-amber-200 font-semibold">
              Som dos alarmes testado e funcionando via Web Audio API.
            </span>
            <button
              onClick={() => {
                soundEffects.playGentleChime();
                soundEffects.speak("Sistema de som e sintetizador de voz Jarvis operando normalmente.");
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-[11px] cursor-pointer"
            >
              Testar Som
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
