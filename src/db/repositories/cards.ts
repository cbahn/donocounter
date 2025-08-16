import { WithId } from "mongodb";
import { getDb } from "../client.js";
import { Card, CardSchema } from "../types.js";

export async function upsertCard(input: Card): Promise<WithId<Card> | null> {
  const parsed = CardSchema.parse({
    ...input,
    receivedAt: input.receivedAt ?? new Date()
  });

  const db = await getDb();
  const cards = db.collection<Card>("cards");

  const res = await cards.findOneAndUpdate(
    { externalId: parsed.externalId },
    {
      $setOnInsert: {
        externalId: parsed.externalId,
        createdAt: parsed.createdAt ?? new Date(),
        receivedAt: parsed.receivedAt
      },
      $set: {
        title: parsed.title,
        summary: parsed.summary,
        body: parsed.body,
        rawPayload: parsed.rawPayload
      }
    },
    { upsert: true, returnDocument: "after" }
  );

  return res;
}

export async function listCards(opts?: { limit?: number; since?: Date }) {
  const db = await getDb();
  const cards = db.collection<Card>("cards");

  const query = opts?.since ? { receivedAt: { $gt: opts.since } } : {};
  const cursor = cards
    .find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(opts?.limit ?? 50);

  return cursor.toArray();
}
