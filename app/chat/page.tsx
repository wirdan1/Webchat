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
import { ImageIcon, Video, AudioLines, Send, LogOut, User, Users, RefreshCw, Info, SmilePlus } from "lucide-react"
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
import { format } from "date-fns"

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
    }, 3000)

    const usersInterval = setInterval(() => {
      loadActiveUsers(false)
    }, 10000)

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
      if (showLoading) {
        setRefreshing(false)
      }
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
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

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
      await loadMessages(false)
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
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">ChatGroup</h1>
          </div>

          <div className="ml-4 flex items-center">
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>{activeUsers.length + 1} online</span>
            </Badge>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="About" className="text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Info className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About ChatGroup</DialogTitle>
                  <DialogDescription>
                    ChatGroup is a real-time messaging platform built with modern web technologies.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <h4 className="font-medium">Features</h4>
                    <ul className="text-sm text-muted-foreground mt-1 list-disc pl-5 space-y-1">
                      <li>Real-time messaging</li>
                      <li>File attachments (images, videos, audio)</li>
                      <li>User presence indicators</li>
                      <li>Responsive design</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Privacy</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your messages are securely stored and only visible to authenticated users.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Avatar className="h-8 w-8">
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} /> : null}
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block dark:text-white">{user.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              title="Logout"
              className="text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        <Tabs defaultValue="chat" className="flex flex-1 flex-col">
          <div className="container flex items-center py-2 border-b dark:border-gray-700">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="chat" 
                className="flex items-center gap-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
              >
                <Users className="h-4 w-4" />
                Active ({activeUsers.length})
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  loadMessages()
                  loadActiveUsers()
                }}
                disabled={refreshing}
                className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 overflow-hidden p-0">
            <div className="flex h-full flex-col bg-white dark:bg-gray-800">
              {/* Messages Area */}
              <ScrollArea 
                className="flex-1 p-4" 
                ref={chatContainerRef}
                onMouseEnter={() => chatContainerRef.current?.classList.add('scrolling')}
                onMouseLeave={() => chatContainerRef.current?.classList.remove('scrolling')}
              >
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                    <div className="max-w-md p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 mx-auto mb-4 text-gray-400">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                      <p className="text-sm">Start the conversation by sending your first message!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    {messages.map((msg, index) => {
                      const showDate = index === 0 || 
                        format(new Date(msg.createdAt), 'MMM d, yyyy') !== 
                        format(new Date(messages[index - 1].createdAt), 'MMM d, yyyy')
                      
                      return (
                        <div key={msg._id.toString()}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <div className="bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full">
                                {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                              </div>
                            </div>
                          )}
                          <MessageItem
                            message={msg}
                            isCurrentUser={msg.userId.toString() === user._id.toString()}
                            showAvatar={index === 0 || messages[index - 1].userId.toString() !== msg.userId.toString()}
                          />
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                {attachment && (
                  <div className="mb-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {attachmentType === 'image' && <ImageIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                        {attachmentType === 'video' && <Video className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                        {attachmentType === 'audio' && <AudioLines className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                        <span className="text-sm truncate max-w-[180px] text-gray-700 dark:text-gray-300">
                          {attachment.name}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setAttachment(null)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => handleAttachment("image")}
                      title="Upload Image"
                      className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => handleAttachment("video")}
                      title="Upload Video"
                      className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => handleAttachment("audio")}
                      title="Upload Audio"
                      className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <AudioLines className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      title="Emoji"
                      className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <SmilePlus className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[60px] resize-none pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isLoading || (!message && !attachment)}
                      className="absolute right-2 bottom-2 h-8 w-8 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
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
          </TabsContent>

          {/* Active Users Tab */}
          <TabsContent value="users" className="flex-1 overflow-auto p-0">
            <div className="h-full bg-white dark:bg-gray-800">
              <ActiveUsersList currentUser={user} activeUsers={activeUsers} />
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="flex-1 overflow-auto p-0">
            <div className="h-full bg-white dark:bg-gray-800 p-6">
              <UserProfile user={user} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        .scrolling::-webkit-scrollbar {
          width: 8px;
        }
        .scrolling::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrolling::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
        .dark .scrolling::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
      `}</style>
    </div>
  )
}
