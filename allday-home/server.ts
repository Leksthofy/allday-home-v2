import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize Gemini AI client server-side
  let ai: GoogleGenAI | null = null;
  const getAi = () => {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in server environment");
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  };

  // Health Endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "ALLDAY Home", version: "1.0.0" });
  });

  // Weather API simulation / data endpoint
  app.get("/api/weather", (_req, res) => {
    res.json({
      location: "São Paulo, SP",
      temperature: 24,
      condition: "Sol com poucas nuvens",
      icon: "sun-cloud",
      high: 27,
      low: 18,
      humidity: 62,
      windSpeed: 12,
      rainChance: 15,
      uvIndex: 6,
      forecast: [
        { day: "Hoje", temp: 24, icon: "sun-cloud", text: "Poucas nuvens" },
        { day: "Sáb", temp: 26, icon: "sun", text: "Ensolarado" },
        { day: "Dom", temp: 22, icon: "rain", text: "Pancadas de chuva" },
        { day: "Seg", temp: 23, icon: "cloud", text: "Nublado" },
        { day: "Ter", temp: 25, icon: "sun", text: "Limpo" },
      ],
      hourly: [
        { time: "08:00", temp: 19, icon: "sun" },
        { time: "11:00", temp: 22, icon: "sun-cloud" },
        { time: "14:00", temp: 26, icon: "sun" },
        { time: "17:00", temp: 24, icon: "sun-cloud" },
        { time: "20:00", temp: 20, icon: "moon" },
      ]
    });
  });

  // Natural Language AI Processing for Voice/Text Quick Commands
  app.post("/api/ai/parse", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Campo 'text' é obrigatório." });
      }

      const client = getAi();
      const prompt = `Você é o assistente inteligente do ALLDAY Home, o painel da família do Thiago, Erika e Zoe.
Analise a seguinte instrução falada ou digitada em português e determine qual ação executar na casa.

Texto recebido: "${text}"

Responda ESTRITAMENTE em formato JSON seguindo este esquema:
{
  "intent": "add_shopping" | "add_calendar" | "add_task" | "add_meal" | "organize_routine" | "general_response",
  "summary": "Resumo amigável em 1 frase para ser exibido no painel em português",
  "data": {
    "shoppingItem": string ou null (ex: "Leite desnatado e pão de fôrma"),
    "shoppingCategory": "Supermercado" | "Farmácia" | "Feira" | "Casa" | "Outros" ou null,
    "eventTitle": string ou null (ex: "Reunião de negócios com João"),
    "eventDate": string YYYY-MM-DD ou null (se disser quarta/amanhã/hoje, calcule baseado na data atual ${new Date().toISOString().split('T')[0]}),
    "eventTime": string HH:mm ou null (ex: "14:00"),
    "eventMember": "Thiago" | "Erika" | "Zoe" | "Família" ou null,
    "taskTitle": string ou null (ex: "Trocar o filtro do ar condicionado"),
    "taskCategory": "Lembrete" | "Manutenção" | "Limpeza" | "Trabalho" | "Pessoal" ou null,
    "taskPriority": "low" | "medium" | "high" ou null,
    "mealDay": "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo" ou null,
    "mealType": "Almoço" | "Jantar" ou null,
    "mealName": string ou null,
    "routineAdvice": array de strings com sugestões de rotina se a intenção for 'organize_routine'
  }
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING },
              summary: { type: Type.STRING },
              data: {
                type: Type.OBJECT,
                properties: {
                  shoppingItem: { type: Type.STRING, nullable: true },
                  shoppingCategory: { type: Type.STRING, nullable: true },
                  eventTitle: { type: Type.STRING, nullable: true },
                  eventDate: { type: Type.STRING, nullable: true },
                  eventTime: { type: Type.STRING, nullable: true },
                  eventMember: { type: Type.STRING, nullable: true },
                  taskTitle: { type: Type.STRING, nullable: true },
                  taskCategory: { type: Type.STRING, nullable: true },
                  taskPriority: { type: Type.STRING, nullable: true },
                  mealDay: { type: Type.STRING, nullable: true },
                  mealType: { type: Type.STRING, nullable: true },
                  mealName: { type: Type.STRING, nullable: true },
                  routineAdvice: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    nullable: true,
                  },
                },
              },
            },
            required: ["intent", "summary", "data"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Erro na API AI Parse:", err);
      return res.status(500).json({
        error: "Falha ao processar com IA Gemini",
        details: err?.message || String(err),
      });
    }
  });

  // Dedicated Kitchen Hands-Free Voice Assistant Endpoint (ALLDAY / Jarvis)
  app.post("/api/ai/voice-assistant", async (req, res) => {
    try {
      const { text, context } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Campo 'text' é obrigatório." });
      }

      const client = getAi();
      const todayISO = new Date().toISOString().split("T")[0];

      const prompt = `Você é o ALLDAY Jarvis, o assistente inteligente residencial da família do Thiago, da Erika e da filhinha Zoe.
