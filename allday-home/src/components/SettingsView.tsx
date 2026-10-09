import React, { useState, useRef } from "react";
import {
  Settings,
  User,
  RefreshCw,
  Monitor,
  Moon,
  Sun,
  Shield,
  Download,
  Upload,
  Share2,
  Check,
  FileText,
  Volume2,
} from "lucide-react";
import { MemberProfile } from "../types";
import { Storage } from "../lib/storage";
import { soundEffects } from "../lib/soundEffects";

interface SettingsViewProps {
  members: MemberProfile[];
  idleTimeoutMinutes: number;
  onChangeIdleTimeout: (mins: number) => void;
  onResetFactoryData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  members,
  idleTimeoutMinutes,
  onChangeIdleTimeout,
  onResetFactoryData,
}) => {
  const [highContrast, setHighContrast] = useState(true);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const handleExportBackup = () => {
    try {
      const data = Storage.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-allday-home-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      soundEffects.playSuccessTone();
      showFeedback("📥 Backup completo do ALLDAY Home exportado com sucesso!");
    } catch (e) {
      console.error(e);
      showFeedback("Erro ao exportar backup.");
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const ok = Storage.importAllData(parsed);
        if (ok) {
          soundEffects.playSuccessTone();
          showFeedback("✅ Backup restaurado com sucesso! Os dados foram sincronizados.");
        } else {
          showFeedback("Arquivo de backup inválido.");
        }
      } catch (err) {
        console.error(err);
        showFeedback("Erro ao ler o arquivo JSON de backup.");
      }
    };
    reader.readAsText(file);
  };

  const handleShareFamilySummary = async () => {
    const events = Storage.getEvents();
    const tasks = Storage.getTasks();
    const shopping = Storage.getShopping();
    const todayISO = new Date().toISOString().split("T")[0];

    const todayEvents = events.filter((e) => e.date === todayISO);
    const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 5);
    const pendingShopping = shopping.filter((s) => !s.completed).slice(0, 8);

    let summaryText = `🏠 *RESUMO DO DIA • ALLDAY HOME*\n📅 _${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}_\n\n`;

    summaryText += `*📅 COMPROMISSOS DE HOJE:*\n`;
    if (todayEvents.length === 0) {
      summaryText += `_Nenhum evento agendado para hoje._\n`;
    } else {
      todayEvents.forEach((e) => {
        summaryText += `• ${e.time} - ${e.title} (${e.member})\n`;
      });
    }

    summaryText += `\n*🛒 COMPRAS PENDENTES (${pendingShopping.length}):*\n`;
    if (pendingShopping.length === 0) {
      summaryText += `_Tudo comprado!_\n`;
    } else {
      pendingShopping.forEach((s) => {
        summaryText += `• ${s.name}${s.quantity ? ` (${s.quantity})` : ""}\n`;
      });
    }

    summaryText += `\n*✅ TAREFAS PRINCIPAIS:*\n`;
    if (pendingTasks.length === 0) {
      summaryText += `_Nenhuma tarefa pendente!_\n`;
    } else {
      pendingTasks.forEach((t) => {
        summaryText += `• ${t.title} [${t.assignee}]\n`;
      });
    }

    summaryText += `\n_Enviado pelo ALLDAY Home da família_ ✨`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
        soundEffects.playSuccessTone();
        showFeedback("📋 Resumo copiado! Cole no WhatsApp da família.");
      } else {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`;
        window.open(url, "_blank");
        showFeedback("Enviando via WhatsApp...");
      }
    } catch (e) {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`;
      window.open(url, "_blank");
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Tem certeza que deseja restaurar os dados do ALLDAY Home para o estado inicial da família?"
      )
    ) {
      onResetFactoryData();
      soundEffects.playSuccessTone();
      alert("✅ Dados do ALLDAY Home restaurados com sucesso!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 text-slate-300 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Configurações do Painel</h2>
            <p className="text-xs text-slate-400">
              Ajustes de exibição do computador da cozinha (LG All-In-One), perfis e dados
            </p>
          </div>
        </div>
      </div>

      {/* Family Profiles Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <User className="w-4 h-4 text-amber-400" />
          <span>Membros da Família</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm ${m.avatarColor}`}
              >
                {m.initials}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{m.name}</p>
                <p className="text-xs text-slate-400">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kitchen Display & Kiosk Timeout */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Monitor className="w-4 h-4 text-amber-400" />
          <span>Modo Kiosk & Porta-Retrato de Cozinha</span>
        </h3>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
            <div>
              <p className="font-semibold text-white">
                Tempo de Inatividade para Entrar no Porta-Retrato
              </p>
              <p className="text-xs text-slate-400">
                Ativa automaticamente o slideshow quando a tela não for tocada
              </p>
            </div>

            <select
              value={idleTimeoutMinutes}
              onChange={(e) => onChangeIdleTimeout(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300 px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              <option value={1}>1 Minuto</option>
              <option value={2}>2 Minutos</option>
              <option value={5}>5 Minutos</option>
              <option value={10}>10 Minutos</option>
              <option value={0}>Nunca (Desativar)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
            <div>
              <p className="font-semibold text-white">Alta Legibilidade para Cozinha (2-3 metros)</p>
              <p className="text-xs text-slate-400">
                Aumenta o contraste visual e tipografia para facilitar a leitura distante
              </p>
            </div>

            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Backup, Export & WhatsApp Sharing Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              Backup, Exportação e Compartilhamento
            </h3>
          </div>
          {statusFeedback && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-in fade-in">
              {statusFeedback}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Você pode salvar um arquivo de segurança de todos os dados do painel ou enviar um resumo diário da casa direto para o WhatsApp do casal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportBackup}
            className="p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-2xl text-left transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <Download className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-bold text-slate-500">.JSON</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Exportar Backup Completo</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Baixa todas as listas, tarefas e agenda
              </p>
            </div>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-2xl text-left transition cursor-pointer flex flex-col justify-between group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <div className="flex items-center justify-between mb-2">
              <Upload className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-bold text-slate-500">RESTAURAR</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Restaurar de Arquivo</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Importa um backup salvo anteriormente
              </p>
            </div>
          </button>

          {/* Share Family Summary via WhatsApp */}
          <button
            onClick={handleShareFamilySummary}
            className="p-3.5 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 hover:border-emerald-500 rounded-2xl text-left transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <Share2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-bold text-emerald-400">WHATSAPP</span>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-200">Compartilhar Resumo do Dia</p>
              <p className="text-[10px] text-emerald-400/80 mt-0.5">
                Copia compromissos e tarefas para o casal
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-lg space-y-3">
        <h3 className="font-bold text-red-400 text-base flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Dados e Restauração</span>
        </h3>

        <p className="text-xs text-slate-400">
          Você pode restaurar todos os compromissos, tarefas e listas para os dados de exemplo da família do Thiago a qualquer momento.
        </p>

        <button
          onClick={handleReset}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restaurar Dados Iniciais da Família</span>
        </button>
      </div>
    </div>
  );
};
