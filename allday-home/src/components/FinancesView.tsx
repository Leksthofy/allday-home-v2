import React, { useState } from "react";
import { DollarSign, Plus, CheckCircle2, AlertCircle, Trash2, X } from "lucide-react";
import { BillItem } from "../types";

interface FinancesViewProps {
  bills: BillItem[];
  onTogglePaid: (id: string) => void;
  onAddBill: (bill: Omit<BillItem, "id">) => void;
  onDeleteBill: (id: string) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  bills = [],
  onTogglePaid,
  onAddBill,
  onDeleteBill,
}) => {
  const safeBills = bills || [];
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState<
    "Moradia" | "Serviços" | "Educação" | "Saúde" | "Outros"
  >("Serviços");
  const [autoDebit, setAutoDebit] = useState(false);

  const totalAmount = safeBills.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalPaid = safeBills.filter((b) => b.paid).reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalPending = totalAmount - totalPaid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    onAddBill({
      title,
      amount: parseFloat(amount),
      dueDate,
      paid: false,
      category,
      autoDebit,
    });

    setTitle("");
    setAmount("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Controle Financeiro da Casa</span>
            </div>
            <h2 className="text-xl font-bold text-white">Boletos & Contas do Mês</h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Conta / Boleto</span>
          </button>
        </div>

        {/* Financial Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Total de Contas</span>
            <p className="text-xl font-black text-white mt-1">
              R$ {totalAmount.toFixed(2)}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Contas Pagas</span>
            <p className="text-xl font-black text-emerald-400 mt-1">
              R$ {totalPaid.toFixed(2)}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">A Pagar / Pendentes</span>
            <p className="text-xl font-black text-amber-400 mt-1">
              R$ {totalPending.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Bill List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bills.map((bill) => (
          <div
            key={bill.id}
            onClick={() => onTogglePaid(bill.id)}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
              bill.paid
                ? "bg-slate-950/40 border-slate-800/40 opacity-60"
                : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={bill.paid}
                onChange={() => onTogglePaid(bill.id)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />

              <div>
                <p
                  className={`text-sm font-semibold ${
                    bill.paid ? "line-through text-slate-500" : "text-slate-100"
                  }`}
                >
                  {bill.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span>Vencimento: {bill.dueDate}</span>
                  {bill.autoDebit && (
                    <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.2 rounded">
                      Débito Auto
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-base font-black font-mono text-emerald-400">
                R$ {bill.amount.toFixed(2)}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBill(bill.id);
                }}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Adicionar Nova Conta / Boleto</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nome da Conta *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Conta de Luz / Escola Zoe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="250.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  >
                    <option value="Moradia">Moradia</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Educação">Educação</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="autoDebitCheck"
                    checked={autoDebit}
                    onChange={(e) => setAutoDebit(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="autoDebitCheck" className="text-xs text-slate-300 cursor-pointer">
                    Débito Automático
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
