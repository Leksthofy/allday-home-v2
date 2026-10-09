import {
  MemberProfile,
  CalendarEvent,
  ShoppingItem,
  TaskItem,
  DailyRoutine,
  MealPlanItem,
  FamilyPhoto,
  BillItem,
  ChildLogRecord,
  HomeReminder,
} from "../types";

export const initialMembers: MemberProfile[] = [
  {
    id: "m1",
    name: "Thiago",
    role: "Pai & Edição",
    avatarColor: "bg-emerald-600 text-white",
    initials: "TH",
  },
  {
    id: "m2",
    name: "Erika",
    role: "Mãe & Conteúdo",
    avatarColor: "bg-purple-600 text-white",
    initials: "ER",
  },
  {
    id: "m3",
    name: "Zoe",
    role: "Filha",
    avatarColor: "bg-amber-500 text-white",
    initials: "ZO",
  },
  {
    id: "m4",
    name: "Família",
    role: "Todos",
    avatarColor: "bg-blue-600 text-white",
    initials: "FM",
  },
];

// Helper for dynamic dates around today (2026-07-25)
const getFormattedDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

export const initialEvents: CalendarEvent[] = [
  {
    id: "e1",
    title: "Cliente João - Atendimento Ensaio",
    date: getFormattedDate(0),
    time: "10:00",
    endTime: "11:30",
    member: "Thiago",
    category: "Trabalho",
    location: "Estúdio Principal",
    googleSynced: true,
  },
  {
    id: "e2",
    title: "Editar fotos do casamento",
    date: getFormattedDate(0),
    time: "14:00",
    endTime: "16:30",
    member: "Thiago",
    category: "Trabalho",
    googleSynced: true,
  },
  {
    id: "e3",
    title: "Treino de Natação Zoe",
    date: getFormattedDate(0),
    time: "17:00",
    endTime: "18:00",
    member: "Zoe",
    category: "Saúde",
    location: "Academia Aquática",
    googleSynced: true,
  },
  {
    id: "e4",
    title: "Gravação Conteúdo UGC Erika",
    date: getFormattedDate(1),
    time: "11:00",
    endTime: "13:00",
    member: "Erika",
    category: "Trabalho",
    googleSynced: true,
  },
  {
    id: "e5",
    title: "Consulta Pediatra Dra. Mariana (Zoe)",
    date: getFormattedDate(3),
    time: "09:30",
    endTime: "10:30",
    member: "Zoe",
    category: "Saúde",
    location: "Clínica Infantil",
    googleSynced: true,
  },
  {
    id: "e6",
    title: "Almoço em Família no Domingo",
    date: getFormattedDate(1),
    time: "12:30",
    endTime: "15:00",
    member: "Família",
    category: "Lazer",
    googleSynced: true,
  },
];

export const initialShopping: ShoppingItem[] = [
  {
    id: "s1",
    name: "Café Especial em Grãos",
    category: "Supermercado",
    completed: false,
    addedBy: "Thiago",
    quantity: "1 pacote",
  },
  {
    id: "s2",
    name: "Leite Desnatado",
    category: "Supermercado",
    completed: false,
    addedBy: "Erika",
    quantity: "3L",
  },
  {
    id: "s3",
    name: "Fraldas Zoe Tamanho G",
    category: "Farmácia",
    completed: false,
    addedBy: "Erika",
    quantity: "1 pacote mega",
  },
  {
    id: "s4",
    name: "Banana Prata e Maçã",
    category: "Feira",
    completed: true,
    addedBy: "Thiago",
    quantity: "2 dúzias",
  },
  {
    id: "s5",
    name: "Sacos de Lixo 50L",
    category: "Casa",
    completed: false,
    addedBy: "Erika",
  },
  {
    id: "s6",
    name: "Azeite Extra Virgem",
    category: "Supermercado",
    completed: false,
    addedBy: "Thiago",
  },
];

export const initialTasks: TaskItem[] = [
  {
    id: "t1",
    title: "Tirar o lixo reciclável da cozinha",
    assignee: "Thiago",
    dueDate: getFormattedDate(0),
    completed: true,
    priority: "high",
    category: "Limpeza",
  },
  {
    id: "t2",
    title: "Lavar e dobrar as roupas da Zoe",
    assignee: "Erika",
    dueDate: getFormattedDate(0),
    completed: false,
    priority: "medium",
    category: "Limpeza",
  },
  {
    id: "t3",
    title: "Faxina geral no sábado",
    assignee: "Família",
    dueDate: getFormattedDate(0),
    completed: false,
    priority: "high",
    category: "Limpeza",
  },
  {
    id: "t4",
    title: "Editar e publicar Reels de casamento",
    assignee: "Thiago",
    dueDate: getFormattedDate(1),
    completed: false,
    priority: "medium",
    category: "Trabalho",
  },
  {
    id: "t5",
    title: "Trocar filtro do ar condicionado",
    assignee: "Thiago",
    dueDate: getFormattedDate(5),
    completed: false,
    priority: "low",
    category: "Manutenção",
  },
];

