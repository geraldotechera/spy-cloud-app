import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Europa Mágica 2026",
  description: "Viaje a Europa 2026 - Itinerario, presupuesto y más",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-europa-2026-192.jpg",
    apple: "/icon-europa-2026-512.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
