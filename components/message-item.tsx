"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MessageItemProps {
  message: {
    _id: string
    userId: string
    userName: string
    text: string
    fileUrl?: string
    fileType?: string
    fileName?: string
    createdAt: string
  }
  isCurrentUser: boolean
  showAvatar: boolean
}

export function MessageItem({ message, isCurrentUser, showAvatar }: MessageItemProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [mediaError, setMediaError] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderMedia = () => {
    if (!message.fileUrl) return null

    if (message.fileType?.startsWith("image")) {
      return (
        <div className="mt-2 overflow-hidden rounded-md">
          <img
            src={message.fileUrl || "/placeholder.svg"}
            alt="Attached image"
            className={cn(
              "max-h-[300px] w-auto object-contain transition-opacity",
              mediaLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setMediaLoaded(true)}
            onError={() => setMediaError(true)}
          />
          {mediaError && <div className="p-2 text-sm text-red-500">Failed to load image</div>}
        </div>
      )
    }

    if (message.fileType?.startsWith("video")) {
      return (
        <div className="mt-2 overflow-hidden rounded-md">
          <video
            src={message.fileUrl}
            controls
            className="max-h-[300px] w-full"
            onLoadedData={() => setMediaLoaded(true)}
            onError={() => setMediaError(true)}
          />
          {mediaError && <div className="p-2 text-sm text-red-500">Failed to load video</div>}
        </div>
      )
    }

    if (message.fileType?.startsWith("audio")) {
      return (
        <div className="mt-2">
          <audio src={message.fileUrl} controls className="w-full" onError={() => setMediaError(true)} />
          {mediaError && <div className="p-2 text-sm text-red-500">Failed to load audio</div>}
        </div>
      )
    }

    return (
      <div className="mt-2">
        <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 underline">
          {message.fileName || "Download attachment"}
        </a>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex gap-2 mb-1",
        isCurrentUser ? "flex-row-reverse" : "flex-row",
        !showAvatar && !isCurrentUser && "pl-10",
      )}
    >
      {showAvatar ? (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
        </Avatar>
      ) : !isCurrentUser ? (
        <div className="w-8"></div>
      ) : null}

      <div className={cn("max-w-[75%]", isCurrentUser ? "text-right" : "")}>
        {showAvatar && (
          <div className="text-xs text-muted-foreground mb-1">{isCurrentUser ? "You" : message.userName}</div>
        )}

        <Card
          className={cn(
            "inline-block text-left",
            isCurrentUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none",
          )}
        >
          <CardContent className="p-3">
            {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
            {renderMedia()}
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground mt-1">{formatTime(message.createdAt)}</div>
      </div>
    </div>
  )
}
