import 'dotenv/config';
import http from "node:http";
import { CONFIG } from "./config.js";
import { ensureIndexes } from "./db/indexes.js";
import { listCards } from "./db/repositories/cards.js";
import { donationsWebhook } from './routes/donations.webhook.js';

async function start() {
  await ensureIndexes();

  const server = http.createServer(async (req, res) => {
    if (req.url?.startsWith("/healthz")) {
      // lightweight check: query count
      try {
        await listCards({ limit: 1 });
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: false }));
      }
      return;
    }

    if (req.url?.startsWith("/cards") && req.method === "GET") {
      const items = await listCards({ limit: 50 });
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
      res.end(JSON.stringify({ items }));
      return;
    }

    if (req.url?.startsWith("/donation-webhook/" + CONFIG.donationWebhookKey)) {
      await donationsWebhook(req, res);
      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(CONFIG.port, () => {
    console.log(`App listening on :${CONFIG.port}`);
  });
}

start().catch((err) => {
  console.error("Fatal on startup", err);
  process.exit(1);
});
