export interface Event {
  id: number
  time: string
  title: string
  location: string
  description?: string
  ticketPrice: number
  ticketUrl?: string // URL de compra de tickets
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
  category: "vuelo" | "alojamiento" | "alimentacion" | "transporte" | "museo" | "otro"
  description: string
  amountPerCouple: number
  totalAmount: number
  notes?: string
  paidBy?: string // Quién pagó este gasto
  addedBy?: string // Quién agregó este gasto
  timestamp?: number // Para sincronización
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
  lastSync?: number // Última sincronización
}
