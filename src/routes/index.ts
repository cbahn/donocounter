import type { Request, Response } from "express";
import { CONFIG } from "../config.js";

export function indexRoute(_req: Request, res: Response) {
  const now = new Date();

  res
    .status(200)
    .type("html")
    .send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Status</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              padding: 2rem;
              background: #f7f7f7;
            }
            .card {
              background: white;
              padding: 1.5rem;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .ok {
              color: #0a7f2e;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 class="ok">Service is running</h1>
            <p>Webhook thing: ${CONFIG.donationWebhookKey}</p>
            <p>Current server time:</p>
            <code>${now.toISOString()}</code>
          </div>
        </body>
      </html>
    `);
}
