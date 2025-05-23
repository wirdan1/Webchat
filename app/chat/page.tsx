"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ImageIcon, Video, AudioLines, Send, LogOut, User, Users } from "lucide-react"
import { sendMessage, getMessages, getUserProfile } from "@/lib/actions"
import { MessageItem } from "@/components/message-item"
import { UserProfile } from "@/components/user-profile"

export default function Chat() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachmentType, setAttachmentType] = useState<string | null>(null)
  const [attachment, setAttachment] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const loadMessages = async () => {
    try {
      const data = await getMessages()
      setMessages(data)
    } catch (error) {
      console.error("Failed to load messages:", error)
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
      loadMessages()
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
      // Call logout action
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">ChatGroup</h1>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleLogout}>
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
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 overflow-hidden p-4">
            <Card className="flex h-full flex-col">
              <CardContent className="flex flex-1 flex-col p-4">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <MessageItem key={index} message={msg} isCurrentUser={msg.userId === user._id} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                {attachment && (
                  <div className="mb-2 rounded-md border border-muted p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{attachment.name}</span>
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
                    <Button variant="outline" size="icon" type="button" onClick={() => handleAttachment("image")}>
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" type="button" onClick={() => handleAttachment("video")}>
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" type="button" onClick={() => handleAttachment("audio")}>
                      <AudioLines className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="icon"
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isLoading || (!message && !attachment)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="flex-1 overflow-auto p-4">
            <UserProfile user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
