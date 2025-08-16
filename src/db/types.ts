import { z } from "zod";

export const CardSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().optional(),
  summary: z.string().optional(),
  body: z.string().optional(),
  createdAt: z.date().optional(),   // source system time if provided
  receivedAt: z.date().optional(),  // server receipt time
  rawPayload: z.any().optional()
});

export type Card = z.infer<typeof CardSchema>;


// fields every donation has
const BaseDonation = z.object({
  method: z.enum(["venmo", "cash"]),
  amountCents: z.number().int().nonnegative(),
  donatedAt: z.date(),             // when it happened
  receivedAt: z.date().optional(), // when your server stored it
  donorName: z.string().optional(),// name as given at time of gift
  status: z.enum(["received","deposited","reconciled","voided"]).default("received"),
  rawPayload: z.any().optional()
});

// venmo-specific fields
const VenmoDonation = BaseDonation.extend({
  method: z.literal("venmo"),
  venmoId: z.string().min(1),      // stable external id (for idempotency)
});

// cash-specific fields
const CashDonation = BaseDonation.extend({
  method: z.literal("cash"),
  receivedBy: z.string().optional(), // staff/volunteer who logged it
});

export const DonationSchema = z.discriminatedUnion("method", [VenmoDonation, CashDonation]);
export type Donation = z.infer<typeof DonationSchema>;