// src/db/getTotal.ts
import { getDb } from "./client.js";
import { DonationEntry } from "../validators/donationEntry.js";
import { ObjectId } from "mongodb";

type SettingsDoc = {
  _id?: ObjectId;
  cutoffStartTime: Date;
};

export async function getTotalFromDatabase(): Promise<{
  cutoffStartTime: Date;
  totalCents: number;
  donationCount: number;
}> {
  const db = await getDb();

  // 1) Load cutoff from settings (single-doc collection)
  const settings = await db
    .collection<SettingsDoc>("settings")
    .findOne({}, { projection: { cutoffStartTime: 1 } });

  if (!settings?.cutoffStartTime) {
    throw new Error(
      "Missing settings.cutoffStartTime (expected a single settings document with cutoffStartTime)"
    );
  }

  const cutoffStartTime =
    settings.cutoffStartTime instanceof Date
      ? settings.cutoffStartTime
      : new Date(settings.cutoffStartTime as any);

  if (Number.isNaN(cutoffStartTime.getTime())) {
    throw new Error("settings.cutoffStartTime is not a valid date");
  }

  // 2) Aggregate donations after cutoff
  //    (visibility == "show" and createdAt > cutoff)
  const coll = db.collection<DonationEntry>("donations");

  const [agg] = await coll
    .aggregate<{ totalCents: number; donationCount: number }>([
      {
        $match: {
          visible: "show",
          valid: "valid",
          createdAt: { $gt: cutoffStartTime },
        },
      },
      {
        $group: {
          _id: null,
          totalCents: { $sum: "$amountCents" },
          donationCount: { $sum: 1 },
        },
      },
    ])
    .toArray();

  return {
    cutoffStartTime,
    totalCents: agg?.totalCents ?? 0,
    donationCount: agg?.donationCount ?? 0,
  };
}
