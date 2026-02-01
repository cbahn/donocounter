import { z } from "zod";

const DonationEntrySchema = z.object({
  method: z.enum(["venmo", "cash"]),
  amountCents: z.number().int().nonnegative().optional(), // so $12.75 would be stored 1275
  createdAt: z.date(),
  lastModifiedAt: z.date().optional(),
  donorName: z.string().optional(),
  cashReceivedBy: z.string().optional(), // cash only
  rawMessage: z.any().optional(), // venmo only
  visible: z.enum(["show","hide"]).default("show"),
  valid: z.enum(['valid','invalid']),
  comment: z.string(),
});

export type DonationEntry = z.infer<typeof DonationEntrySchema>;