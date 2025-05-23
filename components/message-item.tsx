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
    createdAt: string
  }
  isCurrentUser: boolean
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
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
          />
        </div>
      )
    }

    if (message.fileType?.startsWith("video")) {
      return (
        <div className="mt-2 overflow-hidden rounded-md">
          <video
            src={message.fileUrl}
            controls
            className="max-h-[300px] w-auto"
            onLoadedData={() => setMediaLoaded(true)}
          />
        </div>
      )
    }

    if (message.fileType?.startsWith("audio")) {
      return (
        <div className="mt-2">
          <audio src={message.fileUrl} controls className="w-full" />
        </div>
      )
    }

    return (
      <div className="mt-2">
        <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 underline">
          Download attachment
        </a>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-2", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[70%]", isCurrentUser ? "text-right" : "")}>
        <div className="text-xs text-muted-foreground">
          {isCurrentUser ? "You" : message.userName} •{" "}
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <Card className={cn("mt-1", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
          <CardContent className="p-3">
            {message.text && <p className="text-sm">{message.text}</p>}
            {renderMedia()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