export const initialRoutines: DailyRoutine[] = [
  // Segunda
  { id: "r1", dayOfWeek: "Segunda", title: "Treino Academia", assignee: "Thiago", completed: false, timeOfDay: "Manhã" },
  { id: "r2", dayOfWeek: "Segunda", title: "Editar Vídeos de Clientes", assignee: "Thiago", completed: false, timeOfDay: "Tarde" },
  { id: "r3", dayOfWeek: "Segunda", title: "Buscar Zoe na Escola", assignee: "Erika", completed: false, timeOfDay: "Tarde" },

  // Terça
  { id: "r4", dayOfWeek: "Terça", title: "Limpeza e Organização Casa", assignee: "Família", completed: false, timeOfDay: "Manhã" },
  { id: "r5", dayOfWeek: "Terça", title: "Produção de Conteúdo UGC", assignee: "Erika", completed: false, timeOfDay: "Tarde" },

  // Quarta
  { id: "r6", dayOfWeek: "Quarta", title: "Natação Zoe", assignee: "Erika", completed: false, timeOfDay: "Tarde" },
  { id: "r7", dayOfWeek: "Quarta", title: "Compras da Semana Mercado", assignee: "Thiago", completed: false, timeOfDay: "Noite" },

  // Quinta
  { id: "r8", dayOfWeek: "Quinta", title: "Ensaio e Fotos Externas", assignee: "Thiago", completed: false, timeOfDay: "Manhã" },

  // Sexta
  { id: "r9", dayOfWeek: "Sexta", title: "Atendimento João / Reuniões", assignee: "Thiago", completed: true, timeOfDay: "Manhã" },
  { id: "r10", dayOfWeek: "Sexta", title: "Editar Casamento", assignee: "Thiago", completed: false, timeOfDay: "Tarde" },

  // Sábado
  { id: "r11", dayOfWeek: "Sábado", title: "Faxina e Organização da Cozinha", assignee: "Família", completed: false, timeOfDay: "Manhã" },
  { id: "r12", dayOfWeek: "Sábado", title: "Passeio com a Zoe no Parque", assignee: "Família", completed: false, timeOfDay: "Tarde" },

  // Domingo
  { id: "r13", dayOfWeek: "Domingo", title: "Planejamento da Semana no ALLDAY Home", assignee: "Família", completed: false, timeOfDay: "Noite" },
];

