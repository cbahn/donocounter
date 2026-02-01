import { z } from "zod";

const DonationEntrySchema = z.object({
  method: z.enum(["venmo", "cash"]),
  amountCents: z.number().int().nonnegative(), // so $12.75 would be stored 1275
  createdAt: z.date(),
  lastModifiedAt: z.date(),
  donorName: z.string(),
  cashReceivedBy: z.string().optional(), // cash only
  rawMessage: z.any().optional(), // venmo only
  visible: z.enum(["show","hide"]).default("show"),
});

export type DonationEntry = z.infer<typeof DonationEntrySchema>;