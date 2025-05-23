"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Video, AudioLines, Send, LogOut, User, Users, RefreshCw, Info } from "lucide-react"
import { sendMessage, getMessages, getUserProfile, logoutUser, getActiveUsers } from "@/lib/actions"
import { MessageItem } from "@/components/message-item"
import { UserProfile } from "@/components/user-profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ActiveUsersList } from "@/components/active-users-list"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Chat() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachmentType, setAttachmentType] = useState<string | null>(null)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getUserProfile()
        if (!profile) {
          router.push("/login")
          return
        }
        setUser(profile)
        loadMessages()
        loadActiveUsers()
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      }
    }

    checkAuth()

    // Set up polling for new messages and active users
    const messageInterval = setInterval(() => {
      loadMessages(false)
    }, 5000)

    const usersInterval = setInterval(() => {
      loadActiveUsers(false)
    }, 30000)

    return () => {
      clearInterval(messageInterval)
      clearInterval(usersInterval)
    }
  }, [router])

  const loadMessages = async (showLoading = true) => {
    if (showLoading) {
      setRefreshing(true)
    }

    try {
      const data = await getMessages()
      setMessages(data)
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const loadActiveUsers = async (showLoading = false) => {
    try {
      const data = await getActiveUsers()
      setActiveUsers(data)
    } catch (error) {
      console.error("Failed to load active users:", error)
    }
  }

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if ((!message && !attachment) || isLoading) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("text", message)

      if (attachment) {
        formData.append("file", attachment)
        formData.append("fileType", attachmentType || "")
      }

      await sendMessage(formData)
      setMessage("")
      setAttachment(null)
      setAttachmentType(null)
      await loadMessages()
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAttachment = (type: string) => {
    setAttachmentType(type)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachment(file)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">ChatGroup</h1>

          <div className="ml-4 flex items-center">
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>{activeUsers.length + 1} online</span>
            </Badge>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="About">
                  <Info className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About ChatGroup</DialogTitle>
                  <DialogDescription>
                    ChatGroup is a secure messaging platform where all your data is stored safely in our database.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <h4 className="font-medium">Data Storage</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      All messages and media files are stored securely in our MongoDB database. Your data is only
                      accessible to authorized users.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Privacy</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      By using this application, you have consented to the storage of your profile information,
                      messages, and media files.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Multiple Users</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      This platform supports multiple users. Anyone can register with a unique phone number and
                      participate in the group chat.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} /> : null}
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <Tabs defaultValue="chat" className="flex flex-1 flex-col">
          <div className="container flex items-center py-2">
            <TabsList>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Group Chat
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Users
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadMessages()
                  loadActiveUsers()
                }}
                disabled={refreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <TabsContent value="chat" className="flex-1 overflow-hidden p-0 sm:p-4">
            <Card className="flex h-full flex-col rounded-none sm:rounded-lg">
              <div className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4" ref={chatContainerRef}>
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                      <div>
                        <p>No messages yet</p>
                        <p className="text-sm">Be the first to send a message!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => (
                        <MessageItem
                          key={msg._id.toString()}
                          message={msg}
                          isCurrentUser={msg.userId.toString() === user._id.toString()}
                          showAvatar={index === 0 || messages[index - 1].userId.toString() !== msg.userId.toString()}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <Separator />

                <div className="p-4">
                  {attachment && (
                    <div className="mb-2 rounded-md border border-muted bg-muted/50 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => setAttachment(null)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[80px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => handleAttachment("image")}
                        title="Upload Image"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => handleAttachment("video")}
                        title="Upload Video"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => handleAttachment("audio")}
                        title="Upload Audio"
                      >
                        <AudioLines className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="icon"
                        type="button"
                        onClick={handleSendMessage}
                        disabled={isLoading || (!message && !attachment)}
                        title="Send Message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept={
                  attachmentType === "image"
                    ? "image/*"
                    : attachmentType === "video"
                      ? "video/*"
                      : attachmentType === "audio"
                        ? "audio/*"
                        : ""
                }
              />
            </Card>
          </TabsContent>

          <TabsContent value="users" className="flex-1 overflow-auto p-4">
            <ActiveUsersList currentUser={user} activeUsers={activeUsers} />
          </TabsContent>

          <TabsContent value="profile" className="flex-1 overflow-auto p-4">
            <UserProfile user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
