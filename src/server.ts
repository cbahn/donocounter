import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import http from "node:http";
import "./bootstrapEnv"; // must come before CONFIG
import { CONFIG } from "./config";
import { ensureIndexes } from "./db/indexes.js";
import { listCards } from "./db/repositories/cards.js";
import { donationsWebhook } from './routes/donations.webhook.js';
import { donationsStream, startHeartbeat } from './SSEHub.js';
import { fileURLToPath } from 'node:url';
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "src/public");

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

// Serve everything under /public at the web root
app.use(express.static(publicDir, {
  etag: true,
  maxAge: "1h" // static assets can be cached
}));

app.get('/healthz', async(_req,res) => {
  try {
    await listCards({limit:1});
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// Cards: returns latest 50 (no-store to keep the list fresh)
app.get('/cards', async (_req, res, next) => {
  try {
    const items = await listCards({ limit: 50 });
    res.set('cache-control', 'no-store').json({ items });
  } catch (err) {
    next(err);
  }
});


app.get('/donations/stream', donationsStream);

// Webhook for donations
app.post(`/donation-webhook/${CONFIG.donationWebhookKey}`, donationsWebhook);



// 404s
app.use((req, res) => {
  res.status(404).end();
});

// Centralized error handler (so async errors come here)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export async function start() {
  await ensureIndexes();

  // Send hb to all SSE streams every 30 seconds
  startHeartbeat(30_000);

  app.listen(CONFIG.port, () => {
    console.log(`App listening on :${CONFIG.port}`);
  });
}

// Start the server
start().catch((err) => {
  console.error('Fatal on startup', err);
  process.exit(1);
});
