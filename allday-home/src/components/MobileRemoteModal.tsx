import React, { useState, useEffect } from "react";
import {
  Smartphone,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  X,
  Radio,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight
} from "lucide-react";
import QRCode from "qrcode";
import { remoteClient, ConnectionStatus } from "../lib/remoteClient";

interface MobileRemoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRemoteDirectly?: () => void;
}

export function MobileRemoteModal({
  isOpen,
  onClose,
  onOpenRemoteDirectly,
}: MobileRemoteModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [connectedCount, setConnectedCount] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", "remote");
      const finalUrl = url.toString();
      setRemoteUrl(finalUrl);

      QRCode.toDataURL(finalUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((urlData) => setQrDataUrl(urlData))
        .catch((err) => console.error("Erro ao gerar QR Code:", err));
    }

    const unsub = remoteClient.onStatusChange((status, count) => {
      setConnectionStatus(status);
      setConnectedCount(count);
    });

    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard && remoteUrl) {
      navigator.clipboard.writeText(remoteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      id="mobile-remote-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Controle pelo Celular
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronização em Tempo Real
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Use seu smartphone como controle remoto para a tela da cozinha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* QR Code and Instructions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* QR Card */}
            <div className="flex flex-col items-center justify-center p-5 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <div className="relative p-3 bg-white rounded-2xl shadow-lg">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Controle Remoto"
                    className="w-48 h-48 rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400">
                    <QrCode className="w-12 h-12 animate-pulse text-slate-400" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 p-1.5 bg-amber-500 text-slate-950 rounded-lg shadow font-bold text-[10px] flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  ESCANEIE
                </div>
              </div>
              <p className="text-[12px] text-slate-400 mt-4 text-center font-medium">
                Aponte a câmera do seu celular (iPhone ou Android) para conectar
              </p>
            </div>

            {/* Steps & Features */}
            <div className="space-y-3.5">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                O que você pode fazer no celular:
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-slate-100">Trocar abas da tela:</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Mude para Compras, Agenda, Fotos ou Tarefas com 1 toque no celular.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-slate-100">Adicionar itens rápido:</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Coloque itens no carrinho de compras ou compromissos na agenda direto do sofá.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-slate-100">Voz e IA Gemini no bolso:</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Fale no microfone do celular e a tela da cozinha organiza tudo na hora!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Link Section */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Link direto do controle:
              </span>
              <span className="text-[11px] text-slate-400">
                {connectedCount > 1
                  ? `🟢 ${connectedCount} dispositivo(s) conectado(s)`
                  : "⚪ Aguardando conexão..."}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={remoteUrl}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Sem necessidade de instalar app na loja (PWA Web App)</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRemoteDirectly && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRemoteDirectly();
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
              >
                Testar Modo Celular Aqui
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
