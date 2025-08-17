import { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { upsertDonation } from "../db/repositories/donations.js";
import { broadcast } from "../SSEHub.js";

export async function readJsonBody<T = unknown>(
  req: IncomingMessage,
  opts: { maxBytes?: number } = {}
): Promise<T> {
  const limit = opts.maxBytes ?? 128 * 1024;
  let size = 0;
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > limit) {
        reject(new Error("payload_too_large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve());
    req.on("error", reject);
  });

  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

// If you later accept other shapes, add a union; for now expect { summary: string }
const Payload = z.object({
  summary: z.string().min(1)
});

export type ParsedVenmo = {
  donorName: string | null;
  amountCents: number | null;
  transactionId: string | null;
};

export function parseVenmoSummary(summary: string): ParsedVenmo {
  // Example:
  // "Haley Webb paid you$8000 ... Transaction ID4384800191217671024 ..."

  const nameMatch = summary.match(/^(.+?)\s+paid you/i);
  const donorName = nameMatch?.[1]?.trim() ?? null;

  // capture digits after "paid you$"
  const amountDigits = summary.match(/paid you\$(\d+)/i)?.[1] ?? null;
  const amountCents =
    amountDigits != null ? parseInt(amountDigits, 10) : null; // interpret last 2 as cents

  const transactionId = summary.match(/Transaction ID(\d+)/i)?.[1] ?? null;

  return { donorName, amountCents, transactionId };
}

export async function donationsWebhook(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.writeHead(405, { allow: "POST" });
    res.end();
    return;
  }

  try {
    const raw = await readJsonBody(req, { maxBytes: 256 * 1024 });
    const { summary } = Payload.parse(raw);

    const { donorName, amountCents, transactionId } = parseVenmoSummary(summary);

    if (!transactionId || amountCents == null) {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({
        ok: false,
        error: "unparseable_summary",
        detail: { hasTxnId: !!transactionId, hasAmount: amountCents != null }
      }));
      return;
    }

    const saved = await upsertDonation({
      method: "venmo",
      venmoId: transactionId,
      donorName: donorName ?? undefined,
      amountCents,                // e.g. "8000" -> $80.00
      donatedAt: new Date(),      // if you later get the true time, replace this
      status: "received",
      rawPayload: raw,
      receivedAt: new Date()
    } as any);

    broadcast({kind: "donation-created"});

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true}));
  } catch (err: any) {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "bad_request", detail: String(err) }));
  }
}
