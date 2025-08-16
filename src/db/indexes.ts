import { getDb } from "./client.js";

export async function ensureIndexes() {
  const db = await getDb();
  const cards = db.collection("cards");

  await cards.createIndex({ externalId: 1 }, { unique: true, name: "uniq_externalId" });
  await cards.createIndex({ createdAt: -1 }, { name: "by_createdAt_desc" });
  await cards.createIndex({ receivedAt: -1 }, { name: "by_receivedAt_desc" });
}

// If run directly: initialize then exit (useful for CI/deploy steps)
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureIndexes()
    .then(() => {
      console.log("Indexes ensured");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Index init failed", err);
      process.exit(1);
    });
}