Você opera no computador monitor da cozinha da casa. O usuário acabou de falar com você por comando de voz.

Comando falado pelo usuário: "${text}"

Contexto real e atualizado da casa neste momento:
- Data de hoje: ${todayISO}
- Informações de contexto disponíveis:
${context ? JSON.stringify(context, null, 2) : "Sem dados extras"}

Suas responsabilidades:
1. Detectar o que o usuário quer fazer:
   - "add_shopping": Adicionar item à lista de compras (ex: "adicione feijão", "compra fralda da Zoe", "leite, pão e café").
   - "add_calendar": Agendar evento ou compromisso (ex: "reunião amanhã às 15h", "pediatra da Zoe na quinta").
   - "add_task": Criar tarefa (ex: "lembrete de pagar conta de luz", "trocar lâmpada da cozinha").
   - "add_meal": Registrar ou mudar cardápio (ex: "hoje no almoço vai ser lasanha").
   - "navigate": Navegar entre telas do painel (ex: "mostra a lista de compras", "abre o calendário", "vai pras tarefas", "tela inicial", "diário da Zoe", "cardápio").
   - "screensaver": Ativar ou desativar o porta-retrato / descanso de tela (ex: "ativa descanso de tela", "modo porta-retrato", "acorda tela").
   - "query_info": Pergunta sobre cardápio (ex: "qual o cardápio de hoje para a zoe", "o que tem pro almoço"), compromissos ("o que temos hoje?"), compras ("o que falta comprar?"), tarefas, remédios da Zoe, ou dúvidas gerais do dia a dia.
   - "general_chat": Saudações, agradecimentos ("obrigado ALLDAY", "bom dia"), piadas ou conversas rápidas.

2. Produzir "speechText":
   - O texto exato em português que você VAI FALAR EM VOZ ALTA através da caixa de som da cozinha.
   - Seja caloroso, direto, conciso e elegante (1 a 3 frases no máximo).
   - Exemplos:
     * Para adicionar compras: "Com certeza, Thiago! Adicionei feijão à sua lista de compras."
     * Para cardápio da Zoe: se o cardápio foi fornecido no contexto, diga o prato exato (ex: "Para a Zoe hoje no almoço temos purê de mandioquinha com carne desfiada e legumes."). Se não houver prato cadastrado hoje, responda amigavelmente informando isso e sugerindo cadastrar.
     * Para compromissos: "Hoje você tem reunião com cliente às 14 horas e natação da Zoe às 16 horas."
     * Para tela: "Abrindo a lista de compras na tela para você."

