import { upsertCard } from "../src/db/repositories/cards.js";
import { upsertDonation } from "../src/db/repositories/donations.js";

async function main() {
  const now = new Date();

  await upsertDonation({
    method: "venmo",
    venmoId: "37200160876",
    donorName: "Test Donation",
    amountCents: 2000,
    donatedAt: new Date("2025-07-15T20:13:42Z"),
    status: "received",
    rawPayload: { /* full webhook JSON */ }
  });
  console.log("seeded one donation");

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
