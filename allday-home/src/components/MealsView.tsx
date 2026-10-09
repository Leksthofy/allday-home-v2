import React, { useState } from "react";
import {
  Utensils,
  ShoppingBag,
  Edit3,
  ArrowRight,
  CheckCircle2,
  X,
  Plus,
  User,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Sparkles,
  Bot,
} from "lucide-react";
import { MealPlanItem } from "../types";

interface MealsViewProps {
  meals: MealPlanItem[];
  onUpdateMeal: (meal: MealPlanItem) => void;
  onAddShoppingItems: (items: string[]) => void;
}

export const MealsView: React.FC<MealsViewProps> = ({
  meals = [],
  onUpdateMeal,
  onAddShoppingItems,
}) => {
  const safeMeals = meals || [];
  // Extract existing profiles from meals or default to ["Família", "Zoe"]
  const initialProfiles = Array.from(
    new Set(safeMeals.map((m) => m.profile || "Família"))
  );
  if (!initialProfiles.includes("Família")) initialProfiles.unshift("Família");
  if (!initialProfiles.includes("Zoe")) initialProfiles.push("Zoe");

  const [profiles, setProfiles] = useState<string[]>(initialProfiles);
  const [selectedProfile, setSelectedProfile] = useState<string>("Família");
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const [editingMeal, setEditingMeal] = useState<MealPlanItem | null>(null);
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [snack, setSnack] = useState("");
  const [dinner, setDinner] = useState("");
  const [ingredientsStr, setIngredientsStr] = useState("");

  // AI Meal Planner State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTargetDay, setAiTargetDay] = useState<MealPlanItem["dayOfWeek"]>("Segunda");
  const [aiPreference, setAiPreference] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    breakfast: string;
    lunch: string;
    snack: string;
    dinner: string;
    ingredientsNeeded: string[];
    nutritionalHighlights: string;
  } | null>(null);

  const handleRequestAiMeal = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/ai/suggest-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: selectedProfile,
          dayOfWeek: aiTargetDay,
          preference: aiPreference,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestion(data);
      }
    } catch (err) {
      console.error("Erro ao sugerir refeição:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyAiMeal = () => {
    if (!aiSuggestion) return;
    const existing = safeMeals.find(
      (m) =>
        m.dayOfWeek === aiTargetDay &&
        (m.profile === selectedProfile || (!m.profile && selectedProfile === "Família"))
    );
    if (existing) {
      onUpdateMeal({
        ...existing,
        profile: selectedProfile,
        breakfast: aiSuggestion.breakfast,
        lunch: aiSuggestion.lunch,
        snack: aiSuggestion.snack,
        dinner: aiSuggestion.dinner,
        ingredientsNeeded: aiSuggestion.ingredientsNeeded,
      });
    }
    if (aiSuggestion.ingredientsNeeded && aiSuggestion.ingredientsNeeded.length > 0) {
      onAddShoppingItems(aiSuggestion.ingredientsNeeded);
    }
    setIsAiModalOpen(false);
    setAiSuggestion(null);
  };

  const handleEditClick = (meal: MealPlanItem) => {
    setEditingMeal(meal);
    setBreakfast(meal.breakfast || "");
    setLunch(meal.lunch);
    setSnack(meal.snack || "");
    setDinner(meal.dinner);
    setIngredientsStr((meal.ingredientsNeeded || []).join(", "));
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal) return;

    const ingList = ingredientsStr
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    onUpdateMeal({
      ...editingMeal,
      profile: selectedProfile,
      breakfast,
      lunch,
      snack,
      dinner,
      ingredientsNeeded: ingList,
    });

    setEditingMeal(null);
  };

  const handleTransferToShopping = (meal: MealPlanItem) => {
    if (!meal.ingredientsNeeded || meal.ingredientsNeeded.length === 0) {
      alert("Nenhum ingrediente listado para este dia.");
      return;
    }

    onAddShoppingItems(meal.ingredientsNeeded);
    alert(`✅ Ingredientes de ${meal.dayOfWeek} (${selectedProfile}) adicionados à Lista de Compras!`);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newProfileName.trim();
    if (!clean) return;

    if (!profiles.includes(clean)) {
      setProfiles([...profiles, clean]);
      setSelectedProfile(clean);

      // Seed standard 7 days for this new profile
      const daysOfWeek: MealPlanItem["dayOfWeek"][] = [
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
        "Domingo",
      ];
      daysOfWeek.forEach((day, index) => {
        onUpdateMeal({
          id: `m_${clean.toLowerCase().replace(/\s+/g, "_")}_${index}`,
          profile: clean,
          dayOfWeek: day,
          lunch: "A definir almoço",
          dinner: "A definir jantar",
          breakfast: "",
          snack: "",
          ingredientsNeeded: [],
        });
      });
    } else {
      setSelectedProfile(clean);
    }

    setNewProfileName("");
    setIsAddingProfile(false);
  };

  // Filter meals by selected profile
  const filteredMeals = safeMeals.filter((m) => {
    if (selectedProfile === "Família") {
      return m.profile === "Família" || !m.profile;
    }
    return m.profile === selectedProfile;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Utensils className="w-4 h-4" />
            <span>Planejamento Alimentar Semanal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Cardápios da Casa & Dietas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie cardápios separados para a Família, Zoe e membros da casa.
          </p>
        </div>

        {/* Profile Tabs + Add Profile Button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {profiles.map((prof) => {
            const isSelected = selectedProfile === prof;
            return (
              <button
                key={prof}
                onClick={() => setSelectedProfile(prof)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span>
                  {prof === "Família" ? "👨‍👩‍👧" : prof === "Zoe" ? "👶" : "👤"}
                </span>
                <span>Cardápio {prof}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              setAiSuggestion(null);
              setIsAiModalOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            title="Sugerir cardápio saudável com IA Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>Sugerir com IA</span>
          </button>

          <button
            onClick={() => setIsAddingProfile(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
            title="Criar novo cardápio para outro membro"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Cardápio</span>
          </button>
        </div>
      </div>

      {/* Add Profile Modal */}
      {isAddingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white">
                Adicionar Novo Cardápio
              </h3>
              <button
                onClick={() => setIsAddingProfile(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-semibold">
                  Nome do Membro ou Tipo de Cardápio:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Thiago (Dieta), Erika, Bebê..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProfile(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Criar Cardápio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMeals.map((meal) => (
          <div
            key={meal.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-amber-400">
                    {meal.dayOfWeek}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                    {selectedProfile}
                  </span>
                </div>

                <button
                  onClick={() => handleEditClick(meal)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Editar</span>
                </button>
              </div>

              {/* Meals List */}
              <div className="space-y-2.5 mb-4">
                {meal.breakfast && (
                  <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      <Coffee className="w-3 h-3 text-amber-400" />
                      Café da Manhã
                    </span>
                    <p className="text-xs font-semibold text-slate-200 mt-0.5">
                      {meal.breakfast}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" />
                    Almoço
                  </span>
                  <p className="text-sm font-semibold text-slate-100 mt-0.5">
                    {meal.lunch}
                  </p>
                </div>

                {meal.snack && (
                  <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider flex items-center gap-1">
                      <Cookie className="w-3 h-3 text-orange-400" />
                      Lanche da Tarde
                    </span>
                    <p className="text-xs font-semibold text-slate-200 mt-0.5">
                      {meal.snack}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <Moon className="w-3 h-3 text-purple-400" />
                    Jantar
                  </span>
                  <p className="text-sm font-semibold text-slate-100 mt-0.5">
                    {meal.dinner}
                  </p>
                </div>
              </div>

              {/* Ingredients */}
              {meal.ingredientsNeeded && meal.ingredientsNeeded.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Ingredientes Necessários:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {meal.ingredientsNeeded.map((ing, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-lg"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Transfer to Shopping Button */}
            <button
              onClick={() => handleTransferToShopping(meal)}
              className="w-full py-2.5 bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copiar Ingredientes para Compras</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit Meal Modal */}
      {editingMeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setEditingMeal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Editar Cardápio: {editingMeal.dayOfWeek}
            </h3>
            <p className="text-xs text-amber-400 font-semibold mb-4">
              Perfil: {selectedProfile}
            </p>

            <form onSubmit={handleSaveMeal} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  ☕ Café da Manhã (Opcional)
                </label>
                <input
                  type="text"
                  value={breakfast}
                  onChange={(e) => setBreakfast(e.target.value)}
                  placeholder="Ex: Frutas, pão na chapa e suco"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  ☀️ Almoço
                </label>
                <input
                  type="text"
                  required
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  🍪 Lanche da Tarde (Opcional)
                </label>
                <input
                  type="text"
                  value={snack}
                  onChange={(e) => setSnack(e.target.value)}
                  placeholder="Ex: Iogurte com aveia, biscoitinho"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  🌙 Jantar
                </label>
                <input
                  type="text"
                  required
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Ingredientes Necessários (Separados por vírgula)
                </label>
                <input
                  type="text"
                  value={ingredientsStr}
                  onChange={(e) => setIngredientsStr(e.target.value)}
                  placeholder="Ex: Frango, Arroz, Feijão, Tomate"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Salvar Cardápio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI MEAL SUGGESTER MODAL */}
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
                    Nutricionista & Chef IA Gemini
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sugestões saudáveis para {selectedProfile === "Zoe" ? "a Zoe (infantil)" : "a Família"}
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

            {/* Config Form */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">
                  Dia da Semana:
                </label>
                <select
                  value={aiTargetDay}
                  onChange={(e) => setAiTargetDay(e.target.value as MealPlanItem["dayOfWeek"])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none text-xs"
                >
                  {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">
                  Preferência, ingredientes na geladeira ou restrições (opcional):
                </label>
                <input
                  type="text"
                  value={aiPreference}
                  onChange={(e) => setAiPreference(e.target.value)}
                  placeholder={selectedProfile === "Zoe" ? "Ex: com cenoura e franguinho, sem lactose" : "Ex: refeição rápida, rica em proteínas, legumes"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <button
                onClick={handleRequestAiMeal}
                disabled={isGeneratingAi}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingAi ? "animate-spin" : ""}`} />
                <span>{isGeneratingAi ? "Criando Cardápio com Gemini..." : "Gerar Cardápio Nutritivo com IA"}</span>
              </button>
            </div>

            {/* AI Suggestion Result */}
            {aiSuggestion && (
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    Sugestão para {aiTargetDay}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block mb-0.5">☕ Café</span>
                    <p className="text-slate-200">{aiSuggestion.breakfast}</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block mb-0.5">☀️ Almoço</span>
                    <p className="text-slate-200">{aiSuggestion.lunch}</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block mb-0.5">🍪 Lanche</span>
                    <p className="text-slate-200">{aiSuggestion.snack}</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block mb-0.5">🌙 Jantar</span>
                    <p className="text-slate-200">{aiSuggestion.dinner}</p>
                  </div>
                </div>

                {aiSuggestion.nutritionalHighlights && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    💡 {aiSuggestion.nutritionalHighlights}
                  </p>
                )}

                {aiSuggestion.ingredientsNeeded?.length > 0 && (
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-slate-400 text-[10px] uppercase block mb-1">
                      🛒 Ingredientes ({aiSuggestion.ingredientsNeeded.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiSuggestion.ingredientsNeeded.map((ing, i) => (
                        <span key={i} className="bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] text-slate-300 border border-slate-700">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleApplyAiMeal}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aplicar ao Cardápio & Compras</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
