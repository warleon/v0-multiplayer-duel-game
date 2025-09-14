"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/components/notification-provider";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "duel_request":
        return "⚔️";
      case "duel_accepted":
        return "✅";
      case "battle_turn":
        return "🎯";
      case "battle_finished":
        return "🏆";
      default:
        return "📢";
    }
  };

  const getNotificationLink = (notification: any) => {
    switch (notification.type) {
      case "duel_accepted":
      case "battle_turn":
      case "battle_finished":
        return notification.data?.duel_id
          ? `/battle/${notification.data.duel_id}`
          : "/duels";
      default:
        return "/duels";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <div
          className={cn(
            " p-2 rounded-lg",
            "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
            "relative border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent"
          )}
        >
          <svg
            className="w-4 h-4 "
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
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-slate-800 border-purple-500/20 max-h-96 overflow-y-auto"
      >
        <div className="flex items-center justify-between p-3 border-b border-purple-500/20">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-purple-300 hover:text-white hover:bg-purple-500/10"
            >
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <svg
              className="w-12 h-12 text-purple-400 mx-auto mb-3"
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
            <p className="text-purple-200">No notifications yet</p>
            <p className="text-purple-400 text-sm">
              You'll be notified about duel updates here
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem asChild className="p-0">
                  <Link
                    href={getNotificationLink(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className={`block p-3 hover:bg-purple-500/10 cursor-pointer ${
                      !notification.read ? "bg-purple-500/5" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`font-medium text-sm ${
                              !notification.read
                                ? "text-white"
                                : "text-purple-200"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-purple-300 text-xs mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-purple-400 text-xs mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                {index < notifications.length - 1 && (
                  <DropdownMenuSeparator className="bg-purple-500/20" />
                )}
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-purple-500/20" />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="w-full text-purple-300 hover:text-white hover:bg-purple-500/10"
              >
                <Link href="/notifications">View all notifications</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
