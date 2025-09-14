import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get all notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "duel_request":
        return "⚔️"
      case "duel_accepted":
        return "✅"
      case "battle_turn":
        return "🎯"
      case "battle_finished":
        return "🏆"
      default:
        return "📢"
    }
  }

  const getNotificationLink = (notification: any) => {
    switch (notification.type) {
      case "duel_accepted":
      case "battle_turn":
      case "battle_finished":
        return notification.data?.duel_id ? `/battle/${notification.data.duel_id}` : "/duels"
      default:
        return "/duels"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-purple-200">Stay updated on your duels and battles</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent"
          >
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Notifications */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={getNotificationLink(notification)}
                    className={`block p-4 rounded-lg border transition-colors hover:bg-purple-500/10 ${
                      !notification.read
                        ? "bg-purple-500/5 border-purple-500/20"
                        : "bg-slate-700/30 border-purple-500/10"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-semibold ${!notification.read ? "text-white" : "text-purple-200"}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {!notification.read && <Badge className="bg-purple-500 text-white">New</Badge>}
                            <span className="text-purple-400 text-sm">
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-purple-300">{notification.message}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-purple-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5"
                  />
                </svg>
                <p className="text-purple-200 text-lg mb-2">No notifications yet</p>
                <p className="text-purple-300 text-sm mb-4">You'll be notified about duel updates here</p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Link href="/duels">Browse Duels</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