export const initialMeals: MealPlanItem[] = [
  // Cardápio Família
  {
    id: "m1",
    profile: "Família",
    dayOfWeek: "Segunda",
    lunch: "Grelhado de Frango, Arroz Integral, Feijão e Salada",
    dinner: "Omelete com Queijo e Salada de Tomate",
    breakfast: "Café, pão na chapa e frutas",
    ingredientsNeeded: ["Frango", "Arroz Integral", "Ovos", "Tomate", "Queijo"],
  },
  {
    id: "m2",
    profile: "Família",
    dayOfWeek: "Terça",
    lunch: "Carne Moída com Batata e Arroz Branco",
    dinner: "Sopa de Legumes com Frango Desfiado",
    breakfast: "Tapioca com queijo e suco de laranja",
    ingredientsNeeded: ["Carne Moída", "Batata", "Cenoura", "Chuchu"],
  },
  {
    id: "m3",
    profile: "Família",
    dayOfWeek: "Quarta",
    lunch: "Filé de Tilápia com Purê de Mandioquinha",
    dinner: "Panqueca de Carne Moída e Salada Verde",
    breakfast: "Iogurte natural, granola e banana",
    ingredientsNeeded: ["Peixe Tilápia", "Mandioquinha", "Leite"],
  },
  {
    id: "m4",
    profile: "Família",
    dayOfWeek: "Quinta",
    lunch: "Macarrão à Bolonhesa e Salada de Maionese",
    dinner: "Tapioca com Frango e Requeijão",
    breakfast: "Café com leite e torradas",
    ingredientsNeeded: ["Macarrão", "Massa de Tapioca", "Requeijão"],
  },
  {
    id: "m5",
    profile: "Família",
    dayOfWeek: "Sexta",
    lunch: "Strogonoff de Frango com Batata Palha e Arroz",
    dinner: "Pizza Caseira de Frango com Requeijão",
    breakfast: "Panqueca de aveia e mel",
    ingredientsNeeded: ["Creme de Leite", "Batata Palha", "Massa de Pizza"],
  },
  {
    id: "m6",
    profile: "Família",
    dayOfWeek: "Sábado",
    lunch: "Feijoada Completa com Couve e Farofa",
    dinner: "Lanche de Hambúrguer Artesanal em Família",
    breakfast: "Misto quente e suco verde",
    ingredientsNeeded: ["Feijão Preto", "Carne Seca", "Pão de Hambúrguer"],
  },
  {
    id: "m7",
    profile: "Família",
    dayOfWeek: "Domingo",
    lunch: "Lasanha de Queijo e Presunto com Frango Assado",
    dinner: "Sopa Leve de Mandioquinha",
    breakfast: "Waffles com frutas e café especial",
    ingredientsNeeded: ["Massa de Lasanha", "Presunto", "Queijo Mussarela"],
  },
  // Cardápio da Zoe
  {
    id: "mz1",
    profile: "Zoe",
    dayOfWeek: "Segunda",
    lunch: "Papinha de Frango com Abóbora, Arroz e Cenourinha",
    dinner: "Sopinha de Mandioquinha com Carne desfiadinha",
    breakfast: "Frutinha amassada (Banana e Maçã)",
    snack: "Iogurte infantil com pera raspada",
    ingredientsNeeded: ["Abóbora", "Cenourinha baby", "Peito de Frango Zoe"],
  },
  {
    id: "mz2",
    profile: "Zoe",
    dayOfWeek: "Terça",
    lunch: "Purê de Batata Doce com Peixinho desfiado e Brócolis",
    dinner: "Caldinho de Feijão com Arroz e Abobrinha ralada",
    breakfast: "Mamão raspadinho com aveia",
    snack: "Bolo caseiro de banana sem açúcar",
    ingredientsNeeded: ["Batata Doce", "Brócolis fresco", "Filé de Peixe"],
  },
  {
    id: "mz3",
    profile: "Zoe",
    dayOfWeek: "Quarta",
    lunch: "Arroz com Feijão, Carninha moída e Purê de Mandioquinha",
    dinner: "Macarrãozinho letrinhas com molho caseiro de tomate e frango",
    breakfast: "Abacate amassadinho",
    snack: "Melancia em pedacinhos",
    ingredientsNeeded: ["Mandioquinha Zoe", "Tomatinho cereja"],
  },
  {
    id: "mz4",
    profile: "Zoe",
    dayOfWeek: "Quinta",
    lunch: "Polentinha cremosa com frango e espinafre",
    dinner: "Sopa de Legumes variados com carninha",
    breakfast: "Banana da terra cozidinha",
    snack: "Biscoitinho de arroz infantil",
    ingredientsNeeded: ["Fubá para polenta", "Espinafre"],
  },
  {
    id: "mz5",
    profile: "Zoe",
    dayOfWeek: "Sexta",
    lunch: "Arroz colorido com cenoura, feijãozinho e omelete de gema",
    dinner: "Purê de Batata Inglesa com peixinho e cenoura",
    breakfast: "Manga docinha em fatias",
    snack: "Pera cozidinha com canela",
    ingredientsNeeded: ["Ovos caipiras", "Manga palmer"],
  },
  {
    id: "mz6",
    profile: "Zoe",
    dayOfWeek: "Sábado",
    lunch: "Caldo de feijão rico, arros, carne picadinha e chuchu",
    dinner: "Sopinha da vovó com legumes e franguinho",
    breakfast: "Pãozinho com queijo minas frescal",
    snack: "Suco natural de laranja com mamão",
    ingredientsNeeded: ["Chuchu", "Queijo Minas"],
  },
  {
    id: "mz7",
    profile: "Zoe",
    dayOfWeek: "Domingo",
    lunch: "Macarrãozinho com legumes grelhados e franguinho assado",
    dinner: "Papa de mandioquinha com carne e espinafre",
    breakfast: "Frutinhas variadas da feira",
    snack: "Iogurte natural batido com morango",
    ingredientsNeeded: ["Morangos frescos"],
  },
];

