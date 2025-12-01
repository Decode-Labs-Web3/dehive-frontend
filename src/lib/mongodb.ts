import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI!;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "dehive_db";

if (!MONGO_URI) {
  throw new Error("MONGO_URI environment variable is not defined");
}

// Global variable to cache the MongoDB client connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connects to MongoDB and returns the database instance.
 * Uses connection pooling via cached client for efficiency.
 */
export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create new connection
  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 10,
    minPoolSize: 1,
  });

  await client.connect();
  const db = client.db(MONGO_DB_NAME);

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

/**
 * Gets the encryption_public_keys collection
 */
export async function getEncryptionKeysCollection() {
  const { db } = await connectToDatabase();
  return db.collection("encryption_public_keys");
}

// Collection schema for reference:
// {
//   walletAddress: string (lowercase, indexed, unique)
//   publicKey: string (base64 encoded X25519 public key)
//   createdAt: Date
//   updatedAt: Date
// }
