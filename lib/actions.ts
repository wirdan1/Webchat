"use server"

import { cookies } from "next/headers"
import { MongoClient, ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

const MONGODB_URI =
  "mongodb+srv://zanssxploit:pISqUYgJJDfnLW9b@cluster0.fgram.mongodb.net/virtual_db?retryWrites=true&w=majority"
const DB_NAME = "virtual_db"

// MongoDB connection
let clientPromise: Promise<MongoClient> | null = null

async function connectToDatabase() {
  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI)
    clientPromise = client.connect()
  }
  const client = await clientPromise
  return client.db(DB_NAME)
}

// User authentication
export async function registerUser(userData: { name: string; phone: string; password: string }) {
  try {
    const db = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ phone: userData.phone })
    if (existingUser) {
      throw new Error("User with this phone number already exists")
    }

    // In a real app, you would hash the password here
    const result = await usersCollection.insertOne({
      name: userData.name,
      phone: userData.phone,
      password: userData.password, // In production, use a hashed password
      createdAt: new Date(),
    })

    // Set a cookie to keep the user logged in
    cookies().set("userId", result.insertedId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, userId: result.insertedId.toString() }
  } catch (error) {
    console.error("Registration error:", error)
    throw new Error(error instanceof Error ? error.message : "Registration failed")
  }
}

export async function loginUser(userData: { phone: string; password: string }) {
  try {
    const db = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Find the user
    const user = await usersCollection.findOne({
      phone: userData.phone,
      password: userData.password, // In production, compare with hashed password
    })

    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Set a cookie to keep the user logged in
    cookies().set("userId", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, userId: user._id.toString() }
  } catch (error) {
    console.error("Login error:", error)
    throw new Error(error instanceof Error ? error.message : "Login failed")
  }
}

export async function getUserProfile() {
  try {
    const userId = cookies().get("userId")?.value

    if (!userId) {
      return null
    }

    const db = await connectToDatabase()
    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return null
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = user

    return userWithoutPassword
  } catch (error) {
    console.error("Get user profile error:", error)
    return null
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const userId = cookies().get("userId")?.value

    if (!userId) {
      throw new Error("Not authenticated")
    }

    const db = await connectToDatabase()
    const usersCollection = db.collection("users")

    const updateData: any = {
      name: formData.get("name"),
      phone: formData.get("phone"),
    }

    // Handle avatar upload
    const avatar = formData.get("avatar") as File
    if (avatar && avatar.size > 0) {
      // Convert file to base64 for storage
      // This is a simple approach - in production, use a proper file storage service
      const buffer = await avatar.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      const mimeType = avatar.type
      updateData.avatarUrl = `data:${mimeType};base64,${base64}`
    }

    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: updateData })

    revalidatePath("/chat")
    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    throw new Error(error instanceof Error ? error.message : "Profile update failed")
  }
}

// Message handling
export async function sendMessage(formData: FormData) {
  try {
    const userId = cookies().get("userId")?.value

    if (!userId) {
      throw new Error("Not authenticated")
    }

    const db = await connectToDatabase()
    const usersCollection = db.collection("users")
    const messagesCollection = db.collection("messages")

    // Get user info
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      throw new Error("User not found")
    }

    const messageData: any = {
      userId: new ObjectId(userId),
      userName: user.name,
      text: formData.get("text") || "",
      createdAt: new Date(),
    }

    // Handle file upload
    const file = formData.get("file") as File
    if (file && file.size > 0) {
      const fileType = formData.get("fileType") as string

      // Convert file to base64 for storage
      // This is a simple approach - in production, use a proper file storage service
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      const mimeType = file.type

      messageData.fileUrl = `data:${mimeType};base64,${base64}`
      messageData.fileType = mimeType
      messageData.fileName = file.name
    }

    await messagesCollection.insertOne(messageData)

    revalidatePath("/chat")
    return { success: true }
  } catch (error) {
    console.error("Send message error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to send message")
  }
}

export async function getMessages() {
  try {
    const userId = cookies().get("userId")?.value

    if (!userId) {
      throw new Error("Not authenticated")
    }

    const db = await connectToDatabase()
    const messagesCollection = db.collection("messages")

    // Get the most recent messages first, limit to 100 for performance
    const messages = await messagesCollection.find({}).sort({ createdAt: 1 }).limit(100).toArray()

    return messages
  } catch (error) {
    console.error("Get messages error:", error)
    return []
  }
}

export async function logoutUser() {
  cookies().delete("userId")
  return { success: true }
}
