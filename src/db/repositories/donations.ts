import { getDb } from "../client.js";
import { Donation, DonationSchema } from "../types.js";

export async function upsertDonation(input: Donation) {
  const parsed = DonationSchema.parse({
    ...input,
    receivedAt: input.receivedAt ?? new Date()
  });

  const db = await getDb();
  const coll = db.collection<Donation>("donations");

  if (parsed.method === "venmo") {
    return coll.findOneAndUpdate(
      { method: "venmo", venmoId: parsed.venmoId },
      {
        $setOnInsert: {
          method: "venmo",
          venmoId: parsed.venmoId,
          donatedAt: parsed.donatedAt,
          receivedAt: parsed.receivedAt
        },
        $set: {
          amountCents: parsed.amountCents,
          donorName: parsed.donorName,
          status: parsed.status,
          rawPayload: parsed.rawPayload
        }
      },
      { upsert: true, returnDocument: "after" }
    );
  } else {
    // cash
    const { insertedId } = await coll.insertOne(parsed);
    return coll.findOne({ _id: insertedId });
    
  }
}
