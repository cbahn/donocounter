import { IncomingMessage } from "node:http";

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
