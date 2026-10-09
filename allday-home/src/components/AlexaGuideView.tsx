import React, { useState } from "react";
import { Bot, Mic, Volume2, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface AlexaGuideViewProps {
  onSimulateAlexaCommand: (command: string) => void;
}

export const AlexaGuideView: React.FC<AlexaGuideViewProps> = ({
  onSimulateAlexaCommand,
}) => {
  const [spokenText, setSpokenText] = useState("");
  const [alexaReply, setAlexaReply] = useState<string | null>(null);

  const sampleVoiceCommands = [
    "Alexa, peça ao ALLDAY Home para adicionar leite e fraldas Zoe",
    "Alexa, peça ao ALLDAY Home para criar tarefa faxina no sábado",
    "Alexa, peça ao ALLDAY Home para marcar atendimento João quarta às 10h",
    "Alexa, qual é a refeição do dia?",
  ];

  const handleRunSimulator = (phrase: string) => {
    setSpokenText(phrase);
    setAlexaReply("🗣️ 'Certamente! Adicionei ao painel do ALLDAY Home da sua cozinha.'");
    onSimulateAlexaCommand(phrase);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Integração com Alexa & Assistentes de Voz</h2>
            <p className="text-xs text-slate-400">
              Controle a rotina da casa falando com qualquer dispositivo Echo ou aplicativo Alexa
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Simulator Box */}
      <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Simulador da Skill ALLDAY Home</span>
        </div>

        <h3 className="text-lg font-bold text-white mb-4">
          Teste Comandos de Voz em Tempo Real
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {sampleVoiceCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleRunSimulator(cmd)}
              className="p-3.5 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-2xl text-xs text-left text-slate-200 hover:text-cyan-300 transition-all flex items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">"{cmd}"</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          ))}
        </div>

        {spokenText && (
          <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-2xl space-y-2 animate-in fade-in">
            <p className="text-xs text-slate-400 font-semibold">
              Você disse para a Alexa:
            </p>
            <p className="text-sm font-bold text-cyan-300">"{spokenText}"</p>
            {alexaReply && (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mt-2 pt-2 border-t border-slate-800">
                <Volume2 className="w-4 h-4" />
                <span>Resposta da Alexa: {alexaReply}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Integration Methods Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center text-sm">
            1
          </div>
          <h4 className="font-bold text-white text-base">Modo 1: Lista da Alexa Sync</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sincroniza automaticamente a lista de compras nativa do app Alexa com o painel da cozinha ALLDAY Home.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center text-sm">
            2
          </div>
          <h4 className="font-bold text-white text-base">Modo 2: Custom Skill</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Diga "Alexa, peça ao ALLDAY Home para..." para agendar compromissos, tarefas e refeições diretamente por voz.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-sm">
            3
          </div>
          <h4 className="font-bold text-white text-base">Modo 3: Assistente Nativo IA</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Utilize o botão de microfone na barra do painel para falar diretamente em linguagem natural com a IA Gemini.
          </p>
        </div>
      </div>
    </div>
  );
};