3. Produzir "summary": Um resumo curto (4 a 8 palavras) para exibir no balão visual da tela (ex: "Feijão adicionado às compras").

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "intent": "add_shopping" | "add_calendar" | "add_task" | "add_meal" | "navigate" | "screensaver" | "query_info" | "general_chat",
  "speechText": string,
  "summary": string,
  "targetTab": "dashboard" | "calendar" | "shopping" | "tasks" | "routines" | "meals" | "kids" | "photos" | "finances" | "jarvis" | null,
  "screensaverAction": "activate" | "deactivate" | null,
  "data": {
    "shoppingItem": string ou null,
    "shoppingCategory": "Supermercado" | "Farmácia" | "Feira" | "Casa" | "Outros" ou null,
    "eventTitle": string ou null,
    "eventDate": string YYYY-MM-DD ou null,
    "eventTime": string HH:mm ou null,
    "eventMember": "Thiago" | "Erika" | "Zoe" | "Família" ou null,
    "taskTitle": string ou null,
    "taskCategory": string ou null,
    "taskPriority": "low" | "medium" | "high" ou null,
    "mealDay": string ou null,
    "mealType": "Almoço" | "Jantar" | null,
    "mealName": string ou null
  }
}`;

      let parsed: any = null;
      try {
        const client = getAi();
        const todayISO = new Date().toISOString().split("T")[0];

        const prompt = `Você é o ALLDAY Jarvis, o assistente inteligente residencial da família do Thiago, da Erika e da filhinha Zoe.
Você opera no computador monitor da cozinha da casa. O usuário acabou de falar com você por comando de voz.

Comando falado pelo usuário: "${text}"

Contexto real e atualizado da casa neste momento:
- Data de hoje: ${todayISO}
- Informações de contexto disponíveis:
${context ? JSON.stringify(context, null, 2) : "Sem dados extras"}

Suas responsabilidades:
1. Detectar o que o usuário quer fazer:
   - "add_shopping": Adicionar item à lista de compras (ex: "adicione feijão", "compra fralda da Zoe", "leite, pão e café").
   - "add_calendar": Agendar evento ou compromisso (ex: "reunião amanhã às 15h", "pediatra da Zoe na quinta").
   - "add_task": Criar tarefa (ex: "lembrete de pagar conta de luz", "trocar lâmpada da cozinha").
   - "add_meal": Registrar ou mudar cardápio (ex: "hoje no almoço vai ser lasanha").
   - "navigate": Navegar entre telas do painel (ex: "mostra a lista de compras", "abre o calendário", "vai pras tarefas", "tela inicial", "diário da Zoe", "cardápio").
   - "screensaver": Ativar ou desativar o porta-retrato / descanso de tela (ex: "ativa descanso de tela", "modo porta-retrato", "acorda tela").
   - "query_info": Pergunta sobre cardápio (ex: "qual o cardápio de hoje para a zoe", "o que tem pro almoço"), compromissos ("o que temos hoje?"), compras ("o que falta comprar?"), tarefas, remédios da Zoe, ou dúvidas gerais do dia a dia.
   - "general_chat": Saudações, agradecimentos ("obrigado ALLDAY", "bom dia"), piadas ou conversas rápidas.

2. Produzir "speechText":
   - O texto exato em português que você VAI FALAR EM VOZ ALTA através da caixa de som da cozinha.
   - Seja caloroso, direto, conciso e elegante (1 a 3 frases no máximo).
   - Exemplos:
     * Para adicionar compras: "Com certeza, Thiago! Adicionei feijão à sua lista de compras."
     * Para cardápio da Zoe: se o cardápio foi fornecido no contexto, diga o prato exato (ex: "Para a Zoe hoje no almoço temos purê de mandioquinha com carne desfiada e legumes."). Se não houver prato cadastrado hoje, responda amigavelmente informando isso e sugerindo cadastrar.
     * Para compromissos: "Hoje você tem reunião com cliente às 14 horas e natação da Zoe às 16 horas."
     * Para tela: "Abrindo a lista de compras na tela para você."

