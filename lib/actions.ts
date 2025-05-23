"use server"

import { cookies } from "next/headers"
import { MongoClient, ObjectId } from "mongodb"

const MONGODB_URI =
  "mongodb+srv://zanssxploit:pISqUYgJJDfnLW9b@cluster0.fgram.mongodb.net/virtual_db?retryWrites=true&w=majority"
const DB_NAME = "virtual_db"

// MongoDB connection
let client: MongoClient | null = null

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
  }
  return client.db(DB_NAME)
}

// User authentication
export async function registerUser(userData: { name: string; phone: string; password: string }) {
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

  return { success: true }
}

export async function loginUser(userData: { phone: string; password: string }) {
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

  return { success: true }
}

export async function getUserProfile() {
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
}

export async function updateUserProfile(formData: FormData) {
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

  // Handle avatar upload (in a real app, you would upload to a storage service)
  const avatar = formData.get("avatar") as File
  if (avatar && avatar.size > 0) {
    // In a real app, upload to cloud storage and store the URL
    // updateData.avatarUrl = uploadedUrl;
  }

  await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: updateData })

  return { success: true }
}

// Message handling
export async function sendMessage(formData: FormData) {
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

  // Handle file upload (in a real app, you would upload to a storage service)
  const file = formData.get("file") as File
  if (file && file.size > 0) {
    const fileType = formData.get("fileType") as string
    // In a real app, upload to cloud storage and store the URL
    // messageData.fileUrl = uploadedUrl;
    // messageData.fileType = fileType;
  }

  await messagesCollection.insertOne(messageData)

  return { success: true }
}

export async function getMessages() {
  const userId = cookies().get("userId")?.value

  if (!userId) {
    throw new Error("Not authenticated")
  }

  const db = await connectToDatabase()
  const messagesCollection = db.collection("messages")

  // Get the most recent messages first
  const messages = await messagesCollection.find({}).sort({ createdAt: 1 }).limit(100).toArray()

  return messages
}
