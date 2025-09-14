import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { NotificationProvider } from "@/components/notification-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Battle Arena - Multiplayer Dueling Game",
  description: "Challenge warriors, bet coins, and prove your worth in turn-based combat",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <NotificationProvider>{children}</NotificationProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
