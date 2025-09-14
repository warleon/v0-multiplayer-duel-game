"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Notification {
  id: string
  type: "duel_request" | "duel_accepted" | "battle_turn" | "battle_finished"
  title: string
  message: string
  data: Record<string, any>
  read: boolean
  created_at: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let notificationChannel: RealtimeChannel | null = null

    const setupNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch existing notifications
      const { data: existingNotifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (existingNotifications) {
        setNotifications(existingNotifications)
      }

      // Set up real-time subscription
      notificationChannel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification
            setNotifications((prev) => [newNotification, ...prev.slice(0, 19)])

            // Show browser notification if permission granted
            if (Notification.permission === "granted") {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: "/favicon.ico",
              })
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updatedNotification = payload.new as Notification
            setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))
          },
        )
        .subscribe()

      setChannel(notificationChannel)
    }

    setupNotifications()

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    return () => {
      if (notificationChannel) {
        notificationChannel.unsubscribe()
      }
    }
  }, [])

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from("notifications").update({ read: true }).eq("id", id)

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearNotification = async (id: string) => {
    const supabase = createClient()
    await supabase.from("notifications").delete().eq("id", id)

    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
