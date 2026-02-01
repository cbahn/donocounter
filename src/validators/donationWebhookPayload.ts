import { z } from "zod";

export const DonationWebhookPayloadSchema = z.object({
  summary: z.string(),
  sentDateInGMT: z.number(),
  subject: z.string(),
  Mode: z.number(),
  messageId: z.number(),
  toAddress: z.string(),
  folderId: z.number(),
  zuid: z.number(),
  hasAttachment: z.string(),
  size: z.number(),
  sender: z.string(),
  receivedTime: z.number(),
  replyTo: z.string(),
  fromAddress: z.string(),
  html: z.string(),
  messageIdString: z.string(),
  IntegIdList: z.string(),
});

export type DonationWebhookPayload = z.infer<typeof DonationWebhookPayloadSchema>;