3. Produzir "summary": Um resumo curto (4 a 8 palavras) para exibir no balão visual da tela (ex: "Feijão adicionado às compras").

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "intent": "add_shopping" | "add_calendar" | "add_task" | "add_meal" | "navigate" | "screensaver" | "query_info" | "general_chat",
  "speechText": string,
  "summary": string,
  "targetTab": "dashboard" | "calendar" | "shopping" | "tasks" | "routines" | "meals" | "kids" | "photos" | "finances" | "jarvis" | null,
  "screensaverAction": "activate" | "deactivate" | null,
  "data": {
    "shoppingItem": string ou null,
    "shoppingCategory": "Supermercado" | "Farmácia" | "Feira" | "Casa" | "Outros" ou null,
    "eventTitle": string ou null,
    "eventDate": string YYYY-MM-DD ou null,
    "eventTime": string HH:mm ou null,
    "eventMember": "Thiago" | "Erika" | "Zoe" | "Família" ou null,
    "taskTitle": string ou null,
    "taskCategory": string ou null,
    "taskPriority": "low" | "medium" | "high" ou null,
    "mealDay": string ou null,
    "mealType": "Almoço" | "Jantar" | null,
    "mealName": string ou null
  }
}`;

        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                intent: { type: Type.STRING },
                speechText: { type: Type.STRING },
                summary: { type: Type.STRING },
                targetTab: { type: Type.STRING, nullable: true },
                screensaverAction: { type: Type.STRING, nullable: true },
                data: {
                  type: Type.OBJECT,
                  properties: {
                    shoppingItem: { type: Type.STRING, nullable: true },
                    shoppingCategory: { type: Type.STRING, nullable: true },
                    eventTitle: { type: Type.STRING, nullable: true },
                    eventDate: { type: Type.STRING, nullable: true },
                    eventTime: { type: Type.STRING, nullable: true },
                    eventMember: { type: Type.STRING, nullable: true },
                    taskTitle: { type: Type.STRING, nullable: true },
                    taskCategory: { type: Type.STRING, nullable: true },
                    taskPriority: { type: Type.STRING, nullable: true },
                    mealDay: { type: Type.STRING, nullable: true },
                    mealType: { type: Type.STRING, nullable: true },
                    mealName: { type: Type.STRING, nullable: true },
                  },
                },
              },
              required: ["intent", "speechText", "summary", "data"],
            },
          },
        });

        parsed = JSON.parse(response.text || "{}");
      } catch (geminiError) {
        console.warn("Aviso: Gemini AI indisponível ou em fallback local:", (geminiError as any)?.message);
      }

      // If Gemini returned a valid result, return it
      if (parsed && parsed.intent && parsed.speechText) {
        return res.json(parsed);
      }

      // Intelligent Local Heuristic Fallback Engine
      const lower = text.toLowerCase().trim();

      // 1. Shopping Intent
      const shoppingMatch = lower.match(/(?:adicione|adicionar|coloque|colocar|bota|botar|comprar?|precisamos de|acrescente)\s+(.+?)(?:\s+(?:na|para a|à|no)\s+(?:lista|compras?|supermercado)|$)/i);
      if (shoppingMatch || lower.includes("lista de compras") || lower.includes("adicione") || lower.includes("comprar")) {
        let rawItem = shoppingMatch ? shoppingMatch[1] : text.replace(/(?:adicione|adicionar|coloque|comprar|na lista|de compras)/gi, "").trim();
        rawItem = rawItem.replace(/^(feijão|leite|pão|arroz|fralda|manteiga|café|ovos|fruta|carne)/i, "$1").trim();
        const cleanItem = rawItem.charAt(0).toUpperCase() + rawItem.slice(1);
        return res.json({
          intent: "add_shopping",
          speechText: `Com certeza! Adicionei ${cleanItem || "o item solicitado"} à lista de compras.`,
          summary: `${cleanItem || "Item"} adicionado às compras`,
          targetTab: "shopping",
          screensaverAction: null,
          data: {
            shoppingItem: cleanItem || "Item de Compras",
            shoppingCategory: "Supermercado",
            eventMember: "Voz Cozinha"
          }
        });
      }

      // 2. Zoe / Meals Query
      if (lower.includes("cardápio") || lower.includes("zoe") || lower.includes("almoço") || lower.includes("jantar") || lower.includes("refeição")) {
        const todayMeals = context?.meals || [];
        if (todayMeals.length > 0) {
          const mealList = todayMeals.map((m: any) => `${m.mealType || 'Refeição'}: ${m.name}`).join(". ");
          return res.json({
            intent: "query_info",
            speechText: `Para a Zoe hoje temos programado: ${mealList}.`,
            summary: "Cardápio de hoje da Zoe",
            targetTab: "meals",
            screensaverAction: null,
            data: {}
          });
        }
        return res.json({
          intent: "query_info",
          speechText: "Consultei o cardápio da Zoe para hoje: ainda não há pratos cadastrados para esta data. Deseja cadastrar agora?",
          summary: "Cardápio da Zoe consultado",
          targetTab: "meals",
          screensaverAction: null,
          data: {}
        });
      }

      // 3. Screen Saver
      if (lower.includes("descanso de tela") || lower.includes("porta retrato") || lower.includes("porta-retrato") || lower.includes("bloquear tela") || lower.includes("proteger tela")) {
        return res.json({
          intent: "screensaver",
          speechText: "Ativando o descanso de tela com fotos do Google Drive agora.",
          summary: "Descanso de tela ativado",
          targetTab: null,
          screensaverAction: "activate",
          data: {}
        });
      }

      // 4. Navigation
      if (lower.includes("abrir") || lower.includes("mostrar") || lower.includes("ir para") || lower.includes("tela")) {
        let target: string | null = null;
        let tabName = "tela";
        if (lower.includes("calendário") || lower.includes("agenda")) { target = "calendar"; tabName = "o calendário"; }
        else if (lower.includes("compra")) { target = "shopping"; tabName = "a lista de compras"; }
        else if (lower.includes("tarefa")) { target = "tasks"; tabName = "as tarefas"; }
        else if (lower.includes("refeição") || lower.includes("cardápio")) { target = "meals"; tabName = "o cardápio"; }
        else if (lower.includes("zoe") || lower.includes("diário") || lower.includes("filha")) { target = "kids"; tabName = "o diário da Zoe"; }
        else if (lower.includes("foto") || lower.includes("álbum")) { target = "photos"; tabName = "as fotos da família"; }
        else if (lower.includes("financeiro") || lower.includes("conta")) { target = "finances"; tabName = "as finanças"; }
        else if (lower.includes("início") || lower.includes("painel")) { target = "dashboard"; tabName = "o painel principal"; }

        if (target) {
          return res.json({
            intent: "navigate",
            speechText: `Abrindo ${tabName} para você na tela.`,
            summary: `Navegando para ${tabName}`,
            targetTab: target,
            screensaverAction: "deactivate",
            data: {}
          });
        }
      }

      // 5. Tasks / Reminders
      if (lower.includes("tarefa") || lower.includes("lembrete") || lower.includes("lembrar")) {
        const taskTitle = text.replace(/(?:lembrete de|lembrar de|adicionar tarefa|nova tarefa|jarvis|allday)/gi, "").trim();
        return res.json({
          intent: "add_task",
          speechText: `Anotado! Criei a tarefa: ${taskTitle || "Nova tarefa da casa"}.`,
          summary: `Tarefa criada: ${taskTitle || "Nova tarefa"}`,
          targetTab: "tasks",
          screensaverAction: null,
          data: {
            taskTitle: taskTitle || "Tarefa anotada por voz",
            taskCategory: "Casa",
            taskPriority: "medium"
          }
        });
      }

      // 6. General Greeting or Assistant info
      return res.json({
        intent: "general_chat",
        speechText: `Olá Thiago! Estou aqui na cozinha ouvindo seus comandos. Você pode me pedir para adicionar itens na lista de compras, consultar o cardápio da Zoe ou ver sua agenda.`,
        summary: "Jarvis pronto na cozinha",
        targetTab: null,
        screensaverAction: null,
        data: {}
      });
    } catch (err: any) {
      console.error("Erro crítico na API Voice Assistant:", err);
      return res.status(200).json({
        intent: "general_chat",
        speechText: "Comando recebido na cozinha. Estou pronto para ajudar!",
        summary: "ALLDAY Jarvis pronto",
        targetTab: null,
        screensaverAction: null,
        data: {},
      });
    }
  });

  // AI Endpoint: Personalized Daily Morning Briefing
  app.post("/api/ai/daily-briefing", async (req, res) => {
    try {
      const { events, tasks, reminders, bills, meals, weather, quoteOfDay } = req.body;
      const todayStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

      try {
        const client = getAi();
        const prompt = `Você é o Jarvis do ALLDAY Home, o assistente inteligente residencial da família do Thiago, da Erika e da filhinha Zoe.
