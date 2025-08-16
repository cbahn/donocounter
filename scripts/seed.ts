import { upsertCard } from "../src/db/repositories/cards.js";

async function main() {
  const now = new Date();
  await upsertCard({
    externalId: "seed-001",
    title: "Hello, Mongo",
    summary: "Just a seed record",
    body: "This proves the connection works.",
    createdAt: now,
    rawPayload: { source: "seed" }
  });
  console.log("Seeded one card");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
