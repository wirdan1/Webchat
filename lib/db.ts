import { MongoClient } from "mongodb"

const MONGODB_URI =
  "mongodb+srv://zanssxploit:pISqUYgJJDfnLW9b@cluster0.fgram.mongodb.net/virtual_db?retryWrites=true&w=majority"
const DB_NAME = "virtual_db"

let cachedClient: MongoClient | null = null
let cachedDb: any = null

export async function connectToDatabase() {
  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // Create a new connection
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(DB_NAME)

  // Cache the connection
  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function disconnectFromDatabase() {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
  }
}