Gere um briefing matinal falado para hoje (${todayStr}).
Seja amigável, acolhedor, profissional e motivador.

Dados de hoje:
- Clima: ${weather?.temperature ? `${weather.temperature}°C, ${weather.condition || weather.description}` : "Tempo ameno e agradável"}
- Compromissos: ${JSON.stringify(events || [])}
- Tarefas do dia: ${JSON.stringify(tasks || [])}
- Lembretes e Remédios: ${JSON.stringify(reminders || [])}
- Contas: ${JSON.stringify(bills || [])}
- Cardápio de hoje: ${JSON.stringify(meals || [])}
- Frase do dia: "${quoteOfDay || ""}"

Responda em formato JSON com o seguinte schema:
{
  "greeting": "Saudação personalizada calorosa (ex: Bom dia, Thiago e Erika!)",
  "speechText": "Texto completo fluido e elegante para ser falado em voz alta pelos alto-falantes (cerca de 4 a 6 frases cobrindo os destaques com carinho e clareza)",
  "highlight": "Destaque mais importante do dia em poucas palavras",
  "motivationalTip": "Uma dica inspiradora e carinhosa para o dia da família"
}`;

        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                greeting: { type: Type.STRING },
                speechText: { type: Type.STRING },
                highlight: { type: Type.STRING },
                motivationalTip: { type: Type.STRING },
              },
              required: ["greeting", "speechText", "highlight", "motivationalTip"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.speechText) {
          return res.json(parsed);
        }
      } catch (geminiErr) {
        console.warn("Briefing AI fallback:", (geminiErr as any)?.message);
      }

      // Local heuristic fallback
      const evCount = (events || []).length;
      const taskCount = (tasks || []).filter((t: any) => !t.completed).length;
      return res.json({
        greeting: "Bom dia, Thiago e Erika!",
        speechText: `Bom dia, família! Hoje é ${todayStr}. Temos ${evCount} compromisso(s) na agenda e ${taskCount} tarefa(s) prioritárias. Que o dia de vocês seja repleto de realizações, com muita saúde e alegria para a Zoe!`,
        highlight: evCount > 0 ? `${evCount} compromissos na agenda` : "Dia focado nas tarefas da casa",
        motivationalTip: "Cada momento em família constrói memórias inesquecíveis.",
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Falha ao gerar briefing", details: err?.message });
    }
  });

  // AI Endpoint: Intelligent Chef & Zoe Toddler Meal Planner
  app.post("/api/ai/suggest-meals", async (req, res) => {
    try {
      const { profile = "Família", dayOfWeek = "Segunda", preference = "" } = req.body;

      try {
        const client = getAi();
        const prompt = `Você é um chef e nutricionista familiar inteligente do ALLDAY Home.
