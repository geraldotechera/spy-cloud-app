export interface TicketFile {
  url: string
  name: string
  type: string // "pdf" | "image"
  uploadedAt: number
}

export interface Event {
  id: number
  time: string
  title: string
  location: string
  description?: string
  ticketPrice: number
  ticketUrl?: string
  ticketFiles?: TicketFile[] // Archivos de tickets/entradas subidos
  category?: string
  icon?: string
  imageUrl?: string
  coordinates?: { lat: number; lng: number }
  budgetId?: number  // ID del DailyExpense correspondiente en el presupuesto
}

export interface Accommodation {
  id?: number
  name: string
  location?: string // Ubicación completa del alojamiento
  city: string // Ciudad del alojamiento (Madrid, Barcelona, etc.)
  dates?: string // Fechas de estadía
  price?: number // Precio por noche
  nights?: number // Número de noches
  url?: string // URL de Booking o Airbnb
  notes?: string
}

export interface Couple {
  id: number
  name: string
}

export interface DailyExpense {
  id: number
  date: string
  category: "vuelo" | "alojamiento" | "alimentacion" | "transporte" | "museo" | "otro" | "otros" | "taxi"
  description: string
  amountPerPerson?: number
  amountPerCouple: number
  totalAmount: number
  notes?: string
  paid?: boolean
  paidBy?: string
  addedBy?: string
  timestamp?: number
  // Campos de locomocion
  company?: string       // Aerolínea, empresa de tren, etc.
  departureTime?: string // Horario de salida (ej: "11:30")
  arrivalTime?: string   // Horario de llegada (ej: "14:45")
  ticketUrl?: string     // Link para reservar / comprar
  // Campos de paseos
  hidden?: boolean       // Si el paseo está oculto del presupuesto
}

export interface Budget {
  dailyExpenses: DailyExpense[]
  totalPerCouple: number
  totalGeneral: number
}

export interface Ticket {
  type: "avion" | "tren" | "evento"
  title: string
  date: string
  details: string
  file?: string
  fileName?: string
  fileType?: string
  addedBy?: string // Quién agregó este ticket
  timestamp?: number // Para sincronización
}

export interface Photo {
  id: number
  url: string
  date: string
  location?: string
  notes?: string
  uploadedBy?: string // Nombre de quien subio la foto
  uploadedById?: number // ID de quien subio la foto
  timestamp?: number // Para sincronizacion
  ownerId?: number // ID del propietario de la foto
  sharedWith?: number[] // IDs de usuarios con quienes se compartio
  savedToDevice?: boolean // Si se guardo en el dispositivo
}

export interface User {
  id: number
  name: string
  couple: string
  role: "admin" | "user" // Agregado rol de usuario
  color: string // Agregado color para identificar visualmente cada usuario
}

export interface AppData {
  currentSection: string
  selectedDate: string
  currentCity: string
  currentTicketCategory: string
  currentUser?: User // Usuario actual
  couples: Couple[]
  events: Record<string, Event[]>
  tickets: Ticket[]
  accommodations: Accommodation[]
  budget: Budget
  photos?: Photo[] // Fotos compartidas
  budgetNotes?: string   // Notas libres del presupuesto
  lastSync?: number // Última sincronización
}
