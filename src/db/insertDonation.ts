// src/db/insertDonation.ts
import { getDb } from "./client.js";
import { DonationEntry } from "../validators/donationEntry.js";

export async function insertDonation(doc: DonationEntry) {
  const db = await getDb();
  const coll = db.collection<DonationEntry>("donations");

  try {
    const result = await coll.insertOne(doc);
    return {
      insertedId: result.insertedId,
      donation: doc,
    };
  } catch (err: any) {
    // If you add the unique Venmo messageId index,
    // this is where duplicate webhook deliveries will land.
    if (err?.code === 11000) {
      // Duplicate key error
      return {
        insertedId: null,
        donation: null,
        duplicate: true,
      };
    }

    throw err;
  }
}
