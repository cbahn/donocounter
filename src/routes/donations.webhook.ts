// src/routes/donations.webhook.ts
import type { Request, Response } from "express";
import { DonationWebhookPayloadSchema } from "../validators/donationWebhookPayload.js";
import { DonationEntry } from "../validators/donationEntry.js";
import { insertDonation } from "../db/insertDonation.js";

export type ParsedVenmoSubject =
  | { ok: true; donorName: string; amountCents: number; }
  | { ok: false; error: string;  };


function parseVenmoSubject(subject: string): ParsedVenmoSubject {
  const match = subject.match(
    /^(.+?) paid you \$([0-9]+)(?:\.([0-9]{2}))?$/
  );

  if (!match) {
    return {
      ok: false,
      error: `Unrecognized Venmo subject format: "${subject}"`,
    }
  }

  const donorName = match[1].trim();
  const dollarPart = Number(match[2]);
  const centsPart = Number(match[3]);

  if (Number.isNaN(dollarPart)) {
    return {
      ok: false,
      error: `Invalid dollar in subject: "${subject}"`,
    }
  }

  if( Number.isNaN(centsPart)) {
    return {
      ok: false,
      error: `Invalid cents in subject: "${subject}"`,
    }
  }

  if( 0 > centsPart || centsPart > 99 ) {
    return {
      ok: false,
      error: `Cents value out of bounds: "${subject}"`,
    }
  }

  const amountCents = dollarPart * 100 + centsPart;
  return { ok: true, donorName, amountCents };
}


export async function donationsWebhook(req: Request, res: Response) {
  const now = new Date();

  // 1. Parse and validate the input

  const parseResult = DonationWebhookPayloadSchema.safeParse(req.body);

  if (!parseResult.success) {
    const donationFail: DonationEntry = {
      method: "venmo",
      createdAt: now,
      lastModifiedAt: now,
      rawMessage: req.body,
      visible: "hide",
      valid: 'invalid',
      comment: "payload didn't match schema",
    };
    try {
      const result = await insertDonation(donationFail);
    } catch (err) {
      console.error("Failed to insert donation", err);
      res.status(200).json({ ok: false, error:"failed to insert donation" });
      return
    }
    res.status(200).json({ ok: false, error:"schema failure" });
    return;
  }

  // payload is valid and ready to use
  const payload = parseResult.data;

  // Extract info from the subject line
  const parsedSubject = parseVenmoSubject(payload.subject);

  if ( ! parsedSubject.ok ) {
    const donationFail: DonationEntry = {
      method: "venmo",
      createdAt: now,
      lastModifiedAt: now,
      rawMessage: payload,
      visible: "hide",
      valid: 'invalid',
      comment: "subject couldn't be parsed",
    };
    try {
      const result = await insertDonation(donationFail);
    } catch (err) {
      console.error("Failed to insert donation", err);
      res.status(200).json({ ok: false, error:"failed to insert donation" });
      return
    }
    res.status(200).json({ ok: false, error:"subject parse error" });
    return;
  }


  // 2. Create new DonationEntry

  const donation: DonationEntry = {
    method: "venmo",
    amountCents: parsedSubject.amountCents,
    donorName: parsedSubject.donorName,
    createdAt: now,
    lastModifiedAt: now,
    rawMessage: payload,
    visible: "show",
    valid: 'valid',
    comment: "",
  };


  try {
    const result = await insertDonation(donation);

  } catch (err) {
    console.error("Failed to insert donation", err);
    res.status(200).json({ ok: false, error:"failed to insert donation" });
  }

  console.log("Donation inserted!");

  res.status(200).json({ ok: true });
}
