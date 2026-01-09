export interface Event {
  id: number
  date: string
  time: string
  title: string
  location: string
  description: string
  category: "museo" | "comida" | "transporte" | "alojamiento" | "paseo" | "compras" | "vuelo"
  icon: string
  ticketPrice?: number
  ticketUrl?: string
  coordinates?: { lat: number; lng: number }
  imageUrl?: string
}
