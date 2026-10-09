import React, { useState } from "react";
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  Filter,
  Sparkles,
  RefreshCw,
  X,
  User,
  Download,
  Share2,
  Check,
  MessageCircle,
} from "lucide-react";
import { ShoppingItem, FamilyMember } from "../types";

interface ShoppingViewProps {
  shopping: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, "id">) => void;
  onDeleteItem: (id: string) => void;
  onClearCompleted: () => void;
}

export const ShoppingView: React.FC<ShoppingViewProps> = ({
  shopping = [],
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onClearCompleted,
}) => {
  const safeShopping = shopping || [];
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [newItemName, setNewItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState<
    "Supermercado" | "Farmácia" | "Feira" | "Casa" | "Outros"
  >("Supermercado");
  const [addedBy, setAddedBy] = useState<FamilyMember>("Thiago");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // AI Shopping Assistant State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestedItems, setAiSuggestedItems] = useState<
    { name: string; category: string }[]
  >([]);

  const handleRequestAiShopping = async (promptToUse?: string) => {
    const finalPrompt = (promptToUse || aiPrompt).trim();
    if (!finalPrompt) return;

    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/ai/suggest-shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setAiSuggestedItems(data.items);
        }
      }
    } catch (e) {
      console.error("Falha ao sugerir com IA:", e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddAllAiItems = () => {
    if (!aiSuggestedItems.length) return;
    aiSuggestedItems.forEach((item) => {
      onAddItem({
        name: item.name,
        category: (item.category as any) || "Supermercado",
        completed: false,
        addedBy: "Voz Cozinha",
      });
    });
    showFeedback(`✨ ${aiSuggestedItems.length} itens adicionados à lista com IA!`);
    setIsAiModalOpen(false);
    setAiSuggestedItems([]);
    setAiPrompt("");
  };

  const categories = ["Todas", "Supermercado", "Farmácia", "Feira", "Casa", "Outros"];

  const filteredItems = safeShopping.filter((item) => {
    if (selectedCategory !== "Todas" && item.category !== selectedCategory) return false;
    return true;
  });

  const completedCount = safeShopping.filter((s) => s.completed).length;
  const pendingCount = safeShopping.filter((s) => !s.completed).length;
  const progressPercent = safeShopping.length === 0 ? 0 : Math.round((completedCount / safeShopping.length) * 100);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Helper to format text for file export or WhatsApp
  const generateFormattedList = (whatsappFormat = false): string => {
    const pending = safeShopping.filter((s) => !s.completed);
    const nowStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const categoryOrder: ShoppingItem["category"][] = [
      "Supermercado",
      "Farmácia",
      "Feira",
      "Casa",
      "Outros",
    ];

    if (whatsappFormat) {
      let text = `🛒 *LISTA DE COMPRAS - ALLDAY HOME*\n📅 _Atualizado em: ${nowStr}_\n\n`;

      categoryOrder.forEach((cat) => {
        const catItems = pending.filter((i) => i.category === cat);
        if (catItems.length > 0) {
          text += `*🔹 ${cat.toUpperCase()}*\n`;
          catItems.forEach((item) => {
            const qty = item.quantity ? ` (${item.quantity})` : "";
            text += `[ ] ${item.name}${qty} _[${item.addedBy}]_\n`;
          });
          text += `\n`;
        }
      });

      if (pending.length === 0) {
        text += `_Tudo comprado! Nenhum item pendente no momento._ 🎉\n\n`;
      } else {
        text += `*Total de itens a comprar:* ${pending.length}\n`;
      }
      text += `\n_Enviado pelo ALLDAY Home Kitchen Hub_ ✨`;
      return text;
    } else {
      let text = `=========================================\n`;
      text += `🛒 LISTA DE COMPRAS - ALLDAY HOME\n`;
      text += `📅 Gerado em: ${nowStr}\n`;
      text += `=========================================\n\n`;

      categoryOrder.forEach((cat) => {
        const catItems = pending.filter((i) => i.category === cat);
        if (catItems.length > 0) {
          text += `[ ${cat.toUpperCase()} ]\n`;
          catItems.forEach((item) => {
            const qty = item.quantity ? ` (${item.quantity})` : "";
            text += `[ ] ${item.name}${qty} - Adicionado por: ${item.addedBy}\n`;
          });
          text += `\n`;
        }
      });

      if (pending.length === 0) {
        text += `Nenhum item pendente para comprar!\n\n`;
      } else {
        text += `-----------------------------------------\n`;
        text += `Total de itens pendentes: ${pending.length}\n`;
      }
      text += `=========================================\n`;
      text += `ALLDAY Home • Sistema Inteligente da Casa\n`;
      return text;
    }
  };

  // Generate printable PDF dialog or offline document
  const handlePrintOrDownloadPdf = () => {
    const pending = safeShopping.filter((s) => !s.completed);
    const nowStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const categoryOrder: ShoppingItem["category"][] = [
      "Supermercado",
      "Farmácia",
      "Feira",
      "Casa",
      "Outros",
    ];

    let itemsHtml = "";
    categoryOrder.forEach((cat) => {
      const catItems = pending.filter((i) => i.category === cat);
      if (catItems.length > 0) {
        itemsHtml += `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 8px;">
              📁 ${cat} (${catItems.length})
            </h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${catItems
                .map(
                  (item) => `
                <li style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #475569; border-radius: 3px;"></span>
                    <span style="font-weight: 600; color: #0f172a;">${item.name}</span>
                    ${item.quantity ? `<span style="font-size: 11px; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; font-weight: 500;">${item.quantity}</span>` : ""}
                  </div>
                  <span style="font-size: 11px; color: #64748b; font-weight: 500;">${item.addedBy}</span>
                </li>`
                )
                .join("")}
            </ul>
          </div>
        `;
      }
    });

    const fullHtml = `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Lista de Compras - ALLDAY Home</title>
        <style>
          @page { margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; background: #fff; }
          .header { border-bottom: 3px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          h1 { font-size: 20px; margin: 0 0 4px 0; font-weight: 900; color: #0f172a; }
          .meta { font-size: 12px; color: #64748b; }
          .badge { font-weight: 800; font-size: 12px; background: #0f172a; color: #fff; padding: 4px 10px; border-radius: 6px; }
          .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #475569;">💡 Dica: Salve como PDF para levar no celular ou imprima em papel.</span>
          <button onclick="window.print()" style="background: #0f172a; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">Imprimir / Salvar PDF</button>
        </div>
        <div class="header">
          <div>
            <h1>🛒 LISTA DE COMPRAS • ALLDAY HOME</h1>
            <div class="meta">Gerado em: ${nowStr}</div>
          </div>
          <div class="badge">
            ${pending.length} ITENS PENDENTES
          </div>
        </div>
        <div>
          ${itemsHtml || '<p style="text-align: center; color: #64748b; padding: 30px; font-size: 14px;">🎉 Tudo comprado! Nenhum item pendente no momento.</p>'}
        </div>
        <div class="footer">
          ALLDAY Home Kitchen Hub • Thiago & Erika & Zoe • Disponível para consulta offline no celular
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
      </html>`;

    try {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(fullHtml);
        printWindow.document.close();
        showFeedback("📄 Janela de Salvar PDF / Impressão aberta!");
      } else {
        // Fallback: download as file
        const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lista-de-compras-allday-${new Date().toISOString().split("T")[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showFeedback("📥 Arquivo HTML da lista baixado para uso offline!");
      }
    } catch (e) {
      // Fallback
      handleDownloadTxt();
    }
  };

  // Download .txt file
  const handleDownloadTxt = () => {
    const content = generateFormattedList(false);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lista-de-compras-allday-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback("📥 Lista baixada em arquivo .txt com sucesso!");
  };

  // Copy for WhatsApp
  const handleCopyForWhatsApp = async () => {
    const text = generateFormattedList(true);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showFeedback("✅ Lista copiada! Cole no WhatsApp de quem for às compras.");
      } else {
        showFeedback("Lista gerada para o WhatsApp.");
      }
    } catch (e) {
      showFeedback("Erro ao copiar. Tente baixar o arquivo.");
    }
  };

  // Direct WhatsApp Web Link
  const getWhatsAppShareUrl = (): string => {
    const text = generateFormattedList(true);
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem({
      name: newItemName.trim(),
      category,
      completed: false,
      addedBy,
      quantity: quantity.trim() || undefined,
    });

    setNewItemName("");
    setQuantity("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Quick Add Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Lista de Compras Compartilhada</span>
            </div>
            <h2 className="text-xl font-bold text-white">Supermercado & Casa</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400">Progresso</span>
              <p className="text-sm font-bold text-emerald-400">
                {completedCount} de {shopping.length} comprados ({progressPercent}%)
              </p>
            </div>

            {/* Export & Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setAiSuggestedItems([]);
                  setIsAiModalOpen(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95"
                title="Decompor receitas ou sugestões complexas com IA Gemini"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>IA Compras</span>
              </button>

              <button
                onClick={handlePrintOrDownloadPdf}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-600/25"
                title="Salvar como PDF no celular ou imprimir checklist limpo para levar ao supermercado"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Salvar / Baixar PDF</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                title="Baixar lista em arquivo de texto formatado"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Arquivo (.txt)</span>
              </button>

              <button
                onClick={handleCopyForWhatsApp}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                title="Copiar lista com formatação pronta para colar no WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copiar p/ WhatsApp</span>
              </button>

              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shadow-emerald-600/20"
                title="Abrir WhatsApp com a lista pronta para enviar"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Enviar WhatsApp</span>
              </a>

              {completedCount > 0 && (
                <button
                  onClick={onClearCompleted}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  title="Remover itens marcados como comprados"
                >
                  Limpar Concluídos
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300 animate-in fade-in duration-200">
            <span className="font-semibold">{actionFeedback}</span>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-emerald-400 hover:text-emerald-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-6 border border-slate-800">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleQuickAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-950 p-2 border border-slate-800 rounded-2xl">
          <input
            type="text"
            required
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Adicionar item (ex: Leite, Café, Fralda)..."
            className="sm:col-span-5 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />

          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qtd (ex: 2L, 1 un)"
            className="sm:col-span-2 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white rounded-xl outline-none"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="sm:col-span-2 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 rounded-xl outline-none"
          >
            <option value="Supermercado">Supermercado</option>
            <option value="Farmácia">Farmácia</option>
            <option value="Feira">Feira</option>
            <option value="Casa">Casa</option>
            <option value="Outros">Outros</option>
          </select>

          <select
            value={addedBy}
            onChange={(e) => setAddedBy(e.target.value as FamilyMember)}
            className="sm:col-span-2 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 rounded-xl outline-none"
          >
            <option value="Thiago">Thiago</option>
            <option value="Erika">Erika</option>
            <option value="Zoe">Zoe</option>
          </select>

          <button
            type="submit"
            className="sm:col-span-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">
            Nenhum item encontrado nesta categoria.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                item.completed
                  ? "bg-slate-950/40 border-slate-800/40 opacity-60"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => onToggleItem(item.id)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />

                <div>
                  <p
                    className={`text-sm font-semibold ${
                      item.completed ? "line-through text-slate-500" : "text-slate-100"
                    }`}
                  >
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    {item.quantity && <span className="font-mono text-emerald-400">{item.quantity}</span>}
                    <span>•</span>
                    <span>Adicionado por {item.addedBy}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-semibold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-lg text-slate-400">
                  {item.category}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI SHOPPING ASSISTANT MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Assistente de Compras IA Gemini
                  </h3>
                  <p className="text-xs text-slate-400">
                    Decomponha receitas ou listas em itens organizados por setor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">Ideias Rápidas:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Feijoada completa de domingo",
                  "Café da manhã saudável e frutas da Zoe",
                  "Itens básicos de limpeza e higiene da casa",
                  "Ingredientes para strogonoff e salada",
                ].map((idea, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAiPrompt(idea);
                      handleRequestAiShopping(idea);
                    }}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">
                  O que você quer comprar ou cozinhar?
                </label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Ingredientes para churrasco com amigos no sábado, carvão, pão de alho e bebidas"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <button
                onClick={() => handleRequestAiShopping()}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingAi ? "animate-spin" : ""}`} />
                <span>{isGeneratingAi ? "Analisando com Gemini..." : "Decompor em Itens com IA"}</span>
              </button>
            </div>

            {/* AI Results */}
            {aiSuggestedItems.length > 0 && (
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {aiSuggestedItems.length} Itens Encontrados:
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {aiSuggestedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-slate-800 text-xs"
                    >
                      <span className="text-slate-200 font-medium">{item.name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddAllAiItems}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Adicionar Todos ({aiSuggestedItems.length}) à Lista</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