Sugira um cardápio nutritivo, balanceado e saboroso para ${profile === "Zoe" ? "a filhinha pequena Zoe (alimentação infantil saudável, texturas adequadas, legumes, frutas e proteínas magras)" : "a família (Thiago e Erika)"}.
Dia da semana: ${dayOfWeek}.
${preference ? `Preferência ou ingredientes disponíveis: ${preference}` : ""}

Responda em formato JSON com o schema:
{
  "breakfast": "Café da manhã saudável",
  "lunch": "Almoço nutritivo e completo",
  "snack": "Lanche da tarde prático",
  "dinner": "Jantar leve e reconfortante",
  "ingredientsNeeded": ["lista", "de", "ingredientes", "para", "comprar"],
  "nutritionalHighlights": "Breve nota sobre os benefícios nutricionais desta combinação"
}`;

        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                breakfast: { type: Type.STRING },
                lunch: { type: Type.STRING },
                snack: { type: Type.STRING },
                dinner: { type: Type.STRING },
                ingredientsNeeded: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                nutritionalHighlights: { type: Type.STRING },
              },
              required: ["breakfast", "lunch", "snack", "dinner", "ingredientsNeeded", "nutritionalHighlights"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.lunch) {
          return res.json(parsed);
        }
      } catch (geminiErr) {
        console.warn("Suggest meals fallback:", (geminiErr as any)?.message);
      }

      // Local fallback
      if (profile === "Zoe") {
        return res.json({
          breakfast: "Papa de aveia quentinha com banana amassada e canela",
          lunch: "Purê de mandioquinha com carne moída magra, cenoura cozida e feijãozinho",
          snack: "Iogurte natural batido com morangos frescos picadinhos",
          dinner: "Sopa cremosa de legumes com franguinho desfiado e macarrão letrinha",
          ingredientsNeeded: ["Aveia em flocos", "Banana", "Mandioquinha", "Carne moída", "Cenoura", "Morangos", "Frango"],
          nutritionalHighlights: "Rico em ferro, carboidratos complexos e vitaminas essenciais para o desenvolvimento infantil."
        });
      }

      return res.json({
        breakfast: "Ovos mexidos com torradas integrais e café com leite",
        lunch: "Filé de frango grelhado com arroz integral, feijão preto e salada colorida",
        snack: "Mix de castanhas com maçã fatiada",
        dinner: "Omelete de forno com ricota, espinafre e tomatinhos",
        ingredientsNeeded: ["Ovos", "Pão integral", "Filé de frango", "Arroz integral", "Feijão preto", "Espinafre", "Ricota"],
        nutritionalHighlights: "Alta saciedade, rica em proteínas e fibras para manter a energia ao longo do dia."
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Falha ao sugerir refeições", details: err?.message });
    }
  });

  // AI Endpoint: Smart Shopping Assistant (Auto-categorization & recipe decomposition)
  app.post("/api/ai/suggest-shopping", async (req, res) => {
    try {
      const { prompt: userPrompt } = req.body;
      if (!userPrompt) {
        return res.status(400).json({ error: "Prompt é obrigatório" });
      }

      try {
        const client = getAi();
        const aiPrompt = `Você é o assistente de compras inteligente do ALLDAY Home.
