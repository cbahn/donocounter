import { MongoClient, Db, ServerApiVersion } from "mongodb";
import { CONFIG } from "../config.js";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(CONFIG.mongoUrl, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    connectTimeoutMS: 8000,
    // sensible defaults; tune as you like
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000
  });
  await client.connect();
  const url = new URL(CONFIG.mongoUrl);
  const dbName = url.pathname.replace("/", "") || "donocounter";
  db = client.db(dbName);
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