export const initialPhotos: FamilyPhoto[] = [
  {
    id: "p1",
    title: "Fim de Semana no Parque com Zoe",
    url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    caption: "Alegria da Zoe balançando no parque ☀️",
    dateAdded: "2026-07-15",
  },
  {
    id: "p2",
    title: "Thiago & Erika no Aniversário",
    url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    caption: "Celebrando momentos juntos em família ❤️",
    dateAdded: "2026-06-20",
  },
  {
    id: "p3",
    title: "Aventuras no Praia & Sol",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    caption: "Férias inesquecíveis da nossa família",
    dateAdded: "2026-05-10",
  },
  {
    id: "p4",
    title: "Sorrisos da Zoe na Cozinha",
    url: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1200&q=80",
    caption: "Ajudando o papai e a mamãe no café da manhã",
    dateAdded: "2026-07-01",
  },
];

export const initialBills: BillItem[] = [
  {
    id: "b1",
    title: "Conta de Luz - Enel",
    amount: 342.50,
    dueDate: getFormattedDate(5),
    paid: false,
    category: "Serviços",
    autoDebit: true,
  },
  {
    id: "b2",
    title: "Internet Fibra Óptica 600MB",
    amount: 149.90,
    dueDate: getFormattedDate(8),
    paid: false,
    category: "Serviços",
    autoDebit: true,
  },
  {
    id: "b3",
    title: "Escola e Natação da Zoe",
    amount: 890.00,
    dueDate: getFormattedDate(12),
    paid: false,
    category: "Educação",
    autoDebit: false,
  },
  {
    id: "b4",
    title: "Plano de Saúde Familiar",
    amount: 1250.00,
    dueDate: getFormattedDate(-2),
    paid: true,
    category: "Saúde",
    autoDebit: true,
  },
];

export const initialChildLogs: ChildLogRecord[] = [
  {
    id: "cl1",
    type: "Vacina",
    title: "Reforço Vacina Febre Amarela e Gripe",
    date: "2026-06-10",
    notes: "Tomou na clínica sem reações adversas. Próxima dose somente no próximo ano.",
  },
  {
    id: "cl2",
    type: "Consulta",
    title: "Check-up de Rotina Pediatra Dra. Mariana",
    date: getFormattedDate(3),
    notes: "Avaliação do desenvolvimento motor e nutricional.",
  },
  {
    id: "cl3",
    type: "Crescimento",
    title: "Medição de Peso e Altura",
    date: "2026-07-01",
    value: "86 cm / 12.4 kg",
    notes: "Curva de crescimento dentro do percentil 75.",
  },
  {
    id: "cl4",
    type: "Remédio",
    title: "Vitamina D diária (3 gotas)",
    date: getFormattedDate(0),
    value: "3 gotas pela manhã",
    notes: "Dar junto do suco de laranja.",
    time: "09:30",
    hasReminder: true,
  },
];

export const initialReminders: HomeReminder[] = [
  {
    id: "rem-1",
    title: "Remédio da Zoe (Vitamina D - 3 gotas)",
    time: "09:30",
    member: "Zoe",
    category: "Remédio",
    repeatDaily: true,
    soundEnabled: true,
    voiceAlert: true,
    completed: false,
  },
  {
    id: "rem-2",
    title: "Remédio da Zoe (Gotas para Cólica / Febre)",
    time: "15:00",
    member: "Zoe",
    category: "Remédio",
    repeatDaily: true,
    soundEnabled: true,
    voiceAlert: true,
    completed: false,
  },
  {
    id: "rem-3",
    title: "Ligar Robô Aspirador na Sala",
    time: "14:00",
    member: "Família",
    category: "Casa",
    repeatDaily: true,
    soundEnabled: true,
    voiceAlert: false,
    completed: false,
  },
  {
    id: "rem-4",
    title: "Lanche da Tarde e Hidratação da Zoe",
    time: "16:30",
    member: "Zoe",
    category: "Rotina",
    repeatDaily: true,
    soundEnabled: true,
    voiceAlert: true,
    completed: false,
  },
];

export const dailyQuotes = [
  "O segredo de uma casa harmoniosa está nas pequenas rotinas vividas com amor.",
  "Simplificar o dia é abrir espaço para o que realmente importa: nossa família.",
  "A felicidade não é um evento distante, é o ritmo suave da nossa rotina.",
  "Cada compromisso cumprido é um passo para mais paz e tranquilidade em casa.",
];