O usuário pediu: "${userPrompt}".
Decomponha este pedido em itens individuais para a lista de compras da família, atribuindo a melhor categoria para cada um.

Categorias disponíveis: "Supermercado", "Feira", "Farmácia", "Casa", "Outros".

Responda em formato JSON:
{
  "items": [
    {
      "name": "Nome claro do item com quantidade sugerida se aplicável",
      "category": "Supermercado" | "Feira" | "Farmácia" | "Casa" | "Outros"
    }
  ],
  "friendlyMessage": "Mensagem curta de confirmação"
}`;

        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: aiPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING },
                    },
                    required: ["name", "category"],
                  },
                },
                friendlyMessage: { type: Type.STRING },
              },
              required: ["items", "friendlyMessage"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.items && Array.isArray(parsed.items)) {
          return res.json(parsed);
        }
      } catch (geminiErr) {
        console.warn("Smart shopping fallback:", (geminiErr as any)?.message);
      }

      // Simple fallback
      return res.json({
        items: [
          { name: userPrompt.charAt(0).toUpperCase() + userPrompt.slice(1), category: "Supermercado" }
        ],
        friendlyMessage: "Item adicionado com sucesso."
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Falha ao processar lista de compras", details: err?.message });
    }
  });

  // ==========================================
  // REALTIME REMOTE CONTROL & SYNC (SSE)
  // ==========================================
  interface SSEClient {
    id: string;
    device: "kiosk" | "mobile" | "unknown";
    res: express.Response;
  }

  let sseClients: SSEClient[] = [];
  let sharedState: any = null;

  function broadcastSSE(data: any, excludeId?: string) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach((client) => {
      if (client.id !== excludeId) {
        try {
          client.res.write(payload);
        } catch (e) {
          // Client disconnected
        }
      }
    });
  }

  // SSE Stream Endpoint
  app.get("/api/remote/events", (req, res) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const device = (req.query.device as string) === "mobile" ? "mobile" : (req.query.device as string) === "kiosk" ? "kiosk" : "unknown";

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const client: SSEClient = { id: clientId, device, res };
    sseClients.push(client);

    // Initial connection message
    res.write(
      `data: ${JSON.stringify({
        type: "CONNECTED",
        clientId,
        device,
        connectedDevices: sseClients.length,
        timestamp: Date.now(),
      })}\n\n`
    );

    // Notify other clients about connection count change
    broadcastSSE(
      {
        type: "DEVICE_PRESENCE",
        connectedDevices: sseClients.length,
        action: "joined",
        device,
        timestamp: Date.now(),
      },
      clientId
    );

    // Keep connection alive with heartbeat
    const interval = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: "HEARTBEAT", timestamp: Date.now() })}\n\n`);
      } catch (e) {
        clearInterval(interval);
      }
    }, 25000);

    req.on("close", () => {
      clearInterval(interval);
      sseClients = sseClients.filter((c) => c.id !== clientId);
      broadcastSSE({
        type: "DEVICE_PRESENCE",
        connectedDevices: sseClients.length,
        action: "left",
        device,
        timestamp: Date.now(),
      });
    });
  });

  // Send Remote Command from Phone or Panel
  app.post("/api/remote/command", (req, res) => {
    try {
      const { command, sender, payload, clientId } = req.body;
      if (!command) {
        return res.status(400).json({ error: "Campo 'command' é obrigatório" });
      }

      const eventPayload = {
        type: "REMOTE_COMMAND",
        command,
        payload,
        sender: sender || "Celular",
        clientId,
        timestamp: Date.now(),
      };

      // Broadcast command to all connected screens (and companion devices)
      broadcastSSE(eventPayload, clientId);

      return res.json({ success: true, deliveredTo: sseClients.length });
    } catch (e: any) {
      console.error("Erro ao enviar comando remoto:", e);
      return res.status(500).json({ error: "Falha ao despachar comando", details: e?.message });
    }
  });

  // Send Announcement / Banner to Screen
  app.post("/api/remote/announce", (req, res) => {
    try {
      const { message, sender, type = "info" } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Mensagem é obrigatória" });
      }

      const announcement = {
        type: "ANNOUNCEMENT",
        id: `ann_${Date.now()}`,
        message,
        sender: sender || "Celular",
        announcementType: type,
        timestamp: Date.now(),
      };

      broadcastSSE(announcement);
      return res.json({ success: true, announcement });
    } catch (e: any) {
      return res.status(500).json({ error: "Falha no envio de aviso", details: e?.message });
    }
  });

  // State Sync Endpoints (keeps mobile and monitor in sync across instances)
  app.get("/api/remote/state", (_req, res) => {
    return res.json({ state: sharedState, timestamp: Date.now() });
  });

  app.post("/api/remote/state", (req, res) => {
    const { state, sender, clientId } = req.body;
    if (state) {
      sharedState = { ...state, updatedAt: Date.now() };
      broadcastSSE(
        {
          type: "STATE_UPDATED",
          state: sharedState,
          sender: sender || "Dispositivo",
          timestamp: Date.now(),
        },
        clientId
      );
    }
    return res.json({ success: true });
  });

  // Status endpoint
  app.get("/api/remote/status", (_req, res) => {
    return res.json({
      connectedDevices: sseClients.length,
      devices: sseClients.map((c) => ({ id: c.id, device: c.device })),
    });
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ALLDAY Home Server rodando na porta ${PORT}`);
  });
}

startServer();
